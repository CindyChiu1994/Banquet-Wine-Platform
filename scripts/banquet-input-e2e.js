// Execute through Playwright MCP browser_run_code_unsafe only.
// Case definitions and acceptance criteria: improve-banquet-request-inputs/e2e-testing.md.
async (rootPage) => {
 const id='__CASE_ID__';
 const root='C:/Users/uuukkjghkjhkjhkjhouh/AI PM Course/product-temp/openspec/changes/improve-banquet-request-inputs/e2e-evidence/';
 const observations=[],screenshots=[],errors=[],requests=[],calendarRows=[],injectedRequests=[];
 let context,page,fixedTime;
 const check=(value,message)=>{if(!value)throw Error(message);observations.push(message);};
 const click=async name=>page.getByRole('button',{name}).click();
 const confirm=async()=>page.getByRole('dialog').getByRole('button',{name:'確認',exact:true}).click();
 const reset=async(name='從空白需求開始')=>{await click(name);await confirm();};
 const role=async name=>page.getByRole('button',{name,exact:true}).click();
 const body=()=>page.locator('body').innerText();
 const has=async text=>check((await body()).includes(text),'顯示：'+text);
 const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('banquet-wine-demo:v1')));
 const dateInput=()=>page.getByLabel(/^宴客日期與時間/);
 const cuisineInput=()=>page.getByRole('textbox',{name:/^菜色或料理類型/});
 const submit=()=>click('提交宴客需求');
 const alert=async text=>check((await page.getByRole('alert').innerText()).includes(text),'錯誤指出：'+text);
 const clock=async at=>{fixedTime=new Date(at).toISOString();await page.clock.setFixedTime(new Date(at));};
 const verifyClock=async()=>check(await page.evaluate(()=>new Date().toISOString())===fixedTime,'頁面時鐘：'+fixedTime);
 const reload=async()=>{await page.reload();await verifyClock();};
 const shot=async suffix=>{const name=id+'-'+suffix+'.png';await page.screenshot({path:root+name,fullPage:true});screenshots.push(name);};
 const setup=async(at='2026-11-08T18:00:00+08:00',timezone='Asia/Taipei')=>{
  if(context){await reset();await context.close();}
  context=await rootPage.context().browser().newContext({timezoneId:timezone,viewport:{width:1366,height:768}});
  page=await context.newPage();page.setDefaultTimeout(6000);
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('request',r=>requests.push({url:r.url(),method:r.method()}));
  const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');
  cdp.on('Network.requestWillBeSent',e=>{if(new URL(e.request.url).hostname==='gc.kes.v2.scr.kaspersky-labs.com')injectedRequests.push({url:e.request.url,initiator:e.initiator});});
  await page.clock.install({time:new Date(at)});await clock(at);
  await page.goto('http://127.0.0.1:4173/');await verifyClock();
  check(await page.evaluate(()=>Intl.DateTimeFormat().resolvedOptions().timeZone)===timezone,'瀏覽器時區：'+timezone);
  await reset();
 };
 const fill=async(date='2026-11-11T18:00',cuisine='法式料理')=>{
  await dateInput().fill(date);
  await page.getByRole('combobox',{name:'合作餐廳',exact:true}).selectOption('restaurant-demo');
  await page.getByLabel('宴客人數',{exact:true}).fill('12');
  await cuisineInput().fill(cuisine);await page.getByLabel(/^酒款總預算/).fill('6500');
  await page.getByRole('combobox',{name:'飲酒偏好',exact:true}).selectOption('不限');
 };
 const noOrder=async()=>check((await stored()).order===null,'無效提交不建立訂單或成功事件');
 const payService=async()=>{await click('模擬支付服務費');await confirm();};
 const summary=async(cuisine)=>{
  const details=await page.getByText(cuisine,{exact:true}).evaluate(e=>({text:e.textContent,whiteSpace:getComputedStyle(e).whiteSpace,overflow:getComputedStyle(e).overflowWrap,width:e.clientWidth,scrollWidth:e.scrollWidth}));
  check(details.text===cuisine,'摘要文字與換行原樣保留');
  check(details.whiteSpace==='pre-wrap','摘要使用保留換行的呈現');
  return details;
 };
 const start=Date.now();
 try{
  await setup(id==='E2E-003'?'2026-11-08T23:59:00+08:00':undefined);
  switch(id){
   case 'E2E-001':{
    await has('至少提前三個日曆日');await has('Asia/Taipei');await has('2026/11/11');
    check(await dateInput().getAttribute('min')==='2026-11-11T00:00','選擇器下限為三天後午夜');
    await submit();await alert('日期');await noOrder();
    await dateInput().fill('2026-11-11T18:00');await submit();await alert('餐廳');
    await fill();
    for(const v of ['0','-1','1.5']){await page.getByLabel('宴客人數',{exact:true}).fill(v);await submit();await alert('人數');await noOrder();}
    await page.getByLabel('宴客人數',{exact:true}).fill('12');
    for(const v of ['0','-1']){await page.getByLabel(/^酒款總預算/).fill(v);await submit();await alert('預算');await noOrder();}
    await page.getByLabel(/^酒款總預算/).fill('6500');
    for(const d of ['2026-11-07T18:00','2026-11-08T18:00','2026-11-09T18:00','2026-11-10T23:59']){
     await dateInput().fill(d);check(await dateInput().evaluate(e=>e.validity.rangeUnderflow),'原生日期控制將 '+d+' 標為下限外');
     await submit();await alert('最早可選 2026-11-11');await noOrder();
     check(await dateInput().inputValue()===d&&await cuisineInput().inputValue()==='法式料理','拒絕後保留日期與其他輸入');
    }
    await shot('date-validation');await dateInput().fill('2026-11-11T18:00');await submit();await has('待付服務費');await shot('date-success');break;
   }
   case 'E2E-002':{
    await fill('2026-11-11T00:00');await submit();await has('待付服務費');
    const first=(await stored()).order;
    for(const actor of ['平台管理者','酒商甲']){await role(actor);await has('2026-11-11 00:00');check(JSON.stringify((await stored()).order.request)===JSON.stringify(first.request),'跨角色需求一致');}
    check(first.events.filter(e=>e.action==='create').length===1,'未滿72小時仍僅建立一筆訂單');await shot('midnight-boundary');break;
   }
   case 'E2E-003':{
    await fill();check(await dateInput().getAttribute('min')==='2026-11-11T00:00','跨日前下限正確');
    await clock('2026-11-09T00:01:00+08:00');await verifyClock();await submit();
    await alert('2026-11-12');await has('2026/11/12');await noOrder();
    check(await dateInput().inputValue()==='2026-11-11T18:00'&&await cuisineInput().inputValue()==='法式料理','跨日拒絕後保留原表單');
    check(await dateInput().getAttribute('min')==='2026-11-12T00:00','提交更新輸入下限');await shot('rollover');
    await dateInput().fill('2026-11-12T00:00');await submit();await has('待付服務費');
    check((await stored()).order.events.filter(e=>e.action==='create').length===1,'修正後只建立一次');await shot('rollover-success');break;
   }
   case 'E2E-004':{
    const rows=[['2026-11-29T10:00:00+08:00','Asia/Taipei','2026-12-02','2026-12-01T23:59'],['2026-12-30T10:00:00+08:00','Asia/Taipei','2027-01-02','2027-01-01T23:59'],['2026-11-09T00:30:00+08:00','UTC','2026-11-12','2026-11-11T23:59'],['2026-11-09T00:30:00+08:00','Asia/Taipei','2026-11-12','2026-11-11T23:59']];
    for(let i=0;i<rows.length;i++){
     const [at,tz,min,before]=rows[i];await setup(at,tz);await has(min.replaceAll('-','/'));check(await dateInput().getAttribute('min')===min+'T00:00','日曆門檻：'+min+' / '+tz);
     await fill(before);await submit();await alert('最早可選');await noOrder();await dateInput().fill(min+'T00:00');await submit();await has('待付服務費');
     calendarRows.push({at,timezone:tz,expected:min,accepted:(await stored()).order.request.date,clock:await page.evaluate(()=>new Date().toISOString())});await shot(i===rows.length-1?'calendar-timezone':'calendar-row-'+(i+1));
    }break;
   }
   case 'E2E-005':{
    const cuisine='前菜：沙拉\n主菜：牛排';await fill(undefined,'前菜：沙拉');await cuisineInput().press('End');await cuisineInput().press('Enter');await cuisineInput().pressSequentially('主菜：牛排');
    check(await cuisineInput().inputValue()===cuisine,'實際 Enter 新增料理行');await noOrder();await shot('enter');await submit();
    for(const actor of ['宴客主人','平台管理者','酒商甲','酒商乙','合作餐廳']){await role(actor);await summary(cuisine);}
    await reload();await role('宴客主人');await summary(cuisine);check((await stored()).order.request.cuisine===cuisine,'重新整理保存多行文字');await shot('multiline');break;
   }
   case 'E2E-006':{
    await fill();for(const value of ['','   ','\n\n',' \n ']){await cuisineInput().fill(value);await submit();await alert('菜色或料理類型');await noOrder();check(await page.getByLabel('宴客人數',{exact:true}).inputValue()==='12','料理錯誤保留其他欄位');}
    await shot('cuisine-required');await cuisineInput().fill('主菜：牛排');await submit();await has('待付服務費');break;
   }
   case 'E2E-007':{
    const cuisine=['前菜：','主菜：','甜點：'].map(t=>t+'菜單描述'.repeat(30)).join('\n')+'\n'+'A'.repeat(160);
    await fill(undefined,cuisine);check(await cuisineInput().evaluate(e=>e.scrollWidth<=e.clientWidth),'長料理輸入自動折行');await shot('input-wrap');await submit();
    for(const actor of ['宴客主人','平台管理者','酒商甲','酒商乙','合作餐廳']){
     await role(actor);const details=await summary(cuisine);check(details.scrollWidth<=details.width,'長料理摘要不水平溢出：'+actor);
     const size=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth}));check(size.width<=size.viewport,'1366桌機無頁面水平溢出：'+actor);
     await page.getByRole('button',{name:'重設正常起點'}).scrollIntoViewIfNeeded();check(await page.getByRole('button',{name:'重設正常起點'}).isVisible(),'主要操作可透過垂直捲動到達');
    }await shot('desktop-wrap');break;
   }
   case 'E2E-008':{
    await fill();await submit();await payService();const before=(await stored()).order;
    for(const later of ['2026-11-10T18:00:00+08:00','2026-11-12T18:00:00+08:00']){
     await clock(later);await reload();await role('平台管理者');const after=(await stored()).order;check(JSON.stringify(after)===JSON.stringify(before),'日期接近或過期後原訂單與付款完全還原：'+later);await has('待平台邀請');check(await page.getByRole('alert').count()===0,'沒有損壞或重設錯誤');await role('宴客主人');
    }await shot('aged-order');break;
   }
   case 'E2E-009':{
    const raw='__LEGACY_RAW__';await page.evaluate(raw=>localStorage.setItem('banquet-wine-demo:v1',raw),raw);await reload();
    const before=JSON.parse(raw).order;check(JSON.stringify((await stored()).order)===JSON.stringify(before),'舊版真實訂單原樣載入');await has('2026-11-07 18:00');await has('待平台邀請');
    await role('平台管理者');await click('邀請兩家酒商');await role('酒商甲');await has('等待酒商提案');
    const after=(await stored()).order;check(after.serviceFee.paid&&after.id===before.id&&after.events.length===before.events.length+1&&after.events.at(-1).action==='invite','舊資料可繼續邀請且不重建付款');await shot('legacy');break;
   }
   case 'E2E-010':{
    const cuisine='前菜：沙拉\n主菜：牛排';await fill(undefined,cuisine);
    await page.evaluate(()=>{window.__inputOriginalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('test quota','QuotaExceededError');};});
    await submit();await alert('保存失敗');await noOrder();check(await cuisineInput().inputValue()===cuisine,'保存失敗保留多行輸入');await shot('save-failure');
    await page.evaluate(()=>{Storage.prototype.setItem=window.__inputOriginalSetItem;delete window.__inputOriginalSetItem;});await submit();await has('待付服務費');await reload();
    const o=(await stored()).order;check(o.request.cuisine===cuisine&&o.events.filter(e=>e.action==='create').length===1,'保存重試僅一筆成功紀錄且換行保留');await shot('save-retry');break;
   }
   case 'E2E-011':{
    await reset('重設正常起點');check(await dateInput().inputValue()==='2026-11-15T18:00','正常預填仍為台北七天後18時');await submit();await click('模擬支付服務費');
    let text=await page.getByRole('dialog').innerText();check(text.includes('模擬')&&text.includes('500')&&text.includes('平台'),'服務費模擬揭露正確');await shot('service-dialog');await page.getByRole('dialog').getByRole('button',{name:'返回',exact:true}).click();
    await reset('載入餐廳驗齡前');const before=(await stored()).order;await reload();await role('合作餐廳');await has('待餐廳驗齡');
    check(JSON.stringify((await stored()).order)===JSON.stringify(before)&&before.events.some(e=>e.action==='receive'),'情境收貨紀錄重新整理後仍存在');await shot('receipt');
    await page.getByRole('combobox',{name:'驗齡結果',exact:true}).selectOption('passed');await click('登錄驗齡結果');await role('宴客主人');await click('確認現場購買');await click('模擬支付酒款');
    text=await page.getByRole('dialog').innerText();check(text.includes('模擬')&&text.includes('酒商甲')&&text.includes('6,200'),'酒款模擬金額與收款方正確');check(await page.getByLabel(/卡號/).count()===0,'未收集卡號');await shot('regression');await page.getByRole('dialog').getByRole('button',{name:'返回',exact:true}).click();break;
   }
   default:throw Error('Unsupported case '+id);
  }
  check(errors.length===0,'沒有 console 或 page error');
  const injected=requests.filter(r=>new URL(r.url).hostname==='gc.kes.v2.scr.kaspersky-labs.com');
  if(injected.length)check(injectedRequests.some(r=>JSON.stringify(r.initiator).includes('main.js')),'CDP 確認本機 Kaspersky main.js 注入流量，原始請求另存');
  check(requests.filter(r=>!injected.includes(r)).every(r=>new URL(r.url).origin==='http://127.0.0.1:4173'),'產品沒有外部服務或真實付款請求');
  await reset();
  return {case:id,status:'PASS',elapsedMs:Date.now()-start,observations,screenshots,browserErrors:errors,requests,injectedRequests,calendarRows};
 }catch(error){try{await shot('failure');}catch{}return {case:id,status:'FAIL',error:String(error),observations,screenshots,browserErrors:errors,requests,injectedRequests,calendarRows,visibleText:page?await body():''};}
 finally{if(page)await page.evaluate(()=>{if(window.__inputOriginalSetItem){Storage.prototype.setItem=window.__inputOriginalSetItem;delete window.__inputOriginalSetItem;}}).catch(()=>{});if(context)await context.close();}
}
