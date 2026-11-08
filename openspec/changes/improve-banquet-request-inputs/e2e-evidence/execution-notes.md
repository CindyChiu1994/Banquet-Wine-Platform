# 測試執行紀錄

- 舊版快照在產品修改前，以建置預覽 4173、Asia/Taipei 及固定時鐘 2026/11/08 18:00，透過 Playwright MCP 公開 UI 建立。來源與原始資料見 `legacy-v1-origin.json`、`legacy-v1-state.json`。
- 共用 E2E 填表日期改為頁面時鐘在台北的當日加七個日曆日，避免固定日期過期。以舊版預覽執行既有填表案例，17 項檢查通過，無 console/page error；截圖見 `helper-baseline/E2E-001-request.png`。此為 helper 驗證，不計為新 change 的 E2E 通過。
- 初次舊版快照擷取遇到標籤定位差異，改用介面現有的「合作餐廳」combobox 角色定位後完成；未修改產品或規格。

## 第 0 輪實作與完整驗收

- 修改產品：`src/domain/banquet-date.ts`、`src/domain/model.ts`、`src/domain/model.test.ts`、`src/app/App.tsx`、`src/style.css`；`src/persistence/storage.ts` 僅加註歷史驗證說明，保持原驗證邏輯及保存版本。
- 同步修改 `scripts/e2e-case.js`、新增 MCP 專用 `scripts/banquet-input-e2e.js` 與結果登錄工具，更新 `docs/demo-runbook.md`。
- 首次明確選取 E2E-001、E2E-002、E2E-003、E2E-004、E2E-005、E2E-006、E2E-007、E2E-008、E2E-009、E2E-010、E2E-011，全數執行。
- E2E-001 首次因已填 textarea 的標籤文字包含值，精確標籤定位逾時；實際日期錯誤與保留輸入均正確。依 DOM 與可存取角色觀測，改用以料理標籤開頭的 textbox 角色定位，並重跑 E2E-001。已完成的共用 helper 任務 1.2 先重開再修改，後以新介面回歸驗證；未改產品或放寬驗收。
- E2E-002～E2E-011 均首次執行通過；產品修復迭代為 0。定位修正是測試程式修正，不計產品修復。
- 網路紀錄出現本機 Kaspersky 注入，已以 CDP initiator 的 main.js 來源辨識並保留完整原始紀錄；原始碼及建置無該網域。產品請求均為本機來源，無真實付款請求，所有案例 console/page error 為 0。
- 補充回歸執行原封存清單的 E2E-005（正常完成）、E2E-006（取消退款）、E2E-007（驗齡失敗），3/3 通過，83 項可觀測檢查；證據另存 `regression/`，未覆寫原封存結果。
- 單元測試 69/69 通過；TypeScript strict 與 Vite 正式建置通過。通過建置為 `index-CgM09UCs.js`、`index-DhFa1V4x.css`。
- 最終複核：11 個案例合計 214 項檢查、21 張必要截圖，全部存在、非空並已視覺複核；三條回歸另有 7 張截圖。OpenSpec 嚴格驗證及程式差異空白檢查通過，兩張流程圖與既有渲染原稿一致，文件連結可解析。
- 測試建立的隔離 context、MCP 頁面及本次啟動的 4173 預覽服務已關閉；原先由使用者要求啟動的 5173 開發服務保留。
