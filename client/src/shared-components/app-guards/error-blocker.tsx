import { createUseStyles } from 'react-jss';

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

interface ErrorBlockerProps {
  translation: { [key: string]: string };
  onRetry?: () => void;
}

export default function ErrorBlocker({ translation, onRetry }: ErrorBlockerProps) {
  const classes = useStyle();

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
      <button className={classes.button} onClick={onRetry}>
        {translation['ERROR_RESTORE_MY_PROJECT']}
      </button>
    </div>
  );
}
