import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { closeActivePopup } from '../../redux/features/popups/popupsSlice';
import { useTranslation } from '../../api/hooks/useTranslation';

const done_popup_text = {
  color: '#2F2F2F',
  fontSize: 14,
  textAlign: 'center',
  lineHeight: '22.27px',
  letterSpacing: '-0.3px',
};

const useStyle = createUseStyles({
  done_popup_wrap: {
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
  done_popup_wrap_show: {
    opacity: '1',
    pointerEvents: 'auto',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    '& $done_popup_wr': {
      transform: 'scale(1)',
    },
  },
  done_popup_wr: {
    color: '#000',
    maxWidth: 700,
    width: '100%',
    maxHeight: '90%',
    transform: 'scale(0)',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
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
  done_popup_close: {
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
        fill: '#BAE51F',
      },
    },
  },
  done_popup_close_icon: {
    width: '100%',
  },
  done_popup_top: {
    background: '#72C4FF',
    height: 210,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  done_popup_top_icon: {},
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
    <div
      className={
        animPopupClass
          ? classes.done_popup_wrap + ' ' + classes.done_popup_wrap_show
          : classes.done_popup_wrap
      }
    >
      <div className={classes.done_popup_wr}>
        <div className={classes.done_popup_cont}>
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
        </div>
      </div>
    </div>
  );
};

export default RegistrationDonePopup;
