
export type Actor = 'host' | 'platform' | 'merchant-a' | 'merchant-b' | 'restaurant';
export const actorNames: Record<Actor, string> = { host:'宴客主人', platform:'平台管理者', 'merchant-a':'酒商甲', 'merchant-b':'酒商乙', restaurant:'合作餐廳' };
export type Status = 'signature-pending'|'collection-review-pending'|'draft'|'service-fee-pending'|'invitation-pending'|'proposals-pending'|'comparison-ready'|'restaurant-pending'|'delivery-ready'|'in-transit'|'restaurant-receipt-pending'|'age-check-pending'|'purchase-pending'|'wine-payment-pending'|'handover-pending'|'host-receipt-pending'|'completed'|'cancel-refund-pending'|'cancelled'|'return-pending'|'returned';
export const statusNames: Record<Status,string> = {'signature-pending':'待主人簽收','collection-review-pending':'待餐廳確認代收',draft:'填寫宴客需求','service-fee-pending':'待付服務費','invitation-pending':'待平台邀請','proposals-pending':'等待酒商提案','comparison-ready':'可以比較選定','restaurant-pending':'待餐廳確認安排','delivery-ready':'待酒商出貨','in-transit':'配送中','restaurant-receipt-pending':'待餐廳確認收貨','age-check-pending':'待餐廳驗齡','purchase-pending':'待現場確認購買','wine-payment-pending':'待付酒款','handover-pending':'待餐廳交付','host-receipt-pending':'待主人確認收取',completed:'服務完成','cancel-refund-pending':'取消待退款',cancelled:'已取消／已退款','return-pending':'待退回',returned:'已退回／服務未完成'};
export interface Request { date:string; restaurantId:string; guests:number; cuisine:string; budget:number; preference:string }
export interface Wine { name:string; capacity:number; quantity:number; price:number }
export interface Proposal { merchant: 'merchant-a'|'merchant-b'; items:Wine[]; shipping:number; restaurantFee:number; reason:string; delivery:string; limits:string; submitted:boolean }
export interface Event { id:string; action:string; actor:Actor; at:string; summary:string }
export type Point={x:number;y:number};
export type Strokes=Point[][];
export interface ReceiptSnapshot {orderId:string;merchant:Proposal['merchant'];items:Wine[];wineAmount:number;shipping:number;amount:number}
export interface Signature {name:string;strokes:Strokes;at:string;snapshot:ReceiptSnapshot;invalidatedAt:string|null}
export interface Checkout {mode:'none'|'guest'|'handoff'|'staff';signature:Signature|null;attempts:{id:string;outcome:'success'|'failed';at:string}[];completedBy:'online'|'collection'|'legacy'|null;completedAt:string|null;legacy:boolean;operations:{id:string;type:string;actor:Actor}[]}
export interface Collection {orderId:string;restaurantId:string;merchant:Proposal['merchant'];wineAmount:number;shipping:number;amount:number;acceptedBy:Actor;acceptedAt:string;status:'pending'|'received';receivedBy:Actor|null;receivedAt:string|null;receivedAmount:number|null}
export interface Order {
 id:string; request:Request; status:Status; invited:boolean; proposals:Proposal[]; selected:Proposal|null;
 serviceFee:{amount:number;paid:boolean;refund:number};
 winePayment:{payee:string;amount:number;wineAmount:number;paid:boolean}|null;
 arrangement:string; age:{result:'pending'|'passed'|'failed';reason:string;actor:Actor|null;at:string|null};
 cancellationReason:string; returnedAt:string|null; returnCost:number|null;
 commission:{orderId:string;merchant:string;restaurantId:string;wineAmount:number;rateBps:number;amount:number;status:'pending'}|null;
 events:Event[];checkout:Checkout;collection:Collection|null;returnReason:'age-failed'|'host-cancelled'|null;
}
export interface State {schemaVersion:2;actor:Actor;order:Order|null;prefill:boolean}
export type Command = (
 | {type:'create';request:Request}
 | {type:'service-pay'|'invite'|'ship'|'deliver'|'receive'|'purchase'|'handover'|'complete'|'refund'|'return'|'signature-clear'|'request-collection'|'staff-review'|'collection-accept'|'collection-decline'|'collection-receive'|'cancel-purchase'}
 | {type:'signature-save';name:string;strokes:Strokes}
 | {type:'wine-pay';outcome?:'success'|'failed'}
 | {type:'proposal-save'|'proposal-submit';proposal:Proposal}
 | {type:'select';merchant:Proposal['merchant']}
 | {type:'arrange';time:string}
 | {type:'cancel';reason:string}
 | {type:'age';passed:boolean;reason:string}
 | {type:'cost';amount:number}) & {operationId?:string};
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
export function emptyCheckout():Checkout{return {mode:'none',signature:null,attempts:[],completedBy:null,completedAt:null,legacy:false,operations:[]};}
export function initial(prefill=true):State{return {schemaVersion:2,actor:'host',order:null,prefill};}
export function orderForActor(state:State,actor:Actor=state.actor):Order|null {
 const o=state.order;
 return o&&o.selected&&actor.startsWith('merchant-')&&actor!==o.selected.merchant?null:o;
}
export function receiptSnapshot(o:Order):ReceiptSnapshot {
 ensure(o.selected,'尚未選定酒商');const p=o.selected,wineAmount=wineTotal(p);
 return {orderId:o.id,merchant:p.merchant,items:structuredClone(p.items),wineAmount,shipping:p.shipping,amount:wineAmount+p.shipping};
}
export function validStrokes(value:unknown):value is Strokes {
 if(!Array.isArray(value)||value.length===0||value.length>200)return false;
 let points=0,moved=false;
 for(const stroke of value){if(!Array.isArray(stroke)||stroke.length<2)return false;points+=stroke.length;
  for(const p of stroke)if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||p.x<0||p.x>1000||p.y<0||p.y>300)return false;
  if(stroke.some(p=>Math.hypot(p.x-stroke[0].x,p.y-stroke[0].y)>1))moved=true;
 }
 return points<=12000&&moved;
}
export function signatureValid(o:Order):boolean {
 const s=o.checkout.signature;
 return !!s&&!s.invalidatedAt&&!!s.name.trim()&&validStrokes(s.strokes)&&!!o.selected&&JSON.stringify(s.snapshot)===JSON.stringify(receiptSnapshot(o));
}
