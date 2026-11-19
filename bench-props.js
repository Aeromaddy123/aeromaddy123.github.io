// Bench items with no free CAD model, built to their published dimensions (metres).
// Each function returns a Group whose origin is the centre of its footprint on the table.
import * as T from './assets/three-runtime.js';

const H=Math.PI/2;
const mats=new Map();
export function mat(color,rough=.55,metal=0,extra={}){
  const key=[color,rough,metal,JSON.stringify(extra)].join('/');
  if(!mats.has(key))mats.set(key,new T.MeshStandardMaterial({color,roughness:rough,metalness:metal,...extra}));
  return mats.get(key);
}
export const M={
  black:mat(0x161718,.5,.1), charcoal:mat(0x2a2c2f,.45,.2), alu:mat(0xb4b8bc,.32,.75), steel:mat(0xc7cace,.28,.85),
  grey:mat(0x8a8f94,.5,.3), white:mat(0xeceeee,.45), red:mat(0xc62c25,.45), yellow:mat(0xe8b923,.5),
  rubber:mat(0x121212,.92), copper:mat(0xc58a4c,.35,.8), clear:mat(0xdbe7ef,.08,0,{transparent:true,opacity:.35}),
  pcbGreen:mat(0x1f5b33,.5), pcbBlack:mat(0x111312,.45), glass:mat(0x0b0d10,.12,.3)
};
export function group(parent,x=0,z=0,yaw=0,y=0){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=yaw;parent?.add(g);return g;}
export function box(p,x,y,z,w,h,d,m){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);p.add(o);return o;}
export function cyl(p,x,y,z,r,h,m,seg=24,rTop=r){const o=new T.Mesh(new T.CylinderGeometry(rTop,r,h,seg),m);o.position.set(x,y,z);p.add(o);return o;}
export function canvasTexture(w,h,draw){
  const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;
}
function face(p,x,y,z,w,h,tex,{lit=false,ry=0,rx=0}={}){
  const m=lit?new T.MeshBasicMaterial({map:tex,toneMapped:false}):new T.MeshStandardMaterial({map:tex,roughness:.5});
  const o=new T.Mesh(new T.PlaneGeometry(w,h),m);o.position.set(x,y,z);o.rotation.set(rx,ry,0);p.add(o);return o;
}
function screen(w,h,draw){return canvasTexture(w,h,(g,W,Hh)=>{g.fillStyle='#0c1117';g.fillRect(0,0,W,Hh);draw(g,W,Hh);});}
function curve(g,x,y,w,h,color,fn,steps=60){
  g.strokeStyle=color;g.lineWidth=Math.max(2,w/160);g.beginPath();
  for(let i=0;i<=steps;i++){const t=i/steps,v=fn(t);i?g.lineTo(x+t*w,y+h-v*h):g.moveTo(x+t*w,y+h-v*h);}g.stroke();
}

// ESD mat 1000×550×2 mm with ground snap; Cutting mat 450×300×3 mm with grid.
export function esdMat(p,x,z,yaw=0,w=1,d=.55){
  const g=group(p,x,z,yaw);
  const tex=canvasTexture(512,280,(c,W,Hh)=>{c.fillStyle='#4f7489';c.fillRect(0,0,W,Hh);c.strokeStyle='rgba(255,255,255,.05)';
    for(let i=0;i<W;i+=6){c.beginPath();c.moveTo(i,0);c.lineTo(i,Hh);c.stroke();}c.fillStyle='rgba(255,215,0,.85)';c.font='bold 11px sans-serif';c.fillText('⚠ ESD PROTECTED AREA',W-150,Hh-10);});
  box(g,0,.001,0,w,.002,d,new T.MeshStandardMaterial({map:tex,roughness:.85}));
  for(const s of [-1,1])cyl(g,s*(w/2-.03),.003,-d/2+.03,.006,.004,M.steel,12);
  return g;
}
export function cuttingMat(p,x,z,yaw=0,w=.6,d=.45){
  const g=group(p,x,z,yaw);
  const tex=canvasTexture(600,450,(c,W,Hh)=>{c.fillStyle='#2f6b4b';c.fillRect(0,0,W,Hh);
    for(let i=0;i<=60;i++){c.strokeStyle=i%10?'rgba(255,255,255,.18)':'rgba(255,255,255,.5)';c.lineWidth=i%10?1:1.6;
      const x=i*10;c.beginPath();c.moveTo(x,0);c.lineTo(x,Hh);c.stroke();if(i<=45){c.beginPath();c.moveTo(0,i*10);c.lineTo(W,i*10);c.stroke();}}});
  box(g,0,.0015,0,w,.003,d,new T.MeshStandardMaterial({map:tex,roughness:.8}));
  return g;
}

