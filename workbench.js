// Three workbenches set at right angles around the visitor, built in real metres:
// 2.4 m × 0.9 m benches, 0.9 m high, seen from standing eye height. Scrolling turns
// the view from the electronics bench (left) to the projects bench (front) to the
// VeggieBot cell (right). Equipment is real CAD (see models/bench/CREDITS.md) at its
// true size; the glowing, clickable projects are Kishan's own CAD models.
import * as T from './assets/three-runtime.js';
import {placeKit,kitPart} from './bench-kit.js';
import * as P from './bench-props.js';
import {pendant} from './lights.js';
import {makeHandover,makeG1,handoverTable} from './rl-props.js';

const H=Math.PI/2, DEG=Math.PI/180, ADDITIVE=2, REPEAT=1000;
const R=3.0, L=2.4, DEPTH=.9, TOP=.9, EYE=1.05, FLOOR=-TOP, BACK=-DEPTH/2;
export const BENCH_YAW={left:-H,corner:-H/2,front:0,right:H};
export const STAGES=['Robotics & electronics','Robot learning','Projects & prototypes','VeggieBot cell'];
const lite=matchMedia('(max-width: 700px)').matches;
const {group,box,cyl,mat,canvasTexture}=P;

// ── Shared textures ─────────────────────────────────────────
const pegTexture=canvasTexture(512,512,(g,w,h)=>{
  g.fillStyle='#c9b48e';g.fillRect(0,0,w,h);
  g.fillStyle='rgba(55,40,22,.6)';
  for(let x=16;x<w;x+=32)for(let y=16;y<h;y+=32){g.beginPath();g.arc(x,y,5,0,7);g.fill();}
});
pegTexture.wrapS=pegTexture.wrapT=REPEAT;pegTexture.repeat.set(L/.4064,.8/.4064); // 25.4 mm pitch
const woodTexture=canvasTexture(1024,256,(g,w,h)=>{
  for(let i=0;i<24;i++){g.fillStyle=`hsl(${33+(i%3)*2},${38+(i%4)*4}%,${66-(i%5)*3}%)`;g.fillRect(0,i*h/24,w,h/24+1);}
  g.globalAlpha=.08;g.strokeStyle='#5a3d1c';for(let i=0;i<140;i++){g.beginPath();const y=Math.random()*h;g.moveTo(0,y);g.bezierCurveTo(w*.3,y+6,w*.6,y-6,w,y+3);g.stroke();}
});
const softShadow=new T.MeshBasicMaterial({transparent:true,depthWrite:false,map:canvasTexture(128,128,(g)=>{
  const f=g.createRadialGradient(64,64,4,64,64,62);
  f.addColorStop(0,'rgba(30,22,12,.5)');f.addColorStop(.55,'rgba(30,22,12,.2)');f.addColorStop(1,'rgba(30,22,12,0)');
  g.fillStyle=f;g.fillRect(0,0,128,128);
})});
const neonTexture=canvasTexture(256,256,(g)=>{
  const f=g.createRadialGradient(128,128,10,128,128,126);
  f.addColorStop(0,'rgba(80,240,255,.35)');f.addColorStop(.55,'rgba(60,230,255,.6)');
  f.addColorStop(.72,'rgba(170,250,255,1)');f.addColorStop(.8,'rgba(60,220,255,.4)');f.addColorStop(1,'rgba(40,200,255,0)');
  g.fillStyle=f;g.fillRect(0,0,256,256);
});
function blob(p,x,z,w,d,y=.0015){const s=new T.Mesh(new T.PlaneGeometry(w,d),softShadow);s.position.set(x,y,z);s.rotation.x=-H;s.raycast=()=>{};p.add(s);return s;}

