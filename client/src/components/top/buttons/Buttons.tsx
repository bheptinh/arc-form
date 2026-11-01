import {
  IconArrowBackUp,
  IconArrowForwardUp,
  IconCamera,
  IconDeviceFloppy,
  IconDownload,
  IconEraser,
  IconForms,
  IconPlus,
  IconShare,
} from '@tabler/icons-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
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
import { useMerchantLogin } from '../../../utils/useMerchantLogin';

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
      background: 'var(--color-text)',
      '& path, & circle, & rect': {
        fill: 'var(--color-highlight)',
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
      background: 'var(--color-surface-muted)',
    },
    '& $bar_dropdown_option_wr': {
      transform: 'translateY(0%)',
    },
  },
  bar_dropdown_wrap_svg_hover_circle: {},
  bar_dropdown_active: {
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    background: 'var(--color-white)',
    cursor: 'pointer',
    borderRadius: 3,
    border: '1px solid var(--color-white)',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'var(--color-slate)',
    fontSize: '12px',
    padding: '0 5px',

    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      '& svg:not($bar_dropdown_wrap_svg_hover_circle) path, & svg:not($bar_dropdown_wrap_svg_hover_circle) circle, & svg:not($bar_dropdown_wrap_svg_hover_circle) rect':
        {
          fill: 'var(--color-highlight)',
        },
      '& $bar_dropdown_wrap_svg_hover_circle circle': {
        fill: 'var(--color-highlight)',
      },
    },
    '& p': {
      marginLeft: 5,
    },
  },
  bar_btnScreenshotBtn: {},
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

  bar_dropdown_option: {
    background: 'var(--color-white)',
    cursor: 'pointer',
    height: 30,
    display: 'flex',
    alignItems: 'center',
    fontSize: 12,
    color: 'var(--color-slate)',
    padding: '0 10px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    position: 'relative',
    '&:hover': {
      background: 'var(--color-surface-muted)',
    },
    '& p': {
      marginLeft: 12,
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      height: 25,
    },
  },
  bar_dropdown_option_image: {
    marginRight: 5,
    width: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar_login_btn: {
    background: 'rgba(47, 47, 47, 0.7)',
    cursor: 'pointer',
    height: '100%',
    padding: '0 10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'var(--color-white)',
    fontSize: '12px',
    marginRight: '1px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      background: 'var(--color-text)',
      color: 'var(--color-highlight)',
    },
  },
  bar_pro_btn: {
    height: '27px',
    userSelect: 'none',
    cursor: 'pointer',
  },
  bar_btn: {
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    background: 'var(--color-white)',
    cursor: 'pointer',
    borderRadius: 3,
    border: '1px solid var(--color-white)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    minWidth: 30,
    marginRight: '1px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      background: 'var(--color-surface-muted)',
    },
  },
  bar_btn_not_active: {
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    background: 'var(--color-white)',
    borderRadius: 3,
    border: '1px solid var(--color-white)',
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
    background: 'var(--color-white)',
    cursor: 'pointer',
    borderRadius: 3,
    border: '1px solid var(--color-white)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    minWidth: 30,
    marginRight: '1px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      background: 'var(--color-surface-muted)',
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
    background: 'var(--color-text)',
  },
  hover_elem: {
    position: 'absolute',
    background: 'var(--color-info-bright)',
    display: 'none',
    fontSize: 12,
    width: 'max-content',
    padding: '2px 7px',
    transition: 'all .1s ease',
    userSelect: 'none',
    zIndex: 12,
    visibility: 'hidden',
    color: 'var(--color-black)',
  },
  imagePlanImg: {
    marginRight: 6,
  },
  bar_send_a_request: {
    background: '#fcc749',
  },
  bar_btn_text: {
    color: 'var(--color-white)',
    fontSize: 12,
    padding: '0 5px',
  },
  bar_dropdown_option_disabled: {
    cursor: 'default',
    padding: '0 5px 0 35px',
    '&:hover': {
      color: 'var(--color-white)',
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
      color: 'var(--color-black)',
      fontSize: 12,
      marginLeft: 5,
    },
  },
  bar_dropdown_option_plan_update: {},
  undoRedoButtons: {
    display: 'flex',
  },
});

