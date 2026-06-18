import { IconX } from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { user } from '../../initR2D';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import TextInput from '../../shared-components/inputs/text-input';
import { createProjectUrl } from '../../utils/UrlHelper';

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

  const onChangeInput = (e) => {
    if (e.target.value == 0) {
      inputSubmit.current.setAttribute('disabled', '');
      inputSubmit.current.classList.add(classes.planner_btn_done_disabled);
    } else {
      inputSubmit.current.removeAttribute('disabled');
      inputSubmit.current.classList.remove(classes.planner_btn_done_disabled);
    }
  };

  const onClickClosePopUp = () => {
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
                <IconX size={24} color="#2F2F2F" className={classes.planner_popup_close_icon} />
              </div>
            </div>
            <div className={classes.planner_popup_profile_bottom}>
              <form onSubmit={onSubmit}>
                {type == 'update' ? (
                  <>
                    <TextInput
                      name="old_password"
                      type="password"
                      label={translation['OLD_PASSWORD']}
                      onChange={onChangeInput}
                      required
                    />
                  </>
                ) : null}

                <TextInput
                  name="new_password"
                  type="password"
                  label={translation['TEXT_NEW_PASSWORD']}
                  onChange={onChangeInput}
                  required
                />

                <TextInput
                  name="verify_password"
                  type="password"
                  label={translation['TEXT_VERIFY_PASSWORD']}
                  onChange={onChangeInput}
                  required
                />

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
