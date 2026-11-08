# Tasks

本清單追蹤 apply 實作及驗收，勾選代表已完成該項指定驗證。規格見 `specs/`，技術決策與流程圖見 `design.md`；E2E 案例的唯一來源為 `e2e-testing.md`。

## 1. 保存相容性基準與可重複測試資料

- [x] 1.1 在任何程式修改前，依 `e2e-testing.md` 的 Test Setup 留存舊版相容性基準；驗證原始快照、來源版本及 UI 建立紀錄齊全且可讀，未修改快照欄位。
- [x] 1.2 調整 `scripts/e2e-case.js` 的共用日期資料，移除固定宴客日期並採測試時鐘下的台北相對日期；以搜尋確認固定值已移除，並用既有填表入口確認可建立需求，將執行時間／時區策略記於本 change 的測試執行紀錄。

## 2. 台北日期規則與載入相容性

- [x] 2.1 在領域層建立共用台北日曆日期工具，處理建立下限與七天後預填值；同步在 `src/domain/model.test.ts` 加入邊界、月底、年底、閏日及不同裝置日期的測試，執行 `npm.cmd run test -- --run` 通過。
- [x] 2.2 將建立命令的日期門檻與一般資料驗證分開，保持 `src/persistence/storage.ts` 的讀取相容性；同步加入建立命令、拒絕時原狀態不變及歷史資料保存還原的領域測試，執行單元測試通過，確認 key 與 schemaVersion 無變動。
- [x] 2.3 更新 `docs/demo-runbook.md` 的日期計算、時鐘基準及舊訂單相容性說明；逐項比對 `design.md` 決策及本組測試，確認文件與實際算法一致。

## 3. 表單與需求摘要

- [x] 3.1 在 `src/app/App.tsx` 接上日期下限、準備期提示及跨日提交後的提示更新，維持領域驗證與表單輸入狀態一致；以 `npm.cmd run build` 及本 change 的 E2E 清單驗證完成。
- [x] 3.2 將料理欄位改為多行輸入，調整 `src/style.css` 與共用摘要保留換行及長字串折行；同步補上多行字串與空白驗證的必要領域測試，以單元測試、建置及本 change 的 E2E 清單驗證完成。
- [x] 3.3 更新 `docs/demo-runbook.md` 的填表與多行料理操作說明，加入本 change 驗收文件連結；核對標籤與實際畫面一致、連結可解析，保留原封存驗收歷史。

## 4. 整合驗收

- [x] 4.1 在所有修改完成後執行 `npm.cmd run test -- --run` 與 `npm.cmd run build`；確認單元測試、TypeScript strict 及 Vite 建置全部通過。
- [x] 4.2 使用 Playwright MCP 執行本 change 的 `e2e-testing.md` 全部清單，僅將實際驗證通過項目勾選，修正失敗後重驗受影響範圍；以完整執行紀錄與清單狀態驗證完成。
- [x] 4.3 使用修正後的既有 E2E 共用資料執行原清單的正常、取消退款及驗齡失敗整合回歸，結果放本 change 的 `e2e-evidence/regression/`；確認沒有未解決的流程退化，不改寫封存清單的歷史結果。
- [x] 4.4 複核變更差異、規格對應及操作手冊，執行 `openspec.cmd validate improve-banquet-request-inputs --strict`，確認驗收紀錄與實作一致、流程圖仍有效且沒有意外資料格式或封存文件修改。
