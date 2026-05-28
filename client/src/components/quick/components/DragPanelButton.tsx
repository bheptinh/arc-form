import React, { forwardRef } from 'react';
import {createUseStyles} from "react-jss";

const useStyle = createUseStyles({
    grabbing: {
        cursor: 'grabbing !important'
    },
    info_model_pop_move:{
        height: 32,
        borderRadius: "3px 0 0 3px",
        '& img':{
            height: '100%',
            borderRadius: "3px 0 0 3px",
        }
    }
});

export const DragPanelButtonRef = forwardRef(( { changePosition }, ref) => <DragPanelButton changePosition={changePosition} reference={ref} />);

const DragPanelButton = props => {

    const { btnDragPanel, mainDiv } = props.reference.current;

    let restBtnY, restBtnX = null;

    function onDragPanelStart(e) {

        document.querySelector("body").classList.add(classes.grabbing);
        mainDiv.current?.classList.add(classes.grabbing);
        document.addEventListener('mousemove', onDragPanelMove);
        document.addEventListener('mouseup', onDragPanelStopMove);
        document.addEventListener('touchmove', onDragPanelMove);
        document.addEventListener('touchend', onDragPanelStopMove);

        let mainDivRect  = mainDiv.current?.getBoundingClientRect().left;
        let viewportOffset = btnDragPanel.current?.getBoundingClientRect();
        let sdvig = mainDivRect - viewportOffset.left
        let top = viewportOffset.top;
        let left = viewportOffset.left;
        restBtnX = (e.clientX || e.touches[0].clientX) - left - sdvig;
        restBtnY = (e.clientY || e.touches[0].clientY) - top;
    }

    function onDragPanelMove(e) {
        if(!mainDiv.current) return;
        mainDiv.current.style.left = (e.clientX || e.touches[0].clientX) - restBtnX + "px"; 
        mainDiv.current.style.top = (e.clientY || e.touches[0].clientY) - restBtnY + 'px';
    }

    function onDragPanelStopMove(e) {
        document.querySelector("body").classList.remove(classes.grabbing);
        mainDiv.current?.classList.remove(classes.grabbing);
        document.removeEventListener('mousemove', onDragPanelMove);
        document.removeEventListener('mouseup', onDragPanelStopMove);
        if(!mainDiv.current) return;
        props.changePosition({x: +mainDiv.current.style.left.replace('px', ''), y: +mainDiv.current.style.top.replace('px', '')});
    };

    const classes = useStyle();

    return (
        <div className={classes.info_model_pop_move} onMouseDown={onDragPanelStart} onTouchStart={onDragPanelStart} ref={btnDragPanel}>
            <img src="/src_designer/images/icon_info_model_move.svg" />
        </div>
    )
}

export default DragPanelButton;