# E2E Testing Checklist

本清單已於 2026/11/09 由 Playwright MCP 實際執行：29 通過、0 失敗、0 略過。各案例保留原步驟及預期結果，並附實際時間、觀察及截圖；規劃文件或 Mermaid 渲染本身不作為功能通過依據。

## Test Setup

- **Start URL / route:** http://127.0.0.1:5173/；本機由 `npm.cmd run dev` 啟動，根路徑為單頁工作區，未新增路由。
- **Viewport(s):** 主要 1366×768；E2E-026 另用 390×844 且啟用觸控。日期案例使用隔離瀏覽器時鐘及時區，不改機器系統時間。
- **Test data / accounts:** 無正式帳號。使用「宴客主人」「平台管理者」「酒商甲」「酒商乙」「合作餐廳」五個示範身分。姓名「宴遇測試主人甲／乙」、手機 0912-345-678、市話 02 2345-6789 分機 123；均只作模擬，不撥號或發訊息。宴客日一般取台北當日起第 7 天 18:00，人數 12、預算 6500、兩行料理、飲酒偏好不限。
- **Prerequisites:** 先完成本 change、測試及 build。現有無後端或外部支付；不得使用真實證件／卡號。使用隔離瀏覽器來源並備份原資料。
- **舊資料前置：** Apply 第一項工作須由改版前公開 UI 建立 `legacy/v2-fixtures.json` 與來源說明（已由改版前 UI 建立並通過原版驗證）；涵蓋未驗齡、已驗齡未簽、已簽未付／付款失敗、線上完成、代收待／已收清、取消及退回、未提交／已提交／已選定小數容量。v1 原始樣本沿用 `../2026-11-09-streamline-onsite-signoff-payment/legacy/fixtures.json`。必須依來源版本建立原本合法的資料，不能事後改欄位假裝合法舊單。
- **舊單還原方式：** 在獨立瀏覽器 context 載入原始保存 JSON 到原 key `banquet-wine-demo:v1` 後重新開啟頁面；此步僅為舊版升級前置，後續全部由可見 UI 操作，不改 status 或造付款／簽名。首次讀取與下一次成功保存／再次載入均要驗證。
- **共用正常新單流程：** 空白需求填八項並確認姓名 → 主人「模擬支付服務費」及確認 → 平台「邀請兩家酒商」→ 兩家酒商各「套用示範草稿」「送出提案」→ 主人「選定酒商甲」及確認 → 餐廳「確認收貨安排」→ 酒商甲「標記已出貨」「標記已送達」→ 餐廳「確認餐廳收貨」。主要酒款 750 ml、6 瓶、單價 1000、運費 200、固定餐廳費 300；酒商乙免運。對稱案例改選乙並按其原金額核對。
- **新增介面標籤約定：** 姓名欄「姓名（下單及簽收人）」、電話「聯絡電話」、送出確認標題「確認姓名」，沿用「確認／返回」。舊單使用「補填聯絡資料」「確認補填」；餐廳使用「補填姓名核對結果」「姓名核對未通過原因」「已核對補填姓名與本人一致」「登錄姓名核對未通過」。這些為待實作的可見標籤，非宣稱目前已有；實作文案若有必要調整，須同步本清單，不能猜 CSS selector。
- **Evidence:** 各案例輸出 `e2e-evidence/E2E-NNN-描述.png` 與文字／DOM／狀態紀錄，資料矩陣須記各組結果；記錄異常 console／network。僅瀏覽器可觀察結果通過才能勾選；阻擋或缺夾具保持未勾選並寫原因，不將單元測試代替 E2E。

## 1. 新需求與固定姓名

