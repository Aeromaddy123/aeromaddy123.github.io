// Experience timeline in 3D, built in real metres: Kishan's self-balancing robot
// (0.26 m) rolls along a 30 cm line-follower track past five platforms, one per
// step of his career, each furnished with real CAD at true size — up to a
// full-size UR16e at CESI. Track frame: x along the track, y up, z toward the
// visitor's side of the track.
import * as T from './assets/three-runtime.js';
import {kitPart} from './bench-kit.js';
import * as P from './bench-props.js';
import {makeGripper} from './workbench.js';
import {pendant} from './lights.js';

const H=Math.PI/2, SP=1.7, ADDITIVE=2, BEHIND=-.95, TRACK=.3;
const {group,box,cyl,mat,canvasTexture}=P;
const HEAD='"Barlow Condensed","Arial Narrow",sans-serif';
const C={cream:mat(0xf3eee4,.7),sand:mat(0xe4d6bd,.7),tape:mat(0x2c2720,.6),dark:mat(0x26282a,.5,.3),gold:mat(0xd8aa3c,.28,.8),red:mat(0xc8352c,.45)};
function paint(w,h,draw){
  const t=canvasTexture(w,h,draw);
  document.fonts?.ready.then(()=>{draw(t.image.getContext('2d'),w,h);t.needsUpdate=true;});
  return t;
}
const glowTex=paint(256,256,(g)=>{
  const f=g.createRadialGradient(128,128,10,128,128,126);
  f.addColorStop(0,'rgba(255,190,110,.25)');f.addColorStop(.6,'rgba(255,170,80,.5)');
  f.addColorStop(.75,'rgba(255,205,140,.9)');f.addColorStop(.85,'rgba(255,170,90,.3)');f.addColorStop(1,'rgba(255,160,80,0)');
  g.fillStyle=f;g.fillRect(0,0,256,256);
});
const shadowMat=new T.MeshBasicMaterial({transparent:true,depthWrite:false,map:paint(128,128,(g)=>{
  const f=g.createRadialGradient(64,64,4,64,64,62);f.addColorStop(0,'rgba(40,28,14,.32)');f.addColorStop(1,'rgba(40,28,14,0)');g.fillStyle=f;g.fillRect(0,0,128,128);
})});
function shadow(p,x,z,w,d,y=.002){const s=new T.Mesh(new T.PlaneGeometry(w,d),shadowMat);s.position.set(x,y,z);s.rotation.x=-H;s.raycast=()=>{};p.add(s);return s;}

// Place real CAD on a platform: [id,x,z,yawDeg,{y,tilt}] in metres.
function furnish(loadModel,parent,items){
  return Promise.all(items.map(([id,x,z,yaw=0,o={}])=>kitPart(loadModel,id,o.tilt).then(part=>{
    const g=group(parent,x,z,yaw*Math.PI/180,o.y||0);g.add(part);
    const s=part.userData.size;if(s&&!o.y)shadow(g,0,0,s.x*1.3+.02,s.z*1.3+.02);
    return g;
  }).catch(e=>console.warn('journey',id,e))));
}
// Kishan's own project CAD (already in metres), standing on the platform.
function own(loadModel,parent,file,x,z,angles,yaw=0){
  return loadModel(file).then(g=>{
    const model=g.scene.clone(true);model.rotation.set(...angles);
    const probe=new T.Group();probe.add(model);probe.updateWorldMatrix(true,true);
    const b=new T.Box3().setFromObject(model),c=b.getCenter(new T.Vector3()),d=b.getSize(new T.Vector3());
    model.position.set(-c.x,-b.min.y,-c.z);
    const holder=group(parent,x,z,yaw);holder.add(model);
    shadow(holder,0,0,Math.max(d.x,d.z)*1.2,Math.max(d.x,d.z)*1.1);
    return holder;
  }).catch(console.warn);
}

