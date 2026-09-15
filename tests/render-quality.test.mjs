import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRenderQuality,renderProfiles} from '../app/renderQuality.ts';
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
