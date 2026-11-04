import React, { forwardRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../../initR2D';
import { changeUndoRedo } from '../../../redux/features/topPanel/topPanelSlice';
import Tooltip from '../../../shared-components/Tooltip';
import { useTranslation } from '../../../api/hooks/useTranslation';

const useStyle = createUseStyles({
  info_model_btn: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'var(--color-white)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    transform: 'translateX(-50%)',
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
});

export const MoveRef = forwardRef(
  ({ hide, show, changePosition, positionBtn, type, addData }, ref) => (
    <Move
      hide={hide}
      show={show}
      type={type}
      positionBtn={positionBtn}
      changePosition={changePosition}
      addData={addData}
      reference={ref}
    />
  )
);

const Move = (props) => {
  const positionBtn = props.positionBtn;
  let mouseDown = false;

  let restBtY = null;
  let restBtX = null;

  const dispatch = useDispatch();
  const translation = useTranslation();
  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';
  const { btnMove, mainDiv } = props.reference.current;

  function startMove(event) {
    mouseDown = true;
    props.hide();

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', endMove);

    document.addEventListener('touchmove', move);
    document.addEventListener('touchend', endMove);

    const viewportOffset = btnMove.current.getBoundingClientRect();
    const top = viewportOffset.top;
    const left = viewportOffset.left;

    if (props.type == 'logoMesh') {
      R2D.scene.currentView3DObject.logoEditor.startMoveLogo(
        !isCurrDeviceAPhone ? event.clientX : event.touches[0].clientX,
        !isCurrDeviceAPhone ? event.clientY : event.touches[0].clientY
      );
    } else {
      !isCurrDeviceAPhone
        ? planner.scene.startMoveCurrentMaterial(event.clientX, event.clientY)
        : planner.scene.startMoveCurrentMaterial(
            event.touches ? event.touches[0].clientX : event.clientX,
            event.touches ? event.touches[0].clientY : event.clientY
          );
    }

    if (event.touches && event.touches.length) {
      restBtX = event.touches[0].clientX - left - 16;
      restBtY = event.touches[0].clientY - top;
    } else {
      restBtX = event.clientX - left - 16;
      restBtY = event.clientY - top;
    }
  }

  function move(event) {
    if (!mouseDown || !mainDiv.current) return;
    if (event.touches && event.touches.length) {
      mainDiv.current.style.left = event.touches[0].clientX - restBtX - positionBtn.x + 'px';
      mainDiv.current.style.top = event.touches[0].clientY - restBtY - positionBtn.y + 'px';
    } else {
      mainDiv.current.style.left = event.clientX - restBtX - positionBtn.x + 'px';
      mainDiv.current.style.top = event.clientY - restBtY - positionBtn.y + 'px';
    }
    if (props.type == 'logoMesh') {
      R2D.scene.currentView3DObject.logoEditor.moveLogo(
        !isCurrDeviceAPhone ? event.clientX : event.touches[0].clientX,
        !isCurrDeviceAPhone ? event.clientY : event.touches[0].clientY,
        props.addData
      );
    } else {
      !isCurrDeviceAPhone
        ? planner.scene.moveCurrentMaterial(event.clientX, event.clientY)
        : planner.scene.moveCurrentMaterial(
            event.touches ? event.touches[0].clientX : event.clientX,
            event.touches ? event.touches[0].clientY : event.clientY
          );
    }
  }

  function endMove(e) {
    props.show();
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', endMove);

    document.removeEventListener('touchmove', move);
    document.removeEventListener('touchend', endMove);

    if (mainDiv.current)
      props.changePosition({
        x: mainDiv.current?.style.left.replace('px', ''),
        y: mainDiv.current?.style.top.replace('px', ''),
      });

    if (props.type == 'logoMesh') {
      R2D.scene.currentView3DObject.logoEditor.stopMoveLogo();
    } else {
      planner.scene.stopMoveCurrentMaterial();
    }

    dispatch(changeUndoRedo());
    mouseDown = false;
  }

  const classes = useStyle();

  return (
    <Tooltip content={translation['HINT_BUTTON_MOVE_TEXTURE']} side="bottom">
      <div
        className={classes.info_model_btn}
        ref={btnMove}
        style={{ top: positionBtn.y + 'px', left: positionBtn.x + 'px' }}
        onMouseDown={startMove}
        onTouchStart={startMove}
      >
        <img src="/src_designer/images/icon_move_x_y.svg" />
      </div>
    </Tooltip>
  );
};
