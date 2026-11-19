// A curvy scroll track down the right edge. Instead of a thumb, a small
// line-following robot drives along the tape as the page scrolls. It can be
// dragged, the track can be clicked, and it works with the keyboard.
import {t,onLang} from './i18n.js';
const NS='http://www.w3.org/2000/svg';
const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const chapters=['#home','#glass','#about','#bench','#skills','#research','#journey','#contact'].map(s=>document.querySelector(s)).filter(Boolean);

const rail=document.createElement('div');
rail.className='scroll-rail';
rail.tabIndex=0;
rail.setAttribute('role','scrollbar');
rail.setAttribute('aria-orientation','vertical');
rail.setAttribute('aria-label',t('Page scroll position'));
onLang(()=>rail.setAttribute('aria-label',t('Page scroll position')));
rail.setAttribute('aria-controls','studio-main');
rail.setAttribute('aria-valuemin','0');
rail.setAttribute('aria-valuemax','100');
rail.setAttribute('aria-valuenow','0');
// Robot drawn top-down, facing +x, centred on its axle line.
rail.innerHTML=`<svg aria-hidden="true" focusable="false">
  <path class="rail-bed"/><path class="rail-line"/><path class="rail-done"/>
  <g class="rail-ticks"></g>
  <g class="line-bot">
    <g class="bot-body">
      <rect class="bot-wheel" x="-9.5" y="-11.2" width="10" height="4.2" rx="1.6"/>
      <rect class="bot-wheel" x="-9.5" y="7" width="10" height="4.2" rx="1.6"/>
      <line class="bot-tread" x1="-9.5" y1="-9.1" x2=".5" y2="-9.1"/>
      <line class="bot-tread" x1="-9.5" y1="9.1" x2=".5" y2="9.1"/>
      <rect class="bot-chassis" x="-11.5" y="-7.4" width="21" height="14.8" rx="4.2"/>
      <rect class="bot-plate" x="-8.4" y="-4.6" width="11.4" height="9.2" rx="2"/>
      <rect class="bot-chip" x="-5.6" y="-2.1" width="4.2" height="4.2" rx=".6"/>
      <circle class="bot-led" cx="1" cy="0" r="1.05"/>
      <rect class="bot-bar" x="8.2" y="-6.6" width="3.4" height="13.2" rx="1.7"/>
      <circle class="bot-eye" cx="9.9" cy="-4.6" r=".85"/><circle class="bot-eye" cx="9.9" cy="-2.3" r=".85"/>
      <circle class="bot-eye centre" cx="9.9" cy="0" r=".95"/>
      <circle class="bot-eye" cx="9.9" cy="2.3" r=".85"/><circle class="bot-eye" cx="9.9" cy="4.6" r=".85"/>
    </g>
  </g>
</svg>`;
document.querySelector('main')?.setAttribute('id','studio-main');
document.body.append(rail);
root.classList.add('has-rail');

const svg=rail.querySelector('svg');
const bed=svg.querySelector('.rail-bed'),line=svg.querySelector('.rail-line'),done=svg.querySelector('.rail-done');
const tickLayer=svg.querySelector('.rail-ticks'),bot=svg.querySelector('.line-bot'),treads=svg.querySelectorAll('.bot-tread');

let pts=[],cum=[],total=1,width=34,ticks=[];
let shown=0,heading=Math.PI/2,travelled=0,glow=0,lastTime,frame=0,lastValue=-1;

const maxScroll=()=>Math.max(1,root.scrollHeight-innerHeight);
const progress=()=>Math.min(1,Math.max(0,scrollY/maxScroll()));

