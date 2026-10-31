import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { closeActivePopup } from '../../redux/features/popups/popupsSlice';
import { useTranslation } from '../../api/hooks/useTranslation';
import DefaultModal from '../../shared-components/modals/default';

const done_popup_text = {
  color: '#2F2F2F',
  fontSize: 14,
  textAlign: 'center',
  lineHeight: '22.27px',
  letterSpacing: '-0.3px',
};

const useStyle = createUseStyles({
  done_popup_wr: {
    maxWidth: 700,
    width: '100%',
  },
  done_popup_cont: {
    color: '#000',
    backgroundColor: '#f1f1f1',
    borderRadius: 6,
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
  },
  done_popup_login_wrap: {},
  done_popup_top: {
    background: '#72C4FF',
    height: 210,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  done_popup_bot: {
    padding: '35px 10px 40px',
    textAlign: 'center',
  },
  done_popup_title: {
    color: '#2F2F2F',
    fontSize: 32,
    fontWeight: 300,
    textAlign: 'center',
    marginBottom: 10,
  },
  done_popup_text: {
    extend: done_popup_text,
  },
  done_popup_subtext: {
    extend: done_popup_text,
    marginBottom: 30,
  },
  done_popup_btn: {
    color: '#2B2B2B',
    fontSize: 17,
    padding: '10px 55px',
    background: '#9DD900',
    textTransform: 'uppercase',
    cursor: 'pointer',
    display: 'inline-block',
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    lineHeight: '15px',
    fontWeight: 400,
    '&:hover': {
      background: '#8fc32d',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
      height: '26px',
      minWidth: 88,
    },
  },
});

const RegistrationDonePopup = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const translation = useTranslation();

  const [animPopupClass, setAnimPopupClass] = useState(false);

  const onClickClosePopUp = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'registrationDonePopup' })), 500);
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DefaultModal
      visible={animPopupClass}
      zIndex={101}
      className={classes.done_popup_wr}
      contentClassName={classes.done_popup_cont}
    >
      <div className={classes.done_popup_login_wrap}>
        <div className={classes.done_popup_login_wr}>
          <div className={classes.done_popup_top}>
            <img src="/src_designer/images/registrationDoneImg.png" />
          </div>
          <div className={classes.done_popup_bot}>
            <div className={classes.done_popup_title}>
              {translation['TEXT_REGISTRATION_THANKS_TITLE']}
            </div>
            <div className={classes.done_popup_text}>
              {translation['TEXT_REGISTRATION_THANKS_TEXT']}
            </div>
            <div className={classes.done_popup_subtext}>
              {translation['TEXT_REGISTRATION_THANKS_SUBTEXT']}
            </div>
            <div className={classes.done_popup_btn} onClick={onClickClosePopUp}>
              {translation['BUTTON_OK']}
            </div>
          </div>
        </div>
      </div>
    </DefaultModal>
  );
};

export default RegistrationDonePopup;
