import React, { useEffect, useMemo, useRef, useState } from 'react';
import {createUseStyles} from "react-jss";
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from "simplebar-react";

import { planner } from '../../../../../../../initR2D';
import { selectTranslation } from '../../../../../../../redux/features/language/languageSlice';
import { selectPopupsLastClosedPopup, setActivePopup } from '../../../../../../../redux/features/popups/popupsSlice';
import { changeActiveControlPanelMode, selectActiveControlPanelModeData, selectControlPanelData, selectPrevControlPanelMode, updateControlPanelStatus } from '../../../../../../../../redux/features/control/controlPanelSlice';
import { changeImagePlanUploadType } from '../../../../../../../redux/features/constructor/constructorSlice.js';
import {showTip} from "../../../../../../../redux/features/tips/tipsSlice";
import { setActiveViewMode } from '../../../../../../../redux/features/viewMode/viewModeSlice';

const useStyle = createUseStyles({
    planerWallsCont: {
        top: 0,
        left: 0,
        width: 309,
        height: '100%',
        display: 'grid',
        position: 'absolute',
        background: '#fff',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        borderRight: '1px solid #cdcdcd'
    },
    planerWallsWrap: {
        height: '100%',
        background: '#fff',
    },
    planerConstItemWrap:{
        width: '100%',
    },
    planerConstItemText:{
        color: '#2A3435',
        fontSize: 14,
    },
    planerConstItem:{
        cursor: "pointer",
        height: "72px",
        display: "grid",
        gridTemplateColumns: '55px auto',
        padding: "0 28px",
        zIndex: 1,
        gridGap: "11px",
        position: "relative",
        background: "#FFFFFF",
        transition: "all 0.9s cubic-bezier(0.19, 1, 0.22, 1)",
        alignItems: "center",
        borderBottom: "1px solid #E9E9E9",
        '&:after':{
            top: "0",
            left: "0",
            width: "100%",
            height: "29px",
            content: '""',
            zIndex: -1,
            position: "absolute",
            background: "linear-gradient(to bottom, #F5F3F3, transparent)",
            transition: "all 0.9s cubic-bezier(0.19, 1, 0.22, 1)"
        },
        '&:hover':{
            background: '#B8E11F',
            '&:after':{
                opacity: 0,
            }
        }
    },
    planerConstItemImgWr:{
        width: "55px",
        height: "46px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    planerConstItemImg:{
        maxWidth: "100%",
        maxHeight: "100%"
    },
    roll_out_right:{
        transform: "translateX(100%)"
    },
});

