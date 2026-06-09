import { AnimatePresence, motion } from 'framer-motion';
import React, { useMemo, useRef } from 'react';
import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { selectActiveControlPanelModeData } from '../../redux/features/control/controlPanelSlice';
import { selectQuickPanels } from '../../redux/features/quickPanels/quickPanelsSlice';
import { DragPanelButtonRef } from './components/DragPanelButton';
import { MoveRef } from './components/Move';

const useStyle = createUseStyles({
  info_logoMesh_pop_wrap: {
    position: 'absolute',
    zIndex: 1,
    display: 'flex',
    '& img': {
      userSelect: 'none',
      pointerEvents: 'none',
    },
  },
  info_logoMesh_pop_wr: {
    position: 'absolute',
    transform: 'translateX(-50%)',
  },
  info_logoMesh_bottom: {
    background: '#fff',
    borderRadius: 3,
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    display: 'flex',
    overflow: 'hidden',
  },
  info_logoMesh_height: {
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
  info_logoMesh_bottom_button: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 5px',
    transition: 'background 0.9s cubic-bezier(.19,1,.22,1)',
    cursor: 'pointer',
    '&:hover': {
      background: '#E9E9E9',
    },
  },
  info_logoMesh_bottom_buttons: {
    display: 'flex',
  },
});

const HelperLogoMesh = (props) => {
  const quickPanels = useSelector(selectQuickPanels);
  const position = quickPanels.helper_logo_mesh.position;
  const currObj = R2D.scene.currentView3DObject || R2D.scene.prevSelectedView3DObject;

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const activeLogoIndex = lastHistoryElem?.index;

  const activeLogoHash =
    currObj?.logoEditor && Object.keys(currObj.logoEditor.getDataForUIAllLogos())[activeLogoIndex];

  const btnMove = useRef(null);
  const textFieldInfo = useRef(null);
  const mainDiv = useRef(null);
  const btnDragPanel = useRef(null);
  const info_bottom = useRef(null);
  const incrDecrButtons = useRef(null);

  const refs = useRef({ btnMove, textFieldInfo, mainDiv, btnDragPanel });
  const classes = useStyle();

  const [panelPosition, setPanelPosition] = useState(position);

  const showButtonsMove = () => {
    btnDragPanel.current.style.display = incrDecrButtons.current.style.display = 'flex';
  };

  const hideButtonsMove = () => {
    btnDragPanel.current.style.display = incrDecrButtons.current.style.display = 'none';
  };

  const onDecreaseLogo = (e) => currObj.logoEditor.decLogoSize(activeLogoHash);

  const onIncreaseLogo = (e) => currObj.logoEditor.incLogoSize(activeLogoHash);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ duration: 0.3 }}
      className={classes.info_logoMesh_pop_wrap}
      ref={mainDiv}
      style={{
        left: panelPosition.y < 72 ? panelPosition.x + 50 : panelPosition.x,
        top: panelPosition.y < 72 ? 72 : panelPosition.y,
      }}
    >
      <AnimatePresence mode="wait">
        {
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.3 }}
            key={'helper_wall_hidden'}
            className={classes.info_logoMesh_pop_wrap}
          >
            <div className={classes.info_logoMesh_pop_wr}>
              <div className={classes.info_logoMesh_bottom} ref={info_bottom}>
                <DragPanelButtonRef ref={refs} changePosition={setPanelPosition} />
                <div className={classes.info_logoMesh_bottom_buttons} ref={incrDecrButtons}>
                  <div className={classes.info_logoMesh_bottom_button} onClick={onDecreaseLogo}>
                    <svg width="17" height="1" viewBox="0 0 17 1" fill="none">
                      <rect
                        x="17"
                        width="1"
                        height="17"
                        transform="rotate(90 17 0)"
                        fill="#2A3435"
                      />
                    </svg>
                  </div>
                  <div className={classes.info_logoMesh_bottom_button} onClick={onIncreaseLogo}>
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                      <rect x="8" width="1" height="17" fill="#2A3435" />
                      <rect
                        x="17"
                        y="8"
                        width="1"
                        height="17"
                        transform="rotate(90 17 8)"
                        fill="#2A3435"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className={classes.info_logoMesh_height} ref={textFieldInfo}></div>
            <MoveRef
              ref={refs}
              type={'logoMesh'}
              addData={activeLogoHash}
              hide={hideButtonsMove}
              changePosition={setPanelPosition}
              show={showButtonsMove}
              positionBtn={{ x: 0, y: -40 }}
            />
          </motion.div>
        }
      </AnimatePresence>
    </motion.div>
  );
};

export default HelperLogoMesh;
