import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { planner } from '../../initR2D';
import { selectActiveControlPanelMode } from '../../redux/features/control/controlPanelSlice';
import { selectMetrics } from '../../redux/features/metrics/metricsSLice';
import { selectActiveViewMode } from '../../redux/features/viewMode/viewModeSlice';
import { useTranslation } from '../../api/hooks/useTranslation';

const help_bot_item = {
  display: 'flex',
  '& img': {
    margin: '0 5px',
  },
};

const useStyle = createUseStyles({
  help_bot_wrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 100,
    display: 'flex',
    justifyContent: 'center',
    fontSize: '12px',
    zIndex: 2,
    pointerEvents: 'none',
  },
  help_bot_wr: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    '@media screen and (max-width: 950px)': {
      display: 'none',
    },
  },
  help_bot_item: {
    extend: help_bot_item,
    alignItems: 'center',
    margin: '0 15px',
    color: '#2A3435',
  },
  help_bot_item_left: {
    extend: help_bot_item,
    alignItems: 'center',
    margin: '0 5px',
  },
  help_bot_item_right: {
    extend: help_bot_item,
    margin: '0 5px',
    flexDirection: 'column',
  },
  help_bot_item_children: {
    display: 'flex',
    alignItems: 'center',
    '&:first-child': {
      marginBottom: 5,
    },
  },
  help_bot_item_children_elem: {
    display: 'flex',
    alignItems: 'center',
  },
});

