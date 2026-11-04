import { useMemo } from 'react';
import { useDispatch } from 'react-redux';

import { planner } from '../../../../../../../initR2D';
import { changeUndoRedo } from '../../../../../../../redux/features/topPanel/topPanelSlice';
import Catalog from '../../common/Catalog';
import ColorPicker from '../../common/ColorPicker';
import Materials from '../../common/Materials';
import PanelStack from '../../common/PanelStack';
import Main from './Main';

const SelectedCover = () => {
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

  const panelPreviewIcon = '/src_designer/images/panelicons/icon_floor.svg';

  const screens = {
    main: () => <Main panelPreviewIcon={panelPreviewIcon} />,
    catalog: () => (
      <Catalog
        leafType="materials"
        breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
        panelPreviewIcon={panelPreviewIcon}
        hideCategoryTree={true}
        closeButtonStatus={true}
        isHomeDisabled={true}
        breadCrumbsLongShow={true}
      />
    ),
    materials: () => (
      <Materials
        breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
        panelPreviewIcon={panelPreviewIcon}
        hideCategoryTree={true}
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

export default SelectedCover;
