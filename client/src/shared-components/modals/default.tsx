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

import classes from './default.module.css';

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
            <div>
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
