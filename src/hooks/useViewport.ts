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

    if (e.evt.ctrlKey) {
      // Pinch to zoom (also Ctrl + mouse wheel)
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const oldScale = viewport.scale;
      const direction = e.evt.deltaY < 0 ? 1 : -1;
      const newScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, oldScale * (direction > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR)),
      );
      const mousePointTo = {
        x: (pointer.x - viewport.x) / oldScale,
        y: (pointer.y - viewport.y) / oldScale,
      };
      setViewport({
        scale: newScale,
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    } else {
      // Two-finger swipe to pan
      setViewport({
        x: viewport.x - e.evt.deltaX,
        y: viewport.y - e.evt.deltaY,
      });
    }
  }

  function handleDragMove(e: Konva.KonvaEventObject<DragEvent>) {
    if (e.target !== e.target.getStage()) return;
    setViewport({ x: e.target.x(), y: e.target.y() });
  }

  return { handleWheel, handleDragMove };
}
