import React, { useState, useEffect, useRef, useMemo } from 'react';
import {createUseStyles} from "react-jss";
import { useDispatch, useSelector } from 'react-redux';
import {AnimatePresence} from "framer-motion";
import SimpleBar from 'simplebar-react';

import 'simplebar-react/dist/simplebar.min.css';

import { planner, user } from '../../../../../../initR2D';
import { selectTranslation } from '../../../../../../redux/features/language/languageSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import { selectIsLogged, selectUserProfileData, selectUserProjectActive } from '../../../../../../redux/features/user/userSlice';
import {
    selectDynamicPanelStatus,
    selectControlPanelStatus,
    selectCategoryTreePanelStatus,
    controlPanelHistoryDataUpdate,
    selectActiveControlPanelModeData,
    selectDynamicPanelPreviewViewType,
    updateAnimateFavoritesHideStatus, updateAnimateFavoritesShowStatus
} from '../../../../../../redux/features/control/controlPanelSlice';

import AdditionalSettings from "../../navigation/components/AdditionalSettings";
import FavoriteStarIcon from "../../../../../common/FavoriteStarIcon";
import MoreInfoIcon from "../../../../../common/MoreInfoIcon";
import ModalMoreInfo from "../../../../../common/ModalMoreInfo";
import Lock from '../../../../../common/Lock';
import HoverComponent from "../../../controlPanel/components/HoverComponent";

