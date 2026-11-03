import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../../../../../../initR2D';
import { selectActiveControlPanelModeData } from '../../../../../../../redux/features/control/controlPanelSlice';
import { changeUndoRedo } from '../../../../../../../redux/features/topPanel/topPanelSlice';
import Catalog from '../../common/Catalog';
import ChangePlinth from '../../common/ChangePlinth';
import ColorPicker from '../../common/ColorPicker';
import Materials from '../../common/Materials';
import Main from './Main';

const useStyle = createUseStyles({
  selectedWall: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 310,
    height: '100%',
    zIndex: 1,
    overflow: 'hidden',
    '@media screen and (max-width: 950px)': {
      width: 190,
    },
  },
});

const SelectedWall = () => {
  const dispatch = useDispatch();
  const classes = useStyle();
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = activeControlPanelData.history;
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const lastHistoryElemType = lastHistoryElem?.type;
  let keyTimeoutClearActiveComponents, keyTimeoutOverflow;
  const currObj =
    planner.mih()._scene.currentView3DObject || planner.mih()._scene.prevSelectedView3DObject;
  const constructionData =
    currObj && currObj.getConstructorElementData ? currObj.getConstructorElementData() : null;

  const topPlinth = constructionData ? constructionData.topPlinth : null;
  const bottomPlinth = constructionData ? constructionData.bottomPlinth : null;

  const [activePanelComponents, setActivePanelComponents] = useState([]);
  const [needToOverflowHidden, setNeedToOverflowHidden] = useState(true);

  const [selectedType, setSelectedType] = useState(null);

  const onChangeSelectedType = (type) => setSelectedType(type);

  const onSelectMaterial = (id, addMatId = '') => {
    if (!currObj) return;

    switch (selectedType) {
      case 'wall':
        constructionData.setAddMaterial(addMatId, planner.mih()._scene.currentPartNum);
        constructionData.setMaterial(id, planner.mih()._scene.currentPartNum);
        constructionData.dispatchUpdate();
        break;
      case 'top':
        topPlinth.setAddMaterial(addMatId);
        topPlinth.setMaterial(id);
        topPlinth.dispatchUpdate();
        break;
      case 'bottom':
        bottomPlinth.setAddMaterial(addMatId);
        bottomPlinth.setMaterial(id);
        bottomPlinth.dispatchUpdate();
        break;
    }
    R2D.scene.history.saveState();
    dispatch(changeUndoRedo());
    planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
  };

  const getSelectedId = () =>
    selectedType == 'wall'
      ? constructionData?.getMaterial()
      : selectedType == 'top'
        ? topPlinth.materialID
        : selectedType == 'bottom'
          ? bottomPlinth.materialID
          : null;

  const getSelectedAddMatId = () =>
    selectedType == 'wall'
      ? constructionData?.getAddMaterial()
      : selectedType == 'top'
        ? topPlinth?.addMaterialID
        : selectedType == 'bottom'
          ? bottomPlinth?.addMaterialID
          : null;

  const panelPreviewIcon = '/src_designer/images/panelicons/icon_wall.svg';

  const imgSrcTopPlinth = WC.plinthCreator?.getImgSrc(topPlinth?.shapeNum, topPlinth?.type);
  const imgSrcBottomPlinth = WC.plinthCreator?.getImgSrc(
    bottomPlinth?.shapeNum,
    bottomPlinth?.type
  );

  const moldingOrPlinthIcon = {
    molding: imgSrcTopPlinth,
    plinth: imgSrcBottomPlinth,
  };
  const panelMoldingOrPlinthPreviewIcon = moldingOrPlinthIcon[lastHistoryElem?.data];

  const moldingOrPlinthTitle = {
    molding: 'TEXT_MOLDING',
    plinth: 'TEXT_PLINTH',
  };
  const panelmoldingOrPlinthTitle = moldingOrPlinthTitle[lastHistoryElem?.data];

  const dynamicPanelPreviewIcon =
    selectedType === 'top'
      ? imgSrcTopPlinth
      : selectedType === 'bottom'
        ? imgSrcBottomPlinth
        : panelPreviewIcon;

  useEffect(() => {
    if (lastHistoryElemType) {
      setActivePanelComponents((prevState) => [
        ...prevState,
        lastHistoryElemType == 'main' ? (
          <Main
            panelPreviewIcon={panelPreviewIcon}
            key={Math.random()}
            onChangeSelectedType={onChangeSelectedType}
          />
        ) : lastHistoryElemType == 'changePlinth' ? (
          <ChangePlinth
            breadcrumsTitle={panelmoldingOrPlinthTitle}
            panelPreviewIcon={panelMoldingOrPlinthPreviewIcon}
            closeButtonStatus={true}
            key={Math.random()}
          />
        ) : lastHistoryElemType == 'catalog' ? (
          <Catalog
            leafType="materials"
            breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
            panelPreviewIcon={dynamicPanelPreviewIcon}
            hideCategoryTree={true}
            closeButtonStatus={true}
            isHomeDisabled={true}
            key={Math.random()}
            breadCrumbsLongShow={true}
          />
        ) : lastHistoryElemType == 'materials' ? (
          <Materials
            breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
            panelPreviewIcon={dynamicPanelPreviewIcon}
            hideCategoryTree={true}
            closeButtonStatus={true}
            isHomeDisabled={true}
            key={Math.random()}
            materialSelect={onSelectMaterial}
            matId={getSelectedId()}
            breadCrumbsLongShow={true}
          />
        ) : lastHistoryElemType == 'colorpicker' ? (
          <ColorPicker
            breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
            panelPreviewIcon={dynamicPanelPreviewIcon}
            key={Math.random()}
            isAddSettingsDisabled={true}
            closeButtonStatus={true}
            isHomeDisabled={true}
            breadCrumbsLongShow={true}
            addMaterial={getSelectedAddMatId()}
            matId={getSelectedId()}
            materialSelect={onSelectMaterial}
          />
        ) : null,
      ]);
    }
  }, [controlPanelModeHistory.length]);

  useEffect(() => {
    setNeedToOverflowHidden(true);
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
      else keyTimeoutOverflow = setTimeout(() => setNeedToOverflowHidden(false), 600);
    }
    return () => {
      clearTimeout(keyTimeoutClearActiveComponents);
      clearTimeout(keyTimeoutOverflow);
    };
  }, [activePanelComponents]);

  return (
    <div
      className={classes.selectedWall}
      style={needToOverflowHidden ? { overflow: 'hidden' } : null}
    >
      {activePanelComponents}
    </div>
  );
};

export default SelectedWall;
