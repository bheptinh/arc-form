import { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { planner } from '../../initR2D';
import { closeActivePopup } from '../../redux/features/popups/popupsSlice';
import Button from '../../shared-components/inputs/button';
import Checkbox from '../../shared-components/inputs/checkbox';
import DefaultModal from '../../shared-components/modals/default';

const useStyle = createUseStyles({
  planner_popup_wr: {},
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 6,
    height: '100%',
    padding: '30px 60px',
    position: 'relative',
  },
  planner_popup_text: {
    fontSize: 14,
    color: '#2F2F2F',
    marginBottom: 30,
  },
  compare_checkbox_wr: {
    marginTop: 15,
  },
});

const Revert3DRotation = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();

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
    <DefaultModal
      visible={animPopupClass}
      zIndex={101}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
    >
      <div className={classes.planner_popup_text}>
        <p dangerouslySetInnerHTML={{ __html: translation['REVERT_3D_ROTATION_POPUP_TEXT'] }}></p>
      </div>
      <DefaultModal.Actions>
        <Button onClick={onClickOk}>{translation['BUTTON_YES']}</Button>
        <Button variant="secondary" onClick={onClickClosePopUp}>
          {translation['BUTTON_NO']}
        </Button>
      </DefaultModal.Actions>
      <div className={classes.compare_checkbox_wr} ref={checkBoxRef}>
        <Checkbox
          label={translation['TEXT_DONT_SHOW_AGAIN']}
          onChange={notShowAgainClick}
          checked={revertPopupShowCookie}
          name={'revert3DRotationPopup'}
        />
      </div>
    </DefaultModal>
  );
};

export default Revert3DRotation;
