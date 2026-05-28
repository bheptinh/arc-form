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
    selectedOtherConstrParts:{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 310,
        height: '100%',
        overflow: 'hidden',
        zIndex: 1,
        '@media screen and (max-width: 950px)':{
            width: 190,
        }
    }
});

const SelectedOtherConstrParts = () => {
    const classes = useStyle();
    let dispatch = useDispatch();
    let currObj = useMemo(() => planner.mih()._scene.currentView3DObject?.constructorElementData || planner.mih()._scene.prevSelectedView3DObject?.constructorElementData, []);

    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = activeControlPanelData.history;
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let lastHistoryElemType = lastHistoryElem?.type;
    let keyTimeoutClearActiveComponents;

    let [activePanelComponents, setActivePanelComponents] = useState([]);

    let onMaterialSelect = (id, addMatId = "") => {
        if(!currObj) return;
        currObj.setAddMaterial(addMatId);
        currObj.setMaterial(id);
        currObj.dispatchUpdate();
        R2D.scene.history.saveState();
        dispatch(changeUndoRedo());
        planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
    };

    const constrPartPreviw = {
        'ceiling' : '/src_designer/images/panelicons/icon_ceiling.svg',
        'bottomFrame' : '/src_designer/images/panelicons/icon_floor.svg',
        'topFrame' : '/src_designer/images/panelicons/icon_rama.svg',
        'cap' : '/src_designer/images/panelicons/icon_cap.svg',
    }
    let panelPreviewIcon = constrPartPreviw[currObj.type];

    const constrPartTitle = {
        'ceiling' : "PANEL_TITLE_CEILING",
        'bottomFrame' : "PPANEL_TITLE_THRESHOLD",
        'topFrame' : "PPANEL_TITLE_HELLINGEN",
        'cap' : "PANEL_TITLE_CAP",
    }
    let panelTitle = constrPartTitle[currObj.type];

    useEffect(() => {
        if(lastHistoryElemType) {
            setActivePanelComponents(prevState => 
                [
                    ...prevState, 
                    lastHistoryElemType == "main" ? 
                        <Main panelTitle={panelTitle} key={Math.random()} panelPreviewIcon={panelPreviewIcon} /> :
                    lastHistoryElemType == "catalog" ? 
                        <Catalog breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} panelPreviewIcon={panelPreviewIcon} isAddSettingsDisabled={true} closeButtonStatus={true} isHomeDisabled={true} key={Math.random()} breadCrumbsLongShow={true}/> :
                    lastHistoryElemType == "materials" ? 
                        <Materials breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} panelPreviewIcon={panelPreviewIcon} isAddSettingsDisabled={true} closeButtonStatus={true} isHomeDisabled={true} key={Math.random()} matId={currObj?.getMaterial()} materialSelect={onMaterialSelect} breadCrumbsLongShow={true}/> :
                    lastHistoryElemType == "colorpicker" ? <ColorPicker breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} panelPreviewIcon={panelPreviewIcon} key={Math.random()} isAddSettingsDisabled={true} closeButtonStatus={true} isHomeDisabled={true} breadCrumbsLongShow={true} addMaterial={currObj?.getAddMaterial()} matId={currObj?.getMaterial()} materialSelect={onMaterialSelect} /> :
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
        <div className={ classes.selectedOtherConstrParts }>
            { activePanelComponents }
        </div>
    );
};

export default SelectedOtherConstrParts;