// The robotics lab behind the glass. It is drawn on its own canvas and blurred
// in CSS, so it reads as an out-of-focus background behind the sharp UR16e.
// Coordinates match the writing scene: metres, robot base at the origin,
// glass toward +z, lab floor at FLOOR.
import * as T from './assets/three-runtime.js';
import {FLOOR} from './robot.js';

const H=Math.PI/2, REPEAT=1000;
const mats=new Map();
function mat(color,roughness=.6,metalness=.05){
  const key=color+'/'+roughness+'/'+metalness;
  if(!mats.has(key))mats.set(key,new T.MeshStandardMaterial({color,roughness,metalness}));
  return mats.get(key);
}
const light=(color,boost=1)=>new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(boost),toneMapped:false});
function box(parent,x,y,z,w,h,d,material){const m=new T.Mesh(new T.BoxGeometry(w,h,d),material);m.position.set(x,y,z);parent.add(m);return m;}
function cyl(parent,x,y,z,r,h,material,seg=24){const m=new T.Mesh(new T.CylinderGeometry(r,r,h,seg),material);m.position.set(x,y,z);parent.add(m);return m;}
const ease=t=>t*t*(3-2*t);
// Keyframed loop: rows of [time, ...values], eased between rows.
function keyed(rows,t){
  const period=rows[rows.length-1][0];
  t=((t%period)+period)%period;
  for(let i=1;i<rows.length;i++)if(t<=rows[i][0]){
    const a=rows[i-1],b=rows[i],k=ease((t-a[0])/((b[0]-a[0])||1));
    return a.map((v,j)=>v+(b[j]-v)*k).slice(1);
  }
  return rows[0].slice(1);
}

function floorTexture(){
  const c=document.createElement('canvas');c.width=c.height=512;
  const g=c.getContext('2d');
  g.fillStyle='#c9c1b2';g.fillRect(0,0,512,512);
  for(let i=0;i<2600;i++){g.fillStyle=`rgba(${90+Math.random()*80|0},${80+Math.random()*70|0},60,${Math.random()*.06})`;g.fillRect(Math.random()*512,Math.random()*512,2+Math.random()*5,2+Math.random()*5);}
  g.strokeStyle='rgba(70,60,45,.12)';g.lineWidth=2;
  for(let i=0;i<=512;i+=128){g.beginPath();g.moveTo(i,0);g.lineTo(i,512);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(512,i);g.stroke();}
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=REPEAT;tex.repeat.set(9,7);
  return tex;
}

function room(root){
  const floor=new T.Mesh(new T.PlaneGeometry(26,20),new T.MeshStandardMaterial({map:floorTexture(),roughness:.38,metalness:.04}));
  floor.rotation.x=-H;floor.position.set(0,FLOOR,-4);root.add(floor);
  const wall=mat(0x6e665b,.85),ceiling=mat(0x5a544b,.9);
  box(root,0,FLOOR+2.6,-9.4,26,5.2,.1,wall);
  for(const x of [-8.5,8.5])box(root,x,FLOOR+2.6,-3.5,.1,5.2,13,wall);
  box(root,0,FLOOR+4.05,-3.5,17,.1,13,ceiling);
  // After hours: night-blue windows and a few dim warm ceiling panels become soft bokeh.
  const day=light(0x16233a,1),panel=light(0xffd29a,.5);
  for(let i=0;i<5;i++)box(root,-6+i*3,FLOOR+2.5,-9.33,2.1,2.4,.02,day);
  for(let i=0;i<4;i++)for(let j=0;j<3;j++)box(root,-4.5+i*3,FLOOR+3.98,-1.6-j*2.8,1.4,.03,.5,panel);
  for(const x of [-4.2,4.2])box(root,x,FLOOR+2.6,-7.6,.4,5.2,.4,mat(0xd8d0c2,.8));
  // Yellow safety lines around the robot cells.
  const tape=light(0xe6b53e,.9);
  for(const [x,z,w,d] of [[-1.15,-2.1,1.5,.05],[-1.15,-3.7,1.5,.05],[-1.9,-2.9,.05,1.6],[-.4,-2.9,.05,1.6],[1.25,-2.6,1.5,.05],[1.25,-4.2,1.5,.05],[.5,-3.4,.05,1.6],[2,-3.4,.05,1.6],[0,-4.8,8,.06]])
    box(root,x,FLOOR+.003,z,w,.004,d,tape);
}

