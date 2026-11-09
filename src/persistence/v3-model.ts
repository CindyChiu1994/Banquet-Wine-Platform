import {taipeiDateAfter,validateNewRequestDate} from '../domain/banquet-date';

export type Actor = 'host' | 'platform' | 'merchant-a' | 'merchant-b' | 'restaurant';
export const actorNames: Record<Actor, string> = { host:'宴客主人', platform:'平台管理者', 'merchant-a':'酒商甲', 'merchant-b':'酒商乙', restaurant:'合作餐廳' };
export type Status = 'signature-pending'|'collection-review-pending'|'draft'|'service-fee-pending'|'invitation-pending'|'proposals-pending'|'comparison-ready'|'restaurant-pending'|'delivery-ready'|'in-transit'|'restaurant-receipt-pending'|'age-check-pending'|'purchase-pending'|'wine-payment-pending'|'handover-pending'|'host-receipt-pending'|'completed'|'cancel-refund-pending'|'cancelled'|'return-pending'|'returned';
export const statusNames: Record<Status,string> = {'signature-pending':'待主人簽收','collection-review-pending':'待餐廳確認代收',draft:'填寫宴客需求','service-fee-pending':'待付服務費','invitation-pending':'待平台邀請','proposals-pending':'等待酒商提案','comparison-ready':'可以比較選定','restaurant-pending':'待餐廳確認安排','delivery-ready':'待酒商出貨','in-transit':'配送中','restaurant-receipt-pending':'待餐廳確認收貨','age-check-pending':'待餐廳驗齡','purchase-pending':'待現場確認購買','wine-payment-pending':'待付酒款','handover-pending':'待餐廳交付','host-receipt-pending':'待主人確認收取',completed:'服務完成','cancel-refund-pending':'取消待退款',cancelled:'已取消／已退款','return-pending':'待退回',returned:'已退回／服務未完成'};
export interface Request { date:string; restaurantId:string; guests:number; cuisine:string; budget:number; preference:string; hostName:string|null; contactPhone:string|null }
export type NewRequest=Omit<Request,'hostName'|'contactPhone'>&{hostName:string;contactPhone:string};
export interface Identity {originVersion:1|2|3;contact:'required'|'complete'|'preserved';lockedName:string|null;completedAt:string|null;checkRequired:boolean;checked:{passed:boolean;actor:'restaurant';at:string;reason:string}|null;legacyProposals:Proposal[]}
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
 events:Event[];checkout:Checkout;collection:Collection|null;returnReason:'age-failed'|'host-cancelled'|'identity-mismatch'|null;identity:Identity;
}
export interface State {schemaVersion:3;actor:Actor;order:Order|null;prefill:boolean}
export type Command = (
 | {type:'create';request:NewRequest}
 | {type:'contact-complete';hostName:string;contactPhone:string}
 | {type:'identity-check';passed:boolean;reason:string}
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
export function ensure(condition:unknown,message:string):asserts condition {if(!condition)throw new Error(message);}
export function validateContact(hostName:unknown,phone:unknown){
 ensure(typeof hostName==='string'&&hostName.trim().length>0&&hostName.trim().length<=100,'請填寫姓名（1 至 100 字）');
 normalizePhone(phone);
}
export function normalizePhone(value:unknown):string {
 ensure(typeof value==='string','請填寫聯絡電話');const raw=value.trim();
 ensure(raw,'請填寫聯絡電話');
 const m=raw.match(/^(.*?)(?:\s*(?:分機|#|ext\.?)\s*(\d+))?$/i)!;
 const main=m[1].replace(/[\s-]/g,''),ext=m[2];
 ensure(/^09\d{8}$/.test(main)||(/^0[2-8]\d{7,8}$/.test(main)),'聯絡電話格式錯誤：例如 0912-345-678 或 02 2345-6789 分機 123');
 ensure(!ext||!main.startsWith('09'),'聯絡電話分機僅適用市話');return main+(ext?' 分機 '+ext:'');
}
export function validateRequest(r:Request){
 validateContact(r.hostName,r.contactPhone);
 ensure(r.date&&Number.isFinite(Date.parse(r.date)),'請填寫有效的宴客日期與時間');
 ensure(r.restaurantId==='restaurant-demo','請選擇合作餐廳');
 ensure(integer(r.guests,1),'宴客人數須為正整數');
 ensure(r.cuisine.trim(),'請填寫菜色或料理類型');
 ensure(integer(r.budget,1),'酒款總預算須為正整數新臺幣');
 ensure(r.preference.trim(),'請選擇飲酒偏好，可選不限');
}
export function validateProposal(p:Proposal){
 ensure(p.items.length>0,'請至少填寫一款酒');
 for(const [i,w] of p.items.entries()){const field='第 '+(i+1)+' 款';ensure(w.name.trim(),field+'請填寫酒款名稱');ensure(integer(w.capacity,1),field+'容量須為正整數');ensure(integer(w.quantity,1),field+'瓶數須為正整數');ensure(integer(w.price,1),field+'單價須為正整數');}
 ensure(integer(p.shipping,0)&&integer(p.restaurantFee,0),'配送費須為非負整數，餐廳費用不可空白或為負數');
 ensure(p.restaurantFee===300,'餐廳現場費用固定為示範 300 元');
 ensure(p.reason.trim()&&p.delivery.trim()&&p.limits.trim(),'請填寫搭配理由、配送條件與供貨限制（無限制請明列）');
 ensure(Number.isSafeInteger(wineTotal(p))&&Number.isSafeInteger(total(p)),'提案金額超出可處理範圍');
}
export function wineTotal(p:Proposal){return p.items.reduce((sum,w)=>sum+w.quantity*w.price,0);}
export function total(p:Proposal){return 500+wineTotal(p)+p.shipping+p.restaurantFee;}
export function commissionAmount(amount:number,rateBps=1000){ensure(integer(amount,0)&&integer(rateBps,0)&&rateBps<=10000,'分潤參數無效');return Math.round(amount*rateBps/10000);}
export function emptyCheckout():Checkout{return {mode:'none',signature:null,attempts:[],completedBy:null,completedAt:null,legacy:false,operations:[]};}
export function initial(prefill=true):State{return {schemaVersion:3,actor:'host',order:null,prefill};}
export function orderForActor(state:State,actor:Actor=state.actor):Order|null {
 const o=state.order;
 return o&&o.selected&&actor.startsWith('merchant-')&&actor!==o.selected.merchant?null:o;
}
export function fixedName(o:Order):string{return o.identity.lockedName??'';}
export function identityGate(o:Order):'contact-required'|'name-check-pending'|null {
 if(['completed','cancel-refund-pending','cancelled','return-pending','returned'].includes(o.status))return null;
 if(o.identity.contact==='required')return 'contact-required';
 if(o.identity.checkRequired&&!o.identity.checked?.passed)return 'name-check-pending';
 return null;
}
export function proposalFingerprint(p:Proposal):string{return JSON.stringify(p);}
export function orderViewForActor(state:State):Order|null {
 const raw=orderForActor(state);if(!raw||!state.actor.startsWith('merchant-'))return raw;
 const o=structuredClone(raw),tokens=[raw.request.hostName,raw.request.contactPhone,raw.identity.lockedName,raw.checkout.signature?.name].filter((x):x is string=>!!x);
 const redact=(s:string)=>tokens.reduce((a,t)=>a.split(t).join('[隱藏]'),s);
 o.request.hostName=null;o.request.contactPhone=null;o.identity.lockedName=null;
 o.identity.completedAt=null;o.identity.legacyProposals=[];
 if(o.identity.checked)o.identity.checked.reason='姓名核對未通過';
 if(o.checkout.signature){o.checkout.signature.name='';o.checkout.signature.strokes=[];}
 o.age.reason=o.age.result==='failed'?'現場本人或年齡核對未通過':'';
 o.cancellationReason=o.returnReason==='identity-mismatch'?'姓名與本人不符':redact(o.cancellationReason);
 o.events=o.events.map(e=>({...e,summary:redact(e.summary)}));return o;
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
 return !identityGate(o)&&!!s&&!s.invalidatedAt&&!!s.name.trim()&&s.name===fixedName(o)&&validStrokes(s.strokes)&&!!o.selected&&JSON.stringify(s.snapshot)===JSON.stringify(receiptSnapshot(o));
}
function finish(o:Order,by:'online'|'collection',at:string){
 const p=o.selected!;const wineAmount=wineTotal(p);
 ensure(!o.checkout.completedBy&&!o.commission,'此訂單已完成');
 o.commission={orderId:o.id,merchant:p.merchant,restaurantId:o.request.restaurantId,wineAmount,rateBps:1000,amount:commissionAmount(wineAmount),status:'pending'};
 o.checkout.completedBy=by;o.checkout.completedAt=at;o.status='completed';
 o.events.push({id:`${o.id}-${o.events.length+1}`,action:'complete',actor:by==='online'?'host':'restaurant',at,summary:'服務完成，可協助開酒'});
}
export function sampleRequest(now=new Date()):NewRequest {
 const local=taipeiDateAfter(7,now);
 return {hostName:'展示主人',contactPhone:'0912345678',date:local+'T18:00',restaurantId:'restaurant-demo',guests:12,cuisine:'法式料理・海陸分享餐',budget:6500,preference:'紅白酒皆可'};
}
export function sampleProposal(merchant:Proposal['merchant']):Proposal{return {merchant,items:[{name:merchant==='merchant-a'?'勃根地風格黑皮諾':'波爾多風格紅酒',capacity:750,quantity:6,price:merchant==='merchant-a'?1000:1100}],shipping:merchant==='merchant-a'?200:0,restaurantFee:300,reason:merchant==='merchant-a'?'細緻紅果香氣與柔和單寧，搭配禽肉及分享主菜。':'成熟莓果與厚實酒體，搭配牛排與濃郁醬汁。',delivery:'宴客當日 15:00–17:00 配送至餐廳',limits:'示範供貨 6 瓶；無其他限制',submitted:false};}
const terminal=['completed','cancel-refund-pending','cancelled','return-pending','returned'];
export function transition(state:State,actor:Actor,command:Command,now=new Date()):State {
 ensure(Object.hasOwn(actorNames,actor),'未知的示範角色');
 const n=structuredClone(state), c=command;
 const stamp=now.toISOString();
 const expected:Partial<Record<Command['type'],Actor>>={create:'host','service-pay':'host',invite:'platform',select:'host',arrange:'restaurant',cancel:'restaurant',receive:'restaurant',age:'restaurant',purchase:'host','wine-pay':'host',handover:'restaurant',complete:'host',refund:'platform',cost:'platform','signature-save':'host','signature-clear':'host','contact-complete':'host','identity-check':'restaurant','request-collection':'host','staff-review':'restaurant','collection-accept':'restaurant','collection-decline':'restaurant','cancel-purchase':'host'};
 if(expected[c.type])ensure(actor===expected[c.type],'此角色沒有執行該動作的權限');
 if(c.type==='create'){
  ensure(!n.order,'目前已有訂單，請先使用展示工具重設或建立空白需求');validateNewRequestDate(c.request.date,now);validateRequest(c.request);
  n.order={id:'BW-'+Date.now().toString(36).toUpperCase(),request:{...structuredClone(c.request),hostName:c.request.hostName.trim(),contactPhone:normalizePhone(c.request.contactPhone)},identity:{originVersion:3,contact:'complete',lockedName:c.request.hostName.trim(),completedAt:stamp,checkRequired:false,checked:null,legacyProposals:[]},status:'service-fee-pending',invited:false,proposals:[],selected:null,serviceFee:{amount:500,paid:false,refund:0},winePayment:null,arrangement:'',age:{result:'pending',reason:'',actor:null,at:null},cancellationReason:'',returnedAt:null,returnCost:null,commission:null,events:[],checkout:emptyCheckout(),collection:null,returnReason:null};
 } else {
  const o=n.order;ensure(o,'請先建立需求');
  ensure(orderForActor(n,actor),'本次未獲選，無後續服務資訊可查看。');
  if(c.type==='proposal-save'||c.type==='proposal-submit')ensure(actor===c.proposal.merchant&&(actor==='merchant-a'||actor==='merchant-b'),'只能編輯自己的提案');
  if(['ship','deliver','return','collection-receive'].includes(c.type))ensure(actor===o.selected?.merchant,'只有選定酒商可以執行此動作');
  if(c.type==='contact-complete'&&o.identity.contact!=='required'){
   ensure(!terminal.includes(o.status)&&o.identity.contact==='complete'&&o.identity.originVersion<3&&c.hostName.trim()===fixedName(o)&&normalizePhone(c.contactPhone)===o.request.contactPhone,'聯絡資料已鎖定，不能再次補填或更名');return state;
  }
  if(c.type==='identity-check'&&o.identity.checked){
   ensure(c.passed===o.identity.checked.passed&&(c.passed||c.reason.trim()===o.identity.checked.reason),'姓名核對結果已鎖定，不能更改');return state;
  }
  if(['age','signature-save','signature-clear','wine-pay','request-collection','collection-accept'].includes(c.type))ensure(!identityGate(o),'請先完成主人聯絡資料補填及餐廳姓名核對');
  if(c.operationId&&o.checkout.operations.some(x=>x.id===c.operationId&&x.type===c.type&&x.actor===actor))return state;
  // Each irreversible action has one success event; edit/save operations may repeat.
  if(['service-pay','invite','select','arrange','cancel','ship','deliver','receive','age','handover','complete','refund','return'].includes(c.type)&&o.events.some(e=>e.action===c.type&&e.actor===actor)){
   if(c.type==='select')ensure(o.selected?.merchant===c.merchant,'選定後不能重選酒商');
   if(c.type==='age')ensure(o.age.result===(c.passed?'passed':'failed'),'驗齡結果已鎖定，不能改變或恢復正常履約');
   return state;
  }
  if(c.type==='wine-pay'&&o.checkout.completedBy==='online')return state;
  if(c.type==='collection-accept'&&o.checkout.completedBy==='collection')return state;
  if(c.type==='collection-receive'&&o.collection?.status==='received')return state;
  if(terminal.includes(o.status)){
   const allowed=(o.status==='completed'&&c.type==='collection-receive'&&!!o.collection)||(o.status==='cancel-refund-pending'&&c.type==='refund')||(['return-pending','returned'].includes(o.status)&&c.type==='cost')||(o.status==='return-pending'&&c.type==='return');
   ensure(allowed,'此訂單已完成或進入異常分支，不能恢復正常履約');
  }
  const at=(status:Status)=>ensure(o.status===status,`目前為「${statusNames[o.status]}」，尚未符合此操作條件`);
  switch(c.type){
   case 'contact-complete':{
    ensure(o.identity.originVersion<3&&o.identity.contact==='required'&&!o.checkout.signature&&!o.winePayment&&!o.collection,'此訂單不能補填聯絡資料');validateContact(c.hostName,c.contactPhone);
    o.request.hostName=c.hostName.trim();o.request.contactPhone=normalizePhone(c.contactPhone);o.identity.lockedName=o.request.hostName;o.identity.contact='complete';o.identity.completedAt=stamp;
    if(o.identity.checkRequired){o.checkout.mode='none';n.actor='restaurant';}break;
   }
   case 'identity-check':{
    ensure(o.identity.checkRequired&&o.identity.contact==='complete'&&o.age.result==='passed'&&!o.checkout.signature&&!o.winePayment,'目前不需要補填姓名核對');
    ensure(c.passed||c.reason.trim(),'姓名核對未通過須填寫原因');o.identity.checked={passed:c.passed,actor:'restaurant',at:stamp,reason:c.passed?'':c.reason.trim()};
    if(c.passed){o.checkout.mode='guest';n.actor='host';}else{o.status='return-pending';o.returnReason='identity-mismatch';o.checkout.mode='none';n.actor='restaurant';}break;
   }
   case 'service-pay':at('service-fee-pending');o.serviceFee.paid=true;o.status='invitation-pending';break;
   case 'invite':at('invitation-pending');ensure(o.serviceFee.paid,'請先支付服務費');o.invited=true;o.status='proposals-pending';break;
   case 'proposal-save':case 'proposal-submit':{
    ensure(['proposals-pending','comparison-ready'].includes(o.status)&&o.invited&&!o.selected,'尚未受邀或選定後已鎖定提案');
    const p=structuredClone(c.proposal);if(c.type==='proposal-submit')validateProposal(p);
    o.identity.legacyProposals=o.identity.legacyProposals.filter(x=>x.merchant!==p.merchant);
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
   case 'age':at('age-check-pending');ensure(c.passed||c.reason.trim(),'驗齡未通過須填寫原因');o.age={result:c.passed?'passed':'failed',reason:c.passed?'':c.reason.trim(),actor,at:stamp};o.status=c.passed?'signature-pending':'return-pending';if(c.passed){o.checkout.mode='guest';n.actor='host';}else{o.returnReason='age-failed';}break;
   case 'purchase':throw new Error('請於客人專用畫面核對明細並手寫簽名');
   case 'signature-save':ensure(['signature-pending','wine-payment-pending'].includes(o.status)&&o.age.result==='passed'&&o.checkout.mode==='guest','請先通過本人核對及驗齡');ensure(c.name.trim()&&c.name.trim().length<=100,'請填寫下單人姓名（100 字以內）');ensure(c.name===fixedName(o),'簽名姓名須與固定下單姓名一致，不可修改');ensure(validStrokes(c.strokes),'請完成非空白手寫簽名（筆畫過多請清除重簽）');o.checkout.signature={name:c.name.trim(),strokes:structuredClone(c.strokes),at:stamp,snapshot:receiptSnapshot(o),invalidatedAt:null};o.status='wine-payment-pending';break;
   case 'signature-clear':ensure(['signature-pending','wine-payment-pending'].includes(o.status)&&o.checkout.mode==='guest','目前無法修改簽名');o.checkout.signature=null;o.status='signature-pending';break;
   case 'wine-pay':at('wine-payment-pending');ensure(o.age.result==='passed'&&o.selected&&signatureValid(o)&&o.checkout.mode==='guest','請核對明細並保存有效簽名');{
    const wineAmount=wineTotal(o.selected),outcome=c.outcome??'success';o.checkout.attempts.push({id:c.operationId??`${o.id}-${o.events.length}`,outcome,at:stamp});
    if(outcome==='success'){o.winePayment={payee:o.selected.merchant,amount:wineAmount+o.selected.shipping,wineAmount,paid:true};finish(o,'online',stamp);}break;
   }
   case 'request-collection':at('wine-payment-pending');ensure(signatureValid(o)&&o.checkout.mode==='guest'&&o.checkout.attempts.some(x=>x.outcome==='failed'),'請先簽名並嘗試模擬付款');o.status='collection-review-pending';o.checkout.mode='handoff';n.actor='restaurant';break;
   case 'staff-review':at('collection-review-pending');ensure(o.checkout.mode==='handoff','請將裝置交回店員');o.checkout.mode='staff';break;
   case 'collection-decline':at('collection-review-pending');ensure(o.checkout.mode==='staff','請先交回店員核對');o.status='wine-payment-pending';o.checkout.mode='guest';n.actor='host';break;
   case 'collection-accept':at('collection-review-pending');ensure(o.age.result==='passed'&&signatureValid(o)&&o.checkout.mode==='staff'&&o.checkout.attempts.some(x=>x.outcome==='failed'),'請先完成本人簽名、付款嘗試並由店員核對');{
    const snapshot=receiptSnapshot(o);ensure(!o.collection&&!o.winePayment,'此訂單已有付款方式');o.collection={orderId:o.id,restaurantId:o.request.restaurantId,merchant:snapshot.merchant,wineAmount:snapshot.wineAmount,shipping:snapshot.shipping,amount:snapshot.amount,acceptedBy:'restaurant',acceptedAt:stamp,status:'pending',receivedBy:null,receivedAt:null,receivedAmount:null};finish(o,'collection',stamp);break;
   }
   case 'collection-receive':at('completed');ensure(o.collection?.status==='pending','目前沒有待收清帳款');o.collection.status='received';o.collection.receivedBy=actor;o.collection.receivedAt=stamp;o.collection.receivedAmount=o.collection.amount;break;
   case 'cancel-purchase':ensure(['signature-pending','wine-payment-pending'].includes(o.status)&&o.age.result==='passed','僅能於服務完成前取消購買');o.returnReason='host-cancelled';o.cancellationReason='主人取消購買';if(o.checkout.signature)o.checkout.signature.invalidatedAt=stamp;o.checkout.mode='none';n.actor='restaurant';o.status='return-pending';break;
   case 'handover':at('handover-pending');ensure(o.checkout.legacy&&o.age.result==='passed'&&o.winePayment?.paid,'僅供舊版已付款訂單接續');o.status='host-receipt-pending';break;
   case 'complete':at('host-receipt-pending');ensure(o.checkout.legacy&&o.winePayment?.paid,'僅供舊版已付款訂單接續');o.status='completed';o.checkout.completedBy='legacy';o.checkout.completedAt=stamp;break;
   case 'refund':at('cancel-refund-pending');ensure(o.serviceFee.paid&&!o.serviceFee.refund,'無可退還服務費');o.serviceFee.refund=o.serviceFee.amount;o.status='cancelled';break;
   case 'return':at('return-pending');o.returnedAt=new Date().toISOString();o.status='returned';break;
   case 'cost':ensure(['return-pending','returned'].includes(o.status),'只有退回訂單可登錄成本');ensure(integer(c.amount,0),'退回運費須為非負整數');o.returnCost=c.amount;break;
  }
 }
 const o=n.order!;
 const summaries:Record<Command['type'],string>={create:'已提交宴客需求與聯絡資料','contact-complete':'主人完成一次聯絡資料補填','identity-check':'餐廳核對補填姓名','service-pay':'模擬支付平台服務費 500 元',invite:'人工邀請酒商甲、乙','proposal-save':'保存自己的提案草稿','proposal-submit':'送出有效提案',select:'選定協調意向並鎖定條件',arrange:'確認餐廳收貨時段',cancel:'無法配合，取消待退款',ship:'酒商標記已出貨',deliver:'酒商標記已送達',receive:'餐廳確認收貨（暫存）',age:'餐廳核對下單本人並登錄驗齡結果',purchase:'主人確認現場購買','wine-pay':c.type==='wine-pay'&&c.outcome==='failed'?'模擬付款失敗，待付款':'酒商模擬收款成功，建立唯一待結算分潤',handover:'舊版：餐廳已交付主人',complete:'舊版：主人確認收取，服務完成',refund:'平台全額模擬退還服務費',return:'選定酒商確認取回酒品',cost:'平台登錄退回運費成本','signature-save':'主人保存簽名與交易明細','signature-clear':'主人清除簽名','request-collection':'主人請餐廳協助代收','staff-review':'交回店員核對代收金額','collection-accept':'餐廳確認承接代收，待付酒商','collection-decline':'餐廳不承接代收，回到待付款','collection-receive':'選定酒商確認已收到餐廳全額款項','cancel-purchase':'主人取消購買，待酒商取回'};
 o.events.push({id:`${o.id}-${o.events.length+1}`,action:c.type,actor,at:stamp,summary:summaries[c.type]});
 if(c.operationId)o.checkout.operations.push({id:c.operationId,type:c.type,actor});
 return n;
}
