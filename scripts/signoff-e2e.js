// Execute only through Playwright MCP browser_run_code_unsafe.
// Acceptance criteria are maintained in the change's e2e-testing.md.
async (rootPage) => {
 const id='__CASE_ID__',fixtures=__LEGACY_FIXTURES__;
 const root='C:/Users/uuukkjghkjhkjhkjhouh/AI PM Course/product-temp/openspec/changes/archive/2026-11-09-streamline-onsite-signoff-payment/e2e-evidence/';
 const observations=[],screenshots=[],errors=[],requests=[],injected=[];let context,page;
 const check=(ok,msg)=>{if(!ok)throw Error(msg);observations.push(msg);};
 const click=name=>page.getByRole('button',{name}).click();
 const exact=async name=>{await page.getByRole('button',{name,exact:true}).click();if(id==='E2E-016'&&name==='請餐廳協助代收'){check(await page.getByRole('region',{name:'示範身分'}).count()===0,'代收待確認時維持交還裝置畫面，無其他酒商角色入口');check(await page.getByRole('button',{name:'確認由本餐廳代收',exact:true}).count()===0,'主人不能於交還畫面承接；待確認的未獲選讀取另以領域檢視測試驗證');}};
 const role=exact,body=()=>page.locator('body').innerText();
 const has=async text=>check((await body()).includes(text),'顯示：'+text);
 const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('banquet-wine-demo:v1')));
 const order=async()=>(await stored()).order;
 const confirm=()=>page.getByRole('dialog').getByRole('button',{name:'確認',exact:true}).click();
 const back=()=>page.getByRole('dialog').getByRole('button',{name:'返回',exact:true}).click();
 const shot=async label=>{const name=id+'-'+label+'.png';await page.screenshot({path:root+name,fullPage:true});screenshots.push(name);};
 const leave=async()=>{if(await page.getByRole('button',{name:'返回餐廳工作區',exact:true}).count())await exact('返回餐廳工作區');else if(await page.getByRole('button',{name:'交還店員，稍後接續',exact:true}).count())await exact('交還店員，稍後接續');};
 const reset=async(name='載入餐廳驗齡前')=>{await leave();if(await page.getByRole('region',{name:'未獲選提示'}).count())await role('宴客主人');await click(name);await confirm();};
 const signed=async()=>{await page.getByLabel('下單人姓名',{exact:true}).fill('展示主人');await draw();await exact('保存簽名');await has('已保存簽名');};
 const draw=async(touch=false)=>{
  const pad=page.getByRole('img',{name:'手寫簽名',exact:true});await pad.scrollIntoViewIfNeeded();const b=await pad.boundingBox();if(!b)throw Error('No signature pad');
  const points=[[.1,.55],[.2,.25],[.3,.65],[.4,.3],[.55,.6],[.75,.4]].map(([x,y])=>({x:b.x+b.width*x,y:b.y+b.height*y}));
  if(touch){const cdp=await context.newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[points[0]]});for(const point of points.slice(1))await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}
  else{await page.mouse.move(points[0].x,points[0].y);await page.mouse.down();for(const point of points.slice(1))await page.mouse.move(point.x,point.y,{steps:3});await page.mouse.up();}
 };
 const passAge=()=>exact('已核對下單本人且驗齡通過');
 const pay=async(outcome='success')=>{await page.getByRole('combobox',{name:/^模擬付款結果/}).selectOption(outcome);await page.getByRole('button',{name:/^(重試)?模擬支付酒款$/}).click();};
 const fail=async()=>{await passAge();await signed();await pay('failed');await has('模擬付款失敗');};
 const review=async()=>{await exact('請餐廳協助代收');await has('等待店員確認代收');await exact('裝置已交回店員，核對代收');};
 const accept=async()=>{await fail();await review();await exact('確認由本餐廳代收');await has('服務已完成，可協助開酒');};
 const cancel=async()=>{await exact('取消購買');await page.getByRole('dialog').getByRole('button',{name:'確認取消購買',exact:true}).click();};
 const noMoney=async()=>{const o=await order();check(!o.winePayment&&!o.collection&&!o.commission&&o.status!=='completed','未完成時無付款、帳款及分潤');};
 const restoreStorage=()=>page.evaluate(()=>{if(window.__setItem){Storage.prototype.setItem=window.__setItem;delete window.__setItem;}});
 const fault=()=>page.evaluate(()=>{window.__setItem=Storage.prototype.setItem;Storage.prototype.setItem=function(){throw new DOMException('test quota','QuotaExceededError');};});
 const hidden=async(label,selected='merchant-a')=>{
  await leave();const before=(await order()).id;
  await role(selected==='merchant-a'?'酒商乙':'酒商甲');await has('本次未獲選');
  for(const reload of [false,true]){if(reload)await page.reload();const text=await body();check(!text.includes(before)&&!text.includes('這一席的費用')&&!text.includes('每一步，都有紀錄')&&!text.includes('餐廳分潤')&&!text.includes('簽收紀錄')&&!text.includes('餐廳代收帳款')&&!text.includes('NT$'),'未獲選無後續資料：'+label+(reload?'／重開':''));}
  check(await page.getByRole('region',{name:'未獲選提示'}).count()===1,'只呈現未獲選提示：'+label);
  await role(selected==='merchant-a'?'酒商甲':'酒商乙');
 };
 const fullSelect=async(selected='merchant-a',blank=false)=>{
  await reset(blank?'從空白需求開始':'重設正常起點');
  if(blank){await page.getByLabel(/^宴客日期與時間/).fill('2026-11-16T18:00');await page.getByRole('combobox',{name:'合作餐廳',exact:true}).selectOption('restaurant-demo');await page.getByLabel('宴客人數',{exact:true}).fill('12');await page.getByLabel(/^酒款總預算/).fill('6500');}
  await page.getByRole('textbox',{name:/^菜色或料理類型/}).fill('前菜：沙拉\n主菜：牛排');await click('提交宴客需求');await click('模擬支付服務費');await page.getByRole('dialog').getByRole('button',{name:'確認',exact:true}).dblclick();
  check((await order()).events.filter(e=>e.action==='service-pay').length===1,'服務費重複點擊只付款一次');await role('平台管理者');await click('邀請兩家酒商');
  for(const r of ['酒商甲','酒商乙']){await role(r);await has('前菜：沙拉\n主菜：牛排');await exact('套用示範草稿');await click('送出提案');}
  await role('宴客主人');await click(selected==='merchant-a'?'選定酒商甲':'選定酒商乙');await confirm();
 };
 const deliver=async(selected='merchant-a')=>{await role('合作餐廳');await click('確認收貨安排');await role(selected==='merchant-a'?'酒商甲':'酒商乙');await click('標記已出貨');await click('標記已送達');await role('合作餐廳');await click('確認餐廳收貨');};
 const collect=async()=>{await leave();await role('酒商甲');await exact('確認已收到餐廳款項');await confirm();};
 const result={case:id,status:'FAIL',observations,screenshots,browserErrors:errors,requests,injected};
 try{
  context=await rootPage.context().browser().newContext({viewport:id==='E2E-012'?{width:390,height:844}:{width:1366,height:768},timezoneId:'Asia/Taipei',hasTouch:id==='E2E-012',deviceScaleFactor:id==='E2E-012'?2:1});
  page=await context.newPage();page.setDefaultTimeout(6000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('request',r=>requests.push(r.url()));
  const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');cdp.on('Network.requestWillBeSent',e=>{if(e.request.url.includes('kaspersky-labs.com'))injected.push({url:e.request.url,initiator:e.initiator});});
  await page.clock.install({time:new Date('2026-11-09T11:00:00+08:00')});await page.clock.setFixedTime(new Date('2026-11-09T11:00:00+08:00'));
  await page.goto('http://127.0.0.1:5173/');await reset();
  switch(id){
   case 'E2E-001':{
    await page.reload();await has('待餐廳驗齡');await passAge();check(await page.getByRole('region',{name:'示範身分'}).count()===0,'客人畫面無角色切換');check(await page.getByRole('button',{name:'重設正常起點'}).count()===0,'客人畫面無重設');for(const t of ['6 瓶','NT$ 6,000','NT$ 200','NT$ 6,200','收款方：酒商甲'])await has(t);await signed();await noMoney();await shot('signed');await pay();await has('服務已完成，可協助開酒');await shot('completed');await leave();
    for(const r of ['宴客主人','平台管理者','酒商甲','合作餐廳']){await role(r);await page.reload();await has('服務完成');await has('NT$ 6,200');await has('NT$ 600');await has('NT$ 7,000');check(await page.getByRole('button',{name:/標記已交付|確認收取/}).count()===0,'新單無雙方確認：'+r);}
    const o=await order();check(o.winePayment.amount===6200&&o.commission.amount===600&&!o.collection,'線上金額與唯一分潤');await shot('finance');await hidden('線上完成');break;
   }
   case 'E2E-002':{
    await passAge();await exact('保存簽名');await has('請填寫下單人姓名');await page.getByLabel('下單人姓名').fill('展示主人');await exact('保存簽名');await has('請完成非空白手寫簽名');await draw();await page.getByLabel('下單人姓名').fill('');await exact('保存簽名');await has('請填寫下單人姓名');await shot('validation');await page.getByLabel('下單人姓名').fill('展示主人');await exact('保存簽名');await exact('清除簽名並重簽');check(await page.getByRole('button',{name:'模擬支付酒款',exact:true}).isDisabled(),'清除後不可付款');await page.reload();check(!(await order()).checkout.signature,'清除跨重開保存');await signed();await noMoney();check(await page.getByRole('button',{name:'請餐廳協助代收',exact:true}).count()===0,'未失敗不能代收');await shot('resigned');break;
   }
   case 'E2E-003':{
    await fail();await noMoney();await shot('failed');const sig=(await order()).checkout.signature;await page.reload();await has('模擬付款失敗');check(JSON.stringify((await order()).checkout.signature)===JSON.stringify(sig),'重開保留同一簽名');check((await order()).checkout.attempts.length===1,'重開不重送付款');await shot('reload');await pay();await has('服務已完成，可協助開酒');await leave();await page.reload();const o=await order();check(o.checkout.attempts.length===2&&o.events.filter(e=>e.action==='complete').length===1,'重試後只完成一次');await shot('retry-completed');break;
   }
   case 'E2E-004':{
    await fail();await exact('請餐廳協助代收');await has('等待店員確認代收');await noMoney();await page.reload();await has('等待店員確認代收');await shot('handoff');await exact('裝置已交回店員，核對代收');await exact('不承接代收');await noMoney();await has('已保存簽名');await review();await exact('不承接代收');await noMoney();await shot('declined');await pay();await has('服務已完成，可協助開酒');check((await order()).events.filter(e=>e.action==='request-collection').length===2,'拒絕後可再次請求');await shot('retry-completed');break;
   }
   case 'E2E-005':{
    await fail();await review();await has('即使主人稍後尚未結帳');await has('NT$ 6,200');await shot('staff');await exact('確認由本餐廳代收');await has('服務已完成，可協助開酒');await shot('accepted');await leave();
    for(const r of ['宴客主人','平台管理者','合作餐廳','酒商甲']){await role(r);await page.reload();await has('服務已完成／餐廳代收／待付酒商');await has('餐廳應付酒商全額');await has('NT$ 6,200');await has('NT$ 600');const o=await order();check(o.collection.amount===6200&&o.commission.amount===600&&!o.winePayment,'相關角色同一全額帳款，不抵銷：'+r);await shot('account-'+r);}
    break;
   }
   case 'E2E-006':{
    await accept();await hidden('代收');for(const r of ['宴客主人','平台管理者','合作餐廳']){await role(r);check(await page.getByRole('button',{name:'確認已收到餐廳款項',exact:true}).count()===0,'非酒商不能收清：'+r);}
    await role('酒商甲');await exact('確認已收到餐廳款項');await back();check((await order()).collection.status==='pending','收清返回不改帳');await exact('確認已收到餐廳款項');await confirm();await shot('received');
    for(const r of ['宴客主人','平台管理者','合作餐廳','酒商甲']){await role(r);await page.reload();await has('已收清 NT$ 6,200');await has('待結算');const o=await order();check(o.collection.receivedBy==='merchant-a'&&o.collection.receivedAmount===6200&&!!o.collection.receivedAt&&o.checkout.completedBy==='collection','收清角色、全額、時間與代收路徑保存：'+r);}
    await shot('received-reload');break;
   }
   case 'E2E-007':{
    await passAge();const before=JSON.stringify(await order());await exact('取消購買');await back();check(JSON.stringify(await order())===before,'取消返回不改單');await cancel();await has('主人取消購買');await has('服務費 500 元維持已付不退');await shot('return-pending');await hidden('主人取消');await role('合作餐廳');check(await page.getByRole('button',{name:'確認已取回酒品'}).count()===0,'餐廳不能確認取回');await role('酒商甲');await click('確認已取回酒品');await role('平台管理者');await has('待登錄');await shot('returned-cost-pending');await page.getByLabel(/^平台負擔退回運費/).fill('200');await click('登錄退回成本');await page.reload();await has('主人新增應付 0 元');await has('NT$ 200');check((await order()).age.result==='passed'&&(await order()).status==='returned','主人取消不改成驗齡失敗');await shot('returned-cost');break;
   }
   case 'E2E-008':{
    await fail();await review();await exact('不承接代收');const before=JSON.stringify(await order());await exact('取消購買');await back();check(JSON.stringify(await order())===before,'已簽取消返回保留簽名及進度');await cancel();await page.reload();await has('主人取消購買');const o=await order();check(!!o.checkout.signature.invalidatedAt&&!o.winePayment&&!o.commission&&!o.collection,'取消後簽名失效且無帳款');for(const r of ['宴客主人','合作餐廳','酒商甲','酒商乙']){await role(r);check(await page.getByRole('button',{name:/保存簽名|模擬支付酒款|確認由本餐廳代收/}).count()===0,'取消不可恢復：'+r);}await role('合作餐廳');await shot('cancelled-after-failure');break;
   }
   case 'E2E-009':{
    await page.getByRole('combobox',{name:/^驗齡結果/}).selectOption('failed');await exact('登錄驗齡未通過');await has('驗齡未通過須填寫原因');await shot('required-reason');await page.getByLabel('驗齡未通過原因',{exact:true}).fill('未能確認年齡');await exact('登錄驗齡未通過');await has('驗齡未通過：未能確認年齡');await shot('age-failed');for(const r of ['宴客主人','合作餐廳','酒商甲','酒商乙']){await role(r);check(await page.getByRole('button',{name:/保存簽名|模擬支付酒款|確認由本餐廳代收/}).count()===0,'驗齡失敗不能付款或代收：'+r);}await role('平台管理者');await page.getByLabel(/^平台負擔退回運費/).fill('0');await click('登錄退回成本');await role('酒商甲');await click('確認已取回酒品');await page.reload();await has('已退回／服務未完成');check((await order()).returnCost===0&&!((await order()).commission),'零成本明確且不成交');await shot('returned-zero');break;
   }
   case 'E2E-010':{
    for(const path of ['online','collection']){await reset();if(path==='online'){await passAge();await signed();await pay();}else await accept();await leave();for(const r of ['宴客主人','合作餐廳','平台管理者']){await role(r);check(await page.getByRole('img',{name:'簽名原圖',exact:true}).count()===1,'授權角色可看簽名：'+path+'/'+r);await has('展示主人');await shot(path+'-'+r);}await role('酒商甲');await has('已簽收');check(await page.getByRole('img',{name:'簽名原圖',exact:true}).count()===0,'選定酒商不載入簽名原圖：'+path);await has('當次明細');await shot(path+'-merchant');await hidden(path);}
    break;
   }
   case 'E2E-011':{
    for(const part of ['signature','payment','accept','receive','role']){await reset();
     if(part==='signature'){await passAge();await page.getByLabel('下單人姓名').fill('展示主人');await draw();}
     if(part==='payment'){await passAge();await signed();}
     if(part==='accept'){await fail();await review();}
     if(part==='receive'){await accept();await leave();await role('酒商甲');await exact('確認已收到餐廳款項');}
     const before=JSON.stringify(await order()),actorBefore=(await stored()).actor;await fault();
     const action=async()=>{if(part==='signature')await exact('保存簽名');else if(part==='payment')await pay();else if(part==='accept')await exact('確認由本餐廳代收');else if(part==='receive')await confirm();else await role('平台管理者');};
     await action();await has('保存失敗');check(JSON.stringify(await order())===before&&(await stored()).actor===actorBefore,'保存故障無假成功：'+part);await shot(part+'-failure');await restoreStorage();await page.reload();check(JSON.stringify(await order())===before,'故障重開仍原狀：'+part);
     if(part==='signature'){await page.getByLabel('下單人姓名').fill('展示主人');await draw();}if(part==='receive')await exact('確認已收到餐廳款項');await action();check(!(await body()).includes('保存失敗'),'重試成功：'+part);await shot(part+'-recovered');
    }break;
   }
   case 'E2E-012':{
    await passAge();await page.getByLabel('下單人姓名').fill('展示主人');await draw(true);await exact('清除簽名');await draw(true);await exact('保存簽名');await has('已保存簽名');const sig=(await order()).checkout.signature;await page.reload();check(JSON.stringify((await order()).checkout.signature)===JSON.stringify(sig),'觸控簽名跨重開保存');await shot('touch-signature');await pay('failed');for(const name of ['重試模擬支付酒款','請餐廳協助代收','取消購買'])check(await page.getByRole('button',{name,exact:true}).isVisible(),'觸控失敗可操作：'+name);await exact('取消購買');await back();const size=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));check(size.scroll<=size.width,'390 觸控無水平溢出');await shot('touch-failed');break;
   }
   case 'E2E-013':{
    await passAge();await signed();await page.getByRole('button',{name:'模擬支付酒款',exact:true}).dblclick();await leave();const first=await order();check(first.events.filter(e=>e.action==='complete').length===1&&first.events.filter(e=>e.action==='wine-pay').length===1,'雙擊線上付款只完成一次');await page.reload();check(await page.getByRole('button',{name:/模擬支付酒款|取消購買|保存簽名|標記已交付|確認收取/}).count()===0,'線上完成鎖定其他路徑');await shot('online-locked');
    await reset();await fail();await review();await page.getByRole('button',{name:'確認由本餐廳代收',exact:true}).dblclick();await leave();await role('酒商甲');await exact('確認已收到餐廳款項');await confirm();const received=await order();await exact('確認已收到餐廳款項');await has('此筆款項已收清，無需重複確認。');check(JSON.stringify(await order())===JSON.stringify(received),'重複收清保留原金額、時間、角色與事件');await shot('duplicate-receipt-notice');await page.reload();await exact('確認已收到餐廳款項');await has('此筆款項已收清，無需重複確認。');check((await order()).events.filter(e=>e.action==='complete').length===1&&(await order()).events.filter(e=>e.action==='collection-receive').length===1,'代收完成與收清均唯一');await shot('collection-locked');break;
   }
   case 'E2E-014':{
    await page.clock.setFixedTime(new Date('2027-01-01T12:00:00+08:00'));
    for(const [name,old] of Object.entries(fixtures)){await page.evaluate(raw=>localStorage.setItem('banquet-wine-demo:v1',raw),JSON.stringify(old));await page.reload();check(!(await body()).includes('展示資料無法讀取'),'舊單不損壞：'+name);await has(old.order.id);
     if(['purchase','payment'].includes(name)){await has('待主人簽收');await signed();await pay();await leave();}
     else{await role(name==='handover'?'合作餐廳':name==='receipt'?'宴客主人':'平台管理者');const o=await order();check(o.id===old.order.id&&JSON.stringify(o.events)===JSON.stringify(old.order.events)&&JSON.stringify(o.winePayment)===JSON.stringify(old.order.winePayment),'舊單保留原事件及付款：'+name);
      if(name==='handover'){await click('舊版：標記已交付主人');await role('宴客主人');await click('舊版：確認收取並完成服務');}
      if(name==='receipt')await click('舊版：確認收取並完成服務');
      if(old.order.winePayment)check((await order()).checkout.signature===null,'已付舊單不造簽名：'+name);
     }
     await page.reload();await has(old.order.id);check(!(await body()).includes('展示資料無法讀取'),'舊日期及操作後重開可讀：'+name);await shot('legacy-'+name);
    }break;
   }
   case 'E2E-015':{
    await fullSelect('merchant-a',true);await deliver();for(const r of ['宴客主人','平台管理者','酒商甲','合作餐廳']){await role(r);await page.reload();await has('2026-11-16 18:00');await has('前菜：沙拉\n主菜：牛排');await has('待餐廳驗齡');}await shot('receipt-multiline');await hidden('收貨');await reset('載入餐廳取消前');await page.getByText('無法配合，服務無法繼續',{exact:true}).click();await page.getByLabel('無法配合原因',{exact:true}).fill('當日無法安排');await exact('取消服務');await confirm();await role('平台管理者');await click('模擬退還服務費');await confirm();await has('已取消／已退款');check((await order()).serviceFee.refund===500,'配送前取消退服務費');await shot('cancel-refunded');await reset('重設正常起點');check((await stored()).order===null,'重設不殘留簽名、帳款、分潤');break;
   }
   case 'E2E-016':{
    for(const selected of ['merchant-a','merchant-b']){
     await fullSelect(selected);await hidden('選定',selected);await role('合作餐廳');await click('確認收貨安排');await hidden('安排',selected);await click('標記已出貨');await hidden('配送中',selected);await click('標記已送達');await hidden('送達',selected);await role('合作餐廳');await click('確認餐廳收貨');await hidden('餐廳收貨',selected);await role('合作餐廳');await passAge();await leave();await hidden('驗齡待簽',selected);await role('合作餐廳');await exact('接續主人簽收付款');await signed();await leave();await hidden('簽名',selected);await role('合作餐廳');await exact('接續主人簽收付款');await pay('failed');await leave();await hidden('付款失敗',selected);await role('合作餐廳');await exact('接續主人簽收付款');await exact('請餐廳協助代收');await page.reload();await exact('裝置已交回店員，核對代收');await exact('確認由本餐廳代收');await leave();await hidden('代收完成',selected);await exact('確認已收到餐廳款項');await confirm();await hidden('收清',selected);await role(selected==='merchant-a'?'酒商乙':'酒商甲');await shot('hidden-'+selected);
     // Separate legal UI journeys for online completion and each exception branch.
     for(const branch of ['online','host-cancel','age-failed','restaurant-cancel']){await fullSelect(selected);if(branch==='restaurant-cancel'){await role('合作餐廳');await page.getByText('無法配合，服務無法繼續',{exact:true}).click();await page.getByLabel('無法配合原因',{exact:true}).fill('無法安排');await exact('取消服務');await confirm();await hidden(branch,selected);await role('平台管理者');await click('模擬退還服務費');await confirm();await hidden(branch+'-refunded',selected);}else{await deliver(selected);if(branch==='age-failed'){await page.getByRole('combobox',{name:/^驗齡結果/}).selectOption('failed');await page.getByLabel('驗齡未通過原因',{exact:true}).fill('未能確認');await exact('登錄驗齡未通過');}else{await passAge();if(branch==='online'){await signed();await pay();await leave();}else await cancel();}await hidden(branch,selected);if(branch==='host-cancel'||branch==='age-failed'){await click('確認已取回酒品');await hidden(branch+'-returned',selected);}}}
    }
    for(const [name,old] of Object.entries(fixtures)){await page.evaluate(raw=>localStorage.setItem('banquet-wine-demo:v1',raw),JSON.stringify(old));await page.reload();await leave();if(await page.getByRole('button',{name:'裝置已交回店員，核對代收'}).count())throw Error('Unexpected old handoff');await hidden('legacy-'+name);}
    await role('酒商乙');await shot('hidden-legacy');break;
   }
   default:throw Error('Unknown case '+id);
  }
  check(errors.length===0,'沒有產品 console 或 page error');
  const external=requests.filter(u=>/^https?:/.test(u)&&new URL(u).origin!=='http://127.0.0.1:5173');
  check(external.every(u=>injected.some(x=>x.url===u&&(JSON.stringify(x.initiator).includes('main.js')||(new URL(u).pathname.endsWith('/main.js')&&x.initiator.type==='parser')))),'無真實支付或產品外部網路呼叫；防護軟體 main.js 與其後續流量保留 CDP initiator');
  result.status='PASS';
 }catch(e){result.error=String(e);try{await shot('failure');result.visibleText=await body();}catch{}}
 finally{if(page)await restoreStorage().catch(()=>{});if(context)await context.close();}
 return result;
}
