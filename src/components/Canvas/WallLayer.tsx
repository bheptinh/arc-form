import { Circle, Layer, Line } from 'react-konva';
import { computeWallPolygon } from '../../geometry/wallGeometry';
import { usePlannerStore } from '../../store/usePlannerStore';
import type { Wall } from '../../types/planner';

interface Props {
  snapX: number | null;
  snapY: number | null;
  snapPointId: string | null;
}

export function WallLayer({ snapX, snapY, snapPointId }: Props) {
  const walls = usePlannerStore((s) => s.walls);
  const points = usePlannerStore((s) => s.points);
  const drawing = usePlannerStore((s) => s.drawing);
  const defaultThickness = usePlannerStore((s) => s.defaultWallThickness);
  const scale = usePlannerStore((s) => s.viewport.scale);
  const inv = 1 / scale;

  // Existing walls
  const wallShapes = Object.values(walls).map((wall) => {
    const poly = computeWallPolygon(wall, points, walls);
    if (!poly) return null;
    return (
      <Line
        key={wall.id}
        points={poly}
        closed
        fill="#d4d0c8"
        stroke="#555"
        strokeWidth={inv}
        listening={false}
      />
    );
  });

  // Endpoint dots
  const dots = Object.values(points).map((pt) => (
    <Circle
      key={pt.id}
      x={pt.x}
      y={pt.y}
      radius={4 * inv}
      fill="#888"
      listening={false}
    />
  ));

  // Preview wall while drawing
  let preview = null;
  if (drawing && snapX !== null && snapY !== null) {
    const startPt = points[drawing.startPointId];
    if (startPt) {
      const PREVIEW_END = '__preview_end__';
      const previewWall: Wall = {
        id: '__preview__',
        startId: drawing.startPointId,
        endId: PREVIEW_END,
        thickness: defaultThickness,
      };
      const previewPoints = { ...points, [PREVIEW_END]: { id: PREVIEW_END, x: snapX, y: snapY } };
      const poly = computeWallPolygon(previewWall, previewPoints, walls);
      if (poly) {
        preview = (
          <Line
            points={poly}
            closed
            fill="rgba(74, 106, 255, 0.2)"
            stroke="#4a6aff"
            strokeWidth={1.5 * inv}
            dash={[8 * inv, 4 * inv]}
            listening={false}
          />
        );
      }
    }
  }

  // Snap cursor indicator
  const snapIndicator =
    snapX !== null && snapY !== null ? (
      <Circle
        x={snapX}
        y={snapY}
        radius={snapPointId ? 8 * inv : 5 * inv}
        fill={snapPointId ? 'rgba(255, 100, 50, 0.4)' : 'rgba(74, 106, 255, 0.4)'}
        stroke={snapPointId ? '#ff6432' : '#4a6aff'}
        strokeWidth={1.5 * inv}
        listening={false}
      />
    ) : null;

  return (
    <Layer>
      {wallShapes}
      {dots}
      {preview}
      {snapIndicator}
    </Layer>
  );
}