- [x] E2E-001 姓名電話必填與姓名長度
  - **Priority:** High
  - **Prerequisites:** 空白需求，其餘六項均有效。
  - **Steps:**
    1. 姓名留白、只填空白、電話留白，逐一嘗試「提交宴客需求」。
    2. 修正姓名為「宴遇測試主人甲」，電話填有效手機；確認姓名欄最多接受 100 字。
  - **Expected results:**
    1. 各缺漏均指出對應欄位，不建立訂單；其他輸入保留。
    2. 有效姓名電話才可進入姓名確認，姓名不被自動改成其他文字。
  - **Evidence:** 缺漏錯誤畫面、保留欄位文字；101 字命令拒絕另以領域測試確認。
  - **Last run:** 2026-11-09 13:40 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-001-required.png](e2e-evidence/E2E-001-required.png)
  - **Observed evidence:** 欄位錯誤 姓名；缺漏不建立訂單；欄位錯誤 姓名；缺漏不建立訂單；欄位錯誤 電話；缺漏不建立訂單；姓名最大100字；無未解決 browser error；本機防護注入 3 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-002 台灣手機、市話與分機格式
  - **Priority:** High
  - **Prerequisites:** 每組資料從獨立空白需求開始，其他欄位有效。
  - **Steps:**
    1. 依序使用「0912-345-678」、「0912 345 678」、「02 2345-6789 分機 123」、「02-2345-6789 #123」、「02-2345-6789 ext123」，確認送出。
    2. 另以「abc」、「123」、「分機 123」、少一碼手機及含主號碼英文字母的值嘗試送出。
  - **Expected results:**
    1. 有效組可送出且可讀到相同主號碼、前導零與分機；各組以重設隔離。
    2. 無效組顯示格式提示及範例，不建立訂單，其他輸入保留。
  - **Evidence:** 有效手機、市話分機與代表性錯誤畫面；記錄每組輸入及結果。
  - **Last run:** 2026-11-09 13:40 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-002-landline.png](e2e-evidence/E2E-002-landline.png)、[e2e-evidence/E2E-002-invalid.png](e2e-evidence/E2E-002-invalid.png)
  - **Observed evidence:** 前導零保留 0912-345-678；前導零保留 0912 345 678；前導零保留 02 2345-6789 分機 123；分機保留 02 2345-6789 分機 123；前導零保留 02-2345-6789 #123；分機保留 02-2345-6789 #123；前導零保留 02-2345-6789 ext123；分機保留 02-2345-6789 ext123；欄位錯誤 電話；格式錯誤未建立 abc；欄位錯誤 電話；格式錯誤未建立 123；欄位錯誤 電話；格式錯誤未建立 分機 123；欄位錯誤 電話；格式錯誤未建立 091234567；欄位錯誤 電話；格式錯誤未建立 02 abc45678；無未解決 browser error；本機防護注入 3 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-003 姓名確認返回、提交及鎖定保存
  - **Priority:** Critical
  - **Prerequisites:** 空白需求，填有效八項資料，姓名先用「宴遇測試主人乙」。
  - **Steps:**
    1. 按「提交宴客需求」，核對姓名及送出後不可修改提示。
    2. 按「返回」，將姓名改成「宴遇測試主人甲」後再次提交並確認；在確認時快速重複點擊一次。
    3. 切換「平台管理者」「合作餐廳」及「宴客主人」，再重新整理。
  - **Expected results:**
    1. 返回時沒有建立訂單，草稿保留。
    2. 僅建立一筆待付服務費訂單，姓名固定為甲；各有權角色讀到相同值，無更名入口，沒有重複建立事件。
  - **Evidence:** 確認對話框、訂單姓名及重新整理後狀態；建立事件數。
  - **Last run:** 2026-11-09 13:41 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-003-confirm.png](e2e-evidence/E2E-003-confirm.png)、[e2e-evidence/E2E-003-locked.png](e2e-evidence/E2E-003-locked.png)
  - **Observed evidence:** 顯示 送出後不可修改；返回未建立；顯示 宴遇測試主人甲；顯示 宴遇測試主人甲；顯示 宴遇測試主人甲；建立事件只有一筆；固定正確姓名；無未解決 browser error；本機防護注入 6 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-004 新需求姓名一路沿用至本人簽收與付款
  - **Priority:** Critical
  - **Prerequisites:** 依共用「正常新單流程」以姓名甲及手機建立並推進至餐廳收貨。
  - **Steps:**
    1. 在餐廳「現場核對下單本人與年齡」核對顯示姓名；按「已核對下單本人且驗齡通過」。
    2. 在同裝置簽收頁核對「下單人姓名」為甲且不可編輯；不畫筆畫先按「保存簽名」。
    3. 用滑鼠畫有移動的筆畫，按「保存簽名」，再選模擬付款成功並支付。
  - **Expected results:**
    1. 驗齡通過直接進主人畫面，角色切換與重設不出現；姓名唯讀。
    2. 空白簽名拒絕，保存有效筆畫後才可付款；簽名本身不算完成。
    3. 付款 6200 元後一次完成，酒款 6000、配送 200、分潤待結算 600，姓名與需求一致。
  - **Evidence:** 餐廳核對姓名、唯讀姓名及有效簽名、付款完成畫面；無真實支付網路請求。
  - **Last run:** 2026-11-09 13:41 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-004-restaurant.png](e2e-evidence/E2E-004-restaurant.png)、[e2e-evidence/E2E-004-signature.png](e2e-evidence/E2E-004-signature.png)、[e2e-evidence/E2E-004-paid.png](e2e-evidence/E2E-004-paid.png)
  - **Observed evidence:** 顯示 宴遇測試主人甲；客人頁無角色切換；姓名唯讀；欄位錯誤 簽名；手寫簽名成功保存；簽名未付款；唯一付款6200及分潤600；需求簽收同名；無未解決 browser error；本機防護注入 4 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-005 清除重簽與付款失敗重試不更名
  - **Priority:** Critical
  - **Prerequisites:** 已驗齡的新單，固定姓名甲。
  - **Steps:**
    1. 保存有效簽名後按「清除簽名並重簽」，確認姓名仍固定，付款不可用。
    2. 重新畫筆畫保存，選「模擬付款結果：失敗」並支付；重新整理，再以成功結果重試。
  - **Expected results:**
    1. 清除不清需求姓名，未重新保存不得付款。
    2. 失敗保留姓名與同明細有效簽名，重新整理不自動重付；成功重試無須重簽，只有一筆成功付款及分潤。
  - **Evidence:** 清除後與失敗後的姓名、簽名狀態；重新整理及重試成功畫面。
  - **Last run:** 2026-11-09 13:41 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-005-failed.png](e2e-evidence/E2E-005-failed.png)、[e2e-evidence/E2E-005-retry.png](e2e-evidence/E2E-005-retry.png)
  - **Observed evidence:** 手寫簽名成功保存；清除後不可付款；清除仍同名；手寫簽名成功保存；刷新保留署名；失敗後只成功一次；無未解決 browser error；本機防護注入 6 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-006 新單姓名不符退回與費用責任
  - **Priority:** Critical
  - **Prerequisites:** 新版「載入餐廳驗齡前」，資料姓名已固定。
  - **Steps:**
    1. 選「驗齡結果：未通過」，先不填「驗齡未通過原因」提交，再填「姓名與本人不符」提交。
    2. 切換主人及餐廳確認不能簽名、付款或重驗；選定酒商按「確認已取回酒品」。
    3. 取回前先查看退運成本待登錄，取回後由平台填「平台負擔退回運費（元）」200 並登錄。
  - **Expected results:**
    1. 缺原因被拒；有效原因進待退回，不提供現場更名或代簽。
    2. 服務費 500 不退，主人新增應付 0，無成功酒款付款、分潤或代收；只有選定酒商可完成取回。
    3. 成本未填不是零，已取回仍可登錄平台成本，服務未完成。
  - **Evidence:** 待退回、原因、費用及取回後平台成本畫面。
  - **Last run:** 2026-11-09 13:41 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-006-return.png](e2e-evidence/E2E-006-return.png)、[e2e-evidence/E2E-006-cost.png](e2e-evidence/E2E-006-cost.png)
  - **Observed evidence:** 欄位錯誤 原因；顯示 待退回；顯示 待登錄；未通過不能付款；失敗無重驗；退回及平台成本正確；無未解決 browser error；本機防護注入 3 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

## 2. 角色資料可見性

- [x] E2E-007 選定前各角色聯絡資料可見性
  - **Priority:** Critical
  - **Prerequisites:** 新需求姓名甲、電話「02 2345-6789 分機 123」，已付服務費並邀請兩家酒商，尚未選定。
  - **Steps:**
    1. 依序切換主人、平台、餐廳，核對姓名電話及分機。
    2. 切換酒商甲與乙，查看概覽、提案、待辦及歷程；重新整理，再返回主人。
    3. 使用 Playwright MCP 的頁面文字與 DOM 檢查，查找姓名及電話各種正規化表示。
  - **Expected results:**
    1. 主人、平台、指定餐廳可見完整聯絡資料。
    2. 兩家酒商都不渲染姓名電話，含隱藏節點及屬性；返回主人仍完整，沒有前角色資料短暫出現。
  - **Evidence:** 三種授權角色代表畫面、甲乙酒商畫面及 DOM 搜尋結果。
  - **Last run:** 2026-11-09 13:41 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-007-allowed-宴客主人.png](e2e-evidence/E2E-007-allowed-宴客主人.png)、[e2e-evidence/E2E-007-allowed-平台管理者.png](e2e-evidence/E2E-007-allowed-平台管理者.png)、[e2e-evidence/E2E-007-allowed-合作餐廳.png](e2e-evidence/E2E-007-allowed-合作餐廳.png)、[e2e-evidence/E2E-007-merchant-酒商甲.png](e2e-evidence/E2E-007-merchant-酒商甲.png)、[e2e-evidence/E2E-007-merchant-酒商乙.png](e2e-evidence/E2E-007-merchant-酒商乙.png)
  - **Observed evidence:** 顯示 宴遇測試主人甲；顯示 0223456789 分機 123；顯示 宴遇測試主人甲；顯示 0223456789 分機 123；顯示 宴遇測試主人甲；顯示 0223456789 分機 123；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0223456789；酒商無簽名原圖；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0223456789；酒商無簽名原圖；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0223456789；酒商無簽名原圖；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0223456789；酒商無簽名原圖；顯示 宴遇測試主人甲；無未解決 browser error；本機防護注入 9 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-008 獲選酒商的簽收、代收與退回摘要不洩漏姓名
  - **Priority:** Critical
  - **Prerequisites:** 以甲、乙各作一次獲選者的獨立案例，使用可辨識姓名電話；依正常流程或舊單案例建立各階段。
  - **Steps:**
    1. 在已簽名、付款失敗、線上完成、餐廳代收及姓名不符退回階段，返回工作區切至獲選酒商。
    2. 查看概覽、簽收紀錄、交易、代收、歷程及一般退回原因，重新整理；切至未獲選酒商再重新整理。
    3. 使用 DOM 搜尋姓名、電話及分機，檢查簽名原圖沒有提供給酒商；姓名不符原因測試先由餐廳填含測試姓名的完整原因。
  - **Expected results:**
    1. 獲選者可見授權交易與狀態，但各位置不含姓名電話、署名或原圖；退回僅一般原因。
    2. 未獲選者只有未獲選提示，不見任何後續概覽、進度、歷程或帳款；規則對甲乙對稱。
  - **Evidence:** 各階段獲選／未獲選畫面、DOM 搜尋及姓名不符原因投影結果。
  - **Last run:** 2026-11-09 13:42 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-008-酒商甲-signed.png](e2e-evidence/E2E-008-酒商甲-signed.png)、[e2e-evidence/E2E-008-酒商甲-failed.png](e2e-evidence/E2E-008-酒商甲-failed.png)、[e2e-evidence/E2E-008-酒商甲-online.png](e2e-evidence/E2E-008-酒商甲-online.png)、[e2e-evidence/E2E-008-酒商甲-collection.png](e2e-evidence/E2E-008-酒商甲-collection.png)、[e2e-evidence/E2E-008-酒商甲-return.png](e2e-evidence/E2E-008-酒商甲-return.png)、[e2e-evidence/E2E-008-酒商乙-signed.png](e2e-evidence/E2E-008-酒商乙-signed.png)、[e2e-evidence/E2E-008-酒商乙-failed.png](e2e-evidence/E2E-008-酒商乙-failed.png)、[e2e-evidence/E2E-008-酒商乙-online.png](e2e-evidence/E2E-008-酒商乙-online.png)、[e2e-evidence/E2E-008-酒商乙-collection.png](e2e-evidence/E2E-008-酒商乙-collection.png)、[e2e-evidence/E2E-008-酒商乙-return.png](e2e-evidence/E2E-008-酒商乙-return.png)
  - **Observed evidence:** 手寫簽名成功保存；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0912345678；酒商無簽名原圖；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0912345678；酒商無簽名原圖；顯示 本次未獲選；未獲選無簽收紀錄；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0912345678；酒商無簽名原圖；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0912345678；酒商無簽名原圖；顯示 本次未獲選；未獲選無簽收紀錄；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0912345678；酒商無簽名原圖；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0912345678；酒商無簽名原圖；顯示 本次未獲選；未獲選無簽收紀錄；手寫簽名成功保存；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0912345678；酒商無簽名原圖；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0912345678；酒商無簽名原圖；顯示 本次未獲選；未獲選無簽收紀錄；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0912345678；酒商無簽名原圖；手寫簽名成功保存；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0912345678；酒商無簽名原圖；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0912345678；酒商無簽名原圖；顯示 本次未獲選；未獲選無簽收紀錄；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0912345678；酒商無簽名原圖；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0912345678；酒商無簽名原圖；顯示 本次未獲選；未獲選無簽收紀錄；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0912345678；酒商無簽名原圖；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0912345678；酒商無簽名原圖；顯示 本次未獲選；未獲選無簽收紀錄；手寫簽名成功保存；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0912345678；酒商無簽名原圖；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0912345678；酒商無簽名原圖；顯示 本次未獲選；未獲選無簽收紀錄；DOM 不含姓名 宴遇測試主人甲；DOM 不含電話 0912345678；酒商無簽名原圖；無未解決 browser error；本機防護注入 30 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

