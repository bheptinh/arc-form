import { IconArrowLeft, IconX } from '@tabler/icons-react';
import clsx from 'classnames';
import {
  CSSProperties,
  MouseEvent,
  MouseEventHandler,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
} from 'react';
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
    maxHeight: '90%',
    transform: 'scale(0)',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  defaultModalLayout_wr_titled: {
    maxWidth: 645,
    width: '100%',
  },
  defaultModalLayout_cont: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 6,
    position: 'relative',
    height: '100%',
  },
  defaultModalLayout_cont_titled: {
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
  defaultModalLayout_actions: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  defaultModalLayout_actions_between: {
    justifyContent: 'space-between',
  },
  defaultModalLayout_actions_spaced: {
    marginTop: 17,
  },
});

type DefaultModalProps = PropsWithChildren<{
  title?: string;
  loading?: boolean;
  onClose?: MouseEventHandler<HTMLDivElement>;
  onBack?: MouseEventHandler<HTMLDivElement>;
  visible?: boolean;
  zIndex?: number | string;
  overlay?: ReactNode;
  style?: CSSProperties;
  wrapClassName?: string;
  className?: string;
  contentClassName?: string;
}>;

type DefaultModalActionsProps = PropsWithChildren<{
  align?: 'center' | 'between';
  spaced?: boolean;
}>;

function DefaultModalActions(props: DefaultModalActionsProps) {
  const classes = useStyle();

  return (
    <div
      className={clsx(classes.defaultModalLayout_actions, {
        [classes.defaultModalLayout_actions_between]: props.align === 'between',
        [classes.defaultModalLayout_actions_spaced]: props.spaced,
      })}
    >
      {props.children}
    </div>
  );
}

export default function DefaultModal(props: DefaultModalProps) {
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const classes = useStyle();

  const isControlled = props.visible !== undefined;
  const isVisible = isControlled ? props.visible : animPopupClass;

  const onClickClosePopUp = (e: MouseEvent<HTMLDivElement>) => {
    if (isControlled) {
      props.onClose?.(e);
      return;
    }

    setAnimPopupClass(false);
    setTimeout(() => props?.onClose?.(e), 500);
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

  const backButton = props.onBack && (
    <div className={classes.defaultModalLayout_back} onClick={props.onBack}>
      <IconArrowLeft className={classes.defaultModalLayout_back_icon} size={24} color="#2F2F2F" />
    </div>
  );

  const closeButton = props.onClose && (
    <div className={classes.defaultModalLayout_close} onClick={onClickClosePopUp}>
      <IconX size={24} color="#2F2F2F" className={classes.defaultModalLayout_close_icon} />
    </div>
  );

  return (
    <div
      className={clsx(
        classes.defaultModalLayout_wrap,
        { [classes.defaultModalLayout_wrap_show]: isVisible },
        props.wrapClassName
      )}
      style={props.zIndex === undefined ? undefined : { zIndex: props.zIndex }}
    >
      {props.overlay}

      <div
        className={clsx(
          classes.defaultModalLayout_wr,
          { [classes.defaultModalLayout_wr_titled]: props.title !== undefined },
          props.className
        )}
        style={props.style}
      >
        <div
          className={clsx(
            classes.defaultModalLayout_cont,
            { [classes.defaultModalLayout_cont_titled]: props.title !== undefined },
            props.contentClassName
          )}
        >
          {props.title === undefined ? (
            <>
              {backButton}
              {closeButton}
              {child}
            </>
          ) : (
            <div className={classes.defaultModalLayout_profile_wrap}>
              <div className={classes.defaultModalLayout_profile_top}>
                {backButton}

                <h2 className={classes.defaultModalLayout_title}>{props.title}</h2>

                {closeButton}
              </div>

              <div className={classes.defaultModalLayout_profile_bottom}>{child}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

DefaultModal.Actions = DefaultModalActions;
