# E2E Testing Checklist

## Test Setup

- **Start URL / route:** `http://127.0.0.1:4173/`，固定建置預覽來源。
- **Viewport(s):** 桌機 `1366×768`，狀態與操作不能僅以顏色表示；手機精修不屬 P0。
- **Test data / accounts:** 無需登入，切換「宴客主人」「平台管理者」「酒商甲」「酒商乙」「合作餐廳」。餐廳為「暮光餐桌（示範合作餐廳）」。預填宴客日期使用當日後七天、Asia/Taipei。甲酒款 6000 元、配送 200 元；乙酒款 6600 元、配送 0 元；服務費 500 元、餐廳另收 300 元、分潤示範 10%。
- **Prerequisites:** 在專案根目錄執行 `npm.cmd ci`、`npm.cmd run test -- --run`、`npm.cmd run build`，再執行 `npm.cmd run preview`；保留啟動服務的 process handle，結束後停止。使用真正的 Playwright MCP 工具（原生工具或 `scripts/playwright-mcp-client.mjs` 的 MCP stdio `tools/call`）；不得改以直接 Playwright、HTTP 或單元測試充當 E2E。
- **Isolation:** 以隔離測試瀏覽器操作。每案先透過「展示工具」載入指定情境並在確認對話框按「確認」，不直接竄改業務狀態。案例中的「重新整理」須重載同一來源頁面。
- **Evidence:** 截圖存於本 change 的 `e2e-evidence/`，各案均須至少一張截圖及可觀測狀態。重要整合流程須檢查 browser console 與 network；不得有影響結果的未處理錯誤或真實支付請求。付款確認對話框僅顯示金額、收款方與模擬說明，不收集信用卡或證件資料。
- **Fault injection:** 僅 E2E-011 允許透過 MCP 瀏覽器評估工具，對本應用 key 注入損壞資料、錯誤版本，或暫時讓 Storage.setItem 拋錯，以驗證恢復與失敗提示。此為測試故障注入，不能據此偽造產品成功狀態。完成須還原方法、移除測試 key 並重設。

## 1. 需求、服務費與提案

- [x] E2E-001 六項需求驗證及跨角色共用
  - **Priority:** Critical
  - **Prerequisites:** 從「從空白需求開始」進入，角色為主人。
  - **Steps:**
    1. 空白提交「提交宴客需求」，確認錯誤指出日期欄位且無訂單。
    2. 填有效日期；測試未選餐廳、零／負數／非整數人數、零／負數預算，逐項修正後再提交。
    3. 填人數 12、料理「法式料理」、預算 6500、偏好不限，選暮光餐桌並提交。
    4. 切換平台管理者，再切酒商甲。
  - **Expected results:** 無效資料不建立訂單且指出錯誤；有效資料進入待付服務費，各身分顯示相同六項需求；酒商不能修改他家提案或執行餐廳驗齡。
  - **Evidence:** `e2e-evidence/E2E-001-request.png`；記錄無效欄位的可見錯誤與有效資料摘要。
  - **Last run:** `2026-11-07 22:37 Asia/Taipei` — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-001-request.png](e2e-evidence/E2E-001-request.png)
  - **Observed evidence:** [E2E-001 實測結果](e2e-evidence/E2E-001-result.json)；17 項可觀測檢查，無未解決瀏覽器錯誤。
  - **Cleanup:** 重設正常起點。

