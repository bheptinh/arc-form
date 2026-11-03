import {
  IconArmchair,
  IconCube,
  IconHeart,
  IconLayoutCollage,
  IconPaint,
  IconQuestionMark,
  IconSearch,
  IconUpload,
  IconWalk,
} from '@tabler/icons-react';
import cls from 'classnames';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useCatalogMaterials } from '../../../../api/catalog';
import { useLanguages } from '../../../../api/hooks/useLanguages';
import { useTranslation } from '../../../../api/hooks/useTranslation';
import { planner, user } from '../../../../initR2D';
import {
  selectIsProjectBelongToLoggedUser,
  selectIsProjectOnlyView,
} from '../../../../redux/features/common/commonSlice';
import {
  changeActiveControlPanelMode,
  selectActiveControlPanelMode,
  selectControlPanelData,
  selectDynamicPanelStatus,
  updateDynamicPanelStatus,
} from '../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../redux/features/popups/popupsSlice';
import { removeQuickPanelAll } from '../../../../redux/features/quickPanels/quickPanelsSlice';
import { showTip } from '../../../../redux/features/tips/tipsSlice';
import { selectIsLogged } from '../../../../redux/features/user/userSlice';
import {
  selectActiveViewMode,
  setActiveViewMode,
} from '../../../../redux/features/viewMode/viewModeSlice';
import IconButton from '../../../../shared-components/inputs/icon-button';
import UserButton from './buttons/UserButton';
import classes from './control-panel.module.css';

type Mode =
  | 'furniture'
  | 'decor'
  | 'constructor'
  | 'walk'
  | 'favorites'
  | 'search'
  | 'userUpload'
  | 'to2d3d';

type MenuItem = { mode: Mode; label: string; icon: ReactNode; visible: boolean };

const youTubeLinks: Record<string, string> = {
  en: 'https://www.youtube.com/playlist?list=PLpksFTMOBAbtlpPja4fqttp-Qu2rE8hz9',
  ru: 'https://www.youtube.com/playlist?list=PLpksFTMOBAbtlpPja4fqttp-Qu2rE8hz9',
  ua: 'https://www.youtube.com/playlist?list=PLpksFTMOBAbsw6r7Jod8faobeiCj73tF4',
};

