# E2E Testing Checklist

## Test Setup

- **Start URL / route:** `http://127.0.0.1:5173/`，由專案根目錄執行 `npm.cmd run dev`；若測建置預覽則完整改用 `http://127.0.0.1:4173/`，兩來源資料不互通。
- **Viewport(s):** 桌機 1366×768；E2E-012 另用 390×844、觸控及高像素密度 context。
- **Test data / accounts:** 沿用可見示範身分「宴客主人」「平台管理」「酒商甲」「酒商乙」「合作餐廳」，無真實帳密。酒商甲案例酒款 6000、配送 200、餐廳現場費 300、平台服務費 500、示範分潤 600。姓名使用「展示主人」，不填真實卡號、證件或生日。
- **Prerequisites:** 透過 Playwright MCP 在隔離瀏覽器操作。每案以既有「載入餐廳驗齡前」及確認對話框開始，除非另述；這是合法流程建立的已收貨、未驗齡情境，不直接改寫業務狀態。新畫面可見標籤依 specs/design 所列文案落實；若不同，先核對需求並記錄對應，不猜 CSS selector。
- **共同前置操作:** 需要有效簽名時，按「已核對下單本人且驗齡通過」，在客人畫面填「下單人姓名」，於具可辨識標籤的手寫區用指標畫出至少一筆可見筆畫，再按「保存簽名」。需要失敗時，在「模擬付款結果」選失敗並提交「模擬支付酒款」；需要代收時，再按「請餐廳協助代收」、依畫面交還店員及進入餐廳確認。上述每個動作均由 UI 操作。
- **Evidence:** 每案保存 `e2e-evidence/E2E-NNN-*.png`、可見文字／狀態與執行結果；收集 console error 及 network 失敗，確認無外部真實支付。清單在 propose 時全部未執行，不預先勾選。
- **特殊驗證:** 舊格式只能使用 apply 修改前從原 UI 取得的 v1 快照；儲存故障以測試 harness 暫時讓 Storage 寫入拋錯，不偽造成功交易。領域命令非法提交、交易快照被改、同 operation ID 重送及資料結構損壞，以單元測試驗證，不把 UI 隱藏視為領域授權證據。

## 1. 本人驗齡、簽收與線上完成

- [x] E2E-001 同裝置完成簽收及模擬付款
  - **Priority:** Critical
  - **Prerequisites:** 載入驗齡前情境，合作餐廳身分。
  - **Steps:**
    1. 重新整理，確認仍待驗齡；按本人核對及驗齡通過按鈕。
    2. 不切換示範角色，核對客人畫面的酒款、6 瓶、酒款 6000、配送 200、總額 6200、收款酒商甲及簽收聲明。
    3. 填展示姓名、滑鼠簽名並保存，確認尚未完成；選模擬成功並付款。
    4. 查看完成畫面，返回工作區，切換主人、平台、酒商甲與餐廳並重新整理。
  - **Expected results:** 自動進入客人畫面且收起角色切換、重設與餐廳其他工作；簽名後才可付款。成功即服務完成、可協助開酒，不再要求交付或收取；酒商收款 6200、分潤 600 待結算，無代收應付款，平台 500 與餐廳 300 獨立、總支出 7000。主人、平台、酒商甲與餐廳看到同一完成結果與時間，未獲選酒商乙無後續資訊。
  - **Evidence:** 簽收明細、完成及金額摘要截圖；歷程及無真實支付網路呼叫紀錄。
  - **Last run:** `2026-11-09 11:22 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-001-signed.png](e2e-evidence/E2E-001-signed.png)、[E2E-001-completed.png](e2e-evidence/E2E-001-completed.png)、[E2E-001-finance.png](e2e-evidence/E2E-001-finance.png)
  - **Observed evidence:** [實測 JSON](e2e-evidence/E2E-001-result.json)；38 項觀察；console/page errors 0。
  - **Cleanup:** 重設驗齡前情境。

- [x] E2E-002 空白、缺姓名、清除及重簽的前置限制
  - **Priority:** Critical
  - **Prerequisites:** 驗齡通過的客人畫面。
  - **Steps:**
    1. 空白姓名及空白手寫區嘗試保存；填姓名仍不畫筆畫，再嘗試保存。
    2. 畫簽名但清空姓名再保存；補回姓名保存有效簽名。
    3. 清除已保存簽名，檢查付款及代收不可操作，重新整理。
    4. 重新簽名並保存，確認可繼續付款但尚無付款或分潤。
  - **Expected results:** 無姓名或無筆畫均拒絕保存且不開放付款；清除後原簽名失效並跨重新整理維持，不能沿用；重簽後恢復付款資格，簽名本身不完成服務。付款失敗前不提供代收完成入口。
  - **Evidence:** 驗證訊息、清除後畫面與重新簽署畫面截圖。
  - **Last run:** `2026-11-09 11:22 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-002-validation.png](e2e-evidence/E2E-002-validation.png)、[E2E-002-resigned.png](e2e-evidence/E2E-002-resigned.png)
  - **Observed evidence:** [實測 JSON](e2e-evidence/E2E-002-result.json)；10 項觀察；console/page errors 0。
  - **Cleanup:** 重設驗齡前情境。