const Main = props => {
    const classes = useStyle();
    let translation = useSelector(selectTranslation);
    let dispatch = useDispatch();
    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let isAdded = lastHistoryElem?.isAdded;
    let prevControlPanelMode = useSelector(selectPrevControlPanelMode);
    let lastClosedPopup = useSelector(selectPopupsLastClosedPopup);

    let controlPanelData = useSelector(selectControlPanelData);

    let [styleAnimation, setStyleAnimation] = useState(isAdded ? {transform: "translateX(100%)"} : { transform: "translateX(-100%)" });

    let onSave = e => {
        let modeToChangeAfter = WC.wallsEditor.state.getModeToChangeAfter && WC.wallsEditor.state.getModeToChangeAfter();
        let result = WC.wallsEditor.stopAlignDrawing(false);
        if(!result || result.state == "error") {
            dispatch(setActivePopup({name: "alert", type: result?.type, data: result?.data}));
        } else {
            if(modeToChangeAfter) {
                dispatch(setActiveViewMode(modeToChangeAfter));
                if(modeToChangeAfter == 'view3d' || modeToChangeAfter == 'view2d') {
                    prevControlPanelMode ?
                    dispatch(changeActiveControlPanelMode({mode: prevControlPanelMode})) : 
                    dispatch(changeActiveControlPanelMode({
                        mode: 'furniture', 
                        data: controlPanelData['furniture'].history.length < 1 ? {type: "catalog", addType: "main", id: null, lastSavedScroll: 0, data: furnitureData} : null
                    }));
                }
            } else {
                dispatch(changeActiveControlPanelMode({mode: 'constructor'}));
            }
            
            dispatch(updateControlPanelStatus(true));
            dispatch(showTip({name: 'constructorButtons'}));
        }
    }

    let onDelete = e => dispatch(setActivePopup({name: "confirm", type: "image_plan_delete"}));

    let rightPanelData = useRef(null);

    let onSetImagePlanAreaPopup = e => dispatch(setActivePopup({name: "setValueInput", type: "setImagePlanArea"}));

    useEffect(() => lastClosedPopup == "imageUpload" && WC.wallsEditor.state.startRectAnimation(), [lastClosedPopup]);

    useEffect(() => {
        R2D.Storage.load("r2d_uploadImagePopup") && WC.wallsEditor.state.startRectAnimation();
        setStyleAnimation({ transform: "translateX(0%)" });
        planner.apiConstr.addEventListener(planner.apiConstr.SET_AREA_IMAG_PLAN_POPUP, onSetImagePlanAreaPopup);
        dispatch(changeImagePlanUploadType(R2D.commonSceneHelper.drawingHelper.state != null ? R2D.commonSceneHelper.drawingHelper.state : null));
        return () => planner.apiConstr.removeEventListener(planner.apiConstr.SET_AREA_IMAG_PLAN_POPUP, onSetImagePlanAreaPopup);
    }, []);

    return (
        <div className={classes.planerWallsCont} ref={rightPanelData} style={styleAnimation || {transform: "translateX(-100%)"}}>
            <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
                <div className={classes.planerWallsWrap}>
                    <div className={classes.planerConstItemWrap}>
                        <div className={classes.planerConstItem} onClick={onSave}>
                            <div className={classes.planerConstItemImgWr}>
                                <svg className={classes.planerConstItemImg} width="30" height="31" viewBox="0 0 30 31" fill="none">
                                    <path d="M0 0H26.5L30 3.5V31H0V0Z" fill="#626262"/>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M6.45238 14H24.5476C25.0733 14 25.5 14.448 25.5 15C25.5 15.552 25.0733 16 24.5476 16H6.45238C5.92667 16 5.5 15.552 5.5 15C5.5 14.448 5.92667 14 6.45238 14Z" fill="white"/>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M6.45238 18H24.5476C25.0733 18 25.5 18.448 25.5 19C25.5 19.552 25.0733 20 24.5476 20H6.45238C5.92667 20 5.5 19.552 5.5 19C5.5 18.448 5.92667 18 6.45238 18Z" fill="white"/>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M6.45238 22H24.5476C25.0733 22 25.5 22.448 25.5 23C25.5 23.552 25.0733 24 24.5476 24H6.45238C5.92667 24 5.5 23.552 5.5 23C5.5 22.448 5.92667 22 6.45238 22Z" fill="white"/>
                                    <line x1="5.5" x2="5.5" y2="7" stroke="#B3B3B3"/>
                                    <line x1="5" y1="6.5" x2="23" y2="6.5" stroke="#B3B3B3"/>
                                    <line x1="22.5" x2="22.5" y2="6" stroke="#B3B3B3"/>
                                    <rect x="18" y="1" width="3" height="4" fill="white"/>
                                </svg>
                            </div>
                            <p className={classes.planerConstItemText}>{ translation["BUTTON_OK"] }</p>
                        </div>
                        <div className={classes.planerConstItem} onClick={onDelete}>
                            <div className={classes.planerConstItemImgWr}>
                                <svg viewBox="0 0 25 34"  width="30" className={classes.planerConstItemImg}>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M2 7.00006H22H23V32.4201C23 33.2921 22.296 34.0001 21.429 34.0001H3.571C2.704 34.0001 2 33.2921 2 32.4201V7.00006C2 7.00006 2 6.12706 2 7.00006Z" fill="#626262"/>
                                    <path className="path_not_anim" fillRule="evenodd" clipRule="evenodd" d="M18.5 9C19.328 9 20 9.672 20 10.5V27.5C20 28.328 19.328 29 18.5 29C17.672 29 17 28.328 17 27.5V10.5C17 9.672 17.672 9 18.5 9Z" fill="#fff"/>
                                    <path className="path_not_anim" fillRule="evenodd" clipRule="evenodd" d="M12.5 9C13.328 9 14 9.672 14 10.5V27.5C14 28.328 13.328 29 12.5 29C11.672 29 11 28.328 11 27.5V10.5C11 9.672 11.672 9 12.5 9Z" fill="#fff"/>
                                    <path className="path_not_anim" fillRule="evenodd" clipRule="evenodd" d="M6.5 9C7.328 9 8 9.672 8 10.5V27.5C8 28.328 7.328 29 6.5 29C5.672 29 5 28.328 5 27.5V10.5C5 9.672 5.672 9 6.5 9Z" fill="#fff"/>
                                    <path d="M9 2L2 6H23L16 2L15.5528 1.10557C15.214 0.428005 14.5215 0 13.7639 0H11.2361C10.4785 0 9.786 0.428004 9.44721 1.10557L9 2Z" fill="#626262"/>
                                    <line y1="6.5" x2="26" y2="6.5" stroke="#626262"/>
                                    <line x1="10.5" y1="1.5" x2="14.5" y2="1.5" stroke="#626262" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <p className={classes.planerConstItemText}>{ translation["HINT_BUTTON_DELETE"] }</p>
                        </div>
                    </div>
                </div>
            </SimpleBar>
        </div>
    );
};

export default Main;