- [x] E2E-002 服務費門檻、模擬揭露與防重複付款
  - **Priority:** Critical
  - **Prerequisites:** 重設正常起點，主人提交預填需求。
  - **Steps:**
    1. 切平台與酒商甲，確認未付服務費無法邀請或送提案。
    2. 切主人，檢查兩種退款政策，開啟「模擬支付服務費」確認框。
    3. 核對收款方平台、500 元與模擬說明，確認付款；重複點擊付款按鈕（若仍存在）。
    4. 切平台，點「邀請兩家酒商」。
  - **Expected results:** 未付款有待付款原因；付款只一筆成功事件及 500 元，無真實卡號輸入；付款後才能邀請，酒商甲乙均受邀。
  - **Evidence:** `e2e-evidence/E2E-002-service-fee.png`；付款確認框、成功紀錄、console/network 無真實支付。
  - **Last run:** `2026-11-07 22:37 Asia/Taipei` — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-002-service-fee.png](e2e-evidence/E2E-002-service-fee.png)
  - **Observed evidence:** [E2E-002 實測結果](e2e-evidence/E2E-002-result.json)；11 項可觀測檢查，無未解決瀏覽器錯誤。
  - **Cleanup:** 重設正常起點。

- [x] E2E-003 提案缺項驗證、草稿、本人編輯與單份等待
  - **Priority:** High
  - **Prerequisites:** 正常起點完成服務費與邀請。
  - **Steps:**
    1. 切酒商甲，空白送出，確認未送出且欄位仍保留。
    2. 套用示範草稿，分別清除容量、瓶數、配送費、搭配理由、供貨限制，以及輸入負配送費，送出確認被拒絕。
    3. 恢復完整甲提案，保存草稿，再送出。切主人檢查可閱讀甲提案但不可選定。
    4. 切酒商乙，確認只有乙編輯表單、未出現餐廳驗齡；送出完整乙提案（配送費 0）。
  - **Expected results:** 缺項維持草稿；完整提案展示容量、數量、價格、理由與條件；一份時另一家待回覆，不能選定；兩份到齊才能比較。
  - **Evidence:** `e2e-evidence/E2E-003-proposals.png`；缺項提示、一份時等待、兩份有效提案。
  - **Last run:** `2026-11-07 22:37 Asia/Taipei` — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-003-proposals.png](e2e-evidence/E2E-003-proposals.png)
  - **Observed evidence:** [E2E-003 實測結果](e2e-evidence/E2E-003-result.json)；20 項可觀測檢查，無未解決瀏覽器錯誤。
  - **Cleanup:** 重設正常起點。

- [x] E2E-004 透明費用、超預算提醒與唯一選定鎖定
  - **Priority:** Critical
  - **Prerequisites:** 主人建立酒款預算 5500 元的需求，服務費已付，兩酒商提交示範提案。
  - **Steps:**
    1. 主人並列比較甲乙，核對相同欄位、甲總支出 7000 元與後續估計 6500 元、各收款方。
    2. 檢查超預算提醒但仍可選定；選甲並確認鎖定說明。
    3. 切甲、乙與主人，確認不能再改需求、價格或重選；乙無配送操作。
  - **Expected results:** 服務費不重複計入待付；餐廳另收明示；選定只建立意向，酒款未付款、無分潤，進入待餐廳安排，條件快照鎖定。
  - **Evidence:** `e2e-evidence/E2E-004-comparison.png`、`e2e-evidence/E2E-004-selected.png`。
  - **Last run:** `2026-11-07 22:37 Asia/Taipei` — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-004-comparison.png](e2e-evidence/E2E-004-comparison.png)、[e2e-evidence/E2E-004-selected.png](e2e-evidence/E2E-004-selected.png)
  - **Observed evidence:** [E2E-004 實測結果](e2e-evidence/E2E-004-result.json)；17 項可觀測檢查，無未解決瀏覽器錯誤。
  - **Cleanup:** 重設正常起點。

## 2. 正常與異常整合