- [x] E2E-003 付款失敗、重新整理及重試成功
  - **Priority:** Critical
  - **Prerequisites:** 已透過 UI 保存有效簽名。
  - **Steps:**
    1. 選模擬失敗並提交付款，查看錯誤、待付款與可選操作。
    2. 重新整理後確認簽名、姓名、明細及失敗狀態；不重簽，選成功並重試。
    3. 查看歷程與金額摘要，再重新整理。
  - **Expected results:** 失敗不付款、不完成、不開酒、不產生分潤／應付款；重開不自動送出付款。重試沿用有效簽名，成功一次完成並只記一次成功收款與分潤，失敗嘗試仍可追溯。
  - **Evidence:** 失敗及重開截圖、成功後歷程與金額。
  - **Last run:** `2026-11-09 11:22 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-003-failed.png](e2e-evidence/E2E-003-failed.png)、[E2E-003-reload.png](e2e-evidence/E2E-003-reload.png)、[E2E-003-retry-completed.png](e2e-evidence/E2E-003-retry-completed.png)
  - **Observed evidence:** [實測 JSON](e2e-evidence/E2E-003-result.json)；10 項觀察；console/page errors 0。
  - **Cleanup:** 重設驗齡前情境。

## 2. 餐廳承接與酒商收清

- [x] E2E-004 代收請求待確認與拒絕後繼續購買
  - **Priority:** Critical
  - **Prerequisites:** 有效簽名且模擬付款失敗。
  - **Steps:**
    1. 按請餐廳協助代收，確認交還店員提示；重新整理，確認仍待確認。
    2. 依畫面進入餐廳確認，按不承接代收。
    3. 查看回到待付款及有效簽名，再次提出代收請求並再次拒絕。
    4. 不重簽，選成功重試付款。
  - **Expected results:** 請求或拒絕均不完成、不開酒，不建立帳款或分潤，不自動取消；主人畫面不能直接承接。可再次提出新的請求，不受永久去重誤擋；最後正常付款完成。
  - **Evidence:** 交還店員、拒絕後待付款與最後完成截圖，含請求／拒絕角色與時間。
  - **Last run:** `2026-11-09 11:22 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-004-handoff.png](e2e-evidence/E2E-004-handoff.png)、[E2E-004-declined.png](e2e-evidence/E2E-004-declined.png)、[E2E-004-retry-completed.png](e2e-evidence/E2E-004-retry-completed.png)
  - **Observed evidence:** [實測 JSON](e2e-evidence/E2E-004-result.json)；13 項觀察；console/page errors 0。
  - **Cleanup:** 重設驗齡前情境。