function shelves(root){
  const frame=mat(0x50565a,.5,.4),bins=[0xe07a3f,0x3f6fa0,0xd8b24a,0x8e9a8f,0xe07a3f,0x3f6fa0];
  for(let r=0;r<3;r++){
    const g=new T.Group();g.position.set(-5+r*3.3,FLOOR,-8.7);root.add(g);
    for(const x of [-1.1,1.1])box(g,x,1.15,0,.06,2.3,.06,frame);
    for(let s=0;s<4;s++){
      box(g,0,.35+s*.6,0,2.26,.04,.6,frame);
      for(let b=0;b<6;b++)if((b+s+r)%5!==0)box(g,-.9+b*.36,.47+s*.6,0,.3,.2,.45,mat(bins[(b+s*2+r)%6],.7));
    }
  }
}

function desks(root){
  const top=mat(0xb99768,.6),legs=mat(0x414941,.5,.3),screen=light(0x9cc8e8,1.1);
  for(const [x,z] of [[-2.7,-6.1],[0,-6.4],[2.8,-6.1]]){
    const g=new T.Group();g.position.set(x,FLOOR,z);root.add(g);
    box(g,0,.76,0,1.8,.05,.8,top);
    for(const x of [-.85,.85])for(const z of [-.35,.35])box(g,x,.38,z,.05,.76,.05,legs);
    box(g,-.3,1.06,-.25,.62,.38,.03,mat(0x1c1d1f,.4));
    box(g,-.3,1.06,-.234,.58,.34,.005,screen);
    box(g,.32,1.02,-.28,.4,.28,.03,mat(0x1c1d1f,.4));box(g,.32,1.02,-.264,.36,.24,.005,screen);
    box(g,.45,.97,-.2,.4,.4,.35,mat(0xcb6a3f,.55));
  }
}

function conveyor(root){
  const g=new T.Group();g.position.set(0,FLOOR,-4.3);root.add(g);
  const frame=mat(0x3c4144,.45,.5);
  box(g,0,.4,0,6.4,.08,.5,frame);
  box(g,0,.45,0,6.3,.025,.42,mat(0x1f2021,.8));
  for(let x=-3;x<=3;x+=1)for(const z of [-.2,.2])box(g,x,.2,z,.06,.4,.06,frame);
  const card=mat(0xc89b63,.8),parcels=[];
  for(let i=0;i<8;i++)parcels.push(box(g,0,.54,0,.26+(i%3)*.05,.16+(i%2)*.05,.24,card));
  return t=>parcels.forEach((p,i)=>{p.position.x=-3.05+((t*.32+i*.8)%6.2);});
}

// Background UR16e: the writer cloned, marker swapped for a two-finger gripper.
function cobot(root,writer,x,z,turn,phase,reachA,reachB){
  const pedestal=new T.Group();pedestal.position.set(x,FLOOR,z);root.add(pedestal);
  cyl(pedestal,0,.36,0,.13,.72,mat(0x34383b,.45,.4),28);
  cyl(pedestal,0,.012,0,.24,.024,mat(0x2a2d2f,.5,.3),28);
  const robot=writer.robot.clone(true);robot.position.y=.735;robot.rotation.y=turn;pedestal.add(robot);
  robot.getObjectByName('marker').visible=false;robot.getObjectByName('nib').visible=false;
  const joints=[0,1,2,3,4,5].map(i=>robot.getObjectByName('joint'+i));
  const hand=new T.Group();joints[5].add(hand);
  const grey=mat(0x5d6164,.4,.5),pad=mat(0x24262a,.6);
  const body=new T.Mesh(new T.BoxGeometry(.08,.06,.07),grey);body.position.z=.045;hand.add(body);
  const fingers=[-1,1].map(s=>{const f=new T.Mesh(new T.BoxGeometry(.016,.022,.06),pad);f.position.set(s*.03,0,.105);hand.add(f);return f;});
  const parcel=new T.Mesh(new T.BoxGeometry(.11,.09,.1),mat(0xc89b63,.8));parcel.position.z=.16;hand.add(parcel);
  // [t, base, lift(0 down,1 up), grip(0 open,1 closed)]
  const rows=[[0,reachA,0,0],[.7,reachA,0,1],[1.6,reachA,1,1],[3.3,reachB,1,1],[4.2,reachB,0,1],[4.9,reachB,0,0],[5.8,reachB,1,0],[7.5,reachA,1,0],[8.4,reachA,0,0]];
  return t=>{
    const [base,lift,grip]=keyed(rows,t+phase);
    const shoulder=-1.2-.48*lift,elbow=1.9-.32*lift;
    const pose=[base,shoulder,elbow,-H-shoulder-elbow,-H,base*.6];
    joints.forEach((j,i)=>{j.rotation.z=pose[i];});
    fingers.forEach((f,i)=>{f.position.x=(i?1:-1)*(.034-.012*grip);});
    parcel.visible=grip>.5;
  };
}

