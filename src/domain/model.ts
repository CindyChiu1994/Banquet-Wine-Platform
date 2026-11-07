export type Actor = 'host' | 'platform' | 'merchant-a' | 'merchant-b' | 'restaurant';
export const actorNames: Record<Actor, string> = { host:'宴客主人', platform:'平台管理者', 'merchant-a':'酒商甲', 'merchant-b':'酒商乙', restaurant:'合作餐廳' };
export type Status = 'draft'|'service-fee-pending'|'invitation-pending'|'proposals-pending'|'comparison-ready'|'restaurant-pending'|'delivery-ready'|'in-transit'|'restaurant-receipt-pending'|'age-check-pending'|'purchase-pending'|'wine-payment-pending'|'handover-pending'|'host-receipt-pending'|'completed'|'cancel-refund-pending'|'cancelled'|'return-pending'|'returned';
export const statusNames: Record<Status,string> = {draft:'填寫宴客需求','service-fee-pending':'待付服務費','invitation-pending':'待平台邀請','proposals-pending':'等待酒商提案','comparison-ready':'可以比較選定','restaurant-pending':'待餐廳確認安排','delivery-ready':'待酒商出貨','in-transit':'配送中','restaurant-receipt-pending':'待餐廳確認收貨','age-check-pending':'待餐廳驗齡','purchase-pending':'待現場確認購買','wine-payment-pending':'待付酒款','handover-pending':'待餐廳交付','host-receipt-pending':'待主人確認收取',completed:'服務完成','cancel-refund-pending':'取消待退款',cancelled:'已取消／已退款','return-pending':'待退回',returned:'已退回／服務未完成'};
export interface Request { date:string; restaurantId:string; guests:number; cuisine:string; budget:number; preference:string }
export interface Wine { name:string; capacity:number; quantity:number; price:number }
export interface Proposal { merchant: 'merchant-a'|'merchant-b'; items:Wine[]; shipping:number; restaurantFee:number; reason:string; delivery:string; limits:string; submitted:boolean }
export interface Event { id:string; action:string; actor:Actor; at:string; summary:string }
export interface Order {
 id:string; request:Request; status:Status; invited:boolean; proposals:Proposal[]; selected:Proposal|null;
 serviceFee:{amount:number;paid:boolean;refund:number};
 winePayment:{payee:string;amount:number;wineAmount:number;paid:boolean}|null;
 arrangement:string; age:{result:'pending'|'passed'|'failed';reason:string;actor:Actor|null;at:string|null};
 cancellationReason:string; returnedAt:string|null; returnCost:number|null;
 commission:{orderId:string;merchant:string;restaurantId:string;wineAmount:number;rateBps:number;amount:number;status:'pending'}|null;
 events:Event[];
}
export interface State {schemaVersion:1;actor:Actor;order:Order|null;prefill:boolean}
export type Command =
 | {type:'create';request:Request}
 | {type:'service-pay'|'invite'|'ship'|'deliver'|'receive'|'purchase'|'wine-pay'|'handover'|'complete'|'refund'|'return'}
 | {type:'proposal-save'|'proposal-submit';proposal:Proposal}
 | {type:'select';merchant:Proposal['merchant']}
 | {type:'arrange';time:string}
 | {type:'cancel';reason:string}
 | {type:'age';passed:boolean;reason:string}
 | {type:'cost';amount:number};
