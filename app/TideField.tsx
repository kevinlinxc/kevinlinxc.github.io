'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {smooth} from './story';

const field = `
uniform float uTime,uAspect,uScroll,uReady,uCalm,uStory;
uniform vec4 uCard;
uniform float uResolve,uPresence;
uniform vec2 uPointer;
uniform sampler2D uFilm;
float waves(vec2 p){
 p+=vec2(sin(p.y*2.1+uTime*.14),cos(p.x*1.7-uTime*.12))*.12;
 return sin(p.x*3.+p.y*2.+uTime*.23)*.11 + sin(p.y*5.1-p.x-uTime*.26)*.065 + cos(length(p-vec2(.3,-.2))*6.-uTime*.3)*.065;
}
vec2 filmUV(vec2 p){
 vec2 uv=p/vec2(uAspect,1.)*.5+.5;
 vec2 cover=uAspect>1.33333?vec2(1.,1.33333/uAspect):vec2(uAspect/1.33333,1.);
 uv=(uv-.5)*cover*.83+.5;
 uv+=vec2(sin(p.y*1.7+uTime*.1),cos(p.x*1.3-uTime*.09))*.014;
 uv+=vec2(uScroll*.023,-uScroll*.027);
 return clamp(uv,.005,.995);
}
float film(vec2 p){
 vec2 uv=filmUV(p), d=vec2(.007,.009);
 float v=texture2D(uFilm,uv).r*.40;
 v+=(texture2D(uFilm,uv+d).r+texture2D(uFilm,uv-d).r+texture2D(uFilm,uv+vec2(d.x,-d.y)).r+texture2D(uFilm,uv+vec2(-d.x,d.y)).r)*.15;
 return (v-.5)*uReady;
}
float boxDistance(vec2 p,vec4 box){vec2 q=abs(p-box.xy)-box.zw;return length(max(q,0.))+min(max(q.x,q.y),0.);}
float occupied(vec2 p){if(uStory<.5||uPresence<.001)return 0.;float d=boxDistance(p,uCard);return (1.-smoothstep(-.025,.015,d))*smoothstep(.4,.88,uResolve)*uPresence;}
float probability(vec2 p){
 if(uStory<.5||uPresence<.001)return 0.;
 float r=uResolve,d=boxDistance(p,uCard);
 float spread=mix(.62,.035,r);
 float envelope=exp(-(d*d)/(spread*spread));
 float phase=d*(22.+r*45.)-uTime*.55;
 float interference=cos(phase)*.72+cos(phase*.73+p.x*3.)*.28;
 return envelope*interference*(1.-r)*uPresence*.23+exp(-abs(d)*55.)*uPresence*r*.018;
}
float heightAt(vec2 p){
 float distance=length(p-uPointer);
 float wake=cos(distance*11.-uTime*.65)*exp(-distance*1.8)*.045;
 float relaxation=1.-uCalm;
 return (waves(p)*mix(.1,1.,relaxation)+film(p)*.38*relaxation+wake*mix(.15,1.,relaxation))*(1.-occupied(p)*.9)+probability(p);
}`;
const vertex = `
attribute vec2 aGrid;
attribute float aVeil;
varying float vLight,vHeight,vVeil,vPocket,vOccupied;
uniform float uRatio,uLayer;
uniform vec2 uTypeCenter;
${field}
void main(){
 vec2 p=aGrid*vec2(uAspect,1.);
 float h=heightAt(p);
 float e=.009;
 vec2 g=vec2(heightAt(p+vec2(e,0.))-heightAt(p-vec2(e,0.)),heightAt(p+vec2(0.,e))-heightAt(p-vec2(0.,e)))/(2.*e);
 vec2 current=vec2(sin(p.y*2.+uTime*.13),cos(p.x*1.8-uTime*.11))*.023*(1.-uCalm*.9);
 vec2 positionInField=p+current+vec2(h*.13,h*.30);
 positionInField+=normalize(g+vec2(.00001))*min(length(g),2.)*.012;
 positionInField.y+=sin(p.x*1.2+uScroll*2.1)*uScroll*.036;
 positionInField+=vec2(sin(p.y*3.+uTime*.09),cos(p.x*2.-uTime*.1))*.015*uLayer;
 gl_Position=vec4(positionInField/vec2(uAspect,1.),0.,1.);
 vLight=clamp(.5+dot(g,vec2(-.13,.19)),.16,1.);
 vHeight=h;vVeil=aVeil;vOccupied=occupied(p);
 vec2 textDistance=(p-uTypeCenter)/vec2(.9,.44);
 vPocket=exp(-dot(textDistance,textDistance));
 gl_PointSize=(1.35+vLight*.85+uLayer*.3)*uRatio;
}`;
const fragment = `
uniform float uLayer;
varying float vLight,vHeight,vVeil,vPocket,vOccupied;
void main(){
 if(uLayer>.5&&vVeil<.79)discard;
 float d=length(gl_PointCoord-.5);float a=1.-smoothstep(.12,.49,d);
 vec3 tint=mix(vec3(.16,.42,.44),vec3(.66,.9,.78),vLight);
 tint=mix(tint,vec3(.25,.48,.68),smoothstep(.04,.3,vHeight)*.24);
 float strength=uLayer>.5?.32:(.32+vLight*.55)*(1.-vPocket*.48);
 gl_FragColor=vec4(tint,a*strength*(1.-vOccupied));
}`;
const backgroundVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const backgroundFragment=`varying vec2 vUv;${field}
void main(){vec2 p=(vUv-.5)*vec2(uAspect,1.)*2.;float w=waves(p)*(1.-uCalm*.9)+probability(p);float f=film(p)*(1.-uCalm);float glow=exp(-abs(w+f*.2)*12.);vec3 c=vec3(.006,.017,.021)+vec3(.014,.034,.035)*glow; c+=vec3(.009,.017,.024)*smoothstep(-.3,.3,f);gl_FragColor=vec4(c,1.);}`;

