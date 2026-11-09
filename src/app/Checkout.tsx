import {useState} from 'react';
import {actorNames,fixedName,signatureValid,statusNames,wineTotal,type Command,type Order,type Strokes} from '../domain/model';
import {SignaturePad,SignaturePreview} from './SignaturePad';
const money=(n:number)=>'NT$ '+n.toLocaleString('zh-TW');
export function Checkout({order:o,run,workspace,error,notice}:{order:Order;run:(c:Command)=>void;workspace:()=>void;error:string;notice:string}){
 const name=fixedName(o);
 const [strokes,setStrokes]=useState<Strokes>(o.checkout.signature?.strokes??[]),[outcome,setOutcome]=useState<'success'|'failed'>('success'),[cancel,setCancel]=useState(false);
 const p=o.selected!,valid=signatureValid(o),mode=o.checkout.mode,done=o.status==='completed';
 const failed=o.checkout.attempts.some(a=>a.outcome==='failed');
 const clear=()=>{setStrokes([]);run({type:'signature-clear'});};
 return <div className="checkout-shell"><header><a href="#checkout">宴遇 <small>BANQUET & WINE</small></a><span className="demo-tag">DEMO 模擬模式</span></header><main id="checkout" className="checkout-main">
  <span className="eyebrow">AT YOUR TABLE</span><h1>{done?'這一席，已準備就緒':mode==='guest'?'核對這一席的酒款':'請將裝置交還店員'}</h1>
  <p>{mode==='guest'?'限下單本人簽收；付款成功或餐廳承接代收後，即完成服務。':'由店員核對代收金額與餐廳付款責任。'}</p>
  <span className={'status-badge '+(done?'success':'')}>{statusNames[o.status]}</span>
  {error&&<div role="alert" className="error">{error}</div>}{notice&&<div role="status" className="notice">{notice}</div>}
  <section className="card"><h2>當面核對的交易明細</h2><p>服務編號 {o.id} · 收款方：{actorNames[p.merchant]}</p><ul className="wine-list">{p.items.map((w,i)=><li key={i}><strong>{w.name}</strong><span>{w.capacity} ml · {w.quantity} 瓶 × {money(w.price)}</span></li>)}</ul>
   <dl><div><dt>酒款金額</dt><dd>{money(wineTotal(p))}</dd></div><div><dt>配送費</dt><dd>{money(p.shipping)}</dd></div><div className="total"><dt>應付酒商合計</dt><dd>{money(wineTotal(p)+p.shipping)}</dd></div></dl><p className="subtle">平台服務費 500 元已獨立支付；餐廳現場費用 300 元另收，不併入本筆。所有付款均為模擬，不收集信用卡或證件資料。</p>
  </section>
  {done?<section className="card outcome positive"><h2>服務已完成，可協助開酒</h2><p>{o.collection?`餐廳代收／待付酒商 ${money(o.collection.amount)}。主人稍後併餐費結帳；餐廳已承接向酒商付款的責任。`:'線上模擬付款成功，酒商已模擬收款。'}</p><p>餐廳分潤仍為待結算，與服務完成分開追蹤。</p><button className="primary" onClick={workspace}>返回餐廳工作區</button></section>
  :mode==='handoff'?<section className="card"><h2>等待店員確認代收</h2><p>提出請求尚不代表餐廳同意，服務尚未完成，不可開酒。</p><button className="primary" onClick={()=>run({type:'staff-review'})}>裝置已交回店員，核對代收</button></section>
  :mode==='staff'?<section className="card"><h2>餐廳代收確認</h2><p className="policy">合作餐廳應付 {actorNames[p.merchant]}：{money(wineTotal(p)+p.shipping)}。即使主人稍後尚未結帳，仍由本餐廳負責向酒商付款。餐廳分潤另計，不抵銷此款項。</p><div className="checkout-actions"><button className="primary" onClick={()=>run({type:'collection-accept'})}>確認由本餐廳代收</button><button className="secondary" onClick={()=>run({type:'collection-decline'})}>不承接代收</button></div></section>
  :<><section className="card"><h2>本人簽收</h2><p>我已當面核對上述酒款、數量及金額，並同意於付款成功或餐廳確認承接代收後接收這批酒。簽名本身不代表已付款或服務完成。</p>
   {valid?<><p>已保存簽名：{o.checkout.signature!.name} · {new Date(o.checkout.signature!.at).toLocaleString('zh-TW',{timeZone:'Asia/Taipei'})}</p><SignaturePreview strokes={o.checkout.signature!.strokes}/><button className="secondary" onClick={clear}>清除簽名並重簽</button></>:<>
    <label className="field"><span>下單人姓名</span><input readOnly aria-readonly="true" value={name}/></label><p className="subtle">請以手指或滑鼠在下方手寫簽名，再保存。</p><SignaturePad value={strokes} onChange={setStrokes}/><div className="checkout-actions"><button className="secondary" onClick={clear}>清除簽名</button><button className="primary" onClick={()=>run({type:'signature-save',name,strokes})}>保存簽名</button></div>
   </>}
  </section><section className="card"><h2>支付酒款與配送費</h2>{failed&&<p role="status" className="error">模擬付款失敗，仍待付款。有效簽名已保留，可重試付款、請餐廳協助代收或取消購買。服務尚未完成，不可開酒。</p>}
   <label className="field"><span>模擬付款結果</span><select value={outcome} onChange={e=>setOutcome(e.target.value as 'success'|'failed')}><option value="success">成功</option><option value="failed">失敗</option></select></label><div className="checkout-actions"><button className="primary" disabled={!valid} onClick={()=>run({type:'wine-pay',outcome})}>{failed?'重試模擬支付酒款':'模擬支付酒款'}</button>{failed&&<button className="secondary" disabled={!valid} onClick={()=>run({type:'request-collection'})}>請餐廳協助代收</button>}</div>
  </section><section className="checkout-actions"><button className="danger" onClick={()=>setCancel(true)}>取消購買</button><button className="secondary" onClick={workspace}>交還店員，稍後接續</button></section></>}
  {cancel&&<section role="dialog" aria-modal="true" aria-label="確認取消購買" className="cancel-confirm card"><h2>確認取消購買？</h2><p>取消後待酒商取回，原簽名失效，服務費 500 元不退。退回運費由平台負擔，不向主人加收；不能恢復購買。</p><div className="checkout-actions"><button className="secondary" onClick={()=>setCancel(false)}>返回</button><button className="danger" onClick={()=>{run({type:'cancel-purchase'});setCancel(false);}}>確認取消購買</button></div></section>}
 </main></div>;
}
