import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {createUseStyles} from "react-jss";

import { selectActiveControlPanelModeData } from '../../../../../../../redux/features/control/controlPanelSlice';
import Main from './Main';

const useStyle = createUseStyles({
    selectedCover:{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 311,
        height: '100%',
        borderLeft: '1px solid #E0E0E0',
        zIndex: 1,
        '@media screen and (max-width: 950px)':{
            width: 190,
        }
    }
});

const SelectedArea = () => {
    const classes = useStyle();

    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = activeControlPanelData.history;
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let lastHistoryElemType = lastHistoryElem?.type;
    let keyTimeoutClearActiveComponents, keyTimeoutOverflow;

    let [activePanelComponents, setActivePanelComponents] = useState([]);
    let [needToOverflowHidden, setNeedToOverflowHidden] = useState(true);

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
        setNeedToOverflowHidden(true);
        if(activePanelComponents.length > 2) setActivePanelComponents(prevState => [prevState[prevState.length - 2], prevState[prevState.length - 1]]);
        else {
            if(activePanelComponents.length > 1) keyTimeoutClearActiveComponents = setTimeout(() => setActivePanelComponents(prevState => [prevState[prevState.length - 1]]), 600);
            else keyTimeoutOverflow = setTimeout(() => setNeedToOverflowHidden(false), 600);
        }
        return () => {
            clearTimeout(keyTimeoutClearActiveComponents);
            clearTimeout(keyTimeoutOverflow);
        }
    }, [activePanelComponents]);

    return (
        <div className={ classes.selectedCover } style={ needToOverflowHidden ? {overflow: 'hidden'} : null }>
            { activePanelComponents }
        </div>
    );
};

export default SelectedArea;