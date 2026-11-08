# E2E Testing Checklist

本清單已於 2026/11/08 使用 Playwright MCP 於實作後執行，11/11 通過、0 失敗、0 跳過。案例 ID 以本 change 為範圍，不沿用封存 change 的通過結果；各案下方保留實測結果與截圖連結。

## Test Setup

- **Start URL / route:** `http://127.0.0.1:4173/`，使用建置預覽；開發來源 5173 的資料不作為本次驗收前置資料。
- **Viewport(s):** 桌機 1366×768；本 change 不新增手機版驗收要求。
- **Test data / accounts:** 無需登入；可見身分為「宴客主人」「平台管理者」「酒商甲」「酒商乙」「合作餐廳」。餐廳選「暮光餐桌（示範合作餐廳）」。除案例另述，填人數 12、料理「法式料理」、酒款總預算 6500、偏好「不限」。
- **Prerequisites:** 實作後執行 `npm.cmd run test -- --run`、`npm.cmd run build`、`npm.cmd run preview`，保留自己啟動的 process handle。不得以 `npm run dev` 的舊建置替代驗收來源。
- **Time / timezone control:** 透過 Playwright MCP 的程式執行工具在導航前安裝可控制的頁面時鐘，預設為 `2026-11-08T18:00:00+08:00`，瀏覽器時區 Asia/Taipei；每案重新建立隔離環境。跨日使用時鐘前進且不重新整理表單；UTC 情境以 MCP 建立時區為 UTC 的隔離 context。時鐘控制須適用於重新整理後的頁面；每次導航及重新整理後先確認實際時刻。若可用 MCP 工具無法控制時間／時區，明確記錄受阻，不將單元測試當作 E2E 通過。
- **Isolation / reset:** 僅操作隔離測試來源。點「從空白需求開始」或「重設正常起點」後，在「取代目前展示資料？」對話框按「確認」。每案還原時鐘、時區及故障注入；不改作業系統時間，不操作使用者的現有展示資料。
- **Legacy fixture:** 後續 apply 的任何程式修改前，以舊版建置預覽、上述固定時鐘及公開 UI，從空白需求建立宴客時間 `2026-11-07T18:00` 的訂單並完成模擬服務費付款；保存畫面、訂單編號與原始應用 key 的真實內容為 `e2e-evidence/legacy-v1-state.json`。這是 E2E-009 的輸入，不代表新版本允許新建過去需求；不得手工製造成功事件或修改快照欄位。
- **Allowed inspection / injection:** 可唯讀檢查本應用 key 的訂單、事件與換行；E2E-009 僅允許原樣還原上述舊版快照；E2E-010 僅允許暫時讓保存方法拋錯並完整還原。其餘狀態透過 UI 建立，不直接改寫業務狀態。
- **Evidence / dependencies:** 所有證據存本 change 的 `e2e-evidence/`，以案例 ID 命名，記錄測試時刻、時區、可見結果與必要截圖。各案檢查 console/page error；整合案保存 network 摘要且不得有真實付款請求。沒有外部服務或帳密依賴。只有實際驗證通過才勾選。

## 1. 日期下限與提交驗證

- [x] E2E-001 日期提示、過早日期與既有必填驗證
  - **Priority:** Critical
  - **Prerequisites:** 預設固定時鐘，從空白需求開始，主人身分。
  - **Steps:**
    1. 查看「宴客日期與時間」及日期選擇器，記錄提示與下限；嘗試選擇 11/10 與 11/11。
    2. 空白點「提交宴客需求」；填入 11/11 18:00 後提交未選餐廳的需求，再逐一檢查人數 0、-1、1.5 及預算 0、-1，修正前一步後才測下一項。
    3. 填妥其餘有效欄位；分別手動填入 `2026-11-07T18:00`、`2026-11-08T18:00`、`2026-11-09T18:00` 與 `2026-11-10T23:59`，每次點「提交宴客需求」。
    4. 修正日期為 `2026-11-11T18:00` 並提交。
  - **Expected results:** 提示呈現 Asia/Taipei、至少三個日曆日與最早 2026/11/11；選擇器將早於下限的值標為不可用或無效。每次無效提交均顯示對應欄位錯誤，不建立訂單、不產生成功事件，保留已填資料；有效提交才進入「待付服務費」。
  - **Evidence:** `E2E-001-date-validation.png`；保存下限值、日期錯誤、保留的欄位與成功狀態，唯讀確認無效提交時沒有訂單。
  - **Last run:** `2026-11-08 21:52 Asia/Taipei` — PASS
  - **Screenshot evidence:** [`e2e-evidence/E2E-001-date-validation.png`](e2e-evidence/E2E-001-date-validation.png)、[`e2e-evidence/E2E-001-date-success.png`](e2e-evidence/E2E-001-date-success.png)
  - **Observed evidence:** [實測結果](e2e-evidence/E2E-001-result.json)；39 項可觀測檢查，console/page error 0；本機防護軟體注入流量另附 CDP initiator。
  - **Cleanup:** 從空白需求開始並確認重設，關閉隔離環境。

