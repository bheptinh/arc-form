import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {createUseStyles} from "react-jss";

import { planner } from '../../../../../../../initR2D';
import { changeUndoRedo } from '../../../../../../../redux/features/topPanel/topPanelSlice';
import { selectActiveControlPanelModeData } from '../../../../../../../redux/features/control/controlPanelSlice';

import Catalog from '../../common/Catalog';
import Materials from '../../common/Materials';
import ColorPicker from '../../common/ColorPicker';

import Main from './Main';

const useStyle = createUseStyles({
    selectedCover:{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 310,
        height: '100%',
        borderLeft: '1px solid #E0E0E0',
        zIndex: 1,
        overflow: 'hidden',
        '@media screen and (max-width: 950px)':{
            width: 190
        }
    }
});

const SelectedCover = () => {
    const classes = useStyle();
    let dispatch = useDispatch();
    let currObj = useMemo(() => planner.mih()._scene.currentView3DObject?.constructorElementData || planner.mih()._scene.prevSelectedView3DObject?.constructorElementData, []);

    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = activeControlPanelData.history;
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let lastHistoryElemType = lastHistoryElem?.type;
    let keyTimeoutClearActiveComponents, keyTimeoutOverflow;

    let [activePanelComponents, setActivePanelComponents] = useState([]);
    let [needToOverflowHidden, setNeedToOverflowHidden] = useState(true);

    let onMaterialSelect = (id, addMatId = "") => {
        if(!currObj) return;
        currObj.setAddMaterial(addMatId);
        currObj.setMaterial(id);
        currObj.dispatchUpdate();
        R2D.scene.history.saveState();
        dispatch(changeUndoRedo());
        planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
    };

    let panelPreviewIcon = '/src_designer/images/panelicons/icon_floor.svg';

    useEffect(() => {
        if(lastHistoryElemType) {
            setActivePanelComponents(prevState => 
                [
                    ...prevState, 
                    lastHistoryElemType == "main" ? 
                        <Main panelPreviewIcon={panelPreviewIcon} key={Math.random()} /> :
                    lastHistoryElemType == "catalog" ? 
                        <Catalog breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} panelPreviewIcon={panelPreviewIcon} hideCategoryTree={true} closeButtonStatus={true} isHomeDisabled={true} breadCrumbsLongShow={true} key={Math.random()} /> :
                    lastHistoryElemType == "materials" ? 
                        <Materials breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} panelPreviewIcon={panelPreviewIcon} hideCategoryTree={true} closeButtonStatus={true} isHomeDisabled={true} key={Math.random()} matId={currObj?.getMaterial()} materialSelect={onMaterialSelect} breadCrumbsLongShow={true}/> :
                    lastHistoryElemType == "colorpicker" ? <ColorPicker breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} panelPreviewIcon={panelPreviewIcon} isAddSettingsDisabled={true} key={Math.random()} closeButtonStatus={true} isHomeDisabled={true} breadCrumbsLongShow={true} addMaterial={currObj?.getAddMaterial()} matId={currObj?.getMaterial()} materialSelect={onMaterialSelect} /> :
                    null
                ]
            );
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
        <div className={ classes.selectedCover } style={ needToOverflowHidden ? {overflow: 'hidden'} : null }>
            { activePanelComponents }
        </div>
    );
};

export default SelectedCover;