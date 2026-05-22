import type { Point, Wall } from '../types/planner';

type Vec2 = { x: number; y: number };

function add(a: Vec2, b: Vec2): Vec2 { return { x: a.x + b.x, y: a.y + b.y }; }
function scale(v: Vec2, s: number): Vec2 { return { x: v.x * s, y: v.y * s }; }
function sub(a: Vec2, b: Vec2): Vec2 { return { x: a.x - b.x, y: a.y - b.y }; }
function len(v: Vec2): number { return Math.sqrt(v.x * v.x + v.y * v.y); }
function normalize(v: Vec2): Vec2 | null {
  const l = len(v);
  return l < 1e-10 ? null : { x: v.x / l, y: v.y / l };
}
function perp90(v: Vec2): Vec2 { return { x: -v.y, y: v.x }; }

function lineIntersect(p1: Vec2, d1: Vec2, p2: Vec2, d2: Vec2): Vec2 | null {
  const cross = d1.x * d2.y - d1.y * d2.x;
  if (Math.abs(cross) < 1e-10) return null;
  const t = (sub(p2, p1).x * d2.y - sub(p2, p1).y * d2.x) / cross;
  return add(p1, scale(d1, t));
}

// Direction pointing away from pointId along the wall.
function outDir(wall: Wall, pointId: string, points: Record<string, Point>): Vec2 | null {
  const from = points[pointId];
  const toId = pointId === wall.startId ? wall.endId : wall.startId;
  const to = points[toId];
  if (!from || !to) return null;
  return normalize(sub(to, from));
}

// Two corner points at one endpoint of a wall, miter-adjusted if exactly one sibling wall shares that point.
function jointCorners(
  wall: Wall,
  pointId: string,
  points: Record<string, Point>,
  allWalls: Record<string, Wall>,
): { left: Vec2; right: Vec2 } {
  const pt = points[pointId];
  const myDir = outDir(wall, pointId, points);
  if (!pt || !myDir) return { left: { x: 0, y: 0 }, right: { x: 0, y: 0 } };

  const myPerp = perp90(myDir);
  const half = wall.thickness / 2;
  const defLeft  = add(pt, scale(myPerp,  half));
  const defRight = add(pt, scale(myPerp, -half));

  const siblings = Object.values(allWalls).filter(
    w => w.id !== wall.id && (w.startId === pointId || w.endId === pointId),
  );
  if (siblings.length !== 1) return { left: defLeft, right: defRight };

  const sib = siblings[0];
  const sibDir = outDir(sib, pointId, points);
  if (!sibDir) return { left: defLeft, right: defRight };

  const sibPerp = perp90(sibDir);
  const sibHalf = sib.thickness / 2;

  const leftMy  = add(pt, scale(myPerp,   half));
  const leftSib = add(pt, scale(sibPerp, sibHalf));
  const miterLeft = lineIntersect(leftMy, myDir, leftSib, sibDir);

  const rightMy  = add(pt, scale(myPerp,  -half));
  const rightSib = add(pt, scale(sibPerp, -sibHalf));
  const miterRight = lineIntersect(rightMy, myDir, rightSib, sibDir);

  // Clamp: skip miter if the intersection is too far (very shallow join angle)
  const maxMiter = 4 * Math.max(half, sibHalf);
  const left  = miterLeft  && len(sub(miterLeft,  pt)) <= maxMiter ? miterLeft  : defLeft;
  const right = miterRight && len(sub(miterRight, pt)) <= maxMiter ? miterRight : defRight;

  return { left, right };
}

// Returns the rhombus polygon that covers the miter seam at a 2-wall junction.
// Drawing this over both wall fills in a neutral color eliminates the diagonal color boundary
// that appears when the two walls have different fill colors (e.g. one selected).
export function computeJunctionFiller(
  pointId: string,
  points: Record<string, Point>,
  walls: Record<string, Wall>,
): number[] | null {
  const pt = points[pointId];
  if (!pt) return null;

  const connected = Object.values(walls).filter(
    w => w.startId === pointId || w.endId === pointId,
  );
  if (connected.length !== 2) return null;

  const [wallA, wallB] = connected;
  const dirA = outDir(wallA, pointId, points);
  const dirB = outDir(wallB, pointId, points);
  if (!dirA || !dirB) return null;

  const perpA = perp90(dirA);
  const perpB = perp90(dirB);
  const halfA = wallA.thickness / 2;
  const halfB = wallB.thickness / 2;

  const defLeft  = add(pt, scale(perpA,  halfA));
  const defRight = add(pt, scale(perpA, -halfA));

  const mL = lineIntersect(defLeft,  dirA, add(pt, scale(perpB,  halfB)), dirB);
  const mR = lineIntersect(defRight, dirA, add(pt, scale(perpB, -halfB)), dirB);
  if (!mL || !mR) return null;

  const maxDist = 4 * Math.max(halfA, halfB);
  if (len(sub(mL, pt)) > maxDist || len(sub(mR, pt)) > maxDist) return null;

  // Rhombus: defLeft → miterLeft → defRight → miterRight
  return [defLeft.x, defLeft.y, mL.x, mL.y, defRight.x, defRight.y, mR.x, mR.y];
}

// Returns a flat Konva-compatible points array [x1,y1, x2,y2, ...] for the wall polygon.
// Polygon order: startLeft (A) → endRight (B) → endLeft (C) → startRight (D)
export function computeWallPolygon(
  wall: Wall,
  points: Record<string, Point>,
  allWalls: Record<string, Wall>,
): number[] | null {
  const start = points[wall.startId];
  const end   = points[wall.endId];
  if (!start || !end) return null;
  if (len(sub(end, start)) < 1) return null;

  const sc = jointCorners(wall, wall.startId, points, allWalls);
  const ec = jointCorners(wall, wall.endId,   points, allWalls);

  return [
    sc.left.x,  sc.left.y,
    ec.right.x, ec.right.y,
    ec.left.x,  ec.left.y,
    sc.right.x, sc.right.y,
  ];
}