- [x] E2E-005 餐廳承接即完成並建立全額待付帳款
  - **Priority:** Critical
  - **Prerequisites:** 透過 UI 簽名、付款失敗並提出代收，進入店員確認。
  - **Steps:**
    1. 核對餐廳、酒商甲、酒款 6000、配送 200、應付 6200 及承接責任說明，確認由本餐廳代收。
    2. 查看完成與可開酒提示，返回工作區並切換主人、平台、餐廳、酒商甲。
    3. 在每個相關角色查看同一帳款，重新整理確認不變。
  - **Expected results:** 立即顯示服務已完成／餐廳代收／待付酒商，不顯示線上付款成功或酒商已收款；主人無須先結餐費或再按收取。餐廳應付 6200、分潤 600 待結算獨立，不抵為 5600，無額外向主人加收，承接及完成時間一致可追溯。
  - **Evidence:** 店員確認與完成畫面、主人／平台／餐廳／選定酒商的帳款、分潤及重新整理結果。
  - **Last run:** `2026-11-09 11:23 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-005-staff.png](e2e-evidence/E2E-005-staff.png)、[E2E-005-accepted.png](e2e-evidence/E2E-005-accepted.png)、[E2E-005-account-宴客主人.png](e2e-evidence/E2E-005-account-宴客主人.png)、[E2E-005-account-平台管理者.png](e2e-evidence/E2E-005-account-平台管理者.png)、[E2E-005-account-合作餐廳.png](e2e-evidence/E2E-005-account-合作餐廳.png)、[E2E-005-account-酒商甲.png](e2e-evidence/E2E-005-account-酒商甲.png)
  - **Observed evidence:** [實測 JSON](e2e-evidence/E2E-005-result.json)；28 項觀察；console/page errors 0。
  - **Cleanup:** 重設驗齡前情境。

- [x] E2E-006 只有選定酒商可確認整筆收清
  - **Priority:** Critical
  - **Prerequisites:** 獨立透過 UI 建立已代收完成、待付酒商甲的訂單。
  - **Steps:**
    1. 切換酒商乙，確認完全不顯示該單後續狀態、帳款、分潤或歷程；再切主人、平台及餐廳，確認可查看各自授權資訊但無此筆確認收款操作。
    2. 切回酒商甲按確認已收到餐廳款項；在金額確認畫面先返回，再重開並確認全額。
    3. 重新整理、切換主人、餐廳、平台及酒商甲，檢查收清與分潤；重複提交及提醒由 E2E-013 驗證。
  - **Expected results:** 返回不改帳；酒商甲確認才將同一筆 6200 改為已收清，保存操作者及時間，不提供部分收款。服務仍完成、支付方式仍餐廳代收、分潤仍待結算，不能重複收清或加金額。
  - **Evidence:** 酒商乙無後續資訊、酒商甲確認及收清後金額／時間／分潤截圖。
  - **Last run:** `2026-11-09 11:23 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-006-received.png](e2e-evidence/E2E-006-received.png)、[E2E-006-received-reload.png](e2e-evidence/E2E-006-received-reload.png)
  - **Observed evidence:** [實測 JSON](e2e-evidence/E2E-006-result.json)；26 項觀察；console/page errors 0。
  - **Cleanup:** 重設驗齡前情境。

## 3. 取消與既有異常

- [x] E2E-007 簽名前取消、返回與酒商取回
  - **Priority:** High
  - **Prerequisites:** 驗齡通過，尚未簽名。
  - **Steps:**
    1. 按取消購買，在確認畫面返回，檢查仍可簽名。
    2. 再次取消並確認，查看待退回原因及費用。
    3. 返回工作區，切酒商乙確認無後續資訊，切餐廳確認無取回操作；切酒商甲確認已取回酒品。
    4. 切平台，先確認退運成本顯示待登錄，再登錄 200 元並重新整理。
  - **Expected results:** 返回不改單；確認後明確顯示主人取消購買，驗齡仍通過。服務費 500 不退、酒款未付、無分潤／應付款，平台負擔退運。僅酒商甲可取回，取回即服務未完成；成本可事後補登，主人新增應付仍 0。
  - **Evidence:** 取消確認、待退回與取回後成本截圖。
  - **Last run:** `2026-11-09 11:23 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-007-return-pending.png](e2e-evidence/E2E-007-return-pending.png)、[E2E-007-returned-cost-pending.png](e2e-evidence/E2E-007-returned-cost-pending.png)、[E2E-007-returned-cost.png](e2e-evidence/E2E-007-returned-cost.png)
  - **Observed evidence:** [實測 JSON](e2e-evidence/E2E-007-result.json)；14 項觀察；console/page errors 0。
  - **Cleanup:** 重設驗齡前情境。

- [x] E2E-008 已簽名且餐廳拒絕代收後取消
  - **Priority:** Critical
  - **Prerequisites:** 有效簽名、付款失敗、代收請求被餐廳拒絕。
  - **Steps:**
    1. 按取消購買，先返回確認簽名與待付款仍存在，再取消並確認。
    2. 重新整理及切換主人、餐廳、兩家酒商，檢查不能付款、重簽或承接。
  - **Expected results:** 返回不清簽；確認取消才使原簽名失效，待退回且不恢復購買，不產生酒款、分潤或代收帳款；保留付款失敗與取消原因歷程。
  - **Evidence:** 返回後有效簽名、取消後狀態與不可恢復結果。
  - **Last run:** `2026-11-09 11:23 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-008-cancelled-after-failure.png](e2e-evidence/E2E-008-cancelled-after-failure.png)
  - **Observed evidence:** [實測 JSON](e2e-evidence/E2E-008-result.json)；12 項觀察；console/page errors 0。
  - **Cleanup:** 重設驗齡前情境。

