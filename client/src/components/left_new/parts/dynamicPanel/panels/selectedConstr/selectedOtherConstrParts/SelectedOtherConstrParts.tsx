import { useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { planner } from '../../../../../../../initR2D';
import { changeUndoRedo } from '../../../../../../../redux/features/topPanel/topPanelSlice';
import Catalog from '../../common/Catalog';
import ColorPicker from '../../common/ColorPicker';
import Materials from '../../common/Materials';
import PanelStack from '../../common/PanelStack';
import Main from './Main';

const SelectedOtherConstrParts = () => {
  const dispatch = useDispatch();
  const currObj = useMemo(
    () =>
      planner.mih()._scene.currentView3DObject?.constructorElementData ||
      planner.mih()._scene.prevSelectedView3DObject?.constructorElementData,
    []
  );

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

  const screens = {
    main: () => <Main panelTitle={panelTitle} panelPreviewIcon={panelPreviewIcon} />,
    catalog: () => (
      <Catalog
        leafType="materials"
        breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
        panelPreviewIcon={panelPreviewIcon}
        isAddSettingsDisabled={true}
        closeButtonStatus={true}
        isHomeDisabled={true}
        breadCrumbsLongShow={true}
      />
    ),
    materials: () => (
      <Materials
        breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
        panelPreviewIcon={panelPreviewIcon}
        isAddSettingsDisabled={true}
        closeButtonStatus={true}
        isHomeDisabled={true}
        matId={currObj?.getMaterial()}
        materialSelect={onMaterialSelect}
        breadCrumbsLongShow={true}
      />
    ),
    colorpicker: () => (
      <ColorPicker
        breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
        panelPreviewIcon={panelPreviewIcon}
        isAddSettingsDisabled={true}
        closeButtonStatus={true}
        isHomeDisabled={true}
        breadCrumbsLongShow={true}
        addMaterial={currObj?.getAddMaterial()}
        matId={currObj?.getMaterial()}
        materialSelect={onMaterialSelect}
      />
    ),
  };

  return <PanelStack screens={screens} />;
};

export default SelectedOtherConstrParts;
