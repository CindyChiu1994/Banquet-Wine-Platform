import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const change='streamline-onsite-signoff-payment',file=`openspec/changes/${change}/tasks.md`;
for(const id of process.argv.slice(2)){
 if(!/^\d+\.\d+$/.test(id))throw Error('Invalid task');
 const before=fs.readFileSync(file,'utf8'),line=before.split(/\r?\n/).find(s=>s.startsWith(`- [ ] ${id} `));if(!line)throw Error('Task is missing or already done: '+id);
 fs.writeFileSync(file,before.replace(line,line.replace('- [ ]','- [x]')));
 const r=spawnSync('openspec.cmd',['instructions','apply','--change',change,'--json'],{encoding:'utf8',shell:true,windowsHide:true});if(r.status!==0)throw Error(r.stderr);const data=JSON.parse(r.stdout);console.log(JSON.stringify({task:id,progress:data.progress}));
}
