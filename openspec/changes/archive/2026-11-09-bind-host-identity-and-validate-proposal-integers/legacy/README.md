# 改版前 UI 相容樣本

2026/11/09 以 Playwright MCP 操作未改版 v2 公開介面擷取，使用隔離瀏覽器，未直接改寫 status、付款、簽名或版本。擷取程式見 capture-v2.js；合法性另由原版 validState 驗證。

| 樣本 | 原始進度 |
|---|---|
| age / signature | 已收貨待驗齡／驗齡通過未簽 |
| signed / failed | 滑鼠手寫簽名，署名「舊版展示主人」，快照 6000 + 200；待付／付款失敗 |
| collection / collected | 餐廳承接代收／酒商收清，分潤 600 待結算 |
| online | 線上付款且完成 |
| cancel-pending / cancelled | 餐廳無法安排收貨，待退款／已退款 |
| return-pending / returned | 驗齡未過待取回／已取回 |
| decimal-draft / decimal-submitted / decimal-selected / decimal-age | 原 UI 合法容量 750.5，草稿／已提交／已選定／已收貨 |
| blank-draft | 酒款名稱已填，其餘數字空白，原 JSON 為 null |

v1 只讀引用 ../../2026-11-09-streamline-onsite-signoff-payment/legacy/fixtures.json。不得修改 archive。

## 還原與回退

僅在隔離瀏覽器把原 JSON 放回 banquet-wine-demo:v1，再由公開 UI 接續。讀取先用原版本規則驗證，純遷移後不立即覆寫；成功操作才保存 v3。未簽未付可履約者補填一次；原驗齡已通過者另待餐廳核對姓名。已簽、已付及異常舊單保留；小數容量例外限定原提交內容。

回退先保留當前 v3 與原始備份。舊程式不能讀 v3，不可僅改版本號；只在隔離展示環境以原備份還原。