// Graduation cap (240 mm mortarboard) and rolled degree — no free CAD, built to size.
function mortarboard(p,x,z,yaw){
  const cap=group(p,x,z,yaw);
  cyl(cap,0,.035,0,.085,.07,C.dark,28);
  const board=box(cap,0,.074,0,.24,.008,.24,C.dark);board.rotation.y=.785;
  cyl(cap,0,.08,0,.01,.006,C.gold,12);
  const tassel=box(cap,.07,.05,.07,.004,.06,.004,C.gold);tassel.rotation.z=.15;
  const scroll=cyl(p,x+.06,.022,z+.2,.022,.22,mat(0xf5f0e2,.6),20);scroll.rotation.z=H;scroll.rotation.y=.4;
  const ribbon=cyl(p,x+.06,.022,z+.2,.0235,.03,C.red,20);ribbon.rotation.z=H;ribbon.rotation.y=.4;
}
// Tabletop whiteboard on a stand (450 × 300 mm) with a lesson sketch.
function whiteboard(p,x,z,yaw){
  const g=group(p,x,z,yaw);
  for(const s of [-1,1]){const leg=box(g,s*.17,.2,-.03,.015,.4,.015,mat(0xb7bbbf,.35,.6));leg.rotation.x=-.12;}
  const tex=paint(450,300,(c)=>{c.fillStyle='#fbfbf8';c.fillRect(0,0,450,300);c.strokeStyle='#2f5d8a';c.lineWidth=5;
    c.strokeRect(130,110,180,100);c.beginPath();c.arc(175,232,22,0,7);c.stroke();c.beginPath();c.arc(265,232,22,0,7);c.stroke();
    c.beginPath();c.moveTo(220,110);c.lineTo(220,70);c.stroke();c.fillStyle='#c8352c';c.beginPath();c.arc(220,62,9,0,7);c.fill();
    c.font=`700 38px ${HEAD}`;c.fillStyle='#2f5d8a';c.fillText('ROBOTICS 101',130,52);});
  const board=group(g,0,0,0,.42);board.rotation.x=-.12;
  box(board,0,0,-.006,.47,.32,.01,mat(0xb7bbbf,.35,.6));
  board.add(new T.Mesh(new T.PlaneGeometry(.45,.3),new T.MeshStandardMaterial({map:tex,roughness:.5})));
}
// Product box for an educational robotics kit (320 × 180 × 240 mm, printed lid).
function kitBox(p,x,z,yaw,y=0){
  const label=paint(512,384,(c)=>{c.fillStyle='#f2efe7';c.fillRect(0,0,512,384);c.fillStyle='#2f62c9';c.fillRect(0,0,512,110);
    c.fillStyle='#fff';c.font=`700 64px ${HEAD}`;c.fillText('ROBOTICS KIT',28,80);c.fillStyle='#2c2720';c.font=`500 40px ${HEAD}`;c.fillText('LEARN · BUILD · CODE',28,190);
    c.fillStyle='#e0703a';c.beginPath();c.arc(410,290,58,0,7);c.fill();c.fillStyle='#fff';c.font=`700 40px ${HEAD}`;c.fillText('8+',388,304);});
  const side=mat(0x2f62c9,.6),top=new T.MeshStandardMaterial({map:label,roughness:.6});
  const b=new T.Mesh(new T.BoxGeometry(.32,.18,.24),[side,side,top,side,side,side]);b.position.set(x,y+.09,z);b.rotation.y=yaw;p.add(b);
  if(!y)shadow(p,x,z,.42,.32);
  return b;
}

