import React, {useEffect, useMemo, useState} from 'react';
import {createUseStyles} from "react-jss";
import ReactDOM from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
    selectActiveControlPanelModeData,
    selectDynamicPanelStatus
} from '../../../../../../redux/features/control/controlPanelSlice';
import {selectTranslation} from "../../../../../../redux/features/language/languageSlice";

const useStyle = createUseStyles({
    icon_filter:{
        cursor: "pointer",
        position: "relative",
        zIndex: 2,
        display: 'block',
        pointerEvents: 'none',
        '& line':{
            transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)'
        },
        '& circle':{
            transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)'
        }
    },
    fil_wrap:{
        position: "absolute",
        top: "0",
        left: "calc(100%)",
        overflow: "hidden",
        height: "100vh",
        pointerEvents: "none",
        width: "calc(100vw - 308px)",
        zIndex: 1,
    },
    fil_wrap_open:{
        '& $fil_wr':{
            transform: "translateX(0%)",
        }
    },
    fil_wr:{
        background: "#fff",
        display: "inline-block",
        minWidth: "calc(262px + 6px)",
        borderRadius: "3px",
        padding: "7px 0",
        boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.15)",
        transform: "translateX(-103%)",
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
        pointerEvents: "all"
    },

    fil_option:{
        '&:hover $fil_second_wr':{
            transform: 'translateX(0%)'
        },
        '&:hover $fil_second_wrap':{
            pointerEvents: 'auto'
        },
        '&:hover $fil_item':{
            background: '#E9E9E9'
        }
    },
    fil_item:{
        alignItems: "center",
        padding: "10px 15px",
        fontSize: "12px",
        display: "grid",
        gridTemplateColumns: "11px auto 24px",
        gridGap: "17px",
        cursor: "pointer",
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
        background: '#fff',
        position: 'relative',
        zIndex: 1,
    },
    fil_item_elem:{
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
        '&:hover:not($fil_item_elem_active)':{
            background: '#E9E9E9'
        }
    },
    fil_item_icon_wr:{
        width: "16px",
        height: "16px",
        marginRight: "17px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        '& img':{
            maxWidth: "100%",
            maxHeight: "100%"
        }
    },
    fil_icon_wr:{
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    fil_second_wrap:{
        position: "absolute",
        top: "0",
        left: "calc(100% - 3px)",
        overflow: "hidden",
        pointerEvents: "none",
        padding: '0 3px 3px 6px',
        whiteSpace: 'nowrap'
    },
    fil_second_wr:{
        background: "#fff",
        borderRadius: "3px",
        padding: "7px 0",
        boxShadow: "0 0 6px 0 rgba(0, 0, 0, 0.15)",
        transform: "translateX(-107%)",
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
        pointerEvents: "all",
        display: 'inline-block'
    },
    fil_item_second:{
        alignItems: "center",
        padding: "10px 23px 10px 15px",
        fontSize: "12px",
        display: "grid",
        gridTemplateColumns: "11px auto",
        gridGap: "17px",
        cursor: "pointer"
    },
    fil_item_elem_active:{
        background: '#B8E11F',
    },
    switch_wr:{
        position: "relative",
        display: "inline-block",
        height: "10px",
        width: "100%"
    },
    switch_slider:{
        position: "absolute",
        cursor: "pointer",
        top: "0",
        left: "0",
        right: "0",
        bottom: "0",
        backgroundColor: "#D9D9D9",
        WebkitTransition: ".4s",
        transition: ".4s",
        borderRadius: "8px",
        boxShadow: "inset 0 0 1px 0 rgba(0, 0, 0, 0.25)",
        '&:before':{
            position: "absolute",
            content: '""',
            height: "13px",
            width: "13px",
            left: "0px",
            bottom: "-1px",
            backgroundColor: "#2A3435",
            transition: ".4s",
            borderRadius: "50%"
        }

    },
    switch_wr_active:{
        '& $switch_slider:before':{
            transform: 'translateX(11px)'
        },
        '& $switch_slider':{
            background: '#B2D924'
        }
    },
});

