import { Layer, Text } from 'react-konva';
import { usePlannerStore } from '../../store/usePlannerStore';

function fmtLen(mm: number): string {
  return `${(mm / 1000).toFixed(2)} m`;
}

export function DimensionLayer() {
  const walls   = usePlannerStore((s) => s.walls);
  const points  = usePlannerStore((s) => s.points);
  const { scale } = usePlannerStore((s) => s.viewport);
  const inv = 1 / scale;

  const labels = Object.values(walls).map((wall) => {
    const sp = points[wall.startId];
    const ep = points[wall.endId];
    if (!sp || !ep) return null;

    const dx  = ep.x - sp.x;
    const dy  = ep.y - sp.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 50) return null;

    const ux = dx / len, uy = dy / len;
    const perpX = -uy, perpY = ux;

    const gap    = wall.thickness / 2 + 120;
    const labelX = (sp.x + ep.x) / 2 + perpX * gap;
    const labelY = (sp.y + ep.y) / 2 + perpY * gap;

    let rotDeg = Math.atan2(dy, dx) * 180 / Math.PI;
    if (rotDeg > 90 || rotDeg <= -90) rotDeg += 180;

    const fontSize = 12 * inv;
    const boxW     = 180 * inv;

    return (
      <Text
        key={wall.id}
        x={labelX}
        y={labelY}
        text={fmtLen(len)}
        fontSize={fontSize}
        fontFamily="system-ui, sans-serif"
        fill="#555"
        rotation={rotDeg}
        width={boxW}
        offsetX={boxW / 2}
        offsetY={fontSize / 2}
        align="center"
        listening={false}
      />
    );
  });

  return <Layer>{labels}</Layer>;
}
