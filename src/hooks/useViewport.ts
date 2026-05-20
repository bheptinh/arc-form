import type Konva from 'konva';
import { MAX_SCALE, MIN_SCALE, ZOOM_FACTOR } from '../constants';
import { usePlannerStore } from '../store/usePlannerStore';

export function useViewport() {
  const setViewport = usePlannerStore((s) => s.setViewport);
  const viewport = usePlannerStore((s) => s.viewport);

  function handleWheel(e: Konva.KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const oldScale = viewport.scale;
    const direction = e.evt.deltaY < 0 ? 1 : -1;
    const newScale = Math.min(
      MAX_SCALE,
      Math.max(MIN_SCALE, oldScale * (direction > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR)),
    );

    // Zoom toward pointer position
    const mousePointTo = {
      x: (pointer.x - viewport.x) / oldScale,
      y: (pointer.y - viewport.y) / oldScale,
    };

    setViewport({
      scale: newScale,
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  }

  function handleDragMove(e: Konva.KonvaEventObject<DragEvent>) {
    setViewport({ x: e.target.x(), y: e.target.y() });
  }

  return { handleWheel, handleDragMove };
}