## 3. 提案數字與草稿

- [x] E2E-009 最小正整數與免運提案可送出
  - **Priority:** High
  - **Prerequisites:** 新單已邀請酒商，酒商甲編輯提案。
  - **Steps:**
    1. 完成其他提案欄位，容量、瓶數、單價皆填 1、配送費填 0，查看餐廳費用。
    2. 正式送出，切主人查看提案；另在獨立新單以 750、6、1000、0 送出。
  - **Expected results:**
    1. 兩組皆合法，餐廳費用唯讀固定 300；免運不被拒絕。
    2. 主人看到提交的整數及零運費，金額計算一致，無四捨五入。
  - **Evidence:** 已提交提案及主人比較畫面，記錄最小值組及一般組。
  - **Last run:** 2026-11-09 13:43 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-009-valid-1.png](e2e-evidence/E2E-009-valid-1.png)、[e2e-evidence/E2E-009-valid-750.png](e2e-evidence/E2E-009-valid-750.png)
  - **Observed evidence:** 合法整數送出 1,1,1；顯示 NT$ 0；合法整數送出 750,6,1000；顯示 NT$ 0；無未解決 browser error；本機防護注入 3 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
Call log:
[2m  - waiting for getByLabel('配送費（元）', { exact: true })[22m
. VICE TIMELINE 每一步，都有紀錄 3 筆已接受操作 人工邀請酒商甲、乙 平台管理者 · 2026/11/9 13:42:11 Asia/Taipei 模擬支付平台服務費 500 元 宴客主人 · 2026/11/9 13:42:11 Asia/Taipei 已提交宴客需求與聯絡資料 宴客主人 · 2026/11/9 13:42:11 Asia/Taipei COST AT A GLANCE 這一席的費用  所有金額均為新臺幣・示範用途  平台服務費 NT$ 500 付款狀態 已付 酒款收款方 尚未選定 線上模擬收款 未付款 餐廳費用 300 元・現場另收 估計總支出 待提案 平台只收服務費，不收酒款佣金。分潤不加到主人支出。 RESTAURANT SHARE 餐廳分潤 —  未成交，未產生分潤  線上付款成功或餐廳承接代收後，建立唯一待結算紀錄。 DEMO TOOLS 展示工具  載入或重設會取代目前展示資料。  從空白需求開始 ↗ 重設正常起點 ↗ 載入餐廳取消前 ↗ 載入餐廳驗齡前 ↗ 宴遇 BANQUET & WINE 課程展示・所有付款均為模擬・資料僅存於目前瀏覽器
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-010 容量瓶數單價逐欄拒絕非法數字
  - **Priority:** Critical
  - **Prerequisites:** 受邀酒商完整提案，除受測欄位其餘合法；每一組還原合法值再測。
  - **Steps:**
    1. 逐一對容量、瓶數、單價輸入空白、0、-1、1.5、9007199254740992，按「送出提案」。
    2. 記錄每個欄位／值組合；另用安全整數但乘積或總額溢出的組合送出。
    3. 修正為 750、6、1000 後送出。
  - **Expected results:**
    1. 各非法組被拒、錯誤指出酒款與欄位，不改原輸入、不當成已提交。
    2. 乘積／總額超出可安全表示範圍亦被拒；修正後可以成功送出。
  - **Evidence:** 完整資料矩陣結果、各欄代表性錯誤畫面與修正成功畫面；Infinity／NaN 命令另以單元驗證。
  - **Last run:** 2026-11-09 13:42 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-010-invalid.png](e2e-evidence/E2E-010-invalid.png)、[e2e-evidence/E2E-010-corrected.png](e2e-evidence/E2E-010-corrected.png)
  - **Observed evidence:** 欄位錯誤 容量；非法未提交 容量（ml） 1=；欄位錯誤 容量；非法未提交 容量（ml） 1=0；欄位錯誤 容量；非法未提交 容量（ml） 1=-1；欄位錯誤 容量；非法未提交 容量（ml） 1=1.5；欄位錯誤 容量；非法未提交 容量（ml） 1=9007199254740992；欄位錯誤 瓶數；非法未提交 瓶數 1=；欄位錯誤 瓶數；非法未提交 瓶數 1=0；欄位錯誤 瓶數；非法未提交 瓶數 1=-1；欄位錯誤 瓶數；非法未提交 瓶數 1=1.5；欄位錯誤 瓶數；非法未提交 瓶數 1=9007199254740992；欄位錯誤 單價；非法未提交 單價（元） 1=；欄位錯誤 單價；非法未提交 單價（元） 1=0；欄位錯誤 單價；非法未提交 單價（元） 1=-1；欄位錯誤 單價；非法未提交 單價（元） 1=1.5；欄位錯誤 單價；非法未提交 單價（元） 1=9007199254740992；欄位錯誤 範圍；修正可送出；無未解決 browser error；本機防護注入 4 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-011 配送費限制及餐廳固定費用
  - **Priority:** High
  - **Prerequisites:** 受邀酒商，其餘欄位有效。
  - **Steps:**
    1. 配送費依序填空白、-1、0.5、9007199254740992 並正式送出。
    2. 改成 0 送出，確認「餐廳費用（元）」不能編輯且為 300。
  - **Expected results:**
    1. 非法運費均拒絕且保留內容，0 可正式送出；餐廳費用仍現場另收 300。
  - **Evidence:** 運費驗證矩陣、免運成功畫面及固定費用唯讀狀態；竄改費用命令由領域測試驗證。
  - **Last run:** 2026-11-09 13:42 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-011-shipping-invalid.png](e2e-evidence/E2E-011-shipping-invalid.png)、[e2e-evidence/E2E-011-free-shipping.png](e2e-evidence/E2E-011-free-shipping.png)
  - **Observed evidence:** 欄位錯誤 配送費；非法運費拒絕 ；欄位錯誤 配送費；非法運費拒絕 -1；欄位錯誤 配送費；非法運費拒絕 0.5；欄位錯誤 配送費；非法運費拒絕 9007199254740992；餐廳費唯讀；固定費300；無未解決 browser error；本機防護注入 3 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-012 不完整及小數草稿可保存還原
  - **Priority:** High
  - **Prerequisites:** 受邀酒商，未提交草稿。
  - **Steps:**
    1. 將容量清空、其他數字留未完成，按「保存草稿」，切換角色再重新整理。
    2. 回酒商，容量改成 750.5、瓶數 -1，保存草稿並重新整理。
    3. 正式送出，確認拒絕；再改合法值並正式送出。
  - **Expected results:**
    1. 還原未提交草稿，空白不是 0；小數／負數草稿仍可修改。
    2. 草稿不列為有效提交，不能促成兩份比較選定；正式送出須合法，錯誤不自動截斷。
  - **Evidence:** 兩次還原後草稿、拒絕送出及修正成功畫面。
  - **Last run:** 2026-11-09 13:42 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-012-blank.png](e2e-evidence/E2E-012-blank.png)、[e2e-evidence/E2E-012-fraction.png](e2e-evidence/E2E-012-fraction.png)
  - **Observed evidence:** 草稿空白未變零；小數草稿還原；欄位錯誤 容量；無未解決 browser error；本機防護注入 9 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-013 多酒款第二列驗證及修正
  - **Priority:** High
  - **Prerequisites:** 酒商第一款有效，其餘提案資訊完整。
  - **Steps:**
    1. 按「新增酒款」，第二款填完整但容量 750.5，正式送出。
    2. 改第二款容量 750 後再送出；主人核對兩款均保留。
  - **Expected results:**
    1. 第一次指出第 2 款容量且不提交；第一次酒款及其他輸入保留。
    2. 修正後兩款一起有效提交，金額未因錯誤嘗試改變。
  - **Evidence:** 第 2 款欄位錯誤及兩款成功提交畫面。
  - **Last run:** 2026-11-09 13:42 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-013-second-error.png](e2e-evidence/E2E-013-second-error.png)、[e2e-evidence/E2E-013-two-items.png](e2e-evidence/E2E-013-two-items.png)
  - **Observed evidence:** 欄位錯誤 第 2 款容量；兩款完整送出；無未解決 browser error；本機防護注入 3 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

