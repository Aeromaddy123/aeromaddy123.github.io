import * as T from './assets/three-runtime.js';
import {getLang} from './i18n.js';
const names=['base','shoulder','upperarm','forearm','wrist1','wrist2','wrist3'];
const h=Math.PI/2;
const offsets=[[0,0,0,0,0,2*h],[0,0,0,0,0,2*h],[0,0,.1762,h,0,-h],[0,0,.0393,h,0,-h],[0,0,-.135,h,0,0],[0,0,-.12,0,0,0],[0,-.0005,-.1168,h,0,0]];
function applyOrigin(obj,values){
  obj.position.set(...values.slice(0,3));
  obj.rotation.set(...values.slice(3),'ZYX');
}
export async function loadRobot(loader) {
  // The glass sentence in each language: the same arm, solved along a different path.
  const [path,pathFr,...models]=await Promise.all([fetch('./assets/ur16e/lettering.json').then(r=>r.json()),
    fetch('./assets/ur16e/lettering-fr.json').then(r=>r.json()).catch(()=>null),...names.map(name=>loader.loadAsync('./assets/ur16e/'+name+'.glb'))]);
  const robot=new T.Group(),base=new T.Group(),joints=[];
  robot.add(base);base.rotation.x=-h; // ROS Z-up to scene Y-up
  let parent=base;
  models.forEach(({scene},i)=>{
    if(i){const origin=new T.Group(),joint=new T.Group();joint.name='joint'+(i-1);applyOrigin(origin,path.origins[i-1]);parent.add(origin);origin.add(joint);parent=joint;joints.push(joint);}
    const visual=new T.Group();applyOrigin(visual,offsets[i]);parent.add(visual);
    scene.rotation.x=h; // restore the Z-up source coordinates before the URDF visual offset
    scene.traverse(object=>{
      if(!object.isMesh)return;

      const material=object.material;
      const name=material.name;

      if(name==='LinkGrey'){
        material.color.setRGB(.72,.73,.70);
        material.roughness=.36;
        material.metalness=.28;
      } else if(name==='JointGrey'){
        material.color.setRGB(.10,.105,.10);
        material.roughness=.29;
        material.metalness=.42;
      } else if(name==='Black'){
        material.color.setRGB(.016,.018,.016);
        material.roughness=.23;
        material.metalness=.48;
      } else {
        material.roughness=.38;
        material.metalness=.25;
      }

      material.envMapIntensity=1.15;
    });
    visual.add(scene);
  });
  const marker=new T.Mesh(new T.CylinderGeometry(.009,.011,path.pen-.012,20),new T.MeshStandardMaterial({color:0xf2bd6d,roughness:.44}));
  marker.name='marker';marker.rotation.x=h;marker.position.z=(path.pen-.012)/2;parent.add(marker);
  const nib=new T.Mesh(new T.CylinderGeometry(.002,.008,.012,16),new T.MeshStandardMaterial({color:0xf7eedd,roughness:.4}));nib.name='nib';
  nib.rotation.x=h;nib.position.z=path.pen-.006;parent.add(nib);
  const penTip=new T.Object3D();penTip.position.z=path.pen;parent.add(penTip);
  const scripts={en:path.frames,fr:pathFr?.frames||path.frames};
  const writer={robot,penTip,frames:scripts[getLang()]||scripts.en,
    pose(i){writer.frames[i].slice(4).forEach((r,j)=>{joints[j].rotation.z=r;});},
    useLang(lang){writer.frames=scripts[lang]||scripts.en;}};
  writer.pose(0);
  return writer;
}
// The UR16e's own workstation. The robot's base stays at the origin, so the
// lettering path is untouched; the mounting plate fills the gap to the top.
export const TABLE_TOP=-.012, FLOOR=-.85;
export function makeTable(parent){
  const steel=new T.MeshStandardMaterial({color:0xb4b5b0,metalness:.62,roughness:.34});
  const slot=new T.MeshStandardMaterial({color:0x3a3c3b,metalness:.4,roughness:.5});
  const top=new T.MeshStandardMaterial({color:0x34373a,metalness:.3,roughness:.4});
  const dark=new T.MeshStandardMaterial({color:0x2a2c2d,metalness:.35,roughness:.42});
  const add=(geo,mat,x,y,z)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;};
  const t=.03,x0=.62,zb=-.47,zf=.53,zc=(zb+zf)/2,depth=zf-zb+.06;
  add(new T.CylinderGeometry(.106,.11,-TABLE_TOP,40),dark,0,TABLE_TOP/2,0);
  add(new T.BoxGeometry(1.32,t,depth),top,0,TABLE_TOP-t/2,zc);
  add(new T.BoxGeometry(1.32,.012,.012),steel,0,TABLE_TOP-t-.004,zf+.024);
  const legH=TABLE_TOP-t-FLOOR;
  for(const x of [-x0,x0])for(const z of [zb,zf]){
    add(new T.BoxGeometry(.05,legH,.05),steel,x,FLOOR+legH/2,z);
    add(new T.BoxGeometry(.008,legH*.96,.052),slot,x+(x>0?.022:-.022),FLOOR+legH/2,z);
    add(new T.BoxGeometry(.09,.012,.09),dark,x,FLOOR+.006,z);
  }
  for(const z of [zb,zf])add(new T.BoxGeometry(2*x0,.05,.04),steel,0,TABLE_TOP-t-.03,z);
  for(const x of [-x0,x0])add(new T.BoxGeometry(.04,.05,zf-zb),steel,x,TABLE_TOP-t-.03,zc);
  add(new T.BoxGeometry(2*x0-.02,.018,zf-zb),top,0,-.6,zc);
  // UR control cabinet on the lower shelf, teach pendant on the top.
  add(new T.BoxGeometry(.46,.4,.25),new T.MeshStandardMaterial({color:0xd6d8d5,roughness:.5}),-.22,-.39,zc);
  add(new T.BoxGeometry(.3,.26,.006),dark,-.22,-.37,zc+.128);
  const pendant=new T.Group();pendant.position.set(-.43,TABLE_TOP+.012,.22);pendant.rotation.set(-.08,.42,0);parent.add(pendant);
  const shell=new T.Mesh(new T.BoxGeometry(.3,.022,.21),new T.MeshStandardMaterial({color:0xd3d5d2,roughness:.45}));pendant.add(shell);
  const screen=new T.Mesh(new T.PlaneGeometry(.22,.15),new T.MeshBasicMaterial({color:0x5f8fae}));screen.rotation.x=-Math.PI/2;screen.position.set(-.02,.012,0);pendant.add(screen);
  const stop=new T.Mesh(new T.CylinderGeometry(.018,.018,.016,20),new T.MeshStandardMaterial({color:0xc8302a,roughness:.4}));stop.position.set(.12,.017,-.07);pendant.add(stop);
}
export function makeGlass(parent,writer){
  const w=1.04, height=.61, center=.49, depth=.50;
  const paper=document.createElement('canvas');paper.width=1536;paper.height=Math.round(paper.width*height/w);
  const ctx=paper.getContext('2d');
  const texture=new T.CanvasTexture(paper);texture.colorSpace=T.SRGBColorSpace;
  const ink=new T.Mesh(new T.PlaneGeometry(w,height),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false}));
  ink.position.set(0,center,depth+.001);ink.renderOrder=4;parent.add(ink);
  const pane=new T.Mesh(new T.BoxGeometry(w,height,.006),new T.MeshPhysicalMaterial({color:0xb8e1da,roughness:.14,metalness:.22,opacity:.14,transparent:true,depthWrite:false}));
  pane.position.set(0,center,depth-.003);pane.renderOrder=2;parent.add(pane);
  const frameMat=new T.MeshStandardMaterial({color:0x77968f,metalness:.5,roughness:.28});
  // The pane stands on the robot's table: its side posts run down to clamped feet.
  const top=center+height/2,floor=TABLE_TOP;
  for (const x of [-w/2,w/2]) {
    const post=new T.Mesh(new T.BoxGeometry(.009,top-floor,.012),frameMat);post.position.set(x,(top+floor)/2,depth);parent.add(post);
    const foot=new T.Mesh(new T.BoxGeometry(.05,.016,.09),frameMat);foot.position.set(x,floor+.008,depth);parent.add(foot);
  }
  for (const y of [center-height/2,top]) {const rail=new T.Mesh(new T.BoxGeometry(w,.004,.009),frameMat);rail.position.set(0,y,depth);parent.add(rail);}
  const map=frames=>frames.map(([x,,z])=>[(x/w+.5)*paper.width,(.5-(z-center)/height)*paper.height]);
  let script=writer.frames,mapped=map(script),last=-1;
  return progress=>{
    // A language switch swaps the path: wipe the glass and redraw up to the same point.
    if(writer.frames!==script){script=writer.frames;mapped=map(script);ctx.clearRect(0,0,paper.width,paper.height);last=-1;}
    const stop=Math.min(mapped.length-1,Math.max(0,Math.round(progress*(mapped.length-1))));
    if(stop===last)return;
    writer.pose(stop);
    if(stop<last){ctx.clearRect(0,0,paper.width,paper.height);last=-1;}
    ctx.beginPath();
    for(let i=Math.max(1,last+1);i<=stop;i++)if(writer.frames[i][3]){ctx.moveTo(...mapped[i-1]);ctx.lineTo(...mapped[i]);}
    ctx.strokeStyle='#f7eedd';ctx.lineCap='round';ctx.lineWidth=5.5;ctx.shadowColor='rgba(255,226,180,.6)';ctx.shadowBlur=7;ctx.stroke();
    texture.needsUpdate=true;last=stop;
  };
}
