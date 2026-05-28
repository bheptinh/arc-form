import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {createUseStyles} from "react-jss";

import { selectActiveControlPanelModeData } from '../../../../../../../redux/features/control/controlPanelSlice';

import Main from './Main';

const useStyle = createUseStyles({
    selectedCover_constr:{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 311,
        height: '100%',
        overflow: 'hidden',
        zIndex: 1
    }
});

const SelectedCover_constr = () => {
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
        <div className={ classes.selectedCover_constr }>
            { activePanelComponents }
        </div>
    );
};

export default SelectedCover_constr;