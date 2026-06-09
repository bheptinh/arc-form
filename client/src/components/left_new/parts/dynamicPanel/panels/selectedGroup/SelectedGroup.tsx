import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
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
import Main from './Main';

const useStyle = createUseStyles({
  selectedGroup: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 311,
    height: '100%',
    overflow: 'hidden',
    zIndex: 1,
    borderLeft: '1px solid #E0E0E0',
    '@media screen and (max-width: 950px)': {
      width: 190,
    },
  },
});

const SelectedGroup = () => {
  const dispatch = useDispatch();
  const classes = useStyle();

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = activeControlPanelData.history;
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const lastHistoryElemType = lastHistoryElem?.type;
  const controlPanelData = useSelector(selectControlPanelData);
  const prevControlPanelMode = useSelector(selectPrevControlPanelMode);

  const [activeMatId, setActiveMatId] = useState(null);
  const [activeAddMatId, setActiveAddMatId] = useState(null);
  const [activePanelComponents, setActivePanelComponents] = useState([]);
  let keyTimeoutClearActiveComponents;

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

  useEffect(() => {
    if (lastHistoryElemType) {
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
      setActivePanelComponents((prevState) => [
        ...prevState,
        lastHistoryElemType == 'main' ? (
          <Main
            key={Math.random()}
            onClickPreview={onClickPreview}
            currentObjectsMaterialsIds={currObjectsMaterialsIds}
          />
        ) : lastHistoryElemType == 'catalog' ? (
          <Catalog
            breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
            hideCategoryTree={true}
            closeButtonStatus={true}
            isHomeDisabled={true}
            key={Math.random()}
            breadCrumbsLongShow={true}
          />
        ) : lastHistoryElemType == 'materials' ? (
          <Materials
            breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
            hideCategoryTree={true}
            closeButtonStatus={true}
            isHomeDisabled={true}
            key={Math.random()}
            materialSelect={onMaterialSelect}
            matId={activeMatId}
            breadCrumbsLongShow={true}
          />
        ) : lastHistoryElemType == 'colorpicker' ? (
          <ColorPicker
            breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
            isAddSettingsDisabled={true}
            key={Math.random()}
            closeButtonStatus={true}
            isHomeDisabled={true}
            breadCrumbsLongShow={true}
            addMaterial={activeAddMatId}
            matId={activeMatId}
            materialSelect={onMaterialSelect}
          />
        ) : lastHistoryElemType == 'catalogSets' ? (
          <CatalogSet
            breadCrumbsLongShow={true}
            hideBreadCrumbsHomePanel={true}
            closeButtonStatus={true}
            isHomeDisabled={true}
            hideCategoryTree={true}
            breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
            key={Math.random()}
          />
        ) : lastHistoryElemType == 'catalogMaterialsSets' ? (
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
            key={Math.random()}
          />
        ) : null,
      ]);
    }
  }, [controlPanelModeHistory.length]);

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

  return <div className={classes.selectedGroup}>{activePanelComponents}</div>;
};

export default SelectedGroup;
