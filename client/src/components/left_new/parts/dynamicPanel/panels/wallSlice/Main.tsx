import { IconCheck, IconX } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { planner } from '../../../../../../initR2D';
import {
  changeActiveControlPanelMode,
  selectActiveControlPanelModeData,
  updateControlPanelStatus,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import {
  removeQuickPanel,
  showQuickPanelVisible,
} from '../../../../../../redux/features/quickPanels/quickPanelsSlice';
import { changeUndoRedo } from '../../../../../../redux/features/topPanel/topPanelSlice';
import CloseModeBtn from '../common/CloseModeBtn';

const useStyle = createUseStyles({
  plannerWallsCont: {
    borderRight: '1px solid var(--color-border-light)',
    background: 'var(--color-white)',
    height: '100%',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
    width: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    display: 'grid',
    gridTemplateRows: '1fr auto',
  },
  plannerWallsWrap: {
    overflow: 'hidden',
    height: '100%',
    position: 'relative',
    background: 'var(--color-white)',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
  },
  divideWallGrid: {
    marginBottom: 20,
  },
  item: {
    cursor: 'pointer',
    height: '72px',
    display: 'flex',
    padding: '0 28px',
    zIndex: 1,
    gridGap: '11px',
    position: 'relative',
    background: 'var(--color-white)',
    textAlign: 'center',
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
      background: 'linear-gradient(to bottom, var(--color-surface-subtle), transparent)',
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      background: 'var(--color-accent-soft)',
    },
  },
  item_img_wr: {
    width: '55px',
    height: '46px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& img': {
      maxWidth: '100%',
      maxHeight: '100%',
    },
  },
  plannerConstItemText: {
    color: 'var(--color-text)',
    fontSize: 14,
  },
  lockImg: {},
  plannerWallsWrap_bottom: {
    display: 'grid',
    padding: '14px',
    gridTemplateColumns: 'repeat(2, calc(50% - 4px))',
    gridGap: '8px',
  },
  plannerWallsWrap_button: {
    cursor: 'pointer',
    height: '35px',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 14,
    borderRadius: 3,
    padding: '0 10px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    minWidth: 120,
    border: 'none',
    outline: 'none',
    textTransform: 'uppercase',
    color: 'var(--color-slate)',
  },
  plannerWallsWrap_button_cancel: {
    justifyContent: 'flex-start',
    border: '1px solid var(--color-black)',
    '& svg': {
      marginRight: 10,
    },
    '& p': {
      flex: 2,
      textAlign: 'center',
      color: 'var(--color-slate)',
    },
    '&:hover': {
      background: 'var(--color-surface-muted)',
      color: 'var(--color-white)',
    },
  },
  plannerWallsWrap_button_save: {
    background: 'var(--color-white)',
    color: '#A7A7A7',
    border: '1px solid #A7A7A7',
    '& svg': {
      marginRight: 10,
      '& circle': {
        fill: 'none',
      },
      '& path, & rect': {
        fill: '#A7A7A7',
      },
    },
    '& div svg': {
      marginRight: 0,
      marginLeft: 10,
      display: 'block',
    },
    '&:hover': {
      background: 'var(--color-surface-muted)',
    },
  },
  plannerWallsWrap_button_save_ready: {
    justifyContent: 'flex-start',
    background: 'var(--color-accent-bright)',
    '& svg': {
      marginRight: 10,
      '& path, & rect': {
        fill: 'none',
      },
    },
    '& p': {
      flex: 2,
      textAlign: 'center',
      marginRight: 0,
      color: 'var(--color-slate)',
    },
    '&:hover': {
      background: 'var(--color-accent-hover)',
    },
  },
});

