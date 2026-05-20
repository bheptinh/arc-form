import type { Opening, Point, Wall } from '../types/planner';

export interface OpeningGeom {
  gapPoly:     number[];   // [x,y × 4] gap rectangle corners
  jambStart:   number[];   // [x1,y1,x2,y2] jamb line at opening start
  jambEnd:     number[];   // [x1,y1,x2,y2] jamb line at opening end

  // Door-specific
  hingeX:           number;
  hingeY:           number;
  wallDirAngleRad:  number;
  swingCCW:         boolean;  // true = counterclockwise arc = 'right' swing
  panelTipX:        number;
  panelTipY:        number;

  // Window-specific
  winLine1: number[];  // [x1,y1,x2,y2]
  winLine2: number[];

  // Drag / hit test
  centerX:       number;
  centerY:       number;
  wallDir:       { x: number; y: number };
  wallLen:       number;
  clampedOffset: number;
}

export function computeOpeningGeom(
  opening: Opening,
  walls: Record<string, Wall>,
  points: Record<string, Point>,
): OpeningGeom | null {
  const wall = walls[opening.wallId];
  if (!wall) return null;
  const sp = points[wall.startId];
  const ep = points[wall.endId];
  if (!sp || !ep) return null;

  const dx = ep.x - sp.x;
  const dy = ep.y - sp.y;
  const wallLen = Math.sqrt(dx * dx + dy * dy);
  if (wallLen < 1) return null;

  const wallDir  = { x: dx / wallLen, y: dy / wallLen };
  const wallPerp = { x: -wallDir.y, y: wallDir.x };
  const half     = wall.thickness / 2;

  const clampedOffset = Math.max(0, Math.min(wallLen - opening.width, opening.offset));

  const s = { x: sp.x + wallDir.x * clampedOffset,                  y: sp.y + wallDir.y * clampedOffset };
  const e = { x: sp.x + wallDir.x * (clampedOffset + opening.width), y: sp.y + wallDir.y * (clampedOffset + opening.width) };

  const gapPoly = [
    s.x + wallPerp.x * half, s.y + wallPerp.y * half,
    e.x + wallPerp.x * half, e.y + wallPerp.y * half,
    e.x - wallPerp.x * half, e.y - wallPerp.y * half,
    s.x - wallPerp.x * half, s.y - wallPerp.y * half,
  ];

  // Jamb lines (short perpendicular wall-cut lines at each edge of the opening)
  const jambStart = [s.x + wallPerp.x * half, s.y + wallPerp.y * half, s.x - wallPerp.x * half, s.y - wallPerp.y * half];
  const jambEnd   = [e.x + wallPerp.x * half, e.y + wallPerp.y * half, e.x - wallPerp.x * half, e.y - wallPerp.y * half];

  // Door: swing arc + panel line
  const swingCCW = opening.swing === 'right';
  const swingSign = swingCCW ? -1 : 1;
  const panelTipX = s.x + wallPerp.x * swingSign * opening.width;
  const panelTipY = s.y + wallPerp.y * swingSign * opening.width;
  const wallDirAngleRad = Math.atan2(wallDir.y, wallDir.x);

  // Window: two glass-pane lines at 1/3 and 2/3 of gap depth
  const t1 = 0.33, t2 = 0.67;
  const winLine1 = [
    s.x + wallPerp.x * half * (1 - t1 * 2), s.y + wallPerp.y * half * (1 - t1 * 2),
    e.x + wallPerp.x * half * (1 - t1 * 2), e.y + wallPerp.y * half * (1 - t1 * 2),
  ];
  const winLine2 = [
    s.x + wallPerp.x * half * (1 - t2 * 2), s.y + wallPerp.y * half * (1 - t2 * 2),
    e.x + wallPerp.x * half * (1 - t2 * 2), e.y + wallPerp.y * half * (1 - t2 * 2),
  ];

  return {
    gapPoly, jambStart, jambEnd,
    hingeX: s.x, hingeY: s.y,
    wallDirAngleRad, swingCCW, panelTipX, panelTipY,
    winLine1, winLine2,
    centerX: sp.x + wallDir.x * (clampedOffset + opening.width / 2),
    centerY: sp.y + wallDir.y * (clampedOffset + opening.width / 2),
    wallDir, wallLen, clampedOffset,
  };
}

// Returns the wall the cursor is on and the raw offset along that wall (mm from start).
export function findWallHit(
  worldX: number,
  worldY: number,
  walls: Record<string, Wall>,
  points: Record<string, Point>,
): { wallId: string; offset: number; wallLen: number } | null {
  let best: { wallId: string; offset: number; wallLen: number; dist: number } | null = null;

  for (const wall of Object.values(walls)) {
    const sp = points[wall.startId];
    const ep = points[wall.endId];
    if (!sp || !ep) continue;

    const dx = ep.x - sp.x, dy = ep.y - sp.y;
    const wallLen = Math.sqrt(dx * dx + dy * dy);
    if (wallLen < 1) continue;

    const ux = dx / wallLen, uy = dy / wallLen;
    const cx = worldX - sp.x, cy = worldY - sp.y;
    const t = cx * ux + cy * uy;
    if (t < 0 || t > wallLen) continue;

    const perpDist = Math.abs(-cx * uy + cy * ux);
    const threshold = wall.thickness / 2 + 50; // 50mm tolerance for easier clicking

    if (perpDist <= threshold) {
      if (!best || perpDist < best.dist) {
        best = { wallId: wall.id, offset: t, wallLen, dist: perpDist };
      }
    }
  }

  return best ? { wallId: best.wallId, offset: best.offset, wallLen: best.wallLen } : null;
}
