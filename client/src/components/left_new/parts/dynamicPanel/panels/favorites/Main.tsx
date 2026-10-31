import 'simplebar-react/dist/simplebar.min.css';

import { IconCopy, IconRosetteDiscountFilled, IconTrash } from '@tabler/icons-react';
import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { planner, user } from '../../../../../../initR2D';
import {
  changeActiveControlPanelMode,
  selectActiveControlPanelModeData,
  selectCategoryTreePanelStatus,
  selectControlPanelData,
  selectControlPanelStatus,
  selectDynamicPanelPreviewViewType,
  selectDynamicPanelStatus,
  selectPrevControlPanelMode,
  updateAnimateFavoritesHideStatus,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import { selectIsLogged } from '../../../../../../redux/features/user/userSlice';
import { useEffectAsync } from '../../../../../../utils/useEffectAsync';
import FavoriteStarIcon from '../../../../../common/FavoriteStarIcon';
import ModalMoreInfo from '../../../../../common/ModalMoreInfo';
import MoreInfoIcon from '../../../../../common/MoreInfoIcon';
import HoverComponent from '../../../controlPanel/components/HoverComponent';
import AdditionalSettings from '../../navigation/components/AdditionalSettings';

const useStyle = createUseStyles({
  planner_catalog_cont: {
    borderRight: '1px solid #cdcdcd',
    background: '#fff',
    height: '100%',
    display: 'grid',
    alignContent: 'baseline',
    gridTemplateRows: 'auto 1fr',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
    width: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  catalog_top_wr: {
    padding: '10px 10px 10px 10px',
    '@media screen and (max-width: 950px)': {
      padding: 5,
    },
  },
  catalog_top_btns_wr: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  favoriteTitleWr: {
    display: 'flex',
    alignItems: 'center',
  },
  favoriteTitle: {
    fontSize: 17,
    color: '#2F2F2F',
    fontFamily: 'RobotoCondensed-Regular',
    marginLeft: 3,
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  catalog_top_selected_preview: {
    width: '17px',
    height: '16px',
    position: 'relative',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    flexShrink: 0,
    '& img': {
      top: '50%',
      left: '0',
      position: 'absolute',
      maxWidth: '100%',
      height: 'auto',
      transform: 'translateY(-50%)',
    },
    '@media screen and (max-width: 950px)': {
      height: 14,
      width: 11,
    },
  },
  catalog_wr: {
    overflow: 'hidden',
    height: '100%',
    background: '#fff',
    borderTop: '1px solid #C6C4C4',
  },
  prod_elem_wrap: {
    display: 'flex',
    flexWrap: 'wrap',
    width: 'calc(100% + 1px)',
  },
  prod_item: {
    position: 'relative',
    display: 'grid',
    transition: 'width 0.2s ease-in, height 0.2s ease-in',
    alignContent: 'baseline',
    gridTemplateRows: 'auto 1fr',
    height: 'auto',
    width: '50%',
    borderBottom: '1px solid #E9E9E9',
    borderRight: '1px solid #E9E9E9',
    paddingBottom: '7px',
    outline: 'none',
    '&:hover': {
      '& $prod_item_img_wr img': {
        transform: 'scale(1.1)',
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
    background: '#C6C4C4',
    transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:before': {
      content: '" "',
      position: 'absolute',
      left: '100%',
      top: 2,
      height: 'calc(100% - 4px)',
      width: 1,
      background: '#fff',
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
    background: '#C6C4C4',
    transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:before': {
      content: '" "',
      position: 'absolute',
      top: '100%',
      left: 2,
      width: 'calc(100% - 4px)',
      height: 1,
      background: '#fff',
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
    background: '#C6C4C4',
    transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:before': {
      content: '" "',
      position: 'absolute',
      right: '100%',
      top: 2,
      height: 'calc(100% - 4px)',
      width: 1,
      background: '#fff',
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
    background: '#C6C4C4',
    transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:before': {
      content: '" "',
      position: 'absolute',
      bottom: '100%',
      left: 2,
      width: 'calc(100% - 4px)',
      height: 1,
      background: '#fff',
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
        left: 2,
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
        stroke: '#B8E11F',
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
    background: '#fff',
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
        stroke: '#64BCF0',
        fillOpacity: 0,
        '@media screen and (max-width: 950px)': {
          stroke: '#464646',
          fillOpacity: 1,
        },
      },
    },
  },
  prod_item_fav_btn_active: {
    '& path': {
      fill: '#64BCF0',
      stroke: '#64BCF0',
      fillOpacity: 1,
    },
  },
  prod_item_zamok_btn: {
    width: '24px',
    height: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#fff',
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
    background: '#fff',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    alignItems: 'center',
    borderRadius: '50%',
    justifyContent: 'center',
    cursor: 'pointer',
    '&:hover svg': {
      stroke: '#AF3131',
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
    background: '#fff',
    borderRadius: '50%',
    position: 'absolute',
    bottom: 5,
    right: 5,
    zIndex: 1,
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
  },
  prod_item_promocode: {},
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
    background: '#fff',
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
    border: '1px solid #E9E9E9',
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
    color: '#000',
    fontSize: 16,
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
    color: '#7B7B7B',
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
    '&>div>div:first-child': {
      marginBottom: '3px',
      fontFamily: 'RobotoCondensed-Regular',
    },
    '&>div>div': {
      fontSize: '17px',
      color: '#000000',
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
    color: '#000',
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
    border: '1px solid #000',
    transition: 'all .5s ease',
  },
  hidden: {
    visibility: 'hidden',
  },
  product_hover: {
    maxHeight: 150,
    padding: '6px 20px',
    textAlign: 'center',
    border: '1px solid #BEBCBC',
    position: 'absolute',
    borderRadius: 3,
    display: 'inline',
    zIndex: 105,
    background: '#fff',
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
      background: '#fff',
      borderRight: '1px solid #BEBCBC',
      borderBottom: '1px solid #BEBCBC',
    },
    '& p': {
      fontSize: 12,
    },
  },
  product_hover_color: {
    color: '#65BCF1',
    fontSize: 15,
    letterSpacing: '.03em',
  },
  product_hover_discount: {
    maxWidth: 200,
    maxHeight: 200,
    padding: '10px 20px',
    textAlign: 'center',
    border: '1px solid #000',
    position: 'absolute',
    display: 'inline',
    zIndex: 105,
    background: '#fff',
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
      background: '#fff',
      borderRight: '1px solid #000',
      borderBottom: '1px solid #000',
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
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
});

const Main = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const controlPanelData = useSelector(selectControlPanelData);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);
  const isLogged = useSelector(selectIsLogged);
  const prevControlPanelMode = useSelector(selectPrevControlPanelMode);

  const categoryTreePanelStatus = useSelector(selectCategoryTreePanelStatus);
  const controlPanelStatus = useSelector(selectControlPanelStatus);
  const dynamicPanelStatus = useSelector(selectDynamicPanelStatus);

  const [favoritesList, setFavoritesList] = useState(user.data.favorites?.items);
  const [favoritesReactArray, setFavoritesReactArray] = useState();

  const [loadedPreviews, setLoadedPreviews] = useState([]);

  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );
  const [preloaderStatus, setPreloaderStatus] = useState(true);

  const classes = useStyle();

  const mainDiv = useRef(null);

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
  let timer = null;
  let previewObj = null;
  let dragTimeout = null;

  let imageSizeCreator = null;
  let borderTimeoutKey;
  let currentDraggedElem;
  let plannerCatalogElem;
  let currentOverlayCoords;
  const panelRef = useRef(null);

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const [modalMoreInfo, setModalMoreInfo] = useState(false);
  const [productElemHover, setProductElemHover] = useState(null);

  const updateFavorites = async (id, color = '') => {
    document.querySelector('.product_hover') && document.querySelector('.product_hover').remove();
    await user.uRemoveFromFavorites(id, color);
    setFavoritesList((prev) => prev.filter((i) => i?.id != id || (i?.addData || '') != color));
    planner.apiScene.dispatchEvent(new Event(planner.apiScene.FAVORITES_BUTTON, {}));
    const furnitureData = planner.getCatalogProducts();

    user.data.favorites?.items < 1
      ? prevControlPanelMode
        ? dispatch(changeActiveControlPanelMode({ mode: prevControlPanelMode }))
        : dispatch(
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
          )
      : null;

    dispatch(updateAnimateFavoritesHideStatus(true));
    setTimeout(() => dispatch(updateAnimateFavoritesHideStatus(false)), 10);
  };

  // Material

  const onMouseDownMaterial = (e, elem) => {
    document.addEventListener('mouseup', onMouseUpMaterial);
    plannerCatalogElem = e.currentTarget.closest(`.${classes.prod_item}`);
    document.addEventListener('mousemove', onMoveMaterial);
    timer = Date.now();
    currentDraggedElem = elem;
    dragTimeout = setTimeout(() => {
      plannerCatalogElem.classList.add(classes.selectedTouched);
      e.nativeEvent.button == 0
        ? elem.addData
          ? planner.scene.dragProductFromCatalog(elem.addData, elem.id)
          : planner.scene.dragProductFromCatalog(elem.id)
        : null;
    }, 100);
  };

  const onMoveMaterial = (e) => planner.mih().state && planner.mih().state.mouseMove(e);

  const onMouseUpMaterial = (e) => {
    clearTimeout(dragTimeout);
    document.removeEventListener('mousemove', onMoveMaterial);
    document.removeEventListener('mouseup', onMouseUpMaterial);

    plannerCatalogElem?.classList.remove(classes.selectedTouched);

    document.querySelector('.product_hover') && document.querySelector('.product_hover').remove();

    if (Date.now() - timer > 100) {
      if (e.clientX < R2D.Viewers._instance.getOffsetWidthDueToOpenedPanels())
        planner.mih().state && planner.mih().state.mouseUp(e);
    }

    currentDraggedElem = null;
  };

  const mouseEnterMaterial = (event, data) => {
    if (dynamicPanelPreviewViewType == 'small') {
      document.querySelector('.product_hover') && document.querySelector('.product_hover').remove();
      const product = event.target;
      const hoverWindow = document.createElement('div');
      hoverWindow.classList.add('product_hover');
      hoverWindow.innerHTML = data.name;
      if (data.addData) {
        const materialsName = document.createElement('p');
        materialsName.textContent = data.addData;
        materialsName.classList.add(classes.product_hover_color);
        hoverWindow.append(materialsName);
      }
      document.querySelector('body').append(hoverWindow);
      hoverWindow.style.left = product.getBoundingClientRect().left + product.offsetWidth + 'px';
      hoverWindow.style.top =
        product.getBoundingClientRect().top +
        (product.offsetHeight - hoverWindow.offsetHeight) / 2 +
        'px';
    }
  };

  const mouseLeaveMaterial = () =>
    document.querySelector('.product_hover') && document.querySelector('.product_hover').remove();

  // Model

  const onMouseDownModel = (e, elem) => {
    if (document.querySelector('.' + classes.prod_elem_wrap))
      document.querySelector('.' + classes.prod_elem_wrap).style.touchAction = 'auto';
    if (document.querySelector('.' + classes.catalog_wr))
      document.querySelector('.' + classes.catalog_wr).style.touchAction = 'auto';
    const id = elem.id;
    currentDraggedElem = elem;
    const previewUrl = elem.source.images.preview;
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
    const newXPos = e.clientX || e.touches[0].clientX;
    const newYPos = e.clientY || e.touches[0].clientY;
    startingPointX = newXPos - selectedObjImg?.getBoundingClientRect().left;
    startingPointY = newYPos - selectedObjImg?.getBoundingClientRect().top;
    document.addEventListener('mousemove', onObjectMove);
    document.addEventListener('touchmove', onObjectMove);
    document.addEventListener('mouseup', onObjectMouseUp);
    document.addEventListener('touchend', onObjectMouseUp);
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
      const outFromPanelVal = currentOverlayCoords.left + currentOverlayCoords.width - e.clientX;
      previewObjOpacity = outFromPanelVal > 0 ? 1 : 1 + outFromPanelVal * selectedObjPreviewRatio;
      const newXPos = e.clientX || (e.touches && e.touches[0].clientX);
      const newYPos = e.clientY || (e.touches && e.touches[0].clientY);
      previewObj.style.opacity = previewObjOpacity;
      previewObj.style.left = newXPos - startingPointX + 'px';
      previewObj.style.top = newYPos - startingPointY + 'px';
      //planner.mih().state.mouseMove(e);
    }
  };

  const onObjectMouseUp = async (e) => {
    mouseDownOnObj = false;
    selectedObjId = null;
    selectedObjImgWidth = 0;
    selectedObjImgHeight = 0;
    clearTimeout(borderTimeoutKey);

    document.removeEventListener('mousemove', onObjectMove);
    document.removeEventListener('mouseup', onObjectMouseUp);

    plannerCatalogElem.classList.remove(classes.selectedTouched);

    previewObj && previewObj.remove();
    isObjLoaded = false;
    previewObjOpacity = 1;
    if (Date.now() - timer > 100) {
      const sceneObjectToDelete =
        R2D.mouseInteractionHelper.stateDraggingProdFromCatalog.view3DObject?.sceneObject;
      if (e.clientX < R2D.Viewers._instance.getOffsetWidthDueToOpenedPanels()) {
        planner.mih().state && planner.mih().state.mouseUp(e);
        if (sceneObjectToDelete) {
          R2D.scene.remove(sceneObjectToDelete);
          R2D.scene.history.removeUndoState();
        }
      }
      R2D.mouseInteractionHelper.stateDraggingProdFromCatalog.view3DObject = null;
    }

    R2D.mouseInteractionHelper.stateDraggingProdFromCatalog.view3DObject = null;
    currentDraggedElem = null;
  };

  const createModelImage = (productContour) => {
    return new Promise((resolve, reject) => {
      imageSizeCreator = new R2D.ProductHint.ImageSizeCreator();

      imageSizeCreator.addEventListener(Event.COMPLETE, imageSizeCreatorEventHandler);
      imageSizeCreator.addEventListener(Event.ERROR, imageSizeCreatorEventHandler);
      imageSizeCreator.create(productContour, R2D.ProductHint.Content.getPerson());

      function imageSizeCreatorEventHandler(e) {
        if (imageSizeCreator == null) return;

        const src = imageSizeCreator.getResultImageSrc();
        imageSizeCreator.removeEventListener(Event.COMPLETE, imageSizeCreatorEventHandler);
        imageSizeCreator.removeEventListener(Event.ERROR, imageSizeCreatorEventHandler);
        imageSizeCreator.dispose();
        imageSizeCreator = null;

        resolve(src);
      }
    });
  };

  const mouseEnterModel = async (event, data) => {
    if (dynamicPanelPreviewViewType == 'small') {
      if (mouseDownOnObj) return;
      document.querySelector('.' + classes.product_hover) &&
        document.querySelector('.' + classes.product_hover).remove();
      const product = event.currentTarget || event.target.closest('.' + classes.prod_item);
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

  const mouseLeaveModel = () =>
    document.querySelector('.' + classes.product_hover) &&
    document.querySelector('.' + classes.product_hover).remove();

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

  const mouseDiscountLeave = (e) =>
    document.querySelector('.' + classes.product_hover_discount) &&
    document.querySelector('.' + classes.product_hover_discount).remove();

  const onMouseEnterProductMoreInfo = (e, elem) => {
    setModalMoreInfo(true);
    setProductElemHover(elem);
  };
  const onMouseLeaveProductMoreInfo = (e) => {
    setModalMoreInfo(false);
  };

  const onFavoritesUpdate = async (e) => {
    const favorites = await user.uGetFavorites();
    user.data.favorites.items = favorites.data.items;
    user.data.favorites.total = favorites.data.items.length;
    setFavoritesList(user.data.favorites?.items);
  };

  const copyMaterial = (e, elem) => {
    R2D.CopyPaste.copyMaterial(
      !elem.addData ? { id: elem.id } : { id: elem.addData, addMaterial: elem.id }
    );
  };

  useEffect(() => {
    setStyleAnimation({ transform: 'translateX(0%)' });
    planner.scene.addEventListener(planner.scene.PRODUCTS_UPDATED, onFavoritesUpdate);
    return () =>
      planner.scene.removeEventListener(planner.scene.PRODUCTS_UPDATED, onFavoritesUpdate);
  }, []);

  useEffectAsync(async () => {
    const arrayReact = [];
    let htmlElem;
    const loadedPrevs = [];
    if (!favoritesList || favoritesList.length < 1) return setFavoritesReactArray([]);

    for (const elem of favoritesList) {
      if (!elem) continue;

      const attributesArray = elem.attributes && Object.values(elem.attributes);
      let elemColors,
        attributesBrand,
        elemWidth,
        elemDepth,
        elemHeight,
        elemType,
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

      if (elem?.isColorPicker) {
        const isLoaded = R2D.PoolMaterials.getMaterial(elem.id);
        if (isLoaded.getMaterialLoadState()) {
          const matPrev = await R2D.Tool.getMatPrevFromMatIdAndColor(elem.id, elem.addData);
          htmlElem = (
            <div
              className={
                classes.prod_item + ' ' + classes[`prod_item_${dynamicPanelPreviewViewType}`]
              }
              style={{ pointerEvents: 'none' }}
              key={elem.id + '_' + elem.addData}
            >
              <div className={classes.prod_item_hover_left}></div>
              <div className={classes.prod_item_hover_top}></div>
              <div className={classes.prod_item_hover_right}></div>
              <div className={classes.prod_item_hover_bottom}></div>
              <div
                className={classes.prod_item_fav_btn + ' ' + classes.prod_item_fav_btn_active}
                onClick={(e) => updateFavorites(elem.id, elem.addData)}
              >
                <FavoriteStarIcon />
              </div>
              <div className={classes.prod_item_img_wr}>
                <img src={matPrev.toDataURL()} />

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
                        <IconCopy size={16} color={'#fff'} className={classes.prod_item_btn_icon} />
                      </HoverComponent>
                    </div>
                  </div>
                ) : null}
                <div className="preloader-cube" style={{ display: 'none' }}></div>
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
              {dynamicPanelPreviewViewType != 'small' ? (
                <div className={classes.prod_item_title}>
                  <div>{elem.name}</div>
                </div>
              ) : null}
              <div
                className={classes.prod_item_overlay}
                onMouseDown={(e) =>
                  elemType == R2D.ProductType.MATERIAL
                    ? onMouseDownMaterial(e, elem)
                    : onMouseDownModel(e, elem)
                }
                onMouseLeave={(e) =>
                  elemType == R2D.ProductType.MATERIAL ? mouseLeaveMaterial(e) : mouseLeaveModel(e)
                }
                onMouseEnter={(e) =>
                  elemType == R2D.ProductType.MATERIAL
                    ? mouseEnterMaterial(e, elem)
                    : mouseEnterModel(e, elem)
                }
                id={elem.id + '_' + elem.addData?.replace('#', '')}
              ></div>
            </div>
          );
        } else {
          htmlElem = (
            <div
              className={
                classes.prod_item + ' ' + classes[`prod_item_${dynamicPanelPreviewViewType}`]
              }
              style={{ pointerEvents: 'none' }}
              key={elem.id + '_' + elem.addData}
            >
              <div className={classes.prod_item_hover_left}></div>
              <div className={classes.prod_item_hover_top}></div>
              <div className={classes.prod_item_hover_right}></div>
              <div className={classes.prod_item_hover_bottom}></div>
              <div
                className={classes.prod_item_fav_btn + ' ' + classes.prod_item_fav_btn_active}
                onClick={() => updateFavorites(elem.id, elem.addData)}
              >
                <FavoriteStarIcon />
              </div>
              <div className={classes.prod_item_img_wr}>
                <img src={undefined} />

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
                        <IconCopy size={16} color={'#fff'} className={classes.prod_item_btn_icon} />
                      </HoverComponent>
                    </div>
                  </div>
                ) : null}
                <div className="preloader-cube"></div>
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
              {dynamicPanelPreviewViewType != 'small' ? (
                <div className={classes.prod_item_title}>
                  <div>{elem.name}</div>
                </div>
              ) : null}
              <div
                className={classes.prod_item_overlay}
                onMouseDown={(e) =>
                  elemType == R2D.ProductType.MATERIAL
                    ? onMouseDownMaterial(e, elem)
                    : onMouseDownModel(e, elem)
                }
                onMouseLeave={(e) =>
                  elemType == R2D.ProductType.MATERIAL ? mouseLeaveMaterial(e) : mouseLeaveModel(e)
                }
                onMouseEnter={(e) =>
                  elemType == R2D.ProductType.MATERIAL
                    ? mouseEnterMaterial(e, elem)
                    : mouseEnterModel(e, elem)
                }
                id={elem.id + '_' + elem.addData?.replace('#', '')}
              ></div>
            </div>
          );

          loadedPrevs.push({ id: elem.id, color: elem.addData });
        }
      } else {
        const metadata = elem.metadata;
        const matchedLinkObject =
          metadata?.multilinkwithip?.data &&
          (Object.values(metadata?.multilinkwithip?.data)?.find(
            (i) => i.country == R2D.config.location
          ) ||
            Object.values(metadata?.multilinkwithip?.data)?.find((i) => i.country == 'all'));
        htmlElem = (
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
            <div
              className={classes.prod_item_fav_btn + ' ' + classes.prod_item_fav_btn_active}
              onClick={() => updateFavorites(elem.id)}
            >
              <FavoriteStarIcon />
            </div>
            <div className={classes.prod_item_img_wr}>
              <img
                data-src={R2D.URL.DOMAIN + elem.source.images.preview}
                src={R2D.URL.DOMAIN + elem.source.images.preview}
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
                      <IconCopy className={classes.prod_item_btn_icon} size={16} color="#ffffff" />
                    </HoverComponent>
                  </div>
                </div>
              ) : null}
              {elem.isOwner ? (
                <div
                  className={classes.prod_item_custom_delete_btn}
                  onClick={() =>
                    dispatch(
                      setActivePopup({
                        name: 'confirm',
                        type: 'delete_custom_element',
                        data: { id: elem.id, type: elemType },
                      })
                    )
                  }
                >
                  <IconTrash className={classes.prod_item_custom_delete} size={16} color="#444" />
                </div>
              ) : null}
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
                {elemType == R2D.ProductType.MATERIAL ||
                (!elemWidth && !elemDepth && !elemHeight) ? null : (
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
                  : onMouseDownModel(e, elem)
              }
              onMouseLeave={(e) =>
                elemType == R2D.ProductType.MATERIAL ? mouseLeaveMaterial(e) : mouseLeaveModel(e)
              }
              onMouseEnter={(event) =>
                elemType == R2D.ProductType.MATERIAL
                  ? mouseEnterMaterial(event, elem)
                  : mouseEnterModel(event, elem)
              }
            ></div>
          </div>
        );
      }
      arrayReact.push(htmlElem);
      setFavoritesReactArray(arrayReact);
    }
    setPreloaderStatus(false);
    setLoadedPreviews(loadedPrevs);
  }, [favoritesList, dynamicPanelPreviewViewType]);

  useEffect(() => {
    if (!loadedPreviews || loadedPreviews.length < 1) return;
    const key = setInterval(async () => {
      if (!loadedPreviews || loadedPreviews.length < 1) return clearInterval(key);
      else {
        for (const i of loadedPreviews) {
          if (
            R2D.PoolMaterials.isMaterial(i.id) &&
            R2D.PoolMaterials.isMaterial(i.id).getMaterialLoadState()
          ) {
            clearInterval(key);
            const matPrev = await R2D.Tool.getMatPrevFromMatIdAndColor(i.id, i.color);
            const loadedElem = document
              .getElementById(i.id + '_' + i.color.replace('#', ''))
              .closest('.' + classes.prod_item);
            loadedElem?.querySelector('.preloader-cube')?.remove();
            if (loadedElem)
              loadedElem
                .querySelector('.' + classes.prod_item_img_wr)
                .getElementsByTagName('img')[0].src = matPrev.toDataURL();
            return setLoadedPreviews((prev) => {
              const newArray = prev.filter(
                (prevItem) => prevItem.id != i.id || prevItem.color != i.color
              );
              return newArray;
            });
          }
        }
      }
    }, 100);
  }, [loadedPreviews]);

  useEffect(() => {
    setTimeout(
      () =>
        Array.from(document.querySelectorAll('.' + classes.prod_item)).forEach((item) =>
          item.removeAttribute('style')
        ),
      300
    );
    return () =>
      document.querySelector('.' + classes.product_hover) &&
      document.querySelector('.' + classes.product_hover).remove();
  }, [favoritesReactArray]);

  useEffect(() => {
    if (!isLogged) dispatch(changeActiveControlPanelMode({ mode: prevControlPanelMode }));
    else setFavoritesList(user.data.favorites?.items || []);
  }, [isLogged]);

  return (
    <div className={classes.planner_catalog_cont} style={styleAnimation} ref={panelRef}>
      <div className={classes.catalog_top_wr}>
        <div className={classes.catalog_top_btns_wr}>
          <div className={classes.favoriteTitleWr}>
            <div className={classes.catalog_top_selected_preview}>
              <img src="/src_designer/images/icon_favorite.svg" />
            </div>
            <div className={classes.favoriteTitle}>{translation['FAVORITES_TITLE']}</div>
          </div>
          {!isCurrDeviceAPhone ? <AdditionalSettings hideCategoryTree={true} /> : null}
        </div>
      </div>
      <div className={classes.catalog_wr} ref={mainDiv}>
        <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
          <div className={classes.prod_elem_wrap}>
            {favoritesReactArray && favoritesReactArray.length > 0 && favoritesReactArray}
          </div>
        </SimpleBar>
      </div>
      <div
        className={classes.preloaderBlock}
        style={preloaderStatus ? { opacity: 1 } : { opacity: 0, zIndex: -1 }}
      >
        <div className="preloader-cube"></div>
      </div>

      <AnimatePresence>
        {modalMoreInfo ? (
          <ModalMoreInfo productElemHover={productElemHover} key="modalMoreInfo" />
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Main;
