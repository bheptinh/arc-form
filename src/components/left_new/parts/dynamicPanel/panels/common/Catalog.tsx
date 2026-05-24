import React, { useEffect, useMemo, useRef, useState } from 'react';
import {createUseStyles} from "react-jss";
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import 'simplebar-react/dist/simplebar.min.css';

import {
    controlPanelHistoryAdd,
    controlPanelHistoryScrollSave,
    controlPanelUpdateBreadCrumbs,
    selectActiveControlPanelModeData,
    selectDynamicPanelCatalogPreviewViewType, updateDynamicPanelCatalogPreviewViewType
} from '../../../../../../redux/features/control/controlPanelSlice';
import {selectTranslation} from "../../../../../../redux/features/language/languageSlice";
import {selectUserProfileData, selectUserProjectActive} from "../../../../../../redux/features/user/userSlice";
import {selectIsProjectBelongToLoggedUser} from "../../../../../../redux/features/common/commonSlice";

import Navigation from '../../navigation/Navigation';

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
        width: 309,
        position: 'absolute',
        left: 0,
        top: 0,
        '@media screen and (max-width: 950px)':{
            width: 189,
        }
    },
    catalog_wr:{
        overflow: 'hidden',
        height: '100%',
        position: 'relative',
        background: '#fff',
        borderTop: '1px solid #C6C4C4'
       // width: 'calc(100% + 8px)',

    },
    planner_catalog_pro_plashka:{
        background: '#EBEBEB',
        padding: '12px 20px 15px 13px',
        color: '#000',
        fontSize: 14,
        lineHeight: '20px',
        position: 'relative',
        '& strong':{
            fontWeight: 700,
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 9,
            padding: '5px 20px 5px 8px',
            lineHeight: '11px',
        }
    },
    planner_catalog_pro_plashka_close:{
        position: 'absolute',
        top: 7,
        right: 5,
        cursor: 'pointer',
        '&:hover':{
            '& path':{
                fill: '#000'
            }
        },
        '@media screen and (max-width: 950px)':{
            top: 5,
        }
    },
    planner_catalog_pro_plashka_close_icon:{
        width: '100%',
        height: 'auto',
        '& path':{
            transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
        }
    },
    planner_catalog_pro_plashka_pro:{
        background: '#FFB400',
        borderRadius: 3,
        fontFamily: "RobotoCondensed-Regular",
        fontSize: 13,
        color: '#292A27',
        padding: '2px 3px',
        marginLeft: 5,
        textTransform: 'uppercase',
        display: 'inline-block',
        lineHeight: '1.4',
        '@media screen and (max-width: 950px)':{
            fontSize: 10,
            lineHeight: '1',
        }
    },
    planner_catalog_items:{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    planner_cat_item:{
        position: 'relative',
        height: 160,
        cursor: 'pointer',
        borderBottom: '1px solid #E9E9E9',
        transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
        '&:before':{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: 29,
            background: 'linear-gradient(to bottom, #F5F3F3, transparent)',
            pointerEvents: 'none',
            zIndex: 1,
            opacity: '0.7',
            transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)'
        },
        '&:hover':{
            '&:before':{
                opacity: 1
            },
            '& img':{
                transform: 'scale(1.1)'
            },
            '& $planner_cat_item_hover_left':{
                height: '100%'
            },
            '& $planner_cat_item_hover_top':{
                width: '100%'
            },
            '& $planner_cat_item_hover_right':{
                height: '100%'
            },
            '& $planner_cat_item_hover_bottom':{
                width: '100%'
            }
        }
    },
    planner_cat_item_small:{
        cursor: "pointer",
        height: "72px",
        display: "grid",
        paddingRight: 7,
        zIndex: 1,
        gridGap: "11px",
        position: "relative",
        background: "#FFFFFF",
        transition: "all 0.9s cubic-bezier(0.19, 1, 0.22, 1)",
        alignItems: "center",
        borderBottom: "1px solid #E9E9E9",
        gridTemplateColumns: "103px auto",
        '&:before':{
            display: 'none'
        },
        '& $planner_cat_item_img_wr':{
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        },
        '& $planner_cat_item_title':{
            color: "#2F2F2F",
            position: 'relative',
            padding: 0
        },
        '@media screen and (max-width: 950px)':{
            gridTemplateColumns: '53px auto',
            height: 40,
            gridGap: 4
        }
    },
    planner_cat_item_big:{

    },
    planner_cat_item_hover_left:{
        width: 2,
        height: 0,
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1,
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
    planner_cat_item_hover_top:{
        width: 0,
        height: 2,
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 1,
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
    planner_cat_item_hover_right:{
        width: 2,
        height: 0,
        position: 'absolute',
        bottom: 0,
        right: 0,
        pointerEvents: 'none',
        zIndex: 1,
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
    planner_cat_item_hover_bottom:{
        width: 0,
        height: 2,
        position: 'absolute',
        bottom: 0,
        right: 0,
        pointerEvents: 'none',
        zIndex: 1,
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
    planner_cat_item_img_wr:{
        height: '100%',
        overflow: 'hidden',
        width: '100%',
        '& img':{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'all .9s cubic-bezier(.19,1,.22,1)'
        }
    },
    planner_cat_item_title:{
        position: 'absolute',
        top: 0,
        left: 0,
        padding: '4px 10px',
        fontSize: 14,
        zIndex: 2,
        fontFamily: "RobotoCondensed-Regular",
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
        }
    }
});

const Catalog = props => {
    let translation = useSelector(selectTranslation);
    let userData = useSelector(selectUserProfileData);
    let userProjectActive = useSelector(selectUserProjectActive);
    let [isProOptionEnabled, setIsProOptionEnabled] = useState(R2D.OPTIONS.PRO_PLAN);
    let isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);
    let dispatch = useDispatch();
    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let dynamicPanelCatalogPreviewViewType = useSelector(selectDynamicPanelCatalogPreviewViewType);
    let controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let lastHistoryElemData = lastHistoryElem?.data;
    let currentParentId = lastHistoryElem?.id;
    let isAdded = lastHistoryElem?.isAdded;

    let [styleAnimation, setStyleAnimation] = useState(isAdded ? {transform: "translateX(100%)"} : { transform: "translateX(-100%)" });
    let [catalogArray, setCatalogArray] = useState([]);
    let [proPlashka, setProPlashka] = useState(false);
    let [savedScroll, setSavedScroll] = useState(lastHistoryElem?.lastSavedScroll);

    const classes = useStyle();

    let mainDiv = useRef(null);
    let catalogMain = useRef(null);
    let scrollTimer = -1;
    
    let onScroll = e => {
        if (scrollTimer != -1) clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => scrollFinished(), 1000);
    }

    let scrollFinished = () => {
        dispatch(controlPanelHistoryScrollSave(catalogMain.current.getScrollElement().scrollTop ? catalogMain.current.getScrollElement().scrollTop : 0));
        setSavedScroll(catalogMain.current.getScrollElement().scrollTop ? catalogMain.current.getScrollElement().scrollTop : 0);
    };

    let catalogClick = data => {
        if(!data.urlList && !data.nodes) return;
        let dataObj = {name: data.name, id: data.id, privateMaterialType: data.privateMaterialType, parentId: currentParentId ? currentParentId : null, data: null, lastSavedScroll: 0, tags: data.tags};
        if(data.type == "product" && data.privateMaterialType != 6) {
            let urlList = data.urlList;
            dataObj.type = 'products';
            dataObj.urlList = ~urlList.search(/materialsByCategory/) ? urlList.replace('/api/category/materialsByCategory', R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')) + '&category_type=1' 
            : urlList.replace('/api/category/products', R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, ''));
        } else if(data.type == "colorpicker") {
            dataObj.type = "colorpicker";
            let urlList = data.urlList;
            dataObj.urlList = ~urlList.search(/materialsByCategory/) ? urlList.replace('/api/category/materialsByCategory', R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')) + '&category_type=1' 
            : urlList.replace('/api/category/products', R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, ''));
        }
        else {
            dataObj.type = "catalog";
            dataObj.data = data.nodes;
        }
        dispatch(controlPanelHistoryAdd(dataObj));
        dispatch(controlPanelUpdateBreadCrumbs({data: dataObj, updateType: "add"}));
    };

    let currOS = R2D.controller.getCurrentOS();
    let isCurrDeviceAPhone = currOS == "iOS" || currOS == "Android";

    let closeProPlashka = () =>{
        setProPlashka(false);
        R2D.Storage.save("r2d_pro_plashka_in_catalog", true);
    }

    useEffect(() => {
        setStyleAnimation({ transform: "translateX(0%)"})
        if(isCurrDeviceAPhone) {
            dispatch(updateDynamicPanelCatalogPreviewViewType('small'));
        }
    }, []);

    useEffect(() => {
        if(catalogMain.current && catalogMain.current.getScrollElement) {
            let scrollElemMain = catalogMain.current.getScrollElement();
            setTimeout(() => scrollElemMain.scrollTop = savedScroll, 0);
            scrollElemMain.addEventListener("scroll", onScroll);
        }
    }, [catalogMain]);

    useEffect(() => {
        let arrayList = [];
        lastHistoryElemData && lastHistoryElemData.length && lastHistoryElemData.forEach(i => {
            arrayList.push(
                <div className={classes.planner_cat_item + ' ' + classes[`planner_cat_item_${dynamicPanelCatalogPreviewViewType}`]} key={i.id} onClick={e => catalogClick(i)}>
                    <div className={classes.planner_cat_item_hover_left}></div>
                    <div className={classes.planner_cat_item_hover_top}></div>
                    <div className={classes.planner_cat_item_hover_right}></div>
                    <div className={classes.planner_cat_item_hover_bottom}></div>
                    <div className={classes.planner_cat_item_img_wr}>
                        <img src={R2D.URL.DOMAIN + i.icon} className={classes.planner_cat_item_img}/>
                    </div>
                    <div className={classes.planner_cat_item_title} dangerouslySetInnerHTML={{__html: i.name}}></div>
                </div>
            )
        });
        setCatalogArray(arrayList);
    }, [lastHistoryElemData, dynamicPanelCatalogPreviewViewType]);

    useEffect(() => {
        if (!lastHistoryElem || !lastHistoryElem.tags) {
            return;
        }
        const hasProTag = lastHistoryElem.tags.map(i => i.trim()).includes('r2d_subscription_pro');
        const isPlashkaNotStored = !R2D.Storage.load("r2d_pro_plashka_in_catalog");

        if (hasProTag && isPlashkaNotStored) {
            setProPlashka(true);
        }
    }, [lastHistoryElem, R2D.Storage.load]);

    return (
        <div style={styleAnimation} ref={mainDiv} className={classes.planner_catalog_cont}>

            <Navigation panelPreviewIcon={props.panelPreviewIcon} breadcrumsTitle={props.breadcrumsTitle} />

            <div className={classes.catalog_wr} >
                <SimpleBar style={{ height: '100%' }} ref={catalogMain} autoHide={false} forceVisible="y">
                    <div className={classes.planner_catalog_items}>
                        {
                            proPlashka && !(((userData?.plan === 'pro') || (isProjectBelongToLoggedUser && (userProjectActive.plan === 'pro'))) || isProOptionEnabled) && (
                                <div className={classes.planner_catalog_pro_plashka}>
                                    <div className={classes.planner_catalog_pro_plashka_close} onClick={closeProPlashka}>
                                        <svg width="12" height="12" fill="none" viewBox="0 0 25 25" className={classes.planner_catalog_pro_plashka_close_icon}>
                                            <path fill="#2F2F2F" fillRule="evenodd" d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z" clipRule="evenodd"></path><path fill="#2F2F2F" fillRule="evenodd" d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z" clipRule="evenodd"></path><path fill="#2F2F2F" fillRule="evenodd" d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z" clipRule="evenodd"></path><path fill="#2F2F2F" fillRule="evenodd" d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z" clipRule="evenodd"></path>
                                        </svg>
                                    </div>
                                    {translation["TEXT_MODELS_FOR_THE_SECTION"]} "{lastHistoryElem.name}" {translation["TEXT_AVAILABLE_ONLE_WITH_SUBSCRIPTION"]}

                                    <div className={classes.planner_catalog_pro_plashka_pro}>pro</div>
                                </div>
                            )
                        }

                        { catalogArray }
                    </div>
                </SimpleBar>
            </div>
            
        </div>
    )
};

export default Catalog;