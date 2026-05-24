import React, { useEffect, useMemo, useState } from 'react';
import {createUseStyles} from "react-jss";
import { useSelector, useDispatch } from 'react-redux';

import { planner } from '../../../../../../../initR2D';
import { selectTranslation } from '../../../../../../../redux/features/language/languageSlice';
import { changeActiveControlPanelMode, selectActiveControlPanelModeData } from '../../../../../../../redux/features/control/controlPanelSlice';
import ChangeSize from '../../../components/ChangeSize';
import Checkbox from '../../../components/Checkbox';


const useStyle = createUseStyles({
    planerWallsCont: {
        top: 0,
        left: 0,
        width: 309,
        height: '100%',
        display: 'grid',
        position: 'absolute',
        background: '#F1F1F1',
        transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
        borderRight: '1px solid #cdcdcd'
    },
    planerWallsWrap: {
        height: '100%',
        overflow: 'auto',
        background: '#fff',
        padding: 20,
    },
    planerWallsTitle:{
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 15,
        color: '#505050',
    },
    divide_checkbox_wr:{
        marginBottom: 15
    },
    planerChangeSizes:{

        gridTemplateColumns: 'auto 28% 16px',
        alignItems: 'center',
        gridGap: '5px 0',
        marginBottom: 20
    },
    planerDelete:{
        height: 120,
        border: '1px solid #d9d9d9',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover':{
            background: '#FFCC00'
        }
    },
    planerDeleteIcon:{
        width: 26,
        height: 34
    },
});

const Main = () => {
    const classes = useStyle();
    let dispatch = useDispatch();

    let [wallSegmentHeight, setWallSegmentHeight] = useState(planner.constr.stateSelectedArea()[0]?.getHeight());
    let [ceilingHeight, setCeilingHeight] = useState(planner.constr.stateSelectedArea()[0]?.getCeilingHeight());

    let translation = useSelector(selectTranslation);
    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let isAdded = lastHistoryElem?.isAdded;
    
    let [mouseDown, setMouseDown] = useState({status: false, action: null, type: null});
    let [checkboxStatus, setСheckboxStatus] = useState(planner.constr.stateSelectedArea()[0]?.getCeilingVisible() ? "checked" : null);

    let [styleAnimation, setStyleAnimation] = useState(isAdded ? {transform: "translateX(100%)"} : { transform: "translateX(-100%)" });
    
    let onChangeHeight = (mouseDown, value, type) => {
        setMouseDown({...mouseDown, type});
        switch(type) {
            case "segment":
                setWallSegmentHeight(planner.units.stringToValue(planner.units.valueToString(value)));
                planner.constr.setAreaHeight(planner.units.stringToValue(planner.units.valueToString(value)));
                break;

            case "ceiling":
                setCeilingHeight(planner.units.stringToValue(planner.units.valueToString(value)));
                planner.constr.setAreaCeilingHeight(planner.units.stringToValue(planner.units.valueToString(value)));
                break;
        }
    }

    let onDeleteSelected = e => {
        planner.constr.delSelectedAreas();
        dispatch(changeActiveControlPanelMode({mode: 'constructor'}));
    }
    let onChangeCeilingVisible = isChecked => {
        planner.constr.setAreaCeilingVisible(isChecked);
        setСheckboxStatus(isChecked);
    }

    useEffect(() => setStyleAnimation({ transform: "translateX(0%)" }), []);

    return (
        <div className={classes.planerWallsCont} style={styleAnimation}>
            <div className={classes.planerWallsWrap}>

                <div className={classes.planerChangeSizes}>
                    <ChangeSize mouseDown={mouseDown} valueChangeType={"segment"} changeValue={onChangeHeight} value={wallSegmentHeight} label={'Висота сегменту стіни'}/>
                    <ChangeSize mouseDown={mouseDown} valueChangeType={"ceiling"} changeValue={onChangeHeight} value={ceilingHeight} label={'Висота стелі'}/>
                </div>

                <div className={classes.divide_checkbox_wr}>
                    <Checkbox label={translation['TEXT_CEILING_SHOW']} name={"ceilingVisible"} onChange={onChangeCeilingVisible} checked={checkboxStatus}/>
                </div>
                <div className={classes.planerDelete} onClick={onDeleteSelected}>
                    <svg viewBox="0 0 25 34" className={classes.planerDeleteIcon}>
                        <path fillRule="evenodd" clipRule="evenodd" d="M2 7.00006H22H23V32.4201C23 33.2921 22.296 34.0001 21.429 34.0001H3.571C2.704 34.0001 2 33.2921 2 32.4201V7.00006C2 7.00006 2 6.12706 2 7.00006Z" fill="#626262"/>
                        <path className="path_not_anim" fillRule="evenodd" clipRule="evenodd" d="M18.5 9C19.328 9 20 9.672 20 10.5V27.5C20 28.328 19.328 29 18.5 29C17.672 29 17 28.328 17 27.5V10.5C17 9.672 17.672 9 18.5 9Z" fill="#fff"/>
                        <path className="path_not_anim" fillRule="evenodd" clipRule="evenodd" d="M12.5 9C13.328 9 14 9.672 14 10.5V27.5C14 28.328 13.328 29 12.5 29C11.672 29 11 28.328 11 27.5V10.5C11 9.672 11.672 9 12.5 9Z" fill="#fff"/>
                        <path className="path_not_anim" fillRule="evenodd" clipRule="evenodd" d="M6.5 9C7.328 9 8 9.672 8 10.5V27.5C8 28.328 7.328 29 6.5 29C5.672 29 5 28.328 5 27.5V10.5C5 9.672 5.672 9 6.5 9Z" fill="#fff"/>
                        <path d="M9 2L2 6H23L16 2L15.5528 1.10557C15.214 0.428005 14.5215 0 13.7639 0H11.2361C10.4785 0 9.786 0.428004 9.44721 1.10557L9 2Z" fill="#626262"/>
                        <line y1="6.5" x2="26" y2="6.5" stroke="#626262"/>
                        <line x1="10.5" y1="1.5" x2="14.5" y2="1.5" stroke="#626262" strokeLinecap="round"/>
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default Main;