- [x] E2E-002 三天後午夜邊界可提交
  - **Priority:** Critical
  - **Prerequisites:** 台北 2026/11/08 18:00，空白需求。
  - **Steps:**
    1. 填妥有效需求，日期填 `2026-11-11T00:00`，點「提交宴客需求」。
    2. 切換「平台管理者」，再切「酒商甲」，查看需求摘要。
  - **Expected results:** 雖不足完整 72 小時仍成功建立一筆訂單；各角色顯示同一個 2026/11/11 00:00 宴客時間及其餘需求，狀態為待付服務費。
  - **Evidence:** `E2E-002-midnight-boundary.png`；記錄固定時刻、宴客時間、訂單編號與跨角色一致性。
  - **Last run:** `2026-11-08 21:53 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-002-midnight-boundary.png](e2e-evidence/E2E-002-midnight-boundary.png)
  - **Observed evidence:** [實測結果](e2e-evidence/E2E-002-result.json)；11 項檢查，console/page error 0；原始網路紀錄及存在時的本機防護軟體 CDP initiator 一併保留。
  - **Cleanup:** 重設空白需求並關閉隔離環境。

- [x] E2E-003 開著表單跨午夜後重新驗證
  - **Priority:** Critical
  - **Prerequisites:** 台北 2026/11/08 23:59，空白需求。
  - **Steps:**
    1. 填妥需求，日期填 `2026-11-11T18:00`，先不提交。
    2. 保留同一表單、不重新整理，透過 MCP 將時鐘前進至台北 2026/11/09 00:01。
    3. 點「提交宴客需求」，查看錯誤、日期提示及所有輸入。
    4. 只修正日期為 `2026-11-12T00:00`，再次提交。
  - **Expected results:** 第一次提交被拒絕，門檻及提示更新為 2026/11/12，原欄位保留；修正後成功進入待付服務費，只建立一筆訂單與一次建立事件。
  - **Evidence:** `E2E-003-rollover.png`；保留跨日前後時鐘、拒絕與修正成功的可見紀錄。
  - **Last run:** `2026-11-08 21:53 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-003-rollover.png](e2e-evidence/E2E-003-rollover.png)、[E2E-003-rollover-success.png](e2e-evidence/E2E-003-rollover-success.png)
  - **Observed evidence:** [實測結果](e2e-evidence/E2E-003-result.json)；14 項檢查，console/page error 0；原始網路紀錄及存在時的本機防護軟體 CDP initiator 一併保留。
  - **Cleanup:** 重設空白需求並還原時鐘，關閉隔離環境。

