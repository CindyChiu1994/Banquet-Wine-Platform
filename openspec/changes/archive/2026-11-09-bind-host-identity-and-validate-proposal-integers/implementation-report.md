# Implementation Report

Change：bind-host-identity-and-validate-proposal-integers；schema：spec-driven。2026/11/09 完成實作及 Playwright MCP 全清單驗證，未封存。

## 已完成行為

- 主人姓名與台灣手機／市話分機必填、送出前確認、送出後鎖名；簽收唯讀，領域層拒絕換名。
- 姓名電話只提供主人、平台、指定餐廳；兩家酒商的概覽、簽收、歷程與退回原因不呈現聯絡值及原圖。
- 容量、瓶數、單價安全正整數，運費非負整數、餐廳費300；草稿可未完成，正式不四捨五入。
- v1/v2 純遷移至 v3；16 份改版前 UI 樣本保留。未簽未付舊單補填一次，原驗齡通過者另由餐廳核對；已簽／已付／異常資料及小數容量舊提交保持原值與紀錄。

## 驗證結果

| 項目 | 結果 |
|---|---|
| npm.cmd run test -- --run | 163/163 PASS，4 個檔案 |
| npm.cmd run build | PASS，TypeScript strict + Vite |
| Playwright MCP E2E | 29/29 PASS；FAIL 0；SKIP 0 |
| 截圖證據 | 91 張本次案例引用 PNG，已核對存在、非空及 PNG 格式 |
| 瀏覽器錯誤 | 0 個未解決 console/page error |
| OpenSpec strict validate | PASS |

測試分別使用 1366×768 桌機及 390×844 真正觸控事件、隔離瀏覽器、測試時鐘／時區與儲存失敗注入。原正式瀏覽器資料未被重設。姓名核對仍由餐廳人工處理；本版保留單一瀏覽器展示邊界。

## 迭代與檔案範圍

- 迭代0：初次實作，沒有進入實作前的失敗 E2E ID；變更 src/domain/model.ts、src/app/App.tsx、src/app/Checkout.tsx、src/persistence/{legacy,storage}.ts、src/style.css，新增凍結的舊版驗證模組與相容測試，更新 README 及展示手冊。選測 E2E-001 至 E2E-029 全部29項。
- 產品修復迭代0輪。初次網路偵測失敗來自本機 Kaspersky 注入，已用 CDP initiator 稽核並分列；001–007 重跑。009 修正提示文字造成的標籤定位、021 補上載入後切換主人，原驗收條件未改。014、016、025、026 補齊快速重送、已過日期、預填修改及觸控重試後再次通過。
- 實際 E2E 呼叫均使用 Playwright MCP browser_run_code_unsafe，從 scripts/identity-e2e.js 替換指定 case ID 及原始 v1/v2 fixtures 執行；不以直接 Playwright、原始碼檢查或 build 替代 E2E。結構化結果在 ../../../../output/identity-e2e/，每案時間、觀察與截圖連結在 e2e-testing.md。
- 未改主規格或 archive 檔案；維持本 change 範圍，未封存、未提交 git。

## 文件與證據

- [實作任務](tasks.md)
- [已執行 E2E 清單](e2e-testing.md)
- [截圖目錄](e2e-evidence/)
- [原版 UI 樣本與回退](legacy/README.md)
- [固定姓名](e2e-evidence/E2E-003-locked.png)
- [餐廳核對關卡](e2e-evidence/E2E-016-pending-2.png)
- [觸控簽名](e2e-evidence/E2E-026-signature-390.png)

## 封存狀態

本文件上方記錄實作交付當時的狀態。2026/11/09 已依使用者確認同步四份主規格並封存至 openspec/changes/archive/2026-11-09-bind-host-identity-and-validate-proposal-integers。25/25 任務完成，原 E2E 29/29 通過紀錄與截圖保留。測試夾具及文件引用已更新至封存位置；最新封存驗證見 [archive-report.md](archive-report.md)。
