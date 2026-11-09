# E2E Testing Checklist

2026-11-09已透過Playwright MCP逐案執行E2E-001～026，最終26通過／0失敗／0跳過。71張必要截圖與395項觀察已保存；產品修復2輪。逐案結果如下，執行細節見[e2e-evidence/execution-notes.md](e2e-evidence/execution-notes.md)。

## Test Setup

- **Start URL / route:** `http://127.0.0.1:5173/`，由專案根目錄執行`npm.cmd run dev`；如使用build預覽，改用`http://127.0.0.1:4173/`且全程固定同一來源。
- **Viewport(s):** 桌機1366×768；手機390×844（含觸控簽名）。只在E2E-020要求兩尺寸完整檢查，其他預設桌機。
- **Test data / accounts:** 無登入帳密；使用宴客主人、平台管理者、酒商甲、酒商乙、合作餐廳五個既有示範身分。姓名電話均為模擬資料，禁止使用真實證件／卡號。
- **Prerequisites:** 實作本change並通過對應Vitest與build；無真實支付、外部授權API或第三方服務。事先合作授權餐廳為既定展示前提，不把逐筆代收當新授權。
- **控制項:** 優先使用既有可見標籤／role；本change新增或改名的控制項依design文案實作，包括「委託此酒商安排現場備酒」「已核對本人且年滿十八歲」「現場購買確認」「交還店員調整購買明細」「保存現場購買明細」「確認已取回未購買備酒」。這些是待實作介面，不宣稱目前已有。
- **共用資料:** BUDGET＝有效未來日期、12人、多行料理、預算6500、已付500並邀請兩商；COMPARE＝甲750ml×6瓶×1000＋運送200、乙750ml×6瓶×1100＋運送0，皆已正式提交；ARRANGE＝委託甲待餐廳安排；AGE＝甲備酒已送達且餐廳已暫存、未驗齡；REVEALED＝AGE核對通過；SIGNED＝已保存本人手寫；FAILED＝同版付款失敗一次；PARTIAL＝實購4瓶合計4200已完成、餘酒2瓶待取回。
- **前置建立:** 每案獨立，以四個展示入口與可見UI完成相應步驟；載入AGE可用「載入餐廳驗齡前」。不以直接改status跳過前置。跨案不得把前案失敗殘留當下一案成功前提。
- **LEGACY樣本:** 實作開始前在`e2e-fixtures/`建立v1/v2/v3已簽、已付、代收、未簽缺聯絡、超新版上限、小數容量及舊取回成本0／200／未填manifest，列檔名、版本、預期原金額／時間／狀態；已建立42個原始樣本並列入manifest。以隔離context向既有KEY `banquet-wine-demo:v1`匯入完整原樣本後重新開頁，不編造散落欄位。
- **Evidence:** 執行後才建立`e2e-evidence/E2E-XXX-*.png`與結果紀錄，保留URL、角色、畫面文字、必要DOM／可及性樹與console／network錯誤；正常路徑無真實支付請求。遮蔽測試不把可讀localStorage冒稱正式權限隔離。
- **Cleanup:** 每案結束以展示重設還原正常起點；LEGACY／故障注入使用隔離context並關閉，還原測試備份，不清除其他應用資料。

## 低階驗證對照

- **U-01:** `src/domain/model.test.ts`與新增`src/domain/service-policy.test.ts`：確定性日期／時區／跨午夜、整數與溢位、105%整元邊界、已移除餐廳費、預算政策。
- **U-02:** `src/domain/checkout.test.ts`及角色呈現測試：非法角色／狀態命令、拒絕已退役成本命令、重送冪等、主人呈現資料不含價金／分潤及酒商個資隔離。
- **U-03:** 新增`src/domain/onsite-purchase.test.ts`：購買版本、舊失敗資格、明細與簽名快照、只能減量／禁止換款加量、實購分潤與餘酒唯一取回。
- **U-04:** `src/persistence/identity-migration.test.ts`與新增`src/persistence/service-migration.test.ts`：v1/v2/v3原始樣本、純遷移、不立即寫回、歷史資格、損壞／寫入失敗。
- 上述領域與遷移測試已實作並執行，全套8個測試檔、243項通過。瀏覽器不易觸發的偽造命令與精確時計算必須以低階驗證完成，不得僅用截圖勾選通過。

## 1. 需求與提案

- [x] E2E-001 需求說明、姓名確認與獨立500元服務費
  - **Priority:** Critical
  - **Prerequisites:** 空白需求；1366×768。
  - **Steps:**
    1. 以「從空白需求開始」重設並確認，填有效宴客日期、12人、多行料理、酒類與運送預算6500、姓名「展示主人」及0912345678。
    2. 檢視105%、含運、500元另計與餐廳自行開瓶費說明；提交時返回修改一次姓名，再確認提交。
    3. 先切平台確認尚不能邀請，再切主人模擬支付服務費，回平台邀請兩家酒商。
  - **Expected results:**
    1. 保留多行料理、固定確認後姓名；主人不見固定300元或分潤。
    2. 付款獨立500元，付款前不能邀請，成功後才可邀請；無真實卡號或證件欄位。
  - **Evidence:** 關鍵結果截圖、可見文字與DOM文字／可及性樹；記錄console與network錯誤。
  - **Last run:** 2026-11-09 20:04:16 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-001-request-paid.png](e2e-evidence/E2E-001-request-paid.png)
  - **Observed evidence:** http://127.0.0.1:5173/；5項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-001.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-002 提案即時上限與超過一元阻擋
  - **Priority:** Critical
  - **Prerequisites:** BUDGET：已付費並邀請兩商、預算6500。
  - **Steps:**
    1. 切酒商甲，填750ml、6瓶、每瓶1000元，運送825元及其他必填內容。
    2. 確認合計6825、上限6825；將運送改826，檢視即時超額提示並按「送出提案」。
    3. 改回825正式送出；切乙先檢視只能編輯自己的提案，再提交合法第二份。
  - **Expected results:**
    1. 6826被阻擋且顯示超出1元，保留內容、尚未把甲這次標為已提交；6825可提交。
    2. 兩份有效後才可選；新提案沒有固定餐廳費欄位，未收到超額建議書後才要求重做。
  - **Evidence:** 關鍵結果截圖、可見文字與DOM文字／可及性樹；記錄console與network錯誤。
  - **Last run:** 2026-11-09 20:05:34 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-002-over-limit-blocked.png](e2e-evidence/E2E-002-over-limit-blocked.png)、[E2E-002-boundary-accepted.png](e2e-evidence/E2E-002-boundary-accepted.png)
  - **Observed evidence:** http://127.0.0.1:5173/；8項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-002.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-003 非整元上限、免運與不完整草稿
  - **Priority:** High
  - **Prerequisites:** 新建BUDGET，預算6501。
  - **Steps:**
    1. 甲填1瓶、單價6826、運送0及其餘必填；確認整元上限6826並送出。
    2. 尚未選定前編輯，改單價6827並保存草稿、重新整理；再清空單價或填小數保存。
    3. 正式送出確認拒絕，再修正正整數6826、運送0並送出。
  - **Expected results:**
    1. 整元上限向下取整；免運可有效提交。
    2. 超額、空白、小數草稿可保留但不視為已提交或符合預算；修正後才恢復有效。
  - **Evidence:** 關鍵結果截圖、可見文字與DOM文字／可及性樹；記錄console與network錯誤。
  - **Last run:** 2026-11-09 20:05:40 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-003-draft-corrected.png](e2e-evidence/E2E-003-draft-corrected.png)
  - **Observed evidence:** http://127.0.0.1:5173/；9項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-003.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-004 主人各選定階段不見價格或可反推總額
  - **Priority:** Critical
  - **Prerequisites:** COMPARE：甲6000＋200、乙6600＋0，預算6500，兩份有效。
  - **Steps:**
    1. 切主人查看兩張建議書、費用側欄與委託確認對話框，檢查可見及隱藏DOM文字。
    2. 委託甲後檢視概覽、建議書、側欄、歷程與重新整理。
    3. 依備酒流程推進到餐廳收貨／未驗齡，切主人重查所有區塊。
  - **Expected results:**
    1. 只見建議酒款、容量、建議瓶數與「符合設定預算範圍（含5%彈性）」、自填6500及500元。
    2. 不呈現單價1000、1100，小計6000、6600，運送200／0及6200、6700等提案總額；不顯示分潤或餐廳300元費。
  - **Evidence:** 關鍵結果截圖、可見文字與DOM文字／可及性樹；記錄console與network錯誤。
  - **Last run:** 2026-11-09 20:04:37 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-004-commission-dialog-hidden.png](e2e-evidence/E2E-004-commission-dialog-hidden.png)、[E2E-004-stored-before-age.png](e2e-evidence/E2E-004-stored-before-age.png)
  - **Observed evidence:** http://127.0.0.1:5173/；11項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-004.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-005 自由文字不能夾帶報價或分潤
  - **Priority:** High
  - **Prerequisites:** BUDGET；甲尚可編輯。
  - **Steps:**
    1. 在搭配理由填「報價NT$6000，餐廳分潤10%」，嘗試提交；再以「運送費200元」測備酒條件，以「單價新臺幣1000元」測備貨限制。
    2. 依提示移除金額，改成含「750ml、6瓶、15:00–17:00」的正常說明並送出。
    3. 切主人驗齡前查看建議書。
  - **Expected results:**
    1. 明確報價與分潤語句在提交前被提示並保留草稿，不揭露給主人。
    2. 容量、瓶數與時段不被一概當金額封鎖；一般說明可提交並可讀。
  - **Evidence:** 關鍵結果截圖、可見文字與DOM文字／可及性樹；記錄console與network錯誤。
  - **Last run:** 2026-11-09 20:05:45 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-005-safe-public-text.png](e2e-evidence/E2E-005-safe-public-text.png)
  - **Observed evidence:** http://127.0.0.1:5173/；8項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-005.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-006 委託服務酒商只保存參考建議書
  - **Priority:** High
  - **Prerequisites:** COMPARE；先只有甲有效，再補乙。
  - **Steps:**
    1. 只有甲時切主人確認尚不能委託；乙提交後切主人按「委託此酒商安排現場備酒」。
    2. 核對未成立購買義務／現場揭價說明，確認後查看服務狀態與歷程。
    3. 切未獲選乙並重新整理；再用另一新需求反向選乙，檢查甲。
  - **Expected results:**
    1. 選定後等待餐廳安排，無購買、酒款付款或分潤；文案不稱鎖價或已訂購。
    2. 原建議書及服務酒商保留，不提供重選；兩家未獲選限制對稱且不透露後續狀態。
  - **Evidence:** 關鍵結果截圖、可見文字與DOM文字／可及性樹；記錄console與network錯誤。
  - **Last run:** 2026-11-09 20:04:48 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-006-unchosen-b.png](e2e-evidence/E2E-006-unchosen-b.png)、[E2E-006-unchosen-a.png](e2e-evidence/E2E-006-unchosen-a.png)
  - **Observed evidence:** http://127.0.0.1:5173/；6項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-006.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

