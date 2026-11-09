# 實作與驗證摘要

變更：`streamline-onsite-signoff-payment`，2026/11/09。

## 規格對照

| 能力 | 實作位置 | 驗證 |
|---|---|---|
| 選定後未獲選酒商停止取得後續資訊 | `src/domain/model.ts` 的 `orderForActor` 與命令授權、`src/app/App.tsx` 空狀態 | E2E-016 的 216 項觀察、甲乙對稱與領域檢視測試 |
| 同裝置本人驗齡、明細與手寫簽名 | `src/app/Checkout.tsx`、`SignaturePad.tsx` 與領域快照驗證 | E2E-001、002、010、012 |
| 模擬付款成功立即完成、失敗可重試 | `transition`、`finish` 與單次保存 | E2E-001、003、011、013；無真實金流 |
| 餐廳承接／拒絕、全額應付款 | 獨立 `collection`、交還與店員確認畫面 | E2E-004、005、006、011 |
| 酒商收清與重複提示 | 指定酒商命令與帳款卡片 | E2E-006、013；全額、時間、角色不重複 |
| 分潤兩路徑均建立且不抵銷 | `finish`、分潤與帳款各自呈現 | E2E-001、005、006、013；6000 酒款、6200 帳款、600 分潤 |
| 主人取消與驗齡失敗分開退回 | `returnReason`、取消確認、原取回與成本流程 | E2E-007、008、009、015 |
| 簽名／帳款接續與舊單相容 | `src/persistence/storage.ts`、`legacy.ts`，v1 原始快照 | E2E-003、005、006、011、014；領域與保存測試 |

## 結果

`npm.cmd run test -- --run`：106/106；`npm.cmd run build`：通過。Playwright MCP：16 通過、0 失敗、0 跳過，共 64 張必要截圖，沒有未解決產品瀏覽器錯誤。產品修復迭代為 0；定位及環境判讀修正見 [執行紀錄](e2e-evidence/execution-notes.md)。

唯一完整案例定義與勾選結果：[e2e-testing.md](e2e-testing.md)。逐案實測資料：[summary.json](e2e-evidence/summary.json)，原始檔檢查：[evidence-audit.json](e2e-evidence/evidence-audit.json)。原主規格與封存歷史不在 apply 階段同步或改寫；本 change 尚未封存。

保存格式為 v2、storage key 沿用 v1；同一瀏覽器與來源可接續，跨來源、跨裝置及正式帳戶隔離不在本次範圍。完成後退款／退酒與部分收款仍未提供，符合已確認範圍。
