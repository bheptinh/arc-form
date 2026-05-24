import React, { useEffect, useState } from 'react';
import {createUseStyles} from "react-jss";
import { useSelector, useDispatch } from 'react-redux';
import { AnimatePresence, motion } from "framer-motion";

import { planner, user } from './initR2D';

import { closeActivePopup, selectPopups, setActivePopup, setPopupData } from './redux/features/popups/popupsSlice';
import { languageChange, selectLanguages, selectTranslation } from './redux/features/language/languageSlice';
import { changeActivePano, updateIsThereHiddenElements, selectPreloaderStatus, selectIsProjectBelongToLoggedUser, updateIsProjectOnlyView, updateIsProjectBelongToLoggedUser, selectIsProjectOnlyView, updatePreloaderStatus } from './redux/features/common/commonSlice';
import { changeUndoRedo } from './redux/features/topPanel/topPanelSlice';
import { removeQuickPanel, removeQuickPanelAll, showQuickPanel } from './redux/features/quickPanels/quickPanelsSlice';
import { changeImagePlanUploadType, changeWallsHeight } from './redux/features/constructor/constructorSlice';
import { selectActiveViewMode, setActiveViewMode } from './redux/features/viewMode/viewModeSlice';
import { selectTips, showTip } from './redux/features/tips/tipsSlice';
import { saveLoggedStatus, selectIsLogged, selectUserProfileData, selectUserProjectActive, setActiveProjectName, setProfileData, setProjectPlan, userLogout } from './redux/features/user/userSlice';
import {
    changeActiveControlPanelMode,
    controlPanelHistoryClear,
    controlPanelUpdateBreadCrumbs,
    selectActiveControlPanelMode,
    selectControlPanelStatus,
    selectControlPanelData,
    selectPrevControlPanelMode,
    updateDynamicPanelStatus,
    selectDynamicPanelStatus,
    updateDynamicToggleButtonStatus,
    selectActiveControlPanelModeData
} from './redux/features/control/controlPanelSlice';

import TopPanel from './components/top/TopPanel';
import CenterPanel from './components/center/CenterPanel';
import RightPanel from './components/right_new/RightPanel';
import BottomPanel from './components/bottom/BottomPanel';
import Popups from './components/popups/Popups';
import QuickPanels from './components/quick/QuickPanels';
import Tip from './components/tips/Tip';
import LeftMain from './components/left_new/LeftMain';

import { createProjectUrl } from "./utils/UrlHelper";

const useStyle = createUseStyles({
    main:{
        height: '100%'
    },
    content:{
        fontFamily: 'Roboto, sans-serif',
        color: '#000',
        height: "100%",
        userSelect: 'none',
        '-webkit-touch-callout': 'none', /* Safari */
        '-webkit-user-select': 'none', /* Chrome */     
           '-moz-user-select': 'none', /* Firefox */
            '-ms-user-select': 'none', /* Internet Explorer/Edge */
            '-webkit-tap-highlight-color': 'transparent',
        display: 'flex'
    },
    content_portret:{
        background: "#66ACF4",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        flexDirection: 'column',
        padding: '0 20px',
        zIndex: 200,
        position: 'absolute',
        left: 0,
        top: 0,
        '& h1':{
            fontSize: 36,
            fontWeight: 400,
            lineHeight: '42.19px',
            textAlign: 'center',
            color: '#ffffff',
            marginBottom: 10
        },
        '& p':{
            fontSize: 18,
            fontWeight: 400,
            lineHeight: '21.09px',
            textAlign: 'center',
            color: '#ffffff'
        }
    },
    content_portret_img:{
        margin: '40px 0'
    },
    plannerRenderViewTypes_types:{
        display: 'flex',
        marginRight: 40
    },
    plannerRenderViewTypes:{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        top: 20,
        zIndex: 2,
        display: 'flex'
    },
    plannerRenderViewTypes_type:{
        fontSize: 12,
        fontWeight: 400,
        color: '#B6B6B6',
        padding: '5px 20px',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        border: '1px solid transparent',
        borderRadius: 3,
        cursor: 'pointer'
    },
    plannerRenderViewTypes_type_active:{
        border: '1px solid #9DD900',
        color: '#ffffff',
        cursor: 'default'
    },
    plannerRenderViewTypes_screens:{
        display: 'flex'
    },
    plannerRenderViewTypes_screen:{
        padding: '5px 10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid transparent',
        borderRadius: 3,
        cursor: 'pointer',
        '& span':{
            background: '#B6B6B6'
        }
    },
    plannerRenderViewTypes_screen_land:{
        '& span':{
            width: 20,
            height: 12
        }
    },
    plannerRenderViewTypes_screen_port:{
        '& span':{
            width: 12,
            height: 20
        }
    },
    plannerRenderViewTypes_screen_active:{
        border: '1px solid #9DD900',
        cursor: 'default',
        '& span':{
            background: '#ffffff'
        }
    },
    right_bar_wrap:{
        position: 'absolute',
        right: 2,
        zIndex: 2,
        top: 0,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none',
        width: 50
    },
    panel_top:{
        position: 'absolute',
        right: 2,
        top: 2,
        display: 'flex',
        zIndex: 3
    },
    plannerMain:{
        position: 'relative',
        width: '100%'
    }
});

