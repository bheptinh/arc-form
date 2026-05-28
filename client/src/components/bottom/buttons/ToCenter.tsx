import React, {useRef} from 'react';
import {createUseStyles} from "react-jss";
import {useSelector} from "react-redux";

import { planner } from '../../../initR2D';
import {selectTranslation} from "../../../redux/features/language/languageSlice";

import HoverComponent from "../../left_new/parts/controlPanel/components/HoverComponent";

const useStyle = createUseStyles({
    toCenter_main:{
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

const ToCenter = props => {
    const classes = useStyle();
    let translation = useSelector(selectTranslation);
    let hoverButton = useRef(null);
    return(
        <div className={classes.toCenter_main} ref={hoverButton} onClick={planner.toCenter}>
            <HoverComponent hoverText={ translation["HINT_BUTTON_TO_CENTER"] } parentRef={hoverButton} hoverTextPositionX={'left'} hoverTextPositionY={'top'} >
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
                    <path d="M12 0H11V6.27273L8.71707 4L8 4.71387L11.5018 8.19998L12.2188 7.48612L12.2171 7.48437L15 4.71387L14.2829 4L12 6.27274V0Z" fill="#2A3435"/>
                    <path d="M11 23.2H12L12 16.9273L14.2829 19.2L15 18.4861L11.4982 15L10.7812 15.7139L10.7829 15.7156L8 18.4861L8.71707 19.2L11 16.9273L11 23.2Z" fill="#2A3435"/>
                    <path d="M23.2 12V11H16.9273L19.2 8.71707L18.4861 8L15 11.5018L15.7139 12.2188L15.7156 12.2171L18.4861 15L19.2 14.2829L16.9273 12H23.2Z" fill="#2A3435"/>
                    <path d="M1.1925e-08 11L0 12H6.27273L4 14.2829L4.71387 15L8.19998 11.4982L7.48612 10.7812L7.48437 10.7829L4.71387 7.99999L4 8.71707L6.27274 11H1.1925e-08Z" fill="#2A3435"/>
                </svg>
            </HoverComponent>
        </div>
    )
}

export default ToCenter;