import React, { useEffect } from 'react';
import {createUseStyles} from "react-jss";
import {useDispatch, useSelector} from 'react-redux';
import { AnimatePresence,motion } from 'framer-motion';

import { planner } from '../../initR2D';
import {
    selectActiveControlPanelMode,
    selectCategoryTreePanelStatus,
    selectControlPanelStatus,
    selectDynamicPanelStatus,
    updateDynamicPanelStatus,
    updateCategoryTreePanelStatus,
    selectDynamicToggleButtonStatus,
    selectActiveControlPanelCatagoryTreeShowStatus,
    selectPrevControlPanelMode
} from '../../redux/features/control/controlPanelSlice';

import ControlPanel from './parts/controlPanel/ControlPanel';
import DynamicPanel from './parts/dynamicPanel/DynamicPanel';
import CategoryTreePanel from './parts/CategoryTreePanel';
import DynamicPanelToggleButton from './parts/dynamicPanel/DynamicPanelToggleButton';


const useStyle = createUseStyles({
    left:{
        display: 'flex',
        position: 'relative',
        zIndex: 5,
        '&:hover .dynamicPanelHideBtn':{
            transform: 'translate(calc(-3px), -50%)'
        },
        width: 'auto'
    }
});
const LeftMain = props => {
    let dispatch = useDispatch();
    let categoryTreePanelStatus = useSelector(selectCategoryTreePanelStatus);
    let controlPanelStatus = useSelector(selectControlPanelStatus);
    let activeControlPanelMode = useSelector(selectActiveControlPanelMode);
    let dynamicPanelStatus = useSelector(selectDynamicPanelStatus);
    let dynamicToggleButtonStatus = useSelector(selectDynamicToggleButtonStatus);
    let activeControlPanelCatagoryTreeShowStatus = useSelector(selectActiveControlPanelCatagoryTreeShowStatus);
    let currOS = R2D.controller.getCurrentOS();
    let isCurrDeviceAPhone = currOS == "iOS" || currOS == "Android";
    let controlPanelKeyTimeout;

    let prevControlPanelMode = useSelector(selectPrevControlPanelMode);

    const classes = useStyle();

    useEffect(() => R2D.Storage.load("r2d_blueScreenPopup") && dispatch(updateDynamicPanelStatus(true)), []);

    useEffect(() => {
        planner.mih()._titlesTool.controlPanelToggle(controlPanelStatus);
        planner.scene.toggleControlPanelStatus(controlPanelStatus);

        if(controlPanelStatus) controlPanelKeyTimeout = setTimeout(() => planner.setSize(window.innerWidth - R2D.Viewers._instance.getOffsetWidthDueToOpenedPanels(), window.innerHeight), 600);
        else planner.setSize(window.innerWidth - R2D.Viewers._instance.getOffsetWidthDueToOpenedPanels(), window.innerHeight)

        planner.mih()._ruler3d.update();
        return () => clearTimeout(controlPanelKeyTimeout);
    }, [controlPanelStatus]);

    useEffect(() => {
        if(!activeControlPanelCatagoryTreeShowStatus) {
            if(categoryTreePanelStatus) {
                planner.mih()._titlesTool.categoryTreePanelToggle(false);
                planner.scene.toggleCategoryTreePanelStatus(false);
                R2D.Viewers._instance.toggleCategoryTreePanelNeedToOpenStatus(true);
                dispatch(updateCategoryTreePanelStatus(false));
            }
        } else {
            if(R2D.Viewers._instance.isCategoryTreePanelNeedToOpen && dynamicPanelStatus) {
                R2D.Viewers._instance.toggleCategoryTreePanelNeedToOpenStatus(false)
                dispatch(updateCategoryTreePanelStatus(true));
            }
        }
    }, [activeControlPanelMode]);

    useEffect(() => {
        if(
            (activeControlPanelMode == 'furniture' || activeControlPanelMode == 'decor' || activeControlPanelMode == 'replaceModel') 
            || 
            (prevControlPanelMode == 'furniture' || prevControlPanelMode == 'decor' || prevControlPanelMode == 'replaceModel')
        ) {
            planner.mih()._titlesTool.categoryTreePanelToggle(categoryTreePanelStatus);
            planner.scene.toggleCategoryTreePanelStatus(categoryTreePanelStatus);
            
            const start = performance.now();
            function repeat() {
                const now = performance.now();
                const plannerElement = document.getElementById('planner');
                if (plannerElement) {
                    const plannerElementHeight = plannerElement.offsetHeight;
                    planner.setSize(window.innerWidth - R2D.Viewers._instance.getOffsetWidthDueToOpenedPanels(), plannerElementHeight);

                    planner.mih()._ruler3d.update();
                    planner.mih()._ruler3d.appendFromConstructor(planner.mih()._constructor.getLines());
                    planner.mih()._ruler3d.findRules(planner.mih()._scene.currentView3DObject);

                    now - start < 600 && requestAnimationFrame(repeat);
                }
            }
            requestAnimationFrame(repeat);
        }
        
    }, [categoryTreePanelStatus]);

    useEffect(() => {
        planner.mih()._titlesTool.dynamicPanelToggle(dynamicPanelStatus);
        planner.scene.toggleDynamicPanelStatus(dynamicPanelStatus);

        if(dynamicPanelStatus && R2D.Viewers._instance.isCategoryTreePanelNeedToOpen) {
            R2D.Viewers._instance.toggleCategoryTreePanelNeedToOpenStatus(false)
            dispatch(updateCategoryTreePanelStatus(true));
        }

        const start = performance.now();
        function repeat() {
            const now = performance.now();
            const plannerElement = document.getElementById('planner');
            if (plannerElement) {
                const plannerElementHeight = plannerElement.offsetHeight;
                planner.setSize(window.innerWidth - R2D.Viewers._instance.getOffsetWidthDueToOpenedPanels(), plannerElementHeight);
                planner.mih()._ruler3d.update();

                if (now - start < 600) {
                    requestAnimationFrame(repeat);
                }
            }
        }
        requestAnimationFrame(repeat);
    }, [dynamicPanelStatus]);

    return (
        <div className={classes.left}>
            {controlPanelStatus ? <ControlPanel /> : null}

            {
                activeControlPanelMode != 'renderMake' && activeControlPanelMode != 'alignDrawing' && activeControlPanelMode != 'uploadModel' && dynamicToggleButtonStatus &&
                <DynamicPanelToggleButton />
            }

            <AnimatePresence>
                { 
                    categoryTreePanelStatus && 
                    activeControlPanelCatagoryTreeShowStatus && 
                    (
                        (activeControlPanelMode == 'furniture' || activeControlPanelMode == 'decor' || activeControlPanelMode == 'replaceModel') 
                        || 
                        (prevControlPanelMode == 'furniture' || prevControlPanelMode == 'decor' || prevControlPanelMode == 'replaceModel')
                    ) ?
                        <motion.div initial={{ width: 0 }} animate={!isCurrDeviceAPhone ? { width: 310 }: { width: 190 }} exit={{ width:  0}} transition={{ duration: 0.5,  ease: [0.19, 1, 0.22, 1] }} style={{position: 'relative'}}>
                            <CategoryTreePanel />
                        </motion.div>
                    : null
                }
            </AnimatePresence>
            <AnimatePresence>
                { 
                    dynamicPanelStatus ?
                    <motion.div initial={{ width: 0 }} animate={!isCurrDeviceAPhone?{ width: 310 }: {width: 190}} exit={{width: 0, overflow: 'hidden'}} transition={{ duration: 0.5,  ease: [0.19, 1, 0.22, 1] }} style={{position: 'relative'}}>
                        <DynamicPanel />
                    </motion.div> : null
                }
            </AnimatePresence>

        </div>
    )
}

export default LeftMain;