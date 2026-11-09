import {describe,it,expect} from 'vitest';
import {orderForActor,orderViewForActor,orderAccessMessage,transition,initial,sampleRequest,sampleProposal,type State,type Actor} from './model';
import {scenario} from '../demo/scenarios';
const reveal=()=>transition(scenario('age'),'restaurant',{type:'age',passed:true,reason:''});
const signed=()=>transition(reveal(),'host',{type:'signature-save',name:'展示主人',strokes:[[{x:10,y:10},{x:100,y:80}]]});
const view=(s:State,actor:Actor='host')=>orderViewForActor({...s,actor,order:s.order?{...s.order,checkout:{...s.order.checkout,mode:'none'}}:null});
describe('role presentation DTO',()=>{
 it.each(['cancel','age'] as const)('主人%s核對前無報價欄位或歷史原資料',name=>{const s=scenario(name),v=view(s)!;expect(v.selected?.items[0]).not.toHaveProperty('price');expect(v.selected).not.toHaveProperty('shipping');expect(v).not.toHaveProperty('legacy');expect(v.purchaseDraft).toBeNull();expect(v.receipt).toBeNull();expect(v.commission).toBeNull();});
 it('完成/代收/收清/減量角色矩陣，主人永不見內部帳務',()=>{let partial=transition(reveal(),'host',{type:'purchase-edit-open'});partial=transition(partial,'restaurant',{type:'purchase-edit',quantities:[4]});partial=transition(partial,'host',{type:'signature-save',name:'展示主人',strokes:[[{x:10,y:10},{x:100,y:80}]]});partial=transition(partial,'host',{type:'wine-pay'});let collection=transition(signed(),'host',{type:'wine-pay',outcome:'failed'});collection=transition(collection,'host',{type:'request-collection'});const handoff=orderViewForActor(collection)!;expect(handoff.audience).toBe('host');expect(handoff.collection).toBeNull();collection=transition(collection,'restaurant',{type:'staff-review'});collection=transition(collection,'restaurant',{type:'collection-accept'});for(const s of [transition(signed(),'host',{type:'wine-pay'}),collection,transition(collection,'merchant-a',{type:'collection-receive'}),partial]){const v=view(s)!;expect(v.commission).toBeNull();expect(v.collection).toBeNull();expect(v.unusedStock).toBeNull();expect(v.receipt?.amount).toBe(s.order!.winePayment?.amount??s.order!.collection!.amount);for(const a of ['platform','restaurant','merchant-a'] as Actor[])expect(view(s,a)!.commission).toEqual(s.order!.commission);expect(view(s,'merchant-b')).toBeNull();const merchant=view(s,'merchant-a')!;expect(JSON.stringify(merchant)).not.toMatch(/展示主人|0912345678/);expect(merchant.checkout.signature!.strokes).toEqual([]);}});
 it('歷史公開文字依階段遮蔽，投影不改原資料',()=>{const s=scenario('cancel');s.order!.selected!.reason='酒款NT$6000。運送200元。餐廳分潤10%。';const original=structuredClone(s);const v=view(s)!;expect(v.selected!.reason).not.toMatch(/6000|200|10%|分潤/);expect(s).toEqual(original);});
});

describe('依服務費、平台邀請及酒商選定開放資料',()=>{
 const created=()=>transition(initial(),'host',{type:'create',request:sampleRequest()});
 const paid=()=>transition(created(),'host',{type:'service-pay'});
 const invited=()=>transition(paid(),'platform',{type:'invite'});
 const comparison=()=>{let s=invited();for(const merchant of ['merchant-a','merchant-b'] as const)s=transition(s,merchant,{type:'proposal-submit',proposal:sampleProposal(merchant)});return s;};
 it.each(['merchant-a','merchant-b','restaurant'] as Actor[])('%s在付款前及邀請前都不取得資料',actor=>{
  for(const s of [created(),paid()]){
   const before=structuredClone(s);
   expect(orderForActor(s,actor)).toBeNull();expect(view(s,actor)).toBeNull();
   expect(orderAccessMessage(s,actor)).toBe('待平台邀請後開放服務資料。');
   expect(()=>transition(s,actor,actor==='restaurant'?{type:'arrange',time:'15:00'}:{type:'proposal-submit',proposal:sampleProposal(actor as 'merchant-a'|'merchant-b')})).toThrow('待平台邀請');
   expect(s).toEqual(before);
   for(const owner of ['host','platform'] as Actor[])expect(view(s,owner)?.id).toBe(s.order?.id);
  }
 });
 it('受邀後兩家酒商可讀提案需要的服務，餐廳在比較階段仍不可讀',()=>{
  for(const s of [invited(),comparison()]){
   for(const actor of ['merchant-a','merchant-b'] as Actor[])expect(view(s,actor)?.id).toBe(s.order?.id);
   expect(view(s,'restaurant')).toBeNull();
   const before=structuredClone(s);expect(()=>transition(s,'restaurant',{type:'arrange',time:'15:00'})).toThrow('待主人確認服務酒商');expect(s).toEqual(before);
  }
 });
 it.each(['merchant-a','merchant-b'] as const)('選定%s後僅該酒商與合作餐廳取得後續資料',merchant=>{
  const s=transition(comparison(),'host',{type:'select',merchant});
  expect(view(s,'restaurant')?.id).toBe(s.order?.id);expect(view(s,merchant)?.id).toBe(s.order?.id);
  const other=merchant==='merchant-a'?'merchant-b':'merchant-a';expect(view(s,other)).toBeNull();
  expect(orderAccessMessage(s,other)).toContain('本次未獲選');
 });
 it('即使資料有邀請旗標，未付款仍不開放',()=>{const s=created();s.order!.invited=true;for(const actor of ['merchant-a','merchant-b','restaurant'] as Actor[])expect(view(s,actor)).toBeNull();});
});
