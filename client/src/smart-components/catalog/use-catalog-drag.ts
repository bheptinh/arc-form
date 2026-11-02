import type { MouseEvent, TouchEvent } from 'react';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

import { planner } from '../../initR2D';
import { setActivePopup } from '../../redux/features/popups/popupsSlice';
import { changeUndoRedo } from '../../redux/features/topPanel/topPanelSlice';
import type { AppDispatch } from '../../redux/store';

// Catalog products come untyped from the R2D engine.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Product = any;
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

/**
 * Pressing a catalog tile: models are dragged into the scene behind a fading preview,
 * materials are dragged onto surfaces, and with `replace` a model replaces the selected
 * object instead. Attach `tileRef` to the tile and the handlers to whatever starts the drag.
 */
export function useCatalogDrag(product: Product, { replace = false } = {}) {
  const dispatch = useDispatch<AppDispatch>();
  const tileRef = useRef<HTMLDivElement>(null);
  // Ends the drag in progress; null when there is none.
  const endRef = useRef<(() => void) | null>(null);

  useEffect(() => () => endRef.current?.(), []);

  const listen = (events: Record<string, (e: PointerLike) => void>) => {
    for (const [name, handler] of Object.entries(events))
      document.addEventListener(name, handler as EventListener);
    endRef.current = () => {
      for (const [name, handler] of Object.entries(events))
        document.removeEventListener(name, handler as EventListener);
      endRef.current = null;
    };
  };

  const replaceOnRelease = () => {
    const onRelease = async () => {
      endRef.current?.();
      if (R2D.scene.currentView3DObject?.getProductId?.() == product.id) return;
      const result = await R2D.scene.replaceCurrentObject(product.id, {}, false, false);
      if (result?.type == 'error')
        return dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));
      planner
        .mih()
        .setActiveObjectProduct(planner.mih()._productHelper.findObjectView3dBySceneObject(result));
      dispatch(changeUndoRedo());
    };
    listen({ mouseup: onRelease, touchend: onRelease });
  };

  const dragMaterial = (e: MouseEvent | TouchEvent) => {
    if (!('button' in e) || e.button != 0) return;
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
      clearTimeout(timeout);
      endRef.current?.();
      if (Date.now() - startedAt > DRAG_DELAY && pointX(e) < sceneLeft()) {
        R2D.mouseInteractionHelper.stateDraggingMaterial.isPlaceMaterialAllowed = false;
        planner.mih().state?.mouseUp(e);
      }
    };
    listen({ mousemove: onMove, mouseup: onUp });
  };

  const dragModel = (e: MouseEvent | TouchEvent) => {
    const tile = tileRef.current;
    if (!tile) return;
    const tileRect = tile.getBoundingClientRect();
    const image = tile.querySelector('img');
    const imageRect = image?.getBoundingClientRect();
    const offsetX = pointX(e.nativeEvent) - (imageRect?.left ?? 0);
    const offsetY = pointY(e.nativeEvent) - (imageRect?.top ?? 0);
    // The preview fades out between the panel edge and the scene.
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
      endRef.current?.();
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

    listen({ mousemove: onMove, touchmove: onMove, mouseup: onUp, touchend: onUp });
    const stop = endRef.current;
    endRef.current = () => {
      stop?.();
      preview?.remove();
    };
  };

  const onStart = (e: MouseEvent | TouchEvent) => {
    if (endRef.current) return;
    if (product.type == R2D.ProductType.MATERIAL) dragMaterial(e);
    else if (replace) replaceOnRelease();
    else dragModel(e);
  };

  return { tileRef, onMouseDown: onStart, onTouchStart: onStart };
}
