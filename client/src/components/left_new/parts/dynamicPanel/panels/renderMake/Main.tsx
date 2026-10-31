import 'simplebar-react/dist/simplebar.min.css';

import {
  IconArrowsMoveVertical,
  IconCameraFilled,
  IconHelpHexagonFilled,
  IconX,
} from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { createRender, rendersInfiniteQueryOptions } from '../../../../../../api/renders';
import { planner, user } from '../../../../../../initR2D';
import {
  changeActivePano,
  selectActivePano,
  selectRenderMakeState,
} from '../../../../../../redux/features/common/commonSlice';
import { selectWallsHeight } from '../../../../../../redux/features/constructor/constructorSlice';
import {
  changeActiveControlPanelMode,
  controlPanelHistoryAdd,
  controlPanelUpdateBreadCrumbs,
  selectActiveControlPanelModeData,
  selectControlPanelData,
  selectPrevControlPanelMode,
  updateControlPanelStatus,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import { saveLoggedStatus, setProfileData } from '../../../../../../redux/features/user/userSlice';
import { selectActiveViewMode } from '../../../../../../redux/features/viewMode/viewModeSlice';
import ChangeSize from '../../../../../common/ChangeSize';

const useStyle = createUseStyles({
  renderMakeCont: {
    borderRight: '1px solid #cdcdcd',
    background: '#fff',
    height: '100%',
    width: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
    display: 'grid',
    gridTemplateRows: '1fr auto',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  plannerRenderCont: {
    overflow: 'hidden',
    height: '100%',
    position: 'relative',
    background: '#fff',
    borderBottom: '1px solid #C6C4C4',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  plannerRenderWrap: {
    height: '100%',
    background: '#fff',
    padding: '14px',
    overflow: 'hidden',
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
  title: {
    fontSize: '18px',
    color: '#373737',
    marginBottom: 13,
    fontWeight: 300,
    letterSpacing: '-1px',
  },

  viewItemStandart: {
    width: '100%',
    height: 100,
    borderRadius: 6,
    border: '1px solid #cdcdcd',
    position: 'relative',
    zIndex: 1,
    display: 'grid',
    alignItems: 'center',
    justifyContent: 'center',
    justifyItems: 'center',
    alignContent: 'center',
    gridGap: 7,
    cursor: 'pointer',
    marginBottom: 20,
    backgroundSize: 'cover',
    '& path': {
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      border: '1px solid #9DD900',
      '& path': {
        fill: '#ffd119',
      },
    },
  },
  changeSizeWr: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 13,
    marginBottom: 15,
  },
  changeSizeWrInputs: {
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 10,
    width: '66%',
  },
  arrowDown: {
    transform: 'rotate(-90deg)',
    cursor: 'pointer',
    '& path': {
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      '& path': {
        fill: '#a0a0a0',
      },
    },
  },
  changeHeightWr: {
    height: 220,
    position: 'relative',
  },
  changeHeightLine: {
    width: 1,
    background: '#cdcdcd',
    height: '100%',
    position: 'absolute',
    left: '50%',
    top: 0,
  },
  changeHeightLineActive: {
    width: 1,
    background: '#9DD900',
    height: 85,
    position: 'absolute',
    left: 0,
    bottom: 0,
  },
  changeHeightIconWr: {
    right: 'calc(50% + 2px)',
    position: 'absolute',
    display: 'flex',
  },
  changeHeightIcon: {
    cursor: 'pointer',
    transform: 'rotateY(180deg)',
    position: 'relative',
    zIndex: '3',
  },
  changeHeightIconRotate: {
    position: 'absolute',
    right: 'calc(100% + 42px)',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
  },
  changeHeightIconArea: {
    top: '50%',
    right: '-10px',
    position: 'absolute',
    transform: 'translateY(-50%)',
  },
  choiseRenderWr: {
    border: 'none',
    marginTop: 20,
  },
  choiseRenderBtn: {
    display: 'flex',
    justifyContent: 'space-between',
    border: '1px solid #cdcdcd',
    padding: 10,
    marginBottom: 10,
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    cursor: 'pointer',
    borderRadius: 3,
    position: 'relative',
    zIndex: 1,
    '&:after': {
      top: '0',
      left: '0',
      width: 'calc(100%)',
      height: '100%',
      content: '""',
      zIndex: 1,
      position: 'absolute',
      boxShadow: 'inset 0 0 0 0px #BAE51F',
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
      pointerEvents: 'none',
    },
    '&:hover': {
      background: '#E9E9E9',
    },
  },
  choiseRenderBtn_active: {
    background: '#fff',
    pointerEvents: 'none',
    border: '1px solid #BAE51F',
    '&:after': {
      boxShadow: 'inset 0 0 0 2px #BAE51F',
    },
  },
  choiseRenderRadio: {
    position: 'relative',
    color: '#373737',
    fontWeight: '700',
    fontSize: 16,
    alignItems: 'center',
    userSelect: 'none',
    display: 'flex',
    '& span': {
      color: '#828282',
      fontSize: 13,
      display: 'block',
      padding: '0 5px',
    },
    '& svg': {
      cursor: 'pointer',
    },
  },
  choiseRenderExempleBtn: {
    color: '#66ACF4',
    textDecoration: 'underline',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  startRenderIcon: {
    width: 36,
    marginRight: 7,
  },
  plannerRender_button: {
    background: '#66ABF3',
    color: '#fff',
    cursor: 'pointer',
    height: '35px',
    display: 'flex',
    padding: '5px 9px',
    fontSize: '14px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    alignItems: 'center',
    borderRadius: '3px',
    justifyContent: 'center',
    '&:hover': {
      background: '#5592d3',
    },
  },
  renderMake_button: {
    color: '#2A3435',
    border: 'none',
    cursor: 'pointer',
    height: '35px',
    display: 'inline-flex',
    outline: 'none',
    padding: '0 10px',
    fontSize: '14px',
    minWidth: '120px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    alignItems: 'center',
    borderRadius: '3px',
    textTransform: 'uppercase',
    justifyContent: 'center',
  },
  renderMake_button_main: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  renderMake_button_cancel: {
    border: '1px solid #000000',
    justifyContent: 'flex-start',
    '& svg': {
      marginRight: 10,
    },
    '& p': {
      flex: 2,
      color: '#2A3435',
      textAlign: 'center',
    },
    '&:hover': {
      background: '#E9E9E9',
      color: '#ffffff',
    },
  },
  renderMake_button_cancel_disable: {
    '&:hover': {
      cursor: 'default',
      border: '1px solid #000000',
      background: 'transparent',
      color: '#000000',
      '& svg path': {
        fill: '#000000',
      },
    },
  },
  renderMake_button_save: {
    justifyContent: 'flex-start',
    background: '#BBE521',
    '& svg': {
      marginRight: 10,
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
  renderMake_buttons: {
    display: 'grid',
    padding: '14px',
    gridGap: '8px',
    gridTemplateColumns: 'repeat(2, calc(50% - 4px))',
  },
  renderMake_button_save_ready: {},
  renderMake_button_save_disabled: {
    border: '1px solid #999999',
    background: '#cccccc',
    color: '#666666',
    pointerEvents: 'none',
    '&:hover': {
      border: '1px solid #999999',
      background: '#cccccc',
    },
  },
  planner_popup_close: {
    width: 20,
    height: 20,
    position: 'absolute',
    top: 8,
    right: 8,
    cursor: 'pointer',
    zIndex: '2',
    '& path': {
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover': {
      '& path': {
        fill: '#BAE51F',
      },
    },
  },
  planner_popup_close_icon: {
    width: '100%',
  },
});

const Main = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const renderMutation = useMutation({ mutationFn: createRender });

  user.renderPostFn = async (body: string) => {
    const result = await renderMutation.mutateAsync(body);
    queryClient.invalidateQueries({ queryKey: rendersInfiniteQueryOptions.queryKey });
    return result;
  };

  const translation = useTranslation();
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const controlPanelData = useSelector(selectControlPanelData);
  const activePano = useSelector(selectActivePano);
  const activeViewMode = useSelector(selectActiveViewMode);
  const prevControlPanelMode = useSelector(selectPrevControlPanelMode);
  const renderMakeState = useSelector(selectRenderMakeState);
  const wallsHeight = useSelector(selectWallsHeight);

  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );
  const [cameraHeight, setCameraHeight] = useState(null);
  const [cameraFOV, setCameraFOV] = useState(null);
  const [clipping, setClipping] = useState(0);
  const [cameraVerAngle, setCameraVerAngle] = useState(0);
  const [cameraIconHeight, setCameraIconHeight] = useState(0);
  const [cameraRatio, setCameraRatio] = useState(null);
  const [cameraIconMaxTopOffset, setCameraIconMaxTopOffset] = useState(null);
  const [activeFormat, setActiveFormat] = useState(3);
  const [preloadActive, setPreloadActive] = useState(false);
  const [mouseDown, setMouseDown] = useState({ status: false, action: null });
  const [maxCameraHeight, setMaxCameraHeight] = useState(0);

  const renderBackground = useRef(null);

  const cameraIcon = useRef(null);
  const cameraIconDiv = useRef(null);
  const mainWrap = useRef(null);
  const mainDiv = useRef(null);

  const activeIntId = planner.renders.activeIntId;

  const minFOV = 20;
  const maxFOV = 120;

  const minVerAngle = -57;
  const maxVerAngle = 83;

  const minClipping = 1;
  const maxClipping = 300;

  let mouseDownIcon = false;
  let infoText, timeoutId;
  const minCameraHeight = 0;

  const onScreenshotMake = (e) => {
    const link = document.createElement('a');
    link.setAttribute('href', planner.scene.makeRenderScreenShot());
    link.setAttribute('download', 'screenshot.jpg');
    link.click();
  };

  const changeFormatActive = (num) => setActiveFormat(num);

  const onClickRenderBtn = async () => {
    if (preloadActive || activeFormat === null) return;

    // GTM
    window.dataLayer?.push({ event: 'click_start_render' });

    if (activeFormat === 0) {
      onScreenshotMake();
      return;
    }

    setPreloadActive(true);

    const newRenderId = await user.makeRender({ type: activeFormat, environment: null });

    if (newRenderId?.type == 'error') {
      setPreloadActive(false);
      return dispatch(setActivePopup({ name: 'alert', data: newRenderId.data }));
    }

    dispatch(setActivePopup({ name: 'renderMade' }));

    const responseIsLogged = await user.checkIsLogged();
    if (responseIsLogged.type == 'error') {
      setPreloadActive(false);
      return dispatch(setActivePopup({ name: 'alert', data: responseIsLogged.data }));
    } else dispatch(saveLoggedStatus(responseIsLogged));

    const responseProfileData = await user.loadProfileData();
    if (responseProfileData.type == 'error') {
      setPreloadActive(false);
      return dispatch(setActivePopup({ name: 'alert', data: responseProfileData.data }));
    } else dispatch(setProfileData(responseProfileData));

    setPreloadActive(false);

    if (activeIntId) {
      clearInterval(activeIntId);
      planner.renders.activeIntId = null;
    }

    planner.renders.inProgressIds.push(newRenderId);

    const key = setInterval(async () => {
      const inProgressIds = planner.renders.inProgressIds;
      if (inProgressIds.length < 1) {
        clearInterval(key);
        planner.renders.activeIntId = null;
        return;
      }
      const result = await queryClient.fetchQuery(rendersInfiniteQueryOptions);
      const items = result.pages[0]?.items ?? [];
      items.forEach((item) => {
        inProgressIds.forEach((renderId) => {
          if (item.renderId == renderId && (item.status == 'stored' || item.status == 'error')) {
            planner.apiScene.dispatchEvent(
              new Event(planner.apiScene.RENDERS_UPDATE, {
                renders: items,
                status: item.status,
              })
            );
            planner.renders.inProgressIds = inProgressIds.filter((i) => i != renderId);
          }
        });
      });
    }, 15000);

    planner.renders.activeIntId = key;
  };

  const onRenderClose = async (e) => {
    if (preloadActive) return;

    planner.scene.setDynamicPanelStatusToPrevState();
    R2D.Viewers.setCamerasDataToSaved();

    await R2D.scene.setSavedPanoData(
      R2D.viewWalk.getSavedPanoData().id,
      R2D.viewWalk.getSavedPanoData().rotation
    );

    const panorams = planner.getPanorams();
    const previewImgSrc =
      panorams.find((i) => i.id == R2D.viewWalk.getSavedPanoData().id)?.source.images.preview || '';
    dispatch(
      changeActivePano({
        id: R2D.viewWalk.getSavedPanoData().id,
        previewImgSrc,
        rotation: R2D.viewWalk.getSavedPanoData().rotation,
      })
    );
    R2D.Viewers.clearSavedPanoData();
    R2D.Viewers.clearSavedCameraData();

    R2D.mouseInteractionHelper.state.setIsSelectingModel &&
      R2D.mouseInteractionHelper.state.setIsSelectingModel(true);
    WC.wallsEditor.state.setIsSelectElementsActive &&
      WC.wallsEditor.state.setIsSelectElementsActive(true);

    planner.scene.offClipping();

    planner[activeViewMode].activate();

    R2D.view3d.changeIsRenderStateActive(false);
    R2D.viewWalk.changeIsRenderStateActive(false);
    R2D.view3d.setRenderMakeType('');
    planner.scene.showAllHiddenPartialVisibleElements();
    if (
      R2D.Viewers.getCurrentViewerType() == '3d' ||
      R2D.Viewers.getCurrentViewerType() == 'walk'
    ) {
      planner.scene.setDistFromCameraToPlane(20);
      planner.mih()._currentViewer.cameraMinHeightResetToDef &&
        planner.mih()._currentViewer.cameraMinHeightResetToDef();
      R2D.Viewers.getCurrentViewerType() == 'walk' && planner.mih()._currentViewer.showCursor();
    }
    R2D.Viewers.changeIsRenderActive(false);
    R2D.scene.checkSkybox();

    const furnitureData = planner.getCatalogProducts();
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

    dispatch(updateControlPanelStatus(true));
  };

  let startDragPosition = 0;

  const onCameraIconDown = (e) => {
    startDragPosition = e.clientY;
    document.addEventListener('mousemove', onMoveCameraIcon);
    document.addEventListener('mouseup', onStopMoveCameraIcon);
  };

  const updateHeightValue = (mouseDown, value) => {
    setMouseDown(mouseDown);
    value = value < 1 ? 0 : value;
    const maxCameraHeightValue =
      maxCameraHeight < minCameraHeight ? minCameraHeight : maxCameraHeight;
    value = value > maxCameraHeightValue ? maxCameraHeightValue : value;

    planner.mih()._currentViewer?.cameraMoveY && planner.mih()._currentViewer.cameraMoveY(value);
    const newCameraHeightValue = (value / cameraRatio - cameraIconMaxTopOffset) / -1;
    setCameraHeight(value);
    setCameraIconHeight(newCameraHeightValue);
  };

  const updateCameraAngle = (mouseDown, value) => {
    setMouseDown(mouseDown);
    value = value < minVerAngle ? minVerAngle : value;
    value = value > maxVerAngle ? maxVerAngle : value;

    planner.scene.setCameraVerAngleRad((+value * Math.PI) / 180);
    setCameraVerAngle(+value);
  };

  const updateFOVValue = (mouseDown, value) => {
    setMouseDown(mouseDown);
    value = value < minFOV ? minFOV : value;
    value = value > maxFOV ? maxFOV : value;

    if (planner.mih()._currentViewer.setCameraFOV) {
      planner.mih()._currentViewer.setCameraFOV(value);
      setCameraFOV(value);
    }
  };

  const updateClippingValue = (mouseDown, value) => {
    setMouseDown(mouseDown);

    value = value < minClipping ? minClipping : value;
    value = value > maxClipping ? maxClipping : value;

    planner.scene.setDistFromCameraToPlane(value);
    setClipping(value);
  };

  const onMoveCameraIcon = (e) => {
    const moveProgress = e.clientY - startDragPosition;
    let newCameraHeightValue = null;
    if (moveProgress < 0) {
      newCameraHeightValue = cameraIconHeight + moveProgress;
      newCameraHeightValue = newCameraHeightValue < 1 ? 0 : newCameraHeightValue;
    } else {
      newCameraHeightValue = cameraIconHeight + moveProgress;
      newCameraHeightValue =
        newCameraHeightValue > cameraIconMaxTopOffset
          ? cameraIconMaxTopOffset
          : newCameraHeightValue;
    }

    const newCameraHeight = (cameraIconMaxTopOffset - newCameraHeightValue) * cameraRatio;

    setCameraIconHeight(newCameraHeightValue);
    setCameraHeight(newCameraHeight);

    planner.mih()._currentViewer.cameraMoveY(newCameraHeight);
  };

  const onStopMoveCameraIcon = (e) => {
    document.removeEventListener('mousemove', onMoveCameraIcon);
    document.removeEventListener('mouseup', onStopMoveCameraIcon);
  };

  const onPanoChange = (e) => {
    document.querySelector('.product_hover') && document.querySelector('.product_hover').remove();
    dispatch(controlPanelHistoryAdd({ type: 'changePano' }));
    dispatch(controlPanelUpdateBreadCrumbs({ data: { type: 'changePano' }, updateType: 'add' }));
  };

  const changeVerticalCameraAngle = (e) => {
    if (!cameraIconDiv.current) return;
    if (e.data.degrees) {
      setCameraVerAngle(e.data.degrees);
    }
    if (e.data.position) {
      const maxCameraHeightVal =
        renderMakeState.type == 'interior' ? wallsHeight : R2D.view3d.getCameraMaxHeight();
      const cameraIconMaxTopOffset =
        cameraIconDiv.current.offsetHeight - cameraIcon.current.offsetHeight;
      const maxCameraHeightValue =
        maxCameraHeightVal < minCameraHeight ? minCameraHeight : maxCameraHeightVal;
      const cameraRatio = maxCameraHeightValue / cameraIconMaxTopOffset;

      setCameraHeight(e.data.position.y);
      const height = cameraIconMaxTopOffset - (e.data.position.y / cameraRatio).toFixed(0);
      if (height >= 0) {
        setCameraIconHeight(height);
      }
    }
  };

  const mouseEnterIcon = (e, text) => {
    if (!mouseDownIcon) {
      infoText = document.createElement('div');
      infoText.classList.add(classes.hoverDivIcon);
      infoText.textContent = text;
      document.querySelector('body').append(infoText);
      if (!infoText) return;
      infoText.style.right = window.innerWidth - e.clientX + 5 + 'px';
      infoText.style.top = e.clientY - 15 + 'px';
      timeoutId = setTimeout(() => (infoText.style.display = 'block'), 1000);
    }
  };

  //ROTATE
  let active = false;
  let [angle, setAngle] = useState(0);
  let center = { x: 0, y: 0 };

  const startRotateCameraIcon = (e) => {
    e.preventDefault();
    const bb = cameraIcon.current.getBoundingClientRect(),
      t = bb.top,
      l = bb.left,
      h = bb.height,
      w = bb.width;

    center = {
      x: l + w / 2,
      y: t + h / 2,
    };
    document.addEventListener('mousemove', rotateCameraIcon);
    document.addEventListener('mouseup', stopRotateCameraIcon);
    return (active = true);
  };

  const rotateCameraIcon = (e) => {
    if (!active) return;
    e.preventDefault();
    const x = e.clientX - center.x,
      y = e.clientY - center.y,
      d = (Math.atan2(y, x) * 180) / Math.PI;
    angle = d > 0 ? 180 - d : -(180 + d);
    angle = angle < minVerAngle ? minVerAngle : angle;
    angle = angle > maxVerAngle ? maxVerAngle : angle;
    planner.scene.setCameraVerAngleRad((angle * Math.PI) / 180);
    setCameraVerAngle(angle);
    return (cameraIcon.current.style.webkitTransform = `translateX(12px) rotate(${-angle}deg)`);
  };

  const stopRotateCameraIcon = (e) => {
    e.preventDefault();
    setAngle(angle);
    return (active = false);
  };

  const openCameraViews = (e) => {
    dispatch(controlPanelHistoryAdd({ type: 'cameraViews' }));
    dispatch(controlPanelUpdateBreadCrumbs({ data: { type: 'cameraViews' }, updateType: 'add' }));
  };

  const mouseMoveIcon = (e) => {
    if (!mouseDownIcon) {
      if (!infoText) return;
      infoText.style.right = window.innerWidth - e.clientX + 5 + 'px';
      infoText.style.top = e.clientY - 15 + 'px';
    }
  };

  const mouseLeaveIcon = (e) => {
    if (!mouseDownIcon) {
      clearTimeout(timeoutId);
      infoText && infoText.remove();
    }
  };

  const mouseUpDocument = (e) => {
    mouseDownIcon = false;
    infoText && infoText.remove();
    document.removeEventListener('mouseup', mouseUpDocument);
  };

  const onMouseDownIcon = (e) => {
    mouseLeaveIcon(e);
    document.addEventListener('mouseup', mouseUpDocument);
    mouseDownIcon = true;
  };

  const mouseEnter = (e) => {
    document.querySelector('.product_hover') && document.querySelector('.product_hover').remove();
    const product = e.target;
    const hoverWindow = document.createElement('div');
    hoverWindow.classList.add('product_hover');
    let panoName = '';
    if (activePano.id.indexOf && ~activePano.id.indexOf('#')) {
      panoName = activePano.id;
    } else {
      if (activePano.id == 'transparent') {
        panoName = translation['TRANSPARENT_BACKGROUND'];
      } else {
        const panoData = planner.getPanorams();
        panoName = panoData.find((i) => {
          if (!activePano.id && i.tags.includes('skybox_default')) {
            return i;
          } else {
            if (i.id == activePano.id) return i;
          }
        })?.name;
      }
    }
    hoverWindow.innerHTML = panoName;
    document.querySelector('body').append(hoverWindow);
    hoverWindow.style.left = product.getBoundingClientRect().left + product.offsetWidth - 20 + 'px';
    hoverWindow.style.top =
      product.getBoundingClientRect().top +
      (product.offsetHeight - hoverWindow.offsetHeight) / 2 +
      'px';
  };

  const mouseLeave = () =>
    document.querySelector('.product_hover') && document.querySelector('.product_hover').remove();

  useEffect(() => {
    if (!document.querySelector('.renderMake')) return;
    if (preloadActive) {
      mainWrap.current.classList.add(classes.plannerRenderWrap_onRenderMake);
      document.querySelector('.renderMake').classList.add('render_proceed');
      if (document.querySelector('.renderMake .viewer-body'))
        document.querySelector('.renderMake .viewer-body').style.zIndex = 0;
      mainDiv.current.style.border = 'none';
    } else {
      mainWrap.current.classList.remove(classes.plannerRenderWrap_onRenderMake);
      document.querySelector('.renderMake')?.classList.remove('render_proceed');
      if (document.querySelector('.renderMake .viewer-body'))
        document.querySelector('.renderMake .viewer-body').style.zIndex = 1;
      mainDiv.current.style.borderLeft = '1px solid #cdcdcd';
    }
  }, [preloadActive]);

  useEffect(() => {
    setTimeout(() => setStyleAnimation({ transform: 'translateX(0%)' }), 0);
    let cameraData =
      renderMakeState.type == 'topView' || renderMakeState.type == 'exterior'
        ? R2D.view3d.getCameraData()
        : R2D.viewWalk.getCameraData();
    if (renderMakeState.type == 'topView')
      cameraData = { ...cameraData, viewportTop: cameraData.viewportTop * 2 };
    const maxCameraHeightVal =
      renderMakeState.type == 'interior' ? wallsHeight : R2D.view3d.getCameraMaxHeight();

    setMaxCameraHeight(maxCameraHeightVal);
    setCameraHeight(cameraData?.viewportTop || cameraData.position.y);

    if (renderMakeState.type == 'interior')
      setClipping(
        planner.scene.getDistFromCameraToPlane(
          R2D.Viewers.getCurrentViewerType() == 'walk' ? 'viewWalk' : 'view3d'
        )
      );

    const cameraIconMaxTopOffset =
      cameraIconDiv.current.offsetHeight - cameraIcon.current.offsetHeight;
    const maxCameraHeightValue =
      maxCameraHeightVal < minCameraHeight ? minCameraHeight : maxCameraHeightVal;
    const cameraRatio = maxCameraHeightValue / cameraIconMaxTopOffset;

    setCameraVerAngle(planner.scene.getCameraVerAngle());
    setCameraFOV(
      (planner.mih()._currentViewer?.getCameraFOV && planner.mih()._currentViewer.getCameraFOV()) ||
        0
    );

    setCameraIconHeight(
      cameraIconMaxTopOffset -
        ((cameraData.viewportTop || cameraData.position.y) / cameraRatio).toFixed(0)
    );
    setCameraRatio(cameraRatio);
    setCameraIconMaxTopOffset(cameraIconMaxTopOffset);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      planner.scene.addEventListener(planner.scene.CAMERA_ROTATE, changeVerticalCameraAngle);
      planner.scene.addEventListener(planner.scene.CAMERA_ZOOM, changeVerticalCameraAngle);

      if (renderMakeState.fromApply) return;
      if (renderMakeState.type == 'topView' || renderMakeState.type == 'exterior') {
        if (renderMakeState.type == 'topView') {
          activeFormat == 5 && setActiveFormat(3);
        }
      }

      let cameraData =
        renderMakeState.type == 'topView'
          ? R2D.view3d.getSavedTopViewCameraData() || R2D.view2d.getSavedCameraData()
          : renderMakeState.type == 'exterior'
            ? R2D.view3d.getSavedExteriorCameraData() || R2D.view3d.getSavedCameraData()
            : R2D.viewWalk.getSavedInteriorCameraData() || R2D.viewWalk.getSavedCameraData();

      if (renderMakeState.type == 'topView') {
        cameraData = R2D.view3d.getSavedTopViewCameraData()
          ? cameraData
          : { ...cameraData, viewportTop: cameraData.viewportTop * 2 };
      }

      const maxCameraHeightVal =
        renderMakeState.type == 'interior' ? wallsHeight : R2D.view3d.getCameraMaxHeight();

      if (renderMakeState.type == 'topView' || renderMakeState.type == 'exterior')
        R2D.view3d.setCameraMinHeight(0);
      if (!cameraIconDiv.current) return;

      setMaxCameraHeight(maxCameraHeightVal);
      setCameraHeight(cameraData?.viewportTop || cameraData.position.y);

      renderMakeState.type != 'topView' &&
        setClipping(
          planner.scene.getDistFromCameraToPlane(
            R2D.Viewers.getCurrentViewerType() == 'walk' ? 'viewWalk' : 'view3d'
          )
        );

      const cameraIconMaxTopOffset =
        cameraIconDiv.current.offsetHeight - cameraIcon.current.offsetHeight;
      const maxCameraHeightValue =
        maxCameraHeightVal < minCameraHeight ? minCameraHeight : maxCameraHeightVal;
      const cameraRatio = maxCameraHeightValue / cameraIconMaxTopOffset;

      setCameraVerAngle(planner.scene.getCameraVerAngle());
      setCameraFOV(
        cameraData.fov ||
          (planner.mih()._currentViewer?.getCameraFOV &&
            planner.mih()._currentViewer.getCameraFOV()) ||
          0
      );

      setCameraIconHeight(
        cameraIconMaxTopOffset -
          ((cameraData.viewportTop || cameraData.position.y) / cameraRatio).toFixed(0)
      );
      setCameraRatio(cameraRatio);
      setCameraIconMaxTopOffset(cameraIconMaxTopOffset);

      R2D.scene.repositionSkybox();
    }, 100);

    return () => {
      planner.scene.removeEventListener(planner.scene.CAMERA_ROTATE, changeVerticalCameraAngle);
      planner.scene.removeEventListener(planner.scene.CAMERA_ZOOM, changeVerticalCameraAngle);
    };
  }, [renderMakeState]);

  return (
    <div className={classes.renderMakeCont}>
      <div className={classes.plannerRenderCont} ref={mainDiv} style={styleAnimation}>
        <SimpleBar
          style={{ height: '100%', background: '#ffffff' }}
          autoHide={false}
          forceVisible="y"
        >
          <div className={classes.plannerRenderWrap} ref={mainWrap}>
            <div>
              <div className={classes.title}>{translation['RENDER_PANO_CHOOSE']}</div>
              <div
                className={classes.viewItemStandart}
                ref={renderBackground}
                onMouseEnter={mouseEnter}
                onMouseLeave={mouseLeave}
                style={
                  activePano.id?.indexOf && ~activePano.id.indexOf('#')
                    ? { backgroundColor: activePano.id }
                    : {
                        backgroundImage: `url('${activePano.previewImgSrc ? R2D.URL.DOMAIN + activePano.previewImgSrc : '/src_designer/images/bg_sky.jpg'}')`,
                      }
                }
                onClick={onPanoChange}
              ></div>

              <div className={classes.changeSizeWr}>
                <div className={classes.changeSizeWrInputs}>
                  <ChangeSize
                    mouseDown={mouseDown}
                    changeValue={updateHeightValue}
                    value={
                      cameraHeight && planner.units.getName() == 'cm'
                        ? cameraHeight.toFixed(0)
                        : cameraHeight
                    }
                    label={translation['RENDER_CAMERA_HEIGHT']}
                    labelAfter={planner.units.getName()}
                    type={'style_1'}
                  />
                  {renderMakeState.type != 'topView' ? (
                    <ChangeSize
                      mouseDown={mouseDown}
                      revertedSign={true}
                      changeValue={updateCameraAngle}
                      lessThenZero={true}
                      notConvertToCurrentMetric={true}
                      value={cameraVerAngle && cameraVerAngle.toFixed(0) * -1}
                      label={translation['RENDER_CAMERA_ANGLE']}
                      labelAfter={'°'}
                      type={'style_1'}
                    />
                  ) : null}
                  {
                    <ChangeSize
                      mouseDown={mouseDown}
                      changeValue={updateFOVValue}
                      notConvertToCurrentMetric={true}
                      value={cameraFOV}
                      infoHover={translation['RENDER_ADVANCED_INFO_FOV']}
                      label={translation['RENDER_FIELD_OF_ VIEW']}
                      labelAfter={'°'}
                      type={'style_1'}
                    />
                  }
                  {renderMakeState.type != 'topView' ? (
                    <ChangeSize
                      mouseDown={mouseDown}
                      changeValue={updateClippingValue}
                      infoHover={translation['RENDER_ADVANCED_INFO_CLIPPING']}
                      value={clipping}
                      label={translation['RENDER_CLIPPING']}
                      labelAfter={planner.units.getName()}
                      type={'style_1'}
                    />
                  ) : null}
                </div>

                <div className={classes.changeHeightWr} ref={cameraIconDiv}>
                  <div className={classes.changeHeightLine}>
                    <div className={classes.changeHeightLineActive}></div>
                  </div>
                  <div
                    className={classes.changeHeightIconWr}
                    ref={cameraIcon}
                    style={{
                      top: cameraIconHeight + 'px',
                      transform: cameraVerAngle
                        ? `translateX(12px) rotate(${cameraVerAngle.toFixed(0) * -1}deg)`
                        : 'translateX(12px)',
                    }}
                  >
                    {/* TODO: Replace camera icon */}
                    <svg
                      className={classes.changeHeightIcon}
                      width="35"
                      height="35"
                      viewBox="0 0 35 35"
                      fill="none"
                      onMouseDown={onCameraIconDown}
                    >
                      <rect
                        x="7.61133"
                        y="10.2478"
                        width="6.9342"
                        height="15.8496"
                        rx="1"
                        transform="rotate(1.24049 7.61133 10.2478)"
                        fill="#2D8BDB"
                      />
                      <rect
                        x="14.9629"
                        y="13.8752"
                        width="1.4859"
                        height="8.9154"
                        rx="0.74295"
                        transform="rotate(1.24049 14.9629 13.8752)"
                        fill="#2D8BDB"
                      />
                      <rect
                        x="8.63477"
                        y="8.78369"
                        width="4.953"
                        height="0.9906"
                        rx="0.4953"
                        transform="rotate(1.24049 8.63477 8.78369)"
                        fill="#2D8BDB"
                      />
                      <rect
                        x="16.9551"
                        y="13.4232"
                        width="9.906"
                        height="9.906"
                        rx="1"
                        transform="rotate(1.24049 16.9551 13.4232)"
                        fill="#2D8BDB"
                      />
                      <rect
                        x="27.3633"
                        y="13.1531"
                        width="2.9718"
                        height="10.8966"
                        rx="1"
                        transform="rotate(1.24049 27.3633 13.1531)"
                        fill="#2D8BDB"
                      />
                    </svg>

                    {/* TODO: Replace icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={classes.changeHeightIconArea}
                      width="92"
                      height="91"
                      viewBox="0 0 92 91"
                      fill="none"
                    >
                      <mask
                        id="mask0_2290_2247"
                        style={{ maskType: 'alpha' }}
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="92"
                        height="91"
                      >
                        <circle cx="45.7227" cy="45.5" r="45.5" fill="#F3F3F3" />
                      </mask>
                      <g mask="url(#mask0_2290_2247)">
                        <path
                          d="M48.541 45.5L-6.42138 77.2325L-6.42138 13.7674L48.541 45.5Z"
                          fill="#F3F3F3"
                        />
                      </g>
                    </svg>
                    {renderMakeState.type != 'topView' ? (
                      <IconArrowsMoveVertical
                        size={18}
                        color="#2D8BDB"
                        className={classes.changeHeightIconRotate}
                        onMouseDown={startRotateCameraIcon}
                      />
                    ) : null}
                  </div>
                </div>
              </div>
              <div className={classes.plannerRender_button} onClick={openCameraViews}>
                {translation['RENDER_CAMERA_VIEWS']}
              </div>

              <fieldset className={classes.choiseRenderWr}>
                <div
                  className={
                    classes.choiseRenderBtn +
                    ' ' +
                    (activeFormat == 0 ? classes.choiseRenderBtn_active : '')
                  }
                  onClick={() => changeFormatActive(0)}
                >
                  <div className={classes.choiseRenderRadio}>
                    {translation['RENDER_SCREENSHOT']}
                  </div>
                </div>
                <div
                  className={
                    classes.choiseRenderBtn +
                    ' ' +
                    (activeFormat == 3 ? classes.choiseRenderBtn_active : '')
                  }
                  onClick={() => changeFormatActive(3)}
                >
                  <div className={classes.choiseRenderRadio}>
                    {translation['RENDER_FULL_HD']}
                    <span>1920x1080</span>
                    <IconHelpHexagonFilled
                      size={18}
                      color="#2D8BDB"
                      className={classes.changerMain_info}
                      onMouseDown={onMouseDownIcon}
                      onMouseEnter={(e) => mouseEnterIcon(e, translation['RENDER_EXAMPLES_TEXT'])}
                      onMouseMove={mouseMoveIcon}
                      onMouseLeave={mouseLeaveIcon}
                      onMouseUp={() =>
                        (typeof switch_image !== 'undefined' &&
                          switch_image &&
                          switch_image.length > 0 &&
                          dispatch(setActivePopup({ name: 'renderExample_big' }))) ||
                        dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }))
                      }
                    />
                  </div>
                </div>
                <div
                  className={
                    classes.choiseRenderBtn +
                    ' ' +
                    (activeFormat == 4 ? classes.choiseRenderBtn_active : '')
                  }
                  onClick={() => changeFormatActive(4)}
                >
                  <div className={classes.choiseRenderRadio}>
                    {translation['RENDER_4K']}
                    <span>3840x2160</span>
                    <IconHelpHexagonFilled
                      size={18}
                      color="#2D8BDB"
                      className={classes.changerMain_info}
                      onMouseDown={onMouseDownIcon}
                      onMouseEnter={(e) => mouseEnterIcon(e, translation['RENDER_EXAMPLES_TEXT'])}
                      onMouseMove={mouseMoveIcon}
                      onMouseLeave={mouseLeaveIcon}
                      onMouseUp={() =>
                        (typeof renders_2k_4k !== 'undefined' &&
                          renders_2k_4k &&
                          renders_2k_4k.length > 0 &&
                          dispatch(setActivePopup({ name: 'renderExample4k' }))) ||
                        dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }))
                      }
                    />
                  </div>
                </div>
                {renderMakeState.type != 'topView' ? (
                  <div
                    className={
                      classes.choiseRenderBtn +
                      ' ' +
                      (activeFormat == 5 ? classes.choiseRenderBtn_active : '')
                    }
                    onClick={() => changeFormatActive(5)}
                  >
                    <div className={classes.choiseRenderRadio}>
                      {translation['RENDER_360']}
                      <span>360</span>
                      <IconHelpHexagonFilled
                        size={18}
                        color="#2D8BDB"
                        className={classes.changerMain_info}
                        onMouseDown={onMouseDownIcon}
                        onMouseEnter={(e) => mouseEnterIcon(e, translation['RENDER_EXAMPLES_TEXT'])}
                        onMouseMove={mouseMoveIcon}
                        onMouseLeave={mouseLeaveIcon}
                        onMouseUp={() => {
                          if (
                            typeof images_360 !== 'undefined' &&
                            images_360 &&
                            images_360.length > 0
                          ) {
                            dispatch(setActivePopup({ name: 'renderExample_360' }));
                          } else {
                            dispatch(
                              setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' })
                            );
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : null}
              </fieldset>
            </div>
          </div>
        </SimpleBar>
      </div>

      <div className={classes.renderMake_buttons} style={preloadActive ? { zIndex: 4 } : undefined}>
        <div
          className={
            classes.renderMake_button +
            ' ' +
            classes.renderMake_button_cancel +
            ' ' +
            (preloadActive ? classes.renderMake_button_cancel_disable : '')
          }
          onClick={onRenderClose}
        >
          <IconX size={22} color="#2A3435" />
          <p>{translation['UPLOAD_MODEL_TEXT_CANCEL']}</p>
        </div>

        <div
          className={
            classes.renderMake_button +
            ' ' +
            classes.renderMake_button_save +
            ' ' +
            classes.renderMake_button_save_ready +
            (preloadActive ? ' ' + classes.renderMake_button_save_disabled : '')
          }
          style={preloadActive ? { justifyContent: 'center' } : undefined}
          onClick={onClickRenderBtn}
        >
          {preloadActive ? (
            <div className="preloader-cube_relative"></div>
          ) : (
            <div className={classes.renderMake_button_main}>
              <IconCameraFilled size={18} color="#2A3435" className={classes.startRenderIcon} />
              <p>{translation['RENDER_POPUP_BUTTON_START']}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Main;
