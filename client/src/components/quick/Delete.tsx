import React, {useRef} from 'react';
import { useSelector } from 'react-redux';
import { removeQuickPanel, selectQuickPanels } from '../../redux/features/quickPanels/quickPanelsSlice';
import { createUseStyles } from "react-jss";
import { useDispatch } from 'react-redux';
import { selectTranslation } from '../../redux/features/language/languageSlice';
import { setActivePopup } from '../../redux/features/popups/popupsSlice';
import HoverComponent from "../left_new/parts/controlPanel/components/HoverComponent";
import { motion } from "framer-motion";
import { planner } from '../../initR2D';
import { changeUndoRedo } from '../../redux/features/topPanel/topPanelSlice';
import { selectActiveViewMode } from '../../redux/features/viewMode/viewModeSlice';

const useStyle = createUseStyles({
    info_model_pop_wrap:{
        position: 'absolute',
        zIndex: 9,
        display: 'flex',
        borderRadius: 3,
    
    },
    info_model_pop_item_cont:{
        display: 'flex',
        background: '#fff',
        borderRadius: 3,
        boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    },
    info_model_pop_item_wr:{
        width: 32,
        height:32,
        borderRadius: 3,
        position: 'relative',

        '&:hover':{
            '& $info_model_more_wrap':{
                pointerEvents: 'auto'
            }
        }
    },
    info_model_pop_item:{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        width: '100%',
        height: '100%',
        borderRadius: 3,
        transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
        border: '1px solid #fff',
        '& img':{
            maxWidth: '70%',
            maxHeight: '70%',
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

const Delete = props => {
    let quickPanels = useSelector(selectQuickPanels);
    let position = quickPanels.delete.position;
    let dispatch = useDispatch();
    let translation = useSelector(selectTranslation);
    let mouseDown = false;
    let quickType = quickPanels.delete.type;
    let activeViewMode = useSelector(selectActiveViewMode);
    
    const classes = useStyle();

    let onMouseDown = e => mouseDown = true;

    let onDelete = e => {
        mouseDown = false;
        if(quickType == 'deleteRuller') {
            if(activeViewMode == "tileConfig") {
                let tileConfigurator = planner.scene.getConfigurator();
                let tileEditor = tileConfigurator.getTileEditor();
                tileEditor.state.btnDeleteListener && tileEditor.state.btnDeleteListener();
            }
            else {
                if (planner.scene.getSelectedRuler()) planner.scene.delRuler(planner.scene.getSelectedRuler());
                else {
                    planner.constr.deleteSelected();
                    WC.SFK.state.hideInputs();
                }
            }
            dispatch(changeUndoRedo());
            dispatch(removeQuickPanel({name: "delete"}));
        } else {
            dispatch(setActivePopup({name: 'confirm', type: quickType}));
        }
    }

    let mainDiv = useRef(null);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: .3}}
            key={'delete'}
            className={classes.info_model_pop_wrap} style={{left: position.x, top: position.y}}>
            <div className={classes.info_model_pop_item_cont}>
                <div className={classes.info_model_pop_item_wr} ref={mainDiv} >
                    <HoverComponent hoverText={translation["HINT_BUTTON_DELETE"]} >
                        <div className={classes.info_model_pop_item}>
                            <img src="/src_designer/images/icon_trash.svg"/>
                            <div className={classes.info_model_btn_overlay} onMouseDown={onMouseDown} onMouseUp={onDelete}></div>
                        </div>
                    </HoverComponent>
                </div>
            </div>
        </motion.div>
    )
}

export default Delete;