// Hakko FA-400-style fume extractor: 190×215×130 mm with carbon filter.
export function fumeExtractor(p,x,z,yaw=0){
  const g=group(p,x,z,yaw);
  box(g,0,.01,0,.14,.02,.13,M.black);
  for(const s of [-1,1])box(g,s*.075,.07,0,.01,.12,.03,M.black);
  const head=group(g,0,0,0,.12);head.rotation.x=-.35;
  box(head,0,0,0,.19,.19,.07,M.charcoal);
  box(head,0,0,.036,.17,.17,.004,mat(0x202020,.95));
  for(let i=0;i<6;i++)box(head,0,-.075+i*.03,.04,.17,.006,.006,M.black);
  return g;
}
// Helping hands with magnifier: cast base 150×80 mm, 2 clips, 90 mm lens.
export function helpingHands(p,x,z,yaw=0){
  const g=group(p,x,z,yaw);
  box(g,0,.01,0,.15,.02,.08,M.charcoal);
  cyl(g,0,.11,0,.0035,.18,M.steel,10);
  box(g,0,.2,0,.16,.006,.006,M.steel);
  for(const s of [-1,1]){
    const arm=group(g,s*.08,0,0,.2);arm.rotation.z=s*.6;
    cyl(arm,0,-.04,0,.003,.08,M.steel,8);
    box(arm,0,-.085,0,.006,.02,.012,M.red);
  }
  const lens=group(g,0,0,.05,.23);lens.rotation.x=-.9;
  const ring=new T.Mesh(new T.CylinderGeometry(.047,.047,.008,40,1,true),M.black);lens.add(ring);
  cyl(lens,0,0,0,.045,.003,M.clear,40);
  return g;
}
// Saleae-style logic analyser: 54×54×12 mm anodised block with a ribbon of leads.
export function logicAnalyser(p,x,z,yaw=0){
  const g=group(p,x,z,yaw);
  box(g,0,.006,0,.054,.012,.054,mat(0x2b3a52,.35,.6));
  const tex=canvasTexture(64,64,(c)=>{c.fillStyle='#2b3a52';c.fillRect(0,0,64,64);c.strokeStyle='#cfd8e6';c.lineWidth=3;c.beginPath();c.moveTo(10,44);c.lineTo(22,44);c.lineTo(22,20);c.lineTo(42,20);c.lineTo(42,44);c.lineTo(54,44);c.stroke();});
  face(g,0,.0122,0,.04,.04,tex,{rx:-H});
  const colors=[0x111111,0x6b3a1e,0xc62c25,0xe0702a,0xe8b923,0x2d7a45,0x2f62c9,0x8a4fc2];
  colors.forEach((c,i)=>{const w=box(g,-.021+i*.006,.002,.06,.0025,.0025,.07,mat(c,.5));w.rotation.y=(i-3.5)*.04;});
  return g;
}
// SkyRC B6-style LiPo charger 133×87×33 mm.
export function lipoCharger(p,x,z,yaw=0){
  const g=group(p,x,z,yaw);
  box(g,0,.0165,0,.133,.033,.087,M.charcoal);
  const tex=screen(256,96,(c,W,Hh)=>{c.fillStyle='#9fd3ff';c.font='bold 26px monospace';c.fillText('LiPo 4S',14,38);c.fillText('16.8V 2.0A',14,78);});
  face(g,-.02,.026,.0436,.06,.022,tex,{lit:true});
  ['#d6d6d6','#c62c25','#2f62c9','#3a3a3a'].forEach((c,i)=>cyl(g,.03+(i%2)*.022,.026-(i>1)*.012,.0436,.006,.004,mat(c,.4),16).rotation.x=H);
  return g;
}
// Jetson Orin Nano dev kit: 100×79 mm carrier, module, heatsink and 40 mm fan (≈35 mm tall).
export function jetson(p,x,z,yaw=0){
  const g=group(p,x,z,yaw);
  for(const sx of [-1,1])for(const sz of [-1,1])cyl(g,sx*.044,.003,sz*.034,.003,.006,M.steel,8);
  box(g,0,.0075,0,.103,.0015,.0905,M.pcbBlack);
  box(g,.005,.0115,.004,.07,.006,.045,mat(0x0f2617,.5));
  for(let i=0;i<10;i++)box(g,.005,.022,-.016+i*.0045,.068,.015,.001,M.alu);
  cyl(g,.005,.031,.004,.019,.004,M.black,30);
  [[-.045,.012,-.03,.016,.014,.014],[-.045,.012,-.006,.016,.014,.014],[-.045,.013,.022,.018,.014,.016],[-.045,.011,.04,.012,.008,.008]].forEach(b=>box(g,b[0],b[1],b[2],b[3],b[4],b[5],M.steel));
  box(g,.02,.0095,.043,.05,.004,.004,M.black);
  return g;
}
// 5-port gigabit switch 100×26×98 mm.
export function netSwitch(p,x,z,yaw=0){
  const g=group(p,x,z,yaw);
  box(g,0,.013,0,.1,.026,.098,M.white);
  for(let i=0;i<5;i++){box(g,-.036+i*.017,.012,.049,.013,.011,.004,M.black);box(g,-.036+i*.017,.021,.0495,.003,.002,.001,mat(0x5cff7a,.3,0,{emissive:0x2bd04a,emissiveIntensity:1.4}));}
  return g;
}
// Generic component drawer cabinet (39 clear drawers) 380×240×160 mm.
export function partsDrawers(p,x,z,yaw=0,{cols=6,rows=5,w=.38,h=.24,d=.16}={}){
  const g=group(p,x,z,yaw);
  box(g,0,h/2,0,w,h,d,mat(0x3d5a8a,.5));
  const dw=(w-.02)/cols,dh=(h-.02)/rows,fill=[0xc79a4b,0x2f62c9,0xd8d2c0,0x6b6f72,0xb3262d,0x2d7a45];
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const cx=-w/2+.01+dw*(c+.5),cy=.01+dh*(r+.5);
    box(g,cx,cy,d/2+.002,dw-.004,dh-.004,.004,M.clear);
    box(g,cx,cy-dh*.18,d/2-.02,dw-.012,dh*.35,.03,mat(fill[(r*3+c)%fill.length],.6));
    box(g,cx,cy-dh*.32,d/2+.006,dw*.35,.004,.006,M.white);
  }
  return g;
}
// Spools: solder (Ø60×45 mm), hook-up wire (Ø60×40 mm), PLA filament (Ø200×65 mm).
export function spool(p,x,z,yaw=0,{r=.03,w=.045,core=.012,fill=M.steel,flange=M.black,standing=true}={}){
  const g=group(p,x,z,yaw);
  const s=group(g,0,0,0,standing?r:w/2);if(standing)s.rotation.z=H;
  cyl(s,0,0,0,r*.9,w*.86,fill,32);
  for(const k of [-1,1])cyl(s,0,k*w/2,0,r,w*.07,flange,36);
  cyl(s,0,0,0,core,w*1.02,M.white,18);
  return g;
}
export function filament(p,x,z,yaw,color){return spool(p,x,z,yaw,{r:.1,w:.065,core:.028,fill:mat(color,.55),flange:mat(0x1c1c1c,.5)});}
// Tabletop tripod (≈200 mm, Manfrotto PIXI class) with a 1/4" head; returns {g,head}.
const UP=new T.Vector3(0,1,0);
export function tripod(p,x,z,yaw=0,height=.2){
  const g=group(p,x,z,yaw);
  const top=new T.Vector3(0,height-.02,0);
  for(let i=0;i<3;i++){
    const a=i*Math.PI*2/3+.5,foot=new T.Vector3(Math.cos(a)*.085,.004,Math.sin(a)*.085);
    const dir=top.clone().sub(foot),len=dir.length();
    const leg=new T.Mesh(new T.CylinderGeometry(.0045,.006,len,10),M.charcoal);
    leg.position.copy(foot).addScaledVector(dir,.5);leg.quaternion.setFromUnitVectors(UP,dir.normalize());g.add(leg);
    const tip=new T.Mesh(new T.SphereGeometry(.007,10,8),M.rubber);tip.position.copy(foot);g.add(tip);
  }
  cyl(g,0,height-.012,0,.016,.03,M.black,18);
  const ball=new T.Mesh(new T.SphereGeometry(.012,14,10),M.alu);ball.position.y=height+.006;g.add(ball);
  const head=group(g,0,0,0,height+.016);
  return {g,head};
}
// ChArUco calibration board (A3, 420×297 mm, 5 mm foam).
export function charuco(p,x,z,yaw=0){
  const g=group(p,x,z,yaw);
  const tex=canvasTexture(840,594,(c,W,Hh)=>{c.fillStyle='#fff';c.fillRect(0,0,W,Hh);const s=W/8.4;
    for(let i=0;i<8;i++)for(let j=0;j<5;j++){const px=s*.2+i*s,py=s*.2+j*s*1.07;
      if((i+j)%2){c.fillStyle='#111';c.fillRect(px,py,s,s);}else{c.fillStyle='#111';c.fillRect(px+s*.2,py+s*.2,s*.6,s*.6);c.fillStyle='#fff';
        for(let k=0;k<9;k++)if((i*7+j*3+k*5)%3)c.fillRect(px+s*.2+(k%3)*s*.2,py+s*.2+Math.floor(k/3)*s*.2,s*.2,s*.2);}}});
  const board=group(g,0,0,0,0);board.rotation.x=-.18;
  box(board,0,.1485,-.004,.42,.297,.005,M.white);
  face(board,0,.1485,-.0012,.41,.288,tex);
  return g;
}
// Laptop 357×248 mm, 18 mm thick, screen open ~110°.
export function laptop(p,x,z,yaw=0){
  const g=group(p,x,z,yaw);
  box(g,0,.006,0,.357,.012,.248,mat(0x2b2d31,.35,.6));
  const keys=canvasTexture(256,128,(c,W,Hh)=>{c.fillStyle='#1d1e21';c.fillRect(0,0,W,Hh);c.fillStyle='#0b0b0c';for(let r=0;r<6;r++)for(let k=0;k<15;k++)c.fillRect(6+k*16.5,6+r*16,14,13);c.fillStyle='#26282c';c.fillRect(90,104,76,22);});
  face(g,0,.0121,-.03,.3,.12,keys,{rx:-H});
  const lid=group(g,0,-.124,0,.012);lid.rotation.x=-.33;
  box(lid,0,.124,-.004,.357,.248,.006,mat(0x2b2d31,.35,.6));
  const tex=screen(512,320,(c,W,Hh)=>{c.fillStyle='#1b2430';c.fillRect(0,0,W,30);c.fillStyle='#9fb3c8';c.font='16px sans-serif';c.fillText('policy training · VeggieBot',12,21);
    c.strokeStyle='#2c3540';for(let i=1;i<6;i++){c.beginPath();c.moveTo(20,30+i*46);c.lineTo(W-14,30+i*46);c.stroke();}
    curve(c,24,46,W-50,250,'#ff9a4c',t=>.95*Math.exp(-t*3.2)+.03*Math.sin(t*60)+.05);curve(c,24,46,W-50,250,'#5ec2ff',t=>.15+.75*(1-Math.exp(-t*2.6)));});
  face(lid,0,.126,.0001,.33,.21,tex,{lit:true});
  return g;
}
// Universal Robots e-Series style teach pendant 300×231×50 mm (generic UI).
export function teachPendant(p,x,z,yaw=0){
  const g=group(p,x,z,yaw);
  const body=group(g,0,0,0,.025);body.rotation.x=-H;
  box(body,0,0,0,.3,.231,.05,mat(0xe3e5e6,.45));
  box(body,0,0,.026,.26,.18,.002,M.glass);
  const tex=screen(520,360,(c,W,Hh)=>{c.fillStyle='#e9eef2';c.fillRect(0,0,W,Hh);c.fillStyle='#244a73';c.fillRect(0,0,W,38);c.fillStyle='#fff';c.font='bold 18px sans-serif';c.fillText('Program · veggie_pick.urp',14,25);
    c.fillStyle='#244a73';c.font='15px sans-serif';['▸ MoveJ  home','▸ MoveL  above_onion','▸ Gripper close 70 mm','▸ MoveL  plate','▸ Gripper open'].forEach((s,i)=>c.fillText(s,24,80+i*34));
    c.fillStyle='#2d7a45';c.fillRect(W-150,Hh-58,130,40);c.fillStyle='#fff';c.fillText('Play ▶',W-112,Hh-32);});
  face(body,0,0,.0275,.25,.172,tex,{lit:true});
  cyl(body,.12,.1,.03,.016,.02,M.red,20).rotation.x=H;
  box(body,.12,.1,.022,.04,.04,.006,M.yellow);
  return g;
}
// UR e-Series control box 475×423×268 mm (steel cabinet on the floor).
export function controlBox(p,x,z,yaw=0){
  const g=group(p,x,z,yaw);
  box(g,0,.2115,0,.475,.423,.268,mat(0x9ea3a7,.4,.55));
  box(g,0,.2115,.135,.44,.39,.004,mat(0xb3b8bc,.35,.6));
  for(let i=0;i<8;i++)box(g,-.15,.1+i*.025,.138,.12,.008,.004,M.charcoal);
  box(g,.17,.32,.138,.03,.08,.01,M.charcoal);
  return g;
}
// Quick-858D-style hot-air rework station 160×110×200 mm with handle in a holder.
export function hotAir(p,x,z,yaw=0){
  const g=group(p,x,z,yaw);
  box(g,0,.055,0,.16,.11,.2,M.charcoal);
  box(g,0,.055,.101,.15,.1,.003,mat(0x1d4f8c,.45));
  const tex=screen(128,48,(c)=>{c.fillStyle='#ff4a3a';c.font='bold 34px monospace';c.fillText('350',20,38);});
  face(g,-.03,.075,.1035,.05,.019,tex,{lit:true});
  cyl(g,.04,.04,.1035,.009,.01,M.black,16).rotation.x=H;cyl(g,.04,.07,.1035,.009,.01,M.black,16).rotation.x=H;
  const holder=group(g,.115,.0,0);box(holder,0,.006,0,.06,.012,.1,M.black);
  const gun=group(holder,0,0,0,.05);gun.rotation.x=.25;
  cyl(gun,0,0,0,.018,.17,M.charcoal,20).rotation.x=H;cyl(gun,0,0,.1,.006,.04,M.steel,12).rotation.x=H;
  return g;
}
// Mounting plate for the UR16e (250×250×15 mm steel).
export function robotPlate(p,x,z){const g=group(p,x,z);box(g,0,.0075,0,.25,.015,.25,mat(0x56595c,.4,.7));return g;}

