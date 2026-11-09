# 服務資料開放與標籤調整驗收

2026-11-09使用者後續確認：服務費未付／平台未邀請時，酒商與餐廳不可取得本次服務；餐廳另須等主人選定酒商。酒商建議書四欄移除序號，保留各酒款區塊標題辨識多品項。

## 結果

- 全套Vitest：8個檔案、250項通過；TypeScript strict及Vite正式build通過。
- Playwright MCP隔離context：29項觀察全數通過，0個page／console error。未動使用者測試資料。
- 未付款及已付未邀請：逐一切換甲、乙、合作餐廳並重新整理，沒有概覽DOM、服務內容、個資、費用側欄或歷程。
- 已邀請及兩份建議書到齊但未選定：酒商可編輯自己的建議書，合作餐廳仍無服務資料。
- 選定甲後餐廳可看服務並安排，甲維持可讀，未獲選乙仍無後續資料。領域測試另驗證反向選乙的對稱性與非法操作不改狀態。
- 單款與兩款的四個標籤均無序號；第二列資料保存、重整及正式提交正常。
- 精確步驟與觀察：[JSON](visibility-followup.json)；重跑原始碼：[Playwright MCP函式](../../../../scripts/visibility-followup.playwright.js)。

## 截圖

- [visibility-unpaid-hidden.png](visibility-unpaid-hidden.png)
- [visibility-paid-uninvited-hidden.png](visibility-paid-uninvited-hidden.png)
- [visibility-restaurant-wait-selection.png](visibility-restaurant-wait-selection.png)
- [visibility-proposal-labels.png](visibility-proposal-labels.png)
- [visibility-restaurant-selected.png](visibility-restaurant-selected.png)

本次沿用原先開發伺服器，驗證結束僅關閉新建的隔離context，保留伺服器供使用者測試。先前26案、243項單元測試與71張截圖為原驗收歷史，本次追加結果不冒稱重跑全部26案。
