import {useEffect,useRef,useState,type ReactNode} from 'react';
import {actorNames,sampleRequest,sampleProposal,statusNames,transition,total,wineTotal,type Actor,type State,type Command,type Request,type Proposal} from '../domain/model';
import {scenario,type Scenario} from '../demo/scenarios';
import {load,save} from '../persistence/storage';
import {earliestBanquetDateTime} from '../domain/banquet-date';
const money=(n:number)=>'NT$ '+n.toLocaleString('zh-TW');
const fmt=(s:string)=>new Date(s).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false});
const numberValue=(s:string)=>s.trim()===''?NaN:Number(s);
const asInput=(v:number)=>Number.isFinite(v)?v:'';
type Run=(command:Command)=>void;
function Field({label,children,hint}:{label:string;children:ReactNode;hint?:string}){return <label className="field"><span>{label}</span>{children}{hint&&<small>{hint}</small>}</label>;}
function RequestForm({prefill,run}:{prefill:boolean;run:Run}){
 const [draft,setDraft]=useState<Request>(()=>prefill?sampleRequest():{date:'',restaurantId:'',guests:NaN,cuisine:'',budget:NaN,preference:'不限'});
 const [minimum,setMinimum]=useState(()=>earliestBanquetDateTime());
 const field=<K extends keyof Request>(key:K,value:Request[K])=>setDraft({...draft,[key]:value});
 return <form noValidate onSubmit={e=>{e.preventDefault();setMinimum(earliestBanquetDateTime());run({type:'create',request:draft});}}>
  <div className="section-title"><div><span className="eyebrow">YOUR BANQUET</span><h2>從一場宴席開始</h2></div><span className="subtle">六項需求 · 約 1 分鐘</span></div>
  <div className="form-grid">
   <Field label="宴客日期與時間" hint={`時區 Asia/Taipei；至少提前三個日曆日；最早 ${minimum.slice(0,10).replaceAll('-','/')} 00:00`}><input type="datetime-local" min={minimum} value={draft.date} onFocus={()=>setMinimum(earliestBanquetDateTime())} onChange={e=>field('date',e.target.value)}/></Field>
   <Field label="合作餐廳"><select value={draft.restaurantId} onChange={e=>field('restaurantId',e.target.value)}><option value="">請選擇餐廳</option><option value="restaurant-demo">暮光餐桌（示範合作餐廳）</option></select></Field>
   <Field label="宴客人數"><input type="number" min="1" step="1" placeholder="例如 12" value={asInput(draft.guests)} onChange={e=>field('guests',numberValue(e.target.value))}/></Field>
   <Field label="酒款總預算" hint="新臺幣；不含服務費、配送與餐廳費用"><input type="number" min="1" step="1" placeholder="例如 6500" value={asInput(draft.budget)} onChange={e=>field('budget',numberValue(e.target.value))}/></Field>
   <Field label="菜色或料理類型"><textarea className="cuisine-input" rows={3} placeholder="例如 前菜：沙拉、主菜：牛排（可按 Enter 分行）" value={draft.cuisine} onChange={e=>field('cuisine',e.target.value)}/></Field>
   <Field label="飲酒偏好"><select value={draft.preference} onChange={e=>field('preference',e.target.value)}>{['不限','紅白酒皆可','偏好紅酒','偏好白酒','氣泡酒'].map(x=><option key={x}>{x}</option>)}</select></Field>
  </div><div className="form-footer"><span>送出後由平台協調兩家酒商提案</span><button className="primary" type="submit">提交宴客需求 <b>→</b></button></div>
 </form>;
}
function ProposalForm({merchant,existing,run}:{merchant:Proposal['merchant'];existing:Proposal|undefined;run:Run}){
 const [p,setP]=useState<Proposal>(()=>existing?structuredClone(existing):{merchant,items:[{name:'',capacity:NaN,quantity:NaN,price:NaN}],shipping:NaN,restaurantFee:300,reason:'',delivery:'',limits:'',submitted:false});
 const update=(key:keyof Proposal,value:unknown)=>setP({...p,[key]:value});
 return <form noValidate onSubmit={e=>{e.preventDefault();run({type:'proposal-submit',proposal:p});}}>
  <div className="section-title"><h2>{actorNames[merchant]}的搭配提案</h2><button type="button" className="secondary" onClick={()=>setP(sampleProposal(merchant))}>套用示範草稿</button></div>
  {p.items.map((w,i)=><div className="wine-fields" key={i}><h3>酒款 {i+1}</h3><div className="form-grid">
   {(['name','capacity','quantity','price'] as const).map(key=><Field key={key} label={({'name':'酒款名稱',capacity:'容量（ml）',quantity:'瓶數',price:'單價（元）'}[key])+' '+(i+1)}><input type={key==='name'?'text':'number'} value={key==='name'?w.name:asInput(w[key])} onChange={e=>setP({...p,items:p.items.map((x,j)=>j===i?{...x,[key]:key==='name'?e.target.value:numberValue(e.target.value)}:x)})}/></Field>)}
  </div>{p.items.length>1&&<button type="button" className="link-button" onClick={()=>update('items',p.items.filter((_,j)=>j!==i))}>移除酒款 {i+1}</button>}</div>)}
  <button type="button" className="secondary" onClick={()=>update('items',[...p.items,{name:'',capacity:NaN,quantity:NaN,price:NaN}])}>＋ 新增酒款</button>
  <div className="form-grid proposal-extra">
   <Field label="配送費（元）" hint="免運也請填 0"><input type="number" value={asInput(p.shipping)} onChange={e=>update('shipping',numberValue(e.target.value))}/></Field>
   <Field label="餐廳費用（元）" hint="示範政策：現場另收"><input readOnly value="300"/></Field>
   <Field label="搭配理由"><textarea value={p.reason} onChange={e=>update('reason',e.target.value)}/></Field>
   <Field label="配送條件"><textarea value={p.delivery} onChange={e=>update('delivery',e.target.value)}/></Field>
   <Field label="供貨限制" hint="無限制亦須明列"><input value={p.limits} onChange={e=>update('limits',e.target.value)}/></Field>
  </div><div className="form-footer"><button type="button" className="secondary" onClick={()=>run({type:'proposal-save',proposal:p})}>保存草稿</button><button type="submit" className="primary">送出提案 →</button></div>
 </form>;
}
function Modal({title,children,confirm,onClose}:{title:string;children:ReactNode;confirm:()=>void;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{ref.current?.showModal();},[]);
 return <dialog ref={ref} onCancel={e=>{e.preventDefault();onClose();}} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();onClose();}}}><div className="dialog-inner"><span className="eyebrow">PLEASE CONFIRM</span><h2>{title}</h2><div>{children}</div><div className="dialog-actions"><button onClick={onClose} className="secondary">返回</button><button autoFocus className="primary" onClick={()=>{confirm();onClose();}}>確認</button></div></div></dialog>;
}
export function App(){
 const [boot]=useState(()=>{try{return load(window.localStorage);}catch{return {state:scenario('normal'),error:'瀏覽器儲存不可用，請恢復後確認重設。'};}});
 const [state,setState]=useState<State>(boot.state), stateRef=useRef(state);
 const [recovery,setRecovery]=useState(boot.error),[error,setError]=useState(''),[notice,setNotice]=useState(''),[epoch,setEpoch]=useState(0);
 const [modal,setModal]=useState<{title:string;body:ReactNode;confirm:()=>void}|null>(null);
 const [time,setTime]=useState('宴客當日 15:00–17:00'),[cancelReason,setCancelReason]=useState(''),[ageResult,setAgeResult]=useState('passed'),[ageReason,setAgeReason]=useState(''),[cost,setCost]=useState('');
 const {actor,order:o}=state;
 const commit=(next:State,message:string)=>{try{save(window.localStorage,next);stateRef.current=next;setState(next);setError('');setNotice(message);return true;}catch{setError('保存失敗，請確認瀏覽器儲存權限後重試；保留上一個已確認保存的狀態。');setNotice('');return false;}};
 const run:Run=c=>{if(recovery){setError('請先確認重設，避免覆寫無法讀取的舊資料。');return;}try{const next=transition(stateRef.current,stateRef.current.actor,c);if(next===stateRef.current){setNotice('此動作已完成，保留原有結果。');return;}commit(next,'已保存操作結果。');}catch(e){setError(e instanceof Error?e.message:'操作失敗');setNotice('');}};
 const confirm=(title:string,body:ReactNode,action:()=>void)=>setModal({title,body,confirm:action});
 const reset=(which:Scenario)=>confirm('取代目前展示資料？',<p>此操作將以新情境取代目前訂單、付款、退款、退回與分潤資料。只影響本展示應用。</p>,()=>{if(commit(scenario(which),'已載入新情境。')){setRecovery('');setEpoch(x=>x+1);setAgeResult('passed');setAgeReason('');setCancelReason('');setCost('');}});
 const changeActor=(next:Actor)=>{if(recovery)return;commit({...stateRef.current,actor:next},'已切換示範身分，訂單資料保留。');};
 const terminal=!!o&&['completed','cancelled','cancel-refund-pending','return-pending','returned'].includes(o.status);
 const chosen=o?.selected;
 const requestText=o?`${o.request.date.replace('T',' ')}（Asia/Taipei） · ${o.request.guests} 位 · 暮光餐桌`:'';
 const roleHelp:Record<Actor,string>={host:'填寫需求、比較酒商提案，並在現場確認購買及收取。',platform:'人工邀請酒商、追蹤進度，以及處理退款與平台成本。','merchant-a':'編輯自己的提案，並處理選定訂單的配送與取回。','merchant-b':'編輯自己的提案，並處理選定訂單的配送與取回。',restaurant:'確認收貨安排、現場驗齡，以及將酒款交付主人。'};
 const nextRole:Partial<Record<NonNullable<typeof o>['status'],Actor>>={'service-fee-pending':'host','invitation-pending':'platform','proposals-pending':'merchant-a','comparison-ready':'host','restaurant-pending':'restaurant','delivery-ready':chosen?.merchant,'in-transit':chosen?.merchant,'restaurant-receipt-pending':'restaurant','age-check-pending':'restaurant','purchase-pending':'host','wine-payment-pending':'host','handover-pending':'restaurant','host-receipt-pending':'host','cancel-refund-pending':'platform','return-pending':chosen?.merchant};
 const badge=<span className={'status-badge '+(o?.status==='completed'?'success':terminal?'warning':'')}>{o?statusNames[o.status]:'尚未建立需求'}</span>;
 const action=(label:string,type:Command['type'])=><button className="primary" onClick={()=>run({type} as Command)}>{label} →</button>;
 return <div className="shell">
  <aside className="sidebar"><a className="brand" href="#main"><svg viewBox="0 0 32 40" aria-hidden="true"><path d="M7 3h18l-2 15q-1 8-7 8t-7-8L7 3Zm9 23v11m-8 0h16M9 14h14"/></svg><div>宴遇<span>BANQUET & WINE</span></div></a><div className="sidebar-label">宴席協調工作區</div><div className="nav-active">◈ <span>我的宴客服務</span><b>01</b></div><div className="sidebar-line"/><div className="sidebar-label">一次看懂服務流程</div><ol className="journey">{['提交宴客需求','付服務費・邀請酒商','比較提案・選定意向','餐廳安排・配送收貨','現場驗齡・購買付款','交付主人・確認收取'].map((x,i)=><li key={x}><span>{String(i+1).padStart(2,'0')}</span>{x}</li>)}</ol><div className="sidebar-note"><span>FOR YOUR SPECIAL EVENING</span><p>好酒，讓相聚<br/>多一點餘韻。</p><small>課程展示作品<br/>虛構合作資料・無真實交易</small></div></aside>
  <div className="workspace"><header className="topbar"><span>宴客服務 <span className="crumb">／ 工作區</span></span><div><span className="demo-tag">DEMO 模擬模式</span><span className="current-actor">{actorNames[actor]}</span></div></header>
  <main id="main"><div className="page-heading"><div><div className="eyebrow">A THOUGHTFULLY PAIRED EVENING</div><h1>讓每一席，恰逢好酒。</h1><p>從選酒建議到現場交付，讓每一步都有著落。</p></div><div className="date-note">宴客酒款媒合平台<span>同一瀏覽器・資料持續保存</span></div></div>
  <section className="role-switch" aria-label="示範身分"><div className="role-label">目前示範身分<small>切換角色接續同一筆服務</small></div><div className="role-buttons">{(['host','platform','merchant-a','merchant-b','restaurant'] as Actor[]).map(a=><button key={a} className={actor===a?'active':''} aria-pressed={actor===a} onClick={()=>changeActor(a)}>{actorNames[a]}</button>)}</div></section>
  {recovery&&<div role="alert" className="error">{recovery} <button onClick={()=>reset('normal')}>確認重設展示資料</button></div>}
  {error&&<div role="alert" className="error">{error}</div>}{notice&&<div role="status" className="notice">✓ {notice}</div>}
  <div className="content-grid"><div className="main-column">
   <section className="card order-head"><div className="section-title"><div><span className="eyebrow">SERVICE OVERVIEW</span><h2>{o?'本次宴客服務':'準備一場值得回味的宴席'}</h2></div>{badge}</div>{o?<><p className="request-line">{requestText}</p><div className="request-facts"><span className="cuisine-fact">料理 <b>{o.request.cuisine}</b></span><span>酒款預算 <b>{money(o.request.budget)}</b></span><span>偏好 <b>{o.request.preference}</b></span></div><small className="subtle">服務編號 {o.id} · {chosen?`協調酒商：${actorNames[chosen.merchant]}（已鎖定條件）`:'尚未選定協調酒商'}</small></>:<p>先告訴我們宴客需求，再由兩家示範酒商提出搭配建議。</p>}</section>
   <section className="card current-task"><div className="section-title"><div><span className="eyebrow">YOUR NEXT STEP</span><h2>{actorNames[actor]}的當前待辦</h2></div><span className="step-symbol">↗</span></div><p className="role-description">{roleHelp[actor]}</p>
   {!o?(actor==='host'?<RequestForm key={epoch} prefill={state.prefill} run={run}/>:<div className="waiting">等待主人建立宴客需求。切換至宴客主人開始。</div>):<>
    {actor==='host'&&o.status==='service-fee-pending'&&<div className="task-block"><h3>先啟動這一席的選酒服務</h3><p>模擬服務費 <strong>{money(500)}</strong>，收款方：平台。</p><p className="policy">餐廳無法配合且服務無法繼續：全額退服務費。已提供建議與配送後驗齡未通過：服務費不退，亦不另收罰款、退回運費或酒款。</p><button className="primary" onClick={()=>confirm('模擬支付平台服務費',<p>收款方：平台<br/>服務費：{money(500)}<br/>僅為模擬付款，不收集信用卡資料。</p>,()=>run({type:'service-pay'}))}>模擬支付服務費 →</button></div>}
    {actor==='platform'&&o.status==='invitation-pending'&&<div className="task-block"><p>服務費已付，準備邀請兩家酒商為此宴席提案。</p>{action('邀請兩家酒商','invite')}</div>}
    {(actor==='merchant-a'||actor==='merchant-b')&&['proposals-pending','comparison-ready'].includes(o.status)&&<ProposalForm key={actor+o.id+epoch} merchant={actor} existing={o.proposals.find(p=>p.merchant===actor)} run={run}/>}
    {actor==='host'&&['proposals-pending','comparison-ready'].includes(o.status)&&<p className="waiting">{o.status==='comparison-ready'?'兩家提案已到齊。請在下方比較並選定一家酒商。':'等待兩家有效提案；可先閱讀已提交提案，兩家到齊後才能選定。'}</p>}
    {actor==='restaurant'&&o.status==='restaurant-pending'&&<div className="task-block"><Field label="可收貨時段"><input value={time} onChange={e=>setTime(e.target.value)}/></Field><button className="primary" onClick={()=>run({type:'arrange',time})}>確認收貨安排 →</button><details className="exception"><summary>無法配合，服務無法繼續</summary><Field label="無法配合原因"><textarea value={cancelReason} onChange={e=>setCancelReason(e.target.value)}/></Field><button className="danger" onClick={()=>confirm('取消服務並進入待退款',<p>原因：{cancelReason||'尚未填寫'}<br/>取消後由平台全額模擬退還服務費，不能恢復正常履約。</p>,()=>run({type:'cancel',reason:cancelReason}))}>取消服務</button></details></div>}
    {actor===chosen?.merchant&&o.status==='delivery-ready'&&<div className="task-block"><p>餐廳已確認：{o.arrangement}</p>{action('標記已出貨','ship')}</div>}
    {actor===chosen?.merchant&&o.status==='in-transit'&&action('標記已送達','deliver')}
    {actor==='restaurant'&&o.status==='restaurant-receipt-pending'&&<div className="task-block"><p>酒商已送達，請獨立確認餐廳收貨。此步僅代表暫存。</p>{action('確認餐廳收貨','receive')}</div>}
    {actor==='restaurant'&&o.status==='age-check-pending'&&<div className="task-block"><h3>現場查驗主人年齡</h3><p>僅記錄查驗結果，不收集證件影像、證件號碼或完整生日。</p><Field label="驗齡結果"><select value={ageResult} onChange={e=>setAgeResult(e.target.value)}><option value="passed">通過</option><option value="failed">未通過</option></select></Field>{ageResult==='failed'&&<Field label="驗齡未通過原因"><textarea value={ageReason} onChange={e=>setAgeReason(e.target.value)}/></Field>}<button className="primary" onClick={()=>run({type:'age',passed:ageResult==='passed',reason:ageReason})}>登錄驗齡結果 →</button></div>}
    {actor==='host'&&o.status==='purchase-pending'&&<div className="task-block"><p>餐廳已登錄驗齡通過。請於現場確認依鎖定提案購買，再進行模擬付款。</p>{action('確認現場購買','purchase')}</div>}
    {actor==='host'&&o.status==='wine-payment-pending'&&chosen&&<div className="task-block"><p>模擬付款給 {actorNames[chosen.merchant]}</p><p>酒款 {money(wineTotal(chosen))} ＋ 配送費 {money(chosen.shipping)}<br/>合計 <strong>{money(wineTotal(chosen)+chosen.shipping)}</strong></p><p className="subtle">服務費已獨立支付；餐廳費用現場另收，不併入本筆收款。</p><button className="primary" onClick={()=>confirm('模擬支付酒款與配送費',<p>收款方：{actorNames[chosen.merchant]}<br/>酒款 {money(wineTotal(chosen))} ＋ 配送 {money(chosen.shipping)}<br/>合計 {money(wineTotal(chosen)+chosen.shipping)}<br/>不呼叫真實支付。</p>,()=>run({type:'wine-pay'}))}>模擬支付酒款 →</button></div>}
    {actor==='restaurant'&&o.status==='handover-pending'&&action('標記已交付主人','handover')}
    {actor==='host'&&o.status==='host-receipt-pending'&&action('確認收取並完成服務','complete')}
    {actor==='platform'&&o.status==='cancel-refund-pending'&&<div className="task-block"><p>取消原因：{o.cancellationReason}</p><button className="primary" onClick={()=>confirm('全額模擬退還服務費',<p>退還主人 {money(o.serviceFee.amount)}，淨服務費收入將為 0 元。</p>,()=>run({type:'refund'}))}>模擬退還服務費 →</button></div>}
    {actor===chosen?.merchant&&o.status==='return-pending'&&<div className="task-block"><p>驗齡未通過：{o.age.reason}。請從餐廳實際取回後再確認。</p>{action('確認已取回酒品','return')}</div>}
    {actor==='platform'&&['return-pending','returned'].includes(o.status)&&<div className="task-block"><Field label="平台負擔退回運費（元）" hint="未填顯示待登錄；不會向主人加收"><input type="number" min="0" value={cost} onChange={e=>setCost(e.target.value)}/></Field><button className="primary" onClick={()=>run({type:'cost',amount:numberValue(cost)})}>登錄退回成本 →</button></div>}
    {terminal&&<div className={'outcome '+(o.status==='completed'?'positive':'')}><h3>{statusNames[o.status]}</h3>{o.status==='completed'?<p>謝謝您確認收取。服務已完成；餐廳分潤仍為待結算，兩者分開追蹤。</p>:o.status.startsWith('cancel')?<p>原因：{o.cancellationReason}。{o.status==='cancelled'?'已全額模擬退款 500 元，淨服務費收入 0 元。':'等待平台全額退款。'} 酒款未付款，未產生分潤。</p>:<p>驗齡未通過：{o.age.reason}。服務費 500 元維持已付不退；酒款未付款，主人新增應付 0 元，未產生分潤。退回運費由平台負擔：{o.returnCost===null?'待登錄':money(o.returnCost)}。{o.status==='return-pending'?'等待選定酒商確認取回。':'酒品已取回，服務未完成。'}</p>}</div>}
    {!terminal&&nextRole[o.status]&&actor!==nextRole[o.status]&&!(o.status==='proposals-pending'&&(actor==='merchant-a'||actor==='merchant-b'))&&<div className="waiting">下一步由 {actorNames[nextRole[o.status]!]} 操作：{statusNames[o.status]}。目前身分無法執行此步驟。</div>}
   </>}
   </section>
   {o&&(actor==='host'||chosen)&&<section className="card"><div className="section-title"><div><span className="eyebrow">WINE PROPOSALS</span><h2>{chosen?'已鎖定的協調條件':'兩家酒商，兩種搭配思路'}</h2></div><span className="subtle">選定意向 ≠ 現場購買</span></div><div className="proposal-grid">{(['merchant-a','merchant-b'] as const).filter(m=>!chosen||m===chosen.merchant).map(m=>{const p=chosen??o.proposals.find(p=>p.merchant===m&&p.submitted);return <article key={m} className={'proposal-card '+(chosen?'selected':'')}><div className="proposal-heading"><h3>{actorNames[m]}</h3><span>{chosen?'已選定・條件鎖定':p?'提案已送出':'待回覆'}</span></div>{p?<><ul className="wine-list">{p.items.map((w,i)=><li key={i}><strong>{w.name}</strong><span>{w.capacity} ml · {w.quantity} 瓶 × {money(w.price)}</span></li>)}</ul><p>{p.reason}</p><dl><div><dt>酒款小計</dt><dd>{money(wineTotal(p))}</dd></div><div><dt>配送費（付酒商）</dt><dd>{money(p.shipping)}</dd></div><div><dt>餐廳費用（現場另收）</dt><dd>{money(p.restaurantFee)}</dd></div><div><dt>平台服務費（已付）</dt><dd>{money(500)}</dd></div><div className="total"><dt>估計總支出</dt><dd>{money(total(p))}</dd></div><div><dt>後續估計支出</dt><dd>{money(total(p)-500)}</dd></div></dl>{wineTotal(p)>o.request.budget&&<p className="budget-warning">超出酒款預算，仍可比較選定。</p>}<p className="condition"><b>配送條件</b> {p.delivery}<br/><b>供貨限制</b> {p.limits}</p>{!chosen&&actor==='host'&&<button className="primary" disabled={o.status!=='comparison-ready'} onClick={()=>confirm('選定此酒商為協調意向',<p>選定後鎖定需求、價格及兩份提案，無法重選。這一步不代表購買，不會支付酒款。</p>,()=>run({type:'select',merchant:m}))}>選定{actorNames[m]}</button>}</>:<p className="waiting">等待受邀酒商送出完整提案。</p>}</article>;})}</div></section>}
   {o&&<section className="card"><div className="section-title"><div><span className="eyebrow">SERVICE TIMELINE</span><h2>每一步，都有紀錄</h2></div><span className="subtle">{o.events.length} 筆已接受操作</span></div><ol className="timeline">{o.events.slice().reverse().map(e=><li key={e.id}><i/><div><strong>{e.summary}</strong><span>{actorNames[e.actor]} · {fmt(e.at)} Asia/Taipei</span></div></li>)}</ol></section>}
  </div><aside className="right-column"><section className="card finance"><span className="eyebrow">COST AT A GLANCE</span><h2>這一席的費用</h2><p className="subtle">所有金額均為新臺幣・示範用途</p><dl><div><dt>平台服務費</dt><dd>{money(500)}</dd></div><div><dt>付款狀態</dt><dd>{o?.serviceFee.refund?'已退款':o?.serviceFee.paid?'已付':'未付'}</dd></div><div><dt>酒款收款方</dt><dd>{chosen?actorNames[chosen.merchant]:'尚未選定'}</dd></div><div><dt>酒商模擬收款</dt><dd>{o?.winePayment?.paid?money(o.winePayment.amount):'未付款'}</dd></div><div><dt>餐廳費用</dt><dd>300 元・現場另收</dd></div><div className="total"><dt>估計總支出</dt><dd>{chosen?money(total(chosen)):'待提案'}</dd></div></dl><div className="finance-note">平台只收服務費，不收酒款佣金。分潤不加到主人支出。</div></section>
   <section className="card commission"><span className="eyebrow">RESTAURANT SHARE</span><h2>餐廳分潤</h2>{o?.commission?<><div className="commission-amount">{money(o.commission.amount)}</div><span className="status-badge">待結算</span><p>{actorNames[o.commission.merchant as Actor]} 應付合作餐廳<br/>酒款成交 {money(o.commission.wineAmount)} × 示範 10%</p><small>付款紀錄 {o.commission.orderId}<br/>P0 僅展示待結算，未進行分潤支付或收款。</small></>:<><div className="empty-mark">—</div><p>未成交，未產生分潤</p><small>僅在酒款模擬付款成功後，建立唯一待結算紀錄。</small></>}</section>
   {o&&actor==='platform'&&<section className="card"><h2>平台收入與成本</h2><dl><div><dt>服務費淨收入</dt><dd>{money((o.serviceFee.paid?500:0)-o.serviceFee.refund)}</dd></div><div><dt>服務費退款</dt><dd>{money(o.serviceFee.refund)}</dd></div><div><dt>退回運費成本</dt><dd>{['return-pending','returned'].includes(o.status)?o.returnCost===null?'待登錄':money(o.returnCost):'不適用'}</dd></div></dl><small>退回成本另列，不代表完整企業獲利。</small></section>}
   <section className="demo-tools"><span className="eyebrow">DEMO TOOLS</span><h2>展示工具</h2><p>載入或重設會取代目前展示資料。</p>{([['blank','從空白需求開始'],['normal','重設正常起點'],['cancel','載入餐廳取消前'],['age','載入餐廳驗齡前']] as [Scenario,string][]).map(([which,label])=><button key={which} onClick={()=>reset(which)}>{label}<span>↗</span></button>)}</section>
  </aside></div><footer>宴遇 BANQUET & WINE <span>課程展示・所有付款均為模擬・資料僅存於目前瀏覽器</span></footer></main></div>
  {modal&&<Modal title={modal.title} confirm={modal.confirm} onClose={()=>setModal(null)}>{modal.body}</Modal>}
 </div>;
}
