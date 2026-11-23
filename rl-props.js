// Reinforcement-learning projects on the workbench, built from DeepMind's MuJoCo Menagerie
// models (BSD-3-Clause, see models/bench/CREDITS.md), converted with tools/mjcf2gltf.py.
// Each GLB keeps MuJoCo's body tree: one node per body, named after it, z-up metres.
// The motion here is a hand-keyed illustration of what the trained policies do.
// The GLBs carry no normals, so their materials use flat shading.
import * as T from './assets/three-runtime.js';
import {group,box,cyl,mat} from './bench-props.js';

const H=Math.PI/2;
const ease=t=>t*t*(3-2*t);

// Joint access by MuJoCo body name. GLTFLoader drops "/" from node names.
function rig(root){
  const byName={};root.traverse(o=>{if(o.name)byName[o.name]=o;});
  const rest=new Map(),q=new T.Object3D().quaternion.clone(),v=new T.Vector3();
  const node=name=>{
    const o=byName[name.replace(/[\/.:\[\]]/g,'')];
    if(o&&!rest.has(o))rest.set(o,{q:o.quaternion.clone(),p:o.position.clone()});
    return o;
  };
  return {
    node,
    hinge(name,axis,angle){const o=node(name);if(o)o.quaternion.copy(rest.get(o).q).multiply(q.setFromAxisAngle(v.set(...axis),angle));},
    slide(name,axis,d){const o=node(name);if(o){const r=rest.get(o);o.position.copy(r.p).add(v.set(...axis).multiplyScalar(d).applyQuaternion(r.q));}}
  };
}
function zUp(scene){const up=new T.Group();up.rotation.x=-H;up.add(scene);return up;}