const ControlPanel = () => {
  const dispatch = useDispatch();
  const controlPanelData = useSelector(selectControlPanelData);
  const activeControlPanelMode = useSelector(selectActiveControlPanelMode);
  const isLogged = useSelector(selectIsLogged);
  const activeViewMode = useSelector(selectActiveViewMode);
  const translation = useTranslation();
  const catalogMaterials = useCatalogMaterials();
  const dynamicPanelStatus = useSelector(selectDynamicPanelStatus);
  const isProjectOnlyView = useSelector(selectIsProjectOnlyView);
  const isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);
  const languages = useLanguages();
  const currentLanguage = languages?.find((i) => i?.current == 1)?.code;

  const [favoritesList, setFavoritesList] = useState(user.data.favorites?.items || []);
  const [userUploadButtonStatus, setUserUploadButtonStatus] = useState(planner.getUserUpload());
  const [helpOpen, setHelpOpen] = useState(false);
  const helpTriggerRef = useRef<HTMLDivElement>(null);

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';
  const isForeignViewOnly = isProjectOnlyView && !isProjectBelongToLoggedUser;

  const onClickMenuItem = (mode: Mode) => {
    const needToAddStartData = controlPanelData[mode].history.length < 1;
    const openMode = (startData?: object) =>
      dispatch(changeActiveControlPanelMode({ mode, data: needToAddStartData ? startData : null }));
    const to3dUnless2d = () => activeViewMode != 'view2d' && dispatch(setActiveViewMode('view3d'));
    const leaveConstrOrWalk = () =>
      (activeViewMode == 'constr' || activeViewMode == 'viewWalk') &&
      dispatch(setActiveViewMode('view3d'));

    if (planner.mih().state != planner.mih().stateMain || activeViewMode == 'constr') {
      planner.mih().unsetActiveObject();
      dispatch(removeQuickPanelAll());
    }

    switch (mode) {
      case 'furniture':
        openMode({
          type: 'catalog',
          addType: 'main',
          id: null,
          lastSavedScroll: 0,
          data: planner.getCatalogProducts(),
        });
        to3dUnless2d();
        break;
      case 'decor':
        openMode({ type: 'catalog', addType: 'main', lastSavedScroll: 0, data: catalogMaterials });
        to3dUnless2d();
        break;
      case 'constructor':
        R2D.mouseInteractionHelper.api.dispatchEvent(
          new Event(R2D.mouseInteractionHelper.api.QUICK_PANELS_HIDE, {})
        );
        dispatch(setActiveViewMode('constr'));
        openMode({ type: 'main', lastSavedScroll: 0 });
        dispatch(showTip({ name: 'constructorButtons' }));
        break;
      case 'walk':
        dispatch(setActiveViewMode('viewWalk'));
        openMode({ type: 'panorams', lastSavedScroll: 0 });
        break;
      case 'favorites':
      case 'search':
      case 'userUpload':
        leaveConstrOrWalk();
        openMode({ type: 'main', lastSavedScroll: 0 });
        break;
      case 'to2d3d':
        to3dUnless2d();
        openMode();
        break;
    }

    !dynamicPanelStatus &&
      (!isProjectOnlyView || isProjectBelongToLoggedUser) &&
      dispatch(updateDynamicPanelStatus(true));
  };

  const onClickVideos = () => {
    window.open(youTubeLinks[currentLanguage ?? 'en'] || youTubeLinks['en'], '_blank');
  };

  const onClickTips = () => {
    dispatch(setActivePopup({ name: 'tipsPopup' }));
  };

  const onClickSupport = () => {
    throw new Error('Support email is currently unavailable');
    // window.location.href = 'mailto:support@roomtodo.com?subject=support:%20';
  };

  const onTouchStartHelp = (e: React.TouchEvent) => {
    if (helpTriggerRef.current?.contains(e.target as Node)) setHelpOpen((open) => !open);
  };

  useEffect(() => {
    const favoritesButtonEvent = () => setFavoritesList([...(user.data.favorites?.items || [])]);
    const userUploadButtonEvent = (e: { data: { status: boolean } }) =>
      setUserUploadButtonStatus(e.data.status);
    planner.scene.addEventListener(planner.scene.FAVORITES_BUTTON, favoritesButtonEvent);
    planner.scene.addEventListener(planner.scene.USER_UPLOAD_BUTTON, userUploadButtonEvent);
    return () => {
      planner.scene.removeEventListener(planner.scene.FAVORITES_BUTTON, favoritesButtonEvent);
      planner.scene.removeEventListener(planner.scene.USER_UPLOAD_BUTTON, userUploadButtonEvent);
    };
  }, []);

  // on touch screens any touch outside the trigger closes the help menu
  useEffect(() => {
    if (!helpOpen) return;
    const close = (e: TouchEvent) =>
      !helpTriggerRef.current?.contains(e.target as Node) && setHelpOpen(false);
    document.addEventListener('touchstart', close);
    return () => document.removeEventListener('touchstart', close);
  }, [helpOpen]);

  const sections: MenuItem[] = [
    {
      mode: 'constructor',
      label: translation['MENU_BTN_TEXT_CONSTRUCTOR'],
      icon: <IconLayoutCollage size={24} />,
      visible: !isCurrDeviceAPhone && !isForeignViewOnly,
    },
    {
      mode: 'to2d3d',
      label: translation['HINT_BUTTON_3D'],
      icon: <IconCube size={24} />,
      visible: isForeignViewOnly,
    },
    {
      mode: 'furniture',
      label: translation['HINT_PRODUCTS_CATALOG'],
      icon: <IconArmchair size={24} />,
      visible: !isForeignViewOnly,
    },
    {
      mode: 'decor',
      label: translation['MENU_BTN_TEXT_DECOR'],
      icon: <IconPaint size={24} />,
      visible: !isForeignViewOnly,
    },
    {
      mode: 'walk',
      label: translation['PROJECT_EDIT_PUBLIC_POPUP_VIEW_WALK'],
      icon: <IconWalk size={24} />,
      visible: true,
    },
  ];

  const tools: MenuItem[] = [
    {
      mode: 'search',
      label: translation['SEARCH_PLACEHOLDER'],
      icon: <IconSearch size={20} />,
      visible: !isForeignViewOnly,
    },
    {
      mode: 'favorites',
      label: translation['FAVORITES_TITLE'],
      icon: <IconHeart size={20} />,
      visible: !isForeignViewOnly && isLogged && favoritesList.length > 0,
    },
    {
      mode: 'userUpload',
      label: translation['MY_UPLOUDS_TITLE'],
      icon: <IconUpload size={20} />,
      visible: !isForeignViewOnly && isLogged && !!userUploadButtonStatus,
    },
  ];

  const renderButtons = (items: MenuItem[], className: string) =>
    items
      .filter((item) => item.visible)
      .map(({ mode, label, icon }) => (
        <IconButton
          key={mode}
          variant="dark"
          className={className}
          icon={icon}
          label={label}
          tooltipSide="right"
          active={activeControlPanelMode == mode}
          onClick={() => onClickMenuItem(mode)}
        />
      ));

  return (
    <div className={classes.controlPanel}>
      <div>
        <div className={classes.sections}>{renderButtons(sections, classes.section)}</div>
        {tools.some((item) => item.visible) && (
          <div className={classes.tools}>{renderButtons(tools, classes.tool)}</div>
        )}
      </div>

      <div className={classes.bottom}>
        <div
          className={cls(classes.help, helpOpen && classes.helpOpen)}
          onMouseEnter={() => setHelpOpen(true)}
          onMouseLeave={() => setHelpOpen(false)}
          onTouchStart={onTouchStartHelp}
        >
          <div className={classes.helpIcon} ref={helpTriggerRef}>
            <IconQuestionMark size={20} />
          </div>
          <div className={classes.flyout}>
            <div className={classes.link} onClick={onClickVideos}>
              <div className={classes.linkIcon}>
                <img src="/src_designer/images/menu_help_videos.svg" />
              </div>
              {translation['TEXT_HELP_VIDEOS']}
            </div>
            {!isCurrDeviceAPhone && (
              <div className={classes.link} onClick={onClickTips}>
                <div className={classes.linkIcon}>
                  <img src="/src_designer/images/menu_help_hotkeys.svg" />
                </div>
                {translation['TEXT_HELP_HOT_KEYS']}
              </div>
            )}
            <div className={classes.link} onClick={onClickSupport}>
              <div className={classes.linkIcon}>
                <img src="/src_designer/images/menu_help_contactsus.svg" />
              </div>
              {translation['TEXT_HELP_SUPPORT']}
            </div>
          </div>
        </div>

        <UserButton />
      </div>
    </div>
  );
};

export default ControlPanel;
