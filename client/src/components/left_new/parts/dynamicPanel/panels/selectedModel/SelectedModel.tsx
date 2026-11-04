import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../../../../../initR2D';
import { selectActiveControlPanelModeData } from '../../../../../../redux/features/control/controlPanelSlice';
import {
  removeQuickPanel,
  selectQuickPanels,
  showQuickPanel,
} from '../../../../../../redux/features/quickPanels/quickPanelsSlice';
import { changeUndoRedo } from '../../../../../../redux/features/topPanel/topPanelSlice';
import Catalog from '../common/Catalog';
import CatalogMaterialsSets from '../common/CatalogMaterialsSets';
import CatalogSet from '../common/CatalogSet';
import ColorPicker from '../common/ColorPicker';
import LogoEditor from '../common/LogoEditor';
import Materials from '../common/Materials';
import PanelStack from '../common/PanelStack';
import Main from './Main';

const SelectedModel = () => {
  const dispatch = useDispatch();

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = activeControlPanelData.history;
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const lastHistoryElemType = lastHistoryElem?.type;

  const quickPanels = useSelector(selectQuickPanels);

  const [activeIndex, setActiveIndex] = useState(null);

  const view3dObject = R2D.scene.currentView3DObject;
  const sceneObject = view3dObject?.sceneObject;

  const onLightColorSelect = (color) => view3dObject.lightViewer.setLightColor(color);

  const onMaterialSelect = (id, addMaterial = '') => {
    if (!view3dObject || !sceneObject) return;
    sceneObject.setMaterialAt && sceneObject.setMaterialAt(activeIndex, id);
    sceneObject.setAddMaterialAt && sceneObject.setAddMaterialAt(activeIndex, addMaterial);
    sceneObject.update && sceneObject.update();
    R2D.scene.history.saveState();
    dispatch(changeUndoRedo());
    planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
  };

  const onClickPreview = (index) => setActiveIndex(index);

  const currObj = view3dObject || R2D.scene.prevSelectedView3DObject;
  const currSceneObj = useMemo(() => currObj?.sceneObject, []);
  const panelPreviewIcon = currSceneObj
    ? R2D.URL.DOMAIN + currSceneObj.getObjectData().source.images.preview
    : '';

  // the selected slot's material, read when its screen opens
  const getPreviewMaterial = () => planner.scene.getCurrentModelMaterials()?.[activeIndex];

  const screens = {
    main: () => (
      <Main
        isLightOn={view3dObject?.lightViewer?.getIsEnabled()}
        previewMaterialsId={planner.scene.getCurrentModelMaterials()}
        onClickPreview={onClickPreview}
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
    materials: () => {
      const material = getPreviewMaterial();
      return material ? (
        <Materials
          breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
          panelPreviewIcon={panelPreviewIcon}
          hideCategoryTree={true}
          closeButtonStatus={true}
          isHomeDisabled={true}
          materialSelect={onMaterialSelect}
          matId={material.matId}
          breadCrumbsLongShow={true}
        />
      ) : null;
    },
    colorpickerLight: () => (
      <ColorPicker
        panelPreviewIcon={panelPreviewIcon}
        breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
        isAddSettingsDisabled={true}
        isForLightObjects={true}
        onlyColor={true}
        matId={view3dObject.lightViewer?.getLightColorHEX()}
        materialSelect={onLightColorSelect}
        lightPowerValue={
          (view3dObject.lightViewer?.getLightPower() ?? 0) > 100
            ? 100
            : (view3dObject.lightViewer?.getLightPower() ?? 0)
        }
      />
    ),
    colorpicker: () => {
      const material = getPreviewMaterial();
      return material ? (
        <ColorPicker
          panelPreviewIcon={panelPreviewIcon}
          breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
          isAddSettingsDisabled={true}
          closeButtonStatus={true}
          isHomeDisabled={true}
          breadCrumbsLongShow={true}
          addMaterial={material.addMaterial}
          matId={material.matId}
          materialSelect={onMaterialSelect}
        />
      ) : null;
    },
    catalogSets: () => (
      <CatalogSet
        breadCrumbsLongShow={true}
        hideBreadCrumbsHomePanel={true}
        closeButtonStatus={true}
        isHomeDisabled={true}
        hideCategoryTree={true}
        breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
        panelPreviewIcon={panelPreviewIcon}
      />
    ),
    catalogMaterialsSets: () => {
      const material = getPreviewMaterial();
      return (
        <CatalogMaterialsSets
          panelPreviewIcon={panelPreviewIcon}
          hideCategoryTree={true}
          closeButtonStatus={true}
          isHomeDisabled={true}
          hideBreadCrumbsHomePanel={true}
          breadCrumbsLongShow={true}
          materialSelect={onMaterialSelect}
          matId={material.matId}
        />
      );
    },
    logoEditor: () => <LogoEditor closeButtonStatus={true} />,
  };

  useEffect(() => {
    if (lastHistoryElemType) {
      if (lastHistoryElemType != 'logoEditor' && quickPanels.helper_logo_mesh?.status) {
        dispatch(
          showQuickPanel({
            name: 'helper_model',
            position: {
              x: quickPanels.helper_logo_mesh.position.x,
              y: quickPanels.helper_logo_mesh.position.y,
            },
          })
        );
        dispatch(removeQuickPanel({ name: 'helper_logo_mesh' }));
      }
    }
  }, [controlPanelModeHistory.length]);

  return <PanelStack screens={screens} />;
};

export default SelectedModel;
