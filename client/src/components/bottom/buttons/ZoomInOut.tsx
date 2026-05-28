import React, {useEffect, useRef, useState} from 'react';
import { useSelector } from 'react-redux';
import {createUseStyles} from "react-jss";

import { planner } from '../../../initR2D';
import { selectActiveViewMode } from '../../../redux/features/viewMode/viewModeSlice';
import {selectTranslation} from "../../../redux/features/language/languageSlice";

import HoverComponent from "../../left_new/parts/controlPanel/components/HoverComponent";

const useStyle = createUseStyles({
    zoomInOut_main:{
        display: 'flex',
        height: '100%'
    },
    persentOfZoom: {
        padding: '0 6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        background: '#ffffff',
        width: 38,
        fontSize: 11,
        fontWeight: 400 ,
        color: '#2A3435',
    },
    zoomInOutBtn:{
        cursor: 'pointer',
        background: '#fff',
        borderRadius: 3,
        border: '1px solid #fff',
        display: 'flex',
        justifyContent: 'center',
        height: '100%',
        alignItems: 'center',
        position: "relative",
        minWidth: 30,
        marginRight: '1px',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        '&:hover':{
            background: '#E9E9E9',
        }
    }
});

const ZoomInOut = props => {

    let activeViewMode = useSelector(selectActiveViewMode);
    let tileConfigurator = null;
    let tileEditor = null;
    let translation = useSelector(selectTranslation);
    let hoverButton = useRef(null);
    let hoverButton2 = useRef(null);

    let [persentOfZoomState, setPersentOfZoomState] = useState(100);
    let currOS = R2D.controller.getCurrentOS();
    let isCurrDeviceAPhone = currOS == "iOS" || currOS == "Android";

    if(activeViewMode == 'tileConfig') {
        tileConfigurator = planner.scene.getConfigurator();
        tileEditor = tileConfigurator.getTileEditor();
    }
    
    let zoomIn = e => {
        activeViewMode == 'tileConfig' ?
        tileEditor.zoom(tileEditor.canvasWidth / 2, tileEditor.canvasHeight / 2, 2) :
        planner.zoomIn();
    }

    let zoomOut = e => {
        activeViewMode == 'tileConfig' ?
        tileEditor.zoom(tileEditor.canvasWidth / 2, tileEditor.canvasHeight / 2, -2) :
        planner.zoomOut();
    }

    let onUpdateZoomInput = e => {
        if(activeViewMode == 'view2d') setPersentOfZoomState(R2D.view2d.getCameraZoomPercentages());
        else if(activeViewMode == 'view3d') setPersentOfZoomState(R2D.view3d.getCameraZoomPercentages());
        else if(activeViewMode == 'constr') setPersentOfZoomState(WC.wallsEditor.getCameraZoomPercentages());
    };

    let onClickPercentagesValue = e => {
        planner.zoomToMax();
        if(activeViewMode == 'view2d') setPersentOfZoomState(R2D.view2d.getCameraZoomPercentages());
        else if(activeViewMode == 'view3d') setPersentOfZoomState(R2D.view3d.getCameraZoomPercentages());
        else if(activeViewMode == 'constr') setPersentOfZoomState(WC.wallsEditor.getCameraZoomPercentages());
    }

    const classes = useStyle();

    useEffect(() => {
        if(activeViewMode == 'view2d') setPersentOfZoomState(R2D.view2d.getCameraZoomPercentages());
        else if(activeViewMode == 'view3d') setPersentOfZoomState(R2D.view3d.getCameraZoomPercentages());
        else if(activeViewMode == 'constr') setPersentOfZoomState(WC.wallsEditor.getCameraZoomPercentages());
        planner.apiScene.addEventListener(planner.apiScene.UPDATE_ZOOM_INPUT, onUpdateZoomInput);
        planner.apiConstr.addEventListener(planner.apiConstr.UPDATE_ZOOM_INPUT, onUpdateZoomInput);

        return () => {
            planner.apiScene.removeEventListener(planner.apiScene.UPDATE_ZOOM_INPUT, onUpdateZoomInput);
            planner.apiConstr.removeEventListener(planner.apiConstr.UPDATE_ZOOM_INPUT, onUpdateZoomInput);
        }
    }, [activeViewMode])

    return(
        <div className={classes.zoomInOut_main}>

            <div className={classes.zoomInOutBtn} ref={hoverButton} onClick={zoomOut}>
                <HoverComponent hoverText={ translation["HINT_BUTTON_ZOOM_MINUS"] } parentRef={hoverButton} hoverTextPositionX={'left'} hoverTextPositionY={'top'} >
                    <svg width="17" height="1" viewBox="0 0 17 1" fill="none" >
                        <rect x="17" width="1" height="17" transform="rotate(90 17 0)" fill="#2A3435"/>
                    </svg>
                </HoverComponent>
            </div>

            {
                !isCurrDeviceAPhone ?
                    <div className={classes.persentOfZoom} onClick={onClickPercentagesValue}>{ persentOfZoomState + "%" }</div>
                : null
            }


            <div className={classes.zoomInOutBtn} ref={hoverButton2} onClick={zoomIn}>
                <HoverComponent hoverText={ translation["HINT_BUTTON_ZOOM_PLUS"] } parentRef={hoverButton2} hoverTextPositionX={'left'} hoverTextPositionY={'top'} >
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                        <rect x="8" width="1" height="17" fill="#2A3435"/>
                        <rect x="17" y="8" width="1" height="17" transform="rotate(90 17 8)" fill="#2A3435"/>
                    </svg>
                </HoverComponent>
            </div>


        </div>
        
    )
}

export default ZoomInOut;