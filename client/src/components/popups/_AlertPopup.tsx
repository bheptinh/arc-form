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
    maxWidth: 624,
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
    position: 'relative',
    height: '100%',
    padding: '64px 73px 71px',
  },
  text: {
    color: '#373737',
    fontSize: 16,
    textAlign: 'center',
    '@media screen and (max-width: 950px)': {
      fontSize: 14,
    },
  },
  planner_btn_done_wrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 17,
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
});

const AlertPopup = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const alertText = popups.alert.data?.id || popups.alert.data;
  const alertType = popups.alert.type;
  const classes = useStyle();

  const onClickOK = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'alert' })), 500);
    if (alertType == 'not_enough_credits') dispatch(setActivePopup({ name: 'buyCredits' }));
    if (alertType == 'saveAndUpgradeProjectToUsePro') {
      let allPremiumPlanOfSceneObjects = new Set();
      let allElemsWithOwner = new Set();
      Object.values(R2D.Pool._products_data).forEach((i) => {
        Array.isArray(i.plan) && allPremiumPlanOfSceneObjects.add(i.plan[0]);
        i.isOwner && allElemsWithOwner.add(i.type);
      });
      allPremiumPlanOfSceneObjects = Array.from(allPremiumPlanOfSceneObjects);
      allElemsWithOwner = Array.from(allElemsWithOwner);
      const isThereObjectsWithOwnerThatDontMatchUserPremiumPlan =
        allElemsWithOwner.length > 0 &&
        (user.data.plan == 'free' ||
          (user.data.plan == 'basic' && allElemsWithOwner.find((i) => i == R2D.ProductType.MODEL)));
      const isTherePremiumObjectThatDontMatchUserPremiumPlan =
        allPremiumPlanOfSceneObjects.length > 0 &&
        (user.data.plan == 'free' ||
          (user.data.plan == 'basic' && allPremiumPlanOfSceneObjects.find((i) => i == 'pro')));
      const neededPlan =
        allPremiumPlanOfSceneObjects.find((i) => i == 'pro') ||
        allElemsWithOwner.find((i) => i == R2D.ProductType.MODEL)
          ? 'pro'
          : allPremiumPlanOfSceneObjects.find((i) => i == 'basic') || allElemsWithOwner.length > 0
            ? 'basic'
            : 'free';
      if (user.data.maxProjects > 0 && user.data.projectCount >= user.data.maxProjects)
        dispatch(
          setActivePopup({
            name: 'upgradePlan',
            type: 'upgradeOverLimit',
            addData: { plan: neededPlan },
          })
        );
      else {
        if (
          isTherePremiumObjectThatDontMatchUserPremiumPlan ||
          isThereObjectsWithOwnerThatDontMatchUserPremiumPlan
        )
          dispatch(
            setActivePopup({
              name: 'upgradePlan',
              type: 'createNewPremiumProject',
              addData: { plan: neededPlan },
            })
          );
        else dispatch(setActivePopup({ name: 'setProjectName', type: 'create' }));
      }
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
          ? classes.planner_popup_wrap + ' ' + classes.planner_popup_wrap_show
          : classes.planner_popup_wrap
      }
    >
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_cont}>
          <div className="planner_popup_login_wrap">
            <div className={classes.text}>
              <p
                dangerouslySetInnerHTML={{
                  __html:
                    translation[alertText?.toUpperCase()] ||
                    alertText ||
                    translation['TEXT_ERROR_LOAD_DATA'],
                }}
              ></p>
            </div>
            <div className={classes.planner_btn_done_wrap}>
              <div className={classes.planner_btn_done} onClick={onClickOK}>
                {translation['BUTTON_OK']}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertPopup;
