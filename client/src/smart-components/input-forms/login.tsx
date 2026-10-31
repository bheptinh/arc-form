import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

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
import Button from '../../shared-components/inputs/button';
import DefaultModal from '../../shared-components/modals/default';

const useStyle = createUseStyles({
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
  inputForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  input_wrap: {
    width: '100%',
    maxWidth: 400,
    justifyContent: 'space-between',
    margin: '0 auto',
    '@media screen and (max-width: 950px)': {
      padding: '0 15px',
      gridGap: 14,
    },
  },

  planner_popup_bottom: {
    padding: '0 40px',
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
});

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);
  const popupData = popups.login.data;
  const popupType = popups.login.type;

  const isProjectOnlyView = useSelector(selectIsProjectOnlyView);

  const [animPopupClass, setAnimPopupClass] = useState(false);

  const classes = useStyle();

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(updatePreloaderStatus(true));
    const form = e.target;

    const email = form.elements.email;
    const password = form.elements.password;

    const response = await user.tryLogin(email.value, password.value);
    if (response.type == 'error') {
      dispatch(setActivePopup({ name: 'alert', data: response.data }));
      dispatch(updatePreloaderStatus(false));
    } else {
      dispatch(saveLoggedStatus(response));
      setAnimPopupClass(false);

      setTimeout(() => dispatch(closeActivePopup({ name: 'login' })), 500);

      if (popupType == 'buy_plan') {
        if (user.data.plan != 'pro') {
          dispatch(setPopupData({ name: 'payPro', data: popupData }));
        } else {
          setAnimPopupClass(false);
        }

        setTimeout(() => dispatch(closeActivePopup({ name: 'payPro' })), 500);
      }

      if (popupType == 'buy_credits') {
        dispatch(setPopupData({ name: 'buyCredits', data: { creditsNum: popupData } }));
      }

      if (popupType == 'startPopup') {
        navigate('/projects');
      }

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

      if (R2D.mouseInteractionHelper.state?.setIsSelectingModel) {
        R2D.mouseInteractionHelper.state.setIsSelectingModel(
          !isProjectOnlyView || (isProjectOnlyView && isCurrentProjectBelongToUser)
        );
      }
      if (WC.wallsEditor.state.setIsSelectElementsActive) {
        WC.wallsEditor.state.setIsSelectElementsActive(
          !isProjectOnlyView || (isProjectOnlyView && isCurrentProjectBelongToUser)
        );
      }

      dispatch(updateIsProjectBelongToLoggedUser(isCurrentProjectBelongToUser));
      dispatch(updatePreloaderStatus(false));
    }
  };

  const openNewPopup = (name: string) => {
    setAnimPopupClass(false);
    dispatch(setActivePopup({ name }));
    setTimeout(() => dispatch(closeActivePopup({ name: 'login' })), 500);
  };

  const onFacebookLogin = async () => {
    const response = await user.facebookLogin();
    if (response.type == 'error') dispatch(setActivePopup({ name: 'alert', data: response.data }));
    else {
      dispatch(saveLoggedStatus(response));
      setAnimPopupClass(false);
      setTimeout(() => dispatch(closeActivePopup({ name: 'login' })), 500);

      if (popupType == 'buy_plan') {
        if (user.data.plan != 'pro') {
          dispatch(setPopupData({ name: 'payPro', data: popupData }));
        } else {
          setAnimPopupClass(false);
        }

        setTimeout(() => dispatch(closeActivePopup({ name: 'payPro' })), 500);
      }

      if (popupType == 'upgrade_plan' && user.data.plan != 'pro') {
        dispatch(setActivePopup({ name: 'upgradePlan' }));
      }

      if (popupType == 'buy_credits') {
        dispatch(setPopupData({ name: 'buyCredits', data: { creditsNum: popupData } }));
      }

      if (popupType == 'startPopup') {
        navigate('/projects');
      }
    }
  };

  const onGoogleLogin = async () => {
    const response = await user.googleLogin();
    if (response.type == 'error') {
      dispatch(setActivePopup({ name: 'alert', data: response.data }));
    } else {
      dispatch(saveLoggedStatus(response));
      dispatch(closeActivePopup({ name: 'login' }));

      if (popupType == 'buy_plan') {
        if (user.data.plan != 'pro') {
          dispatch(setPopupData({ name: 'payPro', data: popupData }));
        } else {
          setAnimPopupClass(false);
        }

        setTimeout(() => dispatch(closeActivePopup({ name: 'payPro' })), 500);
      }

      if (popupType == 'upgrade_plan' && user.data.plan != 'pro') {
        dispatch(setActivePopup({ name: 'upgradePlan' }));
      }

      if (popupType == 'buy_credits') {
        dispatch(setPopupData({ name: 'buyCredits', data: { creditsNum: popupData } }));
      }

      if (popupType == 'startPopup') {
        navigate('/projects');
      }
    }
  };

  const isFacebookLoginShow = Boolean(R2D.config.data.ui.fb_login);

  return (
    <div>
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

      <div className={classes.planner_popup_login_wr}>
        <form onSubmit={onSubmit} className={classes.inputForm}>
          <TextInput
            inset
            name="email"
            type="email"
            label={translation['INPUT_TEXT_LOGIN']}
            required
            className={classes.input_wrap}
          />

          <TextInput
            inset
            name="password"
            type="password"
            label={translation['INPUT_TEXT_PASSWORD']}
            required
            className={classes.input_wrap}
          />

          <DefaultModal.Actions>
            <Button type="submit" id="login_sent">
              Ok
            </Button>
          </DefaultModal.Actions>
        </form>
      </div>
      <div className={classes.planner_popup_bottom}>
        <span
          className={classes.planner_popup_bottom_link}
          onClick={() => openNewPopup('registration')}
        >
          {translation['TEXT_HEAD_REGISTRATION']}
        </span>
        <span
          className={classes.planner_popup_bottom_link}
          onClick={() => openNewPopup('forgotPassword')}
        >
          {translation['TEXT_FORGOT_PASSWORD']}
        </span>
      </div>
    </div>
  );
}
