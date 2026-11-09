import {readFileSync,writeFileSync,statSync} from 'node:fs';
const id=process.argv[2];if(!/^E2E-\d{3}$/.test(id))throw Error('Invalid ID');
const base='openspec/changes/archive/2026-11-09-bind-host-identity-and-validate-proposal-integers/';
const result=process.argv[3]?JSON.parse(Buffer.from(process.argv[3],'base64').toString('utf8')):JSON.parse(readFileSync('output/identity-e2e/'+id+'.json','utf8').replace(/^\uFEFF/,''));
if(result.id!==id)throw Error('Result ID mismatch');
if(process.argv[3])writeFileSync('output/identity-e2e/'+id+'.json',JSON.stringify(result,null,2));
if(result.status==='PASS'){if(!result.screenshots.length||result.browserErrors.length)throw Error('Missing evidence or browser errors');for(const p of result.screenshots)if(statSync(base+p).size===0)throw Error('Empty evidence');}
let doc=readFileSync(base+'e2e-testing.md','utf8');
const pattern=new RegExp('^- \\[[ x]\\] '+id+' [\\s\\S]*?(?=^- \\[[ x]\\] E2E-|^## |$(?![\\s\\S]))','m');
const match=doc.match(pattern);if(!match)throw Error('Case not found');
let block=match[0].replace(/^  - \*\*(?:Last run|Screenshot evidence|Observed evidence|Failure):\*\*.*\r?\n/gm,'');
block=block.replace(/^- \[[ x]\]/,result.status==='PASS'?'- [x]':'- [ ]');
const at=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei',dateStyle:'short',timeStyle:'short'}).format(new Date());
const fields='  - **Last run:** '+at+' Asia/Taipei — '+result.status+'\n'+
 (result.screenshots.length?'  - **Screenshot evidence:** '+result.screenshots.map(p=>'['+p+']('+p+')').join('、')+'\n':'')+
 (result.status==='PASS'?'  - **Observed evidence:** '+result.observations.join('；').replace(/\n/g,' ')+'；browser errors: 0。\n':'  - **Failure:** '+(result.error??'Unknown')+'. '+(result.visibleText??'').slice(-500).replace(/\n/g,' ')+'\n');
block=block.replace(/(  - \*\*Evidence:\*\*.*\r?\n)/,'$1'+fields);
doc=doc.replace(match[0],block);writeFileSync(base+'e2e-testing.md',doc);
console.log(id+' '+result.status+' '+result.screenshots.length+' screenshots');
