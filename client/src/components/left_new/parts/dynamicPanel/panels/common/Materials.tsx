import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../../../../../initR2D';
import {
  selectActiveControlPanelModeData,
  selectDynamicPanelPreviewViewType,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import { TileGrid } from '../../../../../../shared-components/TileGrid';
import SelectTile from '../../../../../../smart-components/catalog/select-tile';
import type { Product } from '../../../../../../smart-components/catalog/tile-parts';
import { useMaterialSelect } from '../../../../../../smart-components/catalog/use-material-select';
import Navigation from '../../navigation/Navigation';
import AddUploadButton from './AddUploadButton';
import CatalogScreen from './CatalogScreen';
import OwnUploads from './OwnUploads';

const Materials = (props) => {
  const dispatch = useDispatch();
  const dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];

  const { activeMaterial, setActiveMaterial, select } = useMaterialSelect(
    props.materialSelect,
    props.matId
  );
  const [lastHistoryElemData, setLastHistoryElemData] = useState<Product[] | null>(null);
  const [preloaderStatus, setPreloaderStatus] = useState(true);

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const materials = Array.isArray(lastHistoryElemData) ? lastHistoryElemData : null;
  const ownMaterials = materials?.filter((i) => i.isOwner) ?? [];
  const catalogMaterials = materials?.filter((i) => !i.isOwner) ?? [];
  const showUploadButton = lastHistoryElem.privateMaterialType && !isCurrDeviceAPhone;

  const onCustomMatAddMouseUp = () =>
    dispatch(setActivePopup({ name: 'uploadCustomMaterialPopup' }));

  const updateMaterialsEvent = () =>
    setActiveMaterial(R2D.scene.currentConstructorElementData.getMaterial());

  const onProductsUpdated = async () => {
    setPreloaderStatus(true);
    const loadedData = await planner.scene.categoryDataLoad(
      lastHistoryElem.urlList,
      R2D.controller.getCountry()
    );
    setLastHistoryElemData(loadedData);
    setPreloaderStatus(false);
  };

  useEffect(() => {
    planner.scene.addEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
    planner.scene.addEventListener(planner.scene.PRODUCTS_UPDATED, onProductsUpdated);
    return () => {
      planner.scene.removeEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
      planner.scene.removeEventListener(planner.scene.PRODUCTS_UPDATED, onProductsUpdated);
    };
  }, []);

  useEffect(() => {
    planner.scene
      .categoryDataLoad(lastHistoryElem.urlList, R2D.controller.getCountry())
      .then((loadedData: Product[]) => setLastHistoryElemData(loadedData));
  }, [lastHistoryElem.urlList]);

  const tile = (i: Product) => (
    <SelectTile
      key={i.id}
      product={i}
      active={activeMaterial == i.id}
      onSelect={() => select(i.id)}
    />
  );

  return (
    <CatalogScreen
      header={
        <Navigation
          panelPreviewIcon={props.panelPreviewIcon}
          hideCategoryTree={props.hideCategoryTree}
          breadcrumsTitle={props.breadcrumsTitle}
          isAddSettingsDisabled={props.isAddSettingsDisabled}
          closeButtonStatus={props.closeButtonStatus}
          isHomeDisabled={props.isHomeDisabled}
          breadCrumbsLongShow={props.breadCrumbsLongShow}
        />
      }
      isLoading={!materials && preloaderStatus}
    >
      <TileGrid size={dynamicPanelPreviewViewType}>
        {ownMaterials.length > 0 ? (
          <OwnUploads onAdd={showUploadButton ? onCustomMatAddMouseUp : undefined}>
            {ownMaterials.map(tile)}
          </OwnUploads>
        ) : showUploadButton ? (
          <AddUploadButton onMouseUp={onCustomMatAddMouseUp} />
        ) : null}
        {catalogMaterials.map(tile)}
      </TileGrid>
    </CatalogScreen>
  );
};

export default Materials;
