import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../../../../../initR2D';
import {
  changeActiveControlPanelMode,
  selectActiveControlPanelModeData,
  selectControlPanelData,
  selectPrevControlPanelMode,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { removeQuickPanelAll } from '../../../../../../redux/features/quickPanels/quickPanelsSlice';
import { changeUndoRedo } from '../../../../../../redux/features/topPanel/topPanelSlice';
import Catalog from '../common/Catalog';
import CatalogMaterialsSets from '../common/CatalogMaterialsSets';
import CatalogSet from '../common/CatalogSet';
import ColorPicker from '../common/ColorPicker';
import Materials from '../common/Materials';
import PanelStack from '../common/PanelStack';
import Main from './Main';

const SelectedGroup = () => {
  const dispatch = useDispatch();

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = activeControlPanelData.history;
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const controlPanelData = useSelector(selectControlPanelData);
  const prevControlPanelMode = useSelector(selectPrevControlPanelMode);

  const [activeMatId, setActiveMatId] = useState(null);
  const [activeAddMatId, setActiveAddMatId] = useState(null);

  const onClickPreview = (matId, addMatId) => {
    setActiveMatId(matId);
    setActiveAddMatId(addMatId);
  };

  const onDelClick = (e) => {
    if (e.code == 'Delete') {
      const furnitureData = planner.getCatalogProducts();
      prevControlPanelMode
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
          );
      dispatch(removeQuickPanelAll());
      document.removeEventListener('keydown', onDelClick);
    }
  };

  const onMaterialSelect = (id, addMaterial = '', activeMat, activeAddMat) => {
    const currentGroup =
      planner.mih()._scene.currentGroup || planner.mih()._scene.prevSelectedView3DObject;
    const currentObjects = currentGroup
      .getObjViews()
      .map((i) => (i && typeof i.getSceneObject === 'function' ? i.getSceneObject() : null));
    const newCurrentObjectsMaterialsIds = currentObjects
      .map((i) => i?.getMaterials && i.getMaterials())
      .filter((i) => i)
      .map((i) =>
        i
          .filter((z) => z.source == 'bank' || z.source == 'set')
          .map((y) => {
            return {
              id: y.current,
              addMaterial: y.addMaterial,
              hash: y.hash,
              source: y.source,
              setId: y.setId,
            };
          })
      );
    const currentObjectsMaterialsIds = newCurrentObjectsMaterialsIds.filter((i) => i.length > 0);
    currentObjects.forEach((i, index) => {
      currentObjectsMaterialsIds[index]?.forEach((y) => {
        if (
          activeMat == y.id &&
          (activeAddMat == y.addMaterial || (!activeAddMat && !y.addMaterial))
        ) {
          const materialIndex = i.getMaterialsObjects().findIndex((m) => m.hash == y.hash);
          i.setAddMaterialAt && i.setAddMaterialAt(materialIndex, addMaterial);
          i.setMaterialAt(materialIndex, id);
          i.dispatchUpdate();
        }
      });
    });
    planner.mih()._scene.history.saveState();
    planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
    dispatch(changeUndoRedo());
  };

  useEffect(() => {
    document.addEventListener('keydown', onDelClick);
    return () => document.removeEventListener('keydown', onDelClick);
  }, []);

  // the materials of the group's objects, read when the main screen opens
  const getCurrentObjectsMaterialsIds = () => {
    const currentGroup =
      planner.mih()._scene.currentGroup || planner.mih()._scene.prevSelectedView3DObject;
    const currObjs = currentGroup
      ?.getObjViews()
      .map((i) => (i && typeof i.getSceneObject === 'function' ? i.getSceneObject() : null));
    let newCurrentObjectsMaterialsIds, currObjectsMaterialsIds;
    if (currObjs) {
      newCurrentObjectsMaterialsIds = currObjs
        .map((i) => i?.getMaterials && i.getMaterials())
        .filter((i) => i)
        .map((i) =>
          i
            .filter((z) => z.source == 'bank' || z.source == 'set')
            .map((y) => {
              return {
                id: y.current,
                addMaterial: y.addMaterial,
                hash: y.hash,
                source: y.source,
                setId: y.setId,
              };
            })
        );
      currObjectsMaterialsIds = newCurrentObjectsMaterialsIds.filter((i) => i.length > 0);
    }
    return currObjectsMaterialsIds;
  };

  const screens = {
    main: () => (
      <Main
        onClickPreview={onClickPreview}
        currentObjectsMaterialsIds={getCurrentObjectsMaterialsIds()}
      />
    ),
    catalog: () => (
      <Catalog
        leafType="materials"
        breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
        hideCategoryTree={true}
        closeButtonStatus={true}
        isHomeDisabled={true}
        breadCrumbsLongShow={true}
      />
    ),
    materials: () => (
      <Materials
        breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
        hideCategoryTree={true}
        closeButtonStatus={true}
        isHomeDisabled={true}
        materialSelect={onMaterialSelect}
        matId={activeMatId}
        breadCrumbsLongShow={true}
      />
    ),
    colorpicker: () => (
      <ColorPicker
        breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
        isAddSettingsDisabled={true}
        closeButtonStatus={true}
        isHomeDisabled={true}
        breadCrumbsLongShow={true}
        addMaterial={activeAddMatId}
        matId={activeMatId}
        materialSelect={onMaterialSelect}
      />
    ),
    catalogSets: () => (
      <CatalogSet
        breadCrumbsLongShow={true}
        hideBreadCrumbsHomePanel={true}
        closeButtonStatus={true}
        isHomeDisabled={true}
        hideCategoryTree={true}
        breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
      />
    ),
    catalogMaterialsSets: () => (
      <CatalogMaterialsSets
        disableBreadcrumbs={!controlPanelModeHistory.find((i) => i.type == 'catalogSets')}
        hideBreadCrumbsHomePanel={true}
        breadCrumbsLongShow={true}
        closeButtonStatus={true}
        isHomeDisabled={true}
        hideCategoryTree={true}
        breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
        materialSelect={onMaterialSelect}
        matId={activeMatId}
      />
    ),
  };

  return <PanelStack screens={screens} />;
};

export default SelectedGroup;