const useStyle = createUseStyles({
    '@font-face': [
        {
            fontFamily: "RobotoCondensed-Regular",
            fontWeight: 300,
            fontDisplay: 'swap',
            src: 'url("/src_designer/fonts/RobotoCondensed-Regular.ttf") format("truetype")'
        },
    ],
    planner_catalog_cont:{
        borderRight: '1px solid #cdcdcd',
        background: '#fff',
        height: '100%',
        display: "grid",
        alignContent: "baseline",
        gridTemplateRows: "auto 1fr",
        transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
        width: '100%',
        position: 'absolute',
        left: 0,
        top: 0
    },
    catalog_top_wr:{
        padding: "6px 6px 6px 6px",
        '@media screen and (max-width: 950px)':{
            padding: 5
        }
    },
    searchContainer:{
        position: "relative",
        display: "flex",
        justifyContent: "space-between",
    },
    searchInput: {
        color: "#2F2F2F",
        outline: "none",
        padding: "3px 6px",
        fontSize: "13px",
        background: "transparent",
        fontWeight: 400,
        flexGrow: 1,
        border: "1px solid #E6E6E6",
        marginRight: "5px",
        borderRadius: 3,
        '@media screen and (max-width: 950px)':{
            fontSize: "11px",
            width: 137
        }
    },
    search_btn_wr:{
        width: 36,
        height: 26,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#EFEFEF',
        border: '1px solid #E6E6E6',
        borderRadius: 3,
        cursor: 'pointer',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        '&:hover':{
            background: '#2E3839',
            '& path': {
                fill: '#fff',
            }
        }
    },
    searchBtn:{
        '& path': {
            transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        },
    },
    seach_title_wr:{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 2,
        paddingRight: 9
    },
    seach_title:{
        fontSize: 13,
        color: "#2F2F2F",
        fontFamily: "RobotoCondensed-Regular",
        '& span':{
            color: '#939393'
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 9,
        }
    },

    catalog_wr:{
        overflow: 'hidden',
        height: '100%',
        background: '#fff',
        borderTop: "1px solid #C6C4C4"
    },
    prod_elem_wrap:{
        display: 'flex',
        flexWrap: 'wrap',
        width: 'calc(100% + 1px)'
    },
    prod_item:{
        position: "relative",
        display: "grid",
        transition: "width 0.2s ease-in, height 0.2s ease-in",
        alignContent: "baseline",
        gridTemplateRows: "auto 1fr",
        height: "auto",
        width: '50%',
        borderBottom: "1px solid #E9E9E9",
        borderRight: "1px solid #E9E9E9",
        paddingBottom: "7px",
        '&:hover':{
            '& $prod_item_img_wr img':{
                transform: 'scale(1.1)'
            },
            '& $prod_item_fav_btn': {
                opacity: 1
            },
            '& $prod_item_zamok_btn': {
                opacity: 0,
                pointerEvents: 'none'
            },
            '& $prod_item_more_info':{
                zIndex: 9,
                opacity: 1
            },
            "& $prod_item_custom_delete_btn": {
                opacity: 1
            },
            '& $prod_item_hover_left':{
                height: '100%'
            },
            '& $prod_item_hover_top':{
                width: '100%'
            },
            '& $prod_item_hover_right':{
                height: '100%'
            },
            '& $prod_item_hover_bottom':{
                width: '100%'
            },
            '& $prod_item_dop_btns_wr':{
                transform: 'translateY(0%)'
            }
        },
    },
    prod_item_hover_left:{
        width: 2,
        height: 0,
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 4,
        background: '#C6C4C4',
        transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
        '&:before':{
            content: '" "',
            position: 'absolute',
            left: '100%',
            top: 2,
            height: 'calc(100% - 4px)',
            width: 1,
            background: '#fff',
        },
    },
    prod_item_hover_top:{
        width: 0,
        height: 2,
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 4,
        background: '#C6C4C4',
        transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
        '&:before':{
            content: '" "',
            position: 'absolute',
            top: '100%',
            left: 2,
            width: 'calc(100% - 4px)',
            height: 1,
            background: '#fff',
        },
    },
    prod_item_hover_right:{
        width: 2,
        height: 0,
        position: 'absolute',
        bottom: 0,
        right: 0,
        pointerEvents: 'none',
        zIndex: 4,
        background: '#C6C4C4',
        transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
        '&:before':{
            content: '" "',
            position: 'absolute',
            right: '100%',
            top: 2,
            height: 'calc(100% - 4px)',
            width: 1,
            background: '#fff',
        },
    },
    prod_item_hover_bottom:{
        width: 0,
        height: 2,
        position: 'absolute',
        bottom: 0,
        right: 0,
        pointerEvents: 'none',
        zIndex: 4,
        background: '#C6C4C4',
        transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
        '&:before':{
            content: '" "',
            position: 'absolute',
            bottom: '100%',
            left: 2,
            width: 'calc(100% - 4px)',
            height: 1,
            background: '#fff',
        },
    },
    prod_item_big:{
        width: '100%',
    },
    prod_item_medium: {
        width: '50%',
        paddingBottom: 0,
        '& $prod_item_title':{
            display: "flex",
            alignItems: "center",
            padding: '4px 6px',
            fontSize: 13,
            '@media screen and (max-width: 950px)':{
                fontSize: 11,
            }
        },
        '& $prod_item_img_wr':{
            margin: 0
        },
        '& $prod_item_fav_btn':{
            width: 18,
            height: 18
        },
        '& $prod_item_zamok_btn':{
            width: 18,
            height: 18
        },
        '& $prod_item_custom_delete_btn':{
            width: 18,
            height: 18
        },
        '& $prod_item_promocode_btn':{
            width: 18,
            height: 18
        },
        '& $prod_item_dop_btns_wr':{
            height: 27
        }
    },
    prod_item_small: {
        width: '25%',
        paddingBottom: 0,
        '& $prod_item_img_wr':{
            margin: 0
        },
        '& $prod_item_fav_btn':{
            width: 15,
            height: 15,
            '@media screen and (max-width: 950px)':{
                height: 10,
                width: 10,
                top: 2,
                left: 2
            }
        },
        '& $prod_item_zamok_btn':{
            width: 15,
            height: 15,
            '@media screen and (max-width: 950px)':{
                height: 10,
                width: 10,
                top: 2,
                left: 2
            }
        },
        '& $prod_item_custom_delete_btn':{
            width: 15,
            height: 15,
            '@media screen and (max-width: 950px)':{
                height: 10,
                width: 10,
                bottom: 2,
                right: 2
            }
        },
        '& $prod_item_promocode_btn':{
            width: 15,
            height: 15,
            '@media screen and (max-width: 950px)':{
                height: 10,
                width: 10,
                top: 2,
                right: 2
            }
        },
        '& $prod_item_more_info':{
            width: 15,
            height: 15,
            '@media screen and (max-width: 950px)':{
                height: 10,
                width: 10,
                top: 2,
                right: 2
            }
        },
        '& $prod_item_title':{
            fontSize: 12
        },
        '& $prod_item_dop_btns_wr':{
            height: 25
        },
        '& $prod_item_btn_copy':{
            width: 13,
            height: 13
        }
    },
    prod_item_img_wr:{
        overflow: "hidden",
        width: "100%",
        display: "flex",
        position: 'relative',
        justifyContent: "center",
        alignItems: "center",
        aspectRatio: "1 / 1",
        marginBottom: 7,
        '& img':{
            maxWidth: "100%",
            maxHeight: "100%",
            transition: "all .9s cubic-bezier(.19,1,.22,1)"
        }
    },
    prod_item_dop_btns_wr:{
        left: 0,
        width: "100%",
        bottom: 0,
        height: 34,
        display: "flex",
        position: "absolute",
        transform: "translateY(102%)",
        background: "rgba(68, 68, 68, 0.7)",
        transition: "all 0.9s cubic-bezier(0.19, 1, 0.22, 1)",
        alignItems: "center",
        zIndex: 3,
        pointerEvents: 'none',
        padding: '0 6px'
    },
    prod_item_btn_copy:{
        width: 16,
        cursor: "pointer",
        height: 16,
        pointerEvents: 'auto',
        '& rect':{
            transition: "all 0.9s cubic-bezier(0.19, 1, 0.22, 1)",
        },
        '&:hover':{
            '& rect':{
                fill: '#B8E11F'
            }
        }
    },
    prod_item_btn_icon:{
        width: '100%',
        height: 'auto'
    },
    prod_item_fav_btn:{
        width: "24px",
        height: "24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "50%",
        background: '#fff',
        position: 'absolute',
        top: 5,
        left: 5,
        zIndex: 3,
        opacity: 0,
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
        cursor: 'pointer',
        '& svg':{
            cursor: 'pointer',
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto"
        },
        '& path': {
            transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        },
        '&:hover':{
            '& path': {
                stroke: '#64BCF0',
                fillOpacity: 0,
                '@media screen and (max-width: 950px)':{
                    stroke: '#464646',
                    fillOpacity: 1,
                }
            }
        }
    },
    prod_item_fav_btn_active:{
        marginBottom: 1,
        '& path': {
            fill: '#64BCF0',
            stroke: '#64BCF0',
            fillOpacity: 1
        }
    },
    prod_item_zamok_btn:{
        width: "24px",
        height: "24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#fff",
        borderRadius: "50%",
        position: 'absolute',
        top: 5,
        right: 5,
        zIndex: 1,
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
        '& svg':{
            width: 18,
            height: 'auto'
        }
    },
    prod_item_custom_delete_btn:{
        bottom: "5px",
        right: "5px",
        width: "24px",
        height: "24px",
        display: "flex",
        opacity: 0,
        zIndex: 3,
        position: "absolute",
        background: "#fff",
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
        alignItems: "center",
        borderRadius: "50%",
        justifyContent: "center",
        cursor: 'pointer',
        '& path':{
            transition: "all .9s cubic-bezier(.19,1,.22,1)"
        },
        '&:hover path':{
            fill: '#AF3131'
        }
    },
    prod_item_custom_delete:{
        maxWidth: '80%',
        maxHeight: '80%'
    },
    prod_item_promocode_btn:{
        width: "24px",
        height: "24px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "50%",
        position: 'absolute',
        bottom: 5,
        right: 5,
        zIndex: 3,
        transition: "all .9s cubic-bezier(.19,1,.22,1)"
    },
    prod_item_more_info:{
        position: 'absolute',
        top: 5,
        right: 5,
        width: 18,
        height: 18,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: '50%',
        background: '#fff',
        opacity: 0,
        zIndex: -1,
        transition: "all .3s cubic-bezier(.19,1,.22,1)",
        cursor: 'pointer',
        '& path':{
            transition: "all .9s cubic-bezier(.19,1,.22,1)"
        },
    },
    item_info_color_wr:{
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        marginBottom: 15,
        '&:empty':{
            marginBottom: 0
        }
    },
    item_info_color:{
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        margin: "0 1px",
        border: '1px solid #E9E9E9'
    },
    item_info_color_more:{
        width: "18px",
        height: "18px",
        margin: "0 1px",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    prod_item_title:{
        color: "#000",
        fontSize: 16,
        padding: "0 13px 0px",
        fontFamily: "RobotoCondensed-Regular",
        overflow: 'hidden',
        '&>div':{
            display: "-webkit-box",
            WebkitLineClamp: "2",
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis"
        },
        '@media screen and (max-width: 950px)':{
            fontSize: "10px",
            padding: "0 6px 0",
        }
    },
    item_info_content:{
        color: "#7B7B7B",
        fontSize: "13px",
        padding: "0 13px 0",
        lineHeight: 1.4,
        '& span':{
            marginRight: 3
        },
        '& > div:not($item_info_not_essential_attribute)': {
            display: 'flex',
            alignItems: 'center'
        },
        '&>div>div:first-child': {
            marginBottom: '3px',
            fontFamily: "RobotoCondensed-Regular"
        },
        '& > div > div': {
            fontSize: "17px",
            color: "#000000",
            display: "inline-block",
            marginLeft: 4
        },
        '@media screen and (max-width: 950px)':{
            fontSize: "8px",
            padding: "0 6px 0",
        }
    },
    item_info_not_essential_attribute:{

    },
    item_info_content_span:{
        color: '#000'
    },
    prod_item_overlay:{
        position: 'absolute',
        left: '0',
        top: '0',
        width: '100%',
        height: '100%',
        zIndex: 2
    },

    previewSelectedObject: {
        userSelect: "none",
        position: "absolute",
        pointerEvents: "none",
        zIndex: 9
    },
    selectedTouched:{
        border: '1px solid #000',
        transition: 'all .5s ease'
    },
    hidden: {
        visibility: 'hidden'
    },

    product_hover:{
        maxHeight: 150,
        padding: "6px 20px",
        textAlign: "center",
        border: "1px solid #BEBCBC",
        position: "absolute",
        borderRadius: 3,
        display: "inline",
        zIndex: 105,
        background: "#fff",
        pointerEvents: "none",
        fontSize: 12,
        '&:after': {
            content: "''",
            position: "absolute",
            right: "100%",
            top: "50%",
            transform: 'translate(45%, -50%) rotate(135deg)',
            width: 10,
            height: 10,
            background: "#fff",
            borderRight: "1px solid #BEBCBC",
            borderBottom: "1px solid #BEBCBC"
        },
        '& p':{
            fontSize: 12
        }
    },
    product_hover_color:{
        color: "#65BCF1",
        fontSize: 15,
        letterSpacing: '.03em'
    },
    product_hover_discount:{
        maxWidth: 200,
        maxHeight: 200,
        padding: "10px 20px",
        textAlign: "center",
        border: "1px solid #000",
        position: "absolute",
        display: "inline",
        zIndex: 105,
        background: "#fff",
        pointerEvents: "none",
        '& > div':{
            display: 'flex'
        },
        '&:after': {
            content: "''",
            position: "absolute",
            right: "100%",
            top: "50%",
            transform: 'translate(45%, -50%) rotate(135deg)',
            width: 10,
            height: 10,
            background: "#fff",
            borderRight: "1px solid #000",
            borderBottom: "1px solid #000",
        },
        '& p':{
            //marginBottom: 10,
            fontSize: 12
        }
    },
    discountValueText: {
        fontWeight: 700,
        marginLeft: 2
    },
    preloaderBlock:{
        background: 'rgba(0, 0, 0, .2)',
        zIndex: 9,
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: '100%',
        transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)'
    }
});

