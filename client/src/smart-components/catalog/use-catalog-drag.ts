import type { MouseEvent, RefObject, TouchEvent } from 'react';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { planner } from '../../initR2D';
import { setActivePopup } from '../../redux/features/popups/popupsSlice';
import { changeUndoRedo } from '../../redux/features/topPanel/topPanelSlice';
import type { AppDispatch } from '../../redux/store';
import type { Product } from './tile-parts';

type PointerLike = globalThis.MouseEvent | globalThis.TouchEvent;

// A press shorter than this is a click, not a drag.
const DRAG_DELAY = 100;

const isPhone = () => ['iOS', 'Android'].includes(R2D.controller.getCurrentOS());
const pointX = (e: PointerLike) =>
  'touches' in e ? (e.touches[0] ?? e.changedTouches[0]).clientX : e.clientX;
const pointY = (e: PointerLike) =>
  'touches' in e ? (e.touches[0] ?? e.changedTouches[0]).clientY : e.clientY;
// Left edge of the 3D view, i.e. where the open panels end.
const sceneLeft = () => R2D.Viewers._instance.getOffsetWidthDueToOpenedPanels();

// Document listeners for one drag at a time, removed when it ends or the tile unmounts.
function useDragSession() {
  // Ends the drag in progress; null when there is none.
  const endRef = useRef<(() => void) | null>(null);

  useEffect(() => () => endRef.current?.(), []);

  const listen = (events: Record<string, (e: PointerLike) => void>, onEnd?: () => void) => {
    for (const [name, handler] of Object.entries(events))
      document.addEventListener(name, handler as EventListener);
    endRef.current = () => {
      for (const [name, handler] of Object.entries(events))
        document.removeEventListener(name, handler as EventListener);
      onEnd?.();
      endRef.current = null;
    };
  };
  const end = () => endRef.current?.();
  const isActive = () => endRef.current != null;

  return { listen, end, isActive };
}

/** Drags a material onto a surface in the scene. Colour variants carry their colour in `addData`. */
export function useMaterialDrag(product: Product) {
  const session = useDragSession();

  const onMouseDown = (e: MouseEvent) => {
    if (session.isActive() || e.button != 0) return;
    const startedAt = Date.now();
    const timeout = setTimeout(
      () =>
        product.addData
          ? planner.scene.dragProductFromCatalog(product.addData, product.id)
          : planner.scene.dragProductFromCatalog(product.id),
      DRAG_DELAY
    );
    const onMove = (e: PointerLike) =>
      Date.now() - startedAt > DRAG_DELAY && planner.mih().state?.mouseMove(e);
    const onUp = (e: PointerLike) => {
      session.end();
      if (Date.now() - startedAt > DRAG_DELAY && pointX(e) < sceneLeft()) {
        R2D.mouseInteractionHelper.stateDraggingMaterial.isPlaceMaterialAllowed = false;
        planner.mih().state?.mouseUp(e);
      }
    };
    session.listen({ mousemove: onMove, mouseup: onUp }, () => clearTimeout(timeout));
  };

  return { onMouseDown };
}

/**
 * Drags a model into the scene behind a preview of its image that fades out past the
 * panel edge. With `replace`, a click replaces the selected object instead.
 */
export function useModelDrag(
  product: Product,
  tileRef: RefObject<HTMLElement | null>,
  { replace = false } = {}
) {
  const dispatch = useDispatch<AppDispatch>();
  const session = useDragSession();

  const replaceOnRelease = () => {
    const onRelease = async () => {
      session.end();
      if (R2D.scene.currentView3DObject?.getProductId?.() == product.id) return;
      const result = await R2D.scene.replaceCurrentObject(product.id, {}, false, false);
      if (result?.type == 'error')
        return dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));
      planner
        .mih()
        .setActiveObjectProduct(planner.mih()._productHelper.findObjectView3dBySceneObject(result));
      dispatch(changeUndoRedo());
    };
    session.listen({ mouseup: onRelease, touchend: onRelease });
  };

  const drag = (e: MouseEvent | TouchEvent) => {
    const tile = tileRef.current;
    if (!tile) return;
    const tileRect = tile.getBoundingClientRect();
    const image = tile.querySelector('img');
    const imageRect = image?.getBoundingClientRect();
    const offsetX = pointX(e.nativeEvent) - (imageRect?.left ?? 0);
    const offsetY = pointY(e.nativeEvent) - (imageRect?.top ?? 0);
    const fadeRatio = 1 / (sceneLeft() - tileRect.right);
    const startedAt = Date.now();
    let preview: HTMLDivElement | null = null;

    const onMove = (e: PointerLike) => {
      if (Date.now() - startedAt <= DRAG_DELAY) return;
      if (!preview) {
        preview = document.createElement('div');
        preview.style.cssText = 'position:absolute;z-index:9;user-select:none;pointer-events:none';
        const img = document.createElement('img');
        img.src = R2D.URL.DOMAIN + product.source?.images.preview;
        img.style.width = (image?.offsetWidth ?? 0) + 'px';
        img.style.height = (image?.offsetHeight ?? 0) + 'px';
        preview.append(img);
        document.body.append(preview);
        planner.scene.dragProductFromCatalog(product.id);
      }
      const x = pointX(e);
      const pastPanel = tileRect.right - x;
      preview.style.opacity = String(pastPanel > 0 ? 1 : 1 + pastPanel * fadeRatio);
      preview.style.left = x - offsetX + 'px';
      preview.style.top = pointY(e) - offsetY + 'px';
      if (isPhone()) planner.mih().state.mouseMove(e);
    };

    const onUp = (e: PointerLike) => {
      session.end();
      if (Date.now() - startedAt > DRAG_DELAY) {
        const dragging = R2D.mouseInteractionHelper.stateDraggingProdFromCatalog;
        const placed = dragging.view3DObject?.sceneObject;
        // Released over the panels: drop the object that followed the cursor.
        if (pointX(e) < sceneLeft()) {
          planner.mih().state?.mouseUp(e);
          if (placed) {
            R2D.scene.remove(placed);
            R2D.scene.history.removeUndoState();
          }
        }
        dragging.view3DObject = null;
      }
      dispatch(changeUndoRedo());
    };

    session.listen({ mousemove: onMove, touchmove: onMove, mouseup: onUp, touchend: onUp }, () =>
      preview?.remove()
    );
  };

  const onStart = (e: MouseEvent | TouchEvent) => {
    if (session.isActive()) return;
    if (replace) replaceOnRelease();
    else drag(e);
  };

  return { onMouseDown: onStart, onTouchStart: onStart };
}
