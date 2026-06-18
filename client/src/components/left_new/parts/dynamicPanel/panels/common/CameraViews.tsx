import { IconFileSymlink, IconTrash } from '@tabler/icons-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { planner, user } from '../../../../../../initR2D';
import {
  changeActivePano,
  selectActivePano,
  selectRenderMakeState,
  updatePreloaderStatus,
  updateRenderMakeState,
} from '../../../../../../redux/features/common/commonSlice';
import { selectActiveControlPanelModeData } from '../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import Navigation from '../../navigation/Navigation';

const useStyle = createUseStyles({
  plannerRenderCont: {
    top: '0',
    left: '0',
    width: 300,
    height: '100%',
    position: 'absolute',
    background: '#fff',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
    borderRight: '1px solid #cdcdcd',
  },
  plannerRenderWrap: {
    height: '100%',
    background: '#fff',
    padding: '20px 14px',
    display: 'grid',
    gridGap: 30,
    alignContent: 'space-between',
  },
  plannerRenderWrap_onRenderMake: {
    position: 'relative',
    height: '100%',
    '&::before': {
      content: "''",
      width: '100%',
      height: '100%',
      position: 'fixed',
      left: 0,
      top: 0,
      background: 'rgba(0, 0, 0, .8)',
      zIndex: 3,
    },
  },
  plannerRenderWrap_top: {
    '& h1': {
      fontSize: 16,
      fontWeight: 400,
      color: '#373737',
      marginBottom: 15,
    },
  },
  plannerRender_button: {
    color: '#fff',
    cursor: 'pointer',
    height: '35px',
    display: 'flex',
    padding: '5px 9px',
    fontSize: '14px',
    background: '#66ABF3',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    alignItems: 'center',
    borderRadius: '3px',
    justifyContent: 'center',
    '&:hover': {
      background: '#5592d3',
    },
  },
  plannerRenderWrap_views_wr: {
    position: 'relative',
    marginBottom: 20,
    display: 'flex',
    justifyContent: 'center',
    height: 118,
    border: '1px solid #ebebeb',
    '& span': {
      width: '100%',
      display: 'flex!important',
      justifyContent: 'center',
    },
    '&:after': {
      content: "' '",
      top: '0%',
      left: '0%',
      width: 'calc(100% - 3px)',
      border: '1px solid #fff',
      height: 'calc(100% - 2px)',
      position: 'absolute',
      pointerEvents: 'none',
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
      boxShadow: 'inset 0px 0px 0px 3px #9dd900',
      opacity: 0,
    },
    '& $plannerRenderWrap_views_buttons': {
      width: 80,
    },
    '&:hover': {
      '& $plannerRenderWrap_views_info': {
        opacity: 1,
      },
      '&:after': {
        opacity: 1,
      },
    },
  },
  plannerRenderWrap_views_img: {
    height: '100%',
    objectFit: 'cover',
    width: '100%',
  },
  plannerRenderWrap_views_info: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, .7)',
    height: '100%',
    display: 'flex',
    opacity: 0,
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  plannerRenderWrap_views_buttons: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'space-between',
  },
  plannerRenderWrap_views_btn: {
    position: 'relative',
    cursor: 'pointer',
    '&:hover line': {
      fill: '#ffd119',
    },
    '&:hover rect': {
      fill: '#ffd119',
    },
    '&:hover path:not(.path_not_anim)': {
      fill: '#ffd119',
    },
    '&:hover': {
      '& $plannerRenderWrap_views_btn_text': {
        opacity: 1,
      },
    },
  },
  plannerRenderWrap_views_btn_icon: {
    width: 26,
    height: 26,
    '& path': {
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
  },
  plannerRenderWrap_views_btn_text: {
    position: 'absolute',
    top: 'calc(100% + 2px)',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 14,
    color: '#ffd119',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    opacity: 0,
  },
  plannerRenderWrap_views: {
    marginTop: 20,
  },
});

