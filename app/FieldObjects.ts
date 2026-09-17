import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {ConvexGeometry} from 'three/addons/geometries/ConvexGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import type {DiveState} from './useScaffoldDive';

type Point=[number,number,number];

// Bake each miniature into one vertex-colored mesh: one draw call per object, no model downloads.
function miniature(build:(add:(geometry:THREE.BufferGeometry,color:string,position?:Point,rotation?:Point)=>void)=>void){
 const parts:THREE.BufferGeometry[]=[];
 const matrix=new THREE.Matrix4(),quaternion=new THREE.Quaternion();
 build((geometry,color,position=[0,0,0],rotation=[0,0,0])=>{
  quaternion.setFromEuler(new THREE.Euler(...rotation));
  matrix.compose(new THREE.Vector3(...position),quaternion,new THREE.Vector3(1,1,1));
  geometry.applyMatrix4(matrix);
  const flat=geometry.index?geometry.toNonIndexed():geometry;
  if(flat!==geometry)geometry.dispose();
  flat.deleteAttribute('uv');
  const shade=new THREE.Color(color),colors=new Float32Array(flat.getAttribute('position').count*3);
  for(let i=0;i<colors.length;i+=3){colors[i]=shade.r;colors[i+1]=shade.g;colors[i+2]=shade.b;}
  flat.setAttribute('color',new THREE.BufferAttribute(colors,3));parts.push(flat);
 });
 const merged=mergeGeometries(parts);parts.forEach(part=>part.dispose());return merged;
}
const box=(x:number,y:number,z:number,r=.035)=>new RoundedBoxGeometry(x,y,z,2,r);

