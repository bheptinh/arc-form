import type Konva from 'konva';
import { Circle, Layer, Line, Rect } from 'react-konva';
import { findSnapPoint, snapPointToGrid } from '../../geometry/snap';
import { computeWallPolygon } from '../../geometry/wallGeometry';
import { usePlannerStore } from '../../store/usePlannerStore';
import type { Wall } from '../../types/planner';

interface Props {
  snapX: number | null;
  snapY: number | null;
  snapPointId: string | null;
  hoverWallId: string | null;
}

export function WallLayer({ snapX, snapY, snapPointId, hoverWallId }: Props) {
  const walls          = usePlannerStore((s) => s.walls);
  const points         = usePlannerStore((s) => s.points);
  const drawing        = usePlannerStore((s) => s.drawing);
  const defaultThick   = usePlannerStore((s) => s.defaultWallThickness);
  const { scale, x: vx, y: vy } = usePlannerStore((s) => s.viewport);
  const tool           = usePlannerStore((s) => s.tool);
  const selectedId     = usePlannerStore((s) => s.selectedId);
  const selectElement  = usePlannerStore((s) => s.selectElement);
  const movePoint      = usePlannerStore((s) => s.movePoint);
  const moveWall       = usePlannerStore((s) => s.moveWall);

  const inv = 1 / scale;
  const isSelect = tool === 'select';

  // Existing walls
  const wallShapes = Object.values(walls).flatMap((wall) => {
    const poly = computeWallPolygon(wall, points, walls);
    if (!poly) return [];
    const selected = wall.id === selectedId;
    const hovered  = wall.id === hoverWallId;
    const sp = points[wall.startId];

    // Count siblings at each endpoint to decide whether to draw miter cap strokes.
    // With exactly 1 sibling, the cap is a shared interior miter edge — suppress its stroke.
    const startSiblings = Object.values(walls).filter(
      w => w.id !== wall.id && (w.startId === wall.startId || w.endId === wall.startId),
    ).length;
    const endSiblings = Object.values(walls).filter(
      w => w.id !== wall.id && (w.startId === wall.endId || w.endId === wall.endId),
    ).length;
    const showStartCap = startSiblings !== 1;
    const showEndCap   = endSiblings   !== 1;

    const fillColor   = selected ? '#b8d4f0' : hovered ? 'rgba(74,106,255,0.2)' : '#d4d0c8';
    const strokeColor = selected ? '#2255cc' : hovered ? '#4a6aff' : '#555';
    const strokeW     = selected ? 2 * inv : inv;

    // Polygon vertex order: [A=startLeft, B=endRight, C=endLeft, D=startRight]
    const [ax, ay, bx, by, cx, cy, dx, dy] = poly;

    function handleWallDragBound(this: Konva.Node, pos: Konva.Vector2d): Konva.Vector2d {
      if (!sp) return pos;
      const worldDX = (pos.x - vx) / scale;
      const worldDY = (pos.y - vy) / scale;
      const snapped = snapPointToGrid(sp.x + worldDX, sp.y + worldDY);
      const sdx = snapped.x - sp.x;
      const sdy = snapped.y - sp.y;
      return { x: sdx * scale + vx, y: sdy * scale + vy };
    }

    function handleWallDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
      const shape = e.target;
      const worldDX = shape.x();
      const worldDY = shape.y();
      if (!sp) return;
      const snapped = snapPointToGrid(sp.x + worldDX, sp.y + worldDY);
      shape.x(0);
      shape.y(0);
      moveWall(wall.id, snapped.x - sp.x, snapped.y - sp.y);
    }

    return [
      // Fill-only polygon — handles drag & click
      <Line
        key={wall.id}
        points={poly}
        closed
        fill={fillColor}
        strokeEnabled={false}
        listening={isSelect}
        draggable={isSelect}
        dragBoundFunc={handleWallDragBound}
        onDragEnd={handleWallDragEnd}
        onClick={(e) => { e.cancelBubble = true; selectElement(wall.id); }}
      />,
      // Long side A→B
      <Line key={`${wall.id}-ab`} points={[ax, ay, bx, by]} stroke={strokeColor} strokeWidth={strokeW} listening={false} />,
      // End cap B→C: skip when it's an interior miter edge
      showEndCap
        ? <Line key={`${wall.id}-bc`} points={[bx, by, cx, cy]} stroke={strokeColor} strokeWidth={strokeW} listening={false} />
        : null,
      // Long side C→D
      <Line key={`${wall.id}-cd`} points={[cx, cy, dx, dy]} stroke={strokeColor} strokeWidth={strokeW} listening={false} />,
      // Start cap D→A: skip when it's an interior miter edge
      showStartCap
        ? <Line key={`${wall.id}-da`} points={[dx, dy, ax, ay]} stroke={strokeColor} strokeWidth={strokeW} listening={false} />
        : null,
    ].filter(Boolean);
  });

  // Endpoint dots — draggable in select mode
  const dots = Object.values(points).map((pt) => {
    const isSelectedEndpoint =
      selectedId !== null &&
      walls[selectedId] &&
      (walls[selectedId].startId === pt.id || walls[selectedId].endId === pt.id);

    function handleDotDragBound(pos: Konva.Vector2d): Konva.Vector2d {
      const worldX = (pos.x - vx) / scale;
      const worldY = (pos.y - vy) / scale;
      const others = Object.fromEntries(Object.entries(points).filter(([id]) => id !== pt.id));
      const snapPt = findSnapPoint(worldX, worldY, others, scale);
      const final = snapPt ?? snapPointToGrid(worldX, worldY);
      return { x: final.x * scale + vx, y: final.y * scale + vy };
    }

    function handleDotDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
      // dragBoundFunc already constrained the position
      movePoint(pt.id, e.target.x(), e.target.y());
    }

    return (
      <Circle
        key={pt.id}
        x={pt.x}
        y={pt.y}
        radius={(isSelectedEndpoint ? 6 : 4) * inv}
        fill={isSelectedEndpoint ? '#2255cc' : '#888'}
        listening={isSelect}
        draggable={isSelect}
        dragBoundFunc={handleDotDragBound}
        onDragEnd={handleDotDragEnd}
        onClick={(e) => { e.cancelBubble = true; }}
      />
    );
  });

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
        thickness: defaultThick,
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

  // Junction fillers: neutral-color rhombus drawn over the miter seam at each 2-wall
  // junction, so the corner has a consistent fill regardless of which wall is selected.
  const junctionFillers = Object.values(points).map((pt) => {
    const poly = computeJunctionFiller(pt.id, points, walls);
    if (!poly) return null;
    return (
      <Line
        key={`jf-${pt.id}`}
        points={poly}
        closed
        fill="#d4d0c8"
        strokeEnabled={false}
        listening={false}
      />
    );
  });

  return (
    <Layer>
      {wallShapes}
      {junctionFillers}
      {dots}
      {preview}
      {snapIndicator}
    </Layer>
  );
}