// ── ALOHA two-arm handover ─────────────────────────────────────────────
// Two ViperX 300 S arms 0.94 m apart. The block is picked on one side, passed
// across in the air and placed on the target on the other side, then back again.
export function handoverTable(parent){
  const g=group(parent);
  const W=1.3,D=.75,frame=mat(0x2b2e31,.45,.55);
  box(g,0,-.02,0,W,.04,D,mat(0xc9a374,.62,.05));   // light wood top, like the training scene
  for(const x of [-W/2+.04,W/2-.04])for(const z of [-D/2+.04,D/2-.04])box(g,x,-.47,z,.04,.86,.04,frame);
  for(const z of [-D/2+.04,D/2-.04])box(g,0,-.09,z,W-.1,.05,.03,frame);
  box(g,0,-.75,0,W-.1,.02,D-.1,mat(0x55595d,.6,.4));
  return g;
}
export async function makeHandover(loadModel){
  const src=(await loadModel('bench/aloha')).scene.clone(true);
  // Painted for the dark room: white links, graphite base and fingers, amber wrists.
  const F={flatShading:true},white=mat(0xeef0f2,.35,.15,F),graphite=mat(0x34373b,.45,.35,F),amber=mat(0xf2a33a,.4,.1,F);
  const paint=name=>/finger/.test(name)?graphite:/wrist|gripper/.test(name)?amber:/base_link|shoulder_link/.test(name)?graphite:white;
  src.traverse(o=>{if(o.isMesh)o.material=paint(o.parent?.name||'');});
  const up=zUp(src),holder=new T.Group();holder.add(up);
  const r=rig(src);
  // Everything below is in MuJoCo's frame (x along the table, z up, table top z = 0).
  const Y=-.019,HALF=.036;                    // arms' centre line; grip points on the block
  const S=new T.Vector3(-.2,Y,.015),E=new T.Vector3(.2,Y,.015);
  const pad=(p,color)=>{const m=new T.Mesh(new T.PlaneGeometry(.17,.07),new T.MeshStandardMaterial({color,roughness:.8}));m.position.set(p.x,p.y,.0008);up.add(m);};
  pad(S,0x2d7a4f);pad(E,0x2f62c9);
  const block=new T.Mesh(new T.BoxGeometry(.11,.03,.03),mat(0xd8261f,.45));up.add(block);
  const tips={},aims={};
  for(const side of ['left','right']){
    const g=r.node(side+'/gripper_link');
    tips[side]=new T.Object3D();tips[side].position.set(.13,0,-.003);g.add(tips[side]);
    aims[side]=new T.Object3D();aims[side].position.set(.23,0,-.003);g.add(aims[side]);
  }
  const JOINTS=[['shoulder_link',[0,0,1]],['upper_arm_link',[0,1,0]],['upper_forearm_link',[0,1,0]],['wrist_link',[0,1,0]]];
  const pose=(side,q)=>JOINTS.forEach(([b,ax],i)=>r.hinge(side+'/'+b,ax,q[i]));
  const fingers=(side,d)=>{r.slide(side+'/left_finger_link',[0,0,-1],d);r.slide(side+'/right_finger_link',[0,0,-1],d);};
  const inUp=(o,out)=>up.worldToLocal(o.getWorldPosition(out));
  const a=new T.Vector3(),b=new T.Vector3();
  function fk(q){
    pose('left',q);holder.updateWorldMatrix(true,true);
    inUp(tips.left,a);inUp(aims.left,b);
    return [a.x,a.y,a.z,b.x-a.x,b.y-a.y,b.z-a.z];
  }
  // Damped least squares on the left arm; the right arm mirrors it exactly, because
  // every target lies on the line between the two bases.
  function solve(p,q=[0,-.96,1.16,-.3]){
    const goal=[p.x,p.y,p.z,0,0,-.1];q=q.slice();
    for(let it=0;it<80;it++){
      const f=fk(q),e=goal.map((g,i)=>(g-f[i])*(i<3?1:.35));
      const J=q.map((_,j)=>{const qq=q.slice();qq[j]+=1e-4;const g2=fk(qq);return g2.map((x,i)=>(x-f[i])/1e-4*(i<3?1:.35));});
      const A=q.map((_,i)=>q.map((_,j)=>J[i].reduce((s,x,k)=>s+x*J[j][k],0)+(i===j?1e-4:0)));
      const rhs=q.map((_,i)=>J[i].reduce((s,x,k)=>s+x*e[k],0));
      // Gaussian elimination, 4×4
      for(let i=0;i<4;i++){for(let k=i+1;k<4;k++){const m=A[k][i]/A[i][i];for(let j=i;j<4;j++)A[k][j]-=m*A[i][j];rhs[k]-=m*rhs[i];}}
      const dq=[0,0,0,0];for(let i=3;i>=0;i--){let s=rhs[i];for(let j=i+1;j<4;j++)s-=A[i][j]*dq[j];dq[i]=s/A[i][i];}
      q=q.map((x,i)=>x+Math.max(-.2,Math.min(.2,dq[i])));
    }
    return q;
  }
  const home=[0,-.96,1.16,-.3];
  const at=(x,z)=>new T.Vector3(x,Y,z);
  const P={home,above:solve(at(S.x-HALF,.12)),down:solve(at(S.x-HALF,.02))};
  P.hand=solve(at(-HALF,.22),P.above);P.pre=solve(at(-HALF,.31),P.hand);
  const OPEN=.036,SHUT=.016;
  // Keyframes [time, pose, finger]
  const giver=[[0,'home',OPEN],[1.2,'above',OPEN],[2,'down',OPEN],[2.5,'down',SHUT],[3.6,'hand',SHUT],[4.8,'hand',SHUT],[5.1,'hand',OPEN],[6.1,'home',OPEN]];
  const taker=[[0,'home',OPEN],[3,'home',OPEN],[3.8,'pre',OPEN],[4.3,'hand',OPEN],[4.6,'hand',SHUT],[5.5,'pre',SHUT],[6.4,'above',SHUT],[7,'down',SHUT],[7.4,'down',OPEN],[8.3,'home',OPEN]];
  const CYCLE=9.5;
  function sample(keys,t){
    if(t<=keys[0][0])return [P[keys[0][1]],keys[0][2]];
    for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){
      const [t0,p0,f0]=keys[i-1],[t1,p1,f1]=keys[i],k=ease((t-t0)/(t1-t0));
      return [P[p0].map((x,j)=>x+(P[p1][j]-x)*k),f0+(f1-f0)*k];
    }
    const last=keys[keys.length-1];return [P[last[1]],last[2]];
  }
  const tip=new T.Vector3();
  function update(time){
    const n=Math.floor(time/CYCLE),t=time-n*CYCLE,flip=n%2===1;
    const g=flip?'right':'left',k=flip?'left':'right';
    const [qg,fg]=sample(giver,t),[qk,fk2]=sample(taker,t);
    pose(g,qg);fingers(g,fg);pose(k,qk);fingers(k,fk2);
    const from=flip?E:S,to=flip?S:E;
    holder.updateWorldMatrix(true,true);
    const follow=side=>{inUp(tips[side],tip);block.position.set(tip.x+(side==='left'?HALF:-HALF),Y,tip.z);};
    if(t<2.5)block.position.copy(from);
    else if(t<4.6)follow(g);
    else if(t<7.3)follow(k);
    else block.position.copy(to);
  }
  update(0);
  return {holder,update,height:.55,width:1.1};
}

// ── Unitree G1, standing ───────────────────────────────────────────────
// A desk model at 0.55 scale (the real robot is 1.32 m), in MuJoCo Menagerie's
// "stand" keyframe: legs straight, arms slightly out, elbows bent.
export async function makeG1(loadModel,scale=.55){
  const src=(await loadModel('bench/unitree-g1')).scene.clone(true);
  const F={flatShading:true},dark=mat(0x1f2124,.45,.35,F),light=mat(0xf1f2f4,.34,.2,F);
  src.traverse(o=>{if(o.isMesh)o.material=o.material.color.r>.5?light:dark;});
  const r=rig(src);
  for(const [side,roll] of [['left',.2],['right',-.2]]){
    r.hinge(side+'_shoulder_roll_link',[1,0,0],roll);
    r.hinge(side+'_elbow_link',[0,1,0],1.28);
  }
  const holder=new T.Group();
  // Round display base
  cyl(holder,0,.006,0,.13,.012,mat(0x26282b,.5,.4),40);
  cyl(holder,0,.0125,0,.125,.001,mat(0x3a3d41,.6,.2),40);
  const fig=new T.Group();fig.scale.setScalar(scale);fig.position.y=.013;fig.add(zUp(src));holder.add(fig);
  fig.rotation.y=-H+.3;  // face the visitor, turned a little towards the room
  return {holder,update:()=>{},height:1.32*scale,width:.32};
}
