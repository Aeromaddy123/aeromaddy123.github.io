// Loading screen. Every 3D model request is counted (track), the whole workshop is
// requested up front, and the screen lifts once nothing has been pending for a moment.
// A small robot hops along the progress bar; at 100 % it waves and the site fades in.
import {t,onLang} from './i18n.js';

const html=document.documentElement,box=document.querySelector('#loader');
const $=s=>box?.querySelector(s);
const fill=$('.ld-fill'),runner=$('.ld-runner'),pct=$('.ld-pct'),count=$('.ld-count'),line=$('.ld-line'),skip=$('.ld-skip');
const LINES=['Tightening the bolts','Charging the batteries','Calibrating the UR16e','Passing the red block','Teaching the G1 to stand','Mapping the forest','Warming up the soldering iron','Polishing the camera lenses'];
const MAX_WAIT=45000,SHOW_SKIP=7000,QUIET=700;
let total=0,done=0,shown=0,requested=false,finished=false,quietTimer=0,raf=0,settleWaiters=[];
const born=performance.now();

export function track(promise){
  if(finished||!box)return promise;
  total++;paint();
  const settle=()=>{done++;paint();check();};
  promise.then(settle,settle);
  return promise;
}
// Called once every scene has asked for its models.
export function allRequested(){requested=true;check();}
// Resolves when every tracked request has arrived and nothing new arrived for a moment.
export function settled(){return new Promise(r=>{if(!box||finished)r();else settleWaiters.push(r);check();});}

function check(){
  clearTimeout(quietTimer);
  if(!requested||done<total)return;
  quietTimer=setTimeout(()=>{if(done>=total){const w=settleWaiters;settleWaiters=[];w.forEach(f=>f());}},QUIET);
}
function paint(){if(!raf)raf=requestAnimationFrame(frame);}
function frame(){
  raf=0;if(!box)return;
  const target=finished?1:Math.min(.97,total?done/total:0);
  shown+=(Math.max(shown,target)-shown)*(finished?.25:.12);
  if(Math.abs(target-shown)>.002&&target>shown)paint();
  const p=Math.min(1,shown);
  box.style.setProperty('--p',p.toFixed(4));
  pct.textContent=Math.round(p*100)+' %';
  count.textContent=`${Math.min(done,total)} / ${total} ${t('3D models')}`;
  line.textContent=finished?t('Ready!'):t(LINES[Math.min(LINES.length-1,Math.floor(p*LINES.length))])+'…';
}
// Lift the screen: the robot waves, then everything fades in.
export function reveal(){
  if(finished||!box){html.classList.remove('loading');return;}
  finished=true;paint();
  box.classList.add('ld-done');
  const wait=Math.max(0,900-(performance.now()-born));   // never just a flash
  setTimeout(()=>{
    box.classList.add('ld-out');html.classList.remove('loading');
    if(location.hash)document.querySelector(location.hash)?.scrollIntoView();   // keep deep links working
    setTimeout(()=>box.remove(),700);
  },wait+650);
}
if(box){
  if(!location.hash)scrollTo(0,0);
  paint();onLang(()=>paint());
  setTimeout(()=>skip?.removeAttribute('hidden'),SHOW_SKIP);
  skip?.addEventListener('click',reveal);
  setTimeout(reveal,MAX_WAIT);   // a slow connection never keeps people out
}
