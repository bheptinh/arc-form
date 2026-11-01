import { motion } from 'framer-motion';
import React, { forwardRef, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { planner } from '../../../initR2D';
import { selectIs3DRotationModeActive } from '../../../redux/features/common/commonSlice';
import HoverComponent from '../../left_new/parts/controlPanel/components/HoverComponent';
import { useTranslation } from '../../../api/hooks/useTranslation';

const useStyle = createUseStyles({
  info_model_btn: {
    position: 'absolute',
    left: '50%',
    borderRadius: '50%',
    width: 32,
    height: 32,
    background: 'var(--color-white)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    border: '1px solid var(--color-white)',
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    transition: 'background 0.9s cubic-bezier(.19,1,.22,1)',
    '& img': {
      userSelect: 'none',
      pointerEvents: 'none',
    },
    '&:hover': {
      background: 'var(--color-surface-muted)',
    },
  },
  grabbing: {
    cursor: 'grabbing',
  },
  info_model_btn_overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  info_model_main: {},
});

export const ElevateRef = forwardRef(
  ({ positionBtn, showButtonsElevate, hideButtonsElevate, setPanelPosition, addStyles }, ref) => (
    <Elevate
      addStyles={addStyles}
      setPanelPosition={setPanelPosition}
      showButtonsElevate={showButtonsElevate}
      hideButtonsElevate={hideButtonsElevate}
      positionBtn={positionBtn}
      reference={ref}
    />
  )
);

const Elevate = (props) => {
  const translation = useTranslation();

  const positionBtn = props.positionBtn;
  const addStyles = props.addStyles;
  let pointPrev = null;

  const classes = useStyle();

  let pointClick = 0;
  const timeoutId = null;
  const mih = planner.mih();
  const currentObjectView3d = mih._scene.currentGroup
    ? mih._scene.currentGroup
    : mih._scene.currentView3DObject;

  const is3DModeRotationActive = useSelector(selectIs3DRotationModeActive);

  const { textFieldInfo, mainDiv, btnMoveY } = props.reference.current;

  const startElevateModel = (event) => {
    clearTimeout(timeoutId);
    document.querySelector('.viewer-canvas').classList.add('active');
    btnMoveY.current.classList.add(classes.grabbing);

    if (!currentObjectView3d) return;

    if (is3DModeRotationActive && !mih._scene.currentGroup) {
      mih._scene3d.top.children.forEach((i) => {
        if (i.name == 'rotationRings') {
          i.clear();
          i.removeFromParent();
        }
      });

      mih._currentViewer.rendererUpdate();
    }

    pointPrev = {
      x: event.clientX || (event.touches && event.touches[0].clientX),
      y: event.clientY || (event.touches && event.touches[0].clientY),
    };

    document.addEventListener('mousemove', onElevateModel);
    document.addEventListener('mouseup', stopElevateModel);

    document.addEventListener('touchmove', onElevateModel);
    document.addEventListener('touchend', stopElevateModel);

    props.hideButtonsElevate();

    const viewportOffset = btnMoveY.current.getBoundingClientRect();

    if (textFieldInfo.current) {
      textFieldInfo.current.style.display = 'block';
      textFieldInfo.current.textContent = planner.units.valueToString(currentObjectView3d.y);

      if (is3DModeRotationActive && !mih._scene.currentGroup) {
        textFieldInfo.current.style.left =
          viewportOffset.left + btnMoveY.current.offsetWidth / 2 + 'px';
        textFieldInfo.current.style.top =
          viewportOffset.top + btnMoveY.current.offsetHeight + 30 + 'px';
      }
    }
    const top = viewportOffset.top;

    pointClick = pointPrev.y - top;
  };

  const onElevateModel = (event) => {
    if (!currentObjectView3d || !mainDiv.current) return;

    const newX = event.clientX || (event.touches && event.touches[0].clientX);
    const newY = event.clientY || (event.touches && event.touches[0].clientY);

    if (!newX || !newY) return;

    const dy = newY - pointPrev.y;

    let sensitiveMove = 1;
    if (R2D.Viewers.getCurrentViewerName() === 'view3d') {
      sensitiveMove = R2D.view3d.getSensitiveMove();
    }
    let py = Math.round(currentObjectView3d.y - dy * sensitiveMove);

    if (py < 0) py = 0;
    if (currentObjectView3d.y == py) return;

    const viewportOffset = btnMoveY.current.getBoundingClientRect();

    mainDiv.current.style.top =
      newY +
      (btnMoveY.current.offsetHeight - pointClick) -
      positionBtn.y -
      btnMoveY.current.offsetHeight +
      'px';
    if (textFieldInfo.current) {
      textFieldInfo.current.textContent = planner.units.valueToString(py);

      if (is3DModeRotationActive && !mih._scene.currentGroup) {
        textFieldInfo.current.style.left =
          viewportOffset.left + btnMoveY.current.offsetWidth / 2 + 'px';
        textFieldInfo.current.style.top =
          viewportOffset.top + btnMoveY.current.offsetHeight + 30 + 'px';
      }
    }

    currentObjectView3d.y = py;
    currentObjectView3d.update();

    planner.apiScene.dispatchEvent(new Event(planner.apiScene.ELEVATION_OBJECT, { elevation: py }));

    pointPrev = {
      x: newX,
      y: newY,
    };

    if (mih._scene.currentView3DObject && mih._scene.currentView3DObject.objectType == 'product') {
      mih._ruler3d.update(mih._productHelper.getView3DObjects(), mih._scene.currentView3DObject);
      mih._ruler3d.appendFromConstructor(mih._constructor.getLines());
    }
    mih._ruler3d.findRules(mih._scene.currentGroup || mih._scene.currentView3DObject);
  };

  const stopElevateModel = (e) => {
    pointPrev = null;

    props.showButtonsElevate();
    document.querySelector('.viewer-canvas').classList.remove('active');
    btnMoveY.current?.classList.remove(classes.grabbing);

    if (textFieldInfo.current) textFieldInfo.current.removeAttribute('style');

    document.removeEventListener('mousemove', onElevateModel);
    document.removeEventListener('mouseup', stopElevateModel);

    document.removeEventListener('touchmove', onElevateModel);
    document.removeEventListener('touchend', stopElevateModel);

    if (
      mih._scene.currentView3DObject &&
      mih._scene.currentView3DObject.type == R2D.ProductType.MODEL &&
      mih._scene.currentView3DObject.getForWall()
    ) {
      mih._constructor.pickElement(mih._scene.currentView3DObject.sceneObject.objectId);
      mih._constructor.dropElement(
        R2D.Scene.getObjectDataForWallElement(mih._scene.currentView3DObject.sceneObject),
        10
      );
    }

    if (is3DModeRotationActive && !mih._scene.currentGroup) {
      const rings = mih.createRings3D();

      if (rings) {
        rings.position.set(
          R2D.scene.currentSceneObject.x,
          R2D.scene.currentSceneObject.y,
          R2D.scene.currentSceneObject.z
        );
        R2D.scene3d.add(rings, 'top');
        mih._currentViewer.rendererUpdate();
      }
    }

    mih._scene.history.saveState();
    mainDiv.current &&
      props.setPanelPosition &&
      props.setPanelPosition({
        x: mainDiv.current.style.left.replace('px', ''),
        y: mainDiv.current.style.top.replace('px', ''),
      });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.3 }}
      transformTemplate={({ scale }) => `translateX(-50%) scale(${scale})`}
      className={classes.info_model_btn}
      ref={btnMoveY}
      style={
        addStyles
          ? { transform: 'translateX(-50%)', ...addStyles, top: positionBtn.y + 'px' }
          : { top: positionBtn.y + 'px' }
      }
    >
      <HoverComponent hoverText={translation['HINT_BUTTON_ELEVATION']}>
        <img src="/src_designer/images/icon_move_y.svg" />
        <div
          className={classes.info_model_btn_overlay}
          onMouseDown={startElevateModel}
          onTouchStart={startElevateModel}
        ></div>
      </HoverComponent>
    </motion.div>
  );
};

