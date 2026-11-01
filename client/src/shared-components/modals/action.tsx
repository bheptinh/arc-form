import clsx from 'classnames';
import { useEffect, useState } from 'react';

import { useTranslation } from '../../api/hooks/useTranslation';
import classes from './action.module.css';

type ActionModalProps = {
  content: string;
  onConfirm?: VoidFunction;
  onCancel?: VoidFunction;
};

export default function ActionModal(props: ActionModalProps) {
  const translation = useTranslation();
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const handleConfirm = () => {
    setAnimPopupClass(false);
    setTimeout(() => props.onConfirm?.(), 500);
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={clsx(classes.planner_popup_wrap, {
        [classes.planner_popup_wrap_show]: animPopupClass,
      })}
    >
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_cont}>
          <div className="planner_popup_login_wrap">
            <div className={classes.text}>
              <p
                dangerouslySetInnerHTML={{
                  __html: props.content,
                }}
              ></p>
            </div>
            <div className={classes.planner_btn_done_wrap}>
              <div className={classes.planner_btn_done} onClick={handleConfirm}>
                {translation['BUTTON_OK'] as string}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
