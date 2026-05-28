import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {createUseStyles} from "react-jss";

import { selectTranslation } from '../../../../../../redux/features/language/languageSlice';
import { controlPanelHistoryRemove, controlPanelUpdateBreadCrumbs, selectActiveControlPanelModeData } from '../../../../../../redux/features/control/controlPanelSlice';

import HoverComponent from "../../../controlPanel/components/HoverComponent";

const useStyle = createUseStyles({
    planner_catalog_btn: {
        display: "flex",
        alignItems: "center",
        cursor: 'pointer',
        position: 'relative',
        '& svg':{
            marginRight: "7px",
            cursor: "pointer",
            '& path':{
                transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)'
            }
        },
        '&:hover':{
            '& path':{
                fill: '#939393'
            }
        }
    },
    planner_catalog_btn_not_active: {
        display: "flex",
        alignItems: "center",
        '& svg':{
            marginRight: "7px",
            cursor: "pointer",
            opacity: 0.3
        },
        cursor: 'default'
    }
});

const Prev = props => {
    let translation = useSelector(selectTranslation);
    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let currentStateBreadCrumbs = activeControlPanelData?.breadCrumbs;

    const classes = useStyle();

    let dispatch = useDispatch();

    let onPrevClick = () => {
        dispatch(controlPanelHistoryRemove());
        currentStateBreadCrumbs && currentStateBreadCrumbs.length > 0 && dispatch(controlPanelUpdateBreadCrumbs({data: null, updateType: "remove"}));
    }


    let hoverButton = useRef(null);

    return (

        <div className={classes.planner_catalog_btn} ref={hoverButton}  onMouseUp={onPrevClick} >

            <HoverComponent hoverText={ translation["HINT_BUTTON_BACK"] } parentRef={hoverButton}  >
                <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
                    <path opacity="0.99" fillRule="evenodd" clipRule="evenodd" d="M7.71246 0L8.41032 0.679673L1.94819 7H13V8H1.87968L8.4375 14.3151L7.74508 15L0.702613 8.21825L0.697857 8.2229L0 7.54323L7.71246 0Z" fill="#2f2f2f"/>
                </svg>
            </HoverComponent>

        </div>

    )
}

export default Prev;