function rover(root){
  const g=new T.Group();root.add(g);
  box(g,0,.13,0,.62,.16,.44,mat(0x2e3134,.45,.35));
  box(g,0,.13,.222,.62,.035,.006,light(0xff8a4c,.9));
  cyl(g,.2,.25,0,.05,.06,mat(0x1d1e20,.4,.5));
  box(g,-.05,.32,0,.42,.2,.34,mat(0xc89b63,.8));
  for(const x of [-.22,.22])for(const z of [-.2,.2]){const w=cyl(g,x,.06,z,.06,.04,mat(0x151617,.7));w.rotation.x=H;}
  return t=>{
    const a=t*.2;g.position.set(3.2*Math.cos(a),FLOOR,-5.25+.35*Math.sin(a));
    g.rotation.y=-Math.atan2(.35*Math.cos(a),-3.2*Math.sin(a));
  };
}

function fit(model,size){
  const holder=new T.Group(),b=new T.Box3().setFromObject(model),dims=b.getSize(new T.Vector3()),c=b.getCenter(new T.Vector3());
  model.position.set(-c.x,-b.min.y,-c.z);holder.add(model);
  const inner=new T.Group();inner.add(holder);holder.scale.setScalar(size/Math.max(dims.x,dims.y,dims.z));
  return inner;
}

export function makeLab(writer,loadModel,{light:lite=false}={}){
  const root=new T.Group();root.matrixAutoUpdate=false;
  room(root);shelves(root);desks(root);
  const movers=[conveyor(root),rover(root),
    cobot(root,writer,-1.15,-2.9,0,0,-2.4,-.7),
    cobot(root,writer,1.25,-3.4,0,2.9,-2.5,-.9),
    cobot(root,writer,-1.5,-7.1,Math.PI,5.3,-2.3,-.8)];
  // Kishan's own projects working around the lab, sharing the bench's models.
  const extras=[
    ['robot-assembly',.32,[-H,0,Math.PI],(o,t)=>{const x=.42*Math.sin(t*.55);o.position.set(-.98+x*.5,FLOOR+.79,-1.55);o.rotation.set(.08*Math.sin(t*2.9)+.16*Math.cos(t*.55),Math.cos(t*.55)>0?H:-H,0);}],
    ['spidrone',.5,[0,0,0],(o,t)=>{o.position.set(.7+.45*Math.sin(t*.5),1.45+.09*Math.sin(t*1.6),-3.1+.3*Math.cos(t*.5));o.rotation.set(.05*Math.sin(t*1.1),t*.35,.06*Math.cos(t*.9));}],
    ['robotic-arm',.62,[0,-.45,0],(o,t)=>{o.position.set(1.02,FLOOR+.79,-1.7);o.rotation.y=-.5+.7*Math.sin(t*.33);}]
  ].filter(([file])=>!lite||file==='robot-assembly');
  for(const [x,z] of lite?[[-.98,-1.55]]:[[-.98,-1.55],[1.02,-1.7]]){
    const bench=new T.Group();bench.position.set(x,FLOOR,z);root.add(bench);
    box(bench,0,.76,0,.9,.05,.6,mat(0xb99768,.6));
    for(const bx of [-.4,.4])for(const bz of [-.25,.25])box(bench,bx,.38,bz,.05,.76,.05,mat(0x414941,.5,.3));
  }
  for(const [file,size,angles,move] of extras){
    const slot=new T.Group();root.add(slot);
    loadModel(file).then(gltf=>{
      const model=gltf.scene.clone(true);model.rotation.set(...angles);
      const placed=fit(model,size);slot.add(placed);
      movers.push(t=>move(placed,t));move(placed,0);
    }).catch(console.warn);
  }
  return {root,update:t=>movers.forEach(m=>m(t))};
}
