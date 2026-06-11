import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { user } from '../../initR2D';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import { createProjectUrl } from '../../utils/UrlHelper';
import { useTranslation } from '../../api/hooks/useTranslation';

const useStyle = createUseStyles({
  '@font-face': [
    {
      fontFamily: 'Roboto-Light',
      fontWeight: 300,
      fontDisplay: 'swap',
      src: 'url("/src_designer/Roboto-Light.ttf") format("truetype")',
    },
    {
      fontFamily: 'Roboto-Bold',
      fontWeight: 700,
      fontDisplay: 'swap',
      src: 'url("/src_designer/Roboto-Bold.ttf") format("truetype")',
    },
  ],
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
    maxWidth: 645,
    width: '100%',
    maxHeight: '90%',
    transform: 'scale(0)',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#f1f1f1',
    borderRadius: 6,
    position: 'relative',
    height: '100%',
  },
  planner_popup_profile_wrap: {},
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
    '@media screen and (max-width: 950px)': {
      top: 12,
    },
  },
  planner_popup_close_icon: {
    width: '100%',
  },
  planner_popup_line: {
    background: 'rgb(217, 217, 217)',
    height: '1px',
    fontFamily: 'Roboto-Light, sans-serif',
    marginBottom: 20,
  },
  planner_popup_title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    fontFamily: 'Roboto-Light, sans-serif',
    '@media screen and (max-width: 950px)': {
      fontSize: 20,
    },
  },
  input_wrap: {
    padding: '0 75px 0 65px',
    display: 'flex',
    gridGap: 20,
    border: 'none',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
    '@media screen and (max-width: 950px)': {
      padding: '0 15px',
      gridGap: 14,
    },
  },
  input_text: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: 14,
    color: '#2f2f2f',
    whiteSpace: 'nowrap',
    textAlign: 'right',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
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
    '@media screen and (max-width: 950px)': {
      height: '26px',
      fontSize: '9px',
    },
  },
  planner_btn_done_wrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pro_status_wr: {
    padding: '0 65px',
    display: 'flex',
    border: 'none',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 13,
  },
  fieldset_left: {
    flex: 1,
    textAlign: 'right',
    marginRight: 20,
  },
  fieldset_right: {
    flex: 1,
    minWidth: 222,
    display: 'flex',
    position: 'relative',
  },
  pro_update: {
    display: 'flex',
    alignItems: 'center',
  },
  planner_btn_done_wr: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
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
  planner_btn_done_disabled: {
    border: '1px solid #999999',
    backgroundColor: '#cccccc',
    color: '#666666',
    cursor: 'default',
    '&:hover': {
      background: '#cccccc',
    },
  },
  planner_popup_profile_top: {
    background: '#72C4FF',
    position: 'relative',
    padding: '41px 0',
    '@media screen and (max-width: 950px)': {
      padding: '15px 0',
    },
  },
  planner_popup_profile_bottom: {
    position: 'relative',
    padding: '20px 0 30px',
    background: '#fff',
    '& form': {
      padding: '0 100px',
    },
    '& fieldset': {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0 10px',
      marginBottom: 20,
      alignItems: 'center',
      '@media screen and (max-width: 950px)': {
        marginBottom: 14,
      },
    },
  },
  input_pass_btn: {
    position: 'absolute',
    top: 5,
    right: 50,
    cursor: 'pointer',
  },
});

