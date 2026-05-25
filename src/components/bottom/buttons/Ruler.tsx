import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUseStyles } from 'react-jss';
import {motion} from "framer-motion";

import { planner } from '../../../initR2D';
import { removeQuickPanelAll } from '../../../redux/features/quickPanels/quickPanelsSlice';
import {selectTranslation} from "../../../redux/features/language/languageSlice";

import HoverComponent from "../../left_new/parts/controlPanel/components/HoverComponent";


const useStyles = createUseStyles({
    btn_ruler:{
        cursor: 'pointer',
        background: '#fff',
        borderRadius: 3,
        border: '1px solid #fff',
        display: 'flex',
        justifyContent: 'center',
        height: '100%',
        alignItems: 'center',
        position: "relative",
        width: 30,
        marginRight: '1px',
        transition: 'background 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        '&:hover':{
            background: '#E9E9E9',
        }
    },
    btn_ruler_active:{
        background: '#B8E11F',
    }
})

const Ruler = props => {
    let dispatch = useDispatch();
    const classes = useStyles();
    let translation = useSelector(selectTranslation);
    let [plannerConstrEvent, setPlannerConstrEvent] = useState(null);
    let [activeRuller, setActiveRuller] = useState(false);

    let onRulerClick = e => {
        dispatch(removeQuickPanelAll());
        planner.addRuler();
    }

    const onRullerActive = e => setPlannerConstrEvent(e.data.status);

    useEffect(() => {
        setActiveRuller(plannerConstrEvent)
    }, [plannerConstrEvent]);

    useEffect(() => {
        planner.apiConstr.addEventListener(planner.apiConstr.RULLER_ACTIVE, onRullerActive);
        planner.scene.addEventListener(planner.scene.RULLER_ACTIVE, onRullerActive);
        return () => {
            planner.apiConstr.removeEventListener(planner.apiConstr.RULLER_ACTIVE, onRullerActive);
            planner.scene.removeEventListener(planner.scene.RULLER_ACTIVE, onRullerActive);
        }
    }, []);

    return(
        <motion.div
            initial={{ width: 0}}
            animate={{ width: 30}}
            exit={{ width: 0 }}
            transition={{ duration: 0.3}}
            className={activeRuller? classes.btn_ruler + ' ' + classes.btn_ruler_active : classes.btn_ruler} onClick={onRulerClick}>
            <HoverComponent hoverText={translation["HINT_BUTTON_ADD_RULER"]} hoverTextPositionX={'left'} hoverTextPositionY={'top'} >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path fillRule="evenodd" clipRule="evenodd" d="M19.756 4.56161L15.1134 0L14.1391 0.991668L16.8219 3.62773L16.28 4.17921L13.5972 1.54316L11.9314 3.23852L13.7615 5.03676L13.2196 5.58825L11.3895 3.79001L10.0117 5.19221L11.8247 6.97358L11.2828 7.52507L9.46985 5.7437L7.89163 7.34991L10.6072 10.0182L10.0654 10.5697L7.34975 7.9014L5.78844 9.49041L7.56362 11.2346L7.02174 11.7861L5.24656 10.0419L3.86871 11.4442L5.62674 13.1716L5.08486 13.7231L3.32683 11.9957L1.74863 13.6019L4.46461 16.2705L3.92274 16.822L1.20675 14.1534L0 15.3815L4.64253 19.9431L19.756 4.56161Z" fill="#2A3435"/>
                </svg>
            </HoverComponent>
        </motion.div>
    )
}

export default Ruler;