import {describe,it,expect} from 'vitest';
import {actorNames,initial,KEY,sampleRequest,sampleProposal,transition,total,wineTotal,commissionAmount,validateProposal,validateRequest,type Actor,type Command} from './model';
import {scenario} from '../demo/scenarios';
import {load,save,validState,type StoragePort} from '../persistence/storage';
import {earliestBanquetDateTime,taipeiDateAfter,validateNewRequestDate} from './banquet-date';

describe('台北日曆日期與新需求準備期',()=>{
 const now=new Date('2026-11-08T18:00:00+08:00');
 it.each([
  ['2026-11-08T18:00:00+08:00','2026-11-11T00:00'],
  ['2026-11-29T10:00:00+08:00','2026-12-02T00:00'],
  ['2026-12-30T10:00:00+08:00','2027-01-02T00:00'],
  ['2028-02-27T10:00:00+08:00','2028-03-01T00:00'],
  ['2026-11-08T16:30:00Z','2026-11-12T00:00'],
  ['2026-11-08T15:59:00Z','2026-11-11T00:00'],
 ])('時刻 %s 的日期門檻為 %s',(at,expected)=>{
  expect(earliestBanquetDateTime(new Date(at))).toBe(expected);
 });
 it('預填以台北當日加七個日曆日且不修改傳入時刻',()=>{
  const at=new Date('2026-12-30T16:30:00Z');
  expect(sampleRequest(at).date).toBe('2027-01-07T18:00');
  expect(taipeiDateAfter(3,at)).toBe('2027-01-03');
  expect(at.toISOString()).toBe('2026-12-30T16:30:00.000Z');
 });
 it.each(['','not-a-date','2026-02-30T18:00','2026-13-01T18:00','2026-11-11T24:00','2026-11-11T18:60'])('拒絕無效日期 %s',date=>{
  expect(()=>validateNewRequestDate(date,now)).toThrow('有效的宴客日期');
 });
 it.each(['2000-01-01T18:00','2026-11-08T18:00','2026-11-09T18:00','2026-11-10T23:59'])('建立命令拒絕過早日期 %s 且不改狀態',date=>{
  const state=initial(false),before=structuredClone(state);
  expect(()=>transition(state,'host',{type:'create',request:{...sampleRequest(now),date}},now)).toThrow('2026-11-11 00:00');
  expect(state).toEqual(before);
 });
 it('接受三天後午夜且不要求滿72小時',()=>{
  const state=transition(initial(false),'host',{type:'create',request:{...sampleRequest(now),date:'2026-11-11T00:00'}},now);
  expect(state.order?.status).toBe('service-fee-pending');
  expect(state.order?.events.filter(e=>e.action==='create')).toHaveLength(1);
 });
 it('跨午夜建立使用新的台北當日',()=>{
  const request={...sampleRequest(now),date:'2026-11-11T18:00'};
  expect(()=>transition(initial(),'host',{type:'create',request},new Date('2026-11-08T23:59:00+08:00'))).not.toThrow();
  expect(()=>transition(initial(),'host',{type:'create',request},new Date('2026-11-09T00:01:00+08:00'))).toThrow('2026-11-12 00:00');
 });
 it('歷史保存資料不套用新建門檻，且可繼續流程',()=>{
  const s=transition(initial(),'host',{type:'create',request:{...sampleRequest(now),date:'2026-11-11T00:00'}},now);
  s.order!.request.date='2000-01-01T18:00';
  const raw=JSON.stringify(s),storage:StoragePort={getItem:()=>raw,setItem:()=>{}};
  expect(validateRequest(s.order!.request)).toBeUndefined();
  expect(load(storage)).toEqual({state:s,error:''});
  expect(transition(load(storage).state,'host',{type:'service-pay'},new Date('2026-11-12T18:00:00+08:00')).order?.serviceFee.paid).toBe(true);
 });
 it('有效訂單經過準備期與宴客日仍可原樣還原',()=>{
  const s=transition(initial(),'host',{type:'create',request:{...sampleRequest(now),date:'2026-11-11T00:00'}},now);
  const raw=JSON.stringify(s),storage:StoragePort={getItem:()=>raw,setItem:()=>{}};
  for(const later of ['2026-11-10T18:00:00+08:00','2026-11-12T18:00:00+08:00']){
   expect(()=>validateNewRequestDate(s.order!.request.date,new Date(later))).toThrow();
   expect(load(storage)).toEqual({state:s,error:''});
  }
 });
 it.each(['','   ','\n\n',' \n '])('拒絕空白料理 %j',cuisine=>{
  expect(()=>transition(initial(),'host',{type:'create',request:{...sampleRequest(now),cuisine}},now)).toThrow('菜色或料理類型');
 });
 it('多行料理原文經建立及保存還原仍相同',()=>{
  const cuisine='前菜：沙拉\n主菜：牛排';
  const s=transition(initial(),'host',{type:'create',request:{...sampleRequest(now),cuisine}},now);
  let raw='';const storage:StoragePort={getItem:()=>raw,setItem:(_,v)=>{raw=v;}};
  save(storage,s);expect(load(storage).state.order?.request.cuisine).toBe(cuisine);
 });
});
describe('輸入與金額不變條件',()=>{
 it('甲案例費用分流及四捨五入',()=>{const p=sampleProposal('merchant-a');expect(wineTotal(p)).toBe(6000);expect(total(p)).toBe(7000);expect(total(p)-500).toBe(6500);expect(wineTotal(p)+p.shipping).toBe(6200);expect(commissionAmount(6000)).toBe(600);expect(commissionAmount(1005)).toBe(101);});
 it.each([0,-1,1.5,NaN,Infinity])('拒絕不合法人數 %s',guests=>{expect(()=>validateRequest({...sampleRequest(),guests})).toThrow();});
 it.each([0,-2,NaN,Infinity])('拒絕不合法預算 %s',budget=>{expect(()=>validateRequest({...sampleRequest(),budget})).toThrow();});
 it.each(['date','restaurantId','cuisine','preference'] as const)('拒絕需求缺項 %s',key=>{expect(()=>validateRequest({...sampleRequest(),[key]:''})).toThrow();});
 it.each(['reason','delivery','limits'] as const)('拒絕提案缺項 %s',key=>{expect(()=>validateProposal({...sampleProposal('merchant-a'),[key]:''})).toThrow();});
 it.each([0,-1,1.5,NaN])('拒絕錯誤瓶數 %s',quantity=>{const p=sampleProposal('merchant-a');p.items[0].quantity=quantity;expect(()=>validateProposal(p)).toThrow();});
 it('拒絕容量與負數、空白費用，但接受零配送',()=>{for(const shipping of [-1,NaN])expect(()=>validateProposal({...sampleProposal('merchant-a'),shipping})).toThrow();const p=sampleProposal('merchant-a');p.items[0].capacity=0;expect(()=>validateProposal(p)).toThrow();expect(()=>validateProposal(sampleProposal('merchant-b'))).not.toThrow();});
});
describe('角色與前置條件',()=>{
 it('未付服務費不得邀請或送提案；拒絕時原資料不變',()=>{const s=transition(initial(),'host',{type:'create',request:sampleRequest()});const before=JSON.stringify(s);expect(()=>transition(s,'platform',{type:'invite'})).toThrow();expect(()=>transition(s,'merchant-a',{type:'proposal-submit',proposal:sampleProposal('merchant-a')})).toThrow();expect(JSON.stringify(s)).toBe(before);});
 it('只有自己的提案可以修改，一份提案不能選定',()=>{let s=transition(initial(),'host',{type:'create',request:sampleRequest()});s=transition(s,'host',{type:'service-pay'});s=transition(s,'platform',{type:'invite'});expect(()=>transition(s,'merchant-b',{type:'proposal-submit',proposal:sampleProposal('merchant-a')})).toThrow();s=transition(s,'merchant-a',{type:'proposal-submit',proposal:sampleProposal('merchant-a')});expect(()=>transition(s,'host',{type:'select',merchant:'merchant-a'})).toThrow();expect(s.order?.status).toBe('proposals-pending');});
 it('選定僅協調並鎖定快照，不產生酒款及分潤',()=>{const s=scenario('cancel');expect(s.order?.winePayment).toBeNull();expect(s.order?.commission).toBeNull();expect(()=>transition(s,'merchant-a',{type:'proposal-submit',proposal:sampleProposal('merchant-a')})).toThrow();expect(()=>transition(s,'host',{type:'select',merchant:'merchant-b'})).toThrow();expect(()=>transition(s,'merchant-a',{type:'ship'})).toThrow();});
 it.each(Object.keys(actorNames).filter(a=>a!=='restaurant') as Actor[])('非餐廳角色 %s 不得收貨驗齡',actor=>{const s=scenario('age');expect(()=>transition(s,actor,{type:'age',passed:true,reason:''})).toThrow();expect(()=>transition(s,actor,{type:'receive'})).toThrow();});
 it('送達不能冒充收貨；其他酒商不能配送',()=>{let s=scenario('cancel');s=transition(s,'restaurant',{type:'arrange',time:'15:00'});expect(()=>transition(s,'merchant-b',{type:'ship'})).toThrow();s=transition(s,'merchant-a',{type:'ship'});s=transition(s,'merchant-a',{type:'deliver'});expect(s.order?.status).toBe('restaurant-receipt-pending');expect(()=>transition(s,'restaurant',{type:'age',passed:true,reason:''})).toThrow();});
 it('驗齡、有效簽名與付款缺一不可，付款後直接完成',()=>{let s=scenario('age');expect(()=>transition(s,'host',{type:'wine-pay'})).toThrow();expect(()=>transition(s,'restaurant',{type:'handover'})).toThrow();expect(()=>transition(s,'host',{type:'complete'})).toThrow();s=transition(s,'restaurant',{type:'age',passed:true,reason:''});expect(()=>transition(s,'host',{type:'wine-pay'})).toThrow();s=transition(s,'host',{type:'signature-save',name:'展示主人',strokes:[[{x:10,y:20},{x:100,y:80}]]});expect(()=>transition(s,'restaurant',{type:'handover'})).toThrow();s=transition(s,'host',{type:'wine-pay'});expect(s.order?.status).toBe('completed');});
});
describe('正常流程與重複操作',()=>{
 it('完成與待結算分開，快照、付款與事件不重複',()=>{let s=scenario('age');s=transition(s,'restaurant',{type:'age',passed:true,reason:''});s=transition(s,'host',{type:'signature-save',name:'展示主人',strokes:[[{x:10,y:20},{x:100,y:80}]]});s=transition(s,'host',{type:'wine-pay'});expect(s.order?.winePayment).toMatchObject({amount:6200,wineAmount:6000,payee:'merchant-a'});expect(s.order?.commission).toMatchObject({amount:600,status:'pending',rateBps:1000});expect(transition(s,'host',{type:'wine-pay'})).toBe(s);expect(s.order?.status).toBe('completed');expect(transition(s,'host',{type:'complete'})).toBe(s);expect(s.order?.events.filter(e=>e.action==='wine-pay')).toHaveLength(1);expect(s.order?.events.filter(e=>e.action==='complete')).toHaveLength(1);expect(validState(s)).toBe(true);});
 it('重複服務費付款只一筆',()=>{let s=transition(initial(),'host',{type:'create',request:sampleRequest()});s=transition(s,'host',{type:'service-pay'});expect(transition(s,'host',{type:'service-pay'})).toBe(s);expect(s.order?.events.filter(e=>e.action==='service-pay')).toHaveLength(1);});
});
describe('取消與退回終止分支',()=>{
 it('取消須原因、只有平台可退、全額且不重複',()=>{let s=scenario('cancel');expect(()=>transition(s,'restaurant',{type:'cancel',reason:''})).toThrow();s=transition(s,'restaurant',{type:'cancel',reason:'時段無法配合'});expect(()=>transition(s,'host',{type:'refund'})).toThrow();expect(()=>transition(s,'merchant-a',{type:'ship'})).toThrow();s=transition(s,'platform',{type:'refund'});expect(s.order?.serviceFee.refund).toBe(500);expect(s.order?.commission).toBeNull();expect(s.order?.status).toBe('cancelled');expect(transition(s,'platform',{type:'refund'})).toBe(s);});
 it('驗齡失敗不能恢復；取回可先於成本，主人無新增應付',()=>{let s=scenario('age');expect(()=>transition(s,'restaurant',{type:'age',passed:false,reason:''})).toThrow();s=transition(s,'restaurant',{type:'age',passed:false,reason:'未能確認符合年齡'});for(const [actor,c] of [['host',{type:'wine-pay'}],['restaurant',{type:'age',passed:true,reason:''}],['restaurant',{type:'handover'}],['host',{type:'return'}],['merchant-b',{type:'return'}]] as [Actor,Command][])expect(()=>transition(s,actor,c)).toThrow();s=transition(s,'merchant-a',{type:'return'});expect(s.order?.status).toBe('returned');expect(s.order?.returnCost).toBeNull();expect(()=>transition(s,'platform',{type:'cost',amount:-1})).toThrow();s=transition(s,'platform',{type:'cost',amount:200});expect(s.order?.returnCost).toBe(200);expect(s.order?.serviceFee).toMatchObject({paid:true,refund:0});expect(s.order?.winePayment).toBeNull();expect(s.order?.commission).toBeNull();expect(validState(s)).toBe(true);});
 it('成本可先於取回，零成本需明確登錄',()=>{let s=transition(scenario('age'),'restaurant',{type:'age',passed:false,reason:'原因'});s=transition(s,'platform',{type:'cost',amount:0});expect(s.order?.status).toBe('return-pending');expect(s.order?.returnCost).toBe(0);s=transition(s,'merchant-a',{type:'return'});expect(s.order?.returnCost).toBe(0);});
});
describe('保存與情境工廠',()=>{
 const store=()=>{const data=new Map<string,string>();return {data,getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>{data.set(k,v);}};};
 it.each(['blank','normal','cancel','age'] as const)('情境 %s 可保存還原且前置一致',name=>{const s=scenario(name),storage=store();expect(validState(s)).toBe(true);save(storage,s);expect(load(storage)).toEqual({state:s,error:''});if(name==='age')expect(s.order?.events.map(e=>e.action)).toContain('receive');});
 it('損壞、錯誤版本、錯誤結構不靜默覆寫',()=>{for(const raw of ['{bad',JSON.stringify({schemaVersion:2}),JSON.stringify({...scenario('age'),order:{}})]){const storage=store();storage.data.set(KEY,raw);expect(load(storage).error).toBeTruthy();expect(storage.data.get(KEY)).toBe(raw);}});
 it('讀寫失敗明確回報；不影響其他 key',()=>{const broken:StoragePort={getItem:()=>{throw new Error('denied');},setItem:()=>{throw new Error('quota');}};expect(load(broken).error).toBeTruthy();expect(()=>save(broken,initial())).toThrow();const s=store();s.data.set('other-application','retained');save(s,scenario('age'));save(s,scenario('normal'));expect(s.data.get('other-application')).toBe('retained');expect(load(s).state.order).toBeNull();});
 it('快照不會隨原提案價格改變；沒有敏感證件資料',()=>{const s=scenario('age');s.order!.proposals[0].items[0].price=99;expect(s.order?.selected?.items[0].price).toBe(1000);expect(JSON.stringify(s)).not.toMatch(/cardNumber|birthday|identityNumber|passport/);});
});
