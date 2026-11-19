// Small hanging lamps for the dark rooms. The trimmed three.js bundle does not
// export SpotLight, but its GLTFLoader builds one for KHR_lights_punctual, so a
// two-node glTF hands us the bundle's own SpotLight class to construct from.
import * as T from './assets/three-runtime.js';

let kit=null;
export function lightKit(loader){
  if(!kit){
    const gltf={asset:{version:'2.0'},extensionsUsed:['KHR_lights_punctual'],
      extensions:{KHR_lights_punctual:{lights:[{type:'spot',color:[1,1,1],intensity:1,spot:{innerConeAngle:.3,outerConeAngle:.6}}]}},
      nodes:[{extensions:{KHR_lights_punctual:{light:0}}}],scenes:[{nodes:[0]}],scene:0};
    kit=loader.parseAsync(JSON.stringify(gltf),'').then(g=>{
      let spot=null;g.scene.traverse(o=>{if(o.isSpotLight)spot=o;});
      return {SpotLight:spot.constructor};
    });
  }
  return kit;
}

const shadeMat=new T.MeshStandardMaterial({color:0x2b2926,roughness:.45,metalness:.6});
const cordMat=new T.MeshStandardMaterial({color:0x111111,roughness:.8});
const bulbMat=new T.MeshBasicMaterial({color:0xffe2b0,toneMapped:false});
const coneMat=new T.MeshBasicMaterial({color:0xffd7a0,transparent:true,opacity:.022,depthWrite:false,blending:2,side:T.DoubleSide,toneMapped:false});
// A small industrial pendant lamp hanging `drop` metres above the surface below it,
// with a warm spotlight aimed straight down. Returns the group (origin at the surface).
export function pendant(parent,SpotLight,x,z,{drop=1.05,cord=1.2,intensity=5,angle=.62,reach=3.2,cone=true}={}){
  const g=new T.Group();g.position.set(x,0,z);parent.add(g);
  const cordMesh=new T.Mesh(new T.CylinderGeometry(.004,.004,cord,6),cordMat);cordMesh.position.y=drop+.09+cord/2;g.add(cordMesh);
  const shade=new T.Mesh(new T.CylinderGeometry(.025,.1,.12,28,1,true),shadeMat);shade.position.y=drop+.06;g.add(shade);
  const cap=new T.Mesh(new T.CylinderGeometry(.028,.028,.03,16),shadeMat);cap.position.y=drop+.13;g.add(cap);
  const bulb=new T.Mesh(new T.CylinderGeometry(.085,.085,.004,24),bulbMat);bulb.position.y=drop+.004;g.add(bulb);
  if(cone){
    const beam=new T.Mesh(new T.CylinderGeometry(.09,Math.tan(angle)*drop*.95,drop,32,1,true),coneMat);beam.position.y=drop/2;beam.raycast=()=>{};g.add(beam);
  }
  const light=new SpotLight(0xffdcae,intensity,reach,angle,.85,2);
  light.position.y=drop;light.target.position.set(0,0,0);g.add(light,light.target);
  return g;
}
