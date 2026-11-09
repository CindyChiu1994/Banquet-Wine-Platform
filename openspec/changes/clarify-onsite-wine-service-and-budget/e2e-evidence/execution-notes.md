# 執行紀錄

2026-11-09，Playwright MCP Chrome，固定 http://127.0.0.1:5173/。每案獨立context，從可見UI建立前置；只有LEGACY與儲存故障依計畫匯入完整樣本或故障注入。所有context執行後關閉。執行來源保存在 [service-e2e-case.mjs](../../../../scripts/service-e2e-case.mjs)，透過MCP browser_run_code_unsafe呼叫buildCase產生的函式；不是直接Playwright替代品。

最終26／26通過，0失敗、0跳過。395項觀察，71張本次必要截圖，逐案JSON及勾選結果可追溯；舊failure.png為先前測試定位／修復證據，不計入71張必要證據。完整案例、步驟與預期以唯一[e2e-testing.md](../e2e-testing.md)為準。

## 修復

| 輪次 | 進入修復案例 | 證據／原因 | 修改／重測 |
|---|---|---|---|
| 1 | E2E-002 | 截圖發現ProposalForm仍殘留唯讀300元欄位；原自動金額斷言不足以發現 | 重開2.3，移除App.tsx欄位，加上無欄位斷言；重測002、003、005通過 |
| 2 | E2E-022 | 歷史預算標章未用文件指定文字 | 重開5.3，App.tsx統一「歷史建議書・沿用原預算規則」；重測022、021通過 |

其餘初次失敗為測試定位或測試資料選取：Field的可及名稱包含提示及select選項，改以可見標籤部分匹配；over-budget樣本超額的是甲，改選甲測重新提交。無修改預期、規格或產品規則來迎合測試。

## 瀏覽器與資料

- 最終各案page／console error均為0。Network唯一外部來源為本機Kaspersky注入；[CDP診斷](network-diagnostic.json)顯示init與session請求由其main.js觸發。產品原始碼未包含該來源，不是金流或產品API。
- E2E-020涵蓋1366×768與390×844，兩者無水平溢出；手機簽名使用CDP原生TouchEvent而非直接寫入筆畫，完成清除重簽、付款失敗與交回店員。
- E2E-021實際匯入42個manifest完整v1/v2/v3樣本，檢查初讀不寫回；再實走補填核對、核對失敗取回、沿用舊簽名支付及舊代收收清。原hash及金額時間見[manifest](../e2e-fixtures/manifest.md)，精確往返由44項service-migration測試補足。
- 各角色矩陣在直接完成、代收待付、收清、取消及部分成交逐一切換及重整；測試不把localStorage可讀性當正式權限隔離。
- 截圖已檢查檔案存在、非空，並以同期DOM／狀態觀察對應畫面；人工複核報價阻擋、揭價、減量及桌機／手機警語與購買畫面。

單元測試8檔243項、TypeScript strict＋Vite build及OpenSpec strict皆通過。測試未涉及真實支付或正式授權驗證；本結果不是法律核可。
