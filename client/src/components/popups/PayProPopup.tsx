import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner, user } from '../../initR2D';
import { selectIsProjectBelongToLoggedUser } from '../../redux/features/common/commonSlice';
import { selectLanguages } from '../../redux/features/language/languageSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
  setPopupData,
} from '../../redux/features/popups/popupsSlice';
import {
  selectIsLogged,
  selectUserProfileData,
  setProfileData,
  setProjectPlan,
} from '../../redux/features/user/userSlice';
import { createProjectUrl } from '../../utils/UrlHelper';

const useStyle = createUseStyles({
  '@font-face': [
    {
      fontFamily: 'Roboto-Light',
      fontWeight: 300,
      fontDisplay: 'swap',
      src: 'url("/src_designer/Roboto-Light.ttf") format("truetype")',
    },
    {
      fontFamily: 'Roboto-Bold',
      fontWeight: 700,
      fontDisplay: 'swap',
      src: 'url("/src_designer/Roboto-Bold.ttf") format("truetype")',
    },
  ],
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
    width: '100%',
    height: '100%',
    transform: 'scale(0)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#fff',
    height: '100%',
    position: 'relative',
    '& iframe': {
      border: 'none',
      width: '100%',
      height: '100%',
      display: 'block',
    },
    width: '100%',
  },
  planner_popup_close: {
    width: 20,
    height: 20,
    position: 'absolute',
    top: 8,
    right: 24,
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
  planner_popup_close_icon: {
    width: '100%',
  },
});

