import { IconPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { planner } from '../../../../../../initR2D';
import { selectDynamicPanelPreviewViewType } from '../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import { TileGrid } from '../../../../../../shared-components/TileGrid';
import CatalogTile from '../../../../../../smart-components/catalog/catalog-tile';
import type { Product } from '../../../../../../smart-components/catalog/tile-parts';
import CatalogScreen from '../common/CatalogScreen';
import classes from './UserUpload.module.css';

const Main = () => {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);

  // The engine's cached uploads show straight away; the request below refreshes them.
  const [userUploadList, setUserUploadList] = useState<Product[]>(planner.getUserUpload());
  const [preloaderStatus, setPreloaderStatus] = useState(!userUploadList?.length);

  const onProductsUpdated = () => setUserUploadList(planner.getUserUpload());

  const onCustomModelAddMouseUp = () => dispatch(setActivePopup({ name: 'uploadChoicePopup' }));

  useEffect(() => {
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
    <CatalogScreen
      header={
        <CatalogScreen.Header
          icon="/src_designer/images/icon_upload.svg"
          title={translation['MY_UPLOUDS_TITLE']}
        />
      }
      isLoading={preloaderStatus}
    >
      {userUploadList ? (
        <TileGrid size={dynamicPanelPreviewViewType}>
          <div
            className={classes.addButton}
            onMouseUp={onCustomModelAddMouseUp}
            onClick={planner.toCenter}
          >
            <IconPlus size={25} color="#2a3435" className={classes.addIcon} />
            {translation['TIPS_ADD_NEW_MODEL']}
          </div>

          {Array.isArray(userUploadList)
            ? userUploadList.map((elem) => <CatalogTile key={elem.id} product={elem} />)
            : null}
        </TileGrid>
      ) : null}
    </CatalogScreen>
  );
};

export default Main;
