import {describe,it,expect} from 'vitest';
import fixtures from '../../openspec/changes/archive/2026-11-09-streamline-onsite-signoff-payment/legacy/fixtures.json';
import {load} from './storage';
describe('原公開 UI 建立的 v1 相容性資料',()=>{
 for(const [name,state] of Object.entries(fixtures))it(name,()=>{
  const raw=JSON.stringify(state);
  const result=load({getItem:()=>raw,setItem:()=>{throw Error('讀取不得覆寫');}});
  expect(result.error).toBe('');
  expect(result.state.order?.id).toBe(state.order.id);
  expect(result.state.order?.winePayment).toEqual(state.order.winePayment);
  expect(result.state.order?.events).toEqual(state.order.events);
 });
});