const Main = (props) => {
  const dispatch = useDispatch();

  const translation = useTranslation();
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;

  const [wasChanged, setWasChanged] = useState(
    R2D.scene.currentView3DObject?.getConstructorElementData()?.configData
  );
  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );
  const [closeAnimation, setCloseAnimation] = useState(true);

  let tileConfigurator = planner.scene.getConfigurator();
  const classes = useStyle();

  const onSplitVert = () => {
    tileConfigurator.splitVertListener();
    dispatch(changeUndoRedo());
    setWasChanged(true);
  };

  const onSplitHor = () => {
    tileConfigurator.splitHorListener();
    dispatch(changeUndoRedo());
    setWasChanged(true);
  };

  const onClear = () =>
    wasChanged
      ? dispatch(setActivePopup({ name: 'confirm', type: 'clearSplitedWall' }))
      : onClearWall();

  const onClearWall = (e) => {
    tileConfigurator.clearListener();
    dispatch(changeUndoRedo());
    setWasChanged(false);
  };

  const onSave = () => {
    if (!planner.mih()._scene.currentView3DObject) return;
    const dw = planner.mih()._scene.currentView3DObject.getConstructorElementData();
    const configData = tileConfigurator.getData();
    if (configData.areas.length == 1) {
      dw.configData = null;
    } else {
      dw.configData = configData;
    }

    dw.changed = true;
    dw.build3D();
    dw.dispatchUpdate();
    R2D.scene.currentPartNum = wasChanged ? 1 : -1;
    R2D.scene.history.saveState();

    tileConfigurator.destroy();
    tileConfigurator = null;

    planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
    dispatch(updateControlPanelStatus(true));
    dispatch(showQuickPanelVisible({ name: 'helper' }));
    dispatch(changeActiveControlPanelMode({ mode: 'selectedWall', data: { type: 'main' } }));
  };

  const onCancel = (e) => {
    dispatch(removeQuickPanel({ name: 'delete' }));
    tileConfigurator.destroy();
    tileConfigurator = null;
    dispatch(updateControlPanelStatus(true));
    planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
    dispatch(showQuickPanelVisible({ name: 'helper' }));
    dispatch(changeActiveControlPanelMode({ mode: 'selectedWall', data: { type: 'main' } }));
    setCloseAnimation(false);
  };

  useEffect(() => {
    setStyleAnimation({ transform: 'translateX(0%)' });
    planner.apiScene.addEventListener(planner.apiScene.CLEAR_WALL_EVENT, onClearWall);
    return () =>
      planner.apiScene.removeEventListener(planner.apiScene.CLEAR_WALL_EVENT, onClearWall);
  }, []);

  return (
    <div>
      <CloseModeBtn
        statusVisible={closeAnimation}
        customStyles={{ zIndex: 3 }}
        onCloseMode={onCancel}
      />

      <div className={classes.plannerWallsCont} style={styleAnimation}>
        <div className={classes.plannerWallsWrap}>
          <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
            <div className={classes.divideWallGrid}>
              <div className={classes.item} onClick={onSplitHor}>
                <div className={classes.item_img_wr}>
                  <img src="/src_designer/images/icon_wall_x.svg" />
                </div>
                <p className={classes.plannerConstItemText}>
                  {translation['TILE_CONFIG_SPLIT_HORIZONTAL']}
                </p>
              </div>
              <div className={classes.item} onClick={onSplitVert}>
                <div className={classes.item_img_wr}>
                  <img src="/src_designer/images/icon_wall_y.svg" />
                </div>
                <p className={classes.plannerConstItemText}>
                  {translation['TILE_CONFIG_SPLIT_VERTICAL']}
                </p>
              </div>
              <div className={classes.item} onClick={onClear}>
                <div className={classes.item_img_wr}>
                  <img src="/src_designer/images/icon_clear.svg" />
                </div>
                <p className={classes.plannerConstItemText}>
                  {translation['TILE_CONFIG_CLEAR_ALL']}
                </p>
              </div>
            </div>
          </SimpleBar>
        </div>
        <div className={classes.plannerWallsWrap_bottom}>
          <div
            className={
              classes.plannerWallsWrap_button + ' ' + classes.plannerWallsWrap_button_cancel
            }
            onClick={onCancel}
          >
            <IconX size={24} color="#2F2F2F" />
            <p>{translation['UPLOAD_MODEL_TEXT_CANCEL']}</p>
          </div>
          <div
            className={
              classes.plannerWallsWrap_button +
              ' ' +
              classes.plannerWallsWrap_button_save +
              ' ' +
              classes.plannerWallsWrap_button_save_ready
            }
            onClick={onSave}
          >
            <IconCheck size={18} color="#2A3435" />
            <p>{translation['UPLOAD_MODEL_TEXT_SAVE']}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
