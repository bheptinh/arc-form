import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../initR2D';
import { selectTranslation } from '../../redux/features/language/languageSlice';
import { closeActivePopup } from '../../redux/features/popups/popupsSlice';
import Checkbox from '../common/Checkbox';

const useStyle = createUseStyles({
  planner_popup_wrap: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: '0%',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '101',
    WebkitPerspective: '800px',
    perspective: '800px',
    overflow: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.2)',
  },
  planner_popup_wrap_show: {
    opacity: '1',
    pointerEvents: 'auto',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    '& $planner_popup_wr': {
      transform: 'scale(1)',
    },
  },
  planner_popup_wr: {
    color: '#000',
    maxHeight: '90%',
    transform: 'scale(0)',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 6,
    height: '100%',
    padding: '30px 60px',
    position: 'relative',
  },
  planner_popup_close: {
    width: 20,
    height: 20,
    position: 'absolute',
    top: 8,
    right: 8,
    cursor: 'pointer',
    zIndex: '2',
    '& path': {
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover': {
      '& path': {
        fill: '#a0a0a0',
      },
    },
  },
  planner_popup_close_icon: {
    width: '100%',
  },
  planner_popup_text: {
    fontSize: 14,
    color: '#2F2F2F',
    marginBottom: 30,
  },
  planner_popup_bottom: {
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    justifyContent: 'center',
  },
  planner_btn: {
    cursor: 'pointer',
    height: '35px',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#2B2B2B',
    fontSize: 14,
    borderRadius: 3,
    padding: '0 20px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    minWidth: 120,
    outline: 'none',
    background: '#fff',
    textTransform: 'uppercase',
    border: '1px solid #000',
    margin: '0 3px',
    '&:hover': {
      background: '#8fc32d',
    },
  },
  planner_btn_done: {
    cursor: 'pointer',
    height: '35px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#2B2B2B',
    fontSize: 14,
    borderRadius: 3,
    padding: '0 20px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    minWidth: 120,
    border: 'none',
    outline: 'none',
    background: '#BBE521',
    textTransform: 'uppercase',
    margin: '0 3px',
    '&:hover': {
      background: '#8fc32d',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
      height: '26px',
      minWidth: 88,
    },
  },
  compare_checkbox_wr: {
    marginTop: 15,
  },
});

const Revert3DRotation = (props) => {
  const dispatch = useDispatch();
  const translation = useSelector(selectTranslation);

  const [revertPopupShowCookie, setRevertPopupShowCookie] = useState(
    R2D.Storage.load('r2d_revert3DRotationPopup')
  );
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const checkBoxRef = useRef(null);

  const classes = useStyle();

  const onClickOk = (e) => {
    planner.mih()._scene.currentView3DObject.object3d.rotation._x =
      planner.mih()._scene.currentView3DObject.object3d.rotation._z =
      planner.mih()._scene.currentView3DObject.sceneObject.rotationX =
      planner.mih()._scene.currentView3DObject.sceneObject.rotationZ =
        0;
    planner.mih()._currentViewer.rendererUpdate();
    planner.mih()._scene.currentView3DObject.sceneObject.update();
    revertPopupShowCookie && R2D.Storage.save('r2d_revert3DRotationPopup', revertPopupShowCookie);
    dispatch(closeActivePopup({ name: 'revert3DRotationPopup' }));
  };

  const onClickClosePopUp = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'revert3DRotationPopup' })), 500);
  };

  const notShowAgainClick = (e) => setRevertPopupShowCookie(!revertPopupShowCookie);

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={
        animPopupClass
          ? classes.planner_popup_wrap + ' ' + classes.planner_popup_wrap_show
          : classes.planner_popup_wrap
      }
    >
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_cont}>
          <div className={classes.planner_popup_text}>
            <p
              dangerouslySetInnerHTML={{ __html: translation['REVERT_3D_ROTATION_POPUP_TEXT'] }}
            ></p>
          </div>
          <div className={classes.planner_popup_bottom}>
            <span className={classes.planner_btn_done} onClick={onClickOk}>
              {translation['BUTTON_YES']}
            </span>
            <span className={classes.planner_btn} onClick={onClickClosePopUp}>
              {translation['BUTTON_NO']}
            </span>
          </div>
          <div className={classes.compare_checkbox_wr} ref={checkBoxRef}>
            <Checkbox
              label={translation['TEXT_DONT_SHOW_AGAIN']}
              onChange={notShowAgainClick}
              checked={revertPopupShowCookie}
              name={'revert3DRotationPopup'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revert3DRotation;
