import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { selectPopups } from '../../redux/features/popups/popupsSlice';

const useStyle = createUseStyles({
  planner_popup_wrap: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: '0%',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '101',
    WebkitPerspective: '800px',
    perspective: '800px',
    overflow: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.2)',
  },
  planner_popup_wrap_show: {
    opacity: '1',
    pointerEvents: 'auto',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    '& $planner_popup_wr': {
      transform: 'translateY(0)',
    },
  },
  planner_popup_wr: {
    color: 'var(--color-black)',
    maxHeight: '90%',
    transform: 'translateY(-110%)',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  planner_popup_cont: {
    color: 'var(--color-black)',
    backgroundColor: 'var(--color-white)',
    borderRadius: 6,
    height: '100%',
    padding: '20px 30px',
    position: 'relative',
  },
  planner_popup_text: {
    color: 'rgb(47, 47, 47)',
    fontSize: 15,
    textAlign: 'center',
  },
});

const LoadingMessagePopup = (props) => {
  const translation = useTranslation();
  const popups = useSelector(selectPopups);
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const classes = useStyle();

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
