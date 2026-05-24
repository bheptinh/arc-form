import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUseStyles } from "react-jss";
import SimpleBar from "simplebar-react";

import {
    controlPanelHistoryAdd,
    controlPanelUpdateBreadCrumbs,
    selectActiveControlPanelModeData,
    selectDynamicPanelCatalogPreviewViewType
} from '../../../../../../redux/features/control/controlPanelSlice';

import Navigation from '../../navigation/Navigation';

const useStyle = createUseStyles({
    planer_catalog_cont:{
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
        borderTop: '1px solid #C6C4C4',
    },
    planer_catalog_items:{
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
            width: 'calc(100%)',
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
    },

});

const CatalogSet = props => {
    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let isAdded = lastHistoryElem?.isAdded;
    let lastHistoryElemData = lastHistoryElem?.data;
    let currentParentId = lastHistoryElem?.id;

    let mainDiv = useRef(null);
    let catalogMain = useRef(null);
    let dynamicPanelCatalogPreviewViewType = useSelector(selectDynamicPanelCatalogPreviewViewType);

    let arrayList = [];

    let [catalogArray, setCatalogArray] = useState(null);
    let [styleAnimation, setStyleAnimation] = useState(isAdded ? {transform: "translateX(100%)"} : { transform: "translateX(-100%)" });

    let dispatch = useDispatch();

    let catalogClick = (e, data) => {
        let dataObj = {id: data.id, parentId: currentParentId ? currentParentId : null, name: data.text, added: true};
        if(data.type == 'materials') {
            dataObj.type = 'catalogMaterialsSets';
            dataObj.data = data.materials;
        } else {
            dataObj.type = 'catalogSets';
            dataObj.data = data.children;
        }

        dispatch(controlPanelHistoryAdd(dataObj));
        dispatch(controlPanelUpdateBreadCrumbs({data: dataObj, updateType: "add"}));
    }
    
    const classes = useStyle();

    useEffect(() => setStyleAnimation({ transform: "translateX(0%)" }), []);

    useEffect(() => {
        if(lastHistoryElemData) {
            lastHistoryElemData.forEach(i => {
                arrayList.push(
                    <div className={classes.planner_cat_item  + ' ' + classes[`planner_cat_item_${dynamicPanelCatalogPreviewViewType}`]}  key={i.id} onClick={ e => catalogClick(e, i) }>
                        <div className={classes.planner_cat_item_hover_left}></div>
                        <div className={classes.planner_cat_item_hover_top}></div>
                        <div className={classes.planner_cat_item_hover_right}></div>
                        <div className={classes.planner_cat_item_hover_bottom}></div>
                        <div className={classes.planner_cat_item_img_wr}>
                            <img src={R2D.URL.DOMAIN + i.icon} className={classes.planner_cat_item_img}/>
                        </div>
                        <div className={classes.planner_cat_item_title}>{ i.text }</div>
                    </div>
                )
            });
            setCatalogArray(arrayList);
        }
    }, [lastHistoryElemData,dynamicPanelCatalogPreviewViewType]);

    return (
        <div style={styleAnimation} ref={mainDiv} className={classes.planer_catalog_cont} >
            <Navigation hideBreadCrumbsHomePanel={props.hideBreadCrumbsHomePanel} isAddSettingsDisabled={props.isAddSettingsDisabled} panelPreviewIcon={props.panelPreviewIcon} hideCategoryTree={props.hideCategoryTree} breadcrumsTitle={props.breadcrumsTitle} isHomeDisabled={props.isHomeDisabled} closeButtonStatus={props.closeButtonStatus} breadCrumbsLongShow={props.breadCrumbsLongShow}/>
            <div className={classes.catalog_wr} >
                <SimpleBar style={{ height: '100%' }} ref={catalogMain} autoHide={false} forceVisible="y">
                    <div className={classes.planer_catalog_items}>
                        { catalogArray }
                    </div>
                </SimpleBar>
            </div>
        </div>
    )
}

export default CatalogSet;