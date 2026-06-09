import React, { useEffect } from 'react';
import { createUseStyles } from 'react-jss';
// import Face from './images/face.svg';
import { useSelector } from 'react-redux';

import { selectTranslation } from '../../redux/features/language/languageSlice';

const useStyle = createUseStyles({
  container: {
    background: 'linear-gradient(180deg, #1AC8FF 0%, rgba(114, 196, 255, 0.00) 100%)',
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  icon: {
    width: 167,
    height: 167,
    flexShrink: 0,
  },
  title: {
    color: '#4C5D67',
    fontFamily: 'Roboto, sans-serif',
    fontSize: '58px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: 'normal',
    marginTop: 76,
  },
  iconWrapper: {
    color: '#4C5D67',
    fontFamily: 'Roboto, sans-serif',
    fontSize: '58px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: 'normal',
  },
  someText: {
    color: '#4C5D67',
    fontFamily: 'Roboto, sans-serif',
    fontSize: '23px',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: '35px',
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    background: '#9DD900',
    border: 'none',
    width: '341px',
    minHeight: '75px',
    flexShrink: 0,
    color: '#FFF',
    fontFamily: 'Roboto, sans-serif',
    fontSize: '23px',
    fontStyle: 'normal',
    fontWeight: '500',
    lineHeight: '61.5px',
    textTransform: 'uppercase',
    marginTop: 40,
    cursor: 'pointer',
    padding: 10,
  },
});

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const classes = useStyle();

  const translation = useSelector(selectTranslation);

  useEffect(() => {
    R2D.Storage.save('r2d_is_error_occured', true);

    try {
      fetch('/api/planner/bug_report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-token': R2D.token,
        },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          project: R2D.controller.getProjectId(),
          url: window.location.href,
        }),
      });
      console.error('[ErrorBoundary]', error);
    } catch (e) {
      console.log(e);
    }
  }, []);

  const restart = () => {
    window.location.reload();
  };

  return (
    <div role="alert" className={classes.container}>
      <div className={classes.iconWrapper}>
        <img src="/public/face.svg" className={classes.icon} />
        <span>{translation['ERROR_OH_NO']}</span>
      </div>
      <div className={classes.title}>{translation['ERROR_SOMETHING_WENT_WRONG']}</div>
      <div className={classes.someText}>
        {translation['ERROR_WELL_TRY_TO_RESTORE_YOUR_PROJECT']}
        <br />
        {translation['ERROR_PLEASE_SAVE_IT']}
      </div>
      <button className={classes.button} onClick={restart}>
        {translation['ERROR_RESTORE_MY_PROJECT']}
      </button>
    </div>
  );
};

export default ErrorFallback;
