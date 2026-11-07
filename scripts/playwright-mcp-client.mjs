// A line-oriented JSON-RPC client for the installed, genuine Playwright MCP server.
// Browser operations are tools/call requests, not a direct Playwright substitute.
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const cli = join(homedir(), 'AppData/Local/Programs/nodejs/node_modules/@playwright/mcp/cli.js');
const child = spawn(process.execPath,[cli,'--headless','--browser','chrome','--isolated','--viewport-size','1366x768'],{cwd:process.cwd(),windowsHide:true,stdio:['pipe','pipe','inherit']});
let id=0;
const pending=new Map();
createInterface({input:child.stdout}).on('line',line=>{
 try {const data=JSON.parse(line);if(data.method==='roots/list'){child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:data.id,result:{roots:[{uri:pathToFileURL(process.cwd()+'/').href,name:'banquet-demo'}]}})+'\n');return;} if(data.id!==undefined&&pending.has(data.id)){const {resolve,reject}=pending.get(data.id);pending.delete(data.id);data.error?reject(data.error):resolve(data.result);}}catch{console.error(line);}
});
const send=(method,params)=>new Promise((resolve,reject)=>{const requestId=++id;pending.set(requestId,{resolve,reject});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:requestId,method,params})+'\n');});
await send('initialize',{protocolVersion:'2024-11-05',capabilities:{roots:{listChanged:true}},clientInfo:{name:'banquet-demo-review',version:'1.0.0'}});
child.stdin.write(JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})+'\n');
console.log(JSON.stringify({ready:true,tools:(await send('tools/list',{})).tools.map(t=>t.name)}));
for await(const line of createInterface({input:process.stdin})) {
 try {const req=JSON.parse(line);if(req.method==='close'){await send('tools/call',{name:'browser_close',arguments:{}});child.kill();process.exit(0);}if(req.case){if(!/^E2E-\d{3}$/.test(req.case))throw Error('Invalid case id');req.name='browser_run_code_unsafe';req.arguments={code:readFileSync('scripts/e2e-case.js','utf8').replace('__CASE_ID__',req.case)};}const result=await send('tools/call',{name:req.name,arguments:req.arguments??{}});const compact={...result,content:result.content?.filter(c=>c.type!=='image')};if(req.case){mkdirSync('output/mcp-results',{recursive:true});writeFileSync(`output/mcp-results/${req.case}.json`,JSON.stringify(compact,null,2));}console.log(JSON.stringify(compact));}catch(error){console.log(JSON.stringify({clientError:String(error)}));}
}
child.kill();
