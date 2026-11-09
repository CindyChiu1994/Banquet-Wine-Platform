# 宴遇｜宴客酒款媒合平台 Demo

這是一款旨在協助想以好酒宴請賓客、但不懂選酒且餐廳無提供 wine pairing 酒單、且對於宴客前自行攜酒至餐廳感到困擾的商務宴客人士能安心將選酒服務交給專業媒合平台。可切換宴客主人、平台、兩家酒商與合作餐廳，操作需求、提案、現場驗齡簽收付款、餐廳代收及酒商收清；所有付款與合作資料均為模擬。

## 規格迭代歷程

本專案以 OpenSpec 保存每次變更的原因、設計、規格差異、實作任務與驗收紀錄。以下依實際開發順序整理三個階段；各階段的規格與截圖反映當時版本，現行規格以 [openspec/specs](openspec/specs) 為準。

| 日期 | 階段與修改原因 | 主要變更 | 提案與驗收紀錄 |
| --- | --- | --- | --- |
| 2026-11-07 | 初版 Demo：將產品構想轉成可操作的課程展示 | 建立宴客需求、酒商提案比較、餐廳履約、現場購酒付款與異常處理流程 | [初版提案](openspec/changes/archive/2026-11-07-banquet-wine-platform-demo/proposal.md) · [E2E 驗收](openspec/changes/archive/2026-11-07-banquet-wine-platform-demo/e2e-testing.md) |
| 2026-11-08 | 改善需求輸入：測試發現日期限制不足、菜單無法分行 | 新需求至少提前三個日曆日預約；料理支援多行輸入與保存，同時維持舊訂單相容性 | [變更提案](openspec/changes/archive/2026-11-08-improve-banquet-request-inputs/proposal.md) · [E2E 驗收](openspec/changes/archive/2026-11-08-improve-banquet-request-inputs/e2e-testing.md) |
| 2026-11-09 | 調整現場服務：原流程需切換角色、互相等待，不符合桌邊服務情境 | 改為同裝置驗齡、簽收付款，加入付款失敗後餐廳代收與酒商確認收清；服務完成與收款狀態分開 | [變更提案](openspec/changes/archive/2026-11-09-streamline-onsite-signoff-payment/proposal.md) · [E2E 驗收](openspec/changes/archive/2026-11-09-streamline-onsite-signoff-payment/e2e-testing.md) |

閱讀每次變更時，可從 `proposal.md` 的 Why 與 What Changes 了解修改原因，再看 `design.md`、`specs/` 與 `e2e-testing.md` 追蹤設計、驗收條件及執行證據。Git 提交歷史亦保留各階段的實作與封存紀錄。

## 本機啟動

使用 Node.js 24，在此資料夾執行：

```powershell
npm.cmd ci
npm.cmd run dev
```

開啟 `http://127.0.0.1:5173/`。右欄「展示工具」提供空白需求、正常起點、餐廳取消前與驗齡前四個情境入口。載入或重設需確認，會取代目前展示資料。

## 驗證與建置

```powershell
npm.cmd run test -- --run
npm.cmd run build
npm.cmd run preview
```

建置預覽為 `http://127.0.0.1:4173/`，正式產物在 `dist/`。瀏覽器驗收透過 Playwright MCP 執行，案例結果與截圖見下方連結。

## 文件

- [現場簽收付款與餐廳代收變更](openspec/changes/archive/2026-11-09-streamline-onsite-signoff-payment/proposal.md)
- [本次 E2E 清單與執行結果](openspec/changes/archive/2026-11-09-streamline-onsite-signoff-payment/e2e-testing.md)
- [展示手冊與八分鐘腳本](docs/demo-runbook.md)
- [設計與六張操作流程圖](openspec/changes/archive/2026-11-07-banquet-wine-platform-demo/design.md)
- [E2E 清單及證據](openspec/changes/archive/2026-11-07-banquet-wine-platform-demo/e2e-testing.md)
- [追蹤任務](openspec/changes/archive/2026-11-07-banquet-wine-platform-demo/tasks.md)

本版採 React、TypeScript strict、Vite、原生 CSS 與 localStorage，資料僅保存在同一瀏覽器與網站來源。分潤 P0 僅計算金額並顯示待結算；酒商支付分潤與餐廳確認收款屬 P1。正式登入、跨裝置同步、真實交易與公開部署不在此次範圍。

同裝置客人畫面支援手寫簽名、清除重簽、模擬付款失敗與接續。餐廳承接代收即完成服務，餐廳應付酒商與分潤分開；選定酒商可記錄線下整筆收清，重複提交會提醒而不重複記帳。保存 key 仍為 `banquet-wine-demo:v1`，內容已升級為 `schemaVersion: 2`；有效 v1 單可遷移，已付酒款單不重付或補造簽名。讀取不立即覆寫，損壞資料不自動清除；回退舊程式需保留目前資料及原 v1 快照。角色切換是展示操作，localStorage 不提供正式多帳戶隔離或多分頁同步。

## 固定姓名、聯絡資料與舊單接續

- 新需求新增「姓名（下單及簽收人）」及「聯絡電話」，皆必填；預填資料僅為模擬。電話接受台灣手機、市話與分機，保留前導零。送出前核對姓名，確認後不可更名。
- 餐廳依固定姓名人工核對本人及年齡，簽收頁唯讀姓名。清除僅重畫筆畫，不開放更名；簽名與姓名文字均不等於正式帳戶、證件或筆跡驗證。
- 姓名電話只呈現給主人、平台及指定餐廳；兩家酒商（含獲選者）不見聯絡資料、署名或原圖，歷程及退回原因也不帶出這些值。
- 容量、瓶數、單價正式送出必須為安全正整數；配送費可為 0，餐廳費固定 300。草稿可空白或暫不合法，正式錯誤不四捨五入。歷史已提交／選定小數容量保持原值，重新提交必須新規則。
- v1/v2 有效資料自動純遷移到 v3，沿用原 key，首次讀取不覆寫。尚可履約未簽未付者，切宴客主人「補填聯絡資料」並「確認補填」，只允許成功補填一次；若原驗齡已通過，再由合作餐廳核對補填姓名，才交回主人簽名。原驗齡、配送及費用不重跑。
- 已簽、已付或異常舊單保留署名、快照、款項與原進度，不強迫補填／重簽／重付。已簽舊單主動重簽仍固定歷史署名。取消或退回不重新開啟正常履約。
- 新單姓名不符在驗齡登錄未通過；已驗齡舊單在獨立姓名核對登錄未通過，保留原驗齡並記姓名不符退回。兩者服務費 500 不退、主人新增應付 0、退運平台負擔，不可更名重驗，僅選定酒商可確認取回。
- 四入口仍先確認取代資料：空白姓名電話未填、正常有可修改示範預填、取消前／驗齡前已具固定聯絡資料與合法前置。
- 原版相容樣本與回退說明位於 openspec/changes/archive/2026-11-09-bind-host-identity-and-validate-proposal-integers/legacy/README.md。回退先備份，不把 v3 版本號直接改成舊版，也不以重設掩蓋遷移失敗。
