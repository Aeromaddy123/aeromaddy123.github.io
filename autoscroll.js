// Guided opening. After the visitor's first few scrolls on page 1, the page takes
// over and glides on its own to the end of page 2: through the hand-off into the
// glass scene and while the robot writes the sentence. The speed follows a gentle
// ramp-up, steady cruise and soft landing, so the whole sequence plays smoothly.
// Once it starts it cannot be interrupted: wheel, touch, keys, the scroll rail and
// links are ignored until it lands, so it never stops halfway or jumps.
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const home=document.querySelector('#home'),glass=document.querySelector('#glass');
const TRIGGER=.06;      // fraction of a screen the visitor scrolls before the glide starts
const SPEED=.5;         // cruise speed in screens per second
const RAMP=.9;          // seconds to reach / leave cruise speed
let run=null,armed=true,intent=-1e9,touchY=null;
// Only the visitor's own downward scrolling starts the glide (not menu links or the rail).
const wants=()=>performance.now()-intent<450;

const end=()=>glass.offsetTop+glass.offsetHeight-innerHeight;
// Trapezoidal speed profile: distance covered after t seconds of a glide of length D.
function travelled(t,D,v,T){
  const r=Math.min(RAMP,T/2);
  if(t<=0)return 0;
  if(t>=T)return D;
  const vPeak=D/(T-r);
  if(t<r)return vPeak*t*t/(2*r);
  if(t<T-r)return vPeak*(t-r/2);
  const u=T-t;return D-vPeak*u*u/(2*r);
}
function start(){
  const from=scrollY,to=end(),D=to-from;
  if(D<innerHeight*.2)return;
  const v=SPEED*innerHeight,T=D/v+Math.min(RAMP,D/v);
  run={from,D,v,T,elapsed:0,last:null,frame:0};
  document.documentElement.classList.add('autoscrolling');
  const step=now=>{
    if(!run)return;
    // Advance by real frame time (capped), so a hidden tab pauses instead of jumping.
    if(run.last!==null)run.elapsed+=Math.min(.05,(now-run.last)/1000);
    run.last=now;
    const t=run.elapsed;
    scrollTo({top:run.from+travelled(t,run.D,run.v,run.T),behavior:'instant'});
    if(t>=run.T){stop();return;}
    run.frame=requestAnimationFrame(step);
  };
  run.frame=requestAnimationFrame(step);
}
function stop(){
  if(!run)return;
  cancelAnimationFrame(run.frame);run=null;
  document.documentElement.classList.remove('autoscrolling');
}

addEventListener('scroll',()=>{
  if(run)return;
  if(scrollY<4){armed=true;return;}
  if(!armed||reduced.matches)return;
  const y=scrollY;
  if(wants()&&y>innerHeight*TRIGGER&&y<home.offsetTop+home.offsetHeight){armed=false;start();}
},{passive:true});

// Note the visitor's own downward scrolling (that is what starts the glide), and
// while gliding swallow every scroll input so nothing can interrupt it.
const block=e=>{if(run&&e.cancelable){e.preventDefault();e.stopPropagation();}};
addEventListener('wheel',e=>{if(!run){if(e.deltaY>0)intent=performance.now();return;}block(e);},{passive:false,capture:true});
addEventListener('keydown',e=>{
  if(!run){if(['ArrowDown','PageDown',' ','Spacebar'].includes(e.key))intent=performance.now();return;}
  if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' ','Spacebar','Tab'].includes(e.key))block(e);
},{capture:true});
addEventListener('touchstart',e=>{touchY=e.touches[0]?.clientY??null;},{passive:true});
addEventListener('touchmove',e=>{
  if(run){block(e);return;}
  const y=e.touches[0]?.clientY;if(y==null||touchY==null)return;
  if(y-touchY<-4)intent=performance.now();
},{passive:false,capture:true});
for(const type of ['pointerdown','mousedown','click'])addEventListener(type,e=>{if(run&&e.target.closest?.('.scroll-rail, a, button'))block(e);},{capture:true});
document.addEventListener('visibilitychange',()=>{if(run)run.last=null;});
document.addEventListener('studio:glide',()=>{if(!run&&!reduced.matches){armed=false;start();}});
