import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {createUseStyles} from "react-jss";

import { planner } from '../../../../../../../initR2D';
import { changeUndoRedo } from '../../../../../../../redux/features/topPanel/topPanelSlice';
import { selectActiveControlPanelModeData } from '../../../../../../../redux/features/control/controlPanelSlice';

import Catalog from '../../common/Catalog';
import Materials from '../../common/Materials';
import ColorPicker from '../../common/ColorPicker';
import ChangePlinth from '../../common/ChangePlinth';

import Main from './Main';

const useStyle = createUseStyles({
    selectedWall:{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 310,
        height: '100%',
        zIndex: 1,
        overflow: 'hidden',
        '@media screen and (max-width: 950px)':{
            width: 190,
        }
    }
});

const SelectedWall = () => {
    let dispatch = useDispatch();
    const classes = useStyle();
    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = activeControlPanelData.history;
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let lastHistoryElemType = lastHistoryElem?.type;
    let keyTimeoutClearActiveComponents, keyTimeoutOverflow;
    let currObj = planner.mih()._scene.currentView3DObject || planner.mih()._scene.prevSelectedView3DObject;
    let constructionData = currObj && currObj.getConstructorElementData ? currObj.getConstructorElementData() : null;

    let topPlinth = constructionData ? constructionData.topPlinth : null;
    let bottomPlinth = constructionData ? constructionData.bottomPlinth : null;

    let [activePanelComponents, setActivePanelComponents] = useState([]);
    let [needToOverflowHidden, setNeedToOverflowHidden] = useState(true);

    let [selectedType, setSelectedType] = useState(null);

    let onChangeSelectedType = type => setSelectedType(type)

    let onSelectMaterial = (id, addMatId = "") => {
        if(!currObj) return;
        
        switch(selectedType) {
            case "wall":
                constructionData.setAddMaterial(addMatId, planner.mih()._scene.currentPartNum);
                constructionData.setMaterial(id, planner.mih()._scene.currentPartNum);
                constructionData.dispatchUpdate();
                break;
            case "top":
                topPlinth.setAddMaterial(addMatId);
                topPlinth.setMaterial(id);
                topPlinth.dispatchUpdate();
                break;
            case "bottom":
                bottomPlinth.setAddMaterial(addMatId);
                bottomPlinth.setMaterial(id);
                bottomPlinth.dispatchUpdate();
                break;
        }
        R2D.scene.history.saveState();
        dispatch(changeUndoRedo());
        planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
    }

    let getSelectedId = () => selectedType == "wall" ? constructionData?.getMaterial() : selectedType == "top" ? topPlinth.materialID : selectedType == "bottom" ? bottomPlinth.materialID : null;

    let getSelectedAddMatId = () => selectedType == "wall" ? constructionData?.getAddMaterial() : selectedType == "top" ? topPlinth?.addMaterialID : selectedType == "bottom" ? bottomPlinth?.addMaterialID : null;

    let panelPreviewIcon = '/src_designer/images/panelicons/icon_wall.svg';

    const imgSrcTopPlinth = WC.plinthCreator?.getImgSrc(
        topPlinth?.shapeNum,
        topPlinth?.type
    );
    const imgSrcBottomPlinth = WC.plinthCreator?.getImgSrc(
        bottomPlinth?.shapeNum,
        bottomPlinth?.type
    );


    const moldingOrPlinthIcon = {
        'molding' : imgSrcTopPlinth,
        'plinth' : imgSrcBottomPlinth
    }
    let panelMoldingOrPlinthPreviewIcon = moldingOrPlinthIcon[lastHistoryElem?.data];

    const moldingOrPlinthTitle = {
        'molding' : "TEXT_MOLDING",
        'plinth' : "TEXT_PLINTH"
    }
    let panelmoldingOrPlinthTitle = moldingOrPlinthTitle[lastHistoryElem?.data];

    const dynamicPanelPreviewIcon =
            selectedType === "top" ? imgSrcTopPlinth :
            selectedType === "bottom" ? imgSrcBottomPlinth :
                panelPreviewIcon


    useEffect(() => {
        if(lastHistoryElemType) {
            setActivePanelComponents(prevState => 
                [
                    ...prevState, 
                    lastHistoryElemType == "main" ? 
                        <Main panelPreviewIcon={panelPreviewIcon} key={Math.random()} onChangeSelectedType={onChangeSelectedType}/> :
                    lastHistoryElemType == "changePlinth" ? 
                        <ChangePlinth breadcrumsTitle={panelmoldingOrPlinthTitle} panelPreviewIcon={panelMoldingOrPlinthPreviewIcon} closeButtonStatus={true} key={Math.random()}/> :
                    lastHistoryElemType == "catalog" ? 
                        <Catalog breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} panelPreviewIcon={dynamicPanelPreviewIcon}  hideCategoryTree={true} closeButtonStatus={true} isHomeDisabled={true} key={Math.random()} breadCrumbsLongShow={true}/> :
                    lastHistoryElemType == "materials" ? 
                        <Materials breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} panelPreviewIcon={dynamicPanelPreviewIcon} hideCategoryTree={true} closeButtonStatus={true} isHomeDisabled={true} key={Math.random()} materialSelect={onSelectMaterial} matId={getSelectedId()} breadCrumbsLongShow={true}/> :
                    lastHistoryElemType == "colorpicker" ? <ColorPicker breadcrumsTitle={"MENU_BTN_TEXT_DECOR"} panelPreviewIcon={dynamicPanelPreviewIcon} key={Math.random()} isAddSettingsDisabled={true} closeButtonStatus={true} isHomeDisabled={true} breadCrumbsLongShow={true} addMaterial={getSelectedAddMatId()} matId={getSelectedId()} materialSelect={onSelectMaterial} /> :
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
        <div className={ classes.selectedWall } style={ needToOverflowHidden ? {overflow: 'hidden'} : null }>
            { activePanelComponents }
        </div>
    );
};

export default SelectedWall;