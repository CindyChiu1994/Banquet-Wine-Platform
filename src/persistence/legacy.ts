import {load as loadV3} from './v3-storage';
import type {State,Proposal,Order} from '../domain/model';
export {validLegacyState} from './v1-legacy';
export function cleanProposal(value:unknown):Proposal{const old=structuredClone(value) as Proposal&{restaurantFee?:number};delete old.restaurantFee;old.policy='legacy';return old;}
export function migrateHistorical(value:unknown):State|null {
 const raw=value as {schemaVersion?:number};if(![1,2,3].includes(raw?.schemaVersion??0))return null;
 const result=loadV3({getItem:()=>JSON.stringify(value),setItem:()=>{throw Error('讀取不可寫回');}});if(result.error)return null;
 const s=structuredClone(result.state) as unknown as State;s.schemaVersion=4;const o=s.order as (Order&{returnCost?:number})|null;if(!o)return s;
 o.legacy={version:raw.schemaVersion as 1|2|3,original:structuredClone(value)};
 o.request.budgetPolicy='legacy';o.proposals=o.proposals.map(cleanProposal);o.selected=o.selected?cleanProposal(o.selected):null;
 o.identity.legacyProposals=[...o.proposals.filter(p=>p.submitted),...(o.selected?[o.selected]:[])].map(p=>structuredClone(p));
 o.purchaseDraft=o.selected&&o.age.result==='passed'?{items:structuredClone(o.selected.items),shipping:o.selected.shipping,revision:0,updatedBy:'restaurant',updatedAt:o.age.at??o.events[0]?.at??new Date(0).toISOString()}:null;
 o.unusedStock=null;delete o.returnCost;return s;
}
