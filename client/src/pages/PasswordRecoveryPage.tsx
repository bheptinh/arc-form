import React, { useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useTranslation } from '../api/hooks/useTranslation';
import { user } from '../initR2D';
import TextInput from '../shared-components/inputs/text-input';
import classes from './PasswordRecoveryPage.module.css';

const PasswordRecoveryPage = () => {
  const translation = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token');
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const submitRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const pass1 = (form.elements.namedItem('new_password') as HTMLInputElement).value;
    const pass2 = (form.elements.namedItem('verify_password') as HTMLInputElement).value;

    if (pass1.length < 6 || pass1.length > 64) {
      setMessage({ text: translation['TEXT_PASSWORD_LENGTH_ERROR'], type: 'error' });
      return;
    }
    if (pass1 !== pass2) {
      setMessage({ text: translation['TEXT_PASSWORDS_NOT_MATCH'], type: 'error' });
      return;
    }

    const result = await user.recoveryPasswordConfirm({ password: pass1 }, token);
    if (result.type === 'error') {
      setMessage({ text: result.data, type: 'error' });
    } else {
      setMessage({ text: translation['USER_ACCOUNT_RESET_P_SUCCESS_TEXT'], type: 'success' });
      setTimeout(() => navigate('/'), 1500);
    }
  };

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (submitRef.current) submitRef.current.disabled = e.target.value.length === 0;
  };

  return (
    <div className={classes.page}>
      <div className={classes.card}>
        <div className={classes.header}>
          <h2 className={classes.title}>{translation['UPDATE_PASSWORD']}</h2>
        </div>
        <div className={classes.body}>
          {message && (
            <p className={`${classes.message} ${classes[message.type]}`}>{message.text}</p>
          )}
          <form onSubmit={onSubmit}>
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
            <div className={classes.actions}>
              <input ref={submitRef} type="submit" className={classes.btn} disabled value="OK" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordRecoveryPage;
