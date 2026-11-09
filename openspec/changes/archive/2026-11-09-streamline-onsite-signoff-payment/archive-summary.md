# 封存紀錄

- 變更：`streamline-onsite-signoff-payment`
- Schema：`spec-driven`
- 封存日期：2026/11/09（Asia/Taipei）
- 封存位置：`openspec/changes/archive/2026-11-09-streamline-onsite-signoff-payment/`
- 完整性：5/5 規劃產出物完成、25/25 任務完成，沒有未完成項目。
- 使用者選擇：同步差異規格至主規格後封存。

## 主規格同步

| 主規格 | 新增需求 | 修改需求 | 同步結果 |
|---|---:|---:|---|
| banquet-matching | 0 | 1 | 已比對一致 |
| demo-workspace | 3 | 3 | 已比對一致 |
| restaurant-collection | 5 | 0 | 建立新主規格，Purpose 沿用差異規格原文 |
| restaurant-fulfillment | 2 | 4 | 已比對一致 |
| restaurant-revenue-share | 0 | 4 | 已比對一致 |
| service-exceptions | 1 | 3 | 已比對一致 |

共新增 11 項、修改 15 項，沒有移除或重新命名。所有差異來源均取自 OpenSpec status 的 `artifactPaths.specs.existingOutputPaths`；保留既有標題、Purpose、未涉及需求與情境，主規格不含差異操作標題。封存前已逐份確認新增及修改完整反映，且六份主規格嚴格驗證通過。

## 移動與引用維護

已保留 `.openspec.yaml`、規格、流程圖、任務、原始 v1 快照及完整測試證據。README、展示手冊、兩份測試的 fixture 匯入及四份驗收／證據腳本已改用封存路徑；活躍任務標記工具僅適用尚未封存的 change，不用來改寫本封存任務。

## 封存後檢查

- `openspec list --json`：活躍變更為空。
- `openspec validate --specs --strict`：六份主規格通過。
- `npm.cmd run test -- --run`：106/106 通過。
- `npm.cmd run build`：TypeScript strict 與 Vite 建置通過。
- 既有 Playwright MCP 結果為 16/16，64 張必要原始 PNG 及檔案雜湊均保留；此輪只變更規格與引用路徑，未重新執行瀏覽器案例。

本紀錄不表示另建 Git commit；實作已在 `ceb4edb`，封存與同步結果是該 commit 之後的工作目錄變更。