function cube(){
 return miniature(add=>{
  const colors=['#f1eee0','#ffca32','#e93842','#ff792e','#329bfa','#39c681'];
  add(box(2,2,2,.1),'#131c25');
  const faces:Point[]=[[0,0,0],[0,Math.PI,0],[0,Math.PI/2,0],[0,-Math.PI/2,0],[-Math.PI/2,0,0],[Math.PI/2,0,0]];
  faces.forEach((rotation,face)=>{
   const orientation=new THREE.Euler(...rotation);
   for(let row=-1;row<=1;row++)for(let column=-1;column<=1;column++){
    const p=new THREE.Vector3(column*.65,row*.65,1.015).applyEuler(orientation);
    add(box(.59,.59,.045,.065),colors[face],p.toArray() as Point,rotation);
   }
  });
 });
}
function camera(){
 return miniature(add=>{
  add(box(2.45,1.52,.84,.19),'#303744');
  add(box(.62,1.63,1.02,.17),'#1d2530',[-.99,-.03,.13]); // deep right-hand grip
  add(box(.92,.45,.73,.12),'#343d4b',[.06,.87,-.03]); // pentaprism hump
  add(box(.48,.07,.39,.025),'#9ea6af',[.06,1.12,-.04]); // hot shoe
  add(box(.83,.065,.53,.04),'#242d37',[.86,.77,-.06]);
  add(new THREE.CylinderGeometry(.23,.23,.11,20),'#89939c',[.87,.85,-.05]);
  add(new THREE.CylinderGeometry(.1,.12,.065,16),'#c0c5c3',[-.98,.84,.26]);
  // Concentric barrel sections, glass, and the red lens accent.
  const barrel=(radius:number,length:number,z:number,color:string)=>add(new THREE.CylinderGeometry(radius,radius,length,32),color,[.07,-.03,z],[Math.PI/2,0,0]);
  barrel(.64,.18,.49,'#64717a');barrel(.59,.72,.84,'#1b2634');
  barrel(.63,.14,1.01,'#343f4d');barrel(.605,.035,1.10,'#cd4145');barrel(.59,.22,1.23,'#273344');
  barrel(.51,.025,1.35,'#070f21');barrel(.405,.03,1.37,'#17485e');barrel(.31,.035,1.39,'#101f36');
  add(new THREE.TorusGeometry(.48,.025,6,32),'#a8bfc3',[.07,-.03,1.385]);
  add(new THREE.SphereGeometry(.085,10,8),'#72b8c4',[-.06,.11,1.42]);
  add(box(1.48,1.02,.055,.07),'#74828b',[.08,-.06,-.447]); // rear display
  add(box(1.29,.83,.04,.04),'#122c3a',[.08,-.06,-.49]);
  add(new THREE.CylinderGeometry(.17,.17,.06,16),'#78868c',[-.94,-.12,-.465],[Math.PI/2,0,0]);
  for(let i=0;i<3;i++)add(new THREE.SphereGeometry(.047,8,6),'#8b989c',[.98,.27-i*.22,-.46]);
  add(box(.12,.35,.1,.03),'#ba393e',[-1.23,.33,.48]);
 });
}
function piano(){
 return miniature(add=>{
  add(box(4.4,.34,1.35,.08),'#202632');
  add(box(4.18,.16,.28,.04),'#333d4b',[0,.21,-.49]);
  for(let key=0;key<21;key++){
   const x=(key-10)*.192;
   add(box(.182,.12,.91,.012),'#f4efe1',[x,.22,.11]);
   if([0,1,3,4,5].includes(key%7)&&key<20)
    add(box(.112,.16,.55,.015),'#141b24',[x+.096,.34,-.07]);
  }
  add(box(.48,.012,.13,.012),'#435963',[-1.43,.298,-.48]);
  for(let i=0;i<3;i++)add(new THREE.CylinderGeometry(.035,.035,.025,8),'#ca5148',[1.42+i*.14,.31,-.47]);
 });
}
const oval=(x:number,y:number,z:number)=>new THREE.SphereGeometry(1,12,8).scale(x,y,z);
function beam(from:Point,to:Point,width:number,depth=width){
 const start=new THREE.Vector3(...from),end=new THREE.Vector3(...to),direction=end.clone().sub(start);
 const geometry=box(width,direction.length(),depth,Math.min(width*.15,.06));
 geometry.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize()));
 return geometry.translate(...start.add(end).multiplyScalar(.5).toArray() as Point);
}
function metagross(){
 return miniature(add=>{
  const blue='#579ebc',dark='#2f5c77',silver='#d8dde0';
  const head=new THREE.SphereGeometry(1,16,10).scale(1.13,.72,.96);
  const positions=head.getAttribute('position');
  // A broad, flattened face and domed crown, rather than a thin oval body.
  for(let i=0;i<positions.count;i++)positions.setZ(i,Math.min(.77,positions.getZ(i)));
  head.computeVertexNormals();add(head,blue,[0,.40,0]);
  add(oval(.78,.23,.68),dark,[0,-.12,0]);
  for(const side of [-1,1])for(const fore of [-1,1]){
   const z=fore===1?1:-.86;
   add(oval(.26,.29,.28),dark,[side*.99,.40,z*.48]);
   add(beam([side*.98,.46,z*.50],[side*1.35,.42,z*.86],.30),blue);
   const points:THREE.Vector3[]=[];
   // Tall pointed shoulder, muscular forearm, and a broad cuff around the claws.
   for(const [x,y,depth,r] of [[1.28,1.12,.64,.06],[1.40,.63,.80,.22],[1.53,-.02,1.03,.31],[1.45,-.52,1.18,.26]]){
    for(let ring=0;ring<8;ring++){
     const angle=ring*Math.PI/4;
     points.push(new THREE.Vector3(side*(x+Math.cos(angle)*r),y,fore*depth+Math.sin(angle)*r));
    }
   }
   add(new ConvexGeometry(points),blue);
   add(new THREE.CylinderGeometry(.35,.38,.20,8),blue,[side*1.45,-.58,fore*1.18]);
   for(let claw=-1;claw<=1;claw++){
    add(new THREE.ConeGeometry(claw===0?.135:.10,claw===0?.35:.25,5),silver,[side*1.45+claw*.22,-.79,fore*1.20],[Math.PI,0,0]);
   }
  }
  for(const side of [-1,1]){
   add(oval(.27,.155,.045),'#182d3d',[side*.46,.38,.802],[0,0,side*.18]);
   add(oval(.135,.117,.025),'#eb344c',[side*.46,.38,.85]);
   add(oval(.05,.078,.016),'#182538',[side*.46,.38,.878]);
   add(oval(.025,.029,.01),'#fff3e1',[side*.43,.426,.897]);
  }
  // The oversized silver faceplate remains readable at miniature scale.
  add(box(2.06,.255,.12,.025),silver,[0,.38,.923],[0,0,.57]);
  add(box(2.06,.255,.12,.025),silver,[0,.38,.928],[0,0,-.57]);
 });
}
function endurance(){
 return miniature(add=>{
  add(new THREE.TorusGeometry(1.3,.045,6,48),'#65717e');
  add(new THREE.TorusGeometry(1.3,.025,5,48),'#899ca6',[0,0,-.17]);
  for(let i=0;i<12;i++){
   const angle=i*Math.PI/6,x=Math.cos(angle)*1.3,y=Math.sin(angle)*1.3;
   add(box(.43,.39,.39,.018),i%3===0?'#aab1b4':'#d5d3c8',[x,y,0],[0,0,angle]);
   add(box(.30,.22,.018,.006),'#525e69',[x,y,.21],[0,0,angle]);
   add(box(.045,.34,.025,.003),'#b9ac89',[x,y,.225],[0,0,angle]);
   if(i%3===0)for(const offset of [-.1,.1]){
    add(new THREE.CylinderGeometry(.065,.095,.20,10),'#3b4857',[x+offset,y,-.30],[Math.PI/2,0,0]);
    add(new THREE.CylinderGeometry(.05,.05,.018,10),'#95b8d2',[x+offset,y,-.41],[Math.PI/2,0,0]);
   }
  }
  for(let i=0;i<3;i++){
   const angle=i*Math.PI*2/3;
   add(beam([0,0,-.13],[Math.cos(angle)*1.15,Math.sin(angle)*1.15,-.13],.035),'#6d7981');
  }
  add(new THREE.CylinderGeometry(.19,.19,.56,12),'#c7c9c3',[0,0,.04],[Math.PI/2,0,0]);
  add(new THREE.TorusGeometry(.14,.035,6,16),'#728693',[0,0,.34]);
  for(const side of [-1,1]){
   add(box(.19,.55,.13,.025),'#deded3',[side*.34,-.08,.22],[0,0,side*.25]);
   add(box(.12,.15,.035,.01),'#394c60',[side*.34,.08,.30],[0,0,side*.25]);
  }
 });
}
function mako(){
 return miniature(add=>{
  const coat='#555459',shadow='#404146',white='#eee9df';
  // Mako's round cheeks, charcoal-gray coat, white bib and little white mittens.
  add(oval(.55,.76,.45),coat,[0,-.22,-.05]);
  add(oval(.51,.45,.44),coat,[0,.66,.06]);
  add(oval(.31,.45,.095),white,[0,.01,.375]);
  add(oval(.25,.40,.065),white,[0,-.47,.385]);
  for(const side of [-1,1]){
   add(oval(.28,.35,.34),coat,[side*.37,-.65,-.08]);
   add(oval(.16,.12,.24),white,[side*.39,-.91,.10]);
   add(beam([side*.24,-.06,.24],[side*.23,-.84,.34],.19),coat);
   add(oval(.135,.14,.19),white,[side*.23,-.88,.39]);
   // Broad-based, compact ears, with dark inner fur instead of bright pink cones.
   const earPoints:Point[]=[[side*.22,.94,.04],[side*.52,.86,.05],[side*.48,1.21,.015],[side*.29,.98,-.12],[side*.50,.88,-.10]];
   add(new ConvexGeometry(earPoints.map(p=>new THREE.Vector3(...p))),coat);
   add(new ConvexGeometry([[side*.29,.985,.071],[side*.465,.947,.073],[side*.457,1.145,.042],[side*.36,1.01,.066]].map(p=>new THREE.Vector3(...p))),'#756769');
   add(oval(.13,.115,.033),shadow,[side*.205,.723,.449]);
   add(oval(.100,.093,.033),'#929e90',[side*.205,.718,.472]);
   add(oval(.069,.079,.019),'#161c20',[side*.205,.721,.499]);
   add(oval(.023,.026,.009),'#f7f2e9',[side*.18,.752,.519]);
   add(oval(.117,.092,.07),white,[side*.081,.505,.461]);
   for(let whisker=0;whisker<3;whisker++){
    const start=new THREE.Vector3(side*.12,.51,.513);
    const end=new THREE.Vector3(side*(.59+whisker*.035),.49+(whisker-1)*.065,.435);
    const curve=new THREE.QuadraticBezierCurve3(start,new THREE.Vector3(side*.38,.53+(whisker-1)*.035,.50),end);
    add(new THREE.TubeGeometry(curve,6,.0045,4,false),'#d6d5ce');
   }
  }
  // Tapered blaze follows the head surface from the nose up between the eyes.
  const blazeVertices:number[]=[],blazeIndices:number[]=[];
  for(let row=0;row<=12;row++){
   const t=row/12,y=.49+t*.39,halfWidth=.125*Math.pow(1-t,1.35)+.006;
   for(let col=0;col<=6;col++){
    const x=(col/3-1)*halfWidth;
    const z=.06+.44*Math.sqrt(Math.max(0,1-(x/.51)**2-((y-.66)/.45)**2))+.007;
    blazeVertices.push(x,y,z);
    if(row<12&&col<6){const i=row*7+col;blazeIndices.push(i,i+1,i+7,i+1,i+8,i+7);}
   }
  }
  const blaze=new THREE.BufferGeometry();blaze.setAttribute('position',new THREE.Float32BufferAttribute(blazeVertices,3));blaze.setIndex(blazeIndices);blaze.computeVertexNormals();add(blaze,white);
  add(oval(.065,.043,.035),'#cf9b9f',[0,.535,.538]);
  add(beam([0,.503,.530],[0,.470,.528],.009),'#8d7779');
  add(oval(.16,.075,.08),white,[0,.425,.407]);
  add(new THREE.TorusGeometry(.235,.026,5,20),'#566961',[0,.284,.145],[Math.PI/2,0,0]);
  add(new THREE.TorusGeometry(.026,.007,4,10),'#b8b6a3',[0,.243,.445]);
  add(oval(.090,.104,.018),'#87968d',[0,.145,.46]);
  const tail=new THREE.CatmullRomCurve3([new THREE.Vector3(.35,-.67,-.24),new THREE.Vector3(.68,-.82,-.05),new THREE.Vector3(.64,-.91,.40),new THREE.Vector3(.32,-.97,.60),new THREE.Vector3(-.13,-.97,.57)]);
  add(new THREE.TubeGeometry(tail,18,.105,8,false),coat);
 });
}
function tesla(){
 return miniature(add=>{
  const red='#b91f38',glass='#344958',trim='#18232c';
  const curve=(points:Point[])=>new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  const tube=(points:Point[],color:string,r=.012)=>add(new THREE.TubeGeometry(curve(points),24,r,6,false),color);
  // Longitudinal sections: length, half-width, deck height. The shoulders and
  // rounded bumper now taper in three dimensions instead of extruding a slab.
  const bodyProfile=curve([
   [-2.36,.62,.73],[-2.25,.82,.83],[-1.80,.915,.91],[-1.30,.927,.92],
   [-.3,.927,.92],[.70,.927,.91],[1.35,.918,.84],[1.88,.89,.79],
   [2.22,.77,.67],[2.36,.59,.62]
  ]);
  const sections=144,around=24,vertices:number[]=[],indices:number[]=[];
  const sectionShape=[[0,1],[.42,.995],[.77,.97],[.92,.975],[.99,.88],[1,.51],[.99,.22],[.91,0],[.60,0],[0,0],[-.60,0],[-.91,0],[-.99,.22],[-1,.51],[-.99,.88],[-.92,.975],[-.77,.97],[-.42,.995],[0,1]];
  const sectionCurve=new THREE.CatmullRomCurve3(sectionShape.map(([x,y])=>new THREE.Vector3(x,y,0)));
  for(let row=0;row<=sections;row++){
   const sample=bodyProfile.getPoint(row/sections),z=sample.x;
   const endTaper=THREE.MathUtils.smoothstep(Math.abs(z),2.22,2.37);
   for(let col=0;col<=around;col++){
    const section=sectionCurve.getPoint(col/around),x=section.x*sample.y;
    const bottom=.18+endTaper*.12;
    let y=THREE.MathUtils.lerp(bottom,sample.z,section.y);
    // Open wheel wells extend into the side surface, with a narrow painted lip.
    const wheelDistance=Math.min(Math.abs(z-1.40),Math.abs(z+1.40));
    if(wheelDistance<.384&&Math.abs(section.x)>.82){
     const arch=.355+Math.sqrt(.384**2-wheelDistance**2);
     y=Math.max(y,THREE.MathUtils.lerp(bottom,arch,THREE.MathUtils.smoothstep(Math.abs(section.x),.82,.96)));
    }
    vertices.push(x,y,z);
   }
  }
  for(let row=0;row<sections;row++)for(let col=0;col<around;col++){
   const a=row*(around+1)+col,b=a+1,c=b+around+1,d=a+around+1;indices.push(a,d,b,b,d,c);
  }
  // End caps sit behind the rounded nose and trunk face.
  for(const end of [0,sections]){
   const center=vertices.length/3,sample=bodyProfile.getPoint(end/sections);vertices.push(0,.46,sample.x);
   for(let col=0;col<around;col++){
    const a=end*(around+1)+col;indices.push(...(end===0?[center,a,a+1]:[center,a+1,a]));
   }
  }
  const body=new THREE.BufferGeometry();body.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));body.setIndex(indices);body.computeVertexNormals();add(body,red);
  // A flatter panoramic roof and defined side windows replace the bubble canopy.
  const roofProfile=curve([[-1.61,.78,.93],[-1.15,.75,1.20],[-.60,.718,1.41],[.05,.705,1.43],[.49,.72,1.32],[1.14,.78,.90]]);
  const roofCross=[[-1,0],[-.99,.10],[-.86,.75],[-.70,.97],[0,1],[.70,.97],[.86,.75],[.99,.10],[1,0]];
  const roofVertices:number[]=[],roofIndices:number[]=[],roofRows=36;
  for(let row=0;row<=roofRows;row++){
   const p=roofProfile.getPoint(row/roofRows),base=.895;
   for(const [x,h] of roofCross)roofVertices.push(x*p.y,base+h*(p.z-base),p.x);
  }
  for(let row=0;row<roofRows;row++)for(let col=0;col<roofCross.length-1;col++){
   const a=row*roofCross.length+col,b=a+1,d=a+roofCross.length;roofIndices.push(a,d,b,b,d,d+1);
  }
  const roof=new THREE.BufferGeometry();roof.setAttribute('position',new THREE.Float32BufferAttribute(roofVertices,3));roof.setIndex(roofIndices);roof.computeVertexNormals();add(roof,glass);
  for(const side of [-1,1]){
   const rail:Point[]=[],belt:Point[]=[];
   for(let row=0;row<=24;row++){
    const p=roofProfile.getPoint(row/24);rail.push([side*p.y*.86,.898+(p.z-.895)*.75,p.x]);belt.push([side*p.y,.90,p.x]);
   }
   tube(rail,red,.027);tube(belt,trim,.014);
   tube([[side*.75,.905,-.27],[side*.66,1.205,-.27],[side*.62,1.295,-.27]],trim,.033);
   add(box(.18,.09,.24,.04),red,[side*.985,.955,.77]);
   add(box(.018,.028,.15,.006),trim,[side*.933,.822,.45]);
   add(box(.018,.028,.15,.006),trim,[side*.933,.826,-.66]);
   tube([[side*.932,.80,.83],[side*.934,.49,.76],[side*.915,.245,.71]],'#842338',.005);
   tube([[side*.934,.82,-.29],[side*.935,.51,-.31],[side*.916,.245,-.33]],'#842338',.005);
   tube([[side*.911,.27,-1.02],[side*.916,.24,0],[side*.911,.27,1.02]],'#7d2435',.012);
   // Swept, tapered lamp housings, with a hooked daylight-running-light edge.
   const lamp:Point[]=[[.45,.682,2.278],[.79,.738,2.078],[.877,.806,1.833],[.846,.695,2.042],[.61,.653,2.257]];
   const shell=lamp.flatMap(([x,y,z])=>[new THREE.Vector3(side*x,y+.006,z),new THREE.Vector3(side*x,y-.026,z)]);
   add(new ConvexGeometry(shell),trim);
   tube([[side*.47,.692,2.282],[side*.67,.725,2.174],[side*.795,.765,2.031],[side*.868,.813,1.844]],'#e4f3fa',.012);
   tube([[side*.474,.677,2.287],[side*.68,.700,2.20],[side*.814,.724,2.072]],'#7c9cae',.011);
   for(let diode=0;diode<3;diode++)add(oval(.027,.014,.041),'#a3bdc9',[side*(.64+diode*.064),.706+diode*.018,2.188-diode*.077],[0,side*.6,0]);
   // Rear C-shaped lamps wrap into the quarter panel, as in the supplied photo.
   const tail:Point[]=[[side*.34,.74,-2.306],[side*.68,.748,-2.277],[side*.818,.702,-2.212],[side*.839,.552,-2.153],[side*.63,.545,-2.258]];
   tube(tail,trim,.047);tube(tail.map(([x,y,z])=>[x,y+.008,z-.012] as Point),'#e85865',.018);
   for(const z of [-1.40,1.40]){
    add(new THREE.CylinderGeometry(.351,.351,.18,32),'#111820',[side*.866,.355,z],[0,0,Math.PI/2]);
    add(new THREE.CylinderGeometry(.278,.278,.19,32),'#39414a',[side*.875,.355,z],[0,0,Math.PI/2]);
    add(new THREE.TorusGeometry(.264,.012,6,32),'#67717a',[side*.975,.355,z],[0,Math.PI/2,0]);
    for(let spoke=0;spoke<7;spoke++){
     const angle=spoke*Math.PI*2/7;
     const spokePoints=[[.07,angle],[.26,angle+.10],[.253,angle+.48],[.10,angle+.35]].map(([r,a])=>new THREE.Vector3(side*.98,.355+Math.cos(a)*r,z+Math.sin(a)*r));
     spokePoints.push(new THREE.Vector3(side*.97,.355+Math.cos(angle)*.13,z+Math.sin(angle)*.13));
     add(new ConvexGeometry(spokePoints),'#66717b');
    }
    add(new THREE.CylinderGeometry(.065,.065,.205,12),'#929aa0',[side*.883,.355,z],[0,0,Math.PI/2]);
   }
  }
  // Hood shut-lines, low front intake, and a subtle integrated trunk lip.
  for(const side of [-1,1])tube([[side*.71,.901,1.09],[side*.64,.82,1.65],[side*.47,.696,2.18],[side*.30,.666,2.29]],'#862638',.005);
  tube([[-.30,.666,2.29],[0,.653,2.31],[.30,.666,2.29]],'#862638',.005);
  add(box(1.24,.105,.055,.045),trim,[0,.29,2.295]);
  tube([[-.68,.237,2.19],[0,.213,2.335],[.68,.237,2.19]],'#ca4054',.015);
  tube([[-.77,.852,-2.19],[0,.854,-2.31],[.77,.852,-2.19]],'#d64958',.018);
  add(box(1.21,.15,.08,.045),trim,[0,.26,-2.269]);
  add(box(.115,.008,.025,.002),'#c6d1d6',[0,.705,2.16]);
  add(box(.025,.008,.065,.002),'#c6d1d6',[0,.705,2.14]);
  add(box(.27,.135,.017,.007),'#d8dddf',[0,.52,-2.372]);
 });
}

