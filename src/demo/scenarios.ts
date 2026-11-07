import {initial,sampleProposal,sampleRequest,transition,type Actor,type Command,type State} from '../domain/model';
export type Scenario='blank'|'normal'|'cancel'|'age';
export function scenario(which:Scenario):State {
 let s=initial(which!=='blank');if(which==='blank'||which==='normal')return s;
 const run=(actor:Actor,command:Command)=>{s=transition(s,actor,command);};
 run('host',{type:'create',request:sampleRequest()});run('host',{type:'service-pay'});run('platform',{type:'invite'});
 run('merchant-a',{type:'proposal-submit',proposal:sampleProposal('merchant-a')});run('merchant-b',{type:'proposal-submit',proposal:sampleProposal('merchant-b')});run('host',{type:'select',merchant:'merchant-a'});
 if(which==='age'){
  run('restaurant',{type:'arrange',time:'宴客當日 15:00–17:00'});run('merchant-a',{type:'ship'});run('merchant-a',{type:'deliver'});run('restaurant',{type:'receive'});
 }
 s.actor='restaurant';return s;
}
