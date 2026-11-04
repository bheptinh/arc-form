import { AnimatePresence, motion } from 'framer-motion';
import React, { forwardRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

import { planner } from '../../../initR2D';
import { changeUndoRedo } from '../../../redux/features/topPanel/topPanelSlice';
import {
  selectActiveViewModeData,
  selectActiveViewModeState,
  updateMaterialId,
} from '../../../redux/features/viewMode/viewModeSlice_legacy';
import Tooltip from '../../../shared-components/Tooltip';
import { useTranslation } from '../../../api/hooks/useTranslation';

const useStyle = createUseStyles({
  info_model_btn: {
    width: 32,
    height: 32,
    background: 'var(--color-white)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    borderRadius: 3,
    border: '1px solid var(--color-white)',
    position: 'relative',
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    '& img': {
      userSelect: 'none',
      pointerEvents: 'none',
    },
    '&:hover': {
      background: 'var(--color-surface-muted)',
    },
  },
  info_model_btn_overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

export const ClearRef = forwardRef(({ positionBtn }, ref) => (
  <Clear positionBtn={positionBtn} reference={ref} />
));

const Clear = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();

  const positionBtn = props.positionBtn;
  const currObj = planner.mih()._scene.currentView3DObject;

  const translation = useTranslation();

  const onClear = (e) => {
    planner.scene.clearCurrentConstruction();
    planner.scene.dispatchEvent(new Event(planner.scene.CLEAR_MATERIALS, {}));
    dispatch(changeUndoRedo());
  };

  return (
    <AnimatePresence>
      {currObj ? (
        <Tooltip content={translation['HINT_BUTTON_CLEAR_MATERIAL']} side="bottom">
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={classes.info_model_btn}
            ref={props.reference}
            style={{ left: positionBtn.x, top: positionBtn.y }}
          >
            <img src="/src_designer/images/icon_remove_pokrutya.svg" />
            <div className={classes.info_model_btn_overlay} onMouseUp={onClear}></div>
          </motion.div>
        </Tooltip>
      ) : null}
    </AnimatePresence>
  );
};

