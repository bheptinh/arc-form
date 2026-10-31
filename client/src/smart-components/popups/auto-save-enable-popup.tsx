import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { user } from '../../initR2D';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import { setProfileData } from '../../redux/features/user/userSlice';
import DefaultModal from '../../shared-components/modals/default';

const useStyle = createUseStyles({
  planner_popup_wr: {
    maxWidth: 542,
    width: '100%',
  },
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 6,
    height: '100%',
    padding: '29px 60px 67px',
    position: 'relative',
  },
  planner_popup_upgrade_wrap: {
    '& > h2': {
      fontSize: 32,
      fontWeight: 300,
      fontFamily: 'Roboto-Light, sans-serif',
      color: '#373737',
      textAlign: 'center',
      marginBottom: 15,
    },
    '& p': {
      fontSize: 16,
      fontWeight: 400,
      color: '#373737',
      textAlign: 'center',
      marginBottom: 30,
    },
  },
  planner_popup_title: {
    fontSize: 25,
    fontWeight: 300,
    marginBottom: 25,
    color: '#373737',
    textAlign: 'center',
  },
  planner_popup_text: {
    color: '#373737',
    fontSize: 16,
    textAlign: 'center',
    '@media screen and (max-width: 950px)': {
      fontSize: 14,
    },
  },
  planner_btn_done_wrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 17,
  },
  planner_btn: {
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
    outline: 'none',
    background: '#fff',
    textTransform: 'uppercase',
    margin: '0 3px',
    border: '1px solid #000',
    '&:hover': {
      background: '#E9E9E9',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
      height: '26px',
      minWidth: 88,
    },
  },
  planner_btn_done: {
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
    margin: '0 3px',
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

const AutoSaveEnable = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const classes = useStyle();

  const onClickOk = async (e) => {
    const autoSaveUpdateResult = await user.autoSaveUpdate({ auto_save: true });
    autoSaveUpdateResult.type == 'error'
      ? dispatch(setActivePopup({ name: 'alert', data: autoSaveUpdateResult.data }))
      : dispatch(
          setActivePopup({
            name: 'completeMessage',
            data: 'NOTIFY_INFORMATION_SAVED',
            positionX: 'left',
          })
        );
    const response = await user.loadProfileData();
    if (response.type == 'error') dispatch(setActivePopup({ name: 'alert', data: response.data }));
    else dispatch(setProfileData(response));
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'autoSaveEnable' })), 500);
  };

  const onClickCancel = async (e) => {
    const autoSaveUpdateResult = await user.autoSaveUpdate({ auto_save: false });
    autoSaveUpdateResult.type == 'error'
      ? dispatch(setActivePopup({ name: 'alert', data: autoSaveUpdateResult.data }))
      : dispatch(
          setActivePopup({
            name: 'completeMessage',
            data: 'NOTIFY_INFORMATION_SAVED',
            positionX: 'left',
          })
        );
    const response = await user.loadProfileData();
    if (response.type == 'error') dispatch(setActivePopup({ name: 'alert', data: response.data }));
    else dispatch(setProfileData(response));

    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'autoSaveEnable' })), 500);
  };

  const onClickClosePopUp = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'autoSaveEnable' })), 500);
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DefaultModal
      visible={animPopupClass}
      zIndex={popups.autoSaveEnable.zIndex}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
      onClose={onClickClosePopUp}
    >
      <div className={classes.planner_popup_upgrade_wrap}>
        <div className={classes.planner_popup_title}>
          {translation['TITLE_CONFIRM_PROJECT_SAVED']}
        </div>
        <div
          className={classes.planner_popup_text}
          dangerouslySetInnerHTML={{ __html: translation['TEXT_CONFIRM_PROJECT_SAVED'] }}
        ></div>
        <div className={classes.planner_btn_done_wrap}>
          <button className={classes.planner_btn} onClick={onClickCancel} id="login_sent">
            {translation['BUTTON_NO']}
          </button>
          <button className={classes.planner_btn_done} id="login_sent" onClick={onClickOk}>
            {translation['BUTTON_YES']}
          </button>
        </div>
      </div>
    </DefaultModal>
  );
};

export default AutoSaveEnable;
