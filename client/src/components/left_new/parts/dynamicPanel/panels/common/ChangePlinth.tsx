import cx from 'classnames';
import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { planner, user } from '../../../../../../initR2D';
import { selectIsProjectBelongToLoggedUser } from '../../../../../../redux/features/common/commonSlice';
import {
  selectActiveControlPanelModeData,
  selectDynamicPanelPreviewViewType,
  updateAnimateFavoritesHideStatus,
  updateAnimateFavoritesShowStatus,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { selectTranslation } from '../../../../../../redux/features/language/languageSlice';
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
import ChangeSize from '../../components/ChangeSize';
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
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    borderTop: '1px solid #C6C4C4',
  },
  planerWallsInfo: {
    padding: '20px 14px',
    '@media screen and (max-width: 950px)': {
      padding: 5,
    },
  },
  planerWallsTitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 15,
    color: '#505050',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      marginBottom: 5,
    },
  },
  planerChangeSizes: {
    display: 'grid',
    justifyContent: 'flex-start',
  },
  planerWallsCurentMatWr: {
    display: 'grid',
    gridTemplateColumns: 100,
    justifyContent: 'center',
    marginBottom: 20,
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
      '& $prod_item_zamok_btn': {
        opacity: 0,
        pointerEvents: 'none',
      },
      '& $prod_item_promocode_btn': {
        opacity: 0,
        pointerEvents: 'none',
      },
      '& $prod_item_more_info': {
        zIndex: 9,
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
    },
    '& $prod_item_zamok_btn': {
      width: 15,
      height: 15,
    },
    '& $prod_item_custom_delete_btn': {
      width: 15,
      height: 15,
    },
    '& $prod_item_promocode_btn': {
      width: 15,
      height: 15,
    },
    '& $prod_item_more_info': {
      width: 15,
      height: 15,
    },
    '& $prod_item_title': {
      fontSize: 12,
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
  prod_item_img_wr: {
    overflow: 'hidden',
    width: '100%',
    display: 'flex',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: '1 / 1',
    marginBottom: 7,
  },
  prod_item_img: {
    maxWidth: '100%',
    maxHeight: '100%',
    width: '100%',
    height: 'auto',
    aspectRatio: '1 / 1',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
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
  },
  item_info_content: {
    color: '#7B7B7B',
    fontSize: '13px',
    padding: '0 13px 0',
    lineHeight: 1.4,
    '& span': {
      marginRight: 3,
    },
    '& > div': {
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
    },
  },
  item_info_content_span: {
    color: '#000',
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
  prod_item_overlay: {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
});

const ChangePlinth = (props) => {
  const classes = useStyle();
  const translation = useSelector(selectTranslation);
  const dispatch = useDispatch();
  const dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);
  const isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);
  const userProjectActive = useSelector(selectUserProjectActive);
  const userData = useSelector(selectUserProfileData);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const currentPlinthType = lastHistoryElem.data;

  let currObj = R2D.scene.currentView3DObject;
  let constructionData = currObj?.getConstructorElementData();
  constructionData = currentPlinthType
    ? currentPlinthType == 'molding'
      ? constructionData?.topPlinth
      : constructionData?.bottomPlinth
    : constructionData;

  const [plinthHeight, setPlinthHeight] = useState(constructionData?.h);
  const [plinthDepth, setPlinthDepth] = useState(constructionData?.d);

  const [mouseDown, setMouseDown] = useState({ status: false, action: null, type: null });
  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

  const [plinthReactArray, setPlinthReactArray] = useState();

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const [userFavorites, setUserFavorites] = useState(user.data.favorites?.items);
  const isLogged = useSelector(selectIsLogged);

  const [modalMoreInfo, setModalMoreInfo] = useState(false);
  const [productElemHover, setProductElemHover] = useState(null);

  const onChangeSize = (mouseDown, value, type) => {
    setMouseDown({ ...mouseDown, type });
    constructionData[type] = value;
    constructionData.dispatchUpdate();
    planner.scene.rebuildAllPlinths();
    type == 'h' ? setPlinthHeight(value) : setPlinthDepth(value);

    if (mouseDown.status == false) {
      planner.mih()._scene.history.saveState();
      dispatch(changeUndoRedo());
    }
    !mouseDown.status &&
      planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
  };

  const onChangePlinthType = (id, e) => {
    if (id == constructionData.shapeNum) return;
    if (
      userData.plan == 'pro' ||
      userData.plan == 'basic' ||
      (isProjectBelongToLoggedUser &&
        (userProjectActive.plan == 'pro' || userProjectActive.plan == 'basic'))
    ) {
      if (document.querySelector('.' + classes.prod_item)) {
        Array.from(document.querySelectorAll('.' + classes.prod_item)).forEach((item) =>
          item.classList.remove(classes.prod_item_active)
        );
      }
      e.currentTarget.classList.add(classes.prod_item_active);

      WC.plinthCreator.loadSVG(id).then(() => {
        constructionData.shapeNum = id;
        constructionData.h = WC.plinthCreator.PoolPlinthShape[id].defHeight;
        constructionData.d = WC.plinthCreator.PoolPlinthShape[id].defDepth;
        constructionData.dispatchUpdate();
        planner.scene.rebuildAllPlinths();
        setPlinthHeight(constructionData.h);
        setPlinthDepth(constructionData.d);
        R2D.scene.history.saveState();

        currObj = planner.mih()._scene.currentView3DObject;
        constructionData = currObj.getConstructorElementData();
        constructionData = currentPlinthType
          ? currentPlinthType == 'molding'
            ? constructionData.topPlinth
            : constructionData.bottomPlinth
          : constructionData;
        setPlinthDepth(constructionData.d);
        setPlinthHeight(constructionData.h);
        planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
      });
    } else {
      R2D.OPTIONS.PRO_PLAN
        ? !R2D.config.data.enable_merchant_login
          ? dispatch(setActivePopup({ name: 'login' }))
          : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }))
        : dispatch(setActivePopup({ name: 'payPro', type: 'user' }));
      return;
    }
  };

  const mouseDownOnObj = false;

  const mouseEnter = (e, name) => {
    if (dynamicPanelPreviewViewType == 'small') {
      if (mouseDownOnObj) return;
      document.querySelector('.' + classes.product_hover) &&
        document.querySelector('.' + classes.product_hover).remove();

      const product = e.target;
      const hoverWindow = document.createElement('div');
      hoverWindow.classList.add(classes.product_hover);
      const textHover = document.createElement('p');
      textHover.innerHTML = name;

      hoverWindow.append(textHover);
      document.querySelector('body').append(hoverWindow);
      hoverWindow.style.left = product.getBoundingClientRect().left + product.offsetWidth + 'px';
      hoverWindow.style.top =
        product.getBoundingClientRect().top +
        (product.offsetHeight - hoverWindow.offsetHeight) / 2 +
        'px';
    }
  };

  const mouseLeave = (e) =>
    document.querySelector('.' + classes.product_hover) &&
    document.querySelector('.' + classes.product_hover).remove();

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

  useEffect(() => {
    setStyleAnimation({ transform: 'translateX(0%)' });
    let curType = '';
    if (currentPlinthType) curType = currentPlinthType === 'molding' ? 'moldings' : 'plinths';
    else curType = constructionData.type === 'topPlinth' ? 'moldings' : 'plinths';

    const plinthsList = WC.plinthCreator.getPlinthsList(curType);
    const plinths = [];
    for (let i = 0; i < plinthsList.length; i++) {
      const elem = plinthsList[i];
      const isInFavorites = userFavorites?.find((i) => i?.id == elem.id);
      const id = plinthsList[i].id;
      const src = plinthsList[i].imgSrc;
      const name = plinthsList[i].name;
      plinths.push(
        <div
          key={i}
          className={cx(
            classes.prod_item + ' ' + classes[`prod_item_${dynamicPanelPreviewViewType}`],
            {
              [classes.prod_item_active]: id == constructionData.shapeNum,
            }
          )}
          onClick={(e) => onChangePlinthType(id, e)}
        >
          <div className={classes.prod_item_hover_left}></div>
          <div className={classes.prod_item_hover_top}></div>
          <div className={classes.prod_item_hover_right}></div>
          <div className={classes.prod_item_hover_bottom}></div>

          <div className={classes.prod_item_img_wr}>
            <div
              className={classes.prod_item_img}
              style={{ background: `url(${src}) 0% 0% / contain` }}
            ></div>
            {isCurrDeviceAPhone ? null : (
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
            )}
            {dynamicPanelPreviewViewType != 'big' ? (
              <div
                className={classes.prod_item_more_info}
                onMouseEnter={(e) => onMouseEnterProductMoreInfo(e, elem)}
                onMouseLeave={onMouseLeaveProductMoreInfo}
              >
                <MoreInfoIcon />
              </div>
            ) : null}
            {userData.plan == 'pro' ||
            userData.plan == 'basic' ||
            (isProjectBelongToLoggedUser &&
              (userProjectActive.plan == 'pro' || userProjectActive.plan == 'basic')) ? null : id ==
              constructionData.shapeNum ? null : (
              <Lock
                additionalClass={classes.prod_item_zamok_btn}
                tipPositionX={'right'}
                upgradeBasic={true}
                upgradePro={true}
                textHover={'UPGRADE_YOUR_PLAN_TEXT'}
                parentClass={classes.prod_item}
              />
            )}
          </div>

          {dynamicPanelPreviewViewType != 'small' ? (
            <div className={classes.prod_item_title}>
              <div>{name}</div>
            </div>
          ) : null}

          <div
            className={classes.prod_item_overlay}
            onMouseEnter={(e) => mouseEnter(e, name)}
            onMouseLeave={mouseLeave}
          ></div>
        </div>
      );
    }
    setPlinthReactArray(plinths);
  }, [dynamicPanelPreviewViewType, userFavorites]);

  return (
    <div style={styleAnimation} className={classes.planner_catalog_cont}>
      <Navigation
        panelPreviewIcon={props.panelPreviewIcon}
        breadcrumsTitle={props.breadcrumsTitle}
        hideCategoryTree={props.hideCategoryTree}
        closeButtonStatus={props.closeButtonStatus}
      />
      <div className={classes.catalog_wr}>
        <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
          <div className={classes.planerWallsWr}>
            <div className={classes.planerWallsInfo}>
              <div
                className={classes.planerWallsTitle}
              >{`${translation['LENGTH']} ${planner.units.valueToString(constructionData?.length)} ${R2D.DimensionSystem.getName()}`}</div>

              <div className={classes.planerChangeSizes}>
                <ChangeSize
                  mouseDown={mouseDown}
                  valueChangeType={'h'}
                  zeroNotAllowed={true}
                  changeValue={onChangeSize}
                  value={plinthHeight}
                  label={translation['HEIGHT']}
                />
                <ChangeSize
                  mouseDown={mouseDown}
                  valueChangeType={'d'}
                  zeroNotAllowed={true}
                  changeValue={onChangeSize}
                  value={plinthDepth}
                  label={translation['DEPTH']}
                />
              </div>
            </div>

            <div className={classes.prod_elem_wrap}>{plinthReactArray}</div>
          </div>
        </SimpleBar>
      </div>
      <AnimatePresence>
        {modalMoreInfo ? (
          <ModalMoreInfo productElemHover={productElemHover} key="modalMoreInfo" />
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default ChangePlinth;
