import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUseStyles } from "react-jss";

import { selectActiveViewMode, setActiveViewMode } from '../../../redux/features/viewMode/viewModeSlice';
import HoverComponent from '../../left_new/parts/controlPanel/components/HoverComponent';
import { selectTranslation } from '../../../redux/features/language/languageSlice';
import { selectActiveControlPanelMode, selectControlPanelData } from '../../../redux/features/control/controlPanelSlice';

const useStyles = createUseStyles({
    right_bar_btn:{
        background: '#fff',
        cursor: 'pointer',
        height: 36,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 36,
        position: "relative",
        borderRadius: 3,
        borderBottom: '1px solid #fff',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        '&:hover':{
            background: '#E9E9E9',
        },
        '@media screen and (max-width: 950px)':{
            height: 30,
            width: 30,
        }
    },
    right_bar_btn_active:{
        background: '#BAE51F',
        position: "relative",
        '& path, & circle, & rect':{
            fill: '#424242',
        },
        borderBottom: '1px solid #fff',
        height: 36,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 36,
        borderRadius: 3,
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        '@media screen and (max-width: 950px)':{
            height: 30,
            width: 30,
        }
    },
    viewModeButton:{
        position: 'relative',
    }
});

const View2D = props => {
    let dispatch = useDispatch();
    let activeViewMode = useSelector(selectActiveViewMode);
    let translation = useSelector(selectTranslation);
    let controlPanelData = useSelector(selectControlPanelData);
    let activeControlPanelMode = useSelector(selectActiveControlPanelMode);
    const classes = useStyles();
    let mainDiv = useRef(null);

    let changeViewMode = e => {
        dispatch(setActiveViewMode("view2d"));
        props.onClick && props.onClick();
    }

    return(
        <div className={classes.viewModeButton} ref={mainDiv}>
            <HoverComponent hoverText={translation["HINT_BUTTON_2D"]} parentRef={mainDiv} hoverTextPositionX={'left'}>
                <div className={activeViewMode == 'view2d' ? classes.right_bar_btn_active : classes.right_bar_btn} onClick={changeViewMode}>
                    <svg width="23" height="10" viewBox="0 0 23 10" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M21.723 8.398C21.324 8.814 20.575 9.022 19.474 9.022H12.012V0.117H19.474C20.575 0.117 21.324 0.321 21.723 0.729C22.312 1.337 22.607 2.617 22.607 4.57C22.607 6.514 22.312 7.79 21.723 8.398ZM20.904 1.978C20.653 1.535 20.172 1.313 19.461 1.313H13.338V7.826H19.461C20.18 7.826 20.664 7.607 20.911 7.169C21.158 6.73 21.281 5.864 21.281 4.57C21.281 3.285 21.155 2.421 20.904 1.978ZM0 7.195C0 6.417 0.238 5.829 0.715 5.432C1.122 5.086 1.759 4.853 2.626 4.732C3.233 4.646 4.13 4.602 5.317 4.602C6.47 4.602 7.263 4.506 7.696 4.314C8.216 4.087 8.476 3.646 8.476 2.991C8.476 2.161 8.288 1.655 7.911 1.472C7.534 1.288 6.53 1.196 4.901 1.196C3.185 1.196 2.16 1.307 1.827 1.53C1.493 1.752 1.326 2.421 1.326 3.536H0C0 1.933 0.316 0.928 0.949 0.52C1.486 0.174 2.804 0 4.901 0C6.894 0 8.19 0.165 8.788 0.495C9.464 0.869 9.802 1.681 9.802 2.932C9.802 4.174 9.325 4.999 8.372 5.408C7.765 5.668 6.738 5.798 5.291 5.798C3.722 5.798 2.7 5.872 2.223 6.018C1.625 6.199 1.326 6.595 1.326 7.206V7.826H9.802V9.022H0V7.195Z" fill="#2A3435"/>
                    </svg>
                </div>
            </HoverComponent>
        </div>
    )
}

export default View2D;