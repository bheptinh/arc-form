import type Konva from 'konva';
import { Layer, Line, Rect, Shape } from 'react-konva';
import { computeOpeningGeom } from '../../geometry/openingGeometry';
import { usePlannerStore } from '../../store/usePlannerStore';

export function OpeningLayer() {
  const openings      = usePlannerStore((s) => s.openings);
  const walls         = usePlannerStore((s) => s.walls);
  const points        = usePlannerStore((s) => s.points);
  const selectedId    = usePlannerStore((s) => s.selectedId);
  const selectElement = usePlannerStore((s) => s.selectElement);
  const updateOpening = usePlannerStore((s) => s.updateOpening);
  const tool          = usePlannerStore((s) => s.tool);
  const { scale, x: vx, y: vy } = usePlannerStore((s) => s.viewport);

  const inv      = 1 / scale;
  const isSelect = tool === 'select';

  const shapes = Object.values(openings).map((opening) => {
    const gOrNull = computeOpeningGeom(opening, walls, points);
    if (!gOrNull) return null;
    const g = gOrNull;

    const selected    = opening.id === selectedId;
    const strokeColor = selected ? '#2255cc' : '#555';
    const wall        = walls[opening.wallId];
    const sp          = wall ? points[wall.startId] : null;
    const thickness   = wall?.thickness ?? 200;
    const rotDeg      = (g.wallDirAngleRad * 180) / Math.PI;

    function handleDragBound(pos: Konva.Vector2d): Konva.Vector2d {
      if (!sp) return pos;
      const worldX  = (pos.x - vx) / scale;
      const worldY  = (pos.y - vy) / scale;
      const projT   = g.wallDir.x * (worldX - sp.x) + g.wallDir.y * (worldY - sp.y);
      const clamped = Math.max(opening.width / 2, Math.min(g.wallLen - opening.width / 2, projT));
      return {
        x: (sp.x + g.wallDir.x * clamped) * scale + vx,
        y: (sp.y + g.wallDir.y * clamped) * scale + vy,
      };
    }

    function handleDragEnd(e: Konva.KonvaEventObject<DragEvent>) {
      if (!sp) return;
      const newCX     = e.target.x();
      const newCY     = e.target.y();
      const projT     = g.wallDir.x * (newCX - sp.x) + g.wallDir.y * (newCY - sp.y);
      const newOffset = Math.max(0, Math.min(g.wallLen - opening.width, projT - opening.width / 2));
      e.target.x(g.centerX);
      e.target.y(g.centerY);
      updateOpening(opening.id, { offset: newOffset });
    }

    return [
      // Erase wall fill over the gap
      <Line
        key={`gap-${opening.id}`}
        points={g.gapPoly}
        closed
        fill="#fafafa"
        stroke="#fafafa"
        strokeWidth={inv}
        listening={false}
      />,

      // Jamb lines
      <Line key={`js-${opening.id}`} points={g.jambStart} stroke={strokeColor} strokeWidth={2 * inv} listening={false} />,
      <Line key={`je-${opening.id}`} points={g.jambEnd}   stroke={strokeColor} strokeWidth={2 * inv} listening={false} />,

      // Door: panel line + quarter-circle arc
      ...(opening.type === 'door' ? [
        <Line
          key={`dp-${opening.id}`}
          points={[g.hingeX, g.hingeY, g.panelTipX, g.panelTipY]}
          stroke={strokeColor}
          strokeWidth={inv}
          listening={false}
        />,
        <Shape
          key={`da-${opening.id}`}
          sceneFunc={(ctx, shape) => {
            ctx.beginPath();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (ctx as any).arc(
              g.hingeX,
              g.hingeY,
              opening.width,
              g.arcStartAngle,
              g.arcEndAngle,
              g.swingCCW,
            );
            ctx.strokeShape(shape);
          }}
          stroke={strokeColor}
          strokeWidth={inv}
          listening={false}
        />,
      ] : [
        // Window: two glass-pane lines
        <Line key={`wl1-${opening.id}`} points={g.winLine1} stroke={strokeColor} strokeWidth={2 * inv} listening={false} />,
        <Line key={`wl2-${opening.id}`} points={g.winLine2} stroke={strokeColor} strokeWidth={2 * inv} listening={false} />,
      ]),

      // Hit / drag target (invisible rotated rect, selected = highlighted border)
      <Rect
        key={`hit-${opening.id}`}
        x={g.centerX}
        y={g.centerY}
        width={opening.width}
        height={thickness + 40}
        offsetX={opening.width / 2}
        offsetY={(thickness + 40) / 2}
        rotation={rotDeg}
        fill="transparent"
        stroke={selected ? '#2255cc' : 'transparent'}
        strokeWidth={1.5 * inv}
        listening={isSelect}
        draggable={isSelect}
        dragBoundFunc={handleDragBound}
        onDragEnd={handleDragEnd}
        onClick={(e) => { e.cancelBubble = true; selectElement(opening.id); }}
      />,
    ];
  });

  return <Layer>{shapes.flat()}</Layer>;
}
