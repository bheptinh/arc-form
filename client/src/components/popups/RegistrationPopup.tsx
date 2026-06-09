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
    display: 'flex',
    border: 'none',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
    '@media screen and (max-width: 950px)': {
      padding: '0 15px',
      gridGap: 14,
    },
  },
  input_wrap_checkbox: {
    padding: '0 95px',
    marginBottom: 0,
  },
  input_text: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: 14,
    color: '#2f2f2f',
    whiteSpace: 'nowrap',
    textAlign: 'right',
    marginRight: 20,
  },
  input_wr: {
    color: '#fff',
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
  checkbox_wrap: {
    marginBottom: 15,
  },
  input_pass_btn: {
    position: 'absolute',
    top: 5,
    right: 70,
    cursor: 'pointer',
  },
});

const RegistrationPopup = (props) => {
  const dispatch = useDispatch();
  const translation = useSelector(selectTranslation);

  const popups = useSelector(selectPopups);

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const [checkboxNews, setCheckboxNews] = useState(false);
  const [animPopupClass, setAnimPopupClass] = useState(false);
  const [iconPasswordStatus, setIconPasswordStatus] = useState({
    password: false,
    verify_password: false,
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(updatePreloaderStatus(true));
    const form = e.target;

    const email = form.elements.email;
    const password = form.elements.password;
    const password_repeat = form.elements.verify_password;

    const dataObj = {
      login: email.value,
      user_name: email.value,
      password: password.value,
      subscription_news: checkboxNews,
    };

    if (checkboxNews) dataObj.subscription_news = '1';

    if (dataObj.login.length < 6 || dataObj.login.length > 50) {
      dispatch(setActivePopup({ name: 'alert', data: 'TEXT_EMAIL_LENGTH_ERROR' }));
      dispatch(updatePreloaderStatus(false));
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(dataObj.login)) {
      dispatch(
        setActivePopup({ name: 'alert', type: 'error_email', data: 'TEXT_REG_INVALID_EMAIL' })
      );
      dispatch(updatePreloaderStatus(false));
      return;
    } else if (dataObj.password.length < 6 || dataObj.password.length > 64) {
      dispatch(setActivePopup({ name: 'alert', data: 'TEXT_PASSWORD_LENGTH_ERROR' }));
      dispatch(updatePreloaderStatus(false));
      return;
    } else if (dataObj.password != password_repeat.value) {
      dispatch(
        setActivePopup({
          name: 'alert',
          type: 'error_password_not_match',
          data: 'TEXT_PASSWORDS_NOT_MATCH',
        })
      );
      dispatch(updatePreloaderStatus(false));
      return;
    }

    const response = await user.registration(dataObj);
    if (response.type == 'error') dispatch(setActivePopup({ name: 'alert', data: response.data }));
    else if (response.type == 'load_thanks') {
      dispatch(setActivePopup({ name: 'registrationDonePopup' }));
      dispatch(closeActivePopup({ name: 'registration' }));
    }
    dispatch(updatePreloaderStatus(false));
  };

  const onClickBack = (e) => {
    dispatch(setActivePopup({ name: 'login' }));
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'registration' })), 500);
  };

  const classes = useStyle();

  const onTapToClose = (e) => {
    if (!e.target.closest('.' + classes.planner_popup_wr)) {
      document.removeEventListener('touchend', onTapToClose);
      dispatch(closeActivePopup({ name: 'registration' }));
    }
  };

  const onClickClosePopUp = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'registration' })), 500);
  };

  const onRadioPasswordShowStatus = (type) => {
    setIconPasswordStatus((prev) => {
      const newState = { ...prev };
      newState[type] = !newState[type];
      return newState;
    });
  };

  useEffect(() => {
    isCurrDeviceAPhone && document.addEventListener('touchend', onTapToClose);
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('touchend', onTapToClose);
    };
  }, []);

  return (
    <div
      className={
        animPopupClass
          ? classes.planner_popup_wrap + ' ' + classes.planner_popup_wrap_show
          : classes.planner_popup_wrap
      }
      style={{ zIndex: popups.registration.zIndex }}
    >
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_cont}>
          <h2 className={classes.planner_popup_title}>{translation['TEXT_REGISTRATION']}</h2>
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
            <div className={classes.planner_popup_login_wr}>
              <form onSubmit={onSubmit}>
                <fieldset className={classes.input_wrap}>
                  <div className={classes.input_text}>{translation['TEXT_EMAIL']}</div>
                  <div className={classes.input_wr}>
                    <input
                      className={classes.formInput}
                      type="tel"
                      name="email"
                      required
                      placeholder=""
                    />
                  </div>
                </fieldset>
                <fieldset className={classes.input_wrap}>
                  <div className={classes.input_text}>{translation['INPUT_TEXT_PASSWORD']}</div>
                  <div className={classes.input_wr}>
                    <input
                      className={classes.formInput}
                      type={iconPasswordStatus['password'] ? 'text' : 'password'}
                      name="password"
                      required
                      placeholder=""
                    />
                  </div>
                  <div
                    className={classes.input_pass_btn}
                    onClick={(e) => onRadioPasswordShowStatus('password')}
                  >
                    {iconPasswordStatus['password'] ? (
                      <svg
                        width="16"
                        height="10"
                        viewBox="0 0 16 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.60645 0.678711C10.8059 0.678711 13.4587 2.41594 14.4785 4.75391C13.4588 7.09204 10.8061 8.8291 7.60645 8.8291C4.40666 8.82906 1.75299 7.09223 0.733398 4.75391C1.7531 2.41575 4.40681 0.678755 7.60645 0.678711Z"
                          stroke="#2F2F2F"
                          strokeWidth="1.35832"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7.63486 7.13112C8.94767 7.13112 10.0119 6.06688 10.0119 4.75407C10.0119 3.44126 8.94767 2.37701 7.63486 2.37701C6.32205 2.37701 5.25781 3.44126 5.25781 4.75407C5.25781 6.06688 6.32205 7.13112 7.63486 7.13112Z"
                          fill="#2F2F2F"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="7"
                        viewBox="0 0 16 7"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g opacity="0.5">
                          <path
                            d="M0.0367804 0C1.08883 2.75949 4.09401 4.7541 7.64335 4.7541C11.1927 4.7541 14.1979 2.75949 15.2499 0H13.7655C12.7824 1.92685 10.4792 3.39579 7.64335 3.39579C4.80745 3.39579 2.50426 1.92685 1.52121 0H0.0367804Z"
                            fill="#2F2F2F"
                          />
                          <path
                            d="M1.66726 1.35867L2.74853 2.18079L1.08127 4.07029L0 3.24817L1.66726 1.35867Z"
                            fill="#2F2F2F"
                          />
                          <path
                            d="M3.93526 3.4718L5.29908 3.86245L4.33965 6.51566L2.97583 6.12502L3.93526 3.4718Z"
                            fill="#2F2F2F"
                          />
                          <path
                            d="M10.4836 3.4778L9.10086 3.8245L9.97135 6.50405L11.3541 6.15735L10.4836 3.4778Z"
                            fill="#2F2F2F"
                          />
                          <path
                            d="M13.6144 1.35867L12.5331 2.18079L14.2598 4.1484L15.341 3.32628L13.6144 1.35867Z"
                            fill="#2F2F2F"
                          />
                        </g>
                      </svg>
                    )}
                  </div>
                </fieldset>
                <fieldset className={classes.input_wrap}>
                  <div className={classes.input_text}>{translation['TEXT_VERIFY_PASSWORD']}</div>
                  <div className={classes.input_wr}>
                    <input
                      className={classes.formInput}
                      type={iconPasswordStatus['verify_password'] ? 'text' : 'password'}
                      name="verify_password"
                      required
                      placeholder=""
                    />
                  </div>
                  <div
                    className={classes.input_pass_btn}
                    onClick={(e) => onRadioPasswordShowStatus('verify_password')}
                  >
                    {iconPasswordStatus['verify_password'] ? (
                      <svg
                        width="16"
                        height="10"
                        viewBox="0 0 16 10"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.60645 0.678711C10.8059 0.678711 13.4587 2.41594 14.4785 4.75391C13.4588 7.09204 10.8061 8.8291 7.60645 8.8291C4.40666 8.82906 1.75299 7.09223 0.733398 4.75391C1.7531 2.41575 4.40681 0.678755 7.60645 0.678711Z"
                          stroke="#2F2F2F"
                          strokeWidth="1.35832"
                          strokeMiterlimit="10"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7.63486 7.13112C8.94767 7.13112 10.0119 6.06688 10.0119 4.75407C10.0119 3.44126 8.94767 2.37701 7.63486 2.37701C6.32205 2.37701 5.25781 3.44126 5.25781 4.75407C5.25781 6.06688 6.32205 7.13112 7.63486 7.13112Z"
                          fill="#2F2F2F"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="7"
                        viewBox="0 0 16 7"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g opacity="0.5">
                          <path
                            d="M0.0367804 0C1.08883 2.75949 4.09401 4.7541 7.64335 4.7541C11.1927 4.7541 14.1979 2.75949 15.2499 0H13.7655C12.7824 1.92685 10.4792 3.39579 7.64335 3.39579C4.80745 3.39579 2.50426 1.92685 1.52121 0H0.0367804Z"
                            fill="#2F2F2F"
                          />
                          <path
                            d="M1.66726 1.35867L2.74853 2.18079L1.08127 4.07029L0 3.24817L1.66726 1.35867Z"
                            fill="#2F2F2F"
                          />
                          <path
                            d="M3.93526 3.4718L5.29908 3.86245L4.33965 6.51566L2.97583 6.12502L3.93526 3.4718Z"
                            fill="#2F2F2F"
                          />
                          <path
                            d="M10.4836 3.4778L9.10086 3.8245L9.97135 6.50405L11.3541 6.15735L10.4836 3.4778Z"
                            fill="#2F2F2F"
                          />
                          <path
                            d="M13.6144 1.35867L12.5331 2.18079L14.2598 4.1484L15.341 3.32628L13.6144 1.35867Z"
                            fill="#2F2F2F"
                          />
                        </g>
                      </svg>
                    )}
                  </div>
                </fieldset>
                <fieldset className={classes.input_wrap + ' ' + classes.input_wrap_checkbox}>
                  {R2D.config.data.ui.profile_news ? (
                    <div className={classes.checkbox_wrap}>
                      <Checkbox
                        name={'news'}
                        label={translation['TEXT_GET_NEWS']}
                        onChange={(status) => setCheckboxNews(status)}
                        checked={checkboxNews}
                      />
                    </div>
                  ) : null}
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

export default RegistrationPopup;
