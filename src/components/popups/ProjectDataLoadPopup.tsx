import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeActivePopup, selectPopups } from '../../redux/features/popups/popupsSlice';
import {createUseStyles} from "react-jss";
import cx from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';

const useStyle = createUseStyles({
    alert_status_wr:{
        position: 'absolute',
        top: 34,
        fontSize: 12,
        color:'#2A3435',
        right: 0,
        padding: '7px 11px',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
        borderRadius: 3,
        zIndex: 10000,
        pointerEvents: 'none'
    },
    alert_status_loading:{
        background: '#FFB400'
    },
    alert_status_done:{
        background: '#BAE51F'
    },
    alert_status_error: {
        background: '#ff0000',
        color: '#ffffff'
    },
    alert_status_icon:{
        width: 13,
        marginRight: 6
    },
    alert_status_left: {

    },
    alert_status_right: {

    }
});

const ProjectDataLoadPopup = props => {
    let dispatch = useDispatch();
    let popups = useSelector(selectPopups);
    let doneText = popups.projectDataLoadPopup.data;
    let positionX = popups.projectDataLoadPopup.positionX;
    let popupType = popups.projectDataLoadPopup.type;
    let doneDiv = useRef(null);
    let isPositionRight = positionX == "right";
    let [isShow, setShow] = useState(true);

    const variants = {
        hidden: {
            transform: isPositionRight ? "translateX(100%)" : "translateX(100%)"
        },
        visible: {
            transform: "translateX(0)"
        }
    }

    const classes = useStyle();

    useEffect(() => {
        let timeoutId, timeoutId_1;
        if(popupType == 'done' || popupType == 'error') {
            timeoutId = setTimeout(() => setShow(!isShow), 2700);
            timeoutId_1 = setTimeout(() => dispatch(closeActivePopup({name: "projectDataLoadPopup", })), 3000);
        }

        return () => {
            clearTimeout(timeoutId);
            clearTimeout(timeoutId_1);
        }
    }, [popupType])

return (
    <AnimatePresence>
        {
            isShow && 
            <motion.div exit={{ transform: isPositionRight ? "translateX(100%)" : "translateX(100%)" }} animate={ "visible" } initial={ "hidden" } variants={ variants } className={cx(classes.alert_status_wr, popupType == 'done' ? classes.alert_status_done : popupType == 'error' ? classes.alert_status_error  : classes.alert_status_loading, {[classes.alert_status_left]:!isPositionRight, [classes.alert_status_right]:isPositionRight})} ref={doneDiv} >
                {
                    popupType == 'done' ? <img className={classes.alert_status_icon} src="/src_designer/images/icon_check.svg" /> : null
                }
                { popupType == 'error' ? doneText + `(${R2D.commonSceneHelper.constructorHelper.notLoadedMaterialsCount + R2D.commonSceneHelper.productHelper.notLoadedMaterialsCount + R2D.commonSceneHelper.productHelper.notLoadedModelsCount})` : doneText}
            </motion.div>
        }
    </AnimatePresence>
)
            
}

export default ProjectDataLoadPopup;