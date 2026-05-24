import React, { useEffect, useMemo, useRef, useState } from 'react';
import {createUseStyles} from "react-jss";
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from "simplebar-react";

import 'simplebar-react/dist/simplebar.min.css';

import { planner, user } from '../../../../../../initR2D';
import { selectTranslation } from '../../../../../../redux/features/language/languageSlice';
import { controlPanelHistoryAdd, controlPanelUpdateBreadCrumbs, selectActiveControlPanelModeData, selectPrevControlPanelMode, changeActiveControlPanelMode, updateControlPanelStatus, selectControlPanelData } from '../../../../../../redux/features/control/controlPanelSlice';
import { changeActivePano, selectActivePano, selectRenderMakeState } from '../../../../../../redux/features/common/commonSlice';
import { saveLoggedStatus, selectUserProfileData, setProfileData } from '../../../../../../redux/features/user/userSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import { selectWallsHeight } from '../../../../../../redux/features/constructor/constructorSlice';
import { selectActiveViewMode } from '../../../../../../redux/features/viewMode/viewModeSlice';

import ChangeSize from '../../components/ChangeSize';


const useStyle = createUseStyles({
    renderMakeCont:{
        borderRight: '1px solid #cdcdcd',
        background: '#fff',
        height: '100%',
        width: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
        display: 'grid',
        gridTemplateRows: '1fr auto',
        transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)'
    },
    plannerRenderCont: {
        overflow: 'hidden',
        height: '100%',
        position: 'relative',
        background: '#fff',
        borderBottom: '1px solid #C6C4C4',
        transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)'
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
        '&::before':{
            content: "''",
            width: '100%',
            height: '100%',
            position: 'fixed',
            left: 0,
            top: 0,
            background: 'rgba(0, 0, 0, .8)',
            zIndex: 3
        }
    },
    title:{
        fontSize: '18px',
        color: '#373737',
        marginBottom: 13,
        fontWeight: 300,
        letterSpacing: '-1px',
    },

    viewItemStandart:{
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
        '& path':{
            transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        },
        '&:hover':{
            border: '1px solid #9DD900',
            '& path':{
                fill: '#ffd119'
            }
        }
    },
    changeSizeWr:{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 13,
        marginBottom: 15
    },
    changeSizeWrInputs:{
        display: "flex",
        flexDirection: "column",
        paddingTop: 10,
        width: '66%'
    },
    text:{
        fontSize: 13,
        color: '#828282',
        '& span':{
           color: '#373737',
            fontWeight: 700
        }
    },
    arrowDown:{
        transform: 'rotate(-90deg)',
        cursor: 'pointer',
        '& path':{
            transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        },
        '&:hover':{
            '& path':{
                fill: '#a0a0a0'
            }
        }
    },
    changeHeightWr:{
        height: 220,
        position: 'relative'
    },
    changeHeightLine:{
        width: 1,
        background: '#cdcdcd',
        height: '100%',
        position: 'absolute',
        left: '50%',
        top: 0,
    },
    changeHeightLineActive:{
        width: 1,
        background: '#9DD900',
        height: 85,
        position: 'absolute',
        left: 0,
        bottom: 0,
    },
    changeHeightIconWr:{
        right: 'calc(50% + 2px)',
        position: 'absolute',
        display: "flex",
    },
    changeHeightIcon:{
        cursor: 'pointer',
        transform: 'rotateY(180deg)',
        position: 'relative',
        zIndex: '3'
    },
    changeHeightIconRotate:{
        position: 'absolute',
        right: 'calc(100% + 42px)',
        top: '50%',
        transform: 'translateY(-50%)',
        cursor: 'pointer'
    },
    changeHeightIconArea:{
        top: '50%',
        right: '-10px',
        position: 'absolute',
        transform: 'translateY(-50%)'
    },
    choiseRenderWr:{
        border: 'none',
        marginTop: 20
    },
    choiseRenderBtn:{
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
        '&:after':{
            top: "0",
            left: "0",
            width: "calc(100%)",
            height: "100%",
            content: '""',
            zIndex: 1,
            position: "absolute",
            boxShadow: "inset 0 0 0 0px #BAE51F",
            transition: "all 0.9s cubic-bezier(0.19, 1, 0.22, 1)",
            pointerEvents: "none"
        },
        '&:hover':{
           background: '#E9E9E9'
        }
    },
    choiseRenderBtn_active:{
        background: '#fff',
        pointerEvents: 'none',
        border:'1px solid #BAE51F',
        '&:after':{
            boxShadow: "inset 0 0 0 2px #BAE51F",
        }
    },
    choiseRenderRadio:{
        position: 'relative',
        color: '#373737',
        fontWeight: '700',
        fontSize: 16,
        alignItems: 'center',
        userSelect: 'none',
        display: 'flex',
        '& span':{
            color: '#828282',
            fontSize: 13,
            display: 'block',
            padding: '0 5px'
        },
        '& svg':{
            cursor: 'pointer'
        }
    },
    choiseRenderPriceWr:{
        fontSize: 13,
        textAlign: 'right',
    },
    choiseRenderPrice:{
        '& span':{
            fontWeight: 700,
            display: 'inline-block',
            marginRight: 4
        }
    },
    choiseRenderExempleBtn:{
        color: '#66ACF4',
        textDecoration: 'underline',
        cursor: 'pointer',
        '&:hover':{
            textDecoration: 'none',
        }
    },
    textWrap:{
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: "column",
        marginTop: 5
    },
    startRenderIcon:{
        width: 36,
        marginRight: 7
    },
    plannerRender_button:{
        background: '#66ABF3',
        color: "#fff",
        cursor: "pointer",
        height: "35px",
        display: "flex",
        padding: "5px 9px",
        fontSize: "14px",
        transition: "all 0.9s cubic-bezier(0.19, 1, 0.22, 1)",
        alignItems: "center",
        borderRadius: "3px",
        justifyContent: "center",
        '&:hover':{
            background: '#5592d3'
        }
    },
    renderMake_button:{
        color: "#2A3435",
        border: "none",
        cursor: "pointer",
        height: "35px",
        display: "inline-flex",
        outline: "none",
        padding: "0 10px",
        fontSize: "14px",
        minWidth: "120px",
        transition: "all 0.9s cubic-bezier(0.19, 1, 0.22, 1)",
        alignItems: "center",
        borderRadius: "3px",
        textTransform: "uppercase",
        justifyContent: "center",
    },
    renderMake_button_main:{
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        width: '100%'
    },
    renderMake_button_cancel:{
        border: "1px solid #000000",
        justifyContent: "flex-start",
        '& svg':{
            marginRight: 10
        },
        '& p':{
            flex: 2,
            color: '#2A3435',
            textAlign: 'center'
        },
        '&:hover':{
            background: '#E9E9E9',
            color: '#ffffff',
        },
    },
    renderMake_button_cancel_disable:{
        '&:hover':{
            cursor: 'default',
            border: '1px solid #000000',
            background: 'transparent',
            color: '#000000',
            '& svg path':{
                fill: '#000000'
            }
        },
    },
    renderMake_button_save:{
        justifyContent: 'flex-start',
        background: '#BBE521',
        '& svg':{
            marginRight: 10
        },
        '& p':{
            flex: 2,
            textAlign: 'center',
            marginRight: 0,
            color: '#2A3435'
        },
        '&:hover':{
            background: '#8fc32d'
        }
    },
    renderMake_buttons:{
        display: "grid",
        padding: "14px",
        gridGap: "8px",
        gridTemplateColumns: "repeat(2, calc(50% - 4px))"
    },
    renderMake_button_save_ready:{

    },
    renderMake_button_save_disabled:{
        border: '1px solid #999999',
        background: '#cccccc',
        color: '#666666',
        pointerEvents: 'none',
        '&:hover':{
            border: '1px solid #999999',
            background: '#cccccc'
        }
    },
    getMoreCredits:{
        color: '#66ACF4',
        fontSize: 13,
        textDecoration: 'underline',
        cursor: 'pointer',
        '&:hover':{
            textDecoration: 'none',
        }
    },
    planner_popup_close:{
        width: 20,
        height: 20,
        position: 'absolute',
        top: 8,
        right: 8,
        cursor: 'pointer',
        zIndex: '2',
        '& path': {
            transition: 'all 0.9s cubic-bezier(.19,1,.22,1)'
        },
        '&:hover':{
            '& path':{
                fill: '#BAE51F'
            }
        }
    },
    planner_popup_close_icon:{
        width: '100%'
    },
});