- [x] E2E-004 跨月、跨年與不同裝置時區
  - **Priority:** High
  - **Prerequisites:** 每個資料列使用獨立空白需求及指定時鐘／瀏覽器時區。
  - **Steps:**
    1. 依下表設定環境後導航並重設空白需求，查看日期提示。
    2. 填妥需求，先以預期下限前一分鐘提交，再修正為下限當日 00:00 提交；每列分開記錄。
  - **Test data:**

    | 現在時刻 | 瀏覽器時區 | 預期最早日期 |
    |---|---|---|
    | `2026-11-29T10:00:00+08:00` | Asia/Taipei | 2026/12/02 |
    | `2026-12-30T10:00:00+08:00` | Asia/Taipei | 2027/01/02 |
    | `2026-11-09T00:30:00+08:00` | UTC | 2026/11/12 |
    | `2026-11-09T00:30:00+08:00` | Asia/Taipei | 2026/11/12 |

  - **Expected results:** 每列下限與提示符合台北日曆；前一分鐘被拒絕、邊界被接受；後兩列的裝置日期不同但結果一致。
  - **Evidence:** `E2E-004-calendar-timezone.png` 及四列結果表，記錄實際頁面時刻與瀏覽器時區。
  - **Last run:** `2026-11-08 21:53 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-004-calendar-row-1.png](e2e-evidence/E2E-004-calendar-row-1.png)、[E2E-004-calendar-row-2.png](e2e-evidence/E2E-004-calendar-row-2.png)、[E2E-004-calendar-row-3.png](e2e-evidence/E2E-004-calendar-row-3.png)、[E2E-004-calendar-timezone.png](e2e-evidence/E2E-004-calendar-timezone.png)
  - **Observed evidence:** [實測結果](e2e-evidence/E2E-004-result.json)；33 項檢查，console/page error 0；原始網路紀錄及存在時的本機防護軟體 CDP initiator 一併保留。
  - **Cleanup:** 每列重設；最後關閉測試 context 並還原預設時區。

## 2. 多行料理輸入與呈現

- [x] E2E-005 Enter 分行、跨角色摘要與重新整理
  - **Priority:** Critical
  - **Prerequisites:** 預設固定時鐘，空白需求，其餘欄位填有效值，日期 2026/11/11 18:00。
  - **Steps:**
    1. 聚焦「菜色或料理類型」，輸入「前菜：沙拉」，實際按 Enter，再輸入「主菜：牛排」。
    2. 確認仍在原表單，再點「提交宴客需求」。
    3. 依序切換平台管理者、酒商甲、酒商乙及合作餐廳，逐一查看需求摘要；重新整理並回到宴客主人。
  - **Expected results:** Enter 新增一行而未提交；正式提交後及各角色摘要均顯示相同兩行，重新整理後仍保留換行。唯讀保存資料包含原兩行文字，不變成單行或 HTML。
  - **Evidence:** `E2E-005-multiline.png`；記錄 Enter 後仍在表單、跨角色及重新整理結果與字串換行。
  - **Last run:** `2026-11-08 21:53 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-005-enter.png](e2e-evidence/E2E-005-enter.png)、[E2E-005-multiline.png](e2e-evidence/E2E-005-multiline.png)
  - **Observed evidence:** [實測結果](e2e-evidence/E2E-005-result.json)；21 項檢查，console/page error 0；原始網路紀錄及存在時的本機防護軟體 CDP initiator 一併保留。
  - **Cleanup:** 重設空白需求並關閉隔離環境。

- [x] E2E-006 僅空白與換行的料理仍被拒絕
  - **Priority:** High
  - **Prerequisites:** 預設固定時鐘及有效的其他需求欄位。
  - **Steps:**
    1. 料理欄位分別填入空字串、三個空白、兩次 Enter、空白與 Enter 的組合，每次點提交。
    2. 將料理修正為「主菜：牛排」後再次提交。
  - **Expected results:** 四種無內容輸入均指出菜色或料理類型必填，沒有訂單且保留其他欄位；修正後可建立需求。
  - **Evidence:** `E2E-006-cuisine-required.png`；記錄四種拒絕與修正後狀態。
  - **Last run:** `2026-11-08 21:53 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-006-cuisine-required.png](e2e-evidence/E2E-006-cuisine-required.png)
  - **Observed evidence:** [實測結果](e2e-evidence/E2E-006-result.json)；18 項檢查，console/page error 0；原始網路紀錄及存在時的本機防護軟體 CDP initiator 一併保留。
  - **Cleanup:** 重設空白需求並關閉隔離環境。

- [x] E2E-007 長料理文字在桌機自動折行且可操作
  - **Priority:** High
  - **Prerequisites:** 預設固定時鐘，1366×768，空白需求。
  - **Steps:**
    1. 填妥有效需求；料理輸入前菜、主菜、甜點三行，每行重複「菜單描述」至至少 120 個中文字，最後加一行由 160 個連續英文字母 A 組成的文字。
    2. 查看料理輸入區的折行，必要時垂直捲動找到提交按鈕並提交。
    3. 切換各示範身分，查看料理摘要，透過正常捲動操作角色按鈕及目前可用的主要動作。
  - **Expected results:** 手動分行被保留，長中文及無空白英文字串均依寬度折行；頁面無水平溢出、遮蔽或文字截斷；主要操作可辨識並可使用。
  - **Evidence:** `E2E-007-desktop-wrap.png`；輸入區與摘要各一個關鍵視圖，可唯讀量測頁面寬度輔助判斷溢出。
  - **Last run:** `2026-11-08 21:53 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-007-input-wrap.png](e2e-evidence/E2E-007-input-wrap.png)、[E2E-007-desktop-wrap.png](e2e-evidence/E2E-007-desktop-wrap.png)
  - **Observed evidence:** [實測結果](e2e-evidence/E2E-007-result.json)；31 項檢查，console/page error 0；原始網路紀錄及存在時的本機防護軟體 CDP initiator 一併保留。
  - **Cleanup:** 重設空白需求並關閉隔離環境。

