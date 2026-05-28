import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../initR2D';
import { selectActiveViewMode } from '../../redux/features/viewMode/viewModeSlice';
import { changeUndoRedoConstr, changeUndoRedoScene } from '../../redux/features/topPanel/topPanelSlice';
import { setActivePopup } from '../../redux/features/popups/popupsSlice';
import { hideQuickPanelVisible, removeQuickPanelAll, selectQuickPanels, showQuickPanel, toggleQuickPanelVisible } from '../../redux/features/quickPanels/quickPanelsSlice';
import { changeActiveControlPanelMode, selectActiveControlPanelMode, selectActiveControlPanelModeData, selectControlPanelData, selectPrevControlPanelMode } from '../../redux/features/control/controlPanelSlice';

const CenterPanel = props => {
    let activeViewMode = useSelector(selectActiveViewMode);
    let dispatch = useDispatch();
    let prevControlPanelMode = useSelector(selectPrevControlPanelMode);
    let controlPanelData = useSelector(selectControlPanelData);
    let activeControlPanelMode = useSelector(selectActiveControlPanelMode);
    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);

    let quickPanels = useSelector(selectQuickPanels);

    const onEvent = e => {
        if(e.target.tagName != "CANVAS") return;
        
        if(activeViewMode == "constr" && activeControlPanelMode != 'renderMake') {
            
            let result = planner.constr[e.type](e.nativeEvent);
            
            if(result) {
                if(result.state == "stateSelectedCover") {
                    dispatch(changeActiveControlPanelMode({ mode: 'selectedCover_constr', data: {type: "main"}}));
                    dispatch(showQuickPanel({name: "delete", position: result.quickPanel, type: 'deleteCover'}));
                }
                else if(result.state == "stateSetWallHeight") {
                    dispatch(setActivePopup({name: "setValueInput", type: "changeWallHeight"}));
                }
                else if(result.state == "stateSelectedRoom") {
                    dispatch(showQuickPanel({name: "delete", position: result.quickPanel, type: 'deleteWall'}));
                }
                else if(result.state == "stateSelectedArea") {
                    dispatch(changeActiveControlPanelMode({mode: 'selectedArea', data: {type: "main"}}));
                }
                else if(result.state == "stateSelectedRuler") {
                    dispatch(showQuickPanel({name: "delete", position: result.quickPanel, type: 'deleteRuller'}));
                }
                else if(result.state == "stateAlignDrawing") {
                    if(result.action == "alignerWidthSet") dispatch(setActivePopup({name: "alignerWidthSetMetrics"}));
                }
                else if(result.state == "stateSelectedPoint") {
                    dispatch(showQuickPanel({name: "delete", position: result.quickPanel, type: 'deletePoint'}));
                }
                else if(result.state == "stateEditing" || result.state == "stateMergeCovers" || result.state == "stateSelectedPoint") {
                    if(result.state == "stateMergeCovers") dispatch(setActivePopup({name: "confirm", type: "merge_covers"}));
                    dispatch(removeQuickPanelAll());
                    dispatch(changeActiveControlPanelMode({mode: 'constructor'}));
                }

                if(e.type != "mousemove" && e.type != 'touchmove') dispatch(changeUndoRedoConstr({canUndo: planner.constr.canUndo(), canRedo: planner.constr.canRedo()}));
            }
        }
        else {
            
            let result = planner.scene[e.type](e.nativeEvent);

            if(result) {
                if(result.state == "stateSelectedConstr") {
                    let currConstrElem = planner.mih()._scene.currentConstructorElementData;
                    if(result.type == 'cover') {
                        if (currConstrElem?.visible && !currConstrElem?.partialVisible) dispatch(changeActiveControlPanelMode({ mode:  'selectedCover', data: {type: "main", lastSavedScroll: 0}}));
                        result.quickPanel.y -= 20;
                        dispatch(
                            showQuickPanel({
                                name: "helper",
                                position: result.quickPanel,
                            })
                        );
                    } else if(result.type == 'wall') {
                        currConstrElem?.visible && !currConstrElem?.partialVisible && dispatch(changeActiveControlPanelMode({ mode: 'selectedWall', data: {type: "main", lastSavedScroll: 0}}));
                        result.quickPanel.y -= 20;
                        dispatch(showQuickPanel({ name: "helper", position: result.quickPanel }));
                    } else if(result.type == 'bottomPlinth' || result.type == 'topPlinth') {
                        result.quickPanel.y -= 20;
                        if(R2D.scene.currentConstructorElementData?.visible && !R2D.scene.currentConstructorElementData?.partialVisible) dispatch(changeActiveControlPanelMode({ mode:  'selectedPlinth', data: {type: "main", lastSavedScroll: 0}}));
                        dispatch(showQuickPanel({name: "helper_plinth", position: result.quickPanel}));
                    } 
                    else {
                        if (currConstrElem?.visible && !currConstrElem?.partialVisible) dispatch(changeActiveControlPanelMode({ mode: 'selectedOtherConstrParts', data: {type: "main", lastSavedScroll: 0}}));
                        result.quickPanel.y -= 20;
                        dispatch(
                            showQuickPanel({
                                name: "helper",
                                position: result.quickPanel,
                            })
                        );
                    }
                }

                if(result.state == "stateDraggingProduct") {
                    if(quickPanels.helper_model.status) dispatch(hideQuickPanelVisible({name: "helper_model"}));
                    else if(quickPanels.helper_carpet.status) dispatch(hideQuickPanelVisible({name: "helper_carpet"}));
                    else if(quickPanels.helper_portrets.status) dispatch(hideQuickPanelVisible({name: "helper_portrets"}));
                }

                if(result.state == "stateSelectedProduct") {

                    if(!R2D.scene.currentSceneObject?.isLockedOnScene && R2D.scene.currentSceneObject?.visible && !R2D.scene.currentSceneObject?.partialVisible && activeControlPanelMode != 'selectedModel') dispatch(changeActiveControlPanelMode({ mode: 'selectedModel', data: {type: "main", lastSavedScroll: 0}}));

                    if(quickPanels.helper_logo_mesh.status) return;

                    if(quickPanels.helper_model.status || quickPanels.helper_carpet.status || quickPanels.helper_portrets.status) {
                        result.quickPanel.y -= 60;
                        if(quickPanels.helper_model.status) dispatch(toggleQuickPanelVisible({name: "helper_model", position: result.quickPanel}));
                        else if(quickPanels.helper_carpet.status) dispatch(toggleQuickPanelVisible({name: "helper_carpet", position: result.quickPanel}));
                        else if(quickPanels.helper_portrets.status) dispatch(toggleQuickPanelVisible({name: "helper_portrets", position: result.quickPanel}));
                    }
                    
                    else {
                        if(!result || !result.quickPanel) return;
                        result.quickPanel.y -= 60;
                        if(R2D.scene.currentView3DObject) {
                            if(R2D.scene.currentSceneObject?.getType && R2D.scene.currentSceneObject.getType() == 4) dispatch(showQuickPanel({name: "helper_carpet", position: result.quickPanel}));
                            else if(R2D.scene.currentSceneObject?.getType && R2D.scene.currentSceneObject.getType() == 3) dispatch(showQuickPanel({name: "helper_portrets", position: result.quickPanel}));
                            else dispatch(showQuickPanel({name: "helper_model", position: result.quickPanel}));
                        }
                    }
                }

                if(result.state == "stateSelectedGroup") {

                    if(activeControlPanelMode == "selectedGroup") dispatch(removeQuickPanelAll());

                    let currGroup = planner.mih()._scene.currentGroup;

                    if(currGroup) {
                        !currGroup.isLockedOnScene && currGroup.visible && !currGroup?.partialVisible && activeControlPanelMode != "selectedGroup" && dispatch(changeActiveControlPanelMode({mode: 'selectedGroup', data: {type: "main", lastSavedScroll: 0}}));
                        
                        if(quickPanels.helper_group.status) {
                            if(R2D.controller.getCurrentOS() == "Mac OS" ? !e.metaKey : !e.ctrlKey) dispatch(toggleQuickPanelVisible({name: "helper_group", position: result.quickPanel}));
                        }
                        else {
                            if(!result || !result.quickPanel) return;
                            result.quickPanel.y -= 60;
                            dispatch(showQuickPanel({name: "helper_group", visible: currGroup.merged ? true : false, position: result.quickPanel})); 
                        }
                    }
                }
                
                if(result.state == "stateSelectedPlinth") {
                    if(R2D.scene.currentConstructorElementData?.visible && !R2D.scene.currentConstructorElementData?.partialVisible) dispatch(changeActiveControlPanelMode({mode: 'selectedPlinth', data: {type: "main", lastSavedScroll: 0}}));
                    dispatch(showQuickPanel({name: "helper_plinth", position: result.quickPanel}));
                }

                if(result.state == "stateEditing") {
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
                    
                    dispatch(removeQuickPanelAll());
                }
                
                if(e.type != "mousemove" && e.type != "touchmove") dispatch(changeUndoRedoScene({canUndo: planner.scene.canUndo(), canRedo: planner.scene.canRedo()}));
            }
        }
    }

    let plannerDiv = useRef(null);

    return (
        <div id="planner" onMouseUp={onEvent} onMouseMove={onEvent} onMouseDown={onEvent} ref={plannerDiv} onTouchStart={onEvent} onTouchEnd={onEvent} onTouchMove={onEvent}></div>
    )
}

export default CenterPanel;