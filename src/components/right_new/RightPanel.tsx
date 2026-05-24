import React from 'react';
import { useSelector } from 'react-redux';
import View2D from './viewModesButtons/View2D';
import View3D from './viewModesButtons/View3D';
import {createUseStyles} from 'react-jss'
import { selectActiveViewMode } from '../../redux/features/viewMode/viewModeSlice';
import Settings from './buttons/Settings';
import { selectImagePlanUploadedType } from '../../redux/features/constructor/constructorSlice';
import ImagePlan from './buttons/ImagePlan';
import { selectIsProjectBelongToLoggedUser, selectIsProjectOnlyView, selectIsThereHiddenElements } from '../../redux/features/common/commonSlice';
import HiddenElements from './buttons/HiddenElements';
import {AnimatePresence,motion} from "framer-motion";

const useStyles = createUseStyles({
    right_bar_cont:{
        position: 'absolute',
        right: 2,
        zIndex: 2,
        top: 0,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none'
    },
    right_bar_wr:{
        pointerEvents: 'auto',
        display: 'grid',
        gridGap: 2,
        justifyContent: 'end',
    },
    viewModes:{
        position: "relative",
        background: '#fff',
        borderRadius: 3,
        border: '2px solid #fff',
        boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)'
    },
    otherButtons:{
        display: 'grid',
        justifyContent: 'end',
        gridGap: 2

    },
    viewModes_dropdown:{
        position: 'relative'
    },
    viewModes_dropdown_wr:{
        display: 'flex',
        left: 0,
        top: 0,
        transform: 'translateX(-100%)',
        position: 'absolute',
        transition: 'all .3s ease',
        zIndex: 1
    },
    viewModes_dropdown_hover:{
        '& > $viewModes_dropdown_wr':{
            transform: 'translateX(0%)',
            left: '100%',
            transition: 'all .3s ease'
        }
    },
    bar_dropdown_active:{
        position: 'relative',
        zIndex: 2
    }
});

const RightPanel = props => {
    let isImagePlanUploaded = useSelector(selectImagePlanUploadedType);
    let activeViewMode = useSelector(selectActiveViewMode);
    let isThereHiddenElements = useSelector(selectIsThereHiddenElements);
    let isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);
    let isProjectOnlyView = useSelector(selectIsProjectOnlyView);
    const classes = useStyles();

    return (
        <AnimatePresence mode="wait">
            {
                activeViewMode == 'constr' ?
                    <motion.div
                        initial={{ transform: 'translateX(110%)'}}
                        animate={{ transform: 'translateX(0%)'}}
                        exit={{ transform: 'translateX(110%)' }}
                        transition={{ duration: 0.3}}
                        key={'right_btns_constr'}
                        className={classes.right_bar_cont}>
                        <div className={classes.right_bar_wr}>
                            <div className={classes.otherButtons}>
                                {
                                    !isProjectBelongToLoggedUser && isProjectOnlyView ? null : <Settings />
                                }
                                {
                                    isImagePlanUploaded != null ? <ImagePlan /> : null
                                }
                            </div>
                        </div>
                    </motion.div>
                    :
                    <motion.div
                        initial={{ transform: 'translateX(110%)'}}
                        animate={{ transform: 'translateX(0%)'}}
                        exit={{ transform: 'translateX(110%)' }}
                        transition={{ duration: 0.3}}
                        key={'right_btns'}
                        className={classes.right_bar_cont}>
                        <div className={classes.right_bar_wr}>
                            <div className={classes.viewModes}>
                                <View2D />
                                <View3D />
                            </div>
                            <div className={classes.otherButtons}>
                                {
                                    isImagePlanUploaded != null ? <ImagePlan /> : null
                                }
                                {
                                    isThereHiddenElements ? <HiddenElements /> : null
                                }
                            </div>
                        </div>
                    </motion.div>
            }
        </AnimatePresence>
    )
}

export default RightPanel;