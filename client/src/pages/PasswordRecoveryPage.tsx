import React, { useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useTranslation } from '../api/hooks/useTranslation';
import { user } from '../initR2D';
import TextInput from '../shared-components/inputs/text-input';

const useStyle = createUseStyles({
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-surface-subtle)',
    fontFamily: 'Roboto, sans-serif',
  },
  card: {
    background: 'var(--color-white)',
    borderRadius: 6,
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    width: '100%',
    maxWidth: 480,
    overflow: 'hidden',
  },
  header: {
    background: 'var(--color-info-light)',
    padding: '41px 0',
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 300,
    color: 'var(--color-white)',
    margin: 0,
  },
  body: {
    padding: '30px 60px 40px',
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  error: { color: '#e53e3e' },
  success: { color: '#38a169' },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 24,
  },
  btn: {
    cursor: 'pointer',
    height: 35,
    color: 'var(--color-text-strong)',
    fontSize: 14,
    borderRadius: 3,
    padding: '0 20px',
    minWidth: 120,
    border: 'none',
    outline: 'none',
    background: 'var(--color-accent-bright)',
    textTransform: 'uppercase',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': { background: 'var(--color-accent-hover)' },
    '&:disabled': { background: '#cccccc', color: '#666', cursor: 'default' },
  },
});

const PasswordRecoveryPage = () => {
  const classes = useStyle();
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
