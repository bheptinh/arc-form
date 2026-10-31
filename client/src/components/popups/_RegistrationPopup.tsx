import { IconArrowLeft, IconEye, IconPassword, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { user } from '../../initR2D';
import { updatePreloaderStatus } from '../../redux/features/common/commonSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import Checkbox from '../../shared-components/inputs/checkbox';
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
  const translation = useTranslation();

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
              <IconArrowLeft
                className={classes.planner_popup_back_icon}
                size={16}
                color="#444444"
              />
            </div>

            <div className={classes.planner_popup_close} onClick={onClickClosePopUp}>
              <IconX size={24} color="#2F2F2F" className={classes.planner_popup_close_icon} />
            </div>
            <div className={classes.planner_popup_login_wr}>
              <form onSubmit={onSubmit}>
                <TextInput name="email" type="email" label={translation['TEXT_EMAIL']} required />
                <TextInput
                  name="password"
                  type="password"
                  label={translation['INPUT_TEXT_PASSWORD']}
                  required
                />
                <TextInput
                  name="verify_password"
                  type="password"
                  label={translation['TEXT_VERIFY_PASSWORD']}
                  required
                />
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
