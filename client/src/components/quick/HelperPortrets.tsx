import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../initR2D';
import { selectIs3DRotationModeActive } from '../../redux/features/common/commonSlice';
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
import { changeUndoRedo } from '../../redux/features/topPanel/topPanelSlice';
import { DeleteRef } from './components/Delete';
import { DragPanelButtonRef } from './components/DragPanelButton';
import { ElevateRef } from './components/Elevate';
import { HiddenRef } from './components/Hidden';
import { HideRef } from './components/Hide';
import { LockRef } from './components/Lock';
import More from './components/More';
import Replace from './components/Replace';
import { RotateRef } from './components/Rotate';
import { useTranslation } from '../../api/hooks/useTranslation';

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
    display: 'flex',
    position: 'absolute',
    transform: 'translateX(-50%)',
  },

  info_model_height: {
    display: 'none',
    position: 'absolute',
    top: 0,
    background: 'var(--color-white)',
    fontSize: 17,
    border: '1px solid var(--color-black)',
    padding: 5,
    width: 'max-content',
    borderRadius: 6,
    overflow: 'hidden',
    zIndex: 9,
    left: '50%',
    transform: 'translateX(-50%)',
  },
  info_model_bottom__text: {
    display: 'flex',
  },
  info_model_pop_item_cont: {
    display: 'flex',
    background: 'var(--color-white)',
    borderRadius: 3,
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
  },
  info_model_pop_item_cont_text: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px',
    background: '#f0f0f0',
    whiteSpace: 'nowrap',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  info_model_pop_item_wr: {
    width: 32,
    height: 32,
    position: 'relative',
    '&:hover': {
      '& $info_model_more_wr': {
        transform: 'translateY(0%)',
      },
      '& $info_model_more_wrap': {
        pointerEvents: 'auto',
      },
    },
  },
});