export function createFieldObjects(){
 const scene=new THREE.Scene(),cameraView=new THREE.PerspectiveCamera(45,1,1,30000);
 const rig=new THREE.Group(),documentSpace=new THREE.Group();scene.add(rig);rig.add(documentSpace);
 scene.add(new THREE.HemisphereLight('#d7ecff','#403453',2.1));
 const key=new THREE.DirectionalLight('#fff0da',3.1);key.position.set(-500,650,900);scene.add(key);
 const rim=new THREE.DirectionalLight('#79c4fa',2.2);rim.position.set(550,100,-300);scene.add(rim);
 const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.43,metalness:.16,transparent:true});
 const specifications=[
  {build:cube,name:'Rubik’s cube',size:2.6,tilt:.3,spin:.19,phase:.55,gap:1.25,depth:-210,scale:1},
  {build:camera,name:'Canon Rebel T5i inspired camera',size:2.6,tilt:.14,spin:-.13,phase:-.35,gap:1.75,depth:-360,scale:1.1},
  {build:piano,name:'Piano keyboard',size:4.4,tilt:.70,spin:.10,phase:-.2,gap:1.4,depth:-190,scale:1.1},
  {build:metagross,name:'Metagross',size:3.8,tilt:.17,spin:-.09,phase:.3,gap:1.0,depth:-150,scale:1.25},
  {build:endurance,name:'Endurance',size:3.0,tilt:.25,spin:.10,phase:-.3,gap:2.0,depth:-430,scale:1.15},
  {build:mako,name:'Mako',size:2.0,tilt:.08,spin:-.10,phase:-.35,gap:1.45,depth:-280,scale:1},
  {build:tesla,name:'Red 2025 Model 3',size:4.6,tilt:.22,spin:.075,phase:.75,gap:1.15,depth:-170,scale:1.30},
 ];
 const models=specifications.map(({build,name,...motion})=>{
  const anchor=new THREE.Group();documentSpace.add(anchor);
  return {anchor,mesh:null as THREE.Mesh|null,build,name,...motion};
 });
  const frustum=new THREE.Frustum(),projection=new THREE.Matrix4(),sphere=new THREE.Sphere();
  let width=1,height=1,ready=false,time=0,wasActive=false,lastPerspective=0,external=0;
 const layout=()=>{
  const grid=document.querySelector<HTMLElement>('.project-grid');if(!grid)return;
  const cards=[...grid.querySelectorAll<HTMLElement>('[data-field-card]')];if(!cards.length){ready=false;return;}
  const bounds=grid.getBoundingClientRect(),rows:number[]=[];
  for(const card of cards){const top=card.getBoundingClientRect().top+window.scrollY;if(!rows.some(row=>Math.abs(row-top)<4))rows.push(top);}
  const size=Math.min(180,Math.max(85,width*.145));
  models.forEach(({anchor,size:modelSize,gap,depth,scale},index)=>{
   const side=index%2===1?1:-1,x=side<0?bounds.left-size*gap:bounds.right+size*gap;
   const rowPosition=index*(rows.length-1)/Math.max(1,models.length-1);
   const row=Math.floor(rowPosition),blend=rowPosition-row;
   const rowTop=THREE.MathUtils.lerp(rows[row],rows[Math.min(row+1,rows.length-1)],blend);
   anchor.position.set(x-width/2,height/2-(rowTop+Math.min(230,size*1.3)),depth);
   anchor.scale.setScalar(size*scale/modelSize);
  });ready=true;
 };
  return {
   resize(w:number,h:number){width=w;height=h;lastPerspective=0;layout();},
   layout,
   // External 3D content shares this scene, so it depth-sorts with the miniatures.
   mount(object:THREE.Object3D){documentSpace.add(object);external++;},
   unmount(object:THREE.Object3D){documentSpace.remove(object);external=Math.max(0,external-1);},
   render(renderer:THREE.WebGLRenderer,depth:DiveState|undefined,dt:number,reduced:boolean){
   // Keep rendering through the portrait's exit tail, when the camera amount has already returned to zero.
   const amount=depth?.amount??0,active=amount>.01||(external>0&&(depth?.portrait??0)>.01);
   if(active&&!wasActive)layout();wasActive=active;
   if(!active||!ready)return;
   if(!reduced)time+=dt;
   const strength=reduced?.1:1,perspective=1100-480*amount;
   if(perspective!==lastPerspective){
    cameraView.aspect=width/height;cameraView.fov=THREE.MathUtils.radToDeg(2*Math.atan(height/(2*perspective)));
    cameraView.position.z=perspective;cameraView.updateProjectionMatrix();lastPerspective=perspective;
   }
   rig.position.set((depth?.x??0)*amount*strength*45,-(depth?.y??0)*amount*strength*35,(-170*amount-240*(depth?.entry??0))*strength);
   rig.rotation.set((depth?.y??0)*amount*strength*1.335177,(depth?.x??0)*amount*strength*1.335177,0,'XYZ');
   documentSpace.position.y=window.scrollY;
   material.opacity=THREE.MathUtils.smoothstep(amount,.04,.65);
   scene.updateMatrixWorld();cameraView.updateMatrixWorld();
   frustum.setFromProjectionMatrix(projection.multiplyMatrices(cameraView.projectionMatrix,cameraView.matrixWorldInverse));
   let visible=0;
   models.forEach((model,index)=>{
    const {anchor,tilt,spin,phase,size,build,name}=model;
    anchor.getWorldPosition(sphere.center);sphere.radius=size*anchor.scale.x+18;
    // Build the original, full-detail geometry only when it can enter the view.
    // No tessellation, merged-array allocation or upload for offscreen miniatures.
    if(!frustum.intersectsSphere(sphere)){if(model.mesh)model.mesh.visible=false;return;}
    if(!model.mesh){model.mesh=new THREE.Mesh(build(),material);model.mesh.name=name;anchor.add(model.mesh);}
    const mesh=model.mesh;mesh.visible=true;visible++;
    mesh.rotation.set(tilt+Math.sin(time*.27+index)*.12,name==='Endurance'?phase+Math.sin(time*.18)*.35:time*spin+phase,name==='Endurance'?time*spin:Math.sin(time*.18+index)*.10);
    mesh.position.y=Math.sin(time*.5+index*2)*9/anchor.scale.x;
   });
   // Render when a miniature is in view, or whenever external content is mounted.
   if(visible||external>0){renderer.autoClear=false;renderer.clearDepth();renderer.render(scene,cameraView);renderer.autoClear=true;}
  },
  dispose(){models.forEach(({mesh})=>mesh?.geometry.dispose());material.dispose();scene.clear();}
 };
}
