import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

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
import HoverComponent from '../left_new/parts/controlPanel/components/HoverComponent';
import { DeleteRef } from './components/Delete';
import { DragPanelButtonRef } from './components/DragPanelButton';
import { ElevateRef } from './components/Elevate';
import { HiddenRef } from './components/Hidden';
import { HideRef } from './components/Hide';
import { LockRef } from './components/Lock';
import More from './components/More';
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
      userDrag: 'none',
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
  info_model_pop_item_cont: {
    display: 'flex',
    background: '#fff',
    borderRadius: 3,
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
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
  info_model_pop_item: {
    position: 'relative',
    width: 32,
    height: 32,
    background: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    borderRadius: 3,
    border: '1px solid #fff',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    overflow: 'hidden',
    '& img': {
      maxWidth: '70%',
      maxHeight: '70%',
    },
    '& svg': {
      maxWidth: '70%',
      maxHeight: '70%',
    },
    '&:hover': {
      background: '#E9E9E9',
    },
  },
  icon_info_more: {
    position: 'absolute',
    width: 10,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  info_model_more_wrap: {
    top: 'calc(100% - 4px)',
    left: '-4px',
    width: '100%',
    padding: '4px',
    zIndex: -1,
    overflow: 'hidden',
    position: 'absolute',
    minWidth: 'fit-content',
    pointerEvents: 'none',
    paddingTop: 6,
  },
  info_model_more_wr: {
    transform: 'translateY(calc(-100% - 15px))',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    pointerEvents: 'auto',
    display: 'grid',
    background: '#fff',
    borderRadius: '3px',
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
  },
  info_model_more: {
    position: 'relative',
    width: 32,
    height: 32,
    background: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    borderRadius: 3,
    border: '1px solid #fff',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '& img': {
      maxWidth: '70%',
      maxHeight: '70%',
    },
    '&:hover': {
      background: '#E9E9E9',
    },
  },
  info_model_btn: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: '50%',
    border: '1px solid #000',
    background: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    '&:hover': {
      background: '#8fc32d',
    },
    '& img': {},
  },
  info_model_bottom__text: {
    display: 'flex',
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
    transform: 'translateX(-50%)',
  },
  info_model_btn_hover: {
    position: 'absolute',
    background: '#81e7ff',
    display: 'none',
    zIndex: 9,
    fontSize: 12,
    width: 'max-content',
    padding: '2px 7px',
  },
  info_model_btn_overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  info_model_main: {},
});

