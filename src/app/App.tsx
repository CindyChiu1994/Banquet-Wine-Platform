import {useEffect,useRef,useState,type ReactNode} from 'react';
import {actorNames,sampleRequest,sampleProposal,statusNames,transition,proposalAmount,budgetLimit,orderViewForActor,orderAccessMessage,identityGate,fixedName,validateRequest,validateContact,type Actor,type State,type Command,type NewRequest,type Proposal,type ViewProposal} from '../domain/model';
import {Checkout} from './Checkout';
import {SignaturePreview} from './SignaturePad';
import {scenario,type Scenario} from '../demo/scenarios';
import {load,save} from '../persistence/storage';
import {earliestBanquetDateTime,validateNewRequestDate} from '../domain/banquet-date';
const money=(n:number)=>'NT$ '+n.toLocaleString('zh-TW');
const fmt=(s:string)=>new Date(s).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false});
const numberValue=(s:string)=>s.trim()===''?NaN:Number(s);
const asInput=(v:number)=>Number.isFinite(v)?v:'';
type Run=(command:Command)=>void;
function Field({label,children,hint}:{label:string;children:ReactNode;hint?:string}){return <label className="field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>;}
function RequestForm({prefill,run}:{prefill:boolean;run:Run}){
 const [draft,setDraft]=useState<NewRequest>(()=>prefill?sampleRequest():{hostName:'',contactPhone:'',date:'',restaurantId:'',guests:NaN,cuisine:'',budget:NaN,preference:'不限'});
 const [confirming,setConfirming]=useState(false),[inputError,setInputError]=useState('');
 const [minimum,setMinimum]=useState(()=>earliestBanquetDateTime());
 const field=<K extends keyof NewRequest>(key:K,value:NewRequest[K])=>setDraft({...draft,[key]:value});
 return <form noValidate onSubmit={e=>{e.preventDefault();setMinimum(earliestBanquetDateTime());try{validateRequest(draft);validateNewRequestDate(draft.date,new Date());setInputError('');setConfirming(true);}catch(err){setInputError((err as Error).message);}}}>
  <div className="section-title"><div><span className="eyebrow">YOUR BANQUET</span><h2>從一場宴席開始</h2></div><span className="subtle">宴客需求與聯絡資料 · 約 1 分鐘</span></div>
  {inputError&&<div role="alert" className="error">{inputError}</div>}
  <div className="form-grid">
   <Field label="宴客聯絡人姓名" hint="請填實際到場核對及簽名的宴客聯絡人姓名；預填為模擬資料"><input maxLength={100} autoComplete="name" value={draft.hostName} onChange={e=>field('hostName',e.target.value)}/></Field>
   <Field label="聯絡電話" hint="台灣手機或市話，可含空格、連字號與市話分機"><input type="tel" autoComplete="tel" value={draft.contactPhone} onChange={e=>field('contactPhone',e.target.value)}/></Field>
   <Field label="宴客日期與時間" hint={`時區 Asia/Taipei；至少提前三個日曆日；最早 ${minimum.slice(0,10).replaceAll('-','/')} 00:00`}><input type="datetime-local" min={minimum} value={draft.date} onFocus={()=>setMinimum(earliestBanquetDateTime())} onChange={e=>field('date',e.target.value)}/></Field>
   <Field label="合作餐廳"><select value={draft.restaurantId} onChange={e=>field('restaurantId',e.target.value)}><option value="">請選擇餐廳</option><option value="restaurant-demo">暮光餐桌（示範合作餐廳）</option></select></Field>
   <Field label="宴客人數"><input type="number" min="1" step="1" placeholder="例如 12" value={asInput(draft.guests)} onChange={e=>field('guests',numberValue(e.target.value))}/></Field>
   <Field label="酒類與運送預算" hint="含酒款與運送；平台將邀請酒商提供不超過預算105%（最多增加5%）的建議書。獨立諮詢與協調服務費500元另計，不抵酒款；餐廳自身開瓶費等依其規定結帳。"><input type="number" min="1" step="1" placeholder="例如 6500" value={asInput(draft.budget)} onChange={e=>field('budget',numberValue(e.target.value))}/></Field>
   <Field label="菜色或料理類型"><textarea className="cuisine-input" rows={3} placeholder="例如 前菜：沙拉、主菜：牛排（可按 Enter 分行）" value={draft.cuisine} onChange={e=>field('cuisine',e.target.value)}/></Field>
   <Field label="飲酒偏好"><select value={draft.preference} onChange={e=>field('preference',e.target.value)}>{['不限','紅白酒皆可','偏好紅酒','偏好白酒','氣泡酒'].map(x=><option key={x}>{x}</option>)}</select></Field>
  </div><div className="form-footer"><span>送出後由平台協調兩家酒商提案</span><button className="primary" type="submit">提交宴客需求 <b>→</b></button></div>
 {confirming&&<Modal title="確認姓名" confirm={()=>{setMinimum(earliestBanquetDateTime());run({type:'create',request:draft});setConfirming(false);}} onClose={()=>setConfirming(false)}><p>姓名：<strong>{draft.hostName.trim()}</strong></p><p>此姓名將用於現場驗齡與簽收，送出後不可修改。</p></Modal>}
 </form>;
}
function ContactForm({run}:{run:Run}){
 const [hostName,setName]=useState(''),[contactPhone,setPhone]=useState(''),[confirming,setConfirming]=useState(false),[error,setError]=useState('');
 return <form noValidate aria-label="補填聯絡資料" onSubmit={e=>{e.preventDefault();try{validateContact(hostName,contactPhone);setError('');setConfirming(true);}catch(e){setError((e as Error).message);}}}>
 <h3>補填聯絡資料</h3><p>舊服務尚缺聯絡資料；只能由主人完整補填一次，原服務進度與費用不變。</p>
 {error&&<div role="alert" className="error">{error}</div>}
 <div className="form-grid"><Field label="宴客聯絡人姓名"><input maxLength={100} value={hostName} onChange={e=>setName(e.target.value)}/></Field><Field label="聯絡電話"><input type="tel" value={contactPhone} onChange={e=>setPhone(e.target.value)}/></Field></div>
 <button className="primary" type="submit">確認補填</button>
 {confirming&&<Modal title="確認姓名" onClose={()=>setConfirming(false)} confirm={()=>{run({type:'contact-complete',hostName,contactPhone});setConfirming(false);}}><p>姓名：{hostName.trim()}</p><p>此姓名將用於現場驗齡與簽收，送出後不可修改。</p></Modal>}
 </form>;
}
function NameCheckForm({run}:{run:Run}){
 const [result,setResult]=useState('passed'),[reason,setReason]=useState('');
 return <div className="identity-gate"><h3>待餐廳核對補填姓名</h3><p>請以固定姓名核對證件與本人。沿用原驗齡結果，不重跑配送或收費。</p>
 <Field label="補填姓名核對結果"><select value={result} onChange={e=>setResult(e.target.value)}><option value="passed">一致</option><option value="failed">未通過</option></select></Field>
 {result==='failed'&&<Field label="姓名核對未通過原因"><textarea value={reason} onChange={e=>setReason(e.target.value)}/></Field>}
 <button className="primary" onClick={()=>run({type:'identity-check',passed:result==='passed',reason})}>{result==='passed'?'已核對補填姓名與本人一致':'登錄姓名核對未通過'}</button></div>;
}
function ProposalForm({merchant,existing,run,budget}:{merchant:Proposal['merchant'];existing:ViewProposal|undefined;run:Run;budget:number}){
 const [p,setP]=useState<Proposal>(()=>existing?structuredClone(existing) as Proposal:{merchant,items:[{name:'',capacity:NaN,quantity:NaN,price:NaN}],shipping:NaN,policy:'wine-shipping-105',reason:'',delivery:'',limits:'',submitted:false});
 const update=(key:keyof Proposal,value:unknown)=>setP({...p,[key]:value});
 return <form noValidate onSubmit={e=>{e.preventDefault();run({type:'proposal-submit',proposal:p});}}>
  <div className="section-title"><h2>{actorNames[merchant]}的搭配建議書</h2><button type="button" className="secondary" onClick={()=>setP(sampleProposal(merchant))}>套用示範草稿</button></div>
  {p.items.map((w,i)=><div className="wine-fields" key={i}><h3>酒款 {i+1}</h3><div className="form-grid">
   {(['name','capacity','quantity','price'] as const).map(key=><Field key={key} label={({name:'酒款名稱',capacity:'容量（ml）',quantity:'建議瓶數',price:'單價（元）'}[key])}><input type={key==='name'?'text':'number'} min={key==='name'?undefined:1} step={key==='name'?undefined:1} value={key==='name'?w.name:asInput(w[key])} onChange={e=>setP({...p,items:p.items.map((x,j)=>j===i?{...x,[key]:key==='name'?e.target.value:numberValue(e.target.value)}:x)})}/></Field>)}
  </div>{p.items.length>1&&<button type="button" className="link-button" onClick={()=>update('items',p.items.filter((_,j)=>j!==i))}>移除酒款 {i+1}</button>}</div>)}
  <button type="button" className="secondary" onClick={()=>update('items',[...p.items,{name:'',capacity:NaN,quantity:NaN,price:NaN}])}>＋ 新增酒款</button>
  <div className="form-grid proposal-extra">
   <Field label="運送費（元）" hint="免運也請填 0"><input type="number" min="0" step="1" value={asInput(p.shipping)} onChange={e=>update('shipping',numberValue(e.target.value))}/></Field>
   <Field label="搭配理由"><textarea value={p.reason} onChange={e=>update('reason',e.target.value)}/></Field>
   <Field label="備酒條件"><textarea value={p.delivery} onChange={e=>update('delivery',e.target.value)}/></Field>
   <Field label="備貨限制" hint="無限制亦須明列"><input value={p.limits} onChange={e=>update('limits',e.target.value)}/></Field>
  </div><BudgetFeedback proposal={p} budget={budget}/><p className="subtle">公開說明不可填報價或分潤，請填在內部金額欄位。</p><div className="form-footer"><button type="button" className="secondary" onClick={()=>run({type:'proposal-save',proposal:p})}>保存草稿</button><button type="submit" className="primary">送出提案 →</button></div>
 </form>;
}
function Modal({title,children,confirm,onClose}:{title:string;children:ReactNode;confirm:()=>void;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{ref.current?.showModal();},[]);
 return <dialog ref={ref} onCancel={e=>{e.preventDefault();onClose();}} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();onClose();}}}><div className="dialog-inner"><span className="eyebrow">PLEASE CONFIRM</span><h2>{title}</h2><div>{children}</div><div className="dialog-actions"><button type="button" onClick={onClose} className="secondary">返回</button><button type="button" autoFocus className="primary" onClick={()=>{confirm();onClose();}}>確認</button></div></div></dialog>;
}
function BudgetFeedback({proposal,budget}:{proposal:Proposal;budget:number}){
 let amount:number;try{amount=proposalAmount(proposal);}catch{return <p role="status">請完成正整數瓶數與單價、非負整數運送費，才能計算合計。草稿仍可保存。</p>;}
 const limit=budgetLimit(budget),excess=BigInt(amount)-limit;
 return <p role="status" className={excess>0?'budget-warning':'policy'}>含運合計 {money(amount)} · 105%上限 NT$ {limit.toLocaleString('zh-TW')}{excess>0?' · 超出 '+excess.toLocaleString('zh-TW')+' 元，無法提交':' · 符合設定預算範圍（含5%彈性）'}</p>;
}
export function AlcoholWarning(){return <p className="alcohol-warning">禁止酒駕　｜　飲酒過量，有害健康　｜　未滿十八歲者禁止飲酒</p>;}
function proposalMoney(p:ViewProposal){return p.items.reduce((sum,w)=>sum+w.quantity*(w.price??0),0);}
export function App(){
 const [boot]=useState(()=>{try{return load(window.localStorage);}catch{return {state:scenario('normal'),error:'瀏覽器儲存不可用，請恢復後確認重設。'};}});
 const [state,setState]=useState<State>(boot.state),stateRef=useRef(state);
 const [recovery,setRecovery]=useState(boot.error),[error,setError]=useState(''),[notice,setNotice]=useState(''),[epoch,setEpoch]=useState(0);
 const [modal,setModal]=useState<{title:string;body:ReactNode;confirm:()=>void}|null>(null);
 const [time,setTime]=useState('宴客當日 15:00–17:00'),[cancelReason,setCancelReason]=useState(''),[ageResult,setAgeResult]=useState('passed'),[ageReason,setAgeReason]=useState('');
 const {actor}=state,o=orderViewForActor(state),accessMessage=orderAccessMessage(state),gate=o?identityGate(o):null,chosen=o?.selected,internal=o?.audience==='internal';
 const commit=(next:State,message:string)=>{try{save(window.localStorage,next);stateRef.current=next;setState(next);setError('');setNotice(message);return true;}catch{setError('保存失敗，請確認瀏覽器儲存權限後重試；保留上一個已確認保存的狀態。');setNotice('');return false;}};
 const run:Run=c=>{if(recovery){setError('請先確認重設，避免覆寫無法讀取的舊資料。');return;}try{const next=transition(stateRef.current,stateRef.current.actor,{...c,operationId:c.operationId??crypto.randomUUID()});if(next===stateRef.current){setError('');setNotice('此動作已完成，保留原有結果。');return;}commit(next,c.type==='wine-pay'&&c.outcome==='failed'?'已記錄模擬付款失敗，請選擇下一步。':'已保存操作結果。');}catch(e){setError(e instanceof Error?e.message:'操作失敗');setNotice('');}};
 const confirm=(title:string,body:ReactNode,action:()=>void)=>setModal({title,body,confirm:action});
 const reset=(which:Scenario)=>confirm('取代目前展示資料？',<p>將取代目前展示服務與紀錄，只影響本應用。</p>,()=>{if(commit(scenario(which),'已載入新情境。')){setRecovery('');setEpoch(x=>x+1);setAgeResult('passed');setAgeReason('');setCancelReason('');}});
 const changeActor=(next:Actor)=>{if(recovery)return;const current=stateRef.current;commit({...current,actor:next,order:current.order?{...current.order,checkout:{...current.order.checkout,mode:'none'}}:null},'已切換示範身分，資料保留。');};
 const terminal=!!o&&['completed','cancelled','cancel-refund-pending','return-pending','returned'].includes(o.status);
 const action=(label:string,type:Command['type'])=><button className="primary" onClick={()=>run({type} as Command)}>{label} →</button>;
 const workspace=()=>{const current=stateRef.current;if(current.order)commit({...current,actor:'restaurant',order:{...current.order,checkout:{...current.order.checkout,mode:'none'}}},'裝置已交還店員，進度已保存。');};
 const resume=()=>{const current=stateRef.current;if(!current.order)return;const review=current.order.status==='collection-review-pending';commit({...current,actor:review?'restaurant':'host',order:{...current.order,checkout:{...current.order.checkout,mode:review?'handoff':'guest'}}},'已接續現場購買確認。');};
 if(o&&!gate&&!actor.startsWith('merchant-')&&o.checkout.mode!=='none')return <Checkout key={o.id+'-'+(o.purchaseDraft?.revision??0)} order={o} run={run} workspace={workspace} error={error} notice={notice}/>;
 return <div className="shell">
 <aside className="sidebar"><a className="brand" href="#main">宴遇 <small>BANQUET & WINE</small></a><p>餐酒搭配諮詢與協調</p><ol className="journey">{['提交宴客需求','付服務費・邀請酒商','比較建議書・委託服務','備酒運送・餐廳暫存','本人與十八歲核對','現場核對・簽名付款'].map((x,i)=><li key={x}><span>{i+1}</span>{x}</li>)}</ol><p>課程展示・虛構合作資料</p></aside>
 <div className="workspace"><header className="topbar"><span>宴客服務 ／ 工作區</span><span className="demo-tag">DEMO 模擬模式</span></header><main id="main">
 <div className="page-heading"><div><span className="eyebrow">A THOUGHTFULLY PAIRED EVENING</span><h1>讓每一席，恰逢好酒。</h1><p>餐酒搭配諮詢、酒商現場備酒與餐廳協調服務。</p></div></div>
 <section className="role-switch" aria-label="示範身分"><div className="role-label">目前示範身分<small>同瀏覽器模擬切換，無登入驗證</small></div><div className="role-buttons">{(['host','platform','merchant-a','merchant-b','restaurant'] as Actor[]).map(a=><button key={a} className={actor===a?'active':''} aria-pressed={actor===a} onClick={()=>changeActor(a)}>{actorNames[a]}</button>)}</div></section>
 {recovery&&<div role="alert" className="error">{recovery}<button onClick={()=>reset('normal')}>確認重設展示資料</button></div>}
 {error&&<div role="alert" className="error">{error}</div>}{notice&&<div role="status" className="notice">{notice}</div>}
 {state.order&&!o?<section className="card" aria-label="服務資料存取提示"><h2>{accessMessage?.startsWith('本次未獲選')?'本次未獲選':'尚無可查看的服務資料'}</h2><p>{accessMessage}</p></section>:<div className="content-grid"><div className="main-column">
 <section className="card order-head"><div className="section-title"><h2>{o?'本次宴客服務':'準備一場值得回味的宴席'}</h2><span className="status-badge">{o?statusNames[o.status]:'尚未建立需求'}</span></div>{o&&<>
 <p>{o.request.date.replace('T',' ')}（Asia/Taipei） · {o.request.guests} 位 · 暮光餐桌</p>
 <div className="request-facts"><span className="cuisine-fact">料理 <b>{o.request.cuisine}</b></span><span>酒類與運送預算 <b>{money(o.request.budget)}</b></span><span>偏好 <b>{o.request.preference}</b></span></div>
 {!actor.startsWith('merchant-')&&<p>宴客聯絡人姓名 <b>{fixedName(o)||'待補填'}</b> · 聯絡電話 {o.request.contactPhone??'舊版未提供'}</p>}<small>服務編號 {o.id} · {chosen?'已確認服務酒商：'+actorNames[chosen.merchant]:'尚未委託服務酒商'}</small>
 </>}</section>
 <section className="card current-task"><h2>{actorNames[actor]}的當前待辦</h2>
 {!o?(actor==='host'?<RequestForm key={epoch} prefill={state.prefill} run={run}/>:<p>等待主人建立宴客需求。</p>):<>
 {gate==='contact-required'&&(actor==='host'?<ContactForm key={o.id} run={run}/>:!actor.startsWith('merchant-')&&<p>待宴客主人補填聯絡資料；補填前不可驗齡或簽名。</p>)}
 {gate==='name-check-pending'&&(actor==='restaurant'?<NameCheckForm run={run}/>:!actor.startsWith('merchant-')&&<p>待餐廳核對補填姓名，尚不能簽名或付款。</p>)}
 {actor==='host'&&o.status==='service-fee-pending'&&<div><h3>啟動選酒諮詢與協調服務</h3><p>平台服務費 {money(500)} 獨立支付，不含或抵酒款。酒類與運送預算上限為105%（含5%彈性）。餐廳自身開瓶費等依餐廳規定結帳。</p><p className="policy">餐廳無法配合且服務無法繼續：全額退服務費。已提供建議與備酒後，現場核對未通過或主人取消購買：服務費不退，不向主人加收取回費或罰款。</p><button className="primary" onClick={()=>confirm('模擬支付平台服務費',<p>收款方：平台；獨立服務費 {money(500)}。不含或抵酒款，不收真實卡號或證件。</p>,()=>run({type:'service-pay'}))}>模擬支付服務費 →</button></div>}
 {actor==='platform'&&o.status==='invitation-pending'&&action('邀請兩家酒商','invite')}
 {(actor==='merchant-a'||actor==='merchant-b')&&['proposals-pending','comparison-ready'].includes(o.status)&&<ProposalForm key={actor+o.id+epoch} budget={o.request.budget} merchant={actor} existing={o.proposals.find(p=>p.merchant===actor)} run={run}/>}
 {actor==='host'&&['proposals-pending','comparison-ready'].includes(o.status)&&<p>{o.status==='comparison-ready'?'請比較建議書並委託一家酒商安排現場備酒。':'等待兩份有效建議書到齊後才能委託。'}</p>}
 {actor==='restaurant'&&o.status==='restaurant-pending'&&<div><Field label="可收貨時段"><input value={time} onChange={e=>setTime(e.target.value)}/></Field><button className="primary" onClick={()=>run({type:'arrange',time})}>確認收貨安排 →</button><details className="exception"><summary>無法配合，服務無法繼續</summary><Field label="無法配合原因"><textarea value={cancelReason} onChange={e=>setCancelReason(e.target.value)}/></Field><button className="danger" onClick={()=>confirm('取消服務並進入待退款',<p>原因：{cancelReason||'尚未填寫'}。將全額模擬退服務費，不能恢復履約。</p>,()=>run({type:'cancel',reason:cancelReason}))}>取消服務</button></details></div>}
 {actor===chosen?.merchant&&o.status==='delivery-ready'&&<div><p>已確認收貨：{o.arrangement}</p>{action('標記備酒運送','ship')}</div>}
 {actor===chosen?.merchant&&o.status==='in-transit'&&action('標記備酒已送達','deliver')}
 {actor==='restaurant'&&o.status==='restaurant-receipt-pending'&&<div><p>送達與暫存分開確認，尚未交付主人。</p>{action('確認收到暫存酒品','receive')}</div>}
 {!gate&&actor==='restaurant'&&o.status==='age-check-pending'&&<div><h3>現場核對宴客聯絡人與年齡</h3><p>只限固定宴客聯絡人本人。餐廳人工核對本人與年滿十八歲；不收證件影像、號碼或完整生日。</p><Field label="驗齡結果"><select value={ageResult} onChange={e=>setAgeResult(e.target.value)}><option value="passed">通過</option><option value="failed">未通過</option></select></Field>{ageResult==='failed'&&<Field label="驗齡未通過原因"><textarea value={ageReason} onChange={e=>setAgeReason(e.target.value)}/></Field>}<button className="primary" onClick={()=>run({type:'age',passed:ageResult==='passed',reason:ageReason})}>{ageResult==='passed'?'已核對本人且年滿十八歲':'登錄驗齡未通過'}</button></div>}
 {!gate&&(actor==='restaurant'||actor==='host')&&['signature-pending','wine-payment-pending','collection-review-pending'].includes(o.status)&&<button className="primary" onClick={resume}>接續現場購買確認</button>}
 {actor==='restaurant'&&o.status==='handover-pending'&&o.checkout.legacy&&action('舊版：標記已交付主人','handover')}
 {actor==='host'&&o.status==='host-receipt-pending'&&o.checkout.legacy&&action('舊版：確認收取並完成服務','complete')}
 {actor==='platform'&&o.status==='cancel-refund-pending'&&<button className="primary" onClick={()=>confirm('全額模擬退還服務費',<p>退還主人 {money(o.serviceFee.amount)}，服務費淨收入0元。</p>,()=>run({type:'refund'}))}>模擬退還服務費 →</button>}
 {actor===chosen?.merchant&&o.status==='return-pending'&&<div><p>整筆酒品待取回。{o.returnReason==='identity-mismatch'?'姓名與本人不符':o.cancellationReason||o.age.reason}</p><ul>{chosen.items.map((w,i)=><li key={i}>{w.name} · {w.capacity} ml · {w.quantity} 瓶</li>)}</ul>{action('確認已取回酒品','return')}</div>}
 {terminal&&<div className={'outcome '+(o.status==='completed'?'positive':'')}><h3>{statusNames[o.status]}</h3>{o.status==='completed'?<p>服務已完成，可協助開酒。{o.checkout.completedBy==='collection'?'本筆由餐廳代收，主人依自身購買明細於餐廳結帳。':'酒款已模擬付款。'}</p>:o.status.startsWith('cancel')?<p>原因：{o.cancellationReason}。{o.status==='cancelled'?'已全額模擬退款500元，服務費淨收入0元。':'等待平台退款。'}</p>:<p>{o.cancellationReason||o.age.reason}。服務費500元維持已付不退，酒款未付款，不向主人加收取回費。{o.status==='returned'?'酒品已取回，服務未完成。':'待獲選酒商取回。'}</p>}</div>}
 </>}
 </section>
 {o&&(actor==='host'||chosen)&&<section className="card"><h2>{chosen?'本次搭配建議書':'兩家酒商，兩種搭配思路'}</h2><p>參考建議書供現場備酒；委託不成立酒類購買義務，現場核對本人與十八歲後揭示價金，再決定購買、減量或全部不買。</p><AlcoholWarning/><div className="proposal-grid">{(['merchant-a','merchant-b'] as const).filter(m=>!chosen||m===chosen.merchant).map(m=>{const p=chosen??o.proposals.find(p=>p.merchant===m&&p.submitted);return <article className="proposal-card" key={m}><h3>{actorNames[m]}</h3>{p?<><ul className="wine-list">{p.items.map((w,i)=><li key={i}><strong>{w.name}</strong><span>{w.capacity} ml · 建議 {w.quantity} 瓶{w.price!==undefined?' × '+money(w.price):''}</span></li>)}</ul><p>{p.reason}</p><p className="policy">{p.policy==='legacy'?'歷史建議書・沿用原預算規則':'符合設定預算範圍（含5%彈性）'}</p>{o.canSeePrices&&<dl><div><dt>建議酒款小計</dt><dd>{money(proposalMoney(p))}</dd></div><div><dt>運送費</dt><dd>{money(p.shipping!)}</dd></div></dl>}<p className="condition"><b>備酒條件</b> {p.delivery}<br/><b>備貨限制</b> {p.limits}</p>{!chosen&&actor==='host'&&<button className="primary" disabled={o.status!=='comparison-ready'} onClick={()=>confirm('委託此酒商安排現場備酒',<p>本次委託安排現場備酒，尚未成立酒類購買義務、不支付酒款。建議瓶數僅供備酒參考。現場核對本人與年滿十八歲後揭價，仍可減量或全部不買；委託後不提供重選酒商。</p>,()=>run({type:'select',merchant:m}))}>委託此酒商安排現場備酒</button>}</>:<p>等待完整建議書。</p>}</article>;})}</div></section>}
 {o?.receipt&&o.audience==='host'&&<section className="card" aria-label="自身購買明細"><h2>自身購買明細</h2><ul>{o.receipt.items.map((w,i)=><li key={i}>{w.name} {w.quantity} 瓶 × {money(w.price)}</li>)}</ul><p>酒款 {money(o.receipt.wineAmount)} ＋ 運送 {money(o.receipt.shipping)} ＝ {money(o.receipt.amount)}</p></section>}
 {o?.checkout.signature&&<section className="card" aria-label="簽名紀錄"><h2>簽名紀錄</h2><p>{o.checkout.signature.invalidatedAt?'簽名已失效':'已保存簽名'} · {o.checkout.signature.name} · {fmt(o.checkout.signature.at)}</p><p>當次明細 {money(o.checkout.signature.snapshot.amount)}</p>{!actor.startsWith('merchant-')&&<SignaturePreview strokes={o.checkout.signature.strokes}/>}</section>}
 {o?.checkout.legacy&&!o.checkout.signature&&<section className="card"><h2>舊版簽名紀錄</h2><p>沿用原付款紀錄，不補造手寫簽名或重複付款。</p></section>}
 {o&&<section className="card"><h2>每一步，都有紀錄</h2><ol className="timeline">{o.events.slice().reverse().map(e=><li key={e.id}><i/><div><strong>{e.summary}</strong><span>{actorNames[e.actor]} · {fmt(e.at)} Asia/Taipei</span></div></li>)}</ol></section>}
 </div><aside className="right-column"><section className="card finance"><h2>這一席的費用</h2><dl><div><dt>平台諮詢與協調服務費</dt><dd>{money(500)}</dd></div><div><dt>服務費狀態</dt><dd>{o?.serviceFee.refund?'已退款':o?.serviceFee.paid?'已付':'未付'}</dd></div>{o?.receipt&&<><div><dt>酒款與運送合計</dt><dd>{money(o.receipt.amount)}</dd></div><div><dt>含服務費總支出</dt><dd>{money(o.receipt.amount+500)}</dd></div></>}</dl><p>餐廳自身開瓶費等，依餐廳規定結帳。平台不代為計價。</p></section>
 {internal&&o?.commission&&<section className="card commission"><h2>餐廳分潤</h2><div className="commission-amount">{money(o.commission.amount)}</div><p>確認售出酒款 {money(o.commission.wineAmount)} × 10% · 待結算</p><p>不含運送、服務費及未購買備酒；由{actorNames[o.commission.merchant as Actor]}支付。</p></section>}
 {internal&&o?.collection&&<section className="card" aria-label="餐廳代收帳款"><h2>餐廳代收帳款</h2><p>餐廳應付酒商全額 {money(o.collection.amount)}，分潤另計、不抵銷。</p><p>{o.collection.status==='received'?'酒商已收清 '+money(o.collection.receivedAmount!)+' · '+fmt(o.collection.receivedAt!):'待付酒商，尚未收清'}</p>{actor===o.collection.merchant&&<button className="primary" onClick={()=>o.collection?.status==='received'?run({type:'collection-receive'}):confirm('確認已收到餐廳款項',<p>已收到全額 {money(o.collection!.amount)}，分潤另計。</p>,()=>run({type:'collection-receive'}))}>確認已收到餐廳款項</button>}</section>}
 {internal&&o?.unusedStock&&<section className="card" aria-label="未購買備酒取回"><h2>未購買備酒取回</h2><ul>{o.unusedStock.items.map((w,i)=><li key={i}>{w.name} · {w.capacity} ml · {w.quantity} 瓶</li>)}</ul>{o.unusedStock.status==='returned'?<p>已取回 · {actorNames[o.unusedStock.returnedBy!]} · {fmt(o.unusedStock.returnedAt!)}</p>:<p>待獲選酒商取回；已購買部分服務已完成。</p>}{actor===chosen?.merchant&&<button className="primary" onClick={()=>run({type:'unused-return'})}>確認已取回未購買備酒</button>}</section>}
 {o&&actor==='platform'&&<section className="card"><h2>平台服務費紀錄</h2><p>服務費淨收入 {money((o.serviceFee.paid?500:0)-o.serviceFee.refund)} · 退款 {money(o.serviceFee.refund)}</p></section>}
 <section className="demo-tools"><h2>展示工具</h2><p>載入將取代目前展示資料。</p>{([['blank','從空白需求開始'],['normal','重設正常起點'],['cancel','載入餐廳取消前'],['age','載入餐廳驗齡前']] as [Scenario,string][]).map(([which,label])=><button key={which} onClick={()=>reset(which)}>{label}</button>)}</section></aside></div>}
 <footer>宴遇 BANQUET & WINE <span>DEMO・所有付款均為模擬・資料只存於目前瀏覽器。無真實卡號或證件蒐集，無技術驗證本人到場。</span></footer></main></div>
 {modal&&<Modal title={modal.title} confirm={modal.confirm} onClose={()=>setModal(null)}>{modal.body}</Modal>}</div>;
}
