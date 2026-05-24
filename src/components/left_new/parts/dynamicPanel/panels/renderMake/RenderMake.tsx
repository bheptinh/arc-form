import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from "framer-motion";
import {createUseStyles} from "react-jss";

import { planner } from '../../../../../../initR2D';
import { selectActiveViewMode } from '../../../../../../redux/features/viewMode/viewModeSlice';
import { changeActivePano, selectActivePano, selectRenderMakeState, updateRenderMakeState } from '../../../../../../redux/features/common/commonSlice';
import { changeActiveControlPanelMode, selectActiveControlPanelMode, selectActiveControlPanelModeData, selectControlPanelData, selectPrevControlPanelMode, updateControlPanelStatus } from '../../../../../../redux/features/control/controlPanelSlice';
import {selectLanguages, selectTranslation} from '../../../../../../redux/features/language/languageSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';

import Panorams from '../walk/components/Panorams';

import ColorPicker from '../common/ColorPicker';
import CameraViews from '../common/CameraViews';

import Main from './Main';


const useStyle = createUseStyles({
    '@global .dynamicPanelHideBtn':{
        display: 'none'
    },
    renderMake:{
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
        width: 310,
        overflow: 'hidden',
        zIndex: 1
    },
    plannerRenderViewTypes_types:{
        display: 'flex',
        marginRight: 40
    },
    plannerRenderViewTypes:{
        position: 'fixed',
        left: '50%',
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
    planner_popup_close:{
        width: 20,
        height: 20,
        position: 'fixed',
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
    planner_render_btn_help:{
        position: 'fixed',
        right: 0,
        bottom: 0,
        width: 30,
        height: 30,
        background: '#fff',
        border: '1px solid #fff',
        borderRadius: 3,
        boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        '& svg':{
            height: 'auto',
            width: '64.3%'
        },
        '&:hover':{
            background: '#E9E9E9'
        }
    }
});

const RenderMake = () => {
    const classes = useStyle();
    let dispatch = useDispatch();

    let translation = useSelector(selectTranslation);
    let activeViewMode = useSelector(selectActiveViewMode);
    let renderMakeState = useSelector(selectRenderMakeState);
    let activePano = useSelector(selectActivePano);
    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = activeControlPanelData.history;
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let lastHistoryElemType = lastHistoryElem?.type;
    let keyTimeoutClearActiveComponents;

    let controlPanelData = useSelector(selectControlPanelData);

    let controPanelActiveMode = useSelector(selectActiveControlPanelMode);
    let prevControlPanelMode = useSelector(selectPrevControlPanelMode);
    let renderViewTypes = useRef(null);

    let [activePanelComponents, setActivePanelComponents] = useState([]);

    let onColorSelect = async color => {
        await R2D.scene.setSkyboxMat(color);
        R2D.scene.setSkyboxRotation(0);
        R2D.scene.history.saveState();
        dispatch(changeActivePano({ id: color, previewImgSrc: color, rotation: 0}));
    }

    let onRenderClose = async e => {
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

    useEffect(async () => {
        if(activeViewMode == "view2d" || activeViewMode == "constr") {
            planner["view3d"].activate();
            planner.mih()._currentViewer.setRenderMakeType(renderMakeState.type);
            await R2D.scene.setSavedPanoData('#ffffff', 0);
            dispatch(changeActivePano({id: '#ffffff', previewImgSrc: '#ffffff', rotation: 0}));
        }
        planner.mih()._currentViewer.changeIsRenderStateActive(true);
        planner.scene.hideAllPartialVisibleElementsForRender();
        planner.mih()._currentViewer.hideCursor();
        R2D.Viewers.changeIsRenderActive(true);
        typeof switch_image !== 'undefined' && switch_image && switch_image.length > 0 && !R2D.Storage.load("r2d_rendersExamplePopup") && dispatch(setActivePopup({name: "renderExample_small"}));
        R2D.scene.repositionSkybox();
        R2D.scene.checkSkybox();

        R2D.mouseInteractionHelper.state.setIsSelectingModel && R2D.mouseInteractionHelper.state.setIsSelectingModel(false);
        WC.wallsEditor.state.setIsSelectElementsActive && WC.wallsEditor.state.setIsSelectElementsActive(false);
    }, []);

    let setPreloader = status => {
        if(status) {
            document.querySelector(".renderMake").classList.add('render_proceed');
            if(document.querySelector(".renderMake .viewer-body")) document.querySelector(".renderMake .viewer-body").style.zIndex = 0;
        }
        else {
            document.querySelector(".renderMake")?.classList.remove('render_proceed');
            if(document.querySelector(".renderMake .viewer-body")) document.querySelector(".renderMake .viewer-body").style.zIndex = 1;
        }
    };

    let onRenderMakeStateChange = type => {
        if(renderMakeState.type == 'interior') R2D.viewWalk.saveInteriorData(R2D.viewWalk.getCameraData(), {id: activePano.id, rotation: activePano.rotation, previewImgSrc: activePano.previewImgSrc});
        if(renderMakeState.type == 'exterior' || renderMakeState.type == 'topView') {
            let cameraData = typeof structuredClone !== 'undefined' ? structuredClone(R2D.view3d.getCameraData()) : JSON.parse(JSON.stringify(R2D.view3d.getCameraData()));
            if(renderMakeState.type == 'exterior') R2D.view3d.saveExteriorData(cameraData, {id: activePano.id, rotation: activePano.rotation, previewImgSrc: activePano.previewImgSrc});
            else R2D.view3d.saveTopViewData(cameraData, {id: activePano.id, rotation: activePano.rotation, previewImgSrc: activePano.previewImgSrc});
        } 
        dispatch(updateRenderMakeState({...renderMakeState, type, fromApply: false}));
    };

    let onRenderMakeScreenTypeChange = screen => {
        if(renderMakeState.type == 'interior') R2D.viewWalk.saveInteriorData(R2D.viewWalk.getCameraData(), {id: activePano.id, rotation: activePano.rotation, previewImgSrc: activePano.previewImgSrc});
        if(renderMakeState.type == 'exterior' || renderMakeState.type == 'topView') {
            let cameraData = typeof structuredClone !== 'undefined' ? structuredClone(R2D.view3d.getCameraData()) : JSON.parse(JSON.stringify(R2D.view3d.getCameraData()));
            if(renderMakeState.type == 'exterior') R2D.view3d.saveExteriorData(cameraData, {id: activePano.id, rotation: activePano.rotation, previewImgSrc: activePano.previewImgSrc});
            else R2D.view3d.saveTopViewData(cameraData, {id: activePano.id, rotation: activePano.rotation, previewImgSrc: activePano.previewImgSrc});
        } 
        dispatch(updateRenderMakeState({...renderMakeState, screen, fromApply: false}));
    }

    let languages = useSelector(selectLanguages);
    let currentLanguage = languages?.find(i => i?.current == 1)?.code;

    let youTubeLinks = {
        'en': 'https://www.youtube.com/playlist?list=PLpksFTMOBAbtlpPja4fqttp-Qu2rE8hz9',
        'ru': 'https://www.youtube.com/playlist?list=PLpksFTMOBAbtlpPja4fqttp-Qu2rE8hz9',
        'ua': 'https://www.youtube.com/playlist?list=PLpksFTMOBAbsw6r7Jod8faobeiCj73tF4'
    };
    let onClickVideos = e => {
        window.open(youTubeLinks[currentLanguage] || youTubeLinks['en'], '_blank');
    };

    useEffect(() => {
        if(lastHistoryElemType) {
            setActivePanelComponents(prevState => 
                [
                    ...prevState, 
                    lastHistoryElemType == "main" ? 
                        <Main key={Math.random()}/>
                    : lastHistoryElemType == "changePano" ?
                        <Panorams disableBreadcrumbs={true} key={Math.random()} preloader={setPreloader} renderType={renderMakeState.type} isAddSettingsDisabled={true}/>
                    :lastHistoryElemType == "colorpicker" ? 
                        <ColorPicker key={Math.random()} materialSelect={onColorSelect} matId={R2D.scene.skyboxId} onlyColor={true} isAddSettingsDisabled={true}/>
                    : lastHistoryElemType == "cameraViews" ?
                        <CameraViews key={Math.random()}/>
                    : null
                ]
            );
        }
    }, [controlPanelModeHistory.length]);

    useEffect(() => {
        if(activePanelComponents.length > 2) setActivePanelComponents(prevState => [prevState[prevState.length - 2], prevState[prevState.length - 1]]);
        else {
            if(activePanelComponents.length > 1) keyTimeoutClearActiveComponents = setTimeout(() => setActivePanelComponents(prevState => [prevState[prevState.length - 1]]), 600);
        }
        return () => clearTimeout(keyTimeoutClearActiveComponents);
    }, [activePanelComponents]);

    useEffect(async () => {
        if(renderMakeState.fromApply) return;
        let panoObj, panoData;
        let curViewerType = R2D.Viewers.getCurrentViewerType();
        if(renderMakeState.type == 'topView' || renderMakeState.type == 'exterior') {
            if(planner.mih()._currentViewer != R2D.view3d) planner["view3d"].activate();
            planner.mih()._currentViewer.setRenderMakeType(renderMakeState.type);
            if(renderMakeState.type == 'topView') {
                planner.mih()._currentViewer.setCameraFromTopToBottom();
                panoData = R2D.view3d.getSavedTopViewPanoData() || {...R2D.Viewers.getSavedPanoData().topView};
            }
            else panoData = R2D.view3d.getSavedExteriorPanoData() || {...R2D.Viewers.getSavedPanoData().exterior};
        }
        else if(renderMakeState.type == 'interior') {
            planner["viewWalk"].activate();
            planner.mih()._currentViewer.hideCursor();
            panoData = R2D.viewWalk.getSavedInteriorPanoData() || {...R2D.Viewers.getSavedPanoData()};
        }
        
        panoObj = {id: panoData.id, previewImgSrc: panoData.previewImgSrc, rotation: panoData.rotation};
        await R2D.scene.setSavedPanoData(panoObj.id, panoObj.rotation);
        dispatch(changeActivePano(panoObj));
        planner.mih()._currentViewer.changeIsRenderStateActive && planner.mih()._currentViewer.changeIsRenderStateActive(true);

        let cameraData = renderMakeState.type == 'topView' ? R2D.view3d.getSavedTopViewCameraData() || R2D.view2d.getSavedCameraData() : renderMakeState.type == 'exterior' ? R2D.view3d.getSavedExteriorCameraData() || R2D.view3d.getSavedCameraData() : R2D.viewWalk.getSavedInteriorCameraData() || R2D.viewWalk.getSavedCameraData();

        if(renderMakeState.type == 'topView') {
            cameraData = R2D.view3d.getSavedTopViewCameraData() ? cameraData : { ...cameraData, viewportTop: cameraData.viewportTop * 2 };
            R2D.view3d.updateCameraDistance(R2D.view3d.getSavedTopViewCameraData() ? cameraData.distance : cameraData.viewportTop);
            R2D.view3d.setPosition({x: cameraData.position.x, y: R2D.view3d.getSavedTopViewCameraData() ? cameraData.position.y : cameraData.viewportTop, z: cameraData.position.z});
            R2D.view3d.coversTitleViewer3D.update();
        }
        else R2D.Viewers.setCameraData(cameraData);

        if(renderMakeState.type != 'topView') {
            planner.scene.onClipping();
            planner.scene.setDistFromCameraToPlane(cameraData?.clipping || 0);
        }
        else planner.scene.offClipping();
        
        if (curViewerType == "walk" && renderMakeState.type == "interior") R2D.viewWalk.setCameraFOVDefault();
        else R2D.view3d.setCameraFOVDefault();

        R2D.Viewers.changeRenderScreenType(renderMakeState.screen);

    }, [renderMakeState]);

    useEffect(async () => {
        planner.scene.dispatchEvent(new Event(planner.scene.TIPS_RENDER_MAKE, {}));
    }, []);


    return (
        <div>
            <div className={classes.renderMake}>
                { activePanelComponents }
            </div>
            {
                controPanelActiveMode == 'renderMake' && 
                <div>
                    <div className={classes.planner_popup_close} onClick={onRenderClose}>
                        <svg width="25" height="25" fill="none" viewBox="0 0 25 25" className={classes.planner_popup_close_icon}>
                            <path fill="#fff" fillRule="evenodd" d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z" clipRule="evenodd"></path>
                            <path fill="#fff" fillRule="evenodd" d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z" clipRule="evenodd"></path>
                            <path fill="#fff" fillRule="evenodd" d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z" clipRule="evenodd"></path>
                            <path fill="#fff" fillRule="evenodd" d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z" clipRule="evenodd"></path>
                        </svg>
                    </div>
                    <motion.div
                        initial={{ transform: 'translateY(-102%)' }}
                        animate={{ transform: 'translateY(0%)' }}
                        exit={{ transform: 'translateY(-102%)' }}
                        transition={{
                            duration: 0.9,
                            ease: [0.19, 1, 0.22, 1]
                        }}
                        className={classes.plannerRenderViewTypes} ref={renderViewTypes}>
                        <div className={classes.plannerRenderViewTypes_types}>
                        <div className={classes.plannerRenderViewTypes_type + ' ' + (renderMakeState.type == 'interior' ? classes.plannerRenderViewTypes_type_active : '')} onClick={e => onRenderMakeStateChange('interior')}>{ translation["TEXT_INTERIOR"] }</div>
                            <div className={classes.plannerRenderViewTypes_type + ' ' + (renderMakeState.type == 'exterior' ? classes.plannerRenderViewTypes_type_active : '')} onClick={e => onRenderMakeStateChange('exterior')}>{ translation["TEXT_EXTERIOR"] }</div>
                            <div className={classes.plannerRenderViewTypes_type + ' ' + (renderMakeState.type == 'topView' ? classes.plannerRenderViewTypes_type_active : '')} onClick={e => onRenderMakeStateChange('topView')}>{ translation["TEXT_TOP_VIEW"] }</div>
                        </div>
                        <div className={classes.plannerRenderViewTypes_screens}>
                            <div className={classes.plannerRenderViewTypes_screen + ' ' + classes.plannerRenderViewTypes_screen_land + ' ' + (renderMakeState.screen == 'landscape' ? classes.plannerRenderViewTypes_screen_active : '')} onClick={e => onRenderMakeScreenTypeChange('landscape')}>
                                <span></span>
                            </div>
                            <div className={classes.plannerRenderViewTypes_screen + ' ' + classes.plannerRenderViewTypes_screen_port + ' ' + (renderMakeState.screen == 'portrait' ? classes.plannerRenderViewTypes_screen_active : '')} onClick={e => onRenderMakeScreenTypeChange('portrait')}>
                                <span></span>
                            </div>
                        </div>
                    </motion.div>

                    <div className={classes.planner_render_btn_help} onClick={onClickVideos}>
                        <svg  width="18" height="14" viewBox="0 0 18 14" fill="none">
                            <path fillRule="evenodd" clipRule="evenodd" d="M16.2891 1.93848H1.41406V12.5635H16.2891V1.93848ZM1.41406 0.875977H0.351562V1.93848V12.5635V13.626H1.41406H16.2891H17.3516V12.5635V1.93848V0.875977H16.2891H1.41406Z" fill="#2A3435"/>
                            <path d="M12.0391 7.25098L6.72656 10.4385L6.72656 4.06348L12.0391 7.25098Z" fill="#2A3435"/>
                        </svg>
                    </div>
                </div>
            }
        </div>
    );
};

export default RenderMake;