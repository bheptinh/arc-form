import React, { useEffect, useState } from 'react';
import {createUseStyles} from "react-jss";
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../../../../../initR2D';
import { controlPanelHistoryAddArray, controlPanelUpdateBreadCrumbs, selectActiveControlPanelModeData } from '../../../../../../redux/features/control/controlPanelSlice';
import { selectUserProfileData } from '../../../../../../redux/features/user/userSlice';
import { selectTips } from '../../../../../../redux/features/tips/tipsSlice';

import Tip from '../../../../../tips/Tip';

import Catalog from '../common/Catalog';
import Products from '../common/Products';

const useStyle = createUseStyles({
    replaceModel:{
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: 311,
        overflow: 'hidden',
        zIndex: 1
    }
});

const ReplaceModel = props => {
    let dispatch = useDispatch();

    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = activeControlPanelData.history;
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let lastHistoryElemType = lastHistoryElem?.type;
    let keyTimeoutClearActiveComponents;

    let [activePanelComponents, setActivePanelComponents] = useState([]);

    let catalogProducts = planner.getCatalogProducts();

    const classes = useStyle();

    let userProfileData = useSelector(selectUserProfileData);
    let tips = useSelector(selectTips);

    let currOS = R2D.controller.getCurrentOS();

    let isCurrDeviceAPhone = currOS == "iOS" || currOS == "Android";
    let panelPreviewIcon = '/src_designer/images/icon_mebli.svg';

    let historyUpdateFunctions = historyObj => {
        dispatch(controlPanelHistoryAddArray(historyObj));
        dispatch(controlPanelUpdateBreadCrumbs({data: historyObj, updateType: "addArray"}));
    }

    useEffect(() => {
        if(!R2D.scene.currentView3DObject || !R2D.scene.currentView3DObject.getProductId) return;
        let historyObj;
        if(catalogProducts && catalogProducts.length > 0) {
            let dataArray = [];
            historyObj = { id: null, addType: "main", data: catalogProducts, type: "catalog" };

            dataArray.push(historyObj);

            let neededIndex = 0;
            if(Object.values(typeof structuredClone !== 'undefined' ? structuredClone(R2D.Pool.getProductData(R2D.scene.currentView3DObject.getProductId()).categoryProduct) : JSON.parse(JSON.stringify(R2D.Pool.getProductData(R2D.scene.currentView3DObject.getProductId()).categoryProduct))).length > 1) {
                Object.values(typeof structuredClone !== 'undefined' ? structuredClone(R2D.Pool.getProductData(R2D.scene.currentView3DObject.getProductId()).categoryProduct) : JSON.parse(JSON.stringify(R2D.Pool.getProductData(R2D.scene.currentView3DObject.getProductId()).categoryProduct))).forEach((item, index, array) => {
                    Object.values(item).reduce((prevVal, currVal) => {
                        let activeArray = prevVal?.find(y => y.id == currVal.id);
                        if(activeArray?.nodes) return activeArray?.nodes;
                        if(activeArray?.urlList) {
                            neededIndex = index;
                            array.splice(1);
                        }
                    }, catalogProducts);
                });
            };

            Object.values(typeof structuredClone !== 'undefined' ? structuredClone(R2D.Pool.getProductData(R2D.scene.currentView3DObject.getProductId()).categoryProduct) : JSON.parse(JSON.stringify(R2D.Pool.getProductData(R2D.scene.currentView3DObject.getProductId()).categoryProduct)))[neededIndex].reverse().reduce((prevVal, currVal, index, array) => {
                let activeArray = prevVal?.find(y => y.id == currVal.id);
                let parentId = array[index - 1] && array[index - 1].id || null;
                if(activeArray) {
                    if(activeArray.nodes) {
                        historyObj = { id: activeArray?.id, parentId, data: activeArray?.nodes, id: activeArray?.id, name: activeArray?.name, type: "catalog" };
                        dataArray.push(historyObj);
                        return activeArray?.nodes;
                    } 
                    else {
                        historyObj = {type: "products", parentId, urlList: activeArray?.urlList.replace('/api/category/products', R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')) + '&category_type=2', privateMaterialType: activeArray?.privateMaterialType, id: activeArray?.id, name: activeArray?.name, data: null};
                        dataArray.push(historyObj);
                    }
                }
                else array.splice(1);
            }, catalogProducts);

            historyUpdateFunctions(dataArray);
        }
    }, [])

    useEffect(() => {
        if(lastHistoryElemType) {
            setActivePanelComponents(prevState => 
                [
                    ...prevState, 
                    lastHistoryElemType == 'catalog' ? <Catalog breadcrumsTitle={"HINT_PRODUCTS_CATALOG"} panelPreviewIcon={panelPreviewIcon} key={Math.random()} /> :
                    lastHistoryElemType == 'products' ? <Products breadcrumsTitle={"HINT_PRODUCTS_CATALOG"} panelPreviewIcon={panelPreviewIcon} key={Math.random()} type={'replace'}/> :
                    null
                ]
            );
        }
    }, [lastHistoryElem?.id]);

    useEffect(() => {
        if(activePanelComponents.length > 2) setActivePanelComponents(prevState => [prevState[prevState.length - 2], prevState[prevState.length - 1]]);
        else {
            if(activePanelComponents.length > 1) keyTimeoutClearActiveComponents = setTimeout(() => setActivePanelComponents(prevState => [prevState[prevState.length - 1]]), 600);
        }
        return () => clearTimeout(keyTimeoutClearActiveComponents);
    }, [activePanelComponents]);

    return (
        <div className={classes.replaceModel}>
            { activePanelComponents }
            { userProfileData.tips && userProfileData.tips != 0 && !tips.replaceModel.showed && !isCurrDeviceAPhone ? <Tip name={"replaceModel"} showTime={1000} arrow={{position: "top", direction: "left"}} text={"TUT_REPLACE"} position={{x: "calc(100%)", y: 185, from: "left"}}/> : null }
        </div>
    )
}

export default ReplaceModel;