import React, {useState, useEffect, useMemo} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {createUseStyles} from "react-jss";

import { planner } from '../../../../../../../initR2D';
import { changeUndoRedo } from '../../../../../../../redux/features/topPanel/topPanelSlice';
import {
    selectActiveControlPanelModeData
} from '../../../../../../../redux/features/control/controlPanelSlice';

import Catalog from '../../common/Catalog';
import Materials from '../../common/Materials';
import ColorPicker from '../../common/ColorPicker';
import ChangePlinth from '../../common/ChangePlinth';
import Main from './Main';

const useStyle = createUseStyles({
    selectedPlinth:{
        position: 'absolute',
        left: 0,
        width: 310,
        top: 0,
        height: '100%',
        overflow: 'hidden',
        zIndex: 1,
        '@media screen and (max-width: 950px)':{
            width: 190
        }
    }
});

const SelectedPlinth = () => {
    const classes = useStyle();
    let currObj = planner.mih()._scene.currentView3DObject || planner.mih()._scene.prevSelectedView3DObject;
    let constructionData = currObj && currObj.getConstructorElementData && currObj.getConstructorElementData();

    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = activeControlPanelData.history;
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let lastHistoryElemType = lastHistoryElem?.type;
    let keyTimeoutClearActiveComponents;

    let [activePanelComponents, setActivePanelComponents] = useState([]);
    let [selectedType, setSelectedType] = useState(null);

    let dispatch = useDispatch();

    let onChangeSelectedType = type => setSelectedType(type)

    let onSelectMaterial = (id, addMaterialId = "") => {
        constructionData.setMaterial(id);
        constructionData.setAddMaterial(addMaterialId);
        constructionData.dispatchUpdate();
        R2D.scene.history.saveState();
        dispatch(changeUndoRedo());
        planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
    }

    const panelPreviewIcon = WC.plinthCreator.getImgSrc(
        constructionData?.shapeNum,
        constructionData?.type
    );

    const moldingOrPlinthTitle = {
        'topPlinth' : "TEXT_MOLDING",
        'bottomPlinth' : "TEXT_PLINTH"
    }
    let panelmoldingOrPlinthTitle = moldingOrPlinthTitle[selectedType];

    useEffect(() => {
        if(lastHistoryElemType) {
            setActivePanelComponents(prevState => 
                [
                    ...prevState, 
                    lastHistoryElemType == "main" ? 
                        <Main key={Math.random()} constructionData={constructionData} onChangeSelectedType={onChangeSelectedType}/> :
                    lastHistoryElemType == "changePlinth" ? 
                        <ChangePlinth panelPreviewIcon={panelPreviewIcon} breadcrumsTitle={panelmoldingOrPlinthTitle} hideCategoryTree={true} key={Math.random()}/> :
                    lastHistoryElemType == "catalog" ? 
                        <Catalog breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} panelPreviewIcon={panelPreviewIcon} hideCategoryTree={true} closeButtonStatus={true} isHomeDisabled={true} key={Math.random()} breadCrumbsLongShow={true}/> :
                    lastHistoryElemType == "materials" ? 
                        <Materials breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} panelPreviewIcon={panelPreviewIcon} hideCategoryTree={true} closeButtonStatus={true} isHomeDisabled={true} key={Math.random()} materialSelect={onSelectMaterial} matId={constructionData?.getMaterial()} breadCrumbsLongShow={true}/> :
                    lastHistoryElemType == "colorpicker" ? <ColorPicker panelPreviewIcon={panelPreviewIcon} breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} isAddSettingsDisabled={true} key={Math.random()} closeButtonStatus={true} isHomeDisabled={true} breadCrumbsLongShow={true} addMaterial={constructionData?.getAddMaterial()} matId={constructionData?.getMaterial()} materialSelect={onSelectMaterial} /> :
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
        <div className={ classes.selectedPlinth }>
            { activePanelComponents }
        </div>
    );
};

export default SelectedPlinth;