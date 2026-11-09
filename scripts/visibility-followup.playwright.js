async(page)=>{
 const ctx=await page.context().browser().newContext({viewport:{width:1366,height:768}}),p=await ctx.newPage();p.setDefaultTimeout(5000);
 const checks=[],errors=[],shots=[];p.on('pageerror',e=>errors.push(String(e)));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const assert=(v,message)=>{checks.push({message,pass:!!v});if(!v)throw Error(message);};
 const button=name=>p.getByRole('button',{name,exact:true}),role=async name=>button(name).click();
 const confirm=async()=>p.getByRole('dialog').getByRole('button',{name:'確認',exact:true}).click();
 const shot=async suffix=>{const path='C:/Users/uuukkjghkjhkjhkjhouh/AI PM Course/product-temp/openspec/changes/archive/2026-11-09-clarify-onsite-wine-service-and-budget/e2e-evidence/visibility-'+suffix+'.png';await p.screenshot({path,fullPage:true});shots.push(path);};
 const hidden=async(a,stage)=>{await role(a);await p.reload();const text=await p.locator('#root').textContent();assert(!text.includes('本次宴客服務')&&!text.includes('法式料理')&&!text.includes('0912345678')&&!text.includes('每一步，都有紀錄')&&!text.includes('這一席的費用'),stage+' '+a+' no service data or sidebar/timeline');assert(await p.locator('.order-head').count()===0,stage+' '+a+' no hidden overview DOM');};
 const result={url:'http://127.0.0.1:5173/',checks,errors,shots,at:new Date().toISOString()};
 try{
 await p.goto(result.url);await button('重設正常起點').click();await confirm();await p.getByRole('button',{name:/提交宴客需求/}).click();await confirm();
 for(const a of ['酒商甲','酒商乙','合作餐廳'])await hidden(a,'unpaid');await shot('unpaid-hidden');
 for(const a of ['宴客主人','平台管理者']){await role(a);assert(await p.getByRole('heading',{name:'本次宴客服務',exact:true}).count()===1,'owner/platform retain overview '+a);}
 await role('宴客主人');await p.getByRole('button',{name:/模擬支付服務費/}).click();await confirm();
 for(const a of ['酒商甲','酒商乙','合作餐廳'])await hidden(a,'paid-not-invited');await shot('paid-uninvited-hidden');
 await role('平台管理者');await p.getByRole('button',{name:/邀請兩家酒商/}).click();
 for(const a of ['酒商甲','酒商乙']){await role(a);await p.reload();assert(await p.getByRole('heading',{name:'本次宴客服務',exact:true}).count()===1,'invited merchant overview '+a);const labels=await p.locator('.wine-fields .field > span').allTextContents();assert(JSON.stringify(labels)===JSON.stringify(['酒款名稱','容量（ml）','建議瓶數','單價（元）']),'four labels without serial '+a);}
 await hidden('合作餐廳','invited-unselected');await shot('restaurant-wait-selection');
 await role('酒商甲');await button('套用示範草稿').click();await p.getByRole('button',{name:/新增酒款/}).click();
 for(const [label,value]of [['酒款名稱','第二酒款'],['容量（ml）','375'],['建議瓶數','1'],['單價（元）','100']])await p.getByLabel(label,{exact:true}).nth(1).fill(value);
 const labels=await p.locator('.wine-fields .field > span').allTextContents();assert(labels.length===8&&labels.every(t=>!/[12]$/.test(t)),'multiple wine rows retain unnumbered labels');await button('保存草稿').click();await p.reload();assert(await p.getByLabel('酒款名稱',{exact:true}).nth(1).inputValue()==='第二酒款','second row saved/restored correctly');await shot('proposal-labels');await p.getByRole('button',{name:/送出提案/}).click();assert(await p.getByRole('alert').count()===0,'multi-row proposal submit');
 await role('酒商乙');await button('套用示範草稿').click();await p.getByRole('button',{name:/送出提案/}).click();await hidden('合作餐廳','comparison-ready');await role('宴客主人');await button('委託此酒商安排現場備酒').first().click();await confirm();
 await role('合作餐廳');await p.reload();assert(await p.getByRole('heading',{name:'本次宴客服務',exact:true}).count()===1&&await p.getByRole('button',{name:/確認收貨安排/}).count()===1,'selected restaurant can see service and arrange');await shot('restaurant-selected');
 await role('酒商甲');assert(await p.getByRole('heading',{name:'本次宴客服務',exact:true}).count()===1,'selected merchant retains service');await role('酒商乙');await p.reload();assert((await p.locator('body').innerText()).includes('本次未獲選')&&await p.locator('.order-head').count()===0,'unchosen merchant remains excluded');
 assert(errors.length===0,'no page/console errors');result.status='PASS';
 }catch(e){result.status='FAIL';result.failure=String(e);result.visible=await p.locator('body').innerText();await shot('failure');}finally{await ctx.close();}
 return result;
}