- [x] E2E-005 從空白需求手動走完正常服務
  - **Priority:** Critical
  - **Prerequisites:** 從空白需求開始；不以異常情境載入跳過正常步驟。
  - **Steps:**
    1. 主人填六項需求、提交及模擬付服務費；平台邀請兩家酒商；甲乙各自套用並送出提案；主人選甲。
    2. 甲在餐廳未確認前無法出貨；餐廳填收貨時段並確認，甲標記出貨、送達。
    3. 確認送達尚不等於收貨，餐廳獨立確認收貨；重新整理並切回餐廳，仍待驗齡且酒款未付。
    4. 餐廳登錄驗齡通過；主人仍需明確確認購買，再在付款框確認酒商甲收款 6200 元（酒款 6000＋配送 200）。
    5. 檢查只有一筆 600 元餐廳分潤待結算；餐廳交付後主人確認收取。
    6. 重新整理，輪流切平台、甲、餐廳核對同一分潤、服務完成及時間紀錄；完成後不得再次推進。
  - **Expected results:** 每步角色與必要門檻均成立；未驗齡、未確認購買、未付款或未交付時沒有下一步完成操作；收款不含服務費或餐廳費用。最終服務完成、分潤仍待結算，無虛構分潤已支付，無敏感欄位或真實支付請求。
  - **Evidence:** `e2e-evidence/E2E-005-receipt.png`、`e2e-evidence/E2E-005-payment.png`、`e2e-evidence/E2E-005-completed.png`；console/network 結果與角色可見紀錄。
  - **Last run:** `2026-11-07 22:37 Asia/Taipei` — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-005-receipt.png](e2e-evidence/E2E-005-receipt.png)、[e2e-evidence/E2E-005-payment.png](e2e-evidence/E2E-005-payment.png)、[e2e-evidence/E2E-005-completed.png](e2e-evidence/E2E-005-completed.png)
  - **Observed evidence:** [E2E-005 實測結果](e2e-evidence/E2E-005-result.json)；31 項可觀測檢查，無未解決瀏覽器錯誤。
  - **Cleanup:** 重設正常起點。

- [x] E2E-006 餐廳取消、平台退款及異常鎖定
  - **Priority:** Critical
  - **Prerequisites:** 載入餐廳取消前。
  - **Steps:**
    1. 核對已付服務費、兩提案已送且選甲、未配送；餐廳展開無法配合區，不填原因嘗試取消，再填原因確認取消。
    2. 切主人、甲、乙與餐廳，確認無配送、驗齡、付款或交付，亦無非平台退款動作。
    3. 切平台，確認全額模擬退款 500 元；重新整理後檢查結果。
    4. 嘗試重複退款（若按鈕存在），核對原付款與一筆退款事件。
  - **Expected results:** 原因必填；取消待退款不能恢復正常服務；最終已取消／已退款、退款 500 元、平台淨服務費 0 元、酒款未付、未產生分潤、不另收罰款，無重複退款。
  - **Evidence:** `e2e-evidence/E2E-006-cancelled.png`；原因、退款、時間與 console/network。
  - **Last run:** `2026-11-07 22:37 Asia/Taipei` — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-006-cancelled.png](e2e-evidence/E2E-006-cancelled.png)
  - **Observed evidence:** [E2E-006 實測結果](e2e-evidence/E2E-006-result.json)；29 項可觀測檢查，無未解決瀏覽器錯誤。
  - **Cleanup:** 重設正常起點。

- [x] E2E-007 驗齡失敗、酒商取回及取回後補登成本
  - **Priority:** Critical
  - **Prerequisites:** 載入餐廳驗齡前。
  - **Steps:**
    1. 餐廳選驗齡未通過，空原因送出應受阻；填「現場無法確認符合年齡」再送出。
    2. 切主人、餐廳、乙，確認不能付款、改驗齡、交付或代甲確認取回。
    3. 甲確認已取回，重新整理核對「已退回／服務未完成」與運費仍待登錄。
    4. 平台輸入空白與負運費應受阻；輸入 200 元登錄，重新整理核對結果。
  - **Expected results:** 失敗後立即待退回，服務費 500 元已付不退；酒款未付、無分潤、主人新增應付 0 元；取回不須等待成本，補登不改取回或驗齡結果。
  - **Evidence:** `e2e-evidence/E2E-007-pending.png`、`e2e-evidence/E2E-007-returned.png`、`e2e-evidence/E2E-007-cost.png`；console/network。
  - **Last run:** `2026-11-07 22:37 Asia/Taipei` — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-007-pending.png](e2e-evidence/E2E-007-pending.png)、[e2e-evidence/E2E-007-returned.png](e2e-evidence/E2E-007-returned.png)、[e2e-evidence/E2E-007-cost.png](e2e-evidence/E2E-007-cost.png)
  - **Observed evidence:** [E2E-007 實測結果](e2e-evidence/E2E-007-result.json)；23 項可觀測檢查，無未解決瀏覽器錯誤。
  - **Cleanup:** 重設正常起點。

