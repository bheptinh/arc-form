import 'simplebar-react/dist/simplebar.min.css';

import { IconCopy, IconPlus, IconRosetteDiscountFilled, IconTrash } from '@tabler/icons-react';
import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { planner, user } from '../../../../../../initR2D';
import { selectIsProjectBelongToLoggedUser } from '../../../../../../redux/features/common/commonSlice';
import {
  controlPanelHistoryScrollSave,
  selectActiveControlPanelMode,
  selectActiveControlPanelModeData,
  selectDynamicPanelPreviewViewType,
  updateAnimateFavoritesHideStatus,
  updateAnimateFavoritesShowStatus,
  updateDynamicPanelPreviewViewType,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import { changeUndoRedo } from '../../../../../../redux/features/topPanel/topPanelSlice';
import {
  selectIsLogged,
  selectUserProfileData,
  selectUserProjectActive,
} from '../../../../../../redux/features/user/userSlice';
import FavoriteStarIcon from '../../../../../common/FavoriteStarIcon';
import ModalMoreInfo from '../../../../../common/ModalMoreInfo';
import MoreInfoIcon from '../../../../../common/MoreInfoIcon';
import HoverComponent from '../../../controlPanel/components/HoverComponent';
import Navigation from '../../navigation/Navigation';

const useStyle = createUseStyles({
  planner_catalog_cont: {
    borderRight: '1px solid var(--color-border-light)',
    background: 'var(--color-white)',
    height: '100%',
    display: 'grid',
    alignContent: 'baseline',
    gridTemplateRows: 'auto 1fr',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
    width: 309,
    position: 'absolute',
    left: 0,
    top: 0,
    '@media screen and (max-width: 950px)': {
      width: 189,
    },
  },
  catalog_wr: {
    overflow: 'hidden',
    height: '100%',
    position: 'relative',
    borderTop: '1px solid var(--color-border)',
  },
  prod_elem_wrap: {
    display: 'flex',
    flexWrap: 'wrap',
    width: 'calc(100% + 1px)',
  },
  prod_item_upload_btn_wr: {
    height: '100%',
    width: '100%',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexWrap: 'wrap',
  },
  prod_item_upload_btn: {
    width: '100%',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 15px',
    fontSize: '16px',
    cursor: 'pointer',
    background: 'var(--color-white)',
    position: 'relative',
    borderBottom: '1px solid var(--color-border)',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    fontFamily: 'RobotoCondensed-Regular',
    zIndex: 1,
    '&:after': {
      top: '0',
      left: '0',
      width: '100%',
      height: '29px',
      content: '""',
      zIndex: -1,
      position: 'absolute',
      background: 'linear-gradient(to bottom, var(--color-surface-subtle), transparent)',
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      background: 'var(--color-accent-soft)',
      '&:after': {
        opacity: 0,
      },
    },
    '@media screen and (max-width: 950px)': {
      height: 25,
      fontSize: '10px',
    },
  },
  prod_item_upload_plashka: {
    position: 'absolute',
    top: 7,
    right: 7,
    color: 'var(--color-slate)',
    textTransform: 'uppercase',
    fontSize: 13,
    background: 'var(--color-warning)',
    padding: '3px 4px',
    borderRadius: 3,
    '@media screen and (max-width: 950px)': {
      fontSize: 9,
      top: 3,
      right: 3,
    },
  },
  prod_item_upload_btn_line: {
    background: 'var(--color-slate)',
    height: 1,
    width: '100%',
    position: 'relative',
    '&:before': {
      content: '" "',
      bottom: '100%',
      left: 0,
      width: '100%',
      height: 1,
      background: 'var(--color-white)',
      position: 'absolute',
    },
    '&:after': {
      content: '" "',
      top: '100%',
      left: 0,
      width: '100%',
      height: 1,
      background: 'var(--color-white)',
      position: 'absolute',
    },
  },
  prod_item_upload_btn_img: {
    width: 25,
    height: 25,
    userSelect: 'none',
    userDrag: 'none',
    marginRight: 16,
    '@media screen and (max-width: 950px)': {
      width: 13,
      height: 13,
    },
  },
  prod_item: {
    overflow: 'hidden',
    position: 'relative',
    display: 'grid',
    transition: 'width 0.2s ease-in, height 0.2s ease-in',
    alignContent: 'baseline',
    gridTemplateRows: 'auto 1fr',
    height: 'auto',
    borderBottom: '1px solid var(--color-surface-muted)',
    borderRight: '1px solid var(--color-surface-muted)',
    paddingBottom: '7px',
    outline: 'none',
    '&:hover': {
      '& $prod_item_img_wr img': {
        transform: 'scale(1.05)',
      },
      '& $prod_item_fav_btn': {
        opacity: 1,
      },
      '& $prod_item_zamok_btn': {
        opacity: 0,
        pointerEvents: 'none',
      },
      '& $prod_item_more_info': {
        zIndex: 9,
        opacity: 1,
      },
      '& $prod_item_custom_delete_btn': {
        opacity: 1,
      },
      '& $prod_item_hover_left': {
        height: '100%',
      },
      '& $prod_item_hover_top': {
        width: '100%',
      },
      '& $prod_item_hover_right': {
        height: '100%',
      },
      '& $prod_item_hover_bottom': {
        width: '100%',
      },
      '& $prod_item_dop_btns_wr': {
        transform: 'translateY(0%)',
      },
    },
  },
  prod_item_hover_left: {
    width: 2,
    height: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    zIndex: 4,
    background: 'var(--color-border)',
    transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:before': {
      content: '" "',
      position: 'absolute',
      left: '100%',
      top: 2,
      height: 'calc(100% - 4px)',
      width: 1,
      background: 'var(--color-white)',
    },
  },
  prod_item_hover_top: {
    width: 0,
    height: 2,
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    zIndex: 4,
    background: 'var(--color-border)',
    transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:before': {
      content: '" "',
      position: 'absolute',
      top: '100%',
      left: 2,
      width: 'calc(100% - 4px)',
      height: 1,
      background: 'var(--color-white)',
    },
  },
  prod_item_hover_right: {
    width: 2,
    height: 0,
    position: 'absolute',
    bottom: 0,
    right: 0,
    pointerEvents: 'none',
    zIndex: 4,
    background: 'var(--color-border)',
    transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:before': {
      content: '" "',
      position: 'absolute',
      right: '100%',
      top: 2,
      height: 'calc(100% - 4px)',
      width: 1,
      background: 'var(--color-white)',
    },
  },
  prod_item_hover_bottom: {
    width: 0,
    height: 2,
    position: 'absolute',
    bottom: 0,
    right: 0,
    pointerEvents: 'none',
    zIndex: 4,
    background: 'var(--color-border)',
    transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:before': {
      content: '" "',
      position: 'absolute',
      bottom: '100%',
      left: 2,
      width: 'calc(100% - 4px)',
      height: 1,
      background: 'var(--color-white)',
    },
  },
  prod_item_big: {
    width: '100%',
  },
  prod_item_medium: {
    width: '50%',
    paddingBottom: 0,
    '& $prod_item_title': {
      display: 'flex',
      alignItems: 'center',
      padding: '4px 6px',
      fontSize: 13,
      '@media screen and (max-width: 950px)': {
        fontSize: 11,
        overflow: 'hidden',
      },
    },
    '& $prod_item_img_wr': {
      margin: 0,
    },
    '& $prod_item_fav_btn': {
      width: 18,
      height: 18,
    },
    '& $prod_item_zamok_btn': {
      width: 18,
      height: 18,
    },
    '& $prod_item_custom_delete_btn': {
      width: 18,
      height: 18,
    },
    '& $prod_item_promocode_btn': {
      width: 18,
      height: 18,
    },
    '& $prod_item_dop_btns_wr': {
      height: 27,
    },
  },
  prod_item_small: {
    width: '25%',
    paddingBottom: 0,
    '& $prod_item_img_wr': {
      margin: 0,
    },
    '& $prod_item_fav_btn': {
      width: 15,
      height: 15,
      '@media screen and (max-width: 950px)': {
        height: 10,
        width: 10,
        top: 2,
        left: 2,
      },
    },
    '& $prod_item_zamok_btn': {
      width: 15,
      height: 15,
      '@media screen and (max-width: 950px)': {
        height: 10,
        width: 10,
        top: 2,
        right: 2,
      },
    },
    '& $prod_item_custom_delete_btn': {
      width: 15,
      height: 15,
      '@media screen and (max-width: 950px)': {
        height: 10,
        width: 10,
        bottom: 2,
        right: 2,
      },
    },
    '& $prod_item_promocode_btn': {
      width: 15,
      height: 15,
      '@media screen and (max-width: 950px)': {
        height: 10,
        width: 10,
        top: 2,
        right: 2,
      },
    },
    '& $prod_item_more_info': {
      width: 15,
      height: 15,
      '@media screen and (max-width: 950px)': {
        height: 10,
        width: 10,
        top: 2,
        right: 2,
      },
    },
    '& $prod_item_title': {
      fontSize: 12,
    },
    '& $prod_item_dop_btns_wr': {
      height: 25,
    },
    '& $prod_item_btn_copy': {
      width: 13,
      height: 13,
    },
  },
  prod_item_img_wr: {
    overflow: 'hidden',
    width: '100%',
    display: 'flex',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: '1 / 1',
    marginBottom: 7,
    '& img': {
      maxWidth: '100%',
      maxHeight: '100%',
      transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    },
  },
  prod_item_dop_btns_wr: {
    left: 0,
    width: '100%',
    bottom: 0,
    height: 34,
    display: 'flex',
    position: 'absolute',
    transform: 'translateY(102%)',
    background: 'rgba(68, 68, 68, 0.7)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    alignItems: 'center',
    zIndex: 3,
    pointerEvents: 'none',
    padding: '0 6px',
  },
  prod_item_btn_copy: {
    width: 16,
    cursor: 'pointer',
    height: 16,
    pointerEvents: 'auto',
    '&:hover': {
      '& svg': {
        stroke: 'var(--color-accent-soft)',
      },
    },
  },
  prod_item_btn_icon: {
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  prod_item_fav_btn: {
    width: '24px',
    height: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    background: 'var(--color-white)',
    position: 'absolute',
    top: 5,
    left: 5,
    zIndex: 3,
    opacity: 0,
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    cursor: 'pointer',
    '& svg': {
      cursor: 'pointer',
      maxWidth: '100%',
      maxHeight: '100%',
      width: 'auto',
      height: 'auto',
    },
    '& path': {
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      '& path': {
        stroke: 'var(--color-icon-info)',
        fillOpacity: 0,
        '@media screen and (max-width: 950px)': {
          stroke: 'var(--color-icon-dark)',
          fillOpacity: 1,
        },
      },
    },
  },
  prod_item_fav_btn_active: {
    '& path': {
      fill: 'var(--color-icon-info)',
      stroke: 'var(--color-icon-info)',
      fillOpacity: 1,
    },
  },
  prod_item_zamok_btn: {
    width: '24px',
    height: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'var(--color-white)',
    borderRadius: '50%',
    position: 'absolute',
    top: 5,
    right: 5,
    zIndex: 1,
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    '& svg': {
      width: 18,
      height: 'auto',
    },
  },
  prod_item_custom_delete_btn: {
    bottom: '5px',
    right: '5px',
    width: '24px',
    height: '24px',
    display: 'flex',
    opacity: 0,
    zIndex: 3,
    position: 'absolute',
    background: 'var(--color-white)',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    alignItems: 'center',
    borderRadius: '50%',
    justifyContent: 'center',
    cursor: 'pointer',
    '&:hover svg': {
      stroke: 'var(--color-danger)',
    },
  },
  prod_item_custom_delete: {
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
  },
  prod_item_promocode_btn: {
    width: '24px',
    height: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'var(--color-white)',
    borderRadius: '50%',
    position: 'absolute',
    bottom: 5,
    right: 5,
    zIndex: 3,
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
  },
  prod_item_more_info: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 18,
    height: 18,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    background: 'var(--color-white)',
    opacity: 0,
    zIndex: -1,
    transition: 'all .3s cubic-bezier(.19,1,.22,1)',
    cursor: 'pointer',
    '& path': {
      transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    },
  },
  item_info_color_wr: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 15,
    '&:empty': {
      marginBottom: 0,
    },
  },
  item_info_color: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    margin: '0 1px',
    border: '1px solid var(--color-surface-muted)',
  },
  item_info_color_more: {
    width: '18px',
    height: '18px',
    margin: '0 1px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prod_item_title: {
    color: 'var(--color-black)',
    fontSize: '16px',
    padding: '0 13px 0px',
    fontFamily: 'RobotoCondensed-Regular',
    overflow: 'hidden',
    '&>div': {
      display: '-webkit-box',
      WebkitLineClamp: '2',
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: '10px',
      padding: '0 6px 0',
    },
  },
  item_info_content: {
    color: 'var(--color-text-subtle)',
    fontSize: '13px',
    padding: '0 13px 0',
    lineHeight: 1.4,
    '& span': {
      marginRight: 3,
    },
    '& > div:not($item_info_not_essential_attribute)': {
      display: 'flex',
      alignItems: 'center',
    },
    '& > div > div:first-child': {
      marginBottom: '3px',
      fontFamily: 'RobotoCondensed-Regular',
    },
    '&>div>div': {
      fontSize: '17px',
      color: 'var(--color-black)',
      display: 'inline-block',
      marginLeft: 4,
      '@media screen and (max-width: 950px)': {
        fontSize: '8px',
      },
    },
    '@media screen and (max-width: 950px)': {
      fontSize: '8px',
      padding: '0 6px 0',
    },
  },
  item_info_not_essential_attribute: {},
  item_info_content_span: {
    color: 'var(--color-black)',
  },
  prod_item_overlay: {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  previewSelectedObject: {
    userSelect: 'none',
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 9,
  },
  selectedTouched: {
    transition: 'all .5s ease',
  },
  hidden: {
    visibility: 'hidden',
  },
  product_hover: {
    maxHeight: 150,
    padding: '6px 20px',
    textAlign: 'center',
    border: '1px solid var(--color-border-strong)',
    position: 'absolute',
    borderRadius: 3,
    display: 'inline',
    zIndex: 105,
    background: 'var(--color-white)',
    pointerEvents: 'none',
    fontSize: 12,
    '&:after': {
      content: "''",
      position: 'absolute',
      right: '100%',
      top: '50%',
      transform: 'translate(45%, -50%) rotate(135deg)',
      width: 10,
      height: 10,
      background: 'var(--color-white)',
      borderRight: '1px solid var(--color-border-strong)',
      borderBottom: '1px solid var(--color-border-strong)',
    },
    '& p': {
      fontSize: 12,
    },
  },
  product_hover_discount: {
    maxWidth: 200,
    maxHeight: 200,
    padding: '10px 20px',
    textAlign: 'center',
    border: '1px solid var(--color-border-strong)',
    position: 'absolute',
    borderRadius: 3,
    display: 'inline',
    zIndex: 105,
    background: 'var(--color-white)',
    pointerEvents: 'none',
    '& > div': {
      display: 'flex',
    },
    '&:after': {
      content: "''",
      position: 'absolute',
      right: '100%',
      top: '50%',
      transform: 'translate(45%, -50%) rotate(135deg)',
      width: 10,
      height: 10,
      background: 'var(--color-white)',
      borderRight: '1px solid var(--color-border-strong)',
      borderBottom: '1px solid var(--color-border-strong)',
    },
    '& p': {
      fontSize: 12,
    },
  },
  discountValueText: {
    fontWeight: 700,
    marginLeft: 2,
  },
  preloaderBlock: {
    background: 'rgba(0, 0, 0, .2)',
    zIndex: 4,
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
    transition: 'all 1s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  '@keyframes shake': {
    '0%': { transform: 'rotate(0deg)' },
    '25%': { transform: 'rotate(-5deg)' },
    '50%': { transform: 'rotate(5deg)' },
    '75%': { transform: 'rotate(-5deg)' },
    '100%': { transform: 'rotate(0deg)' },
  },

  '@keyframes floatUp': {
    '0%': {
      transform: 'translateY(0) scale(0.8)',
      opacity: 0.8,
    },
    '50%': {
      transform: 'translateY(-100px) scale(1.2)',
      opacity: 1,
    },
    '100%': {
      transform: 'translateY(-250px) scale(0.5)',
      opacity: 0,
    },
  },
});

