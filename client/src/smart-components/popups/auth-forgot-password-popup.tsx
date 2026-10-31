// FIXME: remove unused imports (React, useEffect, useState, useSelector).
import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { user } from '../../initR2D';
import { updatePreloaderStatus } from '../../redux/features/common/commonSlice';
import { closeActivePopup, setActivePopup } from '../../redux/features/popups/popupsSlice';
import TextInput from '../../shared-components/inputs/text-input';
import DefaultModal from '../../shared-components/modals/default';

const useStyle = createUseStyles({
  formContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    maxWidth: 400,
    margin: '0 auto',
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

export default function AuthForgotPasswordPopup() {
  const dispatch = useDispatch();
  const translation = useTranslation();

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

  const onClickBack = () => {
    dispatch(setActivePopup({ name: 'login' }));
    setTimeout(() => dispatch(closeActivePopup({ name: 'forgotPassword' })), 500);
  };

  return (
    <DefaultModal
      title={translation['TEXT_FORGOT_PASSWORD']}
      onClose={() => dispatch(closeActivePopup({ name: 'forgotPassword' }))}
      onBack={onClickBack}
    >
      <form onSubmit={onSubmit} className={classes.formContent}>
        <TextInput name="email" type="email" label={translation['INPUT_TEXT_LOGIN']} required />

        <fieldset className={classes.planner_btn_done_wrap}>
          <input
            type="submit"
            className={classes.planner_btn_done}
            id="login_sent"
            value={translation['BUTTON_OK']}
          />
        </fieldset>
      </form>
    </DefaultModal>
  );
}
