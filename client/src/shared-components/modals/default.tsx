import { IconArrowLeft, IconX } from '@tabler/icons-react';
import clsx from 'classnames';
import { PropsWithChildren, useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';

const useStyle = createUseStyles({
  defaultModalLayout_wrap: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: '0%',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    opacity: '0',
    pointerEvents: 'none',
    zIndex: 10,
    WebkitPerspective: '800px',
    perspective: '800px',
    overflow: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.2)',
  },
  defaultModalLayout_wrap_show: {
    opacity: '1',
    pointerEvents: 'auto',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    '& $defaultModalLayout_wr': {
      transform: 'scale(1)',
    },
  },
  defaultModalLayout_wr: {
    color: '#000',
    maxWidth: 645,
    width: '100%',
    maxHeight: '90%',
    transform: 'scale(0)',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  defaultModalLayout_cont: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 6,
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
  },
  defaultModalLayout_profile_wrap: {},

  defaultModalLayout_back: {
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
      '& $defaultModalLayout_back_icon': {
        stroke: '#BAE51F',
      },
    },
  },
  defaultModalLayout_back_icon: {
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
  },

  defaultModalLayout_close: {
    width: 20,
    height: 20,
    position: 'absolute',
    top: 8,
    right: 8,
    cursor: 'pointer',
    zIndex: '2',
    '&:hover': {
      '& $defaultModalLayout_close_icon': {
        stroke: '#BAE51F',
      },
    },
    '@media screen and (max-width: 950px)': {
      top: 12,
    },
  },
  defaultModalLayout_close_icon: {
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
  },
  defaultModalLayout_title: {
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
  defaultModalLayout_profile_top: {
    background: '#72C4FF',
    position: 'relative',
    padding: '41px 0',
    '@media screen and (max-width: 950px)': {
      padding: '15px 0',
    },
  },
  defaultModalLayout_profile_bottom: {
    position: 'relative',
    padding: '14px 32px 52px',
    background: '#fff',

    '@media screen and (max-width: 950px)': {
      padding: '14px 16px 30px',
    },
  },
  preloaderDiv: {
    height: '200px',
    width: '100%',
  },
});

type DefaultModalProps = PropsWithChildren<{
  title: string;
  loading?: boolean;
  onClose?: VoidFunction;
  onBack?: VoidFunction;
}>;

export default function DefaultModal(props: DefaultModalProps) {
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const classes = useStyle();

  const onClickClosePopUp = () => {
    setAnimPopupClass(false);
    setTimeout(() => props?.onClose?.(), 500);
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const child = props.loading ? (
    <div className={classes.preloaderDiv}>
      <div className="preloader">
        <div className="preloader-cube"></div>
      </div>
    </div>
  ) : (
    props.children
  );

  return (
    <div
      className={clsx({
        [classes.defaultModalLayout_wrap]: true,
        [classes.defaultModalLayout_wrap_show]: animPopupClass,
      })}
    >
      <div className={classes.defaultModalLayout_wr}>
        <div className={classes.defaultModalLayout_cont}>
          <div className={classes.defaultModalLayout_profile_wrap}>
            <div className={classes.defaultModalLayout_profile_top}>
              {props.onBack && (
                <div className={classes.defaultModalLayout_back} onClick={props.onBack}>
                  <IconArrowLeft
                    className={classes.defaultModalLayout_back_icon}
                    size={24}
                    color="#2F2F2F"
                  />
                </div>
              )}

              <h2 className={classes.defaultModalLayout_title}>{props.title}</h2>

              <div className={classes.defaultModalLayout_close} onClick={onClickClosePopUp}>
                <IconX
                  size={24}
                  color="#2F2F2F"
                  className={classes.defaultModalLayout_close_icon}
                />
              </div>
            </div>

            <div className={classes.defaultModalLayout_profile_bottom}>{child}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
