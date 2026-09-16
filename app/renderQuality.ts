/** Lower decorative GPU cost only after sustained missed animation frames.
 * Keep the chosen tier for this visit: repeated upgrades cause visible oscillation.
 */
export const renderProfiles = [
 {pixelRatio:1.25,pixels:1_800_000,spacing:6.5,columns:240,rows:160,glowScale:.28},
 {pixelRatio:1,pixels:1_100_000,spacing:8,columns:200,rows:134,glowScale:.24},
 {pixelRatio:.8,pixels:700_000,spacing:10,columns:160,rows:108,glowScale:.20},
] as const;

export type DeviceHints={coarse:boolean;hover:boolean;touchPoints:number;shortEdge:number;memory?:number};
export function devicePolicy(hints:DeviceHints){
 const touch=hints.coarse&&(!hints.hover||(hints.touchPoints>0&&hints.shortEdge<=900));
 const constrained=touch||(hints.memory!==undefined&&hints.memory<=4);
 return {touch,constrained,initialTier:constrained?1:0,
  lookLimit:touch?20/76.5:1,pixelRatio:constrained?1:1.25,pixels:constrained?600_000:1_800_000};
}
export function currentDevicePolicy(){
 return devicePolicy({coarse:matchMedia('(pointer: coarse)').matches,hover:matchMedia('(hover: hover)').matches,
  touchPoints:navigator.maxTouchPoints,shortEdge:Math.min(innerWidth,innerHeight),
  memory:(navigator as Navigator&{deviceMemory?:number}).deviceMemory});
}

// A generous window covers the entire 40-degree mobile camera sweep, including
// cards pulled into view by perspective. Desktop keeps the complete scene.
export function withinDiveWindow(top:number,height:number,scroll:number,viewport:number){
 return top+height>=scroll-viewport*1.5&&top<=scroll+viewport*2.5;
}

export function createRenderQuality(initialTier=0){
 let tier=Math.max(0,Math.min(renderProfiles.length-1,initialTier)),last=0,elapsed=0,frames=0,slow=0,cooldown=0;
 const reset=()=>{last=0;elapsed=frames=slow=0;};
 return {
  get tier(){return tier;},
  reset,
  downgrade(){tier=Math.min(tier+1,renderProfiles.length-1);reset();return tier;},
  sample(now:number,eligible:boolean):number|null{
   if(!eligible){reset();return null;}
   const delta=last?now-last:0;last=now;
   // Ignore startup, background-tab suspension, and isolated long tasks.
   if(delta<=0||delta>250||now<cooldown){elapsed=frames=slow=0;return null;}
   elapsed+=delta;frames++;if(delta>24)slow++;
   if(elapsed<2400||frames<30)return null;
   const struggling=elapsed/frames>26||slow/frames>.3;
   elapsed=frames=slow=0;
   if(!struggling||tier===renderProfiles.length-1)return null;
   tier++;cooldown=now+7000;return tier;
  },
 };
}
