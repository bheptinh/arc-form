import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveViewMode, selectActiveViewMode } from '../../../redux/features/viewMode/viewModeSlice';
import { removeQuickPanelAll } from '../../../redux/features/quickPanels/quickPanelsSlice';
import HoverComponent from '../../left_new/parts/controlPanel/components/HoverComponent';
import { createUseStyles } from "react-jss";
import { selectTranslation } from '../../../redux/features/language/languageSlice';

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
        border: '2px solid #fff',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        '&:hover':{
            background: '#E9E9E9',
        }
    },
    right_bar_btn_active:{
        background: '#BAE51F',
        position: "relative",
        '& path, & circle, & rect':{
            fill: '#424242',
        },
        height: 36,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 36,
        borderRadius: 3,
        border: '2px solid #fff',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    viewModeButton:{
        position: 'relative'
    }
});

const ViewConstr = props => {
    let dispatch = useDispatch();
    let activeViewMode = useSelector(selectActiveViewMode);
    let translation = useSelector(selectTranslation);
    const classes = useStyles();
    let mainDiv = useRef(null);

    let changeViewMode = e => {
        dispatch(removeQuickPanelAll());
        dispatch(setActiveViewMode("constr"));
        props.onClick && props.onClick();
    }

    return(
        <div className={classes.viewModeButton} ref={mainDiv}>
            <HoverComponent hoverText={translation["HINT_BUTTON_CONSTRUCTOR"]} parentRef={mainDiv} hoverTextPositionX={'left'}>
                <div className={activeViewMode == 'constr' ? classes.right_bar_btn_active : classes.right_bar_btn} onClick={changeViewMode}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="2.5" cy="2.5" r="2.5" fill="white"/>
                        <circle cx="2.5" cy="17.5" r="2.5" fill="white"/>
                        <circle cx="17.5" cy="2.5" r="2.5" fill="white"/>
                        <circle cx="17.5" cy="17.5" r="2.5" fill="white"/>
                        <rect x="4" y="2" width="12" height="1" fill="white"/>
                        <rect x="2" y="16" width="12" height="1" transform="rotate(-90 2 16)" fill="white"/>
                        <rect x="17" y="16" width="12" height="1" transform="rotate(-90 17 16)" fill="white"/>
                        <rect x="4" y="17" width="12" height="1" fill="white"/>
                    </svg>
                </div>
            </HoverComponent>
        </div>
    )
}

export default ViewConstr;