const Main = props => {
    const classes = useStyle();
    let dispatch = useDispatch();
    
    let translation = useSelector(selectTranslation);
    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let isAdded = lastHistoryElem?.isAdded;
    let controlPanelData = useSelector(selectControlPanelData);
    let activePano = useSelector(selectActivePano);
    let userProfileData = useSelector(selectUserProfileData);
    let activeViewMode = useSelector(selectActiveViewMode);
    let prevControlPanelMode = useSelector(selectPrevControlPanelMode);
    let renderMakeState = useSelector(selectRenderMakeState);
    let wallsHeight = useSelector(selectWallsHeight);

    let [styleAnimation, setStyleAnimation] = useState(isAdded ? {transform: "translateX(100%)"} : { transform: "translateX(-100%)" });
    let [cameraHeight, setCameraHeight] = useState(null);
    let [cameraFOV, setCameraFOV] = useState(null);
    let [clipping, setClipping] = useState(0);
    let [cameraVerAngle, setCameraVerAngle] = useState(0);
    let [cameraIconHeight, setCameraIconHeight] = useState(0);
    let [cameraRatio, setCameraRatio] = useState(null);
    let [cameraIconMaxTopOffset, setCameraIconMaxTopOffset] = useState(null);
    let [activeFormat, setActiveFormat] = useState(3);
    let [preloadActive, setPreloadActive] = useState(false);
    let [mouseDown, setMouseDown] = useState({status: false, action: null});
    let [maxCameraHeight, setMaxCameraHeight] = useState(0);

    let renderBackground = useRef(null);

    let cameraIcon = useRef(null);
    let cameraIconDiv = useRef(null);
    let mainWrap = useRef(null);
    let mainDiv = useRef(null);

    let rendersPrices = {
        '2k': 1,
        '4k': 2,
        '360': 4 
    }

    let activeIntId = planner.renders.activeIntId;

    let credits = userProfileData.credits ? (+userProfileData.credits)?.toFixed(0) : 0;

    let minFOV = 20;
    let maxFOV = 120;

    let minVerAngle = -57;
    let maxVerAngle = 83;

    let minClipping = 1;
    let maxClipping = 300;

    let mouseDownIcon = false;
    let infoText, timeoutId;
    let minCameraHeight = 0;

    let onScreenshotMake = e => {
        let link = document.createElement("a");
        link.setAttribute("href", planner.scene.makeRenderScreenShot());
        link.setAttribute("download", 'screenshot.jpg');
        link.click();
    }

    let changeFormatActive = num => setActiveFormat(num);

    let onClickRenderBtn = async () => {
        if(preloadActive || activeFormat === null) return;

        // GTM
        window.dataLayer.push({'event': 'click_start_render'});

        if(activeFormat === 0) {
            onScreenshotMake();
            return;
        }

        if(!credits) {
            dispatch(setActivePopup({name: "buyCredits"}));
            return;
        }

        if((activeFormat == 3 && credits < rendersPrices['2k']) || (activeFormat == 4 && credits < rendersPrices['4k']) || (activeFormat == 5 && credits < rendersPrices['360'])) return dispatch(setActivePopup({name: "buyCredits"}));

        setPreloadActive(true);

        let newRenderId = await user.makeRender({type: activeFormat, environment: null});

        if(newRenderId?.type == "error") {
            setPreloadActive(false);
            return dispatch(setActivePopup({name: "alert", data: newRenderId.data}));
        }
        
        dispatch(setActivePopup({name: "renderMade"}));

        let responseIsLogged = await user.checkIsLogged();
        if(responseIsLogged.type == "error") {
            setPreloadActive(false);
            return dispatch(setActivePopup({name: "alert", data: responseIsLogged.data}));
        } else dispatch(saveLoggedStatus(responseIsLogged));
    
        let responseProfileData = await user.loadProfileData();
        if(responseProfileData.type == "error") {
            setPreloadActive(false);
            return dispatch(setActivePopup({name: "alert", data: responseProfileData.data}));
        }
        else dispatch(setProfileData(responseProfileData));

        setPreloadActive(false);

        if(activeIntId) {
            clearInterval(activeIntId);
            planner.renders.activeIntId = null;
        }

        planner.renders.inProgressIds.push(newRenderId);

        let key = setInterval(async () => {
            let renders = await user.loadRenders();
            let inProgressIds = planner.renders.inProgressIds;
            if(renders) {
                renders.data.items.forEach(item => {
                    if(inProgressIds.length < 1) {
                        clearInterval(key);
                        planner.renders.activeIntId = null;
                    }
                    inProgressIds.forEach(renderId => {
                        if(item.renderId == renderId && (item.status == "stored" || item.status == "error")) {
                            planner.apiScene.dispatchEvent(new Event(planner.apiScene.RENDERS_UPDATE, {renders: renders.data.items, status: item.status}));
                            planner.renders.inProgressIds = inProgressIds.filter(i => i != renderId);
                        }
                    })
                })
            }
        }, 15000)

        planner.renders.activeIntId = key;
    }

    let onRenderClose = async e => {
        if(preloadActive) return;

        planner.scene.setDynamicPanelStatusToPrevState();
        R2D.Viewers.setCamerasDataToSaved();

        await R2D.scene.setSavedPanoData(R2D.viewWalk.getSavedPanoData().id, R2D.viewWalk.getSavedPanoData().rotation);

        let panorams = planner.getPanorams();
        let previewImgSrc = panorams.find(i => i.id == R2D.viewWalk.getSavedPanoData().id)?.source.images.preview || '';
        dispatch(changeActivePano({id: R2D.viewWalk.getSavedPanoData().id, previewImgSrc, rotation: R2D.viewWalk.getSavedPanoData().rotation}));
        R2D.Viewers.clearSavedPanoData();
        R2D.Viewers.clearSavedCameraData();

        R2D.mouseInteractionHelper.state.setIsSelectingModel && R2D.mouseInteractionHelper.state.setIsSelectingModel(true);
        WC.wallsEditor.state.setIsSelectElementsActive && WC.wallsEditor.state.setIsSelectElementsActive(true);

        planner.scene.offClipping();
        
        planner[activeViewMode].activate();

        R2D.view3d.changeIsRenderStateActive(false);
        R2D.viewWalk.changeIsRenderStateActive(false);
        R2D.view3d.setRenderMakeType('');
        planner.scene.showAllHiddenPartialVisibleElements();
        if(R2D.Viewers.getCurrentViewerType() == '3d' || R2D.Viewers.getCurrentViewerType() == 'walk') {
          planner.scene.setDistFromCameraToPlane(20);
          planner.mih()._currentViewer.cameraMinHeightResetToDef && planner.mih()._currentViewer.cameraMinHeightResetToDef();
          R2D.Viewers.getCurrentViewerType() == 'walk' && planner.mih()._currentViewer.showCursor();
        }
        R2D.Viewers.changeIsRenderActive(false);
        R2D.scene.checkSkybox();

        let furnitureData = planner.getCatalogProducts();
        prevControlPanelMode ?
        dispatch(changeActiveControlPanelMode({mode: prevControlPanelMode})) : 
        dispatch(changeActiveControlPanelMode({
            mode: 'furniture', 
            data: controlPanelData['furniture'].history.length < 1 ? {type: "catalog", addType: "main", id: null, lastSavedScroll: 0, data: furnitureData} : null
        }));

        dispatch(updateControlPanelStatus(true));
    }

    let startDragPosition = 0;

    let onCameraIconDown = e => {
        startDragPosition = e.clientY;
        document.addEventListener("mousemove", onMoveCameraIcon);
        document.addEventListener("mouseup", onStopMoveCameraIcon);
    }

    let updateHeightValue = (mouseDown, value) => {
        setMouseDown(mouseDown);
        value = value < 1 ? 0 : value;
        let maxCameraHeightValue = maxCameraHeight < minCameraHeight ? minCameraHeight : maxCameraHeight;
        value = value > maxCameraHeightValue ? maxCameraHeightValue : value;

        planner.mih()._currentViewer?.cameraMoveY && planner.mih()._currentViewer.cameraMoveY(value);
        let newCameraHeightValue  = ((value / cameraRatio) - cameraIconMaxTopOffset) / -1;
        setCameraHeight(value);
        setCameraIconHeight(newCameraHeightValue);
    }

    let updateCameraAngle = (mouseDown, value) => {
        setMouseDown(mouseDown);
        value = value < minVerAngle ? minVerAngle : value;
        value = value > maxVerAngle ? maxVerAngle : value;

        planner.scene.setCameraVerAngleRad(+value * Math.PI / 180);
        setCameraVerAngle(+value);

    };

    let updateFOVValue = (mouseDown, value) => {
        setMouseDown(mouseDown);
        value = value < minFOV ? minFOV : value;
        value = value > maxFOV ? maxFOV : value;
        
        if(planner.mih()._currentViewer.setCameraFOV) {
            planner.mih()._currentViewer.setCameraFOV(value);
            setCameraFOV(value);
        }
    }

    let updateClippingValue = (mouseDown, value) => {
        setMouseDown(mouseDown);

        value = value < minClipping ? minClipping : value;
        value = value > maxClipping ? maxClipping : value;

        planner.scene.setDistFromCameraToPlane(value);
        setClipping(value);
    }

    let onMoveCameraIcon = e => {
        let moveProgress = e.clientY - startDragPosition;
        let newCameraHeightValue = null;
        if(moveProgress < 0) {
            newCameraHeightValue = cameraIconHeight + moveProgress;
            newCameraHeightValue = newCameraHeightValue < 1 ? 0 : newCameraHeightValue;
        } else {
            newCameraHeightValue = cameraIconHeight + moveProgress;
            newCameraHeightValue = newCameraHeightValue > cameraIconMaxTopOffset ? cameraIconMaxTopOffset : newCameraHeightValue;
        }

        let newCameraHeight = (cameraIconMaxTopOffset - newCameraHeightValue) * cameraRatio;

        setCameraIconHeight(newCameraHeightValue);
        setCameraHeight(newCameraHeight);

        planner.mih()._currentViewer.cameraMoveY(newCameraHeight);
    };

    let onStopMoveCameraIcon = e => {
        document.removeEventListener("mousemove", onMoveCameraIcon);
        document.removeEventListener("mouseup", onStopMoveCameraIcon);
    }

    let onPanoChange = e => {
        document.querySelector(".product_hover") && document.querySelector(".product_hover").remove();
        dispatch(controlPanelHistoryAdd({type: "changePano"}));
        dispatch(controlPanelUpdateBreadCrumbs({data: {type: "changePano"}, updateType: "add"}));
    }

    let changeVerticalCameraAngle = e => {
        if(!cameraIconDiv.current) return;
        if(e.data.degrees) {
            setCameraVerAngle(e.data.degrees);
        }
        if(e.data.position) {
            let maxCameraHeightVal = renderMakeState.type == "interior" ? wallsHeight : R2D.view3d.getCameraMaxHeight();
            let cameraIconMaxTopOffset = cameraIconDiv.current.offsetHeight - cameraIcon.current.offsetHeight;
            let maxCameraHeightValue = maxCameraHeightVal < minCameraHeight ? minCameraHeight : maxCameraHeightVal;
            let cameraRatio = maxCameraHeightValue / cameraIconMaxTopOffset;
            
            setCameraHeight(e.data.position.y);
            let height = cameraIconMaxTopOffset - (e.data.position.y / cameraRatio).toFixed(0);  
            if (height >= 0) {
                setCameraIconHeight(height);
            }
        }
    }

    let mouseEnterIcon = (e, text) => {
        if(!mouseDownIcon) {
            infoText = document.createElement("div");
            infoText.classList.add(classes.hoverDivIcon);
            infoText.textContent = text;
            document.querySelector("body").append(infoText);
            if(!infoText) return;
            infoText.style.right = window.innerWidth - e.clientX + 5 + "px";
            infoText.style.top = e.clientY - 15 + "px";
            timeoutId = setTimeout(() => infoText.style.display = "block", 1000);
        }
    }

    //ROTATE
    let cameraIconRotate = useRef(null);
    let active = false;
    let [angle, setAngle] = useState(0);
    let center = { x: 0, y: 0 };

    let startRotateCameraIcon = (e) => {
        e.preventDefault();
        var bb = cameraIcon.current.getBoundingClientRect(),
            t = bb.top,
            l = bb.left,
            h = bb.height,
            w = bb.width;

        center = {
            x: l + w / 2,
            y: t + h / 2,
        };
        document.addEventListener("mousemove", rotateCameraIcon);
        document.addEventListener("mouseup", stopRotateCameraIcon);
        return (active = true);
    };
    
    let rotateCameraIcon = (e) => {
        if (!active) return;
        e.preventDefault();
        var x = e.clientX - center.x,
            y = e.clientY - center.y,
            d = (Math.atan2(y, x) * 180) / Math.PI;
        angle = d > 0 ? 180 - d : -(180 + d);
        angle = angle < minVerAngle ? minVerAngle : angle;
        angle = angle > maxVerAngle ? maxVerAngle : angle;
        planner.scene.setCameraVerAngleRad(angle * Math.PI / 180);
        setCameraVerAngle(angle);
        return cameraIcon.current.style.webkitTransform = `translateX(12px) rotate(${-angle}deg)`;
    };
    
    let stopRotateCameraIcon = (e) => {
        e.preventDefault();
        setAngle(angle);
        return (active = false);
    };

    let openCameraViews = e => {
        dispatch(controlPanelHistoryAdd({type: "cameraViews"}));
        dispatch(controlPanelUpdateBreadCrumbs({data: {type: "cameraViews"}, updateType: "add"}));
    };

    let mouseMoveIcon = e => {
        if(!mouseDownIcon) {
            if(!infoText) return;
            infoText.style.right = window.innerWidth - e.clientX + 5 + "px";
            infoText.style.top = e.clientY - 15 + "px";
        }
    }

    let mouseLeaveIcon = e => {
        if(!mouseDownIcon) {
            clearTimeout(timeoutId);
            infoText && infoText.remove();
        }
    }

    let mouseUpDocument = e => {
        mouseDownIcon = false;
        infoText && infoText.remove();
        document.removeEventListener("mouseup", mouseUpDocument);
    }

    let onMouseDownIcon = e => {
        mouseLeaveIcon(e);
        document.addEventListener("mouseup", mouseUpDocument);
        mouseDownIcon = true;
    }

    let mouseEnter = e => {
        document.querySelector(".product_hover") && document.querySelector(".product_hover").remove();
        let product = e.target;
        let hoverWindow = document.createElement("div");
        hoverWindow.classList.add("product_hover");
        let panoName = '';
        if(activePano.id.indexOf && ~activePano.id.indexOf('#')) {
            panoName = activePano.id;
        } else {
            if(activePano.id == 'transparent') {
                panoName = translation['TRANSPARENT_BACKGROUND']
            }
            else {
                let panoData = planner.getPanorams();
                panoName = panoData.find(i => {
                    if(!activePano.id && i.tags.includes("skybox_default")) {
                        return i;
                    } else {
                        if(i.id == activePano.id) return i;
                    }
                })?.name;
            }
        }
        hoverWindow.innerHTML = panoName;
        document.querySelector("body").append(hoverWindow);
        hoverWindow.style.left = (product.getBoundingClientRect().left + product.offsetWidth - 20) + "px";
        hoverWindow.style.top = (product.getBoundingClientRect().top + ((product.offsetHeight - hoverWindow.offsetHeight) / 2)) + "px";
    }

    let mouseLeave = () => document.querySelector(".product_hover") && document.querySelector(".product_hover").remove();

    useEffect(() => {
        if(!document.querySelector(".renderMake")) return;
        if(preloadActive) {
            mainWrap.current.classList.add(classes.plannerRenderWrap_onRenderMake);
            document.querySelector(".renderMake").classList.add('render_proceed');
            if(document.querySelector(".renderMake .viewer-body")) document.querySelector(".renderMake .viewer-body").style.zIndex = 0;
            mainDiv.current.style.border = 'none';
        }
        else {
            mainWrap.current.classList.remove(classes.plannerRenderWrap_onRenderMake);
            document.querySelector(".renderMake")?.classList.remove('render_proceed');
            if(document.querySelector(".renderMake .viewer-body")) document.querySelector(".renderMake .viewer-body").style.zIndex = 1;
            mainDiv.current.style.borderLeft = '1px solid #cdcdcd';
        }
    }, [preloadActive]);

    useEffect(() => {
        setTimeout(() => setStyleAnimation({ transform: "translateX(0%)" }), 0);
        let cameraData = renderMakeState.type == 'topView' || renderMakeState.type == 'exterior' ? R2D.view3d.getCameraData() : R2D.viewWalk.getCameraData();
        if(renderMakeState.type == 'topView') cameraData = { ...cameraData, viewportTop: cameraData.viewportTop * 2 };
        let maxCameraHeightVal = renderMakeState.type == 'interior' ? wallsHeight : R2D.view3d.getCameraMaxHeight();

        setMaxCameraHeight(maxCameraHeightVal);
        setCameraHeight(cameraData?.viewportTop || cameraData.position.y);

        if(renderMakeState.type == 'interior') setClipping(planner.scene.getDistFromCameraToPlane(R2D.Viewers.getCurrentViewerType() == 'walk' ? 'viewWalk' : 'view3d'));

        let cameraIconMaxTopOffset = cameraIconDiv.current.offsetHeight - cameraIcon.current.offsetHeight;
        let maxCameraHeightValue = maxCameraHeightVal < minCameraHeight ? minCameraHeight : maxCameraHeightVal;
        let cameraRatio = maxCameraHeightValue / cameraIconMaxTopOffset;

        setCameraVerAngle(planner.scene.getCameraVerAngle());
        setCameraFOV((planner.mih()._currentViewer?.getCameraFOV && planner.mih()._currentViewer.getCameraFOV()) || 0);
        
        setCameraIconHeight(cameraIconMaxTopOffset - (( cameraData.viewportTop || cameraData.position.y ) / cameraRatio).toFixed(0));
        setCameraRatio(cameraRatio);
        setCameraIconMaxTopOffset(cameraIconMaxTopOffset);
    }, [])

    useEffect(async () => {
        setTimeout(() => {
            planner.scene.addEventListener(planner.scene.CAMERA_ROTATE, changeVerticalCameraAngle);
            planner.scene.addEventListener(planner.scene.CAMERA_ZOOM, changeVerticalCameraAngle);

            if(renderMakeState.fromApply) return;
            if(renderMakeState.type == 'topView' || renderMakeState.type == 'exterior') {
                if(renderMakeState.type == 'topView') {
                    activeFormat == 5 && setActiveFormat(3);
                }
            }

            let cameraData = renderMakeState.type == 'topView' ? R2D.view3d.getSavedTopViewCameraData() || R2D.view2d.getSavedCameraData() : renderMakeState.type == 'exterior' ? R2D.view3d.getSavedExteriorCameraData() || R2D.view3d.getSavedCameraData() : R2D.viewWalk.getSavedInteriorCameraData() || R2D.viewWalk.getSavedCameraData();

            if(renderMakeState.type == 'topView') {
                cameraData = R2D.view3d.getSavedTopViewCameraData() ? cameraData : { ...cameraData, viewportTop: cameraData.viewportTop * 2 };
            }

            let maxCameraHeightVal = renderMakeState.type == 'interior' ? wallsHeight : R2D.view3d.getCameraMaxHeight();

            if(renderMakeState.type == 'topView' || renderMakeState.type == 'exterior') R2D.view3d.setCameraMinHeight(0)
            if(!cameraIconDiv.current) return;

            setMaxCameraHeight(maxCameraHeightVal);
            setCameraHeight(cameraData?.viewportTop || cameraData.position.y);

            renderMakeState.type != 'topView' && setClipping(planner.scene.getDistFromCameraToPlane(R2D.Viewers.getCurrentViewerType() == 'walk' ? 'viewWalk' : 'view3d'));

            let cameraIconMaxTopOffset = cameraIconDiv.current.offsetHeight - cameraIcon.current.offsetHeight;
            let maxCameraHeightValue = maxCameraHeightVal < minCameraHeight ? minCameraHeight : maxCameraHeightVal;
            let cameraRatio = maxCameraHeightValue / cameraIconMaxTopOffset;

            setCameraVerAngle(planner.scene.getCameraVerAngle());
            setCameraFOV(cameraData.fov || (planner.mih()._currentViewer?.getCameraFOV && planner.mih()._currentViewer.getCameraFOV()) || 0);
            
            setCameraIconHeight(cameraIconMaxTopOffset - ((cameraData.viewportTop || cameraData.position.y) / cameraRatio).toFixed(0));
            setCameraRatio(cameraRatio);
            setCameraIconMaxTopOffset(cameraIconMaxTopOffset);

            R2D.scene.repositionSkybox();
        }, 100)

        return () => {
            planner.scene.removeEventListener(planner.scene.CAMERA_ROTATE, changeVerticalCameraAngle);
            planner.scene.removeEventListener(planner.scene.CAMERA_ZOOM, changeVerticalCameraAngle);
        }
    }, [renderMakeState]);

    return (
        <div className={classes.renderMakeCont}>
            <div className={classes.plannerRenderCont} ref={mainDiv} style={styleAnimation}>
                <SimpleBar style={{ height: '100%',background: '#ffffff' }} autoHide={false} forceVisible="y">
                    <div className={classes.plannerRenderWrap} ref={mainWrap}>
                        <div>
                            <div className={classes.title}>{ translation["RENDER_PANO_CHOOSE"] }</div>
                            <div className={classes.viewItemStandart} ref={renderBackground} onMouseEnter={mouseEnter} onMouseLeave={mouseLeave} style={activePano.id?.indexOf && ~activePano.id.indexOf('#') ? {backgroundColor: activePano.id} : {backgroundImage: `url('${activePano.previewImgSrc ? R2D.URL.DOMAIN + activePano.previewImgSrc : '/src_designer/images/bg_sky.jpg'}')`}} onClick={onPanoChange}></div>

                            <div className={classes.changeSizeWr}>
                                <div className={classes.changeSizeWrInputs}>
                                    <ChangeSize mouseDown={mouseDown} changeValue={updateHeightValue} value={cameraHeight && planner.units.getName() == "cm" ? cameraHeight.toFixed(0) : cameraHeight} label={translation["RENDER_CAMERA_HEIGHT"]} labelAfter={planner.units.getName()} type={"style_1"}/>
                                    {
                                        renderMakeState.type != 'topView' ?
                                        <ChangeSize mouseDown={mouseDown} revertedSign={true} changeValue={updateCameraAngle} lessThenZero={true} notConvertToCurrentMetric={true} value={cameraVerAngle && cameraVerAngle.toFixed(0) * -1} label={translation["RENDER_CAMERA_ANGLE"]} labelAfter={"°"} type={"style_1"}/>
                                        : null
                                    }
                                    {

                                        <ChangeSize mouseDown={mouseDown} changeValue={updateFOVValue} notConvertToCurrentMetric={true} value={cameraFOV} infoHover={translation["RENDER_ADVANCED_INFO_FOV"]} label={translation["RENDER_FIELD_OF_ VIEW"]} labelAfter={"°"} type={"style_1"}/>

                                    }
                                    {
                                        renderMakeState.type != 'topView' ?
                                        <ChangeSize mouseDown={mouseDown} changeValue={updateClippingValue} infoHover={translation["RENDER_ADVANCED_INFO_CLIPPING"]} value={clipping} label={translation["RENDER_CLIPPING"]} labelAfter={planner.units.getName()} type={"style_1"} />
                                        : null
                                    }

                                </div>

                                <div className={classes.changeHeightWr} ref={cameraIconDiv}>
                                    <div className={classes.changeHeightLine}>
                                        <div className={classes.changeHeightLineActive}></div>
                                    </div>
                                    <div className={classes.changeHeightIconWr} ref={cameraIcon} style={{top: cameraIconHeight + "px", transform: cameraVerAngle ? `translateX(12px) rotate(${cameraVerAngle.toFixed(0) * -1}deg)` : 'translateX(12px)'}}>
                                        <svg className={classes.changeHeightIcon} width="35" height="35" viewBox="0 0 35 35" fill="none" onMouseDown={onCameraIconDown}>
                                            <rect x="7.61133" y="10.2478" width="6.9342" height="15.8496" rx="1" transform="rotate(1.24049 7.61133 10.2478)" fill="#2D8BDB"/>
                                            <rect x="14.9629" y="13.8752" width="1.4859" height="8.9154" rx="0.74295" transform="rotate(1.24049 14.9629 13.8752)" fill="#2D8BDB"/>
                                            <rect x="8.63477" y="8.78369" width="4.953" height="0.9906" rx="0.4953" transform="rotate(1.24049 8.63477 8.78369)" fill="#2D8BDB"/>
                                            <rect x="16.9551" y="13.4232" width="9.906" height="9.906" rx="1" transform="rotate(1.24049 16.9551 13.4232)" fill="#2D8BDB"/>
                                            <rect x="27.3633" y="13.1531" width="2.9718" height="10.8966" rx="1" transform="rotate(1.24049 27.3633 13.1531)" fill="#2D8BDB"/>
                                        </svg>
                                        <svg xmlns="http://www.w3.org/2000/svg" className={classes.changeHeightIconArea} width="92" height="91" viewBox="0 0 92 91" fill="none">
                                            <mask id="mask0_2290_2247" style={{maskType:"alpha"}} maskUnits="userSpaceOnUse" x="0" y="0" width="92" height="91">
                                                <circle cx="45.7227" cy="45.5" r="45.5" fill="#F3F3F3"/>
                                            </mask>
                                            <g mask="url(#mask0_2290_2247)">
                                                <path d="M48.541 45.5L-6.42138 77.2325L-6.42138 13.7674L48.541 45.5Z" fill="#F3F3F3"/>
                                            </g>
                                        </svg>
                                        {
                                            renderMakeState.type != 'topView' ?
                                            <svg width="8" height="18" viewBox="0 0 8 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={classes.changeHeightIconRotate} ref={cameraIconRotate} onMouseDown={startRotateCameraIcon}>
                                                <path fillRule="evenodd" clipRule="evenodd" d="M4.45795 17.1663L3.96787 17.6978L3.9644 17.6941L3.96095 17.6977L3.47244 17.1679L-0.000866996 13.4536L1.23534 13.4536L3.9644 16.4022L6.69348 13.4536L7.92969 13.4536L4.45795 17.1663Z" fill="#2D8BDB"/>
                                                <path fillRule="evenodd" clipRule="evenodd" d="M4.45795 0.770513L3.96787 0.239014L3.9644 0.242717L3.96095 0.239026L3.47244 0.768819L-0.000866996 4.48316L1.23534 4.48316L3.9644 1.53453L6.69348 4.48317L7.92969 4.48317L4.45795 0.770513Z" fill="#2D8BDB"/>
                                                <circle cx="3.90679" cy="9.0974" r="3.22124" fill="#2D8BDB"/>
                                            </svg>
                                            : null
                                        }

                                    </div>
                                </div>
                            </div>
                            <div className={classes.plannerRender_button} onClick={openCameraViews}>{translation['RENDER_CAMERA_VIEWS']}</div>

                            <fieldset className={classes.choiseRenderWr}>
                                <div className={classes.choiseRenderBtn + ' ' + (activeFormat == 0 ? classes.choiseRenderBtn_active : '')} onClick={e => changeFormatActive(0)}>
                                    <div className={classes.choiseRenderRadio}>
                                        { translation["RENDER_SCREENSHOT"] }
                                    </div>
                                    <div className={classes.choiseRenderPriceWr}>
                                        <div className={classes.choiseRenderPrice}>{ translation["RENDER_FREE"] }</div>
                                    </div>
                                </div>
                                <div className={classes.choiseRenderBtn + ' ' + (activeFormat == 3 ? classes.choiseRenderBtn_active : '')} onClick={e => changeFormatActive(3)}>
                                    <div className={classes.choiseRenderRadio}>
                                        { translation["RENDER_FULL_HD"] }
                                        <span>1920x1080</span>
                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={classes.changerMain_info} onMouseDown={onMouseDownIcon} onMouseEnter={e => mouseEnterIcon(e, translation['RENDER_EXAMPLES_TEXT'])} onMouseMove={mouseMoveIcon} onMouseLeave={mouseLeaveIcon} onMouseUp={e => (typeof switch_image !== 'undefined' && switch_image && switch_image.length > 0 && dispatch(setActivePopup({name: "renderExample_big"})) || dispatch(setActivePopup({name: "alert", data: "TEXT_ERROR_LOAD_DATA"})))}>
                                            <circle cx="9" cy="9" r="9" fill="#2D8BDB"/>
                                            <path d="M10.0621 10.1938H8.76172C8.76535 9.86368 8.79255 9.58076 8.84333 9.34499C8.89774 9.10922 8.98661 8.89702 9.10993 8.70841C9.23326 8.51617 9.40011 8.32029 9.61049 8.1208C9.77734 7.96483 9.92606 7.81792 10.0566 7.68009C10.1908 7.53863 10.296 7.39172 10.3722 7.23938C10.4484 7.08341 10.4865 6.90749 10.4865 6.71162C10.4865 6.49036 10.4502 6.30537 10.3777 6.15665C10.3087 6.00793 10.2054 5.89549 10.0675 5.81932C9.93331 5.73952 9.76465 5.69962 9.56152 5.69962C9.39467 5.69962 9.23689 5.73408 9.08817 5.803C8.93945 5.87191 8.81975 5.97892 8.72907 6.12401C8.63839 6.26547 8.58943 6.45046 8.58217 6.67897H7.14035C7.15123 6.2038 7.26367 5.80844 7.47768 5.49287C7.69169 5.17367 7.98005 4.93609 8.34277 4.78012C8.7055 4.62052 9.11175 4.54072 9.56152 4.54072C10.0585 4.54072 10.4828 4.62415 10.8347 4.791C11.1902 4.95422 11.4604 5.19362 11.6454 5.50919C11.834 5.82476 11.9283 6.20562 11.9283 6.65177C11.9283 6.97096 11.8666 7.25752 11.7433 7.51142C11.62 7.7617 11.4568 7.99566 11.2536 8.21329C11.0505 8.43093 10.8311 8.65037 10.5953 8.87163C10.3885 9.05662 10.2489 9.25431 10.1763 9.46469C10.1038 9.67507 10.0657 9.91809 10.0621 10.1938ZM8.6257 11.8859C8.6257 11.6682 8.69824 11.4869 8.84333 11.3418C8.99205 11.1967 9.19155 11.1241 9.44182 11.1241C9.6921 11.1241 9.88979 11.1967 10.0349 11.3418C10.1836 11.4869 10.258 11.6682 10.258 11.8859C10.258 12.0962 10.1836 12.274 10.0349 12.4191C9.88979 12.5642 9.6921 12.6367 9.44182 12.6367C9.19155 12.6367 8.99205 12.5642 8.84333 12.4191C8.69824 12.274 8.6257 12.0962 8.6257 11.8859Z" fill="#E5E5E5"/>
                                        </svg>
                                    </div>
                                    <div className={classes.choiseRenderPriceWr}>
                                        <div className={classes.choiseRenderPrice}><span>{ rendersPrices['2k'] }</span>{translation["RENDER_CREDIT_2K"]}</div>
                                    </div>
                                </div>
                                <div className={classes.choiseRenderBtn + ' ' + (activeFormat == 4 ? classes.choiseRenderBtn_active : '')} onClick={e => changeFormatActive(4)}>
                                    <div className={classes.choiseRenderRadio}>
                                        { translation["RENDER_4K"] }
                                        <span>3840x2160</span>
                                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={classes.changerMain_info} onMouseDown={onMouseDownIcon} onMouseEnter={e => mouseEnterIcon(e, translation['RENDER_EXAMPLES_TEXT'])} onMouseMove={mouseMoveIcon} onMouseLeave={mouseLeaveIcon} onMouseUp={e => (typeof renders_2k_4k !== 'undefined' && renders_2k_4k && renders_2k_4k.length > 0 && dispatch(setActivePopup({name: "renderExample4k"}))) || dispatch(setActivePopup({name: "alert", data: "TEXT_ERROR_LOAD_DATA"}))}>
                                            <circle cx="9" cy="9" r="9" fill="#2D8BDB"/>
                                            <path d="M10.0621 10.1938H8.76172C8.76535 9.86368 8.79255 9.58076 8.84333 9.34499C8.89774 9.10922 8.98661 8.89702 9.10993 8.70841C9.23326 8.51617 9.40011 8.32029 9.61049 8.1208C9.77734 7.96483 9.92606 7.81792 10.0566 7.68009C10.1908 7.53863 10.296 7.39172 10.3722 7.23938C10.4484 7.08341 10.4865 6.90749 10.4865 6.71162C10.4865 6.49036 10.4502 6.30537 10.3777 6.15665C10.3087 6.00793 10.2054 5.89549 10.0675 5.81932C9.93331 5.73952 9.76465 5.69962 9.56152 5.69962C9.39467 5.69962 9.23689 5.73408 9.08817 5.803C8.93945 5.87191 8.81975 5.97892 8.72907 6.12401C8.63839 6.26547 8.58943 6.45046 8.58217 6.67897H7.14035C7.15123 6.2038 7.26367 5.80844 7.47768 5.49287C7.69169 5.17367 7.98005 4.93609 8.34277 4.78012C8.7055 4.62052 9.11175 4.54072 9.56152 4.54072C10.0585 4.54072 10.4828 4.62415 10.8347 4.791C11.1902 4.95422 11.4604 5.19362 11.6454 5.50919C11.834 5.82476 11.9283 6.20562 11.9283 6.65177C11.9283 6.97096 11.8666 7.25752 11.7433 7.51142C11.62 7.7617 11.4568 7.99566 11.2536 8.21329C11.0505 8.43093 10.8311 8.65037 10.5953 8.87163C10.3885 9.05662 10.2489 9.25431 10.1763 9.46469C10.1038 9.67507 10.0657 9.91809 10.0621 10.1938ZM8.6257 11.8859C8.6257 11.6682 8.69824 11.4869 8.84333 11.3418C8.99205 11.1967 9.19155 11.1241 9.44182 11.1241C9.6921 11.1241 9.88979 11.1967 10.0349 11.3418C10.1836 11.4869 10.258 11.6682 10.258 11.8859C10.258 12.0962 10.1836 12.274 10.0349 12.4191C9.88979 12.5642 9.6921 12.6367 9.44182 12.6367C9.19155 12.6367 8.99205 12.5642 8.84333 12.4191C8.69824 12.274 8.6257 12.0962 8.6257 11.8859Z" fill="#E5E5E5"/>
                                        </svg>
                                    </div>
                                    <div className={classes.choiseRenderPriceWr}>
                                        <div className={classes.choiseRenderPrice}><span>{ rendersPrices['4k'] }</span>{translation["RENDER_CREDIT_4K"]}</div>
                                    </div>
                                </div>
                                {
                                    renderMakeState.type != 'topView' ?
                                    <div className={classes.choiseRenderBtn + ' ' + (activeFormat == 5 ? classes.choiseRenderBtn_active : '')} onClick={e => changeFormatActive(5)}>
                                        <div className={classes.choiseRenderRadio}>
                                            { translation["RENDER_360"] }
                                            <span>360</span>
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className={classes.changerMain_info} onMouseDown={onMouseDownIcon} onMouseEnter={e => mouseEnterIcon(e, translation['RENDER_EXAMPLES_TEXT'])} onMouseMove={mouseMoveIcon} onMouseLeave={mouseLeaveIcon} onMouseUp={e => (typeof images_360 !== 'undefined' && images_360 && images_360.length > 0 && dispatch(setActivePopup({name: "renderExample_360"}))) || dispatch(setActivePopup({name: "alert", data: "TEXT_ERROR_LOAD_DATA"}))}>
                                                <circle cx="9" cy="9" r="9" fill="#2D8BDB"/>
                                                <path d="M10.0621 10.1938H8.76172C8.76535 9.86368 8.79255 9.58076 8.84333 9.34499C8.89774 9.10922 8.98661 8.89702 9.10993 8.70841C9.23326 8.51617 9.40011 8.32029 9.61049 8.1208C9.77734 7.96483 9.92606 7.81792 10.0566 7.68009C10.1908 7.53863 10.296 7.39172 10.3722 7.23938C10.4484 7.08341 10.4865 6.90749 10.4865 6.71162C10.4865 6.49036 10.4502 6.30537 10.3777 6.15665C10.3087 6.00793 10.2054 5.89549 10.0675 5.81932C9.93331 5.73952 9.76465 5.69962 9.56152 5.69962C9.39467 5.69962 9.23689 5.73408 9.08817 5.803C8.93945 5.87191 8.81975 5.97892 8.72907 6.12401C8.63839 6.26547 8.58943 6.45046 8.58217 6.67897H7.14035C7.15123 6.2038 7.26367 5.80844 7.47768 5.49287C7.69169 5.17367 7.98005 4.93609 8.34277 4.78012C8.7055 4.62052 9.11175 4.54072 9.56152 4.54072C10.0585 4.54072 10.4828 4.62415 10.8347 4.791C11.1902 4.95422 11.4604 5.19362 11.6454 5.50919C11.834 5.82476 11.9283 6.20562 11.9283 6.65177C11.9283 6.97096 11.8666 7.25752 11.7433 7.51142C11.62 7.7617 11.4568 7.99566 11.2536 8.21329C11.0505 8.43093 10.8311 8.65037 10.5953 8.87163C10.3885 9.05662 10.2489 9.25431 10.1763 9.46469C10.1038 9.67507 10.0657 9.91809 10.0621 10.1938ZM8.6257 11.8859C8.6257 11.6682 8.69824 11.4869 8.84333 11.3418C8.99205 11.1967 9.19155 11.1241 9.44182 11.1241C9.6921 11.1241 9.88979 11.1967 10.0349 11.3418C10.1836 11.4869 10.258 11.6682 10.258 11.8859C10.258 12.0962 10.1836 12.274 10.0349 12.4191C9.88979 12.5642 9.6921 12.6367 9.44182 12.6367C9.19155 12.6367 8.99205 12.5642 8.84333 12.4191C8.69824 12.274 8.6257 12.0962 8.6257 11.8859Z" fill="#E5E5E5"/>
                                            </svg>
                                        </div>
                                        <div className={classes.choiseRenderPriceWr}>
                                            <div className={classes.choiseRenderPrice}><span>{ rendersPrices['360'] }</span>{translation["RENDER_CREDIT_360"]}</div>
                                        </div>
                                    </div>
                                    : null
                                }

                            </fieldset>

                            <div className={classes.textWrap}>
                                <div className={classes.text}>{translation["RENDER_CREDITS_AMOUNT"]} <span>{ credits }</span></div>
                                <div className={classes.getMoreCredits} onClick={e => dispatch(setActivePopup({name: "buyCredits"}))}>{translation["RENDER_GET_MORE"]}</div>
                            </div>
                        </div>
                    </div>
                </SimpleBar>
            </div>

            <div className={classes.renderMake_buttons} style={preloadActive ? {zIndex: 4}: null}>

                <div className={classes.renderMake_button + ' ' + classes.renderMake_button_cancel + ' ' + (preloadActive ? classes.renderMake_button_cancel_disable : '')} onClick={onRenderClose}>
                    <svg width="21" height="22" viewBox="0 0 21 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.799 0.600586L20.5061 1.30769L0.707107 21.1067L0 20.3996L19.799 0.600586Z" fill="black"/>
                        <path d="M0.799112 0.600586L0.0920048 1.30769L19.891 21.1067L20.5981 20.3996L0.799112 0.600586Z" fill="black"/>
                    </svg>
                    <p>{ translation["UPLOAD_MODEL_TEXT_CANCEL"] }</p>
                </div>

                <div className={classes.renderMake_button + ' ' + classes.renderMake_button_save + ' ' + classes.renderMake_button_save_ready + (preloadActive ? ' ' + classes.renderMake_button_save_disabled : '')} style={preloadActive ? { justifyContent: 'center' } : null} onClick={onClickRenderBtn}>
                    {
                        preloadActive ? 
                            <div className='preloader-cube_relative'></div>
                            :
                            <div className={classes.renderMake_button_main}>
                                <svg className={classes.startRenderIcon} width="22" height="16.33" viewBox="0 0 35 26" fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M25.0601 3.5255H30.1606C31.5673 3.5255 32.3595 4.08467 33.3544 5.07988C34.3491 6.07509 34.908 7.42505 34.908 8.83271V20.4384V25.7455H29.6035H5.30441H0V20.4384V8.83271C0 7.42505 0.744521 6.07509 1.73921 5.07988C2.73416 4.08466 3.3407 3.52554 4.74737 3.52554H9.85879C9.89313 3.4259 9.95157 3.33624 10.0285 3.26413V3.26437L13.0019 0.480437C13.2753 0.223898 13.8064 0.0131617 14.1814 0.0131617L20.7416 1.8875e-06C21.1166 -0.000724082 21.6484 0.20806 21.9211 0.4646L24.8802 3.23413C24.9651 3.31331 25.0275 3.41392 25.0601 3.5255ZM28.4001 9.77932C29.1716 9.77932 29.7971 9.15384 29.7971 8.38227C29.7971 7.61071 29.1716 6.98523 28.4001 6.98523C27.6285 6.98523 27.003 7.61071 27.003 8.38227C27.003 9.15384 27.6285 9.77932 28.4001 9.77932ZM25.6059 13.9704C25.6059 18.5998 21.8531 22.3527 17.2237 22.3527C12.5943 22.3527 8.84141 18.5998 8.84141 13.9704C8.84141 9.34104 12.5943 5.58817 17.2237 5.58817C21.8531 5.58817 25.6059 9.34104 25.6059 13.9704ZM17.2236 19.5586C20.3098 19.5586 22.8117 17.0567 22.8117 13.9705C22.8117 10.8842 20.3098 8.38228 17.2236 8.38228C14.1373 8.38228 11.6354 10.8842 11.6354 13.9705C11.6354 17.0567 14.1373 19.5586 17.2236 19.5586Z" fill="#2A3435"/>
                                </svg>
                                <p>{ translation["RENDER_POPUP_BUTTON_START"] }</p>
                            </div>
                    }
                </div>

            </div>

        </div>
    );
};

export default Main;