const HelperGroup = () => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const quickPanels = useSelector(selectQuickPanels);
  const position = quickPanels.helper_group.position;

  const info_bottom = useRef(null);

  const translation = useTranslation();

  const controlPanelData = useSelector(selectControlPanelData);
  const prevControlPanelMode = useSelector(selectPrevControlPanelMode);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);

  const [panelPosition, setPanelPosition] = useState(position);

  const [isProductLocked, setIsProductLocked] = useState(R2D.scene.currentGroup?.isLockedOnScene);
  const isProductPartialVisible = R2D.scene.currentGroup?.partialVisible;

  const [infoBottomPanelWidth, setInfoBottomPanelWidth] = useState(0);
  const [elevationActive, setElevationActive] = useState(false);

  const btnMoveY = useRef(null);
  const textFieldInfo = useRef(null);
  const btnRotate = useRef(null);
  const mainDiv = useRef(null);
  const btnDelete = useRef(null);
  const btnRef = useRef(null);
  const btnDragPanel = useRef(null);

  const refs = useRef({ btnMoveY, textFieldInfo, btnRotate, mainDiv, btnDragPanel });

  const hideButtonsElevate = () => {
    if (!info_bottom.current || !btnRotate.current) return;
    info_bottom.current.style.display = btnRotate.current.style.display = 'none';
    setElevationActive(true);
  };

  const showButtonsElevate = () => {
    if (!info_bottom.current || !btnRotate.current) return;
    info_bottom.current.style.display = btnRotate.current.style.display = 'flex';
    setElevationActive(false);
  };

  const hideButtonsRotate = () => {
    if (!info_bottom.current || !btnMoveY.current || !textFieldInfo.current) return;
    info_bottom.current.style.display = btnMoveY.current.style.display = 'none';
    textFieldInfo.current.style.display = 'block';
  };

  const showButtonsRotate = () => {
    if (!info_bottom.current || !btnMoveY.current || !textFieldInfo.current) return;
    info_bottom.current.style.display = btnMoveY.current.style.display = 'flex';
    textFieldInfo.current.style.display = 'none';
  };

  const onDeleteModel = (e) => {
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
  };

  const onClickLock = (e) => {
    const currGroup = R2D.scene.currentGroup;
    currGroup.isLockedOnScene = !currGroup.isLockedOnScene;
    if (currGroup.isLockedOnScene) {
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
      planner.mih()._ruler3d.findRules(currGroup);
      planner.mih()._currentViewer.rendererUpdate();
      dispatch(changeActiveControlPanelMode({ mode: 'selectedGroup', data: { type: 'main' } }));
    }

    setIsProductLocked(!isProductLocked);
  };

  const onClickPartialVisible = (e) => {
    planner.scene.makeElementVisible('groups', planner.scene.getCurrentGroup());
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
    info_bottom?.current && setInfoBottomPanelWidth(info_bottom?.current.offsetWidth);
  }, [info_bottom]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.3 }}
      className={classes.info_model_pop_wrap}
      style={{
        left: panelPosition.y < 72 ? panelPosition.x + 100 : panelPosition.x,
        top: panelPosition.y < 72 ? 72 : panelPosition.y,
      }}
      ref={mainDiv}
    >
      <AnimatePresence mode="wait">
        {quickPanels.helper_group.visible ? (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
            key={'helper_model_full'}
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
                  <div className={classes.info_model_bottom__text} ref={info_bottom}>
                    <DragPanelButtonRef ref={refs} changePosition={setPanelPosition} />
                    <div className={classes.info_model_pop_item_cont}>
                      <LockRef ref={refs} onClick={onClickLock} isLockedOnScene={isProductLocked} />
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
                  <div className={classes.info_model_bottom__text} ref={info_bottom}>
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
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.3 }}
                key={'helper_model'}
              >
                <div className={classes.info_model_pop_wr}>
                  <RotateRef
                    ref={refs}
                    radius={97}
                    hide={hideButtonsRotate}
                    show={showButtonsRotate}
                    position={panelPosition}
                    positionBtn={{ x: 97, y: 0 }}
                  />
                  <div className={classes.info_model_bottom} ref={info_bottom}>
                    <DragPanelButtonRef ref={refs} changePosition={setPanelPosition} />
                    <div className={classes.info_model_pop_item_cont}>
                      <div className={classes.info_model_pop_item_wr}>
                        <HoverComponent hoverText={translation['HINT_BUTTON_FLIP']}>
                          <div
                            className={classes.info_model_pop_item + ' ' + classes.info_model_main}
                          >
                            <img src="/src_designer/images/icon_flip_1.svg" />
                            <div className={classes.info_model_btn_overlay}></div>
                            <img
                              src="/src_designer/images/icon_info_more.svg"
                              className={classes.icon_info_more}
                            />
                          </div>
                        </HoverComponent>
                        <div className={classes.info_model_more_wrap}>
                          <div className={classes.info_model_more_wr}>
                            <HoverComponent hoverText={translation['HINT_BUTTON_FLIP_X']}>
                              <div
                                className={classes.info_model_more + ' ' + classes.info_model_main}
                              >
                                <img src="/src_designer/images/icon_flip_1.svg" />
                                <div
                                  className={classes.info_model_btn_overlay}
                                  onClick={
                                    R2D.scene.currentGroup
                                      ? planner.scene.flipCurrentGroupX
                                      : planner.scene.flipCurrentModelX
                                  }
                                ></div>
                              </div>
                            </HoverComponent>
                            <HoverComponent hoverText={translation['HINT_BUTTON_FLIP_Z']}>
                              <div
                                className={classes.info_model_more + ' ' + classes.info_model_main}
                              >
                                <img
                                  style={{ width: '21px' }}
                                  src="/src_designer/images/icon_flip_2_new.svg"
                                />
                                <div
                                  className={classes.info_model_btn_overlay}
                                  onClick={
                                    R2D.scene.currentGroup
                                      ? planner.scene.flipCurrentGroupZ
                                      : planner.scene.flipCurrentModelZ
                                  }
                                ></div>
                              </div>
                            </HoverComponent>
                          </div>
                        </div>
                      </div>
                      <div className={classes.info_model_pop_item_wr}>
                        <HoverComponent hoverText={translation['HINT_BUTTON_DUPLICATE']}>
                          <div
                            className={classes.info_model_pop_item + ' ' + classes.info_model_main}
                          >
                            <img src="/src_designer/images/icon_coppy.svg" />
                            <div
                              className={classes.info_model_btn_overlay}
                              onClick={
                                R2D.scene.currentGroup
                                  ? planner.scene.duplicateCurrentGroup
                                  : planner.scene.duplicateCurrentModel
                              }
                            ></div>
                          </div>
                        </HoverComponent>
                      </div>
                      <DeleteRef
                        positionBtn={{ x: 0, y: 0 }}
                        ref={btnDelete}
                        onDelClick={onDeleteModel}
                      />
                      <div className={classes.info_model_pop_item_wr}>
                        <More
                          childrens={[
                            <LockRef
                              ref={refs}
                              onClick={onClickLock}
                              isLockedOnScene={isProductLocked}
                              key={Math.random()}
                            />,
                            <HideRef typeToHide={'groups'} key={Math.random()} ref={btnRef} />,
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    className={classes.info_model_height}
                    style={
                      elevationActive
                        ? { left: infoBottomPanelWidth / 2 + 'px', transform: 'translateX(-50%)' }
                        : null
                    }
                    ref={textFieldInfo}
                  ></div>
                  <ElevateRef
                    setPanelPosition={setPanelPosition}
                    addStyles={{ transform: 'translateX(-50%)' }}
                    showButtonsElevate={showButtonsElevate}
                    hideButtonsElevate={hideButtonsElevate}
                    ref={refs}
                    positionBtn={{ x: infoBottomPanelWidth / 2, y: -40 }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

export default HelperGroup;
