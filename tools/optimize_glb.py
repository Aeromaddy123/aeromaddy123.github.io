"""Shrink float32 GLB files without visible change (KHR_mesh_quantization).

  python3 tools/optimize_glb.py in.glb out.glb [--inline]

- welds exactly identical vertices (lossless),
- POSITION float32 -> int16 normalised, dequantised by a per-mesh uniform scale + offset,
- NORMAL float32 -> int8 normalised, TEXCOORD_0 kept,
- indices -> uint16 when they fit.
Node indices, names and transforms are kept: the dequantisation transform goes on a new
child node appended at the end of the node list, so every existing node keeps its own
coordinate frame (scene.js attaches the hero fingertip to node 14 of bionic-arm.glb in
that node's millimetre coordinates). --inline puts it on a bare leaf mesh node instead,
only for files where no code uses those nodes as frames (tools/mjcf2gltf.py output).
"""
import json, struct, sys
import numpy as np

CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}


def read_glb(path):
    b = open(path, 'rb').read()
    jlen = struct.unpack('<I', b[12:16])[0]
    gl = json.loads(b[20:20 + jlen])
    o = 20 + jlen
    blen = struct.unpack('<I', b[o:o + 4])[0]
    return gl, b[o + 8:o + 8 + blen]


def accessor(gl, binary, i):
    a = gl['accessors'][i]
    v = gl['bufferViews'][a['bufferView']]
    dt = np.dtype(CT[a['componentType']]); n = NC[a['type']]
    start = v.get('byteOffset', 0) + a.get('byteOffset', 0)
    stride = v.get('byteStride', dt.itemsize * n)
    raw = np.frombuffer(binary, np.uint8, count=stride * (a['count'] - 1) + dt.itemsize * n, offset=start)
    rows = np.lib.stride_tricks.as_strided(raw, (a['count'], dt.itemsize * n), (stride, 1))
    return np.ascontiguousarray(rows).view(dt).reshape(a['count'], n)


class Out:
    def __init__(self): self.buf = bytearray(); self.views = []; self.accs = []

    def view(self, data, target=None, stride=None):
        while len(self.buf) % 4: self.buf.append(0)
        v = {'buffer': 0, 'byteOffset': len(self.buf), 'byteLength': len(data)}
        if target: v['target'] = target
        if stride: v['byteStride'] = stride
        self.buf += data; self.views.append(v); return len(self.views) - 1

    def acc(self, arr, ctype, typ, target, normalized=False, minmax=False):
        n = NC[typ]; dt = np.dtype(CT[ctype]); item = dt.itemsize * n
        stride = (item + 3) // 4 * 4 if target == 34962 else None
        a = np.ascontiguousarray(arr.astype(dt).reshape(-1, n))
        if stride and stride != item:
            padded = np.zeros((len(a), stride), np.uint8); padded[:, :item] = a.view(np.uint8).reshape(len(a), item); data = padded.tobytes()
        else: data = a.tobytes()
        acc = {'bufferView': self.view(data, target, stride if stride and stride != item else None), 'componentType': ctype, 'count': len(a), 'type': typ}
        if normalized: acc['normalized'] = True
        if minmax: acc['min'] = a.min(0).tolist(); acc['max'] = a.max(0).tolist()
        self.accs.append(acc); return len(self.accs) - 1


