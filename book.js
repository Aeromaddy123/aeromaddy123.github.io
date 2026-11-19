// Project book. Clicking a project lifts a hardback out of the scene. Pages are turned
// by StPageFlip (MIT, assets/vendor): soft paper pages fold and bend with moving
// shadows, the covers are stiff boards, corners peel on hover and can be dragged.
// Each spread puts a video or photo (left page, at its own aspect ratio — never
// letterboxed) beside the story (right page). Phones get one page at a time.
import {PageFlip} from './assets/vendor/page-flip.module.js';
import {t} from './i18n.js';

const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let active=null;
const el=(tag,cls,html)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(html!=null)n.innerHTML=html;return n;};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const wait=ms=>new Promise(r=>setTimeout(r,reduced.matches?0:ms));

function page(cls,{hard=false}={}){
  const p=el('div','bk-pg '+cls);
  if(hard)p.dataset.density='hard';
  return p;
}
function folio(p,n){p.append(el('span','bk-folio',String(n)));}
function media(sp){
  const fig=el('figure','bk-fig');
  const frame=el('div','bk-media');frame.style.setProperty('--w',sp.w);frame.style.setProperty('--h',sp.h);
  if(sp.doc){
    // An attached document: its first page, mounted like a print, opens the PDF.
    frame.classList.add('bk-docthumb');
    const a=el('a');a.href=sp.doc;a.target='_blank';a.rel='noopener';a.setAttribute('aria-label',`${t('Open')} ${sp.caption}`);
    const img=el('img');img.src=sp.image;img.alt='';img.draggable=false;a.append(img,el('span','bk-docbadge',t('PDF · Open')));frame.append(a);
  }
  else if(sp.image){const img=el('img');img.src=sp.image;img.alt=sp.caption;img.draggable=false;frame.append(img);}
  else{
    const v=document.createElement('video');
    Object.assign(v,{src:sp.video,poster:sp.poster||'',muted:true,loop:true,playsInline:true,preload:'metadata'});
    v.setAttribute('aria-label',sp.caption);frame.append(v,player(v,frame));
  }
  fig.append(frame,el('figcaption',null,`<b>Fig. ${sp.n}</b> ${esc(sp.caption)}`));
  return fig;
}
// A small video player mounted on the print: play/pause, jump 5 s back or forward,
// a timeline to scrub, the time, and sound. Its pointer events stop here so dragging
// the timeline never starts a page turn; a plain click on the picture plays/pauses.
const ICON={
  play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6L19 12z"/></svg>',
  pause:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 5h4v14h-4zM13.5 5h4v14h-4z"/></svg>',
  back:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5V1.8L7.2 5.6 12 9.4V6.6a6.4 6.4 0 1 1-6.4 6.4H3.5A8.5 8.5 0 1 0 12 4.5z"/><text x="12" y="16.6">5</text></svg>',
  fwd:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5V1.8l4.8 3.8L12 9.4V6.6a6.4 6.4 0 1 0 6.4 6.4h2.1A8.5 8.5 0 1 1 12 4.5z"/><text x="12" y="16.6">5</text></svg>',
  mute:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.2h3.6L12.4 5v14l-4.8-4.2H4z"/><path d="m15.6 9.4 5.2 5.2m0-5.2-5.2 5.2" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>',
  sound:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.2h3.6L12.4 5v14l-4.8-4.2H4z"/><path d="M15.4 9a4.2 4.2 0 0 1 0 6M17.8 6.6a7.6 7.6 0 0 1 0 10.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>'
};
const clock=s=>{s=Math.max(0,Math.floor(s||0));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};
function player(v,frame){
  const bar=el('div','bk-player');
  bar.innerHTML=`<button type="button" class="bk-pp"></button><button type="button" class="bk-skip bk-back" aria-label="${esc(t('Back 5 seconds'))}">${ICON.back}</button>
    <input class="bk-seek" type="range" min="0" max="1000" step="1" value="0" aria-label="${esc(t('Video timeline'))}">
    <button type="button" class="bk-skip bk-fwd" aria-label="${esc(t('Forward 5 seconds'))}">${ICON.fwd}</button><span class="bk-time">0:00</span><button type="button" class="bk-snd"></button>`;
  const pp=bar.querySelector('.bk-pp'),seek=bar.querySelector('.bk-seek'),time=bar.querySelector('.bk-time'),snd=bar.querySelector('.bk-snd');
  let scrubbing=false,resume=false,raf=0;
  const paintPlay=()=>{pp.innerHTML=v.paused?ICON.play:ICON.pause;pp.setAttribute('aria-label',t(v.paused?'Play':'Pause'));};
  const paintSound=()=>{snd.innerHTML=v.muted?ICON.mute:ICON.sound;snd.setAttribute('aria-label',t(v.muted?'Turn sound on':'Turn sound off'));};
  const paintTime=()=>{
    const d=v.duration||0,c=v.currentTime||0;
    if(!scrubbing)seek.value=d?Math.round(c/d*1000):0;
    bar.style.setProperty('--p',(seek.value/10)+'%');
    time.textContent=`${clock(c)} / ${clock(d)}`;
    seek.setAttribute('aria-valuetext',`${clock(c)} / ${clock(d)}`);
  };
  const tick=()=>{paintTime();raf=v.paused?0:requestAnimationFrame(tick);};
  v.addEventListener('play',()=>{paintPlay();cancelAnimationFrame(raf);raf=requestAnimationFrame(tick);});
  v.addEventListener('pause',()=>{paintPlay();cancelAnimationFrame(raf);paintTime();});
  v.addEventListener('loadedmetadata',paintTime);v.addEventListener('seeked',paintTime);
  const toggle=()=>{if(v.paused)v.play().catch(()=>{});else v.pause();};
  const jump=d=>{if(!v.duration)return;v.currentTime=Math.min(Math.max(0,v.currentTime+d),v.duration-.05);paintTime();};
  pp.addEventListener('click',e=>{e.stopPropagation();toggle();});
  bar.querySelector('.bk-back').addEventListener('click',e=>{e.stopPropagation();jump(-5);});
  bar.querySelector('.bk-fwd').addEventListener('click',e=>{e.stopPropagation();jump(5);});
  snd.addEventListener('click',e=>{e.stopPropagation();v.muted=!v.muted;paintSound();});
  // Scrubbing pauses the video and resumes it where the visitor lets go.
  seek.addEventListener('pointerdown',()=>{scrubbing=true;resume=!v.paused;v.pause();});
  seek.addEventListener('input',()=>{if(v.duration)v.currentTime=seek.value/1000*v.duration;bar.style.setProperty('--p',(seek.value/10)+'%');time.textContent=`${clock(v.currentTime)} / ${clock(v.duration)}`;});
  const release=()=>{if(!scrubbing)return;scrubbing=false;if(resume)v.play().catch(()=>{});};
  seek.addEventListener('pointerup',release);seek.addEventListener('pointercancel',release);seek.addEventListener('change',release);
  seek.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft'||e.key==='ArrowDown'){e.preventDefault();jump(-5);}
    else if(e.key==='ArrowRight'||e.key==='ArrowUp'){e.preventDefault();jump(5);}
    else if(e.key===' '||e.key==='k'){e.preventDefault();toggle();}
  });
  // Keep presses on the player away from the page-turning engine.
  for(const type of ['mousedown','touchstart','pointerdown'])bar.addEventListener(type,e=>e.stopPropagation());
  // A click (not a drag) on the picture itself plays or pauses.
  let down=null;
  frame.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];});
  frame.addEventListener('click',e=>{
    if(e.target.closest('.bk-player')||!down)return;
    if(Math.hypot(e.clientX-down[0],e.clientY-down[1])<6)toggle();
    down=null;
  });
  paintPlay();paintSound();
  return bar;
}
function story(sp){
  const box=el('div','bk-story');
  if(sp.kicker)box.append(el('p','bk-kicker',esc(sp.kicker)));
  box.append(el('h3','bk-title',esc(sp.title)));
  for(const b of sp.body){
    if(typeof b==='string')box.append(el('p',null,b));
    else if(b.list)box.append(el('ul','bk-list',b.list.map(i=>`<li>${i}</li>`).join('')));
    else if(b.specs)box.append(el('dl','bk-specs',b.specs.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')));
    else if(b.chips)box.append(el('p','bk-chips',b.chips.map(c=>`<span>${esc(c)}</span>`).join('')));
    else if(b.stats)box.append(el('div','bk-stats',b.stats.map(([v,l])=>`<div><b>${esc(v)}</b><span>${esc(l)}</span></div>`).join('')));
    else if(b.links)box.append(el('p','bk-links',b.links.map(l=>`<a href="${esc(l.href)}" ${l.download?`download="${esc(l.download)}"`:'target="_blank" rel="noopener"'}>${esc(l.label)}</a>`).join('')));
  }
  return box;
}

// Page order (with showCover, page 0 sits alone, then pairs [1,2], [3,4] …):
// 0 cover · 1 endpaper · 2 title · media/story per spread · built-with · endpaper · back cover.
function buildPages(book,spreads,phone){
  // Phones show one page at a time, so the blank endpapers are left out there.
  const pages=[],first=phone?2:3;
  const cover=page('bk-cover',{hard:true});
  cover.innerHTML=`<div class="bk-cloth"></div><p class="bk-series">${t('Project book')} · ${esc(book.number||'01')}</p>
    <div class="bk-photo"><img src="${book.cover}" alt="${esc(book.coverAlt||book.title)}" draggable="false"></div>
    <h2 class="bk-cover-title">${esc(book.title)}</h2><p class="bk-cover-sub">${esc(book.subtitle||'')}</p><p class="bk-author">Kishan Chhari</p>`;
  pages.push(cover);if(!phone)pages.push(page('bk-endpaper bk-left',{hard:true}));
  const title=page('bk-paper bk-right bk-titlepage');
  const intro=spreads[0].body.find(b=>typeof b==='string')||'';
  title.innerHTML=`<div class="bk-inner"><p class="bk-kicker">${t('Project book')} · ${esc(book.number||'01')}</p><h2 class="bk-big">${esc(book.title)}</h2>
    <p class="bk-sub">${esc(book.subtitle||'')}</p><p class="bk-intro">${intro}</p>
    <ol class="bk-toc${spreads.length>4?' bk-toc-long':''}">${spreads.map((s,i)=>`<li><button type="button" data-go="${first+2*i}"><span>${esc(s.title)}</span><i>${3+2*i}</i></button></li>`).join('')}</ol></div>`;
  folio(title,2);pages.push(title);
  spreads.forEach((sp,i)=>{
    const l=page('bk-paper bk-left'),r=page('bk-paper bk-right');
    l.append(el('div','bk-inner'));l.firstChild.append(media(sp));folio(l,3+2*i);
    r.append(el('div','bk-inner'));r.firstChild.append(story(sp));folio(r,4+2*i);
    pages.push(l,r);
  });
  const chips=[...new Set(spreads.flatMap(s=>s.body.filter(b=>b.chips).flatMap(b=>b.chips)))];
  const end=page('bk-paper bk-left bk-endpage');
  end.innerHTML=`<div class="bk-inner"><p class="bk-kicker">${t('Built with')}</p><h3 class="bk-title">${t('Skills in this build')}</h3>
    <p class="bk-chips">${chips.map(c=>`<span>${esc(c)}</span>`).join('')}</p>
    <p class="bk-thanks">${t('Thanks for reading.')}</p><button type="button" class="bk-done">${t('Close the book')}</button></div>`;
  folio(end,3+2*spreads.length);
  pages.push(end);if(!phone)pages.push(page('bk-endpaper bk-right',{hard:true}));
  const back=page('bk-cover bk-backcover',{hard:true});back.innerHTML=`<div class="bk-cloth"></div><p class="bk-author">${t('Kishan Chhari · Robotics')}</p>`;
  pages.push(back);
  return pages;
}

export function openBook(book,opener){
  if(active)return;
  const spreads=book.spreads.map((s,i)=>({...s,n:i+1}));
  const root=el('div','bk-stage');root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label',`${book.title} — ${t('project book')}`);
  root.innerHTML=`<div class="bk-backdrop"></div><div class="bk-holder"><div class="bk-flip"></div></div>
    <button class="bk-close" type="button" aria-label="${t('Close book')}">✕</button>
    <nav class="bk-nav" aria-label="${t('Pages')}"><button class="bk-prev" type="button">${t('‹ Previous')}</button><span class="bk-count" aria-live="polite"></span><button class="bk-next" type="button">${t('Next ›')}</button></nav>`;
  document.body.append(root);document.documentElement.classList.add('bk-open');
  const holder=root.querySelector('.bk-holder'),flipEl=root.querySelector('.bk-flip');
  const prevBtn=root.querySelector('.bk-prev'),nextBtn=root.querySelector('.bk-next'),count=root.querySelector('.bk-count');
  // Size: two pages side by side (or one on phones), fitted to the window.
  const phone=innerWidth<760;
  const pages=buildPages(book,spreads,phone);pages.forEach(p=>flipEl.append(p));
  const first=phone?2:3,endPage=pages.findIndex(p=>p.classList.contains('bk-endpage'));
  // Phones show one page at a time, so the page grows taller to use the screen.
  const ratio=phone?Math.min(1.95,Math.max(1.3,(innerHeight-150)/Math.min(560,innerWidth-32))):1.3,pw=Math.floor(Math.min(560,phone?innerWidth-32:(innerWidth-80)/2,(innerHeight-(phone?150:140))/ratio)),ph=Math.round(pw*ratio);
  root.style.setProperty('--pw',pw+'px');root.style.setProperty('--ph',ph+'px');
  holder.style.width=(phone?pw:2*pw)+'px';holder.style.height=ph+'px';
  const flip=new PageFlip(flipEl,{width:pw,height:ph,size:'fixed',showCover:true,usePortrait:phone,autoSize:false,
    drawShadow:true,maxShadowOpacity:.55,flippingTime:reduced.matches?1:1100,startZIndex:2,mobileScrollSupport:false,
    useMouseEvents:true,swipeDistance:30,showPageCorners:true,disableFlipByClick:true,clickEventForward:true});
  flip.loadFromHTML(pages);
  const last=pages.length-1;
  // Keep the closed book centred: the cover sits alone on one half of the spread.
  function place(i){
    if(phone){holder.style.translate='0 0';return;}
    holder.style.translate=i===0?`${-pw/2}px 0`:i>=last?`${pw/2}px 0`:'0 0';
  }
  function visible(i){return phone?[i]:i===0?[0]:i>=last?[last]:(i%2?[i,i+1]:[i-1,i]);}
  function onTurn(i){
    place(i);
    const show=new Set(visible(i));
    pages.forEach((p,k)=>p.querySelectorAll('video').forEach(v=>{if(show.has(k)){v.play().catch(()=>{});}else v.pause();}));
    const spread=Math.floor((i-first)/2)+1,atEnd=i>=endPage-(phone?0:1);
    count.textContent=i===0?t('Cover'):atEnd?t('The end'):i<first?t('Contents'):`${spread} / ${spreads.length}`;
    prevBtn.disabled=i===0;nextBtn.textContent=atEnd?t('Close book'):t('Next ›');
  }
  flip.on('flip',e=>onTurn(e.data));
  flip.on('changeState',e=>{root.classList.toggle('bk-turning',e.data!=='read');});
  root.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();flip.flip(+b.dataset.go,'top');}));
  root.querySelector('.bk-done').addEventListener('click',e=>{e.stopPropagation();close();});
  onTurn(0);
  // Fly out from the clicked project, then open the cover.
  const from=opener?.getBoundingClientRect?.();
  if(from&&!reduced.matches){
    const r=holder.getBoundingClientRect();
    holder.style.setProperty('--fx',`${from.left+from.width/2-(r.left+r.width/2)}px`);
    holder.style.setProperty('--fy',`${from.top+from.height/2-(r.top+r.height/2)}px`);
  }
  let closing=false;
  async function open(){
    root.classList.add('in');await wait(40);root.classList.add('shown');
    await wait(900);if(!closing)flip.flipNext('bottom');
    root.querySelector('.bk-close').focus({preventScroll:true});
  }
  async function close(){
    if(closing)return;closing=true;
    pages.forEach(p=>p.querySelectorAll('video').forEach(v=>v.pause()));
    root.classList.remove('shown');await wait(650);
    flip.destroy();root.remove();document.documentElement.classList.remove('bk-open');
    removeEventListener('keydown',onKey,true);active=null;opener?.focus?.({preventScroll:true});
  }
  function next(){const i=flip.getCurrentPageIndex();if(i>=endPage-(phone?0:1))close();else flip.flipNext('bottom');}
  function prev(){flip.flipPrev('bottom');}
  function onKey(e){
    if(e.target?.closest?.('.bk-player'))return; // the video player handles its own keys
    if(e.key==='Escape'){e.preventDefault();close();}
    else if(e.key==='ArrowRight'){e.preventDefault();next();}
    else if(e.key==='ArrowLeft'){e.preventDefault();prev();}
  }
  root.querySelector('.bk-close').onclick=close;root.querySelector('.bk-backdrop').onclick=close;
  prevBtn.onclick=prev;nextBtn.onclick=next;
  addEventListener('keydown',onKey,true);
  active={close};
  open();
}
