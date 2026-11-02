import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import {
  controlPanelHistoryAdd,
  controlPanelUpdateBreadCrumbs,
  selectActiveControlPanelModeData,
  selectDynamicPanelCatalogPreviewViewType,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { ActionList } from '../../../../../../shared-components/ActionList';
import Navigation from '../../navigation/Navigation';

const useStyle = createUseStyles({
  planer_catalog_cont: {
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

const CatalogSet = (props) => {
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const lastHistoryElemData = lastHistoryElem?.data;
  const currentParentId = lastHistoryElem?.id;

  const mainDiv = useRef(null);
  const catalogMain = useRef(null);
  const dynamicPanelCatalogPreviewViewType = useSelector(selectDynamicPanelCatalogPreviewViewType);

  const arrayList = [];

  const [catalogArray, setCatalogArray] = useState(null);
  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

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

  const classes = useStyle();

  useEffect(() => {
    setStyleAnimation({ transform: 'translateX(0%)' });
  }, []);

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
    <div style={styleAnimation} ref={mainDiv} className={classes.planer_catalog_cont}>
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
      <div className={classes.catalog_wr}>
        <SimpleBar style={{ height: '100%' }} ref={catalogMain} autoHide={false} forceVisible="y">
          <ActionList size={dynamicPanelCatalogPreviewViewType}>{catalogArray}</ActionList>
        </SimpleBar>
      </div>
    </div>
  );
};

export default CatalogSet;