export default function TideField({paused,scroll=0}:{paused:boolean;scroll?:number}){
 const backHost=useRef<HTMLDivElement>(null),frontHost=useRef<HTMLDivElement>(null),player=useRef<HTMLVideoElement|null>(null);
 const state=useRef({paused,scroll});
 const [failed,setFailed]=useState(false),[blocked,setBlocked]=useState(false);
 useEffect(()=>{state.current={paused,scroll};},[paused,scroll]);
 useEffect(()=>{
  const backEl=backHost.current,frontEl=frontHost.current;if(!backEl||!frontEl)return;
  let back:THREE.WebGLRenderer|undefined,front:THREE.WebGLRenderer;
  try{back=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});front=new THREE.WebGLRenderer({antialias:false,alpha:true,powerPreference:'high-performance'});}catch{back?.dispose();queueMicrotask(()=>setFailed(true));return;}
  const base=back;const ratio=Math.min(devicePixelRatio,1.5);
  base.setPixelRatio(ratio);front.setPixelRatio(ratio);front.setClearColor(0,0);
  backEl.appendChild(base.domElement);frontEl.appendChild(front.domElement);
  const video=document.createElement('video');player.current=video;
  video.muted=true;video.loop=true;video.playsInline=true;video.preload='auto';video.src='/assets/bad-apple-field.mp4';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let disposed=false,loaded=false,frame=0,last=performance.now(),wasStill=true,fieldScroll=0;
  let activeCard:HTMLElement|null=null,hoverPhase=1;
  const play=()=>{if(disposed)return;void video.play().then(()=>{if(!disposed)setBlocked(false);}).catch(()=>{if(!disposed)setBlocked(true);});};
  const ready=()=>{video.currentTime=28;loaded=true;if(!state.current.paused&&!reduced.matches){wasStill=false;play();}};
  const videoError=()=>{if(!disposed)setFailed(true);};
  video.addEventListener('loadedmetadata',ready);video.addEventListener('error',videoError);
  const filmTexture=new THREE.VideoTexture(video);filmTexture.minFilter=THREE.LinearFilter;filmTexture.magFilter=THREE.LinearFilter;
  const uniforms={uTime:{value:0},uAspect:{value:1},uScroll:{value:0},uReady:{value:0},uCalm:{value:0},uStory:{value:0},uCard:{value:new THREE.Vector4(8,8,.6,.4)},uResolve:{value:0},uPresence:{value:0},uPointer:{value:new THREE.Vector2()},uTypeCenter:{value:new THREE.Vector2()},uFilm:{value:filmTexture},uRatio:{value:ratio},uLayer:{value:0}};
  const frontUniforms={...uniforms,uLayer:{value:1}};
  const camera=new THREE.Camera(),scene=new THREE.Scene(),veilScene=new THREE.Scene();
  const geometry=new THREE.BufferGeometry();
  const material=new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment,transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending});
  const veilMaterial=new THREE.ShaderMaterial({uniforms:frontUniforms,vertexShader:vertex,fragmentShader:fragment,transparent:true,depthTest:false,depthWrite:false});
  const dots=new THREE.Points(geometry,material),veil=new THREE.Points(geometry,veilMaterial);dots.frustumCulled=false;veil.frustumCulled=false;dots.renderOrder=1;scene.add(dots);veilScene.add(veil);
  const backgroundGeometry=new THREE.PlaneGeometry(2,2),backgroundMaterial=new THREE.ShaderMaterial({uniforms,vertexShader:backgroundVertex,fragmentShader:backgroundFragment,depthTest:false,depthWrite:false});
  const background=new THREE.Mesh(backgroundGeometry,backgroundMaterial);background.frustumCulled=false;scene.add(background);
  const resize=()=>{
   const w=backEl.clientWidth,h=backEl.clientHeight;if(!w||!h)return;
   base.setSize(w,h);front.setSize(w,h);uniforms.uAspect.value=w/h;
   const nx=Math.max(2,Math.min(320,Math.round(w/5.5))),ny=Math.max(2,Math.min(210,Math.round(h/5.5)));
   const grid=new Float32Array(nx*ny*2),positions=new Float32Array(nx*ny*3),bands=new Float32Array(nx*ny);
   for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){const i=y*nx+x;grid[i*2]=(x/(nx-1)*2-1)*1.28;grid[i*2+1]=(y/(ny-1)*2-1)*1.32;bands[i]=((x+y*7)%5)/4;}
   geometry.dispose();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('aGrid',new THREE.BufferAttribute(grid,2));geometry.setAttribute('aVeil',new THREE.BufferAttribute(bands,1));
  };
  const observer=new ResizeObserver(resize);observer.observe(backEl);resize();
  const pointer=new THREE.Vector2();
  const selectCard=(node:HTMLElement|null)=>{if(node!==activeCard){activeCard=node;hoverPhase=0;}};
  const move=(e:PointerEvent)=>{pointer.set((e.clientX/innerWidth*2-1)*uniforms.uAspect.value,1-e.clientY/innerHeight*2);selectCard((e.target as Element).closest<HTMLElement>('[data-field-card]'));};
  const focus=(e:FocusEvent)=>selectCard((e.target as Element).closest<HTMLElement>('[data-field-card]'));
  window.addEventListener('pointermove',move,{passive:true});
  window.addEventListener('focusin',focus);
  const render=(now:number)=>{
   if(disposed)return;
   const dt=Math.min((now-last)/1000,.05);last=now;
   const s=state.current,still=s.paused||reduced.matches||document.hidden||(fieldScroll>1.1);
   if(loaded&&still!==wasStill){if(still)video.pause();else play();wasStill=still;}
   const smoothing=1-Math.exp(-dt*2.4);
   if(!s.paused&&!reduced.matches&&!document.hidden){uniforms.uTime.value+=dt;uniforms.uPointer.value.lerp(pointer,smoothing);}
   fieldScroll+=(s.scroll-fieldScroll)*(reduced.matches?1:smoothing);
   uniforms.uScroll.value=Math.min(fieldScroll,1);
   uniforms.uStory.value=1;
   uniforms.uCalm.value=smooth(.05,.85,fieldScroll)*.86;
   hoverPhase=Math.min(1,hoverPhase+(reduced.matches?1:dt*1.7));
   uniforms.uResolve.value=smooth(0,1,hoverPhase);
   uniforms.uPresence.value+=((activeCard? .6:0)-uniforms.uPresence.value)*smoothing;
   if(activeCard){
    const bounds=activeCard.getBoundingClientRect(),height=backEl.clientHeight,width=backEl.clientWidth;
    uniforms.uCard.value.set(((bounds.left+bounds.width/2)/width*2-1)*(width/height),1-(bounds.top+bounds.height/2)/height*2,bounds.width/height,bounds.height/height);
   }
   uniforms.uReady.value+=(video.readyState>=2?1-uniforms.uReady.value:0)*smoothing;
   uniforms.uTypeCenter.value.set(0,.25+Math.min(fieldScroll,1)*2.);
   if(!document.hidden){base.render(scene,camera);front.render(veilScene,camera);}
   frame=requestAnimationFrame(render);
  };
  frame=requestAnimationFrame(render);
  return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('pointermove',move);window.removeEventListener('focusin',focus);video.removeEventListener('loadedmetadata',ready);video.removeEventListener('error',videoError);video.pause();video.removeAttribute('src');video.load();player.current=null;geometry.dispose();material.dispose();veilMaterial.dispose();backgroundGeometry.dispose();backgroundMaterial.dispose();filmTexture.dispose();base.dispose();front.dispose();base.domElement.remove();front.domElement.remove();};
 },[]);
 return <><div ref={backHost} className="tide-back" aria-hidden="true"/><div ref={frontHost} className="tide-front" aria-hidden="true"/>{blocked&&!paused&&<button className="field-play" onClick={()=>{void player.current?.play().then(()=>setBlocked(false)).catch(()=>{});}}>Play the field</button>}{failed&&<p className="tide-error">The moving field couldn’t load. Your introduction and projects are still available.</p>}</>;
}
