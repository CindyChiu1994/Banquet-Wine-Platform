import {useState} from 'react';
import {actorNames,fixedName,statusNames,type Command,type OrderView,type Strokes} from '../domain/model';
import {SignaturePad,SignaturePreview} from './SignaturePad';
const money=(n:number)=>'NT$ '+n.toLocaleString('zh-TW');
export function Checkout({order:o,run,workspace,error,notice}:{order:OrderView;run:(c:Command)=>void;workspace:()=>void;error:string;notice:string}){
 const name=fixedName(o),p=o.selected!,snap=o.receipt!,valid=o.validSignature,mode=o.checkout.mode,done=o.status==='completed';
 const [strokes,setStrokes]=useState<Strokes>([]),[outcome,setOutcome]=useState<'success'|'failed'>('success'),[cancel,setCancel]=useState(false);
 const [quantities,setQuantities]=useState(()=>p.items.map((w,i)=>o.purchaseDraft?.items[i].quantity??w.quantity));
 const failed=o.checkout.attempts.some(a=>a.outcome==='failed'&&(a.revision??0)===(o.purchaseDraft?.revision??0));
 const clear=()=>{setStrokes([]);run({type:'signature-clear'});};
 return <div className="checkout-shell"><header><a href="#checkout">宴遇 <small>BANQUET & WINE</small></a><span className="demo-tag">DEMO 模擬模式</span></header><main id="checkout" className="checkout-main">
 <span className="eyebrow">AT YOUR TABLE</span><h1>{mode==='edit'?'店員調整購買明細':done?'服務已完成':mode==='handoff'?'請將裝置交還店員':mode==='staff'?'餐廳代收確認':'現場購買確認'}</h1>
 <p>賣方／酒款收款方：{actorNames[p.merchant]}。暮光餐桌為事先合作授權的現場協助餐廳。</p>
 <p className="alcohol-warning">禁止酒駕　｜　飲酒過量，有害健康　｜　未滿十八歲者禁止飲酒</p>
 <span className="status-badge">{statusNames[o.status]}</span>
 {error&&<div role="alert" className="error">{error}</div>}{notice&&<div role="status" className="notice">{notice}</div>}
 {mode==='edit'?<section className="card"><h2>現場實購編輯</h2><p>只能調整原備酒的購買瓶數，不可換款、加品項或改價。全部不買請返回主人走整筆取消。</p>
 {p.items.map((w,i)=><div className="wine-fields" key={i}><h3>{w.name}</h3><p>容量 {w.capacity} ml · 單價 {money(w.price!)} · 原備酒 {w.quantity} 瓶</p><label className="field"><span>購買瓶數</span><input type="number" min="0" max={w.quantity} step="1" value={Number.isNaN(quantities[i])?'':quantities[i]} onChange={e=>setQuantities(quantities.map((x,j)=>j===i?(e.target.value===''?NaN:Number(e.target.value)):x))}/></label><p>未購買 {Number.isSafeInteger(quantities[i])&&quantities[i]>=0&&quantities[i]<=w.quantity?w.quantity-quantities[i]:'—'} 瓶</p></div>)}
 <p>運送費 {money(p.shipping!)}</p><div className="checkout-actions"><button className="primary" onClick={()=>run({type:'purchase-edit',quantities})}>保存現場購買明細</button><button className="secondary" onClick={workspace}>返回餐廳工作區</button></div></section>:<>
 <section className="card"><h2>當面核對的購買明細</h2><p>服務編號 {o.id} · 固定宴客聯絡人：{name}</p><ul className="wine-list">{snap.items.map((w,i)=><li key={i}><strong>{w.name}</strong><span>{w.capacity} ml · {w.quantity} 瓶 × {money(w.price)}</span></li>)}</ul>
 <dl><div><dt>酒款金額</dt><dd>{money(snap.wineAmount)}</dd></div><div><dt>運送費</dt><dd>{money(snap.shipping)}</dd></div><div className="total"><dt>應付酒商合計</dt><dd>{money(snap.amount)}</dd></div></dl><p className="subtle">平台諮詢與協調服務費500元已獨立支付，不抵酒款。餐廳自身開瓶費等依其規定結帳。所有付款均為模擬，不收真實卡號或證件資料。</p>
 </section>
 {done?<section className="card outcome positive"><h2>服務已完成，可協助開酒</h2><p>{o.checkout.completedBy==='collection'?'本筆由餐廳代收，請依上述自身購買明細於餐廳結帳。':'模擬支付酒款成功。'}</p><button className="primary" onClick={workspace}>返回餐廳工作區</button></section>
 :mode==='handoff'?<section className="card"><h2>等待店員確認本筆代收</h2><p>合作授權已事先完成；本筆仍須店員明確承接。請求尚未完成服務，不可開酒。</p><button className="primary" onClick={()=>run({type:'staff-review'})}>裝置已交回店員，核對代收</button></section>
 :mode==='staff'?<section className="card"><h2>餐廳代收確認</h2><p className="policy">本筆應付 {actorNames[p.merchant]} 全額 {money(snap.amount)}。即使主人稍後尚未結帳，仍由餐廳負責向酒商付款。餐廳分潤另計，不抵銷此款項。</p><div className="checkout-actions"><button className="primary" onClick={()=>run({type:'collection-accept'})}>確認由本餐廳代收</button><button className="secondary" onClick={()=>run({type:'collection-decline'})}>不承接代收</button></div></section>
 :<><section className="card"><h2>本人簽名確認購買</h2><p>請先核對完整酒款、數量與價金。決定購買後以固定姓名簽名；簽名本身不代表已付或服務完成，仍可減量或全部不買。</p>
 {valid?<><p>已保存簽名：{name} · {new Date(o.checkout.signature!.at).toLocaleString('zh-TW',{timeZone:'Asia/Taipei'})}</p><SignaturePreview strokes={o.checkout.signature!.strokes}/><button className="secondary" onClick={clear}>清除簽名並重簽</button></>:<>
 <label className="field"><span>宴客聯絡人姓名</span><input readOnly aria-readonly="true" value={name}/></label><p>請以手指或滑鼠手寫簽名，再保存。</p><SignaturePad value={strokes} onChange={setStrokes}/><div className="checkout-actions"><button className="secondary" onClick={clear}>清除簽名</button><button className="primary" onClick={()=>run({type:'signature-save',name,strokes})}>保存簽名</button></div></>}
 </section><section className="card"><h2>模擬支付酒款與運送費</h2>{failed&&<p role="status" className="error">模擬付款失敗，仍待付款。同版本有效簽名已保留，可重試、請餐廳協助代收或取消購買。尚未完成服務，不可開酒。</p>}
 <label className="field"><span>模擬付款結果</span><select value={outcome} onChange={e=>setOutcome(e.target.value as 'success'|'failed')}><option value="success">成功</option><option value="failed">失敗</option></select></label><div className="checkout-actions"><button className="primary" disabled={!valid} onClick={()=>run({type:'wine-pay',outcome})}>{failed?'重試模擬支付酒款':'模擬支付酒款'}</button>{failed&&<button className="secondary" disabled={!valid} onClick={()=>run({type:'request-collection'})}>請餐廳協助代收</button>}</div></section>
 <section className="checkout-actions"><button className="secondary" onClick={()=>run({type:'purchase-edit-open'})}>交還店員調整購買明細</button><button className="danger" onClick={()=>setCancel(true)}>全部不買，取消購買</button><button className="secondary" onClick={workspace}>交還店員，稍後接續</button></section></>}
 </>}
 {cancel&&<section role="dialog" aria-modal="true" aria-label="確認取消購買" className="cancel-confirm card"><h2>確認取消購買？</h2><p>取消後待酒商取回，原簽名失效，服務費500元不退。不向主人加收取回費；不能恢復購買。</p><div className="checkout-actions"><button className="secondary" onClick={()=>setCancel(false)}>返回</button><button className="danger" onClick={()=>{run({type:'cancel-purchase'});setCancel(false);}}>確認取消購買</button></div></section>}
 </main></div>;
}