const PayProPopup = (props) => {
  const dispatch = useDispatch();

  const languages = useSelector(selectLanguages);
  const currLanguage = languages.find((i) => i.current == 1);
  const userProfileData = useSelector(selectUserProfileData);

  const tempURLDomain = R2D.URL.DOMAIN;

  const popups = useSelector(selectPopups);
  const iframeSrc =
    popups.payPro.data ||
    `${tempURLDomain}/${currLanguage?.code}/pricing_iframe/?plan=${userProfileData.plan || 'free'}&type=${popups.payPro.type || 'user'}&projectPlan=${R2D.scene.projectPlan}`;
  const isLogged = useSelector(selectIsLogged);
  const isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);
  const addData = popups.payPro.addData;
  const addType = popups.payPro.addType;

  const [configEnableMerchantLogin, setConfigEnableMerchantLogin] = useState(
    R2D.config.data.enable_merchant_login
  );
  const [animPopupClass, setAnimPopupClass] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);
  const [closeButtonActive, setCloseButtonActive] = useState(true);

  const proPopupRef = useRef(null);

  let fromProjectId, updateToPlan;
  let needToSaveToStorage = false;

  const classes = useStyle();

  function receiveMessage(event) {
    let dataObj;

    if (
      (event.data.source &&
        typeof event.data.source.startsWith == 'function' &&
        event.data.source.startsWith('react')) ||
      (event.data &&
        typeof event.data.startsWith == 'function' &&
        event.data.startsWith('/*framebus*/'))
    )
      return;

    try {
      dataObj = JSON.parse(event.data);
    } catch (error) {
      console.error('Error parse JSON string!');
      return;
    }

    if (dataObj.action == 'buy') {
      if (!isLogged) {
        !configEnableMerchantLogin
          ? dispatch(setActivePopup({ name: 'login' }))
          : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
        return;
      }

      if (dataObj.type == 'project') {
        if (!planner.scene.wasSaved() && (!addData || !addData.projectId)) {
          needToSaveToStorage = true;
          updateToPlan = dataObj.plan;
          const url = R2D.makeURL(
            R2D.URL.DOMAIN,
            `/api/premiumProject/get_form?token=${R2D.token}&lang=${currLanguage.code}&user_plan_id=${updateToPlan == 'basic' ? 1 : 2}`
          );
          dispatch(setPopupData({ name: 'payPro', data: url }));
        } else {
          fromProjectId = addData.projectId || R2D.controller.getProjectId();
          updateToPlan = dataObj.plan;
          const url = R2D.makeURL(
            R2D.URL.DOMAIN,
            `/api/premiumProject/get_form?token=${R2D.token}&lang=${currLanguage.code}&user_plan_id=${updateToPlan == 'basic' ? 1 : 2}${fromProjectId ? '&from_project_id=' + fromProjectId : ''}`
          );
          dispatch(setPopupData({ name: 'payPro', data: url }));
        }
      } else {
        const gtmEventType = `click_${dataObj.plan}_${dataObj.time}`;

        // GTM
        window.dataLayer.push({ event: gtmEventType });

        let url = R2D.makeURL(R2D.URL.DOMAIN, R2D.URL.URL_PAY_FORM);
        const selectedPlanId =
          R2D.RECURRING_PLANS[dataObj.plan][
            dataObj.time == 'month' ? 1 : dataObj.time == 'year' ? 12 : 1
          ];
        url = url.includes('?')
          ? url + '&plan_recurring_id=' + selectedPlanId
          : url + '?plan_recurring_id=' + selectedPlanId;
        url += '&lang=' + currLanguage.code;
        url += '&token=' + R2D.token;

        if (isLogged) {
          dispatch(setPopupData({ name: 'payPro', data: url }));

          // GTM
          window.dataLayer.push({ event: 'order' });

          setCurrentPage('order');
        } else {
          !configEnableMerchantLogin
            ? dispatch(setActivePopup({ name: 'login', type: 'buy_plan', data: url }))
            : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
        }
      }
    }

    if (dataObj.action == 'upgrade') {
      if (!isLogged) {
        !configEnableMerchantLogin
          ? dispatch(setActivePopup({ name: 'login' }))
          : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
        return;
      }

      if (!planner.scene.wasSaved()) {
        if (user.data.maxProjects > 0 && user.data.projectCount >= user.data.maxProjects) {
          needToSaveToStorage = true;
          updateToPlan = dataObj.plan;
          const url = R2D.makeURL(
            R2D.URL.DOMAIN,
            `/api/premiumProject/get_form?token=${R2D.token}&lang=${currLanguage.code}&user_plan_id=${updateToPlan == 'basic' ? 1 : 2}`
          );
          dispatch(setPopupData({ name: 'payPro', data: url }));
        } else return dispatch(setActivePopup({ name: 'setProjectName', type: 'create' }));
      } else if (R2D.controller.getProjectId() && !isProjectBelongToLoggedUser) {
        dispatch(
          setActivePopup({
            name: 'alert',
            type: 'saveAndUpgradeProjectToUsePro',
            data: 'POPUP_ALERT_SAVE_TOP_USE_PRO_TEXT',
          })
        );
      } else {
        fromProjectId = R2D.controller.getProjectId();
        updateToPlan = dataObj.plan;
        const url = R2D.makeURL(
          R2D.URL.DOMAIN,
          `/api/premiumProject/get_form?token=${R2D.token}&lang=${currLanguage.code}&user_plan_id=${updateToPlan == 'basic' ? 1 : 2}&project_id=${fromProjectId}`
        );
        dispatch(setPopupData({ name: 'payPro', data: url }));
      }
    }

    if (dataObj.action == 'buy_finish') {
      window.removeEventListener('message', receiveMessage);

      showPayNotification(dataObj.plan);
    }

    if (dataObj.action == 'credits_buy_finish') {
      window.removeEventListener('message', receiveMessage);
      showPayProjectNotification(dataObj, fromProjectId, updateToPlan);
    }
  }

  function showPayProjectNotification(
    data,
    upgradedProjectId = addData?.projectId,
    plan = addData?.plan
  ) {
    dispatch(
      setPopupData({
        name: 'payPro',
        data: `/src_designer/html/pay_notification/wait_${currLanguage.code}.html`,
      })
    );

    window.addEventListener('message', receiveMessageAfter, false);

    const checkInterval = setInterval(checkUserProjects, 2000);

    let checkNum = 0;

    const boughtProjectHash = data.url.split('/')[data.url.split('/').length - 1];

    async function checkUserProjects() {
      try {
        const response = await user.loadProjects();
        if (response.type == 'ok') {
          checkNum += 1;
          if (checkNum > 5) {
            clearInterval(checkInterval);
            dispatch(
              setPopupData({
                name: 'payPro',
                data: `/src_designer/html/pay_notification/error_${currLanguage.code}.html`,
              })
            );
          }
        } else {
          const neededProject = response.data.items.find((i) => i.hash == boughtProjectHash);
          if (neededProject && neededProject.userPlan == plan) {
            // GTM
            window.dataLayer.push({ event: 'buy' });
            clearInterval(checkInterval);
            if (needToSaveToStorage) {
              planner.scene.saveDataToStorageToApplyItInProject();

              dispatch(
                setPopupData({
                  name: 'payPro',
                  data: `/src_designer/html/pay_notification/ok_${currLanguage.code}.php?type=project_reload`,
                })
              );

              setCloseButtonActive(false);

              setTimeout(() => {
                window.history.replaceState(null, null, createProjectUrl(boughtProjectHash));
                window.location.reload();
                return;
              }, 2000);
            } else {
              dispatch(
                setPopupData({
                  name: 'payPro',
                  data: `/src_designer/html/pay_notification/ok_${currLanguage.code}.php?type=${R2D.controller.getProjectId() && R2D.controller.getProjectUserKey() == user.getKey() && R2D.controller.getProjectId() == upgradedProjectId ? '' : 'project_new_open'}`,
                })
              );
              const response = await user.loadProfileData();
              if (response.type == 'error')
                dispatch(setActivePopup({ name: 'alert', data: response.data }));
              else dispatch(setProfileData(response));
              R2D.scene.updateProjectUserPlan(plan);
              dispatch(setProjectPlan(plan));
            }
          } else {
            checkNum += 1;
            if (checkNum > 5) {
              clearInterval(checkInterval);
              dispatch(
                setPopupData({
                  name: 'payPro',
                  data: `/src_designer/html/pay_notification/error_${currLanguage.code}.html`,
                })
              );
            }
          }
        }
      } catch (e) {
        console.log('Error while user data load: ', e);
        clearInterval(checkInterval);
        dispatch(
          setPopupData({
            name: 'payPro',
            data: `/src_designer/html/pay_notification/error_${currLanguage.code}.html`,
          })
        );
      }
    }

    function receiveMessageAfter(event) {
      let dataObj;

      if (
        event.data.source == 'react-devtools-bridge' ||
        (typeof event.data.startsWith == 'function' && event.data.startsWith('/*framebus*/'))
      )
        return;

      try {
        dataObj = JSON.parse(event.data);
      } catch (error) {
        console.error('Error parse JSON string!');
        return;
      }
      if (addType == 'configCreate') {
        R2D.postMessageToParent(
          JSON.stringify({
            action: 'project_saved',
            data: {
              id: null,
              name: '',
              hash: boughtProjectHash,
            },
          })
        );
      }
      if (dataObj.action == 'close') {
        clearInterval(checkInterval);
        window.removeEventListener('message', receiveMessageAfter, false);
        dispatch(closeActivePopup({ name: 'payPro' }));
        if (addData?.action?.name == 'loadProject') {
          window.history.replaceState(null, null, createProjectUrl(addData.action.data));
          window.location.reload();
        }
      }
      if (dataObj.action == 'openNew') {
        if (
          addData?.action?.name == 'copy' &&
          (!planner.scene.wasSaved() || planner.scene.wasChanged())
        ) {
          dispatch(
            setActivePopup({
              name: 'saveBefore',
              type: 'open',
              data: { id: 0, name: '', hash: boughtProjectHash },
            })
          );
          dispatch(closeActivePopup({ name: 'payPro' }));
        } else {
          window.history.replaceState(null, null, createProjectUrl(boughtProjectHash));
          window.location.reload();
        }
      }
    }
  }

  function showPayNotification(plan) {
    dispatch(
      setPopupData({
        name: 'payPro',
        data: `/src_designer/html/pay_notification/wait_${currLanguage.code}.html`,
      })
    );

    window.addEventListener('message', receiveMessageAfter, false);

    const checkInterval = setInterval(checkUserPlan, 2000);

    let checkNum = 0;

    async function checkUserPlan() {
      try {
        const response = await user.checkIsLogged();
        if (response.logged == true) {
          if (user.data.plan != userProfileData.plan) {
            clearInterval(checkInterval);
            dispatch(
              setPopupData({
                name: 'payPro',
                data: `/src_designer/html/pay_notification/ok_${currLanguage.code}.php`,
              })
            );
            const response = await user.loadProfileData();
            if (response.type == 'error')
              dispatch(setActivePopup({ name: 'alert', data: response.data }));
            else dispatch(setProfileData(response));

            // GTM
            window.dataLayer.push({ event: 'buy' });
          } else {
            checkNum += 1;
            if (checkNum > 5) {
              clearInterval(checkInterval);
              dispatch(
                setPopupData({
                  name: 'payPro',
                  data: `/src_designer/html/pay_notification/error_${currLanguage.code}.html`,
                })
              );
            }
          }
        }
      } catch (e) {
        console.log('Error while user data load: ', e);
        clearInterval(checkInterval);
        dispatch(
          setPopupData({
            name: 'payPro',
            data: `/src_designer/html/pay_notification/error_${currLanguage.code}.html`,
          })
        );
      }
    }

    function receiveMessageAfter(event) {
      let dataObj;

      if (
        event.data.source == 'react-devtools-bridge' ||
        (typeof event.data.startsWith == 'function' && event.data.startsWith('/*framebus*/'))
      )
        return;

      try {
        dataObj = JSON.parse(event.data);
      } catch (error) {
        console.error('Error parse JSON string!');
        return;
      }

      if (dataObj.action == 'close') {
        if (addType == 'configCreate') {
          R2D.postMessageToParent(
            JSON.stringify({
              action: 'project_saved',
              data: {
                id: R2D.scene.getProjectId(),
                name: R2D.scene.getProjectName(),
                hash: R2D.scene.getProjectHash(),
              },
            })
          );
        }
        clearInterval(checkInterval);
        window.removeEventListener('message', receiveMessageAfter, false);
        dispatch(closeActivePopup({ name: 'payPro' }));
      }
    }
  }

  const closePayPro = (e) => {
    if (currentPage == 'order') {
      // GTM
      window.dataLayer.push({ event: 'cancel_order' });
    }
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'payPro' })), 500);
  };

  useEffect(() => {
    setConfigEnableMerchantLogin(R2D.config.data.enable_merchant_login);
  }, [R2D.config.data.enable_merchant_login]);

  useEffect(() => {
    isLogged && userProfileData.plan == 'pro' && dispatch(closeActivePopup({ name: 'payPro' }));
  }, [isLogged]);

  useEffect(() => {
    window.addEventListener('message', receiveMessage, false);
    return () => window.removeEventListener('message', receiveMessage);
  }, [isProjectBelongToLoggedUser, addData]);

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
      style={{ zIndex: popups.payPro.zIndex }}
    >
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_cont}>
          <iframe
            ref={proPopupRef}
            src={iframeSrc}
            data-type="window-iframe"
            id="dialog-iframe"
          ></iframe>

          {closeButtonActive ? (
            <div className={classes.planner_popup_close} id="js_close_popup" onClick={closePayPro}>
              <svg
                className={classes.planner_popup_close_icon}
                viewBox="0 0 16.03 16.02"
                width="24px"
                height="24px"
              >
                <path
                  fill="#444444"
                  d="M1,0a1,1,0,0,0-.7,1.72L6.6,8,.31,14.3a1,1,0,0,0,1.39,1.44l0,0L8,9.42l6.29,6.29a1,1,0,1,0,1.44-1.39l0,0L9.43,8l6.29-6.29A1,1,0,1,0,14.31.3L8,6.6,1.72.3A1,1,0,0,0,1,0Z"
                />
              </svg>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PayProPopup;
