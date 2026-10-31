import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { closeActivePopup, selectPopups } from '../../redux/features/popups/popupsSlice';
import DefaultModal from '../../shared-components/modals/default';
import Button from '../../shared-components/inputs/button';

const useStyle = createUseStyles({
  inner: {},
  cont: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: '40px 60px',
    position: 'relative',
    minWidth: 320,
    maxWidth: 480,
    height: 'auto',
  },
  text: {
    fontSize: 14,
    color: '#2F2F2F',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 1.5,
  },
  buttons: {
    display: 'flex',
    justifyContent: 'center',
    gap: 8,
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
  const { type } = popups.confirm;
  const [animPopupClass, setAnimPopupClass] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'confirm' })), 500);
  };

  return (
    <DefaultModal
      visible={animPopupClass}
      zIndex={101}
      className={classes.inner}
      contentClassName={classes.cont}
    >
      <div className={classes.text}>{getMessage(type, translation)}</div>
      <div className={classes.buttons}>
        <Button variant="secondary" onClick={close}>
          {translation['BUTTON_CANCEL'] || 'Cancel'}
        </Button>
        <Button onClick={close}>{translation['BUTTON_OK'] || 'OK'}</Button>
      </div>
    </DefaultModal>
  );
};

export default ConfirmPopup;
