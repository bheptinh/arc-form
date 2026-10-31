import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner, user } from '../../initR2D';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import { createProjectUrl } from '../../utils/UrlHelper';
import { useTranslation } from '../../api/hooks/useTranslation';
import { useMerchantLogin } from '../../utils/useMerchantLogin';
import { getScenePlanRequirements } from '../../utils/getScenePlanRequirements';
import DefaultModal from '../../shared-components/modals/default';

const useStyle = createUseStyles({
  planner_popup_wr: {},
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 6,
    height: '100%',
    padding: '30px 60px',
    position: 'relative',
  },
  planner_popup_text: {
    fontSize: 14,
    color: '#2F2F2F',
    textAlign: 'center',
    marginBottom: 30,
  },
  planner_popup_bottom: {
    display: 'flex',
    justifyContent: 'space-between',
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

const SaveBeforePopup = (props) => {
  const dispatch = useDispatch();
  const verifyEnabledMerchantLogin = useMerchantLogin();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);

  const projectToSave = popups.saveBefore.data;

  const popupType = popups.saveBefore.type;

  let onClickOk = null;
  let onClickDoNotSave = null;

  const [animPopupClass, setAnimPopupClass] = useState(false);

  const onClickClosePopUp = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'saveBefore' })), 500);
  };

  if (popupType == 'open') {
    onClickOk = async (e) => {
      dispatch(closeActivePopup({ name: 'saveBefore' }));
      const {
        isThereObjectsWithOwnerThatDontMatchUserPremiumPlan,
        isTherePremiumObjectThatDontMatchUserPremiumPlan,
        neededPlan,
      } = getScenePlanRequirements();
      if (!planner.scene.wasSaved()) {
        if (user.data.maxProjects > 0 && user.data.projectCount >= user.data.maxProjects)
          dispatch(
            setActivePopup({
              name: 'upgradePlan',
              type: 'upgradeOverLimit',
              addData: {
                plan: neededPlan,
                action: { name: 'loadProject', data: projectToSave.hash },
              },
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
                addData: {
                  plan: neededPlan,
                  action: { name: 'loadProject', data: projectToSave.hash },
                },
              })
            );
          else
            dispatch(
              setActivePopup({
                name: 'setProjectName',
                type: 'createBeforeOpen',
                data: projectToSave,
              })
            );
        }
      } else {
        const project = { createNew: false };
        if (R2D.controller.getProjectUserKey() != user.getKey()) {
          if (user.data.maxProjects > 0 && user.data.projectCount >= user.data.maxProjects)
            dispatch(
              setActivePopup({
                name: 'upgradePlan',
                type: 'upgradeOverLimit',
                addData: {
                  plan: neededPlan,
                  action: { name: 'loadProject', data: projectToSave.hash },
                },
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
                  addData: {
                    plan: neededPlan,
                    action: { name: 'loadProject', data: projectToSave.hash },
                  },
                })
              );
            else {
              project.createNew = true;
              const result = await planner.scene.saveProject(project);
              if (result?.type == 'error')
                return dispatch(
                  setActivePopup({ name: 'alert', data: result?.data || 'TEXT_ERROR_LOAD_DATA' })
                );
              window.history.replaceState(null, null, createProjectUrl(projectToSave.hash));
              window.location.reload();
            }
          }
        } else {
          const result = await planner.scene.saveProject(project);
          if (result?.type == 'error')
            return dispatch(
              setActivePopup({ name: 'alert', data: result?.data || 'TEXT_ERROR_LOAD_DATA' })
            );
          planner.scene.clearSceneAutoSaveStorage();
          window.history.replaceState(null, null, createProjectUrl(projectToSave.hash));
          window.location.reload();
        }
      }
    };
    onClickDoNotSave = async (e) => {
      dispatch(closeActivePopup({ name: 'saveBefore' }));
      planner.scene.clearSceneAutoSaveStorage();
      window.history.replaceState(null, null, createProjectUrl(projectToSave.hash));
      window.location.reload();
    };
  }

  if (popupType == 'createNew') {
    onClickOk = async (e) => {
      if (user.isLogged()) {
        if (user.data.maxProjects > 0 && user.data.projectCount >= user.data.maxProjects)
          dispatch(setActivePopup({ name: 'upgradePlan' }));
        else dispatch(setActivePopup({ name: 'setProjectName', type: 'saveBeforeCreate' }));
      } else {
        verifyEnabledMerchantLogin();
      }
      dispatch(closeActivePopup({ name: 'saveBefore' }));
    };

    onClickDoNotSave = (e) => {
      planner.scene.clearSceneAutoSaveStorage();
      window.history.replaceState(null, null, createProjectUrl(''));
      window.location.reload();
    };
  }

  const classes = useStyle();

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DefaultModal
      visible={animPopupClass}
      zIndex={101}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
    >
      <div className="planner_popup_login_wrap">
        <div className={classes.planner_popup_text}>
          <p dangerouslySetInnerHTML={{ __html: translation['TEXT_SAVE_BEFORE_LOAD_PLAN'] }}></p>
        </div>
        <div className={classes.planner_popup_bottom}>
          <span className={classes.planner_btn} onClick={onClickDoNotSave}>
            {translation['BUTTON_DO_NOT_SAVE']}
          </span>
          <span className={classes.planner_btn} onClick={onClickClosePopUp}>
            {translation['BUTTON_CANCEL']}
          </span>
          <span className={classes.planner_btn_done} onClick={onClickOk}>
            {translation['BUTTON_OK']}
          </span>
        </div>
      </div>
    </DefaultModal>
  );
};

export default SaveBeforePopup;
