import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { user } from '../../initR2D';
import { closeActivePopup, setActivePopup } from '../../redux/features/popups/popupsSlice';
import {
  selectIsLogged,
  selectUserProfileData,
  setProfileData,
} from '../../redux/features/user/userSlice';
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
  planner_popup_profile_credits: {
    marginRight: 10,
  },
  input_text_plan: {
    fontFamily: 'RobotoCondensed-Regular',
    fontSize: 13,
    lineHeight: '14px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    padding: '6px 0',
    marginRight: 9,
    borderRadius: 3,
    '@media screen and (max-width: 950px)': {
      padding: 3,
      fontSize: 10,
      lineHeight: '11px',
    },
  },
  input_text_basic: {
    fontFamily: 'RobotoCondensed-Regular',
    color: '#000',
    fontSize: '13px',
    marginLeft: '6px',
    borderRadius: '3px',
    padding: '5px 6px',
    position: 'relative',
    background: '#BADCFF',
    textTransform: 'uppercase',
    zIndex: 1,
    marginRight: 9,
  },
  input_text_pro: {
    color: '#000',
    fontSize: '13px',
    marginLeft: '6px',
    borderRadius: '3px',
    padding: '5px 6px',
    position: 'relative',
    background: '#FFB400',
    textTransform: 'uppercase',
    zIndex: 1,
    marginRight: 9,
  },
  fieldset_right_userPlanPeriod: {
    '& p': {
      marginRight: 5,
    },
  },
  planner_popup_profile_button_unsubscribe: {
    color: '#AF3131',
    marginLeft: 5,
  },
  planner_popup_profile_button_upgrate: {
    color: '#66ACF4',
    textDecoration: 'underline',
    fontSize: 13,
    cursor: 'pointer',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      textDecoration: 'none',
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

  const userData = useSelector(selectUserProfileData);
  const isLogged = useSelector(selectIsLogged);

  const [checkboxNews, setCheckboxNews] = useState(userProfileData?.subscriptionNews);
  const [checkboxTips, setCheckboxTips] = useState(userProfileData?.tips);
  const [checkboxAutoSave, setCheckboxAutoSave] = useState(userProfileData?.autoSave);

  const classes = useStyle();

  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;

    const user_name_new = form.elements.user_name.value;

    if (
      checkboxNews == userProfileData.subscriptionNews &&
      checkboxTips == userProfileData.tips &&
      userProfileData.name == user_name_new &&
      checkboxAutoSave == userProfileData.autoSave
    )
      return dispatch(closeActivePopup({ name: 'profile' }));
    else if (!user_name_new)
      return dispatch(setActivePopup({ name: 'alert', data: 'TEXT_EMPTY_NAME_ERROR' }));

    if (user_name_new.length < 3 || user_name_new.length > 100) {
      dispatch(setActivePopup({ name: 'alert', data: 'TEXT_USER_NAME_LENGTH_ERROR' }));
      return;
    }

    const dataObj = {
      username: user_name_new,
      subscription_news: checkboxNews,
      show_tips: checkboxTips,
      auto_save: checkboxAutoSave,
    };

    await user.setProfileData(dataObj);

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

  const isProEnabled = Boolean(R2D.config.data.enable_pro);
  const isProfileNewsShow = Boolean(R2D.config.data.ui.profile_news);

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

        {isProEnabled ? (
          <fieldset>
            <div className={classes.fieldset_left}>
              <p className={classes.input_text}>{translation['TEXT_R2D_VERSION']}:</p>
            </div>
            <div className={classes.fieldset_right}>
              {userData?.plan == 'pro' ? (
                <p className={classes.input_text_pro}>{userProfileData?.plan}</p>
              ) : userData?.plan == 'basic' ? (
                <p className={classes.input_text_basic}>{userProfileData?.plan}</p>
              ) : (
                <p className={classes.input_text_plan}>{userProfileData?.plan}</p>
              )}
              {userData?.plan == 'pro' ? null : (
                <div
                  className={classes.planner_popup_profile_button_upgrate}
                  onClick={() => dispatch(setActivePopup({ name: 'payPro', type: 'user' }))}
                >
                  {translation['TEXT_UPDATE']}
                </div>
              )}
            </div>
          </fieldset>
        ) : null}
        {userProfileData?.userPlanExpire && userProfileData.plan != 'free' ? (
          <fieldset>
            <div className={classes.fieldset_left}>
              <p className={classes.input_text}>{translation['TEXT_VALID_UNTIL']}: </p>
            </div>
            <div className={classes.fieldset_right + ' ' + classes.fieldset_right_userPlanPeriod}>
              <p className={classes.input_text}>{userProfileData?.userPlanExpire?.split(' ')[0]}</p>
            </div>
          </fieldset>
        ) : null}

        {userProfileData.plan == 'free' ? null : (
          <fieldset>
            <div className={classes.fieldset_left}>
              <p className={classes.input_text}>{translation['PROFILE_BILLED']}: </p>
            </div>
            <div className={classes.fieldset_right + ' ' + classes.fieldset_right_userPlanPeriod}>
              {userProfileData.userPlanRecurringId ? (
                <div className={classes.fieldset_right}>
                  <p className={classes.input_text}>
                    {'$' +
                      userProfileData.price +
                      '/' +
                      (userProfileData?.userPlanPeriod == 1
                        ? translation['PROFILE_MONTHLY']
                        : userProfileData?.userPlanPeriod == 6
                          ? translation['PROFILE_HALF_YEARLY']
                          : userProfileData.userPlanPeriod == 12
                            ? translation['PROFILE_YEARLY']
                            : '')}
                  </p>
                  <div
                    className={
                      classes.planner_popup_profile_button +
                      ' ' +
                      classes.planner_popup_profile_button_unsubscribe
                    }
                    onClick={() =>
                      dispatch(setActivePopup({ name: 'confirm', type: 'cancelSubscription' }))
                    }
                  >
                    {translation['PROFILE_UNSUBSCRIBE']}
                  </div>
                </div>
              ) : (
                <p className={classes.input_text}>{translation['PROFILE_NO_PROLONG']}</p>
              )}
            </div>
          </fieldset>
        )}

        <div className={classes.planner_popup_line}></div>

        <fieldset>
          <div className={classes.fieldset_left}>
            <p className={classes.input_text}>{translation['RENDER_MY_CREDITS']} </p>
          </div>
          <div className={classes.fieldset_right}>
            <div className={classes.planner_popup_profile_credits}>
              <p className={classes.input_text}>{(+userProfileData.credits).toFixed(0)}</p>
            </div>
            <div
              className={classes.planner_popup_profile_button}
              onClick={() => dispatch(setActivePopup({ name: 'buyCredits' }))}
            >
              {translation['RENDER_GET_MORE']}
            </div>
          </div>
        </fieldset>

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