## 2. 備酒與現場核對

- [x] E2E-007 餐廳安排、酒商送達與餐廳暫存分開
  - **Priority:** Critical
  - **Prerequisites:** ARRANGE：已委託甲，待餐廳安排。
  - **Steps:**
    1. 先切甲查看尚不能備酒運送；切餐廳填時段並確認安排。
    2. 切甲標記備酒運送及送達；確認未自動視為餐廳收到。
    3. 切餐廳確認收到暫存酒品，再重新整理。
  - **Expected results:**
    1. 未安排前無運送成功紀錄；送達與餐廳暫存是不同操作及時間。
    2. 收到後仍待驗齡、酒款未付、服務未完成；狀態與歷程使用備酒／暫存用語。
  - **Evidence:** 關鍵結果截圖、可見文字與DOM文字／可及性樹；記錄console與network錯誤。
  - **Last run:** 2026-11-09 20:05:59 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-007-restaurant-stock.png](e2e-evidence/E2E-007-restaurant-stock.png)
  - **Observed evidence:** http://127.0.0.1:5173/；5項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-007.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-008 餐廳無法安排時取消並退還服務費
  - **Priority:** High
  - **Prerequisites:** ARRANGE。
  - **Steps:**
    1. 餐廳展開無法配合，填無法繼續原因並取消。
    2. 切主人確認無簽名付款入口；切平台全額模擬退500元，再重新整理並檢查重複動作。
  - **Expected results:**
    1. 取消待退款到已取消／已退款；淨平台服務費0，無酒款、代收、分潤或正常履約。
    2. 主人不被加收餐廳費或罰款；原建議書與取消原因保留。
  - **Evidence:** 關鍵結果截圖、可見文字與DOM文字／可及性樹；記錄console與network錯誤。
  - **Last run:** 2026-11-09 20:06:05 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-008-cancel-refund.png](e2e-evidence/E2E-008-cancel-refund.png)
  - **Observed evidence:** http://127.0.0.1:5173/；5項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-008.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-009 現場驗齡後先完整揭價再簽名
  - **Priority:** Critical
  - **Prerequisites:** AGE：甲6000＋運送200，已餐廳暫存但未驗齡。
  - **Steps:**
    1. 餐廳檢視固定宴客聯絡人姓名與十八歲核對提示，按「已核對本人且年滿十八歲」。
    2. 核對同裝置自動進「現場購買確認」，查看品項、6瓶、每瓶1000、酒款6000、運送200、合計6200及酒商賣方／授權餐廳。
    3. 尚未簽名前確認不能付款；返回再接續購買確認，重新整理。
  - **Expected results:**
    1. 主人在簽名前先看完整實購價金；不另收300元，不見分潤。
    2. 沒有獨立遠端確認購買步驟，固定姓名唯讀；未簽名不成立已付或服務完成。
  - **Evidence:** 關鍵結果截圖、可見文字與DOM文字／可及性樹；記錄console與network錯誤。
  - **Last run:** 2026-11-09 20:06:10 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-009-onsite-revealed.png](e2e-evidence/E2E-009-onsite-revealed.png)
  - **Observed evidence:** http://127.0.0.1:5173/；8項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-009.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-010 本人不符或驗齡失敗直接由酒商確認取回
  - **Priority:** Critical
  - **Prerequisites:** AGE，分兩次獨立重設測本人不符與年齡未通過。
  - **Steps:**
    1. 餐廳選未通過，先不填原因提交，再填「本人不符」或「未滿十八歲」提交。
    2. 切主人、酒商與平台檢視結果；甲核對整筆酒品與數量並確認取回。
    3. 重新整理，再切平台確認所有區塊沒有取回成本輸入、摘要或待登錄。
  - **Expected results:**
    1. 缺原因阻擋；有效失敗後待退回，不開放主人價金／簽名付款，不可改成通過。
    2. 取回後服務未完成、無酒款成交／代收／分潤，既有500元不退規則維持；主人不加收取回費，無需平台成本操作。
  - **Evidence:** 關鍵結果截圖、可見及DOM文字／可及性樹；金額、分潤基礎與取回紀錄對照；記錄非預期console／network錯誤。
  - **Last run:** 2026-11-09 20:06:36 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-010-identity-failed.png](e2e-evidence/E2E-010-identity-failed.png)、[E2E-010-age-failed.png](e2e-evidence/E2E-010-age-failed.png)
  - **Observed evidence:** http://127.0.0.1:5173/；11項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-010.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

