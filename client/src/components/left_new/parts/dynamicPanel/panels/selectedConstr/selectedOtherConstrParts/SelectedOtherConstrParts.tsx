import React, { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../../../../../../initR2D';
import { selectActiveControlPanelModeData } from '../../../../../../../redux/features/control/controlPanelSlice';
import { changeUndoRedo } from '../../../../../../../redux/features/topPanel/topPanelSlice';
import Catalog from '../../common/Catalog';
import ColorPicker from '../../common/ColorPicker';
import Materials from '../../common/Materials';
import Main from './Main';

const useStyle = createUseStyles({
  selectedOtherConstrParts: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 310,
    height: '100%',
    overflow: 'hidden',
    zIndex: 1,
    '@media screen and (max-width: 950px)': {
      width: 190,
    },
  },
});

const SelectedOtherConstrParts = () => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const currObj = useMemo(
    () =>
      planner.mih()._scene.currentView3DObject?.constructorElementData ||
      planner.mih()._scene.prevSelectedView3DObject?.constructorElementData,
    []
  );

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = activeControlPanelData.history;
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const lastHistoryElemType = lastHistoryElem?.type;
  let keyTimeoutClearActiveComponents;

  const [activePanelComponents, setActivePanelComponents] = useState([]);

  const onMaterialSelect = (id, addMatId = '') => {
    if (!currObj) return;
    currObj.setAddMaterial(addMatId);
    currObj.setMaterial(id);
    currObj.dispatchUpdate();
    R2D.scene.history.saveState();
    dispatch(changeUndoRedo());
    planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
  };

  const constrPartPreviw = {
    ceiling: '/src_designer/images/panelicons/icon_ceiling.svg',
    bottomFrame: '/src_designer/images/panelicons/icon_floor.svg',
    topFrame: '/src_designer/images/panelicons/icon_rama.svg',
    cap: '/src_designer/images/panelicons/icon_cap.svg',
  };
  const panelPreviewIcon = constrPartPreviw[currObj.type];

  const constrPartTitle = {
    ceiling: 'PANEL_TITLE_CEILING',
    bottomFrame: 'PPANEL_TITLE_THRESHOLD',
    topFrame: 'PPANEL_TITLE_HELLINGEN',
    cap: 'PANEL_TITLE_CAP',
  };
  const panelTitle = constrPartTitle[currObj.type];

  useEffect(() => {
    if (lastHistoryElemType) {
      setActivePanelComponents((prevState) => [
        ...prevState,
        lastHistoryElemType == 'main' ? (
          <Main panelTitle={panelTitle} key={Math.random()} panelPreviewIcon={panelPreviewIcon} />
        ) : lastHistoryElemType == 'catalog' ? (
          <Catalog
            leafType="materials"
            breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
            panelPreviewIcon={panelPreviewIcon}
            isAddSettingsDisabled={true}
            closeButtonStatus={true}
            isHomeDisabled={true}
            key={Math.random()}
            breadCrumbsLongShow={true}
          />
        ) : lastHistoryElemType == 'materials' ? (
          <Materials
            breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
            panelPreviewIcon={panelPreviewIcon}
            isAddSettingsDisabled={true}
            closeButtonStatus={true}
            isHomeDisabled={true}
            key={Math.random()}
            matId={currObj?.getMaterial()}
            materialSelect={onMaterialSelect}
            breadCrumbsLongShow={true}
          />
        ) : lastHistoryElemType == 'colorpicker' ? (
          <ColorPicker
            breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
            panelPreviewIcon={panelPreviewIcon}
            key={Math.random()}
            isAddSettingsDisabled={true}
            closeButtonStatus={true}
            isHomeDisabled={true}
            breadCrumbsLongShow={true}
            addMaterial={currObj?.getAddMaterial()}
            matId={currObj?.getMaterial()}
            materialSelect={onMaterialSelect}
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

  return <div className={classes.selectedOtherConstrParts}>{activePanelComponents}</div>;
};

export default SelectedOtherConstrParts;
