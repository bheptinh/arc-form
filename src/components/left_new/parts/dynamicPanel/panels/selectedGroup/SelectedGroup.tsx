import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {createUseStyles} from "react-jss";

import { planner } from '../../../../../../initR2D';
import { changeActiveControlPanelMode, selectActiveControlPanelModeData, selectControlPanelData, selectPrevControlPanelMode } from '../../../../../../redux/features/control/controlPanelSlice';
import { removeQuickPanelAll } from '../../../../../../redux/features/quickPanels/quickPanelsSlice';
import { changeUndoRedo } from '../../../../../../redux/features/topPanel/topPanelSlice';

import Catalog from '../common/Catalog';
import Main from './Main';
import Materials from '../common/Materials';
import ColorPicker from '../common/ColorPicker';
import CatalogSet from '../common/CatalogSet';
import CatalogMaterialsSets from '../common/CatalogMaterialsSets';

const useStyle = createUseStyles({
    selectedGroup:{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 311,
        height: '100%',
        overflow: 'hidden',
        zIndex: 1,
        borderLeft:'1px solid #E0E0E0',
        '@media screen and (max-width: 950px)':{
            width: 190
        }
    }
});

const SelectedGroup = () => {
    let dispatch = useDispatch();
    const classes = useStyle();

    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = activeControlPanelData.history;
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let lastHistoryElemType = lastHistoryElem?.type;
    let controlPanelData = useSelector(selectControlPanelData);
    let prevControlPanelMode = useSelector(selectPrevControlPanelMode);

    let [activeMatId, setActiveMatId] = useState(null);
    let [activeAddMatId, setActiveAddMatId] = useState(null);
    let [activePanelComponents, setActivePanelComponents] = useState([]);
    let keyTimeoutClearActiveComponents;

    let onClickPreview = (matId, addMatId) => {
        setActiveMatId(matId);
        setActiveAddMatId(addMatId);
    }

    let onDelClick = e => {
        if(e.code == "Delete") {
            let furnitureData = planner.getCatalogProducts();
            prevControlPanelMode ?
            dispatch(changeActiveControlPanelMode({mode: prevControlPanelMode})) : 
            dispatch(changeActiveControlPanelMode({
                mode: 'furniture', 
                data: controlPanelData['furniture'].history.length < 1 ? {type: "catalog", addType: "main", id: null, lastSavedScroll: 0, data: furnitureData} : null
            }));
            dispatch(removeQuickPanelAll());
            document.removeEventListener("keydown", onDelClick);
        }
    }

    let onMaterialSelect = (id, addMaterial = "", activeMat, activeAddMat) => {
        let currentGroup = planner.mih()._scene.currentGroup || planner.mih()._scene.prevSelectedView3DObject;
        let currentObjects = currentGroup.getObjViews().map(i => i && typeof i.getSceneObject === "function" ? i.getSceneObject() : null);
        let newCurrentObjectsMaterialsIds = currentObjects.map(i => i?.getMaterials && i.getMaterials()).filter(i => i).map(i => i.filter(z => z.source == "bank" || z.source == "set" ).map(y => { return { id: y.current, addMaterial: y.addMaterial, hash: y.hash, source: y.source, setId: y.setId } }));
        let currentObjectsMaterialsIds = newCurrentObjectsMaterialsIds.filter(i => i.length > 0)
        currentObjects.forEach((i, index) => {
            currentObjectsMaterialsIds[index]?.forEach(y => {
                if(activeMat == y.id && (activeAddMat == y.addMaterial || (!activeAddMat && !y.addMaterial))) {
                    const materialIndex = i.getMaterialsObjects().findIndex(m => m.hash == y.hash)
                    i.setAddMaterialAt && i.setAddMaterialAt(materialIndex, addMaterial);
                    i.setMaterialAt(materialIndex, id);
                    i.dispatchUpdate();
                }
            })
        })
        planner.mih()._scene.history.saveState();
        planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
        dispatch(changeUndoRedo());
    }

    useEffect(() => {
        document.addEventListener("keydown", onDelClick);
        return () => document.removeEventListener("keydown", onDelClick);
    }, []);

    useEffect(() => {
        if(lastHistoryElemType) {
            let currentGroup = planner.mih()._scene.currentGroup || planner.mih()._scene.prevSelectedView3DObject;
            let currObjs = currentGroup?.getObjViews().map(i => i && typeof i.getSceneObject === "function" ? i.getSceneObject() : null);
            let newCurrentObjectsMaterialsIds, currObjectsMaterialsIds;
            if(currObjs) {
                newCurrentObjectsMaterialsIds = currObjs.map(i => i?.getMaterials && i.getMaterials()).filter(i => i).map(i => i.filter(z => z.source == "bank" || z.source == "set" ).map(y => { return { id: y.current, addMaterial: y.addMaterial, hash: y.hash, source: y.source, setId: y.setId } }));
                currObjectsMaterialsIds = newCurrentObjectsMaterialsIds.filter(i => i.length > 0);
            }
            setActivePanelComponents(prevState => 
                [
                    ...prevState, 
                    lastHistoryElemType == "main" ? 
                        <Main key={Math.random()} onClickPreview={onClickPreview} currentObjectsMaterialsIds={currObjectsMaterialsIds} /> :
                    lastHistoryElemType == "catalog" ? 
                        <Catalog breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} hideCategoryTree={true} closeButtonStatus={true} isHomeDisabled={true} key={Math.random()} breadCrumbsLongShow={true}/> :
                    lastHistoryElemType == "materials" ? 
                        <Materials breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} hideCategoryTree={true} closeButtonStatus={true} isHomeDisabled={true} key={Math.random()} materialSelect={onMaterialSelect} matId={activeMatId} breadCrumbsLongShow={true}/> :
                    lastHistoryElemType == "colorpicker" ? <ColorPicker breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} isAddSettingsDisabled={true} key={Math.random()} closeButtonStatus={true} isHomeDisabled={true} breadCrumbsLongShow={true} addMaterial={activeAddMatId} matId={activeMatId} materialSelect={onMaterialSelect} /> : 
                    lastHistoryElemType == "catalogSets" ? <CatalogSet breadCrumbsLongShow={true} hideBreadCrumbsHomePanel={true} closeButtonStatus={true} isHomeDisabled={true} hideCategoryTree={true} breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} key={Math.random()}/> :  
                    lastHistoryElemType == "catalogMaterialsSets" ? <CatalogMaterialsSets disableBreadcrumbs={!controlPanelModeHistory.find(i => i.type == 'catalogSets')} hideBreadCrumbsHomePanel={true} breadCrumbsLongShow={true} closeButtonStatus={true} isHomeDisabled={true} hideCategoryTree={true} breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} materialSelect={onMaterialSelect} matId={activeMatId} key={Math.random()}/> : 
                    null
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

    return (
        <div className={ classes.selectedGroup }>
            { activePanelComponents }
        </div>
    );
};

export default SelectedGroup;