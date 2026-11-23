"""Export a MuJoCo model's visual meshes as an articulated glTF: one node per body
(named after the body, with its rest pos/quat), mesh children in body frame.
Writes <out>.gltf/.bin and <out>-joints.json (joint name, body, axis, range)."""
import sys, json, struct, numpy as np, mujoco
xml, out = sys.argv[1], sys.argv[2]
CELL=float(sys.argv[3]) if len(sys.argv)>3 else 0.003
m = mujoco.MjModel.from_xml_path(xml)
def nm(t, i): return mujoco.mj_id2name(m, t, i) or f"{t}_{i}"
buf = bytearray(); views=[]; accs=[]; meshes=[]; mats=[]; matidx={}
def add(arr, target, comp, typ):
    off=len(buf); data=arr.astype('<f4' if comp==5126 else '<u4').tobytes(); buf.extend(data)
    while len(buf)%4: buf.append(0)
    views.append({"buffer":0,"byteOffset":off,"byteLength":len(data),"target":target})
    a={"bufferView":len(views)-1,"componentType":comp,"count":len(arr),"type":typ}
    if typ=="VEC3": a["min"]=arr.min(0).tolist(); a["max"]=arr.max(0).tolist()
    accs.append(a); return len(accs)-1
def material(rgba):
    k=tuple(np.round(rgba,3))
    if k not in matidx:
        matidx[k]=len(mats); mats.append({"pbrMetallicRoughness":{"baseColorFactor":[float(x) for x in k],"metallicFactor":0.1,"roughnessFactor":0.6}})
    return matidx[k]
def qrot(q, v):  # mujoco quat wxyz
    w,x,y,z=q; R=np.array([[1-2*(y*y+z*z),2*(x*y-w*z),2*(x*z+w*y)],[2*(x*y+w*z),1-2*(x*x+z*z),2*(y*z-w*x)],[2*(x*z-w*y),2*(y*z+w*x),1-2*(x*x+y*y)]])
    return v@R.T
nodes=[{"name":nm(mujoco.mjtObj.mjOBJ_BODY,b)} for b in range(m.nbody)]
for b in range(1,m.nbody):
    q=m.body_quat[b]; nodes[b]["translation"]=m.body_pos[b].tolist(); nodes[b]["rotation"]=[q[1],q[2],q[3],q[0]]
    nodes[m.body_parentid[b]].setdefault("children",[]).append(b)
for g in range(m.ngeom):
    if m.geom_type[g]!=mujoco.mjtGeom.mjGEOM_MESH: continue
    if m.geom_contype[g]!=0 or m.geom_conaffinity[g]!=0:  # visual geoms only
        if m.geom_group[g] not in (1,2): continue
    if m.geom_rgba[g][3]==0: continue
    mid=m.geom_dataid[g]; va,vn=m.mesh_vertadr[mid],m.mesh_vertnum[mid]; fa,fn=m.mesh_faceadr[mid],m.mesh_facenum[mid]
    v=m.mesh_vert[va:va+vn].astype(float); f=m.mesh_face[fa:fa+fn].astype(np.uint32)
    v=qrot(m.geom_quat[g],v)+m.geom_pos[g]
    # vertex clustering: snap to a CELL grid, average each cell, drop collapsed faces
    key=np.floor(v/CELL).astype(np.int64); _,inv,cnt=np.unique(key,axis=0,return_inverse=True,return_counts=True); inv=inv.reshape(-1)
    nv=np.zeros((cnt.size,3)); np.add.at(nv,inv,v); nv/=cnt[:,None]
    f=inv[f]; f=f[(f[:,0]!=f[:,1])&(f[:,1]!=f[:,2])&(f[:,0]!=f[:,2])]
    f=np.unique(np.sort(f,axis=1),axis=0,return_index=True)[1].__array__() if False else f
    used=np.unique(f); remap=-np.ones(cnt.size,np.int64); remap[used]=np.arange(used.size); v=nv[used]; f=remap[f].astype(np.uint32)
    rgba=m.mat_rgba[m.geom_matid[g]] if m.geom_matid[g]>=0 else m.geom_rgba[g]
    meshes.append({"primitives":[{"attributes":{"POSITION":add(v.astype(np.float32),34962,5126,"VEC3")},"indices":add(f.reshape(-1),34963,5125,"SCALAR"),"material":material(rgba)}]})
    nodes.append({"name":nm(mujoco.mjtObj.mjOBJ_GEOM,g),"mesh":len(meshes)-1}); nodes[m.geom_bodyid[g]].setdefault("children",[]).append(len(nodes)-1)
gl={"asset":{"version":"2.0"},"scene":0,"scenes":[{"nodes":[0]}],"nodes":nodes,"meshes":meshes,"materials":mats,"accessors":accs,"bufferViews":views,"buffers":[{"byteLength":len(buf)}]}
js=json.dumps(gl,separators=(',',':')).encode(); js+=b' '*((4-len(js)%4)%4)
glb=struct.pack('<III',0x46546C67,2,12+8+len(js)+8+len(buf))+struct.pack('<II',len(js),0x4E4F534A)+js+struct.pack('<II',len(buf),0x004E4942)+bytes(buf)
open(out+".glb","wb").write(glb)
joints=[{"name":nm(mujoco.mjtObj.mjOBJ_JOINT,j),"body":nm(mujoco.mjtObj.mjOBJ_BODY,m.jnt_bodyid[j]),"type":int(m.jnt_type[j]),"axis":m.jnt_axis[j].round(4).tolist(),"pos":m.jnt_pos[j].round(4).tolist(),"range":m.jnt_range[j].round(4).tolist()} for j in range(m.njnt)]
keys=[{"name":nm(mujoco.mjtObj.mjOBJ_KEY,k),"qpos":m.key_qpos[k].round(4).tolist()} for k in range(m.nkey)]
json.dump({"joints":joints,"keys":keys,"qposadr":m.jnt_qposadr.tolist()},open(out+"-joints.json","w"),indent=0)
print(out, "bodies",m.nbody,"meshes",len(meshes),"bytes",len(buf))