- [x] E2E-009 驗齡失敗維持原退回規則
  - **Priority:** High
  - **Prerequisites:** 驗齡前情境。
  - **Steps:**
    1. 選驗齡未通過，不填原因提交，確認遭拒；填「未能確認年齡」再提交。
    2. 切換各角色，確認無簽名、付款或承接入口。
    3. 平台登錄退運成本 0，再由酒商甲取回並重新整理。
  - **Expected results:** 失敗原因必填，待退回保留驗齡失敗原因，與主人取消不同。服務費不退、酒款未付、分潤／應付款皆無；零元成本與待登錄可區分，取回不算服務完成。
  - **Evidence:** 缺原因訊息、驗齡失敗及已退回零元成本畫面。
  - **Last run:** `2026-11-09 11:24 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-009-required-reason.png](e2e-evidence/E2E-009-required-reason.png)、[E2E-009-age-failed.png](e2e-evidence/E2E-009-age-failed.png)、[E2E-009-returned-zero.png](e2e-evidence/E2E-009-returned-zero.png)
  - **Observed evidence:** [實測 JSON](e2e-evidence/E2E-009-result.json)；10 項觀察；console/page errors 0。
  - **Cleanup:** 重設驗齡前情境。

## 4. 可見性、保存與操作邊界

- [x] E2E-010 簽收原圖及角色動作分開呈現
  - **Priority:** High
  - **Prerequisites:** 透過 UI 完成一筆線上付款訂單，再獨立完成一筆代收訂單；每筆各驗證。
  - **Steps:**
    1. 在主人、餐廳、平台畫面查看簽收紀錄與綁定明細。
    2. 切選定酒商查看簽收狀態、明細及歷程；檢查頁面未渲染簽名原圖。
    3. 對各角色確認無不屬於該角色的驗齡、承接、收清操作；客人專用畫面不能直接承接。
  - **Expected results:** 前三角色可查看原簽名，選定酒商僅看簽收狀態與明細；其歷程不含簽名原圖，未獲選酒商完全看不到後續資訊。可見操作符合角色；示範不被描述為正式登入。直接非法命令另由單元測試確認拒絕。
  - **Evidence:** 四角色簽收畫面、歷程與可見操作列表。
  - **Last run:** `2026-11-09 11:23 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-010-online-宴客主人.png](e2e-evidence/E2E-010-online-宴客主人.png)、[E2E-010-online-合作餐廳.png](e2e-evidence/E2E-010-online-合作餐廳.png)、[E2E-010-online-平台管理者.png](e2e-evidence/E2E-010-online-平台管理者.png)、[E2E-010-online-merchant.png](e2e-evidence/E2E-010-online-merchant.png)、[E2E-010-collection-宴客主人.png](e2e-evidence/E2E-010-collection-宴客主人.png)、[E2E-010-collection-合作餐廳.png](e2e-evidence/E2E-010-collection-合作餐廳.png)、[E2E-010-collection-平台管理者.png](e2e-evidence/E2E-010-collection-平台管理者.png)、[E2E-010-collection-merchant.png](e2e-evidence/E2E-010-collection-merchant.png)
  - **Observed evidence:** [實測 JSON](e2e-evidence/E2E-010-result.json)；33 項觀察；console/page errors 0。
  - **Cleanup:** 重設驗齡前情境。

