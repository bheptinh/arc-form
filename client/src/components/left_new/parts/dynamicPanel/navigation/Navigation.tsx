import { IconX } from '@tabler/icons-react';
import React, { useMemo } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../../../../api/hooks/useTranslation';
import {
  controlPanelHistoryReplaceArray,
  controlPanelUpdateBreadCrumbs,
  selectActiveControlPanelModeData,
} from '../../../../../redux/features/control/controlPanelSlice';
import AdditionalSettings from './components/AdditionalSettings';
import Breadcrumbs from './components/Breadcrumbs';
import Prev from './components/Prev';

const useStyle = createUseStyles({
  catalog_top_wr: {
    padding: '10px 10px 10px 10px',
    display: 'grid',
    gridGap: 10,
    '&:has($catalog_navigation:empty)': {
      '& $catalog_navigation': {
        display: 'none',
      },
    },
    '@media screen and (max-width: 950px)': {
      padding: '5px',
      gridGap: 5,
    },
  },
  catalog_top_btns_wr: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  catalog_navigation: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '&:empty': {
      marginTop: 0,
    },
  },
  catalog_navigation_prev_wr: {
    display: 'flex',
    alignItems: 'center',
  },
  catalog_top_title: {
    lineHeight: 0.8,
    fontSize: 17,
    fontFamily: 'RobotoCondensed-Regular',
    '& span': {
      color: '#939393',
      fontSize: '12px',
      fontFamily: 'Roboto-Regular',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 9,
    },
  },
  catalog_top_btns: {
    display: 'flex',
    position: 'relative',
    zIndex: 3,
    width: '100%',
  },
  navigation_close: {
    width: '15px',
    height: '15px',
    margin: '0 0 0 10px',
    cursor: 'pointer',
    zIndex: '2',
    '& path': {
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover': {
      '& path': {
        fill: '#a0a0a0',
      },
    },
  },
  navigation_close_icon: {
    width: '100%',
    height: '100%',
  },
});

const Navigation = (props) => {
  const dispatch = useDispatch();
  const classes = useStyle();
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const firstElemHistory = controlPanelModeHistory[0];
  const lastHistoryElemType = lastHistoryElem?.type;
  const title = lastHistoryElem?.name;
  const translation = useTranslation();

  const currentStateBreadCrumbs = activeControlPanelData?.breadCrumbs;

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const isHomeDisabled =
    !controlPanelModeHistory ||
    (lastHistoryElem &&
      firstElemHistory?.data &&
      lastHistoryElem?.data == firstElemHistory?.data) ||
    (lastHistoryElem && firstElemHistory?.type == 'main' && lastHistoryElem?.type == 'main') ||
    controlPanelModeHistory.length < 2 ||
    (lastHistoryElem &&
      firstElemHistory?.matId &&
      lastHistoryElem?.matId == firstElemHistory?.matId) ||
    props.isHomeDisabled;

  const onClickCloseButton = (e) => {
    dispatch(controlPanelHistoryReplaceArray([]));
    dispatch(
      controlPanelUpdateBreadCrumbs({ data: currentStateBreadCrumbs[0], updateType: 'add' })
    );
  };

  return (
    <div className={classes.catalog_top_wr}>
      {isHomeDisabled &&
      props.disableBreadcrumbs &&
      lastHistoryElemType != 'products' ? null : props.disableBreadcrumbs ? null : (
        <div className={classes.catalog_top_btns_wr}>
          <div className={classes.catalog_top_btns}>
            <Breadcrumbs
              hideBreadCrumbsHomePanel={props.hideBreadCrumbsHomePanel}
              panelPreviewIcon={props.panelPreviewIcon}
              breadcrumsTitle={props.breadcrumsTitle}
              onClickCloseButton={onClickCloseButton}
            />
          </div>
          {controlPanelModeHistory.length - 1 == 0 &&
          !props.isAddSettingsDisabled &&
          !isCurrDeviceAPhone ? (
            <AdditionalSettings hideCategoryTree={props.hideCategoryTree} />
          ) : null}
          {props.closeButtonStatus && (
            <div className={classes.navigation_close} onClick={onClickCloseButton}>
              <IconX size={24} color="#2F2F2F" className={classes.navigation_close_icon} />
            </div>
          )}
        </div>
      )}
      {controlPanelModeHistory.length - 1 != 0 ? (
        <div className={classes.catalog_navigation}>
          <div className={classes.catalog_navigation_prev_wr}>
            {controlPanelModeHistory.length - 1 != 0 ? <Prev /> : null}

            {title || lastHistoryElem.data?.name ? (
              <div
                className={classes.catalog_top_title}
                dangerouslySetInnerHTML={{ __html: title || lastHistoryElem.data.name }}
              ></div>
            ) : (
              lastHistoryElem?.type != 'catalogSets' && (
                <div
                  className={classes.catalog_top_title}
                  dangerouslySetInnerHTML={{
                    __html: translation[props.breadcrumsTitle] || props.breadcrumsTitle,
                  }}
                ></div>
              )
            )}
          </div>
          {controlPanelModeHistory.length - 1 != 0 &&
          !props.isAddSettingsDisabled &&
          !isCurrDeviceAPhone ? (
            <AdditionalSettings hideCategoryTree={props.hideCategoryTree} />
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default Navigation;
