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
import DefaultModal from '../../shared-components/modals/default';
import Button from '../../shared-components/inputs/button';

const useStyle = createUseStyles({
  planner_popup_wr: {
    maxWidth: 645,
    width: '100%',
  },
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#f1f1f1',
    borderRadius: 6,
    position: 'relative',
    height: '100%',
  },
  planner_popup_profile_wrap: {},
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
    <DefaultModal
      visible={animPopupClass}
      zIndex={popups.updatePassword.zIndex}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
      onClose={onClickClosePopUp}
    >
      <div className={classes.planner_popup_profile_wrap}>
        <div className={classes.planner_popup_profile_top}>
          <h2 className={classes.planner_popup_title}>{translation['UPDATE_PASSWORD']}</h2>
        </div>
        <div className={classes.planner_popup_profile_bottom}>
          <form onSubmit={onSubmit}>
            {type == 'update' ? (
              <>
                <TextInput
                  inset
                  name="old_password"
                  type="password"
                  label={translation['OLD_PASSWORD']}
                  onChange={onChangeInput}
                  required
                />
              </>
            ) : null}

            <TextInput
              inset
              name="new_password"
              type="password"
              label={translation['TEXT_NEW_PASSWORD']}
              onChange={onChangeInput}
              required
            />

            <TextInput
              inset
              name="verify_password"
              type="password"
              label={translation['TEXT_VERIFY_PASSWORD']}
              onChange={onChangeInput}
              required
            />

            <DefaultModal.Actions spaced>
              <Button
                ref={inputSubmit}
                className={classes.planner_btn_done_disabled}
                disabled
                type="submit"
              >
                Ok
              </Button>
            </DefaultModal.Actions>
          </form>
        </div>
      </div>
    </DefaultModal>
  );
};

export default UpdatePassword;
