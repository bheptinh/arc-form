import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  controlPanelHistoryAdd,
  controlPanelHistoryScrollSave,
  controlPanelUpdateBreadCrumbs,
  selectActiveControlPanelModeData,
  selectDynamicPanelCatalogPreviewViewType,
  updateDynamicPanelCatalogPreviewViewType,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { ActionList } from '../../../../../../shared-components/ActionList';
import Navigation from '../../navigation/Navigation';
import CatalogScreen from './CatalogScreen';

const Catalog = (props) => {
  const dispatch = useDispatch();
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const dynamicPanelCatalogPreviewViewType = useSelector(selectDynamicPanelCatalogPreviewViewType);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const lastHistoryElemData = lastHistoryElem?.data;
  const currentParentId = lastHistoryElem?.id;

  const [catalogArray, setCatalogArray] = useState([]);
  const [savedScroll, setSavedScroll] = useState(lastHistoryElem?.lastSavedScroll);

  const catalogMain = useRef(null);
  let scrollTimer = -1;

  const onScroll = (e) => {
    if (scrollTimer != -1) clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => scrollFinished(), 1000);
  };

  const scrollFinished = () => {
    dispatch(
      controlPanelHistoryScrollSave(
        catalogMain.current.getScrollElement().scrollTop
          ? catalogMain.current.getScrollElement().scrollTop
          : 0
      )
    );
    setSavedScroll(
      catalogMain.current.getScrollElement().scrollTop
        ? catalogMain.current.getScrollElement().scrollTop
        : 0
    );
  };

  const catalogClick = (data) => {
    if (!data.urlList && !data.nodes) return;
    const dataObj = {
      name: data.name,
      id: data.id,
      privateMaterialType: data.privateMaterialType,
      parentId: currentParentId ? currentParentId : null,
      data: null,
      lastSavedScroll: 0,
      tags: data.tags,
    };
    if (data.type == 'product' && data.privateMaterialType != 6) {
      const urlList = data.urlList;
      // Material pickers list a leaf category with their Materials grid; catalogs with Products.
      dataObj.type = props.leafType ?? 'products';
      dataObj.urlList = ~urlList.search(/materialsByCategory/)
        ? urlList.replace(
            '/api/category/materialsByCategory',
            R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')
          ) + '&category_type=1'
        : urlList.replace(
            '/api/category/products',
            R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')
          );
    } else if (data.type == 'colorpicker') {
      dataObj.type = 'colorpicker';
      const urlList = data.urlList;
      dataObj.urlList = ~urlList.search(/materialsByCategory/)
        ? urlList.replace(
            '/api/category/materialsByCategory',
            R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')
          ) + '&category_type=1'
        : urlList.replace(
            '/api/category/products',
            R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')
          );
    } else {
      dataObj.type = 'catalog';
      dataObj.data = data.nodes;
    }
    dispatch(controlPanelHistoryAdd(dataObj));
    dispatch(controlPanelUpdateBreadCrumbs({ data: dataObj, updateType: 'add' }));
  };

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  useEffect(() => {
    if (isCurrDeviceAPhone) {
      dispatch(updateDynamicPanelCatalogPreviewViewType('small'));
    }
  }, []);

  useEffect(() => {
    if (catalogMain.current && catalogMain.current.getScrollElement) {
      const scrollElemMain = catalogMain.current.getScrollElement();
      setTimeout(() => (scrollElemMain.scrollTop = savedScroll), 0);
      scrollElemMain.addEventListener('scroll', onScroll);
    }
  }, [catalogMain]);

  useEffect(() => {
    const arrayList = [];
    lastHistoryElemData &&
      lastHistoryElemData.length &&
      lastHistoryElemData.forEach((i) => {
        arrayList.push(
          <ActionList.Item
            key={i.id}
            icon={<img src={R2D.URL.DOMAIN + i.icon} alt="" />}
            label={<span dangerouslySetInnerHTML={{ __html: i.name }} />}
            onClick={() => catalogClick(i)}
          />
        );
      });
    setCatalogArray(arrayList);
  }, [lastHistoryElemData]);

  return (
    <CatalogScreen
      header={
        <Navigation
          panelPreviewIcon={props.panelPreviewIcon}
          breadcrumsTitle={props.breadcrumsTitle}
        />
      }
      scrollRef={catalogMain}
    >
      <ActionList size={dynamicPanelCatalogPreviewViewType}>{catalogArray}</ActionList>
    </CatalogScreen>
  );
};

export default Catalog;
