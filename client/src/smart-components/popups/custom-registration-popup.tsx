import parse from 'html-react-parser';
import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import DefaultModal from '../../shared-components/modals/default';

const useStyles = createUseStyles({
  planner_popup_wrap: {
    height: '100vh',
    minHeight: '550px',
    display: 'grid',
  },
  planner_popup_wr: {
    maxHeight: 'none',
    boxShadow: 'none',
  },
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#f1f1f1',
    border: '1px solid #2f2f2f',
    overflow: 'hidden',
    padding: '30px 30px',
    position: 'relative',
    borderRadius: 0,
    height: 'auto',
  },
});

const CustomRegistrationPopup = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const formDiv = useRef(null);

  const popups = useSelector(selectPopups);

  const [customRegistration, setCustomRegistration] = useState(parse(R2D.getCustomRegistration()));

  const sendRequest = async (e) => {
    e.preventDefault();

    const form = e.target;

    const inputs = form.querySelectorAll('input');
    const dataObj = {};
    const customObj = {};

    for (let i = 0; i < inputs.length; i++) {
      const inp = inputs[i];
      const name = inp.name;
      const val = inp.value;
      if (val.length < 1)
        return dispatch(
          setActivePopup({ name: 'alert', type: 'error', data: 'TEXT_FILL_ALL_FIELDS' })
        );

      if (
        name == 'name' ||
        name == 'email' ||
        name == 'password' ||
        name == 'password_repeat' ||
        name == 'subscription_news'
      )
        dataObj[name] = val;
      customObj[name] = val;
    }

    if (dataObj.email && !/^[^@]+@[^@]+$/.test(dataObj.email)) {
      dispatch(
        setActivePopup({ name: 'alert', type: 'error_email', data: 'TEXT_REG_INVALID_EMAIL' })
      );
      return;
    }
    if (dataObj.password && dataObj.password_repeat) {
      if (dataObj.password.length < 6 || dataObj.password.length > 64) {
        dispatch(setActivePopup({ name: 'alert', data: 'TEXT_PASSWORD_LENGTH_ERROR' }));
        return;
      } else if (dataObj.password != dataObj.password_repeat) {
        dispatch(
          setActivePopup({
            name: 'alert',
            type: 'error_password_not_match',
            data: 'TEXT_PASSWORDS_NOT_MATCH',
          })
        );
        return;
      }
    }

    await R2D.sendRequestToCalc(customObj);

    dispatch(
      setActivePopup({
        name: 'completeMessage',
        positionX: 'left',
        data: 'SEND_REQUEST_CALC_COMPLETE',
      })
    );

    dispatch(closeActivePopup({ name: 'customRegistrationPopup' }));
  };

  useEffect(() => {
    formDiv?.current?.querySelector('form')?.addEventListener('submit', sendRequest);
  }, []);

  return (
    <DefaultModal
      zIndex={popups.customRegistrationPopup.zIndex}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
      wrapClassName={classes.planner_popup_wrap}
      onClose={() => dispatch(closeActivePopup({ name: 'customRegistrationPopup' }))}
    >
      <div ref={formDiv}>{customRegistration}</div>
    </DefaultModal>
  );
};

export default CustomRegistrationPopup;
