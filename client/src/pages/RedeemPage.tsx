import { ReactElement, useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useTranslation } from '../api/hooks/useTranslation';
import { user } from '../initR2D';
import { selectIsLogged, setProfileData } from '../redux/features/user/userSlice';

type Status = 'loading' | 'success' | 'error' | 'unauthenticated' | 'invalid';

const useStyle = createUseStyles({
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f1f1f1',
    fontFamily: 'Roboto, sans-serif',
  },
  card: {
    background: '#fff',
    borderRadius: 6,
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    width: '100%',
    maxWidth: 480,
    overflow: 'hidden',
  },
  header: {
    background: '#72C4FF',
    padding: '41px 0',
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 300,
    color: '#fff',
    margin: 0,
  },
  body: {
    padding: '40px 60px',
    textAlign: 'center',
    fontSize: 14,
    color: '#2f2f2f',
    lineHeight: 1.6,
  },
  message: {
    marginBottom: 24,
  },
  success: { color: '#38a169' },
  error: { color: '#e53e3e' },
  btn: {
    display: 'inline-block',
    cursor: 'pointer',
    height: 35,
    lineHeight: '35px',
    color: '#2B2B2B',
    fontSize: 14,
    borderRadius: 3,
    padding: '0 20px',
    border: 'none',
    outline: 'none',
    background: '#BBE521',
    textTransform: 'uppercase',
    textDecoration: 'none',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': { background: '#8fc32d' },
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid #e8e8e8',
    borderTop: '3px solid #BBE521',
    borderRadius: '50%',
    animation: '$spin 0.8s linear infinite',
    margin: '0 auto 16px',
  },
  '@keyframes spin': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
});

export default function RedeemPage() {
  const classes = useStyle();
  const translation = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLogged = useSelector(selectIsLogged);

  const code = searchParams.get('code');
  const [status, setStatus] = useState<Status>(code ? 'loading' : 'invalid');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!code) return;

    if (!isLogged) {
      setStatus('unauthenticated');
      return;
    }

    (async () => {
      const result = await user.promoLoad(code);
      if (result.type === 'error') {
        setStatus('error');
        setMessage(result.data);
      } else {
        const profileResponse = await user.loadProfileData();
        if (profileResponse.type !== 'error') dispatch(setProfileData(profileResponse));
        setStatus('success');
        setMessage(result.message);
        setTimeout(() => navigate('/projects'), 2000);
      }
    })();
  }, []);

  const content: Record<Status, { heading: string; body: () => ReactElement }> = {
    loading: {
      heading: translation['TEXT_WAIT'] || 'Please wait',
      body: () => <div className={classes.spinner} />,
    },
    success: {
      heading: translation['PLAN_UPGRADE_SUCCESS_TEXT'] || 'Done!',
      body: () => (
        <>
          <p className={`${classes.message} ${classes.success}`}>{message}</p>
          <p className={classes.message}>{translation['TEXT_REDIRECT'] || 'Redirecting…'}</p>
        </>
      ),
    },
    error: {
      heading: translation['TEXT_ERROR'] || 'Something went wrong',
      body: () => (
        <>
          <p className={`${classes.message} ${classes.error}`}>{message}</p>
          <a className={classes.btn} href="/projects">
            {translation['BUTTON_BACK'] || 'Go back'}
          </a>
        </>
      ),
    },
    unauthenticated: {
      heading: translation['TEXT_LOGIN'] || 'Log in required',
      body: () => (
        <>
          <p className={classes.message}>
            Log in first, then open this link again to apply your code.
          </p>
          <a className={classes.btn} href="/projects">
            {translation['TEXT_LOGIN'] || 'Go to app'}
          </a>
        </>
      ),
    },
    invalid: {
      heading: translation['TEXT_ERROR'] || 'Invalid link',
      body: () => (
        <>
          <p className={`${classes.message} ${classes.error}`}>No promo code found in this link.</p>
          <a className={classes.btn} href="/projects">
            {translation['BUTTON_BACK'] || 'Go back'}
          </a>
        </>
      ),
    },
  };

  const { heading, body: Body } = content[status];

  return (
    <div className={classes.page}>
      <div className={classes.card}>
        <div className={classes.header}>
          <h2 className={classes.title}>{heading}</h2>
        </div>
        <div className={classes.body}>
          <Body />
        </div>
      </div>
    </div>
  );
}
