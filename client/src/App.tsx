import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useLanguageChange } from './api/hooks/useLanguageChange';
import { useLanguages } from './api/hooks/useLanguages';
import { useTranslation } from './api/hooks/useTranslation';
import BottomPanel from './components/bottom/BottomPanel';
import CenterPanel from './components/center/CenterPanel';
import LeftMain from './components/left_new/LeftMain';
import Popups from './components/popups/Popups';
import QuickPanels from './components/quick/QuickPanels';
import RightPanel from './components/right_new/RightPanel';
import TopPanel from './components/top/TopPanel';
import { planner, user } from './initR2D';
import {
  changeActivePano,
  selectIsProjectBelongToLoggedUser,
  selectIsProjectOnlyView,
  selectPreloaderStatus,
  updateIsProjectBelongToLoggedUser,
  updateIsProjectOnlyView,
  updateIsThereHiddenElements,
  updatePreloaderStatus,
} from './redux/features/common/commonSlice';
import {
  changeImagePlanUploadType,
  changeWallsHeight,
} from './redux/features/constructor/constructorSlice';
import {
  changeActiveControlPanelMode,
  controlPanelHistoryClear,
  controlPanelUpdateBreadCrumbs,
  selectActiveControlPanelMode,
  selectActiveControlPanelModeData,
  selectControlPanelData,
  selectControlPanelStatus,
  selectPrevControlPanelMode,
  updateDynamicPanelStatus,
  updateDynamicToggleButtonStatus,
} from './redux/features/control/controlPanelSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
  setPopupData,
} from './redux/features/popups/popupsSlice';
import {
  removeQuickPanel,
  removeQuickPanelAll,
  showQuickPanel,
} from './redux/features/quickPanels/quickPanelsSlice';
import { showTip } from './redux/features/tips/tipsSlice';
import { changeUndoRedo } from './redux/features/topPanel/topPanelSlice';
import {
  saveLoggedStatus,
  selectIsLogged,
  selectUserProfileData,
  selectUserProjectActive,
  setActiveProjectName,
  setProfileData,
  setProjectPlan,
  userLogout,
} from './redux/features/user/userSlice';
import { selectActiveViewMode, setActiveViewMode } from './redux/features/viewMode/viewModeSlice';
import PortraitBlocker from './shared-components/app-guards/portrait-blocker';
import GlobalPreload from './shared-components/loaders/global-preload';
import Tips from './smart-components/tips';
import { createProjectUrl } from './utils/UrlHelper';

const useStyle = createUseStyles({
  main: {
    height: '100%',
  },
  content: {
    fontFamily: 'Roboto, sans-serif',
    color: '#000',
    height: '100%',
    userSelect: 'none',
    '-webkit-touch-callout': 'none' /* Safari */,
    '-webkit-user-select': 'none' /* Chrome */,
    '-moz-user-select': 'none' /* Firefox */,
    '-ms-user-select': 'none' /* Internet Explorer/Edge */,
    '-webkit-tap-highlight-color': 'transparent',
    display: 'flex',
  },
  right_bar_wrap: {
    position: 'absolute',
    right: 2,
    zIndex: 2,
    top: 0,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
    width: 50,
  },
  panel_top: {
    position: 'absolute',
    right: 2,
    top: 2,
    display: 'flex',
    zIndex: 3,
  },
  plannerMain: {
    position: 'relative',
    width: '100%',
  },
});

