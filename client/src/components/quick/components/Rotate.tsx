import { motion } from 'framer-motion';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner, GEOM } from '../../../initR2D';
import { setActivePopup } from '../../../redux/features/popups/popupsSlice';
import { changeUndoRedo } from '../../../redux/features/topPanel/topPanelSlice';
import HoverComponent from '../../left_new/parts/controlPanel/components/HoverComponent';
import { useTranslation } from '../../../api/hooks/useTranslation';

const useStyle = createUseStyles({
  info_model_btn: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    border: '1px solid #fff',
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    transition: 'background 0.9s cubic-bezier(.19,1,.22,1)',
    '&:hover': {
      background: '#E9E9E9',
    },
    '& img': {},
  },
  info_model_btn_overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  grabbing: {
    cursor: 'grabbing',
  },
});

export const RotateRef = forwardRef(({ radius, hide, show, positionBtn, addStyles }, ref) => (
  <Rotate
    radius={radius}
    addStyles={addStyles}
    hide={hide}
    show={show}
    positionBtn={positionBtn}
    reference={ref}
  />
));

const Rotate = (props) => {
  const translation = useTranslation();

  const positionBtn = props.positionBtn;
  const addStyles = props.addStyles;
  const buttonsRadius = props.radius;
  let angleButtonRotation = 0;
  let angleObject = 0;
  const currentObjectView3d = R2D.scene.currentGroup || R2D.scene.currentView3DObject;
  const currentPartNum = R2D.scene.currentPartNum;

  const mih = planner.mih();

  const dispatch = useDispatch();

  let rotateBtnStartPosition = null;
  let restBtY = null;
  let restBtX = null;

  const { textFieldInfo, btnRotate, mainDiv } = props.reference.current;

  const timeoutId = null;

  const startRotate = (e) => {
    clearTimeout(timeoutId);
    if (!currentObjectView3d) return;

    document.querySelector('.viewer-canvas').classList.add('active');
    btnRotate.current.classList.add(classes.grabbing);

    if (R2D.scene.currentView3DObject && R2D.scene.currentView3DObject.object3d?.rotation) {
      const rotationX = currentObjectView3d?.object3d?.rotation?.x;
      const rotationZ = currentObjectView3d?.object3d?.rotation?.z;
      if ((rotationX || rotationZ) && !R2D.Storage.load('r2d_revert3DRotationPopup'))
        return dispatch(setActivePopup({ name: 'revert3DRotationPopup' }));
    }

    props.hide();
    clearTimeout(timeoutId);

    if (textFieldInfo.current) textFieldInfo.current.style.display = 'block';

    rotateBtnStartPosition = { x: btnRotate.current.offsetLeft, y: btnRotate.current.offsetTop };
    restBtX = e.clientX - btnRotate.current.getBoundingClientRect().x;
    restBtY = e.clientY - btnRotate.current.getBoundingClientRect().y;

    document.addEventListener('mousemove', rotate);
    document.addEventListener('mouseup', stopRotate);
    document.addEventListener('touchmove', rotate);
    document.addEventListener('touchend', stopRotate);

    switch (currentObjectView3d.objectType) {
      case 'product':
        if (
          currentObjectView3d.sceneObject.rotationX !== 0 ||
          currentObjectView3d.sceneObject.rotationZ !== 0
        ) {
          currentObjectView3d.sceneObject.rotationX = 0;
          currentObjectView3d.sceneObject.rotationY = 0;
          currentObjectView3d.sceneObject.rotationZ = 0;
        }
        angleObject = GEOM.pacifyAngleRad(-GEOM.toRad(currentObjectView3d.sceneObject.rotationY));
        break;

      case 'constructor':
        angleObject = currentObjectView3d.getMaterialRotation(currentPartNum);
        currentObjectView3d.startRotateMaterial();
        break;

      case 'group':
        angleObject = -currentObjectView3d.rotation;
        break;
    }

    if (textFieldInfo.current)
      textFieldInfo.current.textContent = Math.round(GEOM.toDeg(angleObject)) + '°';
  };

  const positionButtonRotation = () => {
    if (!btnRotate.current) return;
    btnRotate.current.style.top = Math.ceil(Math.sin(angleButtonRotation) * buttonsRadius) + 'px';
    btnRotate.current.style.left = Math.ceil(Math.cos(angleButtonRotation) * buttonsRadius) + 'px';
  };

  const rotate = (e) => {
    if (!currentObjectView3d) return;
    const angleStep = G.toRad(45);
    const anglePrecision = G.toRad(3);
    const currX = e.clientX - restBtX || (e.touches && e.touches[0].clientX);
    const currY = e.clientY - restBtY || (e.touches && e.touches[0].clientY);
    let angleMouse =
      currX !== null && currY !== null
        ? G.angleLine(
            mainDiv.current?.getBoundingClientRect().left,
            mainDiv.current?.getBoundingClientRect().top,
            currX,
            currY
          )
        : 0;
    let angle = angleMouse + angleObject;
    const angleNear = Math.round(angle / angleStep) * angleStep;
    const angleDelta = angleNear - angle;

    if (Math.abs(angleDelta) < anglePrecision) {
      angle += angleDelta;
      angleMouse += angleDelta;
    }

    angle = G.pacifyAngleRad(angle);
    angleMouse = G.pacifyAngleRad(angleMouse);
    angleButtonRotation = angleMouse;

    if (textFieldInfo.current)
      textFieldInfo.current.textContent = Math.floor(GEOM.toDeg(angle)).toString() + '°';

    switch (currentObjectView3d.objectType) {
      case 'product':
        currentObjectView3d.sceneObject.rotationY = -Math.floor(GEOM.toDeg(angle));
        currentObjectView3d.sceneObject.update();
        mih.api.dispatchEvent(new Event(mih.api.OBJECT_ROTATION_AXIS, {}));
        break;

      case 'constructor':
        currentObjectView3d.rotateMaterial(angle, currentPartNum);
        currentObjectView3d.update();
        break;

      case 'group':
        currentObjectView3d.setRotation(-angle);
        currentObjectView3d.update();
        planner.apiScene.dispatchEvent(
          new Event(planner.apiScene.ROTATION_GROUP, {
            height: currentObjectView3d.getHeight(),
            elevation: currentObjectView3d.y,
            width: currentObjectView3d.getWidth(),
            depth: currentObjectView3d.getDepth(),
          })
        );
        break;
    }

    positionButtonRotation();

    if (mih._scene.currentView3DObject && mih._scene.currentView3DObject.objectType == 'product') {
      mih._ruler3d.findRules(mih._scene.currentView3DObject);
    } else if (mih._scene.currentGroup) {
      mih._ruler3d.findRules(mih._scene.currentGroup);
    }
  };

  const stopRotate = (e) => {
    if (!btnRotate.current || !currentObjectView3d) return;
    props.show();
    angleButtonRotation = 0;

    switch (currentObjectView3d?.objectType) {
      case 'product':
        break;

      case 'constructor':
        currentObjectView3d.stopRotateMaterial();
        currentObjectView3d.update();
        break;

      case 'group':
        break;
    }

    document.querySelector('.viewer-canvas').classList.remove('active');
    btnRotate.current.classList.remove(classes.grabbing);

    btnRotate.current.style.left = rotateBtnStartPosition.x + 'px';
    btnRotate.current.style.top = rotateBtnStartPosition.y + 'px';

    document.removeEventListener('mousemove', rotate);
    document.removeEventListener('mouseup', stopRotate);

    document.removeEventListener('touchmove', rotate);
    document.removeEventListener('touchend', stopRotate);

    R2D.scene.history.saveState();

    dispatch(changeUndoRedo());
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', rotate);
      document.removeEventListener('mouseup', stopRotate);
      document.removeEventListener('touchmove', rotate);
      document.removeEventListener('touchend', stopRotate);
    };
  }, []);

  const classes = useStyle();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.3 }}
      transformTemplate={({ scale }) => `translateX(-50%) scale(${scale})`}
      className={classes.info_model_btn}
      style={
        addStyles
          ? { ...addStyles, left: positionBtn.x, top: positionBtn.y }
          : { left: positionBtn.x, top: positionBtn.y }
      }
      ref={btnRotate}
    >
      <HoverComponent hoverText={translation['HINT_BUTTON_ROTATION']}>
        <img src="/src_designer/images/icon_rotate.svg" />
        <div
          className={classes.info_model_btn_overlay}
          onMouseDown={startRotate}
          onTouchStart={startRotate}
        ></div>
      </HoverComponent>
    </motion.div>
  );
};

