import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner, user } from '../../../initR2D';
import {
  selectActivePano,
  selectIsProjectBelongToLoggedUser,
  selectIsProjectOnlyView,
  selectRenderMakeState,
  updateRenderMakeState,
} from '../../../redux/features/common/commonSlice';
import { selectWallsHeight } from '../../../redux/features/constructor/constructorSlice';
import {
  changeActiveControlPanelMode,
  selectActiveControlPanelModeData,
  selectControlPanelData,
  selectDynamicPanelStatus,
  selectPrevControlPanelMode,
  updateControlPanelStatus,
  updateDynamicPanelStatus,
} from '../../../redux/features/control/controlPanelSlice';
import { useLanguageChange } from '../../../api/hooks/useLanguageChange';
import {
  closeActivePopup,
  selectPopupsLastClosedPopup,
  setActivePopup,
} from '../../../redux/features/popups/popupsSlice';
import { removeQuickPanelAll } from '../../../redux/features/quickPanels/quickPanelsSlice';
import { selectTips } from '../../../redux/features/tips/tipsSlice';
import {
  changeUndoRedo,
  selectIsUndoRedoConstr,
  selectIsUndoRedoScene,
  selectIsUndoRedoTileConfig,
} from '../../../redux/features/topPanel/topPanelSlice';
import {
  selectUserProfileData,
  selectUserProjectActive,
} from '../../../redux/features/user/userSlice';
import { selectActiveViewMode } from '../../../redux/features/viewMode/viewModeSlice';
import { createProjectUrl } from '../../../utils/UrlHelper';
import HoverComponent from '../../left_new/parts/controlPanel/components/HoverComponent';
import Tip from '../../tips/Tip';
import { useTranslation } from '../../../api/hooks/useTranslation';
import { useLanguages } from '../../../api/hooks/useLanguages';

const useStyles = createUseStyles({
  bar_btn_close: {
    width: 27,
    height: 29,
    background: 'rgba(47, 47, 47, 0.7)',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '1px',
    '&:hover': {
      background: '#2f2f2f',
      '& path, & circle, & rect': {
        fill: '#ffd119',
      },
    },
  },
  bar_dropdown_wrap: {
    position: 'relative',
    height: '100%',
    minWidth: 30,
    marginRight: 2,
    '&:hover': {},
  },
  bar_dropdown_wrap_hover: {
    '& $bar_dropdown_active': {
      background: '#E9E9E9',
    },
    '& $bar_dropdown_option_wr': {
      transform: 'translateY(0%)',
    },
  },
  bar_dropdown_wrap_svg_hover_circle: {},
  bar_dropdown_wrap_lang: {},
  bar_dropdown_option_wr_lang: {},
  bar_dropdown_active: {
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    background: '#fff',
    cursor: 'pointer',
    borderRadius: 3,
    border: '1px solid #fff',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#2A3435',
    fontSize: '12px',
    padding: '0 5px',

    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      '& svg:not($bar_dropdown_wrap_svg_hover_circle) path, & svg:not($bar_dropdown_wrap_svg_hover_circle) circle, & svg:not($bar_dropdown_wrap_svg_hover_circle) rect':
        {
          fill: '#ffd119',
        },
      '& $bar_dropdown_wrap_svg_hover_circle circle': {
        fill: '#ffd119',
      },
    },
    '& p': {
      marginLeft: 5,
    },
  },
  bar_btnScreenshotBtn: {},
  bar_dropdown_active_lang: {
    justifyContent: 'center',
  },
  bar_dropdown_option_wrap: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    overflow: 'hidden',
    minWidth: 'fit-content',
    pointerEvents: 'none',
    zIndex: -1,
    padding: 4,
    top: 'calc(100% - 4px)',
  },
  bar_dropdown_option_wr: {
    paddingTop: 2,
    pointerEvents: 'auto',
    transform: 'translateY(calc(-100% - 15px))',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    borderRadius: 3,
    overflow: 'hidden',
    boxShadow: '0px 0px 7px 0px rgba(0, 0, 0, 0.15)',
  },

  bar_dropdown_option_svg_path_hover_stroke: {},
  bar_dropdown_option: {
    background: '#fff',
    cursor: 'pointer',
    height: 30,
    display: 'flex',
    alignItems: 'center',
    fontSize: 12,
    color: '#2A3435',
    padding: '0 10px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    position: 'relative',
    '&:hover': {
      background: '#E9E9E9',
    },
    '& p': {
      marginLeft: 12,
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      height: 25,
    },
  },
  bar_dropdown_option_upgrade: {
    background: '#BAE51F',
  },
  bar_dropdown_option_image: {
    marginRight: 5,
    width: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar_dropdown_option_lang: {},
  bar_login_btn: {
    background: 'rgba(47, 47, 47, 0.7)',
    cursor: 'pointer',
    height: '100%',
    padding: '0 10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    fontSize: '12px',
    marginRight: '1px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      background: '#2f2f2f',
      color: '#ffd119',
    },
  },
  bar_pro_btn: {
    height: '27px',
    userSelect: 'none',
    cursor: 'pointer',
  },
  bar_btn: {
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    background: '#fff',
    cursor: 'pointer',
    borderRadius: 3,
    border: '1px solid #fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    minWidth: 30,
    marginRight: '1px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      background: '#E9E9E9',
    },
  },
  bar_btn_svg: {},
  bar_btn_not_active: {
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    background: '#fff',
    borderRadius: 3,
    border: '1px solid #fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    minWidth: 30,
    marginRight: '1px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    opacity: '0.3',
    pointerEvents: 'none',
  },
  bar_profil_icon: {
    width: 11,
    marginRight: 6,
    height: 13,
  },
  hd_render_btn: {
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    background: '#fff',
    cursor: 'pointer',
    borderRadius: 3,
    border: '1px solid #fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    minWidth: 30,
    marginRight: '1px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      background: '#E9E9E9',
    },
  },
  icon_hd_render: {},
  profilBarLogged: {},
  bar_btnSaveBtn: {
    height: '100%',
  },
  bar_ShareBtn: {},
  profilProject: {},
  barMetricsBtn: {},
  bar_dropdown_option_wr_metric: {},
  barMetricsActive: {},
  bar_dropdown_option_active: {
    display: 'none',
    background: '#2f2f2f',
  },
  hover_elem: {
    position: 'absolute',
    background: '#81e7ff',
    display: 'none',
    fontSize: 12,
    width: 'max-content',
    padding: '2px 7px',
    transition: 'all .1s ease',
    userSelect: 'none',
    zIndex: 12,
    visibility: 'hidden',
    color: '#000',
  },
  imagePlanImg: {
    marginRight: 6,
  },
  bar_send_a_request: {
    background: '#fcc749',
  },
  bar_btn_text: {
    color: '#fff',
    fontSize: 12,
    padding: '0 5px',
  },
  userPlan_not_pro: {
    background: '#9DD902',
    color: '#000000',
    cursor: 'default',
    '&:hover': {
      background: '#9DD902',
      color: '#000000',
    },
  },
  userPlan_pro: {
    background: '#FFFFFF',
    color: '#6D6D6D',
    cursor: 'default',
    borderBottom: '1px solid #6D6D6D',
    borderLeft: '1px solid #6D6D6D',
    borderRight: '1px solid #6D6D6D',
    '&:hover': {
      background: '#FFFFFF',
      color: '#6D6D6D',
    },
  },
  bar_dropdown_option_disabled: {
    cursor: 'default',
    padding: '0 5px 0 35px',
    '&:hover': {
      color: '#ffffff',
      background: 'rgba(47, 47, 47, 0.7)',
    },
  },
  profilBarLogged_pro: {
    marginRight: 10,
  },
  lockImg: {
    marginLeft: 5,
  },
  text_elem: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    '& $bar_dropdown_active': {
      padding: '0 10px',
    },
  },

  bar_dropdown_option_plan: {
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      marginLeft: 5,
      marginRight: 0,
    },
    '& $bar_dropdown_option_plan_update': {
      background: '#A0CA35',
      padding: '3px 5px',
      color: '#000000',
      fontSize: 12,
      marginLeft: 5,
    },
  },
  bar_dropdown_option_plan_update: {},
  lang_code: {
    textTransform: 'uppercase',
  },
  lang_globus_icon: {
    marginRight: 5,
  },
  undoRedoButtons: {
    display: 'flex',
  },
});

