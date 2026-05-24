import React, {useState, useEffect, useMemo} from 'react';
import {createUseStyles} from "react-jss";
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../../../../../initR2D';
import { changeUndoRedo } from '../../../../../../redux/features/topPanel/topPanelSlice';
import { selectActiveControlPanelModeData } from '../../../../../../redux/features/control/controlPanelSlice';
import { removeQuickPanel, selectQuickPanels, showQuickPanel } from '../../../../../../redux/features/quickPanels/quickPanelsSlice';

import Catalog from '../common/Catalog';
import Materials from '../common/Materials';
import ColorPicker from '../common/ColorPicker';
import CatalogSet from '../common/CatalogSet';
import CatalogMaterialsSets from '../common/CatalogMaterialsSets';
import LogoEditor from '../common/LogoEditor';
import Main from './Main';

const useStyle = createUseStyles({
    selectedModel:{
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: 310,
        zIndex: 1,
        borderLeft:'1px solid #E0E0E0',
        overflow: 'hidden',
        '@media screen and (max-width: 950px)':{
            width: 190
        }
    }
});

const SelectedModel = () => {
    let dispatch = useDispatch();

    const classes = useStyle();

    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = activeControlPanelData.history;
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let lastHistoryElemType = lastHistoryElem?.type;
    let keyTimeoutClearActiveComponents, keyTimeoutOverflow;

    let quickPanels = useSelector(selectQuickPanels);

    let [activePanelComponents, setActivePanelComponents] = useState([]);
    let [activeIndex, setActiveIndex] = useState(null);

    let [needToOverflowHidden, setNeedToOverflowHidden] = useState(true);

    let view3dObject = R2D.scene.currentView3DObject;
    let sceneObject = view3dObject?.sceneObject;

    let onLightColorSelect = color => view3dObject.lightViewer.setLightColor(color);

    let onMaterialSelect = (id, addMaterial = "") => {
        if(!view3dObject || !sceneObject) return;
        sceneObject.setMaterialAt && sceneObject.setMaterialAt(activeIndex, id);
        sceneObject.setAddMaterialAt && sceneObject.setAddMaterialAt(activeIndex, addMaterial);
        sceneObject.update && sceneObject.update();
        R2D.scene.history.saveState();
        dispatch(changeUndoRedo());
        planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
    };

    let onClickPreview = index => setActiveIndex(index);

    let currObj = view3dObject || R2D.scene.prevSelectedView3DObject;
    let currSceneObj = useMemo(() => currObj?.sceneObject, []);
    let panelPreviewIcon = currSceneObj ? R2D.URL.DOMAIN + currSceneObj.getObjectData().source.images.preview : '';

    useEffect(() => {
        if(lastHistoryElemType) {
            let previewMaterialsId = planner.scene.getCurrentModelMaterials(); 
            setActivePanelComponents(prevState => 
                [
                    ...prevState, 
                    lastHistoryElemType == "main" ? 
                        <Main key={Math.random()} isLightOn={view3dObject?.lightViewer?.getIsEnabled()} previewMaterialsId={previewMaterialsId} onClickPreview={onClickPreview}/> :
                    lastHistoryElemType == "catalog" ? 
                        <Catalog breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} panelPreviewIcon={panelPreviewIcon} hideCategoryTree={true} closeButtonStatus={true} isHomeDisabled={true} key={Math.random()} breadCrumbsLongShow={true}/> :
                    previewMaterialsId && previewMaterialsId[activeIndex] && lastHistoryElemType == "materials" ? 
                        <Materials breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} panelPreviewIcon={panelPreviewIcon} hideCategoryTree={true} closeButtonStatus={true} isHomeDisabled={true} key={Math.random()} materialSelect={onMaterialSelect} matId={previewMaterialsId[activeIndex].matId} breadCrumbsLongShow={true}/> :
                    lastHistoryElemType == "colorpickerLight" ? 
                        <ColorPicker panelPreviewIcon={panelPreviewIcon} breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} isAddSettingsDisabled={true} isForLightObjects={true} key={Math.random()} onlyColor={true} matId={view3dObject.lightViewer?.getLightColorHEX()} materialSelect={onLightColorSelect} lightPowerValue={ (view3dObject.lightViewer?.getLightPower() ?? 0) > 100 ? 100 : view3dObject.lightViewer?.getLightPower() ?? 0} /> :
                    previewMaterialsId && previewMaterialsId[activeIndex] && lastHistoryElemType == "colorpicker" ? 
                        <ColorPicker panelPreviewIcon={panelPreviewIcon} breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} key={Math.random()} isAddSettingsDisabled={true} closeButtonStatus={true} isHomeDisabled={true} breadCrumbsLongShow={true} addMaterial={previewMaterialsId[activeIndex].addMaterial} matId={previewMaterialsId[activeIndex].matId} materialSelect={onMaterialSelect}/> : 
                    lastHistoryElemType == "catalogSets" ? 
                        <CatalogSet breadCrumbsLongShow={true} hideBreadCrumbsHomePanel={true} closeButtonStatus={true} isHomeDisabled={true} hideCategoryTree={true} breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} panelPreviewIcon={panelPreviewIcon} key={Math.random()}/> :
                    lastHistoryElemType == "catalogMaterialsSets" ? 
                        <CatalogMaterialsSets panelPreviewIcon={panelPreviewIcon} hideCategoryTree={true} closeButtonStatus={true} isHomeDisabled={true} hideBreadCrumbsHomePanel={true} breadCrumbsLongShow={true} materialSelect={onMaterialSelect} matId={previewMaterialsId[activeIndex].matId} key={Math.random()}/> : 
                    lastHistoryElemType == "logoEditor" ? 
                        <LogoEditor key={Math.random()} closeButtonStatus={true}/> :
                    null
                ]
            );

            if(lastHistoryElemType != "logoEditor" && quickPanels.helper_logo_mesh?.status) {
                dispatch(showQuickPanel({name: 'helper_model', position: {x: quickPanels.helper_logo_mesh.position.x, y: quickPanels.helper_logo_mesh.position.y}}));
                dispatch(removeQuickPanel({name: 'helper_logo_mesh'}));
            }
        }
    }, [controlPanelModeHistory.length]);

    useEffect(() => {
        setNeedToOverflowHidden(true);
        if(activePanelComponents.length > 2) setActivePanelComponents(prevState => [prevState[prevState.length - 2], prevState[prevState.length - 1]]);
        else {
            if(activePanelComponents.length > 1) keyTimeoutClearActiveComponents = setTimeout(() => setActivePanelComponents(prevState => [prevState[prevState.length - 1]]), 600);
            else keyTimeoutOverflow = setTimeout(() => setNeedToOverflowHidden(false), 600);
        }
        return () => {
            clearTimeout(keyTimeoutClearActiveComponents);
            clearTimeout(keyTimeoutOverflow);
        };
    }, [activePanelComponents]);

    return (
        <div className={classes.selectedModel} style={ needToOverflowHidden ? {overflow: 'hidden'} : null }>
            { activePanelComponents }
        </div>
    );
};

export default SelectedModel;