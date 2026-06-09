import cx from 'classnames';
import {AnimatePresence} from "framer-motion";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {createUseStyles} from "react-jss";
import {useDispatch, useSelector} from 'react-redux';
import SimpleBar from 'simplebar-react';

import {planner, user} from "../../../../../../initR2D";
import {
    selectActiveControlPanelModeData,
    selectDynamicPanelPreviewViewType, updateAnimateFavoritesHideStatus, updateAnimateFavoritesShowStatus
} from '../../../../../../redux/features/control/controlPanelSlice';
import {setActivePopup} from "../../../../../../redux/features/popups/popupsSlice";
import {selectIsLogged} from "../../../../../../redux/features/user/userSlice";
import FavoriteStarIcon from "../../../../../common/FavoriteStarIcon";
import ModalMoreInfo from "../../../../../common/ModalMoreInfo";
import MoreInfoIcon from "../../../../../common/MoreInfoIcon";
import Navigation from '../../navigation/Navigation';

const planer_catalog_elem = {
    width: 46,
    height: 46,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundPosition: 'center',
    backgroundSize: 'cover',
    position: 'relative',
    userSelect: 'none',
    cursor: 'pointer',
    boxShadow: '1px 1px 2px 1px rgba(0, 0, 0, 0.11)',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
    '& img':{
        width: '100%',
        height: '100%',
    },
    '& $planer_catalog_prem_zamok': {
        width: "auto",
        height: "auto",
        position: 'absolute',
        top: -10,
        right: -11,
        cursor: 'pointer',
        '& rect':{
            transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        },
        '&:hover':{
            '& rect':{
                fill: '#ffd119'
            }
        }
    },
    '&:hover':{
        border: '1px solid #9DD900',
    },
    '@media screen and (max-width: 950px)':{
        width: 'calc(25% - 6px)',
        marginBottom: 10
    }
}

