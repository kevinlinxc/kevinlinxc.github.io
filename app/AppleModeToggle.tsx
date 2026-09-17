'use client';
import {useEffect,useRef} from 'react';

export default function AppleModeToggle({active,onToggle}:{active:boolean;onToggle:()=>void}){
 const icon=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
  const node=icon.current;if(!node)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let frame=0;
  const draw=()=>{frame=0;node.style.transform=`rotate(${reduced.matches?0:window.scrollY*.12}deg)`;};
  const scroll=()=>{if(!frame)frame=requestAnimationFrame(draw);};
  draw();window.addEventListener('scroll',scroll,{passive:true});reduced.addEventListener('change',scroll);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',scroll);reduced.removeEventListener('change',scroll);};
 },[]);
 return <button type="button" className="apple-mode-toggle" data-dive-toggle aria-label="Explore 3D mode" aria-pressed={active} title={active?'Return to 2D':'Explore in 3D'} onClick={onToggle}>
  <span ref={icon} className="apple-mode-icon" aria-hidden="true">
   <span className="apple-mode-whole"/>
   <span className="apple-mode-eaten"/>
  </span>
 </button>;
}