## 4. 舊訂單與提案相容

- [x] E2E-014 未驗齡舊單補填一次後鎖定
  - **Priority:** Critical
  - **Prerequisites:** 隔離瀏覽器還原原 UI 保存的 v1／v2 未驗齡舊單，原資料無姓名電話；含日期已過的有效樣本。
  - **Steps:**
    1. 查看既有進度及待補填提示，餐廳嘗試接續驗齡。
    2. 切主人按「補填聯絡資料」，填姓名甲及市話分機，確認鎖名提示後補填；快速重複確認一次。
    3. 重新整理，切餐廳接續原驗齡，再回主人查看是否還有補填入口。
  - **Expected results:**
    1. 原單正常載入，不顯示損壞／要求重設，補填前無法驗齡或簽名。
    2. 只補填一次，原服務費、配送、日期及原事件保留；保存後姓名固定且分機可讀，能沿原進度驗齡。
  - **Evidence:** 原進度、補填提示、確認後角色視圖及重新整理結果；補填事件數。
  - **Last run:** 2026-11-09 13:47 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-014-supplement-2.png](e2e-evidence/E2E-014-supplement-2.png)、[e2e-evidence/E2E-014-supplement-1.png](e2e-evidence/E2E-014-supplement-1.png)
  - **Observed evidence:** 顯示 待補填；補填前不可驗齡；原驗齡紀錄不變；補填姓名固定；無第二次補填；顯示 待補填；補填前不可驗齡；原驗齡紀錄不變；補填姓名固定；無第二次補填；無未解決 browser error；本機防護注入 15 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-015 補填驗證與角色限制
  - **Priority:** High
  - **Prerequisites:** 未簽舊單待補填。
  - **Steps:**
    1. 在平台、餐廳、兩家酒商檢查沒有替主人補填的操作。
    2. 主人分別以空白姓名、無效電話提交，再修正並確認補填。
    3. 成功後重新整理並檢查無第二次更名或補填入口。
  - **Expected results:**
    1. 非法補填不消耗機會，保留其他輸入；合法補填才一次成功。
    2. 非主人無補填入口，提交成功後不得重寫；非法角色命令另由領域測試直接驗證。
  - **Evidence:** 主人錯誤與修正成功、其他角色入口檢查；角色拒絕另保留單元結果。
  - **Last run:** 2026-11-09 13:43 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-015-invalid-contact.png](e2e-evidence/E2E-015-invalid-contact.png)、[e2e-evidence/E2E-015-completed-contact.png](e2e-evidence/E2E-015-completed-contact.png)
  - **Observed evidence:** 其他角色無補填 平台管理者；其他角色無補填 合作餐廳；其他角色無補填 酒商甲；其他角色無補填 酒商乙；欄位錯誤 姓名；欄位錯誤 電話；錯誤未消耗補填；補填後無重寫；無未解決 browser error；本機防護注入 9 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-016 已驗齡未簽舊單須另核對姓名
  - **Priority:** Critical
  - **Prerequisites:** 原 UI 保存的 v1 已驗齡待購買／付款舊單，以及 v2 signature-pending 舊單；無有效簽名。
  - **Steps:**
    1. 載入時檢查不能直接進入可簽名頁；主人完成一次補填。
    2. 餐廳核對前嘗試「接續主人簽收付款」，切角色及重新整理，確認主人、平台、兩家酒商均無替餐廳核對通過的操作。
    3. 由合作餐廳按「已核對補填姓名與本人一致」，快速重送一次，確認切至主人唯讀姓名簽名。
  - **Expected results:**
    1. 補填後仍阻擋簽名、付款與代收，原 age 通過結果及時間未變。
    2. 核對成功才開放簽名，沒有第二次驗齡、配送或服務費；核對時間與事件只有一次，重新整理後可接續。
  - **Evidence:** 兩層阻擋、待餐廳核對、核對成功與唯讀姓名；與原樣本核對 age、費用及事件。
  - **Last run:** 2026-11-09 13:47 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-016-pending-2.png](e2e-evidence/E2E-016-pending-2.png)、[e2e-evidence/E2E-016-checked-2.png](e2e-evidence/E2E-016-checked-2.png)、[e2e-evidence/E2E-016-pending-1.png](e2e-evidence/E2E-016-pending-1.png)、[e2e-evidence/E2E-016-checked-1.png](e2e-evidence/E2E-016-checked-1.png)、[e2e-evidence/E2E-016-pending-1.png](e2e-evidence/E2E-016-pending-1.png)、[e2e-evidence/E2E-016-checked-1.png](e2e-evidence/E2E-016-checked-1.png)
  - **Observed evidence:** 舊單不直接簽；保留age時間及結果；未核對不可接續；非餐廳無核對 宴客主人；非餐廳無核對 平台管理者；非餐廳無核對 酒商甲；非餐廳無核對 酒商乙；顯示 本人簽收；餐廳核對後固定姓名；一次核對事件；未重收服務費；舊單不直接簽；保留age時間及結果；未核對不可接續；非餐廳無核對 宴客主人；非餐廳無核對 平台管理者；非餐廳無核對 酒商甲；非餐廳無核對 酒商乙；顯示 本人簽收；餐廳核對後固定姓名；一次核對事件；未重收服務費；舊單不直接簽；保留age時間及結果；未核對不可接續；非餐廳無核對 宴客主人；非餐廳無核對 平台管理者；非餐廳無核對 酒商甲；非餐廳無核對 酒商乙；顯示 本人簽收；餐廳核對後固定姓名；一次核對事件；未重收服務費；無未解決 browser error；本機防護注入 30 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-017 舊單補填姓名不符保留驗齡並退回
  - **Priority:** Critical
  - **Prerequisites:** 原驗齡已通過未簽舊單，主人已補填；餐廳待核對。
  - **Steps:**
    1. 在「補填姓名核對結果」選未通過，先留空原因提交，再填「姓名與本人不符」提交。
    2. 切主人及餐廳，檢查不能更名、第二次補填、核對改通過、簽名或付款。
    3. 選定酒商取回，平台登錄退回成本，重新整理。
  - **Expected results:**
    1. 缺原因拒絕；失敗後另記姓名核對失敗與待退回，原 age 通過時間及結果保留。
    2. 服務費不退、平台負擔退運，無付款、分潤或代收；終止不可恢復，取回後服務未完成。
  - **Evidence:** 待退回獨立姓名不符原因、原驗齡紀錄、費用與取回後結果。
  - **Last run:** 2026-11-09 13:43 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-017-mismatch.png](e2e-evidence/E2E-017-mismatch.png)、[e2e-evidence/E2E-017-returned.png](e2e-evidence/E2E-017-returned.png)
  - **Observed evidence:** 欄位錯誤 原因；原驗齡保留且獨立姓名不符；失敗不可重驗；不可再次補填；失敗不可重驗；不可再次補填；不可恢復且平台負擔退運；無未解決 browser error；本機防護注入 9 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-018 已簽未付舊單保留署名與重試
  - **Priority:** Critical
  - **Prerequisites:** 原 v2 UI 已簽未付或付款失敗樣本，保存原署名、筆畫、快照及時間。
  - **Steps:**
    1. 載入並重新整理，查看原簽名、明細及付款嘗試，確認沒有補填要求。
    2. 一個樣本直接重試付款成功；另一獨立樣本清除重簽，核對只能沿用歷史署名後再次保存。
  - **Expected results:**
    1. 原簽名及原時間／快照完整，沒有自動重付或捏造電話。
    2. 同明細可沿原付款或失敗後代收；主動清除後仍不可更名，無須新增電話。
  - **Evidence:** 還原後原署名、直接付款結果及獨立樣本清除後固定姓名。
  - **Last run:** 2026-11-09 13:43 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-018-preserved-signed.png](e2e-evidence/E2E-018-preserved-signed.png)、[e2e-evidence/E2E-018-preserved-failed.png](e2e-evidence/E2E-018-preserved-failed.png)、[e2e-evidence/E2E-018-resigned.png](e2e-evidence/E2E-018-resigned.png)
  - **Observed evidence:** 已簽不補填；原署名筆畫快照時間保留；已簽舊單可接續付款；已簽不補填；原署名筆畫快照時間保留；重簽仍歷史姓名；手寫簽名成功保存；已簽舊單可接續付款；無未解決 browser error；本機防護注入 15 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-019 已付款完成及代收舊單保留結果
  - **Priority:** Critical
  - **Prerequisites:** v1 已付待交付／待收取／已完成，v2 線上完成、代收待收清／已收清樣本。
  - **Steps:**
    1. 逐一載入並重新整理，查看原付款、代收、分潤、簽名及事件。
    2. v1 未完成者用「舊版：標記已交付主人」「舊版：確認收取並完成服務」接續。
    3. 代收待收清者讓選定酒商確認收清，再重新整理。
  - **Expected results:**
    1. 不要求補填、重簽或重付，不偽造簽名；原款項、分潤與歷史時間不變。
    2. 只允許原相容接續／收清，不新增第二筆交易或分潤；已完成仍唯讀。
  - **Evidence:** 各來源樣本結果矩陣、相容接續及代收收清畫面；原快照對照。
  - **Last run:** 2026-11-09 13:43 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-019-paid-1-handover-pending-online.png](e2e-evidence/E2E-019-paid-1-handover-pending-online.png)、[e2e-evidence/E2E-019-paid-1-host-receipt-pending-online.png](e2e-evidence/E2E-019-paid-1-host-receipt-pending-online.png)、[e2e-evidence/E2E-019-paid-1-completed-online.png](e2e-evidence/E2E-019-paid-1-completed-online.png)、[e2e-evidence/E2E-019-paid-2-completed-online.png](e2e-evidence/E2E-019-paid-2-completed-online.png)、[e2e-evidence/E2E-019-paid-2-completed-pending.png](e2e-evidence/E2E-019-paid-2-completed-pending.png)、[e2e-evidence/E2E-019-paid-2-completed-received.png](e2e-evidence/E2E-019-paid-2-completed-received.png)
  - **Observed evidence:** 已付不強制補填；原付款保留；原分潤保留；已付不強制補填；原付款保留；原分潤保留；已付不強制補填；原付款保留；原分潤保留；已付不強制補填；原付款保留；原分潤保留；已付不強制補填；原付款保留；原分潤保留；代收帳款可接續收清；已付不強制補填；原付款保留；原分潤保留；無未解決 browser error；本機防護注入 42 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-020 取消退回舊單不因缺資料被重開
  - **Priority:** High
  - **Prerequisites:** v1／v2 取消待退款、已取消、待退回及已退回樣本。
  - **Steps:**
    1. 逐一還原並重新整理，檢查無補填與正常簽收入口。
    2. 對待退款用平台退款，對待退回用選定酒商取回，查看平台成本。
  - **Expected results:**
    1. 缺姓名電話不判損壞，不開啟正常履約；原原因、付款、退款及成本保留。
    2. 只執行原異常分支，沒有酒款付款、分潤或代收。
  - **Evidence:** 各異常狀態與允許操作，退款／取回後結果。
  - **Last run:** 2026-11-09 13:43 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-020-cancel-pending-2.png](e2e-evidence/E2E-020-cancel-pending-2.png)、[e2e-evidence/E2E-020-cancel-pending-1.png](e2e-evidence/E2E-020-cancel-pending-1.png)、[e2e-evidence/E2E-020-cancelled-2.png](e2e-evidence/E2E-020-cancelled-2.png)、[e2e-evidence/E2E-020-cancelled-1.png](e2e-evidence/E2E-020-cancelled-1.png)、[e2e-evidence/E2E-020-return-pending-2.png](e2e-evidence/E2E-020-return-pending-2.png)、[e2e-evidence/E2E-020-return-pending-1.png](e2e-evidence/E2E-020-return-pending-1.png)、[e2e-evidence/E2E-020-returned-2.png](e2e-evidence/E2E-020-returned-2.png)、[e2e-evidence/E2E-020-returned-1.png](e2e-evidence/E2E-020-returned-1.png)
  - **Observed evidence:** 異常不補填 cancel-pending；原異常狀態保留；異常無分潤；異常不補填 cancel-pending；原異常狀態保留；異常無分潤；異常不補填 cancelled；原異常狀態保留；異常無分潤；異常不補填 cancelled；原異常狀態保留；異常無分潤；異常不補填 return-pending；原異常狀態保留；異常無分潤；異常不補填 return-pending；原異常狀態保留；異常無分潤；異常不補填 returned；原異常狀態保留；異常無分潤；異常不補填 returned；原異常狀態保留；異常無分潤；無未解決 browser error；本機防護注入 51 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-021 舊已提交小數容量仍可比較選定
  - **Priority:** Critical
  - **Prerequisites:** 原 v2 UI 保存兩份已提交未選定提案，其中一份容量 750.5；來源檔記錄原提交內容。
  - **Steps:**
    1. 載入並查看兩份提案及原容量、金額，切主人選定該小數容量提案並確認。
    2. 重新整理及切餐廳，查看已鎖定條件與後續安排。
  - **Expected results:**
    1. 正常載入並可依原條件選定，不將 750.5 四捨五入，不改原費用或原提交事件。
    2. 後續保存及載入維持該選定提案，無資料損壞提示。
  - **Evidence:** 原提案、選定後與再次載入的 750.5 及原金額。
  - **Last run:** 2026-11-09 13:46 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-021-legacy-selected.png](e2e-evidence/E2E-021-legacy-selected.png)
  - **Observed evidence:** 顯示 750.5 ml；舊提交仍可選定小數原值；顯示 750.5 ml；無未解決 browser error；本機防護注入 9 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-022 舊已選定小數容量可續簽付款
  - **Priority:** Critical
  - **Prerequisites:** 原 v2 UI 已選定 750.5 容量的驗齡前樣本。
  - **Steps:**
    1. 載入後由主人補填，餐廳沿原流程核對本人並驗齡通過。
    2. 核對簽收明細容量仍 750.5，簽名後模擬付款成功並重新整理。
  - **Expected results:**
    1. 歷史容量原值一路保留至交易明細，金額不重算。
    2. 可以正常完成一次，不因新整數規則在保存付款或再次載入時失敗。
  - **Evidence:** 簽收明細、付款完成及重新整理後原容量／金額。
  - **Last run:** 2026-11-09 13:44 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-022-legacy-paid.png](e2e-evidence/E2E-022-legacy-paid.png)
  - **Observed evidence:** 顯示 750.5 ml；手寫簽名成功保存；歷史小數容量付款及二次保存成功；無未解決 browser error；本機防護注入 9 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-023 舊草稿與舊提案重新提交套新規則
  - **Priority:** Critical
  - **Prerequisites:** 分別備有未提交 750.5 草稿及已提交未選定 750.5 提案；另備同舊單另一家尚未提交酒商。
  - **Steps:**
    1. 各樣本載入後用酒商再次正式送出未修正小數容量。
    2. 將容量改為 750 再送出；另一家酒商在同舊單新填 750.5 也嘗試送出。
  - **Expected results:**
    1. 草稿可還原，但新／重新提交的小數均拒絕，不沿用舊單例外。
    2. 改正整數後成功，已選定提案仍不可編輯；相容例外不擴及另一家新提案。
  - **Evidence:** 三個來源分支的拒絕與修正成功結果。
  - **Last run:** 2026-11-09 13:44 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-023-reject-decimal-draft.png](e2e-evidence/E2E-023-reject-decimal-draft.png)、[e2e-evidence/E2E-023-reject-decimal-submitted.png](e2e-evidence/E2E-023-reject-decimal-submitted.png)、[e2e-evidence/E2E-023-other-merchant.png](e2e-evidence/E2E-023-other-merchant.png)
  - **Observed evidence:** 欄位錯誤 容量；重新送出套整數；欄位錯誤 容量；重新送出套整數；欄位錯誤 容量；無未解決 browser error；本機防護注入 12 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

