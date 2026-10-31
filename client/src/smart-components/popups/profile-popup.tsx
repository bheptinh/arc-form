import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useLanguageChange } from '../../api/hooks/useLanguageChange';
import { useLanguages } from '../../api/hooks/useLanguages';
import { useTranslation } from '../../api/hooks/useTranslation';
import { user } from '../../initR2D';
import { closeActivePopup, setActivePopup } from '../../redux/features/popups/popupsSlice';
import {
  selectIsLogged,
  selectUserProfileData,
  setProfileData,
} from '../../redux/features/user/userSlice';
import { selectActiveViewMode } from '../../redux/features/viewMode/viewModeSlice';
import Button from '../../shared-components/inputs/button';
import Checkbox from '../../shared-components/inputs/checkbox';
import TextInput from '../../shared-components/inputs/text-input';
import DefaultModal from '../../shared-components/modals/default';

const useStyle = createUseStyles({
  planner_popup_line: {
    background: 'rgb(217, 217, 217)',
    height: '1px',
    marginBottom: 20,
    '@media screen and (max-width: 950px)': {
      marginBottom: 14,
    },
  },

  input_text: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: 14,
    color: '#2f2f2f',
    whiteSpace: 'nowrap',
    textAlign: 'right',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  input_email: {
    fontSize: 14,
    color: '#2f2f2f',
    flex: 1,
    minWidth: 222,
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  input_wr: {
    color: '#fff',
    '&:last-child': {
      marginBottom: '0',
    },
  },
  formInput: {
    color: '#2F2F2F',
    width: '100%',
    border: '1px solid #E6E6E6',
    height: '30px',
    resize: 'none',
    outline: 'none',
    fontSize: '14px',
    background: '#ffffff',
    transition: 'all 0.4s ease-out',
    paddingLeft: '8px',
    borderRadius: '3px',
    '@media screen and (max-width: 950px)': {
      height: '26px',
      fontSize: '11px',
    },
  },
  fieldset_left: {
    flex: 1,
    textAlign: 'right',
    marginRight: 20,
  },
  fieldset_right: {
    flex: 1,
    minWidth: 222,
    display: 'flex',
    alignItems: 'center',
  },
  planner_popup_profile_button: {
    color: '#66ACF4',
    fontSize: 13,
    textDecoration: 'underline',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'none',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },

  formContent: {
    position: 'relative',
    padding: '0 100px',

    '& fieldset': {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '0 10px',
      marginBottom: 20,
      alignItems: 'center',
      '@media screen and (max-width: 950px)': {
        marginBottom: 14,
      },
    },
  },
  planner_popup_profile_delete_acc_button: {
    color: '#AF3131',
    background: 'transparent',
    border: 'none',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
});

export default function ProfilePopup() {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const userProfileData = useSelector(selectUserProfileData);

  const isLogged = useSelector(selectIsLogged);
  const activeViewMode = useSelector(selectActiveViewMode);

  const languages = useLanguages();
  const currentLanguageCode = languages.find((i) => i.current == 1)?.code;
  const { mutateAsync: changeLanguage } = useLanguageChange();

  const [checkboxNews, setCheckboxNews] = useState(userProfileData?.subscriptionNews);
  const [checkboxTips, setCheckboxTips] = useState(userProfileData?.tips);
  const [checkboxAutoSave, setCheckboxAutoSave] = useState(userProfileData?.autoSave);
  const [languageCode, setLanguageCode] = useState(currentLanguageCode);

  const classes = useStyle();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const user_name_new = form.elements.user_name.value;

    if (
      checkboxNews == userProfileData.subscriptionNews &&
      checkboxTips == userProfileData.tips &&
      userProfileData.name == user_name_new &&
      checkboxAutoSave == userProfileData.autoSave &&
      languageCode == currentLanguageCode
    )
      return dispatch(closeActivePopup({ name: 'profile' }));
    else if (!user_name_new)
      return dispatch(setActivePopup({ name: 'alert', data: 'TEXT_EMPTY_NAME_ERROR' }));

    if (user_name_new.length < 3 || user_name_new.length > 100) {
      dispatch(setActivePopup({ name: 'alert', data: 'TEXT_USER_NAME_LENGTH_ERROR' }));
      return;
    }

    const dataObj = {
      name: user_name_new,
      subscription_news: checkboxNews,
      show_tips: checkboxTips,
      auto_save: checkboxAutoSave,
    };

    await user.setProfileData(dataObj);

    if (languageCode != currentLanguageCode) {
      dispatch(setActivePopup({ name: 'loadingMessage', data: 'TEXT_WAIT' }));
      await changeLanguage(languageCode);
      dispatch(closeActivePopup({ name: 'loadingMessage' }));
      if (activeViewMode == 'view2d') R2D.scene3D?.titlesTool.onLanguagesUpdate();
      else if (activeViewMode == 'constr') WC.wallsEditor?.titlesTool.onLanguagesUpdate();
    }

    const response = await user.loadProfileData();
    if (response.type == 'error') dispatch(setActivePopup({ name: 'alert', data: response.data }));
    else dispatch(setProfileData(response));
    dispatch(closeActivePopup({ name: 'profile' }));
    dispatch(
      setActivePopup({
        name: 'completeMessage',
        data: 'NOTIFY_INFORMATION_SAVED',
        positionX: 'left',
      })
    );
  };

  if (!isLogged) {
    console.warn('User not logged in');
    return null;
  }

  const isProfileNewsShow = Boolean(R2D.config.data.ui.profile_news);
  const isLanguageShow = Boolean(R2D.config.data.ui.top_language);

  return (
    <DefaultModal
      title={translation['TEXT_PROFILE']}
      onClose={() => dispatch(closeActivePopup({ name: 'profile' }))}
    >
      <form onSubmit={onSubmit} className={classes.formContent}>
        <fieldset>
          <div className={classes.fieldset_left}>
            <p className={classes.input_text}>{translation['TEXT_LOGIN']}</p>
          </div>
          <div className={classes.fieldset_right}>
            <span className={classes.input_email}>{userProfileData?.email}</span>
          </div>
        </fieldset>

        <fieldset>
          <div className={classes.fieldset_left}>
            <div className={classes.input_text}>{translation['TEXT_USER_NAME']}</div>
          </div>
          <div className={classes.fieldset_right}>
            <div className={classes.input_wr}>
              <TextInput
                inputClassName={classes.formInput}
                name="user_name"
                defaultValue={userProfileData?.name}
              />
            </div>
          </div>
        </fieldset>
        {isLanguageShow ? (
          <fieldset>
            <div className={classes.fieldset_left}>
              <div className={classes.input_text}>
                {translation['ADMIN_COMMON_LANG'] || 'Language'}
              </div>
            </div>
            <div className={classes.fieldset_right}>
              <div className={classes.input_wr}>
                <select
                  className={classes.formInput}
                  name="language"
                  value={languageCode}
                  onChange={(e) => setLanguageCode(e.target.value)}
                >
                  {languages.map((item) => (
                    <option key={item.id} value={item.code}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>
        ) : null}
        <fieldset>
          <div className={classes.fieldset_left}>
            <div className={classes.input_text}>{translation['TEXT_NEW_PASSWORD']}</div>
          </div>
          <div className={classes.fieldset_right}>
            <div
              className={classes.planner_popup_profile_button}
              onClick={() => dispatch(setActivePopup({ name: 'updatePassword', type: 'update' }))}
            >
              {translation['TEXT_CHANGE']}
            </div>
          </div>
        </fieldset>

        <fieldset>
          <div className={classes.fieldset_left}></div>
          <div className={classes.fieldset_right}>
            <button
              className={classes.planner_popup_profile_delete_acc_button}
              type={'button'}
              onClick={() => dispatch(setActivePopup({ name: 'deleteAccountPopup' }))}
            >
              Delete account
            </button>
          </div>
        </fieldset>
        <div className={classes.planner_popup_line}></div>

        <fieldset>
          <div className={classes.fieldset_left}></div>
          <div className={classes.fieldset_right}>
            {isProfileNewsShow ? (
              <Checkbox
                name={'news'}
                label={translation['TEXT_GET_NEWS']}
                checked={checkboxNews}
                onChange={(status) => setCheckboxNews(status)}
              />
            ) : null}
          </div>
        </fieldset>
        <fieldset>
          <div className={classes.fieldset_left}></div>
          <div className={classes.fieldset_right}>
            <Checkbox
              name={'tips'}
              label={translation['TEXT_SHOW_TIPS']}
              checked={checkboxTips}
              onChange={(status) => setCheckboxTips(status)}
            />
          </div>
        </fieldset>
        <fieldset>
          <div className={classes.fieldset_left}></div>
          <div className={classes.fieldset_right}>
            <Checkbox
              name={'autoSave'}
              label={translation['TEXT_SHOW_AUTO_SAVE']}
              checked={checkboxAutoSave}
              onChange={(status) => setCheckboxAutoSave(status)}
            />
          </div>
        </fieldset>
        <DefaultModal.Actions spaced>
          <Button type="submit">Ok</Button>
        </DefaultModal.Actions>
      </form>
    </DefaultModal>
  );
}