## 3. 現場購買與付款

- [x] E2E-011 全數購買簽名、付款完成後沒有餘酒待辦
  - **Priority:** Critical
  - **Prerequisites:** REVEALED：原6瓶每瓶1000元、運送200元。
  - **Steps:**
    1. 空白簽名時嘗試保存／付款；手寫保存後清除，確認不能沿用。
    2. 以相同固定姓名重簽，維持全數6瓶並成功模擬付款。
    3. 檢視主人完成畫面，再切平台、甲與餐廳查看實購分潤及所有取回區塊。
  - **Expected results:**
    1. 空白或清除後不許付款；簽名不等於已付。
    2. 酒商收款6200元，實購酒款6000元，僅內部見600元10%分潤；全數完成不建立餘酒紀錄、取回待辦或要求取回，主人無300元或分潤文字。
  - **Evidence:** 關鍵結果截圖、可見及DOM文字／可及性樹；金額、分潤基礎與取回紀錄對照；記錄非預期console／network錯誤。
  - **Last run:** 2026-11-09 20:06:42 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-011-host-completed.png](e2e-evidence/E2E-011-host-completed.png)、[E2E-011-internal-full.png](e2e-evidence/E2E-011-internal-full.png)
  - **Observed evidence:** http://127.0.0.1:5173/；13項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-011.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-012 付款失敗保留同版本簽名與重新整理重試
  - **Priority:** Critical
  - **Prerequisites:** SIGNED：REVEALED已有有效簽名。
  - **Steps:**
    1. 選模擬失敗並支付，檢視錯誤後重新整理。
    2. 保持同明細不重簽，改模擬成功重試；再重新整理完成結果。
  - **Expected results:**
    1. 失敗時不完成、不建帳款或分潤；保留同版簽名及失敗紀錄。
    2. 重試只產生一次6200元成功付款及600元內部分潤；無自動重送或要求重付。
  - **Evidence:** 關鍵結果截圖、可見文字與DOM文字／可及性樹；記錄console與network錯誤。
  - **Last run:** 2026-11-09 20:06:48 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-012-retry-success.png](e2e-evidence/E2E-012-retry-success.png)
  - **Observed evidence:** http://127.0.0.1:5173/；5項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-012.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-013 全數購買失敗後代收與收清不產生餘酒
  - **Priority:** Critical
  - **Prerequisites:** FAILED：全數6瓶明細已有有效簽名及一次失敗。
  - **Steps:**
    1. 主人請餐廳代收，檢查交回店員提示與DOM不含分潤。
    2. 交回店員開餐廳確認，核對全額6200元並確認承接。
    3. 主人看自身明細與餐廳結帳提示；甲確認收到全額款項，再次確認並重新整理。
  - **Expected results:**
    1. 請求本身不完成；承接才完成，內部建立一筆6200元應付款與獨立600元分潤，不抵成5600元。
    2. 主人不見內部帳款或分潤；未收清不冒稱已收款，收清不重建分潤；全數購買從承接到收清均無餘酒取回紀錄或待辦。
  - **Evidence:** 關鍵結果截圖、可見及DOM文字／可及性樹；金額、分潤基礎與取回紀錄對照；記錄非預期console／network錯誤。
  - **Last run:** 2026-11-09 20:06:54 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-013-handoff.png](e2e-evidence/E2E-013-handoff.png)、[E2E-013-host-collection.png](e2e-evidence/E2E-013-host-collection.png)、[E2E-013-received-full.png](e2e-evidence/E2E-013-received-full.png)
  - **Observed evidence:** http://127.0.0.1:5173/；8項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-013.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-014 拒絕代收與整筆取消均不登錄取回成本
  - **Priority:** High
  - **Prerequisites:** FAILED；另一次獨立REVEALED測簽名前取消。
  - **Steps:**
    1. 請餐廳代收並交回店員，餐廳拒絕；主人回待付款後先開取消確認再返回，檢查資料未變。
    2. 再次確認取消，由甲核對整筆酒品與數量並確認取回；平台只查看結果，不執行成本操作。
    3. 另重設REVEALED測簽名前取消，檢查平台、餐廳及酒商都無取回成本欄位或待辦。
  - **Expected results:**
    1. 拒絕不自動取消／完成，同明細簽名可重試；只有確認取消才使簽名失效並待取回。
    2. 取消無酒款／分潤／代收，500依既有規則不退，主人不負擔取回費；酒商確認即可結束，不需平台配合成本登錄，終止後不能恢復購買。
  - **Evidence:** 關鍵結果截圖、可見及DOM文字／可及性樹；金額、分潤基礎與取回紀錄對照；記錄非預期console／network錯誤。
  - **Last run:** 2026-11-09 20:07:24 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-014-cancel-after-decline.png](e2e-evidence/E2E-014-cancel-after-decline.png)、[E2E-014-cancel-before-sign.png](e2e-evidence/E2E-014-cancel-before-sign.png)
  - **Observed evidence:** http://127.0.0.1:5173/；8項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-014.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

## 4. 現場明細與餘酒