// VeggieBot teleop screen for the monitor (16:9): wrist camera, depth view, joint states.
export function cameraFeedTexture(){
  const tex=canvasTexture(1024,576,(c,W,Hh)=>{
    c.fillStyle='#0d1218';c.fillRect(0,0,W,Hh);
    c.fillStyle='#16202b';c.fillRect(0,0,W,34);
    c.fillStyle='#cfe2f3';c.font='600 17px sans-serif';c.fillText('VeggieBot · teleop',14,23);
    c.fillStyle='#ff4d4d';c.beginPath();c.arc(W-92,17,6,0,7);c.fill();c.fillStyle='#ffb3b3';c.font='600 14px monospace';c.fillText('REC',W-80,22);
    // Wrist camera: looking down at the board, onion between the fingers.
    const x0=12,y0=44,w=640,h=520;
    const bg=c.createLinearGradient(0,y0,0,y0+h);bg.addColorStop(0,'#c9c4b8');bg.addColorStop(1,'#a9a397');c.fillStyle=bg;c.fillRect(x0,y0,w,h);
    c.save();c.translate(x0+w*.5,y0+h*.62);c.rotate(-.12);
    const wood=c.createLinearGradient(-260,0,260,0);wood.addColorStop(0,'#b07a42');wood.addColorStop(.5,'#c98f52');wood.addColorStop(1,'#a8703b');
    c.fillStyle=wood;c.fillRect(-270,-150,540,300);c.strokeStyle='rgba(90,55,25,.35)';c.lineWidth=2;
    for(let i=-140;i<150;i+=14){c.beginPath();c.moveTo(-270,i);c.bezierCurveTo(-90,i+8,90,i-8,270,i+4);c.stroke();}
    c.restore();
    const ox=x0+w*.5,oy=y0+h*.6;
    c.fillStyle='rgba(40,25,10,.35)';c.beginPath();c.ellipse(ox+14,oy+26,74,40,0,0,7);c.fill();
    const onion=c.createRadialGradient(ox-24,oy-28,8,ox,oy,82);onion.addColorStop(0,'#f2d38a');onion.addColorStop(.6,'#c98b3c');onion.addColorStop(1,'#8a5420');
    c.fillStyle=onion;c.beginPath();c.ellipse(ox,oy,78,70,0,0,7);c.fill();
    c.strokeStyle='rgba(110,65,20,.5)';c.lineWidth=2;for(let a=-.8;a<=.8;a+=.4){c.beginPath();c.ellipse(ox,oy,78*Math.cos(a)*.9+4,70,0,-1.3,1.3);c.stroke();}
    // Gripper fingers from the top of the frame.
    c.fillStyle='#1b1d20';
    for(const s of [-1,1]){c.beginPath();c.moveTo(ox+s*150,y0);c.lineTo(ox+s*190,y0);c.lineTo(ox+s*108,oy-10);c.lineTo(ox+s*84,oy-10);c.closePath();c.fill();}
    c.fillStyle='#2a2d31';for(const s of [-1,1])c.fillRect(ox+s*96-12,oy-60,24,56);
    c.strokeStyle='#4dff88';c.lineWidth=3;c.strokeRect(ox-96,oy-84,192,172);
    c.fillStyle='#4dff88';c.fillRect(ox-96,oy-108,96,24);c.fillStyle='#08210f';c.font='600 16px sans-serif';c.fillText('onion',ox-86,oy-90);
    c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=1.5;c.beginPath();c.moveTo(ox-14,oy);c.lineTo(ox+14,oy);c.moveTo(ox,oy-14);c.lineTo(ox,oy+14);c.stroke();
    c.fillStyle='rgba(13,18,24,.7)';c.fillRect(x0,y0,170,26);c.fillStyle='#cfe2f3';c.font='13px monospace';c.fillText('wrist · D435 rgb',x0+8,y0+18);
    // Depth view.
    const dx=664,dy=44,dw=348,dh=200;
    const turbo=['#30123b','#4662d7','#36aaf9','#1ae4b6','#72fe5e','#c8ef34','#faba39','#f66b19','#ca2a04'];
    const dg=c.createLinearGradient(dx,dy,dx,dy+dh);turbo.forEach((col,i)=>dg.addColorStop(i/(turbo.length-1),col));c.fillStyle=dg;c.fillRect(dx,dy,dw,dh);
    const blobAt=(x,y,r,col)=>{const g=c.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();};
    blobAt(dx+dw*.45,dy+dh*.6,46,'#ca2a04');blobAt(dx+dw*.75,dy+dh*.5,34,'#faba39');blobAt(dx+dw*.2,dy+dh*.35,28,'#72fe5e');
    c.fillStyle='rgba(13,18,24,.7)';c.fillRect(dx,dy,150,24);c.fillStyle='#cfe2f3';c.fillText('top · depth',dx+8,dy+17);
    // Joint states.
    const jx=664,jy=256;c.fillStyle='#121a23';c.fillRect(jx,jy,dw,192);
    c.fillStyle='#8fa6bd';c.font='600 13px sans-serif';c.fillText('UR16e joint states',jx+10,jy+20);
    [.62,.35,.71,.48,.5,.28].forEach((v,i)=>{const y=jy+36+i*25;c.fillStyle='#8fa6bd';c.font='12px monospace';c.fillText('q'+(i+1),jx+10,y+11);
      c.fillStyle='#223040';c.fillRect(jx+40,y,dw-60,12);c.fillStyle=i===5?'#ff9a4c':'#5ec2ff';c.fillRect(jx+40,y,(dw-60)*v,12);});
    // Status strip.
    c.fillStyle='#121a23';c.fillRect(jx,460,dw,104);
    c.fillStyle='#cfe2f3';c.font='13px monospace';
    ['policy   running','gripper  closing','task     onion → plate','link     Quest 3 · Jetson'].forEach((s,i)=>c.fillText(s,jx+12,484+i*22));
  });
  return tex; // this monitor's screen UVs are authored for flipped (canvas-style) images
}
