/** Lower decorative GPU cost only after sustained missed animation frames.
 * Keep the chosen tier for this visit: repeated upgrades cause visible oscillation.
 */
export const renderProfiles = [
 {pixelRatio:1.25,pixels:1_800_000,spacing:6.5,columns:240,rows:160,glowScale:.28},
 {pixelRatio:1,pixels:1_100_000,spacing:8,columns:200,rows:134,glowScale:.24},
 {pixelRatio:.8,pixels:700_000,spacing:10,columns:160,rows:108,glowScale:.20},
] as const;

export function createRenderQuality(){
 let tier=0,last=0,elapsed=0,frames=0,slow=0,cooldown=0;
 const reset=()=>{last=0;elapsed=frames=slow=0;};
 return {
  get tier(){return tier;},
  reset,
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
