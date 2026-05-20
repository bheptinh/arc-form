import type Konva from 'konva';
import { useEffect, useRef, useState } from 'react';
import { Stage } from 'react-konva';
import { DEFAULT_DOOR_WIDTH_MM, DEFAULT_WINDOW_WIDTH_MM } from '../../constants';
import { findWallHit } from '../../geometry/openingGeometry';
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

  const walls = usePlannerStore((s) => s.walls);

  const beginWall           = usePlannerStore((s) => s.beginWall);
  const extendWall          = usePlannerStore((s) => s.extendWall);
  const updateDrawingPreview = usePlannerStore((s) => s.updateDrawingPreview);
  const cancelDrawing       = usePlannerStore((s) => s.cancelDrawing);
  const selectElement       = usePlannerStore((s) => s.selectElement);
  const deleteSelected      = usePlannerStore((s) => s.deleteSelected);
  const addOpening          = usePlannerStore((s) => s.addOpening);
  const undo                = usePlannerStore((s) => s.undo);
  const redo                = usePlannerStore((s) => s.redo);

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
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'Escape') { cancelDrawing(); return; }
      if (e.key === 'Delete' || e.key === 'Backspace') { deleteSelected(); return; }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); return; }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cancelDrawing, deleteSelected, undo, redo]);

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
    if (e.evt.button !== 0) return;
    if (tool === 'select') {
      if (e.target === e.target.getStage()) selectElement(null);
      return;
    }
    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    if (tool === 'wall') {
      const s = computeSnap(pos.x, pos.y);
      if (!drawing) {
        beginWall(s.x, s.y, s.pointId ?? undefined);
      } else {
        extendWall(s.x, s.y, s.pointId ?? undefined);
      }
      return;
    }

    if (tool === 'door' || tool === 'window') {
      const world = screenToWorld(pos.x, pos.y);
      const hit = findWallHit(world.x, world.y, walls, points);
      if (!hit) return;
      const width = tool === 'door' ? DEFAULT_DOOR_WIDTH_MM : DEFAULT_WINDOW_WIDTH_MM;
      const centeredOffset = Math.max(0, Math.min(hit.wallLen - width, hit.offset - width / 2));
      addOpening({
        wallId: hit.wallId,
        type: tool,
        offset: centeredOffset,
        width,
        swing: 'left',
      });
    }
  }

  function handleContextMenu(e: Konva.KonvaEventObject<MouseEvent>) {
    e.evt.preventDefault();
    if (drawing) cancelDrawing();
  }

  const placingTool = tool === 'wall' || tool === 'door' || tool === 'window';

  return (
    <div
      ref={containerRef}
      style={{ flex: 1, overflow: 'hidden', background: '#fafafa', cursor: placingTool ? 'crosshair' : 'default' }}
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
          snapX={tool === 'wall' && snap ? snap.x : null}
          snapY={tool === 'wall' && snap ? snap.y : null}
          snapPointId={tool === 'wall' && snap ? snap.pointId : null}
        />
        <OpeningLayer />
      </Stage>
    </div>
  );
}
