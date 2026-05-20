import { Layer, Line } from 'react-konva';
import { GRID_MAJOR_MM, GRID_MINOR_MM } from '../../constants';
import type { Viewport } from '../../types/planner';

interface Props {
  viewport: Viewport;
  stageWidth: number;
  stageHeight: number;
}

export function GridLayer({ viewport, stageWidth, stageHeight }: Props) {
  const { x: ox, y: oy, scale } = viewport;

  // World bounds visible on screen (in mm)
  const worldLeft   = -ox / scale;
  const worldTop    = -oy / scale;
  const worldRight  = (stageWidth - ox) / scale;
  const worldBottom = (stageHeight - oy) / scale;

  // Counter-scale stroke so lines are always 1px regardless of zoom
  const thinStroke  = 0.5 / scale;
  const thickStroke = 1.0 / scale;

  const lines: React.ReactNode[] = [];

  const startX = Math.floor(worldLeft  / GRID_MINOR_MM) * GRID_MINOR_MM;
  const startY = Math.floor(worldTop   / GRID_MINOR_MM) * GRID_MINOR_MM;

  for (let wx = startX; wx <= worldRight; wx += GRID_MINOR_MM) {
    const isMajor = wx % GRID_MAJOR_MM === 0;
    lines.push(
      <Line
        key={`v${wx}`}
        points={[wx, worldTop, wx, worldBottom]}
        stroke={isMajor ? '#c0c0c0' : '#e8e8e8'}
        strokeWidth={isMajor ? thickStroke : thinStroke}
        listening={false}
      />,
    );
  }

  for (let wy = startY; wy <= worldBottom; wy += GRID_MINOR_MM) {
    const isMajor = wy % GRID_MAJOR_MM === 0;
    lines.push(
      <Line
        key={`h${wy}`}
        points={[worldLeft, wy, worldRight, wy]}
        stroke={isMajor ? '#c0c0c0' : '#e8e8e8'}
        strokeWidth={isMajor ? thickStroke : thinStroke}
        listening={false}
      />,
    );
  }

  return <Layer listening={false}>{lines}</Layer>;
}
