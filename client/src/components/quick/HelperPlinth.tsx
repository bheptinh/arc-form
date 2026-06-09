import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../initR2D';
import {
  changeActiveControlPanelMode,
  selectActiveControlPanelModeData,
  selectControlPanelData,
  selectPrevControlPanelMode,
} from '../../redux/features/control/controlPanelSlice';
import {
  removeQuickPanelAll,
  selectQuickPanels,
} from '../../redux/features/quickPanels/quickPanelsSlice';
import { ClearRef } from './components/Clear';
import { DragPanelButtonRef } from './components/DragPanelButton';
import { HiddenRef } from './components/Hidden';
import { HideRef } from './components/Hide';
import { RotateRef } from './components/Rotate';

const useStyle = createUseStyles({
  info_model_pop_wrap: {
    position: 'absolute',
    zIndex: 1,
    display: 'flex',
    '& img': {
      userSelect: 'none',
      pointerEvents: 'none',
    },
  },
  info_model_pop_wr: {
    position: 'absolute',
    transform: 'translateX(-50%)',
  },
  info_model_bottom: {
    background: '#fff',
    borderRadius: 3,
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    display: 'flex',
    overflow: 'hidden',
  },
  info_model_height: {
    display: 'none',
    position: 'absolute',
    top: 0,
    background: '#ffffff',
    fontSize: 17,
    border: '1px solid #000',
    padding: 5,
    width: 'max-content',
    borderRadius: 6,
    overflow: 'hidden',
    zIndex: 9,
    left: '50%',
  },
});

const HelperPlinth = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const quickPanels = useSelector(selectQuickPanels);
  const position = quickPanels.helper_plinth.position;

  const controlPanelData = useSelector(selectControlPanelData);
  const prevControlPanelMode = useSelector(selectPrevControlPanelMode);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);

  const btnClear = useRef(null);
  const btnRotate = useRef(null);
  const info_bottom = useRef(null);
  const textFieldInfo = useRef(null);
  const btnDragPanel = useRef(null);
  const mainDiv = useRef(null);
  const btnHide = useRef(null);

  const [typeToHide, setTypeToHide] = useState(
    R2D.scene.currentConstructorElementData?.type == 'topFrame' ||
      R2D.scene.currentConstructorElementData?.type == 'bottomFrame'
      ? 'frames'
      : R2D.scene.currentConstructorElementData?.type + 's'
  );
  const isProductPartialVisible = R2D.scene.currentConstructorElementData?.partialVisible;

  const refs = useRef({ textFieldInfo, btnRotate, mainDiv, btnDragPanel });

  const [panelPosition, setPanelPosition] = useState(position);

  const hideButtonsRotate = () => {
    textFieldInfo.current.style.display = 'block';
    info_bottom.current.style.display = 'none';
  };

  const showButtonsRotate = () => {
    textFieldInfo.current.style.display = 'none';
    info_bottom.current.style.display = 'flex';
  };

  const onClickPartialVisible = (e) => {
    planner.scene.makeElementVisible(
      typeToHide,
      planner.scene.getCurrentConstructorElementData().wall.id
    );
    planner.mih().unsetActiveObject();
    const furnitureData = planner.getCatalogProducts();
    if (!activeControlPanelData.isInControlPanel) {
      if (prevControlPanelMode) {
        dispatch(changeActiveControlPanelMode({ mode: prevControlPanelMode }));
      } else {
        dispatch(
          changeActiveControlPanelMode({
            mode: 'furniture',
            data:
              controlPanelData['furniture'].history.length < 1
                ? {
                    type: 'catalog',
                    addType: 'main',
                    id: null,
                    lastSavedScroll: 0,
                    data: furnitureData,
                  }
                : null,
          })
        );
      }
    }
    dispatch(removeQuickPanelAll());
  };

  useEffect(() => {
    setTypeToHide(
      R2D.scene.currentConstructorElementData
        ? R2D.scene.currentConstructorElementData.type == 'topFrame' ||
          R2D.scene.currentConstructorElementData.type == 'bottomFrame'
          ? 'frames'
          : R2D.scene.currentConstructorElementData.type + 's'
        : ''
    );
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.2 }}
      className={classes.info_model_pop_wrap}
      ref={mainDiv}
      style={{
        left: panelPosition.y < 72 ? panelPosition.x + 50 : panelPosition.x,
        top: panelPosition.y < 72 ? 32 : panelPosition.y,
      }}
    >
      <AnimatePresence mode="wait">
        {isProductPartialVisible ? (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
            key={'isProductPartialVisible'}
            className={classes.info_model_pop_wrap}
          >
            <div className={classes.info_model_pop_wr}>
              <div className={classes.info_model_bottom} ref={info_bottom}>
                <DragPanelButtonRef ref={refs} changePosition={setPanelPosition} />
                <HiddenRef
                  ref={refs}
                  onClick={onClickPartialVisible}
                  isPartialVisible={isProductPartialVisible}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
            key={'isProductPartialNotVisible'}
            className={classes.info_model_pop_wrap}
          >
            <div className={classes.info_model_pop_wr}>
              <div className={classes.info_model_bottom} ref={info_bottom}>
                <DragPanelButtonRef ref={refs} changePosition={setPanelPosition} />
                <ClearRef positionBtn={{ x: 0, y: 0 }} ref={btnClear} />
                {!typeToHide || typeToHide == 'frames' ? null : (
                  <HideRef typeToHide={typeToHide} ref={btnHide} />
                )}
              </div>
            </div>
            <div className={classes.info_model_height} ref={textFieldInfo}></div>
            <RotateRef
              radius={typeToHide == 'frames' || typeToHide == 'cap' ? 50 : 58}
              ref={refs}
              position={panelPosition}
              hide={hideButtonsRotate}
              show={showButtonsRotate}
              positionBtn={{ y: 0, x: typeToHide == 'frames' || typeToHide == 'cap' ? 50 : 58 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HelperPlinth;