const CameraViews = () => {
  const classes = useStyle();

  const translation = useTranslation();
  const activePano = useSelector(selectActivePano);
  const renderMakeState = useSelector(selectRenderMakeState);

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;

  const dispatch = useDispatch();

  const cameraFOV =
    planner.mih()._currentViewer.getCameraFOV && planner.mih()._currentViewer.getCameraFOV();
  const clipping = planner.scene.getDistFromCameraToPlane(
    R2D.Viewers.getCurrentViewerType() == 'walk' ? 'viewWalk' : 'view3d'
  );

  const [cameraViews, setCameraViews] = useState([]);

  const [cameraViewsArray, setCameraViewsArray] = useState(null);
  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

  const mainWrap = useRef(null);
  const mainDiv = useRef(null);

  const onSaveCameraView = async (e) => {
    if (!user.isLogged()) dispatch(setActivePopup({ name: 'login' }));
    else {
      if (
        R2D.controller.getProjectId() == 0 ||
        R2D.controller.getProjectUserKey() != user.getKey()
      ) {
        dispatch(setActivePopup({ name: 'alert', data: 'TEXT_CAMERA_VIEWS_SAVE_BEFORE' }));
        return;
      } else {
        dispatch(updatePreloaderStatus(true));
        const response = await user.cameraViews_save({
          preview: planner.scene.makeRenderScreenShot(),
          config: {
            ...R2D.Viewers.getCameraData(),
            fov: cameraFOV,
            clipping,
            pano: activePano,
            renderMakeType: renderMakeState.type,
            renderMakeScreen: renderMakeState.screen,
          },
          plan_entity_id: R2D.controller.getProjectId(),
        });
        if (!response || response?.type == 'error') {
          dispatch(setActivePopup({ name: 'alert', data: response.data }));
        } else await updateCameraViews();
        dispatch(updatePreloaderStatus(false));
      }
    }
  };

  const onDeleteCameraView = async (id) =>
    dispatch(setActivePopup({ name: 'confirm', type: 'cameraView_delete', data: id }));

  const onApplyCamera = async (id) => {
    const cameraView = cameraViews.find((i) => i.id == id);
    dispatch(
      updateRenderMakeState({
        type: cameraView.config.renderMakeType,
        screen: cameraView.config.renderMakeScreen,
        fromApply: true,
      })
    );

    if (
      cameraView.config.renderMakeType == 'topView' ||
      cameraView.config.renderMakeType == 'exterior'
    ) {
      if (planner.mih()._currentViewer != R2D.view3d) planner['view3d'].activate();
      planner.mih()._currentViewer.setRenderMakeType(cameraView.config.renderMakeType);
    }
    if (cameraView.config.renderMakeType == 'interior') {
      planner['viewWalk'].activate();
      planner.mih()._currentViewer.hideCursor();
    }

    planner.mih()._currentViewer.changeIsRenderStateActive(true);
    R2D.Viewers.changeRenderScreenType(cameraView.config.renderMakeScreen);

    R2D.Viewers.setCameraData({
      fov: cameraView.config.fov,
      anchor: {
        x: cameraView.config.anchor.x,
        y: cameraView.config.anchor.y,
        z: cameraView.config.anchor.z,
      },
      distance: cameraView.config.distance,
      pan: cameraView.config.pan,
      tilt: cameraView.config.tilt,
      position: cameraView.config.position,
      rotation: cameraView.config.rotation,
    });

    if (cameraView.config.renderMakeType == 'topView') R2D.view3d.coversTitleViewer3D.update();

    if (cameraView.config.renderMakeType != 'topView') {
      planner.scene.onClipping();
      planner.scene.setDistFromCameraToPlane(cameraView.config.clipping);
    } else planner.scene.offClipping();

    await R2D.scene.setSavedPanoData(cameraView.config.pano.id, cameraView.config.pano.rotation);

    dispatch(changeActivePano(cameraView.config.pano));
  };

  const updateCameraViews = async () => {
    const views = await user.cameraViews_load(R2D.controller.getProjectId());
    if (!views || views?.type == 'error') setCameraViews([]);
    else setCameraViews(views);
    dispatch(updatePreloaderStatus(false));
  };

  useEffect(() => {
    if (!cameraViews) return;
    const viewsArray = [];
    cameraViews.length > 0 &&
      cameraViews.forEach &&
      cameraViews.forEach((item) => {
        viewsArray.push(
          <div className={classes.plannerRenderWrap_views_wr} key={item.id}>
            <img
              data-src={R2D.URL.DOMAIN + item.previewUrl}
              src={R2D.URL.DOMAIN + item.previewUrl}
              className={classes.plannerRenderWrap_views_img + ' lazyload'}
            />
            <div className={classes.plannerRenderWrap_views_info}>
              <div className={classes.plannerRenderWrap_views_buttons}>
                <div
                  className={classes.plannerRenderWrap_views_btn}
                  onClick={() => onApplyCamera(item.id)}
                >
                  <IconFileSymlink size={25} color="#fff" />

                  <div className={classes.plannerRenderWrap_views_btn_text}>
                    {translation['BUTTON_OPEN_PLAN']}
                  </div>
                </div>
                <div
                  className={classes.plannerRenderWrap_views_btn}
                  onClick={(e) => onDeleteCameraView(item.id)}
                >
                  <IconTrash size={25} color="#fff" />
                  <div className={classes.plannerRenderWrap_views_btn_text}>
                    {translation['BUTTON_DELETE_PLAN']}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      });

    setCameraViewsArray(viewsArray);
  }, [cameraViews]);

  useEffect(() => {
    const keyTimeout = setTimeout(() => setStyleAnimation({ transform: 'translateX(0%)' }), 50);
    planner.scene.addEventListener(planner.scene.UPDATE_CAMERA_VIEWS, updateCameraViews);
    R2D.controller.getProjectId() &&
      R2D.controller.getProjectUserKey() == user.getKey() &&
      updateCameraViews();
    return () => {
      planner.scene.removeEventListener(planner.scene.UPDATE_CAMERA_VIEWS, updateCameraViews);
      clearTimeout(keyTimeout);
    };
  }, []);

  return (
    <div className={classes.plannerRenderCont} ref={mainDiv} style={styleAnimation}>
      <Navigation isHomeDisabled={true} disableBreadcrumbs={true} isAddSettingsDisabled={true} />

      <div className={classes.plannerRenderWrap} ref={mainWrap}>
        <div className={classes.plannerRenderWrap_top}>
          <h1>{translation['RENDER_CAMERA_VIEWS']}</h1>
          <div className={classes.plannerRender_button} onClick={onSaveCameraView}>
            {translation['RENDER_CAMERA_VIEWS_SAVE']}
          </div>
          <div className={classes.plannerRenderWrap_views}>{cameraViewsArray}</div>
        </div>
      </div>
    </div>
  );
};

export default CameraViews;
