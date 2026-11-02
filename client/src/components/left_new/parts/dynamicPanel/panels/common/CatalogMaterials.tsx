import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import {
  controlPanelHistoryAdd,
  controlPanelHistoryScrollSave,
  controlPanelUpdateBreadCrumbs,
  selectActiveControlPanelModeData,
  selectDynamicPanelCatalogPreviewViewType,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { ActionList } from '../../../../../../shared-components/ActionList';
import Navigation from '../../navigation/Navigation';

const useStyle = createUseStyles({
  planner_catalog_cont: {
    borderRight: '1px solid var(--color-border-light)',
    background: 'var(--color-white)',
    height: '100%',
    display: 'grid',
    alignContent: 'baseline',
    gridTemplateRows: 'auto 1fr',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
    width: 309,
    position: 'absolute',
    left: 0,
    top: 0,
    '@media screen and (max-width: 950px)': {
      width: 189,
    },
  },
  catalog_wr: {
    overflow: 'hidden',
    height: '100%',
    position: 'relative',
    background: 'var(--color-white)',
    borderTop: '1px solid var(--color-border)',
  },
});

const Catalog = (props) => {
  const dispatch = useDispatch();
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const dynamicPanelCatalogPreviewViewType = useSelector(selectDynamicPanelCatalogPreviewViewType);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const lastHistoryElemData = lastHistoryElem?.data;
  const currentParentId = lastHistoryElem?.id;

  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );
  const [catalogArray, setCatalogArray] = useState([]);
  const [savedScroll, setSavedScroll] = useState(lastHistoryElem?.lastSavedScroll);

  const classes = useStyle();

  const mainDiv = useRef(null);
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
    };
    if (data.type == 'product' && data.privateMaterialType != 6) {
      dataObj.type = 'materials';
      const urlList = data.urlList;
      dataObj.urlList =
        urlList.replace(
          '/api/category/materialsByCategory',
          R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')
        ) + '&category_type=1';
    } else if (data.type == 'colorpicker') {
      dataObj.type = 'colorpicker';
      const urlList = data.urlList;
      dataObj.urlList =
        urlList.replace(
          '/api/category/materialsByCategory',
          R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')
        ) + '&category_type=1';
    } else {
      dataObj.type = 'catalog';
      dataObj.data = data.nodes;
    }
    dispatch(controlPanelHistoryAdd(dataObj));
    dispatch(controlPanelUpdateBreadCrumbs({ data: dataObj, updateType: 'add' }));
  };

  useEffect(() => {
    setStyleAnimation({ transform: 'translateX(0%)' });
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
    <div style={styleAnimation} ref={mainDiv} className={classes.planner_catalog_cont}>
      <Navigation
        isAddSettingsDisabled={props.isAddSettingsDisabled}
        panelPreviewIcon={props.panelPreviewIcon}
        hideCategoryTree={props.hideCategoryTree}
        breadcrumsTitle={props.breadcrumsTitle}
        isHomeDisabled={props.isHomeDisabled}
        closeButtonStatus={props.closeButtonStatus}
        breadCrumbsLongShow={props.breadCrumbsLongShow}
      />
      <div className={classes.catalog_wr}>
        <SimpleBar style={{ height: '100%' }} ref={catalogMain} autoHide={false} forceVisible="y">
          <ActionList size={dynamicPanelCatalogPreviewViewType}>{catalogArray}</ActionList>
        </SimpleBar>
      </div>
    </div>
  );
};

export default Catalog;