const UpdatePassword = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);

  const type = popups.updatePassword.type;
  const data = popups.updatePassword.data;

  const classes = useStyle();
  const [animPopupClass, setAnimPopupClass] = useState(false);
  const [iconPasswordStatus, setIconPasswordStatus] = useState({
    old_password: false,
    new_password: false,
    verify_password: false,
  });

  const inputSubmit = useRef(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const pass1 = form.elements.new_password.value;
    const pass2 = form.elements.verify_password.value;

    const old_password = form.elements.old_password;

    const dataObj = {};

    if (pass1.length > 0 && (pass1.length < 6 || pass1.length > 64)) {
      dispatch(setActivePopup({ name: 'alert', data: 'TEXT_PASSWORD_LENGTH_ERROR' }));
      return;
    } else if (pass1 != pass2) {
      dispatch(
        setActivePopup({
          name: 'alert',
          type: 'error_password_not_match',
          data: 'TEXT_PASSWORDS_NOT_MATCH',
        })
      );
      return;
    }

    dataObj.password = pass1;
    if (old_password) {
      dataObj.old_password = old_password.value;
      const result = await user.changePassword(dataObj);
      if (result.type == 'error')
        return dispatch(setActivePopup({ name: 'alert', data: result.data }));
      dispatch(
        setActivePopup({
          name: 'completeMessage',
          data: 'USER_ACCOUNT_RESET_P_SUCCESS_TEXT',
          positionX: 'left',
        })
      );
      dispatch(closeActivePopup({ name: 'updatePassword' }));
    } else {
      const result = await user.recoveryPasswordConfirm(dataObj, data);
      if (result.type == 'error')
        return dispatch(setActivePopup({ name: 'alert', data: result.data }));
      dispatch(
        setActivePopup({
          name: 'completeMessage',
          data: 'USER_ACCOUNT_RESET_P_SUCCESS_TEXT',
          positionX: 'left',
        })
      );
      dispatch(closeActivePopup({ name: 'updatePassword' }));
      dispatch(setActivePopup({ name: 'login' }));
      window.history.replaceState(null, null, createProjectUrl(''));
    }
  };

  const onRadioPasswordShowStatus = (type) => {
    setIconPasswordStatus((prev) => {
      const newState = { ...prev };
      newState[type] = !newState[type];
      return newState;
    });
  };

  const onChangeInput = (e) => {
    if (e.target.value == 0) {
      inputSubmit.current.setAttribute('disabled', '');
      inputSubmit.current.classList.add(classes.planner_btn_done_disabled);
    } else {
      inputSubmit.current.removeAttribute('disabled');
      inputSubmit.current.classList.remove(classes.planner_btn_done_disabled);
    }
  };

  const onClickClosePopUp = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'updatePassword' })), 500);
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      datapopup={'popup-profile'}
      className={
        animPopupClass
          ? classes.planner_popup_wrap + ' ' + classes.planner_popup_wrap_show
          : classes.planner_popup_wrap
      }
      style={{ zIndex: popups.updatePassword.zIndex }}
    >
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_cont}>
          <div className={classes.planner_popup_profile_wrap}>
            <div className={classes.planner_popup_profile_top}>
              <h2 className={classes.planner_popup_title}>{translation['UPDATE_PASSWORD']}</h2>

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
            </div>
            <div className={classes.planner_popup_profile_bottom}>
              <form onSubmit={onSubmit}>
                {type == 'update' ? (
                  <fieldset>
                    <div className={classes.fieldset_left}>
                      <div className={classes.input_text}>{translation['OLD_PASSWORD']}</div>
                    </div>
                    <div className={classes.fieldset_right}>
                      <div className={classes.input_wr}>
                        <input
                          className={classes.formInput}
                          onChange={onChangeInput}
                          autoComplete="off"
                          type={iconPasswordStatus['old_password'] ? 'text' : 'password'}
                          name="old_password"
                          placeholder=""
                        />
                      </div>
                      <div
                        className={classes.input_pass_btn}
                        onClick={(e) => onRadioPasswordShowStatus('old_password')}
                      >
                        {iconPasswordStatus['old_password'] ? (
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
                    </div>
                  </fieldset>
                ) : null}

                <fieldset>
                  <div className={classes.fieldset_left}>
                    <div className={classes.input_text}>{translation['TEXT_NEW_PASSWORD']}</div>
                  </div>
                  <div className={classes.fieldset_right}>
                    <div className={classes.input_wr}>
                      <input
                        className={classes.formInput}
                        onChange={onChangeInput}
                        autoComplete="off"
                        type={iconPasswordStatus['new_password'] ? 'text' : 'password'}
                        name="new_password"
                        placeholder=""
                      />
                    </div>
                    <div
                      className={classes.input_pass_btn}
                      onClick={(e) => onRadioPasswordShowStatus('new_password')}
                    >
                      {iconPasswordStatus['new_password'] ? (
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
                  </div>
                </fieldset>
                <fieldset>
                  <div className={classes.fieldset_left}>
                    <div className={classes.input_text}>{translation['TEXT_VERIFY_PASSWORD']}</div>
                  </div>
                  <div className={classes.fieldset_right}>
                    <div className={classes.input_wr}>
                      <input
                        className={classes.formInput}
                        onChange={onChangeInput}
                        type={iconPasswordStatus['verify_password'] ? 'text' : 'password'}
                        name="verify_password"
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
                  </div>
                </fieldset>
                <div className={classes.planner_btn_done_wr}>
                  <input
                    ref={inputSubmit}
                    className={classes.planner_btn_done + ' ' + classes.planner_btn_done_disabled}
                    disabled
                    type="submit"
                    value="Ok"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;
