import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeActivePopup, selectPopups } from '../../redux/features/popups/popupsSlice';
import {createUseStyles} from "react-jss";
import { selectTranslation } from '../../redux/features/language/languageSlice';
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
    alert_status_done:{
        background: '#BAE51F'
    },
    alert_status_error:{
        background: '#AF3131'
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

const CompleteMessage = props => {
    let popups = useSelector(selectPopups);
    let translation = useSelector(selectTranslation);
    let doneText = translation[popups.completeMessage.data];
    let positionX = popups.completeMessage.positionX;
    let type = popups.completeMessage.type;
    let doneDiv = useRef(null);
    let isPositionRight = positionX == "right";
    let dispatch = useDispatch();
    let [isShow, setShow] = useState(true);

    const variants = {
        hidden: {
            transform: isPositionRight ? "translateX(100%)" : "translateX(100%)"
        },
        visible: {
            transform: "translateX(0)"
        }
    }

    useEffect(() => {
        let timeoutId = setTimeout(() => setShow(!isShow), 4700);
        let timeoutId_1 = setTimeout(() => dispatch(closeActivePopup({name: "completeMessage"})), 5000);

        return () => {
            clearTimeout(timeoutId);
            clearTimeout(timeoutId_1);
        }
    }, []);

    const classes = useStyle();

return (
    <AnimatePresence>
        {
            isShow && 
            <motion.div exit={{ transform: isPositionRight ? "translateX(100%)" : "translateX(100%)" }} animate={ "visible" } initial={ "hidden" } variants={ variants } className={cx(classes.alert_status_wr, {[classes.alert_status_done]:!type || type == 'complete', [classes.alert_status_error]:type == 'error', [classes.alert_status_left]:!isPositionRight, [classes.alert_status_right]:isPositionRight})} ref={doneDiv} >
                <img className={classes.alert_status_icon} src="/src_designer/images/icon_check.svg" />
                { doneText }
            </motion.div>
        }
    </AnimatePresence>
)
            
}

export default CompleteMessage;