## 3. 保存相容性與既有流程整合

- [x] E2E-008 訂單日期接近及過期後仍能還原
  - **Priority:** Critical
  - **Prerequisites:** 台北 2026/11/08 18:00，空白需求。
  - **Steps:**
    1. 以有效需求及 2026/11/11 18:00 建立訂單；點「模擬支付服務費」，核對金額 500 元與平台為收款方後確認。
    2. 記錄訂單編號、需求、付款及事件；將時鐘前進至台北 2026/11/10 18:00，重新整理，切換平台管理者並查看。
    3. 再將時鐘前進至台北 2026/11/12 18:00，重新整理並切換主人查看。
  - **Expected results:** 日期不足三天及已過期兩個時間點均還原原訂單與付款，狀態仍為待平台邀請；沒有資料損壞、要求重設、自動取消或新增業務事件。
  - **Evidence:** `E2E-008-aged-order.png`；保存前後相同訂單編號、原需求、500 元付款及事件比對。
  - **Last run:** `2026-11-08 21:54 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-008-aged-order.png](e2e-evidence/E2E-008-aged-order.png)
  - **Observed evidence:** [實測結果](e2e-evidence/E2E-008-result.json)；13 項檢查，console/page error 0；原始網路紀錄及存在時的本機防護軟體 CDP initiator 一併保留。
  - **Cleanup:** 重設空白需求、還原時鐘並關閉隔離環境。

- [x] E2E-009 舊版過早日期快照可繼續使用
  - **Priority:** Critical
  - **Prerequisites:** Test Setup 指定的舊版真實快照與其建立證據已存在，新版本預覽已啟動。
  - **Steps:**
    1. 在新的隔離 context 原樣還原舊版快照至相同測試來源的應用 key，再以預設固定時鐘導航。
    2. 查看原訂單日期、編號及已付服務費，切換平台管理者。
    3. 點「邀請兩家酒商」，再切酒商甲查看受邀需求。
  - **Expected results:** 原過去日期不導致載入失敗；原付款與需求一致，仍可依原流程邀請酒商。只有本次邀請增加對應事件，不要求改期、重設或版本升級。
  - **Evidence:** `E2E-009-legacy.png`；保存快照來源、載入及邀請結果，明確區分歷史載入與新建日期規則。
  - **Last run:** `2026-11-08 21:54 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-009-legacy.png](e2e-evidence/E2E-009-legacy.png)
  - **Observed evidence:** [實測結果](e2e-evidence/E2E-009-result.json)；11 項檢查，console/page error 0；原始網路紀錄及存在時的本機防護軟體 CDP initiator 一併保留。
  - **Cleanup:** 透過展示工具重設本應用資料，關閉隔離環境；保留測試快照作為證據。

