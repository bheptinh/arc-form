import React, {useState, useMemo, useEffect, useRef} from 'react';
import {createUseStyles} from "react-jss";
import { useDispatch, useSelector } from 'react-redux';
import {
    selectCategoryTreePanelStatus,
    selectDynamicPanelPreviewViewType,
    selectDynamicPanelCatalogPreviewViewType,
    updateCategoryTreePanelStatus,
    updateDynamicPanelPreviewViewType,
    updateDynamicPanelCatalogPreviewViewType,
    selectActiveControlPanelModeData
} from '../../../../../../redux/features/control/controlPanelSlice';
import {selectTranslation} from "../../../../../../redux/features/language/languageSlice";

import ProductPreviewControls from "./ProductPreviewControls";

const useStyle = createUseStyles({
    catalog_top_btn_filter:{
        marginLeft: "6px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        '&:hover line':{
            fill: '#a0a0a0',
            stroke: '#a0a0a0'

        },
        '&:hover circle': {
            fill: '#a0a0a0',
            stroke: '#a0a0a0'
        }
    },
    catalog_top_btn_filter_hover:{
        '& line':{
            fill: '#a0a0a0',
            stroke: '#a0a0a0'

        },
        '& circle':{
            fill: '#a0a0a0',
            stroke: '#a0a0a0'
        }
    },
    icon_filter:{
        cursor: "pointer",
        position: "relative",
        zIndex: 2,
        '& line':{
            transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)'
        },
        '& circle':{
            transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)'
        }
    },
});

const AdditionalSettings = ({hideCategoryTree}) => {

    let dispatch = useDispatch();

    let dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);
    let dynamicPanelCatalogPreviewViewType = useSelector(selectDynamicPanelCatalogPreviewViewType);
    let categoryTreePanelStatus = useSelector(selectCategoryTreePanelStatus);
    let translation = useSelector(selectTranslation);
    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = activeControlPanelData?.history;
    let lastHistoryElem = controlPanelModeHistory && controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let lastHistoryElemType = lastHistoryElem?.type;

    const classes = useStyle();
    const [previewImage, setPreviewImage] = useState('');
    const [previewImageCategory, setPreviewImageCategory] = useState('/src_designer/images/icon_preview_catalog_big.svg');
    const [dynamicPanelPreviewText, setDynamicPanelPreviewText] = useState('');
    const [dynamicPanelCatalogPreviewText, setDynamicPanelCatalogPreviewText] = useState('');

    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const onChangeProductsPreviewView = (view, imgSrc) => {
        if(lastHistoryElemType == 'catalog' || lastHistoryElemType == 'catalogSets'){
            if (dynamicPanelCatalogPreviewViewType !== view) {
                dispatch(updateDynamicPanelCatalogPreviewViewType(view));
                setPreviewImageCategory(imgSrc);
            }
        }else{
            if (dynamicPanelPreviewViewType !== view) {
                dispatch(updateDynamicPanelPreviewViewType(view));
                setPreviewImage(imgSrc);
            }
        }
    };

    let onUpdateCategoryTreePanelStatus = e => {
        dispatch(updateCategoryTreePanelStatus(!categoryTreePanelStatus));
        setIsFilterOpen(!isFilterOpen);
    }

    const handleMouseEnter = () => setIsFilterOpen(!isFilterOpen);

    useEffect(() => {
        const imageMap = {
            small: '/src_designer/images/icon_preview_small.svg',
            medium: '/src_designer/images/icon_preview_medium.svg',
            big: '/src_designer/images/icon_preview_big.svg',
        };

        setPreviewImage(imageMap[dynamicPanelPreviewViewType] || imageMap['medium']);

        const previewProductsText = {
            small: "PREVIEW_SMALL_TEXT",
            medium: "PREVIEW_MEDIUM_TEXT",
            big: "PREVIEW_BIG_TEXT",
        };

        setDynamicPanelPreviewText(previewProductsText[dynamicPanelPreviewViewType] || "PREVIEW_MEDIUM_TEXT");
    }, [dynamicPanelPreviewViewType]);

    useEffect(() => {
        const imageMapCategory = {
            small: '/src_designer/images/icon_preview_catalog_small.svg',
            medium: '/src_designer/images/icon_preview_catalog_medium.svg',
            big: '/src_designer/images/icon_preview_catalog_big.svg',
        };

        setPreviewImageCategory(imageMapCategory[dynamicPanelCatalogPreviewViewType] || imageMapCategory['big']);

        const previewCategoryText = {
            small: "PREVIEW_SMALL_CATEGORY_TEXT",
            medium: "PREVIEW_MEDIUM_CATEGORY_TEXT",
            big: "PREVIEW_BIG_CATEGORY_TEXT",
        };

        setDynamicPanelCatalogPreviewText(previewCategoryText[dynamicPanelCatalogPreviewViewType] || "PREVIEW_BIG_CATEGORY_TEXT");
    }, [dynamicPanelCatalogPreviewViewType]);

    return (
        <div className={classes.catalog_top_btn_filter  + ' ' + (isFilterOpen ? classes.catalog_top_btn_filter_hover : '')} >

            <svg className={classes.icon_filter} width="16" height="14" viewBox="0 0 16 14" fill="none" onClick={handleMouseEnter}>
                <line x1="0.75" y1="2.25" x2="15.25" y2="2.25" stroke="#2A3435" strokeWidth="1.5" strokeLinecap="round"></line>
                <line x1="0.75" y1="7.25" x2="15.25" y2="7.25" stroke="#2A3435" strokeWidth="1.5" strokeLinecap="round"></line>
                <line x1="0.75" y1="12.25" x2="15.25" y2="12.25" stroke="#2A3435" strokeWidth="1.5" strokeLinecap="round"></line>
                <circle cx="5" cy="2" r="2" fill="#2A3435"></circle>
                <circle cx="12" cy="7" r="2" fill="#2A3435"></circle>
                <circle cx="7" cy="12" r="2" fill="#2A3435"></circle>
            </svg>

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
    )
}

export default AdditionalSettings;

