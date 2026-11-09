import {describe,it,expect} from 'vitest';
import v1 from '../../openspec/changes/archive/2026-11-09-clarify-onsite-wine-service-and-budget/e2e-fixtures/v1-fixtures.json';
import v2 from '../../openspec/changes/archive/2026-11-09-clarify-onsite-wine-service-and-budget/e2e-fixtures/v2-fixtures.json';
import v3 from '../../openspec/changes/archive/2026-11-09-clarify-onsite-wine-service-and-budget/e2e-fixtures/v3-fixtures.json';
import {load,save,validState} from './storage';
import {orderViewForActor,transition,type Actor,type Command} from '../domain/model';
describe('42 original manifest fixtures migrate purely and roundtrip',()=>{
 for(const [version,fixtures] of [[1,v1],[2,v2],[3,v3]] as const)for(const [name,old]of Object.entries(fixtures))it('v'+version+' '+name,()=>{
  const original=JSON.stringify(old);let raw=original,writes=0;
  const port={getItem:()=>raw,setItem:(_:string,s:string)=>{writes++;raw=s;}};
  const loaded=load(port);expect(loaded.error).toBe('');expect(writes).toBe(0);expect(raw).toBe(original);
  const s=loaded.state,o=s.order!;expect(s.schemaVersion).toBe(4);expect(validState(s)).toBe(true);
  expect(o.legacy).toEqual({version,original:old});expect(o.winePayment).toEqual(old.order.winePayment);expect(o.age).toEqual(old.order.age);expect(o.events).toEqual(old.order.events);expect(o.request.date).toBe(old.order.request.date);
  if('checkout'in old.order)expect(o.checkout.signature).toEqual(old.order.checkout.signature);
  expect(o).not.toHaveProperty('returnCost');if(o.selected)expect(o.selected).not.toHaveProperty('restaurantFee');
  for(const actor of ['host','platform','restaurant','merchant-a','merchant-b'] as Actor[]){const view=orderViewForActor({...s,actor});if(view){expect(view).not.toHaveProperty('legacy');expect(view.events.some(e=>e.action==='cost')).toBe(false);}}
  expect(()=>transition(s,'platform',{type:'cost',amount:200} as unknown as Command)).toThrow('已移除');
  save(port,s);expect(writes).toBe(1);expect(load(port)).toEqual({state:s,error:''});
 });
 it('historical fees only stay in archive; v3 budget exception cannot fake new compliance',()=>{const s=load({getItem:()=>JSON.stringify(v3['over-budget']),setItem:()=>{}}).state;expect(s.order!.proposals.every(p=>p.policy==='legacy')).toBe(true);const copy=structuredClone(s);for(const p of copy.order!.proposals)p.policy='wine-shipping-105';expect(validState(copy)).toBe(false);});
 it('v4 cannot inject active returnCost or restore fee; corrupted raw not overwritten',()=>{const s=load({getItem:()=>JSON.stringify(v3['return-200']),setItem:()=>{}}).state;const bad={...s,order:{...s.order,returnCost:200}};expect(validState(bad)).toBe(false);let writes=0;const raw=JSON.stringify(bad);expect(load({getItem:()=>raw,setItem:()=>{writes++;}}).error).toBeTruthy();expect(writes).toBe(0);});
});