## 5. 保存、展示與回歸

- [x] E2E-024 建立補填與核對保存失敗可恢復重試
  - **Priority:** Critical
  - **Prerequisites:** 三個獨立隔離情境：待確認新需求、舊單待補填、已補填待餐廳核對；在瀏覽器注入只針對示範 storage key 的 setItem 失敗，不更動訂單。
  - **Steps:**
    1. 逐一在保存失敗條件下確認建立／補填／姓名核對。
    2. 觀察錯誤及保留進度，解除儲存故障後由使用者明確重試。
    3. 成功後重新整理並核對事件數、姓名、補填／核對時間及原金額。
  - **Expected results:**
    1. 不假稱建立、補填或核對成功，維持前次成功狀態；核對失敗保存時不能先開放簽名。
    2. 恢復後可一次成功，補填機會未提前消耗，不產生重複事件或費用。
  - **Evidence:** 各故障畫面與解除故障後接續；原／新保存資料對照。
  - **Last run:** 2026-11-09 13:44 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-024-failure-create.png](e2e-evidence/E2E-024-failure-create.png)、[e2e-evidence/E2E-024-retry-create.png](e2e-evidence/E2E-024-retry-create.png)、[e2e-evidence/E2E-024-failure-contact.png](e2e-evidence/E2E-024-failure-contact.png)、[e2e-evidence/E2E-024-retry-contact.png](e2e-evidence/E2E-024-retry-contact.png)、[e2e-evidence/E2E-024-failure-check.png](e2e-evidence/E2E-024-failure-check.png)、[e2e-evidence/E2E-024-retry-check.png](e2e-evidence/E2E-024-retry-check.png)
  - **Observed evidence:** 欄位錯誤 保存失敗；失敗未覆寫 create；明確重試成功 create；欄位錯誤 保存失敗；失敗未覆寫 contact；明確重試成功 contact；欄位錯誤 保存失敗；失敗未覆寫 check；明確重試成功 check；無未解決 browser error；本機防護注入 9 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 移除故障注入並關閉隔離瀏覽器，再以正常儲存確認清理完成。