- [x] E2E-010 保存失敗保留多行輸入並可重試
  - **Priority:** High
  - **Prerequisites:** 預設固定時鐘、空白需求；先完成重設再啟用故障注入。
  - **Steps:**
    1. 填妥有效需求與兩行料理，透過 MCP 暫時讓瀏覽器保存操作拋錯。
    2. 點「提交宴客需求」，查看錯誤、狀態與原欄位。
    3. 還原保存功能，不重新整理，直接再次提交並重新整理核對。
  - **Expected results:** 保存失敗有明確提示，維持尚未建立訂單的已確認狀態，表單及多行文字保留；恢復後成功且只有一筆訂單及一次建立事件，重新整理正常。
  - **Evidence:** `E2E-010-save-retry.png`；保存失敗與成功重試的可見狀態，確認故障注入已還原。
  - **Last run:** `2026-11-08 21:54 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-010-save-failure.png](e2e-evidence/E2E-010-save-failure.png)、[E2E-010-save-retry.png](e2e-evidence/E2E-010-save-retry.png)
  - **Observed evidence:** [實測結果](e2e-evidence/E2E-010-result.json)；11 項檢查，console/page error 0；原始網路紀錄及存在時的本機防護軟體 CDP initiator 一併保留。
  - **Cleanup:** 必須先還原保存方法，再重設空白需求並關閉隔離環境。

- [x] E2E-011 預填情境、收貨保存與模擬付款回歸
  - **Priority:** High
  - **Prerequisites:** 預設固定時鐘，獨立隔離環境。
  - **Steps:**
    1. 點「重設正常起點」並確認，查看預填宴客時間 2026/11/15 18:00，提交需求並開啟服務費模擬付款對話框，檢查金額與收款方後返回。
    2. 點「載入餐廳驗齡前」並確認，記錄訂單及收貨紀錄；重新整理並切回合作餐廳。
    3. 登錄驗齡「通過」，切主人點「確認現場購買」，再開啟「模擬支付酒款」對話框並核對內容後返回。
  - **Expected results:** 預填日期仍為台北當日後七天且可提交；情境載入後收貨紀錄仍在、下一步為待餐廳驗齡，沒有倒退或跳至完成；兩種付款均顯示模擬用途、金額與正確收款方，不要求卡號或發出真實支付請求。
  - **Evidence:** `E2E-011-regression.png`；保存預填與收貨重新整理結果、兩個付款對話框文字，以及 console/network 摘要。
  - **Last run:** `2026-11-08 21:54 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-011-service-dialog.png](e2e-evidence/E2E-011-service-dialog.png)、[E2E-011-receipt.png](e2e-evidence/E2E-011-receipt.png)、[E2E-011-regression.png](e2e-evidence/E2E-011-regression.png)
  - **Observed evidence:** [實測結果](e2e-evidence/E2E-011-result.json)；12 項檢查，console/page error 0；原始網路紀錄及存在時的本機防護軟體 CDP initiator 一併保留。
  - **Cleanup:** 返回付款對話框，重設空白需求並關閉隔離環境；停止自己啟動的預覽服務。

## Traceability

| Spec scenario | E2E case(s) | Notes |
|---|---|---|
| `banquet-matching: 從空白建立有效需求` | E2E-001、E2E-002、E2E-005 | 建立成功及跨角色內容 |
| `banquet-matching: 阻止無效需求` | E2E-001 | 原有人數、預算、餐廳及日期必填回歸 |
| `banquet-matching: 阻止過早宴客日期` | E2E-001、E2E-004 | 選擇器及手動輸入 |
| `banquet-matching: 接受最早日期邊界` | E2E-002 | 午夜包含邊界 |
| `banquet-matching: 跨日提交重新驗證` | E2E-003 | 原頁面跨日、修正重試 |
| `banquet-matching: 依台北日曆處理跨月跨年與裝置時區` | E2E-004 | 額外閏日及不可能日期由領域單元測試補強，未當作瀏覽器已通過 |
| `banquet-matching: 提交多行料理內容` | E2E-005 | 真正按 Enter 與正式提交分開 |
| `banquet-matching: 阻止只有空白或換行的料理內容` | E2E-006 | 空字串、空白、換行與混合 |
| `demo-workspace: 重新整理後繼續交付` | E2E-011 | 收貨狀態保持 |
| `demo-workspace: 無法保存時顯示錯誤` | E2E-010 | 保存失敗與恢復重試 |
| `demo-workspace: 日期接近或已過仍可還原訂單` | E2E-008 | 日期兩種時間點及付款紀錄 |
| `demo-workspace: 舊版已保存訂單維持相容` | E2E-009 | 舊版真實快照原樣還原 |
| `demo-workspace: 多行料理跨重新整理與角色切換保存` | E2E-005 | 主人、平台、兩酒商、餐廳 |
| `demo-workspace: 觀眾辨識模擬付款` | E2E-011 | 服務費與酒款付款揭露 |
| `demo-workspace: 辨識日期準備期與最早日期` | E2E-001、E2E-003 | 初始與跨日提示 |
| `demo-workspace: 桌機可閱讀多行與長料理內容` | E2E-007 | 1366×768、連續長字串 |

建立命令不能繞過日期門檻及載入驗證不依賴當下日期，另由 `src/domain/model.test.ts` 直接驗證；瀏覽器驗收負責上述使用者可見的整合行為。