const LangButton = (props) => {
  const classes = useStyles();

  const languages = useLanguages();
  const dispatch = useDispatch();

  const activeViewMode = useSelector(selectActiveViewMode);

  const { mutateAsync: changeLanguage } = useLanguageChange();

  const onLangChange = async (code) => {
    dispatch(setActivePopup({ name: 'loadingMessage', data: 'TEXT_WAIT' }));
    await changeLanguage(code);
    dispatch(closeActivePopup({ name: 'loadingMessage' }));
    if (activeViewMode == 'view2d') R2D.scene3D?.titlesTool.onLanguagesUpdate();
    else if (activeViewMode == 'constr') WC.wallsEditor?.titlesTool.onLanguagesUpdate();
  };

  const [activeLanguage, setActiveLanguage] = useState(null);

  const onChangeLang = (e, item) => onLangChange(item['code']);

  const elseElems = languages.map((item, index) => {
    if (item['current'] != 1) {
      return (
        <div
          className={classes.bar_dropdown_option + ' ' + classes.bar_dropdown_option_lang}
          key={index}
          onClick={(e) => onChangeLang(e, item)}
        >
          <div className={classes.lang_code}>{item['code']}</div>
          <p>{item['name']}</p>
        </div>
      );
    }
  });

  const onEnterDropdown = (e) => e.currentTarget.classList.add(classes.bar_dropdown_wrap_hover);

  const onLeaveDropdown = (e) => e.currentTarget.classList.remove(classes.bar_dropdown_wrap_hover);

  const onTouchStartDropdown = (e) => {
    document.removeEventListener('touchstart', onTouchStartHideDropdown);
    setTimeout(() => document.addEventListener('touchstart', onTouchStartHideDropdown), 0);
    if (!e.target.closest('.' + classes.bar_dropdown_option_wr))
      e.currentTarget.classList.toggle(classes.bar_dropdown_wrap_hover);
  };

  const onTouchStartHideDropdown = (e) => {
    document
      .querySelector('.' + classes.bar_dropdown_wrap_hover)
      ?.classList.remove(classes.bar_dropdown_wrap_hover);
    document.removeEventListener('touchstart', onTouchStartHideDropdown);
  };

  useEffect(() => {
    const active = languages.find((i) => i['current'] == 1);
    setActiveLanguage(active);
  }, [languages]);

  return activeLanguage ? (
    <div
      className={classes.bar_dropdown_wrap + ' ' + classes.bar_dropdown_wrap_lang}
      onMouseEnter={onEnterDropdown}
      onMouseLeave={onLeaveDropdown}
      onTouchStart={onTouchStartDropdown}
    >
      <div
        className={classes.bar_dropdown_active + ' ' + classes.bar_dropdown_active_lang}
        key={activeLanguage['id']}
      >
        <img className={classes.lang_globus_icon} src="/src_designer/images/icon_globus.svg" />
        <div className={classes.lang_code}>{activeLanguage['code']}</div>
      </div>
      <div className={classes.bar_dropdown_option_wrap}>
        <div
          className={classes.bar_dropdown_option_wr + ' ' + classes.bar_dropdown_option_wr_lang}
          id="bar_lang_option_wr"
        >
          {elseElems}
        </div>
      </div>
    </div>
  ) : null;
};

const LoginButton = (props) => {
  const classes = useStyles();
  const translation = useTranslation();
  const dispatch = useDispatch();
  const [configEnableMerchantLogin, setConfigEnableMerchantLogin] = useState(
    R2D.config.data.enable_merchant_login
  );

  useEffect(() => {
    setConfigEnableMerchantLogin(R2D.config.data.enable_merchant_login);
  }, [R2D.config.data.enable_merchant_login]);

  return (
    <div
      className={classes.bar_login_btn}
      id="customLogin"
      onClick={() =>
        !configEnableMerchantLogin
          ? dispatch(setActivePopup({ name: 'login' }))
          : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }))
      }
    >
      {translation['TEXT_BUTTON_SIGN_IN']}
    </div>
  );
};

