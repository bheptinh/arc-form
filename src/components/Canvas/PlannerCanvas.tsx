import type Konva from 'konva';
import { useEffect, useRef, useState } from 'react';
import { Stage } from 'react-konva';
import { findSnapPoint, snapPointToGrid } from '../../geometry/snap';
import { useViewport } from '../../hooks/useViewport';
import { usePlannerStore } from '../../store/usePlannerStore';
import { GridLayer } from './GridLayer';
import { OpeningLayer } from './OpeningLayer';
import { WallLayer } from './WallLayer';

interface SnapInfo {
  x: number;
  y: number;
  pointId: string | null;
}

export function PlannerCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [snap, setSnap] = useState<SnapInfo | null>(null);

  const viewport  = usePlannerStore((s) => s.viewport);
  const tool      = usePlannerStore((s) => s.tool);
  const points    = usePlannerStore((s) => s.points);
  const drawing   = usePlannerStore((s) => s.drawing);

  const beginWall           = usePlannerStore((s) => s.beginWall);
  const extendWall          = usePlannerStore((s) => s.extendWall);
  const updateDrawingPreview = usePlannerStore((s) => s.updateDrawingPreview);
  const cancelDrawing       = usePlannerStore((s) => s.cancelDrawing);

  const { handleWheel, handleDragMove } = useViewport();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setSize({ width: el.offsetWidth, height: el.offsetHeight }),
    );
    ro.observe(el);
    setSize({ width: el.offsetWidth, height: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  // Cancel drawing on tool change or Escape
  useEffect(() => {
    if (tool !== 'wall') cancelDrawing();
  }, [tool, cancelDrawing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancelDrawing();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cancelDrawing]);

  function screenToWorld(screenX: number, screenY: number) {
    return {
      x: (screenX - viewport.x) / viewport.scale,
      y: (screenY - viewport.y) / viewport.scale,
    };
  }

  function computeSnap(screenX: number, screenY: number): SnapInfo {
    const world = screenToWorld(screenX, screenY);
    const snapPt = findSnapPoint(world.x, world.y, points, viewport.scale);
    if (snapPt) return { x: snapPt.x, y: snapPt.y, pointId: snapPt.id };
    const g = snapPointToGrid(world.x, world.y);
    return { x: g.x, y: g.y, pointId: null };
  }

  function handleMouseMove(e: Konva.KonvaEventObject<MouseEvent>) {
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;
    const s = computeSnap(pos.x, pos.y);
    setSnap(s);
    if (tool === 'wall' && drawing) updateDrawingPreview(s.x, s.y);
  }

  function handleMouseLeave() {
    setSnap(null);
  }

  function handleClick(e: Konva.KonvaEventObject<MouseEvent>) {
    if (e.evt.button !== 0 || tool !== 'wall') return;
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;
    const s = computeSnap(pos.x, pos.y);
    if (!drawing) {
      beginWall(s.x, s.y, s.pointId ?? undefined);
    } else {
      extendWall(s.x, s.y, s.pointId ?? undefined);
    }
  }

  function handleContextMenu(e: Konva.KonvaEventObject<MouseEvent>) {
    e.evt.preventDefault();
    if (drawing) cancelDrawing();
  }

  const isWallTool = tool === 'wall';

  return (
    <div
      ref={containerRef}
      style={{ flex: 1, overflow: 'hidden', background: '#fafafa', cursor: isWallTool ? 'crosshair' : 'default' }}
    >
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
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <GridLayer viewport={viewport} stageWidth={size.width} stageHeight={size.height} />
        <WallLayer
          snapX={isWallTool && snap ? snap.x : null}
          snapY={isWallTool && snap ? snap.y : null}
          snapPointId={isWallTool && snap ? snap.pointId : null}
        />
        <OpeningLayer />
      </Stage>
    </div>
  );
}
