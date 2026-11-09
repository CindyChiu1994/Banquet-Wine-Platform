import {describe,it,expect} from 'vitest';
import {budgetLimit,proposalAmount,withinBudget,validatePublicText,redactCommerce} from './service-policy';
import {sampleProposal,transition,initial,sampleRequest} from './model';
const proposal=(shipping:number)=>({...sampleProposal('merchant-a'),shipping});
describe('105% integer policy',()=>{
 it('6825可提交，6826超出1元；6501取整至6826',()=>{expect(budgetLimit(6500)).toBe(6825n);expect(withinBudget(proposal(825),6500)).toBe(true);expect(withinBudget(proposal(826),6500)).toBe(false);expect(budgetLimit(6501)).toBe(6826n);});
 it.each([0,-1,1.1,NaN,Infinity,Number.MAX_SAFE_INTEGER+1])('reject unsafe budget %s',budget=>expect(()=>budgetLimit(budget)).toThrow());
 it('BigInt不溢位，金額溢位與缺值不能提交',()=>{expect(budgetLimit(Number.MAX_SAFE_INTEGER)).toBe(BigInt(Number.MAX_SAFE_INTEGER)*105n/100n);expect(()=>proposalAmount({...proposal(0),items:[{quantity:2,price:Number.MAX_SAFE_INTEGER}]})).toThrow();expect(()=>proposalAmount(proposal(NaN))).toThrow();});
 it('直接命令繞過UI同樣受限且原成功提案保持不變',()=>{let s=transition(initial(),'host',{type:'create',request:sampleRequest()});s=transition(s,'host',{type:'service-pay'});s=transition(s,'platform',{type:'invite'});s=transition(s,'merchant-a',{type:'proposal-submit',proposal:proposal(825)});const before=structuredClone(s);expect(()=>transition(s,'merchant-a',{type:'proposal-submit',proposal:proposal(826)})).toThrow('超出 1 元');expect(s).toEqual(before);const d=transition(s,'merchant-a',{type:'proposal-save',proposal:proposal(826)});expect(d.order?.proposals[0].submitted).toBe(false);});
});
describe('public explanation policy',()=>{
 it.each(['報價NT$6000','運送費200元','單價新臺幣1000元','餐廳分潤10%','佣金600元','NTD 6000','免運'])('reject %s',text=>expect(()=>validatePublicText([text])).toThrow('內部金額'));
 it.each(['750ml、6瓶、15:00–17:00','莓果香氣，搭配牛排','當日備酒，請餐廳暫存'])('allow %s',text=>expect(()=>validatePublicText([text])).not.toThrow());
 it('historical text conceals prices before gate and all commission terms',()=>{expect(redactCommerce('酒款NT$6000。運送200元。餐廳分潤10%。',true)).not.toMatch(/6000|200|10%|分潤/);expect(redactCommerce('酒款NT$6000。佣金600元。',false)).toContain('6000');expect(redactCommerce('酒款NT$6000。佣金600元。',false)).not.toContain('佣金');});
});