const Projects = (props) => {
  const translation = useTranslation();
  const classes = useStyles();
  const dispatch = useDispatch();
  const projectActive = useSelector(selectUserProjectActive);
  const [configEnableMerchantLogin, setConfigEnableMerchantLogin] = useState(
    R2D.config.data.enable_merchant_login
  );

  const [configProjectClear, setConfigProjectClear] = useState(
    R2D.config.data.ui.top_project_clear
  );
  const [configProjectNew, setConfigProjectNew] = useState(R2D.config.data.ui.top_project_new);
  const [configProjectRename, setConfigProjectRename] = useState(
    R2D.config.data.ui.top_project_rename
  );
  const [configExportProject, setConfigExportProject] = useState(
    R2D.config.data.ui.config_export_project
  );
  const [configSaveAs, setConfigSaveAs] = useState(R2D.config.data.ui.save_as);

  const userData = useSelector(selectUserProfileData);

  const [configSharing, setConfigSharing] = useState(R2D.config.data.ui.sharing);

  const [loadingFile, setLoadingFile] = useState(null);

  const lastClosedPopup = useSelector(selectPopupsLastClosedPopup);

  const [projectActiveName, setProjectActiveName] = useState('');

  const [defaultProjectName, setDefaulProjectName] = useState(translation['DEFAULT_SCENE_NAME']);

  const [isScreenSmall, setIsScreenSmall] = useState(false);

  const isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);

  const isProjectOnlyView = useSelector(selectIsProjectOnlyView);

  const onResizeScreen = (e) => setIsScreenSmall(window.innerWidth > 950 ? false : true);

  const onClickShare = (e) => {
    if (user.getId() == 0) {
      !configEnableMerchantLogin
        ? dispatch(setActivePopup({ name: 'login' }))
        : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
      return;
    }
    if (R2D.controller.getProjectUserKey() && R2D.controller.getProjectUserKey() != user.getKey())
      return dispatch(setActivePopup({ name: 'alert', data: 'TEXT_SHARE_PLAN_DIFF_USERS' }));
    if (!R2D.scene.getProjectId())
      return dispatch(setActivePopup({ name: 'alert', data: 'TEXT_SAVE_BEFORE_SHARE_PLAN' }));
    dispatch(setActivePopup({ name: 'share' }));
  };

  const onClickRename = async (e) => {
    if (!planner.scene.wasSaved() || R2D.controller.getProjectUserKey() != user.getKey()) {
      if (user.data.maxProjects > 0 && user.data.projectCount >= user.data.maxProjects)
        dispatch(setActivePopup({ name: 'upgradePlan' }));
      else dispatch(setActivePopup({ name: 'confirm', type: 'project_save_before_rename' }));
    } else {
      dispatch(setActivePopup({ name: 'setProjectName', type: 'rename' }));
    }
  };

  const onClickExport = () => {
    if (!user.isLogged()) {
      !configEnableMerchantLogin
        ? dispatch(setActivePopup({ name: 'login' }))
        : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
      return;
    } else if (
      R2D.controller.getProjectId() == 0 ||
      R2D.controller.getProjectUserKey() != user.getKey()
    ) {
      dispatch(setActivePopup({ name: 'alert', data: 'TEXT_EXPORT_SAVE_BEFORE' }));
      return;
    }
    dispatch(setActivePopup({ name: 'exportPopup' }));
  };

  const onCreateNewScene = async (e) => {
    if (
      planner.scene.wasChanged() &&
      userData.autoSave &&
      R2D.controller.getProjectId() &&
      R2D.controller.getProjectUserKey() == user.getKey()
    ) {
      const result = await planner.scene.saveProject();
      if (result?.type == 'error')
        return dispatch(
          setActivePopup({ name: 'alert', data: result?.data || 'TEXT_ERROR_LOAD_DATA' })
        );
    }
    if (planner.scene.wasChanged()) {
      dispatch(setActivePopup({ name: 'saveBefore', type: 'createNew' }));
    } else {
      planner.scene.clearSceneAutoSaveStorage();
      window.history.replaceState(null, null, createProjectUrl(''));
      window.location.reload();
    }
  };

  const projectClear = (e) =>
    planner.scene.wasChanged &&
    dispatch(setActivePopup({ name: 'confirm', type: 'project_clear' }));

  const onSaveAs = async (e) => {
    if (!user.isLogged())
      !configEnableMerchantLogin
        ? dispatch(setActivePopup({ name: 'login' }))
        : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
    else if (
      R2D.controller.projectOpeningStatus &&
      R2D.controller.projectOpeningStatus == 'opening'
    ) {
      dispatch(setActivePopup({ name: 'alert', data: 'ERROR_TEXT_TRYING_TO_SAVE_PROJECT' }));
      return;
    } else {
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
        else dispatch(setActivePopup({ name: 'setProjectName', type: 'saveAs' }));
      }
    }
  };

  const buttonsSlide = useRef(null);
  const mainDiv = useRef(null);

  let interval;

  const checkStatusIFC = (e: any) => {
    if (e.data.status && e.data.status == '20') {
      setLoadingFile(null);
      user.currentLoadingExportId = null;
      R2D.ifcCreator.removeEventListener('ifcStatus', checkStatusIFC);
    }
  };

  const onEnterDropdown = (e: any) =>
    e.currentTarget.classList.add(classes.bar_dropdown_wrap_hover);

  const onLeaveDropdown = (e: any) =>
    e.currentTarget.classList.remove(classes.bar_dropdown_wrap_hover);

  const onTouchStartDropdown = (e: any) => {
    document.removeEventListener('touchstart', onTouchStartHideDropdown);
    setTimeout(() => document.addEventListener('touchstart', onTouchStartHideDropdown), 0);
    if (!e.target.closest('.' + classes.bar_dropdown_option_wr))
      e.currentTarget.classList.toggle(classes.bar_dropdown_wrap_hover);
  };

  const onTouchStartHideDropdown = () => {
    document
      .querySelector('.' + classes.bar_dropdown_wrap_hover)
      ?.classList.remove(classes.bar_dropdown_wrap_hover);
    document.removeEventListener('touchstart', onTouchStartHideDropdown);
  };

  useEffect(() => {
    if (lastClosedPopup == 'export3DProjectPopup') {
      if (user.currentLoadingExportId?.exportId) {
        setLoadingFile(true);
        interval = setInterval(async () => {
          const response = await user.checkExport(user.currentLoadingExportId.exportId);
          if (response.data.file && response.status == 'ok') {
            setLoadingFile(null);
            user.currentLoadingExportId = null;
            clearInterval(interval);
          }
        }, 1000);
      }
      if (user.currentLoadingExportId?.format == 'ifc')
        R2D.ifcCreator.addEventListener('ifcStatus', checkStatusIFC);
    }
  }, [lastClosedPopup]);

  useEffect(() => {
    setIsScreenSmall(window.innerWidth > 950 ? false : true);
    setDefaulProjectName(
      window.innerWidth > 950
        ? translation['DEFAULT_SCENE_NAME']
        : translation['DEFAULT_SCENE_NAME']?.slice(0, 8) + '...'
    );
    window.addEventListener('resize', onResizeScreen);
    return () => window.removeEventListener('resize', onResizeScreen);
  }, []);

  useEffect(() => {
    setDefaulProjectName(
      !isScreenSmall
        ? translation['DEFAULT_SCENE_NAME']
        : translation['DEFAULT_SCENE_NAME'].slice(0, 8) + '...'
    );
  }, [translation, isScreenSmall]);
  useEffect(() => {
    setProjectActiveName(
      projectActive?.name?.length > 15
        ? projectActive.name.slice(0, 14) + '...'
        : projectActive?.name
    );
  }, [projectActive]);
  useEffect(() => {
    setConfigEnableMerchantLogin(R2D.config.data.enable_merchant_login);
  }, [R2D.config.data.enable_merchant_login]);
  useEffect(() => {
    setConfigProjectClear(R2D.config.data.ui.top_project_clear);
  }, [R2D.config.data.ui.top_project_clear]);
  useEffect(() => {
    setConfigProjectNew(R2D.config.data.ui.top_project_new);
  }, [R2D.config.data.ui.top_project_new]);
  useEffect(() => {
    setConfigProjectRename(R2D.config.data.ui.top_project_rename);
  }, [R2D.config.data.ui.top_project_rename]);
  useEffect(() => {
    setConfigExportProject(R2D.config.data.ui.config_export_project);
  }, [R2D.config.data.ui.config_export_project]);
  useEffect(() => {
    setConfigSaveAs(R2D.config.data.ui.save_as);
  }, [R2D.config.data.ui.save_as]);
  useEffect(() => {
    setConfigSharing(R2D.config.data.ui.sharing);
  }, [R2D.config.data.ui.sharing]);

  return (
    <div
      className={classes.bar_dropdown_wrap + ' ' + classes.profilProject}
      ref={mainDiv}
      onMouseEnter={onEnterDropdown}
      onMouseLeave={onLeaveDropdown}
      onTouchStart={onTouchStartDropdown}
    >
      {projectActiveName?.length > 15 ? (
        <HoverComponent
          hoverText={projectActive?.name}
          hoverTextPositionY={'top'}
          hoverTextPositionX={'left'}
        >
          <div className={classes.bar_dropdown_active}>{projectActiveName}</div>
        </HoverComponent>
      ) : (
        <div className={classes.bar_dropdown_active}>{projectActiveName || defaultProjectName}</div>
      )}
      {!isProjectBelongToLoggedUser && isProjectOnlyView ? null : (
        <div className={classes.bar_dropdown_option_wrap} ref={buttonsSlide}>
          <div className={classes.bar_dropdown_option_wr}>
            {configSaveAs ? (
              <div className={classes.bar_dropdown_option} onClick={onSaveAs}>
                <div className={classes.bar_dropdown_option_image}>
                  <svg width="14" height="13" viewBox="0 0 14 13" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M11.2595 1.00036L10.7603 1.00036V4.00036H10.7594V5.00036L3.75437 5.00036V4.00036L3.75048 4.00036V1.00036H1.75237V0.000361947L11.7594 0.000362384L11.7596 0L13.761 2.00017L13.7607 2.00036H13.7608V13.0004H12.7597L1.75181 13.0004V12.0004L12.7597 12.0004V2.49968L11.2595 1.00036ZM9.75925 4.00036V1.00036H8.75216V3.00036H7.75112V1.00036H4.75152V4.00036H9.75925ZM0.75 0.000362384H1.75104V13.0004H0.75V0.000362384ZM10.7594 8.00036V7.00036L3.75437 7.00036V8.00036H10.7594ZM10.7594 9.00036V10.0004H3.75437V9.00036H10.7594Z"
                      fill="#000"
                    />
                  </svg>
                </div>
                {translation['TEXT_SAVE_AS']}
              </div>
            ) : null}
            {configProjectNew ? (
              <div className={classes.bar_dropdown_option} onClick={onCreateNewScene}>
                <div className={classes.bar_dropdown_option_image}>
                  <svg width="14" height="13" viewBox="0 0 14 13" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M8.54241 7.68064V13H6.17878V7.68064H0.84375V5.31701H6.17878V0L8.54241 2.81852e-08V5.31701H13.8437V7.68064H8.54241Z"
                      fill="#000"
                    />
                  </svg>
                </div>
                {translation['TEXT_NEW_PLAN']}
              </div>
            ) : null}
            {configSharing ? (
              <div className={classes.bar_dropdown_option} onClick={onClickShare}>
                <div className={classes.bar_dropdown_option_image}>
                  <svg width="12" height="15" viewBox="0 0 12 15" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M11.7751 2.8546C11.7751 3.95491 10.8824 4.84689 9.78119 4.84689C9.19711 4.84689 8.67168 4.59594 8.30701 4.19607L4.43146 6.83925C4.53803 7.08315 4.59715 7.3525 4.59715 7.63564C4.59715 7.83672 4.56733 8.03083 4.51189 8.21382L8.47239 10.9149C8.8226 10.6102 9.28033 10.4257 9.78119 10.4257C10.8824 10.4257 11.7751 11.3177 11.7751 12.418C11.7751 13.5183 10.8824 14.4103 9.78119 14.4103C8.68 14.4103 7.7873 13.5183 7.7873 12.418C7.7873 12.1062 7.85895 11.8113 7.98668 11.5485L4.12941 8.91782C3.76366 9.35203 3.21571 9.62793 2.60326 9.62793C1.50207 9.62793 0.609375 8.73596 0.609375 7.63564C0.609375 6.53533 1.50207 5.64335 2.60326 5.64335C3.13347 5.64335 3.61534 5.85014 3.97251 6.1874L7.89781 3.5103C7.82621 3.30496 7.7873 3.08432 7.7873 2.8546C7.7873 1.75428 8.68 0.862305 9.78119 0.862305C10.8824 0.862305 11.7751 1.75428 11.7751 2.8546Z"
                      fill="#000"
                    />
                  </svg>
                </div>
                {translation['HINT_BUTTON_SHARE']}
              </div>
            ) : null}
            {configProjectClear ? (
              <div className={classes.bar_dropdown_option} onClick={projectClear}>
                <div className={classes.bar_dropdown_option_image}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M9.5741 0.80059L14.5715 5.53077L8.04971 12.5184L3.97858 12.5184L1.06304 9.79246L9.5741 0.80059Z"
                      stroke="#000"
                    />
                    <rect
                      x="8.98438"
                      y="0.648438"
                      width="7.08723"
                      height="5.31247"
                      transform="rotate(43.0033 8.98438 0.648438)"
                      fill="#000"
                    />
                    <line x1="1.25781" y1="13.6387" x2="13.0624" y2="13.6387" stroke="#000" />
                  </svg>
                </div>
                {translation['BUTTON_CLEAR_SCENE']}
              </div>
            ) : null}
            {configProjectRename ? (
              <div className={classes.bar_dropdown_option} onClick={onClickRename}>
                <div className={classes.bar_dropdown_option_image}>
                  <svg width="19" height="19" viewBox="0 0 19 19" fill="none">
                    <path
                      d="M16.5234 0.96875L16.5234 18.5187"
                      stroke="#000"
                      strokeWidth="1.36885"
                    />
                    <path
                      d="M18.3203 1.62206L14.7226 1.62207"
                      stroke="#000"
                      strokeWidth="1.36885"
                    />
                    <path
                      d="M18.2969 18.1914L14.6992 18.1914"
                      stroke="#000"
                      strokeWidth="1.36885"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14.6923 3.21973H2.00312H0.90625V4.3166V15.1697V16.2665H2.00312H14.6923V15.1697H2.00312V4.3166H14.6923V3.21973ZM16.2348 16.2665H16.2368V15.1697V4.3166V3.21973H16.2348V16.2665Z"
                      fill="#000"
                    />
                    <path
                      d="M6.5431 12.2837V9.79412C6.5431 9.61506 6.51383 9.46183 6.4553 9.33442C6.39676 9.20357 6.30551 9.10199 6.18154 9.02968C6.06102 8.95736 5.90435 8.92121 5.71151 8.92121C5.54623 8.92121 5.40333 8.95048 5.28281 9.00902C5.16229 9.06411 5.06932 9.14503 5.00389 9.25178C4.93846 9.35508 4.90575 9.47732 4.90575 9.6185H3.41819C3.41819 9.38091 3.47329 9.15536 3.58348 8.94187C3.69367 8.72838 3.85378 8.54071 4.06383 8.37887C4.27388 8.21358 4.52353 8.08446 4.81278 7.99148C5.10547 7.89851 5.4326 7.85202 5.79416 7.85202C6.22803 7.85202 6.61369 7.92434 6.95115 8.06896C7.2886 8.21358 7.55375 8.43052 7.74658 8.71977C7.94286 9.00902 8.04099 9.37058 8.04099 9.80445V12.1959C8.04099 12.5024 8.05993 12.7537 8.09781 12.95C8.13569 13.1429 8.19078 13.3116 8.26309 13.4562V13.544H6.76004C6.68773 13.3925 6.63263 13.2031 6.59475 12.9758C6.56032 12.7451 6.5431 12.5144 6.5431 12.2837ZM6.73938 10.1402L6.74971 10.9821H5.91812C5.72184 10.9821 5.55139 11.0045 5.40677 11.0492C5.26215 11.094 5.14335 11.1577 5.05038 11.2404C4.9574 11.3196 4.88854 11.4125 4.84377 11.5193C4.80245 11.626 4.78179 11.7431 4.78179 11.8705C4.78179 11.9979 4.81106 12.1133 4.8696 12.2166C4.92813 12.3164 5.0125 12.3956 5.12269 12.4542C5.23288 12.5093 5.36201 12.5368 5.51007 12.5368C5.7339 12.5368 5.92845 12.492 6.09373 12.4025C6.25902 12.313 6.38643 12.2028 6.47596 12.0719C6.56893 11.9411 6.61714 11.8171 6.62058 11.7001L7.01313 12.3302C6.95804 12.4714 6.88228 12.6177 6.78586 12.7692C6.69289 12.9208 6.57409 13.0637 6.42947 13.1979C6.28485 13.3288 6.11095 13.4373 5.90779 13.5234C5.70463 13.606 5.46359 13.6473 5.18467 13.6473C4.83 13.6473 4.50804 13.5767 4.21879 13.4355C3.93298 13.2909 3.70572 13.0929 3.53699 12.8416C3.3717 12.5867 3.28906 12.2975 3.28906 11.9738C3.28906 11.6811 3.34416 11.4211 3.45435 11.1939C3.56454 10.9666 3.72638 10.7755 3.93987 10.6205C4.15681 10.4621 4.42712 10.3433 4.7508 10.2641C5.07448 10.1815 5.44981 10.1402 5.8768 10.1402H6.73938Z"
                      fill="#000"
                    />
                    <path
                      d="M9.18766 5.61035H10.6752V12.2631L10.5254 13.544H9.18766V5.61035ZM14.2133 10.6929V10.8013C14.2133 11.218 14.1686 11.6002 14.079 11.948C13.993 12.2958 13.8587 12.5971 13.6762 12.8519C13.4937 13.1033 13.2664 13.2995 12.9944 13.4407C12.7258 13.5784 12.409 13.6473 12.044 13.6473C11.7031 13.6473 11.4069 13.5784 11.1556 13.4407C10.9076 13.303 10.6993 13.1084 10.5306 12.857C10.3619 12.6057 10.2258 12.3113 10.1225 11.9738C10.0192 11.6364 9.94177 11.2679 9.89012 10.8685V10.6309C9.94177 10.2314 10.0192 9.86299 10.1225 9.52553C10.2258 9.18807 10.3619 8.89366 10.5306 8.64229C10.6993 8.39092 10.9076 8.19637 11.1556 8.05863C11.4035 7.92089 11.6962 7.85202 12.0336 7.85202C12.4021 7.85202 12.7223 7.92261 12.9944 8.06379C13.2698 8.20153 13.4971 8.39781 13.6762 8.65262C13.8587 8.90399 13.993 9.20357 14.079 9.55136C14.1686 9.8957 14.2133 10.2762 14.2133 10.6929ZM12.7258 10.8013V10.6929C12.7258 10.4656 12.7086 10.2521 12.6741 10.0524C12.6431 9.84921 12.588 9.67188 12.5088 9.52036C12.4296 9.36541 12.3212 9.24317 12.1834 9.15364C12.0491 9.06411 11.8753 9.01935 11.6618 9.01935C11.4586 9.01935 11.2864 9.05378 11.1452 9.12265C11.0041 9.19152 10.887 9.28793 10.794 9.4119C10.7045 9.53586 10.6373 9.68393 10.5926 9.8561C10.5478 10.0248 10.5203 10.2108 10.5099 10.4139V11.0906C10.5203 11.3626 10.565 11.6036 10.6442 11.8137C10.7269 12.0203 10.8508 12.1839 11.0161 12.3044C11.1848 12.4215 11.4035 12.48 11.6721 12.48C11.8821 12.48 12.056 12.4387 12.1938 12.356C12.3315 12.2734 12.4383 12.1563 12.514 12.0048C12.5932 11.8533 12.6483 11.676 12.6793 11.4728C12.7103 11.2662 12.7258 11.0424 12.7258 10.8013Z"
                      fill="#000"
                    />
                  </svg>
                </div>
                {translation['BUTTON_RENAME_SCENE']}
              </div>
            ) : null}
            {configExportProject ? (
              loadingFile ? (
                <div
                  className={
                    classes.bar_dropdown_option + ' ' + classes.bar_dropdown_option_disabled
                  }
                >
                  <div className="preloader-cube_sm"></div>
                  {translation['PLEASE_WAIT']}
                </div>
              ) : (
                <div className={classes.bar_dropdown_option} onClick={onClickExport}>
                  <div className={classes.bar_dropdown_option_image}>
                    <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
                      <rect x="1.10938" y="13.4824" width="11.2354" height="1.12354" fill="#000" />
                      <rect x="6.16406" width="1.12354" height="11.2354" fill="#000" />
                      <rect
                        x="12.1953"
                        y="4.72705"
                        width="1.12354"
                        height="8.52229"
                        transform="rotate(45 12.1953 4.72705)"
                        fill="#000"
                      />
                      <rect
                        width="1.12354"
                        height="8.79458"
                        transform="matrix(-0.707107 0.707107 0.707107 0.707107 1.34375 4.72705)"
                        fill="#000"
                      />
                    </svg>
                  </div>
                  {translation['EXPORT_PROJECT_BUTTON']}
                </div>
              )
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

let saveTipKey = null;

const SaveButton = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const userProfileData = useSelector(selectUserProfileData);

  const [showTipSaveProject, setTipSaveProject] = useState(false);
  const [configEnableMerchantLogin, setConfigEnableMerchantLogin] = useState(
    R2D.config.data.enable_merchant_login
  );

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const tips = useSelector(selectTips);
  const timeStart = useMemo(() => Date.now(), []);

  const translation = useTranslation();
  const hoverButtonSave = useRef(null);

  const onClickSave = async () => {
    if (!user.isLogged()) {
      !configEnableMerchantLogin
        ? dispatch(setActivePopup({ name: 'login' }))
        : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
      return;
    } else if (
      R2D.controller.projectOpeningStatus &&
      R2D.controller.projectOpeningStatus == 'opening'
    ) {
      dispatch(setActivePopup({ name: 'alert', data: 'ERROR_TEXT_TRYING_TO_SAVE_PROJECT' }));
      return;
    } else if (!planner.scene.wasSaved()) {
      if (user.data.maxProjects > 0 && user.data.projectCount >= user.data.maxProjects)
        dispatch(setActivePopup({ name: 'upgradePlan', type: 'upgradeOverLimit' }));
      else dispatch(setActivePopup({ name: 'setProjectName', type: 'create' }));
    } else if (
      R2D.controller.getProjectUserKey() &&
      R2D.controller.getProjectUserKey() != user.getKey()
    ) {
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
    } else {
      dispatch(setActivePopup({ name: 'loadingMessage', data: 'TEXT_WAIT' }));
      const result = await planner.scene.saveProject();
      dispatch(closeActivePopup({ name: 'loadingMessage' }));
      if (result?.type == 'error')
        return dispatch(
          setActivePopup({ name: 'alert', data: result?.data || 'TEXT_ERROR_LOAD_DATA' })
        );
      dispatch(
        setActivePopup({ name: 'completeMessage', positionX: 'left', data: 'NOTIFY_SAVE_COMPLETE' })
      );
      user.data.autoSave == null && dispatch(setActivePopup({ name: 'autoSaveEnable' }));
    }
  };

  function onSaveProjectTipShow() {
    if (tips.saveProject.showed) return;

    saveTipKey = setTimeout(() => {
      const timeFromLastHint = (Date.now() - tips.lastTriggerTime) / 1000;
      if (timeFromLastHint < 10) return;
      const time = (Date.now() - timeStart) / 1000;
      if (
        ((R2D.scene.getSceneObjects().length >= 5 || R2D.viewConstructor.doneALot()) &&
          time >= 30) ||
        ((R2D.scene.getSceneObjects().length >= 1 || R2D.viewConstructor.doneSomething()) &&
          time >= 60)
      ) {
        setTipSaveProject(true);
      }
    }, 200);
  }

  useEffect(() => {
    setConfigEnableMerchantLogin(R2D.config.data.enable_merchant_login);
  }, [R2D.config.data.enable_merchant_login]);

  useEffect(() => {
    planner.scene.addEventListener(planner.scene.TIPS_SAVE_PROJECT, onSaveProjectTipShow);
    return () => {
      planner.scene.removeEventListener(planner.scene.TIPS_SAVE_PROJECT, onSaveProjectTipShow);
      clearTimeout(saveTipKey);
    };
  }, []);

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div
        className={classes.bar_btn + ' ' + classes.bar_btnSaveBtn}
        id="customSaveBtnNotLogged"
        onClick={onClickSave}
        ref={hoverButtonSave}
      >
        <HoverComponent
          hoverText={translation['HINT_BUTTON_SAVE']}
          parentRef={hoverButtonSave}
          hoverTextPositionX={'left'}
        >
          <svg
            width="13"
            className={classes.bar_btn_svg}
            height="13"
            viewBox="0 0 13 13"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.5 1.00006L10 1.00006V4.00006V5.00006L3 5.00006V4.00006V1.00006H1L1 12.0001L12 12.0001L12 2.50006L10.5 1.00006ZM12.9999 2.00006H13V13.0001H12H1H0V5.67436e-05L1 5.63065e-05L11 5.67436e-05L11 0L13 2L12.9999 2.00006ZM9 4.00006V1.00006H8V3.00006H7V1.00006H4V4.00006H9ZM10 8.00006V7.00006L3 7.00006V8.00006H10ZM10 9.00006V10.0001H3V9.00006H10Z"
              fill="#2A3435"
            />
          </svg>
        </HoverComponent>

        {showTipSaveProject &&
        userProfileData?.tips &&
        userProfileData.tips != 0 &&
        !tips.saveProject.showed &&
        !isCurrDeviceAPhone ? (
          <Tip
            name={'saveProject'}
            showTime={1000}
            arrow={{ position: 'right', direction: 'top', size: 'small' }}
            text={'TUT_SAVE_PROJECT'}
            position={{ x: 47, y: 40, from: 'right' }}
          />
        ) : null}
      </div>
    </div>
  );
};

const UndoRedoButtons = (props) => {
  const classes = useStyles();

  const constrUndoRedo = useSelector(selectIsUndoRedoConstr);
  const sceneUndoRedo = useSelector(selectIsUndoRedoScene);
  const tileConfigUndoRedo = useSelector(selectIsUndoRedoTileConfig);
  const activeViewMode = useSelector(selectActiveViewMode);
  const prevControlPanelMode = useSelector(selectPrevControlPanelMode);
  const controlPanelData = useSelector(selectControlPanelData);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const dispatch = useDispatch();
  let tileEditor = null;
  if (activeViewMode == 'tileConfig') tileEditor = planner.scene.getConfigurator().getTileEditor();

  const [canUndo, setCanUndo] = useState(
    activeViewMode == 'constr'
      ? constrUndoRedo.canUndo
      : activeViewMode == 'tileConfig'
        ? tileConfigUndoRedo.canUndo
        : sceneUndoRedo.canUndo
  );
  const [canRedo, setCanRedo] = useState(
    activeViewMode == 'constr'
      ? constrUndoRedo.canRedo
      : activeViewMode == 'tileConfig'
        ? tileConfigUndoRedo.canRedo
        : sceneUndoRedo.canRedo
  );

  const [currentBtnClassUndo, setCurrentBtnClassUndo] = useState(
    canUndo ? classes.bar_btn : classes.bar_btn_not_active
  );
  const [currentBtnClassRedo, setCurrentBtnClassRedo] = useState(
    canRedo ? classes.bar_btn : classes.bar_btn_not_active
  );

  const translation = useTranslation();
  const hoverButtonUndo = useRef(null);
  const hoverButtonRedo = useRef(null);

  const onClickUndo = (e) => {
    if (!canUndo) return;
    if (planner.mih().state.name != 'stateMain') {
      if (!activeControlPanelData.isInControlPanel) {
        if (prevControlPanelMode) {
          dispatch(changeActiveControlPanelMode({ mode: prevControlPanelMode }));
        } else {
          const furnitureData = planner.getCatalogProducts();
          dispatch(
            changeActiveControlPanelMode({
              mode: 'furniture',
              data:
                controlPanelData['furniture'].history.length < 1
                  ? {
                      type: 'catalog',
                      addType: 'main',
                      id: null,
                      lastSavedScroll: 0,
                      data: furnitureData,
                    }
                  : null,
            })
          );
        }
      }
    }

    if (activeViewMode == 'constr') {
      planner.constr.undo();
      WC.wallsEditor.titlesTool.updateComponents();
    } else if (activeViewMode == 'tileConfig') tileEditor.history.undo();
    else {
      planner.scene.undo();
      if (activeViewMode !== 'viewWalk') planner.mih()._titlesTool.updateComponents();
    }

    dispatch(removeQuickPanelAll());
    dispatch(changeUndoRedo());

    planner.mih().changeState(planner.mih().stateMain);
    planner.mih().unsetActiveObject();
  };

  const onClickRedo = () => {
    if (!canRedo) return;

    if (planner.mih().state.name != 'stateMain') {
      if (!activeControlPanelData.isInControlPanel) {
        if (prevControlPanelMode) {
          dispatch(changeActiveControlPanelMode({ mode: prevControlPanelMode }));
        } else {
          const furnitureData = planner.getCatalogProducts();
          dispatch(
            changeActiveControlPanelMode({
              mode: 'furniture',
              data:
                controlPanelData['furniture'].history.length < 1
                  ? {
                      type: 'catalog',
                      addType: 'main',
                      id: null,
                      lastSavedScroll: 0,
                      data: furnitureData,
                    }
                  : null,
            })
          );
        }
      }
    }

    if (activeViewMode == 'constr') {
      planner.constr.redo();
      WC.wallsEditor.titlesTool.updateComponents();
    } else if (activeViewMode == 'tileConfig') tileEditor.history.redo();
    else {
      planner.scene.redo();
      if (activeViewMode !== 'viewWalk') planner.mih()._titlesTool.updateComponents();
    }

    dispatch(removeQuickPanelAll());
    dispatch(changeUndoRedo());

    planner.mih().changeState(planner.mih().stateMain);
    planner.mih().unsetActiveObject();
  };

  useEffect(() => {
    setCanUndo(
      activeViewMode == 'constr'
        ? constrUndoRedo.canUndo
        : activeViewMode == 'tileConfig'
          ? tileConfigUndoRedo.canUndo
          : sceneUndoRedo.canUndo
    );
    setCanRedo(
      activeViewMode == 'constr'
        ? constrUndoRedo.canRedo
        : activeViewMode == 'tileConfig'
          ? tileConfigUndoRedo.canRedo
          : sceneUndoRedo.canRedo
    );

    setCurrentBtnClassUndo(canUndo ? classes.bar_btn : classes.bar_btn_not_active);
    setCurrentBtnClassRedo(canRedo ? classes.bar_btn : classes.bar_btn_not_active);
  }, [activeViewMode, constrUndoRedo, tileConfigUndoRedo, sceneUndoRedo, canUndo, canRedo]);

  return (
    <div className={classes.undoRedoButtons}>
      <div className={currentBtnClassUndo} ref={hoverButtonUndo} onClick={() => onClickUndo()}>
        <HoverComponent
          hoverText={translation['HINT_BUTTON_UNDO']}
          parentRef={hoverButtonUndo}
          hoverTextPositionX={'left'}
        >
          <svg
            width="12"
            height="15"
            className={classes.bar_btn_svg}
            viewBox="0 0 12 15"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.82163 0.827393L5.51949 1.50707L1.94819 5H12V6V14V15H4V14H11V6H1.87954L5.50886 9.49496L4.81643 10.1799L0.00680542 5.54833L0.0518246 5.5038L0.046056 5.49818L4.82163 0.827393Z"
              fill="#2A3435"
            />
          </svg>
        </HoverComponent>
      </div>
      <div className={currentBtnClassRedo} ref={hoverButtonRedo} onClick={() => onClickRedo()}>
        <HoverComponent
          hoverText={translation['HINT_BUTTON_REDO']}
          parentRef={hoverButtonRedo}
          hoverTextPositionX={'left'}
        >
          <svg
            width="12"
            height="15"
            className={classes.bar_btn_svg}
            viewBox="0 0 12 15"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.17837 0.827393L6.48051 1.50707L10.0518 5H0V6V14V15H8V14H1V6H10.1205L6.49114 9.49496L7.18357 10.1799L11.9932 5.54833L11.9482 5.5038L11.9539 5.49818L7.17837 0.827393Z"
              fill="#2A3435"
            />
          </svg>
        </HoverComponent>
      </div>
    </div>
  );
};

const RealisticImageButton = (props) => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const renderMakeState = useSelector(selectRenderMakeState);

  const activeViewMode = useSelector(selectActiveViewMode);

  const wallsHeight = useSelector(selectWallsHeight);

  const activePano = useSelector(selectActivePano);
  const translation = useTranslation();
  const dynamicPanelStatus = useSelector(selectDynamicPanelStatus);

  const hoverButtonRender = useRef(null);

  const onClickRealImgBtn = (e) => {
    R2D.Viewers.saveCameraData();
    R2D.viewWalk.savePanoData({
      id: activePano.id,
      rotation: activePano.rotation,
      previewImgSrc: activePano.previewImgSrc,
    });

    if (activeViewMode == 'view3d' && R2D.Viewers.getCameraData().position.y < wallsHeight) {
      R2D.viewWalk.setCameraData(R2D.view3d.getCameraData());
      R2D.viewWalk.saveCameraData();
    }

    planner.scene.updateDynamicPanelStatusBefore();

    if (!dynamicPanelStatus) dispatch(updateDynamicPanelStatus(true));

    dispatch(updateControlPanelStatus(false));

    dispatch(
      updateRenderMakeState({
        ...renderMakeState,
        fromApply: false,
        type:
          activeViewMode == 'view2d' || activeViewMode == 'constr'
            ? 'topView'
            : (activeViewMode == 'view3d' &&
                  R2D.Viewers.getCameraData().position.y < wallsHeight) ||
                activeViewMode == 'viewWalk'
              ? 'interior'
              : 'exterior',
      })
    );

    planner.mih().unsetActiveObject();

    dispatch(removeQuickPanelAll());

    // GTM
    window.dataLayer.push({ event: 'click_hd' });

    dispatch(
      changeActiveControlPanelMode({
        mode: 'renderMake',
        data: { type: 'main', lastSavedScroll: 0 },
      })
    );
  };

  return (
    <div className={classes.hd_render_btn} ref={hoverButtonRender} onClick={onClickRealImgBtn}>
      <HoverComponent
        hoverText={translation['HINT_BUTTON_RENDER']}
        parentRef={hoverButtonRender}
        hoverTextPositionX={'left'}
      >
        <svg width="20" height="16" fill="none" viewBox="0 0 20 16">
          <path
            fill="#2A3435"
            fillRule="evenodd"
            d="M10.422 11.424a3.142 3.142 0 1 0 0-6.284 3.142 3.142 0 0 0 0 6.284Zm0 .99a4.132 4.132 0 1 0 0-8.265 4.132 4.132 0 0 0 0 8.265Z"
            clipRule="evenodd"
          />
          <path
            fill="#2A3435"
            fillRule="evenodd"
            d="M7.972.609h4.901l2.262 2h1.333a3.5 3.5 0 0 1 3.5 3.5v9.014H.878V6.109a3.5 3.5 0 0 1 3.5-3.5H5.71l2.261-2Zm.379 1-2.261 2H4.378a2.5 2.5 0 0 0-2.5 2.5v8.014h17.09V6.109a2.5 2.5 0 0 0-2.5-2.5h-1.712l-2.261-2H8.35Z"
            clipRule="evenodd"
          />
        </svg>
      </HoverComponent>
    </div>
  );
};

const SendARequestButton = (props) => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const translation = useTranslation();

  const onClickSendRequest = () =>
    R2D.config.data.ui.custom_registration
      ? dispatch(setActivePopup({ name: 'customRegistrationPopup' }))
      : dispatch(setActivePopup({ name: 'registration' }));

  return (
    <div
      className={classes.bar_btn + ' ' + classes.bar_send_a_request}
      onClick={onClickSendRequest}
    >
      <p className={classes.bar_btn_text}>{translation['SEND_REQUEST_CALC']}</p>
    </div>
  );
};

export {
  LangButton,
  Projects,
  RealisticImageButton,
  SaveButton,
  SendARequestButton,
  UndoRedoButtons,
};
