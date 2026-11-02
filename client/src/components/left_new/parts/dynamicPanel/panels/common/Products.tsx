import 'simplebar-react/dist/simplebar.min.css';

import { IconPlus } from '@tabler/icons-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { planner } from '../../../../../../initR2D';
import { selectIsProjectBelongToLoggedUser } from '../../../../../../redux/features/common/commonSlice';
import {
  controlPanelHistoryScrollSave,
  selectActiveControlPanelMode,
  selectActiveControlPanelModeData,
  selectDynamicPanelPreviewViewType,
  updateDynamicPanelPreviewViewType,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import { changeUndoRedo } from '../../../../../../redux/features/topPanel/topPanelSlice';
import {
  selectIsLogged,
  selectUserProfileData,
  selectUserProjectActive,
} from '../../../../../../redux/features/user/userSlice';
import { TileGrid } from '../../../../../../shared-components/TileGrid';
import ProductTile from '../../../../../../smart-components/catalog/product-tile';
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
  prod_elem_wrap: {},
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
  prod_item: {},
  previewSelectedObject: {
    userSelect: 'none',
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 9,
  },
  selectedTouched: {
    transition: 'all .5s ease',
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

  const classes = useStyle();

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

  const onProductsUpdated = async (e) => {
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
      scrollElemMain?.removeEventListener('scroll', onScroll);
    };
  }, [modelsListState, customModelsListState]);

  useEffect(() => {
    if (lastHistoryElemData && Array.isArray(lastHistoryElemData)) {
      const modelsList = [];
      const customModelsList = [];
      lastHistoryElemData.forEach((elem) => {
        const tile = (
          <ProductTile
            key={elem.id}
            product={elem}
            className={classes.prod_item}
            style={{ pointerEvents: 'none' }}
            onDragStart={(e) =>
              elem.type == R2D.ProductType.MATERIAL
                ? onMouseDownMaterial(e, elem)
                : onMouseDownProduct(e, elem)
            }
          />
        );
        if (elem.isOwner || elem.material_owner) customModelsList.push(tile);
        else modelsList.push(tile);
      });
      setModelsListState(modelsList);
      setCustomModelsListState(customModelsList);
    }
  }, [
    lastHistoryElemData,
    userProjectActive,
    isProjectBelongToLoggedUser,
    isLogged,
    dynamicPanelPreviewViewType,
    userData,
  ]);

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
          <TileGrid size={dynamicPanelPreviewViewType} className={classes.prod_elem_wrap}>
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
          </TileGrid>
        </SimpleBar>

        <div
          className={classes.preloaderBlock}
          style={preloaderStatus ? { opacity: 1 } : { opacity: 0, zIndex: -1 }}
        >
          <div className="preloader-cube"></div>
        </div>
      </div>
    </div>
  );
};

export default Products;