- [x] E2E-025 四個新版展示入口與取代確認
  - **Priority:** Medium
  - **Prerequisites:** 隔離瀏覽器已有任一訂單。
  - **Steps:**
    1. 對「從空白需求開始」「重設正常起點」「載入餐廳取消前」「載入餐廳驗齡前」各先返回取代確認、再重開並確認。
    2. 空白查看姓名電話未填；正常查看模擬資料可修改；後兩入口查看固定姓名電話及原前置流程。
    3. 每次載入後重新整理。
  - **Expected results:**
    1. 返回不覆寫原資料；確認才取代。
    2. 新情境聯絡資料符合規則且不出現舊單補填阻擋；原付款／配送／事件一致，不殘留上一情境。
  - **Evidence:** 取代確認、四入口代表性表單／工作區及重新整理後狀態。
  - **Last run:** 2026-11-09 13:47 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-025-從空白需求開始.png](e2e-evidence/E2E-025-從空白需求開始.png)、[e2e-evidence/E2E-025-重設正常起點.png](e2e-evidence/E2E-025-重設正常起點.png)、[e2e-evidence/E2E-025-載入餐廳取消前.png](e2e-evidence/E2E-025-載入餐廳取消前.png)、[e2e-evidence/E2E-025-載入餐廳驗齡前.png](e2e-evidence/E2E-025-載入餐廳驗齡前.png)
  - **Observed evidence:** 返回不取代 從空白需求開始；空白無預填；返回不取代 重設正常起點；正常模擬預填；正常預填可修改；返回不取代 載入餐廳取消前；新入口不用舊例外 載入餐廳取消前；返回不取代 載入餐廳驗齡前；新入口不用舊例外 載入餐廳驗齡前；無未解決 browser error；本機防護注入 15 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-026 桌機及觸控固定姓名簽收可操作
  - **Priority:** High
  - **Prerequisites:** 1366×768 桌機與 390×844 觸控視窗各一個新版驗齡前情境；另準備市話分機及多行長料理新需求。
  - **Steps:**
    1. 在兩種視窗填寫姓名電話、查看確認提示與長料理，正常垂直捲動操作。
    2. 餐廳驗齡通過後，用滑鼠／觸控畫筆畫，保存、清除、重簽。
    3. 進行失敗付款，選重試、代收交還店員及取消確認返回，檢查姓名持續固定。
  - **Expected results:**
    1. 欄位有可見標籤與可讀錯誤，頁面無水平溢出，姓名沒有被遮住或變可編輯。
    2. 觸控與滑鼠筆畫可保存，操作可到達；返回／交接沿原進度，沒有多收費或修改姓名。
  - **Evidence:** 兩視窗的表單／確認與簽名畫面；水平溢出檢查、觸控筆畫及操作結果。
  - **Last run:** 2026-11-09 13:48 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-026-form-1366.png](e2e-evidence/E2E-026-form-1366.png)、[e2e-evidence/E2E-026-signature-1366.png](e2e-evidence/E2E-026-signature-1366.png)、[e2e-evidence/E2E-026-handoff-1366.png](e2e-evidence/E2E-026-handoff-1366.png)、[e2e-evidence/E2E-026-form-390.png](e2e-evidence/E2E-026-form-390.png)、[e2e-evidence/E2E-026-signature-390.png](e2e-evidence/E2E-026-signature-390.png)、[e2e-evidence/E2E-026-handoff-390.png](e2e-evidence/E2E-026-handoff-390.png)
  - **Observed evidence:** 表單無水平溢出 1366；觸控姓名仍唯讀；手寫簽名成功保存；手寫簽名成功保存；失敗重試可操作；交接返回仍固定姓名；簽收無水平溢出 1366；表單無水平溢出 390；觸控姓名仍唯讀；手寫簽名成功保存；手寫簽名成功保存；失敗重試可操作；交接返回仍固定姓名；簽收無水平溢出 390；無未解決 browser error；本機防護注入 5 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-027 新增確認步驟仍遵守台北三日門檻
  - **Priority:** High
  - **Prerequisites:** 隔離瀏覽器測試時鐘；其餘八項有效。
  - **Steps:**
    1. 以台北 2026/11/08 18:00 測早於 11/11 00:00 與恰等於下限的提交，含姓名確認最後一步。
    2. 以台北 11/08 23:59 開啟姓名確認，宴客日填 11/11 18:00；時鐘到 11/09 00:01 才確認。
    3. 分別以台北 11/29、12/30 與裝置時區不同但同一實際時刻查看下限。
  - **Expected results:**
    1. 過早拒絕且保留姓名電話與其他輸入，恰等於下限接受，不要求滿 72 小時。
    2. 跨日確認以提交日重新計算至 11/12 00:00，拒絕建立並更新提示。
    3. 跨月／年下限為 12/02、2027/01/02；不同裝置時區仍一致依台北日曆。
  - **Evidence:** 時鐘／時區設定記錄、邊界及跨日錯誤畫面；日期計算另跑領域單元矩陣。
  - **Last run:** 2026-11-09 13:45 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-027-cross-midnight.png](e2e-evidence/E2E-027-cross-midnight.png)、[e2e-evidence/E2E-027-timezone.png](e2e-evidence/E2E-027-timezone.png)
  - **Observed evidence:** 欄位錯誤 2026-11-11；過早不建立 2026-11-08T18:00；欄位錯誤 2026-11-11；過早不建立 2026-11-10T23:59；午夜下限合法；欄位錯誤 2026-11-12；最後確認跨日重新驗證；跨月跨年門檻 2026-12-02；跨月跨年門檻 2027-01-02；裝置時區不改台北門檻 America/Los_Angeles；裝置時區不改台北門檻 Asia/Taipei；無未解決 browser error；本機防護注入 3 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 移除測試時鐘／時區覆寫，重設隔離情境。

