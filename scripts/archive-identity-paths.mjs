import {readFileSync,writeFileSync,existsSync,realpathSync} from 'node:fs';
import {resolve,sep} from 'node:path';
const name='bind-host-identity-and-validate-proposal-integers';
const oldRel='openspec/changes/'+name;
const newRel='openspec/changes/archive/2026-11-09-'+name;
const root=realpathSync('.'),archive=realpathSync(newRel),changes=realpathSync('openspec/changes');
if(!archive.startsWith(changes+sep)||!existsSync(archive+'/.openspec.yaml'))throw Error('Archive path not verified');
const update=(p,fn)=>{const absolute=resolve(p);if(!absolute.startsWith(root+sep))throw Error('Outside workspace');const before=readFileSync(p,'utf8'),after=fn(before);if(after!==before)writeFileSync(p,after);};
for(const p of ['src/persistence/identity-migration.test.ts','README.md','docs/demo-runbook.md','scripts/identity-e2e.js','scripts/record-identity-e2e.mjs','scripts/finalize-identity.mjs'])update(p,s=>s.replaceAll(oldRel,newRel));
update('scripts/finalize-identity.mjs',s=>s.replaceAll('../../../output/','../../../../output/').replaceAll('未封存','已封存').replaceAll('未改主規格或 archive 檔案','本次已同步主規格並完成 archive'));
update(newRel+'/e2e-testing.md',s=>s.replaceAll('../archive/2026-11-09-streamline-onsite-signoff-payment/','../2026-11-09-streamline-onsite-signoff-payment/').replaceAll('../../../output/','../../../../output/'));
update(newRel+'/legacy/README.md',s=>s.replaceAll('../../archive/2026-11-09-streamline-onsite-signoff-payment/','../../2026-11-09-streamline-onsite-signoff-payment/'));
update(newRel+'/implementation-report.md',s=>{
 s=s.replaceAll('../../../output/','../../../../output/');
 const damaged=s.indexOf('\n## ????');if(damaged>=0)s=s.slice(0,damaged);
 return s.trimEnd()+'\n\n## 封存狀態\n\n本文件上方記錄實作交付當時的狀態。2026/11/09 已依使用者確認同步四份主規格並封存至 '+newRel+'。25/25 任務完成，原 E2E 29/29 通過紀錄與截圖保留。測試夾具及文件引用已更新至封存位置；最新封存驗證見 [archive-report.md](archive-report.md)。\n';
});
console.log(JSON.stringify({archive:newRel,fixtureImportUpdated:readFileSync('src/persistence/identity-migration.test.ts','utf8').includes(newRel),metadataPreserved:existsSync(newRel+'/.openspec.yaml')}));
