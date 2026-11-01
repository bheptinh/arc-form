import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
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
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import { removeQuickPanelAll } from '../../redux/features/quickPanels/quickPanelsSlice';
import { userLogout } from '../../redux/features/user/userSlice';
import TextInput from '../../shared-components/inputs/text-input';
import DefaultModal from '../../shared-components/modals/default';
import classes from './delete-account-popup.module.css';

const DeleteAccountPopup = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();
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
    <DefaultModal
      visible={animPopupClass}
      zIndex={101}
      className={classes.delete_account_wr}
      contentClassName={classes.delete_account_cont}
      onClose={onClickClosePopUp}
    >
      <div>
        <div>
          <div className={classes.delete_account_bot}>
            {popupState == 'confirm' ? (
              <>
                <div className={classes.delete_account_text}>
                  {translation['ACCOUNT_DELETE_WARNING_TEXT']}
                </div>
                <form onSubmit={onSubmitForm}>
                  <fieldset className={classes.delete_account_fieldset}>
                    <div className={classes.delete_account_input}>
                      <TextInput name="deleteAccountText" onChange={onChangeInput} />
                    </div>
                    <div className={classes.delete_account_btn}>
                      <input type="submit" name="deleteAccountSubmit" value="Confirm deletion" />
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
    </DefaultModal>
  );
};

export default DeleteAccountPopup;
