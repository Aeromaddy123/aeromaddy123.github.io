// Natural page transitions. When a plain page rises over a 3D scene, the scene
// behind softly blurs and dims, like a camera pulling focus to the page. When the
// page moves off again, the next scene starts soft and sharpens into focus.
// The intro page's content also drifts into place (CSS reads --in / --out).
const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const layers=document.querySelector('.scene-layers');
const pages=[...document.querySelectorAll('.plain-page')];
const about=document.querySelector('#about');
const bench=document.querySelector('#bench');
const journey=document.querySelector('#journey');
const clamp=v=>Math.min(1,Math.max(0,v));
const smooth=t=>t*t*(3-2*t);
let frame=0,lastFilter='';
function update(){
  frame=0;
  benchTexts();
  const vh=innerHeight,phone=innerWidth<=700;
  // How strongly a plain page currently covers the 3D scene (0 = clear, 1 = full focus on the page).
  let veil=0;
  for(const p of pages){
    const r=p.getBoundingClientRect();
    if(r.bottom<=0||r.top>=vh)continue;
    const rising=r.top>0?1-r.top/vh:1;            // page coming up from below
    const leaving=r.bottom<vh?r.bottom/vh:1;      // page going off the top
    veil=Math.max(veil,Math.min(rising,leaving));
  }
  veil=reduced.matches?0:smooth(clamp(veil));
  const blur=(phone?5:9)*veil,dim=1-.1*veil;
  const filter=veil>.002?`blur(${blur.toFixed(2)}px) brightness(${dim.toFixed(3)}) saturate(${(1-.15*veil).toFixed(3)})`:'';
  if(filter!==lastFilter&&layers){layers.style.filter=filter;layers.style.transform=filter?`scale(${(1+.025*veil).toFixed(4)})`:'';lastFilter=filter;}
  if(about){
    const r=about.getBoundingClientRect();
    const enter=smooth(clamp((vh-r.top)/(vh*.85)));
    const exit=smooth(clamp((vh-r.bottom)/vh));
    about.style.setProperty('--in',enter.toFixed(3));
    about.style.setProperty('--out',exit.toFixed(3));
  }
}
// Workbench texts appear only once the bench fills the screen (CSS animates them in).
// Same for the experience page (journey-on).
function arrive(section,cls){
  if(!section)return;
  const r=section.getBoundingClientRect();
  const on=r.top<=2&&r.bottom>innerHeight*.5;
  if(on!==section.classList.contains(cls))section.classList.toggle(cls,on);
}
function benchTexts(){arrive(bench,'bench-on');arrive(journey,'journey-on');}
function wake(){if(!frame)frame=requestAnimationFrame(update);}
if(!reduced.matches)root.classList.add('motion-ok');
reduced.addEventListener('change',()=>{root.classList.toggle('motion-ok',!reduced.matches);wake();});
addEventListener('scroll',wake,{passive:true});
addEventListener('resize',wake);
update();