- [x] E2E-011 保存故障不得假成功
  - **Priority:** Critical
  - **Prerequisites:** 支援測試 harness 暫時阻止 Storage 寫入；各子情境獨立透過 UI 到達前置狀態，不修改業務資料。
  - **Steps:**
    1. 分別在保存簽名、模擬付款成功、餐廳承接及酒商收清前記錄已保存狀態，再令下一次寫入拋錯並提交。
    2. 每次確認錯誤及上一成功狀態；恢復寫入後重新整理，核對原狀態並重試相同操作。
    3. 在取回成本或角色切換上執行一次相同故障回歸。
  - **Expected results:** 失敗時清楚提示保存失敗，簽名不冒稱有效、付款／承接不冒稱完成、收清不冒稱已收；重開保留原結果，重試成功只產生一筆對應紀錄。
  - **Evidence:** 每個關鍵提交的故障及恢復截圖、錯誤資訊與前後狀態摘要。
  - **Last run:** `2026-11-09 11:23 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-011-signature-failure.png](e2e-evidence/E2E-011-signature-failure.png)、[E2E-011-signature-recovered.png](e2e-evidence/E2E-011-signature-recovered.png)、[E2E-011-payment-failure.png](e2e-evidence/E2E-011-payment-failure.png)、[E2E-011-payment-recovered.png](e2e-evidence/E2E-011-payment-recovered.png)、[E2E-011-accept-failure.png](e2e-evidence/E2E-011-accept-failure.png)、[E2E-011-accept-recovered.png](e2e-evidence/E2E-011-accept-recovered.png)、[E2E-011-receive-failure.png](e2e-evidence/E2E-011-receive-failure.png)、[E2E-011-receive-recovered.png](e2e-evidence/E2E-011-receive-recovered.png)、[E2E-011-role-failure.png](e2e-evidence/E2E-011-role-failure.png)、[E2E-011-role-recovered.png](e2e-evidence/E2E-011-role-recovered.png)
  - **Observed evidence:** [實測 JSON](e2e-evidence/E2E-011-result.json)；30 項觀察；console/page errors 0。
  - **Cleanup:** 移除故障注入並重設驗齡前情境。

- [x] E2E-012 觸控小螢幕簽名、清除及付款失敗操作
  - **Priority:** High
  - **Prerequisites:** 390×844 觸控 context，透過 UI 到客人畫面。
  - **Steps:**
    1. 核對明細、輸入姓名並以觸控指標簽名，清除後重簽保存。
    2. 正常捲動查看全部明細與按鈕，重新整理確認筆畫未因尺寸／像素密度消失。
    3. 模擬付款失敗，查看重試、請餐廳代收及取消購買，開啟取消確認後返回。
  - **Expected results:** 可用手指畫筆畫，手寫區不被捲動取代；手寫區外正常捲動。明細與按鈕可達、不水平溢出，失敗狀態有文字，已保存簽名可還原。桌機滑鼠路徑由 E2E-001 覆蓋。
  - **Evidence:** 觸控簽名與失敗操作截圖、viewport 與水平寬度檢查。
  - **Last run:** `2026-11-09 11:23 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-012-touch-signature.png](e2e-evidence/E2E-012-touch-signature.png)、[E2E-012-touch-failed.png](e2e-evidence/E2E-012-touch-failed.png)
  - **Observed evidence:** [實測 JSON](e2e-evidence/E2E-012-result.json)；8 項觀察；console/page errors 0。
  - **Cleanup:** 關閉觸控 context，恢復桌機視窗。

- [x] E2E-013 完成後鎖路徑及快速重複點擊
  - **Priority:** Critical
  - **Prerequisites:** 兩筆獨立訂單，分別準備線上付款及餐廳承接。
  - **Steps:**
    1. 對付款與承接各以快速雙擊提交（含確認畫面如有），查看完成與金額紀錄。
    2. 完成後返回工作區、切換角色並重新整理，檢查無再次付款、改代收、取消購買、重簽或舊交付／收取入口。
    3. 代收訂單由選定酒商快速重複送出整筆收清確認，或在仍可觸發原確認時再次送出；核對第二次提交的可見提醒，不能只檢查未重複記帳。
  - **Expected results:** 每單僅一筆成功完成與分潤，代收僅一筆全額帳款及一次收清；操作不增加金額。重複收清提交時明確顯示「此筆款項已收清，無需重複確認。」，原金額、時間與操作者不變，不以無聲忽略、按鈕消失或泛用成功訊息代替提醒。另一支付路徑不能再走。舊命令與同 operation ID 重送另由單元測試證明；若瀏覽器實際未產生第二次提交，須記錄此部分未驗證並以提交結果到介面提醒的整合測試補足，不假稱已觀察提醒。
  - **Evidence:** 完成、帳款與歷程的唯一紀錄、重複收清提醒截圖及實際重複提交紀錄；補充整合測試結果須與瀏覽器觀察分開。
  - **Last run:** `2026-11-09 11:24 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-013-online-locked.png](e2e-evidence/E2E-013-online-locked.png)、[E2E-013-duplicate-receipt-notice.png](e2e-evidence/E2E-013-duplicate-receipt-notice.png)、[E2E-013-collection-locked.png](e2e-evidence/E2E-013-collection-locked.png)
  - **Observed evidence:** [實測 JSON](e2e-evidence/E2E-013-result.json)；12 項觀察；console/page errors 0。
  - **Cleanup:** 重設驗齡前情境。

## 5. 舊資料與既有流程回歸

- [x] E2E-014 原 UI 建立的舊版訂單可接續
  - **Priority:** Critical
  - **Prerequisites:** Apply 修改前，透過舊版公開 UI 在隔離來源保存 v1 快照，含驗齡前、待購買、待付款、已付待交付、已付待收取、已完成、驗齡退回與餐廳取消；未取得就明確標受阻，不能偽造。
  - **Steps:**
    1. 對每份原快照使用獨立 context 在相同網站來源載入新版；記錄原金額、狀態、事件。
    2. 未付酒款且已驗齡者接續新簽收付款；已付未完成者以標示舊版流程的相容入口完成。
    3. 已完成及異常者檢查原結果不變；每種至少成功操作一次後重新整理。
    4. 對日期接近／已過的有效原快照重跑，確認不套用新建門檻。
  - **Expected results:** 不誤判損壞、不自動覆寫或清單重設；既有付款、分潤及事件保留。已付單不要求重付／補造簽名，新單不藉相容路徑跳簽名；日期不影響載入。
  - **Evidence:** 每類舊快照來源與前後摘要、至少已付舊單接續與重開截圖。
  - **Last run:** `2026-11-09 11:24 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-014-legacy-age.png](e2e-evidence/E2E-014-legacy-age.png)、[E2E-014-legacy-purchase.png](e2e-evidence/E2E-014-legacy-purchase.png)、[E2E-014-legacy-payment.png](e2e-evidence/E2E-014-legacy-payment.png)、[E2E-014-legacy-handover.png](e2e-evidence/E2E-014-legacy-handover.png)、[E2E-014-legacy-receipt.png](e2e-evidence/E2E-014-legacy-receipt.png)、[E2E-014-legacy-completed.png](e2e-evidence/E2E-014-legacy-completed.png)、[E2E-014-legacy-return-pending.png](e2e-evidence/E2E-014-legacy-return-pending.png)、[E2E-014-legacy-returned.png](e2e-evidence/E2E-014-legacy-returned.png)、[E2E-014-legacy-cancel-pending.png](e2e-evidence/E2E-014-legacy-cancel-pending.png)、[E2E-014-legacy-cancelled.png](e2e-evidence/E2E-014-legacy-cancelled.png)
  - **Observed evidence:** [實測 JSON](e2e-evidence/E2E-014-result.json)；57 項觀察；console/page errors 0。
  - **Cleanup:** 關閉隔離 context，保留原始快照證據，不覆寫原檔。