export function makeJourney({loadModel,getRobot,stations=[],lights}={}){
  const root=new T.Group(),pivot=group(root),track=group(pivot);
  const N=Math.max(1,stations.length),len=(N-1)*SP;
  // 300 mm line-follower track with a black centre line.
  box(track,len/2,.006,0,len+2.4,.012,TRACK,C.cream);
  box(track,len/2,.0125,0,len+2.4,.001,.019,C.tape);
  for(const z of [-TRACK/2,TRACK/2])box(track,len/2,.009,z,len+2.4,.018,.012,C.sand);
  shadow(track,len/2,0,len+3,.7,-.001);
  const yearOf=s=>(s.years||'').match(/\d{4}/)?.[0]||'';
  const radius=[.48,.5,.5,.5,.72];
  const anims=[];
  const stationObjs=stations.map((s,k)=>{
    const x=k*SP,r=radius[k]??.5,base=group(track,x+.35,BEHIND-(r-.5));
    cyl(base,0,.015,0,r,.03,C.sand,56);shadow(base,0,0,r*2.7,r*2.7,.001);
    const ring=new T.Mesh(new T.PlaneGeometry(r*2.3,r*2.3),new T.MeshBasicMaterial({map:glowTex,transparent:true,depthWrite:false,blending:ADDITIVE,toneMapped:false}));
    ring.position.y=.032;ring.rotation.x=-H;ring.material.opacity=0;base.add(ring);
    const emblem=group(base,0,0,0,.03);
    cyl(track,x,.0135,0,.12,.002,C.sand,40);
    const tex=paint(512,160,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#2c2720';c.font=`800 120px ${HEAD}`;c.textAlign='center';c.textBaseline='middle';c.fillText(yearOf(s),w/2,h/2+6);});
    const decal=new T.Mesh(new T.PlaneGeometry(.34,.11),new T.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));
    decal.position.set(x-.42,.0135,.08);decal.rotation.x=-H;track.add(decal);
    return {base,ring,emblem};
  });
  const E=k=>stationObjs[k]?.emblem;
  // One warm pendant over each platform (two over the UR16e cell), plus a soft light on the track.
  lights?.then(({SpotLight})=>{
    stationObjs.forEach((st,k)=>{
      if(k===N-1){pendant(st.base,SpotLight,-.25,.05,{drop:1.65,cord:.8,intensity:9,angle:.55,reach:4});pendant(st.base,SpotLight,.35,.15,{drop:1.35,cord:1,intensity:6,angle:.5,reach:3.5});}
      else pendant(st.base,SpotLight,0,0,{drop:1.1,cord:1,intensity:5.5,angle:.58,reach:3});
    });
  }).catch(console.warn);
  // 1 · B.Tech Mechanical: the 5-DOF arm he built, calipers, graduation cap.
  if(E(0)){own(loadModel,E(0),'robotic-arm',-.12,-.08,[0,-.45,0]);furnish(loadModel,E(0),[['calipers',.16,.28,-20]]);mortarboard(E(0),.26,-.04,.4);}
  // 2 · Robotics trainer: humanoid, TurtleBot3, Arduino on a breadboard, lesson board.
  if(E(1)){whiteboard(E(1),-.02,-.3,.1);furnish(loadModel,E(1),[['humanoid',-.24,.06,200],['turtlebot3',.18,.1,-30],['arduino-uno',.24,-.14,15],['breadboard-kit',.04,.28,-10]]);}
  // 3 · Learning Links: designing and manufacturing robotics kits.
  if(E(2)){furnish(loadModel,E(2),[['ender3',-.14,-.12,20],['sg90',.2,.28,30],['l298n',.32,.14,-15]]);kitBox(E(2),.26,-.08,-.35);kitBox(E(2),.26,-.08,-.25,.18);P.partsDrawers(E(2),-.16,.3,.2,{w:.3,h:.2,d:.15,cols:5,rows:4});}
  // 4 · MSc Embedded Systems: bench instruments and boards.
  if(E(3)){P.esdMat(E(3),.04,.16,.1,.6,.3);furnish(loadModel,E(3),[['oscilloscope',-.08,-.2,10],['power-supply',.3,-.12,-25],['raspberry-pi-4',-.12,.18,10,{y:.002}],['esp32-devkit',.04,.22,70,{y:.002}],['arduino-mega',.2,.16,-10,{y:.002}]]);P.logicAnalyser(E(3),-.26,.24,.3);}
  // 5 · CESI LINEACT × IMT Atlantique: the full-size UR16e with its Robotiq gripper.
  if(E(4)){
    const cell=E(4);
    P.robotPlate(cell,-.12,-.1);
    furnish(loadModel,cell,[['wooden_cutting_board',.3,.3,-20],['yellow_onion',.34,.32,0,{y:.041}],['quest3-headset',-.4,.36,30],['carved_wooden_plate',.5,-.08,0]]);
    const tri=P.tripod(cell,-.52,.02,.6,.2);
    kitPart(loadModel,'realsense-d435').then(c=>{c.rotation.y=-H*.4;tri.head.add(c);}).catch(console.warn);
    Promise.all([getRobot?.(),makeGripper(loadModel)]).then(([w,grip])=>{
      if(!w)return;
      const robot=w.robot.clone(true);robot.position.set(-.12,.015,-.1);robot.scale.setScalar(1);cell.add(robot);
      robot.getObjectByName('marker').visible=false;robot.getObjectByName('nib').visible=false;
      const joints=[0,1,2,3,4,5].map(i=>robot.getObjectByName('joint'+i));
      joints[5].add(grip.root);grip.root.position.z=.002;
      anims.push(t=>{
        const sway=Math.sin(t*.7),lift=.5+.5*Math.sin(t*.7-1);
        const sh=-1.5-.35*lift,el=1.45+.4*(1-lift);
        const q=[.55+.65*sway,sh,el,-H-sh-el,-H,0];joints.forEach((j,i)=>{j.rotation.z=q[i];});
        grip.setGrip(.25+.25*Math.sin(t*.7-2));
      });
      anims[anims.length-1](0);
    }).catch(console.warn);
  }
  // The self-balancing robot at its real 255 mm height.
  const rider=group(track),lean=group(rider);
  loadModel?.('robot-assembly').then(gltf=>{
    const model=gltf.scene.clone(true);model.rotation.set(-H,0,Math.PI);
    const holder=new T.Group();holder.add(model);holder.updateWorldMatrix(true,true);
    const b=new T.Box3().setFromObject(model),c=b.getCenter(new T.Vector3());
    model.position.set(-c.x,-b.min.y,-c.z);holder.position.y=.012;
    const facing=new T.Group();facing.rotation.y=H;facing.add(holder);lean.add(facing);
  }).catch(console.warn);
  shadow(rider,0,0,.26,.2,.0135);
  // A soft overhead light that travels with the robot along the track.
  lights?.then(({SpotLight})=>{
    const follow=new SpotLight(0xffe2b8,4.5,4,.45,.9,2);follow.position.set(0,1.6,.15);follow.target.position.set(0,0,0);
    pivot.add(follow,follow.target);
  }).catch(console.warn);

  let pos=0,vel=0,tilt=0,tiltV=0,lastT;
  // Scroll progress (0–1) → track position, dwelling at each station.
  function target(p){
    const f=Math.min(N-1,Math.max(0,p*(N-1)));const k=Math.min(N-2,Math.floor(f)),local=f-k;
    const u=Math.min(1,Math.max(0,(local-.18)/.64));return N<2?0:k+u*u*(3-2*u);
  }
  function update(p,t,still){
    const dt=lastT===undefined?0:Math.min(.05,t-lastT);lastT=t;
    const goal=target(p);
    if(still||!dt){pos=goal;vel=0;}
    else{const k=38,c=2*Math.sqrt(k);vel+=(k*(goal-pos)-c*vel)*dt;pos+=vel*dt;}
    // A balancing robot leans into its motion, then rocks back as it stops.
    const want=still?0:-Math.max(-.32,Math.min(.32,vel*.28));
    if(dt){const k=60,c=2*Math.sqrt(k)*.55;tiltV+=(k*(want-tilt)-c*tiltV)*dt;tilt+=tiltV*dt;}
    lean.rotation.z=tilt+(still?0:.015*Math.sin(t*2.6));
    rider.position.x=pos*SP;track.position.x=-pos*SP;
    const active=Math.round(pos),near=Math.abs(pos-active)<.3;
    stationObjs.forEach((s,k)=>{
      const on=near&&k===active;
      s.ring.material.opacity+=((on?.75+.2*Math.sin(t*2.4):0)-s.ring.material.opacity)*(dt?1-Math.exp(-6*dt):1);
      s.emblem.position.y+=((on?.06:.03)-s.emblem.position.y)*(dt?1-Math.exp(-6*dt):1);
    });
    if(!still)anims.forEach(f=>f(t));
    const robotOn=!still&&anims.length>0&&Math.abs(pos-(N-1))<1.2;
    return {stage:near?active:-1,moving:Math.abs(vel)>.002||Math.abs(goal-pos)>.002||robotOn};
  }
  // Place the diorama: the robot sits left of centre, the track recedes to the right.
  function arrange({worldW,mobile}){
    root.position.set(mobile?-.05:-worldW*.2,mobile?-.35:-.62,mobile?-.4:0);
    root.scale.setScalar(mobile?.95:1.3);
    pivot.rotation.set(.4,mobile?.5:.38,0,'XYZ');
  }
  return {root,update,arrange,stationFor:i=>i/(N-1)};
}