const App = () => {
  const classes = useStyle();

  const activeViewMode = useSelector(selectActiveViewMode);
  const translation = useTranslation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const controlPanelStatus = useSelector(selectControlPanelStatus);
  const userProfileData = useSelector(selectUserProfileData);
  const controlPanelData = useSelector(selectControlPanelData);
  const prevControlPanelMode = useSelector(selectPrevControlPanelMode);
  const isLogged = useSelector(selectIsLogged);
  const controlPanelActiveMode = useSelector(selectActiveControlPanelMode);
  const preloaderStatus = useSelector(selectPreloaderStatus);
  const userProjectActive = useSelector(selectUserProjectActive);
  const isProjectOnlyView = useSelector(selectIsProjectOnlyView);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);

  const languages = useLanguages();
  const currLanguage = languages.find((i) => i.current == 1);
  const { mutateAsync: changeLanguage } = useLanguageChange();

  const configEnableMerchantLogin = R2D.config.data.enable_merchant_login;
  const [showTipUseTab, setTipUseTab] = useState({
    status: false,
    position: { x: 0, y: 0 },
    isEnterTipActive: false,
  });
  const [showTipUseEnter, setTipUseEnter] = useState({ status: false, position: { x: 0, y: 0 } });

  const isProOptionEnabled = R2D.OPTIONS.PRO_PLAN;

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const [isOrientationPortrait, setIsOrientationPortrait] = useState(
    isCurrDeviceAPhone ? window.matchMedia('(orientation: portrait)').matches : false
  );

  const [isProgramReady, setIsProgramReady] = useState(false);

  const isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);

  const popups = useSelector(selectPopups);

  const onRendersUpdate = (data) => {
    dispatch(
      setActivePopup({
        name: 'completeMessage',
        positionX: 'left',
        type: data.data.status == 'stored' ? 'complete' : 'error',
        data: data.data.status == 'stored' ? 'NOTIFY_RENDER_READY' : 'NOTIFY_RENDER_ERROR',
      })
    );
    planner.apiScene.dispatchEvent(new Event(planner.apiScene.RENDERS_DATA_UPDATED, {}));
  };

  const onProjectLoaded = async (e) => {
    (!R2D.scene.viewOnly ||
      R2D.scene.getProjectUserKey() == user.getKey() ||
      (R2D.scene.getProjectUserKey() == null && user.getKey() == null)) &&
      dispatch(updateDynamicPanelStatus(true));
    if (e.data?.status == 'error') {
      dispatch(setActivePopup({ name: 'alert', data: e.data.data || 'TEXT_ERROR_LOAD_DATA' }));
      return;
    }
    if (!e.data.id) {
      dispatch(changeActivePano({ id: 0, previewImgSrc: '', rotation: 0 }));
    } else {
      const id = e.data.id;
      const rotation = e.data.rotation;
      const panorams = planner.getPanorams();
      const panoPreviewSrc = panorams.find((i) => i.id == id)?.source.images.preview;
      dispatch(changeActivePano({ id, previewImgSrc: panoPreviewSrc, rotation }));
    }
    if (e.data.viewState) {
      const newState =
        e.data.viewState.state == '2d'
          ? 'view2d'
          : e.data.viewState.state == '3d'
            ? 'view3d'
            : e.data.viewState.state == 'walk'
              ? 'viewWalk'
              : e.data.viewState.state == 'constructor'
                ? 'constr'
                : null;
      dispatch(setActiveViewMode(newState));

      if (R2D.scene.viewOnly && R2D.scene.getProjectUserKey() != user.getKey()) {
        dispatch(changeActiveControlPanelMode({ mode: 'to2d3d' }));
      } else {
        if (newState == 'view2d' || newState == 'view3d') {
          const furnitureData = planner.getCatalogProducts();
          dispatch(
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
        } else if (newState == 'viewWalk') {
          dispatch(
            changeActiveControlPanelMode({
              mode: 'walk',
              data:
                controlPanelData['walk'].history.length < 1
                  ? { type: 'panorams', lastSavedScroll: 0 }
                  : null,
            })
          );
        }
      }
    }
    if (e.data.name) {
      dispatch(setActiveProjectName(e.data.name));
    }
    if (e.data.plan) {
      dispatch(setProjectPlan(e.data.plan));
    }
    dispatch(changeWallsHeight(R2D.scene.constructor.cap.wallsHeight));
    dispatch(
      changeImagePlanUploadType(
        R2D.commonSceneHelper.drawingHelper.state != null
          ? R2D.commonSceneHelper.drawingHelper.state
          : null
      )
    );

    if (userProfileData?.autoSave) {
      planner.scene.clearSceneAutoSaveServer();
      planner.scene.sceneAutoSaveServer(user.getKey());
    }
  };

  const onProjectElementsLoadProgress = (e) => {
    const currentLoadedCount =
      R2D.commonSceneHelper.constructorHelper.loadedMaterialsCount +
      R2D.commonSceneHelper.productHelper.loadedMaterialsCount +
      R2D.commonSceneHelper.productHelper.loadedModelsCount;
    const currentNotLoadedCount =
      R2D.commonSceneHelper.constructorHelper.notLoadedMaterialsCount +
      R2D.commonSceneHelper.productHelper.notLoadedMaterialsCount +
      R2D.commonSceneHelper.productHelper.notLoadedModelsCount;
    const loadedAllCount = R2D.scene.startMaterialsIds.length + R2D.scene.startModelsIds.length;
    if (currentLoadedCount + currentNotLoadedCount < loadedAllCount) {
      if (popups.projectDataLoadPopup.status)
        dispatch(
          setPopupData({
            name: 'projectDataLoadPopup',
            type: 'loading',
            data:
              translation['NOTIFY_LOADING_PRODUCTS_DATA'] +
              currentLoadedCount +
              '/' +
              loadedAllCount,
          })
        );
      else
        dispatch(
          setActivePopup({
            name: 'projectDataLoadPopup',
            positionX: 'left',
            type: 'loading',
            data:
              translation['NOTIFY_LOADING_PRODUCTS_DATA'] +
              currentLoadedCount +
              '/' +
              loadedAllCount,
          })
        );
    } else {
      if (popups?.projectDataLoadPopup?.status)
        dispatch(
          setPopupData({
            name: 'projectDataLoadPopup',
            type: currentNotLoadedCount > 0 ? 'error' : 'done',
            data: translation[
              currentNotLoadedCount > 0
                ? 'NOTIFY_LOADED_PRODUCTS_DATA_ERROR'
                : 'NOTIFY_LOADED_PRODUCTS_DATA_COMPLETE'
            ],
          })
        );
      else
        dispatch(
          setActivePopup({
            name: 'projectDataLoadPopup',
            positionX: 'left',
            type: currentNotLoadedCount > 0 ? 'error' : 'done',
            data: translation[
              currentNotLoadedCount > 0
                ? 'NOTIFY_LOADED_PRODUCTS_DATA_ERROR'
                : 'NOTIFY_LOADED_PRODUCTS_DATA_COMPLETE'
            ],
          })
        );
    }
  };

  const onHistoryUndoRedo = (e) => {
    if (e.data.removeQuickPanel) {
      dispatch(removeQuickPanelAll());
    }
    if (e.data.clearDynamicPanel) {
      const furnitureData = planner.getCatalogProducts();
      if (!activeControlPanelData.isInControlPanel) {
        if (prevControlPanelMode) {
          dispatch(changeActiveControlPanelMode({ mode: prevControlPanelMode }));
        } else {
          dispatch(
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
        }
      }
    }

    dispatch(changeUndoRedo());
  };

  const onWheelZoom = (event) => {
    const delta = event.data.delta > 0 ? -1 : 1;
    if (controlPanelActiveMode == 'renderMake') {
      R2D.Viewers.cameraZoom(-delta);
    } else {
      if (activeViewMode == 'constr') {
        WC.WallsEditor._instance.zoom(WC.canvasWidth / 2, WC.canvasHeight / 2, -delta);
        R2D.ViewerScene2D._instance.cameraZoom(delta);
      } else if (activeViewMode == 'view2d') {
        R2D.ViewerScene2D._instance.cameraZoom(-delta);
        WC.WallsEditor._instance.zoom(WC.canvasWidth / 2, WC.canvasHeight / 2, delta);
      } else {
        R2D.Viewers.cameraZoom(-delta);
      }
    }
  };

  const onCameraMove = (e) => {
    if (activeViewMode == 'constr' && controlPanelActiveMode != 'renderMake') {
      R2D.ViewerScene2D._instance.cameraMove(e.data.x, e.data.y);
    } else {
      R2D.Viewers.cameraMove(e.data.x, e.data.y);
    }
  };

  async function messageListener(e) {
    if (!e.data || typeof e.data !== 'string' || e.data.startsWith('/*framebus*/')) return;
    let dataObj = {};
    try {
      dataObj = JSON.parse(e.data);
    } catch (error) {
      console.error('Error parse JSON string!');
      return;
    }

    const saveProject = async (name) => {
      const project = { name, createNew: false };
      if (R2D.controller.getProjectUserKey() != user.getKey()) {
        project.createNew = true;
      }
      const result = await planner.scene.saveProject(project);
      if (result?.type == 'error') {
        dispatch(updatePreloaderStatus(false));
        return dispatch(
          setActivePopup({ name: 'alert', data: result?.data || 'TEXT_ERROR_LOAD_DATA' })
        );
      }

      const response = await user.loadProfileData();
      if (response.type == 'error')
        dispatch(setActivePopup({ name: 'alert', data: response.data }));
      else dispatch(setProfileData(response));

      dispatch(
        setActivePopup({ name: 'completeMessage', positionX: 'left', data: 'NOTIFY_SAVE_COMPLETE' })
      );
      R2D.scene.updateProjectUserPlan('free');
      dispatch(setProjectPlan('free'));
      planner.scene.setIsProjectBelongToLoggedUserStatus(
        R2D.scene.getProjectUserKey() == user.getKey()
      );
      dispatch(updateIsProjectBelongToLoggedUser(R2D.scene.getProjectUserKey() == user.getKey()));

      R2D.postMessageToParent(
        JSON.stringify({
          action: 'project_saved',
          data: {
            id: R2D.scene.getProjectId(),
            name: R2D.scene.getProjectName(),
            hash: R2D.scene.getProjectHash(),
          },
        })
      );
    };

    if (dataObj.action == 'load_project') {
      if (dataObj.hash) {
        planner.scene.clearSceneAutoSaveStorage();
        await planner.scene.loadProject(dataObj.hash, true);
        planner.scene.sceneAutoSaveStorage(dataObj.hash);
        popups.startPopup.status && dispatch(closeActivePopup({ name: 'startPopup' }));
      }
    } else if (dataObj.action == 'set_token') {
      if (dataObj.token) {
        user.saveToken(dataObj.token, false);

        const response = await user.checkIsLogged();
        if (response.type == 'error') {
          dispatch(setActivePopup({ name: 'alert', data: response.data }));
          return dispatch(saveLoggedStatus({ logged: false }));
        } else dispatch(saveLoggedStatus(response));

        if (user.data.autoSave) {
          planner.scene.clearSceneAutoSaveServer();
          planner.scene.sceneAutoSaveServer(user.getKey());
        }
      }
    } else if (dataObj.action == 'save_estimation') {
      R2D.controller.estimationToFile();
    } else if (dataObj.action == 'get_estimation') {
      const data = R2D.controller.getEstimation();
      R2D.postMessageToParent(
        JSON.stringify({
          action: 'got_estimation',
          data,
        })
      );
    } else if (dataObj.action == 'set_country') {
      if (dataObj.country) {
        R2D.controller.setCountry(dataObj.country);
        const start2D3DData = await user.loadRightPanelData(R2D.URL.CATALOG_TREE);
        planner.setCatalogProducts(start2D3DData.tree);
        if (activeViewMode == 'view2d' || (activeViewMode == 'view3d' && controlPanelStatus)) {
          dispatch(controlPanelHistoryClear());
          dispatch(controlPanelUpdateBreadCrumbs({ updateType: 'clear' }));

          const needToAddStartData = controlPanelData['furniture'].history.length < 1;
          const furnitureData = planner.getCatalogProducts();
          dispatch(
            changeActiveControlPanelMode({
              mode: 'furniture',
              data: needToAddStartData
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

          planner.mih().changeState(planner.mih().stateMain);
          planner.mih().unsetActiveObject();
        }
      }
    } else if (dataObj.action == 'save_project') {
      if (!user.isLogged()) {
        !configEnableMerchantLogin
          ? dispatch(setActivePopup({ name: 'login' }))
          : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
        return;
      } else if (!planner.scene.wasSaved()) {
        if (user.data.maxProjects > 0 && user.data.projectCount >= user.data.maxProjects)
          dispatch(
            setActivePopup({
              name: 'upgradePlan',
              addType: 'configCreate',
              type: 'upgradeOverLimit',
            })
          );
        else {
          if (!dataObj.projectName) {
            dispatch(
              setActivePopup({ name: 'setProjectName', type: 'create', addType: 'configCreate' })
            );
          } else {
            saveProject(dataObj.projectName);
          }
        }
      } else if (
        R2D.controller.getProjectUserKey() &&
        R2D.controller.getProjectUserKey() != user.getKey()
      ) {
        let allPremiumPlanOfSceneObjects = new Set();
        let allElemsWithOwner = new Set();
        Object.values(R2D.Pool._products_data).forEach((i) => {
          Array.isArray(i.plan) && allPremiumPlanOfSceneObjects.add(i.plan[0]);
          i.isOwner && allElemsWithOwner.add(i.type);
        });
        allPremiumPlanOfSceneObjects = Array.from(allPremiumPlanOfSceneObjects);
        allElemsWithOwner = Array.from(allElemsWithOwner);
        const isThereObjectsWithOwnerThatDontMatchUserPremiumPlan =
          allElemsWithOwner.length > 0 &&
          (user.data.plan == 'free' ||
            (user.data.plan == 'basic' &&
              allElemsWithOwner.find((i) => i == R2D.ProductType.MODEL)));
        const isTherePremiumObjectThatDontMatchUserPremiumPlan =
          allPremiumPlanOfSceneObjects.length > 0 &&
          (user.data.plan == 'free' ||
            (user.data.plan == 'basic' && allPremiumPlanOfSceneObjects.find((i) => i == 'pro')));
        const neededPlan =
          allPremiumPlanOfSceneObjects.find((i) => i == 'pro') ||
          allElemsWithOwner.find((i) => i == R2D.ProductType.MODEL)
            ? 'pro'
            : allPremiumPlanOfSceneObjects.find((i) => i == 'basic') || allElemsWithOwner.length > 0
              ? 'basic'
              : 'free';
        if (user.data.maxProjects > 0 && user.data.projectCount >= user.data.maxProjects)
          dispatch(
            setActivePopup({
              name: 'upgradePlan',
              type: 'upgradeOverLimit',
              addType: 'configCreate',
              addData: { plan: neededPlan },
            })
          );
        else {
          if (
            isTherePremiumObjectThatDontMatchUserPremiumPlan ||
            isThereObjectsWithOwnerThatDontMatchUserPremiumPlan
          )
            dispatch(
              setActivePopup({
                name: 'upgradePlan',
                type: 'createNewPremiumProject',
                addType: 'configCreate',
                addData: { plan: neededPlan },
              })
            );
          else {
            if (!dataObj.projectName) {
              dispatch(
                setActivePopup({ name: 'setProjectName', type: 'create', addType: 'configCreate' })
              );
            } else {
              saveProject(dataObj.projectName);
            }
          }
        }
      } else {
        dispatch(setActivePopup({ name: 'loadingMessage', data: 'TEXT_WAIT' }));
        const result = await planner.scene.saveProject();
        if (result?.type == 'error')
          return dispatch(
            setActivePopup({ name: 'alert', data: result?.data || 'TEXT_ERROR_LOAD_DATA' })
          );
        dispatch(closeActivePopup({ name: 'loadingMessage' }));
        dispatch(
          setActivePopup({
            name: 'completeMessage',
            positionX: 'left',
            data: 'NOTIFY_SAVE_COMPLETE',
          })
        );
        user.data.autoSave == null && dispatch(setActivePopup({ name: 'autoSaveEnable' }));
        R2D.postMessageToParent(
          JSON.stringify({
            action: 'project_saved',
            data: {
              id: R2D.scene.getProjectId(),
              name: R2D.scene.getProjectName(),
              hash: R2D.scene.getProjectHash(),
            },
          })
        );
      }
    } else if (dataObj.action == 'rename_project') {
      if (!planner.scene.wasSaved() || R2D.controller.getProjectUserKey() != user.getKey()) {
        if (
          user.data.maxProjects > 0 &&
          user.data.projectCount >= user.data.maxProjects &&
          !isProOptionEnabled
        )
          dispatch(setActivePopup({ name: 'upgradePlan' }));
        else
          dispatch(
            setActivePopup({
              name: 'confirm',
              type: 'project_save_before_rename',
              addType: 'configRename',
            })
          );
      } else {
        dispatch(
          setActivePopup({ name: 'setProjectName', type: 'rename', addType: 'configRename' })
        );
      }
    } else if (dataObj.action == 'new_project') {
      if (
        user.data.maxProjects > 0 &&
        user.data.projectCount >= user.data.maxProjects &&
        !isProOptionEnabled
      )
        dispatch(setActivePopup({ name: 'upgradePlan' }));
      else {
        if (planner.scene.wasChanged()) {
          dispatch(setActivePopup({ name: 'saveBefore', type: 'createNew' }));
        } else {
          planner.scene.clearSceneAutoSaveStorage();
          window.history.replaceState(null, null, createProjectUrl(''));
          window.location.reload();
        }
      }
    } else if (dataObj.action == 'clear_project')
      planner.scene.wasChanged
        ? dispatch(setActivePopup({ name: 'confirm', type: 'project_clear' }))
        : null;
    else if (dataObj.action == 'save_as') {
      if (!user.isLogged())
        !configEnableMerchantLogin
          ? dispatch(setActivePopup({ name: 'login' }))
          : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
      else {
        let allPremiumPlanOfSceneObjects = new Set();
        let allElemsWithOwner = new Set();
        Object.values(R2D.Pool._products_data).forEach((i) => {
          Array.isArray(i.plan) && allPremiumPlanOfSceneObjects.add(i.plan[0]);
          i.isOwner && allElemsWithOwner.add(i.type);
        });
        allPremiumPlanOfSceneObjects = Array.from(allPremiumPlanOfSceneObjects);
        allElemsWithOwner = Array.from(allElemsWithOwner);
        const isThereObjectsWithOwnerThatDontMatchUserPremiumPlan =
          allElemsWithOwner.length > 0 &&
          (user.data.plan == 'free' ||
            (user.data.plan == 'basic' &&
              allElemsWithOwner.find((i) => i == R2D.ProductType.MODEL)));
        const isTherePremiumObjectThatDontMatchUserPremiumPlan =
          allPremiumPlanOfSceneObjects.length > 0 &&
          (user.data.plan == 'free' ||
            (user.data.plan == 'basic' && allPremiumPlanOfSceneObjects.find((i) => i == 'pro')));
        const neededPlan =
          allPremiumPlanOfSceneObjects.find((i) => i == 'pro') ||
          allElemsWithOwner.find((i) => i == R2D.ProductType.MODEL)
            ? 'pro'
            : allPremiumPlanOfSceneObjects.find((i) => i == 'basic') || allElemsWithOwner.length > 0
              ? 'basic'
              : 'free';
        if (user.data.maxProjects > 0 && user.data.projectCount >= user.data.maxProjects)
          dispatch(
            setActivePopup({
              name: 'upgradePlan',
              type: 'upgradeOverLimit',
              addType: 'configCreate',
              addData: { plan: neededPlan },
            })
          );
        else {
          if (
            isTherePremiumObjectThatDontMatchUserPremiumPlan ||
            isThereObjectsWithOwnerThatDontMatchUserPremiumPlan
          )
            dispatch(
              setActivePopup({
                name: 'upgradePlan',
                type: 'createNewPremiumProject',
                addType: 'configCreate',
                addData: { plan: neededPlan },
              })
            );
          else {
            if (!dataObj.projectName) {
              dispatch(
                setActivePopup({ name: 'setProjectName', type: 'saveAs', addType: 'configCreate' })
              );
            } else {
              if (dataObj.projectName == planner.scene.getProjectName()) {
                const project = { name: dataObj.projectName, createNew: false };
                const result = await planner.scene.saveProject(project);
                if (result?.type == 'error') {
                  dispatch(updatePreloaderStatus(false));
                  return dispatch(
                    setActivePopup({ name: 'alert', data: result?.data || 'TEXT_ERROR_LOAD_DATA' })
                  );
                }
              } else {
                const project = { name: dataObj.projectName, createNew: true };
                const result = await planner.scene.saveProject(project);
                if (result?.type == 'error') {
                  dispatch(updatePreloaderStatus(false));
                  return dispatch(
                    setActivePopup({ name: 'alert', data: result?.data || 'TEXT_ERROR_LOAD_DATA' })
                  );
                }

                const response = await user.loadProfileData();
                if (response.type == 'error')
                  dispatch(setActivePopup({ name: 'alert', data: response.data }));
                else dispatch(setProfileData(response));
              }

              dispatch(
                setActivePopup({
                  name: 'completeMessage',
                  positionX: 'left',
                  data: 'NOTIFY_SAVE_COMPLETE',
                })
              );
              R2D.scene.updateProjectUserPlan('free');
              dispatch(setProjectPlan('free'));
              planner.scene.setIsProjectBelongToLoggedUserStatus(
                R2D.scene.getProjectUserKey() == user.getKey()
              );
              dispatch(
                updateIsProjectBelongToLoggedUser(R2D.scene.getProjectUserKey() == user.getKey())
              );

              R2D.postMessageToParent(
                JSON.stringify({
                  action: 'project_saved',
                  data: {
                    id: R2D.scene.getProjectId(),
                    name: planner.scene.getProjectName(),
                    hash: R2D.scene.getProjectHash(),
                  },
                })
              );
            }
          }
        }
      }
    } else if (dataObj.action == 'export_project') {
      if (!user.isLogged()) {
        !configEnableMerchantLogin
          ? dispatch(setActivePopup({ name: 'login' }))
          : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
        return;
      } else if (
        R2D.controller.getProjectId() == 0 ||
        R2D.controller.getProjectUserKey() != user.getKey()
      ) {
        dispatch(setActivePopup({ name: 'alert', data: 'TEXT_EXPORT_SAVE_BEFORE' }));
        return;
      } else if (dataObj.exportType) {
        if (
          user.data.plan == 'pro' ||
          isProOptionEnabled ||
          (isProjectBelongToLoggedUser && userProjectActive.plan == 'pro')
        ) {
          if (dataObj.exportType == 'pdf')
            dispatch(setActivePopup({ name: 'export2DProjectPopup' }));
          else
            dispatch(
              setActivePopup({
                name: 'export3DProjectPopup',
                type: 'download',
                data: dataObj.exportType,
              })
            );
        } else {
          if (dataObj.exportType == 'pdf') {
            if (
              user.data.plan == 'basic' ||
              (isProjectBelongToLoggedUser && userProjectActive.plan == 'basic')
            )
              dispatch(setActivePopup({ name: 'export2DProjectPopup' }));
            else {
              isProOptionEnabled
                ? !configEnableMerchantLogin
                  ? dispatch(setActivePopup({ name: 'login' }))
                  : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }))
                : dispatch(setActivePopup({ name: 'payPro', type: 'user' }));
            }
          } else
            dispatch(
              setActivePopup({
                name: 'export3DProjectPopup',
                type: 'download',
                data: dataObj.exportType,
              })
            );
        }
      } else dispatch(setActivePopup({ name: 'exportPopup' }));
    } else if (dataObj.action == 'open_renders') {
      if (!user.isLogged()) {
        !configEnableMerchantLogin
          ? dispatch(setActivePopup({ name: 'login' }))
          : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
        return;
      } else {
        navigate('/renders');
      }
    } else if (dataObj.action == 'share_project') {
      if (user.getId() == 0) {
        !configEnableMerchantLogin
          ? dispatch(setActivePopup({ name: 'login' }))
          : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
        return;
      }
      if (R2D.controller.getProjectUserKey() && R2D.controller.getProjectUserKey() != user.getKey())
        return dispatch(setActivePopup({ name: 'alert', data: 'TEXT_SHARE_PLAN_DIFF_USERS' }));
      if (!R2D.scene.getProjectId())
        return dispatch(setActivePopup({ name: 'alert', data: 'TEXT_SAVE_BEFORE_SHARE_PLAN' }));
      dispatch(setActivePopup({ name: 'share' }));
    } else if (dataObj.action == 'open_tours') {
      if (!user.isLogged()) {
        !configEnableMerchantLogin
          ? dispatch(setActivePopup({ name: 'login' }))
          : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
        return;
      } else {
        navigate('/tours');
      }
    } else if (dataObj.action == 'create_tour') {
      if (!user.isLogged()) {
        !configEnableMerchantLogin
          ? dispatch(setActivePopup({ name: 'login' }))
          : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
        return;
      }
      dispatch(setActivePopup({ name: 'tour360Create' }));
    } else if (dataObj.action == 'open_tour') {
      if (!user.isLogged()) {
        !configEnableMerchantLogin
          ? dispatch(setActivePopup({ name: 'login' }))
          : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
        return;
      }
      dispatch(setActivePopup({ name: 'tour360Create', data: dataObj.url }));
    }
  }

  const onProjectSaveComplete = (e) => R2D.scene.updateProjectUserKey(user.getKey());

  const onDragObjOutOfWall = (e) => {
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
  };

  const onEstimationSend = (e) => {
    if (R2D.config.data.enable_estimation) {
      const data = R2D.controller.getEstimation();
      R2D.postMessageToParent(
        JSON.stringify({
          action: 'got_estimation',
          data,
        })
      );
    }
  };

  const quickPanelsHide = (e) => dispatch(removeQuickPanelAll());

  const useTabTipStart = (e) => setTipUseTab({ position: { ...e.data.position }, status: true });

  const useTabTipMove = (e) => setTipUseTab({ status: true, position: { ...e.data.position } });

  const useEnterTipStart = (e) =>
    setTipUseEnter({ position: { ...e.data.position }, status: true });

  const useEnterTipMove = (e) =>
    setTipUseEnter((prev) => {
      return { ...prev, position: { ...e.data.position } };
    });

  const useEnterTabTipStart = (e) => {
    setTipUseEnter({ position: { ...e.data.position }, status: true });
    setTimeout(
      () =>
        setTipUseTab({
          position: { ...e.data.position_second },
          status: true,
          isEnterTipActive: true,
        }),
      100
    );
  };

  const useEnterTabTipMove = (e) => {
    setTipUseEnter({ position: { ...e.data.position }, status: true });
    setTipUseTab({ position: { ...e.data.position_second }, status: true, isEnterTipActive: true });
  };

  const onSetGroupActive = (e) => {
    planner.mih().setActiveGroup(e.data.group);
    planner.mih().changeState(planner.mih().stateSelectedGroup);
    dispatch(changeActiveControlPanelMode({ mode: 'selectedGroup', data: { type: 'main' } }));
    dispatch(
      showQuickPanel({
        name: 'helper_group',
        visible: e.data.group.merged ? true : false,
        position: { x: planner.mih().mouseX, y: planner.mih().mouseY },
      })
    );
  };

  const onSetProductActive = (e) => {
    const view3dObject = planner.mih()._productHelper.findObjectView3dBySceneObject(e.data.model);
    planner.mih().setActiveObjectProduct(view3dObject);
    planner.mih().changeState(planner.mih().stateSelectedProduct);
    dispatch(changeActiveControlPanelMode({ mode: 'selectedModel', data: { type: 'main' } }));
    dispatch(
      showQuickPanel({
        name: 'helper_model',
        position: { x: planner.mih().mouseX, y: planner.mih().mouseY },
      })
    );
  };

  const onReturnToDefaultMode = (e) => {
    dispatch(removeQuickPanelAll());
    if (!activeControlPanelData.isInControlPanel) {
      if (prevControlPanelMode) {
        dispatch(changeActiveControlPanelMode({ mode: prevControlPanelMode }));
      } else {
        const furnitureData = planner.getCatalogProducts();
        dispatch(
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
      }
    }
  };

  const onOrientationChange = (e) => {
    const portrait = e.matches;
    if (portrait) {
      setIsOrientationPortrait(true);
    } else {
      setIsOrientationPortrait(false);
    }
  };

  const onUpdateHiddenElements = (e) => dispatch(updateIsThereHiddenElements(e.data));

  const changeLang = async (code) => {
    await changeLanguage(code);
    if (activeViewMode == 'view2d') R2D.scene3D?.titlesTool.onLanguagesUpdate();
    else if (activeViewMode == 'constr') WC.wallsEditor?.titlesTool.onLanguagesUpdate();
  };

  const onlyViewProjectStatusUpdate = (e) => {
    dispatch(updateIsProjectOnlyView(e.data.viewOnly));
    planner.scene.updateProjectOnlyViewState(e.data.viewOnly);

    if (e.data.userKey != user.getKey()) {
      planner.scene.setIsProjectBelongToLoggedUserStatus(false);
      dispatch(updateIsProjectBelongToLoggedUser(false));
    }

    if (e.data.userKey != user.getKey() && e.data.viewOnly) {
      R2D.mouseInteractionHelper.state.setIsSelectingModel &&
        R2D.mouseInteractionHelper.state.setIsSelectingModel(false);
      WC.wallsEditor.state.setIsSelectElementsActive(false);
      dispatch(updateDynamicPanelStatus(false));
      dispatch(updateDynamicToggleButtonStatus(false));
    }
  };

  const updateProjectName = (e) => dispatch(setActiveProjectName(e.data.name));

  const pastePremiumProductError = (e) =>
    dispatch(setActivePopup({ name: 'alert', data: e.data.text }));

  const beforeUnloadFunc = async (e) => {
    if (!R2D.Storage.load('r2d_is_error_occured')) {
      if (
        user.isLogged() &&
        planner.scene.wasChanged() &&
        R2D.scene.getProjectId() &&
        user.getKey() == R2D.controller.getProjectUserKey() &&
        R2D.controller.projectOpeningStatus == 'ready'
      ) {
        if (user.data.autoSave) await R2D.controller.saveCurrentScene();
        else {
          e.preventDefault();
          e.returnValue = translation['TEXT_SAVE_PROJECT_BEFORE_CLOSE_PLANNER'];
        }
      }
    }
  };

  const quickPanelShow = (e) =>
    dispatch(
      showQuickPanel({ name: e.data.type, position: e.data.quickPanel, type: e.data.addType })
    );
  const quickPanelHide = (e) => dispatch(removeQuickPanel({ name: e.data.type }));

  const onRulerSelect = (e) =>
    dispatch(
      showQuickPanel({
        name: 'delete',
        position: { x: e.data.x, y: e.data.y },
        type: 'deleteRuller',
      })
    );

  const onShowAlertPopup = (e) => dispatch(setActivePopup({ name: 'alert', data: e.data }));

  const checkIsLogged = async (e) => {
    const token = R2D.Storage.load('r2d_token');
    const response = await user.checkIsLogged(token);
    if (response.type == 'error') {
      dispatch(setActivePopup({ name: 'alert', data: response.data }));
      return dispatch(saveLoggedStatus({ logged: false }));
    } else {
      dispatch(saveLoggedStatus(response));

      const isCurrentProjectBelongToUser = R2D.scene.getProjectUserKey() == user.getKey();
      planner.scene.setIsProjectBelongToLoggedUserStatus(isCurrentProjectBelongToUser);

      R2D.mouseInteractionHelper.state?.setIsSelectingModel &&
        R2D.mouseInteractionHelper.state.setIsSelectingModel(
          !isProjectOnlyView || (isProjectOnlyView && isCurrentProjectBelongToUser)
        );
      WC.wallsEditor.state.setIsSelectElementsActive &&
        WC.wallsEditor.state.setIsSelectElementsActive(
          !isProjectOnlyView || (isProjectOnlyView && isCurrentProjectBelongToUser)
        );
      dispatch(updateIsProjectBelongToLoggedUser(isCurrentProjectBelongToUser));
    }
  };

  const tryLogOut = (e) => {
    dispatch(userLogout());

    planner.scene.setIsProjectBelongToLoggedUserStatus(false);
    dispatch(updateIsProjectBelongToLoggedUser(false));

    if (planner.scene.getProjectOnlyViewState()) {
      planner.mih().unsetActiveObject();
      planner.mih().changeState(planner.mih().stateMain);
      dispatch(removeQuickPanelAll());

      R2D.mouseInteractionHelper.state.setIsSelectingModel &&
        R2D.mouseInteractionHelper.state.setIsSelectingModel(false);
      WC.wallsEditor.state.setIsSelectElementsActive &&
        WC.wallsEditor.state.setIsSelectElementsActive(false);
      dispatch(updateDynamicToggleButtonStatus(false));
      dispatch(updateDynamicPanelStatus(false));
      dispatch(changeActiveControlPanelMode({ mode: 'to2d3d' }));
    }
  };

  const storageChangeCallback = async (e) => {
    if (~e.key?.indexOf('r2d_token')) {
      const token = R2D.Storage.load('r2d_token');
      if (token && !user.isLogged()) {
        const response = await user.checkIsLogged(token);
        if (response.type == 'error') {
          dispatch(setActivePopup({ name: 'alert', data: response.data }));
          return dispatch(saveLoggedStatus({ logged: false }));
        } else {
          dispatch(saveLoggedStatus(response));

          const isCurrentProjectBelongToUser = R2D.scene.getProjectUserKey() == user.getKey();
          planner.scene.setIsProjectBelongToLoggedUserStatus(isCurrentProjectBelongToUser);

          R2D.mouseInteractionHelper.state?.setIsSelectingModel &&
            R2D.mouseInteractionHelper.state.setIsSelectingModel(
              !isProjectOnlyView || (isProjectOnlyView && isCurrentProjectBelongToUser)
            );
          WC.wallsEditor.state.setIsSelectElementsActive &&
            WC.wallsEditor.state.setIsSelectElementsActive(
              !isProjectOnlyView || (isProjectOnlyView && isCurrentProjectBelongToUser)
            );
          dispatch(updateIsProjectBelongToLoggedUser(isCurrentProjectBelongToUser));
        }
      } else if (!token && user.isLogged()) {
        dispatch(userLogout());

        planner.scene.setIsProjectBelongToLoggedUserStatus(false);
        dispatch(updateIsProjectBelongToLoggedUser(false));

        if (planner.scene.getProjectOnlyViewState()) {
          planner.mih().unsetActiveObject();
          planner.mih().changeState(planner.mih().stateMain);
          dispatch(removeQuickPanelAll());

          R2D.mouseInteractionHelper.state.setIsSelectingModel &&
            R2D.mouseInteractionHelper.state.setIsSelectingModel(false);
          WC.wallsEditor.state.setIsSelectElementsActive &&
            WC.wallsEditor.state.setIsSelectElementsActive(false);
          dispatch(updateDynamicToggleButtonStatus(false));
          dispatch(updateDynamicPanelStatus(false));
          dispatch(changeActiveControlPanelMode({ mode: 'to2d3d' }));
        }
      }
    }
  };

  const onPreloaderToggle = (e) => dispatch(updatePreloaderStatus(!preloaderStatus));

  useEffect(() => {
    async function init() {
      !R2D.Storage.load('r2d_is_error_occured') && planner.scene.clearSceneAutoSaveStorage();

      R2D.Storage.clear('r2d_is_error_occured');

      planner.apiScene.addEventListener(planner.apiScene.RULER_SELECTED, onRulerSelect);
      planner.apiScene.addEventListener(
        planner.apiScene.PROJECT_SAVE_COMPLETE,
        onProjectSaveComplete
      );

      planner.apiScene.addEventListener(planner.apiScene.ESTIMATION_SEND, onEstimationSend);
      planner.apiScene.addEventListener(planner.apiScene.SET_ACTIVE_GROUP, onSetGroupActive);
      planner.apiScene.addEventListener(planner.apiScene.SET_ACTIVE_PRODUCT, onSetProductActive);
      planner.apiScene.addEventListener(planner.apiScene.QUICK_PANELS_HIDE, quickPanelsHide);
      planner.apiScene.addEventListener(
        planner.apiScene.UPDATE_IS_THERE_HIDDEN_ELEMENTS,
        onUpdateHiddenElements
      );
      planner.apiScene.addEventListener(
        planner.apiScene.UPDATE_PROJECT_ONLY_VIEW_STATUS,
        onlyViewProjectStatusUpdate
      );
      planner.apiScene.addEventListener(planner.apiScene.UPDATE_PROJECT_NAME, updateProjectName);
      planner.apiScene.addEventListener(
        planner.apiScene.PASTE_PREMIUM_PRODUCT_ERROR,
        pastePremiumProductError
      );
      planner.apiScene.addEventListener(planner.apiScene.QUICK_PANEL_SHOW, quickPanelShow);
      planner.apiScene.addEventListener(planner.apiScene.QUICK_PANEL_HIDE, quickPanelHide);
      planner.apiScene.addEventListener(planner.apiScene.SHOW_ALERT_POPUP, onShowAlertPopup);
      planner.apiScene.addEventListener(planner.apiScene.CHECK_IS_LOGGED, checkIsLogged);
      planner.apiScene.addEventListener(planner.apiScene.TRY_LOG_OUT, tryLogOut);

      planner.apiConstr.addEventListener(planner.apiScene.ESTIMATION_SEND, onEstimationSend);
      planner.apiConstr.addEventListener(planner.apiConstr.QUICK_PANELS_HIDE, quickPanelsHide);
      planner.apiConstr.addEventListener(planner.apiConstr.USE_TAB_TIP_START, useTabTipStart);
      planner.apiConstr.addEventListener(planner.apiConstr.USE_TAB_TIP_MOVE, useTabTipMove);
      planner.apiConstr.addEventListener(planner.apiConstr.USE_ENTER_TIP_START, useEnterTipStart);
      planner.apiConstr.addEventListener(planner.apiConstr.USE_ENTER_TIP_MOVE, useEnterTipMove);
      planner.apiConstr.addEventListener(
        planner.apiConstr.USE_ENTER_TAB_TIP_START,
        useEnterTabTipStart
      );
      planner.apiConstr.addEventListener(
        planner.apiConstr.USE_ENTER_TAB_TIP_MOVE,
        useEnterTabTipMove
      );
      planner.apiConstr.addEventListener(planner.apiConstr.SHOW_ALERT_POPUP, onShowAlertPopup);
      planner.apiConstr.addEventListener(planner.apiConstr.RULER_SELECTED, onRulerSelect);

      window.addEventListener(isCurrDeviceAPhone ? 'pagehide' : 'beforeunload', beforeUnloadFunc);

      isCurrDeviceAPhone &&
        window
          .matchMedia('(orientation: portrait)')
          .addEventListener('change', onOrientationChange);

      const canvasWrapper = document.getElementById('planner');
      canvasWrapper.appendChild(planner.getDomElement());

      let showStartPopup = true;

      let needToCleanSearch = false;

      // TODO: localStorage override bug — checkProjectForLoad skips the server if a localStorage copy exists
      //       (r2d_project_<hash>), then tryLoadProjectFromStorage loads that stale copy instead.
      //       Intent is crash recovery, but it means external DB edits or saves from another browser are ignored.
      //       Fix would be clearing localStorage for the current project hash before checkProjectForLoad,
      //       but that breaks crash recovery. Low priority for single-user local setup.
      const checkProjectForLoadResult = await R2D.controller.checkProjectForLoad();
      const tryLoadProjectFromStorageResult = await R2D.controller.tryLoadProjectFromStorage();
      await R2D.controller.applyAndSaveDataFromStorage();

      if (user.getKey() && R2D.scene.getProjectUserKey() == user.getKey()) {
        planner.scene.setIsProjectBelongToLoggedUserStatus(true);
        dispatch(updateIsProjectBelongToLoggedUser(true));
      }

      const furnitureData = planner.getCatalogProducts();
      isCurrDeviceAPhone &&
        dispatch(
          changeActiveControlPanelMode({
            mode: 'furniture',
            data: {
              type: 'catalog',
              addType: 'main',
              id: null,
              lastSavedScroll: 0,
              data: furnitureData,
            },
          })
        );

      if (!R2D.scene.viewOnly) {
        dispatch(updateDynamicToggleButtonStatus(true));
        dispatch(updateIsProjectOnlyView(false));
      }

      if (window.location.search.match('lang=')) {
        let lang = window.location.search.match(/lang=\w{0,2}/)[0].split('=')[1];
        needToCleanSearch = true;
        if (currLanguage?.code != lang) {
          if (!languages.some((i) => i.code == lang)) lang = 'en';
          await changeLanguage(lang);
        }
      }

      if (window.location.search.match('action=buy&')) {
        const type = window.location.search
          .replace('?', '')
          .split('&')
          .find((i) => ~i.indexOf('type'))
          .split('=')[1];
        const plan = window.location.search
          .replace('?', '')
          .split('&')
          .find((i) => ~i.indexOf('plan'))
          .split('=')[1];
        showStartPopup = false;
        if (type == 'user') {
          const time = window.location.search
            .replace('?', '')
            .split('&')
            .find((i) => ~i.indexOf('time'))
            .split('=')[1];

          if (user.data.plan == 'pro' || (user.data.plan == 'basic' && plan == 'basic')) {
            window.history.replaceState(null, null, createProjectUrl(''));
          } else {
            let url = R2D.makeURL(R2D.URL.DOMAIN, R2D.URL.URL_PAY_FORM);
            const selectedPlanId =
              R2D.RECURRING_PLANS[plan][time == 'month' ? 1 : time == 'year' ? 12 : 1];
            url = url.includes('?')
              ? url + '&plan_recurring_id=' + selectedPlanId
              : url + '?plan_recurring_id=' + selectedPlanId;
            url += '&lang=' + currLanguage.code;
            url += '&token=' + R2D.token;
            dispatch(setActivePopup({ name: 'payPro', data: url }));
            window.history.replaceState(null, null, createProjectUrl(''));
          }
        }
      }

      if (window.location.search.match('open_renders=1')) {
        if (!user.isLogged()) {
          !configEnableMerchantLogin
            ? dispatch(setActivePopup({ name: 'login' }))
            : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
        } else {
          showStartPopup = false;
          const langCode =
            ~window.location.search.indexOf('#') &&
            window.location.search.split('&') &&
            window.location.search.split('&')[1].split('=')[1];
          langCode && currLanguage.code != langCode && (await changeLang(langCode));
          navigate('/renders');
        }
        window.history.replaceState(null, null, createProjectUrl(''));
      }

      if (window.location.search.match('open_profile=1')) {
        if (!user.isLogged()) {
          !configEnableMerchantLogin
            ? dispatch(setActivePopup({ name: 'login' }))
            : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
        } else {
          showStartPopup = false;
          const langCode =
            ~window.location.search.indexOf('#') &&
            window.location.search.split('&') &&
            window.location.search.split('&')[1].split('=')[1];
          langCode && currLanguage.code != langCode && (await changeLang(langCode));
          const response = await user.loadProfileData();
          if (response.type == 'error')
            dispatch(setActivePopup({ name: 'alert', data: response.data }));
          else {
            dispatch(setProfileData(response));
            dispatch(setActivePopup({ name: 'profile' }));
          }
        }
        window.history.replaceState(null, null, createProjectUrl(''));
      }

      if (window.location.search.match('action=buyCredits')) {
        const creditsNum = window.location.search
          .replace('?', '')
          .split('&')
          .find((i) => ~i.indexOf('count'))
          .split('=')[1];
        if (!user.isLogged()) {
          !configEnableMerchantLogin
            ? dispatch(setActivePopup({ name: 'login', type: 'buy_credits', data: creditsNum }))
            : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
          return;
        } else {
          showStartPopup = false;
          if (!R2D.token) dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));
          else
            dispatch(
              setActivePopup({
                name: 'buyCredits',
                type: 'fromUrl',
                data: {
                  iframe: `${R2D.URL.DOMAIN}/api/credits/get_form?credits=${creditsNum}&lang=${currLanguage.code}&token=${R2D.token}`,
                },
              })
            );
        }
        window.history.replaceState(null, null, createProjectUrl(''));
      }

      if (window.location.search.match('open_tours=1')) {
        if (!user.isLogged()) {
          !configEnableMerchantLogin
            ? dispatch(setActivePopup({ name: 'login' }))
            : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
          return;
        } else {
          showStartPopup = false;
          navigate('/tours');
        }
        window.history.replaceState(null, null, createProjectUrl(''));
      }

      if (R2D.controller.getProjectId()) needToCleanSearch = false;

      if (
        R2D.controller.getProjectId() == 0 &&
        !tryLoadProjectFromStorageResult &&
        !checkProjectForLoadResult &&
        !R2D.Storage.load('r2d_blueScreenPopup') &&
        R2D.config?.data?.start_popup?.show &&
        showStartPopup
      ) {
        dispatch(setActivePopup({ name: 'startPopup' }));
      } else {
        !R2D.scene.viewOnly && !isCurrDeviceAPhone && dispatch(updateDynamicPanelStatus(true));
      }

      if (needToCleanSearch && window.location.search)
        window.history.replaceState(null, null, createProjectUrl(''));
      dispatch(changeWallsHeight(R2D.scene.constructor.cap.wallsHeight));

      R2D.controller.getProjectId() == 0 &&
        R2D.Storage.load('r2d_blueScreenPopup') &&
        dispatch(showTip({ name: 'constructorButtons' }));

      planner.scene.clearSceneAutoSaveStorage();

      const resizeListener = (e) => {
        const plannerElement = document.getElementById('planner');
        planner.setSize(plannerElement?.offsetWidth || 0, plannerElement?.offsetHeight || 0);
        planner.mih()._ruler3d.update();
      };

      window.addEventListener('resize', resizeListener);

      planner.setSize(window.innerWidth, window.innerHeight);

      const response = await user.plannerConnect();
      console.log('Planner connect: ', response);

      if (R2D.config.data.ui.custom_registration) await R2D.loadCustomRegistration();

      R2D.postMessageToParent(JSON.stringify({ action: 'program_ready' }));

      if (!isOrientationPortrait)
        setTimeout(
          () =>
            document.querySelector('.preloader_main') &&
            document.querySelector('.preloader_main').remove(),
          300
        );

      setIsProgramReady(true);

      R2D.controller.projectOpeningStatus != 'opening' && planner.scene.sceneAutoSaveStorage();

      'onstorage' in window
        ? window.addEventListener('storage', storageChangeCallback)
        : planner.scene.tryToAutoLoginOrLogOut();
    }
    init();

    return () => {
      planner.apiScene.removeEventListener(planner.apiScene.SET_ACTIVE_GROUP, onSetGroupActive);
      planner.apiScene.removeEventListener(planner.apiScene.SET_ACTIVE_PRODUCT, onSetProductActive);
      planner.apiScene.removeEventListener(planner.apiScene.QUICK_PANELS_HIDE, quickPanelsHide);
      planner.apiScene.removeEventListener(
        planner.apiScene.UPDATE_IS_THERE_HIDDEN_ELEMENTS,
        onUpdateHiddenElements
      );
      planner.apiScene.removeEventListener(
        planner.apiScene.UPDATE_PROJECT_ONLY_VIEW_STATUS,
        onlyViewProjectStatusUpdate
      );
      planner.apiScene.removeEventListener(planner.apiScene.UPDATE_PROJECT_NAME, updateProjectName);
      planner.apiScene.removeEventListener(
        planner.apiScene.PASTE_PREMIUM_PRODUCT_ERROR,
        pastePremiumProductError
      );
      planner.apiScene.removeEventListener(planner.apiScene.SHOW_ALERT_POPUP, onShowAlertPopup);

      planner.apiConstr.removeEventListener(planner.apiConstr.USE_TAB_TIP_START, useTabTipStart);
      planner.apiConstr.removeEventListener(planner.apiConstr.QUICK_PANELS_HIDE, quickPanelsHide);
      planner.apiConstr.removeEventListener(planner.apiConstr.USE_TAB_TIP_MOVE, useTabTipMove);
      planner.apiConstr.removeEventListener(
        planner.apiConstr.USE_ENTER_TIP_START,
        useEnterTipStart
      );
      planner.apiConstr.removeEventListener(planner.apiConstr.USE_ENTER_TIP_MOVE, useEnterTipMove);
      planner.apiConstr.removeEventListener(
        planner.apiConstr.USE_ENTER_TAB_TIP_START,
        useEnterTabTipStart
      );
      planner.apiConstr.removeEventListener(
        planner.apiConstr.USE_ENTER_TAB_TIP_MOVE,
        useEnterTabTipMove
      );
      planner.apiConstr.removeEventListener(planner.apiConstr.SHOW_ALERT_POPUP, onShowAlertPopup);

      isCurrDeviceAPhone &&
        window
          .matchMedia('(orientation: portrait)')
          .removeEventListener('change', onOrientationChange);
    };
  }, []);

  useEffect(() => {
    planner.apiScene.addEventListener(planner.apiScene.PRELOADER_TOGGLE, onPreloaderToggle);
    return () =>
      planner.apiScene.removeEventListener(planner.apiScene.PRELOADER_TOGGLE, onPreloaderToggle);
  }, [preloaderStatus]);

  useEffect(() => {
    if (isProjectBelongToLoggedUser && isProjectOnlyView) {
      dispatch(updateDynamicPanelStatus(true));
      dispatch(updateDynamicToggleButtonStatus(true));
      if (controlPanelActiveMode != 'walk') {
        const furnitureData = planner.getCatalogProducts();
        dispatch(
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
      }
    }
  }, [isProjectBelongToLoggedUser]);

  useEffect(() => {
    planner.apiScene.addEventListener(planner.apiScene.HISTORY_UNDO_REDO, onHistoryUndoRedo);
    planner.apiConstr.addEventListener(planner.apiConstr.HISTORY_UNDO_REDO, onHistoryUndoRedo);
    planner.apiScene.addEventListener(
      planner.apiScene.RETURN_TO_DEFAULT_MODE,
      onReturnToDefaultMode
    );
    return () => {
      planner.apiConstr.removeEventListener(planner.apiConstr.HISTORY_UNDO_REDO, onHistoryUndoRedo);
      planner.apiScene.removeEventListener(planner.apiScene.HISTORY_UNDO_REDO, onHistoryUndoRedo);
      planner.apiScene.removeEventListener(
        planner.apiScene.RETURN_TO_DEFAULT_MODE,
        onReturnToDefaultMode
      );
    };
  }, [prevControlPanelMode, activeControlPanelData]);

  useEffect(() => {
    planner.scene.clearSceneAutoSaveServer();
    userProfileData?.autoSave &&
      R2D.controller.projectOpeningStatus == 'ready' &&
      planner.scene.sceneAutoSaveServer(user.getKey());
    planner.apiScene.addEventListener(planner.apiScene.PROJECT_LOADED, onProjectLoaded);
    return () =>
      planner.apiScene.removeEventListener(planner.apiScene.PROJECT_LOADED, onProjectLoaded);
  }, [userProfileData?.autoSave]);

  useEffect(() => {
    !isOrientationPortrait &&
      isProgramReady &&
      setTimeout(
        () =>
          document.querySelector('.preloader_main') &&
          document.querySelector('.preloader_main').remove(),
        300
      );
  }, [isOrientationPortrait]);

  useEffect(() => {
    planner.apiScene.addEventListener(planner.apiScene.WHEEL_ZOOM, onWheelZoom);
    planner.apiConstr.addEventListener(planner.apiConstr.WHEEL_ZOOM, onWheelZoom);
    planner.apiConstr.addEventListener(planner.apiConstr.CAMERA_MOVE, onCameraMove);
    planner.apiScene.addEventListener(planner.apiScene.CAMERA_MOVE, onCameraMove);
    planner.apiScene.addEventListener(planner.apiScene.OBJECT_DRAG_OUT_OF_WALL, onDragObjOutOfWall);
    planner.scene.addEventListener(planner.scene.RENDERS_UPDATE, onRendersUpdate);
    window.addEventListener('message', messageListener, false);

    return () => {
      planner.apiScene.removeEventListener(planner.apiScene.WHEEL_ZOOM, onWheelZoom);
      planner.apiConstr.removeEventListener(planner.apiConstr.WHEEL_ZOOM, onWheelZoom);
      planner.apiConstr.removeEventListener(planner.apiConstr.CAMERA_MOVE, onCameraMove);
      planner.apiScene.removeEventListener(planner.apiScene.CAMERA_MOVE, onCameraMove);
      planner.apiScene.removeEventListener(
        planner.apiScene.OBJECT_DRAG_OUT_OF_WALL,
        onDragObjOutOfWall
      );
      planner.scene.removeEventListener(planner.scene.RENDERS_UPDATE, onRendersUpdate);
      window.removeEventListener('message', messageListener, false);
    };
  }, [activeViewMode, controlPanelActiveMode, userProfileData, popups]);

  useEffect(() => {
    async function load() {
      let userUpload;
      if (isLogged) {
        if (!userProfileData?.name) {
          const response = await user.loadProfileData();
          if (response.type == 'error')
            dispatch(setActivePopup({ name: 'alert', data: response.data }));
          else dispatch(setProfileData(response));
        }

        userUpload = await planner.scene.categoryDataLoad(
          `${R2D.URL.DOMAIN + R2D.URL.URL_CATALOG_SEARCH}&category_tag&my=1`
        );
        planner.setUserUpload(userUpload);
      } else planner.setUserUpload(null);

      planner.apiScene.dispatchEvent(new Event(planner.apiScene.FAVORITES_BUTTON, {}));
      planner.apiScene.dispatchEvent(
        new Event(planner.apiScene.USER_UPLOAD_BUTTON, { status: userUpload?.length > 0 })
      );
    }
    load();
  }, [isLogged]);

  useEffect(() => {
    planner.scene.addEventListener(planner.scene.UPDATE_LOAD_STATUS, onProjectElementsLoadProgress);
    return () =>
      planner.scene.removeEventListener(
        planner.scene.UPDATE_LOAD_STATUS,
        onProjectElementsLoadProgress
      );
  }, [popups]);

  if (isOrientationPortrait) {
    return <PortraitBlocker translation={translation} />;
  }

  return (
    <div className={classes.main}>
      <GlobalPreload loading={preloaderStatus} />

      <div className={classes.content}>
        <LeftMain />

        <div className={classes.plannerMain} id={'plannerMain'}>
          {controlPanelActiveMode == 'renderMake' ? null : (
            <div>
              <AnimatePresence mode="wait">
                {controlPanelActiveMode != 'alignDrawing' && (
                  <motion.div
                    initial={{ transform: 'translateY(-110%)' }}
                    animate={{ transform: 'translateY(0%)' }}
                    exit={{ transform: 'translateY(-110%)' }}
                    transition={{ duration: 0.3 }}
                    key={'topPanel'}
                    className={classes.panel_top}
                  >
                    <TopPanel />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {activeViewMode != 'viewWalk' && controlPanelActiveMode != 'alignDrawing' && (
                  <motion.div
                    initial={{ transform: 'translateX(110%)' }}
                    animate={{ transform: 'translateX(0%)' }}
                    exit={{ transform: 'translateX(110%)' }}
                    transition={{ duration: 0.3 }}
                    key={'rightPanel'}
                    className={classes.right_bar_wrap}
                  >
                    <RightPanel />
                  </motion.div>
                )}

                <BottomPanel />
              </AnimatePresence>
            </div>
          )}

          <CenterPanel />
        </div>

        <Popups />
        <QuickPanels />

        <Tips showTipUseTab={showTipUseTab} showTipUseEnter={showTipUseEnter} />
      </div>
    </div>
  );
};

export default App;
