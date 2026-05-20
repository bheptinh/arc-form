import { useEffect, useRef, useState } from 'react';
import { Stage } from 'react-konva';
import { usePlannerStore } from '../../store/usePlannerStore';
import { useViewport } from '../../hooks/useViewport';
import { GridLayer } from './GridLayer';
import { WallLayer } from './WallLayer';
import { OpeningLayer } from './OpeningLayer';

export function PlannerCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const viewport = usePlannerStore((s) => s.viewport);
  const { handleWheel, handleDragMove } = useViewport();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ width: el.offsetWidth, height: el.offsetHeight });
    });
    ro.observe(el);
    setSize({ width: el.offsetWidth, height: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} style={{ flex: 1, overflow: 'hidden', background: '#fafafa' }}>
      <Stage
        width={size.width}
        height={size.height}
        x={viewport.x}
        y={viewport.y}
        scaleX={viewport.scale}
        scaleY={viewport.scale}
        draggable
        onWheel={handleWheel}
        onDragMove={handleDragMove}
      >
        <GridLayer
          viewport={viewport}
          stageWidth={size.width}
          stageHeight={size.height}
        />
        <WallLayer />
        <OpeningLayer />
      </Stage>
    </div>
  );
}
