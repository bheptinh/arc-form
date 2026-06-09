import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner, user } from '../../initR2D';
import {
  updateIsProjectBelongToLoggedUser,
  updatePreloaderStatus,
} from '../../redux/features/common/commonSlice';
import {
  changeActiveControlPanelMode,
  updateDynamicPanelStatus,
  updateDynamicToggleButtonStatus,
} from '../../redux/features/control/controlPanelSlice';
import { selectTranslation } from '../../redux/features/language/languageSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import { removeQuickPanelAll } from '../../redux/features/quickPanels/quickPanelsSlice';
import { userLogout } from '../../redux/features/user/userSlice';

const delete_account_text = {
  color: '#2F2F2F',
  fontSize: 16,
  textAlign: 'center',
  color: '#373737',
};

const useStyle = createUseStyles({
  delete_account_wrap: {
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
  delete_account_wrap_show: {
    opacity: '1',
    pointerEvents: 'auto',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    '& $delete_account_wr': {
      transform: 'scale(1)',
    },
  },
  delete_account_wr: {
    color: '#000',
    maxWidth: 700,
    width: '100%',
    maxHeight: '90%',
    transform: 'scale(0)',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  delete_account_cont: {
    color: '#000',
    backgroundColor: '#f1f1f1',
    borderRadius: 6,
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
  },
  delete_account_login_wrap: {},
  delete_account_close: {
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
        fill: '#BAE51F',
      },
    },
  },
  delete_account_close_icon: {
    width: '100%',
  },
  delete_account_top: {
    background: '#72C4FF',
    height: 210,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  delete_account_top_icon: {},
  delete_account_bot: {
    padding: '80px 110px',
    textAlign: 'center',
  },
  delete_account_text: {
    extend: delete_account_text,
    marginBottom: 20,
  },
  delete_account_subtext: {
    extend: delete_account_text,
    marginBottom: 30,
  },
  delete_account_btn: {
    '& input': {
      padding: '8px 10px',
      background: 'transparent',
      border: '1px solid #C8C8C8',
      color: '#A7A7A7',
      textTransform: 'uppercase',
      borderRadius: 3,
      fontSize: 14,
    },
  },
  delete_account_fieldset: {
    display: 'flex',
    justifyContent: 'center',
  },
  delete_account_input_ready: {
    '& input': {
      border: '1px solid #AF3131',
      background: '#AF3131',
      color: '#ffffff',
      transition: 'all .5s ease',
      cursor: 'pointer',
    },
  },
  delete_account_input: {
    marginRight: 4,
    '& input': {
      borderRadius: 2.5,
      padding: '8px 10px',
      border: '1px solid #E6E6E6',
      transition: 'all .5s ease',
    },
  },
  delete_account_close: {
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
        fill: '#BAE51F',
      },
    },
    '@media screen and (max-width: 950px)': {
      top: 12,
    },
  },
  delete_account_close_icon: {
    width: '100%',
  },
  delete_account_title: {
    fontSize: 32,
    lineHeight: '100%',
    letterSpacing: '-3%',
  },
});

const DeleteAccountPopup = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const translation = useSelector(selectTranslation);
  const popups = useSelector(selectPopups);
  const data = popups.deleteAccountPopup.data;

  const [animPopupClass, setAnimPopupClass] = useState(false);
  const popupState = data || 'confirm';

  const onClickClosePopUp = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'deleteAccountPopup' })), 500);
  };

  const onChangeInput = (e) => {
    const inputBtn = document.querySelector('.' + classes.delete_account_btn);
    if (e.target.value == 'DELETE') {
      inputBtn.classList.add(classes.delete_account_input_ready);
    } else {
      inputBtn.classList.contains(classes.delete_account_input_ready) &&
        inputBtn.classList.remove(classes.delete_account_input_ready);
    }
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    if (e.target.elements.deleteAccountText.value == 'DELETE') {
      dispatch(updatePreloaderStatus(true));

      const result = await user.accountDelete();
      if (result?.error) {
        dispatch(updatePreloaderStatus(false));
        return dispatch(
          setActivePopup({ name: 'alert', data: result?.data || 'TEXT_ERROR_LOAD_DATA' })
        );
      }

      dispatch(userLogout());

      planner.scene.setIsProjectBelongToLoggedUserStatus(false);
      dispatch(updateIsProjectBelongToLoggedUser(false));

      if (planner.scene.getProjectOnlyViewState()) {
        planner.mih().unsetActiveObject();
        planner.mih().changeState(planner.mih().stateMain);
        dispatch(removeQuickPanelAll());

        R2D.mouseInteractionHelper.state.setIsSelectingModel &&
          R2D.mouseInteractionHelper.state.setIsSelectingModel(false);
        WC.wallsEditor.state.setIsSelectElementsActive &&
          WC.wallsEditor.state.setIsSelectElementsActive(false);
        dispatch(updateDynamicToggleButtonStatus(false));
        dispatch(updateDynamicPanelStatus(false));
        dispatch(changeActiveControlPanelMode({ mode: 'to2d3d' }));
      }

      dispatch(updatePreloaderStatus(false));
      onClickClosePopUp();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={
        animPopupClass
          ? classes.delete_account_wrap + ' ' + classes.delete_account_wrap_show
          : classes.delete_account_wrap
      }
    >
      <div className={classes.delete_account_wr}>
        <div className={classes.delete_account_cont}>
          <div className={classes.delete_account_close} onClick={onClickClosePopUp}>
            <svg
              width="25"
              height="25"
              fill="none"
              viewBox="0 0 25 25"
              className={classes.delete_account_close_icon}
            >
              <path
                fill="#2F2F2F"
                fillRule="evenodd"
                d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z"
                clipRule="evenodd"
              />
              <path
                fill="#2F2F2F"
                fillRule="evenodd"
                d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z"
                clipRule="evenodd"
              />
              <path
                fill="#2F2F2F"
                fillRule="evenodd"
                d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z"
                clipRule="evenodd"
              />
              <path
                fill="#2F2F2F"
                fillRule="evenodd"
                d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className={classes.delete_account_login_wrap}>
            <div className={classes.delete_account_login_wr}>
              <div className={classes.delete_account_bot}>
                {popupState == 'confirm' ? (
                  <>
                    <div className={classes.delete_account_text}>
                      {translation['ACCOUNT_DELETE_WARNING_TEXT']}
                    </div>
                    <form onSubmit={onSubmitForm}>
                      <fieldset className={classes.delete_account_fieldset}>
                        <div className={classes.delete_account_input}>
                          <input type="text" name="deleteAccountText" onChange={onChangeInput} />
                        </div>
                        <div className={classes.delete_account_btn}>
                          <input
                            type="submit"
                            name="deleteAccountSubmit"
                            value="Confirm deletion"
                          />
                        </div>
                      </fieldset>
                    </form>
                  </>
                ) : (
                  <>
                    <div className={classes.delete_account_title}>
                      {translation['ACCOUNT_DELETED_TEXT_1']}
                    </div>
                    <div className={classes.delete_account_text}>
                      {translation['ACCOUNT_DELETED_TEXT_2']}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountPopup;