const Tips = (props) => {
  const classes = useStyle();
  const translation = useTranslation();
  const activeViewMode = useSelector(selectActiveViewMode);
  const activeControlPanelMode = useSelector(selectActiveControlPanelMode);

  const [keyBoardHelperTips, setKeyBoardHelperTipsShow] = useState(false);
  const [plannerConstrEvent, setPlannerConstrEvent] = useState(null);
  const [rulerActiveState, setRulerActiveState] = useState('');

  const metric = useSelector(selectMetrics);

  const onKeyBoardHelperTipsHide = (e) => setKeyBoardHelperTipsShow(false);

  const onTipTabShow = (e) => setPlannerConstrEvent(e.data.status);

  const onChangeRulerTips = (e) => setRulerActiveState(e.data);

  useEffect(() => {
    if (activeViewMode !== 'constr') setKeyBoardHelperTipsShow(false);
    planner.apiConstr.addEventListener(
      planner.apiConstr.KEYBOARD_HELPER_HIDE,
      onKeyBoardHelperTipsHide
    );
    return () =>
      planner.apiConstr.removeEventListener(
        planner.apiConstr.KEYBOARD_HELPER_HIDE,
        onKeyBoardHelperTipsHide
      );
  }, [activeViewMode, activeControlPanelMode]);

  useEffect(() => {
    planner.apiConstr.addEventListener(planner.apiConstr.BOTTOM_HELPER_TAB_BTN, onTipTabShow);
    planner.apiConstr.addEventListener(planner.apiConstr.RULER_TIPS_CHANGE, onChangeRulerTips);
    planner.scene.addEventListener(planner.scene.RULER_TIPS_CHANGE, onChangeRulerTips);

    return () => {
      planner.apiConstr.removeEventListener(planner.apiConstr.BOTTOM_HELPER_TAB_BTN, onTipTabShow);
      planner.apiConstr.removeEventListener(planner.apiConstr.RULER_TIPS_CHANGE, onChangeRulerTips);
      planner.scene.removeEventListener(planner.scene.RULER_TIPS_CHANGE, onChangeRulerTips);
    };
  }, []);

  return (
    <div className={classes.help_bot_wrap}>
      <AnimatePresence>
        {rulerActiveState ? (
          rulerActiveState == 'rulerCreate' || rulerActiveState == 'rulerAlignerMove' ? (
            <motion.div
              initial={{ transform: 'translateY(110%)' }}
              animate={{ transform: 'translateY(0%)' }}
              exit={{ transform: 'translateY(110%)' }}
              transition={{ duration: 0.3 }}
              key={'helper_ruler_create'}
              className={classes.help_bot_wrap}
            >
              <div className={classes.help_bot_wr}>
                <div className={classes.help_bot_item}>
                  <div>{translation['TIP_MOVE_WITHOUT_SNAP']}</div>
                  <img src="/src_designer/images/help/ctrl_mouse_left_2.svg" />
                </div>
              </div>
            </motion.div>
          ) : rulerActiveState == 'rulerLineSelect' || rulerActiveState == 'rulerAlignerSelect' ? (
            <motion.div
              initial={{ transform: 'translateY(110%)' }}
              animate={{ transform: 'translateY(0%)' }}
              exit={{ transform: 'translateY(110%)' }}
              transition={{ duration: 0.3 }}
              key={rulerActiveState}
              className={classes.help_bot_wrap}
            >
              <div className={classes.help_bot_wr}>
                <div className={classes.help_bot_item}>
                  <div>{translation['TIP_MOVE_OBJECT']}</div>
                  <img src="/src_designer/images/help/keyboard_move_object_new_2.svg" />
                </div>
                <div className={classes.help_bot_item}>
                  <div>{translation['TIP_MOVE_WITHOUT_SNAP']}</div>
                  <img src="/src_designer/images/help/ctrl_mouse_left_2.svg" />
                </div>
              </div>
            </motion.div>
          ) : null
        ) : activeViewMode == 'view2d' ? (
          activeControlPanelMode == 'furniture' || activeControlPanelMode == 'decor' ? (
            <motion.div
              initial={{ transform: 'translateY(110%)' }}
              animate={{ transform: 'translateY(0%)' }}
              exit={{ transform: 'translateY(110%)' }}
              transition={{ duration: 0.3 }}
              key={'helper_view2d_furniture'}
              className={classes.help_bot_wrap}
            >
              <div className={classes.help_bot_wr}>
                <div className={classes.help_bot_item}>
                  <div>{translation['TEXT_DRAG_SCENE']}</div>
                  <img src="/src_designer/images/help/mouse_right_click.svg" />
                </div>
              </div>
            </motion.div>
          ) : activeControlPanelMode == 'selectedModel' ||
            activeControlPanelMode == 'selectedGroup' ? (
            <motion.div
              initial={{ transform: 'translateY(110%)' }}
              animate={{ transform: 'translateY(0%)' }}
              exit={{ transform: 'translateY(110%)' }}
              transition={{ duration: 0.3 }}
              key={'helper_view2d_selectedModel'}
              className={classes.help_bot_wrap}
            >
              <div className={classes.help_bot_wr}>
                <div className={classes.help_bot_item}>
                  <div>{translation['TIP_MOVE_OBJECT']}</div>
                  <img src="/src_designer/images/help/keyboard_move_object_new_2.svg" />
                </div>
                <div className={classes.help_bot_item}>
                  <div>{translation['TIP_MOVE_WITHOUT_SNAP']}</div>
                  <img src="/src_designer/images/help/ctrl_mouse_left_2.svg" />
                </div>
              </div>
            </motion.div>
          ) : activeControlPanelMode == 'selectedCover' ||
            activeControlPanelMode == 'selectedOtherConstrParts' ? (
            <motion.div
              initial={{ transform: 'translateY(110%)' }}
              animate={{ transform: 'translateY(0%)' }}
              exit={{ transform: 'translateY(110%)' }}
              transition={{ duration: 0.3 }}
              key={'helper_view2d_selectedCover'}
              className={classes.help_bot_wrap}
            >
              <div className={classes.help_bot_wr}>
                <div className={classes.help_bot_item}>
                  <div>{translation['TIP_MOVE_MATERIAL']}</div>
                  <img src="/src_designer/images/help/keyboard_move_object_new_2.svg" />
                </div>
              </div>
            </motion.div>
          ) : null
        ) : activeViewMode == 'view3d' ? (
          activeControlPanelMode == 'furniture' || activeControlPanelMode == 'decor' ? (
            <motion.div
              initial={{ transform: 'translateY(110%)' }}
              animate={{ transform: 'translateY(0%)' }}
              exit={{ transform: 'translateY(110%)' }}
              transition={{ duration: 0.3 }}
              key={'helper_view3d_furniture'}
              className={classes.help_bot_wrap}
            >
              <div className={classes.help_bot_wr}>
                <div className={classes.help_bot_item}>
                  <div>{translation['TIP_ROTATE_CAMERA']}</div>
                  <img src="/src_designer/images/help/mouse_left_click.svg" />
                </div>
                <div className={classes.help_bot_item}>
                  <div>{translation['TEXT_DRAG_SCENE']}</div>
                  <img src="/src_designer/images/help/mouse_right_click.svg" />
                </div>
              </div>
            </motion.div>
          ) : activeControlPanelMode == 'selectedModel' ||
            activeControlPanelMode == 'selectedGroup' ? (
            <motion.div
              initial={{ transform: 'translateY(110%)' }}
              animate={{ transform: 'translateY(0%)' }}
              exit={{ transform: 'translateY(110%)' }}
              transition={{ duration: 0.3 }}
              key={'helper_view3d_selectedModel'}
              className={classes.help_bot_wrap}
            >
              <div className={classes.help_bot_wr}>
                <div className={classes.help_bot_item}>
                  <div>{translation['TIP_MOVE_OBJECT']}</div>
                  <img src="/src_designer/images/help/keyboard_move_object_new_2.svg" />
                </div>
                <div className={classes.help_bot_item}>
                  <div>{translation['TIP_MOVE_WITHOUT_SNAP']}</div>
                  <img src="/src_designer/images/help/ctrl_mouse_left_2.svg" />
                </div>
              </div>
            </motion.div>
          ) : activeControlPanelMode == 'selectedWall' ||
            activeControlPanelMode == 'selectedCover' ||
            activeControlPanelMode == 'selectedOtherConstrParts' ? (
            <motion.div
              initial={{ transform: 'translateY(110%)' }}
              animate={{ transform: 'translateY(0%)' }}
              exit={{ transform: 'translateY(110%)' }}
              transition={{ duration: 0.3 }}
              key={'helper_view3d_selectedWall'}
              className={classes.help_bot_wrap}
            >
              <div className={classes.help_bot_wr}>
                <div className={classes.help_bot_item}>
                  <div>{translation['TIP_MOVE_MATERIAL']}</div>
                  <img src="/src_designer/images/help/keyboard_move_object_new_2.svg" />
                </div>
              </div>
            </motion.div>
          ) : null
        ) : activeViewMode == 'constr' ? (
          keyBoardHelperTips ? (
            <motion.div
              initial={{ transform: 'translateY(110%)' }}
              animate={{ transform: 'translateY(0%)' }}
              exit={{ transform: 'translateY(110%)' }}
              transition={{ duration: 0.3 }}
              key={'helper_keyBoardHelperTips_true'}
              className={classes.help_bot_wrap}
            >
              <div className={classes.help_bot_wr}>
                <div className={classes.help_bot_item_left}>
                  <img src="/src_designer/images/help/keyboard_move_object_new_2.svg" />
                </div>
                +
                <div className={classes.help_bot_item_right}>
                  <div className={classes.help_bot_item_children}>
                    <img src="/src_designer/images/help/shiftTip.svg" />
                    <div>
                      {translation['TIP_BOTTOM_MOVE']} {metric.active != 'ft' ? '1 mm' : '1/16"'}
                    </div>
                  </div>
                  <div className={classes.help_bot_item_children}>
                    <div className={classes.help_bot_item_children_elem}>
                      <img src="/src_designer/images/help/shiftTip.svg" />
                    </div>
                    +
                    <div className={classes.help_bot_item_children_elem}>
                      <img src="/src_designer/images/help/ctrl.svg" />
                      <div>
                        {translation['TIP_BOTTOM_MOVE']} {metric.active != 'ft' ? '10 cm' : "1'"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ transform: 'translateY(110%)' }}
              animate={{ transform: 'translateY(0%)' }}
              exit={{ transform: 'translateY(110%)' }}
              transition={{ duration: 0.3 }}
              key={'helper_keyBoardHelperTips_true'}
              className={classes.help_bot_wrap}
            >
              <div className={classes.help_bot_wr}>
                <div className={classes.help_bot_item}>
                  <div>{translation['TEXT_DRAG_SCENE']}</div>
                  <img src="/src_designer/images/help/mouse_right_click.svg" />
                </div>
                {plannerConstrEvent ? (
                  <div className={classes.help_bot_item}>
                    <div>{translation['TEXT_GO_TO_SIZE_INPUT']}</div>
                    <img src="/src_designer/images/help/tab.svg" />
                  </div>
                ) : null}
              </div>
            </motion.div>
          )
        ) : activeViewMode == 'viewWalk' ? (
          <motion.div
            initial={{ transform: 'translateY(110%)' }}
            animate={{ transform: 'translateY(0%)' }}
            exit={{ transform: 'translateY(110%)' }}
            transition={{ duration: 0.3 }}
            key={'helper_viewWalk'}
            className={classes.help_bot_wrap}
          >
            <div className={classes.help_bot_item}>
              <div>{translation['TIP_WALK']}</div>
              <img src="/src_designer/images/help/keyboard_move_object_new_2.svg" />
            </div>
            <div className={classes.help_bot_item}>
              <div>{translation['TIP_ROTATE_CAMERA']}</div>
              <img src="/src_designer/images/help/mouse_left_click.svg" />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Tips;