- [x] E2E-028 原六欄驗證與多行料理仍正常
  - **Priority:** Medium
  - **Prerequisites:** 空白需求，姓名電話有效。
  - **Steps:**
    1. 逐一漏餐廳／日期，及填人數 0、-1、1.5、非正預算，或料理僅空白換行，嘗試提交。
    2. 修正合法值，料理輸入「前菜：沙拉」、Enter、「主菜：牛排」及長文字；確認送出。
    3. 切有權角色並重新整理，查看摘要。
  - **Expected results:**
    1. 原非法欄位仍拒絕且保留姓名電話；Enter 在料理只換行，不意外建立訂單。
    2. 料理分行及長文字保留並折行，無水平溢出；原六欄與新增兩欄均成功保存。
  - **Evidence:** 原驗證代表錯誤、兩行料理輸入與摘要，重新整理結果。
  - **Last run:** 2026-11-09 13:45 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-028-multiline.png](e2e-evidence/E2E-028-multiline.png)
  - **Observed evidence:** 欄位錯誤 餐廳；原驗證保留姓名；欄位錯誤 日期；原驗證保留姓名；欄位錯誤 人數；原驗證保留姓名；欄位錯誤 人數；原驗證保留姓名；欄位錯誤 人數；原驗證保留姓名；欄位錯誤 預算；原驗證保留姓名；欄位錯誤 料理；原驗證保留姓名；料理Enter不送出；料理跨角色刷新保存 宴客主人；料理跨角色刷新保存 平台管理者；料理跨角色刷新保存 合作餐廳；料理跨角色刷新保存 酒商甲；料理跨角色刷新保存 酒商乙；無未解決 browser error；本機防護注入 18 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

- [x] E2E-029 真正損壞資料仍保留恢復提示
  - **Priority:** High
  - **Prerequisites:** 隔離環境備有不合法舊狀態及缺必要資料但宣稱新版的樣本；只能作負向還原前置。
  - **Steps:**
    1. 分別還原負向樣本並開啟頁面。
    2. 查看恢復提示，在確認重設對話框先返回，再明確確認重設。
  - **Expected results:**
    1. 不能把不合法舊資料或缺欄新版當成可補填舊單；恢復前不覆寫原保存內容。
    2. 返回不變，只有確認才載入正常情境；不以資料錯誤宣稱付款成功。
  - **Evidence:** 恢復提示、原保存內容未變之讀取證據及重設後畫面。
  - **Last run:** 2026-11-09 13:45 Asia/Taipei — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-029-recovery-0.png](e2e-evidence/E2E-029-recovery-0.png)、[e2e-evidence/E2E-029-recovery-1.png](e2e-evidence/E2E-029-recovery-1.png)、[e2e-evidence/E2E-029-recovery-2.png](e2e-evidence/E2E-029-recovery-2.png)
  - **Observed evidence:** 顯示 原資料尚未覆寫；損壞不覆寫；返回不覆寫；顯示 從一場宴席開始；顯示 原資料尚未覆寫；損壞不覆寫；返回不覆寫；顯示 從一場宴席開始；顯示 原資料尚未覆寫；損壞不覆寫；返回不覆寫；顯示 從一場宴席開始；無未解決 browser error；本機防護注入 12 筆，CDP 來源稽核另存 network-audit.json；無產品外部服務或真實支付請求；browser errors: 0。
  - **Cleanup:** 重設隔離測試瀏覽器至「從空白需求開始」，不影響使用者原瀏覽器資料。

## Execution Summary

- 產品修復迭代：0 輪；首次產品實作已符合測試預期。測試工具校正了帶提示文字的欄位定位、載入後的角色切換及本機防護軟體注入的網路分類，均有重跑紀錄。
- 本機 Kaspersky 注入請求已由 CDP initiator 確認，原始稽核位於 ../../../../output/identity-e2e/network-audit.json；產品請求均為本機來源，未呼叫真實支付。沒有未解決的 browser console 或 page error。
- 91 張本次通過案例引用的非空 PNG 截圖位於 [e2e-evidence](e2e-evidence/)。舊的失敗診斷截圖保留，不代表目前仍失敗。
- 詳細交付與驗證結果見 [implementation-report.md](implementation-report.md)。