- [x] E2E-008 取回前登錄零成本仍須由選定酒商取回
  - **Priority:** High
  - **Prerequisites:** 載入驗齡前，餐廳填原因並登錄未通過。
  - **Steps:**
    1. 平台將退回成本明確輸入 0 元並登錄。
    2. 確認訂單仍待退回，切甲確認取回，再核對狀態。
  - **Expected results:** 明確 0 元與待登錄有別，成本不自動完成取回；最終仍為服務未完成、酒款未付及無分潤。
  - **Evidence:** `e2e-evidence/E2E-008-zero-cost.png`。
  - **Last run:** `2026-11-07 22:37 Asia/Taipei` — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-008-zero-cost.png](e2e-evidence/E2E-008-zero-cost.png)
  - **Observed evidence:** [E2E-008 實測結果](e2e-evidence/E2E-008-result.json)；4 項可觀測檢查，無未解決瀏覽器錯誤。
  - **Cleanup:** 重設正常起點。

## 3. 保存、恢復與展示

- [x] E2E-009 四入口、替換確認與無資料殘留
  - **Priority:** High
  - **Prerequisites:** 已完成一筆正常或異常示範；由該案結果開始。
  - **Steps:**
    1. 點重設正常起點，在確認框按返回，核對舊狀態保留。
    2. 再重設並確認，重新整理，確認沒有前次選定、付款、驗齡、退款退回或分潤。
    3. 依次載入取消前、驗齡前、空白需求，核對各前置資料與可執行角色步驟；最後回正常起點。
  - **Expected results:** 確認前不取代資料；空白不預填，正常起點預填但未付款，取消前已選定未配送，驗齡前已餐廳收貨未驗齡未購酒。無前次事件殘留。
  - **Evidence:** `e2e-evidence/E2E-009-reset.png`；各入口可見狀態與確認框。
  - **Last run:** `2026-11-07 22:37 Asia/Taipei` — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-009-reset.png](e2e-evidence/E2E-009-reset.png)
  - **Observed evidence:** [E2E-009 實測結果](e2e-evidence/E2E-009-result.json)；9 項可觀測檢查，無未解決瀏覽器錯誤。
  - **Cleanup:** 重設正常起點。

- [x] E2E-010 重複操作與已完成紀錄唯讀
  - **Priority:** High
  - **Prerequisites:** 正常起點提交需求，或由 E2E-005 的完成狀態開始後再獨立重設建立需求。
  - **Steps:**
    1. 付款確認時快速重複點確認，檢查成功付款事件只一筆。
    2. 手動完成正常流程（可使用 E2E-005 的同樣操作順序，但本案須獨立確認結果），切換所有身分、重新整理。
    3. 檢查完成狀態無再次配送、驗齡、付款、交付與收取操作；比對付款與分潤仍一筆。
  - **Expected results:** 付款 500／6200 元不重複、分潤 600 元不重複、完成事件只有一筆；時間與執行角色可追溯。實際錯誤角色送出及重複命令的資料層防護另由 Vitest 驗證。
  - **Evidence:** `e2e-evidence/E2E-010-idempotency.png`；可見單一完成紀錄與分潤、保存的事件數量觀察。
  - **Last run:** `2026-11-07 22:37 Asia/Taipei` — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-010-idempotency.png](e2e-evidence/E2E-010-idempotency.png)
  - **Observed evidence:** [E2E-010 實測結果](e2e-evidence/E2E-010-result.json)；62 項可觀測檢查，無未解決瀏覽器錯誤。
  - **Cleanup:** 重設正常起點。

