# 執行紀錄

2026/11/09，使用本機 Vite 開發服務 `http://127.0.0.1:5173/`，全部瀏覽器操作經已連接的 Playwright MCP `browser_run_code_unsafe` 執行。`scripts/signoff-e2e.js` 為執行器，驗收定義仍以 `../e2e-testing.md` 為準；每案使用獨立 context 並於結束時關閉，清除該案的隔離儲存與故障注入，不修改使用者的展示資料。

重跑時先把執行器中的 `__CASE_ID__` 換成指定 E2E ID，將 `__LEGACY_FIXTURES__` 換成 `../legacy/fixtures.json` 的 JSON（只有 014、016 需要，其他可用空物件），再以 MCP 的 `code` 參數送出函式；不以未替換的範本直接執行。回傳結果保存為同名 `E2E-NNN-result.json`，再由 `scripts/record-signoff-e2e.mjs` 核對檔案及更新勾選。

## 最終結果

- 16/16 E2E 通過、0 失敗、0 跳過，541 項觀察，必要原始 PNG 共 64 張。
- 單元測試 106/106 通過；TypeScript strict 與 Vite 正式建置通過。
- 產品修復迭代 0。初次實作後的瀏覽器失敗均為執行器定位或環境流量分類問題，沒有因此改動產品或降低驗收標準。
- 原始快照 10 種均由修改前的原版公開 UI 經 MCP 建立，見 `../legacy/`，未手改為成功狀態。新版對已付舊單不重付、不補造簽名；過期日期仍可載入。
- 每個通過案例的 console/page error 為 0。儲存故障注入用於測試保存失敗，失敗及恢復截圖均保留。

## 執行器修正與環境判讀

初輪 E2E-001、003、004 使用完整精確 label 定位下拉控制項，因包覆式 label 的文字包含選項而逾時；E2E-009 同樣定位驗齡下拉；E2E-016 定位預填 textarea 時也遇到精確 label 差異。依實際可見控制項與 accessibility 語意改用具名稱的 combobox／textbox 定位。E2E-002 初輪把防護軟體注入的啟動 script 誤判為產品外部呼叫；CDP 顯示啟動 `main.js` 由 parser 載入、後續流量由該 script 發起，已保留完整 URL 與 initiator。產品原始碼沒有該主機，也沒有真實金流呼叫。原始失敗與當時圖片保留於 `initial/`，不是最終通過證據。

E2E-016 新增交還裝置期間的檢查：代收待確認畫面沒有全域角色入口，也沒有直接承接按鈕。此時不能用頁面上的角色切換冒充另一家酒商；對未獲選身分直接讀取同一待確認／店員核對狀態的限制，另由 `src/domain/checkout.test.ts` 的領域檢視測試驗證。其餘可切換角色的流程狀態、甲乙對稱、正常及取消／退回分支與全部舊快照，均經 UI 切換、重新整理驗證。

E2E-013 在實際完成收清後再次按收款確認，親自觀察「此筆款項已收清，無需重複確認。」；不是以按鈕消失代替提醒。原金額、時間、操作者與事件數量都保持相同。同 operation ID 重送及無 UI 入口的非法命令仍由領域測試驗證，不冒稱為瀏覽器直接操作。

## 證據核對

`summary.json` 為逐案摘要；`evidence-audit.json` 記錄每張必要 PNG 的大小、像素與 SHA-256。已用 Pillow 開啟並驗證全部檔案，再檢視四張聯絡表與觸控付款、重複收清提醒、未獲選空狀態等原圖。聯絡表僅供審閱，不取代原始證據。檢查腳本為 `scripts/verify-signoff-evidence.py`；此機 Python 路徑位於 Codex runtime 的 `dependencies/python/python.exe`，未另安裝依賴。

本次不封存 change、不串真實金流、不新增後端或正式登入。八分鐘講解腳本已更新內容，但未重新執行計時演練，不能沿用舊版計時宣稱新版也完成演練。

驗收後已關閉測試瀏覽器並停止本次啟動的 Vite 開發服務；需展示時重新執行 `npm.cmd run dev`。
