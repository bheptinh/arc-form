import { IconPlus, IconTrash } from '@tabler/icons-react';
import cx from 'classnames';
import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { planner, user } from '../../../../../../initR2D';
import { selectIsProjectBelongToLoggedUser } from '../../../../../../redux/features/common/commonSlice';
import {
  selectActiveControlPanelModeData,
  selectDynamicPanelPreviewViewType,
  selectDynamicPanelStatus,
  updateAnimateFavoritesHideStatus,
  updateAnimateFavoritesShowStatus,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import {
  selectIsLogged,
  selectUserProfileData,
  selectUserProjectActive,
} from '../../../../../../redux/features/user/userSlice';
import FavoriteStarIcon from '../../../../../common/FavoriteStarIcon';
import ModalMoreInfo from '../../../../../common/ModalMoreInfo';
import MoreInfoIcon from '../../../../../common/MoreInfoIcon';
import Lock from '../../components/Lock';
import Navigation from '../../navigation/Navigation';

const useStyle = createUseStyles({
  planner_catalog_cont: {
    borderRight: '1px solid #cdcdcd',
    background: '#fff',
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
    borderTop: '1px solid #C6C4C4',
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
    background: '#fff',
    position: 'relative',
    borderBottom: '1px solid #C6C4C4',
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
      background: 'linear-gradient(to bottom, #F5F3F3, transparent)',
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      background: '#B8E11F',
      '&:after': {
        opacity: 0,
      },
    },
    '@media screen and (max-width: 950px)': {
      height: 25,
      fontSize: '10px',
    },
  },
  prod_item_upload_btn_line: {
    background: '#2E3839',
    height: 1,
    width: '100%',
    position: 'relative',
    '&:before': {
      content: '" "',
      bottom: '100%',
      left: 0,
      width: '100%',
      height: 1,
      background: '#fff',
      position: 'absolute',
    },
    '&:after': {
      content: '" "',
      top: '100%',
      left: 0,
      width: '100%',
      height: 1,
      background: '#fff',
      position: 'absolute',
    },
  },
  prod_item_upload_btn_img: {
    userSelect: 'none',
    userDrag: 'none',
    marginRight: 16,
    '@media screen and (max-width: 950px)': {
      width: 13,
      height: 13,
    },
  },
  prod_item: {
    position: 'relative',
    display: 'grid',
    transition: 'width 0.2s ease-in, height 0.2s ease-in',
    alignContent: 'baseline',
    gridTemplateRows: 'auto 1fr',
    height: 'auto',
    borderBottom: '1px solid #E9E9E9',
    borderRight: '1px solid #E9E9E9',
    paddingBottom: '7px',
    outline: 'none',
    '&:hover': {
      '& $prod_item_zamok_btn': {
        opacity: 0,
        pointerEvents: 'none',
      },
      '& $prod_item_img_wr img': {
        transform: 'scale(1.05)',
      },
      '& $prod_item_fav_btn': {
        opacity: 1,
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
  prod_item_active: {
    '& $prod_item_hover_left': {
      height: '100%',
      background: '#BAE51F',
    },
    '& $prod_item_hover_top': {
      width: '100%',
      background: '#BAE51F',
    },
    '& $prod_item_hover_right': {
      height: '100%',
      background: '#BAE51F',
    },
    '& $prod_item_hover_bottom': {
      width: '100%',
      background: '#BAE51F',
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
    '& $prod_item_zamok_btn': {
      width: 18,
      height: 18,
    },
    '& $prod_item_img_wr': {
      margin: 0,
    },
    '& $prod_item_fav_btn': {
      width: 18,
      height: 18,
    },
    '& $prod_item_custom_delete_btn': {
      width: 18,
      height: 18,
    },
  },
  prod_item_small: {
    width: '25%',
    paddingBottom: 0,
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
  prod_item_title: {
    color: '#000',
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
    color: '#7B7B7B',
    fontSize: '13px',
    padding: '0 13px 0',
    lineHeight: 1.4,
    '& span': {
      marginRight: 3,
    },
    '&>div': {
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
  item_more_info_content_wrap: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    top: 0,
    zIndex: 2,
    position: 'absolute',
    pointerEvents: 'none',
    transform: 'translateX(0%)',
    transition: 'all ease .3s',
  },
  item_more_info_content: {
    boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)',
    background: '#fff',
    overflow: 'hidden',
    borderRadius: '3px',
    transition: 'all .5s cubic-bezier(.19,1,.22,1)',
    zIndex: 2,
    width: 300,
    paddingBottom: 7,
    '& $item_info_content': {
      padding: '0 13px 0',
      '@media screen and (max-width: 950px)': {
        padding: '0 6px 0',
      },
    },
    '@media screen and (max-width: 950px)': {
      width: 150,
    },
  },
  item_more_info_content_wrap_showed: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    top: 0,
    zIndex: 0,
    position: 'absolute',
    pointerEvents: 'none',
    transform: 'translateX(-110%)',
    transition: 'all ease .3s',
  },
  item_more_info_img_wr: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 300,
    height: 300,
    marginBottom: 7,
    '& img': {
      maxWidth: '100%',
      maxHeight: '100%',
      display: 'block',
    },
    '@media screen and (max-width: 950px)': {
      width: 150,
      height: 150,
    },
  },
  prod_item_overlay: {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    zIndex: 2,
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
});

const Materials = (props) => {
  const dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;

  const userData = useSelector(selectUserProfileData);
  const translation = useTranslation();
  const isLogged = useSelector(selectIsLogged);

  const userProjectActive = useSelector(selectUserProjectActive);
  const isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);

  const [materialsListState, setMaterialsListState] = useState(null);
  const [customMaterialsListState, setCustomMaterialsListState] = useState(null);

  const [activeMaterial, setActiveMaterial] = useState(props.matId);

  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );
  const [lastHistoryElemData, setLastHistoryElemData] = useState(null);

  const [userFavorites, setUserFavorites] = useState(user.data.favorites?.items);
  const [preloaderStatus, setPreloaderStatus] = useState(true);

  const [modalMoreInfo, setModalMoreInfo] = useState(false);
  const [productElemHover, setProductElemHover] = useState(null);

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const arrayList = [];
  const customMaterials = [];

  const dispatch = useDispatch();

  const classes = useStyle();
  const panelRef = useRef(null);

  let mouseDown;

  const loaderCompleteListener = (id) => {
    props.materialSelect(id, null, activeMaterial, null);
    setActiveMaterial(id);
  };

  const loaderErrorListener = (e) => console.log('Error loading material ', e);

  const onMaterialSelect = (elem, isObjectAccessible) => {
    const id = elem.id;
    if (!isObjectAccessible) {
      dispatch(setActivePopup({ name: 'payPro', type: 'user' }));
    } else {
      if (!R2D.Pool.getProductData(id)) {
        const loader = R2D.Pool.loadProductData(id);
        loader.addEventListener(Event.COMPLETE, (e) => loaderCompleteListener(id));
        loader.addEventListener(Event.ERROR, (e) => loaderErrorListener(id));
      } else {
        props.materialSelect(id, null, activeMaterial, null);
      }
      setActiveMaterial(id);
    }
  };

  const mouseEnter = (event, data) => {
    if (dynamicPanelPreviewViewType == 'small') {
      document.querySelector('.' + classes.product_hover)
        ? document.querySelector('.' + classes.product_hover).remove()
        : null;
      const product = event.target;
      const hoverWindow = document.createElement('div');
      hoverWindow.classList.add(classes.product_hover);
      hoverWindow.innerHTML = data.name;
      document.querySelector('body').append(hoverWindow);
      hoverWindow.style.left = product.getBoundingClientRect().left + product.offsetWidth + 'px';
      hoverWindow.style.top =
        product.getBoundingClientRect().top +
        (product.offsetHeight - hoverWindow.offsetHeight) / 2 +
        'px';
    }
  };

  const mouseLeave = () =>
    document.querySelector('.' + classes.product_hover)
      ? document.querySelector('.' + classes.product_hover).remove()
      : null;

  const documentMouseUp = () => {
    mouseDown = false;
    document.removeEventListener('mouseup', documentMouseUp);
  };

  const onCustomMatAddMouseUp = () => {
    mouseDown = false;
    dispatch(setActivePopup({ name: 'uploadCustomMaterialPopup' }));
  };

  const onMouseEnterProductMoreInfo = (_e, elem) => {
    setModalMoreInfo(true);
    setProductElemHover(elem);
  };

  const onMouseLeaveProductMoreInfo = () => {
    setModalMoreInfo(false);
  };

  const updateMaterialsEvent = () =>
    setActiveMaterial(R2D.scene.currentConstructorElementData.getMaterial());

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
  const onProductsUpdated = async () => {
    setPreloaderStatus(true);
    const loadedData = await planner.scene.categoryDataLoad(
      lastHistoryElem.urlList,
      R2D.controller.getCountry()
    );
    setLastHistoryElemData(loadedData);
    setPreloaderStatus(false);
  };

  useEffect(() => {
    setStyleAnimation({ transform: 'translateX(0%)' });
    planner.scene.addEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
    planner.scene.addEventListener(planner.scene.PRODUCTS_UPDATED, onProductsUpdated);
    return () => {
      planner.scene.removeEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
      planner.scene.removeEventListener(planner.scene.PRODUCTS_UPDATED, onProductsUpdated);
    };
  }, []);

  useEffect(() => {
    planner.scene
      .categoryDataLoad(lastHistoryElem.urlList, R2D.controller.getCountry())
      .then((loadedData) => setLastHistoryElemData(loadedData));
  }, [lastHistoryElem.urlList]);

  useEffect(() => {
    if (lastHistoryElemData && Array.isArray(lastHistoryElemData)) {
      lastHistoryElemData.forEach((i) => {
        const isInFavorites = userFavorites?.find((с) => с?.id == i.id);
        let isObjectAccessible;
        if (i.isOwner && R2D.config.data.enable_pro) {
          isObjectAccessible = userData.plan != 'free' || userProjectActive.plan != 'free';
          customMaterials.push(
            <div
              className={cx(
                classes.prod_item,
                classes.prod_item_custom,
                classes[`prod_item_${dynamicPanelPreviewViewType}`],
                {
                  [classes.prod_item_active]: activeMaterial == i.id,
                }
              )}
              key={i.id}
              onMouseLeave={mouseLeave}
              onMouseEnter={(e) => mouseEnter(e, i)}
            >
              <div className={classes.prod_item_hover_left}></div>
              <div className={classes.prod_item_hover_top}></div>
              <div className={classes.prod_item_hover_right}></div>
              <div className={classes.prod_item_hover_bottom}></div>
              <div className={classes.prod_item_img_wr}>
                <img src={R2D.URL.DOMAIN + i.source.images.preview} className={'lazyload'} />
                <div
                  className={classes.prod_item_custom_delete_btn}
                  onClick={(e) =>
                    dispatch(
                      setActivePopup({ name: 'confirm', type: 'delete_custom_element', data: i.id })
                    )
                  }
                >
                  <IconTrash size={14} color="#444" className={classes.prod_item_custom_delete} />
                </div>
              </div>
              {dynamicPanelPreviewViewType != 'small' ? (
                <div className={classes.prod_item_title}>
                  <div>{i.name}</div>
                </div>
              ) : null}
              <div
                className={classes.prod_item_overlay}
                onClick={(e) => onMaterialSelect(i, isObjectAccessible)}
              ></div>
            </div>
          );
        } else {
          isObjectAccessible =
            i.plan == 'free' ||
            (i.plan?.find &&
              (i.plan.find((i) => i == user.data.plan) ||
                (isProjectBelongToLoggedUser && i.plan.find((i) => i == userProjectActive.plan))));
          arrayList.push(
            <div
              key={i.id}
              className={cx(
                classes.prod_item + ' ' + classes[`prod_item_${dynamicPanelPreviewViewType}`],
                {
                  [classes.prod_item_active]: activeMaterial == i.id,
                }
              )}
            >
              <div className={classes.prod_item_hover_left}></div>
              <div className={classes.prod_item_hover_top}></div>
              <div className={classes.prod_item_hover_right}></div>
              <div className={classes.prod_item_hover_bottom}></div>
              <div className={classes.prod_item_img_wr}>
                <img
                  data-src={R2D.URL.DOMAIN + i.source.images.preview}
                  src={R2D.URL.DOMAIN + i.source.images.preview}
                  className={'lazyload'}
                />

                <div
                  className={
                    isInFavorites
                      ? classes.prod_item_fav_btn + ' ' + classes.prod_item_fav_btn_active
                      : classes.prod_item_fav_btn
                  }
                  onClick={(e) => updateFavorites(i.id, isInFavorites)}
                >
                  <FavoriteStarIcon />
                </div>
                {dynamicPanelPreviewViewType != 'big' ? (
                  <div
                    className={classes.prod_item_more_info}
                    onMouseEnter={(e) => onMouseEnterProductMoreInfo(e, i)}
                    onMouseLeave={onMouseLeaveProductMoreInfo}
                  >
                    <MoreInfoIcon />
                  </div>
                ) : null}
              </div>

              {dynamicPanelPreviewViewType != 'small' ? (
                <div className={classes.prod_item_title}>
                  <div>{i.name}</div>
                </div>
              ) : null}

              {isObjectAccessible ? null : i.plan.includes('basic') ? (
                <Lock
                  additionalClass={classes.prod_item_zamok_btn}
                  tipPositionY={'top'}
                  tipPositionX={'right'}
                  upgradePro={true}
                  upgradeBasic={true}
                  textHover={'UPGRADE_YOUR_PLAN_TEXT'}
                  parentClass={classes.prod_item}
                />
              ) : i.plan.includes('pro') ? (
                <Lock
                  additionalClass={classes.prod_item_zamok_btn}
                  tipPositionY={'top'}
                  tipPositionX={'right'}
                  upgradePro={true}
                  textHover={'UPGRADE_YOUR_PLAN_TEXT'}
                  parentClass={classes.prod_item}
                />
              ) : null}

              <div
                className={classes.prod_item_overlay}
                onMouseLeave={mouseLeave}
                onMouseEnter={(e) => mouseEnter(e, i)}
                onClick={(e) => onMaterialSelect(i, isObjectAccessible)}
              ></div>
            </div>
          );
        }
      });
      setMaterialsListState(arrayList);
      setCustomMaterialsListState(customMaterials);
    }
  }, [
    lastHistoryElemData,
    activeMaterial,
    userData?.plan,
    dynamicPanelPreviewViewType,
    userFavorites,
    userProjectActive,
  ]);

  return (
    <div className={classes.planner_catalog_cont} style={styleAnimation} ref={panelRef}>
      <Navigation
        panelPreviewIcon={props.panelPreviewIcon}
        hideCategoryTree={props.hideCategoryTree}
        breadcrumsTitle={props.breadcrumsTitle}
        isAddSettingsDisabled={props.isAddSettingsDisabled}
        closeButtonStatus={props.closeButtonStatus}
        isHomeDisabled={props.isHomeDisabled}
        breadCrumbsLongShow={props.breadCrumbsLongShow}
      />
      <div className={classes.catalog_wr}>
        <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
          <div className={classes.prod_elem_wrap}>
            {R2D.config.data.enable_pro ? (
              customMaterialsListState && customMaterialsListState.length > 0 ? (
                <div className={classes.prod_item_upload_btn_wr}>
                  {lastHistoryElem.privateMaterialType && !isCurrDeviceAPhone ? (
                    <div className={classes.prod_item_upload_btn} onMouseUp={onCustomMatAddMouseUp}>
                      <IconPlus
                        size={26}
                        color="#2E3839"
                        className={classes.prod_item_upload_btn_img}
                      />
                      {translation['TIPS_ADD_NEW_MODEL']}
                    </div>
                  ) : null}

                  {customMaterialsListState}
                  {customMaterialsListState ? (
                    <div className={classes.prod_item_upload_btn_line}></div>
                  ) : (
                    ''
                  )}
                </div>
              ) : lastHistoryElem.privateMaterialType && !isCurrDeviceAPhone ? (
                <div className={classes.prod_item_upload_btn} onMouseUp={onCustomMatAddMouseUp}>
                  <IconPlus
                    size={26}
                    color="#2E3839"
                    className={classes.prod_item_upload_btn_img}
                  />
                  {translation['TIPS_ADD_NEW_MODEL']}
                </div>
              ) : null
            ) : null}
            {materialsListState}
          </div>
        </SimpleBar>
        <div
          className={classes.preloaderBlock}
          style={
            materialsListState || !preloaderStatus ? { opacity: 0, zIndex: -1 } : { opacity: 1 }
          }
        >
          <div className="preloader-cube"></div>
        </div>
      </div>

      <AnimatePresence>
        {modalMoreInfo ? (
          <ModalMoreInfo productElemHover={productElemHover} key="modalMoreInfo" />
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Materials;
