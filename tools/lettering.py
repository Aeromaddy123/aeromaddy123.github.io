"""Bake the browser illustration with NumPy and SciPy. Coordinates are in metres."""
import json
from pathlib import Path
import numpy as np
from scipy.optimize import least_squares
from scipy.spatial.transform import Rotation

ASSETS = Path(__file__).resolve().parents[1] / "assets" / "ur16e"
PI = np.pi
# UR16e nominal joint origins from Universal Robots' default_kinematics.yaml.
origins = [[0,0,.1807,0,0,0], [0,0,0,PI/2,0,0], [-.4784,0,0,0,0,0],
           [-.36,0,.17415,0,0,0], [0,-.11985,0,PI/2,0,0], [0,.11655,0,PI/2,PI,PI]]
offsets = np.array([p[:3] for p in origins])
bases = [Rotation.from_euler("xyz", p[3:]).as_matrix() for p in origins]
pen_length = .105
# Writing faces the viewer. The marker's local Z points towards the glass.
target_rotation = Rotation.from_euler("x", PI/2).as_matrix()
def tip_pose(angles):
    position = np.zeros(3)
    matrix = np.eye(3)
    for offset, base, angle in zip(offsets, bases, angles):
        position += matrix @ offset
        c, s = np.cos(angle), np.sin(angle)
        matrix = matrix @ base @ np.array([[c,-s,0],[s,c,0],[0,0,1]])
    return position + matrix[:,2] * pen_length, matrix

# Hand-drawn monoline alphabet. A slash is a real pen lift.
glyphs = {
'I':'1,7 5,7 / 3,7 3,0 / 1,0 5,0',
'a':'5,4 3,5 1,4 0,2 1,0 3,0 5,3 5,5 5,1 6,0',
'm':'0,0 1,5 1,2 3,5 4,4 4,1 6,5 7,4 7,0',
'r':'0,0 1,5 1,2 3,5 5,4',
'o':'4,5 2,5 0,3 0,1 2,0 4,1 5,3 4,5',
'b':'0,0 2,8 1,2 3,5 5,5 6,3 5,1 3,0 1,1',
't':'0,4 5,4 / 3,7 2,1 3,0 5,1',
'i':'1,5 0,1 1,0 2,0 / 2,7 2.2,7.2',
'c':'5,4 4,5 2,5 0,3 0,1 2,0 5,1',
's':'5,4 4,5 2,5 1,4 2,3 4,2 4,1 3,0 0,0',
'e':'0,2 3,3 4,4 3,5 1,4 0,2 1,0 3,0 5,1',
'n':'0,0 1,5 1,2 3,5 5,5 5,1 6,0',
'g':'5,4 3,5 1,4 0,2 1,0 3,0 5,4 4,-1 3,-3 1,-3 0,-2',
'.':'1,0 1.3,.2'}
def make_strokes(text, z, unit):
    x = 0
    strokes = []
    for letter in text:
        if letter == " ":
            x += 3.5
            continue
        width = 0
        for line in glyphs[letter].split("/"):
            pts = np.array([[float(n) for n in pair.split(",")] for pair in line.split()])
            width = max(width, np.max(pts[:,0]))
            # Round corners while keeping the original stroke endpoints.
            if len(pts) > 2:
                pts = np.vstack([pts[0], np.stack([.78*pts[:-1]+.22*pts[1:], .22*pts[:-1]+.78*pts[1:]],axis=1).reshape(-1,2), pts[-1]])
            pts[:,0] += x
            strokes.append(pts)
        x += width + 2.1
    for pts in strokes:
        yield np.column_stack([(pts[:,0]-x/2)*unit, np.full(len(pts),-.50), z+pts[:,1]*unit])

def bake():
    frames = []
    q = np.array([1.4,-1.8,1.9,-1.6,-1.55,0])
    previous = None
    largest_error = 0
    def move(point, ink):
        nonlocal q, previous, largest_error
        if previous is not None and np.linalg.norm(previous-point)<1e-7:
            return
        start = previous if previous is not None else point
        steps = max(1, int(np.ceil(np.linalg.norm(point-start)/.009)))
        for fraction in np.linspace(1/steps,1,steps):
            target = start+(point-start)*fraction
            def residual(angles):
                tip, orient = tip_pose(angles)
                rotation = Rotation.from_matrix(target_rotation.T @ orient).as_rotvec()
                return np.concatenate([tip-target,rotation*.24])
            q = least_squares(residual,q,gtol=1e-10,max_nfev=80).x
            largest_error = max(largest_error,np.linalg.norm(tip_pose(q)[0]-target))
            frames.append([*[round(float(v),6) for v in target], int(ink), *np.round(q,6).tolist()])
        previous = point
    for stroke in [*make_strokes("I am a robotics",.56,.0078), *make_strokes("engineer.",.402,.0122)]:
        lift=np.array([0,.021,0])
        if previous is not None: move(previous+lift,False)
        move(stroke[0]+lift,False)
        move(stroke[0],False)
        for point in stroke[1:]: move(point,True)
    move(previous+np.array([0,.055,0]),False)
    assert largest_error < .0005, largest_error
    (ASSETS/"lettering.json").write_text(json.dumps({"origins":origins,"pen":pen_length,"frames":frames},separators=(",",":")))
    print(len(frames),"poses; largest marker error in mm:",largest_error*1000)
if __name__ == "__main__":
    bake()
