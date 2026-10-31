import { IconCheck } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { closeActivePopup } from '../../redux/features/popups/popupsSlice';
import DefaultModal from '../../shared-components/modals/default';

const useStyle = createUseStyles({
  done_popup_wr: {
    maxWidth: 490,
    width: '100%',
    borderRadius: 6,
  },
  done_popup_cont: {
    color: '#000',
    backgroundColor: '#f1f1f1',
    borderRadius: 6,
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
  },
  done_popup_top: {
    background: '#72C4FF',
    height: 210,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  done_popup_top_icon: {},
  done_popup_bot: {
    padding: '20px 10px 50px',
    textAlign: 'center',
  },
  done_popup_title: {
    color: '#2F2F2F',
    fontSize: 32,
    fontWeight: 300,
    textAlign: 'center',
    marginBottom: 10,
  },
  done_popup_text: {
    color: '#2F2F2F',
    fontSize: 14,
    fontWeight: 300,
    textAlign: 'center',
    marginBottom: 30,
  },
  done_popup_btn: {
    cursor: 'pointer',
    height: '35px',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#2B2B2B',
    fontSize: 14,
    borderRadius: 3,
    padding: '0 20px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    minWidth: 120,
    border: 'none',
    outline: 'none',
    background: '#BBE521',
    textTransform: 'uppercase',
    '&:hover': {
      background: '#8fc32d',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
      height: '26px',
      minWidth: 88,
    },
  },
});
const RenderDone = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const translation = useTranslation();

  const [animPopupClass, setAnimPopupClass] = useState(false);

  const onClickClosePopUp = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'renderMade' })), 500);
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DefaultModal
      visible={animPopupClass}
      zIndex={101}
      className={classes.done_popup_wr}
      contentClassName={classes.done_popup_cont}
      onClose={onClickClosePopUp}
    >
      <div>
        <div className={classes.done_popup_top}>
          <IconCheck size={130} color="#9DD900" className={classes.done_popup_top_icon} />
        </div>
        <div className={classes.done_popup_bot}>
          <div className={classes.done_popup_title}>{translation['RENDER_WELL_DONE']}</div>
          <div
            className={classes.done_popup_text}
            dangerouslySetInnerHTML={{ __html: translation['RENDER_IN_PROGRESS'] }}
          ></div>
          <div className={classes.done_popup_btn} onClick={onClickClosePopUp}>
            {translation['RENDER_CONTINUE']}
          </div>
        </div>
      </div>
    </DefaultModal>
  );
};

export default RenderDone;