const Products = (props) => {
  const dispatch = useDispatch();
  const userData = useSelector(selectUserProfileData);

  const activeControlPanel = useSelector(selectActiveControlPanelMode);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const [savedScroll, setSavedScroll] = useState(lastHistoryElem?.lastSavedScroll);

  const dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);
  const isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);

  const isLogged = useSelector(selectIsLogged);
  const translation = useTranslation();

  const [modelsListState, setModelsListState] = useState(null);
  const [customModelsListState, setCustomModelsListState] = useState(null);

  const [lastHistoryElemData, setLastHistoryElemData] = useState(null);
  const [preloaderStatus, setPreloaderStatus] = useState(true);

  const [userFavorites, setUserFavorites] = useState(user.data.favorites?.items);
  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

  const userProjectActive = useSelector(selectUserProjectActive);
  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';
  let borderTimeoutKey;

  let isObjLoaded = false;
  let selectedObjId = null;
  let selectedObjPreviewUrl = null;
  let startingPointX = 0;
  let startingPointY = 0;
  let selectedObjPreviewRatio = 0;
  let previewObjOpacity = 1;
  let mouseDownOnObj = false;
  let selectedObjImgWidth = 0;
  let selectedObjImgHeight = 0;
  let scrollTimer = -1;
  const panelRef = useRef(null);

  const mainDiv = useRef(null);
  const catalogMain = useRef(null);

  const [modalMoreInfo, setModalMoreInfo] = useState(false);
  const [productElemHover, setProductElemHover] = useState(null);

  const classes = useStyle();

  const mouseEnter = async (event, data) => {
    if (dynamicPanelPreviewViewType == 'small') {
      if (mouseDownOnObj || isCurrDeviceAPhone) return;
      document.querySelector('.' + classes.product_hover) &&
        document.querySelector('.' + classes.product_hover).remove();

      const product = event.currentTarget;
      const hoverWindow = document.createElement('div');
      hoverWindow.classList.add(classes.product_hover);

      document.querySelector('body').append(hoverWindow);

      const textHover = document.createElement('p');
      textHover.innerHTML = data.name;
      hoverWindow.append(textHover);

      setTimeout(() => {
        hoverWindow.style.left = product.getBoundingClientRect().left + product.offsetWidth + 'px';
        hoverWindow.style.top =
          product.getBoundingClientRect().top +
          (product.offsetHeight - hoverWindow.offsetHeight) / 2 +
          'px';
      }, 50);
    }
  };

  const mouseLeave = (e) => {
    if (dynamicPanelPreviewViewType == 'small') {
      document.querySelector('.' + classes.product_hover) &&
        document.querySelector('.' + classes.product_hover).remove();
    }
  };

  const mouseDiscountEnter = async (event, discount, promocode) => {
    if (mouseDownOnObj || isCurrDeviceAPhone) return;
    document.querySelector('.' + classes.product_hover) &&
      document.querySelector('.' + classes.product_hover).classList.add(classes.hidden);

    const product = event.currentTarget;
    const closesetCatalogElem = event.target.closest('.' + classes.prod_item);
    const hoverWindow = document.createElement('div');
    hoverWindow.classList.add(classes.product_hover_discount);

    document.querySelector('body').append(hoverWindow);

    const discountDiv = document.createElement('div');
    const discountDivText = document.createElement('p');
    const discountDivValue = document.createElement('p');
    discountDivText.innerHTML = translation['PRODUCT_DISCOUNT'] + ': ';
    discountDivValue.innerHTML = discount + '%';
    discountDivValue.classList.add(classes.discountValueText);
    discountDiv.append(discountDivText);
    discountDiv.append(discountDivValue);

    const promocodeDiv = document.createElement('div');
    const promocodeDivText = document.createElement('p');
    const promocodeDivValue = document.createElement('p');
    promocodeDivValue.classList.add(classes.discountValueText);
    promocodeDivText.innerHTML = translation['PRODUCT_PROMOCODE'] + ': ';
    promocodeDivValue.innerHTML = promocode;
    promocodeDiv.append(promocodeDivText);
    promocodeDiv.append(promocodeDivValue);

    hoverWindow.append(discountDiv);
    hoverWindow.append(promocodeDiv);
    setTimeout(() => {
      hoverWindow.style.left =
        closesetCatalogElem.getBoundingClientRect().left + closesetCatalogElem.offsetWidth + 'px';
      hoverWindow.style.top =
        product.getBoundingClientRect().top +
        (product.getBBox().height - hoverWindow.offsetHeight) / 2 +
        'px';
    }, 50);
  };

  const mouseDiscountLeave = (e) => {
    document.querySelector('.' + classes.product_hover_discount) &&
      document.querySelector('.' + classes.product_hover_discount).remove();
  };

  let timer = null;
  let previewObj = null;
  let currentMouseDownElem = null;
  let plannerCatalogElem, currentOverlayCoords, dragTimeout;

  // Drag from catalog for models
  const onMouseDownProduct = (e, elem) => {
    currentMouseDownElem = elem;
    document.addEventListener('mouseup', onObjectMouseUp);
    document.addEventListener('touchend', onObjectMouseUp);
    if (props.type == 'replace') return;
    if (document.querySelector('.' + classes.prod_elem_wrap))
      document.querySelector('.' + classes.prod_elem_wrap).style.touchAction = 'auto';
    if (document.querySelector('.' + classes.catalog_wr))
      document.querySelector('.' + classes.catalog_wr).style.touchAction = 'auto';
    const id = elem.id;
    const previewUrl = elem.source?.images.preview;
    if (mouseDownOnObj) return;
    currentOverlayCoords = e.target.getBoundingClientRect();
    plannerCatalogElem = e.currentTarget.closest(`.${classes.prod_item}`);
    document.querySelector('.' + classes.product_hover) &&
      document.querySelector('.' + classes.product_hover).remove();
    document.querySelector('.' + classes.product_hover_discount) &&
      document.querySelector('.' + classes.product_hover_discount).remove();
    mouseDownOnObj = true;
    const selectedObjImg = plannerCatalogElem.querySelector('img');
    selectedObjImgWidth = selectedObjImg?.offsetWidth;
    selectedObjImgHeight = selectedObjImg?.offsetHeight;
    selectedObjPreviewRatio =
      1 /
      (R2D.Viewers._instance.getOffsetWidthDueToOpenedPanels() -
        (currentOverlayCoords.x + currentOverlayCoords.width));
    selectedObjId = id;
    selectedObjPreviewUrl = previewUrl;
    const newXPos = e.clientX || (e.touches && e.touches[0].clientX);
    const newYPos = e.clientY || (e.touches && e.touches[0].clientY);
    startingPointX = newXPos - selectedObjImg?.getBoundingClientRect().left;
    startingPointY = newYPos - selectedObjImg?.getBoundingClientRect().top;
    document.addEventListener('mousemove', onObjectMove);
    document.addEventListener('touchmove', onObjectMove);
    timer = Date.now();
    borderTimeoutKey = setTimeout(
      () => plannerCatalogElem.classList.add(classes.selectedTouched),
      100
    );
  };

  const onObjectMove = (e) => {
    if (Date.now() - timer > 100) {
      if (!isObjLoaded) {
        const imgElem = document.createElement('img');
        previewObj = document.createElement('div');
        imgElem.src = R2D.URL.DOMAIN + selectedObjPreviewUrl;
        previewObj.classList.add(classes.previewSelectedObject);
        imgElem.style.width = selectedObjImgWidth + 'px';
        imgElem.style.height = selectedObjImgHeight + 'px';
        previewObj.append(imgElem);
        document.querySelector('body').append(previewObj);
        planner.scene.dragProductFromCatalog(selectedObjId);
        isObjLoaded = true;
      }

      const newXPos = e.clientX || (e.touches && e.touches[0].clientX);
      const newYPos = e.clientY || (e.touches && e.touches[0].clientY);
      const outFromPanelVal = currentOverlayCoords.x + currentOverlayCoords.width - newXPos;
      previewObjOpacity = outFromPanelVal > 0 ? 1 : 1 + outFromPanelVal * selectedObjPreviewRatio;
      previewObj.style.opacity = previewObjOpacity;
      previewObj.style.left = newXPos - startingPointX + 'px';
      previewObj.style.top = newYPos - startingPointY + 'px';
      isCurrDeviceAPhone && planner.mih().state.mouseMove(e);
    }
  };

  const onObjectMouseUp = async (e) => {
    document.removeEventListener('mouseup', onObjectMouseUp);
    document.removeEventListener('touchend', onObjectMouseUp);
    if (props.type == 'replace') {
      if (
        currentMouseDownElem.id == R2D.scene.currentView3DObject?.getProductId &&
        R2D.scene.currentView3DObject.getProductId()
      )
        return;
      const result = await R2D.scene.replaceCurrentObject(
        currentMouseDownElem.id,
        {},
        false,
        false
      );
      if (result?.type == 'error')
        return dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));
      planner
        .mih()
        .setActiveObjectProduct(planner.mih()._productHelper.findObjectView3dBySceneObject(result));
      dispatch(changeUndoRedo());
    } else {
      clearTimeout(borderTimeoutKey);
      document.removeEventListener('mousemove', onObjectMove);
      document.removeEventListener('touchmove', onObjectMove);
      previewObj && previewObj.remove();
      isObjLoaded = false;
      previewObjOpacity = 1;
      mouseDownOnObj = false;
      selectedObjId = null;
      selectedObjImgWidth = 0;
      selectedObjImgHeight = 0;
      Array.from(document.querySelectorAll('.' + classes.prod_item)).forEach((i) =>
        i.classList.remove(classes.selectedTouched)
      );

      const newXPos = e.clientX || (e?.changedTouches && e.changedTouches[0].clientX);

      if (Date.now() - timer > 100) {
        const sceneObjectToDelete =
          R2D.mouseInteractionHelper.stateDraggingProdFromCatalog.view3DObject?.sceneObject;
        if (newXPos < R2D.Viewers._instance.getOffsetWidthDueToOpenedPanels()) {
          planner.mih().state && planner.mih().state.mouseUp(e);
          if (sceneObjectToDelete) {
            R2D.scene.remove(sceneObjectToDelete);
            R2D.scene.history.removeUndoState();
          }
        }
        R2D.mouseInteractionHelper.stateDraggingProdFromCatalog.view3DObject = null;
      }
      if (document.querySelector('.' + classes.prod_elem_wrap))
        document.querySelector('.' + classes.prod_elem_wrap).style.touchAction = 'auto';
      if (document.querySelector('.' + classes.catalog_wr))
        document.querySelector('.' + classes.catalog_wr).style.touchAction = 'auto';
      currentMouseDownElem = null;
      dispatch(changeUndoRedo());
    }
  };

  // Drag from catalog for materials
  const onMouseDownMaterial = (e, elem) => {
    const id = elem.id;
    document.addEventListener('mousemove', onMaterialMove);
    document.addEventListener('mouseup', onMaterialMouseUp);
    timer = Date.now();
    plannerCatalogElem = e.currentTarget.closest(`.${classes.prod_item}`);
    currentMouseDownElem = elem;
    dragTimeout = setTimeout(() => {
      e.nativeEvent.button == 0 ? planner.scene.dragProductFromCatalog(id) : null;
    }, 100);
  };

  const onMaterialMove = (e) =>
    Date.now() - timer > 100 && planner.mih().state && planner.mih().state.mouseMove(e);

  const onMaterialMouseUp = (e) => {
    clearTimeout(dragTimeout);
    document.removeEventListener('mousemove', onMaterialMove);
    document.removeEventListener('mouseup', onMaterialMouseUp);
    document.querySelector('.product_hover')
      ? document.querySelector('.product_hover').remove()
      : null;

    if (Date.now() - timer > 100) {
      if (e.clientX < R2D.Viewers._instance.getOffsetWidthDueToOpenedPanels()) {
        R2D.mouseInteractionHelper.stateDraggingMaterial.isPlaceMaterialAllowed = false;
        planner.mih().state && planner.mih().state.mouseUp(e);
      }
    }
  };

  const onCustomModelAddMouseUp = (e) => {
    if (+lastHistoryElem.privateMaterialType == 2)
      dispatch(
        setActivePopup({ name: 'uploadCustomModelPopup', data: lastHistoryElem.id, backBtn: false })
      );
    else dispatch(setActivePopup({ name: 'uploadCustomMaterialPopup', backBtn: false }));
  };

  const onScroll = (e) => {
    if (scrollTimer != -1) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => scrollFinished(), 500);
  };

  const scrollFinished = () => {
    dispatch(
      controlPanelHistoryScrollSave(
        catalogMain.current.getScrollElement().scrollTop
          ? catalogMain.current.getScrollElement().scrollTop
          : 0
      )
    );
    setSavedScroll(
      catalogMain.current.getScrollElement().scrollTop
        ? catalogMain.current.getScrollElement().scrollTop
        : 0
    );
  };

  const updateFavorites = async (id, isInFavorites) => {
    if (!isLogged) return dispatch(setActivePopup({ name: 'login' }));
    if (isInFavorites) {
      await user.uRemoveFromFavorites(id);
      setUserFavorites((prev) => prev.filter((i) => i.id != id));
      dispatch(updateAnimateFavoritesHideStatus(true));
      setTimeout(() => dispatch(updateAnimateFavoritesHideStatus(false)), 10);
    } else {
      const response = await user.uAddToFavorites(id);
      setUserFavorites((prev) => {
        const newArray = prev;
        return [...newArray, response];
      });

      dispatch(updateAnimateFavoritesShowStatus(true));
      setTimeout(() => dispatch(updateAnimateFavoritesShowStatus(false)), 10);
    }
    planner.apiScene.dispatchEvent(new Event(planner.apiScene.FAVORITES_BUTTON, {}));
  };

  const onMouseEnterProductMoreInfo = (e, elem) => {
    setModalMoreInfo(true);
    setProductElemHover(elem);
  };
  const onMouseLeaveProductMoreInfo = (e) => {
    setModalMoreInfo(false);
  };

  const onProductsUpdated = async (e) => {
    setPreloaderStatus(true);
    const loadedData = await planner.scene.categoryDataLoad(
      lastHistoryElem.urlList,
      R2D.controller.getCountry()
    );
    setLastHistoryElemData(loadedData);
    setPreloaderStatus(false);
  };

  const copyMaterial = (e, elem) => R2D.CopyPaste.copyMaterial({ id: elem.id });

  useEffect(() => {
    setStyleAnimation({ transform: 'translateX(0%)' });
    activeControlPanel == 'decor' &&
      planner.apiScene.dispatchEvent(new Event(planner.apiScene.TIPS_UPLOAD_CUSTOM_MAT, {}));
    planner.scene.addEventListener(planner.scene.PRODUCTS_UPDATED, onProductsUpdated);
    return () =>
      planner.scene.removeEventListener(planner.scene.PRODUCTS_UPDATED, onProductsUpdated);
  }, []);

  useEffect(() => {
    setTimeout(
      () =>
        Array.from(document.querySelectorAll('.' + classes.prod_item)).forEach((item) =>
          item.removeAttribute('style')
        ),
      300
    );
    let scrollElemMain;
    if (catalogMain.current && catalogMain.current.getScrollElement) {
      scrollElemMain = catalogMain.current.getScrollElement();
      setTimeout(() => (scrollElemMain.scrollTop = savedScroll), 0);
      scrollElemMain.addEventListener('scroll', onScroll);
    }
    return () => {
      document.querySelector('.' + classes.product_hover) &&
        document.querySelector('.' + classes.product_hover).remove();
      document.querySelector('.' + classes.product_hover_discount) &&
        document.querySelector('.' + classes.product_hover_discount).remove();
      scrollElemMain?.removeEventListener('scroll', onScroll);
    };
  }, [modelsListState, customModelsListState]);

  useEffect(() => {
    if (lastHistoryElemData && Array.isArray(lastHistoryElemData)) {
      const modelsList = [];
      const customModelsList = [];
      lastHistoryElemData.forEach((elem) => {
        const isInFavorites = userFavorites?.find((i) => i?.id == elem.id);
        if (elem.isOwner || elem.material_owner) {
          customModelsList.push(
            <div
              className={
                classes.prod_item +
                ' ' +
                classes.prod_item_custom +
                ' ' +
                classes[`prod_item_${dynamicPanelPreviewViewType}`]
              }
              style={{ pointerEvents: 'none' }}
              key={elem.id}
            >
              <div className={classes.prod_item_hover_left}></div>
              <div className={classes.prod_item_hover_top}></div>
              <div className={classes.prod_item_hover_right}></div>
              <div className={classes.prod_item_hover_bottom}></div>

              <div className={classes.prod_item_img_wr}>
                <img
                  data-src={R2D.URL.DOMAIN + elem.source?.images.preview}
                  src={R2D.URL.DOMAIN + elem.source?.images.preview}
                  className={'lazyload'}
                />

                {elem.type == R2D.ProductType.MATERIAL ? (
                  <div className={classes.prod_item_dop_btns_wr}>
                    <div
                      className={classes.prod_item_btn_copy}
                      onClick={(e) => copyMaterial(e, elem)}
                    >
                      <HoverComponent
                        hoverText={translation['BUTTON_COPY_MATERIAL']}
                        hoverTextPositionX={'right'}
                        hoverTextPositionY={'top'}
                      >
                        <IconCopy size={16} color="#fff" className={classes.prod_item_btn_icon} />
                      </HoverComponent>
                    </div>
                  </div>
                ) : null}

                <div
                  className={
                    isInFavorites
                      ? classes.prod_item_fav_btn + ' ' + classes.prod_item_fav_btn_active
                      : classes.prod_item_fav_btn
                  }
                  onClick={(e) => updateFavorites(elem.id, isInFavorites)}
                >
                  <FavoriteStarIcon />
                </div>
                <div
                  className={classes.prod_item_custom_delete_btn}
                  onClick={(e) =>
                    dispatch(
                      setActivePopup({
                        name: 'confirm',
                        type: 'delete_custom_element',
                        data: elem.id,
                      })
                    )
                  }
                >
                  <IconTrash size={16} color="#444" className={classes.prod_item_custom_delete} />
                </div>
                {dynamicPanelPreviewViewType != 'big' ? (
                  <div
                    className={classes.prod_item_more_info}
                    onMouseEnter={(e) => onMouseEnterProductMoreInfo(e, elem)}
                    onMouseLeave={onMouseLeaveProductMoreInfo}
                  >
                    <MoreInfoIcon />
                  </div>
                ) : null}
              </div>

              <div
                className={classes.prod_item_overlay}
                onMouseDown={(e) =>
                  elem.type == R2D.ProductType.MATERIAL
                    ? onMouseDownMaterial(e, elem)
                    : onMouseDownProduct(e, elem)
                }
                onTouchStart={(e) =>
                  elem.type == R2D.ProductType.MATERIAL
                    ? onMouseDownMaterial(e, elem)
                    : onMouseDownProduct(e, elem)
                }
                onMouseLeave={mouseLeave}
                onMouseEnter={(event) => mouseEnter(event, elem)}
              ></div>

              {dynamicPanelPreviewViewType != 'small' ? (
                <div className={classes.prod_item_title}>
                  <div>{elem.name}</div>
                </div>
              ) : null}
            </div>
          );
        } else {
          const metadata = elem.metadata;
          const matchedLinkObject =
            metadata?.multilinkwithip?.data &&
            (Object.values(metadata?.multilinkwithip?.data)?.find(
              (i) => i.country == R2D.config.location
            ) ||
              Object.values(metadata?.multilinkwithip?.data)?.find((i) => i.country == 'all'));
          const attributesArray = elem.attributes && Object.values(elem.attributes);
          let elemColors,
            attributesBrand,
            elemType,
            elemWidth,
            elemDepth,
            elemHeight,
            attributesStartingFrom,
            attributesSeatingHeight,
            attributesCurrency,
            othersAttributes;
          if (attributesArray?.length > 0) {
            attributesBrand = attributesArray.find((i) => i.systemName == 'brand');
            attributesSeatingHeight = attributesArray.find((i) => i.systemName == 'seating_height');
            attributesStartingFrom = attributesArray.find((i) => i.systemName == 'starting_from');
            attributesCurrency = attributesArray.find((i) => i.systemName == 'currency');
            othersAttributes = attributesArray.filter(
              (i) =>
                i.systemName != 'currency' &&
                i.systemName != 'starting_from' &&
                i.systemName != 'seating_height' &&
                i.systemName != 'brand'
            );
          }
          elemType = elem.type;
          elemWidth = elem.property?.sizes?.width;
          elemDepth = elem.property?.sizes?.depth;
          elemHeight = elem.property?.sizes?.height;

          if (elem.source.body?.colors) elemColors = elem.source.body?.colors;

          modelsList.push(
            <div
              className={
                classes.prod_item + ' ' + classes[`prod_item_${dynamicPanelPreviewViewType}`]
              }
              style={{ pointerEvents: 'none' }}
              key={elem.id}
            >
              <div className={classes.prod_item_hover_left}></div>
              <div className={classes.prod_item_hover_top}></div>
              <div className={classes.prod_item_hover_right}></div>
              <div className={classes.prod_item_hover_bottom}></div>
              <div className={classes.prod_item_img_wr}>
                <img
                  data-src={R2D.URL.DOMAIN + elem.source?.images.preview}
                  src={R2D.URL.DOMAIN + elem.source?.images.preview}
                  className={'lazyload'}
                />

                {elemType == R2D.ProductType.MATERIAL ? (
                  <div className={classes.prod_item_dop_btns_wr}>
                    <div
                      className={classes.prod_item_btn_copy}
                      onClick={(e) => copyMaterial(e, elem)}
                    >
                      <HoverComponent
                        hoverText={translation['BUTTON_COPY_MATERIAL']}
                        hoverTextPositionX={'right'}
                        hoverTextPositionY={'top'}
                      >
                        <IconCopy size={18} color="#fff" className={classes.prod_item_btn_icon} />
                      </HoverComponent>
                    </div>
                  </div>
                ) : null}

                <div
                  className={
                    isInFavorites
                      ? classes.prod_item_fav_btn + ' ' + classes.prod_item_fav_btn_active
                      : classes.prod_item_fav_btn
                  }
                  onClick={() => updateFavorites(elem.id, isInFavorites)}
                >
                  <FavoriteStarIcon />
                </div>
                {matchedLinkObject?.discount ? (
                  <div className={classes.prod_item_promocode_btn}>
                    <IconRosetteDiscountFilled
                      size={20}
                      color="#FFB400"
                      onMouseLeave={mouseDiscountLeave}
                      onMouseEnter={(event) =>
                        mouseDiscountEnter(
                          event,
                          matchedLinkObject?.discount,
                          matchedLinkObject?.promocode
                        )
                      }
                    />
                  </div>
                ) : null}
                {dynamicPanelPreviewViewType != 'big' ? (
                  <div
                    className={classes.prod_item_more_info}
                    onMouseEnter={(e) => onMouseEnterProductMoreInfo(e, elem)}
                    onMouseLeave={onMouseLeaveProductMoreInfo}
                  >
                    <MoreInfoIcon />
                  </div>
                ) : null}
              </div>

              {elemColors && dynamicPanelPreviewViewType == 'big' ? (
                <div className={classes.item_info_color_wr}>
                  {elemColors.slice(0, 10).map((i) => (
                    <div
                      className={classes.item_info_color}
                      key={Math.random()}
                      style={{ backgroundImage: `url(${R2D.URL.DOMAIN + i.url})` }}
                    ></div>
                  ))}
                  {elemColors.length > 10 ? (
                    <div className={classes.item_info_color_more}>
                      <img src="/src_designer/images/icon_dots.svg" />
                    </div>
                  ) : null}
                </div>
              ) : null}
              {dynamicPanelPreviewViewType != 'small' ? (
                <div className={classes.prod_item_title}>
                  <div>{elem.name}</div>
                </div>
              ) : null}
              {dynamicPanelPreviewViewType == 'big' ? (
                <div className={classes.item_info_content}>
                  {attributesStartingFrom && attributesCurrency ? (
                    <div>
                      {attributesStartingFrom.name}:{' '}
                      <div>
                        {attributesCurrency.value || ''} {attributesStartingFrom.value || ''}
                      </div>
                    </div>
                  ) : null}
                  {attributesBrand ? (
                    <div>
                      <span style={{ marginRight: 3 }}>{attributesBrand.name}:</span>{' '}
                      <span className={classes.item_info_content_span}>
                        {attributesBrand.value.value || ''}
                      </span>
                    </div>
                  ) : null}
                  {(!elemWidth && !elemDepth && !elemHeight) ||
                  elemType == R2D.ProductType.MATERIAL ? null : (
                    <div className={classes.item_info_content_sizes}>
                      {elemWidth ? (
                        <>
                          {translation['TEXT_WIDTH_SHORT']}:
                          <span className={classes.item_info_content_span}>
                            {planner.units.valueToString(elemWidth)}
                          </span>
                          <span>x</span>
                        </>
                      ) : null}
                      {elemDepth ? (
                        <>
                          {translation['TEXT_DEPTH_SHORT']}:
                          <span className={classes.item_info_content_span}>
                            {planner.units.valueToString(elemDepth)}
                          </span>
                          <span>x</span>{' '}
                        </>
                      ) : null}
                      {elemHeight ? (
                        <>
                          {translation['TEXT_HEIGHT_SHORT']}:
                          <span className={classes.item_info_content_span}>
                            {planner.units.valueToString(elemHeight)}{' '}
                          </span>{' '}
                          {planner.units.getName()}
                        </>
                      ) : null}
                    </div>
                  )}

                  {attributesSeatingHeight ? (
                    <div>
                      <span style={{ marginRight: 3 }}>{attributesSeatingHeight.name}: </span>
                      <span className={classes.item_info_content_span}>
                        {planner.units.valueToString(attributesSeatingHeight.value)}
                      </span>{' '}
                      {planner.units.getName()}
                    </div>
                  ) : null}

                  {othersAttributes?.length > 0
                    ? othersAttributes.map((i) => {
                        if (typeof i.value === 'object') {
                          return (
                            <div
                              className={classes.item_info_not_essential_attribute}
                              key={Math.random()}
                            >
                              <span>{i.name}: </span>
                              <span>
                                {i.value.map ? (
                                  i.value.map((y) => {
                                    return (
                                      <span className={classes.item_info_content_span}>
                                        {(y.value || '') +
                                          (y == i.value[i.value.length - 1] ? '' : ', ')}
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span className={classes.item_info_content_span}>
                                    {i.value?.value || ''}
                                  </span>
                                )}
                              </span>
                            </div>
                          );
                        }
                        return (
                          <div
                            className={classes.item_info_not_essential_attribute}
                            key={Math.random()}
                          >
                            <span>{i.name}: </span>
                            <span className={classes.item_info_content_span}>{i.value || ''}</span>
                          </div>
                        );
                      })
                    : null}
                </div>
              ) : null}

              <div
                className={classes.prod_item_overlay}
                onMouseDown={(e) =>
                  elemType == R2D.ProductType.MATERIAL
                    ? onMouseDownMaterial(e, elem)
                    : onMouseDownProduct(e, elem)
                }
                onTouchStart={(e) =>
                  elemType == R2D.ProductType.MATERIAL
                    ? onMouseDownMaterial(e, elem)
                    : onMouseDownProduct(e, elem)
                }
                onMouseLeave={mouseLeave}
                onMouseEnter={(event) => mouseEnter(event, elem)}
              ></div>
            </div>
          );
        }
      });
      setModelsListState(modelsList);
      setCustomModelsListState(customModelsList);
    }
  }, [
    lastHistoryElemData,
    userFavorites,
    userProjectActive,
    isProjectBelongToLoggedUser,
    isLogged,
    dynamicPanelPreviewViewType,
    userData,
  ]);

  useEffect(() => {
    setUserFavorites(user.data.favorites?.items || []);
  }, [isLogged]);

  useEffect(() => {
    if (lastHistoryElem?.urlList) {
      setPreloaderStatus(true);

      planner.scene
        .categoryDataLoad(lastHistoryElem.urlList, R2D.controller.getCountry())
        .then((loadedData) => {
          setLastHistoryElemData(loadedData);
        })
        .finally(() => setPreloaderStatus(false));
    }
  }, [userData]);

  useEffect(() => {
    if (isCurrDeviceAPhone) {
      dispatch(updateDynamicPanelPreviewViewType('medium'));
    }
  }, []);

  return (
    <div className={classes.planner_catalog_cont} style={styleAnimation} ref={panelRef}>
      <Navigation
        panelPreviewIcon={props.panelPreviewIcon}
        breadcrumsTitle={props.breadcrumsTitle}
      />

      <div className={classes.catalog_wr} ref={mainDiv}>
        <SimpleBar style={{ height: '100%' }} ref={catalogMain} autoHide={false} forceVisible="y">
          <div className={classes.prod_elem_wrap}>
            {customModelsListState && customModelsListState.length > 0 ? (
              <div className={classes.prod_item_upload_btn_wr}>
                {lastHistoryElem?.privateMaterialType ? (
                  <div className={classes.prod_item_upload_btn} onMouseUp={onCustomModelAddMouseUp}>
                    <IconPlus
                      size={25}
                      color="#2a3435"
                      className={classes.prod_item_upload_btn_img}
                    />

                    {translation['TIPS_ADD_NEW_MODEL']}
                  </div>
                ) : null}

                {customModelsListState}
                {customModelsListState ? (
                  <div className={classes.prod_item_upload_btn_line}></div>
                ) : (
                  ''
                )}
              </div>
            ) : lastHistoryElem?.privateMaterialType ? (
              <div className={classes.prod_item_upload_btn} onMouseUp={onCustomModelAddMouseUp}>
                <IconPlus size={25} color="#2a3435" className={classes.prod_item_upload_btn_img} />
                {translation['TIPS_ADD_NEW_MODEL']}
              </div>
            ) : null}
            {modelsListState}
          </div>
        </SimpleBar>

        <div
          className={classes.preloaderBlock}
          style={preloaderStatus ? { opacity: 1 } : { opacity: 0, zIndex: -1 }}
        >
          <div className="preloader-cube"></div>
        </div>
      </div>

      <AnimatePresence>
        {modalMoreInfo ? (
          <ModalMoreInfo productElemHover={productElemHover} key={`modal-${productElemHover.id}`} />
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Products;
