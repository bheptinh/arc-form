import React, { useEffect, useState } from 'react';
import {createUseStyles} from "react-jss";
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from "simplebar-react";

import { planner } from '../../../initR2D';
import { removeQuickPanelAll } from '../../../redux/features/quickPanels/quickPanelsSlice';
import { selectLanguages } from '../../../redux/features/language/languageSlice';
import {
    changeActiveControlPanelMode,
    controlPanelHistoryReplaceArray,
    controlPanelUpdateBreadCrumbs,
    selectActiveControlPanelCatagoryTreeShowStatus,
    selectActiveControlPanelMode,
    selectActiveControlPanelModeData,
    selectCategoryTreePanelStatus,
    selectPrevControlPanelMode,
    updateCategoryTreePanelStatus
} from '../../../redux/features/control/controlPanelSlice';

import {Accordion} from "../../common/Accordion";

const useStyle = createUseStyles({
    '@font-face': [
        {
            fontFamily: "Roboto-Bold",
            fontWeight: 700,
            fontDisplay: 'swap',
            src: 'url("/src_designer/Roboto-Bold.ttf") format("truetype")'
        },
        {
            fontFamily: "RobotoCondensed-Regular",
            fontWeight: 400,
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
        gridTemplateRows: "1fr",
        transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
        width: 309,
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 3
    },
    category_tree_close:{
        width: '15px',
        height: '15px',
        position: 'absolute',
        top: '11px',
        right: '12px',
        cursor: 'pointer',
        zIndex: '2',
        '& path': {
            transition: 'all 0.9s cubic-bezier(.19,1,.22,1)'
        },
        '&:hover':{
            '& path':{
                fill: '#a0a0a0'
            }
        }
    },
    category_tree_close_icon:{
        width: '100%',
        height: 'auto'
    },
    catalog_wr:{
        overflow: 'hidden',
        height: '100%',
        background: '#fff',
        borderTop: "1px solid #C6C4C4",
        paddingTop: 7
    },
    tree_wr:{

        minHeight: '100%',
        '& ul':{
            listStyle: 'none',
            marginBottom: 5
        },
        '&>ul:first-child':{
            paddingLeft: 0,
        }
    },
    '$dropdown':{
        background: 'red'
    },
    tree_dropdown_title:{
        color: "#000",
        marginBottom: "5px",
        whiteSpace: "nowrap",
        fontSize: "17px",
        cursor: "pointer",
        position: "relative",
        fontFamily: "RobotoCondensed-Regular",
        zIndex: 1,
        display: 'flex',
        alignItems: 'flex-end',
        '&:before':{
            content: "''",
            position: "absolute",
            top: "50%",
            zIndex: -1,
            left: "50%",
            width: "500%",
            height: "calc(100% + 4px)",
            transform: "translate(-50%, -50%)",
            background: "#E9E9E9",
            opacity: 0,
            transition: "all .9s cubic-bezier(.19, 1, .22, 1)"
        },
        '&:hover:before':{
            opacity: 1
        }
    },
    tree_dropdown_arrow_wr:{
        transform: 'translateY(-2px)',
        padding: '0 0 0 6px',
        paddingRight: 7,
        position: "relative",
        zIndex: 2
    },
    tree_dropdown_arrow:{
        pointerEvents: 'none',
        transform: "rotate(-90deg)",
        transition: "all .9s cubic-bezier(.19,1,.22,1)"

    },
    tree_dropdown_name:{
        paddingRight: "5px",
        flexGrow: 1,
        fontFamily: "RobotoCondensed-Regular",
    },
    tree_dropdown_option:{
        position: "relative",
        zIndex: 1,
        cursor: "pointer",
        fontSize: "13px",
        color: "#555555",
        '&:before':{
            content: "''",
            position: "absolute",
            top: "50%",
            zIndex: -1,
            left: "50%",
            width: "500%",
            height: "calc(100%)",
            transform: "translate(-50%, -50%)",
            background: "#E9E9E9",
            opacity: 0,
            transition: "all .9s cubic-bezier(.19, 1, .22, 1)"
        },
        '&:hover:before':{
            opacity: 1
        }
    },
    tree_dropdown_title_active: {
        '&:before':{
            background: "#B8E11F",
            opacity: 1,
        },
        '&>$tree_dropdown_name':{
            color: '#000'
        }
    },
    tree_dropdown_overlay:{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1
    }
});

const CategoryTreePanel = props => {

    let dispatch = useDispatch();

    let activeControlPanelMode = useSelector(selectActiveControlPanelMode);
    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = activeControlPanelData?.history;
    let lastHistoryElem = controlPanelModeHistory && controlPanelModeHistory[controlPanelModeHistory.length - 1];

    let languages = useSelector(selectLanguages);

    let prevControlPanelMode = useSelector(selectPrevControlPanelMode);
    let activeControlPanelCatagoryTreeShowStatus = useSelector(selectActiveControlPanelCatagoryTreeShowStatus);

    let [catalogProducts, setCataloProducts] = useState(null);
    let [categoryTreeView, setCategoryTreeView] = useState(null);
    let categoryTreePanelStatus = useSelector(selectCategoryTreePanelStatus);

    const classes = useStyle();

    let onUpdateCurrentDynamicPanelData = dataArray => {
        if(!activeControlPanelCatagoryTreeShowStatus) {
            planner.mih().unsetActiveObject();
            dispatch(removeQuickPanelAll());
            dispatch(changeActiveControlPanelMode({mode: prevControlPanelMode}));
        }
        dispatch(controlPanelHistoryReplaceArray(dataArray));
        dispatch(controlPanelUpdateBreadCrumbs({data: dataArray, updateType: "replaceArray"}));
    };

    let getDynamicPanelDataFromPassedData = (data, parentId) => {
        let dataObj = {name: data.name, id: data.id, privateMaterialType: data.privateMaterialType, parentId: parentId || null, data: null, lastSavedScroll: 0};
        if(data.type == "product" && data.privateMaterialType != 6) {
            let urlList = data.urlList;
            dataObj.type = 'products';
            dataObj.urlList = dataObj.privateMaterialType == 1 ? 
            urlList.replace('/api/category/materialsByCategory', R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')) + '&category_type=1' 
            : urlList.replace('/api/category/products', R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, ''));
        } else if(data.type == "colorpicker") {
            dataObj.type = "colorpicker";
            let urlList = data.urlList;
            dataObj.urlList = dataObj.privateMaterialType == 1 ? 
            urlList.replace('/api/category/materialsByCategory', R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')) + '&category_type=1' 
            : urlList.replace('/api/category/products', R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, ''));
        }
        else {
            dataObj.type = "catalog";
            dataObj.data = data.nodes;
        }
        return dataObj;
    }

    let categoryDataProccessingFunction = (data, dataHistory, level, isOpened) => {
        let dataReactArray = [];
        let currentHistoryArray = [...dataHistory];
        currentHistoryArray.push(getDynamicPanelDataFromPassedData(data, data.parentId));
        let lastElemCurrentHistory = currentHistoryArray[currentHistoryArray.length - 1];

        if(data.nodes) {
            function findParentsByName(data, targetId) {
                let parents = new Set();
                function search(node, parentIds = []) {
                    if (!node || typeof node !== "object") return;
                    if (node.id === targetId) {
                        parentIds.forEach(id => parents.add(id));
                    }
                    if (Array.isArray(node.nodes)) {
                        for (const child of node.nodes) {
                            search(child, [...parentIds, node.id]);
                        }
                    }
                }
                search(data, [targetId]);
                return Array.from(parents);
            }
            const parentsActiveElem = findParentsByName(data, lastHistoryElem?.id);
            isOpened = parentsActiveElem.includes(data.id);

            dataReactArray.push(
                <li key={Math.random}>
                    <Accordion customTitle={
                        <div style={{ paddingLeft: `${dataHistory.length === 0 ? 0 : 11 * level}px` }} className={lastElemCurrentHistory.id == lastHistoryElem?.id && lastElemCurrentHistory.parentId == lastHistoryElem?.parentId ? classes.tree_dropdown_title_active +' '+ classes.tree_dropdown_title + ' ' + 'tree_dropdown_title ' + isOpened : classes.tree_dropdown_title+' '+ 'tree_dropdown_title '+ isOpened}>
                            <div className={classes.tree_dropdown_arrow_wr} data-toggle="true">
                                <img className={classes.tree_dropdown_arrow + ' ' + 'tree_dropdown_arrow'} src="/src_designer/images/arrow_down_tree.svg" />
                            </div>
                            <div className={classes.tree_dropdown_name} dangerouslySetInnerHTML={{__html: data.name}}></div>
                            <div className={classes.tree_dropdown_overlay} data-open="true" onClick={e => onUpdateCurrentDynamicPanelData(currentHistoryArray)}></div>
                        </div>} isOpened={isOpened}
                    >
                        <ul>
                            {
                                data.nodes.map(i => categoryDataProccessingFunction({...i, parentId: data.id}, currentHistoryArray, level + 1))
                            }
                        </ul>
                    </Accordion>
                </li>
            );

        } else {
            dataReactArray.push(
                <li style={{ paddingLeft:`${dataHistory.length === 0 ? 0 : 11 * level}px` }} className={classes.tree_dropdown_option} key={Math.random()} onClick={e => onUpdateCurrentDynamicPanelData(currentHistoryArray)}>
                   <div className={lastElemCurrentHistory.id == lastHistoryElem?.id && lastElemCurrentHistory.parentId == lastHistoryElem?.parentId ? classes.tree_dropdown_title_active + ' ' + classes.tree_dropdown_title+' '+ 'tree_dropdown_title' : classes.tree_dropdown_title+' '+ 'tree_dropdown_title'} >
                        <div className={classes.tree_dropdown_name} style={{paddingLeft: 22}}  dangerouslySetInnerHTML={{__html: data.name}}></div>
                    </div>
                </li>
            )
        }
        return dataReactArray;
    }

    useEffect(() => {
        if(!catalogProducts) return;
        let level = 1;
        let categoryTreeViewArray = [];
        catalogProducts.nodes.forEach(i => categoryTreeViewArray.push(categoryDataProccessingFunction({...i, parentId: catalogProducts.parentId}, [], level, null)));
        setCategoryTreeView(categoryTreeViewArray);
    }, [controlPanelModeHistory, catalogProducts, activeControlPanelMode]);

    useEffect(() => {
        if(activeControlPanelMode == 'furniture') {
            let furniture = planner.getCatalogProducts();
            setCataloProducts({parentId: furniture.id, nodes: furniture});
        } else if(activeControlPanelMode == 'decor') {
            setCataloProducts({parentId: null, nodes:  planner.getCatalogMaterials().materials});
        }
    }, [activeControlPanelMode, languages]);

    return (
        <div className={classes.planner_catalog_cont}>
            <div className={classes.category_tree_close} onClick={() => dispatch(updateCategoryTreePanelStatus(!categoryTreePanelStatus)) }>
                <svg className={classes.category_tree_close_icon} viewBox="0 0 16.03 16.02" width="24px" height="24px">
                    <path fill="#444444" d="M1,0a1,1,0,0,0-.7,1.72L6.6,8,.31,14.3a1,1,0,0,0,1.39,1.44l0,0L8,9.42l6.29,6.29a1,1,0,1,0,1.44-1.39l0,0L9.43,8l6.29-6.29A1,1,0,1,0,14.31.3L8,6.6,1.72.3A1,1,0,0,0,1,0Z"/>
                </svg>
            </div>

            <div className={classes.catalog_wr}>
                <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
                    <div className={classes.tree_wr}>
                        <ul>
                            {
                                categoryTreeView
                            }
                        </ul>
                    </div>
                </SimpleBar>
            </div>
        </div>
    )
}

export default CategoryTreePanel;