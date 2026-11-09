import {readFileSync,writeFileSync} from 'node:fs';
import {execSync} from 'node:child_process';
const name='bind-host-identity-and-validate-proposal-integers';
const instructions=()=>JSON.parse(execSync('openspec.cmd instructions apply --change '+name+' --json',{encoding:'utf8',windowsHide:true}));
for(const id of process.argv.slice(2)){
 if(!/^\d+\.\d+$/.test(id))throw Error('Invalid task');
 const before=instructions(),task=before.tasks.find(t=>t.description.startsWith(id+' '));
 if(!task)throw Error('Task not found');if(task.done){console.log(id+' already complete');continue;}
 const lines=readFileSync(task.sourcePath,'utf8').split(/\r?\n/);
 if(lines[task.line-1]!=='- [ ] '+task.description)throw Error('Task source changed');
 lines[task.line-1]='- [x] '+task.description;writeFileSync(task.sourcePath,lines.join('\n'));
 const after=instructions();if(!after.tasks.find(t=>t.description===task.description)?.done||after.progress.complete!==before.progress.complete+1)throw Error('Progress did not change');
 console.log(id+' complete: '+after.progress.complete+'/'+after.progress.total);
}
