import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRenderQuality,renderProfiles,devicePolicy,withinDiveWindow} from '../app/renderQuality.ts';
const run=(quality,start,duration,interval,eligible=true)=>{
 for(let now=start;now<start+duration;now+=interval)quality.sample(now,eligible);
};
test('smooth 60Hz and 120Hz animation keeps the original quality',()=>{
 for(const interval of [1000/60,1000/120]){const quality=createRenderQuality();run(quality,1,30000,interval);assert.equal(quality.tier,0);}
});
test('sustained missed frames lower quality, with a cooldown between tiers',()=>{
 const quality=createRenderQuality();run(quality,1,3000,40);assert.equal(quality.tier,1);
 run(quality,3001,5000,40);assert.equal(quality.tier,1);
 run(quality,8001,6000,40);assert.equal(quality.tier,2);
 run(quality,14001,30000,40);assert.equal(quality.tier,2);
});
test('one stall, transitions and background suspension do not downgrade',()=>{
 const quality=createRenderQuality();run(quality,1,2000,1000/60);quality.sample(2400,true);
 run(quality,2401,2000,1000/60);run(quality,4401,5000,50,false);
 quality.reset();run(quality,90001,5000,1000/60);assert.equal(quality.tier,0);
});
test('quality stays stable after recovery rather than oscillating',()=>{
 const quality=createRenderQuality();run(quality,1,3000,40);run(quality,3001,60000,1000/60);assert.equal(quality.tier,1);
});
test('each tier reduces canvas work but retains the effect',()=>{
 for(let i=1;i<renderProfiles.length;i++){
  assert.ok(renderProfiles[i].pixels<renderProfiles[i-1].pixels);
  assert.ok(renderProfiles[i].spacing>renderProfiles[i-1].spacing);
  assert.ok(renderProfiles[i].pixelRatio>0);
 }
});
test('phones and tablets start safely without relying on a browser user agent',()=>{
 for(const shortEdge of [390,820,1024]){
  const policy=devicePolicy({coarse:true,hover:false,touchPoints:5,shortEdge});
  assert.equal(policy.initialTier,1);
  assert.equal(policy.touch,true);
  assert.equal(policy.lookLimit*76.5*2,40);
  assert.ok(policy.pixels<=600_000);
 }
});
test('desktop retains the full sweep and quality, including touchscreen laptops',()=>{
 const policy=devicePolicy({coarse:false,hover:true,touchPoints:10,shortEdge:900});
 assert.equal(policy.lookLimit,1);assert.equal(policy.initialTier,0);
 const lowMemory=devicePolicy({coarse:false,hover:true,touchPoints:0,shortEdge:1080,memory:4});
 assert.equal(lowMemory.touch,false);
});
test('mobile layer window stays bounded as the portfolio grows and follows scrolling',()=>{
 const height=850,cardHeight=460;
 for(const count of [28,280,2800])for(const scroll of [0,10000,count*cardHeight-height]){
  const visible=Array.from({length:count},(_,i)=>i*cardHeight).filter(top=>withinDiveWindow(top,cardHeight,scroll,height));
  assert.ok(visible.length<=9);
  for(let top=Math.max(0,scroll-height);top<Math.min(count*cardHeight,scroll+2*height);top+=cardHeight){
   assert.equal(withinDiveWindow(top,cardHeight,scroll,height),true);
  }
 }
 assert.equal(withinDiveWindow(0,300,10000,height),false);
 assert.equal(withinDiveWindow(0,300,0,height),true);
});
test('context recovery lowers the current tier safely and never upgrades',()=>{
 const quality=createRenderQuality(1);assert.equal(quality.tier,1);
 assert.equal(quality.downgrade(),2);assert.equal(quality.downgrade(),2);
 run(quality,1,30000,1000/60);assert.equal(quality.tier,2);
});
