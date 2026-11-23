import * as T from './assets/three-runtime.js';
import {loadRobot,makeGlass,makeTable} from './robot.js';
import {makeBench} from './workbench.js';
import {makeLab} from './lab.js';
import {makeJourney} from './journey.js';
import {finishModel} from './finish.js';
import {lightKit} from './lights.js';
import {t,colon,onLang} from './i18n.js';
import {track,allRequested,settled,reveal} from './loading.js';
const LAB_MARGIN=32; // the blurred lab canvas overhangs the viewport so its soft edge stays offscreen
const v=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
const clamp=n=>Math.min(1,Math.max(0,n));
const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
function interval(value,start,end){
  const t=clamp((value-start)/(end-start));
  return t*t*t*(t*(6*t-15)+10);
}
// Offset the framing around the actual moving tip. At full alignment both
// models project to the same pixel, independent of viewport or aspect ratio.
function frameTip(group,tip,target,zoom,alignment){
  group.position.set(0,0,0);
  group.scale.setScalar(1);
  const point=tip.getWorldPosition(v());
  group.scale.setScalar(zoom);
  group.position.copy(point).multiplyScalar(1-zoom).addScaledVector(target.clone().sub(point),alignment);
}
const centered=(obj)=>new T.Box3().setFromObject(obj).getCenter(v());
function normalize(model,size,angles=[0,0,0],floor=false){
  const oriented=new T.Group();model.rotation.set(...angles);oriented.add(model);
  const bounds=new T.Box3().setFromObject(oriented),dims=bounds.getSize(v()),center=bounds.getCenter(v());
  const scale=size/Math.max(dims.x,dims.y,dims.z);
  const wrap=new T.Group();wrap.add(oriented);oriented.position.set(-center.x,-(floor?bounds.min.y:center.y),-center.z);wrap.scale.setScalar(scale);
  return wrap;
}
function explosion(model){
  const root=model.getObjectByName('Bionic_Arm_assembly')||model.children[0];
  root.updateWorldMatrix(true,true);
  const overall=root.worldToLocal(centered(root)),parts=[];
  for(const part of root.children){
    const delta=root.worldToLocal(centered(part)).sub(overall);
    // Spread along the actual assembly axes; keep multipart geometry attached to its CAD node.
    delta.set(delta.x*1.45,delta.y*.49,delta.z*1.50);
    parts.push({part,start:part.position.clone(),delta});
  }
  return amount=>parts.forEach(({part,start,delta})=>part.position.copy(start).addScaledVector(delta,amount));
}
export async function startStudio(pins,timeline={}){
  const canvas=document.querySelector('#stage'),body=document.body;
  const renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.01,60);
  // The environment map lives on the GPU, so it is rebuilt after a context restore.
  function makeEnvironment(){
    const env=new T.PMREMGenerator(renderer),room=new T.RoomEnvironment();
    scene.environment?.dispose();
    scene.environment=env.fromScene(room,.04).texture;env.dispose();room.dispose();
  }
  makeEnvironment();
  const hemi=new T.HemisphereLight(0xfffcf1,0xa29c88,1.5);scene.add(hemi);
  const sun=new T.DirectionalLight(0xfff0cf,2.4);sun.position.set(-3,5,4);scene.add(sun);
  // Room mood: 0 = studio daylight (opening arm), 1 = dark room lit by small lamps.
  let mood=0;
  function setMood(m){if(Math.abs(m-mood)<.002)return;mood=m;hemi.intensity=1.5*(1-.88*m);sun.intensity=2.4*(1-.9*m);scene.environmentIntensity=1-.8*m;}
  camera.position.z=4;
  const hero=new T.Group(),writing=new T.Group(),workshop=new T.Group();
  scene.add(hero,writing,workshop);
  const heroHolder=new T.Group();hero.add(heroHolder);
  const matchPose=new T.Object3D();
  matchPose.rotation.set(.12,-.42,-.09);
  // Only the short dissolve needs a second image. Hold a single frame from
  // the same renderer so CAD, lighting and antialiasing match the live view.
  const outgoing=document.createElement('canvas');
  outgoing.className='outgoing-frame';
  outgoing.setAttribute('aria-hidden','true');
  outgoing.hidden=true;
  canvas.after(outgoing);
  const outgoingContext=outgoing.getContext('2d');
  let fingertip,frameCaptured=false;
  const rim=new T.DirectionalLight(0xb1deff,2.2);
  rim.position.set(2,2,-2);
  hero.add(rim);
  const loader=new T.GLTFLoader();
  // Every model request feeds the loading screen's counter.
  const rawLoad=loader.loadAsync.bind(loader);loader.loadAsync=(...a)=>track(rawLoad(...a));
  // Project models are shared by the lab and the workbench; each takes a clone.
  const modelLoads=new Map();
  const loadModel=file=>{if(!modelLoads.has(file))modelLoads.set(file,loader.loadAsync('./models/'+file+'.glb').then(g=>{finishModel(file,g.scene);return g;}));return modelLoads.get(file);};
  // The workbench shows an untouched copy of the bionic arm, taken before the hero explodes it.
  let resolveArm;const armReady=new Promise(done=>{resolveArm=done;});
  const bench=makeBench({loadModel:file=>loadModel(file),getRobot:()=>getRobot(),getArm:()=>armReady,lights:lightKit(loader)});
  workshop.add(bench.root);
  const stageItems=[...document.querySelectorAll('.bench-stages li')];
  let lastStage=-1;
  // The lab behind the glass renders on its own low-resolution canvas, blurred in CSS.
  const labCanvas=document.createElement('canvas');
  labCanvas.className='lab-layer';labCanvas.setAttribute('aria-hidden','true');labCanvas.hidden=true;
  Object.assign(labCanvas.style,{inset:-LAB_MARGIN+'px',width:`calc(100% + ${2*LAB_MARGIN}px)`,height:`calc(100% + ${2*LAB_MARGIN}px)`});
  canvas.before(labCanvas);
  const labScene=new T.Scene(),labCam=new T.PerspectiveCamera(32,1,.05,90);
  let labRenderer=null,lab=null,labStarted=false,labLost=false;
  function labEnvironment(){
    const env=new T.PMREMGenerator(labRenderer),room=new T.RoomEnvironment();
    labScene.environment?.dispose();
    labScene.environment=env.fromScene(room,.04).texture;env.dispose();room.dispose();
  }
  function sizeLab(){
    if(!labRenderer)return;
    const w=innerWidth,h=innerHeight,m=LAB_MARGIN;
    labRenderer.setSize(w+2*m,h+2*m,false);
    // Same pixel scale as the main camera, so the blurred lab lines up exactly.
    labCam.fov=2*Math.atan(Math.tan(camera.fov*Math.PI/360)*(h+2*m)/h)*180/Math.PI;
    labCam.aspect=(w+2*m)/(h+2*m);
    labCam.position.copy(camera.position);labCam.quaternion.copy(camera.quaternion);
    labCam.updateProjectionMatrix();
  }
  function startLab(){
    if(labStarted||!writer||(!explode&&!body.classList.contains('arm-failed')))return;
    labStarted=true;
    try{labRenderer=new T.WebGLRenderer({canvas:labCanvas,alpha:true,antialias:false,powerPreference:'low-power'});}
    catch(error){console.warn('Lab background unavailable',error);return;}
    const phone=innerWidth<=700;
    labRenderer.setPixelRatio(phone?.4:.5);
    labRenderer.toneMapping=T.ACESFilmicToneMapping;labRenderer.toneMappingExposure=.85;
    labEnvironment();
    // A lab after hours: low ambient light, warm and dim.
    labScene.add(new T.HemisphereLight(0xffe9cc,0x3a3128,.42));
    const labSun=new T.DirectionalLight(0xffd9a8,.75);labSun.position.set(-4,6,3);labScene.add(labSun);
    labScene.environmentIntensity=.35;
    lab=makeLab(writer,loadModel,{light:phone});
    labScene.add(lab.root);
    labCanvas.addEventListener('webglcontextlost',e=>{e.preventDefault();labLost=true;labCanvas.hidden=true;});
    labCanvas.addEventListener('webglcontextrestored',()=>{labLost=false;labEnvironment();wake();});
    sizeLab();wake();
  }
  let explode,draw,writer,robotPromise,benchStarted=false,needsFrame=false;
  const raycaster=new T.Raycaster();
  // Hover and click targets: the glowing projects on the benches.
  let hovered=-1;
  function setHover(index){
    if(index===hovered)return;
    if(hovered>=0)pins[hovered].classList.remove('targeted');
    hovered=index;
    if(index>=0)pins[index].classList.add('targeted');
    canvas.style.cursor=index>=0?'pointer':'default';
    bench.setHover(index);wake();
  }
  // Pins carry no visible label in 3D; hovering or focusing one brightens its model's glow.
  pins.forEach((pin,i)=>{
    pin.setAttribute('aria-label',`${t('Open project')}${colon()} ${pin.textContent}`);
    pin.addEventListener('pointerenter',()=>setHover(i));pin.addEventListener('pointerleave',()=>setHover(-1));
    pin.addEventListener('focus',()=>setHover(i));pin.addEventListener('blur',()=>setHover(-1));
  });
  document.addEventListener('studio:relabel',()=>pins.forEach(pin=>pin.setAttribute('aria-label',`${t('Open project')}${colon()} ${pin.textContent}`)));
  function hit(event){
    if(!workshop.visible)return -1;
    raycaster.setFromCamera({x:2*event.clientX/innerWidth-1,y:1-2*event.clientY/innerHeight},camera);
    const first=raycaster.intersectObjects(bench.models,true)[0];
    for(let o=first?.object;o;o=o.parent){const i=bench.models.indexOf(o);if(i>=0)return i;}
    return -1;
  }
  // Mice report up to 1000 moves a second; test the CAD triangles at most once per frame.
  let pendingMove=null;
  canvas.addEventListener('pointermove',e=>{
    if(!pendingMove)requestAnimationFrame(()=>{const m=pendingMove;pendingMove=null;if(m)setHover(hit(m));});
    pendingMove=e;
  });
  canvas.addEventListener('pointerleave',()=>{pendingMove=null;setHover(-1);});
  canvas.addEventListener('click',e=>{const i=hit(e);if(i>=0)pins[i].click();});
  const getRobot=()=>robotPromise??=loadRobot(loader);
  const glassRoot=new T.Group();writing.add(glassRoot);
  const writingKey=new T.DirectionalLight(0xfff6de,3.4);
  writingKey.position.set(-2.5,4,4);
  writing.add(writingKey);
  const writingRim=new T.DirectionalLight(0x8a6546,2.1);
  writingRim.position.set(3,1.5,-3);
  writing.add(writingRim);
  const heroSection=document.querySelector('#home'), glassSection=document.querySelector('#glass'), benchSection=document.querySelector('#bench'), journeySection=document.querySelector('#journey'), aboutSection=document.querySelector('#about');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function wake(){if(!needsFrame){needsFrame=true;requestAnimationFrame(render);}}
  // The opening arm turns toward a mouse cursor. Offsets are measured from the
  // arm's own position on screen, so it leans toward wherever the cursor is.
  const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
  const cursor={x:0,y:0,active:false},look={x:0,y:0};
  addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse'||!finePointer.matches)return;
    cursor.x=2*e.clientX/innerWidth-1;cursor.y=1-2*e.clientY/innerHeight;cursor.active=true;wake();
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>{cursor.active=false;wake();});
  addEventListener('blur',()=>{cursor.active=false;wake();});
  loader.loadAsync('./models/bionic-arm.glb').then(async ({scene:model,parser})=>{
    resolveArm(model.clone(true));
    // Node 14 is the distal index segment beside the thumb. These coordinates
    // are its outermost fingertip vertex in the original millimetre CAD mesh.
    const indexSegment=await parser.getDependency('node',14);
    fingertip=new T.Object3D();
    fingertip.position.set(75.605156,185.939102,36.890026);
    indexSegment.add(fingertip);
    // Give the dark printed shell a satin finish while keeping the lighter
    // mechanical parts distinct. These are display materials for the hero only.
    const finishes=new Set();
    model.traverse(part=>{
      if(part.isMesh)finishes.add(part.material);
    });
    for(const material of finishes){
      const dark=material.color.r<.15 && material.color.g<.15 && material.color.b<.15;
      if(dark)material.color.multiplyScalar(.34);
      material.roughness=dark?.34:.54;
      material.metalness=dark?.24:.12;
      material.envMapIntensity=.75;
    }
    explode=explosion(model);
    heroHolder.add(normalize(model,1.64,[.07,-.37,-.49]));
    body.classList.add('has-arm');wake();startLab();
  }).catch(error=>{body.classList.add('arm-failed');resolveArm(null);console.warn(error);startLab();});
  function startWriter(){
    getRobot().then(r=>{
      if(writer)return;
      writer=r;
      glassRoot.add(r.robot);
      makeTable(glassRoot);
      draw=makeGlass(glassRoot,r);
      onLang(lang=>{r.useLang(lang);wake();});
      // Prepare the writing scene's lighting variant before the first dissolve.
      rim.visible=false;
      renderer.compileAsync(glassRoot,camera,scene).catch(console.warn);
      rim.visible=true;
      body.classList.add('has-writer');
      wake();startLab();
    }).catch(error=>{body.classList.add('writer-failed');console.warn(error);});
  }
  function startBench(){
    if(benchStarted)return;benchStarted=true;
    bench.load();
    body.classList.add('has-bench');
  }
  const observer=new IntersectionObserver(entries=>{
    for(const e of entries)if(e.isIntersecting){if(e.target===glassSection)startWriter();if(e.target===benchSection)startBench();observer.unobserve(e.target);}
  },{rootMargin:'145% 0px'});
  observer.observe(glassSection);observer.observe(benchSection);
  // Experience timeline: built when its section approaches, so its models load late.
  let journey=null,lastJourneyStage=-1;
  const journeyCard=journeySection?.querySelector('.journey-card');
  const journeyFields=journeyCard?['journey-years','journey-title','journey-org','journey-text'].map(c=>journeyCard.querySelector('.'+c)):[];
  let shownJourney=0;
  function showJourney(i){
    const step=timeline.journey?.[i];if(!step||!journeyCard)return;
    shownJourney=i;
    journeyCard.classList.remove('swap');void journeyCard.offsetWidth;journeyCard.classList.add('swap');
    [step.years,step.title,step.org,step.text].forEach((text,k)=>{if(journeyFields[k])journeyFields[k].textContent=text;});
    timeline.journeyButtons?.forEach((b,k)=>{b.classList.toggle('on',k===i);b.setAttribute('aria-current',k===i?'step':'false');});
  }
  if(journeySection&&timeline.journey?.length){
    body.classList.add('has-journey');showJourney(0);
    // A language switch relabels the open card (the step objects were updated in place).
    document.addEventListener('studio:relabel',()=>showJourney(shownJourney));
    const startJourney=()=>{if(journey)return;journey=makeJourney({loadModel,getRobot,stations:timeline.journey,lights:lightKit(loader)});scene.add(journey.root);journey.root.visible=false;wake();};
    startJourney();
    // The year steps jump straight to that station.
    document.addEventListener('studio:journey',e=>{
      const i=e.detail?.index??0,span=Math.max(1,journeySection.offsetHeight-innerHeight);
      const p=(timeline.journey.length>1?i/(timeline.journey.length-1):0);
      scrollTo({top:journeySection.offsetTop+p*span,behavior:reduced.matches?'instant':'smooth'});
    });
  }
  // Load the whole site behind the loading screen: the glass writer, every bench and the
  // journey. Then compile their shaders once, so nothing pops in or stutters on scroll.
  startWriter();startBench();
  if(document.fonts)track(document.fonts.ready);
  allRequested();
  settled().then(()=>{
    try{
      const parts=[workshop,writing,journey?.root].filter(Boolean),was=parts.map(p=>p.visible);
      parts.forEach(p=>{p.visible=true;});
      const job=renderer.compileAsync(scene,camera);   // collects programs synchronously
      parts.forEach((p,i)=>{p.visible=was[i];});
      return Promise.race([job,new Promise(r=>setTimeout(r,4000))]);
    }catch(error){console.warn(error);}
  }).catch(console.warn).finally(()=>{reveal();wake();});
  let floatTime=0, previousFrame, lastEntry, lastBenchCaption;
  let leadY=scrollY, cameraY=scrollY, lastTick;
  // Two cascaded low-pass stages, solved exactly for the frame duration.
  // Wheel impulses change the target immediately; camera velocity stays continuous.
  function followScroll(target,dt){
    const step=12*dt;
    const decay=Math.exp(-step);
    cameraY=target+((cameraY-target)+step*(leadY-target))*decay;
    leadY=target+(leadY-target)*decay;
  }
  function syncScroll(){leadY=cameraY=scrollY;lastTick=undefined;}
  document.addEventListener('visibilitychange',()=>{previousFrame=undefined;syncScroll();if(!document.hidden)wake();});
  // Section positions are read once and cached: reading offsetTop every frame forces the
  // browser to recompute layout mid-frame. Any section changing size marks them stale.
  const L={glassTop:0,glassH:0,benchTop:0,benchH:0,aboutTop:0,jTop:0,jH:0};let layoutStale=true;
  function measure(){
    L.glassTop=glassSection.offsetTop;L.glassH=glassSection.offsetHeight;
    L.benchTop=benchSection.offsetTop;L.benchH=benchSection.offsetHeight;
    L.aboutTop=aboutSection?.offsetTop??0;L.jTop=journeySection?.offsetTop??0;L.jH=journeySection?.offsetHeight??0;
    layoutStale=false;
  }
  const sizes=new ResizeObserver(()=>{layoutStale=true;wake();});
  document.querySelectorAll('main > section, section.chapter').forEach(sec=>sizes.observe(sec));
  function render(now){
    needsFrame=false;
    if(layoutStale)measure();
    let looking=false;
    const width=innerWidth,height=innerHeight,mobile=width<=700,ratio=width/height;
    const worldH=2*camera.position.z*Math.tan(16*Math.PI/180),worldW=worldH*ratio;
    const target=scrollY,glassStart=L.glassTop,benchStart=L.benchTop;
    const still=reduced.matches;
    const dt=lastTick===undefined?1/60:Math.min(.05,(now-lastTick)/1000);
    lastTick=now;
    if(still||target>=glassStart+.55*height)syncScroll();
    else followScroll(target,dt);
    const settling=Math.abs(cameraY-target)+Math.abs(leadY-target)>.12;
    if(!settling)cameraY=leadY=target;
    // Meet native scrolling again after the first stroke, before the workbench.
    const y=cameraY+(target-cameraY)*ease((target-glassStart)/(.55*height));
    const handoffLength=(still?1:1.38)*height;
    const handoffStart=glassStart-handoffLength;
    const glassEntry=clamp((y-handoffStart)/handoffLength);
    // With the intro page between them, the glass scene hands over to the workbench
    // while that page fully covers the screen, so the bench is already in place underneath.
    const benchEntry=aboutSection?(y>=L.aboutTop?1:0):ease((y-benchStart+height)/height);
    const approach=interval(glassEntry,0,.35);
    const dissolve=interval(glassEntry,.35,.67);
    const pullback=interval(glassEntry,.67,1);
    const overlap=dissolve>0&&dissolve<1&&Boolean(writer&&fingertip&&outgoingContext);
    const focus=v(worldW*(mobile?.02:.05),worldH*.035,0);
    if(glassEntry!==lastEntry){
      // Clear the hero copy during the match so the tips carry the cut.
      const introOpacity=1-interval(glassEntry,0,.24);
      heroSection.style.setProperty('--chapter-caption',introOpacity);
      heroSection.classList.toggle('captions-hidden',introOpacity===0);
      lastEntry=glassEntry;
    }
    // The workbench heading arrives once the writing robot has cleared the left side.
    const benchCaption=interval(benchEntry,.58,.94);
    if(benchCaption!==lastBenchCaption){benchSection.style.setProperty('--bench-caption',benchCaption.toFixed(3));lastBenchCaption=benchCaption;}
    hero.visible=dissolve<1||(!writer&&glassEntry<1);
    writing.visible=Boolean(writer)&&dissolve>0&&benchEntry<1;
    // The 3D story ends with the VeggieBot bench; the skills page then scrolls up over it.
    workshop.visible=benchEntry>0&&y<benchStart+L.benchH;
    outgoing.hidden=!overlap;
    if(!overlap)frameCaptured=false;
    canvas.style.opacity=overlap?String(dissolve):'';
    canvas.style.filter=overlap&&!still?'blur('+((1-dissolve)*2.4)+'px)':'';
    // A small continuous optical push carries through the focus change. Its
    // origin is the shared projected tip, so the match stays registered.
    const opticalZoom=still?0:.05*Math.sin(Math.PI*glassEntry)**2;
    const lens=opticalZoom?'scale('+(1+opticalZoom)+')':'';
    canvas.style.transform=outgoing.style.transform=lens;
    canvas.style.transformOrigin=outgoing.style.transformOrigin=(mobile?'52%':'55%')+' 46.5%';
    canvas.style.pointerEvents=workshop.visible&&benchEntry>.98?'auto':'none';
    const floating=Boolean(explode)&&hero.visible&&approach<1&&!still&&!document.hidden;
    if(floating&&previousFrame!==undefined)floatTime+=Math.min((now-previousFrame)/1000,.08)*(1-interval(glassEntry,0,.18));
    previousFrame=floating?now:undefined;
    // The journey diorama is on screen from when its section starts to rise until it ends.
    const jStart=L.jTop,jSpan=Math.max(1,L.jH-height);
    const journeyOn=Boolean(journey)&&target>jStart-height&&target<jStart+L.jH;
    // Dark rooms lit by small lamps on the workbench and the journey; a dimmer glass scene.
    setMood(workshop.visible||journeyOn?1:writing.visible?.5*dissolve:0);
    let journeyMoving=false;
    if(journey){
      journey.root.visible=journeyOn;
      if(journeyOn){
        journey.arrange({worldW,mobile});
        const state=journey.update(clamp((target-jStart)/jSpan),now/1000,still);
        journeyMoving=state.moving;
        if(state.stage>=0&&state.stage!==lastJourneyStage){lastJourneyStage=state.stage;showJourney(state.stage);}
      }
    }
    if(!hero.visible&&!writing.visible&&!workshop.visible&&!journeyOn){renderer.clear();labCanvas.hidden=true;return;}
    if(hero.visible){
      const a=still?0:ease(y/Math.max(1,handoffStart));

      const phase=still?0:floatTime;
      const bob=.045*Math.sin(phase*.95);
      heroHolder.position.set(mobile?-worldW*.005:worldW*.20,(mobile?-.35:-.125)+bob,0);
      heroHolder.scale.setScalar((mobile?Math.min(.81,worldW/.99):1.08)/(1+.32*a));
      // Ease toward the cursor relative to the arm's projected centre; release
      // gently while the camera closes in on the fingertip.
      let lookX=0,lookY=0;
      if(cursor.active&&!still&&finePointer.matches){
        const centre=heroHolder.getWorldPosition(v()).project(camera);
        const reach=1-approach;
        lookX=Math.max(-1,Math.min(1,(cursor.x-centre.x)*1.1))*reach;
        lookY=Math.max(-1,Math.min(1,(cursor.y-centre.y)*1.1))*reach;
      }
      const follow=1-Math.exp(-6.5*dt);
      look.x+=(lookX-look.x)*follow;look.y+=(lookY-look.y)*follow;
      looking=Math.abs(lookX-look.x)+Math.abs(lookY-look.y)>.0015;
      heroHolder.rotation.set(.04*Math.sin(phase*.63)-.4*look.y,-.08+phase*.26+a*.43+.78*look.x,.025*Math.sin(phase*.8)-.2*look.x);
      if(!still)heroHolder.quaternion.slerp(matchPose.quaternion,approach);
      explode?.(a);
      if(fingertip)frameTip(hero,fingertip,focus,still?1:Math.pow(2.95,approach),still?0:approach);
    }
    if(writing.visible){

      const scale=Math.min(mobile?worldW*.83:worldW*.66,1.83);
      glassRoot.scale.setScalar(scale);glassRoot.position.set(0,-.46*scale,0);
      draw(still?1:clamp((y-glassStart)/Math.max(1,L.glassH-height)));
      const closeup=still?0:1-pullback;
      glassRoot.rotation.y=-.72*closeup;
      frameTip(writing,writer.penTip,focus,Math.pow(2.95,closeup),closeup);
      // Leave faster than the bench arrives, so the wide table clears the heading.
      writing.position.x-=worldW*1.5*benchEntry;
    }
    if(workshop.visible){
      // Three benches around the visitor: scrolling through the section turns
      // the view from the left bench to the front bench to the right bench.
      const turnProgress=clamp((y-benchStart)/Math.max(1,L.benchH-height));
      const yaw=bench.turn(turnProgress,{mobile,still});
      workshop.position.set(worldW*(1-benchEntry),0,0);
      bench.arrange({eyeZ:camera.position.z,yaw,mobile});
      bench.update(still?0:now/1000);
      workshop.updateWorldMatrix(true,true);camera.updateWorldMatrix(true,false);
      pins.forEach((pin,i)=>{
        const p=bench.anchor(i).project(camera);
        const shown=benchEntry>.95&&bench.facing(i,yaw)&&p.z<1&&Math.abs(p.x)<1.1&&Math.abs(p.y)<1.1;
        if(pin.hidden===shown)pin.hidden=!shown;
        if(shown){pin.style.left=((p.x+1)*50)+'%';pin.style.top=((-p.y+1)*50)+'%';}
      });
      const stage=bench.stage(yaw);
      if(stage!==lastStage){stageItems.forEach((item,i)=>item.classList.toggle('on',i===stage));lastStage=stage;}
    }
    let needsRender=true;
    if(overlap){
      needsRender=!frameCaptured;
      if(!frameCaptured){
        writing.visible=false;
        renderer.render(scene,camera);
        outgoingContext.clearRect(0,0,outgoing.width,outgoing.height);
        outgoingContext.drawImage(canvas,0,0);
        frameCaptured=true;
      }
      hero.visible=false;
      writing.visible=true;
      outgoing.style.opacity=String(1-dissolve);
      outgoing.style.filter=still?'none':'blur('+(dissolve*3.2)+'px)';
    }
    // The blurred lab follows the writing scene's exact transform every frame.
    // It clears early as the workbench arrives so the two rooms never overlap.
    const labExit=clamp(benchEntry*2.6);
    const labOn=Boolean(lab)&&!labLost&&writing.visible&&labExit<1;
    if(labCanvas.hidden===labOn)labCanvas.hidden=!labOn;
    if(labOn){
      writing.updateMatrixWorld(true);
      lab.root.matrix.copy(glassRoot.matrixWorld);lab.root.matrixWorldNeedsUpdate=true;
      lab.update(still?0:now/1000);
      labCanvas.style.opacity=String((overlap?dissolve:1)*(1-labExit));
      labCanvas.style.transform=lens;
      labCanvas.style.transformOrigin=`${LAB_MARGIN+width*(mobile?.52:.55)}px ${LAB_MARGIN+height*.465}px`;
      labRenderer.render(labScene,labCam);
    }
    if(needsRender)renderer.render(scene,camera);
    const benchLive=workshop.visible&&!still&&!document.hidden;
    if(floating||settling||looking||benchLive||(labOn&&!still&&!document.hidden)||(journeyOn&&!document.hidden&&(!still||journeyMoving)))wake();
    else lastTick=undefined;
  }
  function resize(){
    layoutStale=true;syncScroll();
    renderer.setSize(innerWidth,innerHeight,false);
    outgoing.width=canvas.width;
    outgoing.height=canvas.height;
    frameCaptured=false;
    camera.aspect=innerWidth/innerHeight;
    camera.updateProjectionMatrix();
    sizeLab();
    wake();
  }
  // Browsers drop WebGL contexts briefly (GPU switches, too many open 3D tabs).
  // Keep the CAD layout through a short loss and fall back to the drawing only
  // if the context stays lost.
  let lostTimer=0;
  canvas.addEventListener('webglcontextlost',e=>{
    e.preventDefault();
    outgoing.hidden=true;
    clearTimeout(lostTimer);
    lostTimer=setTimeout(()=>{body.classList.add('gl-lost');body.classList.remove('has-bench');},3000);
  });
  canvas.addEventListener('webglcontextrestored',()=>{
    clearTimeout(lostTimer);
    body.classList.remove('gl-lost');
    if(benchStarted)body.classList.add('has-bench');
    makeEnvironment();
    frameCaptured=false;
    wake();
  });
  window.addEventListener('scroll',wake,{passive:true});window.addEventListener('resize',resize);reduced.addEventListener('change',resize);resize();
}
