async (page) => {
 const id='__CASE_ID__';
 const evidence='openspec/changes/archive/2026-11-07-banquet-wine-platform-demo/e2e-evidence/';
 const observations=[],screenshots=[],errors=[],requests=[];
 const onError=e=>errors.push(e.message), onConsole=m=>{if(m.type()==='error')errors.push(m.text());},onRequest=r=>requests.push({url:r.url(),method:r.method()});
 page.on('pageerror',onError);page.on('console',onConsole);page.on('request',onRequest);
 page.setDefaultTimeout(6000);
 const start=Date.now();
 const check=(value,message)=>{if(!value)throw Error(message);observations.push(message);};
 const body=()=>page.locator('body').innerText();
 const has=async text=>{check((await body()).includes(text),'顯示：'+text);};
 const button=(name)=>page.getByRole('button',{name,exact:true});
 const click=async name=>{await page.getByRole('button',{name}).click();};
 const role=async name=>{await button(name).click();};
 const no=async name=>check(await page.getByRole('button',{name}).count()===0,'沒有不應開放的按鈕：'+name);
 const confirm=async()=>{await page.getByRole('dialog').getByRole('button',{name:'確認',exact:true}).click();};
 const reset=async(label='重設正常起點')=>{await click(label);await confirm();};
 const shot=async suffix=>{await page.screenshot({path:evidence+id+'-'+suffix+'.png',fullPage:true});screenshots.push('e2e-evidence/'+id+'-'+suffix+'.png');};
 const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('banquet-wine-demo:v1')));
 const alert=async fragment=>{const text=await page.getByRole('alert').innerText();check(text.includes(fragment),'錯誤提示：'+fragment);};
 const requestDate=()=>page.evaluate(()=>{
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const part=type=>Number(parts.find(p=>p.type===type).value);
  const date=new Date(Date.UTC(part('year'),part('month')-1,part('day')+7));
  return date.toISOString().slice(0,10)+'T18:00';
 });
 const fillRequest=async(budget=6500)=>{
  await page.getByLabel(/^宴客日期與時間/).fill(await requestDate());
  await page.getByRole('combobox',{name:'合作餐廳',exact:true}).selectOption({label:'暮光餐桌（示範合作餐廳）'});
  await page.getByLabel('宴客人數',{exact:true}).fill('12');await page.getByRole('textbox',{name:/^菜色或料理類型/}).fill('法式料理');
  await page.getByLabel(/^酒款總預算/).fill(String(budget));await page.getByRole('combobox',{name:'飲酒偏好',exact:true}).selectOption({label:'不限'});
 };
 const create=async(blank=false,budget=6500)=>{await reset(blank?'從空白需求開始':'重設正常起點');if(blank||budget!==6500)await fillRequest(budget);await click('提交宴客需求');};
 const payService=async(double=false)=>{await role('宴客主人');await click('模擬支付服務費');if(double){const b=page.getByRole('dialog').getByRole('button',{name:'確認',exact:true});await b.dblclick();}else await confirm();};
 const invite=async()=>{await role('平台管理者');await click('邀請兩家酒商');};
 const proposals=async()=>{for(const m of ['酒商甲','酒商乙']){await role(m);await click('套用示範草稿');await click('送出提案');}};
 const select=async()=>{await role('宴客主人');await click('選定酒商甲');await confirm();};
 const setup=async(budget=6500,blank=false)=>{await create(blank,budget);await payService();await invite();await proposals();await select();};
 const finish=async(prefix=null)=>{
  await role('酒商甲');await no('標記已出貨');await role('合作餐廳');await page.getByLabel('可收貨時段').fill('宴客當日 15:00–17:00');await click('確認收貨安排');
  await role('酒商乙');await no('標記已出貨');await role('酒商甲');await click('標記已出貨');await has('配送中');await click('標記已送達');await has('待餐廳確認收貨');
  await role('合作餐廳');await no('登錄驗齡結果');await click('確認餐廳收貨');await page.reload();await role('合作餐廳');await has('待餐廳驗齡');
  await role('宴客主人');await no('模擬支付酒款');await no('確認收取並完成服務');await role('合作餐廳');
  if(prefix)await shot('receipt');
  await page.getByRole('combobox',{name:'驗齡結果',exact:true}).selectOption({label:'通過'});await click('登錄驗齡結果');
  await role('宴客主人');await no('模擬支付酒款');await click('確認現場購買');await click('模擬支付酒款');
  const dialog=await page.getByRole('dialog').innerText();check(dialog.includes('酒商甲')&&dialog.includes('6,200')&&dialog.includes('6,000')&&dialog.includes('200'),'酒款付款確認框正確分列金額與收款方');
  if(prefix)await shot('payment');await confirm();
  const s=await stored();check(s.order.winePayment.amount===6200&&s.order.commission.amount===600&&s.order.commission.status==='pending','酒商收款6200、分潤600且待結算');
  await no('確認收取並完成服務');await role('合作餐廳');await click('標記已交付主人');await role('宴客主人');await click('確認收取並完成服務');await page.reload();
  for(const actor of ['平台管理者','酒商甲','合作餐廳']){await role(actor);await has('服務完成');await has('待結算');await no('模擬支付酒款');await no('標記已出貨');await no('登錄驗齡結果');}
  const done=(await stored()).order;check(done.events.filter(e=>e.action==='wine-pay').length===1&&done.events.filter(e=>e.action==='complete').length===1,'付款及完成事件均唯一');
 };
 const failAge=async()=>{await reset('載入餐廳驗齡前');await page.getByRole('combobox',{name:'驗齡結果',exact:true}).selectOption({label:'未通過'});await page.getByLabel('驗齡未通過原因').fill('現場無法確認符合年齡');await click('登錄驗齡結果');};
 try {
  await page.setViewportSize({width:1366,height:768});
  switch(id){
   case 'E2E-001':{
    await reset('從空白需求開始');await click('提交宴客需求');await alert('日期');check((await stored()).order===null,'空白不建立訂單');
    await page.getByLabel(/^宴客日期與時間/).fill(await requestDate());await click('提交宴客需求');await alert('餐廳');await fillRequest();
    for(const v of ['0','-1','1.5']){await page.getByLabel('宴客人數',{exact:true}).fill(v);await click('提交宴客需求');await alert('人數');}
    await page.getByLabel('宴客人數',{exact:true}).fill('12');for(const v of ['0','-1']){await page.getByLabel(/^酒款總預算/).fill(v);await click('提交宴客需求');await alert('預算');}
    await fillRequest();await click('提交宴客需求');await has('待付服務費');for(const a of ['平台管理者','酒商甲']){await role(a);await has('法式料理');await has('12 位');}await no('登錄驗齡結果');await no('送出提案');await shot('request');break;
   }
   case 'E2E-002':{
    await create();await role('平台管理者');await no('邀請兩家酒商');await has('待付服務費');await role('酒商甲');await no('送出提案');await role('宴客主人');await has('全額退服務費');await has('服務費不退');await click('模擬支付服務費');const d=await page.getByRole('dialog').innerText();check(d.includes('平台')&&d.includes('500')&&d.includes('模擬'),'服務費確認揭露');check(await page.getByLabel(/卡號/).count()===0,'不收集卡號');await shot('service-fee');await confirm();await no('模擬支付服務費');await invite();const o=(await stored()).order;check(o.invited&&o.serviceFee.paid&&o.events.filter(e=>e.action==='service-pay').length===1,'服務費一次且已邀請');break;
   }
   case 'E2E-003':{
    await create();await payService();await invite();await role('酒商甲');await click('送出提案');await alert('酒款');
    for(const label of [/^容量/,/^瓶數/,/^配送費/,/^搭配理由/,/^供貨限制/]){await click('套用示範草稿');await page.getByLabel(label).fill('');await click('送出提案');check(await page.getByRole('alert').count()===1,'提案缺項受阻：'+String(label));check(!(await stored()).order.proposals.some(p=>p.submitted),'草稿未冒充有效提案');}
    await click('套用示範草稿');await page.getByLabel(/^配送費/).fill('-1');await click('送出提案');await alert('負數');await click('套用示範草稿');await click('保存草稿');check((await stored()).order.proposals[0].submitted===false,'草稿已保存');await click('送出提案');await role('宴客主人');await has('待回覆');check(await page.getByRole('button',{name:'選定酒商甲'}).isDisabled(),'一份提案不能選定');
    await role('酒商乙');check((await page.getByRole('heading',{name:'酒商乙的搭配提案'}).count())===1,'酒商只編輯自己的表單');await no('登錄驗齡結果');await click('套用示範草稿');await click('送出提案');await role('宴客主人');await has('可以比較選定');await shot('proposals');break;
   }
   case 'E2E-004':{
    await create(true,5500);await payService();await invite();await proposals();await role('宴客主人');for(const t of ['NT$ 7,000','NT$ 6,500','現場另收','超出酒款預算'])await has(t);await shot('comparison');await select();check((await stored()).order.winePayment===null&&(await stored()).order.commission===null,'選定不付款不分潤');for(const a of ['酒商甲','酒商乙','宴客主人']){await role(a);await no('送出提案');await no('選定酒商甲');await no('提交宴客需求');}await role('酒商乙');await no('標記已出貨');await shot('selected');break;
   }
   case 'E2E-005':{
    await setup(6500,true);await finish(true);await shot('completed');break;
   }
   case 'E2E-006':{
    await reset('載入餐廳取消前');let o=(await stored()).order;check(o.serviceFee.paid&&o.proposals.length===2&&o.selected.merchant==='merchant-a'&&!o.events.some(e=>e.action==='ship'),'取消入口前置一致');await page.getByText('無法配合，服務無法繼續',{exact:true}).click();await click('取消服務');await confirm();await alert('原因');await page.getByLabel('無法配合原因').fill('收貨時段無法配合，服務無法繼續');await click('取消服務');await confirm();
    for(const a of ['宴客主人','酒商甲','酒商乙','合作餐廳']){await role(a);for(const b of ['標記已出貨','登錄驗齡結果','模擬支付酒款','標記已交付主人','模擬退還服務費'])await no(b);}
    await role('平台管理者');await click('模擬退還服務費');await confirm();await page.reload();await has('已取消／已退款');await has('服務費淨收入');await no('模擬退還服務費');o=(await stored()).order;check(o.serviceFee.refund===500&&o.winePayment===null&&o.commission===null&&o.events.filter(e=>e.action==='refund').length===1,'退款500、無成交分潤、退款事件唯一');await shot('cancelled');break;
   }
   case 'E2E-007':{
    await reset('載入餐廳驗齡前');await page.getByRole('combobox',{name:'驗齡結果',exact:true}).selectOption({label:'未通過'});await click('登錄驗齡結果');await alert('原因');await page.getByLabel('驗齡未通過原因').fill('現場無法確認符合年齡');await click('登錄驗齡結果');await has('待退回');await shot('pending');
    for(const a of ['宴客主人','合作餐廳','酒商乙']){await role(a);for(const b of ['模擬支付酒款','登錄驗齡結果','標記已交付主人','確認已取回酒品'])await no(b);}
    await role('酒商甲');await click('確認已取回酒品');await page.reload();await has('已退回／服務未完成');await has('待登錄');await shot('returned');await role('平台管理者');await click('登錄退回成本');await alert('非負整數');await page.getByLabel(/^平台負擔退回運費/).fill('-1');await click('登錄退回成本');await alert('非負整數');await page.getByLabel(/^平台負擔退回運費/).fill('200');await click('登錄退回成本');await page.reload();await has('主人新增應付 0 元');const o=(await stored()).order;check(o.returnCost===200&&o.serviceFee.paid&&!o.serviceFee.refund&&o.winePayment===null&&o.commission===null&&o.status==='returned','失敗費用與取回狀態正確');await shot('cost');break;
   }
   case 'E2E-008':{
    await failAge();await role('平台管理者');await page.getByLabel(/^平台負擔退回運費/).fill('0');await click('登錄退回成本');check((await stored()).order.status==='return-pending'&&(await stored()).order.returnCost===0,'零成本明確登錄，取回仍待確認');await role('酒商甲');await click('確認已取回酒品');await has('已退回／服務未完成');await shot('zero-cost');break;
   }
   case 'E2E-009':{
    await failAge();await role('酒商甲');await click('確認已取回酒品');const before=await stored();await click('重設正常起點');await page.getByRole('dialog').getByRole('button',{name:'返回',exact:true}).click();check(JSON.stringify(await stored())===JSON.stringify(before),'拒絕重設保留原資料');await reset();await page.reload();check((await stored()).order===null,'重設清除全部前次訂單紀錄');check(await page.getByLabel('宴客人數',{exact:true}).inputValue()==='12','正常起點預填');await reset('載入餐廳取消前');check((await stored()).order.status==='restaurant-pending','取消前狀態正確');await reset('載入餐廳驗齡前');check((await stored()).order.status==='age-check-pending','驗齡前狀態正確');await reset('從空白需求開始');check((await stored()).order===null&&await page.getByLabel('宴客人數',{exact:true}).inputValue()==='','空白需求無殘留與預填');await reset();await shot('reset');break;
   }
   case 'E2E-010':{
    await create();await payService(true);check((await stored()).order.events.filter(e=>e.action==='service-pay').length===1,'快速重複確認服務費只一次');await invite();await proposals();await select();await finish();for(const a of ['宴客主人','平台管理者','酒商甲','酒商乙','合作餐廳']){await role(a);for(const b of ['標記已出貨','標記已送達','登錄驗齡結果','模擬支付酒款','標記已交付主人','確認收取並完成服務'])await no(b);}await shot('idempotency');break;
   }
   case 'E2E-011':{
    await create();await page.evaluate(()=>{window.__originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('test quota','QuotaExceededError');};});await click('模擬支付服務費');await confirm();await alert('保存失敗');await has('待付服務費');await shot('save-failure');
    await page.evaluate(()=>{Storage.prototype.setItem=window.__originalSetItem;delete window.__originalSetItem;});await page.reload();await has('待付服務費');await payService();check((await stored()).order.serviceFee.paid,'還原儲存後可付款');
    for(const raw of ['{broken',JSON.stringify({schemaVersion:2})]){await page.evaluate(raw=>{localStorage.setItem('banquet-demo-e2e-unrelated','keep');localStorage.setItem('banquet-wine-demo:v1',raw);},raw);await page.reload();await has('原資料尚未覆寫');check(await page.evaluate(()=>localStorage.getItem('banquet-wine-demo:v1'))===raw,'損壞或版本不符不覆寫');await shot('recovery');await page.getByRole('button',{name:'確認重設展示資料',exact:true}).click();await confirm();check(await page.evaluate(()=>localStorage.getItem('banquet-demo-e2e-unrelated'))==='keep','重設保留其他應用key');}
    await page.evaluate(()=>localStorage.removeItem('banquet-demo-e2e-unrelated'));break;
   }
   case 'E2E-012':{
    const step=async()=>{
    const r=page.__banquetRehearsal??{start:Date.now(),stage:0,checkpoints:[],screenshots:[]};page.__banquetRehearsal=r;
    const due=[0,60000,120000,180000,240000,300000,360000,420000,479000][r.stage];
    if(Date.now()-r.start<due)return {case:id,status:'WAITING',stage:r.stage,waitMs:due-(Date.now()-r.start)};
    const checkpoint=label=>r.checkpoints.push({stage:r.stage,label,elapsedMs:Date.now()-r.start,at:new Date().toISOString()});
    if(r.stage===0){
     await reset();await button('平台管理者').focus();await page.keyboard.press('Enter');check((await stored()).actor==='platform','Enter 切換角色');await page.keyboard.press('Tab');await page.keyboard.press('Enter');check((await stored()).actor==='merchant-a','Tab 與 Enter 接續切換身分');await role('宴客主人');await page.getByLabel('宴客人數',{exact:true}).focus();await page.keyboard.press('ControlOrMeta+A');await page.keyboard.type('12');await page.getByRole('button',{name:'提交宴客需求'}).focus();await page.keyboard.press('Enter');await has('待付服務費');await click('模擬支付服務費');check(await page.getByRole('dialog').evaluate(e=>e.contains(document.activeElement)),'開啟確認框後焦點在對話框內');for(let i=0;i<4;i++){if(await page.getByRole('dialog').getByRole('button',{name:'返回',exact:true}).evaluate(e=>document.activeElement===e))break;await page.keyboard.press('Shift+Tab');}check(await page.getByRole('dialog').getByRole('button',{name:'返回',exact:true}).evaluate(e=>document.activeElement===e),'確認框鍵盤焦點可到返回');await page.keyboard.press('Tab');await page.keyboard.press('Enter');check((await stored()).order.serviceFee.paid,'Enter 確認模擬付款');await reset();
     await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:evidence+id+'-desktop.png'});r.screenshots.push('e2e-evidence/'+id+'-desktop.png');
     const overflow=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth}));check(overflow.width<=overflow.viewport,'1366 桌機無全頁水平溢出');checkpoint('00:00 問題、模擬身分與鍵盤操作');
    }else if(r.stage===1){await create();await payService();await invite();checkpoint('01:00 需求、服務費與邀請');
    }else if(r.stage===2){await proposals();await select();checkpoint('02:00 兩提案比較與選定');
    }else if(r.stage===3){await role('合作餐廳');await click('確認收貨安排');await role('酒商甲');await click('標記已出貨');await click('標記已送達');await role('合作餐廳');await click('確認餐廳收貨');await page.reload();await has('待餐廳驗齡');checkpoint('03:00 配送、餐廳收貨及刷新');
    }else if(r.stage===4){await page.getByRole('combobox',{name:'驗齡結果',exact:true}).selectOption({label:'通過'});await click('登錄驗齡結果');await role('宴客主人');await click('確認現場購買');await click('模擬支付酒款');await confirm();await role('合作餐廳');await click('標記已交付主人');await role('宴客主人');await click('確認收取並完成服務');await has('服務完成');await has('待結算');checkpoint('04:00 驗齡、購買付款與完成');
    }else if(r.stage===5){await reset('載入餐廳取消前');await page.getByText('無法配合，服務無法繼續',{exact:true}).click();await page.getByLabel('無法配合原因').fill('示範收貨時段無法配合');await click('取消服務');await confirm();await role('平台管理者');await click('模擬退還服務費');await confirm();await has('已取消／已退款');checkpoint('05:00 取消與服務費全額退款');
    }else if(r.stage===6){await failAge();await role('酒商甲');await click('確認已取回酒品');await role('平台管理者');await page.getByLabel(/^平台負擔退回運費/).fill('200');await click('登錄退回成本');await has('已退回／服務未完成');await has('主人新增應付 0 元');checkpoint('06:00 驗齡失敗、取回與平台成本');r.flowsCompletedMs=Date.now()-r.start;
    }else if(r.stage===7){await has('不代表完整企業獲利');await reset();await page.evaluate(()=>scrollTo(0,0));checkpoint('07:00 P0 邊界、示範條件與保存限制');
    }else{
     checkpoint('07:59 計時演練結束');check(r.flowsCompletedMs<420000,'正常與兩異常均在前七分鐘內完成');check(errors.length===0,'計時演練本段無瀏覽器錯誤');
     delete page.__banquetRehearsal;return {case:id,status:'PASS',elapsedMs:Date.now()-r.start,screenshots:r.screenshots,observations:[...observations,'依手冊時段分段自動化演練，保留各段講解時間；未模擬真人口述。'],checkpoints:r.checkpoints,browserErrors:errors,requests};
    }
    r.stage++;return {case:id,status:'RUNNING',nextStage:r.stage,elapsedMs:Date.now()-r.start,observations,checkpoints:r.checkpoints,screenshots:r.screenshots,browserErrors:errors,requests};
    };
    for(;;){const result=await step();if(result.status==='PASS')return result;await new Promise(resolve=>setTimeout(resolve,Math.min(result.waitMs??100,10000)));}
   }
   default:throw Error('Case not supported by this runner');
  }
  check(errors.length===0,'沒有未解決的 browser console 或 page error');const injected=requests.filter(r=>new URL(r.url).hostname==='gc.kes.v2.scr.kaspersky-labs.com');check(requests.filter(r=>!injected.includes(r)).every(r=>new URL(r.url).origin==='http://127.0.0.1:4173'),'產品沒有外部服務或真實支付請求');if(injected.length)observations.push('本機防護軟體注入請求另列，已核對 CDP initiator 為 Kaspersky main.js；產品請求仍僅限本機來源。');
  await reset();
  return {case:id,status:'PASS',elapsedMs:Date.now()-start,screenshots,observations,browserErrors:errors,requests};
 }catch(error){try{await shot('failure');}catch{}return {case:id,status:'FAIL',error:String(error),elapsedMs:Date.now()-start,screenshots,observations,browserErrors:errors,requests,visibleText:(await body()).slice(-9000)};}
 finally{page.off('pageerror',onError);page.off('console',onConsole);page.off('request',onRequest);}
}