const HelperPortrets = (props) => {
  const dispatch = useDispatch();
  const quickPanels = useSelector(selectQuickPanels);
  const position = quickPanels.helper_portrets.position;

  const controlPanelData = useSelector(selectControlPanelData);
  const prevControlPanelMode = useSelector(selectPrevControlPanelMode);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);

  const translation = useTranslation();

  const is3DModeRotationActive = useSelector(selectIs3DRotationModeActive);

  const [panelPosition, setPanelPosition] = useState(position);
  const [isReplaceModeActive, setIsReplaceModeActive] = useState(false);
  const [isProductLocked, setIsProductLocked] = useState(
    R2D.scene.currentSceneObject?.isLockedOnScene
  );
  const isProductPartialVisible = R2D.scene.currentSceneObject?.partialVisible;

  const textFieldInfo = useRef(null);
  const mainDiv = useRef(null);
  const btnDelete = useRef(null);
  const btnMoveY = useRef(null);
  const btnRotate = useRef(null);
  const moreBtn = useRef(null);
  const btnHide = useRef(null);
  const btnDragPanel = useRef(null);
  const info_bottom = useRef(null);
  const refs = useRef({ btnMoveY, textFieldInfo, mainDiv, btnRotate, btnDragPanel });

  const onDeleteClick = (e) => {
    planner.scene.removeCurrentModel();
    dispatch(removeQuickPanelAll());
    const furnitureData = planner.getCatalogProducts();
    prevControlPanelMode
      ? dispatch(changeActiveControlPanelMode({ mode: prevControlPanelMode }))
      : dispatch(
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
    dispatch(changeUndoRedo());
  };

  const hideButtonsElevate = () => {
    if (info_bottom.current) info_bottom.current.style.display = 'none';
    if (btnRotate.current) btnRotate.current.style.display = 'none';
  };
  const showButtonsElevate = () => {
    if (info_bottom.current) info_bottom.current.style.display = 'flex';
    if (btnRotate.current) btnRotate.current.style.display = 'flex';
  };

  const classes = useStyle();

  const hideObectQuickPanel = (e) => {
    if (mainDiv.current) mainDiv.current.style.display = 'none';
  };

  const showObectQuickPanel = (e) => {
    if (mainDiv.current) mainDiv.current.style.display = 'flex';
  };

  const degreesShowStart = (e) => {
    if (textFieldInfo.current) {
      const { mouse, axis } = e.data;
      textFieldInfo.current.style.display = 'block';
      textFieldInfo.current.textContent = '0°';
      textFieldInfo.current.style.left = mouse.clientX + 40 + 'px';
      textFieldInfo.current.style.top = mouse.clientY - 30 + 'px';
    }
    planner.apiScene.addEventListener(planner.apiScene.ROTATING_OBJECT, degreesShow);
  };

  const degreesShow = (e) => {
    if (!textFieldInfo.current) return;
    textFieldInfo.current.textContent = e.data.angle + '°';
    const mouse = e.data.mouse;
    textFieldInfo.current.style.left = mouse.clientX + 40 + 'px';
    textFieldInfo.current.style.top = mouse.clientY - 30 + 'px';
  };

  const degreesShowStop = (e) => {
    textFieldInfo.current.style.display = 'none';
    planner.apiScene.removeEventListener(planner.apiScene.ROTATING_OBJECT, degreesShow);
    R2D.scene.history.saveState();
    dispatch(changeUndoRedo());
  };

  const hideButtonsRotate = () => {
    if (!btnMoveY.current || !textFieldInfo.current) return;
    textFieldInfo.current.style.display = 'block';
    info_bottom.current.style.display = 'none';
    btnMoveY.current.style.display = 'none';
  };

  const showButtonsRotate = () => {
    if (!btnMoveY.current || !textFieldInfo.current) return;
    textFieldInfo.current.style.display = 'none';
    info_bottom.current.style.display = 'flex';
    btnMoveY.current.style.display = 'block';
  };

  const onClickReplace = (e) => setIsReplaceModeActive(!isReplaceModeActive);

  const onClickLock = (e) => {
    R2D.scene.currentSceneObject?.setIsLockedOnScene(
      !R2D.scene.currentSceneObject?.isLockedOnScene
    );
    if (R2D.scene.currentSceneObject?.isLockedOnScene) {
      planner.mih()._ruler3d.clear();
      planner.mih()._ruler3d.update();
      planner.mih()._currentViewer.rendererUpdate();
      const furnitureData = planner.getCatalogProducts();
      prevControlPanelMode
        ? dispatch(changeActiveControlPanelMode({ mode: prevControlPanelMode }))
        : dispatch(
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
    } else {
      planner.mih()._ruler3d.update();
      planner.mih()._ruler3d.appendFromConstructor(planner.mih()._constructor.getLines());
      planner.mih()._ruler3d.findRules(R2D.scene.currentView3DObject);
      dispatch(changeActiveControlPanelMode({ mode: 'selectedModel', data: { type: 'main' } }));
    }

    setIsProductLocked(!isProductLocked);
  };

  const onClickPartialVisible = (e) => {
    planner.scene.makeElementVisible('objects', planner.scene.getCurrentSceneObject().objectId);
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
    planner.apiScene.addEventListener(
      planner.apiScene.HIDE_OBJECT_QUICK_PANEL,
      hideObectQuickPanel
    );
    planner.apiScene.addEventListener(
      planner.apiScene.SHOW_OBJECT_QUICK_PANEL,
      showObectQuickPanel
    );

    planner.apiScene.addEventListener(planner.apiScene.START_ROTATING_OBJECT, degreesShowStart);
    planner.apiScene.addEventListener(planner.apiScene.STOP_ROTATING_OBJECT, degreesShowStop);

    return () => {
      planner.apiScene.removeEventListener(
        planner.apiScene.HIDE_OBJECT_QUICK_PANEL,
        hideObectQuickPanel
      );
      planner.apiScene.removeEventListener(
        planner.apiScene.SHOW_OBJECT_QUICK_PANEL,
        showObectQuickPanel
      );

      planner.apiScene.removeEventListener(
        planner.apiScene.START_ROTATING_OBJECT,
        degreesShowStart
      );
      planner.apiScene.removeEventListener(planner.apiScene.STOP_ROTATING_OBJECT, degreesShowStop);
    };
  }, []);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{ duration: 0.2 }}
        className={classes.info_model_pop_wrap}
        style={{
          left: panelPosition.y < 72 ? panelPosition.x + 50 : panelPosition.x,
          top: panelPosition.y < 72 ? 72 : panelPosition.y,
        }}
        ref={mainDiv}
      >
        <AnimatePresence mode="wait">
          {quickPanels.helper_portrets.visible ? (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
              className={classes.info_model_pop_wrap}
            >
              {isProductLocked ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.3 }}
                  key={'isProductLocked'}
                  className={classes.info_model_pop_wr}
                >
                  <div className={classes.info_model_bottom}>
                    <div className={classes.info_model_bottom__text}>
                      <DragPanelButtonRef ref={refs} changePosition={setPanelPosition} />
                      <div className={classes.info_model_pop_item_cont}>
                        <LockRef
                          ref={refs}
                          onClick={onClickLock}
                          isLockedOnScene={isProductLocked}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : isProductPartialVisible ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.3 }}
                  key={'isProductPartialVisible'}
                  className={classes.info_model_pop_wr}
                >
                  <div className={classes.info_model_bottom}>
                    <div className={classes.info_model_bottom__text}>
                      <DragPanelButtonRef ref={refs} changePosition={setPanelPosition} />
                      <div className={classes.info_model_pop_item_cont}>
                        <HiddenRef
                          ref={refs}
                          onClick={onClickPartialVisible}
                          isPartialVisible={isProductPartialVisible}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : isReplaceModeActive ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 0.3 }}
                  key={'isReplaceModeActive'}
                  className={classes.info_model_pop_wr}
                >
                  <div className={classes.info_model_bottom}>
                    <div className={classes.info_model_bottom__text}>
                      <DragPanelButtonRef ref={refs} changePosition={setPanelPosition} />
                      <div className={classes.info_model_pop_item_cont}>
                        <p className={classes.info_model_pop_item_cont_text}>
                          {translation['HINT_BUTTON_REPLACE_MODE_ACTIVE']}
                        </p>
                      </div>
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
                      <div className={classes.info_model_pop_item_cont}>
                        <DeleteRef
                          positionBtn={{ x: 0, y: 0 }}
                          ref={btnDelete}
                          onDelClick={onDeleteClick}
                        />

                        <div className={classes.info_model_pop_item_wr}>
                          <More
                            reference={moreBtn}
                            childrens={[
                              <Replace key={Math.random()} onClickReplace={onClickReplace} />,
                              <LockRef
                                key={Math.random()}
                                ref={refs}
                                onClick={onClickLock}
                                isLockedOnScene={isProductLocked}
                              />,
                              <HideRef typeToHide={'objects'} key={Math.random()} ref={btnHide} />,
                            ]}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <ElevateRef
                    setPanelPosition={setPanelPosition}
                    positionBtn={{ x: 0, y: -50 }}
                    showButtonsElevate={showButtonsElevate}
                    hideButtonsElevate={hideButtonsElevate}
                    ref={refs}
                  />
                  {is3DModeRotationActive ? null : (
                    <div className={classes.info_model_height} ref={textFieldInfo}></div>
                  )}
                  {is3DModeRotationActive ? null : (
                    <RotateRef
                      radius={58}
                      ref={refs}
                      position={panelPosition}
                      hide={hideButtonsRotate}
                      show={showButtonsRotate}
                      positionBtn={{ y: 0, x: 58 }}
                    />
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
      {is3DModeRotationActive ? (
        <div className={classes.info_model_height} ref={textFieldInfo}></div>
      ) : null}
    </div>
  );
};

export default HelperPortrets;
