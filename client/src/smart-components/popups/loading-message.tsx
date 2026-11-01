import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { selectPopups } from '../../redux/features/popups/popupsSlice';
import classes from './loading-message.module.css';

const LoadingMessagePopup = (props) => {
  const translation = useTranslation();
  const popups = useSelector(selectPopups);
  const [animPopupClass, setAnimPopupClass] = useState(false);

  let text = popups.loadingMessage.data;

  if (popups.loadingMessage.type != 'scene_load_progress') text = translation[text];

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={
        animPopupClass
          ? classes.planner_popup_wrap + ' ' + classes.planner_popup_wrap_show
          : classes.planner_popup_wrap
      }
    >
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_cont}>
          <div className="planner_popup_login_wrap">
            <div className={classes.planner_popup_text}>
              <p dangerouslySetInnerHTML={{ __html: text }}>{}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessagePopup;