const Main = props => {
    const classes = useStyle();

    let activeViewMode = useSelector(selectActiveViewMode);
    let translation = useSelector(selectTranslation);

    let dispatch = useDispatch();

    let controlPanelStatus = useSelector(selectControlPanelStatus);
    let userProfileData = useSelector(selectUserProfileData);
    let controlPanelData = useSelector(selectControlPanelData);
    let prevControlPanelMode = useSelector(selectPrevControlPanelMode);
    let tips = useSelector(selectTips);
    let isLogged = useSelector(selectIsLogged);
    let controPanelActiveMode = useSelector(selectActiveControlPanelMode);
    let preloaderStatus = useSelector(selectPreloaderStatus);
    let userProjectActive = useSelector(selectUserProjectActive);
    let isProjectOnlyView = useSelector(selectIsProjectOnlyView);
    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);

    let languages = useSelector(selectLanguages);
    let currLanguage = languages.find(i => i.current == 1);

    let [showTipSelectGroup, setTipSelectGroup] = useState(false);
    let [showTipChangeWallHeight, setTipChangeWallHeight] = useState(false);
    let [showTipUploadCustomMat, setTipUploadCustomMat] = useState(false);
    let [configEnableMerchantLogin, setConfigEnableMerchantLogin] = useState(R2D.config.data.enable_merchant_login);
    let [showTipUseTab, setTipUseTab] = useState({status: false, position: {x: 0, y: 0}});
    let [showTipUseEnter, setTipUseEnter] = useState({status: false, position: {x: 0, y: 0}});
    let [showTipMergeGroupButton, setShowTipMergeGroupButton] = useState(false);
    let [showTipPanorams, setShowTipPanorams] = useState(false);
    let [showTipRenderMake, setShowTipRenderMake] = useState(false);
    let [isProOptionEnabled, setIsProOptionEnabled] = useState(R2D.OPTIONS.PRO_PLAN);
    
    let currOS = R2D.controller.getCurrentOS();
    let isCurrDeviceAPhone = currOS == "iOS" || currOS == "Android";

    let [isOrientationPortrait, setIsOrientationPortrait] = useState(isCurrDeviceAPhone ? window.matchMedia("(orientation: portrait)").matches : false);

    let [isProgramReady, setIsProgramReady] = useState(false);

    let isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);

    let popups = useSelector(selectPopups);
    let dynamicPanelStatus = useSelector(selectDynamicPanelStatus);

    function changeMIHStateListener(e) {
        if(userProfileData?.tips && userProfileData.tips != 0) {
            let mih = planner.mih();
            setTimeout(function() {
                if (!tips.selectGroup.showed && e.newState == mih.stateMain && e.oldState == mih.stateDraggingProdFromCatalog)
                {
                    let sceneObjs = R2D.scene.getSceneObjects();
                    let num = 0;
                    for (let i = 0; i < sceneObjs.length; i++)
                    {
                        if (R2D.ObjectViewer3DGroup.validSceneObject(sceneObjs[i])) num++;
                        if (num >= 3) break;
                    }

                    if (num >= 3) setTipSelectGroup(true);
                }

            }, 100);

            if (e.newState == mih.stateMain) planner.apiScene.dispatchEvent(new Event(planner.apiScene.TIPS_SAVE_PROJECT, {}));
        }
    }

    function changeConstructorStateListener() {
        if(userProfileData?.tips && userProfileData.tips != 0) {
            setTimeout(function() {
                if (WC.core.roomPoints.length > 0 && (R2D.viewConstructor.state == R2D.viewConstructor.stateEditing) &&
                    (R2D.viewConstructor.prevState == R2D.viewConstructor.stateMakingRoom ||
                    R2D.viewConstructor.prevState == R2D.viewConstructor.stateMakingWalls ||
                    R2D.viewConstructor.prevState == R2D.viewConstructor.stateMakingRect))
                {
                    setTipChangeWallHeight(true);
                }
            }, 200);
        }

        if (R2D.viewConstructor.state == R2D.viewConstructor.stateEditing) planner.apiScene.dispatchEvent(new Event(planner.apiScene.TIPS_SAVE_PROJECT, {}));
    }

    function customUploadListener(e) {
        if(userProfileData?.tips && userProfileData.tips != 0) {
            setTimeout(function() {
                if (!tips.uploadCustomMat.showed) setTipUploadCustomMat(true);
            }, 100);
        }
    }


    let tipMergeGroupButtonListener = e => {
        if(userProfileData?.tips && userProfileData.tips != 0) {
            setTimeout(function() {
                if (!tips.mergeGroupButton.showed) setShowTipMergeGroupButton(true);
            }, 100);
        }
    }
    let tipPanoramsListener = e => {
        if(userProfileData?.tips && userProfileData.tips != 0) {
            setTimeout(function() {
                if (!tips.panorams.showed) setShowTipPanorams(true);
            }, 100);
        }
    }

    let tipRenderMakeListener = e => {
        if(userProfileData?.tips && userProfileData.tips != 0) {
            setTimeout(function() {
                if (!tips.tipRenderMake.showed) setShowTipRenderMake(true);
            }, 100);
        }
    }

    let onRendersUpdate = data => {
        dispatch(setActivePopup({name: "completeMessage", positionX: "left", type: data.data.status == "stored" ? 'complete' : 'error', data: data.data.status == "stored" ? "NOTIFY_RENDER_READY" : "NOTIFY_RENDER_ERROR"}));
        if(popups.rendersAnd360Popup.status) planner.apiScene.dispatchEvent(new Event(planner.apiScene.RENDERS_DATA_UPDATED, {}));
    }

    let onProjectLoaded = async e => {
        (!R2D.scene.viewOnly || ( R2D.scene.getProjectUserKey() == user.getKey() || (R2D.scene.getProjectUserKey() == null && user.getKey() == null) )) && dispatch(updateDynamicPanelStatus(true));
        if(e.data?.status == "error") {
            dispatch(setActivePopup({name: "alert", data: e.data.data || 'TEXT_ERROR_LOAD_DATA'}));
            return;
        }
        if(!e.data.id) {
            dispatch(changeActivePano({ id: 0, previewImgSrc: "", rotation: 0}));
        }
        else {
            let id = e.data.id;
            let rotation = e.data.rotation;
            let panorams = planner.getPanorams();
            let panoPreviewSrc = panorams.find(i => i.id == id)?.source.images.preview;
            dispatch(changeActivePano({ id, previewImgSrc: panoPreviewSrc, rotation}));
        }
        if(e.data.viewState) {
            let newState = e.data.viewState.state == "2d" ? "view2d" :
            e.data.viewState.state == "3d" ? "view3d" :
            e.data.viewState.state == "walk" ? "viewWalk" :
            e.data.viewState.state == "constructor" ? "constr" : null;
            dispatch(setActiveViewMode(newState));

            if(R2D.scene.viewOnly && R2D.scene.getProjectUserKey() != user.getKey()) {
                dispatch(changeActiveControlPanelMode({mode: 'to2d3d'}));
            } else {
                if(newState == 'view2d' || newState == 'view3d') {
                    let furnitureData = planner.getCatalogProducts();
                    dispatch(changeActiveControlPanelMode({mode: 'furniture', data: controlPanelData['furniture'].history.length < 1 ? {type: "catalog", addType: "main", id: null, lastSavedScroll: 0, data: furnitureData} : null}));
                } else if(newState == 'viewWalk') {
                    dispatch(changeActiveControlPanelMode({mode: 'walk', data: controlPanelData['walk'].history.length < 1 ? {type: "panorams", lastSavedScroll: 0} : null}));
                }
            }
        }
        if(e.data.name) {
            dispatch(setActiveProjectName(e.data.name))
        }
        if(e.data.plan) {
            dispatch(setProjectPlan(e.data.plan))
        }
        dispatch(changeWallsHeight(R2D.scene.constructor.cap.wallsHeight));
        dispatch(changeImagePlanUploadType(R2D.commonSceneHelper.drawingHelper.state != null ? R2D.commonSceneHelper.drawingHelper.state : null));

        if(userProfileData?.autoSave) {
            planner.scene.clearSceneAutoSaveServer();
            planner.scene.sceneAutoSaveServer(user.getKey());
        }
    };

    let onProjectElementsLoadProgress = e => {
        let currentLoadedCount = R2D.commonSceneHelper.constructorHelper.loadedMaterialsCount + R2D.commonSceneHelper.productHelper.loadedMaterialsCount + R2D.commonSceneHelper.productHelper.loadedModelsCount;
        let currentNotLoadedCount = R2D.commonSceneHelper.constructorHelper.notLoadedMaterialsCount + R2D.commonSceneHelper.productHelper.notLoadedMaterialsCount + R2D.commonSceneHelper.productHelper.notLoadedModelsCount;
        let loadedAllCount = R2D.scene.startMaterialsIds.length + R2D.scene.startModelsIds.length;
        if((currentLoadedCount + currentNotLoadedCount) < loadedAllCount) {
            if(popups.projectDataLoadPopup.status) dispatch(setPopupData({name: "projectDataLoadPopup", type: 'loading', data: translation["NOTIFY_LOADING_PRODUCTS_DATA"] + currentLoadedCount  + '/' + loadedAllCount}));
            else dispatch(setActivePopup({name: "projectDataLoadPopup", positionX: "left", type: 'loading', data: translation["NOTIFY_LOADING_PRODUCTS_DATA"] + currentLoadedCount  + '/' + loadedAllCount}));
        }
        else {
            if(popups?.projectDataLoadPopup?.status) dispatch(setPopupData({name: "projectDataLoadPopup", type: currentNotLoadedCount > 0 ? 'error' : 'done', data: translation[currentNotLoadedCount > 0 ? "NOTIFY_LOADED_PRODUCTS_DATA_ERROR" : "NOTIFY_LOADED_PRODUCTS_DATA_COMPLETE"]}));
            else dispatch(setActivePopup({name: "projectDataLoadPopup", positionX: "left", type: currentNotLoadedCount > 0 ? 'error' : 'done', data: translation[currentNotLoadedCount > 0 ? "NOTIFY_LOADED_PRODUCTS_DATA_ERROR" : "NOTIFY_LOADED_PRODUCTS_DATA_COMPLETE"]}));
        }
    }

    let onHistoryUndoRedo = e => {
        if(e.data.removeQuickPanel) {
            dispatch(removeQuickPanelAll());
        }
        if(e.data.clearDynamicPanel) {
            let furnitureData = planner.getCatalogProducts();
            if(!activeControlPanelData.isInControlPanel) {
                if(prevControlPanelMode) {
                    dispatch(changeActiveControlPanelMode({mode: prevControlPanelMode}))
                } else {
                    dispatch(changeActiveControlPanelMode({
                        mode: 'furniture', 
                        data: controlPanelData['furniture'].history.length < 1 ? {type: "catalog", addType: "main", id: null, lastSavedScroll: 0, data: furnitureData} : null
                    }));
                }
            }
        }

        dispatch(changeUndoRedo());
    }

    let onWheelZoom = event => {
        let delta = event.data.delta > 0 ? -1 : 1;
        if(controPanelActiveMode == 'renderMake') {
            R2D.Viewers.cameraZoom(-delta);
        } else {
            if(activeViewMode == "constr") {
                WC.WallsEditor._instance.zoom(WC.canvasWidth / 2, WC.canvasHeight / 2, -delta);
                R2D.ViewerScene2D._instance.cameraZoom(delta);
            } else if(activeViewMode == "view2d") {
                R2D.ViewerScene2D._instance.cameraZoom(-delta);
                WC.WallsEditor._instance.zoom(WC.canvasWidth / 2, WC.canvasHeight / 2, delta);
            } else {
                R2D.Viewers.cameraZoom(-delta);
            }
        }
    }

    let onCameraMove = e => {
        if(activeViewMode == "constr" && controPanelActiveMode != "renderMake") {
            R2D.ViewerScene2D._instance.cameraMove(e.data.x, e.data.y);
        } else {
            R2D.Viewers.cameraMove(e.data.x, e.data.y);
        }
    }

    async function messageListener(e) {
        if (!e.data || typeof e.data !== 'string' || e.data.startsWith('/*framebus*/')) return;
        let dataObj = {};
        try
        {
            dataObj = JSON.parse(e.data);
        } catch ( error ) {
            console.error("Error parse JSON string!");
            return;
        }

        let saveProject = async name => {
            let project = {name, createNew: false};
            if(R2D.controller.getProjectUserKey() != user.getKey()) {
                project.createNew = true;
            }
            let result = await planner.scene.saveProject(project);
            if(result?.type == 'error') {
                dispatch(updatePreloaderStatus(false));
                return dispatch(setActivePopup({name: "alert", data: result?.data || 'TEXT_ERROR_LOAD_DATA'}));
            }

            let response = await user.loadProfileData();
            if(response.type == "error") dispatch(setActivePopup({name: "alert", data: response.data}))
            else dispatch(setProfileData(response));
        
            dispatch(setActivePopup({name: "completeMessage", positionX: "left", data: "NOTIFY_SAVE_COMPLETE"}));
            R2D.scene.updateProjectUserPlan('free');
            dispatch(setProjectPlan('free'));
            planner.scene.setIsProjectBelongToLoggedUserStatus(R2D.scene.getProjectUserKey() == user.getKey())
            dispatch(updateIsProjectBelongToLoggedUser(R2D.scene.getProjectUserKey() == user.getKey()));

            R2D.postMessageToParent(JSON.stringify({
                action: "project_saved",
                data: {
                    id: R2D.scene.getProjectId(),
                    name: R2D.scene.getProjectName(),
                    hash: R2D.scene.getProjectHash(),
                }
            }));
        }

        if (dataObj.action == 'load_project') {
            if (dataObj.hash) {
                planner.scene.clearSceneAutoSaveStorage();
                await planner.scene.loadProject(dataObj.hash, true);
                planner.scene.sceneAutoSaveStorage(dataObj.hash);
                popups.startPopup.status && dispatch(closeActivePopup({name: "startPopup"}));
            }
        }
        else if (dataObj.action == 'set_token') {
            if (dataObj.token) {
                user.saveToken(dataObj.token, false);

                let response = await user.checkIsLogged();
                if(response.type == "error") {
                    dispatch(setActivePopup({name: "alert", data: response.data}));
                    return dispatch(saveLoggedStatus({ logged: false }));
                } else dispatch(saveLoggedStatus(response));

                if(user.data.autoSave) {
                    planner.scene.clearSceneAutoSaveServer();
                    planner.scene.sceneAutoSaveServer(user.getKey());
                };
            }
        }
        else if (dataObj.action == 'save_estimation') {
            R2D.controller.estimationToFile();
        }
        else if (dataObj.action == 'get_estimation') {
            let data = R2D.controller.getEstimation();
            R2D.postMessageToParent(JSON.stringify({
                action: "got_estimation",
                data
            }));
        }
        else if (dataObj.action == 'set_country') {
            if (dataObj.country) {
                R2D.controller.setCountry(dataObj.country);
                let start2D3DData = await user.loadRightPanelData(R2D.URL.CATALOG_TREE);
                planner.setCatalogProducts(start2D3DData.tree);
                if(activeViewMode == "view2d" || activeViewMode == "view3d" && controlPanelStatus) {
                    dispatch(controlPanelHistoryClear());
                    dispatch(controlPanelUpdateBreadCrumbs({updateType: "clear"}));

                    let needToAddStartData = controlPanelData['furniture'].history.length < 1;
                    let furnitureData = planner.getCatalogProducts();
                    dispatch(changeActiveControlPanelMode({mode: "furniture", data: needToAddStartData ? {type: "catalog", addType: "main", id: null, lastSavedScroll: 0, data: furnitureData} : null}));

                    planner.mih().changeState(planner.mih().stateMain);
                    planner.mih().unsetActiveObject();
                  }
            }
        }
        else if(dataObj.action == 'save_project') {
            if ( !user.isLogged() ) {
                !configEnableMerchantLogin ? dispatch(setActivePopup({name: "login"})) : R2D.postMessageToParent(JSON.stringify({ action: "merchant_login" }))
                return;
            }
            else if (!planner.scene.wasSaved()) {
                if(user.data.maxProjects > 0 && user.data.projectCount >= user.data.maxProjects) dispatch(setActivePopup({name: 'upgradePlan', addType: "configCreate", type: 'upgradeOverLimit'}));
                else {
                    if(!dataObj.projectName) {
                        dispatch(setActivePopup({ name: "setProjectName", type: "create", addType: "configCreate" }));
                    } else {
                        saveProject(dataObj.projectName);
                    }
                }
            } 
            else if(R2D.controller.getProjectUserKey() && R2D.controller.getProjectUserKey() != user.getKey()) {
                let allPremiumPlanOfSceneObjects = new Set();
                let allElemsWithOwner = new Set();
                Object.values(R2D.Pool._products_data).forEach(i => {
                    Array.isArray(i.plan) && allPremiumPlanOfSceneObjects.add(i.plan[0]);
                    i.isOwner && allElemsWithOwner.add(i.type);
                });
                allPremiumPlanOfSceneObjects = Array.from(allPremiumPlanOfSceneObjects);
                allElemsWithOwner = Array.from(allElemsWithOwner);
                let isThereObjectsWithOwnerThatDontMatchUserPremiumPlan = allElemsWithOwner.length > 0 && (user.data.plan == 'free' || (user.data.plan == 'basic' && allElemsWithOwner.find(i => i == R2D.ProductType.MODEL)));
                let isTherePremiumObjectThatDontMatchUserPremiumPlan = allPremiumPlanOfSceneObjects.length > 0 && (user.data.plan == 'free' || (user.data.plan == 'basic' && allPremiumPlanOfSceneObjects.find(i => i == 'pro')));
                let neededPlan = allPremiumPlanOfSceneObjects.find(i => i == 'pro') || allElemsWithOwner.find(i => i == R2D.ProductType.MODEL) ? 'pro' : allPremiumPlanOfSceneObjects.find(i => i == 'basic') || allElemsWithOwner.length > 0 ? 'basic' : 'free'; 
                if(user.data.maxProjects > 0 && user.data.projectCount >= user.data.maxProjects) dispatch(setActivePopup({name: 'upgradePlan', type: 'upgradeOverLimit', addType: "configCreate", addData: {plan: neededPlan}}));
                else {
                    if(isTherePremiumObjectThatDontMatchUserPremiumPlan || isThereObjectsWithOwnerThatDontMatchUserPremiumPlan) dispatch(setActivePopup({name: 'upgradePlan', type: 'createNewPremiumProject', addType: "configCreate", addData: {plan: neededPlan}}));
                    else {
                        if(!dataObj.projectName) {
                            dispatch(setActivePopup({ name: "setProjectName", type: "create", addType: "configCreate" }));
                        } else {
                            saveProject(dataObj.projectName);
                        }
                    }
                }
            }
            else {
                dispatch(setActivePopup({name: "loadingMessage", data: "TEXT_WAIT"}));
                let result = await planner.scene.saveProject();
                if(result?.type == 'error') return dispatch(setActivePopup({name: "alert", data: result?.data || 'TEXT_ERROR_LOAD_DATA'}));
                dispatch(closeActivePopup({name: "loadingMessage"}));
                dispatch(setActivePopup({name: "completeMessage", positionX: "left", data: "NOTIFY_SAVE_COMPLETE"}));
                user.data.autoSave == null && dispatch(setActivePopup({name: "autoSaveEnable"}));
                R2D.postMessageToParent(JSON.stringify({
                    action: "project_saved",
                    data: {
                        id: R2D.scene.getProjectId(),
                        name: R2D.scene.getProjectName(),
                        hash: R2D.scene.getProjectHash(),
                    }
                }));
            }
        }
        else if(dataObj.action == 'rename_project') {
            if (!planner.scene.wasSaved() || R2D.controller.getProjectUserKey() != user.getKey()) {
                if(user.data.maxProjects > 0 && user.data.projectCount >= user.data.maxProjects && !isProOptionEnabled) dispatch(setActivePopup({name: 'upgradePlan'}));
                else dispatch(setActivePopup({name: "confirm", type: "project_save_before_rename", addType: "configRename"}))
            } else {
                dispatch(setActivePopup({name: "setProjectName", type: "rename", addType: "configRename"}));
            }
        }
        else if(dataObj.action == 'new_project') {
            if(user.data.maxProjects > 0 && user.data.projectCount >= user.data.maxProjects && !isProOptionEnabled) dispatch(setActivePopup({name: 'upgradePlan'}));
            else {
                if(planner.scene.wasChanged()) {
                    dispatch(setActivePopup({name: "saveBefore", type: "createNew"}));
                } else {
                    planner.scene.clearSceneAutoSaveStorage();
                    window.history.replaceState(null, null, createProjectUrl(''));
                    window.location.reload();
                }
            }
            
        }
        else if(dataObj.action == 'clear_project') planner.scene.wasChanged ? dispatch(setActivePopup({name: "confirm", type: "project_clear"})) : null;
        else if(dataObj.action == 'save_as') {
            if ( !user.isLogged() ) !configEnableMerchantLogin ? dispatch(setActivePopup({name: "login"})) : R2D.postMessageToParent(JSON.stringify({ action: "merchant_login" }));
            else {
                let allPremiumPlanOfSceneObjects = new Set();
                let allElemsWithOwner = new Set();
                Object.values(R2D.Pool._products_data).forEach(i => {
                    Array.isArray(i.plan) && allPremiumPlanOfSceneObjects.add(i.plan[0]);
                    i.isOwner && allElemsWithOwner.add(i.type);
                });
                allPremiumPlanOfSceneObjects = Array.from(allPremiumPlanOfSceneObjects);
                allElemsWithOwner = Array.from(allElemsWithOwner);
                let isThereObjectsWithOwnerThatDontMatchUserPremiumPlan = allElemsWithOwner.length > 0 && (user.data.plan == 'free' || (user.data.plan == 'basic' && allElemsWithOwner.find(i => i == R2D.ProductType.MODEL)));
                let isTherePremiumObjectThatDontMatchUserPremiumPlan = allPremiumPlanOfSceneObjects.length > 0 && (user.data.plan == 'free' || (user.data.plan == 'basic' && allPremiumPlanOfSceneObjects.find(i => i == 'pro')));
                let neededPlan = allPremiumPlanOfSceneObjects.find(i => i == 'pro') || allElemsWithOwner.find(i => i == R2D.ProductType.MODEL) ? 'pro' : allPremiumPlanOfSceneObjects.find(i => i == 'basic') || allElemsWithOwner.length > 0 ? 'basic' : 'free'; 
                if(user.data.maxProjects > 0 && user.data.projectCount >= user.data.maxProjects) dispatch(setActivePopup({name: 'upgradePlan', type: 'upgradeOverLimit', addType: "configCreate", addData: {plan: neededPlan}}));
                else {
                    if(isTherePremiumObjectThatDontMatchUserPremiumPlan || isThereObjectsWithOwnerThatDontMatchUserPremiumPlan) dispatch(setActivePopup({name: 'upgradePlan', type: 'createNewPremiumProject', addType: "configCreate", addData: {plan: neededPlan}}));
                    else {
                        if(!dataObj.projectName) {
                            dispatch(setActivePopup({ name: "setProjectName", type: "saveAs", addType: "configCreate" }));
                        } else {
                            if(dataObj.projectName == planner.scene.getProjectName()) {
                                let project = {name: dataObj.projectName, createNew: false};
                                let result = await planner.scene.saveProject(project);
                                if(result?.type == 'error') {
                                    dispatch(updatePreloaderStatus(false));
                                    return dispatch(setActivePopup({name: "alert", data: result?.data || 'TEXT_ERROR_LOAD_DATA'}));
                                }
                            } else {
                                let project = {name: dataObj.projectName, createNew: true};
                                let result = await planner.scene.saveProject(project);
                                if(result?.type == 'error') {
                                    dispatch(updatePreloaderStatus(false));
                                    return dispatch(setActivePopup({name: "alert", data: result?.data || 'TEXT_ERROR_LOAD_DATA'}));
                                }
                    
                                let response = await user.loadProfileData();
                                if(response.type == "error") dispatch(setActivePopup({name: "alert", data: response.data}))
                                else dispatch(setProfileData(response));
                            }
                            
                            dispatch(setActivePopup({name: "completeMessage", positionX: "left", data: "NOTIFY_SAVE_COMPLETE"}));
                            R2D.scene.updateProjectUserPlan('free');
                            dispatch(setProjectPlan('free'));
                            planner.scene.setIsProjectBelongToLoggedUserStatus(R2D.scene.getProjectUserKey() == user.getKey())
                            dispatch(updateIsProjectBelongToLoggedUser(R2D.scene.getProjectUserKey() == user.getKey()));
                
                            R2D.postMessageToParent(JSON.stringify({
                                action: "project_saved",
                                data: {
                                    id: R2D.scene.getProjectId(),
                                    name: planner.scene.getProjectName(),
                                    hash: R2D.scene.getProjectHash(),
                                }
                            }));
                        }
                    }
                }
            }
        }
        else if(dataObj.action == 'export_project') {
            if(!user.isLogged()) {
                !configEnableMerchantLogin ?
                dispatch(setActivePopup({name: "login"})) :
                R2D.postMessageToParent(JSON.stringify({ action: "merchant_login" }));
                return;
            }
            else if(R2D.controller.getProjectId() == 0 || R2D.controller.getProjectUserKey() != user.getKey()) {
                dispatch(setActivePopup({name: "alert", data: "TEXT_EXPORT_SAVE_BEFORE"}));
                return;
            }
            else if(dataObj.exportType) {
                if(user.data.plan == 'pro' || isProOptionEnabled || (isProjectBelongToLoggedUser && userProjectActive.plan == 'pro')) {
                    if(dataObj.exportType == 'pdf') dispatch(setActivePopup({name: "export2DProjectPopup"})); 
                    else dispatch(setActivePopup({name: "export3DProjectPopup", type: 'download', data: dataObj.exportType}));
                }
                else {
                    if(dataObj.exportType == 'pdf'){
                        if(user.data.plan == 'basic' || (isProjectBelongToLoggedUser && userProjectActive.plan == 'basic')) dispatch(setActivePopup({name: "export2DProjectPopup"})); 
                        else {
                            isProOptionEnabled ? 
                            !configEnableMerchantLogin ? 
                            dispatch(setActivePopup({name: "login"})) : 
                            R2D.postMessageToParent(JSON.stringify({ action: "merchant_login" })) : 
                            dispatch(setActivePopup({name: "payPro", type: 'user'}));
                        }
                    }
                    else dispatch(setActivePopup({name: "export3DProjectPopup", type: 'download', data: dataObj.exportType}));
                }
            } else dispatch(setActivePopup({name: "exportPopup"}));
        }
        else if(dataObj.action == 'open_renders') {
            if(!user.isLogged()) {
                !configEnableMerchantLogin ?
                dispatch(setActivePopup({name: "login"})) :
                R2D.postMessageToParent(JSON.stringify({ action: "merchant_login" }));
                return;
            } else {
                dispatch(setActivePopup({name: "rendersAnd360Popup", data: {type: 'renders'}}));
                dispatch(removeQuickPanelAll());
                planner.mih().unsetActiveObject();
                planner.mih().changeState(planner.mih().stateMain);
            }
        }
        else if(dataObj.action == 'share_project') {
            if ( user.getId() == 0 ) {
                !configEnableMerchantLogin ? dispatch(setActivePopup({name: "login"})) : R2D.postMessageToParent(JSON.stringify({ action: "merchant_login" }));
                return;
            }
            if(R2D.controller.getProjectUserKey() && R2D.controller.getProjectUserKey() != user.getKey()) return dispatch(setActivePopup({name: "alert", data: "TEXT_SHARE_PLAN_DIFF_USERS"}));
            if(!R2D.scene.getProjectId()) return dispatch(setActivePopup({name: "alert", data: "TEXT_SAVE_BEFORE_SHARE_PLAN"}));
            dispatch(setActivePopup({ name: "share" }));
        }
        else if(dataObj.action == 'open_tours') {
            if(!user.isLogged()) {
                !configEnableMerchantLogin ?
                dispatch(setActivePopup({name: "login"})) :
                R2D.postMessageToParent(JSON.stringify({ action: "merchant_login" }));
                return;
            } else dispatch(setActivePopup({name: "rendersAnd360Popup", data: {type: '360'}}));
        }
        else if(dataObj.action == 'create_tour') {
            if(!user.isLogged()) {
                !configEnableMerchantLogin ?
                dispatch(setActivePopup({name: "login"})) :
                R2D.postMessageToParent(JSON.stringify({ action: "merchant_login" }));
                return;
            }
            dispatch(setActivePopup({name: 'tour360Create'}));
        }
        else if(dataObj.action == 'open_tour') {
            if(!user.isLogged()) {
                !configEnableMerchantLogin ?
                dispatch(setActivePopup({name: "login"})) :
                R2D.postMessageToParent(JSON.stringify({ action: "merchant_login" }));
                return;
            }
            dispatch(setActivePopup({name: 'tour360Create', data: dataObj.url}));
        }
    }

    let onProjectSaveComplete = e => R2D.scene.updateProjectUserKey(user.getKey());

    let onDragObjOutOfWall = e => {
        let furnitureData = planner.getCatalogProducts();
        prevControlPanelMode ?
        dispatch(changeActiveControlPanelMode({mode: prevControlPanelMode})) : 
        dispatch(changeActiveControlPanelMode({
            mode: 'furniture', 
            data: controlPanelData['furniture'].history.length < 1 ? {type: "catalog", addType: "main", id: null, lastSavedScroll: 0, data: furnitureData} : null
        }));
    }

    let onEstimationSend = e => {
        if(R2D.config.data.enable_estimation) {
            let data = R2D.controller.getEstimation();
            R2D.postMessageToParent(JSON.stringify({
                action: "got_estimation",
                data
            }));
        }
    };

    let quickPanelsHide = e => dispatch(removeQuickPanelAll());

    let useTabTipStart = e => setTipUseTab({ position: { ...e.data.position }, status: true });

    let useTabTipMove = e => setTipUseTab({status: true, position: { ...e.data.position }});

    let useEnterTipStart = e => setTipUseEnter({ position: { ...e.data.position }, status: true });

    let useEnterTipMove = e => setTipUseEnter(prev => { return {...prev, position: { ...e.data.position }} });

    let useEnterTabTipStart = e => {
        setTipUseEnter({ position: { ...e.data.position }, status: true });
        setTimeout(() => setTipUseTab({ position: { ...e.data.position_second }, status: true, isEnterTipActive: true }), 100);
    };

    let useEnterTabTipMove = e => {
        setTipUseEnter({ position: { ...e.data.position }, status: true });
        setTipUseTab({ position: { ...e.data.position_second }, status: true, isEnterTipActive: true });
    };

    let onSetGroupActive = e => {
        planner.mih().setActiveGroup(e.data.group);
        planner.mih().changeState(planner.mih().stateSelectedGroup);
        dispatch(changeActiveControlPanelMode({mode: 'selectedGroup', data: {type: "main"}}));
        dispatch(showQuickPanel({name: "helper_group", visible: e.data.group.merged ? true : false, position: {x: planner.mih().mouseX, y: planner.mih().mouseY}})); 
    }

    let onSetProductActive = e => {
        let view3dObject = planner.mih()._productHelper.findObjectView3dBySceneObject(e.data.model);
        planner.mih().setActiveObjectProduct(view3dObject);
        planner.mih().changeState(planner.mih().stateSelectedProduct);
        dispatch(changeActiveControlPanelMode({mode: 'selectedModel', data: {type: "main"}}));
        dispatch(showQuickPanel({name: "helper_model", position: {x: planner.mih().mouseX, y: planner.mih().mouseY}})); 
    };

    let onReturnToDefaultMode = e => {
        dispatch(removeQuickPanelAll());
        if(!activeControlPanelData.isInControlPanel) {
            if(prevControlPanelMode) {
                dispatch(changeActiveControlPanelMode({mode: prevControlPanelMode}))
            } else {
                let furnitureData = planner.getCatalogProducts();
                dispatch(changeActiveControlPanelMode({
                    mode: 'furniture', 
                    data: controlPanelData['furniture'].history.length < 1 ? {type: "catalog", addType: "main", id: null, lastSavedScroll: 0, data: furnitureData} : null
                }));
            }
        }
    };

    let onOrientationChange = e => {
        const portrait = e.matches;
        if (portrait) {
            setIsOrientationPortrait(true);
        } else {
            setIsOrientationPortrait(false);
        }
    }

    let onUpdateHiddenElements = e => dispatch(updateIsThereHiddenElements(e.data));

    let changeLang = async code => {
        await dispatch(languageChange(code));
        R2D.languages = user.languages;
        if(activeViewMode == "view2d") R2D.scene3D?.titlesTool.onLanguagesUpdate();
        else if(activeViewMode == "constr") WC.wallsEditor?.titlesTool.onLanguagesUpdate();
    };

    let onlyViewProjectStatusUpdate = e => {
        dispatch(updateIsProjectOnlyView(e.data.viewOnly));
        planner.scene.updateProjectOnlyViewState(e.data.viewOnly);

        if(e.data.userKey != user.getKey()) {
            planner.scene.setIsProjectBelongToLoggedUserStatus(false);
            dispatch(updateIsProjectBelongToLoggedUser(false));
        };

        if(e.data.userKey != user.getKey() && e.data.viewOnly) {
            R2D.mouseInteractionHelper.state.setIsSelectingModel && R2D.mouseInteractionHelper.state.setIsSelectingModel(false);
            WC.wallsEditor.state.setIsSelectElementsActive(false);
            dispatch(updateDynamicPanelStatus(false));
            dispatch(updateDynamicToggleButtonStatus(false));
        }
    };

    let updateProjectName = e => dispatch(setActiveProjectName(e.data.name));

    let pastePremiumProductError = e => dispatch(setActivePopup({name: "alert", data: e.data.text}))

    let beforeUnloadFunc = async e => {
        if(!R2D.Storage.load('r2d_is_error_occured')) {
            if(user.isLogged() && planner.scene.wasChanged() && R2D.scene.getProjectId() && user.getKey() == R2D.controller.getProjectUserKey() && R2D.controller.projectOpeningStatus == 'ready') {
                if(user.data.autoSave) await R2D.controller.saveCurrentScene();
                else {
                    e.preventDefault();
                    e.returnValue = translation['TEXT_SAVE_PROJECT_BEFORE_CLOSE_PLANNER'];
                }
            }
        }
    }

    let preloaderStyles = {
        position: 'absolute', 
        left: 0, 
        top: 0, 
        zIndex: 999, 
        background: 'rgba(0, 0, 0, 0.3)',
        display: preloaderStatus ? 'block' : 'none'
    };

    let quickPanelShow = e => dispatch(showQuickPanel({name: e.data.type, position: e.data.quickPanel, type: e.data.addType}));
    let quickPanelHide = e => dispatch(removeQuickPanel({name: e.data.type}));

    let onRulerSelect = e => dispatch(showQuickPanel({name: "delete", position: {x: e.data.x, y: e.data.y}, type: 'deleteRuller'}));

    let onShowAlertPopup = e => dispatch(setActivePopup({name: "alert", data: e.data}));

    let checkIsLogged = async e => {
        let token = R2D.Storage.load('r2d_token');
        let response = await user.checkIsLogged(token);
        if(response.type == "error") {
            dispatch(setActivePopup({name: "alert", data: response.data}));
            return dispatch(saveLoggedStatus({ logged: false }));
        } else {
            dispatch(saveLoggedStatus(response));
                        
            let isCurrentProjectBelongToUser = R2D.scene.getProjectUserKey() == user.getKey();
            planner.scene.setIsProjectBelongToLoggedUserStatus(isCurrentProjectBelongToUser);

            R2D.mouseInteractionHelper.state?.setIsSelectingModel && R2D.mouseInteractionHelper.state.setIsSelectingModel(!isProjectOnlyView || (isProjectOnlyView && isCurrentProjectBelongToUser));
            WC.wallsEditor.state.setIsSelectElementsActive && WC.wallsEditor.state.setIsSelectElementsActive(!isProjectOnlyView || (isProjectOnlyView && isCurrentProjectBelongToUser));
            dispatch(updateIsProjectBelongToLoggedUser(isCurrentProjectBelongToUser));
        }
    }

    let tryLogOut = e => {
        dispatch(userLogout());
        
        planner.scene.setIsProjectBelongToLoggedUserStatus(false);
        dispatch(updateIsProjectBelongToLoggedUser(false));

        if(planner.scene.getProjectOnlyViewState()) {
            planner.mih().unsetActiveObject();
            planner.mih().changeState(planner.mih().stateMain);
            dispatch(removeQuickPanelAll());

            R2D.mouseInteractionHelper.state.setIsSelectingModel && R2D.mouseInteractionHelper.state.setIsSelectingModel(false);
            WC.wallsEditor.state.setIsSelectElementsActive && WC.wallsEditor.state.setIsSelectElementsActive(false);
            dispatch(updateDynamicToggleButtonStatus(false));
            dispatch(updateDynamicPanelStatus(false));
            dispatch(changeActiveControlPanelMode({mode: 'to2d3d'}));
        }
    }

    let storageChangeCallback = async e => {
        if(~e.key?.indexOf("r2d_token")) {
            let token = R2D.Storage.load('r2d_token');
            if(token && !user.isLogged()) {
                let response = await user.checkIsLogged(token);
                if(response.type == "error") {
                    dispatch(setActivePopup({name: "alert", data: response.data}));
                    return dispatch(saveLoggedStatus({ logged: false }));
                } else {
                    dispatch(saveLoggedStatus(response));
                                
                    let isCurrentProjectBelongToUser = R2D.scene.getProjectUserKey() == user.getKey();
                    planner.scene.setIsProjectBelongToLoggedUserStatus(isCurrentProjectBelongToUser);

                    R2D.mouseInteractionHelper.state?.setIsSelectingModel && R2D.mouseInteractionHelper.state.setIsSelectingModel(!isProjectOnlyView || (isProjectOnlyView && isCurrentProjectBelongToUser));
                    WC.wallsEditor.state.setIsSelectElementsActive && WC.wallsEditor.state.setIsSelectElementsActive(!isProjectOnlyView || (isProjectOnlyView && isCurrentProjectBelongToUser));
                    dispatch(updateIsProjectBelongToLoggedUser(isCurrentProjectBelongToUser));
                }
            } else if(!token && user.isLogged()) {
                dispatch(userLogout());
            
                planner.scene.setIsProjectBelongToLoggedUserStatus(false);
                dispatch(updateIsProjectBelongToLoggedUser(false));

                if(planner.scene.getProjectOnlyViewState()) {
                    planner.mih().unsetActiveObject();
                    planner.mih().changeState(planner.mih().stateMain);
                    dispatch(removeQuickPanelAll());

                    R2D.mouseInteractionHelper.state.setIsSelectingModel && R2D.mouseInteractionHelper.state.setIsSelectingModel(false);
                    WC.wallsEditor.state.setIsSelectElementsActive && WC.wallsEditor.state.setIsSelectElementsActive(false);
                    dispatch(updateDynamicToggleButtonStatus(false));
                    dispatch(updateDynamicPanelStatus(false));
                    dispatch(changeActiveControlPanelMode({mode: 'to2d3d'}));
                }
            }
        }
    };

    let onPreloaderToggle = e => dispatch(updatePreloaderStatus(!preloaderStatus));

    useEffect(async () => {
        !R2D.Storage.load('r2d_is_error_occured') && planner.scene.clearSceneAutoSaveStorage();

        R2D.Storage.clear('r2d_is_error_occured');

        planner.apiScene.addEventListener(planner.apiScene.RULER_SELECTED, onRulerSelect);
        planner.apiScene.addEventListener(planner.apiScene.PROJECT_SAVE_COMPLETE, onProjectSaveComplete);
        
        planner.apiScene.addEventListener(planner.apiScene.ESTIMATION_SEND, onEstimationSend);
        planner.apiScene.addEventListener(planner.apiScene.SET_ACTIVE_GROUP, onSetGroupActive);
        planner.apiScene.addEventListener(planner.apiScene.SET_ACTIVE_PRODUCT, onSetProductActive);
        planner.apiScene.addEventListener(planner.apiScene.QUICK_PANELS_HIDE, quickPanelsHide);
        planner.apiScene.addEventListener(planner.apiScene.UPDATE_IS_THERE_HIDDEN_ELEMENTS, onUpdateHiddenElements);
        planner.apiScene.addEventListener(planner.apiScene.UPDATE_PROJECT_ONLY_VIEW_STATUS, onlyViewProjectStatusUpdate);
        planner.apiScene.addEventListener(planner.apiScene.UPDATE_PROJECT_NAME, updateProjectName);
        planner.apiScene.addEventListener(planner.apiScene.PASTE_PREMIUM_PRODUCT_ERROR, pastePremiumProductError);
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
        planner.apiConstr.addEventListener(planner.apiConstr.USE_ENTER_TAB_TIP_START, useEnterTabTipStart);
        planner.apiConstr.addEventListener(planner.apiConstr.USE_ENTER_TAB_TIP_MOVE, useEnterTabTipMove);
        planner.apiConstr.addEventListener(planner.apiConstr.SHOW_ALERT_POPUP, onShowAlertPopup);
        planner.apiConstr.addEventListener(planner.apiConstr.RULER_SELECTED, onRulerSelect);

        window.addEventListener(isCurrDeviceAPhone ? 'pagehide' : 'beforeunload', beforeUnloadFunc);

        isCurrDeviceAPhone && window.matchMedia("(orientation: portrait)").addEventListener("change", onOrientationChange);

        let canvasWrapper = document.getElementById('planner');
        canvasWrapper.appendChild(planner.getDomElement());

        let showStartPopup = true;

        let needToCleanSearch = false;

        let checkProjectForLoadResult = await R2D.controller.checkProjectForLoad();
        let tryLoadProjectFromStorageResult = await R2D.controller.tryLoadProjectFromStorage();
        await R2D.controller.applyAndSaveDataFromStorage();

        if(user.getKey() && R2D.scene.getProjectUserKey() == user.getKey()) {
            planner.scene.setIsProjectBelongToLoggedUserStatus(true);
            dispatch(updateIsProjectBelongToLoggedUser(true));
        }

        let furnitureData = planner.getCatalogProducts();
        isCurrDeviceAPhone && dispatch(changeActiveControlPanelMode({mode: 'furniture', data: {type: "catalog", addType: "main", id: null, lastSavedScroll: 0, data: furnitureData}}));
        
        if(!R2D.scene.viewOnly) {
            dispatch(updateDynamicToggleButtonStatus(true));
            dispatch(updateIsProjectOnlyView(false));
        }

        if(window.location.search.match("lang=")) {
            let lang = window.location.search.match(/lang=\w{0,2}/)[0].split('=')[1];
            needToCleanSearch = true;
            if(currLanguage?.code != lang) {
                if(!languages.some(i => i.code == lang)) lang = 'en';
                await dispatch(languageChange(lang));
                R2D.languages = user.languages;
            }   
        }

        if(window.location.search.match("promo=")) {
            if(window.location.search.match("promo=base_to_pro")) {
                showStartPopup = false;
                let codeToCheck = window.location.search?.split('&')[1]?.split('=')[1];

                dispatch(updatePreloaderStatus(true));

                let result = await fetch(R2D.URL.DOMAIN + `/api2/user/basic_to_pro_upgrade?code=${codeToCheck}`);
                let resultJSON = await resulton();

                if(resultJSON.status == 'ok') {
                    if(!user.isLogged()) {
                        dispatch(updatePreloaderStatus(false));
                        !configEnableMerchantLogin ?
                        dispatch(setActivePopup({name: "login", type: 'promoUpgradeLogin'})) :
                        R2D.postMessageToParent(JSON.stringify({ action: "merchant_login" }));
                    } else {
                        let response = await user.loadProfileData();
                        dispatch(updatePreloaderStatus(false));
                        if(response.type == "error") dispatch(setActivePopup({name: "alert", data: response.data}))
                        else dispatch(setProfileData(response));
                        dispatch(setActivePopup({name: 'alert', data: "PLAN_UPGRADE_SUCCESS_TEXT"}));
                    }
                } else {
                    dispatch(updatePreloaderStatus(false));
                    dispatch(setActivePopup({name: 'alert', data: "TEXT_ERROR_LOAD_DATA"}));
                }

                needToCleanSearch = true;
            } else if(window.location.search.match("promo=drop_confirmed")) {
                showStartPopup = false;
                window.history.replaceState(null, null, createProjectUrl(''));
                dispatch(setActivePopup({name: 'deleteAccountPopup', data: 'deleted'}))
            } 
            else {
                const params = new URLSearchParams(window.location.search);
                const value = params.get("promo");
                
                if(!user.isLogged()) {
                    dispatch(setActivePopup({name: "login", type: "promoCredits", data: value}));
                    window.history.replaceState(null, null, createProjectUrl(''));
                }
                else {
                    let result = await user.promoLoad(value);
                    if(result.type == "error") dispatch(setActivePopup({name: "alert", data: result.data}));
                    else dispatch(setActivePopup({name: "alert", data: result.message}));
                    window.history.replaceState(null, null, createProjectUrl(''));
                }
            }
        }

        if(window.location.pathname.match("password_recovery")) {
            showStartPopup = false;
            let tokenKey = window.location.pathname.split('/')[window.location.pathname.split('/').length - 1];
            dispatch(setActivePopup({name: "updatePassword", type: "recovery", data: tokenKey}));
        }

        if(window.location.search.match("action=buy&")) {
            let type = window.location.search.replace('?', '').split('&').find(i => ~i.indexOf('type')).split('=')[1];
            let plan = window.location.search.replace('?', '').split('&').find(i => ~i.indexOf('plan')).split('=')[1];
            showStartPopup = false;
            if(type == 'user') {
                let time = window.location.search.replace('?', '').split('&').find(i => ~i.indexOf('time')).split('=')[1];
                            
                if(user.data.plan == 'pro' || (user.data.plan == 'basic' && plan == 'basic')) {
                    window.history.replaceState(null, null, createProjectUrl(''));
                }
                else {
                    let url = R2D.makeURL(R2D.URL.DOMAIN, R2D.URL.URL_PAY_FORM);
                    let selectedPlanId = R2D.RECURRING_PLANS[plan][time == 'month' ? 1 : time == 'year' ? 12 : 1]
                    url = url.includes('?') ? url + '&plan_recurring_id=' + selectedPlanId : url + '?plan_recurring_id=' + selectedPlanId;
                    url += '&lang=' + currLanguage.code;
                    url += '&token=' + R2D.token;
                    dispatch(setActivePopup({name: "payPro", data: url}));
                    window.history.replaceState(null, null, createProjectUrl(''));
                }
            }
        }

        if(window.location.search.match("open_projects=1")) {
            if ( !user.isLogged() ) {
                !configEnableMerchantLogin ? dispatch(setActivePopup({name: "login"})) : R2D.postMessageToParent(JSON.stringify({ action: "merchant_login" }))
            } else {
                showStartPopup = false;
                let langCode = ~window.location.search.indexOf('#') && window.location.search.split('&') && window.location.search.split('&')[1].split('=')[1];
                langCode && currLanguage.code != langCode && await changeLang(langCode);
                dispatch(setActivePopup({name: "projectsPopup"}));
                dispatch(removeQuickPanelAll());
                planner.mih().unsetActiveObjectProduct();
                planner.mih().changeState(planner.mih().stateMain);
                
            }
            window.history.replaceState(null, null, createProjectUrl(''));
        }

        if(window.location.search.match("open_renders=1")) {
            if ( !user.isLogged() ) {
                !configEnableMerchantLogin ? dispatch(setActivePopup({name: "login"})) : R2D.postMessageToParent(JSON.stringify({ action: "merchant_login" }))
            } else {
                showStartPopup = false;
                let langCode = ~window.location.search.indexOf('#') && window.location.search.split('&') && window.location.search.split('&')[1].split('=')[1];
                langCode && currLanguage.code != langCode && await changeLang(langCode);
                dispatch(setActivePopup({name: "rendersAnd360Popup", data: {type: 'renders'}}));
                dispatch(removeQuickPanelAll());
                planner.mih().unsetActiveObjectProduct();
                planner.mih().changeState(planner.mih().stateMain);
            }
            window.history.replaceState(null, null, createProjectUrl(''));
        }

        if(window.location.search.match("open_profile=1")) {
            if ( !user.isLogged() ) {
                !configEnableMerchantLogin ? dispatch(setActivePopup({name: "login"})) : R2D.postMessageToParent(JSON.stringify({ action: "merchant_login" }))
            } else {
                showStartPopup = false;
                let langCode = ~window.location.search.indexOf('#') && window.location.search.split('&') && window.location.search.split('&')[1].split('=')[1];
                langCode && currLanguage.code != langCode && await changeLang(langCode);
                let response = await user.loadProfileData();
                if(response.type == "error") dispatch(setActivePopup({name: "alert", data: response.data}))
                else {
                    dispatch(setProfileData(response));
                    dispatch(setActivePopup({ name: "profile" }));
                }
            }
            window.history.replaceState(null, null, createProjectUrl(''));
        }

        if(window.location.search.match("action=buyCredits")) {
            let creditsNum = window.location.search.replace('?', '').split('&').find(i => ~i.indexOf('count')).split('=')[1];
            if(!user.isLogged()) {
                !configEnableMerchantLogin ?
                dispatch(setActivePopup({name: "login", type: "buy_credits", data: creditsNum})) :
                R2D.postMessageToParent(JSON.stringify({ action: "merchant_login" }));
                return;
            } else {
                showStartPopup = false;
                if(!R2D.token) dispatch(setActivePopup({name: "alert", data: "TEXT_ERROR_LOAD_DATA"}));
                else dispatch(setActivePopup({name: "buyCredits", type: 'fromUrl', data: {iframe: `${R2D.URL.DOMAIN}/api/credits/get_form?credits=${creditsNum}&lang=${currLanguage.code}&token=${R2D.token}`}}));
            }
            window.history.replaceState(null, null, createProjectUrl(''));
        }

        if(window.location.search.match("open_tours=1")) {
            if(!user.isLogged()) {
                !configEnableMerchantLogin ?
                dispatch(setActivePopup({name: "login"})) :
                R2D.postMessageToParent(JSON.stringify({ action: "merchant_login" }));
                return;
            } else {
                showStartPopup = false;
                dispatch(setActivePopup({name: "rendersAnd360Popup", data: {type: '360'}}));
            }
            window.history.replaceState(null, null, createProjectUrl(''));
        }

        if(R2D.controller.getProjectId()) needToCleanSearch = false;

        if(R2D.controller.getProjectId() == 0 && !tryLoadProjectFromStorageResult && !checkProjectForLoadResult && !R2D.Storage.load("r2d_blueScreenPopup") && R2D.config?.data?.start_popup?.show && showStartPopup) {
            dispatch(setActivePopup({name: "startPopup"}));
        } else {
            !R2D.scene.viewOnly && !isCurrDeviceAPhone && dispatch(updateDynamicPanelStatus(true));
        }
    
        if(needToCleanSearch && window.location.search) window.history.replaceState(null, null, createProjectUrl(''));
        dispatch(changeWallsHeight(R2D.scene.constructor.cap.wallsHeight));

        R2D.controller.getProjectId() == 0 && R2D.Storage.load("r2d_blueScreenPopup") && dispatch(showTip({name: 'constructorButtons'}));

        planner.scene.clearSceneAutoSaveStorage();

        let resizeListener = e => {
            const plannerElement = document.getElementById('planner');
            planner.setSize(plannerElement?.offsetWidth || 0, plannerElement?.offsetHeight || 0);
            planner.mih()._ruler3d.update();
        }
        
        window.addEventListener('resize', resizeListener);

        planner.setSize(window.innerWidth, window.innerHeight);

        let response = await user.plannerConnect()
        console.log("Planner connect: ", response);

        if(R2D.config.data.ui.custom_registration) await R2D.loadCustomRegistration();

        R2D.postMessageToParent(JSON.stringify({action:"program_ready"}));

        if(!isOrientationPortrait) setTimeout(() => document.querySelector(".preloader_main") && document.querySelector(".preloader_main").remove(), 300);

        setIsProgramReady(true);

        R2D.controller.projectOpeningStatus != 'opening' && planner.scene.sceneAutoSaveStorage();

        'onstorage' in window ? window.addEventListener("storage", storageChangeCallback) : planner.scene.tryToAutoLoginOrLogOut();

        return () => {
            planner.apiScene.removeEventListener(planner.apiScene.SET_ACTIVE_GROUP, onSetGroupActive);
            planner.apiScene.removeEventListener(planner.apiScene.SET_ACTIVE_PRODUCT, onSetProductActive);
            planner.apiScene.removeEventListener(planner.apiScene.QUICK_PANELS_HIDE, quickPanelsHide);
            planner.apiScene.removeEventListener(planner.apiScene.UPDATE_IS_THERE_HIDDEN_ELEMENTS, onUpdateHiddenElements);
            planner.apiScene.removeEventListener(planner.apiScene.UPDATE_PROJECT_ONLY_VIEW_STATUS, onlyViewProjectStatusUpdate);
            planner.apiScene.removeEventListener(planner.apiScene.UPDATE_PROJECT_NAME, updateProjectName);
            planner.apiScene.removeEventListener(planner.apiScene.PASTE_PREMIUM_PRODUCT_ERROR, pastePremiumProductError);
            planner.apiScene.removeEventListener(planner.apiScene.SHOW_ALERT_POPUP, onShowAlertPopup);

            planner.apiConstr.removeEventListener(planner.apiConstr.USE_TAB_TIP_START, useTabTipStart);
            planner.apiConstr.removeEventListener(planner.apiConstr.QUICK_PANELS_HIDE, quickPanelsHide);
            planner.apiConstr.removeEventListener(planner.apiConstr.USE_TAB_TIP_MOVE, useTabTipMove);
            planner.apiConstr.removeEventListener(planner.apiConstr.USE_ENTER_TIP_START, useEnterTipStart);
            planner.apiConstr.removeEventListener(planner.apiConstr.USE_ENTER_TIP_START, useEnterTipMove);
            planner.apiConstr.removeEventListener(planner.apiConstr.USE_ENTER_TAB_TIP_START, useEnterTabTipStart);
            planner.apiConstr.removeEventListener(planner.apiConstr.USE_ENTER_TAB_TIP_START, useEnterTabTipMove);
            planner.apiConstr.removeEventListener(planner.apiConstr.SHOW_ALERT_POPUP, onShowAlertPopup);
            
            isCurrDeviceAPhone && window.matchMedia("(orientation: portrait)").removeEventListener("change", onOrientationChange);
        }
    }, []);

    useEffect(() => {
        planner.apiScene.addEventListener(planner.apiScene.PRELOADER_TOGGLE, onPreloaderToggle);
        return () => planner.apiScene.removeEventListener(planner.apiScene.PRELOADER_TOGGLE, onPreloaderToggle);
    }, [preloaderStatus]);

    useEffect(() => {
        if(isProjectBelongToLoggedUser && isProjectOnlyView) {
            dispatch(updateDynamicPanelStatus(true));
            dispatch(updateDynamicToggleButtonStatus(true));
            if(controPanelActiveMode != 'walk') {
                let furnitureData = planner.getCatalogProducts();
                dispatch(changeActiveControlPanelMode({mode: 'furniture', data: controlPanelData['furniture'].history.length < 1 ? {type: "catalog", addType: "main", id: null, lastSavedScroll: 0, data: furnitureData} : null}));
            }
        }
    }, [isProjectBelongToLoggedUser]);

    useEffect(() => {
        planner.apiScene.addEventListener(planner.apiScene.HISTORY_UNDO_REDO, onHistoryUndoRedo);
        planner.apiConstr.addEventListener(planner.apiConstr.HISTORY_UNDO_REDO, onHistoryUndoRedo);
        planner.apiScene.addEventListener(planner.apiScene.RETURN_TO_DEFAULT_MODE, onReturnToDefaultMode);
        return () => {
            planner.apiConstr.removeEventListener(planner.apiConstr.HISTORY_UNDO_REDO, onHistoryUndoRedo);
            planner.apiScene.removeEventListener(planner.apiScene.HISTORY_UNDO_REDO, onHistoryUndoRedo);
            planner.apiScene.removeEventListener(planner.apiScene.RETURN_TO_DEFAULT_MODE, onReturnToDefaultMode);
        }
    }, [prevControlPanelMode, activeControlPanelData]);

    useEffect(() => setConfigEnableMerchantLogin(R2D.config.data.enable_merchant_login), [R2D.config.data.enable_merchant_login]);

    useEffect(() => {
        planner.scene.clearSceneAutoSaveServer();
        userProfileData?.autoSave && R2D.controller.projectOpeningStatus == 'ready' && planner.scene.sceneAutoSaveServer(user.getKey());
        planner.apiScene.addEventListener(planner.apiScene.PROJECT_LOADED, onProjectLoaded);
        return () => planner.apiScene.removeEventListener(planner.apiScene.PROJECT_LOADED, onProjectLoaded);
    }, [userProfileData?.autoSave]);
    
    useEffect(() => {
        planner.mih().addEventListener(R2D.MouseInteractionHelper.STATE_CHANGED, changeMIHStateListener);
        planner.scene.addEventListener(planner.scene.TIPS_UPLOAD_CUSTOM_MAT, customUploadListener);
        planner.scene.addEventListener(planner.scene.TIPS_MERGE_GROUP_BUTTON, tipMergeGroupButtonListener);
        planner.scene.addEventListener(planner.scene.TIPS_PANORAMS, tipPanoramsListener);
        planner.scene.addEventListener(planner.scene.TIPS_RENDER_MAKE, tipRenderMakeListener);

        return () => {
            planner.mih().removeEventListener(R2D.MouseInteractionHelper.STATE_CHANGED, changeMIHStateListener);
            planner.scene.removeEventListener(planner.scene.TIPS_UPLOAD_CUSTOM_MAT, customUploadListener);
            planner.scene.removeEventListener(planner.scene.TIPS_MERGE_GROUP_BUTTON, tipMergeGroupButtonListener);
            planner.scene.removeEventListener(planner.scene.TIPS_PANORAMS, tipPanoramsListener);
            planner.scene.removeEventListener(planner.scene.TIPS_RENDER_MAKE, tipRenderMakeListener);
        }
    }, [userProfileData, tips]);

    useEffect(() => {
        R2D.viewConstructor.addEventListener(WC.EDITOR_CHANGE_STATE, changeConstructorStateListener);
        return () => R2D.viewConstructor.removeEventListener(WC.EDITOR_CHANGE_STATE, changeConstructorStateListener);
    }, [userProfileData]);

    useEffect(() => !isOrientationPortrait && isProgramReady && setTimeout(() => document.querySelector(".preloader_main") && document.querySelector(".preloader_main").remove(), 300), [[isOrientationPortrait]])

    useEffect(() => {
        planner.apiScene.addEventListener(planner.apiScene.WHEEL_ZOOM, onWheelZoom);
        planner.apiConstr.addEventListener(planner.apiConstr.WHEEL_ZOOM, onWheelZoom);
        planner.apiConstr.addEventListener(planner.apiConstr.CAMERA_MOVE, onCameraMove);
        planner.apiScene.addEventListener(planner.apiScene.CAMERA_MOVE, onCameraMove);
        planner.apiScene.addEventListener(planner.apiScene.OBJECT_DRAG_OUT_OF_WALL, onDragObjOutOfWall);
        planner.scene.addEventListener(planner.scene.RENDERS_UPDATE, onRendersUpdate);
        window.addEventListener("message", messageListener, false);

        return () => {
            planner.apiScene.removeEventListener(planner.apiScene.WHEEL_ZOOM, onWheelZoom);
            planner.apiConstr.removeEventListener(planner.apiConstr.WHEEL_ZOOM, onWheelZoom);
            planner.apiConstr.removeEventListener(planner.apiConstr.CAMERA_MOVE, onCameraMove);
            planner.apiScene.removeEventListener(planner.apiScene.CAMERA_MOVE, onCameraMove);
            planner.apiScene.removeEventListener(planner.apiScene.OBJECT_DRAG_OUT_OF_WALL, onDragObjOutOfWall);
            planner.scene.removeEventListener(planner.scene.RENDERS_UPDATE, onRendersUpdate);
            window.removeEventListener("message", messageListener, false);
        }
    }, [activeViewMode, controPanelActiveMode, userProfileData, popups]);

    useEffect(async () => {
        let userUpload;
        if(isLogged) {
            if(!userProfileData?.name) {
                let response = await user.loadProfileData();
                if(response.type == "error") dispatch(setActivePopup({name: "alert", data: response.data}))
                else dispatch(setProfileData(response));
            }
            
            userUpload = await planner.scene.categoryDataLoad(`${R2D.URL.DOMAIN + R2D.URL.URL_CATALOG_SEARCH}&category_tag&my=1`);
            planner.setUserUpload(userUpload);
        }
        else planner.setUserUpload(null);

        planner.apiScene.dispatchEvent(new Event(planner.apiScene.FAVORITES_BUTTON, {}));
        planner.apiScene.dispatchEvent(new Event(planner.apiScene.USER_UPLOAD_BUTTON, {status: userUpload?.length > 0}));
    }, [isLogged]);

    useEffect(() => setIsProOptionEnabled(R2D.OPTIONS.PRO_PLAN), [R2D.OPTIONS.PRO_PLAN]);

    useEffect(() => {
        planner.scene.addEventListener(planner.scene.UPDATE_LOAD_STATUS, onProjectElementsLoadProgress);
        return () => planner.scene.removeEventListener(planner.scene.UPDATE_LOAD_STATUS, onProjectElementsLoadProgress);
    }, [popups])

    return (
        <div className={classes.main}>
            <div className='preloader' style={ {...preloaderStyles} }><div className="preloader-cube"></div></div>
            {
                isOrientationPortrait ?
                <div className={classes.content_portret}>
                    <h1>{ translation['ORIENTATION_PORTRAIT_WARNING'] }</h1>
                    <p>{ translation['ORIENTATION_PORTRAIT_TEXT_1'] }</p>
                    <div className={classes.content_portret_img}>
                        <svg width="138" height="138" viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M126.499 112.7C125.889 112.7 125.304 112.458 124.873 112.027C124.442 111.595 124.199 111.01 124.199 110.4V96.6003C124.199 95.9903 124.442 95.4053 124.873 94.9739C125.304 94.5426 125.889 94.3003 126.499 94.3003C127.109 94.3003 127.694 94.5426 128.126 94.9739C128.557 95.4053 128.799 95.9903 128.799 96.6003V110.4C128.799 111.01 128.557 111.595 128.126 112.027C127.694 112.458 127.109 112.7 126.499 112.7Z" fill="white"/>
                            <path d="M126.495 138H29.8945C26.8457 137.996 23.9227 136.783 21.7668 134.627C19.611 132.472 18.3982 129.549 18.3945 126.5V80.4997C18.3945 74.1609 23.5557 68.9997 29.8945 68.9997H126.495C132.833 68.9997 137.995 74.1609 137.995 80.4997V126.5C137.995 132.839 132.833 138 126.495 138ZM43.6945 133.4H126.495C130.299 133.4 133.395 130.304 133.395 126.5V80.4997C133.395 76.6955 130.299 73.5997 126.495 73.5997H29.8945C26.0903 73.5997 22.9945 76.6955 22.9945 80.4997V126.5C22.9945 130.304 26.0903 133.4 29.8945 133.4H43.6945ZM41.3945 13.7997H27.5945C26.9845 13.7997 26.3995 13.5574 25.9682 13.1261C25.5369 12.6947 25.2945 12.1097 25.2945 11.4997C25.2945 10.8897 25.5369 10.3047 25.9682 9.87336C26.3995 9.44203 26.9845 9.19971 27.5945 9.19971H41.3945C42.0045 9.19971 42.5895 9.44203 43.0209 9.87336C43.4522 10.3047 43.6945 10.8897 43.6945 11.4997C43.6945 12.1097 43.4522 12.6947 43.0209 13.1261C42.5895 13.5574 42.0045 13.7997 41.3945 13.7997Z" fill="white"/>
                            <path d="M11.5 119.6C8.45113 119.596 5.52818 118.384 3.37231 116.228C1.21643 114.072 0.00365207 111.149 0 108.1V11.5C0 5.1612 5.1612 0 11.5 0H57.5C63.8388 0 69 5.1612 69 11.5V62.1C69 62.71 68.7577 63.295 68.3264 63.7264C67.895 64.1577 67.31 64.4 66.7 64.4C66.09 64.4 65.505 64.1577 65.0737 63.7264C64.6423 63.295 64.4 62.71 64.4 62.1V11.5C64.4 7.6958 61.3042 4.6 57.5 4.6H11.5C7.6958 4.6 4.6 7.6958 4.6 11.5V108.1C4.6 111.904 7.6958 115 11.5 115C12.11 115 12.695 115.242 13.1263 115.674C13.5577 116.105 13.8 116.69 13.8 117.3C13.8 117.91 13.5577 118.495 13.1263 118.926C12.695 119.358 12.11 119.6 11.5 119.6ZM122.797 62.5968C122.366 62.5973 121.943 62.4761 121.578 62.2472L111.826 56.1522C111.309 55.8289 110.941 55.3134 110.804 54.719C110.667 54.1246 110.771 53.5001 111.095 52.9828C111.418 52.4655 111.933 52.0979 112.528 51.9607C113.122 51.8235 113.747 51.9281 114.264 52.2514L122.066 57.1274L126.942 49.3258C127.265 48.8085 127.78 48.4409 128.375 48.3037C128.969 48.1665 129.594 48.2711 130.111 48.5944C130.628 48.9177 130.996 49.4333 131.133 50.0276C131.27 50.622 131.166 51.2465 130.842 51.7638L124.747 61.5158C124.541 61.8466 124.253 62.1194 123.912 62.3085C123.571 62.4976 123.187 62.5968 122.797 62.5968ZM85.284 27.462C84.9339 27.4628 84.5882 27.3836 84.2733 27.2306C83.9585 27.0775 83.6827 26.8546 83.467 26.5788L76.3876 17.5168C76.2015 17.2788 76.0641 17.0065 75.9833 16.7154C75.9024 16.4243 75.8797 16.1201 75.9164 15.8202C75.9532 15.5204 76.0486 15.2307 76.1974 14.9677C76.3461 14.7047 76.5452 14.4736 76.7832 14.2876L85.8452 7.2082C86.0832 7.02214 86.3555 6.88479 86.6466 6.80398C86.9377 6.72316 87.2419 6.70048 87.5417 6.73721C87.8416 6.77395 88.1313 6.86938 88.3943 7.01807C88.6572 7.16676 88.8884 7.36579 89.0744 7.6038C89.2605 7.84181 89.3978 8.11413 89.4786 8.40522C89.5595 8.69631 89.5821 9.00047 89.5454 9.30033C89.5087 9.60019 89.4132 9.88988 89.2645 10.1529C89.1159 10.4158 88.9168 10.6469 88.6788 10.833L81.4292 16.4956L87.0918 23.7452C87.3572 24.0845 87.5219 24.4915 87.5672 24.9199C87.6126 25.3482 87.5367 25.7807 87.3483 26.168C87.1599 26.5554 86.8665 26.882 86.5016 27.1108C86.1366 27.3396 85.7148 27.4613 85.284 27.462Z" fill="white"/>
                            <path d="M121.902 62.1003C121.292 62.1003 120.707 61.858 120.276 61.4266C119.845 60.9953 119.602 60.4103 119.602 59.8003C119.602 36.9751 101.028 18.4003 78.2023 18.4003C77.5923 18.4003 77.0073 18.158 76.576 17.7266C76.1447 17.2953 75.9023 16.7103 75.9023 16.1003C75.9023 15.4903 76.1447 14.9053 76.576 14.4739C77.0073 14.0426 77.5923 13.8003 78.2023 13.8003C103.567 13.8003 124.202 34.4359 124.202 59.8003C124.202 60.4103 123.96 60.9953 123.529 61.4266C123.097 61.858 122.512 62.1003 121.902 62.1003Z" fill="white"/>
                        </svg>
                    </div>
                    <p>{ translation["ORIENTATION_PORTRAIT_TEXT_2"] }</p>
                </div> :
                null
            }
            <div className={classes.content}>
                <LeftMain />
                <div className={classes.plannerMain} id={'plannerMain'}>
                    { 
                        controPanelActiveMode == "renderMake" ? null : 
                        <div>
                            <AnimatePresence mode="wait">
                                { controPanelActiveMode != "alignDrawing" &&
                                    <motion.div
                                        initial={{ transform: 'translateY(-110%)'}}
                                        animate={{ transform: 'translateY(0%)'}}
                                        exit={{ transform: 'translateY(-110%)' }}
                                        transition={{ duration: 0.3}}
                                        key={'topPanel'}
                                        className={classes.panel_top}>
                                            <TopPanel />
                                    </motion.div>
                                }
                            </AnimatePresence>

                            <AnimatePresence mode="wait">
                                { activeViewMode != 'viewWalk' && controPanelActiveMode != "alignDrawing" &&
                                    <motion.div
                                        initial={{ transform: 'translateX(110%)'}}
                                        animate={{ transform: 'translateX(0%)'}}
                                        exit={{ transform: 'translateX(110%)' }}
                                        transition={{ duration: 0.3}}
                                        key={'rightPanel'}
                                        className={classes.right_bar_wrap}>
                                        <RightPanel />
                                    </motion.div>
                                }

                                <BottomPanel />

                            </AnimatePresence>

                            
                        </div>
                    }
                    <CenterPanel />
                </div>

                <Popups />
                <QuickPanels/>

                {
                    dynamicPanelStatus && userProfileData?.tips && userProfileData.tips != 0 && !tips.constructorButtons.showed && !isCurrDeviceAPhone && tips.constructorButtons.status ?
                        <div>
                            <Tip name={"constructorButtons"} showTime={500} arrow={{position: "top", direction: "left"}} text={"TUT_FROM_SCRATCH"} position={{x: 370, y: 135, from: "left"}}/>
                            <Tip name={"constructorButtons"} showTime={1000} arrow={{position: "bottom", direction: "left"}} text={"TUT_UPLOAD_FLOORPLAN"} position={{x:370, y: 438, from: "left"}}/>
                        </div>
                        :
                        null
                }

                {
                    showTipSelectGroup && !tips.selectGroup.showed && !isCurrDeviceAPhone ? <Tip name={"selectGroup"} showTime={1000} arrow={{}} text={"TUT_CREATE_GROUP"} position={{x: "50%", y: "50%", from: "left"}}/>
                    : null
                }

                {
                    showTipChangeWallHeight && !tips.changeWallHeight.showed && !isCurrDeviceAPhone ? <Tip name={"changeWallHeight"} showTime={1000} arrow={{position: "top", direction: "left"}} text={"TUT_CHANGE_WALLS_HEIGHT"} position={{x: 370, y: 68, from: "left"}}/>
                    : null
                }
                {
                    showTipUploadCustomMat && !tips.uploadCustomMat.showed && !isCurrDeviceAPhone ? <Tip name={"uploadCustomMat"} showTime={1000} arrow={{position: "top", direction: "left"}} text={"TUT_UPLOAD_MATERIAL"} position={{x: 370, y: 135, from: "left"}}/>
                    : null
                }
                {
                    showTipUseTab.status && !tips.tipUseTab.showed && !isCurrDeviceAPhone ? <Tip name={"tipUseTab"} showTime={100} arrow={showTipUseTab.isEnterTipActive ? {position: "right", direction: "top", size: "small"} : {position: "left", direction: "bottom", size: "small"}} text={"TUT_USE_TAB"} isEnterTipActive={showTipUseTab.isEnterTipActive} position={{x: showTipUseTab.position.x, y: showTipUseTab.position.y, from: "left"}}/>
                    : null
                }
                {
                    showTipUseEnter.status && !tips.tipUseEnter.showed && !isCurrDeviceAPhone ? <Tip name={"tipUseEnter"} showTime={100} arrow={{position: "left", direction: "bottom", size: "small"}} text={"TUT_USE_ENTER"} position={{x: showTipUseEnter.position.x, y: showTipUseEnter.position.y, from: "left"}}/>
                    : null
                }

               {
                   showTipMergeGroupButton && !tips.mergeGroupButton.showed && !isCurrDeviceAPhone ? <Tip name={"mergeGroupButton"} showTime={1000} arrow={{position: "top", direction: "left"}} text={"TUT_MERGE_GROUP"} position={{x: 370, y: 147, from: "left"}}/>
                    : null
                }

                {
                    showTipPanorams && !tips.panorams.showed && !isCurrDeviceAPhone ? <Tip name={"panorams"} showTime={1000} arrow={{position: "top", direction: "left"}} text={"TUT_CHANGE_PANORAMA"} position={{x: 370, y: 116, from: "left"}}/>
                    : null
                }
                {
                    showTipRenderMake && !tips.tipRenderMake.showed  && !isCurrDeviceAPhone ? <Tip name={"tipRenderMake"} showTime={1000} arrow={{position: "top", direction: "left"}} text={"TUT_RENDER_MAKE"} position={{x: 330, y: 133, from: "left"}}/>
                    : null
                }

            </div>
        </div>
    )
}

export default Main;
