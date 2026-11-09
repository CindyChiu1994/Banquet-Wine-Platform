async (rootPage) => {
 const root='C:/Users/uuukkjghkjhkjhkjhouh/AI PM Course/product-temp/openspec/changes/streamline-onsite-signoff-payment/legacy';
 const ctx=await rootPage.context().browser().newContext({viewport:{width:1366,height:768}});
 const page=await ctx.newPage();page.setDefaultTimeout(7000);
 const fixtures={};
 const click=name=>page.getByRole('button',{name}).click();
 const role=name=>page.getByRole('button',{name,exact:true}).click();
 const confirm=()=>page.getByRole('dialog').getByRole('button',{name:'確認',exact:true}).click();
 const reset=async name=>{await click(name);await confirm();};
 const capture=async name=>{
  const raw=await page.evaluate(()=>localStorage.getItem('banquet-wine-demo:v1'));
  if(JSON.parse(raw).schemaVersion!==1)throw Error('Must capture original v1 UI');
  fixtures[name]=JSON.parse(raw);
  await page.screenshot({path:root+'/'+name+'.png',fullPage:true});
 };
 try{
  await page.goto('http://127.0.0.1:5173/');
  await reset('載入餐廳驗齡前');await capture('age');
  await click('登錄驗齡結果 →');await capture('purchase');
  await role('宴客主人');await click('確認現場購買 →');await capture('payment');
  await click('模擬支付酒款 →');await confirm();await capture('handover');
  await role('合作餐廳');await click('標記已交付主人 →');await capture('receipt');
  await role('宴客主人');await click('確認收取並完成服務 →');await capture('completed');
  await reset('載入餐廳驗齡前');
  await page.getByRole('combobox',{name:'驗齡結果',exact:true}).selectOption('failed');
  await page.getByLabel('驗齡未通過原因',{exact:true}).fill('未能確認年齡');
  await click('登錄驗齡結果 →');await capture('return-pending');
  await role('酒商甲');await click('確認已取回酒品 →');await capture('returned');
  await reset('載入餐廳取消前');
  await page.getByText('無法配合，服務無法繼續',{exact:true}).click();
  await page.getByLabel('無法配合原因',{exact:true}).fill('餐廳當日無法安排收貨');
  await click('取消服務');await confirm();await capture('cancel-pending');
  await role('平台管理者');await click('模擬退還服務費 →');await confirm();await capture('cancelled');
  return {fixtures,captured:Object.keys(fixtures)};
 }finally{await ctx.close();}
}