const useStyle = createUseStyles({
  '@font-face': [
    {
      fontFamily: 'RobotoCondensed-Regular',
      fontWeight: 300,
      fontDisplay: 'swap',
      src: 'url("/src_designer/fonts/RobotoCondensed-Regular.ttf") format("truetype")',
    },
  ],
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
  planer_add_elem_lock: {
    border: '1px solid #969696',
    '&:hover': {
      border: '1px solid #9DD900',
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
    '& path': {
      transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover path': {
      fill: '#AF3131',
    },
  },
  prod_item_custom_delete: {
    maxWidth: '80%',
    maxHeight: '80%',
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
  planer_catalog_prem_zamok: {},
  planer_catalog_elem_add: {
    extend: planer_catalog_elem,
    cursor: 'pointer',
    border: '1px solid #969696',
    transition: 'all .2s ease',
    '&:hover': {
      border: '1px solid #9DD900',
      '& $planer_catalog_elem_favorites': {
        opacity: 1,
      },
    },
  },
  planer_catalog_prem_add_img: {
    maxWidth: '60%',
    maxHeight: '60%',
  },

  planer_catalog_elem_upload: {
    borderBottom: '1px solid rgb(178, 178, 178)',
    paddingBottom: 15,
    width: '100%',
    display: 'grid',
    gridGap: 10,
    gridTemplateColumns: 'repeat(4, calc(25% - 5px))',
    '& img': {
      width: 'auto',
    },
    '& $planer_catalog_elem_custom_delete': {
      height: 'auto',
    },
  },
  planer_catalog_elem_custom: {
    '&:hover $planer_catalog_elem_custom_delete': {
      opacity: 1,
    },
  },
  planer_catalog_elem_custom_delete: {
    position: 'absolute',
    right: 0,
    top: 0,
    cursor: 'pointer',
    opacity: 0,
    zIndex: 9,
  },
  planer_catalog_elem_list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, calc(25% - 5px))',
    gridGap: '10px',
    width: '100%',
    marginTop: 15,
  },
  planer_catalog_elem_wr_flex: {
    padding: 15,
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
});

const CatalogMaterialsSets = (props) => {
  const dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);
  let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  let lastHistoryElemData = lastHistoryElem?.data;

  const dispatch = useDispatch();
  let isLogged = useSelector(selectIsLogged);

  const [materialsListState, setMaterialsListState] = useState(null);
  let [modalMoreInfo, setModalMoreInfo] = useState(false);
  const [productElemHover, setProductElemHover] = useState(null);
  let [userFavorites, setUserFavorites] = useState(user.data.favorites?.items);

  let [activeMaterial, setActiveMaterial] = useState(props.matId);
  let [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

  const arrayList = [];

  const classes = useStyle();

  const mainDiv = useRef(null);
  let catalogMain = useRef(null);

  let loaderCompleteListener = (id) => {
    props.materialSelect(id, null, activeMaterial, null);
    setActiveMaterial(id);
  };

  let loaderErrorListener = (e) => console.log('Error loading material ', e);

  let onMaterialSelect = (elem) => {
    const id = elem.id;
    if (!R2D.Pool.getProductData(id)) {
      let loader = R2D.Pool.loadProductData(id);
      loader.addEventListener(Event.COMPLETE, (e) => loaderCompleteListener(id));
      loader.addEventListener(Event.ERROR, (e) => loaderErrorListener(id));
    } else {
      props.materialSelect(id, null, activeMaterial, null);
    }
    setActiveMaterial(id);
  };

  const mouseEnter = (event, data) => {
        if(dynamicPanelPreviewViewType == 'small') {
            document.querySelector("." + classes.product_hover) ? document.querySelector("." + classes.product_hover).remove() : null;
            let product = event.target;
            let hoverWindow = document.createElement("div");
            hoverWindow.classList.add(classes.product_hover);
            hoverWindow.innerHTML = data.name;
            document.querySelector("body").append(hoverWindow);
            hoverWindow.style.left = (product.getBoundingClientRect().left + product.offsetWidth) + "px";
            hoverWindow.style.top = (product.getBoundingClientRect().top + ((product.offsetHeight - hoverWindow.offsetHeight) / 2)) + "px";
        }
    }

  };

  let mouseLeave = () =>
    document.querySelector('.' + classes.product_hover)
      ? document.querySelector('.' + classes.product_hover).remove()
      : null;

  const onMouseEnterProductMoreInfo = (e, elem) => {
        setModalMoreInfo(true);
        setProductElemHover(elem);
    };
  let onMouseLeaveProductMoreInfo = (e) => {
    setModalMoreInfo(false);
  };

  let updateFavorites = async (id, isInFavorites) => {
    if (!isLogged) return dispatch(setActivePopup({ name: 'login' }));
    if (isInFavorites) {
      await user.uRemoveFromFavorites(id);
      setUserFavorites((prev) => prev.filter((i) => i.id != id));
      dispatch(updateAnimateFavoritesHideStatus(true));
      setTimeout(() => dispatch(updateAnimateFavoritesHideStatus(false)), 10);
    } else {
      const response = await user.uAddToFavorites(id);
      setUserFavorites((prev) => {
        let newArray = prev;
        return [...newArray, response];
      });

      dispatch(updateAnimateFavoritesShowStatus(true));
      setTimeout(() => dispatch(updateAnimateFavoritesShowStatus(false)), 10);
    }
    planner.apiScene.dispatchEvent(new Event(planner.apiScene.FAVORITES_BUTTON, {}));
  };

  useEffect(() => {
    setStyleAnimation({ transform: 'translateX(0%)' });
  }, []);

  useEffect(() => {
    if (lastHistoryElemData) {
      lastHistoryElemData.forEach((i) => {
        let isInFavorites = userFavorites?.find((с) => с?.id == i.id);
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
              <img src={R2D.URL.DOMAIN + i.source.images.preview} className={'lazyload'} />

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
            <div
              className={classes.prod_item_overlay}
              onMouseLeave={mouseLeave}
              onMouseEnter={(e) => mouseEnter(e, i)}
              onClick={(e) => onMaterialSelect(i)}
            ></div>
          </div>
        );
      });
      setMaterialsListState(arrayList);
    }
  }, [lastHistoryElemData, activeMaterial, dynamicPanelPreviewViewType, userFavorites]);

  return (
    <div className={classes.planner_catalog_cont} style={styleAnimation} ref={mainDiv}>
      <Navigation
        hideBreadCrumbsHomePanel={props.hideBreadCrumbsHomePanel}
        disableBreadcrumbs={props.disableBreadcrumbs}
        isAddSettingsDisabled={props.isAddSettingsDisabled}
        panelPreviewIcon={props.panelPreviewIcon}
        hideCategoryTree={props.hideCategoryTree}
        breadcrumsTitle={props.breadcrumsTitle}
        isHomeDisabled={props.isHomeDisabled}
        closeButtonStatus={props.closeButtonStatus}
        breadCrumbsLongShow={props.breadCrumbsLongShow}
      />
      <div className={classes.catalog_wr}>
        {lastHistoryElemData && (
          <SimpleBar style={{ height: '100%' }} ref={catalogMain} autoHide={false} forceVisible="y">
            <div className={classes.prod_elem_wrap}>{materialsListState}</div>
          </SimpleBar>
        )}
      </div>

      <AnimatePresence>
        {modalMoreInfo ? (
          <ModalMoreInfo productElemHover={productElemHover} key="modalMoreInfo" />
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default CatalogMaterialsSets;