- [x] E2E-015 減量後直接核對、簽名付款及實購分潤
  - **Priority:** Critical
  - **Prerequisites:** REVEALED：原備酒6瓶、每瓶1000元、運送200元。
  - **Steps:**
    1. 交還店員調整購買明細，餐廳只將購買瓶數改為4，確認自動推得未購買2瓶，再保存。
    2. 確認直接交回主人核對4000＋200＝4200元，沒有再回全數／減量／全部不買的選擇點；重新整理後新明細仍在。
    3. 主人簽名並成功付款，切內部角色檢視分潤及2瓶待取回。
  - **Expected results:**
    1. 原6瓶參考建議書不變，品項、容量、單價及運送費唯讀；減量後一定先核對再簽名，未簽名不得付款。
    2. 實購4200元收款、4000元酒款計400元分潤，未購買2瓶不計佣金；已購買部分完成，僅剩2瓶待取回，不等取回才能完成。
  - **Evidence:** 關鍵結果截圖、可見及DOM文字／可及性樹；金額、分潤基礎與取回紀錄對照；記錄非預期console／network錯誤。
  - **Last run:** 2026-11-09 20:07:30 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-015-staff-reduction.png](e2e-evidence/E2E-015-staff-reduction.png)、[E2E-015-partial-completed.png](e2e-evidence/E2E-015-partial-completed.png)
  - **Observed evidence:** http://127.0.0.1:5173/；7項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-015.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-016 簽名付款失敗後減量必須重簽及重新嘗試
  - **Priority:** Critical
  - **Prerequisites:** FAILED：原6瓶、每瓶1000元、運送200，已有原版簽名與失敗。
  - **Steps:**
    1. 交回授權店員，只將購買瓶數減到4，確認沒有換款、新增品項、單價或運送費編輯，保存減量。
    2. 直接交給主人核對4200元明細；確認原簽名失效，原版失敗紀錄不能讓新明細直接代收。
    3. 主人重簽，先模擬新版本付款失敗，再請餐廳代收並由店員承接。
  - **Expected results:**
    1. 原建議書、酒款、單價、運送費及固定姓名不變，原簽名與失敗歷史可追溯但無新版本資格。
    2. 新簽及新失敗後才可代收4200元，分潤只按實購4000元計400元，另有2瓶未購買待取回；不得沿用原6200元帳款或600元分潤。
  - **Evidence:** 關鍵結果截圖、可見及DOM文字／可及性樹；金額、分潤基礎與取回紀錄對照；記錄非預期console／network錯誤。
  - **Last run:** 2026-11-09 20:07:37 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-016-revised-collection.png](e2e-evidence/E2E-016-revised-collection.png)
  - **Observed evidence:** http://127.0.0.1:5173/；7項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-016.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-017 只能減量、不可換款加量或手動改價
  - **Priority:** High
  - **Prerequisites:** SIGNED；另以代收待確認、已完成及取消狀態檢查入口。
  - **Steps:**
    1. 交回餐廳編輯，確認只有原備酒各列的購買瓶數可改，名稱、容量、單價與運送費為唯讀，沒有新增酒款或換款操作。
    2. 分別輸入負數、小數、超過原備酒數6的7瓶並保存；測各列皆0時提示走整筆取消，再返回保留原成功明細。
    3. 切其他角色及禁止階段確認無可用減量入口；對偽造改品項、單價、運送費命令以U-03驗證。
  - **Expected results:**
    1. 無效保存不改最後成功明細或簽名；不自動改價，0瓶代表不買該列，全為0不成立零元交易。
    2. 僅指定餐廳在允許現場階段能減量；不存在換款、超原備酒數加量、手動改價或付款後改單。
  - **Evidence:** 關鍵結果截圖、可見及DOM文字／可及性樹；金額、分潤基礎與取回紀錄對照；記錄非預期console／network錯誤。
  - **Last run:** 2026-11-09 20:07:43 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-017-invalid-quantities.png](e2e-evidence/E2E-017-invalid-quantities.png)、[E2E-017-completed-locked.png](e2e-evidence/E2E-017-completed-locked.png)
  - **Observed evidence:** http://127.0.0.1:5173/；12項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-017.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-018 餘酒取回與所有異常取回均無平台成本登錄
  - **Priority:** High
  - **Prerequisites:** PARTIAL：4瓶購買完成、2瓶待取回；另備AGE與SIGNED重設入口。
  - **Steps:**
    1. PARTIAL下由甲核對未購買2瓶並確認取回，再重送並重新整理。
    2. 切平台、主人、餐廳及酒商檢查取回區塊與DOM，確認沒有成本輸入、登錄按鈕、金額摘要或待登錄狀態。
    3. 分別重設為整筆取消、驗齡失敗及補填姓名核對失敗退回，酒商直接確認取回；已退役cost命令的拒絕由U-02補足。
  - **Expected results:**
    1. 餘酒只取回一次，保存酒款、數量、確認酒商與時間；原4200元付款、400元分潤與完成時間不變，未購買酒不進佣金基礎。
    2. 所有取回均不需平台登錄成本，也不能以舊命令更新成本；主人無新增取回費，未獲選酒商無後續資訊。
  - **Evidence:** 關鍵結果截圖、可見及DOM文字／可及性樹；金額、分潤基礎與取回紀錄對照；記錄非預期console／network錯誤。
  - **Last run:** 2026-11-09 20:07:50 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-018-unused-returned.png](e2e-evidence/E2E-018-unused-returned.png)、[E2E-018-age-return-no-cost.png](e2e-evidence/E2E-018-age-return-no-cost.png)、[E2E-018-cancel-return-no-cost.png](e2e-evidence/E2E-018-cancel-return-no-cost.png)
  - **Observed evidence:** http://127.0.0.1:5173/；10項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-018.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

## 5. 角色呈現與相容性

