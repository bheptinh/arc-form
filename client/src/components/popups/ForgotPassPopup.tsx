import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { user } from '../../initR2D';
import { updatePreloaderStatus } from '../../redux/features/common/commonSlice';
import { selectTranslation } from '../../redux/features/language/languageSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';

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
    maxWidth: 624,
    width: '100%',
    maxHeight: '90%',
    transform: 'scale(0)',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 6,
    position: 'relative',
    height: '100%',
    padding: '64px 73px 71px',
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
        fill: '#BAE51F',
      },
    },
  },
  planner_popup_close_icon: {
    width: '100%',
  },
  planner_popup_back: {
    top: 8,
    left: 8,
    cursor: 'pointer',
    height: 24,
    zIndex: 2,
    position: 'absolute',
    transform: 'rotate(180deg)',
    '& path': {
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover': {
      '& path': {
        fill: '#BAE51F',
      },
    },
  },
  planner_popup_back_icon: {
    width: '100%',
    height: '100%',
  },
  planner_popup_login_wrap: {},
  planner_popup_login_wr: {
    marginBottom: 20,
  },
  planner_popup_title: {
    fontSize: 32,
    fontWeight: 300,
    letterSpacing: '-0.03em',
    marginBottom: 30,
    color: '#373737',
    textAlign: 'center',
  },
  input_wrap: {
    padding: '0 65px',
    display: 'grid',
    gridGap: 20,
    border: 'none',
    gridTemplateColumns: 'auto auto',
    alignItems: 'center',
  },
  input_text: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: 14,
    color: '#2f2f2f',
    whiteSpace: 'nowrap',
    textAlign: 'right',
  },
  input_wr: {
    color: '#fff',
    width: 250,
    '&:last-child': {
      marginBottom: '0',
    },
  },
  formInput: {
    borderRadius: 3,
    paddingLeft: 10,
    fontSize: 14,
    color: '#000',
    width: '100%',
    border: '1px solid #e8dede',
    height: 30,
    background: '#ffffff',
    outline: 'none',
    resize: 'none',
    transition: 'all 0.4s ease-out',
  },
  planner_btn_done_wrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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

const ForgotPassPopup = (props) => {
  const dispatch = useDispatch();
  const translation = useSelector(selectTranslation);

  const popups = useSelector(selectPopups);
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const classes = useStyle();

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(updatePreloaderStatus(true));
    const form = e.target;

    const email = form.elements.email;

    const dataObj = {
      email: email.value,
    };

    if (!/^[^@]+@[^@]+$/.test(dataObj.email)) {
      dispatch(
        setActivePopup({ name: 'alert', type: 'error_email', data: 'TEXT_REG_INVALID_EMAIL' })
      );
      dispatch(updatePreloaderStatus(false));
      return;
    }

    const response = await user.recoveryPasswordRequest(dataObj);
    dispatch(updatePreloaderStatus(false));
    if (response.type == 'error')
      return dispatch(setActivePopup({ name: 'alert', data: response.data }));
    else dispatch(setActivePopup({ name: 'alert', data: response.data }));
    dispatch(closeActivePopup({ name: 'forgotPassword' }));
  };

  const onClickBack = (e) => {
    dispatch(setActivePopup({ name: 'login' }));
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'forgotPassword' })), 500);
  };

  const onClickClosePopUp = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'forgotPassword' })), 500);
  };

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
      style={{ zIndex: popups.forgotPassword.zIndex }}
    >
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_cont}>
          <div className={classes.planner_popup_login_wrap}>
            <div className={classes.planner_popup_back} onClick={onClickBack}>
              <svg
                className={classes.planner_popup_back_icon}
                width="9"
                height="15"
                viewBox="0 0 9 15"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.0271826 0.679673L0.72504 0L8.4375 7.54323L7.73964 8.2229L7.73489 8.21825L0.692425 15L-2.86102e-06 14.3151L7.03849 7.53713L0.0271826 0.679673Z"
                  fill="#444444"
                ></path>
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M0.0271826 0.679673L0.72504 0L8.4375 7.54323L7.73964 8.2229L7.73489 8.21825L0.692425 15L-2.86102e-06 14.3151L7.03849 7.53713L0.0271826 0.679673Z"
                  fill="#444444"
                ></path>
              </svg>
            </div>

            <div className={classes.planner_popup_close} onClick={onClickClosePopUp}>
              <svg
                width="25"
                height="25"
                fill="none"
                viewBox="0 0 25 25"
                className={classes.planner_popup_close_icon}
              >
                <path
                  fill="#2F2F2F"
                  fillRule="evenodd"
                  d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z"
                  clipRule="evenodd"
                />
                <path
                  fill="#2F2F2F"
                  fillRule="evenodd"
                  d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z"
                  clipRule="evenodd"
                />
                <path
                  fill="#2F2F2F"
                  fillRule="evenodd"
                  d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z"
                  clipRule="evenodd"
                />
                <path
                  fill="#2F2F2F"
                  fillRule="evenodd"
                  d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className={classes.planner_popup_title}>{translation['TEXT_FORGOT_PASSWORD']}</h2>
            <div className={classes.planner_popup_login_wr}>
              <form onSubmit={onSubmit}>
                <fieldset className={classes.input_wrap}>
                  <div className={classes.input_text}>{translation['INPUT_TEXT_LOGIN']}</div>
                  <div className={classes.input_wr}>
                    <input
                      id="formEmail"
                      className={classes.formInput}
                      type="tel"
                      name="email"
                      required="required"
                      placeholder=""
                    />
                  </div>
                </fieldset>
                <fieldset className={classes.planner_btn_done_wrap}>
                  <input
                    type="submit"
                    className={classes.planner_btn_done}
                    id="login_sent"
                    value={translation['BUTTON_OK']}
                  />
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassPopup;
