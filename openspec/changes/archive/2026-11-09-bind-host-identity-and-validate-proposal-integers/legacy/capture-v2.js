async (root) => {
 const ctx=await root.context().browser().newContext({viewport:{width:1366,height:768}});
 const p=await ctx.newPage();p.setDefaultTimeout(6000);
 const fixtures={};let stage='start';const click=n=>p.getByRole('button',{name:n}).click(),role=n=>p.getByRole('button',{name:n,exact:true}).click();
 const confirm=()=>p.getByRole('dialog').getByRole('button',{name:'確認',exact:true}).click();
 const reset=async n=>{stage='reset '+n;await click(n);await confirm();};
 const cap=async n=>{stage=n;fixtures[n]=await p.evaluate(()=>JSON.parse(localStorage.getItem('banquet-wine-demo:v1')));if(fixtures[n].schemaVersion!==2)throw Error('Not original v2');};
 const sign=async()=>{stage='sign';await p.getByLabel('下單人姓名').fill('舊版展示主人');const c=p.getByRole('img',{name:'手寫簽名',exact:true});await c.scrollIntoViewIfNeeded();const b=await c.boundingBox();await p.mouse.move(b.x+20,b.y+30);await p.mouse.down();await p.mouse.move(b.x+120,b.y+80,{steps:8});await p.mouse.up();await click('保存簽名');if(!await p.getByRole('button',{name:'清除簽名並重簽'}).count())throw Error(await p.locator('body').innerText());};
 try{
 await p.goto('http://127.0.0.1:5173/');
 await reset('載入餐廳驗齡前');await cap('age');
 await click('已核對下單本人且驗齡通過');await cap('signature');await sign();await cap('signed');
 await p.getByRole('combobox',{name:'模擬付款結果',exact:true}).selectOption('failed');await click('模擬支付酒款');await cap('failed');
 await click('請餐廳協助代收');await click('裝置已交回店員，核對代收');await click('確認由本餐廳代收');await cap('collection');
 await click('返回餐廳工作區');await role('酒商甲');await click('確認已收到餐廳款項');await confirm();await cap('collected');
 await reset('載入餐廳驗齡前');await click('已核對下單本人且驗齡通過');await sign();await click('模擬支付酒款');await cap('online');
 await click('返回餐廳工作區');await reset('載入餐廳取消前');await p.getByText('無法配合，服務無法繼續',{exact:true}).click();await p.getByLabel('無法配合原因').fill('舊版收貨時段無法配合');await click('取消服務');await confirm();await cap('cancel-pending');
 await role('平台管理者');await click('模擬退還服務費');await confirm();await cap('cancelled');
 await reset('載入餐廳驗齡前');await p.getByRole('combobox',{name:'驗齡結果',exact:true}).selectOption('failed');await p.getByLabel('驗齡未通過原因').fill('未能確認本人與年齡');await click('登錄驗齡未通過');await cap('return-pending');
 await role('酒商甲');await click('確認已取回酒品');await cap('returned');
 await reset('重設正常起點');await click('提交宴客需求');await click('模擬支付服務費');await confirm();await role('平台管理者');await click('邀請兩家酒商');
 await role('酒商甲');await click('套用示範草稿');await p.getByLabel('容量（ml） 1').fill('750.5');await click('保存草稿');await cap('decimal-draft');
 await click('送出提案');await role('酒商乙');await click('套用示範草稿');await click('送出提案');await cap('decimal-submitted');
 await role('宴客主人');await click('選定酒商甲');await confirm();await cap('decimal-selected');
 await role('合作餐廳');await click('確認收貨安排');await role('酒商甲');await click('標記已出貨');await click('標記已送達');await role('合作餐廳');await click('確認餐廳收貨');await cap('decimal-age');
 await reset('重設正常起點');await click('提交宴客需求');await click('模擬支付服務費');await confirm();await role('平台管理者');await click('邀請兩家酒商');await role('酒商甲');await p.getByLabel('酒款名稱 1').fill('未完成草稿');await click('保存草稿');await cap('blank-draft');
 return {ok:true,fixtures,captured:Object.keys(fixtures)};
 }catch(e){return {ok:false,stage,error:String(e),text:await p.locator('body').innerText(),fixtures};}
 finally{await ctx.close();}
}
