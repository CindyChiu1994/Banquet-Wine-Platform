import {actorNames,emptyCheckout,statusNames,validateRequest,validateProposal,type Order,type State} from '../domain/model';
type LegacyOrder=Omit<Order,'checkout'|'collection'|'returnReason'>;
export type LegacyState=Omit<State,'schemaVersion'|'order'>&{schemaVersion:1;order:LegacyOrder|null};
export function validLegacyState(value:unknown):value is LegacyState {
 try{
  const s=value as LegacyState;if(!s||s.schemaVersion!==1||!Object.hasOwn(actorNames,s.actor)||typeof s.prefill!=='boolean')return false;
  if(s.order===null)return true;
  const o=s.order;if(!o||typeof o.id!=='string'||!Object.hasOwn(statusNames,o.status)||!Array.isArray(o.proposals)||!Array.isArray(o.events)||typeof o.invited!=='boolean')return false;
  // Loading historical orders checks data validity, never today's booking cutoff.
  validateRequest(o.request);
  if(!o.serviceFee||o.serviceFee.amount!==500||typeof o.serviceFee.paid!=='boolean'||![0,500].includes(o.serviceFee.refund))return false;
  if(!o.age||!['pending','passed','failed'].includes(o.age.result)||typeof o.age.reason!=='string'||typeof o.arrangement!=='string'||typeof o.cancellationReason!=='string'||!(o.returnedAt===null||typeof o.returnedAt==='string')||!(o.returnCost===null||Number.isSafeInteger(o.returnCost)&&o.returnCost>=0))return false;
  if(o.proposals.length>2||new Set(o.proposals.map(p=>p.merchant)).size!==o.proposals.length)return false;
  for(const p of o.proposals){if(!['merchant-a','merchant-b'].includes(p.merchant)||!Array.isArray(p.items)||typeof p.submitted!=='boolean')return false;if(p.submitted)validateProposal(p);}
  if(o.selected){validateProposal(o.selected);if(!o.selected.submitted||!o.invited||!o.serviceFee.paid)return false;}
  if(o.status!=='service-fee-pending'&&!o.serviceFee.paid)return false;
  if(!['service-fee-pending','invitation-pending','proposals-pending','comparison-ready'].includes(o.status)&&!o.selected)return false;
  if(o.winePayment!==null&&(!o.winePayment.paid||!Number.isSafeInteger(o.winePayment.amount)||!o.commission||o.age.result!=='passed'))return false;
  if(o.commission!==null&&(!o.winePayment?.paid||o.commission.status!=='pending'||!Number.isSafeInteger(o.commission.amount)))return false;
  if(['handover-pending','host-receipt-pending','completed'].includes(o.status)&&!o.winePayment?.paid)return false;
  if(['return-pending','returned'].includes(o.status)&&(o.age.result!=='failed'||o.winePayment!==null||o.commission!==null))return false;
  if(['cancel-refund-pending','cancelled'].includes(o.status)&&(o.winePayment!==null||o.commission!==null))return false;
  if(o.status==='cancelled'&&o.serviceFee.refund!==500)return false;
  return o.events.every(e=>typeof e.id==='string'&&typeof e.action==='string'&&Object.hasOwn(actorNames,e.actor)&&typeof e.at==='string'&&typeof e.summary==='string');
 }catch{return false;}
}
export function migrateLegacy(old:LegacyState):State {
 const original=structuredClone(old),o=original.order;
 const state:State={...original,schemaVersion:2,order:o?{...o,checkout:emptyCheckout(),collection:null,returnReason:o.age.result==='failed'?'age-failed':null}:null};
 if(!state.order)return state;
 const n=state.order;
 if(n.winePayment?.paid){n.checkout.legacy=true;if(n.status==='completed'){n.checkout.completedBy='legacy';n.checkout.completedAt=n.events.find(e=>e.action==='complete')?.at??n.events.at(-1)!.at;}}
 else if(['purchase-pending','wine-payment-pending'].includes(n.status)){n.status='signature-pending';n.checkout.mode='guest';state.actor='host';}
 return state;
}