- [x] E2E-015 從新需求到驗齡及配送前取消回歸
  - **Priority:** High
  - **Prerequisites:** 透過「從空白需求開始」確認重設；桌機視窗。使用台北測試當日加七日的宴客日期，料理填兩行。
  - **Steps:**
    1. 主人提交需求，模擬付服務費並重複點擊確認；平台邀請兩家酒商，各提交預設有效提案，選定前確認兩家可看到原需求的兩行料理，主人比較選酒商甲。
    2. 餐廳確認安排，酒商甲出貨、送達，餐廳獨立收貨；切換主人、平台、酒商甲及餐廳並重新整理檢查日期與兩行料理，酒商乙不再提供該單後續資訊。
    3. 獨立重設至「載入餐廳取消前」，填原因取消；平台模擬全額退款。
    4. 檢查重設沒有殘留前單簽名、帳款或分潤。
  - **Expected results:** 配送前置維持、收貨不等於服務完成；台北日期規則與多行料理保留。餐廳配送前取消仍退 500、淨服務費 0，無酒款、分潤或代收；不能與主人現場取消的不退款規則混用。服務費重複點擊不重複付款。
  - **Evidence:** 需求／收貨前置與多行料理、配送前取消退款及重設截圖。
  - **Last run:** `2026-11-09 11:24 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-015-receipt-multiline.png](e2e-evidence/E2E-015-receipt-multiline.png)、[E2E-015-cancel-refunded.png](e2e-evidence/E2E-015-cancel-refunded.png)
  - **Observed evidence:** [實測 JSON](e2e-evidence/E2E-015-result.json)；24 項觀察；console/page errors 0。
  - **Cleanup:** 重設正常起點。

- [x] E2E-016 未獲選酒商自選定起不再看到後續資訊
  - **Priority:** Critical
  - **Prerequisites:** 各子情境獨立由新需求或合法展示情境透過 UI 推進；先選甲驗乙未獲選，再用另一單選乙驗甲未獲選。不得只驗固定乙身分。
  - **Steps:**
    1. 在兩份提案已提交但尚未選定時，確認雙方各自仍可看到受邀需求與自己的提案；主人選定其中一家，立即切到未獲選酒商。
    2. 在餐廳安排、配送／收貨、驗齡／簽名、付款失敗／代收待確認、線上完成及餐廳代收完成／收清各階段，由相關角色推進後再切回未獲選酒商、重新整理並重開同一來源。
    3. 另以主人取消購買、驗齡失敗及餐廳配送前取消的分支重複檢查；已保存舊版單載入亦套用。
    4. 每次檢查訂單概覽、狀態、下一步、配送、驗齡、簽收、付款、右欄帳款與分潤、退回原因及歷程均未呈現，且切換時無上一角色資訊閃現；選定酒商仍可繼續。
  - **Expected results:** 未獲選酒商僅看到本次未獲選、無後續服務資訊可查看的提示；如保留本人提案，僅為選定前靜態資料，不帶後續狀態。甲乙對稱、全部正常與異常分支一致，不能只隱藏動作。直接資訊讀取遭拒及不洩漏收清狀態另以領域／檢視資料測試確認。
  - **Evidence:** 甲乙各未獲選時的工作區截圖、各階段角色與可見文字記錄、重新整理／重開結果及無後續資料的 DOM 檢查；保留舊單測試來源。
  - **Last run:** `2026-11-09 11:29 Asia/Taipei` — PASS
  - **Screenshot evidence:** [E2E-016-hidden-merchant-a.png](e2e-evidence/E2E-016-hidden-merchant-a.png)、[E2E-016-hidden-merchant-b.png](e2e-evidence/E2E-016-hidden-merchant-b.png)、[E2E-016-hidden-legacy.png](e2e-evidence/E2E-016-hidden-legacy.png)
  - **Observed evidence:** [實測 JSON](e2e-evidence/E2E-016-result.json)；216 項觀察；console/page errors 0。
  - **Cleanup:** 重設正常起點並關閉隔離 context。

## Traceability

以下對應本 change 全部 delta scenarios；UI 不可達的非法命令、快照竄改等另列低層驗證，不假稱瀏覽器測試通過。

| Spec scenario | E2E case(s) | Notes |
|---|---|---|
| restaurant-fulfillment：餐廳登錄通過 | E2E-001 | 同裝置、自動客人畫面 |
| restaurant-fulfillment：未驗齡或未通過時不得購酒付款 | E2E-009、E2E-015 | 直接非法命令另以領域單元測試驗證 |
| restaurant-fulfillment：完成酒商收款模擬 | E2E-001 | 6200 與立即完成 |
| restaurant-fulfillment：未確認購買不得付款 | E2E-002 | 無有效簽名時拒絕 |
| restaurant-fulfillment：正常完成服務 | E2E-001 | 無雙方事後確認 |
| restaurant-fulfillment：阻止提早完成 | E2E-002、E2E-003、E2E-004、E2E-009 | 繞過條件的完成命令另測領域層 |
| restaurant-fulfillment：餐廳承接代收完成服務 | E2E-005 | 未結餐費仍完成 |
| restaurant-fulfillment：重複確認收取 | 不適用瀏覽器 | 新 UI 無此入口；領域測試重送舊命令不得重複完成 |
| restaurant-fulfillment：重複付款或承接 | E2E-013 | 同 operation ID 去重另測領域層 |
| restaurant-fulfillment：保存有效簽名 | E2E-001、E2E-003 | 姓名、筆畫與明細 |
| restaurant-fulfillment：空白與清除簽名 | E2E-002 | 清除後失效 |
| restaurant-fulfillment：明細變更必須重簽 | 不適用瀏覽器 | 提案已鎖定且無編輯入口；領域單元測試改變明細後原簽名不可支付／承接 |
| restaurant-fulfillment：失敗後重試成功 | E2E-003 | 保留簽名，不重複分潤 |
| restaurant-fulfillment：未失敗不得直接申請代收 | E2E-002 | UI 不提供；非法命令另測領域層 |
| restaurant-collection：主人提出代收請求 | E2E-004 | 請求不等於承接 |
| restaurant-collection：店員承接代收 | E2E-005 | 保存責任及帳款 |
| restaurant-collection：店員拒絕代收 | E2E-004、E2E-008 | 可重試或取消 |
| restaurant-collection：非餐廳角色不能承接 | E2E-010 | 僅驗可見入口；直接命令另測領域層 |
| restaurant-collection：全額應付款與分潤並列 | E2E-005 | 6200 與 600 獨立 |
| restaurant-collection：餐廳承接但酒商未收款 | E2E-005 | 不誤示已收款 |
| restaurant-collection：酒商收清全額 | E2E-006 | 金額、角色與時間 |
| restaurant-collection：未獲選酒商不能取得帳款資訊 | E2E-006、E2E-016 | 直接資訊讀取／非法角色命令另測領域層，不洩漏收清狀態 |
| restaurant-collection：重複收清操作顯示提醒 | E2E-013 | 必須驗證明確提醒，重送結果到提示另測整合層 |
| restaurant-collection：代收完成後再嘗試線上付款 | E2E-013 | UI 鎖路徑；直接命令另測領域層 |
| restaurant-collection：線上付款完成後再嘗試代收 | E2E-013 | 同上 |
| restaurant-revenue-share：顯示完整費用流向 | E2E-001、E2E-005 | 兩條完成路徑 |
| restaurant-revenue-share：成交分潤正確排除其他費用 | E2E-001、E2E-005 | 6000 × 10%；四捨五入另測單元 |
| restaurant-revenue-share：付款後形成唯一紀錄 | E2E-001、E2E-013 | 重開與重複提交 |
| restaurant-revenue-share：失敗訂單不產生分潤 | E2E-003、E2E-004、E2E-007、E2E-008、E2E-009、E2E-015 | 覆蓋取消及失敗 |
| restaurant-revenue-share：承接代收即產生唯一分潤 | E2E-005、E2E-006、E2E-013 | 收清不再建分潤 |
| restaurant-revenue-share：服務完成但分潤尚待結算 | E2E-001、E2E-005、E2E-006 | 不阻擋服務 |
| service-exceptions：簽名前反悔取消 | E2E-007 | 原因與費用 |
| service-exceptions：付款失敗後取消 | E2E-008 | 簽名失效 |
| service-exceptions：返回繼續購買 | E2E-007、E2E-008 | 返回不改單 |
| service-exceptions：酒商完成取回 | E2E-007、E2E-009 | 兩種原因 |
| service-exceptions：記錄平台退回成本 | E2E-007 | 主人不加付 |
| service-exceptions：成本未填仍可追蹤實際取回 | E2E-007 | 取回後可補登 |
| service-exceptions：驗齡失敗後不能切換角色繞過 | E2E-009 | 非法命令另測領域層 |
| service-exceptions：主人取消後不能恢復購買 | E2E-008 | 非法命令另測領域層 |
| demo-workspace：主人切換至酒商 | E2E-015 | 保留需求、角色操作 |
| demo-workspace：非法角色動作不改變狀態 | E2E-010 | UI 可見性；非法命令另測領域層 |
| demo-workspace：同裝置交給客人 | E2E-001、E2E-004 | 專用畫面及交還店員 |
| demo-workspace：重新整理後繼續交付 | E2E-001 | 收貨後仍待驗齡 |
| demo-workspace：無法保存時顯示錯誤 | E2E-011 | 關鍵提交故障 |
| demo-workspace：日期接近或已過仍可還原訂單 | E2E-014 | 原快照及載入測試 |
| demo-workspace：舊版已保存訂單維持相容 | E2E-014 | 不重付、不造簽名 |
| demo-workspace：多行料理跨重新整理與角色切換保存 | E2E-015 | 原日期與料理回歸 |
| demo-workspace：簽名與付款失敗接續 | E2E-002、E2E-003 | 清除及失敗均保存 |
| demo-workspace：代收與收清跨重新整理保存 | E2E-005、E2E-006 | 同一帳款 |
| demo-workspace：同一付款重複點擊 | E2E-015 | 服務費；重送另測單元 |
| demo-workspace：代收歷程區分操作人 | E2E-004、E2E-005、E2E-006 | 主人、餐廳、酒商分列 |
| demo-workspace：酒商僅看簽收狀態及明細 | E2E-010 | 原圖不渲染於酒商 |
| demo-workspace：小螢幕簽收付款 | E2E-012 | 觸控及無水平溢出 |
| banquet-matching：選定後進入協調 | E2E-015、E2E-016 | 選定立即停止未獲選酒商資訊存取 |
| banquet-matching：選定後禁止改價與重選 | E2E-016 | 鎖定前提沿用；直接改價／重選命令另測領域層，錯誤不洩漏後續資訊 |
| banquet-matching：未獲選酒商不得讀取後續資訊 | E2E-016 | 檢視資料與直接讀取拒絕另測領域層 |
| banquet-matching：任一家酒商未獲選均適用 | E2E-016 | 甲乙對稱 |
| demo-workspace：未獲選身分切換與重新整理不洩漏進度 | E2E-016 | 各呈現位置及角色切換 |
| demo-workspace：未獲選酒商不因完成或退回取得資訊 | E2E-016 | 正常、代收、收清、取消及退回 |

## Execution Results

2026/11/09 已經 Playwright MCP 執行：16 通過、0 失敗、0 跳過，64 張必要原始截圖已核對，541 項觀察；產品修復迭代 0。單元測試 106/106、TypeScript strict 與 Vite 建置通過。全部案例無未解決的產品 console/page error。逐案結果見各項 Evidence；[摘要](e2e-evidence/summary.json)、[檔案核對](e2e-evidence/evidence-audit.json)、[執行紀錄與初輪修正說明](e2e-evidence/execution-notes.md)。
