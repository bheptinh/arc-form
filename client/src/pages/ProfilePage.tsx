import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useLanguageChange } from '../api/hooks/useLanguageChange';
import { useLanguages } from '../api/hooks/useLanguages';
import { useTranslation } from '../api/hooks/useTranslation';
import { user } from '../initR2D';
import { closeActivePopup, setActivePopup } from '../redux/features/popups/popupsSlice';
import { selectUserProfileData, setProfileData } from '../redux/features/user/userSlice';
import { selectActiveViewMode } from '../redux/features/viewMode/viewModeSlice';
import Button from '../shared-components/inputs/button';
import Checkbox from '../shared-components/inputs/checkbox';
import TextInput from '../shared-components/inputs/text-input';
import classes from './ProfilePage.module.css';

function ProfileForm() {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const userProfileData = useSelector(selectUserProfileData);
  const activeViewMode = useSelector(selectActiveViewMode);

  const languages = useLanguages();
  const currentLanguageCode = languages.find((i) => i.current == 1)?.code;
  const { mutateAsync: changeLanguage } = useLanguageChange();

  const [checkboxNews, setCheckboxNews] = useState(userProfileData?.subscriptionNews);
  const [checkboxTips, setCheckboxTips] = useState(userProfileData?.tips);
  const [checkboxAutoSave, setCheckboxAutoSave] = useState(userProfileData?.autoSave);
  const [languageCode, setLanguageCode] = useState(currentLanguageCode);

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
      return;
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
    dispatch(
      setActivePopup({
        name: 'completeMessage',
        data: 'NOTIFY_INFORMATION_SAVED',
        positionX: 'left',
      })
    );
  };

  const isProfileNewsShow = Boolean(R2D.config.data.ui.profile_news);
  const isLanguageShow = Boolean(R2D.config.data.ui.top_language);

  return (
    <form onSubmit={onSubmit} className={classes.form}>
      <fieldset>
        <div className={classes.label}>{translation['TEXT_LOGIN']}</div>
        <div className={classes.label}>{userProfileData?.email}</div>
      </fieldset>

      <fieldset>
        <div className={classes.label}>{translation['TEXT_USER_NAME']}</div>
        <TextInput
          inputClassName={classes.input}
          name="user_name"
          defaultValue={userProfileData?.name}
        />
      </fieldset>

      {isLanguageShow ? (
        <fieldset>
          <div className={classes.label}>{translation['ADMIN_COMMON_LANG'] || 'Language'}</div>
          <select
            className={classes.input}
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
        </fieldset>
      ) : null}

      <fieldset>
        <div className={classes.label}>{translation['TEXT_NEW_PASSWORD']}</div>
        <button
          type="button"
          className={classes.link}
          onClick={() => dispatch(setActivePopup({ name: 'updatePassword', type: 'update' }))}
        >
          {translation['TEXT_CHANGE']}
        </button>
      </fieldset>

      <div className={classes.line}></div>

      <div className={classes.options}>
        {isProfileNewsShow ? (
          <Checkbox
            name={'news'}
            label={translation['TEXT_GET_NEWS']}
            checked={checkboxNews}
            onChange={(status) => setCheckboxNews(status)}
          />
        ) : null}
        <Checkbox
          name={'tips'}
          label={translation['TEXT_SHOW_TIPS']}
          checked={checkboxTips}
          onChange={(status) => setCheckboxTips(status)}
        />
        <Checkbox
          name={'autoSave'}
          label={translation['TEXT_SHOW_AUTO_SAVE']}
          checked={checkboxAutoSave}
          onChange={(status) => setCheckboxAutoSave(status)}
        />
      </div>

      <fieldset>
        <Button type="submit">Save</Button>
        <button
          type="button"
          className={`${classes.link} ${classes.deleteLink}`}
          onClick={() => dispatch(setActivePopup({ name: 'deleteAccountPopup' }))}
        >
          Delete account
        </button>
      </fieldset>
    </form>
  );
}

export default function ProfilePage() {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const response = await user.loadProfileData();
      if (response.type == 'error') {
        dispatch(setActivePopup({ name: 'alert', data: response.data }));
        return;
      }
      dispatch(setProfileData(response));
      setIsLoaded(true);
    })();
  }, []);

  return (
    <div className={classes.page}>
      <div className={classes.top}>
        <div className={classes.title}>{translation['TEXT_PROFILE']}</div>
      </div>
      <div className={classes.scroll}>{isLoaded && <ProfileForm />}</div>
    </div>
  );
}
