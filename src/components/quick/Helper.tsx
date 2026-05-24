import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeQuickPanelAll, selectQuickPanels } from '../../redux/features/quickPanels/quickPanelsSlice';
import {createUseStyles} from "react-jss";
import { RotateRef } from './components/Rotate';
import { MoveRef } from './components/Move';
import { useState } from 'react';
import { ClearRef } from './components/Clear';
import { HideRef } from './components/Hide';
import { HiddenRef } from './components/Hidden';
import { planner } from '../../initR2D';
import { changeActiveControlPanelMode, selectActiveControlPanelModeData, selectControlPanelData, selectPrevControlPanelMode } from '../../redux/features/control/controlPanelSlice';
import { DragPanelButtonRef } from './components/DragPanelButton';
import {AnimatePresence,motion} from "framer-motion";

const useStyle = createUseStyles({
    info_model_pop_wrap:{
        position: 'absolute',
        zIndex: 1,
        display: 'flex',
        '& img':{
            userSelect: "none",
            pointerEvents: "none"
        }
    },
    info_model_pop_wr:{
        position: 'absolute',
        transform: 'translateX(-50%)',
    },
    info_model_bottom:{
        background: '#fff',
        borderRadius: 3,
        boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
        display: 'flex',
        overflow: 'hidden'
    },
    info_model_height:{
        display: 'none',
        position: 'absolute',
        top: 0,
        background: '#ffffff',
        fontSize: 17,
        border: '1px solid #000',
        padding: 5,
        width: "max-content",
        borderRadius: 6,
        overflow: 'hidden',
        zIndex: 9,
        left: '50%',
        transform: 'translateX(-50%)'
    },
    info_model_pop_item_cont:{
        display: 'flex',
        background: '#fff',
        borderRadius: 3,
        boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)'
    }
});

const Helper = props => {
    let dispatch = useDispatch();
    let quickPanels = useSelector(selectQuickPanels);
    let position = quickPanels.helper.position;

    let controlPanelData = useSelector(selectControlPanelData);
    let prevControlPanelMode = useSelector(selectPrevControlPanelMode);
    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);

    let btnMove = useRef(null);
    let textFieldInfo = useRef(null);
    let mainDiv = useRef(null);
    let btnClear = useRef(null);
    let btnRotate = useRef(null);
    let btnDragPanel = useRef(null);
    let btnHide = useRef(null);
    let info_bottom = useRef(null);

    let refs = useRef({btnMove, textFieldInfo, btnRotate, mainDiv, btnDragPanel});
    const classes = useStyle();

    let [panelPosition, setPanelPosition] = useState(position);
    let [typeToHide, setTypeToHide] = useState(R2D.scene.currentConstructorElementData ? R2D.scene.currentConstructorElementData.type == 'topFrame' || R2D.scene.currentConstructorElementData.type == 'bottomFrame' ? 'frames' : R2D.scene.currentConstructorElementData.type == 'cap' ? 'cap' : R2D.scene.currentConstructorElementData.type + 's' : '');
    let [showHiddenBtn, setShowHiddenBtn] = useState(true);

    let isProductPartialVisible = R2D.scene.currentConstructorElementData?.partialVisible;

    let hideButtonsRotate = () => {
        textFieldInfo.current.style.display = 'block';
        info_bottom.current.style.display = 'none';
        btnMove.current.style.display = 'none';
    }

    let showButtonsRotate = () => {
        textFieldInfo.current.style.display = "none";
        info_bottom.current.style.display = 'flex';
        btnMove.current.style.display = 'block';
    }

    let showButtonsMove = () => {
        if(btnClear?.current) btnClear.current.style.display = 'flex';
        btnRotate.current.style.display = btnDragPanel.current.style.display = 'flex';
        if(btnHide?.current) btnHide.current.style.display = 'flex';
    }

    let hideButtonsMove = () => {
        if(btnClear?.current) btnClear.current.style.display = 'none';
        btnRotate.current.style.display = btnDragPanel.current.style.display = 'none';
        if(btnHide?.current) btnHide.current.style.display = 'none';
    }

    let onClickPartialVisible = e => {
        planner.scene.makeElementVisible(typeToHide, planner.scene.getCurrentConstructorElementData()?.id);
        planner.mih().unsetActiveObject();
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
    };

    useEffect(() => setTypeToHide(R2D.scene.currentConstructorElementData ? R2D.scene.currentConstructorElementData.type == 'topFrame' || R2D.scene.currentConstructorElementData.type == 'bottomFrame' ? 'frames' : R2D.scene.currentConstructorElementData.type == 'cap' ? 'cap' : R2D.scene.currentConstructorElementData.type + 's' : ''), []);
    useEffect(() => setShowHiddenBtn(!(typeToHide == 'frames' || typeToHide == 'cap' || typeToHide == 'areas' || typeToHide == 'cuts')), [typeToHide]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3}}
            className={classes.info_model_pop_wrap} ref={mainDiv} style={{left: panelPosition.y < 72 ? panelPosition.x + 50 : panelPosition.x, top: panelPosition.y < 72 ? 72 : panelPosition.y}}>
            <AnimatePresence mode="wait">

                {
                    isProductPartialVisible ?
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 0.3}}
                            key={'helper_wall_visible'}
                            className={classes.info_model_pop_wrap}>
                            <div className={classes.info_model_pop_wr}>
                                <div className={classes.info_model_bottom} ref={info_bottom}>
                                    <DragPanelButtonRef ref={refs} changePosition={setPanelPosition}/>
                                    <HiddenRef ref={refs} onClick={onClickPartialVisible} isPartialVisible={isProductPartialVisible} />
                                </div>
                            </div>
                        </motion.div>
                    :
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 0.3}}
                            key={'helper_wall_hidden'}
                            className={classes.info_model_pop_wrap}>
                            <div className={classes.info_model_pop_wr}>
                                <div className={classes.info_model_bottom} ref={info_bottom}>
                                    <DragPanelButtonRef ref={refs} changePosition={setPanelPosition}/>
                                    <ClearRef positionBtn={{x: 0, y: 0}} ref={btnClear}/>
                                    {
                                        showHiddenBtn && typeToHide ?
                                        <HideRef typeToHide={typeToHide} ref={btnHide}/> : null
                                    }
                                </div>
                            </div>
                            <div className={classes.info_model_height} ref={textFieldInfo}></div>
                            <RotateRef radius={showHiddenBtn ? 58 : 70} ref={refs} position={panelPosition} hide={hideButtonsRotate} show={showButtonsRotate} positionBtn={{x: showHiddenBtn ? 58 : 70, y: 0}}/>
                            <MoveRef ref={refs} hide={hideButtonsMove} changePosition={setPanelPosition} show={showButtonsMove} positionBtn={{x: showHiddenBtn ? 0 : 20, y: -40}}/>
                        </motion.div>
                }
            </AnimatePresence>
        </motion.div>
    )
}

export default Helper;