- [x] E2E-019 完整角色矩陣與主人永不見分潤
  - **Priority:** Critical
  - **Prerequisites:** 分別準備直接完成、代收待付、收清、整筆取消與部分成交待取回。
  - **Steps:**
    1. 各狀態依序切平台、餐廳、獲選酒商、主人與未獲選酒商，正常捲動各區塊並重新整理。
    2. 由看過分潤的角色切回主人，檢查完成頁、側欄、歷程、簽名紀錄及DOM文字。
    3. 檢查兩家酒商都不見主人姓名電話與筆畫；以反向選乙案例再測一次。
  - **Expected results:**
    1. 主人所有階段無10%／分潤金額／待結算／內部帳款，不閃現上一角色內容。
    2. 僅平台、獲選酒商、指定餐廳見授權分潤；未獲選無後續資料，酒商個資限制保留。
  - **Evidence:** 關鍵結果截圖、可見文字與DOM文字／可及性樹；記錄console與network錯誤。
  - **Last run:** 2026-11-09 20:09:57 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-019-host-direct.png](e2e-evidence/E2E-019-host-direct.png)、[E2E-019-host-collection.png](e2e-evidence/E2E-019-host-collection.png)、[E2E-019-host-received.png](e2e-evidence/E2E-019-host-received.png)、[E2E-019-host-cancel.png](e2e-evidence/E2E-019-host-cancel.png)、[E2E-019-host-partial.png](e2e-evidence/E2E-019-host-partial.png)、[E2E-019-reverse-merchant.png](e2e-evidence/E2E-019-reverse-merchant.png)
  - **Observed evidence:** http://127.0.0.1:5173/；35項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-019.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-020 桌機及觸控的警語與購買確認
  - **Priority:** High
  - **Prerequisites:** COMPARE及REVEALED各一份；1366×768、390×844。
  - **Steps:**
    1. 各尺寸查看酒款建議書與現場購買確認，正常捲動讀三項警語與賣方說明。
    2. 在手機以觸控筆畫簽名、清除及重簽，操作付款失敗與交回店員。
    3. 觀察捲動、按鈕可操作與頁面寬度。
  - **Expected results:**
    1. 警語明顯可讀，不只在條款／hover；不遮蔽操作且無水平溢出。
    2. 觸控簽名與清除可用，DEMO與不收真實資料可辨識，不宣稱已獲法律核可。
  - **Evidence:** 關鍵結果截圖、可見文字與DOM文字／可及性樹；記錄console與network錯誤。
  - **Last run:** 2026-11-09 20:10:03 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-020-proposal-1366.png](e2e-evidence/E2E-020-proposal-1366.png)、[E2E-020-checkout-1366.png](e2e-evidence/E2E-020-checkout-1366.png)、[E2E-020-proposal-390.png](e2e-evidence/E2E-020-proposal-390.png)、[E2E-020-checkout-390.png](e2e-evidence/E2E-020-checkout-390.png)、[E2E-020-touch-handoff.png](e2e-evidence/E2E-020-touch-handoff.png)
  - **Observed evidence:** http://127.0.0.1:5173/；11項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-020.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-021 v1／v2／v3簽名付款及舊單核對相容
  - **Priority:** Critical
  - **Prerequisites:** 實作前保存之LEGACY樣本manifest已備妥；使用隔離瀏覽器來源。
  - **Steps:**
    1. 逐一載入manifest的v1/v2/v3有效樣本：缺聯絡資料未簽、已驗齡未簽、已簽未付、已付完成、代收待收清與已收清。
    2. 缺資料未簽者由主人一次補填；已驗齡者交指定餐廳核對姓名通過，另以獨立樣本測不符。
    3. 已簽未付沿用原簽名付款或代收，已付不重付；代收待付由獲選酒商收清，再重新整理。 另載入取回成本原為0元、200元或未填的舊樣本，確認歷史原值保留而各角色無現行成本登錄／摘要／待辦。
  - **Expected results:**
    1. 日期已近或已過不拒載；舊姓名／簽名筆畫、快照、金額與時間保留，不補造簽名或追收300元。
    2. 補填／姓名核對守門不被跳過，核對失敗待退回；主人仍不見分潤，內部原成交結果一致。
  - **Evidence:** 保留原樣本hash與關鍵金額時間對照、頁面截圖；不得以新成功付款冒充歷史已付結果。
  - **Last run:** 2026-11-09 20:12:16 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-021-v2-signed.png](e2e-evidence/E2E-021-v2-signed.png)、[E2E-021-v2-collection.png](e2e-evidence/E2E-021-v2-collection.png)、[E2E-021-v2-collected.png](e2e-evidence/E2E-021-v2-collected.png)、[E2E-021-v2-online.png](e2e-evidence/E2E-021-v2-online.png)、[E2E-021-v3-signed.png](e2e-evidence/E2E-021-v3-signed.png)、[E2E-021-v3-paid.png](e2e-evidence/E2E-021-v3-paid.png)、[E2E-021-v3-collection.png](e2e-evidence/E2E-021-v3-collection.png)、[E2E-021-v3-received.png](e2e-evidence/E2E-021-v3-received.png)、[E2E-021-v3-return-null.png](e2e-evidence/E2E-021-v3-return-null.png)、[E2E-021-v3-return-zero.png](e2e-evidence/E2E-021-v3-return-zero.png)、[E2E-021-v3-return-200.png](e2e-evidence/E2E-021-v3-return-200.png)、[E2E-021-legacy-contact-checked.png](e2e-evidence/E2E-021-legacy-contact-checked.png)、[E2E-021-legacy-name-return.png](e2e-evidence/E2E-021-legacy-name-return.png)、[E2E-021-legacy-signed-paid.png](e2e-evidence/E2E-021-legacy-signed-paid.png)、[E2E-021-legacy-received.png](e2e-evidence/E2E-021-legacy-received.png)
  - **Observed evidence:** http://127.0.0.1:5173/；142項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-021.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-022 舊預算不偽標新版通過及新提交驗證
  - **Priority:** High
  - **Prerequisites:** LEGACY含酒款預算6500、舊提交合計超過6825之樣本，以及舊小數容量草稿／提交樣本。
  - **Steps:**
    1. 載入已提交但未選定與已選定舊單，切主人檢查歷史標章並接續允許流程。
    2. 以仍可編輯的舊草稿或舊提交重新正式送出超額／小數容量版本，再修正到新版有效範圍。
    3. 重新整理並切主人查看新提交的標章。
  - **Expected results:**
    1. 不拒載原歷史資格、不改原金額，使用「歷史建議書・沿用原預算規則」，不假稱通過新版105%。
    2. 任何新正式提交皆套新整數及含運上限，修正後才顯示新版符合文字，不擴大舊例外。
  - **Evidence:** 關鍵結果截圖、可見文字與DOM文字／可及性樹；記錄console與network錯誤。
  - **Last run:** 2026-11-09 20:12:50 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-022-old-budget.png](e2e-evidence/E2E-022-old-budget.png)、[E2E-022-new-budget.png](e2e-evidence/E2E-022-new-budget.png)、[E2E-022-decimal-corrected.png](e2e-evidence/E2E-022-decimal-corrected.png)、[E2E-022-old-selected.png](e2e-evidence/E2E-022-old-selected.png)
  - **Observed evidence:** http://127.0.0.1:5173/；8項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-022.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-023 四個新版展示入口一致且可重設
  - **Priority:** Medium
  - **Prerequisites:** 可進展示工作區。
  - **Steps:**
    1. 依序按從空白需求開始、重設正常起點、載入餐廳取消前、載入餐廳驗齡前，每次確認取代資料。
    2. 檢查姓名電話預填／空白差異、前置歷程、預算與提案資格，再重新整理。
  - **Expected results:**
    1. 四入口保留；正常／異常入口具有效模擬聯絡資料、含運預算及合法提案，不用舊例外跳過驗證。
    2. 空白不預填姓名電話，重設無上筆付款、分潤或餘酒殘留；無固定300元設定。
  - **Evidence:** 關鍵結果截圖、可見文字與DOM文字／可及性樹；記錄console與network錯誤。
  - **Last run:** 2026-11-09 20:10:43 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-023-blank.png](e2e-evidence/E2E-023-blank.png)、[E2E-023-normal.png](e2e-evidence/E2E-023-normal.png)、[E2E-023-cancel.png](e2e-evidence/E2E-023-cancel.png)、[E2E-023-age.png](e2e-evidence/E2E-023-age.png)
  - **Observed evidence:** http://127.0.0.1:5173/；13項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-023.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-024 保存失敗與損壞資料復原
  - **Priority:** High
  - **Prerequisites:** 隔離測試context，具可復原原始localStorage備份。
  - **Steps:**
    1. 以Playwright MCP允許的測試環境初始化方式暫時使本應用localStorage寫入拋錯，再操作服務費、改單或餐廳承接其中一項。
    2. 復原寫入後重試；另載入損壞JSON，開頁但先不確認重設，核對原字串。
    3. 確認重設後才恢復正常展示。
  - **Expected results:**
    1. 保存失敗可見且保留上次成功狀態，不冒稱已付／已改單／已承接。
    2. 讀取錯誤不靜默覆寫，只有確認重設才取代損壞資料，不碰其他應用key。
  - **Evidence:** 錯誤提示及前後狀態／原始字串對照；此為故障注入，不記成產品按鈕功能。
  - **Last run:** 2026-11-09 20:10:49 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-024-write-failure.png](e2e-evidence/E2E-024-write-failure.png)、[E2E-024-corrupt-preserved.png](e2e-evidence/E2E-024-corrupt-preserved.png)、[E2E-024-recovered.png](e2e-evidence/E2E-024-recovered.png)
  - **Observed evidence:** http://127.0.0.1:5173/；6項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-024.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-025 需求與提案既有輸入規則回歸
  - **Priority:** High
  - **Prerequisites:** 空白需求與BUDGET各獨立案例。
  - **Steps:**
    1. 需求逐一測缺姓名電話、abc電話、有效市話分機、空白料理、非整數人數、過早日期；修正後保存多行料理並跨角色查看。
    2. 酒商逐列測容量／瓶數／單價空白、0、負數、小數、第二列錯誤與運費無效，修正後正式提交。
  - **Expected results:**
    1. 錯誤保留輸入、不自動四捨五入；正數安全整數、0運費與有效電話可用。
    2. 新三日日期限制、固定姓名、多行保存仍有效；精確跨月跨年與跨午夜以U-01確定性驗證。
  - **Evidence:** 關鍵結果截圖、可見文字與DOM文字／可及性樹；記錄console與network錯誤。
  - **Last run:** 2026-11-09 20:11:04 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-025-input-regression.png](e2e-evidence/E2E-025-input-regression.png)
  - **Observed evidence:** http://127.0.0.1:5173/；25項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-025.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

