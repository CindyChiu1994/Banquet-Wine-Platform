import {actorNames,initial,KEY,statusNames,validateRequest,validateProposal,signatureValid,validStrokes,receiptSnapshot,commissionAmount,identityGate,fixedName,proposalFingerprint,type State} from '../domain/model';
import {migrateHistorical} from './legacy';
import {validateRequest as validateOldRequest,validateProposal as validateOldProposal} from './v2-model';
export interface StoragePort {getItem(key:string):string|null;setItem(key:string,value:string):void}
const date=(v:unknown)=>typeof v==='string'&&Number.isFinite(Date.parse(v));
const amount=(v:unknown)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0;
export function validState(value:unknown):value is State {
 try{
  const s=value as State;if(!s||s.schemaVersion!==3||!Object.hasOwn(actorNames,s.actor)||typeof s.prefill!=='boolean')return false;
  if(s.order===null)return true;
  const o=s.order,c=o.checkout;
  if(!o||typeof o.id!=='string'||!Object.hasOwn(statusNames,o.status)||!Array.isArray(o.events)||!Array.isArray(o.proposals)||typeof o.invited!=='boolean')return false;
  const identity=o.identity;
  if(!identity||![1,2,3].includes(identity.originVersion)||!['required','complete','preserved'].includes(identity.contact)||typeof identity.checkRequired!=='boolean'||!Array.isArray(identity.legacyProposals))return false;
  if(identity.originVersion===3&&(identity.contact!=='complete'||identity.legacyProposals.length||identity.checkRequired||identity.checked))return false;
  if(identity.contact==='complete'){
   validateRequest(o.request);if(identity.lockedName!==o.request.hostName||o.request.hostName!==o.request.hostName?.trim()||!date(identity.completedAt))return false;
  }else{
   if(identity.originVersion===3||o.request.hostName!==null||o.request.contactPhone!==null||identity.completedAt!==null)return false;
   validateOldRequest(o.request);
   if(identity.contact==='required'&&(identity.lockedName!==null||o.checkout.signature||o.winePayment||o.collection||['completed','cancel-refund-pending','cancelled','return-pending','returned'].includes(o.status)))return false;
   if(identity.contact==='preserved'&&identity.lockedName!==null&&(typeof identity.lockedName!=='string'||!identity.lockedName.trim()||identity.lockedName.length>100))return false;
   if(identity.contact==='preserved'&&!identity.lockedName&&!o.winePayment&&!o.collection&&!['completed','cancel-refund-pending','cancelled','return-pending','returned'].includes(o.status))return false;
  }
  if(identity.checked!==null){
   const k=identity.checked;
   if(!identity.checkRequired||identity.contact!=='complete'||typeof k.passed!=='boolean'||k.actor!=='restaurant'||!date(k.at)||typeof k.reason!=='string'||(!k.passed&&!k.reason.trim())||o.age.result!=='passed')return false;
   if(!k.passed&&!['return-pending','returned'].includes(o.status))return false;
  }
  for(const p of identity.legacyProposals){if(identity.originVersion===3||!p.submitted)return false;validateOldProposal(p);}
  const validateSavedProposal=(p:typeof o.proposals[number])=>{
   if(identity.legacyProposals.some(old=>proposalFingerprint(old)===proposalFingerprint(p)))validateOldProposal(p);else validateProposal(p);
  };
  if(!o.serviceFee||o.serviceFee.amount!==500||typeof o.serviceFee.paid!=='boolean'||![0,500].includes(o.serviceFee.refund))return false;
  if(o.status!=='service-fee-pending'&&!o.serviceFee.paid)return false;
  if(!o.age||!['pending','passed','failed'].includes(o.age.result)||typeof o.age.reason!=='string'||typeof o.arrangement!=='string'||typeof o.cancellationReason!=='string'||!(o.returnedAt===null||date(o.returnedAt))||!(o.returnCost===null||amount(o.returnCost)))return false;
  if(o.age.result!=='pending'&&(o.age.actor!=='restaurant'||!date(o.age.at)))return false;
  if(![null,'age-failed','host-cancelled','identity-mismatch'].includes(o.returnReason))return false;
  if(o.proposals.length>2||new Set(o.proposals.map(p=>p.merchant)).size!==o.proposals.length)return false;
  for(const p of o.proposals){if(!['merchant-a','merchant-b'].includes(p.merchant)||!Array.isArray(p.items)||typeof p.submitted!=='boolean')return false;if(p.submitted)validateSavedProposal(p);}
  if(o.selected){validateSavedProposal(o.selected);if(!o.selected.submitted||!o.invited||!o.serviceFee.paid)return false;}
  if(!['service-fee-pending','invitation-pending','proposals-pending','comparison-ready'].includes(o.status)&&!o.selected)return false;
  if(!c||!['none','guest','handoff','staff'].includes(c.mode)||typeof c.legacy!=='boolean'||!Array.isArray(c.attempts)||!Array.isArray(c.operations)||![null,'online','collection','legacy'].includes(c.completedBy)||!(c.completedAt===null||date(c.completedAt)))return false;
  if(!c.operations.every(x=>typeof x.id==='string'&&x.id.length>0&&typeof x.type==='string'&&Object.hasOwn(actorNames,x.actor)))return false;
  if(!c.attempts.every(a=>typeof a.id==='string'&&['success','failed'].includes(a.outcome)&&date(a.at)))return false;
  if(c.signature!==null){const sig=c.signature;if(typeof sig.name!=='string'||!sig.name.trim()||sig.name.length>100||!validStrokes(sig.strokes)||!date(sig.at)||!(sig.invalidatedAt===null||date(sig.invalidatedAt)))return false;if(sig.name!==fixedName(o)||!o.selected||JSON.stringify(sig.snapshot)!==JSON.stringify(receiptSnapshot(o)))return false;}
  if(['wine-payment-pending','collection-review-pending'].includes(o.status)&&!signatureValid(o))return false;
  if(['signature-pending','wine-payment-pending','collection-review-pending','completed'].includes(o.status)&&o.age.result!=='passed')return false;
  if(o.status==='collection-review-pending'&&(!['handoff','staff'].includes(c.mode)||!c.attempts.some(a=>a.outcome==='failed')))return false;
  const snap=o.selected?receiptSnapshot(o):null;
  if(o.winePayment!==null){const p=o.winePayment;if(!snap||!p.paid||p.payee!==snap.merchant||p.amount!==snap.amount||p.wineAmount!==snap.wineAmount||!o.commission||o.age.result!=='passed'||o.collection)return false;}
  if(o.collection!==null){const x=o.collection;if(!snap||x.orderId!==o.id||x.restaurantId!==o.request.restaurantId||x.merchant!==snap.merchant||x.amount!==snap.amount||x.wineAmount!==snap.wineAmount||x.shipping!==snap.shipping||x.acceptedBy!=='restaurant'||!date(x.acceptedAt)||!['pending','received'].includes(x.status)||c.completedBy!=='collection'||!signatureValid(o)||o.winePayment||o.status!=='completed')return false;
   if(x.status==='pending'&&(x.receivedAt!==null||x.receivedBy!==null||x.receivedAmount!==null))return false;
   if(x.status==='received'&&(x.receivedBy!==x.merchant||!date(x.receivedAt)||x.receivedAmount!==x.amount))return false;
  }
  if(o.commission!==null){const x=o.commission;if(!snap||(!o.winePayment?.paid&&!o.collection)||x.orderId!==o.id||x.merchant!==snap.merchant||x.restaurantId!==o.request.restaurantId||x.wineAmount!==snap.wineAmount||x.rateBps!==1000||x.amount!==commissionAmount(snap.wineAmount)||x.status!=='pending')return false;}
  if(c.legacy&&(!o.winePayment?.paid||!['handover-pending','host-receipt-pending','completed'].includes(o.status)))return false;
  if(['handover-pending','host-receipt-pending'].includes(o.status)&&(!c.legacy||!o.winePayment?.paid))return false;
  if(o.status==='completed'){
   if(!c.completedAt||!o.commission)return false;
   if(c.completedBy==='online'&&(!o.winePayment?.paid||!signatureValid(o)||!c.attempts.some(a=>a.outcome==='success')))return false;
   if(c.completedBy==='collection'&&!o.collection)return false;
   if(c.completedBy==='legacy'&&(!c.legacy||!o.winePayment?.paid))return false;
   if(!c.completedBy)return false;
  }else if(c.completedBy||c.completedAt)return false;
  if(['return-pending','returned'].includes(o.status)){
   if(!o.returnReason||o.winePayment||o.commission||o.collection||c.mode!=='none')return false;
   if(o.returnReason==='identity-mismatch'&&(o.age.result!=='passed'||o.identity.checked?.passed!==false))return false;
   if(o.returnReason==='age-failed'&&o.age.result!=='failed')return false;
   if(o.returnReason==='host-cancelled'&&(o.age.result!=='passed'||signatureValid(o)))return false;
  }
  if(['cancel-refund-pending','cancelled'].includes(o.status)&&(o.winePayment||o.commission||o.collection))return false;
  if(o.status==='cancelled'&&o.serviceFee.refund!==500)return false;
  return o.events.every(e=>typeof e.id==='string'&&typeof e.action==='string'&&Object.hasOwn(actorNames,e.actor)&&date(e.at)&&typeof e.summary==='string');
 }catch{return false;}
}
export function load(storage:StoragePort):{state:State;error:string}{
 try{const raw=storage.getItem(KEY);if(raw===null)return {state:initial(),error:''};let parsed:unknown=JSON.parse(raw);if((parsed as {schemaVersion?:number})?.schemaVersion!==3){const migrated=migrateHistorical(parsed);if(!migrated)throw Error('invalid legacy');parsed=migrated;}if(!validState(parsed))throw Error('invalid');for(const p of parsed.order?.proposals??[])if(!p.submitted){for(const w of p.items){for(const k of ['capacity','quantity','price'] as const)if(w[k]===null)w[k]=NaN;}if(p.shipping===null)p.shipping=NaN;}
 return {state:parsed,error:''};}
 catch{return {state:initial(),error:'展示資料無法讀取、版本不符或已損壞。原資料尚未覆寫，請確認重設以恢復。'};}
}
export function save(storage:StoragePort,state:State){if(!validState(state))throw Error('保存資料未通過驗證');storage.setItem(KEY,JSON.stringify(state));}
