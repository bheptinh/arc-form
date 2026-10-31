import { useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { user } from '../../initR2D';
import { updatePreloaderStatus } from '../../redux/features/common/commonSlice';
import { closeActivePopup, setActivePopup } from '../../redux/features/popups/popupsSlice';
import Button from '../../shared-components/inputs/button';
import Checkbox from '../../shared-components/inputs/checkbox';
import TextInput from '../../shared-components/inputs/text-input';
import DefaultModal from '../../shared-components/modals/default';

const useStyle = createUseStyles({
  formContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    maxWidth: 400,
    margin: '0 auto',
  },

  input_wrap: {
    padding: '0 65px',
    display: 'flex',
    border: 'none',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
    '@media screen and (max-width: 950px)': {
      padding: '0 15px',
      gridGap: 14,
    },
  },
  input_wrap_checkbox: {
    padding: '0 95px',
    marginBottom: 0,
  },
  checkbox_wrap: {
    marginBottom: 15,
  },
});

export default function AuthRegistrationPopup() {
  const dispatch = useDispatch();
  const translation = useTranslation();

  const [checkboxNews, setCheckboxNews] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    dispatch(updatePreloaderStatus(true));
    const form = e.target;

    const email = form.elements.email;
    const password = form.elements.password;
    const password_repeat = form.elements.verify_password;

    const dataObj = {
      login: email.value,
      user_name: email.value,
      password: password.value,
      subscription_news: checkboxNews ? '1' : '0',
    };

    if (dataObj.login.length < 6 || dataObj.login.length > 50) {
      dispatch(setActivePopup({ name: 'alert', data: 'TEXT_EMAIL_LENGTH_ERROR' }));
      dispatch(updatePreloaderStatus(false));
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(dataObj.login)) {
      dispatch(
        setActivePopup({ name: 'alert', type: 'error_email', data: 'TEXT_REG_INVALID_EMAIL' })
      );
      dispatch(updatePreloaderStatus(false));
      return;
    } else if (dataObj.password.length < 6 || dataObj.password.length > 64) {
      dispatch(setActivePopup({ name: 'alert', data: 'TEXT_PASSWORD_LENGTH_ERROR' }));
      dispatch(updatePreloaderStatus(false));
      return;
    } else if (dataObj.password != password_repeat.value) {
      dispatch(
        setActivePopup({
          name: 'alert',
          type: 'error_password_not_match',
          data: 'TEXT_PASSWORDS_NOT_MATCH',
        })
      );
      dispatch(updatePreloaderStatus(false));
      return;
    }

    const response = await user.registration(dataObj);
    if (response.type == 'error') dispatch(setActivePopup({ name: 'alert', data: response.data }));
    else if (response.type == 'load_thanks') {
      dispatch(setActivePopup({ name: 'registrationDonePopup' }));
      dispatch(closeActivePopup({ name: 'registration' }));
    }
    dispatch(updatePreloaderStatus(false));
  };

  const onClickBack = () => {
    dispatch(setActivePopup({ name: 'login' }));
    setTimeout(() => dispatch(closeActivePopup({ name: 'registration' })), 500);
  };

  const classes = useStyle();

  return (
    <DefaultModal
      title={translation['TEXT_REGISTRATION']}
      onClose={() => dispatch(closeActivePopup({ name: 'registration' }))}
      onBack={onClickBack}
    >
      <form onSubmit={onSubmit} className={classes.formContent}>
        <TextInput inset name="email" type="email" label={translation['TEXT_EMAIL']} required />
        <TextInput
          inset
          name="password"
          type="password"
          label={translation['INPUT_TEXT_PASSWORD']}
          required
        />
        <TextInput
          inset
          name="verify_password"
          type="password"
          label={translation['TEXT_VERIFY_PASSWORD']}
          required
        />
        <fieldset className={classes.input_wrap + ' ' + classes.input_wrap_checkbox}>
          {R2D.config.data.ui.profile_news ? (
            <div className={classes.checkbox_wrap}>
              <Checkbox
                name={'news'}
                label={translation['TEXT_GET_NEWS']}
                onChange={(status) => setCheckboxNews(status)}
                checked={checkboxNews}
              />
            </div>
          ) : null}
        </fieldset>
        <DefaultModal.Actions>
          <Button type="submit" id="login_sent">
            {translation['BUTTON_OK']}
          </Button>
        </DefaultModal.Actions>
      </form>
    </DefaultModal>
  );
}
