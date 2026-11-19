// Realistic finishes for Kishan's own CAD exports. The SolidWorks files come in
// with default light-grey materials and unnamed parts, so parts are recognised
// by their shape and size and given the materials of the real build.
import * as T from './assets/three-runtime.js';

const carbon=new T.MeshStandardMaterial({color:0x151617,roughness:.42,metalness:.35});
const prop=new T.MeshStandardMaterial({color:0x0e0f10,roughness:.38,metalness:.1});
const motorBell=new T.MeshStandardMaterial({color:0x1c1d1f,roughness:.3,metalness:.75});
const steel=new T.MeshStandardMaterial({color:0xb8bcc0,roughness:.28,metalness:.85});
const shell=new T.MeshStandardMaterial({color:0x232528,roughness:.45,metalness:.25});
const rubber=new T.MeshStandardMaterial({color:0x111111,roughness:.92,metalness:0});

function partBoxes(root){
  root.updateWorldMatrix(true,true);
  const all=new T.Box3().setFromObject(root),size=all.getSize(new T.Vector3());
  const S=Math.max(size.x,size.y,size.z),parts=[];
  root.traverse(o=>{
    if(!o.isMesh)return;
    const b=new T.Box3().setFromObject(o),d=b.getSize(new T.Vector3()).divideScalar(S);
    const c=b.getCenter(new T.Vector3()).sub(all.min).divide(size);
    parts.push({o,d,c,dims:[d.x,d.y,d.z].sort((a,b)=>a-b)});
  });
  return parts;
}
const luminance=c=>.2126*c.r+.7152*c.g+.0722*c.b;

// Spidrone (medical quadcopter): black frame, black props, dark BLDC bells, steel shafts.
function finishDrone(root){
  const parts=partBoxes(root);
  const biggest=parts.reduce((a,p)=>p.dims[2]>a.dims[2]?p:a,parts[0]);
  for(const p of parts){
    const [thin,mid,long]=p.dims;
    if(p===biggest)p.o.material=carbon;
    else if(thin<.025&&long>.22)p.o.material=prop;              // propeller blades
    else if(long>.04&&long<.08&&Math.abs(p.d.x-p.d.z)<.01)p.o.material=motorBell; // BLDC bells
    else if(long<.035&&thin<.015)p.o.material=steel;            // shafts, nuts, washers
    else p.o.material=carbon;
  }
}
// Self-balancing robot: dark body panels, rubber tyres; the PCB keeps its colours.
function finishBalancer(root){
  for(const p of partBoxes(root)){
    const m=p.o.material,[thin,mid,long]=p.dims;
    const wheel=thin>.08&&thin<.13&&Math.abs(p.d.y-p.d.z)<.02&&long>.24&&(p.c.x<.15||p.c.x>.85);
    if(wheel){p.o.material=rubber;continue;}
    if(!m?.color)continue;
    const c=m.color,sat=Math.max(c.r,c.g,c.b)-Math.min(c.r,c.g,c.b);
    if(sat<.12&&luminance(c)>.08)p.o.material=shell;           // white / grey shells → graphite
  }
}

const finishes={'spidrone':finishDrone,'robot-assembly':finishBalancer};
// Apply once to a freshly loaded glTF scene (clones share the new materials).
export function finishModel(file,scene){
  if(scene.userData.finished)return scene;
  finishes[file]?.(scene);
  scene.userData.finished=true;
  return scene;
}