- [x] E2E-026 完成唯一性及非法狀態守門回歸
  - **Priority:** Critical
  - **Prerequisites:** SIGNED、代收待確認、直接完成、代收完成、整筆取消各獨立資料。
  - **Steps:**
    1. 在可見成功按鈕快速重複點擊一次，重新整理查看付款、代收、完成與收清結果。
    2. 完成或取消後查看不應再存在的付款、改單、驗齡、取消及另一支付路徑入口。
    3. 對瀏覽器無法送出的非法角色／狀態命令執行U-02與U-03，不能用缺按鈕推論領域守門通過。
  - **Expected results:**
    1. 同一交易只完成、付款、代收及分潤一次；已完成只保留原授權收清與實際存在的餘酒取回，全數購買無餘酒待辦，任何狀態均無平台取回成本操作。
    2. 異常終止不能恢復，錯誤角色不能跳過守門；確切命令重送結果由低階驗證補足。
  - **Evidence:** 關鍵結果截圖、可見文字與DOM文字／可及性樹；記錄console與network錯誤。
  - **Last run:** 2026-11-09 20:12:16 Asia/Taipei — PASS
  - **Screenshot evidence:** [E2E-021-v2-signed.png](e2e-evidence/E2E-021-v2-signed.png)、[E2E-021-v2-collection.png](e2e-evidence/E2E-021-v2-collection.png)、[E2E-021-v2-collected.png](e2e-evidence/E2E-021-v2-collected.png)、[E2E-021-v2-online.png](e2e-evidence/E2E-021-v2-online.png)、[E2E-021-v3-signed.png](e2e-evidence/E2E-021-v3-signed.png)、[E2E-021-v3-paid.png](e2e-evidence/E2E-021-v3-paid.png)、[E2E-021-v3-collection.png](e2e-evidence/E2E-021-v3-collection.png)、[E2E-021-v3-received.png](e2e-evidence/E2E-021-v3-received.png)、[E2E-021-v3-return-null.png](e2e-evidence/E2E-021-v3-return-null.png)、[E2E-021-v3-return-zero.png](e2e-evidence/E2E-021-v3-return-zero.png)、[E2E-021-v3-return-200.png](e2e-evidence/E2E-021-v3-return-200.png)、[E2E-021-legacy-contact-checked.png](e2e-evidence/E2E-021-legacy-contact-checked.png)、[E2E-021-legacy-name-return.png](e2e-evidence/E2E-021-legacy-name-return.png)、[E2E-021-legacy-signed-paid.png](e2e-evidence/E2E-021-legacy-signed-paid.png)、[E2E-021-legacy-received.png](e2e-evidence/E2E-021-legacy-received.png)
  - **Observed evidence:** http://127.0.0.1:5173/；142項觀察；page/console errors 0。實測JSON見 e2e-evidence/E2E-021.json。
  - **Cleanup:** 依Test Setup重設或關閉隔離context。

## Traceability

124個規格情境逐項對應如下；精確時計算、偽造命令及原始歷史資料另以U-01至U-04補足，不把未執行項目勾選。新範圍只減量、不換款；全數購買無餘酒待辦，任何取回流程均無平台成本登錄。