// ── Bench: 40 mm butcher-block top on a steel frame, pegboard back, shelf ──
function bench(parent,{laminate=false}={}){
  const g=group(parent);
  const top=laminate?mat(0xd9d5cc,.55):new T.MeshStandardMaterial({map:woodTexture,roughness:.62});
  box(g,0,-.02,0,L,.04,DEPTH,top);
  const frame=mat(0x3b4045,.45,.55);
  const legH=TOP-.04;
  for(const x of [-L/2+.05,L/2-.05])for(const z of [BACK+.05,-BACK-.05])box(g,x,-.04-legH/2,z,.05,legH,.05,frame);
  for(const z of [BACK+.05,-BACK-.05])box(g,0,-.07,z,L-.1,.06,.03,frame);
  box(g,0,FLOOR+.15,0,L-.12,.02,DEPTH-.1,mat(0x6d6f70,.6,.4));
  // Pegboard and uprights
  for(const x of [-L/2+.02,L/2-.02])box(g,x,.45,BACK+.015,.04,.9,.03,frame);
  const board=new T.Mesh(new T.PlaneGeometry(L-.08,.8),new T.MeshStandardMaterial({map:pegTexture,roughness:.85}));
  board.position.set(0,.45,BACK+.005);g.add(board);
  // Shelf with an LED strip underneath
  box(g,0,.8,BACK+.13,L-.08,.02,.24,mat(0x4a4f54,.5,.45));
  box(g,0,.787,BACK+.2,L-.2,.006,.012,new T.MeshBasicMaterial({color:0xfff3dc,toneMapped:false}));
  blob(g,0,0,L+.5,DEPTH+.5,FLOOR+.002);
  return g;
}
const floorMat=new T.MeshBasicMaterial({transparent:true,depthWrite:false,map:canvasTexture(256,256,(g)=>{
  const f=g.createRadialGradient(128,128,8,128,128,128);f.addColorStop(0,'rgba(120,112,100,.28)');f.addColorStop(1,'rgba(120,112,100,0)');g.fillStyle=f;g.fillRect(0,0,256,256);})});

// ── Projects ────────────────────────────────────────────────
function realModel(model,angles=[0,0,0]){
  model.rotation.set(...angles);
  const holder=new T.Group();holder.add(model);holder.updateWorldMatrix(true,true);
  const b=new T.Box3().setFromObject(model),c=b.getCenter(new T.Vector3()),d=b.getSize(new T.Vector3());
  model.position.set(-c.x,-b.min.y,-c.z);
  return {holder,height:d.y,width:Math.max(d.x,d.z)};
}

// Robotiq 2F-85 from its ROS visual meshes; joint frames from the URDF (metres, z out of the tool).
export async function makeGripper(loadModel){
  const names=['base_link','outer_knuckle','outer_finger','inner_knuckle','inner_finger','pad'];
  const scenes=Object.fromEntries(await Promise.all(names.map(async n=>[n,(await loadModel('bench/robotiq-'+n)).scene])));
  const body=mat(0x2a2c2f,.45,.3),link=mat(0x3a3d41,.4,.45),pad=mat(0x151515,.9);
  const part=n=>{const o=scenes[n].clone(true);o.traverse(m=>{if(m.isMesh)m.material=n==='pad'?pad:n==='base_link'?(m.material.color.getHex()===0xffffff?link:body):link;});return o;};
  const root=new T.Group();
  cyl(root,0,0,.007,.0375,.014,mat(0x1d1e20,.5,.3),32).rotation.x=H;
  const base=new T.Group();base.position.z=.014;root.add(base);base.add(part('base_link'));
  const sides=[-1,1].map(s=>{
    const joint=(x,y,z,yaw,parent)=>{const g=new T.Group();g.position.set(x,y,z);g.rotation.z=yaw;parent.add(g);const a=new T.Group();g.add(a);return a;};
    const outer=joint(0,s*.0306011,.054904,s<0?Math.PI:0,base);outer.add(part('outer_knuckle'));
    const finger=new T.Group();finger.position.set(0,.0315,-.0041);outer.add(finger);finger.add(part('outer_finger'));
    const inner=joint(0,.0061,.0471,0,finger);inner.add(part('inner_finger'));
    const tip=new T.Group();tip.position.set(0,-.0220203,.03242);inner.add(tip);tip.add(part('pad'));
    const knuckle=joint(0,s*.0127,.06142,s<0?Math.PI:0,base);knuckle.add(part('inner_knuckle'));
    return {outer,inner,knuckle,tip};
  });
  // 0 = open (85 mm), 0.8 = closed.
  const setGrip=q=>sides.forEach(s=>{s.outer.rotation.x=q;s.knuckle.rotation.x=q;s.inner.rotation.x=-q;});
  return {root,setGrip,pads:sides.map(s=>s.tip)};
}

