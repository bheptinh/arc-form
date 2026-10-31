import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useLanguages } from '../../api/hooks/useLanguages';
import { useTranslation } from '../../api/hooks/useTranslation';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import DefaultModal from '../../shared-components/modals/default';

const useStyle = createUseStyles({
  planner_popup_wr: {
    maxWidth: '100%',
  },
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 6,
    height: '100%',
    padding: '30px 60px',
    position: 'relative',
  },

  planner_popup_title: {
    fontSize: 32,
    fontWeight: 300,
    letterSpacing: '-0.03em',
    marginBottom: 14,
    color: '#373737',
    textAlign: 'center',
  },
  planner_popup_text: {
    fontSize: 14,
    color: '#2F2F2F',
    textAlign: 'center',
    marginBottom: 30,
  },
  planner_popup_bottom: {
    display: 'flex',
    justifyContent: 'center',
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
    border: '1px solid #000',
    margin: '0 3px',
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
    display: 'flex',
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

const UpgradePlan = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);

  const popupType = popups.upgradePlan.type;

  const addData = popups.upgradePlan.addData || null;
  const addType = popups.upgradePlan.addType || null;

  const [titleText, setTitleText] = useState('');
  const [subTitleText, setSubTitleText] = useState('');

  const [buttonsArray, setButtonsArray] = useState([]);
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const languages = useLanguages();
  const currLanguage = languages.find((i) => i.current == 1);

  const classes = useStyle();

  const onClickClosePopUp = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'upgradePlan' })), 500);
  };

  useEffect(() => {
    if (popupType == 'upgradeOverLimit') {
      setTitleText(translation['UPGRADE_OVER_LIMIT_TITLE']);
      setSubTitleText(translation['UPGRADE_OVER_LIMIT_SUBTITLE']);
      setButtonsArray([
        <button
          className={classes.planner_btn_done}
          key={Math.random()}
          onClick={(e) => {
            let url;
            if (addData?.plan && addData.plan != 'free') {
              url = R2D.makeURL(R2D.URL.DOMAIN, R2D.URL.URL_PAY_FORM);
              const selectedPlanId = R2D.RECURRING_PLANS[addData.plan || 'basic'][1];
              url = url.includes('?')
                ? url + '&plan_recurring_id=' + selectedPlanId
                : url + '?plan_recurring_id=' + selectedPlanId;
              url += '&lang=' + currLanguage.code;
              url += '&token=' + R2D.token;
            }
            url
              ? dispatch(setActivePopup({ name: 'payPro', addType, addData, data: url }))
              : dispatch(setActivePopup({ name: 'payPro', addType, addData, type: 'user' }));
            dispatch(closeActivePopup({ name: 'upgradePlan' }));
          }}
        >
          {translation['UPGRADE_OVER_LIMIT_BUTTON_UPGRADE_PLAN']}
        </button>,
      ]);
    } else if (popupType == 'createNewPremiumProject') {
      setTitleText(translation['COPY_NEW_PREMIUM_PROJECT_TITLE']);
      setSubTitleText(translation['COPY_NEW_PREMIUM_PROJECT_SUBTITLE']);
      setButtonsArray([
        <button
          className={classes.planner_btn_done}
          key={Math.random()}
          onClick={(e) => {
            let url;
            if (addData?.plan && addData.plan != 'free') {
              url = R2D.makeURL(R2D.URL.DOMAIN, R2D.URL.URL_PAY_FORM);
              const selectedPlanId = R2D.RECURRING_PLANS[addData.plan || 'basic'][1];
              url = url.includes('?')
                ? url + '&plan_recurring_id=' + selectedPlanId
                : url + '?plan_recurring_id=' + selectedPlanId;
              url += '&lang=' + currLanguage.code;
              url += '&token=' + R2D.token;
            }
            url
              ? dispatch(setActivePopup({ name: 'payPro', addType, addData, data: url }))
              : dispatch(setActivePopup({ name: 'payPro', addType, addData, type: 'user' }));
            dispatch(closeActivePopup({ name: 'upgradePlan' }));
          }}
        >
          {translation['UPGRADE_OVER_LIMIT_BUTTON_UPGRADE_PLAN']}
        </button>,
      ]);
    }
  }, [popupType]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DefaultModal
      visible={animPopupClass}
      zIndex={popups.upgradePlan.zIndex}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
      onClose={onClickClosePopUp}
    >
      <h2 className={classes.planner_popup_title}>{titleText}</h2>
      <div className={classes.planner_popup_text}>{subTitleText}</div>
      <div className={classes.planner_popup_bottom}>
        <button className={classes.planner_btn} onClick={onClickClosePopUp} id="login_sent">
          {translation['BUTTON_CANCEL']}
        </button>
        {buttonsArray}
      </div>
    </DefaultModal>
  );
};

export default UpgradePlan;
