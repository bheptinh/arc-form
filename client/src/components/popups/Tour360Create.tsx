import React, { useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../initR2D';
import { selectLanguages } from '../../redux/features/language/languageSlice';
import { closeActivePopup, selectPopups } from '../../redux/features/popups/popupsSlice';

const useStyle = createUseStyles({
  planner_popup_wrap: {
    height: '100%',
    width: '100%',
    zIndex: 999,
    position: 'absolute',
    top: '0%',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    opacity: '0',
    pointerEvents: 'none',
    WebkitPerspective: '800px',
    perspective: '800px',
    overflow: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.2)',
  },
  planner_popup_wrap_show: {
    top: '0',
    opacity: '1',
    pointerEvents: 'auto',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  planner_popup_wr: {
    color: '#000',
    width: '100%',
    height: '100%',
  },
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#f1f1f1',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    height: '100%',
    '& iframe': {
      border: 0,
    },
  },
  shadow_planner_pop_top_left: {
    position: 'absolute',
    top: '0',
    left: '0',
    pointerEvents: 'none',
  },
  shadow_planner_pop_bot_right: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    pointerEvents: 'none',
  },
  text: {
    color: 'rgb(47, 47, 47)',
    margin: '0 10px 15px',
    fontSize: 15,
    textAlign: 'center',
  },
  planner_btn_done_wrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planner_btn_done: {
    background: '#828282',
    cursor: 'pointer',
    height: '25px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    fontSize: '12px',
    padding: '0 20px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    margin: '0 10px',
    minWidth: '94px',
    border: 'none',
    outline: 'rgb(217, 217, 217) solid 1px',
    '&:hover': {
      background: '#8fc32d',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
      height: '26px',
      minWidth: 88,
    },
  },
  planner_popup_close: {
    width: '20px',
    height: '20px',
    position: 'absolute',
    top: '10px',
    right: '10px',
    cursor: 'pointer',
    zIndex: '2',
    '& path': {
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover': {
      '& path': {
        fill: '#a0a0a0',
      },
    },
  },
  planner_popup_close_icon: {
    width: '100%',
  },
});

const Tour360CreatePopup = (props) => {
  const dispatch = useDispatch();
  const popups = useSelector(selectPopups);

  const languages = useSelector(selectLanguages);
  const currLanguage = languages.find((i) => i.current == 1).code;

  const popupData = popups.tour360Create.data;

  const iframeSrc = popupData
    ? R2D.URL.DOMAIN + popupData
    : R2D.URL.DOMAIN + `/tours/add?lang=${currLanguage}`;

  const receiveMessage = (event) => {
    let dataObj;
    if (
      (event.data.source &&
        typeof event.data.source.startsWith == 'function' &&
        event.data.source.startsWith('react')) ||
      (event.data &&
        typeof event.data.startsWith == 'function' &&
        event.data.startsWith('/*framebus*/'))
    )
      return;
    try {
      dataObj = JSON.parse(event.data);
    } catch (error) {
      console.error('Error parse JSON string!');
      return;
    }

    if (dataObj.action == 'tour_360_cancel') dispatch(closeActivePopup({ name: 'tour360Create' }));
    if (dataObj.action == 'tour_360_save') {
      planner.apiScene.dispatchEvent(new Event(planner.apiScene.UPDATE_TOURS, {}));
      dispatch(closeActivePopup({ name: 'tour360Create' }));
    }
  };
  useEffect(() => {
    window.addEventListener('message', receiveMessage, false);
    return () => window.removeEventListener('message', receiveMessage, false);
  }, []);

  const classes = useStyle();
  return (
    <div className={classes.planner_popup_wrap + ' ' + classes.planner_popup_wrap_show}>
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_cont}>
          <iframe
            src={iframeSrc}
            datatype="window-iframe"
            id="dialog-iframe"
            width={'100%'}
            height={'100%'}
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Tour360CreatePopup;
