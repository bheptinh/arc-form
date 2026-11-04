import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

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
import {
  selectIsLogged,
  selectUserProfileData,
  selectUserProjectActive,
} from '../../../../../../redux/features/user/userSlice';
import { TileGrid } from '../../../../../../shared-components/TileGrid';
import CatalogTile from '../../../../../../smart-components/catalog/catalog-tile';
import Navigation from '../../navigation/Navigation';
import AddUploadButton from './AddUploadButton';
import CatalogScreen from './CatalogScreen';
import classes from './Products.module.css';

const Products = (props) => {
  const dispatch = useDispatch();
  const userData = useSelector(selectUserProfileData);

  const activeControlPanel = useSelector(selectActiveControlPanelMode);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const [savedScroll, setSavedScroll] = useState(lastHistoryElem?.lastSavedScroll);

  const dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);
  const isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);

  const isLogged = useSelector(selectIsLogged);

  const [modelsListState, setModelsListState] = useState(null);
  const [customModelsListState, setCustomModelsListState] = useState(null);

  const [lastHistoryElemData, setLastHistoryElemData] = useState(null);
  const [preloaderStatus, setPreloaderStatus] = useState(true);

  const userProjectActive = useSelector(selectUserProjectActive);
  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  let scrollTimer = -1;
  const catalogMain = useRef(null);

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
    activeControlPanel == 'decor' &&
      planner.apiScene.dispatchEvent(new Event(planner.apiScene.TIPS_UPLOAD_CUSTOM_MAT, {}));
    planner.scene.addEventListener(planner.scene.PRODUCTS_UPDATED, onProductsUpdated);
    return () =>
      planner.scene.removeEventListener(planner.scene.PRODUCTS_UPDATED, onProductsUpdated);
  }, []);

  useEffect(() => {
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
        const tile = <CatalogTile key={elem.id} product={elem} replace={props.type == 'replace'} />;
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
    <CatalogScreen
      header={
        <Navigation
          panelPreviewIcon={props.panelPreviewIcon}
          breadcrumsTitle={props.breadcrumsTitle}
        />
      }
      isLoading={preloaderStatus}
      scrollRef={catalogMain}
    >
      <TileGrid size={dynamicPanelPreviewViewType}>
        {customModelsListState && customModelsListState.length > 0 ? (
          <div className={classes.ownUploads}>
            {lastHistoryElem?.privateMaterialType ? (
              <AddUploadButton onMouseUp={onCustomModelAddMouseUp} />
            ) : null}

            {customModelsListState}
            {customModelsListState ? <div className={classes.ownUploadsLine}></div> : ''}
          </div>
        ) : lastHistoryElem?.privateMaterialType ? (
          <AddUploadButton onMouseUp={onCustomModelAddMouseUp} />
        ) : null}
        {modelsListState}
      </TileGrid>
    </CatalogScreen>
  );
};

export default Products;
