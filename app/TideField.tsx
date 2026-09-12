'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type {RefObject} from 'react';
import type {DiveState} from './useScaffoldDive';

const smooth=(a:number,b:number,x:number)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};

const field = `
uniform float uTime,uAspect,uScroll,uReady,uCalm,uStory;
uniform float uDive,uEntry;
uniform vec2 uOrbit;
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
}
vec4 projectDepth(vec3 world,vec2 flatPosition){
 float yaw=uOrbit.x*1.335177*uDive,pitch=-uOrbit.y*1.335177*uDive;
 world.xz=mat2(cos(yaw),-sin(yaw),sin(yaw),cos(yaw))*world.xz;
 world.yz=mat2(cos(pitch),-sin(pitch),sin(pitch),cos(pitch))*world.yz;
 float distance=4.+uEntry*2.;
 float w=distance-world.z*uDive;
 vec2 xy=mix(flatPosition*distance,world.xy*3.4,uDive)/vec2(uAspect,1.);
 // Homogeneous projection clips geometry behind the viewer instead of folding it onscreen.
 return vec4(xy,0.,w);
}`;
const vertex = `
attribute vec2 aGrid;
varying float vLight,vHeight,vPocket,vOccupied,vDepth;
uniform float uRatio,uLayer;
uniform vec2 uTypeCenter;
${field}
void main(){
 vec2 p=aGrid*vec2(uAspect,1.);
 float h=heightAt(p);
 float e=.009;
 vec2 g=vec2(heightAt(p+vec2(e,0.))-h,heightAt(p+vec2(0.,e))-h)/e;
 vec2 current=vec2(sin(p.y*2.+uTime*.13),cos(p.x*1.8-uTime*.11))*.023*(1.-uCalm*.9);
 vec2 positionInField=p+current+vec2(h*.13,h*.30);
 positionInField+=normalize(g+vec2(.00001))*min(length(g),2.)*.012;
 positionInField.y+=sin(p.x*1.2+uScroll*2.1)*uScroll*.036;
 positionInField+=vec2(sin(p.y*3.+uTime*.09),cos(p.x*2.-uTime*.1))*.015*uLayer;
 // The same points open into a luminance relief; no particle remount or second renderer.
 float relief=uDive>.001?film(p):0.;
 vec3 world=vec3(positionInField,h*2.4+relief*3.1-uLayer*1.15);
 gl_Position=projectDepth(world,positionInField);
 vDepth=clamp((world.z+2.7)/5.,0.,1.);
 vLight=clamp(.5+dot(g,vec2(-.13,.19)),.16,1.);
 vHeight=h;vOccupied=occupied(p);
 vec2 textDistance=(p-uTypeCenter)/vec2(.9,.44);
 vPocket=exp(-dot(textDistance,textDistance));
 gl_PointSize=(1.35+vLight*.85+uLayer*.3)*uRatio*(1.+uDive*max(0.,world.z)*.35);
}`;
const fragment = `
uniform float uLayer,uDive;
varying float vLight,vHeight,vPocket,vOccupied,vDepth;
void main(){
 float d=length(gl_PointCoord-.5);float a=1.-smoothstep(.12,.49,d);
 vec3 tint=mix(vec3(.16,.42,.44),vec3(.66,.9,.78),vLight);
 tint=mix(tint,vec3(.25,.48,.68),smoothstep(.04,.3,vHeight)*.24);
 vec3 depthColor=mix(vec3(.26,.12,.85),vec3(.02,.78,1.),smoothstep(.1,.6,vDepth));
 depthColor=mix(depthColor,vec3(1.,.24,.53),smoothstep(.55,.95,vDepth));
 tint=mix(tint,depthColor,uDive);
 float strength=uLayer>.5?.176:(.32+vLight*.55)*(1.-vPocket*.48);
 gl_FragColor=vec4(tint,a*mix(strength,uLayer>.5?.42:.85,uDive)*(1.-vOccupied*(1.-uDive)));
}`;
const backgroundVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
const backgroundFragment=`varying vec2 vUv;${field}
void main(){vec2 p=(vUv-.5)*vec2(uAspect,1.)*2.;float w=waves(p)*(1.-uCalm*.9)+probability(p);float f=(texture2D(uFilm,filmUV(p)).r-.5)*uReady*(1.-uCalm);float glow=exp(-abs(w+f*.2)*12.);vec3 c=vec3(.006,.014,.032)+vec3(.014,.026,.048)*glow; c+=vec3(.008,.014,.038)*smoothstep(-.3,.3,f);gl_FragColor=vec4(c,1.);}`;

