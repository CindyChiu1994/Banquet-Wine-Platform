import {useEffect,useRef,type PointerEvent} from 'react';
import type {Strokes,Point} from '../domain/model';
export function SignaturePad({value,onChange}:{value:Strokes;onChange:(strokes:Strokes)=>void}){
 const canvas=useRef<HTMLCanvasElement>(null),active=useRef<number|null>(null),latest=useRef(value);latest.current=value;
 useEffect(()=>{const c=canvas.current,ctx=c?.getContext('2d');if(!c||!ctx)return;ctx.clearRect(0,0,1000,300);ctx.strokeStyle='#40352e';ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';for(const stroke of value){ctx.beginPath();stroke.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();}},[value]);
 const point=(e:PointerEvent<HTMLCanvasElement>):Point=>{const r=e.currentTarget.getBoundingClientRect();return {x:Math.max(0,Math.min(1000,(e.clientX-r.left)*1000/r.width)),y:Math.max(0,Math.min(300,(e.clientY-r.top)*300/r.height))};};
 return <canvas ref={canvas} width={1000} height={300} aria-label="手寫簽名" role="img" className="signature-pad"
  onPointerDown={e=>{if(active.current!==null)return;e.preventDefault();active.current=e.pointerId;e.currentTarget.setPointerCapture(e.pointerId);const p=point(e);const n=[...latest.current,[p]];latest.current=n;onChange(n);}}
  onPointerMove={e=>{if(active.current!==e.pointerId)return;e.preventDefault();const n=latest.current.map((s,i)=>i===latest.current.length-1?[...s,point(e)]:s);latest.current=n;onChange(n);}}
  onPointerUp={e=>{if(active.current===e.pointerId){active.current=null;e.currentTarget.releasePointerCapture(e.pointerId);}}}
  onPointerCancel={()=>{active.current=null;}}/>;
}
export function SignaturePreview({strokes}:{strokes:Strokes}){
 return <svg role="img" aria-label="簽名原圖" viewBox="0 0 1000 300" className="signature-preview">{strokes.map((s,i)=><polyline key={i} points={s.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke="#40352e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>)}</svg>;
}
