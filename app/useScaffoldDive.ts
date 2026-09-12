'use client';
import {useEffect,useRef,useState} from 'react';

export type DiveState={amount:number;x:number;y:number;speed:number;entry:number;travel:number;portrait?:{x:number;y:number;radius:number}};
const clamp=(value:number,min=-1,max=1)=>Math.max(min,Math.min(max,value));
export function useScaffoldDive(){
 const root=useRef<HTMLElement>(null),overlay=useRef<HTMLDivElement>(null);
 const dive=useRef<DiveState>({amount:0,x:0,y:0,speed:0,entry:0,travel:0});
 const toggle=useRef(()=>{});
 const [active,setActive]=useState(false);
 useEffect(()=>{
  const page=root.current,layer=overlay.current;if(!page||!layer)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let target=0,tx=0,ty=0,energy=0,frame=0,last=performance.now(),pointerId:number|null=null;
  let originX=0,originY=0,mouseX=.5,mouseY=.5,dragging=false,pinned=false,suppressUntil=0,disposed=false;
  let layoutDirty=false,maxScroll=0,portraitDocument:{x:number;y:number;radius:number}|undefined;
  const scene=layer.parentElement!,periphery=page.querySelector<HTMLElement>('.dive-periphery')!;
  const styleCache=new WeakMap<HTMLElement,Map<string,string>>();
  const style=(node:HTMLElement,key:string,value:string)=>{
   value=value.replace(/-?\d+\.\d+/g,number=>Number(number).toFixed(3));
   let values=styleCache.get(node);if(!values){values=new Map();styleCache.set(node,values);}
   if(values.get(key)!==value){node.style.setProperty(key,value);values.set(key,value);}
  };
  const cleanCopy=(node:HTMLElement)=>{
   const copy=node.cloneNode(true) as HTMLElement;
   [copy,...copy.querySelectorAll<HTMLElement>('*')].forEach(child=>{child.removeAttribute('id');child.removeAttribute('data-field-card');child.removeAttribute('data-dive-trigger');if(child.matches('a,button,[tabindex]'))child.setAttribute('tabindex','-1');});
   copy.querySelectorAll('img').forEach(image=>{image.loading='eager';});
   return copy;
  };
  const copies=new Map<HTMLElement,{surface:HTMLDivElement;opacity:string}>();
  const clear=()=>{copies.forEach(({surface,opacity},node)=>{node.style.opacity=opacity;styleCache.delete(node);surface.remove();});copies.clear();};
  const capture=()=>{
   // Read document-space geometry once on entry/resize, never during scroll travel.
   const scroll=window.scrollY;
   const boxes=[...page.querySelectorAll<HTMLElement>('[data-field-card],.profile-portrait,.profile-copy,.gallery-header,.collection-heading,.gallery-footer')]
    .filter(node=>!layer.contains(node)).map(node=>({node,rect:node.getBoundingClientRect(),
     pieces:node.hasAttribute('data-field-card')?[...node.querySelectorAll<HTMLElement>('.gallery-preview,.gallery-date,h3,.gallery-description,.gallery-project-note,.gallery-card-action,.gallery-clips')].map(piece=>{const css=getComputedStyle(piece);return {node:piece,rect:piece.getBoundingClientRect(),font:css.font,letterSpacing:css.letterSpacing,color:css.color};}):[]
    })).filter(({rect})=>rect.width>0);
   maxScroll=Math.max(0,document.documentElement.scrollHeight-innerHeight);
   clear();
   for(const {node,rect,pieces} of boxes){
    const portrait=node.classList.contains('profile-portrait'),type=node.classList.contains('profile-copy'),card=node.hasAttribute('data-field-card');
    const heading=node.classList.contains('collection-heading'),header=node.classList.contains('gallery-header');
    const surface=document.createElement('div');surface.className=`dive-surface${portrait?' dive-portrait':type?' dive-type':card?' dive-project':heading?' dive-collection':header?' dive-navigation':''}`;
    surface.style.setProperty('--surface-depth',type?'65px':`${35+(copies.size%3)*30}px`);
    Object.assign(surface.style,{left:`${rect.left}px`,top:`${rect.top+scroll}px`,width:`${rect.width}px`,height:`${rect.height}px`});
    if(card){
     const backing=document.createElement('div');backing.className='dive-card-backing';surface.appendChild(backing);
     for(const {node:piece,rect:bounds,font,letterSpacing,color} of pieces){
      const image=piece.classList.contains('gallery-preview'),title=piece.tagName==='H3',date=piece.classList.contains('gallery-date');
      const pieceLayer=document.createElement('div');pieceLayer.className=`dive-piece${image?' dive-piece-image':title?' dive-piece-title':''}`;
      // Each piece is a direct sibling in the 3D space, without a full-card wrapper.
      Object.assign(pieceLayer.style,{left:`${bounds.left-rect.left}px`,top:`${bounds.top-rect.top}px`,width:`${bounds.width}px`,height:`${bounds.height}px`});
      pieceLayer.style.setProperty('--piece-depth',`${image?20:title?30:date?24:12}px`);
      const copy=cleanCopy(piece);Object.assign(copy.style,{width:'100%',height:'100%',margin:'0',font,letterSpacing,color});
      pieceLayer.appendChild(copy);surface.appendChild(pieceLayer);
     }
    }else if(!portrait){
     const plane=document.createElement('div');plane.className='dive-plane dive-base';
     const copy=cleanCopy(node);
     if(type){for(const tag of ['h1','p']){const original=node.querySelector(tag),cloned=copy.querySelector<HTMLElement>(tag);if(original&&cloned)cloned.style.fontSize=getComputedStyle(original).fontSize;}}
     if(heading){copy.querySelectorAll('h2,button').forEach((label,index)=>{
      const word=document.createElement('span');word.className='dive-letter-line';
      Array.from(label.textContent??'').forEach((letter,i)=>{const span=document.createElement('span');span.textContent=letter===' '?'\u00a0':letter;span.style.setProperty('--letter-depth',`${(i%3)*18+index*22}px`);word.appendChild(span);});label.replaceChildren(word);
     });}
     Object.assign(copy.style,{width:'100%',height:'100%',margin:'0',transform:'none',opacity:'1',flex:'none'});
     plane.appendChild(copy);surface.appendChild(plane);
    }
    layer.appendChild(surface);copies.set(node,{surface,opacity:node.style.opacity});
    if(portrait)portraitDocument={x:(rect.left+rect.width/2-innerWidth/2)*2/innerHeight,y:rect.top+scroll+rect.height/2,radius:rect.width/innerHeight};
   }
  };
  const draw=(now:number)=>{
   frame=0;if(disposed)return;
   if(now-last<15){frame=requestAnimationFrame(draw);return;}
   const dt=Math.min((now-last)/1000,.05);last=now;
   const s=dive.current,k=1-Math.exp(-dt*7),strength=reduced.matches?.10:1;
   s.amount+=(target-s.amount)*(1-Math.exp(-dt*(target?4.5:7)));
   s.x+=(tx-s.x)*k;s.y+=(ty-s.y)*k;s.speed+=(energy-s.speed)*k;energy*=Math.exp(-dt*9);
   if(target&&s.amount>.999)s.amount=1;
   s.entry=target?Math.sin(Math.PI*s.amount)*strength:0;
   // Downward travel starts in the bottom quarter; upward travel keeps its smaller edge zone.
   const edge=mouseY<.15?-Math.pow((.15-mouseY)/.15,2):mouseY>.75?Math.pow((mouseY-.75)/.25,2):0;
   const velocity=target&&!reduced.matches?edge*innerHeight*1.35*s.amount:0;
   const nextScroll=clamp(window.scrollY+velocity*dt,0,maxScroll);
   s.travel+=(Math.abs(nextScroll-window.scrollY)/Math.max(dt, .001)/innerHeight-s.travel)*k;
   if(Math.abs(nextScroll-window.scrollY)>.1){window.scrollTo({top:nextScroll,behavior:'instant'});}
   if(layoutDirty&&s.amount>.001){capture();layoutDirty=false;}
   if(!target&&s.amount<.002){s.amount=0;s.x=0;s.y=0;s.speed=0;s.entry=0;s.travel=0;clear();page.removeAttribute('data-diving');}
   style(scene,'--dive',s.amount.toFixed(3));
   style(scene,'--dive-scroll',`${(-window.scrollY).toFixed(1)}px`);
   if(portraitDocument)dive.current.portrait={x:portraitDocument.x,y:1-(portraitDocument.y-window.scrollY)*2/innerHeight,radius:portraitDocument.radius};
   style(scene,'--dive-yaw',`${s.x*s.amount*strength*76.5}deg`);
   style(scene,'--dive-pitch',`${-s.y*s.amount*strength*76.5}deg`);
   style(scene,'--dive-pan-x',`${s.x*s.amount*strength*45}px`);
   style(scene,'--dive-pan-y',`${s.y*s.amount*strength*35}px`);
   style(scene,'--dive-camera-z',`${(-170*s.amount-240*s.entry)*strength}px`);
   style(scene,'--dive-perspective',`${1100-480*s.amount}px`);
   style(scene,'--dive-split',`${s.amount*(9+s.speed*22+12*s.entry)*strength}px`);
   style(scene,'--dive-glitch',`${Math.sin(now*.012)*s.speed*s.amount*strength*8}px`);
   style(periphery,'--dive-focus-x',`${mouseX*100}%`);
   style(periphery,'--dive-focus-y',`${mouseY*100}%`);
   style(periphery,'--dive',s.amount.toFixed(3));
   style(periphery,'--dive-rush',String((s.entry*.8+Math.min(1,s.travel+s.speed)*.4)*strength));
   copies.forEach((_,node)=>{style(node,'opacity',(1-s.amount).toFixed(3));});
   if(target||s.amount>0)frame=requestAnimationFrame(draw);
  };
  const wake=()=>{if(!frame){last=performance.now();frame=requestAnimationFrame(draw);}};
  const enter=()=>{if(!target){capture();page.setAttribute('data-diving','true');setActive(true);}target=1;wake();window.dispatchEvent(new Event('portfolio-dive'));};
  const leave=()=>{target=0;tx=0;ty=0;pinned=false;setActive(false);wake();};
  toggle.current=()=>{if(target)leave();else{pinned=true;mouseX=.5;mouseY=.5;enter();}};
  const down=(e:PointerEvent)=>{
   const node=e.target as Element;
   if(e.button!==0||!e.isPrimary||node.closest('input,textarea,select,[contenteditable="true"]'))return;
   const trigger=Boolean(node.closest('[data-dive-trigger]'));
   if(e.pointerType==='touch'&&!trigger)return;
   pointerId=e.pointerId;originX=e.clientX;originY=e.clientY;dragging=false;
   mouseX=clamp(e.clientX/innerWidth,0,1);mouseY=clamp(e.clientY/innerHeight,0,1);
   if(trigger){dragging=true;enter();page.setPointerCapture(e.pointerId);e.preventDefault();}
  };
  const move=(e:PointerEvent)=>{
   mouseX=clamp(e.clientX/innerWidth,0,1);mouseY=clamp(e.clientY/innerHeight,0,1);
   if(pointerId!==e.pointerId&&!pinned)return;
   if(pointerId===e.pointerId&&!dragging){
    if(Math.hypot(e.clientX-originX,e.clientY-originY)<7)return;
    dragging=true;enter();page.setPointerCapture(e.pointerId);window.getSelection()?.removeAllRanges();
   }
   // Absolute look direction provides a 153° sweep on both axes (10% less than before).
   const nx=clamp((mouseX-.5)*2),ny=clamp((mouseY-.5)*2);
   energy=Math.min(1,energy+Math.hypot(nx-tx,ny-ty)*3);tx=nx;ty=ny;
   if(dragging)e.preventDefault();
  };
  const end=()=>{if(pointerId!==null&&page.hasPointerCapture(pointerId))page.releasePointerCapture(pointerId);pointerId=null;if(dragging){suppressUntil=performance.now()+250;dragging=false;if(!pinned)leave();}};
  const click=(e:MouseEvent)=>{if(performance.now()<suppressUntil||dragging){e.preventDefault();e.stopPropagation();}else if(pinned&&(e.target as Element).closest('a,button:not([data-dive-trigger])'))leave();};
  const cancel=()=>{end();leave();};
  const keys=(e:KeyboardEvent)=>{if(e.key==='Escape')cancel();};
  const onScroll=()=>{if(target||dive.current.amount>.001)wake();};
  const update=()=>{if(target||dive.current.amount>.001){layoutDirty=true;wake();}};
  const nativeDrag=(e:DragEvent)=>e.preventDefault();
  const visibility=()=>{if(document.hidden)cancel();};
  page.addEventListener('pointerdown',down);window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',end);window.addEventListener('pointercancel',cancel);
  page.addEventListener('click',click,true);page.addEventListener('dragstart',nativeDrag);window.addEventListener('keydown',keys);window.addEventListener('blur',cancel);
  window.addEventListener('resize',update);window.addEventListener('scroll',onScroll,{passive:true});document.addEventListener('visibilitychange',visibility);
  return()=>{disposed=true;cancelAnimationFrame(frame);clear();toggle.current=()=>{};page.removeAttribute('data-diving');
   page.removeEventListener('pointerdown',down);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',end);window.removeEventListener('pointercancel',cancel);page.removeEventListener('click',click,true);page.removeEventListener('dragstart',nativeDrag);window.removeEventListener('keydown',keys);window.removeEventListener('blur',cancel);window.removeEventListener('resize',update);window.removeEventListener('scroll',onScroll);document.removeEventListener('visibilitychange',visibility);
  };
 },[]);
 return {root,overlay,dive,active,toggle};
}