- [x] E2E-011 儲存故障、損壞與版本恢復不靜默覆寫
  - **Priority:** High
  - **Prerequisites:** 隔離瀏覽器；本案可使用 Test Setup 定義的儲存故障注入。
  - **Steps:**
    1. 正常起點建立待付款訂單，記錄狀態；暫時讓 Storage.setItem 拋錯，嘗試付款，檢查保存失敗與可重試提示。
    2. 還原儲存方法並重新整理，確認仍是原本待付款狀態；重新付款應成功。
    3. 對本應用 key 分別寫入損壞 JSON 與不符 schemaVersion 的資料，重載後確認恢復提示，原內容不被自動覆寫。
    4. 確認重設正常起點，核對恢復；測試加入的無關 key 不受影響。
  - **Expected results:** 保存失敗不能顯示已保存成功或推進付款；損壞及版本不符須使用者確認才重設，其他應用 key 保留。
  - **Evidence:** `e2e-evidence/E2E-011-save-failure.png`、`e2e-evidence/E2E-011-recovery.png`；原值保留與還原後成功的觀察紀錄。
  - **Last run:** `2026-11-07 22:37 Asia/Taipei` — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-011-save-failure.png](e2e-evidence/E2E-011-save-failure.png)、[e2e-evidence/E2E-011-recovery.png](e2e-evidence/E2E-011-recovery.png)
  - **Observed evidence:** [E2E-011 實測結果](e2e-evidence/E2E-011-result.json)；13 項可觀測檢查，無未解決瀏覽器錯誤。
  - **Cleanup:** 還原 Storage.setItem，移除本案無關測試 key，確認重設正常起點。

- [x] E2E-012 桌機鍵盤操作、模擬標示與八分鐘演練
  - **Priority:** High
  - **Prerequisites:** 1366×768、重設正常起點、依 docs/demo-runbook.md 計時腳本。
  - **Steps:**
    1. 以 Tab 及 Enter 操作身分切換、主要表單／按鈕及確認框；核對焦點、可見標籤與文字狀態。
    2. 依手冊八分鐘節奏演練正常服務與兩種異常，記錄開始、各段檢核與結束時間。可由 MCP 分段操作並為各段保留講解時間。
    3. 核對主要身分、狀態與動作可辨識，表格僅自身區域捲動；檢查 console/network，無真實支付或非必要外部服務。
  - **Expected results:** 八分鐘內可完整呈現主線與兩條異常，無無作用的主要按鈕，主要操作可用鍵盤，畫面明示模擬與資料限制。P1 未提供結算操作不算失敗。
  - **Evidence:** `e2e-evidence/E2E-012-desktop.png`；演練計時紀錄、鍵盤操作與 console/network 結果。
  - **Last run:** `2026-11-07 23:02 Asia/Taipei` — PASS
  - **Screenshot evidence:** [e2e-evidence/E2E-012-desktop.png](e2e-evidence/E2E-012-desktop.png)
  - **Observed evidence:** [計時與鍵盤操作紀錄](e2e-evidence/E2E-012-result.json)；479014 ms（7 分 59 秒），正常與兩異常於前七分鐘內完成。[console](e2e-evidence/browser-console.txt) 為 0 errors／0 warnings。
  - **Cleanup:** 重設正常起點並停止本次啟動的服務與測試瀏覽器。

## Traceability

所有案例均為實作後執行，未勾選不代表已通過。各 spec scenario 的對照表列於下方；無法透過正常 UI 直接送出非法命令的情境，同時使用資料層測試驗證，不能只憑隱藏按鈕宣稱防護有效。

