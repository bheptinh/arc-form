import React, { useEffect, useMemo, useState } from 'react';
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
  selectedPlinth: {
    position: 'absolute',
    left: 0,
    width: 310,
    top: 0,
    height: '100%',
    overflow: 'hidden',
    zIndex: 1,
    '@media screen and (max-width: 950px)': {
      width: 190,
    },
  },
});

const SelectedPlinth = () => {
  const classes = useStyle();
  const currObj =
    planner.mih()._scene.currentView3DObject || planner.mih()._scene.prevSelectedView3DObject;
  const constructionData =
    currObj && currObj.getConstructorElementData && currObj.getConstructorElementData();

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = activeControlPanelData.history;
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const lastHistoryElemType = lastHistoryElem?.type;
  let keyTimeoutClearActiveComponents;

  const [activePanelComponents, setActivePanelComponents] = useState([]);
  const [selectedType, setSelectedType] = useState(null);

  const dispatch = useDispatch();

  const onChangeSelectedType = (type) => setSelectedType(type);

  const onSelectMaterial = (id, addMaterialId = '') => {
    constructionData.setMaterial(id);
    constructionData.setAddMaterial(addMaterialId);
    constructionData.dispatchUpdate();
    R2D.scene.history.saveState();
    dispatch(changeUndoRedo());
    planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
  };

  const panelPreviewIcon = WC.plinthCreator.getImgSrc(
    constructionData?.shapeNum,
    constructionData?.type
  );

  const moldingOrPlinthTitle = {
    topPlinth: 'TEXT_MOLDING',
    bottomPlinth: 'TEXT_PLINTH',
  };
  const panelmoldingOrPlinthTitle = moldingOrPlinthTitle[selectedType];

  useEffect(() => {
    if (lastHistoryElemType) {
      setActivePanelComponents((prevState) => [
        ...prevState,
        lastHistoryElemType == 'main' ? (
          <Main
            key={Math.random()}
            constructionData={constructionData}
            onChangeSelectedType={onChangeSelectedType}
          />
        ) : lastHistoryElemType == 'changePlinth' ? (
          <ChangePlinth
            panelPreviewIcon={panelPreviewIcon}
            breadcrumsTitle={panelmoldingOrPlinthTitle}
            hideCategoryTree={true}
            key={Math.random()}
          />
        ) : lastHistoryElemType == 'catalog' ? (
          <Catalog
            leafType="materials"
            breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
            panelPreviewIcon={panelPreviewIcon}
            hideCategoryTree={true}
            closeButtonStatus={true}
            isHomeDisabled={true}
            key={Math.random()}
            breadCrumbsLongShow={true}
          />
        ) : lastHistoryElemType == 'materials' ? (
          <Materials
            breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
            panelPreviewIcon={panelPreviewIcon}
            hideCategoryTree={true}
            closeButtonStatus={true}
            isHomeDisabled={true}
            key={Math.random()}
            materialSelect={onSelectMaterial}
            matId={constructionData?.getMaterial()}
            breadCrumbsLongShow={true}
          />
        ) : lastHistoryElemType == 'colorpicker' ? (
          <ColorPicker
            panelPreviewIcon={panelPreviewIcon}
            breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
            isAddSettingsDisabled={true}
            key={Math.random()}
            closeButtonStatus={true}
            isHomeDisabled={true}
            breadCrumbsLongShow={true}
            addMaterial={constructionData?.getAddMaterial()}
            matId={constructionData?.getMaterial()}
            materialSelect={onSelectMaterial}
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

  return <div className={classes.selectedPlinth}>{activePanelComponents}</div>;
};

export default SelectedPlinth;