def optimise(src, dst, inline=False):
    gl, binary = read_glb(src)
    if any(p['attributes'].get('POSITION') is not None and gl['accessors'][p['attributes']['POSITION']]['componentType'] != 5126
           for m in gl['meshes'] for p in m['primitives']):
        raise SystemExit(f'{src}: already quantised, skipped')
    out = Out()
    # Carry over image buffer views untouched.
    for img in gl.get('images', []):
        if 'bufferView' in img:
            v = gl['bufferViews'][img['bufferView']]
            img['bufferView'] = out.view(binary[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']])
    dequant = []
    for m in gl['meshes']:
        for p in m['primitives']:
            if set(p['attributes']) - {'POSITION', 'NORMAL', 'TEXCOORD_0'} or p.get('targets'):
                raise SystemExit(f'{src}: unsupported primitive, skipped')
        # Primitives that share one vertex list (e.g. one part, several materials) are done once.
        groups = {}
        for p in m['primitives']:
            groups.setdefault(tuple(sorted(p['attributes'].items())), []).append(p)
        loaded = {}
        for key, prims in groups.items():
            attrs = {k: accessor(gl, binary, i) for k, i in key}
            loaded[key] = {k: (v.astype(np.float32) if k != 'TEXCOORD_0' else v) for k, v in attrs.items()}
        allpos = np.concatenate([a['POSITION'] for a in loaded.values()])
        lo, hi = allpos.min(0), allpos.max(0)
        offset = (lo + hi) / 2
        scale = float(max((hi - lo).max() / 2, 1e-9))          # uniform, so normals stay valid
        dequant.append((offset.tolist(), scale))
        for key, prims in groups.items():
            attrs = loaded[key]
            # weld exact duplicates
            raw = np.concatenate([attrs[k].view(np.uint8).reshape(len(attrs[k]), -1) for k in sorted(attrs)], axis=1)
            _, first, inverse = np.unique(raw, axis=0, return_index=True, return_inverse=True)
            inverse = inverse.reshape(-1)
            attrs = {k: v[first] for k, v in attrs.items()}
            new = {}
            q = np.clip(np.round((attrs['POSITION'] - offset) / scale * 32767), -32767, 32767)
            new['POSITION'] = out.acc(q, 5122, 'VEC3', 34962, normalized=True, minmax=True)
            if 'NORMAL' in attrs:
                nrm = attrs['NORMAL'] / np.maximum(np.linalg.norm(attrs['NORMAL'], axis=1, keepdims=True), 1e-12)
                new['NORMAL'] = out.acc(np.round(nrm * 127), 5120, 'VEC3', 34962, normalized=True)
            if 'TEXCOORD_0' in attrs:
                tc = attrs['TEXCOORD_0']; ct = {np.dtype(np.float32): 5126, np.dtype(np.uint16): 5123, np.dtype(np.uint8): 5121}[tc.dtype]
                old = gl['accessors'][dict(key)['TEXCOORD_0']]
                new['TEXCOORD_0'] = out.acc(tc, ct, 'VEC2', 34962, normalized=old.get('normalized', False))
            for p in prims:
                idx = accessor(gl, binary, p['indices']).reshape(-1).astype(np.int64) if 'indices' in p else np.arange(len(inverse))
                idx = inverse[idx]
                p['attributes'] = dict(new)
                p['indices'] = out.acc(idx, 5125 if idx.max() >= 65535 else 5123, 'SCALAR', 34963)
    # Put each mesh's dequantisation on its node (or a new child node).
    for ni in range(len(gl['nodes'])):
        node = gl['nodes'][ni]
        if 'mesh' not in node: continue
        offset, scale = dequant[node['mesh']]
        trs = {'translation': offset, 'scale': [scale] * 3}
        if inline and not any(k in node for k in ('matrix', 'translation', 'rotation', 'scale', 'children')):
            node.update(trs)
        else:
            gl['nodes'].append({'mesh': node.pop('mesh'), **trs})
            node.setdefault('children', []).append(len(gl['nodes']) - 1)
    gl['accessors'] = out.accs; gl['bufferViews'] = out.views
    gl['buffers'] = [{'byteLength': len(out.buf)}]
    for key in ('extensionsUsed', 'extensionsRequired'):
        gl[key] = sorted(set(gl.get(key, [])) | {'KHR_mesh_quantization'})
    js = json.dumps(gl, separators=(',', ':')).encode(); js += b' ' * (-len(js) % 4)
    while len(out.buf) % 4: out.buf.append(0)
    blob = struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(out.buf)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(out.buf), 0x004E4942) + bytes(out.buf)
    open(dst, 'wb').write(blob)
    return len(blob)


if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    import os
    before = os.path.getsize(src); after = optimise(src, dst, inline='--inline' in sys.argv)
    print(f'{src}: {before / 1048576:.2f} MB -> {after / 1048576:.2f} MB')
