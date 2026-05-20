import { GRID_MINOR_MM, SNAP_RADIUS_PX } from '../constants';
import type { Point } from '../types/planner';

export function snapToGrid(worldMm: number, gridMm = GRID_MINOR_MM): number {
  return Math.round(worldMm / gridMm) * gridMm;
}

export function snapPointToGrid(x: number, y: number, gridMm = GRID_MINOR_MM): { x: number; y: number } {
  return { x: snapToGrid(x, gridMm), y: snapToGrid(y, gridMm) };
}

// Returns the nearest existing point within snap threshold, or null.
export function findSnapPoint(
  worldX: number,
  worldY: number,
  points: Record<string, Point>,
  scale: number,
): Point | null {
  const thresholdMm = SNAP_RADIUS_PX / scale;
  let nearest: Point | null = null;
  let nearestDist = Infinity;

  for (const pt of Object.values(points)) {
    const dx = pt.x - worldX;
    const dy = pt.y - worldY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < thresholdMm && dist < nearestDist) {
      nearest = pt;
      nearestDist = dist;
    }
  }

  return nearest;
}