const Main = props => {
    let dispatch = useDispatch();
    let translation = useSelector(selectTranslation);

    let isLogged = useSelector(selectIsLogged);
    let userProjectActive = useSelector(selectUserProjectActive);
    let userData = useSelector(selectUserProfileData);
    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let isAdded = lastHistoryElem?.isAdded;
    let dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);
    let categoryTreePanelStatus = useSelector(selectCategoryTreePanelStatus);
    let controlPanelStatus = useSelector(selectControlPanelStatus);
    let dynamicPanelStatus = useSelector(selectDynamicPanelStatus);
    
    let [lastHistoryElemData, setLastHistoryElemData] = useState(() => controlPanelModeHistory[controlPanelModeHistory.length - 1]?.data);
    let [styleAnimation, setStyleAnimation] = useState(isAdded ? {transform: "translateX(100%)"} : { transform: "translateX(-100%)" });
    let [searchedList, setSearchedList] = useState(lastHistoryElemData?.searchResult);
    let [searchedReactArray, setSearchedReactArray] = useState(null);
    let [searchedQuery, setSearchedQuery] = useState(lastHistoryElemData?.searchQuery);
    let [searchedResultTotal, setSearchedResultTotal] = useState(lastHistoryElemData?.searchTotal);
    let [favoritesList, setFavoritesList] = useState(user.data.favorites?.items || []);
    let [hoverImages, setHoverImages] = useState([]);
    let [loadedPreviews, setLoadedPreviews] = useState([]);
    let [preloaderStatus, setPreloaderStatus] = useState(true);

    const classes = useStyle();

    let mainDiv = useRef(null);
    let searchInput = useRef(null);
    let searchBtn = useRef(null);

    let isObjLoaded = false;
    let selectedObjId = null;
    let selectedObjPreviewUrl = null;
    let startingPointX = 0;
    let startingPointY = 0;
    let selectedObjPreviewRatio = 0;
    let previewObjOpacity = 1;
    let mouseDownOnObj = false;
    let selectedObjImgWidth = 0;
    let selectedObjImgHeight = 0;
    let timer = null;
    let previewObj = null;
    let dragTimeout = null;

    let imageSizeCreator = null;
    let borderTimeoutKey;
    let currentDraggedElem;
    let plannerCatalogElem;
    let currentProductAccessibilityStatus;
    let currentOverlayCoords;
    const panelRef = useRef(null);

    let currOS = R2D.controller.getCurrentOS();
    let isCurrDeviceAPhone = currOS == "iOS" || currOS == "Android";

    let [modalMoreInfo, setModalMoreInfo] = useState(false);
    let [productElemHover, setProductElemHover] = useState(null);

    let updateFavorites = async (id, isInFavorites, color = "") => {
        document.querySelector(".product_hover") && document.querySelector(".product_hover").remove();
        if(!isLogged) return dispatch(setActivePopup({name: "login"}));
        if(isInFavorites) {
            await user.uRemoveFromFavorites(id, color);
            setFavoritesList(prev => prev.filter(i => i?.id != id || (i.addData || "") != color));
            dispatch(updateAnimateFavoritesHideStatus(true));
            setTimeout(() =>  dispatch(updateAnimateFavoritesHideStatus(false)), 10);
        }
        else {
            let response = await user.uAddToFavorites(id, color);
            
            setFavoritesList(prev => {
                let newArray = prev;
                return [...newArray, response]
            });

            dispatch(updateAnimateFavoritesShowStatus(true));
            setTimeout(() =>  dispatch(updateAnimateFavoritesShowStatus(false)), 10);
        }
        planner.apiScene.dispatchEvent(new Event(planner.apiScene.FAVORITES_BUTTON, {}));
    }

    // Material

    let onMouseDownMaterial = (e, elem, isObjectAccessible) => {
        document.addEventListener("mouseup", onMouseUpMaterial);
        plannerCatalogElem = e.currentTarget.closest(`.${classes.prod_item}`);
        currentProductAccessibilityStatus = isObjectAccessible;
        document.addEventListener("mousemove", onMoveMaterial);
        timer = Date.now();
        currentDraggedElem = elem;
        dragTimeout = setTimeout(() => {
            plannerCatalogElem.classList.add(classes.selectedTouched)
            e.nativeEvent.button == 0 ? elem.addData ? planner.scene.dragProductFromCatalog(elem.addData, elem.id) : planner.scene.dragProductFromCatalog(elem.id) : null
            if((elem.isOwner && userData.plan == 'free' && userProjectActive.plan == 'free') || !currentProductAccessibilityStatus) R2D.mouseInteractionHelper.stateDraggingMaterial.isPlaceMaterialAllowed = false;
        }, 100);
    }

    let onMoveMaterial = e => planner.mih().state && planner.mih().state.mouseMove(e);

    let onMouseUpMaterial = e => {
        clearTimeout(dragTimeout);
        document.removeEventListener("mousemove", onMoveMaterial);
        document.removeEventListener("mouseup", onMouseUpMaterial);

        plannerCatalogElem?.classList.remove(classes.selectedTouched);

        document.querySelector(".product_hover") && document.querySelector(".product_hover").remove();

        if(Date.now() - timer > 100) {
            if(e.clientX < R2D.Viewers._instance.getOffsetWidthDueToOpenedPanels()) planner.mih().state && planner.mih().state.mouseUp(e);
            else {
                !currentProductAccessibilityStatus && dispatch(setActivePopup({name: "payPro", type: 'user'}));
            }
        }
        currentDraggedElem = null;
    }

    let mouseEnterMaterial = (event, data, isObjectAccessible) => {
        if(dynamicPanelPreviewViewType == 'small') {
            if(!isObjectAccessible) return;
            document.querySelector(".product_hover") && document.querySelector(".product_hover").remove();
            let product = event.target;
            let hoverWindow = document.createElement("div");
            hoverWindow.classList.add("product_hover");
            hoverWindow.innerHTML = data.name;
            if(data.isColorPicker) {
                let materialsName = document.createElement("p");
                materialsName.textContent = "#aaaaaa";
                materialsName.classList.add(classes.product_hover_color);
                hoverWindow.append(materialsName);
            }
            document.querySelector("body").append(hoverWindow);
            hoverWindow.style.left = (product.getBoundingClientRect().left + product.offsetWidth) + "px";
            hoverWindow.style.top = (product.getBoundingClientRect().top + ((product.offsetHeight - hoverWindow.offsetHeight) / 2)) + "px";
        }
    }

    let mouseLeaveMaterial = () => document.querySelector(".product_hover") && document.querySelector(".product_hover").remove();


    // Model
    let onMouseDownModel = (e, elem, isObjectAccessible) => {
        if(document.querySelector("." + classes.prod_elem_wrap)) document.querySelector("." + classes.prod_elem_wrap).style.touchAction = 'auto';
        if(document.querySelector("." + classes.catalog_wr)) document.querySelector("." + classes.catalog_wr).style.touchAction = 'auto';
        let id = elem.id;
        currentDraggedElem = elem;
        let previewUrl = elem.source.images.preview;
        if(mouseDownOnObj) return;
        currentOverlayCoords = e.target.getBoundingClientRect();
        currentProductAccessibilityStatus = isObjectAccessible;
        plannerCatalogElem = e.currentTarget.closest(`.${classes.prod_item}`);
        document.querySelector("." + classes.product_hover) && document.querySelector("." + classes.product_hover).remove();
        document.querySelector("." + classes.product_hover_discount) && document.querySelector("." + classes.product_hover_discount).remove();
        mouseDownOnObj = true;
        let selectedObjImg = plannerCatalogElem.querySelector("img");
        selectedObjImgWidth = selectedObjImg?.offsetWidth;
        selectedObjImgHeight = selectedObjImg?.offsetHeight;
        selectedObjPreviewRatio = 1 / ((R2D.Viewers._instance.getOffsetWidthDueToOpenedPanels()) - (currentOverlayCoords.x + currentOverlayCoords.width));
        selectedObjId = id;
        selectedObjPreviewUrl = previewUrl;
        let newXPos = e.clientX || e.touches[0].clientX;
        let newYPos = e.clientY || e.touches[0].clientY;
        startingPointX = newXPos - selectedObjImg?.getBoundingClientRect().left;
        startingPointY = newYPos - selectedObjImg?.getBoundingClientRect().top;
        document.addEventListener("mousemove", onObjectMove);
        document.addEventListener("touchmove", onObjectMove);
        document.addEventListener("mouseup", onObjectMouseUp);
        document.addEventListener("touchend", onObjectMouseUp);
        timer = Date.now();
        borderTimeoutKey = setTimeout(() => plannerCatalogElem.classList.add(classes.selectedTouched), 100);
    };

    let onObjectMove = e => {
        if(Date.now() - timer > 100) {
            if(!isObjLoaded) {
                let imgElem = document.createElement("img");
                previewObj = document.createElement("div");
                imgElem.src = R2D.URL.DOMAIN + selectedObjPreviewUrl;
                previewObj.classList.add(classes.previewSelectedObject);
                imgElem.style.width = selectedObjImgWidth + "px";
                imgElem.style.height = selectedObjImgHeight + "px";
                previewObj.append(imgElem);
                document.querySelector("body").append(previewObj);
                planner.scene.dragProductFromCatalog(selectedObjId);
                isObjLoaded = true;
            };
            let outFromPanelVal = (currentOverlayCoords.left + currentOverlayCoords.width) - e.clientX;
            previewObjOpacity = outFromPanelVal > 0 ? 1 : 1 + (outFromPanelVal * selectedObjPreviewRatio);
            let newXPos = e.clientX || (e.touches && e.touches[0].clientX);
            let newYPos = e.clientY || (e.touches && e.touches[0].clientY);
            previewObj.style.opacity = previewObjOpacity;
            previewObj.style.left = (newXPos - startingPointX) + "px";
            previewObj.style.top = (newYPos  - startingPointY) + "px";
            //planner.mih().state.mouseMove(e);
        }   
    }

    let onObjectMouseUp = async e => {
        mouseDownOnObj = false;
        selectedObjId = null;
        selectedObjImgWidth = 0;
        selectedObjImgHeight = 0;
        clearTimeout(borderTimeoutKey);

        document.removeEventListener("mousemove", onObjectMove);
        document.removeEventListener("mouseup", onObjectMouseUp);

        plannerCatalogElem.classList.remove(classes.selectedTouched);

        previewObj && previewObj.remove();
        isObjLoaded = false;
        previewObjOpacity = 1;
        if(Date.now() - timer > 100) {
            let sceneObjectToDelete = R2D.mouseInteractionHelper.stateDraggingProdFromCatalog.view3DObject?.sceneObject;
            if(e.clientX < R2D.Viewers._instance.getOffsetWidthDueToOpenedPanels()) {
                planner.mih().state && planner.mih().state.mouseUp(e);
                if(sceneObjectToDelete) {
                    R2D.scene.remove(sceneObjectToDelete);
                    R2D.scene.history.removeUndoState();
                }
            } else {
                if(!currentProductAccessibilityStatus) {
                    dispatch(setActivePopup({name: "payPro", type: 'user'}));
                    if(sceneObjectToDelete) {
                        R2D.scene.remove(sceneObjectToDelete);
                        R2D.scene.history.removeUndoState();
                    }
                }
            }
            R2D.mouseInteractionHelper.stateDraggingProdFromCatalog.view3DObject = null;
        }

        R2D.mouseInteractionHelper.stateDraggingProdFromCatalog.view3DObject = null;
        currentDraggedElem = null;
    }

    let createModelImage = productContour => {
        return new Promise((resolve, reject) => {
            imageSizeCreator = new R2D.ProductHint.ImageSizeCreator();

            imageSizeCreator.addEventListener(Event.COMPLETE, imageSizeCreatorEventHandler);
            imageSizeCreator.addEventListener(Event.ERROR, imageSizeCreatorEventHandler);
            imageSizeCreator.create(productContour, R2D.ProductHint.Content.getPerson());

            function imageSizeCreatorEventHandler(e) {
                if ( imageSizeCreator == null ) return;

                let src = imageSizeCreator.getResultImageSrc();
                imageSizeCreator.removeEventListener(Event.COMPLETE, imageSizeCreatorEventHandler);
                imageSizeCreator.removeEventListener(Event.ERROR, imageSizeCreatorEventHandler);
                imageSizeCreator.dispose();
                imageSizeCreator = null;

                resolve(src);
            }
        })
    }

    let mouseEnterModel = async (event, data, isObjectAccessible) => {
        if(dynamicPanelPreviewViewType == 'small') {
            if(mouseDownOnObj || !isObjectAccessible) return;
            document.querySelector("." + classes.product_hover) && document.querySelector("." + classes.product_hover).remove();
            let product = event.currentTarget || event.target.closest('.' + classes.prod_item);
            let hoverWindow = document.createElement("div");
            hoverWindow.classList.add(classes.product_hover);

            document.querySelector("body").append(hoverWindow);

            let textHover = document.createElement("p");
            textHover.innerHTML = data.name;
            hoverWindow.append(textHover);
            setTimeout(() => {
                hoverWindow.style.left = (product.getBoundingClientRect().left + product.offsetWidth) + "px";
                hoverWindow.style.top = (product.getBoundingClientRect().top + ((product.offsetHeight - hoverWindow.offsetHeight) / 2)) + "px";
            }, 50)
        }
    }

    let mouseLeaveModel = e => document.querySelector("." + classes.product_hover) && document.querySelector("." + classes.product_hover).remove();

    let mouseDiscountEnter = async (event, discount, promocode) => {
        if(mouseDownOnObj || isCurrDeviceAPhone) return;
        document.querySelector("." + classes.product_hover) && document.querySelector("." + classes.product_hover).classList.add(classes.hidden);

        let product = event.currentTarget;
        let closesetCatalogElem = event.target.closest('.' + classes.prod_item);
        let hoverWindow = document.createElement("div");
        hoverWindow.classList.add(classes.product_hover_discount);

        document.querySelector("body").append(hoverWindow);

        let discountDiv = document.createElement("div");
        let discountDivText = document.createElement("p");
        let discountDivValue = document.createElement("p");
        discountDivText.innerHTML = translation['PRODUCT_DISCOUNT'] + ': ';
        discountDivValue.innerHTML = discount + '%';
        discountDivValue.classList.add(classes.discountValueText);
        discountDiv.append(discountDivText);
        discountDiv.append(discountDivValue);

        let promocodeDiv = document.createElement("div");
        let promocodeDivText = document.createElement("p");
        let promocodeDivValue = document.createElement("p");
        promocodeDivValue.classList.add(classes.discountValueText);
        promocodeDivText.innerHTML = translation['PRODUCT_PROMOCODE'] + ': ';
        promocodeDivValue.innerHTML = promocode;
        promocodeDiv.append(promocodeDivText);
        promocodeDiv.append(promocodeDivValue);

        hoverWindow.append(discountDiv);
        hoverWindow.append(promocodeDiv);
        setTimeout(() => {
            hoverWindow.style.left = (closesetCatalogElem.getBoundingClientRect().left + closesetCatalogElem.offsetWidth) + "px";
            hoverWindow.style.top = (product.getBoundingClientRect().top + ((product.getBBox().height - hoverWindow.offsetHeight) / 2)) + "px";
        }, 50);
    }

    let mouseDiscountLeave = e => document.querySelector("." + classes.product_hover_discount) && document.querySelector("." + classes.product_hover_discount).remove();

    let onClickSearchBtn = async e => {
        setPreloaderStatus(true);
        if(!searchInput.current.value) return setPreloaderStatus(false);
        
        let searchResult = await user.uGetSearchResult(searchInput.current.value);

        if(searchResult?.type == "error") {
        
        } else {
            setLastHistoryElemData({searchResult: searchResult.data.items, searchTotal: searchResult.data.total, searchQuery: searchInput.current?.value});
            dispatch(controlPanelHistoryDataUpdate({searchResult: searchResult.data.items, searchTotal: searchResult.data.total, searchQuery: searchInput.current?.value}));
        };
        setPreloaderStatus(false);
    }

    let onEnterClick = e => e.code == "Enter" && searchInput.current == document.activeElement && onClickSearchBtn();

    let onMouseEnterProductMoreInfo = (e, elem) => {
        setModalMoreInfo(true);
        setProductElemHover(elem);
    }
    let onMouseLeaveProductMoreInfo = e => {
        setModalMoreInfo(false);
    };

    let onSearchQueryUpdate = e => onClickSearchBtn();

    let copyMaterial = (e, elem) =>{
        R2D.CopyPaste.copyMaterial({id: elem.id})
    }

    useEffect(() => {
        let keyTimeout = setTimeout(() => setStyleAnimation({ transform: "translateX(0%)"}), 50);
        document.addEventListener('keyup', onEnterClick);
        planner.scene.addEventListener(planner.scene.PRODUCTS_UPDATED, onSearchQueryUpdate);
        return () => {
            planner.scene.removeEventListener(planner.scene.PRODUCTS_UPDATED, onSearchQueryUpdate);
            document.removeEventListener('keyup', onEnterClick);
            clearTimeout(keyTimeout);
        }
    }, []);

    useEffect(async () => {
        if(!searchedList) {
            setPreloaderStatus(false);
            return setSearchedReactArray([]);
        }

        let arrayReact = [];
        let htmlElem;
        let loadedPrevs = [];

        for (let elem of searchedList) {
            let isInFavorites = elem.isColorPicker ? favoritesList.find(i => i?.id == elem.id && i.addData == "#aaaaaa") ? true : false : favoritesList.find(i => i?.id == elem.id) ? true : false;
            
            let attributesArray = elem.attributes && Object.values(elem.attributes);
            let elemColors, attributesBrand, elemWidth, elemDepth, elemHeight, elemType, attributesStartingFrom, attributesSeatingHeight, attributesCurrency, othersAttributes;
            if(attributesArray?.length > 0) {
                attributesBrand = attributesArray.find(i => i.systemName == 'brand');
                attributesSeatingHeight = attributesArray.find(i => i.systemName == 'seating_height');
                attributesStartingFrom = attributesArray.find(i => i.systemName == 'starting_from');
                attributesCurrency = attributesArray.find(i => i.systemName == 'currency');
                othersAttributes = attributesArray.filter(i => i.systemName != 'currency' && i.systemName != 'starting_from' && i.systemName != 'seating_height' && i.systemName != 'brand');
            }

            elemType = elem.type;
            elemWidth = elem.property?.sizes?.width;
            elemDepth = elem.property?.sizes?.depth;
            elemHeight = elem.property?.sizes?.height;

            let isObjectAccessible = elem.isOwner ?
            elem.type == R2D.ProductType.MATERIAL ? 
            userData.plan != 'free' || userProjectActive.plan != 'free' :
            userData.plan == 'pro' || userProjectActive.plan == 'pro' || ((userData.plan == 'basic' || userProjectActive.plan == 'basic') && (elem.type == R2D.ProductType.POSTER || elem.type == R2D.ProductType.CARPET)) 
            : elem?.plan == 'free' || (elem?.plan?.find && (elem?.plan.find(i => i == userData.plan) || (elem?.plan.find(i => i == userProjectActive.plan))));

            if(elem.source.body?.colors) elemColors = elem.source.body?.colors;

            if( elem?.isColorPicker ) {
                let isLoaded = R2D.PoolMaterials.getMaterial(elem.id);
                if( isLoaded.getMaterialLoadState() ) {
                    let matPrev = await R2D.Tool.getMatPrevFromMatIdAndColor(elem.id, "#aaaaaa");
                    htmlElem = 
                        <div className={classes.prod_item + ' ' + classes[`prod_item_${dynamicPanelPreviewViewType}`]} key={elem.id + "_" + "#aaaaaa"} >
                            <div className={classes.prod_item_hover_left}></div>
                            <div className={classes.prod_item_hover_top}></div>
                            <div className={classes.prod_item_hover_right}></div>
                            <div className={classes.prod_item_hover_bottom}></div>
                            <div className={isInFavorites ? classes.prod_item_fav_btn + ' ' + classes.prod_item_fav_btn_active : classes.prod_item_fav_btn}  onClick={e => updateFavorites(elem.id, isInFavorites, "#aaaaaa")}>
                                <FavoriteStarIcon/>
                            </div>
                            <div className={ classes.prod_item_img_wr }>
                                <img src={ matPrev.toDataURL() } />

                                {
                                    elemType == R2D.ProductType.MATERIAL && isObjectAccessible?
                                        <div className={classes.prod_item_dop_btns_wr}>
                                            <div className={classes.prod_item_btn_copy} onClick={e => copyMaterial(e, elem)}>
                                                <HoverComponent hoverText={ translation["BUTTON_COPY_MATERIAL"] } hoverTextPositionX={'right'} hoverTextPositionY={'top'} >
                                                    <svg className={classes.prod_item_btn_icon} width="16" height="16" viewBox="0 0 16 16" fill="transparent">
                                                        <rect x="3.5" y="0.5" width="12" height="12" stroke="white"/>
                                                        <rect className={classes.rectHover2} y="3" width="2" height="1" fill="white"/>
                                                        <rect className={classes.rectHover} y="15" width="13" height="1" fill="white"/>
                                                        <rect className={classes.rectHover} y="15" width="11" height="1"
                                                              transform="rotate(-90 0 15)" fill="white"/>
                                                        <rect className={classes.rectHover} x="12" y="15" width="1" height="1"
                                                              transform="rotate(-90 12 15)" fill="white"/>
                                                    </svg>
                                                </HoverComponent>
                                            </div>
                                        </div>
                                        : null
                                }


                                <div className='preloader-cube' style={{ display: 'none' }}></div>

                                {
                                    isObjectAccessible ? null :
                                        elem.plan.includes('basic')?
                                            <Lock additionalClass={classes.prod_item_zamok_btn} tipPositionY={'top'} tipPositionX={'right'} upgradePro={true} upgradeBasic={true} textHover={"UPGRADE_YOUR_PLAN_TEXT"} parentClass={classes.prod_item}/>
                                        : elem.plan.includes('pro') ?
                                            <Lock additionalClass={classes.prod_item_zamok_btn} tipPositionY={'top'} tipPositionX={'right'} upgradePro={true}  textHover={"UPGRADE_YOUR_PLAN_TEXT"} parentClass={classes.prod_item}/>
                                        : null
                                }
                                {
                                    dynamicPanelPreviewViewType != 'big' ?
                                        <div className={classes.prod_item_more_info} onMouseEnter={e => onMouseEnterProductMoreInfo(e, elem)} onMouseLeave={onMouseLeaveProductMoreInfo}>
                                            <MoreInfoIcon/>
                                        </div> : null
                                }
                            </div>

                            {
                                dynamicPanelPreviewViewType != 'small' ?
                                    <div className={classes.prod_item_title}><div>{elem.name}</div></div>
                                    : null
                            }
                            <div className={classes.prod_item_overlay} onMouseDown={e => elemType == R2D.ProductType.MATERIAL ? onMouseDownMaterial(e, elem, isObjectAccessible) : onMouseDownModel(e, elem, isObjectAccessible)} onMouseLeave={e => elemType == R2D.ProductType.MATERIAL ? mouseLeaveMaterial(e) : mouseLeaveModel(e)} onMouseEnter={e => elemType == R2D.ProductType.MATERIAL ? mouseEnterMaterial(e, elem, isObjectAccessible) : mouseEnterModel(e, elem, isObjectAccessible)} id={elem.id + "_" + "#aaaaaa".replace("#", "")}></div>
                        </div>;
                } else {
                    htmlElem = 
                        <div className={classes.prod_item + ' ' + classes[`prod_item_${dynamicPanelPreviewViewType}`]} key={elem.id + "_" + "#aaaaaa"} >
                            <div className={classes.prod_item_hover_left}></div>
                            <div className={classes.prod_item_hover_top}></div>
                            <div className={classes.prod_item_hover_right}></div>
                            <div className={classes.prod_item_hover_bottom}></div>
                            <div className={isInFavorites ? classes.prod_item_fav_btn + ' ' + classes.prod_item_fav_btn_active : classes.prod_item_fav_btn} onClick={e => updateFavorites(elem.id, isInFavorites, "#aaaaaa")}>
                                <FavoriteStarIcon/>
                            </div>
                            <div className={ classes.prod_item_img_wr }>
                                <img src={ null } />

                                {
                                    elemType == R2D.ProductType.MATERIAL && isObjectAccessible?
                                        <div className={classes.prod_item_dop_btns_wr}>
                                            <div className={classes.prod_item_btn_copy} onClick={e => copyMaterial(e, elem)}>
                                                <HoverComponent hoverText={ translation["BUTTON_COPY_MATERIAL"] } hoverTextPositionX={'right'} hoverTextPositionY={'top'} >
                                                    <svg className={classes.prod_item_btn_icon} width="16" height="16" viewBox="0 0 16 16" fill="transparent">
                                                        <rect x="3.5" y="0.5" width="12" height="12" stroke="white"/>
                                                        <rect className={classes.rectHover2} y="3" width="2" height="1" fill="white"/>
                                                        <rect className={classes.rectHover} y="15" width="13" height="1" fill="white"/>
                                                        <rect className={classes.rectHover} y="15" width="11" height="1"
                                                              transform="rotate(-90 0 15)" fill="white"/>
                                                        <rect className={classes.rectHover} x="12" y="15" width="1" height="1"
                                                              transform="rotate(-90 12 15)" fill="white"/>
                                                    </svg>
                                                </HoverComponent>
                                            </div>
                                        </div>
                                        : null
                                }

                                <div className='preloader-cube'></div>
                                {
                                    isObjectAccessible ? null :
                                        elem.plan.includes('basic')?
                                            <Lock additionalClass={classes.prod_item_zamok_btn} tipPositionY={'top'} tipPositionX={'right'} upgradePro={true} upgradeBasic={true} textHover={"UPGRADE_YOUR_PLAN_TEXT"} parentClass={classes.prod_item}/>
                                            : elem.plan.includes('pro') ?
                                                <Lock additionalClass={classes.prod_item_zamok_btn} tipPositionY={'top'} tipPositionX={'right'} upgradePro={true}  textHover={"UPGRADE_YOUR_PLAN_TEXT"} parentClass={classes.prod_item}/>
                                                : null
                                }
                                {
                                    dynamicPanelPreviewViewType != 'big' ?
                                        <div className={classes.prod_item_more_info} onMouseEnter={e => onMouseEnterProductMoreInfo(e, elem)} onMouseLeave={onMouseLeaveProductMoreInfo}>
                                            <MoreInfoIcon/>
                                        </div> : null
                                }
                            </div>
                            {
                                dynamicPanelPreviewViewType != 'small' ?
                                    <div className={classes.prod_item_title}><div>{elem.name}</div></div>
                                    : null
                            }
                            <div className={classes.prod_item_overlay} onMouseDown={e => elemType == R2D.ProductType.MATERIAL ? onMouseDownMaterial(e, elem, isObjectAccessible) : onMouseDownModel(e, elem, isObjectAccessible)} onMouseLeave={e => elemType == R2D.ProductType.MATERIAL ? mouseLeaveMaterial(e) : mouseLeaveModel(e)} onMouseEnter={e => elemType == R2D.ProductType.MATERIAL ? mouseEnterMaterial(e, elem, isObjectAccessible) : mouseEnterModel(e, elem, isObjectAccessible)} id={elem.id + "_" + "#aaaaaa".replace("#", "")}></div>
                        </div>;

                    loadedPrevs.push({ id: elem.id, color: "#aaaaaa" });
                }
            } else {
                let metadata = elem.metadata;
                let matchedLinkObject = metadata?.multilinkwithip?.data && (Object.values(metadata?.multilinkwithip?.data)?.find(i => i.country == R2D.config.location) || Object.values(metadata?.multilinkwithip?.data)?.find(i => i.country == 'all'));
                htmlElem = 
                    <div className={classes.prod_item + ' ' + classes[`prod_item_${dynamicPanelPreviewViewType}`]} key={elem.id} >
                        <div className={classes.prod_item_hover_left}></div>
                        <div className={classes.prod_item_hover_top}></div>
                        <div className={classes.prod_item_hover_right}></div>
                        <div className={classes.prod_item_hover_bottom}></div>
                        <div className={isInFavorites ? classes.prod_item_fav_btn + ' ' + classes.prod_item_fav_btn_active : classes.prod_item_fav_btn} onClick={e => updateFavorites(elem.id, isInFavorites)}>
                            <FavoriteStarIcon/>
                        </div>
                        <div className={ classes.prod_item_img_wr }>
                            <img data-src={R2D.URL.DOMAIN + elem.source.images.preview} className={'lazyload'} />

                            {
                                elemType == R2D.ProductType.MATERIAL && isObjectAccessible?
                                    <div className={classes.prod_item_dop_btns_wr}>
                                        <div className={classes.prod_item_btn_copy} onClick={e => copyMaterial(e, elem)}>
                                            <HoverComponent hoverText={ translation["BUTTON_COPY_MATERIAL"] } hoverTextPositionX={'right'} hoverTextPositionY={'top'} >
                                                <svg className={classes.prod_item_btn_icon} width="16" height="16" viewBox="0 0 16 16" fill="transparent">
                                                    <rect x="3.5" y="0.5" width="12" height="12" stroke="white"/>
                                                    <rect className={classes.rectHover2} y="3" width="2" height="1" fill="white"/>
                                                    <rect className={classes.rectHover} y="15" width="13" height="1" fill="white"/>
                                                    <rect className={classes.rectHover} y="15" width="11" height="1"
                                                          transform="rotate(-90 0 15)" fill="white"/>
                                                    <rect className={classes.rectHover} x="12" y="15" width="1" height="1"
                                                          transform="rotate(-90 12 15)" fill="white"/>
                                                </svg>
                                            </HoverComponent>
                                        </div>
                                    </div>
                                    : null
                            }

                            {
                                elem.isOwner && isObjectAccessible ?
                                    <div className={classes.prod_item_custom_delete_btn} onClick={e => dispatch(setActivePopup({name: "confirm", type: "delete_custom_element", data: {id: elem.id, type: elemType}}))} >
                                        <svg className={classes.prod_item_custom_delete} width="12" height="15" fill="none" viewBox="0 0 12 15">
                                            <path fill="#fff" d="M7.412.585v1.248h-.416v-.832h-2.08v.832H4.5V.585h2.912Z"/>
                                            <path fill="#444" d="M7.412.585v1.248h-.416v-.832h-2.08v.832H4.5V.585h2.912Z"/>
                                            <path fill="#fff" d="M.753 2.25a22.29 22.29 0 0 1 10.404 0v.832H.753V2.25Z"/>
                                            <path fill="#444" d="M.753 2.25a22.29 22.29 0 0 1 10.404 0v.832H.753V2.25Z"/>
                                            <path fill="#fff" d="M10.325 14.078a.655.655 0 0 1-.653.657H2.239a.656.656 0 0 1-.654-.657V3.498h8.74v10.58ZM3.46 4.331a.624.624 0 0 0-.624.624v7.075a.624.624 0 0 0 1.248 0V4.955a.625.625 0 0 0-.624-.624Zm2.497 0a.624.624 0 0 0-.624.624v7.075a.624.624 0 0 0 1.248 0V4.955a.624.624 0 0 0-.624-.624Zm2.498 0a.625.625 0 0 0-.624.624v7.075a.625.625 0 0 0 1.25 0V4.955a.625.625 0 0 0-.626-.624Z"/>
                                            <path fill="#444" d="M10.325 14.078a.655.655 0 0 1-.653.657H2.239a.656.656 0 0 1-.654-.657V3.498h8.74v10.58ZM3.46 4.331a.624.624 0 0 0-.624.624v7.075a.624.624 0 0 0 1.248 0V4.955a.625.625 0 0 0-.624-.624Zm2.497 0a.624.624 0 0 0-.624.624v7.075a.624.624 0 0 0 1.248 0V4.955a.624.624 0 0 0-.624-.624Zm2.498 0a.625.625 0 0 0-.624.624v7.075a.625.625 0 0 0 1.25 0V4.955a.625.625 0 0 0-.626-.624Z"/>
                                        </svg>
                                    </div> :
                                    null
                            }
                            {
                                matchedLinkObject?.discount ?
                                    <div className={classes.prod_item_promocode_btn}>
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"  className={classes.prod_item_promocode} onMouseLeave={mouseDiscountLeave} onMouseEnter={event => mouseDiscountEnter(event, matchedLinkObject?.discount, matchedLinkObject?.promocode)}>
                                            <path d="M19.0737 7.7565L18.4632 7.14582C18.1684 6.85104 18 6.45093 18 6.02982V5.16648C18 3.41889 16.5789 1.99764 14.8316 1.99764H13.9684C13.5474 1.99764 13.1474 1.83979 12.8526 1.53449L12.2421 0.923802C11.0105 -0.307934 9 -0.307934 7.75789 0.923802L7.14735 1.53449C6.85261 1.83979 6.45261 1.99764 6.03156 1.99764H5.16839C3.42102 1.99764 2.00002 3.41889 2.00002 5.16648V6.02982C2.00002 6.45093 1.84213 6.85104 1.53686 7.14582L0.926316 7.7565C0.326316 8.35662 0 9.15652 0 9.99873C0 10.8409 0.326316 11.6409 0.926316 12.241L1.53686 12.8517C1.84213 13.1465 2.00002 13.5467 2.00002 13.9678V14.831C2.00002 16.5786 3.42102 17.9999 5.16839 17.9999H6.03156C6.45261 17.9999 6.85261 18.1578 7.14735 18.4631L7.75789 19.0738C8.37895 19.6949 9.18947 20 10 20C10.8105 20 11.6211 19.6949 12.2421 19.0738L12.8526 18.4631C13.1474 18.1578 13.5474 17.9999 13.9684 17.9999H14.8316C16.5789 17.9999 18 16.5786 18 14.831V13.9678C18 13.5467 18.1684 13.1465 18.4632 12.8517L19.0737 12.241C19.6737 11.6409 20 10.8409 20 9.99873C20 9.15652 19.6737 8.35662 19.0737 7.7565ZM7.36842 6.0509C8.09474 6.0509 8.68421 6.64045 8.68421 7.36685C8.68421 8.09322 8.09474 8.68277 7.36842 8.68277C6.64211 8.68277 6.05263 8.09322 6.05263 7.36685C6.05263 6.64045 6.64211 6.0509 7.36842 6.0509ZM12.6316 13.9466C11.9053 13.9466 11.3158 13.357 11.3158 12.6306C11.3158 11.9042 11.9053 11.3147 12.6316 11.3147C13.3579 11.3147 13.9474 11.9042 13.9474 12.6306C13.9474 13.357 13.3579 13.9466 12.6316 13.9466ZM13.9053 7.58789L7.5895 13.9045C7.37897 14.1045 7.11579 14.2098 6.84211 14.2098C6.57895 14.2098 6.30524 14.1045 6.09472 13.9045C5.68419 13.4939 5.68419 12.8202 6.09472 12.4097L12.4105 6.09305C12.8316 5.68247 13.4947 5.68247 13.9053 6.09305C14.3158 6.50363 14.3158 7.17731 13.9053 7.58789Z" fill="#FFB400"/>
                                        </svg>
                                    </div>
                                    :
                                    null
                            }
                            {
                                dynamicPanelPreviewViewType != 'big' ?
                                    <div className={classes.prod_item_more_info} onMouseEnter={e => onMouseEnterProductMoreInfo(e, elem)} onMouseLeave={onMouseLeaveProductMoreInfo}>
                                        <MoreInfoIcon/>
                                    </div> : null
                            }

                        </div>

                        {
                            elemColors && dynamicPanelPreviewViewType == 'big' ?
                                <div className={classes.item_info_color_wr}>
                                    {
                                        elemColors.map(i =>
                                            <div className={classes.item_info_color} key={Math.random()} style={{backgroundImage: `url(${R2D.URL.DOMAIN + i.url})`}}></div>
                                        )
                                    }
                                </div> : null
                        }
                        {
                            dynamicPanelPreviewViewType != 'small' ?
                                <div className={classes.prod_item_title}><div>{elem.name}</div></div>
                                : null
                        }
                        {
                            dynamicPanelPreviewViewType == 'big' ? 
                            <div className={classes.item_info_content}>
                                { attributesStartingFrom && attributesCurrency ? <div>{attributesStartingFrom.name}: <div>{attributesCurrency.value || ''} {attributesStartingFrom.value || ''}</div></div>: null }
                                { attributesBrand ?<div><span style={{marginRight: 3}}>{attributesBrand.name}:</span> <span className={classes.item_info_content_span}>{ attributesBrand.value.value || '' }</span></div>: null }
                                {
                                    elemType == R2D.ProductType.MATERIAL || (!elemWidth && !elemDepth && !elemHeight) ?
                                    null :
                                    <div className={classes.item_info_content_sizes}>
                                        { elemWidth ? <>{ translation['TEXT_WIDTH_SHORT'] }:<span className={classes.item_info_content_span}>{planner.units.valueToString(elemWidth)}</span><span>x</span></> : null }
                                        { elemDepth ? <>{ translation['TEXT_DEPTH_SHORT'] }:<span className={classes.item_info_content_span}>{planner.units.valueToString(elemDepth)}</span><span>x</span> </>: null }
                                        { elemHeight ? <>{ translation['TEXT_HEIGHT_SHORT'] }:<span className={classes.item_info_content_span}>{planner.units.valueToString(elemHeight)} </span> { planner.units.getName() }</> : null }
                                    </div>
                                }
                                {attributesSeatingHeight ?<div><span style={{marginRight: 3}}>{ attributesSeatingHeight.name }: </span><span className={classes.item_info_content_span}>{ planner.units.valueToString(attributesSeatingHeight.value) }</span> { planner.units.getName() }</div>: null}

                                {
                                    othersAttributes?.length > 0 ?
                                        othersAttributes.map(i => {
                                            if (typeof i.value === 'object') {
                                                return (
                                                    <div className={classes.item_info_not_essential_attribute} key={Math.random()}>
                                                        <span>{i.name}: </span>
                                                        <span>
                                                            {
                                                                i.value.map ?
                                                                i.value.map(y => {
                                                                    return (
                                                                        <span className={classes.item_info_content_span}>{(y.value || '') + (y == i.value[i.value.length - 1] ? '' : ', ')}</span>
                                                                    )
                                                                }) : 
                                                                <span className={classes.item_info_content_span}>{ i.value?.value || '' }</span>
                                                            }
                                                        </span>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div className={classes.item_info_not_essential_attribute} key={Math.random()}>
                                                    <span>{i.name}: </span>
                                                    <span className={classes.item_info_content_span}>{i.value || ''}</span>
                                                </div>
                                            )
                                        })
                                        : null
                                }

                            </div> : null
                        }
                        {
                            isObjectAccessible ? null :
                                elem.plan.includes('basic')?
                                    <Lock additionalClass={classes.prod_item_zamok_btn} tipPositionY={'top'} tipPositionX={'right'} upgradePro={true} upgradeBasic={true} textHover={"UPGRADE_YOUR_PLAN_TEXT"} parentClass={classes.prod_item}/>
                                    : elem.plan.includes('pro') ?
                                        <Lock additionalClass={classes.prod_item_zamok_btn} tipPositionY={'top'} tipPositionX={'right'} upgradePro={true}  textHover={"UPGRADE_YOUR_PLAN_TEXT"} parentClass={classes.prod_item}/>
                                        : null
                        }
                        <div className={classes.prod_item_overlay} onMouseDown={e => elemType == R2D.ProductType.MATERIAL ? onMouseDownMaterial(e, elem, isObjectAccessible) : onMouseDownModel(e, elem, isObjectAccessible)} onMouseLeave={e => elemType == R2D.ProductType.MATERIAL ? mouseLeaveMaterial(e) : mouseLeaveModel(e)} onMouseEnter={e => elemType == R2D.ProductType.MATERIAL ? mouseEnterMaterial(e, elem, isObjectAccessible) : mouseEnterModel(e, elem, isObjectAccessible)}></div>
                    </div>;
            }

            arrayReact.push( htmlElem );
            setSearchedReactArray(arrayReact);
        }

        setLoadedPreviews( loadedPrevs );
        setPreloaderStatus(false);
    }, [searchedList, favoritesList, dynamicPanelPreviewViewType]);

    useEffect(() => {
        if(!loadedPreviews || loadedPreviews.length < 1) return;
        let key = setInterval(async () => {
            if(!loadedPreviews || loadedPreviews.length < 1) return clearInterval(key);
            else {
                for (let i of loadedPreviews){
                    if( R2D.PoolMaterials.isMaterial(i.id) && R2D.PoolMaterials.isMaterial(i.id).getMaterialLoadState() ) {
                        clearInterval(key);
                        let matPrev = await R2D.Tool.getMatPrevFromMatIdAndColor(i.id, i.color);
                        let loadedElem = document.getElementById(i.id + "_" + i.color.replace("#", "")).closest('.' + classes.prod_item);
                        loadedElem?.querySelector(".preloader-cube")?.remove();
                        if(loadedElem) loadedElem.querySelector("." + classes.prod_item_img_wr).getElementsByTagName("img")[0].src = matPrev.toDataURL();
                        return setLoadedPreviews(prev => {
                            let newArray = prev.filter(prevItem => prevItem.id != i.id || prevItem.color != i.color);
                            return newArray;
                        });
                    }
                };
            }
        }, 100);
    }, [loadedPreviews]);

    useEffect(() => setFavoritesList(user.data.favorites?.items || []), [isLogged]);

    useEffect(() => {
        if(!lastHistoryElemData) return;
        setSearchedList(lastHistoryElemData.searchResult);
        setSearchedQuery(lastHistoryElemData.searchQuery);
        setSearchedResultTotal(lastHistoryElemData.searchTotal || "")
    }, [lastHistoryElemData]);

    return (
        <div className={classes.planner_catalog_cont} style={styleAnimation} ref={panelRef}>
            <div className={classes.catalog_top_wr}>
                <div className={classes.searchContainer}>
                    <input type="text" placeholder={ translation["SEARCH_PLACEHOLDER"] } className={ classes.searchInput } ref={ searchInput } defaultValue={searchedQuery}/>

                    <div className={classes.search_btn_wr} ref={ searchBtn } onClick={ onClickSearchBtn }>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={ classes.searchBtn } >
                            <path d="M5.6389 0C8.7532 0 11.2778 2.52462 11.2778 5.63889C11.2778 6.98593 10.8054 8.22259 10.0174 9.19241L13.8291 13.0042C14.057 13.232 14.057 13.6013 13.8291 13.8291C13.6221 14.0363 13.298 14.0551 13.0696 13.8856L13.0042 13.8291L9.19241 10.0174C8.2226 10.8054 6.98593 11.2778 5.6389 11.2778C2.52462 11.2778 0 8.75319 0 5.63889C0 2.52462 2.52462 0 5.6389 0ZM5.6389 1.16667C3.16895 1.16667 1.16667 3.16895 1.16667 5.63889C1.16667 8.10881 3.16895 10.1111 5.6389 10.1111C8.10881 10.1111 10.1111 8.10881 10.1111 5.63889C10.1111 3.16895 8.10881 1.16667 5.6389 1.16667Z" fill="#2E3839"></path>
                        </svg>
                    </div>

                </div>
                {
                    searchedResultTotal?
                        <div className={classes.seach_title_wr}>
                            <div className={classes.seach_title}>{ translation["SEARCH_RESULT"]}  <span>{" (" + searchedResultTotal + ")"} </span></div>
                            {!isCurrDeviceAPhone ?
                                <AdditionalSettings hideCategoryTree={true} />
                                : null
                            }
                        </div>
                        : null
                }
            </div>
            {
                searchedList ? 
                <div className={classes.catalog_wr} ref={mainDiv}>
                    <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
                        <div className={classes.prod_elem_wrap} >
                            { searchedList && searchedList.length > 0 && searchedReactArray }
                        </div>
                    </SimpleBar>
                </div> : null
            }
            <div className={classes.preloaderBlock} style={preloaderStatus ? { opacity: 1 } : { opacity: 0, zIndex: -1 }}><div className={"preloader-cube"}></div></div>

            <AnimatePresence>
                {
                    modalMoreInfo?
                        <ModalMoreInfo productElemHover={productElemHover} key="modalMoreInfo"/>
                        : null
                }
            </AnimatePresence>
        </div>
    )
};

export default Main;