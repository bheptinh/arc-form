import { useEffect, useState } from 'react';
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
import Button from '../../shared-components/inputs/button';
import DefaultModal from '../../shared-components/modals/default';

const useStyle = createUseStyles({
  planner_popup_wr: {
    maxWidth: 542,
    width: '100%',
  },
  planner_popup_cont: {
    color: 'var(--color-black)',
    backgroundColor: 'var(--color-white)',
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
      color: 'var(--color-text-muted)',
      textAlign: 'center',
      marginBottom: 15,
    },
    '& p': {
      fontSize: 16,
      fontWeight: 400,
      color: 'var(--color-text-muted)',
      textAlign: 'center',
      marginBottom: 30,
    },
  },
  planner_popup_title: {
    fontSize: 25,
    fontWeight: 300,
    marginBottom: 25,
    color: 'var(--color-text-muted)',
    textAlign: 'center',
  },
  planner_popup_text: {
    color: 'var(--color-text-muted)',
    fontSize: 16,
    textAlign: 'center',
    '@media screen and (max-width: 950px)': {
      fontSize: 14,
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
        <DefaultModal.Actions spaced>
          <Button variant="secondary" onClick={onClickCancel} id="login_sent">
            {translation['BUTTON_NO']}
          </Button>
          <Button id="login_sent" onClick={onClickOk}>
            {translation['BUTTON_YES']}
          </Button>
        </DefaultModal.Actions>
      </div>
    </DefaultModal>
  );
};

export default AutoSaveEnable;
