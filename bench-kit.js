// Downloaded CAD models for the workbench, all in real metres (see models/bench/CREDITS.md).
// Each entry says how to stand the file up (degrees, XYZ order) and how to finish it:
// SolidWorks/KiCad exports arrive Z-up with flat default colours, so a few colours
// are swapped for the real part's (teal Arduino PCB, silver Pi ports …).
import * as T from './assets/three-runtime.js';
import {cameraFeedTexture} from './bench-props.js';

const D=Math.PI/180;
const Z_UP=[-90,0,0];
export const KIT={
  // Boards and modules (FreeCAD library, CC-BY 3.0)
  'arduino-uno':{rot:Z_UP,paint:{ffffff:0x00878f,ff0000:0x161616,ffaa00:0x161616,ffff00:'gold',ffda00:'gold',ffef00:'gold'}},
  'arduino-mega':{rot:Z_UP,paint:{'55aa00':0x00878f,ffff00:0x161616,fff34b:'steel'}},
  'arduino-nano':{rot:Z_UP,paint:{cccccc:0x1f3f8f}},
  'esp32-devkit':{rot:Z_UP,paint:{'727980':'steel'}},
  'raspberry-pi-4':{rot:[0,0,0],paint:{ffffff:'steel'}},
  'raspberry-pico':{rot:[0,0,0],paint:{ffffff:0x1f7a3d}},
  'stepper-driver':{rot:Z_UP,paint:{'00ff00':0x1c6f33}},
  'l298n':{rot:Z_UP,paint:{ffffff:0xb3262d}},
  'lcd-20x4':{rot:Z_UP,paint:{'0055ff':0x8fb84a}},
  'hc-sr04':{rot:Z_UP},
  'pi-camera':{rot:Z_UP},
  'nema17':{rot:Z_UP},
  'sg90':{rot:Z_UP,paint:{'0055ff':0x2f62c9}},
  'servo-std':{rot:Z_UP},
  'gearmotor':{rot:Z_UP,paint:{ffff7f:0xf0c419}},
  'wheel-65':{rot:Z_UP,paint:{'000000':'rubber'}},
  'ssd':{rot:Z_UP,paint:{cccccc:0x2c2e31}},
  'psu-brick':{rot:[0,0,90],paint:{ebebeb:'steel',bfbfbf:'steel'}},
  'estop-button':{rot:[0,0,0]},
  'calipers':{rot:[0,0,0]},
  // Discrete parts (KiCad 3D library, CC-BY-SA 4.0)
  'resistor':{rot:Z_UP,small:true},'cap-electrolytic':{rot:Z_UP,small:true},'cap-ceramic':{rot:Z_UP,small:true},
  'transistor':{rot:Z_UP,small:true},'regulator':{rot:Z_UP,small:true},'ic-dip8':{rot:Z_UP,small:true},
  'ic-dip28':{rot:Z_UP,small:true},'led':{rot:Z_UP,small:true},'pin-header':{rot:Z_UP,small:true},
  // Machines and robots
  'ender3':{rot:[0,0,0],paint:{ff72ff:0x1a1a1a}},
  'humanoid':{rot:[0,0,0]},  // RoboSavvy humanoid V2 (Kishan's STEP file)
  'rc-plane':{rot:Z_UP},
  'turtlebot3':{rot:Z_UP},
  'realsense-d435':{rot:Z_UP,paint:{e0e0e0:'alu'}},
  'quest-touch-l':{rot:[0,0,0]},'quest-touch-r':{rot:[0,0,0]},
  // Sketchfab, CC-BY 4.0 (authors in CREDITS.md), rescaled to the real products
  'oscilloscope':{rot:[0,-90,0],scan:true},'power-supply':{rot:[0,0,0],scan:true},
  'soldering-station':{rot:[0,0,0],scan:true},'multimeter':{rot:[0,0,0],scan:true},
  'breadboard-kit':{rot:[0,0,0],scan:true},'transmitter':{rot:[0,0,0],scan:true},
  'lipo-4s':{rot:[0,0,90],scan:true,hide:/bg_floor/},'lipo-bag':{rot:[0,0,0],scan:true},
  'fpv-goggles':{rot:[0,0,0],scan:true},'quest3-headset':{rot:[0,0,0],scan:true},
  'monitor':{rot:[0,-90,0],scan:true,screen:/^Object_5$/},'keyboard':{rot:[0,0,0],scan:true},'mouse':{rot:[0,0,0],scan:true},
};
// Poly Haven scans (CC0) are already Y-up and to scale.
for(const id of ['pliers','screwdriver','screwdrivers_02','adjustable_wrench','combination_wrench','cross_pein_hammer',
  'measuring_tape_01','tongue_groove_pliers','ratchet_wrench','magnifying_glass_01','Drill_01','drill_press_01',
  'bench_vice_01','desk_lamp_arm_01','metal_toolbox','metal_tool_chest','plastic_crate_01','plastic_crate_03',
  'industrial_pastic_container','cardboard_box_01','steel_frame_shelves_02','korean_fire_extinguisher_01','medical_box',
  'multi_cleaner_bottle','lubricant_spray','medical_tape','wooden_cutting_board','yellow_onion','lemon','food_lime_01',
  'food_apple_01','food_avocado_01','sweet_potato','food_kiwi_01','carved_wooden_plate','fish_knife','clipboard','stationery_supplies'])
  KIT[id]={rot:[0,0,0],scan:true};