| Spec scenario | E2E case(s) | Notes |
|---|---|---|
| `banquet-matching: 從空白建立有效需求` | `E2E-001`、`E2E-005` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `banquet-matching: 阻止無效需求` | `E2E-001` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `banquet-matching: 未付款不得邀請` | `E2E-002` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `banquet-matching: 主人完成服務費模擬付款` | `E2E-002`、`E2E-005` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `banquet-matching: 酒商送出完整提案` | `E2E-003`、`E2E-005` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `banquet-matching: 提案缺項不得送出` | `E2E-003` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `banquet-matching: 費用比較無重複計算` | `E2E-004` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `banquet-matching: 只有一份提案時尚不能選定` | `E2E-003` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `banquet-matching: 選定後進入協調` | `E2E-004`、`E2E-005` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `banquet-matching: 選定後禁止改價與重選` | `E2E-004` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `demo-workspace: 主人切換至酒商` | `E2E-001`、`E2E-003` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `demo-workspace: 非法角色動作不改變狀態` | `E2E-001`、`E2E-003`、`E2E-006`、`E2E-007` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `demo-workspace: 重新整理後繼續交付` | `E2E-005` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `demo-workspace: 無法保存時顯示錯誤` | `E2E-011` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `demo-workspace: 載入餐廳取消情境` | `E2E-006`、`E2E-009` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `demo-workspace: 載入驗齡失敗情境` | `E2E-007`、`E2E-009` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `demo-workspace: 重設不殘留前次資料` | `E2E-009` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `demo-workspace: 觀眾辨識模擬付款` | `E2E-002`、`E2E-005`、`E2E-012` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `demo-workspace: 同一付款重複點擊` | `E2E-010` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `restaurant-fulfillment: 確認安排後開始配送` | `E2E-005` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `restaurant-fulfillment: 收貨安排未確認` | `E2E-005` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `restaurant-fulfillment: 餐廳確認收到酒` | `E2E-005` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `restaurant-fulfillment: 餐廳登錄通過` | `E2E-005` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `restaurant-fulfillment: 未驗齡或未通過時不得購酒付款` | `E2E-005`、`E2E-007` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `restaurant-fulfillment: 完成酒商收款模擬` | `E2E-005` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `restaurant-fulfillment: 未確認購買不得付款` | `E2E-005` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `restaurant-fulfillment: 正常完成服務` | `E2E-005` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `restaurant-fulfillment: 阻止提早完成` | `E2E-005` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `restaurant-fulfillment: 重複確認收取` | `E2E-010` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `restaurant-revenue-share: 顯示完整費用流向` | `E2E-004`、`E2E-005` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `restaurant-revenue-share: 成交分潤正確排除其他費用` | `E2E-005` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `restaurant-revenue-share: 付款後形成唯一紀錄` | `E2E-005`、`E2E-010` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `restaurant-revenue-share: 失敗訂單不產生分潤` | `E2E-006`、`E2E-007`、`E2E-008` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `restaurant-revenue-share: 服務完成但分潤尚待結算` | `E2E-005` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `service-exceptions: 無法配合收貨而取消` | `E2E-006` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `service-exceptions: 取消退款完成` | `E2E-006` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `service-exceptions: 防止退款重複與錯誤角色` | `E2E-006` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `service-exceptions: 驗齡未過不得付款或交付` | `E2E-007` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `service-exceptions: 酒商完成取回` | `E2E-007`、`E2E-008` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `service-exceptions: 記錄平台退回成本` | `E2E-007`、`E2E-008` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `service-exceptions: 成本未填仍可追蹤實際取回` | `E2E-007` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
| `service-exceptions: 驗齡失敗後不能切換角色繞過` | `E2E-007` | 瀏覽器可見結果與截圖；非法命令、重複及數值邊界另由 src/domain/model.test.ts 驗證。 |