export default function TideField({dive}:{dive?:RefObject<DiveState>}){
 const backHost=useRef<HTMLDivElement>(null),player=useRef<HTMLVideoElement|null>(null);
 const invalidate=useRef(()=>{});
 const [failed,setFailed]=useState(false),[blocked,setBlocked]=useState(false);
 useEffect(()=>{
  const backEl=backHost.current;if(!backEl)return;
  let base:THREE.WebGLRenderer;
  try{base=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});}catch{queueMicrotask(()=>setFailed(true));return;}
  backEl.appendChild(base.domElement);
  const video=document.createElement('video');player.current=video;
  video.muted=true;video.loop=true;video.playsInline=true;video.preload='auto';video.src='/assets/bad-apple-field.mp4';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  // The source film is 24 fps; avoid rendering this decorative layer at 60-144 Hz.
  const interval=1000/30;
  let disposed=false,loaded=false,frame=0,last=performance.now()-interval,wasStill=true,fieldScroll=0,dirty=true;
  let width=1,height=1;
  let activeCard:HTMLElement|null=null,hoverPhase=1;
  const play=()=>{if(disposed)return;void video.play().then(()=>{if(!disposed)setBlocked(false);}).catch(()=>{if(!disposed)setBlocked(true);});};
  const requestRender=()=>{dirty=true;if(!disposed&&!document.hidden&&!frame)frame=requestAnimationFrame(render);};
  invalidate.current=requestRender;
  const ready=()=>{video.currentTime=28;loaded=true;requestRender();};
  const videoError=()=>{if(!disposed)setFailed(true);};
  video.addEventListener('loadedmetadata',ready);video.addEventListener('error',videoError);
  video.addEventListener('loadeddata',requestRender);video.addEventListener('seeked',requestRender);
  const filmTexture=new THREE.VideoTexture(video);filmTexture.minFilter=THREE.LinearFilter;filmTexture.magFilter=THREE.LinearFilter;
  const uniforms={uTime:{value:0},uAspect:{value:1},uScroll:{value:0},uReady:{value:0},uCalm:{value:0},uStory:{value:0},uDive:{value:0},uEntry:{value:0},uOrbit:{value:new THREE.Vector2()},uCard:{value:new THREE.Vector4(8,8,.6,.4)},uResolve:{value:0},uPresence:{value:0},uPointer:{value:new THREE.Vector2()},uTypeCenter:{value:new THREE.Vector2()},uFilm:{value:filmTexture},uRatio:{value:1},uLayer:{value:0}};
  const frontUniforms={...uniforms,uLayer:{value:1}};
  const camera=new THREE.Camera(),scene=new THREE.Scene();
  const geometry=new THREE.BufferGeometry(),depthGeometry=new THREE.BufferGeometry(),veilGeometry=new THREE.BufferGeometry();
  const material=new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:fragment,transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending});
  const veilMaterial=new THREE.ShaderMaterial({uniforms:frontUniforms,vertexShader:vertex,fragmentShader:fragment,transparent:true,depthTest:false,depthWrite:false});
  const dots=new THREE.Points(geometry,material),veil=new THREE.Points(veilGeometry,veilMaterial);dots.frustumCulled=false;veil.frustumCulled=false;dots.renderOrder=1;veil.renderOrder=2;scene.add(dots,veil);
  // A sparse mesh reveals the field's structure only during the depth interaction.
  const scaffoldGeometry=new THREE.BufferGeometry(),segments:number[]=[];
  for(let y=0;y<25;y++)for(let x=0;x<41;x++){
   const gx=(x/40*2-1)*1.35,gy=(y/24*2-1)*1.4;
   if(x<40)segments.push(gx,gy,gx+2.7/40,gy);
   if(y<24)segments.push(gx,gy,gx,gy+2.8/24);
  }
  scaffoldGeometry.setAttribute('position',new THREE.Float32BufferAttribute(new Float32Array(segments.length/2*3),3));scaffoldGeometry.setAttribute('aGrid',new THREE.Float32BufferAttribute(segments,2));
  const scaffoldMaterial=new THREE.ShaderMaterial({uniforms,vertexShader:vertex,fragmentShader:'uniform float uDive; varying float vDepth; void main(){vec3 c=mix(vec3(.14,.4,1.),vec3(1.,.22,.55),vDepth);gl_FragColor=vec4(c,uDive*.27);}',transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending});
  const scaffold=new THREE.LineSegments(scaffoldGeometry,scaffoldMaterial);scaffold.frustumCulled=false;scaffold.renderOrder=1;scene.add(scaffold);
  // A real enclosure gives side-on views a floor, walls and depth references.
  const cageVertices:number[]=[];
  for(let z=-4;z<=2;z+=.5){
   cageVertices.push(-2,-2,z,2,-2,z, -2,2,z,2,2,z, -2,-2,z,-2,2,z, 2,-2,z,2,2,z);
  }
  for(let p=-2;p<=2;p+=.25)cageVertices.push(p,-2,-4,p,-2,2, p,2,-4,p,2,2, -2,p,-4,-2,p,2, 2,p,-4,2,p,2);
  const cageGeometry=new THREE.BufferGeometry();cageGeometry.setAttribute('position',new THREE.Float32BufferAttribute(cageVertices,3));
  const cageMaterial=new THREE.ShaderMaterial({uniforms,vertexShader:`${field}\nvarying float vFog; void main(){vec3 p=position;p.x*=uAspect;gl_Position=projectDepth(p,p.xy);vFog=(position.z+4.)/6.;}`,fragmentShader:'uniform float uDive; varying float vFog; void main(){gl_FragColor=vec4(mix(vec3(.18,.28,.85),vec3(.22,.8,1.),vFog),uDive*(.07+vFog*.14));}',transparent:true,depthTest:false,depthWrite:false,blending:THREE.AdditiveBlending});
  const cage=new THREE.LineSegments(cageGeometry,cageMaterial);cage.frustumCulled=false;cage.renderOrder=1;scene.add(cage);
  const portraitTexture=new THREE.TextureLoader().load('/assets/kevin-portrait.jpg',requestRender);
  const orbUniforms={...uniforms,uPortrait:{value:new THREE.Vector3(0,0,.22)},uPhoto:{value:portraitTexture},uOrbPresence:{value:0}};
  const orbVertex=`${field}
   uniform vec3 uPortrait;
   varying vec3 vSphere,vNormal;
   void main(){
    vSphere=position;
    vec3 p=position;
    float turn=uOrbit.x*.35*uDive;
    p.xz=mat2(cos(turn),-sin(turn),sin(turn),cos(turn))*p.xz;
    vNormal=p;
    vec3 world=vec3(uPortrait.xy,-.45)+p*uPortrait.z*1.16;
    gl_Position=projectDepth(world,world.xy);
   }`;
  const orbGeometry=new THREE.SphereGeometry(1,48,32);
  const orbMaterial=new THREE.ShaderMaterial({uniforms:orbUniforms,vertexShader:orbVertex,fragmentShader:`
   uniform sampler2D uPhoto; uniform float uOrbPresence; varying vec3 vSphere,vNormal;
   void main(){
    vec3 n=normalize(vNormal);
    vec2 photoUV=vec2(.5,.48)+vSphere.xy*.33;
    vec3 photo=texture2D(uPhoto,photoUV).rgb;
    float diffuse=max(0.,dot(n,normalize(vec3(-.5,.65,1.))));
    float rim=pow(1.-max(0.,n.z),2.8);
    float gloss=pow(max(0.,dot(n,normalize(vec3(-.35,.5,1.)))),65.);
    vec3 color=photo*(.42+.65*diffuse)+vec3(.12,.65,.9)*rim*.7+vec3(.8,.95,1.)*gloss*.35;
    gl_FragColor=vec4(color,uOrbPresence);
   }`,transparent:true,depthTest:false,depthWrite:false});
  const orb=new THREE.Mesh(orbGeometry,orbMaterial);orb.frustumCulled=false;orb.renderOrder=5;scene.add(orb);
  const backgroundGeometry=new THREE.PlaneGeometry(2,2),backgroundMaterial=new THREE.ShaderMaterial({uniforms,vertexShader:backgroundVertex,fragmentShader:backgroundFragment,depthTest:false,depthWrite:false});
  const background=new THREE.Mesh(backgroundGeometry,backgroundMaterial);background.frustumCulled=false;scene.add(background);
  const resize=()=>{
   const w=backEl.clientWidth,h=backEl.clientHeight;if(!w||!h)return;
   width=w;height=h;
   // Limit fill rate on Retina/large displays while preserving full CSS coverage.
   const ratio=Math.min(devicePixelRatio,1.25,Math.sqrt(1_800_000/(w*h)));
   base.setPixelRatio(ratio);base.setSize(w,h);uniforms.uRatio.value=ratio;uniforms.uAspect.value=w/h;
   const nx=Math.max(2,Math.min(240,Math.round(w/6.5))),ny=Math.max(2,Math.min(160,Math.round(h/6.5)));
   const grid=new Float32Array(nx*ny*2),positions=new Float32Array(nx*ny*3),veilGrid:number[]=[],depthIndices:number[]=[];
   for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
    const i=y*nx+x,gx=(x/(nx-1)*2-1)*1.28,gy=(y/(ny-1)*2-1)*1.32;
    grid[i*2]=gx;grid[i*2+1]=gy;
    if((x+y)%2===0)depthIndices.push(i);
    // Previously four of every five veil particles were shaded and discarded.
    if((x+y*7)%5===4)veilGrid.push(gx,gy);
   }
   geometry.dispose();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('aGrid',new THREE.BufferAttribute(grid,2));
   // The solid DOM layers dominate in depth mode; a checkerboard LOD keeps full field coverage.
   depthGeometry.dispose();depthGeometry.setAttribute('position',geometry.getAttribute('position'));depthGeometry.setAttribute('aGrid',geometry.getAttribute('aGrid'));depthGeometry.setIndex(depthIndices);
   veilGeometry.dispose();veilGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(veilGrid.length/2*3),3));veilGeometry.setAttribute('aGrid',new THREE.Float32BufferAttribute(veilGrid,2));
   requestRender();
  };
  const pointer=new THREE.Vector2();
  const selectCard=(node:HTMLElement|null)=>{if(node!==activeCard){activeCard=node;hoverPhase=0;requestRender();}};
  const move=(e:PointerEvent)=>{pointer.set((e.clientX/innerWidth*2-1)*uniforms.uAspect.value,1-e.clientY/innerHeight*2);selectCard((e.target as Element).closest<HTMLElement>('[data-field-card]'));};
  const focus=(e:FocusEvent)=>selectCard((e.target as Element).closest<HTMLElement>('[data-field-card]'));
  window.addEventListener('pointermove',move,{passive:true});
  window.addEventListener('focusin',focus);
  function render(now:number){
   frame=0;
   if(disposed)return;
   if(document.hidden){video.pause();wasStill=true;return;}
   const elapsed=now-last;
   if(elapsed<interval){frame=requestAnimationFrame(render);return;}
   const dt=Math.min(elapsed/1000,.1);last=now-(elapsed%interval);
   const scroll=Math.max(0,window.scrollY/Math.max(1,innerHeight));
   const frozen=reduced.matches,still=frozen||scroll>1.1;
   if(loaded&&still!==wasStill){if(still)video.pause();else play();wasStill=still;}
   const depth=dive?.current;
   if(frozen&&!dirty&&!depth?.amount&&!uniforms.uDive.value)return;
   dirty=false;
   const smoothing=1-Math.exp(-dt*2.4);
   if(!frozen){uniforms.uTime.value+=dt;uniforms.uPointer.value.lerp(pointer,smoothing);}
   fieldScroll+=(scroll-fieldScroll)*(frozen?1:smoothing);
   uniforms.uScroll.value=Math.min(fieldScroll,1);
   uniforms.uStory.value=1;
   uniforms.uDive.value=(depth?.amount??0)*(frozen?.12:1);
   uniforms.uEntry.value=depth?.entry??0;
   uniforms.uOrbit.value.set(depth?.x??0,depth?.y??0);
   scaffold.visible=uniforms.uDive.value>.001;
   dots.geometry=scaffold.visible?depthGeometry:geometry;
   cage.visible=scaffold.visible;
   orb.visible=scaffold.visible&&Boolean(depth?.portrait);
   orbUniforms.uOrbPresence.value=depth?.amount??0;
   if(depth?.portrait)orbUniforms.uPortrait.value.set(depth.portrait.x,depth.portrait.y,depth.portrait.radius);
   uniforms.uCalm.value=smooth(.05,.85,fieldScroll)*.86*(1.-uniforms.uDive.value*.85);
   hoverPhase=Math.min(1,hoverPhase+(frozen?1:dt*1.7));
   uniforms.uResolve.value=smooth(0,1,hoverPhase);
   if(activeCard&&!activeCard.isConnected)activeCard=null;
   uniforms.uPresence.value+=((activeCard&&!scaffold.visible? .6:0)-uniforms.uPresence.value)*(frozen?1:smoothing);
   if(activeCard&&!scaffold.visible){
    const bounds=activeCard.getBoundingClientRect();
    uniforms.uCard.value.set(((bounds.left+bounds.width/2)/width*2-1)*(width/height),1-(bounds.top+bounds.height/2)/height*2,bounds.width/height,bounds.height/height);
   }
   uniforms.uReady.value+=(video.readyState>=2?1-uniforms.uReady.value:0)*(frozen?1:smoothing);
   uniforms.uTypeCenter.value.set(0,.25+Math.min(fieldScroll,1)*2.);
   base.render(scene,camera);
   if(!frozen||(depth?.amount??0)>0)frame=requestAnimationFrame(render);
  }
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;video.pause();wasStill=true;}else{last=performance.now()-interval;requestRender();}};
  window.addEventListener('scroll',requestRender,{passive:true});
  window.addEventListener('portfolio-dive',requestRender);
  document.addEventListener('visibilitychange',visibility);
  reduced.addEventListener('change',requestRender);
  const observer=new ResizeObserver(resize);observer.observe(backEl);resize();
  return()=>{disposed=true;invalidate.current=()=>{};cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('pointermove',move);window.removeEventListener('focusin',focus);window.removeEventListener('scroll',requestRender);window.removeEventListener('portfolio-dive',requestRender);document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',requestRender);video.removeEventListener('loadedmetadata',ready);video.removeEventListener('loadeddata',requestRender);video.removeEventListener('seeked',requestRender);video.removeEventListener('error',videoError);video.pause();video.removeAttribute('src');video.load();player.current=null;geometry.dispose();depthGeometry.dispose();veilGeometry.dispose();scaffoldGeometry.dispose();scaffoldMaterial.dispose();cageGeometry.dispose();cageMaterial.dispose();orbGeometry.dispose();orbMaterial.dispose();portraitTexture.dispose();material.dispose();veilMaterial.dispose();backgroundGeometry.dispose();backgroundMaterial.dispose();filmTexture.dispose();base.dispose();base.domElement.remove();};
 },[dive]);
 return <><div ref={backHost} className="tide-back" aria-hidden="true"/>{blocked&&<button className="field-play" onClick={()=>{void player.current?.play().then(()=>setBlocked(false)).catch(()=>{});}}>Play the field</button>}{failed&&<p className="tide-error">The moving field couldn&apos;t load. Your introduction and projects are still available.</p>}</>;
}
