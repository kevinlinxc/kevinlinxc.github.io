'use client';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type {createFieldObjects} from './FieldObjects';
import {createRenderQuality,renderProfiles,currentDevicePolicy} from './renderQuality';
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
float heightAt(vec2 p,float filmHeight){
 float distance=length(p-uPointer);
 float wake=cos(distance*11.-uTime*.65)*exp(-distance*1.8)*.045;
 float relaxation=1.-uCalm;
 return (waves(p)*mix(.1,1.,relaxation)+filmHeight*.38*relaxation+wake*mix(.15,1.,relaxation))*(1.-occupied(p)*.9)+probability(p);
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
 float filmHeight=film(p);
 float h=heightAt(p,filmHeight);
 float e=.009;
 vec2 g=vec2(heightAt(p+vec2(e,0.),film(p+vec2(e,0.)))-h,heightAt(p+vec2(0.,e),film(p+vec2(0.,e)))-h)/e;
 vec2 current=vec2(sin(p.y*2.+uTime*.13),cos(p.x*1.8-uTime*.11))*.023*(1.-uCalm*.9);
 vec2 positionInField=p+current+vec2(h*.13,h*.30);
 positionInField+=normalize(g+vec2(.00001))*min(length(g),2.)*.012;
 positionInField.y+=sin(p.x*1.2+uScroll*2.1)*uScroll*.036;
 positionInField+=vec2(sin(p.y*3.+uTime*.09),cos(p.x*2.-uTime*.1))*.015*uLayer;
 // The same points open into a luminance relief; no particle remount or second renderer.
 float relief=uDive>.001?filmHeight:0.;
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
 if(a<=.003)discard;
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

const portraitVertex = `
varying vec2 vUv;
varying float vAlpha;
uniform float uTime,uPortrait,uChannel;
uniform vec2 uPortraitSize;
uniform sampler2D uPortraitTex;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){
 vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);
}
// Domain-warped fbm keeps folding the relief into new shapes instead of just sliding it.
float relief(vec2 p,float phase){
 vec2 q=vec2(noise(p+phase),noise(p+vec2(5.2,1.3)-phase));
 return noise(p+1.8*q+vec2(3.7,8.1));
}
float luminance(vec2 p){return dot(texture2D(uPortraitTex,p).rgb,vec3(.299,.587,.114));}
void main(){
 // Flat photo first, then the relief extrudes, so the motion reads as derived from the image.
 // Flattening completes as the camera returns, so the relief never lingers in 2D.
 float t=smoothstep(.5+uChannel*.03,.95+uChannel*.03,uPortrait);
 float unit=uPortraitSize.x;
 // The image supplies the height field: bright areas jut, and edges jut harder.
 float height=luminance(uv),e=.006;
 vec2 gradient=vec2(height-luminance(uv+vec2(e,0.)),height-luminance(uv+vec2(0.,e)));
 float edge=clamp(length(gradient)*4.,0.,1.);
 vec2 seed=vec2(uChannel*13.13,uChannel*7.77);
 float field=relief(uv*3.6+seed,uTime*.22+uChannel*1.7);
 float detail=relief(uv*8.4-seed,uTime*.34-uChannel*.9);
 float lift=(height-.5)*1.5+edge*.6+(field-.55)*.45+(detail-.5)*.15;
 // The smear follows the image's own gradients, with a little noise for the slow evolution.
 vec2 warp=(gradient*1.1+(vec2(field,detail)-.55)*.22)*unit*t;
 float sway=sin(uTime*.27+uChannel*2.1);
 float depth=((uChannel-1.)*(.2+.07*sway)+lift*.3)*unit*t;
 vec2 sized=position.xy*uPortraitSize*(1.+(uChannel-1.)*(.06+.025*sway)*t);
 vec3 local=vec3(sized.x+warp.x,sized.y+warp.y,depth);
 gl_Position=projectionMatrix*modelViewMatrix*vec4(local,1.);
 vUv=uv;
 vAlpha=smoothstep(.04,.24,uPortrait);
}`;
const portraitFragment = `
uniform sampler2D uPortraitTex;
uniform float uChannel;
varying vec2 vUv;
varying float vAlpha;
void main(){
 vec2 centered=vUv-.5;
 float radius=length(centered);
 if(radius>.5)discard;
 vec4 texel=texture2D(uPortraitTex,vUv);
 vec3 tint=vec3(0.);
 if(uChannel<.5)tint.r=texel.r;
 else if(uChannel<1.5)tint.g=texel.g;
 else tint.b=texel.b;
 float edge=1.-smoothstep(.47,.5,radius);
 gl_FragColor=vec4(tint,vAlpha*edge);
}`;

export default function TideField({dive}:{dive?:RefObject<DiveState>}){
 const backHost=useRef<HTMLDivElement>(null);
 const invalidate=useRef(()=>{});
 const [failed,setFailed]=useState(false);
 useEffect(()=>{
  const backEl=backHost.current;if(!backEl)return;
  const policy=currentDevicePolicy();
  let base:THREE.WebGLRenderer;
  try{base=new THREE.WebGLRenderer({antialias:false,stencil:false,powerPreference:policy.constrained?'default':'high-performance'});}catch{queueMicrotask(()=>setFailed(true));return;}
  backEl.appendChild(base.domElement);
  const video=document.createElement('video');
  video.muted=true;video.loop=true;video.playsInline=true;video.preload='auto';video.src='/assets/bad-apple-field.mp4';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  // The source film is 24 fps; avoid rendering this decorative layer at 60-144 Hz.
  const interval=1000/30;
  const quality=createRenderQuality(policy.initialTier),page=backEl.closest<HTMLElement>('.tide-portfolio');
  page?.setAttribute('data-render-quality',String(quality.tier));
  let disposed=false,contextLost=false,loaded=false,frame=0,last=performance.now()-interval,wasStill=true,fieldScroll=0,dirty=true;
  let width=1,height=1,columns=0,rows=0,resizeTimer:ReturnType<typeof setTimeout>|undefined;
  let activeCard:HTMLElement|null=null,hoverPhase=1;
  const play=()=>{if(disposed||contextLost||document.hidden)return;void video.play().catch(()=>{});};
  const scheduleRender=()=>{if(!disposed&&!contextLost&&!document.hidden&&!frame)frame=requestAnimationFrame(render);};
  const requestRender=()=>{dirty=true;scheduleRender();};
  invalidate.current=requestRender;
  const ready=()=>{video.currentTime=28;loaded=true;requestRender();};
  const videoError=()=>{if(!disposed)setFailed(true);};
  video.addEventListener('loadedmetadata',ready);video.addEventListener('error',videoError);
  video.addEventListener('loadeddata',requestRender);video.addEventListener('seeked',requestRender);
  const filmTexture=new THREE.VideoTexture(video);filmTexture.minFilter=THREE.LinearFilter;filmTexture.magFilter=THREE.LinearFilter;
  const portraitCanvas=document.createElement('canvas');portraitCanvas.width=1;portraitCanvas.height=1;
  const portraitTexture=new THREE.CanvasTexture(portraitCanvas);portraitTexture.minFilter=THREE.LinearFilter;portraitTexture.magFilter=THREE.LinearFilter;portraitTexture.generateMipmaps=false;
  const uniforms={uTime:{value:0},uAspect:{value:1},uScroll:{value:0},uReady:{value:0},uCalm:{value:0},uStory:{value:0},uDive:{value:0},uEntry:{value:0},uOrbit:{value:new THREE.Vector2()},uCard:{value:new THREE.Vector4(8,8,.6,.4)},uResolve:{value:0},uPresence:{value:0},uPointer:{value:new THREE.Vector2()},uTypeCenter:{value:new THREE.Vector2()},uFilm:{value:filmTexture},uRatio:{value:1},uLayer:{value:0},uPortrait:{value:0},uPageScroll:{value:0},uPortraitCenter:{value:new THREE.Vector2()}};
  const frontUniforms={...uniforms,uLayer:{value:1}};
  const portraitUniforms={...uniforms,uPortraitTex:{value:portraitTexture},uPortraitSize:{value:new THREE.Vector2()},uChannel:{value:0}};
  const camera=new THREE.Camera(),scene=new THREE.Scene();
  // A transparent foreground canvas lets the shared 3D pass sort above the DOM project panels instead of behind them.
  let fore:THREE.WebGLRenderer|null=null,foreLost=false,foreActive=false;
  const foreEl=document.createElement('div');foreEl.className='tide-fore';foreEl.setAttribute('aria-hidden','true');(page??document.body).appendChild(foreEl);
  try{
   fore=new THREE.WebGLRenderer({alpha:true,antialias:false,stencil:false,powerPreference:policy.constrained?'default':'high-performance'});
   fore.setClearColor(0x000000,0);foreEl.appendChild(fore.domElement);
  }catch{fore=null;foreEl.remove();}
  let fieldObjects:ReturnType<typeof createFieldObjects>|undefined,objectsLoading=false;
  const prepareObjects=()=>{
   if(fieldObjects||objectsLoading||disposed)return;
   objectsLoading=true;
   void import('./FieldObjects').then(({createFieldObjects})=>{
    if(disposed)return;
    fieldObjects=createFieldObjects();fieldObjects.resize(width,height);fieldObjects.mount(portraitGroup);requestRender();
   }).catch(()=>{objectsLoading=false;});
  };
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
  const backgroundGeometry=new THREE.PlaneGeometry(2,2),backgroundMaterial=new THREE.ShaderMaterial({uniforms,vertexShader:backgroundVertex,fragmentShader:backgroundFragment,depthTest:false,depthWrite:false});
   // The low-frequency atmospheric wash needs far fewer pixels than the sharp points.
   const glowTarget=new THREE.WebGLRenderTarget(1,1,{depthBuffer:false,stencilBuffer:false,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter});
   const glowScene=new THREE.Scene();
   const background=new THREE.Mesh(backgroundGeometry,backgroundMaterial);background.frustumCulled=false;glowScene.add(background);
   const glowCompositeMaterial=new THREE.ShaderMaterial({uniforms:{uGlow:{value:glowTarget.texture}},vertexShader:backgroundVertex,fragmentShader:'uniform sampler2D uGlow; varying vec2 vUv; void main(){gl_FragColor=texture2D(uGlow,vUv);}',depthTest:false,depthWrite:false});
   const glowComposite=new THREE.Mesh(backgroundGeometry,glowCompositeMaterial);glowComposite.frustumCulled=false;scene.add(glowComposite);
   const portraitGeometry=new THREE.PlaneGeometry(1,1,policy.constrained?40:72,policy.constrained?40:72);
   // DoubleSide so the relief stays visible as the camera orbits past it.
   const portraitMaterials=[0,1,2].map(channel=>new THREE.ShaderMaterial({uniforms:{...portraitUniforms,uChannel:{value:channel}},vertexShader:portraitVertex,fragmentShader:portraitFragment,transparent:true,depthTest:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));
   const portraitGroup=new THREE.Group();portraitGroup.frustumCulled=false;
   const portraitLayers=portraitMaterials.map(material=>{const layer=new THREE.Mesh(portraitGeometry,material);layer.frustumCulled=false;layer.renderOrder=3;layer.visible=false;portraitGroup.add(layer);return layer;});
   const updateAnchor=()=>{
    const node=document.querySelector<HTMLElement>('.profile-intro .profile-portrait');if(!node)return;
    const bounds=node.getBoundingClientRect();
    // documentSpace already adds window.scrollY, so this keeps the relief pinned to the portrait in document space.
    portraitGroup.position.set(bounds.left+bounds.width/2-width/2,height/2-(bounds.top+window.scrollY+bounds.height/2),0);
    portraitUniforms.uPortraitSize.value.set(bounds.width,bounds.height);
    requestRender();
   };
   const portraitImage=new Image();
   portraitImage.decoding='async';
   portraitImage.onload=()=>{
    if(disposed)return;
    const size=policy.constrained?256:512,imageWidth=portraitImage.naturalWidth,imageHeight=portraitImage.naturalHeight;
    if(!imageWidth||!imageHeight)return;
    const canvas=portraitCanvas;canvas.width=size;canvas.height=size;
    const context=canvas.getContext('2d');if(!context)return;
    // Reproduce the button's cover + scale(1.5) crop so the relief begins as the same picture.
    const coverScale=Math.max(size/imageWidth,size/imageHeight),topOffset=(size-imageHeight*coverScale)/2;
    const sourceSize=(2*size/3)/coverScale,sourceX=(size/6)/coverScale,sourceY=(.18*size-topOffset)/coverScale;
    context.clearRect(0,0,size,size);
    context.drawImage(portraitImage,sourceX,sourceY,sourceSize,sourceSize,0,0,size,size);
    portraitTexture.needsUpdate=true;
    requestRender();
   };
   let portraitRequested=false;
   const preparePortrait=()=>{if(!portraitRequested){portraitRequested=true;portraitImage.src='/assets/kevin-portrait-preview.webp';}};
   const resize=()=>{
   const w=backEl.clientWidth,h=backEl.clientHeight;if(!w||!h)return;
   width=w;height=h;
   fieldObjects?.resize(w,h);
   // Limit fill rate on Retina/large displays while preserving full CSS coverage.
   const profile=renderProfiles[quality.tier];
   const ratio=Math.min(devicePixelRatio,profile.pixelRatio,policy.pixelRatio,Math.sqrt(Math.min(profile.pixels,policy.pixels)/(w*h)));
   glowTarget.setSize(Math.max(1,Math.ceil(w*ratio*profile.glowScale)),Math.max(1,Math.ceil(h*ratio*profile.glowScale)));
   // setDrawingBufferSize avoids allocating an intermediate old-size framebuffer.
   base.setDrawingBufferSize(w,h,ratio);uniforms.uRatio.value=ratio;uniforms.uAspect.value=w/h;
   if(fore&&!foreLost)fore.setDrawingBufferSize(w,h,ratio);
   const nx=Math.max(2,Math.min(profile.columns,Math.round(w/profile.spacing))),ny=Math.max(2,Math.min(profile.rows,Math.round(h/profile.spacing)));
   if(nx!==columns||ny!==rows){
   columns=nx;rows=ny;
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
   }
   requestRender();
   updateAnchor();
  };
  const queueResize=()=>{
   clearTimeout(resizeTimer);
   // Mobile browser chrome changes viewport height repeatedly during a swipe.
   // Stretch the existing canvas briefly instead of reallocating at every step.
   resizeTimer=setTimeout(()=>{if(!disposed&&!contextLost)resize();},150);
  };
  const pointer=new THREE.Vector2();
  const selectCard=(node:HTMLElement|null)=>{if(node!==activeCard){activeCard=node;hoverPhase=0;requestRender();}};
  const move=(e:PointerEvent)=>{pointer.set((e.clientX/innerWidth*2-1)*uniforms.uAspect.value,1-e.clientY/innerHeight*2);selectCard((e.target as Element).closest<HTMLElement>('[data-field-card]'));};
  const focus=(e:FocusEvent)=>selectCard((e.target as Element).closest<HTMLElement>('[data-field-card]'));
  window.addEventListener('pointermove',move,{passive:true});
  window.addEventListener('focusin',focus);
  function render(now:number){
   frame=0;
   if(disposed||contextLost)return;
   if(document.hidden){video.pause();wasStill=true;return;}
   const amount=dive?.current.amount??0;
   const tier=quality.sample(now,!reduced.matches&&(amount===0||amount===1));
   if(tier!==null){page?.setAttribute('data-render-quality',String(tier));resize();}
   const elapsed=now-last;
   if(elapsed<interval){scheduleRender();return;}
   const dt=Math.min(elapsed/1000,.1);last=now-(elapsed%interval);
   const scroll=Math.max(0,window.scrollY/Math.max(1,innerHeight));
   const frozen=reduced.matches,still=frozen||scroll>1.1;
   if(loaded&&still!==wasStill){if(still)video.pause();else play();wasStill=still;}
   const depth=dive?.current;
   if(frozen&&!dirty&&!depth?.amount&&!depth?.portrait&&!uniforms.uDive.value)return;
   dirty=false;
   const smoothing=1-Math.exp(-dt*2.4);
   if(!frozen){uniforms.uTime.value+=dt;uniforms.uPointer.value.lerp(pointer,smoothing);}
   fieldScroll+=(scroll-fieldScroll)*(frozen?1:smoothing);
   uniforms.uScroll.value=Math.min(fieldScroll,1);
   uniforms.uStory.value=1;
   const diveAmount=depth?.amount??0,portraitAmount=depth?.portrait??diveAmount;
   uniforms.uDive.value=diveAmount*(frozen?.12:1);
   uniforms.uPortrait.value=portraitAmount*(frozen?.12:1);
   uniforms.uPageScroll.value=window.scrollY/Math.max(1,height);
   uniforms.uEntry.value=depth?.entry??0;
   uniforms.uOrbit.value.set(depth?.x??0,depth?.y??0);
   const inDepth=uniforms.uDive.value>.001;
   // Portrait positions are in document coordinates; do not shade them far below home.
   const portraitVisible=uniforms.uPortrait.value>.001&&(!policy.touch||scroll<2.5);
   portraitLayers.forEach(layer=>{layer.visible=portraitVisible;});
   if(inDepth){prepareObjects();if(!policy.touch||scroll<2.5)preparePortrait();}
   scaffold.visible=inDepth&&!depth?.exiting;
   dots.geometry=inDepth?depthGeometry:geometry;
   cage.visible=scaffold.visible;
   uniforms.uCalm.value=smooth(.05,.85,fieldScroll)*.86*(1.-uniforms.uDive.value*.85);
   hoverPhase=Math.min(1,hoverPhase+(frozen?1:dt*1.7));
   uniforms.uResolve.value=smooth(0,1,hoverPhase);
   if(activeCard&&!activeCard.isConnected)activeCard=null;
   uniforms.uPresence.value+=((activeCard&&!inDepth? .6:0)-uniforms.uPresence.value)*(frozen?1:smoothing);
   if(activeCard&&!inDepth){
    const bounds=activeCard.getBoundingClientRect();
    uniforms.uCard.value.set(((bounds.left+bounds.width/2)/width*2-1)*(width/height),1-(bounds.top+bounds.height/2)/height*2,bounds.width/height,bounds.height/height);
   }
   uniforms.uReady.value+=(video.readyState>=2?1-uniforms.uReady.value:0)*(frozen?1:smoothing);
   uniforms.uTypeCenter.value.set(0,.25+Math.min(fieldScroll,1)*2.);
   base.setRenderTarget(glowTarget);base.render(glowScene,camera);base.setRenderTarget(null);
   base.render(scene,camera);
   const active3d=diveAmount>.001||portraitAmount>.001;
   if(fore&&!foreLost){
    // Only touch the overlay while 3D content is on screen, then clear it once on the way out.
    if(active3d||foreActive){fore.clear();foreActive=active3d;}
    if(active3d)fieldObjects?.render(fore,depth,dt,frozen);
   }
   else fieldObjects?.render(base,depth,dt,frozen);
   if(!frozen||diveAmount>0||portraitAmount>0)scheduleRender();
  }
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;video.pause();wasStill=true;}else{quality.reset();last=performance.now()-interval;requestRender();}};
  window.addEventListener('scroll',requestRender,{passive:true});
   const onDive=()=>{updateAnchor();prepareObjects();if(!policy.touch||window.scrollY<height*2.5)preparePortrait();fieldObjects?.layout();requestRender();};
   window.addEventListener('portfolio-dive',onDive);
  document.addEventListener('visibilitychange',visibility);
  reduced.addEventListener('change',requestRender);
  const lost=(event:Event)=>{
   event.preventDefault();contextLost=true;cancelAnimationFrame(frame);frame=0;video.pause();wasStill=true;
   setFailed(true);window.dispatchEvent(new Event('portfolio-renderer-lost'));
  };
  const restored=()=>{
   if(disposed)return;
   contextLost=false;setFailed(false);page?.setAttribute('data-render-quality',String(quality.downgrade()));
   last=performance.now()-interval;resize();requestRender();
  };
  base.domElement.addEventListener('webglcontextlost',lost);
  base.domElement.addEventListener('webglcontextrestored',restored);
  const foreLostEvent=(event:Event)=>{event.preventDefault();foreLost=true;requestRender();};
  const foreRestoredEvent=()=>{foreLost=false;last=performance.now()-interval;resize();requestRender();};
  fore?.domElement.addEventListener('webglcontextlost',foreLostEvent);
  fore?.domElement.addEventListener('webglcontextrestored',foreRestoredEvent);
  const observer=new ResizeObserver(queueResize);observer.observe(backEl);resize();
  return()=>{disposed=true;page?.removeAttribute('data-render-quality');fieldObjects?.unmount(portraitGroup);fieldObjects?.dispose();invalidate.current=()=>{};clearTimeout(resizeTimer);cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('pointermove',move);window.removeEventListener('focusin',focus);window.removeEventListener('scroll',requestRender);window.removeEventListener('portfolio-dive',onDive);
   portraitImage.onload=null;portraitGeometry.dispose();portraitMaterials.forEach(materialToDispose=>materialToDispose.dispose());portraitTexture.dispose();document.removeEventListener('visibilitychange',visibility);reduced.removeEventListener('change',requestRender);video.removeEventListener('loadedmetadata',ready);video.removeEventListener('loadeddata',requestRender);video.removeEventListener('seeked',requestRender);video.removeEventListener('error',videoError);video.pause();video.removeAttribute('src');video.load();geometry.dispose();depthGeometry.dispose();veilGeometry.dispose();scaffoldGeometry.dispose();scaffoldMaterial.dispose();cageGeometry.dispose();cageMaterial.dispose();material.dispose();veilMaterial.dispose();glowTarget.dispose();glowCompositeMaterial.dispose();backgroundGeometry.dispose();backgroundMaterial.dispose();filmTexture.dispose();base.domElement.removeEventListener('webglcontextlost',lost);base.domElement.removeEventListener('webglcontextrestored',restored);base.dispose();base.forceContextLoss();base.domElement.remove();fore?.domElement.removeEventListener('webglcontextlost',foreLostEvent);fore?.domElement.removeEventListener('webglcontextrestored',foreRestoredEvent);fore?.dispose();fore?.forceContextLoss();fore?.domElement.remove();foreEl.remove();};
 },[dive]);
 return <><div ref={backHost} className="tide-back" aria-hidden="true"/>{failed&&<p className="tide-error">The moving field couldn&apos;t load. Your introduction and projects are still available.</p>}</>;
}