const LoginButton = (props) => {
  const classes = useStyles();
  const translation = useTranslation();
  const verifyEnabledMerchantLogin = useMerchantLogin();

  return (
    <div
      className={classes.bar_login_btn}
      id="customLogin"
      onClick={() =>
        verifyEnabledMerchantLogin()
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
  const verifyEnabledMerchantLogin = useMerchantLogin();
  const projectActive = useSelector(selectUserProjectActive);

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
      verifyEnabledMerchantLogin();
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
      dispatch(setActivePopup({ name: 'confirm', type: 'project_save_before_rename' }));
    } else {
      dispatch(setActivePopup({ name: 'setProjectName', type: 'rename' }));
    }
  };

  const onClickExport = () => {
    if (!user.isLogged()) {
      verifyEnabledMerchantLogin();
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
      verifyEnabledMerchantLogin();
    else if (
      R2D.controller.projectOpeningStatus &&
      R2D.controller.projectOpeningStatus == 'opening'
    ) {
      dispatch(setActivePopup({ name: 'alert', data: 'ERROR_TEXT_TRYING_TO_SAVE_PROJECT' }));
      return;
    } else {
      dispatch(setActivePopup({ name: 'setProjectName', type: 'saveAs' }));
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
                  <IconDeviceFloppy size={14} color="#000" />
                </div>
                {translation['TEXT_SAVE_AS']}
              </div>
            ) : null}
            {configProjectNew ? (
              <div className={classes.bar_dropdown_option} onClick={onCreateNewScene}>
                <div className={classes.bar_dropdown_option_image}>
                  <IconPlus size={14} color="#000" />
                </div>
                {translation['TEXT_NEW_PLAN']}
              </div>
            ) : null}
            {configSharing ? (
              <div className={classes.bar_dropdown_option} onClick={onClickShare}>
                <div className={classes.bar_dropdown_option_image}>
                  <IconShare size={14} color="#000" />
                </div>
                {translation['HINT_BUTTON_SHARE']}
              </div>
            ) : null}
            {configProjectClear ? (
              <div className={classes.bar_dropdown_option} onClick={projectClear}>
                <div className={classes.bar_dropdown_option_image}>
                  <IconEraser size={14} color="#000" />
                </div>
                {translation['BUTTON_CLEAR_SCENE']}
              </div>
            ) : null}
            {configProjectRename ? (
              <div className={classes.bar_dropdown_option} onClick={onClickRename}>
                <div className={classes.bar_dropdown_option_image}>
                  <IconForms size={14} color="#000" />
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
                    <IconDownload size={14} color="#000" />
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
  const verifyEnabledMerchantLogin = useMerchantLogin();

  const userProfileData = useSelector(selectUserProfileData);

  const [showTipSaveProject, setTipSaveProject] = useState(false);

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const tips = useSelector(selectTips);
  const timeStart = useMemo(() => Date.now(), []);

  const translation = useTranslation();
  const hoverButtonSave = useRef(null);

  const onClickSave = async () => {
    if (!user.isLogged()) {
      verifyEnabledMerchantLogin();
      return;
    } else if (
      R2D.controller.projectOpeningStatus &&
      R2D.controller.projectOpeningStatus == 'opening'
    ) {
      dispatch(setActivePopup({ name: 'alert', data: 'ERROR_TEXT_TRYING_TO_SAVE_PROJECT' }));
      return;
    } else if (
      !planner.scene.wasSaved() ||
      (R2D.controller.getProjectUserKey() && R2D.controller.getProjectUserKey() != user.getKey())
    ) {
      dispatch(setActivePopup({ name: 'setProjectName', type: 'create' }));
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
          <IconDeviceFloppy size={14} color="#2A3435" />
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

  const onClickUndo = () => {
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
          <IconArrowBackUp size={14} color="#2A3435" />
        </HoverComponent>
      </div>
      <div className={currentBtnClassRedo} ref={hoverButtonRedo} onClick={() => onClickRedo()}>
        <HoverComponent
          hoverText={translation['HINT_BUTTON_REDO']}
          parentRef={hoverButtonRedo}
          hoverTextPositionX={'left'}
        >
          <IconArrowForwardUp size={14} color="#2A3435" />
        </HoverComponent>
      </div>
    </div>
  );
};

const RealisticImageButton = () => {
  const classes = useStyles();

  const dispatch = useDispatch();

  const renderMakeState = useSelector(selectRenderMakeState);

  const activeViewMode = useSelector(selectActiveViewMode);

  const wallsHeight = useSelector(selectWallsHeight);

  const activePano = useSelector(selectActivePano);
  const translation = useTranslation();
  const dynamicPanelStatus = useSelector(selectDynamicPanelStatus);

  const hoverButtonRender = useRef(null);

  const onClickRealImgBtn = () => {
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
    window.dataLayer?.push({ event: 'click_hd' });

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
        <IconCamera size={14} color="#2A3435" />
      </HoverComponent>
    </div>
  );
};

const SendARequestButton = () => {
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
  Projects,
  RealisticImageButton,
  SaveButton,
  SendARequestButton,
  UndoRedoButtons,
};
