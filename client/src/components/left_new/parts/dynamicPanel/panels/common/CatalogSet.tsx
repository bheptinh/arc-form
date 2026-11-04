import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  controlPanelHistoryAdd,
  controlPanelUpdateBreadCrumbs,
  selectActiveControlPanelModeData,
  selectDynamicPanelCatalogPreviewViewType,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { ActionList } from '../../../../../../shared-components/ActionList';
import Navigation from '../../navigation/Navigation';
import CatalogScreen from './CatalogScreen';

const CatalogSet = (props) => {
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const lastHistoryElemData = lastHistoryElem?.data;
  const currentParentId = lastHistoryElem?.id;

  const dynamicPanelCatalogPreviewViewType = useSelector(selectDynamicPanelCatalogPreviewViewType);

  const arrayList = [];

  const [catalogArray, setCatalogArray] = useState(null);

  const dispatch = useDispatch();

  const catalogClick = (data) => {
    const dataObj = {
      id: data.id,
      parentId: currentParentId ? currentParentId : null,
      name: data.text,
      added: true,
    };
    if (data.type == 'materials') {
      dataObj.type = 'catalogMaterialsSets';
      dataObj.data = data.materials;
    } else {
      dataObj.type = 'catalogSets';
      dataObj.data = data.children;
    }

    dispatch(controlPanelHistoryAdd(dataObj));
    dispatch(controlPanelUpdateBreadCrumbs({ data: dataObj, updateType: 'add' }));
  };

  useEffect(() => {
    if (lastHistoryElemData) {
      lastHistoryElemData.forEach((i) => {
        arrayList.push(
          <ActionList.Item
            key={i.id}
            icon={<img src={R2D.URL.DOMAIN + i.icon} alt="" />}
            label={i.text}
            onClick={() => catalogClick(i)}
          />
        );
      });
      setCatalogArray(arrayList);
    }
  }, [lastHistoryElemData]);

  return (
    <CatalogScreen
      header={
        <Navigation
          hideBreadCrumbsHomePanel={props.hideBreadCrumbsHomePanel}
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
      <ActionList size={dynamicPanelCatalogPreviewViewType}>{catalogArray}</ActionList>
    </CatalogScreen>
  );
};

export default CatalogSet;
