import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { deleteUserUpload } from '../../api/catalog';
import { useTranslation } from '../../api/hooks/useTranslation';
import { planner, user } from '../../initR2D';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import Button from '../../shared-components/inputs/button';
import DefaultModal from '../../shared-components/modals/default';
import { refreshUserUploads } from '../catalog/refresh-user-uploads';

const useStyle = createUseStyles({
  inner: {},
  cont: {
    backgroundColor: 'var(--color-white)',
    borderRadius: 6,
    padding: '40px 60px',
    position: 'relative',
    minWidth: 320,
    maxWidth: 480,
    height: 'auto',
  },
  text: {
    fontSize: 14,
    color: 'var(--color-text)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 1.5,
  },
});

function getMessage(type: string | null, translation: Record<string, string>): string {
  return translation['TEXT_ARE_YOU_SURE'] || 'Are you sure?';
}

const ConfirmPopup = () => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);
  const { type, data } = popups.confirm;
  const [animPopupClass, setAnimPopupClass] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'confirm' })), 500);
  };

  const onConfirm = async () => {
    if (type === 'image_plan_delete') planner.constr.deletePlan();
    if (type === 'delete_custom_element') {
      try {
        await deleteUserUpload(data.id);
        await refreshUserUploads();
      } catch {
        dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));
      }
    }
    if (type === 'cameraView_delete') {
      await user.cameraViews_delete(data);
      planner.scene.dispatchEvent(new Event(planner.scene.UPDATE_CAMERA_VIEWS, {}));
    }
    close();
  };

  return (
    <DefaultModal
      visible={animPopupClass}
      zIndex={101}
      className={classes.inner}
      contentClassName={classes.cont}
    >
      <div className={classes.text}>{getMessage(type, translation)}</div>
      <DefaultModal.Actions>
        <Button variant="secondary" onClick={close}>
          {translation['BUTTON_CANCEL'] || 'Cancel'}
        </Button>
        <Button onClick={onConfirm}>{translation['BUTTON_OK'] || 'OK'}</Button>
      </DefaultModal.Actions>
    </DefaultModal>
  );
};

export default ConfirmPopup;
