import React, { useState, useEffect } from 'react';
import {createUseStyles} from "react-jss";
import { useSelector } from 'react-redux';

import { selectActiveControlPanelModeData } from '../../../../../../../redux/features/control/controlPanelSlice';
import Main from './Main';


const useStyle = createUseStyles({
    alignDrawing:{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 310,
        height: '100%',
        overflow: 'hidden',
        zIndex: 1,
        borderLeft:'1px solid #E0E0E0'
    }
});

const AlignDrawing = () => {
    const classes = useStyle();

    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = activeControlPanelData.history;
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let lastHistoryElemType = lastHistoryElem?.type;
    let keyTimeoutClearActiveComponents;

    let [activePanelComponents, setActivePanelComponents] = useState([]);


    useEffect(() => {
        if(lastHistoryElemType) {
            setActivePanelComponents(prevState => 
                [
                    ...prevState, 
                    lastHistoryElemType == "main" ? 
                        <Main key={Math.random()} /> :
                    null
                ]
            );
        }
    }, [controlPanelModeHistory?.length]);

    useEffect(() => {
        if(activePanelComponents.length > 2) setActivePanelComponents(prevState => [prevState[prevState.length - 2], prevState[prevState.length - 1]]);
        else {
            if(activePanelComponents.length > 1) keyTimeoutClearActiveComponents = setTimeout(() => setActivePanelComponents(prevState => [prevState[prevState.length - 1]]), 600);
        }
        return () => clearTimeout(keyTimeoutClearActiveComponents);
    }, [activePanelComponents]);

    return (
        <div className={classes.alignDrawing}>
            { activePanelComponents }
        </div>
    );
};

export default AlignDrawing;