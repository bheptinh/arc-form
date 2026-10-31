import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { closeActivePopup, selectPopups } from '../../redux/features/popups/popupsSlice';
import DefaultModal from '../../shared-components/modals/default';

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
  cancelBtn: {
    cursor: 'pointer',
    height: 35,
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
    '&:hover': { background: '#E9E9E9' },
    '@media screen and (max-width: 950px)': { fontSize: 12, height: 26, minWidth: 88 },
  },
  confirmBtn: {
    cursor: 'pointer',
    height: 35,
    display: 'inline-flex',
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
    '&:hover': { background: '#8fc32d' },
    '&:disabled': { opacity: 0.6, cursor: 'default' },
    '@media screen and (max-width: 950px)': { fontSize: 12, height: 26, minWidth: 88 },
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
        <button className={classes.cancelBtn} onClick={close}>
          {translation['BUTTON_CANCEL'] || 'Cancel'}
        </button>
        <button className={classes.confirmBtn} onClick={close}>
          {translation['BUTTON_OK'] || 'OK'}
        </button>
      </div>
    </DefaultModal>
  );
};

export default ConfirmPopup;
