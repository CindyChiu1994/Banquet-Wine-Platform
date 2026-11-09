# Proposal

## Why

「宴遇」目前未在宴客需求收集姓名與電話，簽名頁又允許另填姓名，無法維持下單、餐廳核對本人與簽收的一致性。提案容量仍接受小數；新增限制也必須避免破壞既有訂單、簽名與付款紀錄。

## What Changes

- 新需求新增必填姓名及聯絡電話；支援台灣手機、市話與分機，允許空格及連字號。送出前提示確認姓名，送出即鎖定，供後續本人核對及唯讀簽收使用。
- 餐廳核對姓名與本人不符時，記錄未通過原因並走既有待退回流程；不提供現場更名、代簽或失敗後重驗。
- 姓名及電話僅呈現給主人、平台及該單指定餐廳，兩家酒商（含獲選者）均不可見，包含簽收紀錄、歷程與其他衍生介面。
- **BREAKING**：新建需求缺姓名或電話不得提交；新送出提案的容量、瓶數、單價必須為正整數，配送費為非負整數，餐廳費用仍固定 300 元。草稿可不完整，錯誤不得四捨五入後送出。
- 有效舊單保留：未簽收且仍可履約者由主人補填一次再鎖定；若已驗齡通過，指定餐廳須核對補填姓名才可簽名，沿用原驗齡結果。已簽收／付款者保留原紀錄，不重簽、不重付。
- 舊單已送出／已選定的小數容量提案保留原值；尚未送出的草稿下次正式送出須套用新規則。取消、退回與完成狀態不因補資料重新開啟。

## Capabilities

### New Capabilities

無；擴充既有能力，不另建平行能力。

### Modified Capabilities

- [banquet-matching](specs/banquet-matching/spec.md)：新增必填聯絡資料、送出鎖名及提案整數規則，維持既有日期、料理及媒合限制。
- [restaurant-fulfillment](specs/restaurant-fulfillment/spec.md)：餐廳以需求姓名核對本人，簽名綁定固定姓名；定義已驗齡未簽名舊單的核對關卡。
- [demo-workspace](specs/demo-workspace/spec.md)：聯絡資料依角色呈現、v1/v2 相容遷移、一次補填與舊提案保留、展示及保存失敗處理。
- [service-exceptions](specs/service-exceptions/spec.md)：姓名不符沿用未通過退回分支及費用責任，阻止更名後恢復履約。

## Impact

- 領域：`src/domain/model.ts` 的 Request、命令、簽名有效性、本人核對及提案驗證；補填與核對須有角色／狀態限制及冪等性。
- 介面：`src/app/App.tsx`、`src/app/Checkout.tsx` 的表單、確認提示、唯讀姓名及角色檢視；不可只隱藏共用概覽上的兩個欄位。
- 保存：`src/persistence/storage.ts`、`src/persistence/legacy.ts` 的來源版本驗證與遷移；保留 storage key 及原交易資料。
- 展示與驗證：`src/demo/scenarios.ts`、領域／保存測試、README 與 `docs/demo-runbook.md`；提供可由 Playwright MCP 執行的自然語言 E2E 清單。
- 本案延續現有純前端 Demo（React、TypeScript strict、Vite、原生 CSS、npm、localStorage），不新增後端、資料庫、正式登入、簡訊、真實支付或訂單歷史／重新開單功能；不改變其他專案的預設技術棧。
