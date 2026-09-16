import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createFieldObjects} from '../app/FieldObjects.ts';

test('miniatures allocate no geometry until visible, reuse it, and dispose it',()=>{
 const previousDocument=globalThis.document,previousWindow=globalThis.window;
 globalThis.window={scrollY:0};
 const cards=Array.from({length:28},(_,i)=>({getBoundingClientRect:()=>({top:20000+i*480-window.scrollY})}));
 const grid={getBoundingClientRect:()=>({left:70,right:1210}),querySelectorAll:()=>cards};
 globalThis.document={querySelector:()=>grid};
 let renders=0,scene;
 const renderer={autoClear:true,clearDepth(){},render(value){renders++;scene=value;}};
 const state={amount:1,x:0,y:0,speed:0,entry:0,travel:0,portrait:1};
 const objects=createFieldObjects();
 try{
  objects.resize(1280,800);
  objects.render(renderer,state,1/30,false);
  assert.equal(renders,0,'offscreen miniatures do not submit a render pass');
  window.scrollY=20000;
  objects.render(renderer,{...state,amount:0},1/30,false);
  assert.equal(renders,0,'2D mode never builds or renders miniatures');
  objects.render(renderer,state,1/30,false);
  assert.equal(renders,1);
  const geometries=new Set();
  scene.traverse(node=>{if(node.isMesh){geometries.add(node.geometry);assert.ok(node.geometry.attributes.position.count>0);}});
  assert.ok(geometries.size>0&&geometries.size<7,'only nearby models are constructed');
  objects.render(renderer,state,1/30,false);
  scene.traverse(node=>{if(node.isMesh)assert.ok(geometries.has(node.geometry),'geometry is reused between frames');});
  let disposed=0;
  geometries.forEach(geometry=>geometry.addEventListener('dispose',()=>disposed++));
  objects.dispose();
  assert.equal(disposed,geometries.size);
  assert.equal(renderer.autoClear,true);
 }finally{
  globalThis.document=previousDocument;globalThis.window=previousWindow;
 }
});
