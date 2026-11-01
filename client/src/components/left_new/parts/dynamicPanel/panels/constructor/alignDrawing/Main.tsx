import { IconDeviceFloppyFilled, IconTrash } from '@tabler/icons-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../../../../../../api/hooks/useTranslation';
import { planner } from '../../../../../../../initR2D';
import { changeImagePlanUploadType } from '../../../../../../../redux/features/constructor/constructorSlice';
import {
  changeActiveControlPanelMode,
  selectActiveControlPanelModeData,
  selectControlPanelData,
  selectPrevControlPanelMode,
  updateControlPanelStatus,
} from '../../../../../../../redux/features/control/controlPanelSlice';
import {
  selectPopupsLastClosedPopup,
  setActivePopup,
} from '../../../../../../../redux/features/popups/popupsSlice';
import { showTip } from '../../../../../../../redux/features/tips/tipsSlice';
import { setActiveViewMode } from '../../../../../../../redux/features/viewMode/viewModeSlice';

const useStyle = createUseStyles({
  planerWallsCont: {
    top: 0,
    left: 0,
    width: 309,
    height: '100%',
    display: 'grid',
    position: 'absolute',
    background: 'var(--color-white)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    borderRight: '1px solid var(--color-border-light)',
  },
  planerWallsWrap: {
    height: '100%',
    background: 'var(--color-white)',
  },
  planerConstItemWrap: {
    width: '100%',
  },
  planerConstItemText: {
    color: 'var(--color-text-slate)',
    fontSize: 14,
  },
  planerConstItem: {
    cursor: 'pointer',
    height: '72px',
    display: 'grid',
    gridTemplateColumns: '55px auto',
    padding: '0 28px',
    zIndex: 1,
    gridGap: '11px',
    position: 'relative',
    background: 'var(--color-white)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    alignItems: 'center',
    borderBottom: '1px solid var(--color-surface-muted)',
    '&:after': {
      top: '0',
      left: '0',
      width: '100%',
      height: '29px',
      content: '""',
      zIndex: -1,
      position: 'absolute',
      background: 'linear-gradient(to bottom, var(--color-surface-warm), transparent)',
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      background: 'var(--color-accent-soft)',
      '&:after': {
        opacity: 0,
      },
    },
  },
  planerConstItemImgWr: {
    width: '55px',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planerConstItemImg: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
  roll_out_right: {
    transform: 'translateX(100%)',
  },
});

const Main = (props) => {
  const classes = useStyle();
  const translation = useTranslation();
  const dispatch = useDispatch();
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const prevControlPanelMode = useSelector(selectPrevControlPanelMode);
  const lastClosedPopup = useSelector(selectPopupsLastClosedPopup);

  const controlPanelData = useSelector(selectControlPanelData);

  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

  const leaveAlignDrawing = (modeToChangeAfter) => {
    if (modeToChangeAfter) dispatch(setActiveViewMode(modeToChangeAfter));

    if (modeToChangeAfter == 'view3d' || modeToChangeAfter == 'view2d') {
      prevControlPanelMode
        ? dispatch(changeActiveControlPanelMode({ mode: prevControlPanelMode }))
        : dispatch(
            changeActiveControlPanelMode({
              mode: 'furniture',
              data:
                controlPanelData['furniture'].history.length < 1
                  ? {
                      type: 'catalog',
                      addType: 'main',
                      id: null,
                      lastSavedScroll: 0,
                      data: furnitureData,
                    }
                  : null,
            })
          );
    } else {
      dispatch(changeActiveControlPanelMode({ mode: 'constructor' }));
    }

    dispatch(updateControlPanelStatus(true));
    dispatch(showTip({ name: 'constructorButtons' }));
  };

  const onSave = (e) => {
    const modeToChangeAfter =
      WC.wallsEditor.state.getModeToChangeAfter && WC.wallsEditor.state.getModeToChangeAfter();
    const result = WC.wallsEditor.stopAlignDrawing(false);
    if (!result || result.state == 'error') {
      dispatch(setActivePopup({ name: 'alert', type: result?.type, data: result?.data }));
    } else {
      leaveAlignDrawing(modeToChangeAfter);
    }
  };

  const onDrawingRemoved = useRef(null);
  onDrawingRemoved.current = () => {
    const modeToChangeAfter = WC.wallsEditor.state.getModeToChangeAfter();
    WC.wallsEditor.changeState(WC.wallsEditor.stateEditing);
    R2D.commonSceneHelper.drawingHelper.state = null;
    dispatch(changeImagePlanUploadType(null));
    leaveAlignDrawing(modeToChangeAfter);
  };

  const onDelete = (e) => dispatch(setActivePopup({ name: 'confirm', type: 'image_plan_delete' }));

  const rightPanelData = useRef(null);

  const onSetImagePlanAreaPopup = (e) =>
    dispatch(setActivePopup({ name: 'setValueInput', type: 'setImagePlanArea' }));

  useEffect(() => {
    lastClosedPopup == 'imageUpload' && WC.wallsEditor.state.startRectAnimation();
  }, [lastClosedPopup]);

  useEffect(() => {
    R2D.Storage.load('r2d_uploadImagePopup') && WC.wallsEditor.state.startRectAnimation();
    setStyleAnimation({ transform: 'translateX(0%)' });
    planner.apiConstr.addEventListener(
      planner.apiConstr.SET_AREA_IMAG_PLAN_POPUP,
      onSetImagePlanAreaPopup
    );
    dispatch(
      changeImagePlanUploadType(
        R2D.commonSceneHelper.drawingHelper.state != null
          ? R2D.commonSceneHelper.drawingHelper.state
          : null
      )
    );
    const drawingRemovedListener = () => onDrawingRemoved.current();
    WC.wallsEditor.addEventListener(WC.DRAWING_REMOVED, drawingRemovedListener);
    return () => {
      planner.apiConstr.removeEventListener(
        planner.apiConstr.SET_AREA_IMAG_PLAN_POPUP,
        onSetImagePlanAreaPopup
      );
      WC.wallsEditor.removeEventListener(WC.DRAWING_REMOVED, drawingRemovedListener);
    };
  }, []);

  return (
    <div
      className={classes.planerWallsCont}
      ref={rightPanelData}
      style={styleAnimation || { transform: 'translateX(-100%)' }}
    >
      <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
        <div className={classes.planerWallsWrap}>
          <div className={classes.planerConstItemWrap}>
            <div className={classes.planerConstItem} onClick={onSave}>
              <div className={classes.planerConstItemImgWr}>
                <IconDeviceFloppyFilled
                  className={classes.planerConstItemImg}
                  color="#626262"
                  size={30}
                />
              </div>
              <p className={classes.planerConstItemText}>{translation['BUTTON_OK']}</p>
            </div>
            <div className={classes.planerConstItem} onClick={onDelete}>
              <div className={classes.planerConstItemImgWr}>
                <IconTrash className={classes.planerConstItemImg} color="#626262" size={30} />
              </div>
              <p className={classes.planerConstItemText}>{translation['HINT_BUTTON_DELETE']}</p>
            </div>
          </div>
        </div>
      </SimpleBar>
    </div>
  );
};

export default Main;
