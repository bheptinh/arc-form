import { IconEye, IconPassword, IconX } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { planner, user } from '../../initR2D';
import {
  selectIsProjectOnlyView,
  updateIsProjectBelongToLoggedUser,
  updatePreloaderStatus,
} from '../../redux/features/common/commonSlice';
import { changeActiveControlPanelMode } from '../../redux/features/control/controlPanelSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
  setPopupData,
} from '../../redux/features/popups/popupsSlice';
import { removeQuickPanelAll } from '../../redux/features/quickPanels/quickPanelsSlice';
import { saveLoggedStatus } from '../../redux/features/user/userSlice';
import TextInput from '../../shared-components/inputs/text-input';

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
    '@media screen and (max-width: 950px)': {
      padding: 14,
    },
  },
  planner_popup_login_wrap: {},
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
  planner_popup_facebook: {},
  planner_popup_facebook_text: {
    color: '#373737',
    fontSize: 16,
    textAlign: 'center',
    margin: '15px 10px',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      margin: '14px 10px',
    },
  },
  planner_popup_facebook_google_icons_wr: {
    display: 'flex',
    justifyContent: 'center',
  },
  planner_popup_facebook_icon: {
    width: '23px',
    margin: '0 10px',
    cursor: 'pointer',
    '& img': {
      display: 'block',
    },
  },
  planner_popup_facebook_line: {
    background: 'rgb(217, 217, 217)',
    height: '1px',
    margin: '15px 40px',
  },
  planner_popup_login_wr: {
    marginBottom: '20px',
    '@media screen and (max-width: 950px)': {
      marginBottom: '10px',
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
  input_wrap_password: {
    margin: '20px 0 25px',
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
    maxWidth: 225,
    width: '100%',
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
      height: 26,
      fontSize: 11,
    },
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
  planner_popup_bottom: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  planner_popup_bottom_link: {
    fontSize: 14,
    color: '#66ACF4',
    textDecoration: 'underline',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'none',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  input_pass_btn: {
    position: 'absolute',
    top: 5,
    right: 80,
    cursor: 'pointer',
  },
});

const LoginPopup = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);
  const popupData = popups.login.data;
  const popupType = popups.login.type;

  const isProjectOnlyView = useSelector(selectIsProjectOnlyView);

  const [isFacebookLoginShow, setIsFacebookLoginShow] = useState(R2D.config.data.ui.fb_login);
  const [animPopupClass, setAnimPopupClass] = useState(false);
  const [iconPasswordStatus, setIconPasswordStatus] = useState(false);

  const classes = useStyle();

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(updatePreloaderStatus(true));
    const form = e.target;

    const email = form.elements.email;
    const password = form.elements.password;

    const responce = await user.tryLogin(email.value, password.value);
    if (responce.type == 'error') {
      dispatch(setActivePopup({ name: 'alert', data: responce.data }));
      dispatch(updatePreloaderStatus(false));
    } else {
      dispatch(saveLoggedStatus(responce));
      setAnimPopupClass(false);

      setTimeout(() => dispatch(closeActivePopup({ name: 'login' })), 500);

      if (popupType == 'buy_plan') {
        user.data.plan != 'pro'
          ? dispatch(setPopupData({ name: 'payPro', data: popupData }))
          : setAnimPopupClass(false);
        setTimeout(() => dispatch(closeActivePopup({ name: 'payPro' })), 500);
      }

      popupType == 'buy_credits' &&
        dispatch(setPopupData({ name: 'buyCredits', data: { creditsNum: popupData } }));

      popupType == 'startPopup' && dispatch(setActivePopup({ name: 'projectsPopup' }));

      const isCurrentProjectBelongToUser = R2D.scene.getProjectUserKey() == user.getKey();
      planner.scene.setIsProjectBelongToLoggedUserStatus(isCurrentProjectBelongToUser);

      if (
        R2D.scene.viewOnly &&
        !isCurrentProjectBelongToUser &&
        R2D.mouseInteractionHelper.state.name != 'stateMain'
      ) {
        planner.mih().unsetActiveObject();
        planner.mih().changeState(planner.mih().stateMain);

        dispatch(removeQuickPanelAll());
        dispatch(changeActiveControlPanelMode({ mode: 'to2d3d' }));
      }

      R2D.mouseInteractionHelper.state?.setIsSelectingModel &&
        R2D.mouseInteractionHelper.state.setIsSelectingModel(
          !isProjectOnlyView || (isProjectOnlyView && isCurrentProjectBelongToUser)
        );
      WC.wallsEditor.state.setIsSelectElementsActive &&
        WC.wallsEditor.state.setIsSelectElementsActive(
          !isProjectOnlyView || (isProjectOnlyView && isCurrentProjectBelongToUser)
        );
      dispatch(updateIsProjectBelongToLoggedUser(isCurrentProjectBelongToUser));
      dispatch(updatePreloaderStatus(false));

    }
  };

  const onTapToClose = (e) => {
    if (!e.target.closest('.' + classes.planner_popup_wr)) {
      document.removeEventListener('touchend', onTapToClose);
      setAnimPopupClass(false);
      setTimeout(() => dispatch(closeActivePopup({ name: 'login' })), 500);
    }
  };

  const onClickClosePopUp = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'login' })), 500);
  };

  const openNewPopup = (name) => {
    setAnimPopupClass(false);
    dispatch(setActivePopup({ name }));
    setTimeout(() => dispatch(closeActivePopup({ name: 'login' })), 500);
  };
  const onFacebookLogin = async (e) => {
    const response = await user.facebookLogin();
    if (response.type == 'error') dispatch(setActivePopup({ name: 'alert', data: response.data }));
    else {
      dispatch(saveLoggedStatus(response));
      setAnimPopupClass(false);
      setTimeout(() => dispatch(closeActivePopup({ name: 'login' })), 500);
      if (popupType == 'buy_plan') {
        user.data.plan != 'pro'
          ? dispatch(setPopupData({ name: 'payPro', data: popupData }))
          : setAnimPopupClass(false);
        setTimeout(() => dispatch(closeActivePopup({ name: 'payPro' })), 500);
      }
      popupType == 'buy_credits' &&
        dispatch(setPopupData({ name: 'buyCredits', data: { creditsNum: popupData } }));

      popupType == 'startPopup' && dispatch(setActivePopup({ name: 'projectsPopup' }));

      popupType == 'upgrade_plan' &&
        user.data.plan != 'pro' &&
        dispatch(setActivePopup({ name: 'upgradePlan' }));
    }
  };

  const onGoogleLogin = async (e) => {
    const response = await user.googleLogin();
    if (response.type == 'error') {
      dispatch(setActivePopup({ name: 'alert', data: response.data }));
    } else {
      dispatch(saveLoggedStatus(response));
      dispatch(closeActivePopup({ name: 'login' }));

      if (popupType == 'buy_plan') {
        user.data.plan != 'pro'
          ? dispatch(setPopupData({ name: 'payPro', data: popupData }))
          : setAnimPopupClass(false);
        setTimeout(() => dispatch(closeActivePopup({ name: 'payPro' })), 500);
      }
      popupType == 'buy_credits' &&
        dispatch(setPopupData({ name: 'buyCredits', data: { creditsNum: popupData } }));

      popupType == 'startPopup' && dispatch(setActivePopup({ name: 'projectsPopup' }));

      popupType == 'upgrade_plan' &&
        user.data.plan != 'pro' &&
        dispatch(setActivePopup({ name: 'upgradePlan' }));
    }
  };

  const onRadioPasswordShowStatus = (e) => setIconPasswordStatus(!iconPasswordStatus);

  useEffect(() => {
    setIsFacebookLoginShow(R2D.config.data.ui.fb_login);
  }, [R2D.config.data.ui.fb_login]);

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
      style={{ zIndex: popups.login.zIndex }}
    >
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_cont}>
          <div className={classes.planner_popup_login_wrap}>
            {isFacebookLoginShow ? (
              <div className={classes.planner_popup_facebook}>
                <div className={classes.planner_popup_facebook_text}>
                  {translation['TEXT_SIGN_IN_WITH']}
                </div>

                <div className={classes.planner_popup_facebook_google_icons_wr}>
                  <div className={classes.planner_popup_facebook_icon} onClick={onFacebookLogin}>
                    <img src="/src_designer/images/icon_facebook.svg" />
                  </div>
                  <div className={classes.planner_popup_facebook_icon} onClick={onGoogleLogin}>
                    <img src="/src_designer/images/google.svg" />
                  </div>
                </div>
                <div className={classes.planner_popup_facebook_line}></div>
                <div className={classes.planner_popup_facebook_text}>
                  {translation['TEXT_SIGN_IN_OR']}
                </div>
              </div>
            ) : null}
            <div className={classes.planner_popup_close} onClick={onClickClosePopUp}>
              <IconX size={24} color="#2F2F2F" className={classes.planner_popup_close_icon} />
            </div>
            <div className={classes.planner_popup_login_wr}>
              <form onSubmit={onSubmit}>
                <TextInput
                  name="email"
                  type="email"
                  label={translation['INPUT_TEXT_LOGIN']}
                  required
                  className={classes.input_wrap}
                />

                <TextInput
                  name="password"
                  type="password"
                  label={translation['INPUT_TEXT_PASSWORD']}
                  required
                  className={classes.input_wrap + ' ' + classes.input_wrap_password}
                />

                <fieldset className={classes.planner_btn_done_wrap}>
                  <input
                    type="submit"
                    className={classes.planner_btn_done}
                    id="login_sent"
                    value="Ok"
                  />
                </fieldset>
              </form>
            </div>
            <div className={classes.planner_popup_bottom}>
              <span
                className={classes.planner_popup_bottom_link}
                onClick={(e) => openNewPopup('registration')}
              >
                {translation['TEXT_HEAD_REGISTRATION']}
              </span>
              <span
                className={classes.planner_popup_bottom_link}
                onClick={(e) => openNewPopup('forgotPassword')}
              >
                {translation['TEXT_FORGOT_PASSWORD']}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
