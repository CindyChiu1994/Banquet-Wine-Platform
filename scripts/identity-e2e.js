async (rootPage) => {
 const id='__CASE_ID__',fixtures=__FIXTURES__,v1=__V1__;
 const root='C:/Users/uuukkjghkjhkjhkjhouh/AI PM Course/product-temp/openspec/changes/archive/2026-11-09-bind-host-identity-and-validate-proposal-integers/';
 const ctx=await rootPage.context().browser().newContext({viewport:{width:1366,height:768},hasTouch:id==='E2E-026'});
 const p=await ctx.newPage();p.setDefaultTimeout(6000);
 const observations=[],screenshots=[],browserErrors=[],requests=[];let stage='setup';
 p.on('pageerror',e=>browserErrors.push(e.message));p.on('console',m=>{if(m.type()==='error')browserErrors.push(m.text());});p.on('request',r=>requests.push(r.url()));
 const check=(v,s)=>{if(!v)throw Error(stage+': '+s);observations.push(s);};
 const text=()=>p.locator('body').innerText();
 const has=async s=>check((await text()).includes(s),'顯示 '+s);
 const click=n=>p.getByRole('button',{name:n}).click();
 const role=n=>p.getByRole('button',{name:n,exact:true}).click();
 const combo=n=>p.getByRole('combobox',{name:n,exact:true});
 const confirm=()=>p.getByRole('dialog').getByRole('button',{name:'確認',exact:true}).click();
 const shot=async suffix=>{const path='e2e-evidence/'+id+'-'+suffix+'.png';await p.screenshot({path:root+path,fullPage:true});screenshots.push(path);};
 const stored=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('banquet-wine-demo:v1')));
 const err=async part=>check((await p.getByRole('alert').allTextContents()).some(s=>s.includes(part)),'欄位錯誤 '+part);
 const reset=async(n='重設正常起點')=>{await click(n);await confirm();};
 const date=()=>p.evaluate(()=>{const x=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),g=t=>Number(x.find(v=>v.type===t).value);return new Date(Date.UTC(g('year'),g('month')-1,g('day')+7)).toISOString().slice(0,10)+'T18:00';});
 const nameField=()=>p.getByRole('textbox',{name:/^姓名（下單及簽收人）/});
 const phone=()=>p.getByRole('textbox',{name:/^聯絡電話/});
 const fill=async(name='宴遇測試主人甲',tel='0912-345-678')=>{
 await nameField().fill(name);await phone().fill(tel);await p.getByLabel(/^宴客日期與時間/).fill(await date());await combo('合作餐廳').selectOption('restaurant-demo');await p.getByLabel('宴客人數',{exact:true}).fill('12');await p.getByLabel(/^酒款總預算/).fill('6500');await p.getByRole('textbox',{name:/^菜色或料理類型/}).fill('前菜：沙拉\n主菜：牛排');await combo('飲酒偏好').selectOption('不限');
 };
 const create=async(name='宴遇測試主人甲',tel='0912-345-678')=>{await reset('從空白需求開始');await fill(name,tel);await click('提交宴客需求');await confirm();};
 const pay=async()=>{await role('宴客主人');await click('模擬支付服務費');await confirm();};
 const invite=async()=>{await role('平台管理者');await click('邀請兩家酒商');};
 const proposals=async()=>{for(const who of ['酒商甲','酒商乙']){await role(who);await click('套用示範草稿');await click('送出提案');}};
 const select=async(who='酒商甲')=>{await role('宴客主人');await click('選定'+who);await confirm();};
 const delivery=async(who='酒商甲')=>{await role('合作餐廳');await click('確認收貨安排');await role(who);await click('標記已出貨');await click('標記已送達');await role('合作餐廳');await click('確認餐廳收貨');};
 const toAge=async(who='酒商甲')=>{await create();await pay();await invite();await proposals();await select(who);await delivery(who);};
 const begin=async()=>{await create();await pay();await invite();await role('酒商甲');await click('套用示範草稿');};
 const passAge=()=>click('已核對下單本人且驗齡通過');
 const sign=async(touch=false)=>{const canvas=p.getByRole('img',{name:'手寫簽名',exact:true});await canvas.scrollIntoViewIfNeeded();const b=await canvas.boundingBox();
 if(touch){const session=await ctx.newCDPSession(p);await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:b.x+20,y:b.y+20}]});for(let i=1;i<=6;i++)await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:b.x+20+i*18,y:b.y+20+i*8}]});await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await session.detach();}
 else{await p.mouse.move(b.x+20,b.y+20);await p.mouse.down();await p.mouse.move(b.x+130,b.y+80,{steps:8});await p.mouse.up();}
 await click('保存簽名');check((await stored()).order.checkout.signature!==null,'手寫簽名成功保存');};
 const workspace=async()=>{if(await p.getByRole('button',{name:'返回餐廳工作區'}).count())await click('返回餐廳工作區');else if(await p.getByRole('button',{name:'交還店員，稍後接續'}).count())await click('交還店員，稍後接續');};
 const loadRaw=async value=>{await p.evaluate(raw=>localStorage.setItem('banquet-wine-demo:v1',JSON.stringify(raw)),value);await p.reload();await p.getByRole('main').waitFor();};
 const old=async name=>loadRaw(fixtures[name]);
 const supplement=async(double=false)=>{await role('宴客主人');await nameField().fill('宴遇測試主人甲');await phone().fill('02-2345-6789 #123');await click('確認補填');if(double)await p.getByRole('dialog').getByRole('button',{name:'確認',exact:true}).dblclick();else await confirm();};
 const noPII=async(name,tel)=>{const html=await p.content();check(!html.includes(name),'DOM 不含姓名 '+name);check(!html.includes(tel),'DOM 不含電話 '+tel);check(await p.getByRole('img',{name:'簽名原圖'}).count()===0,'酒商無簽名原圖');};
 const mutateStorage=async on=>p.evaluate(on=>{if(on){window.__originalSetItem=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='banquet-wine-demo:v1')throw new DOMException('E2E quota','QuotaExceededError');return window.__originalSetItem.call(this,k,v);};}else{Storage.prototype.setItem=window.__originalSetItem;delete window.__originalSetItem;}},on);
 try{
 await p.goto('http://127.0.0.1:5173/');await p.getByRole('main').waitFor();stage=id;
 switch(id){
 case 'E2E-001':{
 await reset('從空白需求開始');await fill();for(const [field,value,fragment]of [[nameField(),'','姓名'],[nameField(),'   ','姓名'],[phone(),'','電話']]){await fill();await field.fill(value);await click('提交宴客需求');await err(fragment);check((await stored()).order===null,'缺漏不建立訂單');}
 await fill();await nameField().fill('甲'.repeat(101));check((await nameField().inputValue()).length===100,'姓名最大100字');await shot('required');break;
 }
 case 'E2E-002':{
 for(const v of ['0912-345-678','0912 345 678','02 2345-6789 分機 123','02-2345-6789 #123','02-2345-6789 ext123']){await create('宴遇測試主人甲',v);const s=await stored();check(s.order.request.contactPhone.startsWith('0'),'前導零保留 '+v);if(v.includes('123')&&!v.startsWith('09'))check(s.order.request.contactPhone.endsWith('分機 123'),'分機保留 '+v);}await shot('landline');
 await reset('從空白需求開始');await fill();for(const v of ['abc','123','分機 123','091234567','02 abc45678']){await phone().fill(v);await click('提交宴客需求');await err('電話');check((await stored()).order===null,'格式錯誤未建立 '+v);}await shot('invalid');break;
 }
 case 'E2E-003':{
 await reset('從空白需求開始');await fill('宴遇測試主人乙');await click('提交宴客需求');await has('送出後不可修改');await shot('confirm');await p.getByRole('dialog').getByRole('button',{name:'返回',exact:true}).click();check((await stored()).order===null,'返回未建立');await nameField().fill('宴遇測試主人甲');await click('提交宴客需求');await p.getByRole('dialog').getByRole('button',{name:'確認',exact:true}).dblclick();for(const a of ['平台管理者','合作餐廳','宴客主人']){await role(a);await has('宴遇測試主人甲');}await p.reload();const s=await stored();check(s.order.events.filter(e=>e.action==='create').length===1,'建立事件只有一筆');check(s.order.request.hostName==='宴遇測試主人甲','固定正確姓名');await shot('locked');break;
 }
 case 'E2E-004':{
 await toAge();await has('宴遇測試主人甲');await shot('restaurant');await passAge();check(await p.getByRole('button',{name:'平台管理者',exact:true}).count()===0,'客人頁無角色切換');check(await p.getByLabel('下單人姓名').getAttribute('readonly')!==null,'姓名唯讀');await click('保存簽名');await err('簽名');await sign();check((await stored()).order.winePayment===null,'簽名未付款');await shot('signature');await click('模擬支付酒款');const o=(await stored()).order;check(o.status==='completed'&&o.winePayment.amount===6200&&o.commission.amount===600,'唯一付款6200及分潤600');check(o.checkout.signature.name===o.request.hostName,'需求簽收同名');await shot('paid');break;
 }
 case 'E2E-005':{
 await reset('載入餐廳驗齡前');await passAge();await sign();await click('清除簽名並重簽');check(await p.getByRole('button',{name:'模擬支付酒款',exact:true}).isDisabled(),'清除後不可付款');check(await p.getByLabel('下單人姓名').inputValue()==='展示主人','清除仍同名');await sign();await combo('模擬付款結果').selectOption('failed');await click('模擬支付酒款');await shot('failed');await p.reload();check((await stored()).order.checkout.signature.name==='展示主人','刷新保留署名');await combo('模擬付款結果').selectOption('success');await click('重試模擬支付酒款');const o=(await stored()).order;check(o.checkout.attempts.length===2&&o.checkout.attempts.filter(a=>a.outcome==='success').length===1,'失敗後只成功一次');await shot('retry');break;
 }
 case 'E2E-006':{
 await reset('載入餐廳驗齡前');await combo('驗齡結果').selectOption('failed');await click('登錄驗齡未通過');await err('原因');await p.getByLabel('驗齡未通過原因').fill('姓名與本人不符');await click('登錄驗齡未通過');await has('待退回');await has('待登錄');await shot('return');await role('宴客主人');check(await p.getByRole('button',{name:'模擬支付酒款'}).count()===0,'未通過不能付款');await role('合作餐廳');check(await p.getByRole('button',{name:'已核對下單本人且驗齡通過'}).count()===0,'失敗無重驗');await role('酒商甲');await click('確認已取回酒品');await role('平台管理者');await p.getByLabel(/^平台負擔退回運費/).fill('200');await click('登錄退回成本');const o=(await stored()).order;check(o.status==='returned'&&o.serviceFee.refund===0&&o.returnCost===200&&!o.winePayment&&!o.commission&&!o.collection,'退回及平台成本正確');await shot('cost');break;
 }
 case 'E2E-007':{
 await create('宴遇測試主人甲','02 2345-6789 分機 123');await pay();await invite();for(const a of ['宴客主人','平台管理者','合作餐廳']){await role(a);await has('宴遇測試主人甲');await has('0223456789 分機 123');await shot('allowed-'+a);}
 for(const a of ['酒商甲','酒商乙']){await role(a);await noPII('宴遇測試主人甲','0223456789');await p.reload();await noPII('宴遇測試主人甲','0223456789');await shot('merchant-'+a);}await role('宴客主人');await has('宴遇測試主人甲');break;
 }
 case 'E2E-008':{
 for(const who of ['酒商甲','酒商乙']){
 await toAge(who);await passAge();await sign();
 const inspect=async label=>{await workspace();await role(who);await noPII('宴遇測試主人甲','0912345678');await shot(who+'-'+label);await p.reload();await noPII('宴遇測試主人甲','0912345678');await role(who==='酒商甲'?'酒商乙':'酒商甲');await has('本次未獲選');check(!(await text()).includes('簽收紀錄'),'未獲選無簽收紀錄');await role('合作餐廳');};
 await inspect('signed');await click('接續主人簽收付款');await combo('模擬付款結果').selectOption('failed');await click('模擬支付酒款');await inspect('failed');await click('接續主人簽收付款');await combo('模擬付款結果').selectOption('success');await click('重試模擬支付酒款');await inspect('online');
 await toAge(who);await passAge();await sign();await combo('模擬付款結果').selectOption('failed');await click('模擬支付酒款');await click('請餐廳協助代收');await click('裝置已交回店員，核對代收');await click('確認由本餐廳代收');await inspect('collection');
 await toAge(who);await combo('驗齡結果').selectOption('failed');await p.getByLabel('驗齡未通過原因').fill('姓名與本人不符：宴遇測試主人甲 0912345678');await click('登錄驗齡未通過');await role(who);await noPII('宴遇測試主人甲','0912345678');await shot(who+'-return');
 }break;
 }
 case 'E2E-009':{
 for(const row of [[1,1,1],[750,6,1000]]){await begin();for(const [k,v]of [['容量（ml） 1',row[0]],['瓶數 1',row[1]],['單價（元） 1',row[2]],['配送費（元）',0]])await p.getByLabel(k,{exact:k!=='配送費（元）'}).fill(String(v));await click('送出提案');check((await stored()).order.proposals[0].submitted,'合法整數送出 '+row);await role('宴客主人');await has('NT$ 0');await shot('valid-'+row[0]);}break;
 }
 case 'E2E-010':{
 await begin();for(const [label,part]of [['容量（ml） 1','容量'],['瓶數 1','瓶數'],['單價（元） 1','單價']])for(const v of ['','0','-1','1.5','9007199254740992']){await click('套用示範草稿');await p.getByLabel(label,{exact:true}).fill(v);await click('送出提案');await err(part);check(!(await stored()).order.proposals.some(x=>x.submitted),'非法未提交 '+label+'='+v);}
 await click('套用示範草稿');await p.getByLabel('單價（元） 1',{exact:true}).fill('9007199254740991');await click('送出提案');await err('範圍');await shot('invalid');await click('套用示範草稿');await click('送出提案');check((await stored()).order.proposals[0].submitted,'修正可送出');await shot('corrected');break;
 }
 case 'E2E-011':{
 await begin();for(const v of ['','-1','0.5','9007199254740992']){await p.getByLabel(/^配送費（元）/).fill(v);await click('送出提案');await err('配送費');check(!(await stored()).order.proposals.some(p=>p.submitted),'非法運費拒絕 '+v);}await shot('shipping-invalid');await p.getByLabel(/^配送費（元）/).fill('0');check(await p.getByLabel(/^餐廳費用（元）/).getAttribute('readonly')!==null,'餐廳費唯讀');await click('送出提案');check((await stored()).order.proposals[0].restaurantFee===300,'固定費300');await shot('free-shipping');break;
 }
 case 'E2E-012':{
 await begin();await p.getByLabel('容量（ml） 1').fill('');await p.getByLabel('瓶數 1',{exact:true}).fill('');await click('保存草稿');await role('宴客主人');await p.reload();await role('酒商甲');check(await p.getByLabel('容量（ml） 1').inputValue()==='','草稿空白未變零');await shot('blank');await p.getByLabel('容量（ml） 1').fill('750.5');await p.getByLabel('瓶數 1',{exact:true}).fill('-1');await click('保存草稿');await p.reload();check(await p.getByLabel('容量（ml） 1').inputValue()==='750.5','小數草稿還原');await click('送出提案');await err('容量');await shot('fraction');await click('套用示範草稿');await click('送出提案');break;
 }
 case 'E2E-013':{
 await begin();await click('新增酒款');for(const [label,v]of [['酒款名稱 2','第二款'],['容量（ml） 2','750.5'],['瓶數 2','2'],['單價（元） 2','500']])await p.getByLabel(label,{exact:true}).fill(v);await click('送出提案');await err('第 2 款容量');await shot('second-error');await p.getByLabel('容量（ml） 2').fill('750');await click('送出提案');await role('宴客主人');check((await stored()).order.proposals[0].items.length===2,'兩款完整送出');await shot('two-items');break;
 }
 case 'E2E-014':{
 await p.clock.install({time:new Date('2026-12-01T18:00:00+08:00')});
 for(const value of [fixtures.age,v1.age]){await loadRaw(value);await has('待補填');check(await p.getByRole('button',{name:'已核對下單本人且驗齡通過'}).count()===0,'補填前不可驗齡');const age=(await stored()).order.age;await supplement(true);await p.reload();await role('合作餐廳');check(JSON.stringify((await stored()).order.age)===JSON.stringify(age),'原驗齡紀錄不變');await passAge();check(await p.getByLabel('下單人姓名').inputValue()==='宴遇測試主人甲','補填姓名固定');await shot('supplement-'+value.schemaVersion);await workspace();await role('宴客主人');check(await p.getByRole('button',{name:'確認補填'}).count()===0,'無第二次補填');}
 break;
 }
 case 'E2E-015':{
 await old('age');for(const a of ['平台管理者','合作餐廳','酒商甲','酒商乙']){await role(a);check(await p.getByRole('button',{name:'確認補填'}).count()===0,'其他角色無補填 '+a);}await role('宴客主人');await click('確認補填');await err('姓名');await nameField().fill('宴遇測試主人甲');await phone().fill('123');await click('確認補填');await err('電話');await shot('invalid-contact');await phone().fill('0912345678');await click('確認補填');await confirm();await p.reload();check((await stored()).order.identity.contact==='complete','錯誤未消耗補填');check(await p.getByRole('button',{name:'確認補填'}).count()===0,'補填後無重寫');await shot('completed-contact');break;
 }
 case 'E2E-016':{
 for(const raw of [fixtures.signature,v1.purchase,v1.payment].filter(Boolean)){await loadRaw(raw);check(await p.getByRole('img',{name:'手寫簽名',exact:true}).count()===0,'舊單不直接簽');await supplement();await shot('pending-'+raw.schemaVersion);await p.reload();const o=(await stored()).order;check(JSON.stringify(o.age)===JSON.stringify(raw.order.age),'保留age時間及結果');check(await p.getByRole('button',{name:'接續主人簽收付款'}).count()===0,'未核對不可接續');for(const a of ['宴客主人','平台管理者','酒商甲','酒商乙']){await role(a);check(await p.getByRole('button',{name:'已核對補填姓名與本人一致'}).count()===0,'非餐廳無核對 '+a);}await role('合作餐廳');await p.getByRole('button',{name:'已核對補填姓名與本人一致',exact:true}).dblclick();await has('本人簽收');check(await p.getByLabel('下單人姓名').inputValue()==='宴遇測試主人甲','餐廳核對後固定姓名');await p.reload();check((await stored()).order.events.filter(e=>e.action==='identity-check').length===1,'一次核對事件');check((await stored()).order.serviceFee.amount===500,'未重收服務費');await shot('checked-'+raw.schemaVersion);}
 break;
 }
 case 'E2E-017':{
 await old('signature');await supplement();const age=(await stored()).order.age;await combo('補填姓名核對結果').selectOption('failed');await click('登錄姓名核對未通過');await err('原因');await p.getByLabel('姓名核對未通過原因').fill('姓名與本人不符');await click('登錄姓名核對未通過');let o=(await stored()).order;check(o.returnReason==='identity-mismatch'&&JSON.stringify(o.age)===JSON.stringify(age),'原驗齡保留且獨立姓名不符');await shot('mismatch');for(const a of ['宴客主人','合作餐廳']){await role(a);check(await p.getByRole('button',{name:'已核對補填姓名與本人一致'}).count()===0,'失敗不可重驗');check(await p.getByRole('button',{name:'確認補填'}).count()===0,'不可再次補填');}await role('酒商甲');await click('確認已取回酒品');await role('平台管理者');await p.getByLabel(/^平台負擔退回運費/).fill('200');await click('登錄退回成本');await p.reload();o=(await stored()).order;check(o.status==='returned'&&!o.winePayment&&!o.collection&&!o.commission&&o.serviceFee.refund===0,'不可恢復且平台負擔退運');await shot('returned');break;
 }
 case 'E2E-018':{
 for(const key of ['signed','failed']){await old(key);const original=fixtures[key].order.checkout.signature;check(await p.getByRole('button',{name:'確認補填'}).count()===0,'已簽不補填');await p.reload();check(JSON.stringify((await stored()).order.checkout.signature)===JSON.stringify(original),'原署名筆畫快照時間保留');await shot('preserved-'+key);if(key==='failed'){await click('清除簽名並重簽');check(await p.getByLabel('下單人姓名').inputValue()===original.name,'重簽仍歷史姓名');await sign();await shot('resigned');}await combo('模擬付款結果').selectOption('success');await click(key==='failed'?'重試模擬支付酒款':'模擬支付酒款');check((await stored()).order.status==='completed','已簽舊單可接續付款');}
 break;
 }
 case 'E2E-019':{
 for(const raw of [v1.handover,v1.receipt,v1.completed,fixtures.online,fixtures.collection,fixtures.collected].filter(Boolean)){await loadRaw(raw);await p.reload();check(await p.getByRole('button',{name:'確認補填'}).count()===0,'已付不強制補填');let o=(await stored()).order;check(JSON.stringify(o.winePayment)===JSON.stringify(raw.order.winePayment),'原付款保留');check(JSON.stringify(o.commission)===JSON.stringify(raw.order.commission),'原分潤保留');await workspace();if(o.status==='handover-pending'){await role('合作餐廳');await click('舊版：標記已交付主人');o=(await stored()).order;}if(o.status==='host-receipt-pending'){await role('宴客主人');await click('舊版：確認收取並完成服務');}if(o.collection?.status==='pending'){await role('酒商甲');await click('確認已收到餐廳款項');await confirm();await p.reload();check((await stored()).order.collection.status==='received','代收帳款可接續收清');}await shot('paid-'+raw.schemaVersion+'-'+raw.order.status+'-'+(raw.order.collection?.status??'online'));}
 break;
 }
 case 'E2E-020':{
 for(const key of ['cancel-pending','cancelled','return-pending','returned'])for(const raw of [fixtures[key],v1[key]].filter(Boolean)){await loadRaw(raw);await p.reload();check(await p.getByRole('button',{name:'確認補填'}).count()===0,'異常不補填 '+key);const o=(await stored()).order;check(o.status===raw.order.status,'原異常狀態保留');if(o.status==='cancel-refund-pending'){await role('平台管理者');await click('模擬退還服務費');await confirm();}if(o.status==='return-pending'){await role('酒商甲');await click('確認已取回酒品');}check(!(await stored()).order.commission,'異常無分潤');await shot(key+'-'+raw.schemaVersion);}break;
 }
 case 'E2E-021':{
 await old('decimal-submitted');await role('宴客主人');await has('750.5 ml');await select();await p.reload();const o=(await stored()).order;check(o.selected.items[0].capacity===750.5&&o.selected.items[0].price===1000,'舊提交仍可選定小數原值');await role('合作餐廳');await has('750.5 ml');await shot('legacy-selected');break;
 }
 case 'E2E-022':{
 await old('decimal-age');await supplement();await role('合作餐廳');await passAge();await has('750.5 ml');await sign();await click('模擬支付酒款');await p.reload();const o=(await stored()).order;check(o.selected.items[0].capacity===750.5&&o.winePayment.amount===6200&&o.status==='completed','歷史小數容量付款及二次保存成功');await shot('legacy-paid');break;
 }
 case 'E2E-023':{
 for(const key of ['decimal-draft','decimal-submitted']){await old(key);await role('酒商甲');await click('送出提案');await err('容量');await shot('reject-'+key);await p.getByLabel('容量（ml） 1').fill('750');await click('送出提案');check((await stored()).order.proposals.find(p=>p.merchant==='merchant-a').items[0].capacity===750,'重新送出套整數');}
 await old('decimal-draft');await role('酒商乙');await click('套用示範草稿');await p.getByLabel('容量（ml） 1').fill('750.5');await click('送出提案');await err('容量');await shot('other-merchant');break;
 }
 case 'E2E-024':{
 for(const which of ['create','contact','check']){
 if(which==='create'){await reset('從空白需求開始');await fill();await click('提交宴客需求');}
 else{await old(which==='contact'?'age':'signature');if(which==='contact'){await role('宴客主人');await nameField().fill('宴遇測試主人甲');await phone().fill('0912345678');await click('確認補填');}else await supplement();}
 const before=await p.evaluate(()=>localStorage.getItem('banquet-wine-demo:v1'));await mutateStorage(true);if(which==='check')await click('已核對補填姓名與本人一致');else await confirm();await err('保存失敗');check(await p.evaluate(()=>localStorage.getItem('banquet-wine-demo:v1'))===before,'失敗未覆寫 '+which);await shot('failure-'+which);await mutateStorage(false);
 if(which==='check')await click('已核對補填姓名與本人一致');else{await click(which==='create'?'提交宴客需求':'確認補填');await confirm();}
 const s=await stored();check(which==='create'?!!s.order:which==='contact'?s.order.identity.contact==='complete':s.order.identity.checked?.passed,'明確重試成功 '+which);await shot('retry-'+which);}
 break;
 }
 case 'E2E-025':{
 await create();for(const entry of ['從空白需求開始','重設正常起點','載入餐廳取消前','載入餐廳驗齡前']){
 const before=await p.evaluate(()=>localStorage.getItem('banquet-wine-demo:v1'));await click(entry);await p.getByRole('dialog').getByRole('button',{name:'返回',exact:true}).click();check(await p.evaluate(()=>localStorage.getItem('banquet-wine-demo:v1'))===before,'返回不取代 '+entry);await reset(entry);await p.reload();const s=await stored();if(entry==='從空白需求開始')check(await nameField().inputValue()===''&&await phone().inputValue()==='','空白無預填');else if(entry==='重設正常起點'){check(await nameField().inputValue()==='展示主人','正常模擬預填');await nameField().fill('宴遇測試主人乙');check(await nameField().inputValue()==='宴遇測試主人乙','正常預填可修改');}else check(s.order.identity.originVersion===3&&s.order.identity.contact==='complete','新入口不用舊例外 '+entry);await shot(entry);}
 break;
 }
 case 'E2E-026':{
 for(const viewport of [{width:1366,height:768},{width:390,height:844}]){
 await p.setViewportSize(viewport);await reset('從空白需求開始');await fill('宴遇測試主人甲','02 2345-6789 分機 123');await p.getByRole('textbox',{name:/^菜色或料理類型/}).fill('前菜：沙拉\n主菜：牛排\n'+('長文字料理說明'.repeat(30)));await click('提交宴客需求');await shot('form-'+viewport.width);await confirm();check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'表單無水平溢出 '+viewport.width);
 await reset('載入餐廳驗齡前');await passAge();check(await p.getByLabel('下單人姓名').getAttribute('readonly')!==null,'觸控姓名仍唯讀');await sign(viewport.width===390);await shot('signature-'+viewport.width);await click('清除簽名並重簽');await sign(viewport.width===390);await combo('模擬付款結果').selectOption('failed');await click('模擬支付酒款');await click('重試模擬支付酒款');check((await stored()).order.checkout.attempts.length===2,'失敗重試可操作');await click('取消購買');await p.getByRole('dialog').getByRole('button',{name:'返回',exact:true}).click();await click('請餐廳協助代收');await click('裝置已交回店員，核對代收');await click('不承接代收');check((await stored()).order.checkout.signature.name==='展示主人','交接返回仍固定姓名');check(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'簽收無水平溢出 '+viewport.width);await shot('handoff-'+viewport.width);await workspace();}
 break;
 }
 case 'E2E-027':{
 await p.clock.install({time:new Date('2026-11-08T18:00:00+08:00')});await reset('從空白需求開始');await fill();const field=p.getByLabel(/^宴客日期與時間/);
 for(const v of ['2026-11-08T18:00','2026-11-10T23:59']){await field.fill(v);await click('提交宴客需求');await err('2026-11-11');check((await stored()).order===null,'過早不建立 '+v);}
 await field.fill('2026-11-11T00:00');await click('提交宴客需求');await confirm();check((await stored()).order!==null,'午夜下限合法');
 await p.clock.setFixedTime(new Date('2026-11-08T23:59:00+08:00'));await reset('從空白需求開始');await fill();await field.fill('2026-11-11T18:00');await click('提交宴客需求');await p.clock.setFixedTime(new Date('2026-11-09T00:01:00+08:00'));await confirm();await err('2026-11-12');check((await stored()).order===null,'最後確認跨日重新驗證');await shot('cross-midnight');
 for(const [at,min]of [['2026-11-29T10:00:00+08:00','2026-12-02'],['2026-12-30T10:00:00+08:00','2027-01-02']]){await p.clock.setFixedTime(new Date(at));await reset('從空白需求開始');check((await field.getAttribute('min')).startsWith(min),'跨月跨年門檻 '+min);}
 const cdp=await ctx.newCDPSession(p);for(const timezoneId of ['America/Los_Angeles','Asia/Taipei']){await cdp.send('Emulation.setTimezoneOverride',{timezoneId});await reset('從空白需求開始');check((await field.getAttribute('min')).startsWith('2027-01-02'),'裝置時區不改台北門檻 '+timezoneId);}await cdp.detach();await shot('timezone');break;
 }
 case 'E2E-028':{
 await reset('從空白需求開始');await fill();for(const [field,value,part]of [[combo('合作餐廳'),'','餐廳'],[p.getByLabel(/^宴客日期與時間/),'','日期'],[p.getByLabel('宴客人數',{exact:true}),'0','人數'],[p.getByLabel('宴客人數',{exact:true}),'-1','人數'],[p.getByLabel('宴客人數',{exact:true}),'1.5','人數'],[p.getByLabel(/^酒款總預算/),'0','預算'],[p.getByRole('textbox',{name:/^菜色或料理類型/}),' \n ','料理']]){await fill();if(part==='餐廳')await field.selectOption('');else await field.fill(value);await click('提交宴客需求');await err(part);check(await nameField().inputValue()==='宴遇測試主人甲','原驗證保留姓名');}
 await fill();const cuisine=p.getByRole('textbox',{name:/^菜色或料理類型/});await cuisine.fill('前菜：沙拉');await cuisine.press('Enter');await cuisine.pressSequentially('主菜：牛排');check((await stored()).order===null,'料理Enter不送出');await click('提交宴客需求');await confirm();for(const a of ['宴客主人','平台管理者','合作餐廳','酒商甲','酒商乙']){await role(a);await p.reload();check((await stored()).order.request.cuisine==='前菜：沙拉\n主菜：牛排','料理跨角色刷新保存 '+a);}await shot('multiline');break;
 }
 case 'E2E-029':{
 for(const raw of ['{broken',JSON.stringify({schemaVersion:3}),JSON.stringify({...fixtures.age,schemaVersion:3})]){
 await p.evaluate(raw=>localStorage.setItem('banquet-wine-demo:v1',raw),raw);await p.reload();await has('原資料尚未覆寫');check(await p.evaluate(()=>localStorage.getItem('banquet-wine-demo:v1'))===raw,'損壞不覆寫');await shot('recovery-'+screenshots.length);await click('確認重設展示資料');await p.getByRole('dialog').getByRole('button',{name:'返回',exact:true}).click();check(await p.evaluate(()=>localStorage.getItem('banquet-wine-demo:v1'))===raw,'返回不覆寫');await click('確認重設展示資料');await confirm();await has('從一場宴席開始');}
 break;
 }
 default:throw Error('Unknown case '+id);
 }
 check(browserErrors.length===0,'無未解決 browser error');const injected=requests.filter(u=>/^https?:/.test(u)&&new URL(u).hostname==='gc.kes.v2.scr.kaspersky-labs.com');if(injected.length)observations.push('本機防護注入 '+injected.length+' 筆，CDP 來源稽核另存 network-audit.json');check(requests.filter(u=>/^https?:/.test(u)&&!injected.includes(u)).every(u=>new URL(u).origin==='http://127.0.0.1:5173'),'無產品外部服務或真實支付請求');
 return {id,status:'PASS',screenshots,observations,browserErrors,requests:[...new Set(requests.filter(u=>!u.includes('gc.kes.v2.scr.kaspersky-labs.com')).map(u=>u.split('?')[0]))]};
 }catch(e){try{await shot('failure');}catch{}return {id,status:'FAIL',error:String(e),visibleText:(await text()).slice(-5500),screenshots,observations,browserErrors};}
 finally{await ctx.close();}
}
