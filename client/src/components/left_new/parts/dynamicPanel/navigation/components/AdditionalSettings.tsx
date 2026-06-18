import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import {
  selectActiveControlPanelModeData,
  selectCategoryTreePanelStatus,
  selectDynamicPanelCatalogPreviewViewType,
  selectDynamicPanelPreviewViewType,
  updateCategoryTreePanelStatus,
  updateDynamicPanelCatalogPreviewViewType,
  updateDynamicPanelPreviewViewType,
} from '../../../../../../redux/features/control/controlPanelSlice';
import ProductPreviewControls from './ProductPreviewControls';

const useStyle = createUseStyles({
  catalog_top_btn_filter: {
    marginLeft: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover line': {
      fill: '#a0a0a0',
      stroke: '#a0a0a0',
    },
    '&:hover circle': {
      fill: '#a0a0a0',
      stroke: '#a0a0a0',
    },
  },
  catalog_top_btn_filter_hover: {
    '& svg': {
      stroke: '#a0a0a0',
    },
  },
  icon_filter: {
    cursor: 'pointer',
    position: 'relative',
    zIndex: 2,
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
  },
});

const AdditionalSettings = ({ hideCategoryTree }) => {
  const dispatch = useDispatch();

  const dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);
  const dynamicPanelCatalogPreviewViewType = useSelector(selectDynamicPanelCatalogPreviewViewType);
  const categoryTreePanelStatus = useSelector(selectCategoryTreePanelStatus);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = activeControlPanelData?.history;
  const lastHistoryElem =
    controlPanelModeHistory && controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const lastHistoryElemType = lastHistoryElem?.type;

  const classes = useStyle();
  const [previewImage, setPreviewImage] = useState('');
  const [previewImageCategory, setPreviewImageCategory] = useState(
    '/src_designer/images/icon_preview_catalog_big.svg'
  );
  const [dynamicPanelPreviewText, setDynamicPanelPreviewText] = useState('');
  const [dynamicPanelCatalogPreviewText, setDynamicPanelCatalogPreviewText] = useState('');

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const onChangeProductsPreviewView = (view, imgSrc) => {
    if (lastHistoryElemType == 'catalog' || lastHistoryElemType == 'catalogSets') {
      if (dynamicPanelCatalogPreviewViewType !== view) {
        dispatch(updateDynamicPanelCatalogPreviewViewType(view));
        setPreviewImageCategory(imgSrc);
      }
    } else {
      if (dynamicPanelPreviewViewType !== view) {
        dispatch(updateDynamicPanelPreviewViewType(view));
        setPreviewImage(imgSrc);
      }
    }
  };

  const onUpdateCategoryTreePanelStatus = (e) => {
    dispatch(updateCategoryTreePanelStatus(!categoryTreePanelStatus));
    setIsFilterOpen(!isFilterOpen);
  };

  const handleMouseEnter = () => setIsFilterOpen(!isFilterOpen);

  useEffect(() => {
    const imageMap = {
      small: '/src_designer/images/icon_preview_small.svg',
      medium: '/src_designer/images/icon_preview_medium.svg',
      big: '/src_designer/images/icon_preview_big.svg',
    };

    setPreviewImage(imageMap[dynamicPanelPreviewViewType] || imageMap['medium']);

    const previewProductsText = {
      small: 'PREVIEW_SMALL_TEXT',
      medium: 'PREVIEW_MEDIUM_TEXT',
      big: 'PREVIEW_BIG_TEXT',
    };

    setDynamicPanelPreviewText(
      previewProductsText[dynamicPanelPreviewViewType] || 'PREVIEW_MEDIUM_TEXT'
    );
  }, [dynamicPanelPreviewViewType]);

  useEffect(() => {
    const imageMapCategory = {
      small: '/src_designer/images/icon_preview_catalog_small.svg',
      medium: '/src_designer/images/icon_preview_catalog_medium.svg',
      big: '/src_designer/images/icon_preview_catalog_big.svg',
    };

    setPreviewImageCategory(
      imageMapCategory[dynamicPanelCatalogPreviewViewType] || imageMapCategory['big']
    );

    const previewCategoryText = {
      small: 'PREVIEW_SMALL_CATEGORY_TEXT',
      medium: 'PREVIEW_MEDIUM_CATEGORY_TEXT',
      big: 'PREVIEW_BIG_CATEGORY_TEXT',
    };

    setDynamicPanelCatalogPreviewText(
      previewCategoryText[dynamicPanelCatalogPreviewViewType] || 'PREVIEW_BIG_CATEGORY_TEXT'
    );
  }, [dynamicPanelCatalogPreviewViewType]);

  return (
    <div
      className={
        classes.catalog_top_btn_filter +
        ' ' +
        (isFilterOpen ? classes.catalog_top_btn_filter_hover : '')
      }
    >
      <IconAdjustmentsHorizontal
        size={16}
        color="#2A3435"
        className={classes.icon_filter}
        onClick={handleMouseEnter}
      />

      <ProductPreviewControls
        hideCategoryTree={hideCategoryTree}
        onUpdateCategoryTreePanelStatus={onUpdateCategoryTreePanelStatus}
        categoryTreePanelStatus={categoryTreePanelStatus}
        previewImage={previewImage}
        previewImageCategory={previewImageCategory}
        dynamicPanelPreviewText={dynamicPanelPreviewText}
        dynamicPanelCatalogPreviewText={dynamicPanelCatalogPreviewText}
        dynamicPanelPreviewViewType={dynamicPanelPreviewViewType}
        dynamicPanelCatalogPreviewViewType={dynamicPanelCatalogPreviewViewType}
        onChangeProductsPreviewView={onChangeProductsPreviewView}
        isFilterOpen={isFilterOpen}
      />
    </div>
  );
};

export default AdditionalSettings;