// ABB IRB 120 (ROS-Industrial meshes, Apache-2.0) on a small steel robot table.
// Joint frames from the URDF: z-up metres, joints 1–6 about z, y, y, x, y, x.
async function makeAbb(loadModel){
  const src=(await loadModel('bench/abb-irb120')).scene.clone(true);
  const links={};for(const n of ['base_link','link_1','link_2','link_3','link_4','link_5','link_6'])links[n]=src.getObjectByName(n);
  const link=n=>links[n];
  const up=new T.Group();up.rotation.x=-H;
  up.add(link('base_link'));
  const chain=[[0,0,0],[0,0,.29],[0,0,.27],[0,0,.07],[.302,0,0],[.072,0,0]];
  let parent=up;const joints=[];
  chain.forEach((o,i)=>{const j=new T.Group();j.position.set(...o);parent.add(j);j.add(link('link_'+(i+1)));joints.push(j);parent=j;});
  const axes=['z','y','y','x','y','x'];
  // ABB orange arm on a graphite base, with a steel flange.
  const paint={base_link:mat(0x2b2d30,.45,.4),link_1:mat(0xff7a2a,.32,.1),link_2:mat(0xff7a2a,.32,.1),link_3:mat(0xff7a2a,.32,.1),link_4:mat(0x2b2d30,.45,.4),link_5:mat(0xff7a2a,.32,.1),link_6:mat(0xb8bcc0,.3,.8)};
  for(const [n,m] of Object.entries(paint))link(n)?.traverse(o=>{if(o.isMesh)o.material=m;});
  const pose=q=>joints.forEach((j,i)=>{j.rotation[axes[i]]=q[i];});
  return {root:up,update:t=>pose([.55*Math.sin(t*.42),.3+.28*Math.sin(t*.55),-.05+.32*Math.sin(t*.55+1.1),.5*Math.sin(t*.3),.75+.35*Math.sin(t*.55+.5),t*.6])};
}
function robotTable(p,x,z,yaw){
  const g=group(p,x,z,yaw);
  const steel=mat(0x6e7378,.4,.6);
  box(g,0,.59,0,.55,.02,.55,mat(0x4a4f54,.45,.55));
  for(const sx of [-1,1])for(const sz of [-1,1])box(g,sx*.245,.29,sz*.245,.05,.58,.05,steel);
  for(const sz of [-1,1])box(g,0,.12,sz*.245,.45,.04,.03,steel);
  box(g,0,.006,0,.6,.012,.6,mat(0x3a3d40,.6,.3));
  blob(g,0,0,.95,.95,.003);
  return g;
}

