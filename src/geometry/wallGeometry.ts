import type { Point, Wall } from '../types/planner';

export interface WallPoly {
  wallId: string;
  // Four corners of the wall quad in world mm, clockwise: tl, tr, br, bl
  corners: [
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
    { x: number; y: number },
  ];
}

// Computes the four corners of a wall rectangle (no miter correction yet).
// Miter joins will be computed in Week 2 once wall topology is wired up.
export function wallToQuad(
  wall: Wall,
  points: Record<string, Point>,
): WallPoly | null {
  const start = points[wall.startId];
  const end = points[wall.endId];
  if (!start || !end) return null;

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return null;

  // Unit perpendicular (90° CCW)
  const nx = -dy / len;
  const ny = dx / len;
  const half = wall.thickness / 2;

  return {
    wallId: wall.id,
    corners: [
      { x: start.x + nx * half, y: start.y + ny * half },
      { x: end.x + nx * half,   y: end.y + ny * half },
      { x: end.x - nx * half,   y: end.y - ny * half },
      { x: start.x - nx * half, y: start.y - ny * half },
    ],
  };
}