// Two blended sine waves read as a hand-laid tape rather than a mechanical zigzag.
function build(){
  const box=rail.getBoundingClientRect();
  width=box.width;const height=box.height;
  if(height<40)return;
  const pad=13,amp=Math.max(4,width/2-4),mid=width/2;
  rail.style.setProperty('--bot-scale',Math.min(1.05,Math.max(.72,width/34)).toFixed(3));
  pts=[];cum=[];total=0;
  for(let y=pad;y<=height-pad+.01;y+=3){
    const x=mid+amp*(.78*Math.sin(y/22+.6)+.22*Math.sin(y/9.5+1.9));
    if(pts.length){const p=pts[pts.length-1];total+=Math.hypot(x-p.x,y-p.y);}
    pts.push({x,y});cum.push(total);
  }
  const d='M'+pts.map(p=>p.x.toFixed(2)+' '+p.y.toFixed(2)).join('L');
  for(const path of [bed,line,done])path.setAttribute('d',d);
  done.style.strokeDasharray=total+' '+total;
  placeTicks();
  shown=progress()*total;
  draw(0);
}
function pointAt(s){
  s=Math.min(total,Math.max(0,s));
  let lo=0,hi=cum.length-1;
  while(hi-lo>1){const m=(lo+hi)>>1;if(cum[m]<=s)lo=m;else hi=m;}
  const span=cum[hi]-cum[lo]||1,t=(s-cum[lo])/span,a=pts[lo],b=pts[hi];
  return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};
}
function tangentAt(s){
  const a=pointAt(s-5),b=pointAt(s+5);
  return Math.atan2(b.y-a.y,b.x-a.x);
}
// The tape only ever moves downward, so a client y maps to one arc length.
function lengthAtY(clientY){
  const y=clientY-rail.getBoundingClientRect().top;
  if(y<=pts[0].y)return 0;
  if(y>=pts[pts.length-1].y)return total;
  let lo=0,hi=pts.length-1;
  while(hi-lo>1){const m=(lo+hi)>>1;if(pts[m].y<=y)lo=m;else hi=m;}
  const t=(y-pts[lo].y)/(pts[hi].y-pts[lo].y||1);
  return cum[lo]+(cum[hi]-cum[lo])*t;
}
function placeTicks(){
  tickLayer.replaceChildren();
  const max=maxScroll();
  ticks=chapters.map(section=>{
    const s=Math.min(1,section.offsetTop/max)*total,p=pointAt(s);
    const c=document.createElementNS(NS,'circle');
    c.setAttribute('cx',p.x);c.setAttribute('cy',p.y);c.setAttribute('r','2.7');c.setAttribute('class','rail-tick');
    tickLayer.append(c);
    return {s,c};
  });
}
function draw(dt){
  const target=progress()*total;
  const before=shown;
  if(reduced.matches||!dt)shown=target;
  else shown+=(target-shown)*(1-Math.exp(-13*dt));
  if(Math.abs(target-shown)<.04)shown=target;
  const moved=shown-before;
  travelled+=Math.abs(moved);
  // Face the direction of travel; turn around smoothly when scrolling back up.
  if(Math.abs(moved)>.02){
    const want=tangentAt(shown)+(moved<0?Math.PI:0);
    let diff=Math.atan2(Math.sin(want-heading),Math.cos(want-heading));
    heading+=reduced.matches||!dt?diff:diff*(1-Math.exp(-11*dt));
  }
  const speed=dt?Math.abs(moved)/dt:0;
  glow+=(Math.min(1,speed/90)-glow)*(dt?1-Math.exp(-8*dt):1);
  const p=pointAt(shown);
  bot.setAttribute('transform',`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${(heading*180/Math.PI).toFixed(2)})`);
  bot.style.setProperty('--glow',glow.toFixed(3));
  if(!reduced.matches)for(const t of treads)t.style.strokeDashoffset=String(-travelled*.9);
  done.style.strokeDashoffset=String(total-shown);
  for(const t of ticks)t.c.classList.toggle('passed',shown>=t.s-.5);
  const value=Math.round(progress()*100);
  if(value!==lastValue){rail.setAttribute('aria-valuenow',value);lastValue=value;}
  return Math.abs(target-shown)>.04||glow>.01;
}
function tick(now){
  frame=0;
  const dt=lastTime===undefined?0:Math.min(.05,(now-lastTime)/1000);
  lastTime=now;
  if(draw(dt))frame=requestAnimationFrame(tick);
  else lastTime=undefined;
}
function wake(){if(!frame&&pts.length)frame=requestAnimationFrame(tick);}

// Dragging the robot follows the pointer exactly; clicking the tape glides there.
let drag=null;
function seek(s,behavior){scrollTo({top:s/total*maxScroll(),behavior});}
rail.addEventListener('pointerdown',e=>{
  if(e.button!==0||!pts.length)return;
  e.preventDefault();
  rail.setPointerCapture(e.pointerId);
  const s=lengthAtY(e.clientY),onBot=Math.abs(s-shown)<15;
  drag={id:e.pointerId,y:e.clientY,live:onBot};
  rail.classList.add('dragging');
  if(!onBot)seek(s,reduced.matches?'instant':'smooth');
});
rail.addEventListener('pointermove',e=>{
  if(!drag||e.pointerId!==drag.id)return;
  if(!drag.live&&Math.abs(e.clientY-drag.y)>4)drag.live=true;
  if(drag.live)seek(lengthAtY(e.clientY),'instant');
});
function release(e){if(drag&&e.pointerId===drag.id){drag=null;rail.classList.remove('dragging');}}
rail.addEventListener('pointerup',release);rail.addEventListener('pointercancel',release);rail.addEventListener('lostpointercapture',release);
rail.addEventListener('keydown',e=>{
  const step={ArrowDown:.12,ArrowUp:-.12,PageDown:.9,PageUp:-.9}[e.key];
  if(step){scrollBy({top:step*innerHeight,behavior:reduced.matches?'instant':'smooth'});e.preventDefault();}
  else if(e.key==='Home'||e.key==='End'){scrollTo({top:e.key==='Home'?0:maxScroll(),behavior:reduced.matches?'instant':'smooth'});e.preventDefault();}
});

addEventListener('scroll',wake,{passive:true});
addEventListener('resize',()=>{build();wake();});
new ResizeObserver(()=>{build();wake();}).observe(document.body);
reduced.addEventListener('change',()=>{build();wake();});
build();
