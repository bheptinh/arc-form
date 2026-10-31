import { IconCheck, IconX } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { planner } from '../../../../../../initR2D';
import { selectIsProjectBelongToLoggedUser } from '../../../../../../redux/features/common/commonSlice';
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
import {
  selectUserProfileData,
  selectUserProjectActive,
} from '../../../../../../redux/features/user/userSlice';
import Lock from '../../../../../common/Lock';
import CloseModeBtn from '../common/CloseModeBtn';
import { useMerchantLogin } from '../../../../../../utils/useMerchantLogin';

const useStyle = createUseStyles({
  plannerWallsCont: {
    borderRight: '1px solid #cdcdcd',
    background: '#fff',
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
    background: '#fff',
    borderTop: '1px solid #C6C4C4',
    borderBottom: '1px solid #C6C4C4',
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
    background: '#FFFFFF',
    textAlign: 'center',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    alignItems: 'center',
    borderBottom: '1px solid #E9E9E9',
    '&:after': {
      top: '0',
      left: '0',
      width: '100%',
      height: '29px',
      content: '""',
      zIndex: -1,
      position: 'absolute',
      background: 'linear-gradient(to bottom, #F5F3F3, transparent)',
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      background: '#B8E11F',
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
    color: '#2F2F2F',
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
    color: '#2A3435',
  },
  plannerWallsWrap_button_cancel: {
    justifyContent: 'flex-start',
    border: '1px solid #000000',
    '& svg': {
      marginRight: 10,
    },
    '& p': {
      flex: 2,
      textAlign: 'center',
      color: '#2A3435',
    },
    '&:hover': {
      background: '#E9E9E9',
      color: '#ffffff',
    },
  },
  plannerWallsWrap_button_save: {
    background: '#fff',
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
      background: '#E9E9E9',
    },
  },
  plannerWallsWrap_button_save_ready: {
    justifyContent: 'flex-start',
    background: '#BBE521',
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
      color: '#2A3435',
    },
    '&:hover': {
      background: '#8fc32d',
    },
  },
  planner_lock_img: {
    '& > rect:first-child': {
      fill: 'transparent',
    },
  },
});

const Main = (props) => {
  const dispatch = useDispatch();
  const verifyEnabledMerchantLogin = useMerchantLogin();

  const isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);
  const userProjectActive = useSelector(selectUserProjectActive);
  const userData = useSelector(selectUserProfileData);
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
    if (
      userData.plan == 'pro' ||
      userData.plan == 'basic' ||
      (isProjectBelongToLoggedUser &&
        (userProjectActive.plan == 'pro' || userProjectActive.plan == 'basic'))
    ) {
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
    } else {
      R2D.OPTIONS.PRO_PLAN
        ? verifyEnabledMerchantLogin()
        : dispatch(setActivePopup({ name: 'payPro', type: 'user' }));
      return;
    }
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
              (userData.plan == 'pro' ||
              userData.plan == 'basic' ||
              (isProjectBelongToLoggedUser &&
                (userProjectActive.plan == 'pro' || userProjectActive.plan == 'basic'))
                ? classes.plannerWallsWrap_button_save_ready
                : '')
            }
            onClick={onSave}
          >
            {userData?.plan == 'pro' ||
            userData.plan == 'basic' ||
            (isProjectBelongToLoggedUser &&
              (userProjectActive.plan == 'pro' || userProjectActive.plan == 'basic')) ? (
              <IconCheck size={18} color="#2A3435" />
            ) : null}
            <p>{translation['UPLOAD_MODEL_TEXT_SAVE']}</p>
            {userData.plan == 'pro' ||
            userData.plan == 'basic' ||
            (isProjectBelongToLoggedUser &&
              (userProjectActive.plan == 'pro' || userProjectActive.plan == 'basic')) ? null : (
              <Lock
                additionalClass={classes.planner_lock}
                additionalImgClass={classes.planner_lock_img}
                tipPositionX={'right'}
                tipPositionY={'top'}
                upgradeBasic={true}
                upgradePro={true}
                textHover={'UPGRADE_YOUR_PLAN_TEXT'}
                parentClass={classes.plannerWallsWrap_button}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
