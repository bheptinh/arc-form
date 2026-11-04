import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../../../../../initR2D';
import {
  controlPanelHistoryAddArray,
  controlPanelUpdateBreadCrumbs,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { selectTips } from '../../../../../../redux/features/tips/tipsSlice';
import { selectUserProfileData } from '../../../../../../redux/features/user/userSlice';
import Tip from '../../../../../tips/Tip';
import Catalog from '../common/Catalog';
import PanelStack from '../common/PanelStack';
import Products from '../common/Products';

const ReplaceModel = (props) => {
  const dispatch = useDispatch();

  const catalogProducts = planner.getCatalogProducts();

  const userProfileData = useSelector(selectUserProfileData);
  const tips = useSelector(selectTips);

  const currOS = R2D.controller.getCurrentOS();

  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';
  const panelPreviewIcon = '/src_designer/images/icon_mebli.svg';

  const historyUpdateFunctions = (historyObj) => {
    dispatch(controlPanelHistoryAddArray(historyObj));
    dispatch(controlPanelUpdateBreadCrumbs({ data: historyObj, updateType: 'addArray' }));
  };

  useEffect(() => {
    if (!R2D.scene.currentView3DObject || !R2D.scene.currentView3DObject.getProductId) return;
    let historyObj;
    if (catalogProducts && catalogProducts.length > 0) {
      const dataArray = [];
      historyObj = { id: null, addType: 'main', data: catalogProducts, type: 'catalog' };

      dataArray.push(historyObj);

      let neededIndex = 0;
      if (
        Object.values(
          typeof structuredClone !== 'undefined'
            ? structuredClone(
                R2D.Pool.getProductData(R2D.scene.currentView3DObject.getProductId())
                  .categoryProduct
              )
            : JSON.parse(
                JSON.stringify(
                  R2D.Pool.getProductData(R2D.scene.currentView3DObject.getProductId())
                    .categoryProduct
                )
              )
        ).length > 1
      ) {
        Object.values(
          typeof structuredClone !== 'undefined'
            ? structuredClone(
                R2D.Pool.getProductData(R2D.scene.currentView3DObject.getProductId())
                  .categoryProduct
              )
            : JSON.parse(
                JSON.stringify(
                  R2D.Pool.getProductData(R2D.scene.currentView3DObject.getProductId())
                    .categoryProduct
                )
              )
        ).forEach((item, index, array) => {
          Object.values(item).reduce((prevVal, currVal) => {
            const activeArray = prevVal?.find((y) => y.id == currVal.id);
            if (activeArray?.nodes) return activeArray?.nodes;
            if (activeArray?.urlList) {
              neededIndex = index;
              array.splice(1);
            }
          }, catalogProducts);
        });
      }

      Object.values(
        typeof structuredClone !== 'undefined'
          ? structuredClone(
              R2D.Pool.getProductData(R2D.scene.currentView3DObject.getProductId()).categoryProduct
            )
          : JSON.parse(
              JSON.stringify(
                R2D.Pool.getProductData(R2D.scene.currentView3DObject.getProductId())
                  .categoryProduct
              )
            )
      )
        [neededIndex].reverse()
        .reduce((prevVal, currVal, index, array) => {
          const activeArray = prevVal?.find((y) => y.id == currVal.id);
          const parentId = (array[index - 1] && array[index - 1].id) || null;
          if (activeArray) {
            if (activeArray.nodes) {
              historyObj = {
                id: activeArray?.id,
                parentId,
                data: activeArray?.nodes,
                id: activeArray?.id,
                name: activeArray?.name,
                type: 'catalog',
              };
              dataArray.push(historyObj);
              return activeArray?.nodes;
            } else {
              historyObj = {
                type: 'products',
                parentId,
                urlList:
                  activeArray?.urlList.replace(
                    '/api/category/products',
                    R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')
                  ) + '&category_type=2',
                privateMaterialType: activeArray?.privateMaterialType,
                id: activeArray?.id,
                name: activeArray?.name,
                data: null,
              };
              dataArray.push(historyObj);
            }
          } else array.splice(1);
        }, catalogProducts);

      historyUpdateFunctions(dataArray);
    }
  }, []);

  const screens = {
    catalog: () => (
      <Catalog breadcrumsTitle={'HINT_PRODUCTS_CATALOG'} panelPreviewIcon={panelPreviewIcon} />
    ),
    products: () => (
      <Products
        breadcrumsTitle={'HINT_PRODUCTS_CATALOG'}
        panelPreviewIcon={panelPreviewIcon}
        type={'replace'}
      />
    ),
  };

  return (
    <PanelStack screens={screens} changesOn="id">
      {userProfileData.tips &&
      userProfileData.tips != 0 &&
      !tips.replaceModel.showed &&
      !isCurrDeviceAPhone ? (
        <Tip
          name={'replaceModel'}
          showTime={1000}
          arrow={{ position: 'top', direction: 'left' }}
          text={'TUT_REPLACE'}
          position={{ x: 'calc(100%)', y: 185, from: 'left' }}
        />
      ) : null}
    </PanelStack>
  );
};

export default ReplaceModel;
