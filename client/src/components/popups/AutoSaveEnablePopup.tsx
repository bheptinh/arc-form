import { IconX } from '@tabler/icons-react';
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
      transform: 'scale(1)',
    },
  },
  planner_popup_wr: {
    color: '#000',
    maxWidth: 542,
    width: '100%',
    maxHeight: '90%',
    transform: 'scale(0)',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
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
  planner_popup_close: {
    width: 20,
    height: 20,
    position: 'absolute',
    top: 8,
    right: 8,
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
  planner_popup_facebook: {},
  planner_popup_facebook_text: {
    fontSize: '15px',
    color: 'rgb(47, 47, 47)',
    margin: '15px 10px',
    textAlign: 'center',
  },
  planner_popup_facebook_icon: {
    width: '23px',
    margin: 'auto',
    cursor: 'pointer',
    '& img': {
      display: 'block',
    },
  },
  planner_popup_facebook_line: {
    background: 'rgb(217, 217, 217)',
    height: '1px',
    margin: '15px 40px',
  },
  planner_popup_upgrade_wr: {
    marginBottom: '20px',
  },
  input_wrap: {
    padding: '0 65px',
    display: 'grid',
    gridGap: 20,
    border: 'none',
    gridTemplateColumns: 'auto auto',
    alignItems: 'center',
  },
  input_text: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: 14,
    color: 'rgb(68, 68, 68)',
    whiteSpace: 'nowrap',
    textAlign: 'right',
  },
  input_wr: {
    color: '#fff',
    width: 225,
    '&:last-child': {
      marginBottom: '0',
    },
  },
  formInput: {
    paddingLeft: '5px',
    fontSize: '14px',
    color: '#000',
    width: '100%',
    border: '1px solid #e8dede',
    height: '30px',
    background: '#ffffff',
    outline: 'none',
    resize: 'none',
    transition: 'all 0.4s ease-out',
  },
  important_input: {
    '& $formInput': {
      border: '1px solid #e84343 !important',
    },
  },
  planner_popup_report: {
    color: 'red',
    fontSize: '12px',
    marginBottom: '10px',
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
  planner_popup_bottom: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  planner_popup_bottom_link: {
    fontSize: 13,
    color: 'rgb(68, 68, 68)',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'underline',
      textDecorationStyle: 'dashed',
      textUnderlineOffset: '4px',
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
    <div
      className={
        animPopupClass
          ? classes.planner_popup_wrap + ' ' + classes.planner_popup_wrap_show
          : classes.planner_popup_wrap
      }
      style={{ zIndex: popups.autoSaveEnable.zIndex }}
    >
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_cont}>
          <div className={classes.planner_popup_upgrade_wrap}>
            <div
              className={classes.planner_popup_close}
              id="js_close_popup"
              onClick={onClickClosePopUp}
            >
              <IconX size={24} color="#2F2F2F" className={classes.planner_popup_close_icon} />
            </div>
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
        </div>
      </div>
    </div>
  );
};

export default AutoSaveEnable;