export function makeBench({loadModel,getRobot,getArm,lights}){
  const root=new T.Group();               // pivot at the visitor's eye
  const room=group(root,0,0,0,-EYE);
  const floor=new T.Mesh(new T.PlaneGeometry(9,9),floorMat);floor.rotation.x=-H;floor.position.y=FLOOR+.001;room.add(floor);
  const tables={left:group(room,-R,0,H),front:group(room,0,-R,0),right:group(room,R,0,-H)};
  bench(tables.left);bench(tables.front);bench(tables.right,{laminate:true});
  // The corner between the electronics and projects benches: a two-arm handover table.
  tables.corner=group(room,-2.0,-2.0,H/2);handoverTable(tables.corner);
  const ground=group(room,0,0,0,FLOOR);
  const movers=[];

  // Project slots, in the same order as the project list.
  const slotSpec=[
    {table:'left',x:-.92,z:.1},    // self-balancing robot
    {table:'front',x:-.38,z:.1},   // medical UAV
    {table:'right',x:-.55,z:-.12}, // VeggieBot · UR16e
    {table:'left',x:-.5,z:.12},    // bionic arm
    {table:'corner',x:0,z:-.02},   // two-arm handover (RL)
    {table:'right',x:.78,z:-.04}   // Unitree G1 walk → run (RL)
  ];
  const models=slotSpec.map(s=>{
    const slot=group(tables[s.table],s.x,s.z);
    slot.userData={table:s.table,anchor:.2,h:0};
    // The same soft cyan ring under every project, always on; it brightens under the cursor.
    const ring=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:neonTexture,transparent:true,depthWrite:false,blending:ADDITIVE,toneMapped:false,opacity:.45}));
    ring.position.y=.005;ring.rotation.x=-H;ring.raycast=()=>{};ring.renderOrder=2;slot.add(ring);slot.userData.ring=ring;
    return slot;
  });
  function present(i,object,{ring=.5,shadow=true}={}){
    const slot=models[i];slot.add(object.holder);
    slot.userData.anchor=object.height*.6;
    slot.userData.ring.scale.setScalar(ring);
    if(shadow)blob(slot,0,0,object.width*1.3,object.width*1.1);
  }


  // Equipment, x along the bench (left→right as seen), z from back (−0.45) to front (+0.45).
  const ON=.002, MAT=.004;
  const LEFT=[
    ['oscilloscope',.02,-.3,4],['power-supply',.43,-.31,-4],['soldering-station',.79,-.26,-14],
    ['multimeter',1.02,.18,22],['breadboard-kit',.3,.13,0,{y:MAT}],['arduino-uno',.1,.14,8,{y:MAT}],
    ['arduino-mega',.12,.33,-4,{y:MAT}],['raspberry-pi-4',.55,.17,14,{y:MAT}],['pi-camera',.66,.29,-20,{y:MAT}],
    ['esp32-devkit',.45,.33,80,{y:MAT}],['arduino-nano',.36,.31,-70,{y:MAT}],['l298n',.75,.09,10,{y:MAT}],
    ['stepper-driver',.66,.03,0,{y:MAT}],['raspberry-pico',.52,.02,10,{y:MAT}],['psu-brick',-.12,-.36,0],['nema17',.84,.2,0,{y:MAT}],['nema17',.91,.04,30,{y:MAT}],
    ['sg90',.9,.34,20,{y:MAT}],['servo-std',1.0,.39,-30],['gearmotor',.74,.35,90,{y:MAT}],['wheel-65',.8,.4,0,{y:MAT}],
    ['hc-sr04',.22,.33,0,{y:MAT}],['lcd-20x4',-.09,.13,6],['calipers',-.24,.33,12],
    ['resistor',.25,.25,30,{y:MAT}],['resistor',.27,.27,55,{y:MAT}],['led',.3,.26,0,{y:MAT}],['led',.32,.25,0,{y:MAT}],
    ['cap-electrolytic',.35,.24,0,{y:MAT}],['transistor',.37,.26,0,{y:MAT}],['ic-dip8',.23,.22,0,{y:MAT}],
    ['ic-dip28',.4,.21,90,{y:MAT}],['regulator',.42,.26,0,{y:MAT}],['pin-header',.19,.25,90,{y:MAT}],['cap-ceramic',.34,.27,0,{y:MAT}],
    ['multi_cleaner_bottle',1.13,-.08,0],['desk_lamp_arm_01',1.1,-.36,200],
    ['turtlebot3',-1.0,-.24,30],['magnifying_glass_01',.6,BACK+.03,0,{y:.42}],
    // pegboard tools
    ['pliers',-1.1,BACK+.025,0,{y:.4}],['screwdriver',-.99,BACK+.03,0,{y:.42}],['adjustable_wrench',-.88,BACK+.03,0,{y:.4}],
    ['tongue_groove_pliers',-.74,BACK+.025,0,{y:.4,tilt:[-90,0,0]}],['ratchet_wrench',-.6,BACK+.03,0,{y:.42}],
    ['cross_pein_hammer',-.44,BACK+.025,0,{y:.4}],['combination_wrench',1.1,BACK+.025,0,{y:.4,tilt:[-90,0,0]}],
    // shelf and under-bench storage
    ['metal_toolbox',.2,BACK+.14,0,{y:.81}],['plastic_crate_01',-.9,BACK+.14,90,{y:.81}],
    ['plastic_crate_03',-.75,-.05,0,{y:FLOOR+.16}],['plastic_crate_03',-.2,-.05,0,{y:FLOOR+.16}],
    ['cardboard_box_01',.45,-.05,90,{y:FLOOR+.16}],['industrial_pastic_container',.95,-.05,0,{y:FLOOR+.16}]
  ];
  const FRONT=[
    ['ender3',-.95,-.2,8],['Drill_01',-.58,-.33,-30],['measuring_tape_01',.18,-.37,10],
    ['rc-plane',.8,-.08,90],['humanoid',.08,-.06,180],['transmitter',.56,.3,-12],['fpv-goggles',.3,.34,18],
    ['lipo-4s',.93,.33,20],['lipo-4s',1.02,.36,28],['lipo-bag',1.1,.22,-10],
    ['screwdrivers_02',-.28,BACK+.025,0,{y:.4,tilt:[-90,0,0]}],
    ['plastic_crate_03',-.95,BACK+.14,0,{y:.81}],['lubricant_spray',.35,BACK+.1,0,{y:.81}],['metal_toolbox',.6,BACK+.14,0,{y:.81}],['stationery_supplies',-.2,BACK+.14,0,{y:.81}],
    ['plastic_crate_01',-.7,-.05,0,{y:FLOOR+.16}],['cardboard_box_01',.1,-.05,0,{y:FLOOR+.16}],['plastic_crate_03',.75,-.05,0,{y:FLOOR+.16}]
  ];
  const RIGHT=[
    ['estop-button',-.06,.36,0],['quest3-headset',.38,.2,25],['quest-touch-l',.53,.34,-20],['quest-touch-r',.62,.3,15],
    ['monitor',.95,-.12,-8,{y:FLOOR+.16}],['keyboard',.42,.12,-4,{y:FLOOR+.16}],['mouse',.68,.16,10,{y:FLOOR+.16}],
    ['medical_box',.95,BACK+.14,0,{y:.81}],['multi_cleaner_bottle',-.05,BACK+.14,0,{y:.81}],['plastic_crate_03',-.6,BACK+.14,0,{y:.81}],
    ['plastic_crate_01',.05,-.05,0,{y:FLOOR+.16}]
  ];
  const ROOM=[
    ['cardboard_box_01',-1.45,-2.95,70],['plastic_crate_01',2.65,-1.6,-80]
  ];

  // Procedural items (no free model): mats, extractor, drawers, Jetson, pendant …
  const Lt=tables.left,Ft=tables.front,Rt=tables.right;
  P.esdMat(Lt,.42,.12,0,1.1,.52);
  P.fumeExtractor(Lt,1.03,-.27,-.5);P.helpingHands(Lt,.6,-.05,-.3);P.logicAnalyser(Lt,-.06,.3,.2);
  P.hotAir(Lt,-.4,-.3,.1);P.spool(Lt,.62,-.16,0);
  P.partsDrawers(Lt,-.42,BACK+.11,0,{w:.38,h:.24,d:.16}).position.y=.81;
  P.partsDrawers(Lt,.62,BACK+.11,0,{w:.3,h:.2,d:.15,cols:5,rows:4}).position.y=.81;
  [0xc62c25,0x161616,0xe8b923,0x2f62c9].forEach((c,i)=>{P.spool(Lt,.95+i*.055,BACK+.1,H,{r:.03,w:.04,fill:mat(c,.5)}).position.y=.81;});
  const pad=canvasTexture(256,256,(c)=>{c.fillStyle='#2c2f31';c.fillRect(0,0,256,256);c.strokeStyle='#e9e3d6';c.lineWidth=10;c.beginPath();c.arc(128,128,104,0,7);c.stroke();c.fillStyle='#e9e3d6';c.fillRect(80,68,20,120);c.fillRect(156,68,20,120);c.fillRect(80,118,96,20);});
  const padMesh=new T.Mesh(new T.PlaneGeometry(.5,.5),new T.MeshStandardMaterial({map:pad,roughness:.75}));padMesh.rotation.x=-H;padMesh.position.set(-.38,.003,.1);Ft.add(padMesh);
  P.filament(Ft,-.66,-.32,H,0xe0702a);P.filament(Ft,-.58,-.32,H,0x2a2a2a);
  [0xe8e8e8,0x2f62c9,0x2d7a45].forEach((c,i)=>{P.filament(Ft,-.15+i*.08,BACK+.12,H,c).position.y=.81;});
  P.lipoCharger(Ft,.74,.37,-.1);
  P.teachPendant(Rt,.12,.24,-.35);P.jetson(Rt,.3,-.26,.2);P.netSwitch(Rt,.3,BACK+.12,0).position.y=.81;
  P.laptop(Rt,1.08,.3,-.45);P.charuco(Rt,.12,-.4,0);
  const tri=P.tripod(Rt,-.02,.1,0,.2);
  P.controlBox(Rt,-.55,-.05,0).position.y=FLOOR+.17;
  P.robotPlate(Rt,-.55,-.12);
  // Kick the LEDs on the switch / Jetson fan.
  let fan=null;Rt.traverse(o=>{if(o.isMesh&&o.geometry.type==='CylinderGeometry'&&Math.abs(o.position.y-.031)<.001)fan=o;});
  if(fan)movers.push(t=>{fan.rotation.y=t*30;});

  // Dark room: two or three small pendant lamps hang over each bench.
  lights?.then(({SpotLight})=>{
    const xs=lite?[-.6,.6]:[-.82,0,.82];
    for(const t of [Lt,Ft,Rt])for(const x of xs)pendant(t,SpotLight,x,.05,{drop:1.05,intensity:lite?3.6:2.7,angle:lite?.72:.62,cone:!lite});
    pendant(tables.corner,SpotLight,0,.02,{drop:1.15,cord:.5,intensity:lite?4.2:3.4,angle:.7,reach:3,cone:!lite});
  }).catch(console.warn);
  let hovered=-1,loading=false,cell=null;
  const shadowed=(list)=>list.forEach(g=>{
    if(!g)return;const size=g.children[0]?.userData.size;if(!size||size.x*size.z<.0015||g.position.y>.05||g.position.y<-.05)return;
    blob(g,0,0,size.x*1.35+.03,size.z*1.35+.03);
  });
  async function load(){
    if(loading)return;loading=true;
    const opt={skipSmall:lite};
    // Everything loads behind the loading screen, so all areas are fetched at once.
    Promise.all([
      placeKit(loadModel,Lt,LEFT,opt).then(shadowed),
      placeKit(loadModel,Ft,FRONT,opt).then(shadowed),
      placeKit(loadModel,Rt,RIGHT,opt).then(shadowed),
      placeKit(loadModel,ground,ROOM,opt)
    ]).catch(console.warn);
    kitPart(loadModel,'realsense-d435').then(cam=>{cam.rotation.y=-H*.6;tri.head.add(cam);}).catch(console.warn);
    const corner=robotTable(ground,2.36,-2.36,-1.5*H);
    lights?.then(({SpotLight})=>pendant(corner,SpotLight,.45,.45,{drop:1.9,cord:.6,intensity:7,angle:.5,reach:4,cone:!lite})).catch(console.warn);
    makeAbb(loadModel).then(abb=>{abb.root.position.y=.6;corner.add(abb.root);abb.update(0);movers.push(abb.update);}).catch(console.warn);
    const specs=[['robot-assembly',0,[-H,0,Math.PI],.38],['spidrone',1,[0,.2,0],.62]];
    for(const [file,i,angles,ring] of specs)
      loadModel(file).then(g=>present(i,realModel(g.scene.clone(true),angles),{ring})).catch(console.warn);
    makeHandover(loadModel).then(h=>{present(4,h,{ring:.85,shadow:false});movers.push(h.update);}).catch(console.warn);
    makeG1(loadModel).then(g=>{present(5,g,{ring:.42,shadow:true});movers.push(g.update);}).catch(console.warn);
    getArm().then(arm=>{if(arm){cyl(models[3],0,.01,0,.06,.02,mat(0x1d1e20,.5,.3),28);const f=realModel(arm,[0,-.4,-.08]);f.holder.position.y=.02;f.height+=.02;present(3,f,{ring:.3,shadow:false});}}).catch(console.warn);
    Promise.all([getRobot(),makeGripper(loadModel),kitPart(loadModel,'yellow_onion'),kitPart(loadModel,'wooden_cutting_board'),kitPart(loadModel,'carved_wooden_plate')])
      .then(([r,grip,onion,board,plate])=>{cell=makeCell(models[2],r,grip,{onion,board,plate});present(2,{holder:cell.holder,height:1.05,width:.5},{ring:1.1,shadow:false});})
      .catch(console.warn);
  }

  // UR16e (real size) with the Robotiq 2F-85 moving an onion from the board to the plate.
  function makeCell(slot,writer,grip,{onion,board,plate}){
    const holder=new T.Group();
    const yawed=new T.Group();holder.add(yawed);
    const robot=writer.robot.clone(true);yawed.add(robot);
    robot.getObjectByName('marker').visible=false;robot.getObjectByName('nib').visible=false;
    const joints=[0,1,2,3,4,5].map(i=>robot.getObjectByName('joint'+i));
    joints[5].add(grip.root);grip.root.position.z=.002;grip.setGrip(0);
    robot.position.y=.015;
    // Tool point: between the finger pads.
    slot.add(holder);holder.updateWorldMatrix(true,true);
    const a=grip.pads[0].getWorldPosition(new T.Vector3()),b=grip.pads[1].getWorldPosition(new T.Vector3());
    const tip=new T.Object3D();joints[5].add(tip);tip.position.copy(joints[5].worldToLocal(a.add(b).multiplyScalar(.5)));
    const onionH=onion.userData.size.y,boardH=board.userData.size.y,plateH=.012;
    const item=new T.Group();item.add(onion);onion.position.y=-onionH/2;yawed.add(item);
    function pose(base,reach){
      const sh=-1.78+.9*reach,el=1.5+.75*reach;
      const q=[base,sh,el,-H-sh-el,-H,base];joints.forEach((j,i)=>{j.rotation.z=q[i];});
    }
    const local=new T.Vector3();
    const tipAt=(base,reach)=>{pose(base,reach);holder.updateWorldMatrix(true,true);return yawed.worldToLocal(tip.getWorldPosition(local.set(0,0,0))).clone();};
    const solve=(base,height)=>{let lo=0,hi=1;for(let k=0;k<24;k++){const mid=(lo+hi)/2;if(tipAt(base,mid).y>height)lo=mid;else hi=mid;}return (lo+hi)/2;};
    const A=-.55,B=.9;
    const downA=solve(A,boardH+onionH/2+.002),downB=solve(B,plateH+onionH/2);
    const spotA=tipAt(A,downA),spotB=tipAt(B,downB);
    // Turn the cell so both spots sit in front of the robot, toward the visitor.
    const mid=spotA.clone().add(spotB).multiplyScalar(.5);
    yawed.rotation.y=Math.atan2(-mid.x,mid.z);
    board.position.set(spotA.x,0,spotA.z);board.rotation.y=.3;yawed.add(board);
    plate.position.set(spotB.x,0,spotB.z);yawed.add(plate);
    blob(yawed,spotA.x,spotA.z,.55,.35);blob(yawed,spotB.x,spotB.z,.36,.36);
    // The rest of the produce waits beside the board.
    const side=new T.Vector3(Math.cos(.3),0,-Math.sin(.3));
    [['lemon',.28,.05],['food_lime_01',.33,-.04],['sweet_potato',.3,.12],['food_avocado_01',.4,.06],['food_apple_01',.38,-.08],['fish_knife',0,.17,[-90,0,0]]]
      .forEach(([id,a,b,tilt])=>kitPart(loadModel,id,tilt).then(v=>{v.position.set(spotA.x+side.x*a+side.z*b,id==='fish_knife'?boardH:0,spotA.z+side.z*a-side.x*b);v.rotation.y=a*7;yawed.add(v);}).catch(console.warn));
    const rows=[[0,0,1,1],[1.1,0,0,1],[1.7,0,0,0],[2.8,0,1,0],[4.6,1,1,0],[5.7,1,0,0],[6.3,1,0,1],[7.3,1,1,1],[9,0,1,1]];
    const ease=t=>t*t*(3-2*t);
    function sample(t){
      for(let i=1;i<rows.length;i++)if(t<=rows[i][0]){const p=rows[i-1],q=rows[i],k=ease((t-p[0])/(q[0]-p[0]));return [p[1]+(q[1]-p[1])*k,p[2]+(q[2]-p[2])*k,p[3]+(q[3]-p[3])*k];}
      return rows[0].slice(1);
    }
    const closed=.8*(1-Math.min(.084,onion.userData.size.x)/.085)+.04;
    const spotFor=(s,lift)=>{const down=downA+(downB-downA)*s;return down+(Math.max(0,down-.42)-down)*lift;};
    function update(time){
      const cycle=Math.floor(time/9),t=time-cycle*9,flip=cycle%2===1;
      const [side,lift,open]=sample(t);
      const s=flip?1-side:side;
      pose(A+(B-A)*s,spotFor(s,lift));grip.setGrip(closed*(1-open));
      const from=flip?spotB:spotA,to=flip?spotA:spotB;
      const rest=p=>item.position.set(p.x,p.y,p.z);
      if(t<1.7)rest(from);
      else if(t>=6.3)rest(to);
      else{holder.updateWorldMatrix(true,true);item.position.copy(yawed.worldToLocal(tip.getWorldPosition(local.set(0,0,0))));}
    }
    update(0);
    return {holder,update};
  }

  function update(t){
    movers.forEach(f=>f(t));
    cell?.update(t);
    models.forEach((slot,i)=>{
      const u=slot.userData,pulse=.5+.5*Math.sin(t*2.2+i*1.3);
      u.h+=((i===hovered?1:0)-u.h)*.16;
      u.ring.material.opacity=.42+.06*pulse+.45*u.h;
    });
  }
  // Scroll progress → yaw in degrees, with a slow pan across each bench.
  function turn(p,{mobile=false,still=false}={}){
    if(still)return p<.2?-90:p<.42?-45:p<.72?0:90;
    const pan=mobile?16:5,c=mobile?8:3;
    const rows=[[0,-90-pan],[.15,-90+pan],[.27,-45-c],[.37,-45+c],[.5,-pan],[.64,pan],[.84,90-pan],[1,90+pan]];
    p=Math.min(1,Math.max(0,p));
    for(let i=1;i<rows.length;i++)if(p<=rows[i][0]){const a=rows[i-1],b=rows[i],k=(p-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*k*k*(3-2*k);}
    return rows[rows.length-1][1];
  }
  function arrange({eyeZ,yaw,mobile}){
    root.position.set(0,0,eyeZ);
    root.rotation.set(mobile?.3:.3,yaw*DEG,0,"XYZ");
  }
  const anchorPoint=new T.Vector3();
  return {
    root,models,load,update,turn,arrange,
    setHover:i=>{hovered=i;},
    facing:(i,yaw)=>Math.abs(yaw*DEG-BENCH_YAW[models[i].userData.table])<.42,
    anchor:i=>models[i].localToWorld(anchorPoint.set(0,models[i].userData.anchor,0)),
    stage:yaw=>yaw<-67?0:yaw<-22?1:yaw<45?2:3
  };
}
