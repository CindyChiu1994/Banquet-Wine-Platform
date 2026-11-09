import {validLegacyState,migrateLegacy} from './v1-legacy';
import {validState as validV2State} from './v2-storage';
import type {State,Order,Proposal} from '../domain/model';
export {validLegacyState};
export function migrateHistorical(value:unknown):State|null {
 let old:unknown=value;let origin:1|2;
 if(validLegacyState(value)){old=migrateLegacy(value);origin=1;}else if(validV2State(value)){origin=2;}else return null;
 const state=structuredClone(old) as State;state.schemaVersion=3;
 const o=state.order;if(!o)return state;
 o.request={...o.request,hostName:null,contactPhone:null};
 const preserved=!!o.checkout.signature||!!o.winePayment||!!o.collection||['completed','cancel-refund-pending','cancelled','return-pending','returned'].includes(o.status);
 const proposals:Proposal[]=o.proposals.filter(p=>p.submitted).map(p=>structuredClone(p));
 if(o.selected&&!proposals.some(p=>JSON.stringify(p)===JSON.stringify(o.selected)))proposals.push(structuredClone(o.selected));
 o.identity={originVersion:origin,contact:preserved?'preserved':'required',lockedName:o.checkout.signature?.name??null,completedAt:null,checkRequired:!preserved&&o.age.result==='passed',checked:null,legacyProposals:proposals};
 return state;
}
