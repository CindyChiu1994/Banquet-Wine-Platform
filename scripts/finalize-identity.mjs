import {readFileSync,writeFileSync,readdirSync,statSync} from 'node:fs';
const base='openspec/changes/archive/2026-11-09-bind-host-identity-and-validate-proposal-integers/';
const results=Array.from({length:29},(_,i)=>JSON.parse(readFileSync('output/identity-e2e/E2E-'+String(i+1).padStart(3,'0')+'.json','utf8').replace(/^\uFEFF/,'')));
if(results.some(r=>r.status!=='PASS'||r.browserErrors.length))throw Error('Incomplete E2E');
const screenshots=[...new Set(results.flatMap(r=>r.screenshots))];
for(const f of screenshots)if(statSync(base+f).size===0)throw Error('Missing screenshot');
let doc=readFileSync(base+'e2e-testing.md','utf8');
if((doc.match(/^- \[x\] E2E-/gm)||[]).length!==29)throw Error('Checklist incomplete');
doc=doc.replace('此文件是實作後交由 Playwright MCP 執行的測試計畫，尚未執行；所有核取方塊維持未勾選。規劃文件或 Mermaid 渲染通過不等於功能測試通過。','本清單已於 2026/11/09 由 Playwright MCP 實際執行：29 通過、0 失敗、0 略過。各案例保留原步驟及預期結果，並附實際時間、觀察及截圖；規劃文件或 Mermaid 渲染本身不作為功能通過依據。');
doc=doc.replace('（此刻尚未建立）','（已由改版前 UI 建立並通過原版驗證）');
if(!doc.includes('## Execution Summary'))doc=doc.replace('## Traceability','## Execution Summary\n\n- 產品修復迭代：0 輪；首次產品實作已符合測試預期。測試工具校正了帶提示文字的欄位定位、載入後的角色切換及本機防護軟體注入的網路分類，均有重跑紀錄。\n- 本機 Kaspersky 注入請求已由 CDP initiator 確認，原始稽核位於 ../../../../output/identity-e2e/network-audit.json；產品請求均為本機來源，未呼叫真實支付。沒有未解決的 browser console 或 page error。\n- 91 張本次通過案例引用的非空 PNG 截圖位於 [e2e-evidence](e2e-evidence/)。舊的失敗診斷截圖保留，不代表目前仍失敗。\n- 詳細交付與驗證結果見 [implementation-report.md](implementation-report.md)。\n\n## Traceability');
writeFileSync(base+'e2e-testing.md',doc.replace(/^\uFEFF/,''));
const edited=['README.md','docs/demo-runbook.md','src/app/App.tsx','src/app/Checkout.tsx','src/domain/model.ts','src/domain/model.test.ts','src/domain/checkout.test.ts','src/persistence/storage.ts','src/persistence/legacy.ts','src/persistence/identity-migration.test.ts','src/persistence/v2-model.ts','src/persistence/v2-storage.ts','src/persistence/v1-legacy.ts','src/style.css','scripts/identity-progress.mjs','scripts/identity-e2e.js','scripts/record-identity-e2e.mjs'];
for(const p of edited){const s=readFileSync(p,'utf8');if(s.startsWith('\uFEFF'))writeFileSync(p,s.slice(1));}
const report='# Implementation Report\n\n'+
'Change：bind-host-identity-and-validate-proposal-integers；schema：spec-driven。2026/11/09 完成實作及 Playwright MCP 全清單驗證，已封存。\n\n'+
'## 已完成行為\n\n'+
'- 主人姓名與台灣手機／市話分機必填、送出前確認、送出後鎖名；簽收唯讀，領域層拒絕換名。\n'+
'- 姓名電話只提供主人、平台、指定餐廳；兩家酒商的概覽、簽收、歷程與退回原因不呈現聯絡值及原圖。\n'+
'- 容量、瓶數、單價安全正整數，運費非負整數、餐廳費300；草稿可未完成，正式不四捨五入。\n'+
'- v1/v2 純遷移至 v3；16 份改版前 UI 樣本保留。未簽未付舊單補填一次，原驗齡通過者另由餐廳核對；已簽／已付／異常資料及小數容量舊提交保持原值與紀錄。\n\n'+
'## 驗證結果\n\n| 項目 | 結果 |\n|---|---|\n| npm.cmd run test -- --run | 163/163 PASS，4 個檔案 |\n| npm.cmd run build | PASS，TypeScript strict + Vite |\n| Playwright MCP E2E | 29/29 PASS；FAIL 0；SKIP 0 |\n| 截圖證據 | 91 張本次案例引用 PNG，已核對存在、非空及 PNG 格式 |\n| 瀏覽器錯誤 | 0 個未解決 console/page error |\n| OpenSpec strict validate | PASS |\n\n'+
'測試分別使用 1366×768 桌機及 390×844 真正觸控事件、隔離瀏覽器、測試時鐘／時區與儲存失敗注入。原正式瀏覽器資料未被重設。姓名核對仍由餐廳人工處理；本版保留單一瀏覽器展示邊界。\n\n'+
'## 迭代與檔案範圍\n\n'+
'- 迭代0：初次實作，沒有進入實作前的失敗 E2E ID；變更 src/domain/model.ts、src/app/App.tsx、src/app/Checkout.tsx、src/persistence/{legacy,storage}.ts、src/style.css，新增凍結的舊版驗證模組與相容測試，更新 README 及展示手冊。選測 E2E-001 至 E2E-029 全部29項。\n'+
'- 產品修復迭代0輪。初次網路偵測失敗來自本機 Kaspersky 注入，已用 CDP initiator 稽核並分列；001–007 重跑。009 修正提示文字造成的標籤定位、021 補上載入後切換主人，原驗收條件未改。014、016、025、026 補齊快速重送、已過日期、預填修改及觸控重試後再次通過。\n'+
'- 實際 E2E 呼叫均使用 Playwright MCP browser_run_code_unsafe，從 scripts/identity-e2e.js 替換指定 case ID 及原始 v1/v2 fixtures 執行；不以直接 Playwright、原始碼檢查或 build 替代 E2E。結構化結果在 ../../../../output/identity-e2e/，每案時間、觀察與截圖連結在 e2e-testing.md。\n'+
'- 本次已同步主規格並完成 archive；維持本 change 範圍，已封存、未提交 git。\n\n'+
'## 文件與證據\n\n'+
'- [實作任務](tasks.md)\n- [已執行 E2E 清單](e2e-testing.md)\n- [截圖目錄](e2e-evidence/)\n- [原版 UI 樣本與回退](legacy/README.md)\n- [固定姓名](e2e-evidence/E2E-003-locked.png)\n- [餐廳核對關卡](e2e-evidence/E2E-016-pending-2.png)\n- [觸控簽名](e2e-evidence/E2E-026-signature-390.png)\n';
writeFileSync(base+'implementation-report.md',report);
console.log(JSON.stringify({pass:29,fail:0,skipped:0,screenshots:screenshots.length,checks:results.reduce((n,r)=>n+r.observations.length,0)}));
