import { motion } from 'framer-motion';
import React, { useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

import { planner } from '../../initR2D';
import { setActivePopup } from '../../redux/features/popups/popupsSlice';
import {
  removeQuickPanel,
  selectQuickPanels,
} from '../../redux/features/quickPanels/quickPanelsSlice';
import { changeUndoRedo } from '../../redux/features/topPanel/topPanelSlice';
import { selectActiveViewMode } from '../../redux/features/viewMode/viewModeSlice';
import Tooltip from '../../shared-components/Tooltip';
import { useTranslation } from '../../api/hooks/useTranslation';

const useStyle = createUseStyles({
  info_model_pop_wrap: {
    position: 'absolute',
    zIndex: 9,
    display: 'flex',
    borderRadius: 3,
  },
  info_model_pop_item_cont: {
    display: 'flex',
    background: 'var(--color-white)',
    borderRadius: 3,
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
  },
  info_model_pop_item_wr: {
    width: 32,
    height: 32,
    borderRadius: 3,
    position: 'relative',

    '&:hover': {
      '& $info_model_more_wrap': {
        pointerEvents: 'auto',
      },
    },
  },
  info_model_pop_item: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    width: '100%',
    height: '100%',
    borderRadius: 3,
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    border: '1px solid var(--color-white)',
    '& img': {
      maxWidth: '70%',
      maxHeight: '70%',
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

const Delete = (props) => {
  const quickPanels = useSelector(selectQuickPanels);
  const position = quickPanels.delete.position;
  const dispatch = useDispatch();
  const translation = useTranslation();
  let mouseDown = false;
  const quickType = quickPanels.delete.type;
  const activeViewMode = useSelector(selectActiveViewMode);

  const classes = useStyle();

  const onMouseDown = (e) => (mouseDown = true);

  const onDelete = (e) => {
    mouseDown = false;
    if (quickType == 'deleteRuller') {
      if (activeViewMode == 'tileConfig') {
        const tileConfigurator = planner.scene.getConfigurator();
        const tileEditor = tileConfigurator.getTileEditor();
        tileEditor.state.btnDeleteListener && tileEditor.state.btnDeleteListener();
      } else {
        if (planner.scene.getSelectedRuler())
          planner.scene.delRuler(planner.scene.getSelectedRuler());
        else {
          planner.constr.deleteSelected();
          WC.SFK.state.hideInputs();
        }
      }
      dispatch(changeUndoRedo());
      dispatch(removeQuickPanel({ name: 'delete' }));
    } else {
      dispatch(setActivePopup({ name: 'confirm', type: quickType }));
    }
  };

  const mainDiv = useRef(null);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.3 }}
      key={'delete'}
      className={classes.info_model_pop_wrap}
      style={{ left: position.x, top: position.y }}
    >
      <div className={classes.info_model_pop_item_cont}>
        <div className={classes.info_model_pop_item_wr} ref={mainDiv}>
          <Tooltip content={translation['HINT_BUTTON_DELETE']} side="bottom">
            <div className={classes.info_model_pop_item}>
              <img src="/src_designer/images/icon_trash.svg" />
              <div
                className={classes.info_model_btn_overlay}
                onMouseDown={onMouseDown}
                onMouseUp={onDelete}
              ></div>
            </div>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
};

export default Delete;
