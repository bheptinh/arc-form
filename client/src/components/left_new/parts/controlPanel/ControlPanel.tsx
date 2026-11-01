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
import { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
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
  selectAnimateFavoritesHideStatus,
  selectAnimateFavoritesShowStatus,
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
import UserButton from './buttons/UserButton';
import HoverComponent from './components/HoverComponent';

const useStyle = createUseStyles({
  controlPanel: {
    width: '40px',
    zIndex: 4,
    display: 'grid',
    alignContent: 'space-between',
    position: 'relative',
    height: '100%',
    '&:before': {
      background: '#2E3839',
      content: "''",
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: 3,
      pointerEvents: 'none',
    },
  },
  menu_top: {
    pointerEvents: 'none',
  },
  menu_dop_btn_wr: {
    height: '38px',
    width: '40px',
    pointerEvents: 'all',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    '&:hover $menu_dop_info_wrap': {
      transform: 'translateX(0%)',
    },
  },
  menu_dop_btn: {
    borderBottom: '1px solid #595959',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#2E3839',
    position: 'relative',
    zIndex: 3,
    height: '100%',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    '&:hover': {
      background: '#4E5455',
      '& path': {
        fill: '#B8E11F',
      },
    },
  },
  menu_dop_btn_icon: {
    width: '10px',
    height: '14px',
    display: 'block',
    margin: 'auto',
    '& path': {
      transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    },
  },
  menu_dop_info_wrap: {
    position: 'absolute',
    left: '100%',
    paddingLeft: '1px',
    top: '0',
    zIndex: 2,
    transform: 'translateX(-102%)',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
  },
  menu_dop_info_link: {
    background: '#2E3839',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    color: '#fff',
    whiteSpace: 'nowrap',
    paddingRight: '13px',
    paddingLeft: '12px',
    fontSize: '12px',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    '&:hover': {
      background: '#4E5455',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: '11px',
    },
  },
  menu_dop_info_info_link_icon: {
    height: '100%',
    width: '25px',
    marginRight: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu_dop_info_info_link_pro: {
    color: '#fff',
    fontSize: '12px',
    marginLeft: '6px',
    border: '1px solid #9AA3A4',
    borderRadius: '3px',
    padding: '3px 4px',
  },
  menu_rozdil_wr: {
    pointerEvents: 'none',
    overflow: 'hidden',
    position: 'relative',
    zIndex: 3,
  },
  menu_rozdil_btn: {
    height: '45px',
    display: 'grid',
    pointerEvents: 'none',
    position: 'relative',
    zIndex: 4,
    cursor: 'pointer',
    gridTemplateColumns: '40px auto',
    '&:first-child $menu_rozdil_btn_img_wr': {
      borderTopLeftRadius: '0 !important',
      borderBottomLeftRadius: '0 !important',
    },
    '&:first-child $menu_rozdil_btn_text': {
      '&:before': {
        borderRadius: '0 3px 0 0',
      },
    },
    '&:last-child $menu_rozdil_btn_img_wr': {
      borderBottomLeftRadius: '0 !important',
    },
    '&:last-child $menu_rozdil_btn_text': {
      '&:before': {
        borderRadius: '0 0 3px 0',
      },
    },
    '&:not($menu_rozdil_btn_active):hover $menu_rozdil_btn_img_wr': {
      background: '#4E5455',
    },
    '&:not($menu_rozdil_btn_active):hover $menu_rozdil_btn_text': {
      '&:before': {
        background: '#4E5455',
      },
    },
    '&:hover $menu_rozdil_btn': {
      pointerEvents: 'all',
    },
    /* "&:hover $menu_rozdil_btn_text":{
            transform: "translateX(0%)"
        },*/
    '&:hover $menu_rozdil_btn_img_wr': {
      /*       borderRadius: "5px 0 0 5px"*/
    },
    '@media screen and (max-width: 950px)': {
      height: 30,
    },
  },
  menu_rozdil_btn_active: {
    cursor: 'default',
    borderRadius: '0',
    zIndex: 3,
    '& $menu_rozdil_btn_img_wr': {
      background: '#bae51f',
      transition: 'background 0s cubic-bezier(.19,1,.22,1)',
      '&:before': {
        background: '#B9E31F',
        opacity: 1,
      },
    },
    '& $svg_hover_path': {
      stroke: '#2E3839',
    },
    '& $menu_rozdil_btn_text': {
      color: '#2E3839',
      '&:before': {
        background: '#bae51f',
        transition: 'all 0s cubic-bezier(.19,1,.22,1)',
      },
    },
  },
  menu_rozdil_btn_img_wr: {
    borderRadius: '0 3px 3px 0',
    padding: '5px 0',
    pointerEvents: 'all',
    width: '40px',
    background: '#2E3839',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    position: 'relative',
    transition: 'background .9s cubic-bezier(.19,1,.22,1)',
    '&:before': {
      content: "''",
      position: 'absolute',
      top: '-3px',
      left: '0',
      width: '100%',
      background: '#B9E31F',
      opacity: 0,
      height: 'calc(100% + 6px)',
    },
    '& svg': {
      maxWidth: '100%',
      display: 'block',
      margin: 'auto',
      position: 'relative',
      '@media screen and (max-width: 950px)': {
        maxHeight: '72%',
      },
    },
  },
  svg_hover_path: {
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
  },
  svg_hover_stroke: {
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
  },
  menu_rozdil_btn_text: {
    fontSize: '13px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    padding: '0 12px 0 3px',
    transform: 'translateX(-102%)',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    '&:before': {
      content: "''",
      position: 'absolute',
      top: '0',
      right: '0',
      width: '101%',
      height: '100%',
      zIndex: -1,
      background: '#2E3839',
      transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    },
  },
  menu_btns: {
    background: '#2E3839',
    width: '40px',
    position: 'relative',
    zIndex: 3,
    borderTop: '1px solid #595959',
  },
  menu_btn: {
    height: '45px',
    width: '100%',
    cursor: 'pointer',
    position: 'relative',
    pointerEvents: 'all',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',

    '@media screen and (max-width: 950px)': {
      height: 30,
    },
  },
  menu_btn_hover: {
    '& $menu_btn_img_wr': {
      background: '#4E5455',
    },
    '& $menu_btn_path': {
      fill: '#fff',
    },
    '& $menu_btn_rect': {
      fill: '#fff',
    },
    '& $menu_btn_stroke': {
      stroke: '#fff',
    },
    '& $menu_btn_info_wrap': {
      transform: 'translate(0, -50%)',
      '@media screen and (max-width: 950px)': {
        transform: 'translate(0, 0%)',
      },
    },
  },
  menu_btn_img_wr: {
    height: '100%',
    width: '100%',
    background: '#2E3839',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    position: 'relative',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    '& svg': {
      display: 'block',
      margin: 'auto',
      transition: 'all 1.9s cubic-bezier(.19,1,.22,1)',
    },
  },
  menu_btn_path: {
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
  },
  menu_btn_stroke: {
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
  },
  menu_btn_rect: {
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
  },
  menu_btn_svg_anim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 'auto',
    pointerEvents: 'none',
  },
  menu_bot: {
    width: '40px',
    paddingBottom: '10px',
  },
  menu_btn_info_wrap: {
    position: 'absolute',
    left: '100%',
    paddingLeft: '1px',
    top: '50%',
    zIndex: 2,
    overflow: 'hidden',
    borderRadius: 3,
    transform: 'translate(-102%, -50%)',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    '@media screen and (max-width: 950px)': {
      transform: 'translate(-102%, 0%)',
      top: 'auto',
      bottom: 0,
    },
  },
  menu_btn_active: {
    cursor: 'default',
    borderRadius: '0',
    zIndex: 3,
    '&:hover $menu_btn_img_wr': {
      background: '#bae51f',
    },
    '&:hover $menu_btn_path': {
      fill: '#2E3839',
    },
    '&:hover $menu_btn_rect': {
      stroke: '#2E3839',
    },
    '&:hover $menu_btn_stroke': {
      stroke: '#2E3839',
    },
    '& $menu_btn_path': {
      fill: '#2E3839',
    },
    '& $menu_btn_stroke': {
      stroke: '#2E3839',
    },
    '& $menu_btn_rect': {
      stroke: '#2E3839',
    },
    '& $menu_btn_img_wr': {
      background: '#bae51f',
      transition: 'background 0s cubic-bezier(.19,1,.22,1)',
      '&:before': {
        background: '#B9E31F',
        opacity: 1,
      },
    },
  },
});

const ControlPanel = (props) => {
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

  const [favoritesList, setFavoritesList] = useState(user.data.favorites?.items || []);
  const [userUploadButtonStatus, setUserUploadButtonStatus] = useState(planner.getUserUpload());

  const classes = useStyle();

  const onClickMenuItem = (e) => {
    const buttonType = e.currentTarget.getAttribute('datatype');
    const needToAddStartData = controlPanelData[buttonType].history.length < 1;
    if (planner.mih().state != planner.mih().stateMain || activeViewMode == 'constr') {
      planner.mih().unsetActiveObject();
      dispatch(removeQuickPanelAll());
    }

    switch (buttonType) {
      case 'furniture':
        const furnitureData = planner.getCatalogProducts();
        dispatch(
          changeActiveControlPanelMode({
            mode: buttonType,
            data: needToAddStartData
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
        activeViewMode != 'view2d' && dispatch(setActiveViewMode('view3d'));
        break;
      case 'decor':
        dispatch(
          changeActiveControlPanelMode({
            mode: buttonType,
            data: needToAddStartData
              ? {
                  type: 'catalog',
                  addType: 'main',
                  lastSavedScroll: 0,
                  data: catalogMaterials,
                }
              : null,
          })
        );
        activeViewMode != 'view2d' && dispatch(setActiveViewMode('view3d'));
        break;
      case 'constructor':
        R2D.mouseInteractionHelper.api.dispatchEvent(
          new Event(R2D.mouseInteractionHelper.api.QUICK_PANELS_HIDE, {})
        );
        dispatch(setActiveViewMode('constr'));
        dispatch(
          changeActiveControlPanelMode({
            mode: buttonType,
            data: needToAddStartData ? { type: 'main', lastSavedScroll: 0 } : null,
          })
        );
        dispatch(showTip({ name: 'constructorButtons' }));
        break;
      case 'walk':
        dispatch(setActiveViewMode('viewWalk'));
        dispatch(
          changeActiveControlPanelMode({
            mode: buttonType,
            data: needToAddStartData ? { type: 'panorams', lastSavedScroll: 0 } : null,
          })
        );
        break;
      case 'favorites':
        (activeViewMode == 'constr' || activeViewMode == 'viewWalk') &&
          dispatch(setActiveViewMode('view3d'));
        dispatch(
          changeActiveControlPanelMode({
            mode: buttonType,
            data: needToAddStartData ? { type: 'main', lastSavedScroll: 0 } : null,
          })
        );
        break;
      case 'search':
        (activeViewMode == 'constr' || activeViewMode == 'viewWalk') &&
          dispatch(setActiveViewMode('view3d'));
        dispatch(
          changeActiveControlPanelMode({
            mode: buttonType,
            data: needToAddStartData ? { type: 'main', lastSavedScroll: 0 } : null,
          })
        );
        break;
      case 'userUpload':
        (activeViewMode == 'constr' || activeViewMode == 'viewWalk') &&
          dispatch(setActiveViewMode('view3d'));
        dispatch(
          changeActiveControlPanelMode({
            mode: buttonType,
            data: needToAddStartData ? { type: 'main', lastSavedScroll: 0 } : null,
          })
        );
        break;
      case 'to2d3d':
        activeViewMode != 'view2d' && dispatch(setActiveViewMode('view3d'));
        dispatch(changeActiveControlPanelMode({ mode: buttonType }));
        break;
      default:
        break;
    }

    !dynamicPanelStatus &&
      (!isProjectOnlyView || (isProjectOnlyView && isProjectBelongToLoggedUser)) &&
      dispatch(updateDynamicPanelStatus(true));
  };

  const hoverButtonSearch = useRef(null);
  const hoverButtonFav = useRef(null);
  const hoverButtonUpload = useRef(null);
  const mainDiv = useRef(null);
  const languages = useLanguages();
  const currentLanguage = languages?.find((i) => i?.current == 1)?.code;
  const youTubeLinks = {
    en: 'https://www.youtube.com/playlist?list=PLpksFTMOBAbtlpPja4fqttp-Qu2rE8hz9',
    ru: 'https://www.youtube.com/playlist?list=PLpksFTMOBAbtlpPja4fqttp-Qu2rE8hz9',
    ua: 'https://www.youtube.com/playlist?list=PLpksFTMOBAbsw6r7Jod8faobeiCj73tF4',
  };
  const onClickVideos = (e) => {
    window.open(youTubeLinks[currentLanguage] || youTubeLinks['en'], '_blank');
  };

  const onClickTips = (e) => {
    dispatch(setActivePopup({ name: 'tipsPopup' }));
  };

  const onClickSupport = (e) => {
    throw new Error('Support email is currently unavailable');
    // window.location.href = 'mailto:support@roomtodo.com?subject=support:%20';
  };

  const favoritesButtonEvent = (e) =>
    setFavoritesList(user.data.favorites?.items ? [...user.data.favorites?.items] : []);

  const userUploadButtonEvent = (e) => setUserUploadButtonStatus(e.data.status);

  const animateFavoritesShowStatus = useSelector(selectAnimateFavoritesShowStatus);
  const animateFavoritesHideStatus = useSelector(selectAnimateFavoritesHideStatus);

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const onEnterDropdown = (e) => e.currentTarget.classList.add(classes.menu_btn_hover);

  const onLeaveDropdown = (e) => e.currentTarget.classList.remove(classes.menu_btn_hover);

  const onTouchStartDropdown = (e) => {
    document.removeEventListener('touchstart', onTouchStartHideDropdown);
    setTimeout(() => document.addEventListener('touchstart', onTouchStartHideDropdown), 0);
    if (!e.target.closest('.' + classes.menu_btn_info_wrap))
      e.currentTarget.classList.toggle(classes.menu_btn_hover);
  };

  const onTouchStartHideDropdown = (e) => {
    document.querySelector('.' + classes.menu_btn_hover)?.classList.remove(classes.menu_btn_hover);
    document.removeEventListener('touchstart', onTouchStartHideDropdown);
  };

  const variantsAddFavoritesAnim = {
    visible: { transform: 'scale(1)', opacity: 1 },
    hidden: { transform: 'scale(15)', opacity: 0 },
    exit: { transform: 'scale(0)', opacity: 1 },
  };

  const variantsRemoveFavoritesAnimLeft = {
    visible: { transform: 'translateX(-10px) rotate(-14deg)', opacity: 0 },
    hidden: { transform: 'translateX(0px)', opacity: 1 },
    exit: { transform: 'translateX(-10px) rotate(-14deg)', opacity: 0 },
  };

  const variantsRemoveFavoritesAnimRight = {
    visible: { transform: 'translateX(10px) rotate(14deg)', opacity: 0 },
    hidden: { transform: 'translateX(0px)', opacity: 1 },
    exit: { transform: 'translateX(10px) rotate(14deg)', opacity: 0 },
  };

  useEffect(() => {
    Array.from(document.querySelectorAll('.' + classes.menu_rozdil_btn)).forEach((i) => {
      i.classList.remove(classes.menu_rozdil_btn_active);
      i.getAttribute('datatype') == activeControlPanelMode &&
        i.classList.add(classes.menu_rozdil_btn_active);
    });
    Array.from(document.querySelectorAll('.' + classes.menu_btn)).forEach((i) => {
      i.classList.remove(classes.menu_btn_active);
      i.getAttribute('datatype') == activeControlPanelMode &&
        i.classList.add(classes.menu_btn_active);
    });
  }, [activeControlPanelMode, isProjectBelongToLoggedUser, isProjectOnlyView]);

  useEffect(() => {
    setTimeout(() => mainDiv.current?.removeAttribute('style'), 1000);
    planner.scene.addEventListener(planner.scene.FAVORITES_BUTTON, favoritesButtonEvent);
    planner.scene.addEventListener(planner.scene.USER_UPLOAD_BUTTON, userUploadButtonEvent);
  }, []);

  return (
    <div className={classes.controlPanel} ref={mainDiv} style={{ overflow: 'hidden' }}>
      <div className={classes.menu_top}>
        <div className={classes.menu_rozdil_wr}>
          {!isCurrDeviceAPhone && (!isProjectOnlyView || isProjectBelongToLoggedUser) ? (
            <div
              className={classes.menu_rozdil_btn}
              onClick={onClickMenuItem}
              datatype={'constructor'}
            >
              <HoverComponent hoverText={translation['MENU_BTN_TEXT_CONSTRUCTOR']}>
                <div className={classes.menu_rozdil_btn_img_wr}>
                  <IconLayoutCollage size={24} color="#ffffff" className={classes.svg_hover_path} />
                </div>
              </HoverComponent>
            </div>
          ) : null}

          {isProjectOnlyView && !isProjectBelongToLoggedUser ? (
            <div className={classes.menu_rozdil_btn} onClick={onClickMenuItem} datatype={'to2d3d'}>
              <HoverComponent hoverText={translation['HINT_BUTTON_3D']}>
                <div className={classes.menu_rozdil_btn_img_wr}>
                  <IconCube size={24} color="#ffffff" className={classes.svg_hover_path} />
                </div>
              </HoverComponent>
            </div>
          ) : (
            <div>
              <div
                className={classes.menu_rozdil_btn}
                onClick={onClickMenuItem}
                datatype={'furniture'}
              >
                <HoverComponent hoverText={translation['HINT_PRODUCTS_CATALOG']}>
                  <div className={classes.menu_rozdil_btn_img_wr}>
                    <IconArmchair size={24} color="#ffffff" className={classes.svg_hover_path} />
                  </div>
                </HoverComponent>
              </div>
              <div className={classes.menu_rozdil_btn} onClick={onClickMenuItem} datatype={'decor'}>
                <HoverComponent hoverText={translation['MENU_BTN_TEXT_DECOR']}>
                  <div className={classes.menu_rozdil_btn_img_wr}>
                    <IconPaint size={24} color="#ffffff" className={classes.svg_hover_path} />
                  </div>
                </HoverComponent>
              </div>
            </div>
          )}

          <div className={classes.menu_rozdil_btn} onClick={onClickMenuItem} datatype={'walk'}>
            <HoverComponent hoverText={translation['PROJECT_EDIT_PUBLIC_POPUP_VIEW_WALK']}>
              <div className={classes.menu_rozdil_btn_img_wr}>
                <IconWalk size={24} color="#ffffff" className={classes.svg_hover_path} />
              </div>
            </HoverComponent>
          </div>
        </div>

        {isProjectOnlyView && !isProjectBelongToLoggedUser ? null : (
          <div className={classes.menu_btns}>
            <div
              className={classes.menu_btn}
              onClick={onClickMenuItem}
              datatype={'search'}
              ref={hoverButtonSearch}
            >
              <HoverComponent
                hoverText={translation['SEARCH_PLACEHOLDER']}
                parentRef={hoverButtonSearch}
              >
                <div className={classes.menu_btn_img_wr}>
                  <IconSearch
                    size={20}
                    color="#999999"
                    className={classes.menu_btn_path + ' ' + classes.menu_btn_stroke}
                  />
                </div>
              </HoverComponent>
            </div>

            {isLogged ? (
              <div>
                {favoritesList && favoritesList.length > 0 ? (
                  <div
                    className={classes.menu_btn}
                    onClick={onClickMenuItem}
                    datatype={'favorites'}
                    ref={hoverButtonFav}
                    style={{ zIndex: 6 }}
                  >
                    <HoverComponent
                      hoverText={translation['FAVORITES_TITLE']}
                      parentRef={hoverButtonFav}
                    >
                      <div className={classes.menu_btn_img_wr}>
                        <IconHeart
                          size={20}
                          color="#999999"
                          className={classes.menu_btn_path + ' ' + classes.menu_btn_stroke}
                        />

                        {/*
                        <AnimatePresence>
                          {favoritesList &&
                          favoritesList.length > 0 &&
                          animateFavoritesShowStatus ? (
                            <motion.svg
                              key={'trigger-on-add'}
                              transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              variants={variantsAddFavoritesAnim}
                              width="15"
                              height="14"
                              viewBox="0 0 15 14"
                              className={classes.menu_btn_svg_anim}
                            >
                              <path
                                className={classes.menu_btn_path + ' ' + classes.menu_btn_stroke}
                                d="M7.5 0.979654L9.61942 4.55066C9.69067 4.67072 9.80889 4.75552 9.94546 4.78454L14.0435 5.65542L11.2553 8.71771C11.1595 8.82296 11.113 8.96406 11.1276 9.10564L11.5503 13.2023L7.69846 11.5365C7.57182 11.4818 7.42818 11.4818 7.30154 11.5365L3.4497 13.2023L3.87236 9.10564C3.88697 8.96406 3.84054 8.82296 3.74471 8.71771L0.956532 5.65542L5.05454 4.78454C5.19111 4.75552 5.30932 4.67072 5.38058 4.55066L7.5 0.979654Z"
                                fill="#999999"
                                stroke="#999999"
                                strokeLinejoin="round"
                              ></path>
                            </motion.svg>
                          ) : null}
                        </AnimatePresence>
                        <AnimatePresence>
                          {animateFavoritesHideStatus ? (
                            <svg
                              width="40"
                              height="45"
                              fill="none"
                              viewBox="0 0 40 45"
                              className={classes.menu_btn_svg_anim}
                            >
                              <motion.path
                                key={'trigger-on-remove'}
                                transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={variantsRemoveFavoritesAnimLeft}
                                className={classes.menu_btn_path}
                                stroke="#999999"
                                strokeLinejoin="round"
                                d="m20.25 15.5-2.55 4.296-4.95 1.052 3.375 3.706-.51 4.946 4.635-2.005"
                              />
                              <motion.path
                                key={'trigger-on-remove2'}
                                transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1] }}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={variantsRemoveFavoritesAnimRight}
                                className={classes.menu_btn_path}
                                stroke="#999999"
                                strokeLinejoin="round"
                                d="m19.75 15.5 2.55 4.296 4.95 1.052-3.375 3.706.51 4.946-4.635-2.005"
                              />
                            </svg>
                          ) : null}
                        </AnimatePresence> */}
                      </div>
                    </HoverComponent>
                  </div>
                ) : null}
                {userUploadButtonStatus ? (
                  <div
                    className={classes.menu_btn}
                    onClick={onClickMenuItem}
                    datatype={'userUpload'}
                    ref={hoverButtonUpload}
                  >
                    <HoverComponent
                      hoverText={translation['MY_UPLOUDS_TITLE']}
                      parentRef={hoverButtonUpload}
                    >
                      <div className={classes.menu_btn_img_wr}>
                        <IconUpload size={20} color="#999999" className={classes.menu_btn_rect} />
                      </div>
                    </HoverComponent>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className={classes.menu_bot}>
        <div
          className={classes.menu_btn}
          onMouseEnter={onEnterDropdown}
          onMouseLeave={onLeaveDropdown}
          onTouchStart={onTouchStartDropdown}
        >
          <div className={classes.menu_btn_img_wr}>
            <IconQuestionMark size={20} color="#999999" className={classes.menu_btn_path} />
          </div>
          <div className={classes.menu_btn_info_wrap}>
            <div className={classes.menu_dop_info_link} onClick={onClickVideos}>
              <div className={classes.menu_dop_info_info_link_icon}>
                <img src="/src_designer/images/menu_help_videos.svg" />
              </div>
              {translation['TEXT_HELP_VIDEOS']}
            </div>
            {!isCurrDeviceAPhone ? (
              <div className={classes.menu_dop_info_link} onClick={onClickTips}>
                <div className={classes.menu_dop_info_info_link_icon}>
                  <img src="/src_designer/images/menu_help_hotkeys.svg" />
                </div>
                {translation['TEXT_HELP_HOT_KEYS']}
              </div>
            ) : null}

            <div className={classes.menu_dop_info_link} onClick={onClickSupport}>
              <div className={classes.menu_dop_info_info_link_icon}>
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
