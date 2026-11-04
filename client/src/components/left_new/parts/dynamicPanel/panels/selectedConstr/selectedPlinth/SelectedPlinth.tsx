import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../../../../../../initR2D';
import { selectActiveControlPanelModeData } from '../../../../../../../redux/features/control/controlPanelSlice';
import { changeUndoRedo } from '../../../../../../../redux/features/topPanel/topPanelSlice';
import Catalog from '../../common/Catalog';
import ChangePlinth from '../../common/ChangePlinth';
import ColorPicker from '../../common/ColorPicker';
import Materials from '../../common/Materials';
import PanelStack from '../../common/PanelStack';
import Main from './Main';

const SelectedPlinth = () => {
  // re-renders on each history step, so a new screen reads the plinth as it is now
  useSelector(selectActiveControlPanelModeData);
  const currObj =
    planner.mih()._scene.currentView3DObject || planner.mih()._scene.prevSelectedView3DObject;
  const constructionData =
    currObj && currObj.getConstructorElementData && currObj.getConstructorElementData();

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

  const screens = {
    main: () => (
      <Main constructionData={constructionData} onChangeSelectedType={onChangeSelectedType} />
    ),
    changePlinth: () => (
      <ChangePlinth
        panelPreviewIcon={panelPreviewIcon}
        breadcrumsTitle={panelmoldingOrPlinthTitle}
        hideCategoryTree={true}
      />
    ),
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
        materialSelect={onSelectMaterial}
        matId={constructionData?.getMaterial()}
        breadCrumbsLongShow={true}
      />
    ),
    colorpicker: () => (
      <ColorPicker
        panelPreviewIcon={panelPreviewIcon}
        breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
        isAddSettingsDisabled={true}
        closeButtonStatus={true}
        isHomeDisabled={true}
        breadCrumbsLongShow={true}
        addMaterial={constructionData?.getAddMaterial()}
        matId={constructionData?.getMaterial()}
        materialSelect={onSelectMaterial}
      />
    ),
  };

  return <PanelStack screens={screens} />;
};

export default SelectedPlinth;
