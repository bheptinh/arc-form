import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import {
  selectActiveControlPanelModeData,
  selectDynamicPanelPreviewViewType,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { TileGrid } from '../../../../../../shared-components/TileGrid';
import SelectTile from '../../../../../../smart-components/catalog/select-tile';
import type { Product } from '../../../../../../smart-components/catalog/tile-parts';
import { useMaterialSelect } from '../../../../../../smart-components/catalog/use-material-select';
import Navigation from '../../navigation/Navigation';
import CatalogScreen from './CatalogScreen';

const CatalogMaterialsSets = (props) => {
  const dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const lastHistoryElemData: Product[] | undefined = lastHistoryElem?.data;

  const { activeMaterial, select } = useMaterialSelect(props.materialSelect, props.matId);

  return (
    <CatalogScreen
      header={
        <Navigation
          hideBreadCrumbsHomePanel={props.hideBreadCrumbsHomePanel}
          disableBreadcrumbs={props.disableBreadcrumbs}
          isAddSettingsDisabled={props.isAddSettingsDisabled}
          panelPreviewIcon={props.panelPreviewIcon}
          hideCategoryTree={props.hideCategoryTree}
          breadcrumsTitle={props.breadcrumsTitle}
          isHomeDisabled={props.isHomeDisabled}
          closeButtonStatus={props.closeButtonStatus}
          breadCrumbsLongShow={props.breadCrumbsLongShow}
        />
      }
    >
      {lastHistoryElemData ? (
        <TileGrid size={dynamicPanelPreviewViewType}>
          {lastHistoryElemData.map((i) => (
            <SelectTile
              key={i.id}
              product={i}
              active={activeMaterial == i.id}
              onSelect={() => select(i.id)}
            />
          ))}
        </TileGrid>
      ) : null}
    </CatalogScreen>
  );
};

export default CatalogMaterialsSets;
