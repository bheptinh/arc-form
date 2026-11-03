import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../../../../../initR2D';
import {
  changeActiveControlPanelMode,
  selectActiveControlPanelModeData,
  selectPrevControlPanelMode,
  updateControlPanelStatus,
} from '../../../../../../redux/features/control/controlPanelSlice';
import {
  closeActivePopup,
  setActivePopup,
} from '../../../../../../redux/features/popups/popupsSlice';
import { showQuickPanelVisible } from '../../../../../../redux/features/quickPanels/quickPanelsSlice';
import Catalog from '../common/Catalog';
import ColorPicker from '../common/ColorPicker';
import Materials from '../common/Materials';
import Main from './Main';

const useStyle = createUseStyles({
  uploadMode: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 311,
    height: '100%',
    borderLeft: '1px solid var(--color-border-faint)',
    overflow: 'hidden',
    zIndex: 1,
    '@media screen and (max-width: 950px)': {
      width: 190,
    },
  },
});

const UploadModel = () => {
  const dispatch = useDispatch();
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = activeControlPanelData.history;
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const lastHistoryElemType = lastHistoryElem?.type;
  const lastHistoryElemData = lastHistoryElem?.data;

  const prevControlPanelMode = useSelector(selectPrevControlPanelMode);

  const [activeIndex, setActiveIndex] = useState(null);
  const [activePanelComponents, setActivePanelComponents] = useState([]);

  let keyTimeoutClearActiveComponents;

  const classes = useStyle();

  const onClickPreview = (index) => {
    setActiveIndex(index);
    if (document.getElementById(`fromCatalog_${index}`).checked) return { source: 'bank' };
  };

  const onMaterialSelect = (id, addMaterial = '') => {
    if (id.indexOf && ~id.indexOf('#'))
      R2D.modelUploader.setPartMatId(
        R2D.modelUploader.getPartsHashes()[activeIndex],
        addMaterial,
        id
      );
    else
      R2D.modelUploader.setPartMatId(
        R2D.modelUploader.getPartsHashes()[activeIndex],
        id,
        addMaterial
      );
  };

  const savedListener = async (e) => {
    if (lastHistoryElemData.type == 'change' && R2D.scene.currentSceneObject) {
      const newSceneObject = await R2D.scene.replaceCurrentObject(
        lastHistoryElemData.id || R2D.scene.currentSceneObject.getProductId(),
        {},
        false,
        false
      );
      const viewer3d =
        R2D.commonSceneHelper.productHelper.findObjectView3dBySceneObject(newSceneObject);
      R2D.mouseInteractionHelper.setActiveObjectProduct(viewer3d);
      R2D.Pool3D.addEventListener('finish', onModel3dLoaded);
    } else {
      const userUpload = await planner.scene.categoryDataLoad(
        `${R2D.URL.DOMAIN + R2D.URL.URL_CATALOG_SEARCH}&category_tag&my=1`
      );
      planner.setUserUpload(userUpload);
      dispatch(updateControlPanelStatus(true));
      dispatch(changeActiveControlPanelMode({ mode: prevControlPanelMode }));
      dispatch(closeActivePopup({ name: 'loadingMessage', data: 'TEXT_WAIT' }));
      dispatch(
        setActivePopup({
          name: 'completeMessage',
          data:
            lastHistoryElemData.type == 'change' && R2D.scene.currentSceneObject
              ? 'NOTIFY_PRODUCT_UPDATED'
              : 'NOTIFY_PRODUCT_ADDED',
          positionX: 'right',
        })
      );
      R2D.modelUploader.hideCanvases();
      R2D.modelUploader.dispose();
      R2D.modelUploader = null;
    }
  };

  const onModel3dLoaded = function (e) {
    if (
      e.data == (lastHistoryElemData.id || R2D.scene.currentSceneObject.getProductId()) &&
      R2D.scene.currentSceneObject
    ) {
      R2D.Pool3D.removeEventListener('finish', onModel3dLoaded);
      dispatch(closeActivePopup({ name: 'loadingMessage', data: 'TEXT_WAIT' }));
      dispatch(
        setActivePopup({
          name: 'completeMessage',
          data:
            lastHistoryElemData.type == 'change'
              ? 'NOTIFY_PRODUCT_UPDATED'
              : 'NOTIFY_PRODUCT_ADDED',
          positionX: 'right',
        })
      );
      dispatch(showQuickPanelVisible({ name: 'helper_model' }));
      dispatch(changeActiveControlPanelMode({ mode: 'selectedModel', data: { type: 'main' } }));
      R2D.modelUploader.hideCanvases();
      R2D.modelUploader.dispose();
      R2D.modelUploader = null;
      dispatch(updateControlPanelStatus(true));
    }
  };

  const errorEventListener = (e) =>
    dispatch(closeActivePopup({ name: 'loadingMessage', data: 'TEXT_WAIT' }));

  useEffect(() => {
    R2D.modelUploader.setToken(R2D.token);
    R2D.modelUploader.setIsUserUpload(true);
    if (lastHistoryElemData.radioBtnsState)
      R2D.modelUploader.setPartHashesMaterialsType(lastHistoryElemData.radioBtnsState);
    if (lastHistoryElemData.type == 'change')
      R2D.modelUploader.open(
        R2D.URL.DOMAIN + R2D.URL.URL_UPLOAD_ENTITY,
        lastHistoryElemData.id || R2D.scene.currentSceneObject.getProductId()
      );
    else
      lastHistoryElemData.categoryId &&
        R2D.modelUploader.setCategoriesProduct([lastHistoryElemData.categoryId]);
    R2D.modelUploader.appendCanvases();
    R2D.modelUploader.addEventListener(R2D.ModelUploader.MODEL_SAVED, savedListener);
    R2D.modelUploader.addEventListener(R2D.ModelUploader.ERROR, errorEventListener);
    dispatch(updateControlPanelStatus(false));
  }, []);

  useEffect(() => {
    if (lastHistoryElemType) {
      const previewMaterialsId = R2D.modelUploader?.getPartsMaterials();
      setActivePanelComponents((prevState) => [
        ...prevState,
        lastHistoryElemType == 'main' ? (
          <Main
            key={Math.random()}
            onClickPreview={onClickPreview}
            showType={lastHistoryElemData.type}
          />
        ) : lastHistoryElemType == 'catalog' ? (
          <Catalog
            leafType="materials"
            isAddSettingsDisabled={true}
            closeButtonStatus={true}
            isHomeDisabled={true}
            key={Math.random()}
            breadCrumbsLongShow={true}
          />
        ) : previewMaterialsId &&
          previewMaterialsId[activeIndex] &&
          lastHistoryElemType == 'materials' ? (
          <Materials
            isAddSettingsDisabled={true}
            closeButtonStatus={true}
            isHomeDisabled={true}
            key={Math.random()}
            materialSelect={onMaterialSelect}
            matId={previewMaterialsId[activeIndex].matId}
            breadCrumbsLongShow={true}
          />
        ) : previewMaterialsId &&
          previewMaterialsId[activeIndex] &&
          lastHistoryElemType == 'colorpicker' ? (
          <ColorPicker
            key={Math.random()}
            isAddSettingsDisabled={true}
            closeButtonStatus={true}
            isHomeDisabled={true}
            breadCrumbsLongShow={true}
            addMaterial={previewMaterialsId[activeIndex].addMaterial}
            matId={previewMaterialsId[activeIndex].matId}
            materialSelect={onMaterialSelect}
          />
        ) : null,
      ]);
    }
  }, [controlPanelModeHistory?.length]);

  useEffect(() => {
    if (activePanelComponents.length > 2)
      setActivePanelComponents((prevState) => [
        prevState[prevState.length - 2],
        prevState[prevState.length - 1],
      ]);
    else {
      if (activePanelComponents.length > 1)
        keyTimeoutClearActiveComponents = setTimeout(
          () => setActivePanelComponents((prevState) => [prevState[prevState.length - 1]]),
          600
        );
    }
    return () => clearTimeout(keyTimeoutClearActiveComponents);
  }, [activePanelComponents]);

  return <div className={classes.uploadMode}>{activePanelComponents}</div>;
};

export default UploadModel;
