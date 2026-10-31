import React, { useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../initR2D';
import { closeActivePopup, selectPopups } from '../../redux/features/popups/popupsSlice';
import { useLanguages } from '../../api/hooks/useLanguages';
import DefaultModal from '../../shared-components/modals/default';

const useStyle = createUseStyles({
  planner_popup_wr: {
    width: '100%',
    height: '100%',
    maxHeight: 'none',
    boxShadow: 'none',
  },
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#f1f1f1',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: 0,
    '& iframe': {
      border: 0,
    },
  },
});

const Tour360CreatePopup = (props) => {
  const dispatch = useDispatch();
  const popups = useSelector(selectPopups);

  const languages = useLanguages();
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
    <DefaultModal
      zIndex={999}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
    >
      <iframe
        src={iframeSrc}
        datatype="window-iframe"
        id="dialog-iframe"
        width={'100%'}
        height={'100%'}
      ></iframe>
    </DefaultModal>
  );
};

export default Tour360CreatePopup;
