import React, { forwardRef } from 'react';
import {createUseStyles} from "react-jss";
import { useSelector } from 'react-redux';
import { selectTranslation } from '../../../redux/features/language/languageSlice';
import HoverComponent from "../../left_new/parts/controlPanel/components/HoverComponent";

const useStyle = createUseStyles({
    info_model_btn:{
        position: 'relative',
        width: 32,
        height: 32,
        background: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        borderRadius: 3,
        border: '1px solid #fff',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        '& svg':{
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
    }
});

export const DeleteRef = forwardRef(( { onDelClick, positionBtn, addStyles }, ref) => <Delete positionBtn={positionBtn} addStyles={addStyles} onDelClick={onDelClick} reference={ref} />);

const Delete = props => {

    const classes = useStyle();

    let positionBtn = props.positionBtn;
    let addStyles = props.addStyles;
    let translation = useSelector(selectTranslation);
    let mouseDown = false;

    let onDelete = e => {
        props.onDelClick();
        mouseDown = false;
    }

    let mouseDownDelete = e => {
        mouseDown = true;
    }

    return (
            <div className={classes.info_model_btn} ref={props.reference} style={ addStyles ? { ...addStyles } : {left: positionBtn.x, top: positionBtn.y} }>
                <HoverComponent hoverText={translation["HINT_BUTTON_DELETE"]} >
                    <svg width="13" height="17" viewBox="0 0 13 17" fill="none" >
                        <path fillRule="evenodd" clipRule="evenodd" d="M5.10547 0.164063V0.164083H7.50437V0.164062L7.98438 0.164063V0.164083H7.985V0.644083H7.98438V1.60406H7.50437V0.644083H5.10547L5.10547 1.60406H4.62547L4.62547 0.644083H4.625V0.164083H4.62547V0.164062L5.10547 0.164063Z" fill="white"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M5.10547 0.164063V0.164083H7.50437V0.164062L7.98438 0.164063V0.164083H7.985V0.644083H7.98438V1.60406H7.50437V0.644083H5.10547L5.10547 1.60406H4.62547L4.62547 0.644083H4.625V0.164083H4.62547V0.164062L5.10547 0.164063Z" fill="#AF3131"/>
                        <path d="M0.304688 2.08355C4.24869 1.13699 8.36069 1.13699 12.3047 2.08355V3.04355H0.304688V2.08355Z" fill="white"/>
                        <path d="M0.304688 2.08355C4.24869 1.13699 8.36069 1.13699 12.3047 2.08355V3.04355H0.304688V2.08355Z" fill="#AF3131"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.8656 3.52344H1.26562V15.725C1.26562 16.1436 1.60355 16.4834 2.0197 16.4834H10.5915C11.0077 16.4834 11.3456 16.1436 11.3456 15.725V3.52344H10.8656ZM9.9068 5.20383C9.9068 4.80639 9.58424 4.48383 9.1868 4.48383C8.78936 4.48383 8.4668 4.80639 8.4668 5.20383V13.3638C8.4668 13.7613 8.78936 14.0838 9.1868 14.0838C9.58424 14.0838 9.9068 13.7613 9.9068 13.3638V5.20383ZM6.30594 4.48384C6.70338 4.48384 7.02594 4.8064 7.02594 5.20384V13.3638C7.02594 13.7613 6.70338 14.0838 6.30594 14.0838C5.9085 14.0838 5.58594 13.7613 5.58594 13.3638V5.20384C5.58594 4.8064 5.9085 4.48384 6.30594 4.48384ZM4.14508 5.20383C4.14508 4.80639 3.82252 4.48383 3.42508 4.48383C3.02764 4.48383 2.70508 4.80639 2.70508 5.20383V13.3638C2.70508 13.7613 3.02764 14.0838 3.42508 14.0838C3.82252 14.0838 4.14508 13.7613 4.14508 13.3638V5.20383Z" fill="white"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M10.8656 3.52344H1.26562V15.725C1.26562 16.1436 1.60355 16.4834 2.0197 16.4834H10.5915C11.0077 16.4834 11.3456 16.1436 11.3456 15.725V3.52344H10.8656ZM9.9068 5.20383C9.9068 4.80639 9.58424 4.48383 9.1868 4.48383C8.78936 4.48383 8.4668 4.80639 8.4668 5.20383V13.3638C8.4668 13.7613 8.78936 14.0838 9.1868 14.0838C9.58424 14.0838 9.9068 13.7613 9.9068 13.3638V5.20383ZM6.30594 4.48384C6.70338 4.48384 7.02594 4.8064 7.02594 5.20384V13.3638C7.02594 13.7613 6.70338 14.0838 6.30594 14.0838C5.9085 14.0838 5.58594 13.7613 5.58594 13.3638V5.20384C5.58594 4.8064 5.9085 4.48384 6.30594 4.48384ZM4.14508 5.20383C4.14508 4.80639 3.82252 4.48383 3.42508 4.48383C3.02764 4.48383 2.70508 4.80639 2.70508 5.20383V13.3638C2.70508 13.7613 3.02764 14.0838 3.42508 14.0838C3.82252 14.0838 4.14508 13.7613 4.14508 13.3638V5.20383Z" fill="#AF3131"/>
                    </svg>
                    <div className={classes.info_model_btn_overlay} onMouseDown={mouseDownDelete} onMouseUp={onDelete}></div>
                </HoverComponent>
            </div>
    )
}

export default Delete;