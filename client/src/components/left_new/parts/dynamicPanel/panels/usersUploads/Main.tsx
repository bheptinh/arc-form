import 'simplebar-react/dist/simplebar.min.css';

import { IconPlus } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { planner } from '../../../../../../initR2D';
import {
  selectActiveControlPanelModeData,
  selectDynamicPanelPreviewViewType,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import { TileGrid } from '../../../../../../shared-components/TileGrid';
import CatalogTile from '../../../../../../smart-components/catalog/catalog-tile';
import type { Product } from '../../../../../../smart-components/catalog/tile-parts';
import AdditionalSettings from '../../navigation/components/AdditionalSettings';

const useStyle = createUseStyles({
  planner_catalog_cont: {
    borderRight: '1px solid var(--color-border-light)',
    background: 'var(--color-white)',
    height: '100%',
    display: 'grid',
    alignContent: 'baseline',
    gridTemplateRows: 'auto 1fr',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
    width: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  catalog_top_wr: {
    padding: '10px 10px 10px 10px',
    '@media screen and (max-width: 950px)': {
      padding: 5,
    },
  },
  catalog_top_btns_wr: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  uploadsTitleWr: {
    display: 'flex',
    alignItems: 'center',
  },
  uploadsTitle: {
    fontSize: 17,
    color: 'var(--color-text)',
    fontFamily: 'RobotoCondensed-Regular',
    marginLeft: 3,
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  catalog_top_selected_preview: {
    width: '17px',
    height: '16px',
    position: 'relative',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    flexShrink: 0,
    '& img': {
      top: '50%',
      left: '0',
      position: 'absolute',
      maxWidth: '100%',
      height: 'auto',
      transform: 'translateY(-50%)',
    },
    '@media screen and (max-width: 950px)': {
      height: 14,
      width: 11,
    },
  },
  catalog_wr: {
    overflow: 'hidden',
    height: '100%',
    background: 'var(--color-white)',
    borderTop: '1px solid var(--color-border)',
  },
  preloaderBlock: {
    background: 'rgba(0, 0, 0, .2)',
    zIndex: 9,
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
  },

  prod_item_upload_btn: {
    width: '100%',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 15px',
    fontSize: '16px',
    cursor: 'pointer',
    background: 'var(--color-white)',
    position: 'relative',
    borderBottom: '1px solid var(--color-border)',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    fontFamily: 'RobotoCondensed-Regular',
    zIndex: 1,
    '&:after': {
      top: '0',
      left: '0',
      width: '100%',
      height: '29px',
      content: '""',
      zIndex: -1,
      position: 'absolute',
      background: 'linear-gradient(to bottom, var(--color-surface-subtle), transparent)',
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      background: 'var(--color-accent-soft)',
      '&:after': {
        opacity: 0,
      },
    },
    '@media screen and (max-width: 950px)': {
      height: 25,
      fontSize: '10px',
    },
  },
  prod_item_upload_btn_img: {
    userSelect: 'none',
    userDrag: 'none',
    marginRight: 16,
    '@media screen and (max-width: 950px)': {
      width: 13,
      height: 13,
    },
  },
});

const Main = () => {
  const dispatch = useDispatch();
  const translation = useTranslation();

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);

  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

  // The engine's cached uploads show straight away; the request below refreshes them.
  const [userUploadList, setUserUploadList] = useState<Product[]>(planner.getUserUpload());
  const [preloaderStatus, setPreloaderStatus] = useState(!userUploadList?.length);

  const classes = useStyle();

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const onProductsUpdated = () => setUserUploadList(planner.getUserUpload());

  const onCustomModelAddMouseUp = () => dispatch(setActivePopup({ name: 'uploadChoicePopup' }));

  useEffect(() => {
    setStyleAnimation({ transform: 'translateX(0%)' });

    planner.scene
      .categoryDataLoad(`${R2D.URL.DOMAIN + R2D.URL.URL_CATALOG_SEARCH}&category_tag&my=1`)
      .then((loadedData: Product) => {
        if (
          loadedData.type == 'error' ||
          loadedData?.length < 1 ||
          loadedData?.length == 0 ||
          !loadedData[0]
        ) {
          dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));
        }
        setUserUploadList(loadedData);
        setPreloaderStatus(false);
      });

    planner.scene.addEventListener(planner.scene.PRODUCTS_UPDATED, onProductsUpdated);
    return () =>
      planner.scene.removeEventListener(planner.scene.PRODUCTS_UPDATED, onProductsUpdated);
  }, []);

  return (
    <div className={classes.planner_catalog_cont} style={styleAnimation}>
      <div className={classes.catalog_top_wr}>
        <div className={classes.catalog_top_btns_wr}>
          <div className={classes.uploadsTitleWr}>
            <div className={classes.catalog_top_selected_preview}>
              <img src="/src_designer/images/icon_upload.svg" />
            </div>
            <div className={classes.uploadsTitle}>{translation['MY_UPLOUDS_TITLE']}</div>
          </div>
          {!isCurrDeviceAPhone ? <AdditionalSettings hideCategoryTree={true} /> : null}
        </div>
      </div>
      <div className={classes.catalog_wr}>
        {userUploadList ? (
          <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
            <TileGrid size={dynamicPanelPreviewViewType}>
              <div
                className={classes.prod_item_upload_btn}
                onMouseUp={onCustomModelAddMouseUp}
                onClick={planner.toCenter}
              >
                <IconPlus size={25} color="#2a3435" className={classes.prod_item_upload_btn_img} />
                {translation['TIPS_ADD_NEW_MODEL']}
              </div>

              {Array.isArray(userUploadList)
                ? userUploadList.map((elem) => <CatalogTile key={elem.id} product={elem} />)
                : null}
            </TileGrid>
          </SimpleBar>
        ) : null}
      </div>
      <div
        className={classes.preloaderBlock}
        style={preloaderStatus ? { opacity: 1 } : { opacity: 0, zIndex: -1 }}
      >
        <div className={'preloader-cube'}></div>
      </div>
    </div>
  );
};

export default Main;