const finishes={
  gold:new T.MeshStandardMaterial({color:0xd9b25c,metalness:.9,roughness:.3}),
  steel:new T.MeshStandardMaterial({color:0xc4c8cc,metalness:.85,roughness:.32}),
  alu:new T.MeshStandardMaterial({color:0x9da1a6,metalness:.75,roughness:.38}),
  rubber:new T.MeshStandardMaterial({color:0x151515,metalness:0,roughness:.9})
};
const greys=new Set(['cccccc','d2d1c7','818181','8a8a8a','7f7f7f','a1a1a1','b0a998','dedede','eaeaea','ebebeb','bfbfbf','dbbc7e']);
const painted=new Map();
let feed=null;
const screenMaterial=()=>feed??=new T.MeshBasicMaterial({map:cameraFeedTexture(),toneMapped:false,side:T.DoubleSide});
// CAD exports come with metalness 1 / roughness 1 on everything; give plastics,
// PCBs and metal pins believable values and apply the colour swaps once per file.
function finish(id,root){
  const spec=KIT[id]||{};
  const hidden=[];
  root.traverse(o=>{
    if(!o.isMesh)return;
    if(spec.hide?.test(o.name)){hidden.push(o);return;}
    if(spec.screen?.test(o.name)){o.material=screenMaterial();return;}
    const m=o.material,hex=m.color.getHexString(),swap=spec.paint?.[hex];
    if(typeof swap==='string'){o.material=finishes[swap];return;}
    const key=id+'/'+hex+'/'+m.uuid;
    if(!painted.has(key)){
      const c=m.clone();
      if(swap!==undefined)c.color.setHex(swap);
      if(!spec.scan&&!m.map&&m.metalness>.95&&m.roughness>.95){
        const metal=greys.has(hex)&&swap===undefined;
        c.metalness=metal?.8:.05;c.roughness=metal?.34:.52;
      }
      painted.set(key,c);
    }
    o.material=painted.get(key);
  });
  hidden.forEach(o=>o.removeFromParent());
}

// Load a kit part, stand it up, and sit its footprint centre on the local origin.
export async function kitPart(loadModel,id,tilt){
  const gltf=await loadModel('bench/'+id);
  if(!gltf.scene.userData.kitFinished){finish(id,gltf.scene);gltf.scene.userData.kitFinished=true;}
  const model=gltf.scene.clone(true),r=(KIT[id]?.rot)||[0,0,0];
  model.rotation.set(r[0]*D,r[1]*D,r[2]*D);
  let top=model;
  if(tilt){top=new T.Group();top.rotation.set(tilt[0]*D,(tilt[1]||0)*D,tilt[2]*D);top.add(model);}
  const holder=new T.Group();holder.add(top);holder.updateWorldMatrix(true,true);
  const b=new T.Box3().setFromObject(top),c=b.getCenter(new T.Vector3());
  top.position.set(-c.x,-b.min.y,-c.z);
  holder.userData.size=b.getSize(new T.Vector3());
  return holder;
}
// Place a list of [id,x,z,yawDeg,{y,tilt,scale}] on a bench group (metres, top = 0).
export function placeKit(loadModel,parent,items,{skipSmall=false}={}){
  return Promise.all(items.map(async([id,x,z,yaw=0,o={}])=>{
    if(skipSmall&&KIT[id]?.small)return null;
    try{
      const part=await kitPart(loadModel,id,o.tilt);
      const g=new T.Group();g.position.set(x,o.y||0,z);g.rotation.y=yaw*D;
      if(o.lift)part.position.y=o.lift;
      g.add(part);parent.add(g);return g;
    }catch(e){console.warn('kit',id,e);return null;}
  }));
}