export const KEY='banquet-wine-demo:v1';
export const integer=(value:number,min:number)=>Number.isSafeInteger(value)&&value>=min;
function ensure(condition:unknown,message:string):asserts condition {if(!condition)throw new Error(message);}
export function validateRequest(r:Request){
 ensure(r.date&&Number.isFinite(Date.parse(r.date)),'請填寫有效的宴客日期與時間');
 ensure(r.restaurantId==='restaurant-demo','請選擇合作餐廳');
 ensure(integer(r.guests,1),'宴客人數須為正整數');
 ensure(r.cuisine.trim(),'請填寫菜色或料理類型');
 ensure(integer(r.budget,1),'酒款總預算須為正整數新臺幣');
 ensure(r.preference.trim(),'請選擇飲酒偏好，可選不限');
}
export function validateProposal(p:Proposal){
 ensure(p.items.length>0,'請至少填寫一款酒');
 for(const w of p.items){ensure(w.name.trim(),'請填寫酒款名稱');ensure(Number.isFinite(w.capacity)&&w.capacity>0,'請填寫正數容量');ensure(integer(w.quantity,1),'瓶數須為正整數');ensure(integer(w.price,1),'單價須為正整數');}
 ensure(integer(p.shipping,0)&&integer(p.restaurantFee,0),'配送費與餐廳費用不可空白或為負數');
 ensure(p.restaurantFee===300,'餐廳現場費用固定為示範 300 元');
 ensure(p.reason.trim()&&p.delivery.trim()&&p.limits.trim(),'請填寫搭配理由、配送條件與供貨限制（無限制請明列）');
 ensure(Number.isSafeInteger(wineTotal(p))&&Number.isSafeInteger(total(p)),'提案金額超出可處理範圍');
}
export function wineTotal(p:Proposal){return p.items.reduce((sum,w)=>sum+w.quantity*w.price,0);}
export function total(p:Proposal){return 500+wineTotal(p)+p.shipping+p.restaurantFee;}
export function commissionAmount(amount:number,rateBps=1000){ensure(integer(amount,0)&&integer(rateBps,0)&&rateBps<=10000,'分潤參數無效');return Math.round(amount*rateBps/10000);}
export function initial(prefill=true):State{return {schemaVersion:1,actor:'host',order:null,prefill};}
export function sampleRequest():Request {
 const date=new Date();date.setDate(date.getDate()+7);
 const local=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
 return {date:local+'T18:00',restaurantId:'restaurant-demo',guests:12,cuisine:'法式料理・海陸分享餐',budget:6500,preference:'紅白酒皆可'};
}
export function sampleProposal(merchant:Proposal['merchant']):Proposal{return {merchant,items:[{name:merchant==='merchant-a'?'勃根地風格黑皮諾':'波爾多風格紅酒',capacity:750,quantity:6,price:merchant==='merchant-a'?1000:1100}],shipping:merchant==='merchant-a'?200:0,restaurantFee:300,reason:merchant==='merchant-a'?'細緻紅果香氣與柔和單寧，搭配禽肉及分享主菜。':'成熟莓果與厚實酒體，搭配牛排與濃郁醬汁。',delivery:'宴客當日 15:00–17:00 配送至餐廳',limits:'示範供貨 6 瓶；無其他限制',submitted:false};}
const terminal=['completed','cancel-refund-pending','cancelled','return-pending','returned'];
export function transition(state:State,actor:Actor,command:Command):State {
 ensure(Object.hasOwn(actorNames,actor),'未知的示範角色');
 const n=structuredClone(state), c=command;
 const expected:Partial<Record<Command['type'],Actor>>={create:'host','service-pay':'host',invite:'platform',select:'host',arrange:'restaurant',cancel:'restaurant',receive:'restaurant',age:'restaurant',purchase:'host','wine-pay':'host',handover:'restaurant',complete:'host',refund:'platform',cost:'platform'};
 if(expected[c.type])ensure(actor===expected[c.type],'此角色沒有執行該動作的權限');
 if(c.type==='create'){
  ensure(!n.order,'目前已有訂單，請先使用展示工具重設或建立空白需求');validateRequest(c.request);
  n.order={id:'BW-'+Date.now().toString(36).toUpperCase(),request:structuredClone(c.request),status:'service-fee-pending',invited:false,proposals:[],selected:null,serviceFee:{amount:500,paid:false,refund:0},winePayment:null,arrangement:'',age:{result:'pending',reason:'',actor:null,at:null},cancellationReason:'',returnedAt:null,returnCost:null,commission:null,events:[]};
 } else {
  const o=n.order;ensure(o,'請先建立需求');
  if(c.type==='proposal-save'||c.type==='proposal-submit')ensure(actor===c.proposal.merchant&&(actor==='merchant-a'||actor==='merchant-b'),'只能編輯自己的提案');
  if(['ship','deliver','return'].includes(c.type))ensure(actor===o.selected?.merchant,'只有選定酒商可以執行此動作');
  // Each irreversible action has one success event; edit/save operations may repeat.
  if(!['proposal-save','proposal-submit','cost'].includes(c.type)&&o.events.some(e=>e.action===c.type&&e.actor===actor)){
   if(c.type==='select')ensure(o.selected?.merchant===c.merchant,'選定後不能重選酒商');
   if(c.type==='age')ensure(o.age.result===(c.passed?'passed':'failed'),'驗齡結果已鎖定，不能改變或恢復正常履約');
   return state;
  }
  if(terminal.includes(o.status)){
   const allowed=(o.status==='cancel-refund-pending'&&c.type==='refund')||(['return-pending','returned'].includes(o.status)&&c.type==='cost')||(o.status==='return-pending'&&c.type==='return');
   ensure(allowed,'此訂單已完成或進入異常分支，不能恢復正常履約');
  }
  const at=(status:Status)=>ensure(o.status===status,`目前為「${statusNames[o.status]}」，尚未符合此操作條件`);
  switch(c.type){
   case 'service-pay':at('service-fee-pending');o.serviceFee.paid=true;o.status='invitation-pending';break;
   case 'invite':at('invitation-pending');ensure(o.serviceFee.paid,'請先支付服務費');o.invited=true;o.status='proposals-pending';break;
   case 'proposal-save':case 'proposal-submit':{
    ensure(['proposals-pending','comparison-ready'].includes(o.status)&&o.invited&&!o.selected,'尚未受邀或選定後已鎖定提案');
    const p=structuredClone(c.proposal);if(c.type==='proposal-submit')validateProposal(p);
    p.submitted=c.type==='proposal-submit';o.proposals=o.proposals.filter(x=>x.merchant!==p.merchant).concat(p);
    o.status=o.proposals.filter(x=>x.submitted).length===2?'comparison-ready':'proposals-pending';break;
   }
   case 'select':at('comparison-ready');{
    const p=o.proposals.find(x=>x.merchant===c.merchant&&x.submitted);ensure(p,'請選擇已提交的提案');ensure(o.proposals.filter(x=>x.submitted).length===2,'請等待兩家有效提案');o.selected=structuredClone(p);o.status='restaurant-pending';break;
   }
   case 'arrange':at('restaurant-pending');ensure(c.time.trim(),'請填寫收貨時段');o.arrangement=c.time.trim();o.status='delivery-ready';break;
   case 'cancel':at('restaurant-pending');ensure(c.reason.trim(),'請填寫無法配合且服務無法繼續的原因');o.cancellationReason=c.reason.trim();o.status='cancel-refund-pending';break;
   case 'ship':at('delivery-ready');o.status='in-transit';break;
   case 'deliver':at('in-transit');o.status='restaurant-receipt-pending';break;
   case 'receive':at('restaurant-receipt-pending');o.status='age-check-pending';break;
   case 'age':at('age-check-pending');ensure(c.passed||c.reason.trim(),'驗齡未通過須填寫原因');o.age={result:c.passed?'passed':'failed',reason:c.passed?'':c.reason.trim(),actor,at:new Date().toISOString()};o.status=c.passed?'purchase-pending':'return-pending';break;
   case 'purchase':at('purchase-pending');ensure(o.age.result==='passed','請先通過餐廳驗齡');o.status='wine-payment-pending';break;
   case 'wine-pay':at('wine-payment-pending');ensure(o.age.result==='passed'&&o.selected,'請先通過驗齡並確認購買');{
    const wineAmount=wineTotal(o.selected);o.winePayment={payee:o.selected.merchant,amount:wineAmount+o.selected.shipping,wineAmount,paid:true};o.commission={orderId:o.id,merchant:o.selected.merchant,restaurantId:o.request.restaurantId,wineAmount,rateBps:1000,amount:commissionAmount(wineAmount),status:'pending'};o.status='handover-pending';break;
   }
   case 'handover':at('handover-pending');ensure(o.age.result==='passed'&&o.winePayment?.paid,'驗齡及酒款收款未完成');o.status='host-receipt-pending';break;
   case 'complete':at('host-receipt-pending');o.status='completed';break;
   case 'refund':at('cancel-refund-pending');ensure(o.serviceFee.paid&&!o.serviceFee.refund,'無可退還服務費');o.serviceFee.refund=o.serviceFee.amount;o.status='cancelled';break;
   case 'return':at('return-pending');o.returnedAt=new Date().toISOString();o.status='returned';break;
   case 'cost':ensure(['return-pending','returned'].includes(o.status),'只有退回訂單可登錄成本');ensure(integer(c.amount,0),'退回運費須為非負整數');o.returnCost=c.amount;break;
  }
 }
 const o=n.order!;
 const summaries:Record<Command['type'],string>={create:'已提交六項宴客需求','service-pay':'模擬支付平台服務費 500 元',invite:'人工邀請酒商甲、乙','proposal-save':'保存自己的提案草稿','proposal-submit':'送出有效提案',select:'選定協調意向並鎖定條件',arrange:'確認餐廳收貨時段',cancel:'無法配合，取消待退款',ship:'酒商標記已出貨',deliver:'酒商標記已送達',receive:'餐廳確認收貨（暫存）',age:'餐廳登錄驗齡結果',purchase:'主人確認現場購買','wine-pay':'酒商模擬收款成功，建立唯一待結算分潤',handover:'餐廳已交付主人',complete:'主人確認收取，服務完成',refund:'平台全額模擬退還服務費',return:'選定酒商確認取回酒品',cost:'平台登錄退回運費成本'};
 o.events.push({id:`${o.id}-${o.events.length+1}`,action:c.type,actor,at:new Date().toISOString(),summary:summaries[c.type]});
 return n;
}
