import { createUseStyles } from 'react-jss';

const useStyle = createUseStyles({
  content_portret: {
    background: 'var(--color-info)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    padding: '0 20px',
    zIndex: 200,
    position: 'absolute',
    left: 0,
    top: 0,

    '& h1': {
      fontSize: 36,
      fontWeight: 400,
      lineHeight: '42.19px',
      textAlign: 'center',
      color: 'var(--color-white)',
      marginBottom: 10,
    },
    '& p': {
      fontSize: 18,
      fontWeight: 400,
      lineHeight: '21.09px',
      textAlign: 'center',
      color: 'var(--color-white)',
    },
  },

  content_portrait_img: {
    margin: '40px 0',
  },
});

interface PortraitBlockerProps {
  translation: { [key: string]: string };
}

export default function PortraitBlocker({ translation }: PortraitBlockerProps) {
  const classes = useStyle();

  return (
    <div className={classes.content_portret}>
      <h1>{translation['ORIENTATION_PORTRAIT_WARNING']}</h1>
      <p>{translation['ORIENTATION_PORTRAIT_TEXT_1']}</p>
      <div className={classes.content_portrait_img}>
        <img src="/src_designer/images/icon_portrait_landscape.svg" />
      </div>
      <p>{translation['ORIENTATION_PORTRAIT_TEXT_2']}</p>
    </div>
  );
}