## Traceability

每個 delta 情境（含完整保留的既有情境）均列於下表。新單固定姓名的命令授權、竄改 payload、NaN／Infinity、金額溢位、任意重送及歷史來源偽造須另以領域／保存單元測試直接驗證；瀏覽器只測其可見行為，不暴露測試後門。

| Spec scenario | E2E case(s) | Notes |
|---|---|---|
| `banquet-matching: 從空白建立有效需求` | `E2E-003`、`E2E-004` | 瀏覽器驗證。 |
| `banquet-matching: 阻止無效需求` | `E2E-028` | 瀏覽器驗證。 |
| `banquet-matching: 阻止過早宴客日期` | `E2E-027` | 瀏覽器驗證。 |
| `banquet-matching: 接受最早日期邊界` | `E2E-027` | 瀏覽器驗證。 |
| `banquet-matching: 跨日提交重新驗證` | `E2E-027` | 瀏覽器驗證。 |
| `banquet-matching: 依台北日曆處理跨月跨年與裝置時區` | `E2E-027` | 瀏覽器驗證。 |
| `banquet-matching: 提交多行料理內容` | `E2E-028` | 瀏覽器驗證。 |
| `banquet-matching: 阻止只有空白或換行的料理內容` | `E2E-028` | 瀏覽器驗證。 |
| `banquet-matching: 姓名電話缺漏不得建立需求` | `E2E-001` | 瀏覽器驗證。 |
| `banquet-matching: 接受台灣手機及市話分機` | `E2E-002` | 瀏覽器驗證。 |
| `banquet-matching: 拒絕電話格式錯誤` | `E2E-002` | 瀏覽器驗證。 |
| `banquet-matching: 返回修改姓名後再送出` | `E2E-003` | 瀏覽器驗證。 |
| `banquet-matching: 提交後固定姓名` | `E2E-003`、`E2E-005` | 瀏覽器驗證。 |
| `banquet-matching: 正整數提案及免運可提交` | `E2E-009` | 瀏覽器驗證。 |
| `banquet-matching: 容量瓶數單價拒絕非法值` | `E2E-010` | 含 unsafe integer；NaN、Infinity 及組合溢位另做領域測試。 |
| `banquet-matching: 運費與固定餐廳費用限制` | `E2E-011` | 固定費用 UI 唯讀；竄改餐廳費用另在領域測試拒絕。 |
| `banquet-matching: 保存空白及小數草稿` | `E2E-012` | 瀏覽器驗證。 |
| `banquet-matching: 多酒款逐列驗證後重試` | `E2E-013` | 瀏覽器驗證。 |
| `demo-workspace: 酒商僅看簽收狀態及明細` | `E2E-008` | 瀏覽器驗證。 |
| `demo-workspace: 授權角色查看聯絡資料` | `E2E-007` | 瀏覽器驗證。 |
| `demo-workspace: 兩家酒商選定前後不見聯絡資料` | `E2E-007`、`E2E-008` | 瀏覽器驗證。 |
| `demo-workspace: 姓名不經簽收摘要或歷程洩漏` | `E2E-008` | 瀏覽器驗證。 |
| `demo-workspace: 未驗齡舊單一次補填` | `E2E-014` | 瀏覽器驗證。 |
| `demo-workspace: 補填不完整或非主人提交` | `E2E-015` | 瀏覽器驗證。 |
| `demo-workspace: 補填成功後不得重寫` | `E2E-014`、`E2E-015` | UI 驗無更名入口；不同姓名重送與保存後還原另做領域／保存測試。 |
| `demo-workspace: 已驗齡舊單補填後接續核對` | `E2E-016` | 瀏覽器驗證。 |
| `demo-workspace: 已簽未付舊單保留原簽名` | `E2E-018` | 瀏覽器驗證。 |
| `demo-workspace: 已付與終止舊單維持原結果` | `E2E-019`、`E2E-020` | 瀏覽器驗證。 |
| `demo-workspace: 補填或核對保存失敗可重試` | `E2E-024` | 瀏覽器驗證。 |
| `demo-workspace: 舊提交及選定提案可繼續` | `E2E-021`、`E2E-022` | 瀏覽器驗證。 |
| `demo-workspace: 舊草稿正式提交需修正` | `E2E-023` | 瀏覽器驗證。 |
| `demo-workspace: 舊已提交提案重新編輯送出` | `E2E-023` | 瀏覽器驗證。 |
| `demo-workspace: 新版展示入口可正常使用` | `E2E-025` | 瀏覽器驗證。 |
| `restaurant-fulfillment: 餐廳登錄通過` | `E2E-004` | 瀏覽器驗證。 |
| `restaurant-fulfillment: 未驗齡或未通過時不得購酒付款` | `E2E-006`、`E2E-014`、`E2E-016` | 瀏覽器驗證。 |
| `restaurant-fulfillment: 以需求姓名核對本人` | `E2E-004` | 瀏覽器驗證。 |
| `restaurant-fulfillment: 保存有效簽名` | `E2E-004` | 瀏覽器驗證。 |
| `restaurant-fulfillment: 空白與清除簽名` | `E2E-004`、`E2E-005` | 瀏覽器驗證。 |
| `restaurant-fulfillment: 明細變更必須重簽` | 非瀏覽器可直接觸發 | 已選定明細在 UI 不可修改，無合法瀏覽器操作可觸發；於 src/domain/checkout.test.ts 測快照遭變更時拒絕原簽名付款／代收，不另加產品後門。 |
| `restaurant-fulfillment: 簽名不能替換姓名` | `E2E-004`、`E2E-005` | UI 驗唯讀；不同姓名 payload、保存驗證及付款／代收阻擋另在 src/domain/checkout.test.ts 直接測試。 |
| `restaurant-fulfillment: 清除重簽沿用固定姓名` | `E2E-005` | 瀏覽器驗證。 |
| `restaurant-fulfillment: 已驗齡舊單待核對姓名` | `E2E-016` | 瀏覽器驗證。 |
| `restaurant-fulfillment: 指定餐廳核對後交給主人` | `E2E-016` | 瀏覽器驗證。 |
| `restaurant-fulfillment: 非餐廳或重複核對不得推進` | `E2E-016` | UI 驗入口與重複提交；非法角色／operationId 重送另在 src/domain/model.test.ts 測試。 |
| `restaurant-fulfillment: 舊單補填姓名核對失敗` | `E2E-017` | 瀏覽器驗證。 |
| `service-exceptions: 驗齡未過不得付款或交付` | `E2E-006` | 瀏覽器驗證。 |
| `service-exceptions: 新單姓名不符走未通過` | `E2E-006` | 瀏覽器驗證。 |
| `service-exceptions: 酒商完成取回` | `E2E-006`、`E2E-017`、`E2E-020` | 瀏覽器驗證。 |
| `service-exceptions: 記錄平台退回成本` | `E2E-006`、`E2E-017` | 瀏覽器驗證。 |
| `service-exceptions: 成本未填仍可追蹤實際取回` | `E2E-006` | 瀏覽器驗證。 |
| `service-exceptions: 保留原驗齡但終止簽收` | `E2E-017` | 瀏覽器驗證。 |
| `service-exceptions: 失敗後不得改名重驗` | `E2E-017` | 瀏覽器驗證。 |

補充整合覆蓋：E2E-024 驗保存原子性；E2E-025 驗四入口與新資料；E2E-026 驗既有桌機／觸控規格；E2E-029 驗真正損壞資料不可混入舊資料例外。單元與 build 的實際結果另列於實作紀錄，不在 propose 階段填通過。