| Spec scenario | E2E case(s) | Notes |
|---|---|---|
| `banquet-matching / 六項宴客需求 / 從空白建立有效需求` | E2E-001, E2E-025 | U-01 |
| `banquet-matching / 六項宴客需求 / 阻止無效需求` | E2E-001, E2E-025 | U-01 |
| `banquet-matching / 六項宴客需求 / 阻止過早宴客日期` | E2E-001, E2E-025 | U-01 |
| `banquet-matching / 六項宴客需求 / 接受最早日期邊界` | E2E-001, E2E-025 | U-01 |
| `banquet-matching / 六項宴客需求 / 跨日提交重新驗證` | — | U-01以固定台北時刻驗證，無瀏覽器跨午夜等待 |
| `banquet-matching / 六項宴客需求 / 依台北日曆處理跨月跨年與裝置時區` | — | U-01確定性時區／閏日／跨月跨年 |
| `banquet-matching / 六項宴客需求 / 提交多行料理內容` | E2E-001, E2E-025 | U-01 |
| `banquet-matching / 六項宴客需求 / 阻止只有空白或換行的料理內容` | E2E-001, E2E-025 | U-01 |
| `banquet-matching / 服務費付款先於邀請提案 / 未付款不得邀請` | E2E-001, E2E-026 | U-02 |
| `banquet-matching / 服務費付款先於邀請提案 / 主人完成服務費模擬付款` | E2E-001, E2E-026 | U-02 |
| `banquet-matching / 平台邀請及酒商編輯提案 / 酒商送出完整提案` | E2E-002, E2E-025 | U-01／U-02 |
| `banquet-matching / 平台邀請及酒商編輯提案 / 提案缺項不得送出` | E2E-002, E2E-025 | U-01／U-02 |
| `banquet-matching / 提案的透明比較 / 費用比較無重複計算` | E2E-004, E2E-006 | 瀏覽器可見行為 |
| `banquet-matching / 提案的透明比較 / 只有一份提案時尚不能選定` | E2E-004, E2E-006 | 瀏覽器可見行為 |
| `banquet-matching / 唯一選定與條件快照 / 選定後進入協調` | E2E-006, E2E-019 | U-02補直接非法命令 |
| `banquet-matching / 唯一選定與條件快照 / 選定後禁止改價與重選` | E2E-006, E2E-019 | U-02補直接非法命令 |
| `banquet-matching / 唯一選定與條件快照 / 未獲選酒商不得讀取後續資訊` | E2E-006, E2E-019 | U-02補直接非法命令 |
| `banquet-matching / 唯一選定與條件快照 / 任一家酒商未獲選均適用` | E2E-006, E2E-019 | U-02補直接非法命令 |
| `banquet-matching / 必填姓名及台灣聯絡電話 / 姓名電話缺漏不得建立需求` | E2E-001, E2E-025 | U-01 |
| `banquet-matching / 必填姓名及台灣聯絡電話 / 接受台灣手機及市話分機` | E2E-001, E2E-025 | U-01 |
| `banquet-matching / 必填姓名及台灣聯絡電話 / 拒絕電話格式錯誤` | E2E-001, E2E-025 | U-01 |
| `banquet-matching / 送出確認與姓名鎖定 / 返回修改姓名後再送出` | E2E-001, E2E-011 | U-02補偽造更名 |
| `banquet-matching / 送出確認與姓名鎖定 / 提交後固定姓名` | E2E-001, E2E-011 | U-02補偽造更名 |
| `banquet-matching / 提案正式送出的整數限制 / 正整數提案及免運可提交` | E2E-003, E2E-025 | U-01補安全整數與移除餐廳費 |
| `banquet-matching / 提案正式送出的整數限制 / 容量瓶數單價拒絕非法值` | E2E-003, E2E-025 | U-01補安全整數與移除餐廳費 |
| `banquet-matching / 提案正式送出的整數限制 / 運費與固定餐廳費用限制` | E2E-003, E2E-025 | U-01補安全整數與移除餐廳費 |
| `banquet-matching / 不完整提案草稿與修正 / 保存空白及小數草稿` | E2E-003, E2E-025 | 瀏覽器可見行為 |
| `banquet-matching / 不完整提案草稿與修正 / 多酒款逐列驗證後重試` | E2E-003, E2E-025 | 瀏覽器可見行為 |
| `banquet-matching / 含運預算及百分之五彈性預先揭露 / 主人填寫前理解預算範圍` | E2E-001 | 瀏覽器可見行為 |
| `banquet-matching / 酒商編輯即時計算提案上限 / 編輯時即看到合計與超額` | E2E-002, E2E-003 | U-01補溢位 |
| `banquet-matching / 酒商編輯即時計算提案上限 / 非整元上限及未完成欄位` | E2E-002, E2E-003 | U-01補溢位 |
| `banquet-matching / 正式提交阻擋超過含運上限 / 接受上限及拒絕超過一元` | E2E-002, E2E-003 | U-01補繞過UI提交 |
| `banquet-matching / 正式提交阻擋超過含運上限 / 超額草稿可保存修正重試` | E2E-002, E2E-003 | U-01補繞過UI提交 |
| `demo-workspace / 成功操作跨重新整理保存 / 重新整理後繼續交付` | E2E-007, E2E-012, E2E-013, E2E-021, E2E-024, E2E-025 | U-04 |
| `demo-workspace / 成功操作跨重新整理保存 / 無法保存時顯示錯誤` | E2E-024 | U-04故障注入 |
| `demo-workspace / 成功操作跨重新整理保存 / 日期接近或已過仍可還原訂單` | E2E-007, E2E-012, E2E-013, E2E-021, E2E-024, E2E-025 | U-04 |
| `demo-workspace / 成功操作跨重新整理保存 / 舊版已保存訂單維持相容` | E2E-007, E2E-012, E2E-013, E2E-021, E2E-024, E2E-025 | U-04 |
| `demo-workspace / 成功操作跨重新整理保存 / 多行料理跨重新整理與角色切換保存` | E2E-007, E2E-012, E2E-013, E2E-021, E2E-024, E2E-025 | U-04 |
| `demo-workspace / 成功操作跨重新整理保存 / 簽名與付款失敗接續` | E2E-007, E2E-012, E2E-013, E2E-021, E2E-024, E2E-025 | U-04 |
| `demo-workspace / 成功操作跨重新整理保存 / 代收與收清跨重新整理保存` | E2E-007, E2E-012, E2E-013, E2E-021, E2E-024, E2E-025 | U-04 |
| `demo-workspace / 固定示範身分與對應工作介面 / 主人切換至酒商` | E2E-009, E2E-019 | U-02 |
| `demo-workspace / 固定示範身分與對應工作介面 / 非法角色動作不改變狀態` | E2E-019, E2E-026 | U-02 |
| `demo-workspace / 固定示範身分與對應工作介面 / 同裝置交給客人` | E2E-009, E2E-019 | U-02 |
| `demo-workspace / 操作歷程可追溯 / 同一付款重複點擊` | E2E-013, E2E-019, E2E-026 | U-02 |
| `demo-workspace / 操作歷程可追溯 / 代收歷程區分操作人` | E2E-013, E2E-019, E2E-026 | U-02 |
| `demo-workspace / 新示範情境含有效聯絡資料 / 新版展示入口可正常使用` | E2E-023 | 瀏覽器可見行為 |
| `demo-workspace / 主人價金依現場核對階段呈現 / 選定前後所有主人入口均不揭價` | E2E-004, E2E-005, E2E-009, E2E-010 | U-02 |
| `demo-workspace / 主人價金依現場核對階段呈現 / 自由文字不繞過主人揭價時點` | E2E-004, E2E-005, E2E-009, E2E-010 | U-02 |
| `demo-workspace / 主人價金依現場核對階段呈現 / 驗齡通過才在簽名前揭露價金` | E2E-004, E2E-005, E2E-009, E2E-010 | U-02 |
| `demo-workspace / 主人價金依現場核對階段呈現 / 驗齡未過不揭價或完成交易` | E2E-004, E2E-005, E2E-009, E2E-010 | U-02 |
| `demo-workspace / 主人呈現與內部帳務分離 / 交回店員前不出現內部分潤` | E2E-013, E2E-019 | U-02 |
| `demo-workspace / 主人呈現與內部帳務分離 / 角色切換不殘留內部資料` | E2E-013, E2E-019 | U-02 |
| `demo-workspace / 舊資料不回寫成交或冒稱新版預算通過 / 已簽付款與代收歷史保留` | E2E-021, E2E-022, E2E-023, E2E-024 | U-04 |
| `demo-workspace / 舊資料不回寫成交或冒稱新版預算通過 / 舊預算及不符新上限的建議書不偽標通過` | E2E-021, E2E-022, E2E-023, E2E-024 | U-04 |
| `demo-workspace / 舊資料不回寫成交或冒稱新版預算通過 / 舊草稿與新示範情境分開` | E2E-021, E2E-022, E2E-023, E2E-024 | U-04 |
| `demo-workspace / 舊資料不回寫成交或冒稱新版預算通過 / 保存失敗及損壞資料不冒稱成功` | E2E-024 | U-04原字串對照 |
| `demo-workspace / 現場明細及餘酒狀態保存 / 現場改單後重新整理` | E2E-015, E2E-016 | U-03／U-04 |
| `demo-workspace / 現場明細及餘酒狀態保存 / 餘酒取回不改已完成服務` | E2E-018 | U-03／U-04 |
| `restaurant-collection / 付款失敗後由店員確認承接代收 / 主人提出代收請求` | E2E-013, E2E-014 | U-02 |
| `restaurant-collection / 付款失敗後由店員確認承接代收 / 店員承接代收` | E2E-013, E2E-014 | U-02 |
| `restaurant-collection / 付款失敗後由店員確認承接代收 / 店員拒絕代收` | E2E-013, E2E-014 | U-02 |
| `restaurant-collection / 付款失敗後由店員確認承接代收 / 非餐廳角色不能承接` | E2E-019, E2E-026 | U-02直接命令，不以缺按鈕代替驗證 |
| `restaurant-collection / 代收帳款與其他費用及分潤分開 / 全額應付款與分潤並列` | E2E-013, E2E-019 | 瀏覽器可見行為 |
| `restaurant-collection / 服務完成與代收帳款收清分開 / 餐廳承接但酒商未收款` | E2E-013, E2E-019 | 瀏覽器可見行為 |
| `restaurant-collection / 選定酒商確認整筆收清 / 酒商收清全額` | E2E-013, E2E-019, E2E-026 | U-02 |
| `restaurant-collection / 選定酒商確認整筆收清 / 未獲選酒商不能取得帳款資訊` | E2E-013, E2E-019, E2E-026 | U-02 |
| `restaurant-collection / 選定酒商確認整筆收清 / 重複收清操作顯示提醒` | E2E-013, E2E-019, E2E-026 | U-02 |
| `restaurant-collection / 完成後鎖定支付方式及帳款唯一性 / 代收完成後再嘗試線上付款` | E2E-026 | U-02補完成後跨路徑命令 |
| `restaurant-collection / 完成後鎖定支付方式及帳款唯一性 / 線上付款完成後再嘗試代收` | E2E-026 | U-02補完成後跨路徑命令 |
| `restaurant-fulfillment / 餐廳先確認收貨安排 / 確認安排後開始配送` | E2E-007 | U-02補跳步命令 |
| `restaurant-fulfillment / 餐廳先確認收貨安排 / 收貨安排未確認` | E2E-007 | U-02補跳步命令 |
| `restaurant-fulfillment / 酒商送達與餐廳收貨分開確認 / 餐廳確認收到酒` | E2E-007 | 瀏覽器可見行為 |
| `restaurant-fulfillment / 餐廳負責驗齡 / 餐廳登錄通過` | E2E-009, E2E-010 | U-02 |
| `restaurant-fulfillment / 餐廳負責驗齡 / 未驗齡或未通過時不得購酒付款` | E2E-009, E2E-010 | U-02 |
| `restaurant-fulfillment / 餐廳負責驗齡 / 以需求姓名核對本人` | E2E-009, E2E-010 | U-02 |
| `restaurant-fulfillment / 現場購買後模擬付款給酒商 / 完成酒商收款模擬` | E2E-009, E2E-011 | U-02 |
| `restaurant-fulfillment / 現場購買後模擬付款給酒商 / 未確認購買不得付款` | E2E-009, E2E-011 | U-02 |
| `restaurant-fulfillment / 交付與服務完成的必要條件 / 正常完成服務` | E2E-011, E2E-013, E2E-026 | U-02 |
| `restaurant-fulfillment / 交付與服務完成的必要條件 / 阻止提早完成` | E2E-011, E2E-013, E2E-026 | U-02 |
| `restaurant-fulfillment / 交付與服務完成的必要條件 / 餐廳承接代收完成服務` | E2E-011, E2E-013, E2E-026 | U-02 |
| `restaurant-fulfillment / 完成狀態不得重複推進 / 重複確認收取` | — | 新流程無此UI；U-02直接重送歷史完成命令 |
| `restaurant-fulfillment / 完成狀態不得重複推進 / 重複付款或承接` | E2E-026 | U-02補舊命令 |
| `restaurant-fulfillment / 本人手寫簽收綁定交易明細 / 保存有效簽名` | E2E-011, E2E-016, E2E-020 | U-02／U-03補偽造姓名與快照 |
| `restaurant-fulfillment / 本人手寫簽收綁定交易明細 / 空白與清除簽名` | E2E-011, E2E-016, E2E-020 | U-02／U-03補偽造姓名與快照 |
| `restaurant-fulfillment / 本人手寫簽收綁定交易明細 / 明細變更必須重簽` | E2E-011, E2E-016, E2E-020 | U-02／U-03補偽造姓名與快照 |
| `restaurant-fulfillment / 本人手寫簽收綁定交易明細 / 簽名不能替換姓名` | E2E-011, E2E-016, E2E-020 | U-02／U-03補偽造姓名與快照 |
| `restaurant-fulfillment / 本人手寫簽收綁定交易明細 / 清除重簽沿用固定姓名` | E2E-011, E2E-016, E2E-020 | U-02／U-03補偽造姓名與快照 |
| `restaurant-fulfillment / 模擬付款失敗保留簽名供重試 / 失敗後重試成功` | E2E-012, E2E-016 | U-02／U-03 |
| `restaurant-fulfillment / 模擬付款失敗保留簽名供重試 / 未失敗不得直接申請代收` | E2E-011, E2E-016 | U-02／U-03 |
| `restaurant-fulfillment / 舊單補填後的餐廳姓名核對 / 已驗齡舊單待核對姓名` | E2E-021 | U-02／U-04 |
| `restaurant-fulfillment / 舊單補填後的餐廳姓名核對 / 指定餐廳核對後交給主人` | E2E-021 | U-02／U-04 |
| `restaurant-fulfillment / 舊單補填後的餐廳姓名核對 / 非餐廳或重複核對不得推進` | E2E-021, E2E-026 | U-02／U-04 |
| `restaurant-fulfillment / 舊單補填後的餐廳姓名核對 / 舊單補填姓名核對失敗` | E2E-021 | U-02／U-04 |
| `restaurant-fulfillment / 現場購買明細與建議書獨立 / 現場減量後才依實購付款` | E2E-015, E2E-016, E2E-017 | U-03補非法角色狀態 |
| `restaurant-fulfillment / 現場購買明細與建議書獨立 / 簽名後減量須重算重簽` | E2E-016 | U-03驗證明細版本與失敗資格 |
| `restaurant-fulfillment / 現場購買明細與建議書獨立 / 現場無效或超額明細保留原紀錄` | E2E-015, E2E-016, E2E-017 | U-03補非法角色狀態 |
| `restaurant-fulfillment / 現場購買明細與建議書獨立 / 非餐廳或非現場階段不能改單` | E2E-017, E2E-026 | U-03 |
| `restaurant-fulfillment / 未購買備酒取回獨立追蹤 / 全數購買完成沒有餘酒待辦` | E2E-011, E2E-013 | 全數直接付款與代收均無取回紀錄／待辦 |
| `restaurant-fulfillment / 未購買備酒取回獨立追蹤 / 購買完成但餘酒尚待取回` | E2E-015, E2E-018 | U-03 |
| `restaurant-fulfillment / 未購買備酒取回獨立追蹤 / 獲選酒商確認餘酒取回` | E2E-015, E2E-018 | U-03 |
| `restaurant-fulfillment / 未購買備酒取回獨立追蹤 / 餘酒取回不需要平台成本登錄` | E2E-018 | U-02／U-03 |
| `restaurant-revenue-share / 各項收入與費用獨立顯示 / 顯示完整費用流向` | E2E-011, E2E-013, E2E-019 | 瀏覽器可見行為 |
| `restaurant-revenue-share / 以成交酒款為分潤基礎 / 成交分潤正確排除其他費用` | E2E-011, E2E-015, E2E-016 | U-01／U-03補四捨五入 |
| `restaurant-revenue-share / 以成交酒款為分潤基礎 / 未購買備酒不得計入分潤` | E2E-015, E2E-016, E2E-018 | U-03驗證實購10%，餘酒完全排除 |
| `restaurant-revenue-share / 成交才建立待結算紀錄 / 付款後形成唯一紀錄` | E2E-008, E2E-010, E2E-011, E2E-013, E2E-014 | U-02補唯一性 |
| `restaurant-revenue-share / 成交才建立待結算紀錄 / 失敗訂單不產生分潤` | E2E-008, E2E-010, E2E-011, E2E-013, E2E-014 | U-02補唯一性 |
| `restaurant-revenue-share / 成交才建立待結算紀錄 / 承接代收即產生唯一分潤` | E2E-008, E2E-010, E2E-011, E2E-013, E2E-014 | U-02補唯一性 |
| `restaurant-revenue-share / 待結算紀錄不阻擋服務完成 / 服務完成但分潤尚待結算` | E2E-011, E2E-013, E2E-015 | 瀏覽器可見行為 |
| `restaurant-revenue-share / 分潤僅授權內部角色可見 / 主人完成後仍看不到分潤` | E2E-019 | U-02 |
| `restaurant-revenue-share / 分潤僅授權內部角色可見 / 三個內部角色查看相同分潤` | E2E-019 | U-02 |
| `service-exceptions / 異常訂單禁止恢復正常完成 / 驗齡失敗後不能切換角色繞過` | E2E-010, E2E-014, E2E-026 | U-02補異常命令與已退役cost命令 |
| `service-exceptions / 異常訂單禁止恢復正常完成 / 主人取消後不能恢復購買` | E2E-010, E2E-014, E2E-026 | U-02補異常命令與已退役cost命令 |
| `service-exceptions / 已驗齡舊單姓名核對不符的退回 / 保留原驗齡但終止簽收` | E2E-018, E2E-021 | U-02／U-04 |
| `service-exceptions / 已驗齡舊單姓名核對不符的退回 / 失敗後不得改名重驗` | E2E-018, E2E-021 | U-02／U-04 |
| `service-exceptions / 所有取回流程不再登錄平台成本 / 取消或驗齡失敗取回不需平台登錄` | E2E-010, E2E-014, E2E-018 | 瀏覽器可見行為 |
| `service-exceptions / 所有取回流程不再登錄平台成本 / 所有角色均無取回成本登錄入口` | E2E-018, E2E-026 | U-02直接已退役命令 |
| `service-exceptions / 所有取回流程不再登錄平台成本 / 舊成本紀錄保留但不恢復登錄` | E2E-021 | U-04原始歷史metadata |
| `wine-service-disclosure / 服務定位與購買意義一致 / 主人辨識委託與購買` | E2E-006, E2E-007 | 瀏覽器可見行為 |
| `wine-service-disclosure / 服務定位與購買意義一致 / 備酒運送與暫存用語` | E2E-006, E2E-007 | 瀏覽器可見行為 |
| `wine-service-disclosure / 預算與服務費說明先於提交 / 主人只承擔已揭露的平台服務費` | E2E-001 | 瀏覽器可見行為 |
| `wine-service-disclosure / 酒類展示具有明顯警語 / 桌機及手機可讀警語` | E2E-020 | 瀏覽器可見行為 |
| `wine-service-disclosure / 現場交易主體與模擬限制如實揭露 / 現場看清賣方與授權協助方` | E2E-009, E2E-013, E2E-020 | 規劃法律限制另人工核對，不以UI作合法性判定 |
| `wine-service-disclosure / 現場交易主體與模擬限制如實揭露 / 付款失敗不重新取得合作授權` | E2E-009, E2E-013, E2E-020 | 規劃法律限制另人工核對，不以UI作合法性判定 |
| `wine-service-disclosure / 現場交易主體與模擬限制如實揭露 / 展示與法遵判斷分開` | E2E-009, E2E-013, E2E-020 | 規劃法律限制另人工核對，不以UI作合法性判定 |

移除需求對照：原service-exceptions「退回運費由平台負擔並記錄」及其兩個成本登錄情境已以REMOVED明確移除，不再作為應執行的功能；由E2E-018與E2E-021及U-02／U-04驗證無現行登錄入口與舊資料保留。