const ProductPreviewControls = ({
                                    hideCategoryTree,
                                    onUpdateCategoryTreePanelStatus,
                                    categoryTreePanelStatus,
                                    previewImage,
                                    previewImageCategory,
                                    dynamicPanelPreviewText,
                                    dynamicPanelCatalogPreviewText,
                                    dynamicPanelPreviewViewType,
                                    dynamicPanelCatalogPreviewViewType,
                                    onChangeProductsPreviewView,
                                    isFilterOpen
                                }) => {

    const classes = useStyle();
    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = activeControlPanelData?.history;
    let lastHistoryElem = controlPanelModeHistory && controlPanelModeHistory[controlPanelModeHistory.length -1 ];
    let lastHistoryElemType = lastHistoryElem?.type;
    let translation = useSelector(selectTranslation);

    const [leftOffset, setLeftOffset] = useState(() => R2D.Viewers._instance.getOffsetWidthDueToOpenedPanels());

    useEffect(() => {
        const interval = setInterval(() => {
            const newOffset = R2D.Viewers._instance.getOffsetWidthDueToOpenedPanels();
            setLeftOffset((prevOffset) => {
                if (prevOffset !== newOffset) {
                    return newOffset;
                }
                return prevOffset;
            });
        }, 100);

        return () => clearInterval(interval);

    }, []);    

    return ReactDOM.createPortal(
        <div className={classes.fil_wrap + ' ' + (isFilterOpen ? classes.fil_wrap_open : '')} style={{ left: `${leftOffset}px` }} >
            <div className={classes.fil_wr} >
                {!hideCategoryTree && (
                    <div className={classes.fil_option}>
                        <div className={classes.fil_item} onClick={onUpdateCategoryTreePanelStatus}>
                            <div className={classes.fil_item_icon_wr}>
                                <img src="/src_designer/images/icon_derevo.svg" />
                            </div>
                            <div>{ translation['CATEGORY_TREE_TITLE'] }</div>
                            <div className={
                                categoryTreePanelStatus
                                    ? `${classes.switch_wr} ${classes.switch_wr_active}`
                                    : classes.switch_wr
                            }>
                                <span className={classes.switch_slider}></span>
                            </div>
                        </div>
                    </div>
                )}

                <div className={classes.fil_option}>
                    <div className={classes.fil_item}>
                        <div className={classes.fil_item_icon_wr}>
                            {lastHistoryElemType == 'catalog' || lastHistoryElemType == 'catalogSets' ?
                                <img src={previewImageCategory} /> :
                                <img src={previewImage} />
                            }

                        </div>
                        <div className={classes.fil_item_text}>
                            {lastHistoryElemType == 'catalog' || lastHistoryElemType == 'catalogSets' ?
                                translation[dynamicPanelCatalogPreviewText] :
                                translation[dynamicPanelPreviewText]
                            }

                        </div>
                        <div className={classes.fil_icon_wr}>
                            <img src="/src_designer/images/icon_more.svg" />
                        </div>
                    </div>
                    <div className={classes.fil_second_wrap}>
                        <div className={classes.fil_second_wr}>
                            { lastHistoryElemType == 'catalog' || lastHistoryElemType == 'catalogSets' ?
                                ["small","big"].map(size => (
                                    <div
                                        key={size}
                                        className={`${classes.fil_item_elem} ${dynamicPanelCatalogPreviewViewType === size ? classes.fil_item_elem_active : ''}`}
                                        onClick={() =>
                                            onChangeProductsPreviewView(
                                                size,
                                                `/src_designer/images/icon_preview_catalog_${size}.svg`
                                            )
                                        }
                                    >
                                        <div className={classes.fil_item_second} data-size={size}>
                                            <div className={classes.fil_item_icon_wr}>
                                                <img src={`/src_designer/images/icon_preview_catalog_${size}.svg`} />
                                            </div>
                                            <div className={classes.fil_item_text}>
                                                {translation[`PREVIEW_${size.toUpperCase()}_CATEGORY_TEXT`]}
                                            </div>
                                        </div>
                                    </div>
                                )) :
                                ["small", "medium", "big"].map(size => (
                                    <div
                                        key={size}
                                        className={`${classes.fil_item_elem} ${dynamicPanelPreviewViewType === size ? classes.fil_item_elem_active : ''}`}
                                        onClick={() =>
                                            onChangeProductsPreviewView(
                                                size,
                                                `/src_designer/images/icon_preview_${size}.svg`
                                            )
                                        }
                                    >
                                        <div className={classes.fil_item_second} data-size={size}>
                                            <div className={classes.fil_item_icon_wr}>
                                                <img src={`/src_designer/images/icon_preview_${size}.svg`} />
                                            </div>
                                            <div className={classes.fil_item_text}>
                                                {translation[`PREVIEW_${size.toUpperCase()}_TEXT`]}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProductPreviewControls;

