import React, { useRef } from 'react';
import {createUseStyles} from "react-jss";
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { planner } from '../../../initR2D';
import { selectTranslation } from '../../../redux/features/language/languageSlice';
import { changeActiveControlPanelMode } from '../../../redux/features/control/controlPanelSlice';
import HoverComponent from "../../left_new/parts/controlPanel/components/HoverComponent";

const useStyle = createUseStyles({
    info_model_btn:{
        width: 32,
        height: 32,
        background: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
        borderRadius: 3,
        border: '1px solid #fff',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        '& img':{
            userSelect: "none",
            pointerEvents: "none"
        },
        '&:hover':{
            background: '#E9E9E9'
        }
    },
    info_model_btn_overlay:{
        width: "100%",
        height: "100%",
        position: "absolute",
        left: 0,
        top: 0
    },
    info_model_main:{

    }
});

const Replace = props => {
    let translation = useSelector(selectTranslation);
    let dispatch = useDispatch();
    const classes = useStyle();
    let btnReplace = useRef(null);

    let onReplaceDown = e => {
        document.addEventListener('mouseup', onMouseUp);
    }

    let onReplaceUp = e => {
        props.onClickReplace();

        R2D.scene.isRotation3dActive = false;
        R2D.scene3d.top.children.forEach(i => {
            if(i.name == "rotationRings") {
                i.clear();
                i.removeFromParent();
            }
        })
        planner.mih().state.setOnRotationDownStatus ? planner.mih().state.setOnRotationDownStatus(false) : planner.mih().stateSelectedProduct.setOnRotationDownStatus(false);
        planner.mih()._currentViewer.rendererUpdate();
        
        dispatch(changeActiveControlPanelMode({mode: "replaceModel"}));
    }

    let onMouseUp = e => document.removeEventListener('mouseup', onMouseUp);

    return (
        <HoverComponent hoverText={translation["HINT_BUTTON_REPLACE"]} >
            <div className={classes.info_model_btn} style={ props.addStyles ? { ...props.addStyles } : null } ref={ btnReplace }>
                <svg width="18" height="19" viewBox="0 0 18 19" fill="none">
                    <rect x="0.703906" y="10.931" width="6.9256" height="6.9256" rx="3.4628" stroke="#323232" strokeWidth="1.4"/>
                    <rect x="9.25781" y="0.0551758" width="8.3256" height="8.3256" fill="#323232"/>
                    <path d="M10.3984 12.1696L11.1038 12.875L13.4214 10.5574L15.739 12.875L16.4444 12.1696L13.4214 9.14666L10.3984 12.1696Z" fill="#323232"/>
                    <rect x="12.8438" y="10.5391" width="1.15625" height="3.30518" fill="#323232"/>
                    <rect x="14" y="13.8442" width="1.15625" height="4.74219" transform="rotate(90 14 13.8442)" fill="#323232"/>
                    <path d="M7.37109 6.12333L6.66573 5.41797L4.34812 7.73558L2.0305 5.41797L1.32514 6.12333L4.34812 9.14631L7.37109 6.12333Z" fill="#323232"/>
                    <rect x="4.92578" y="7.75391" width="1.15625" height="3.30518" transform="rotate(-180 4.92578 7.75391)" fill="#323232"/>
                    <rect x="3.76953" y="4.44873" width="1.15625" height="4.74219" transform="rotate(-90 3.76953 4.44873)" fill="#323232"/>
                </svg>
                <div className={classes.info_model_btn_overlay} onMouseUp={onReplaceUp} onMouseDown={onReplaceDown}></div>
            </div>
        </HoverComponent>
    )
}

export default Replace;