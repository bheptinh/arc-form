import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from "react-jss";
import { useDispatch, useSelector } from 'react-redux';

import { planner, user } from '../../../../../initR2D';
import { selectTranslation } from '../../../../../redux/features/language/languageSlice';
import { controlPanelHistoryAddArray, controlPanelUpdateBreadCrumbs } from '../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../redux/features/popups/popupsSlice';

import HoverComponent from '../../controlPanel/components/HoverComponent';
import Lock from "../../../../common/Lock";

let editMatEditIcon = {
    width: 16,
    height: 16,
    margin: '0 5px',
    '@media screen and (max-width: 950px)':{
        width: 11,
        height: 11
    }
}

const useStyle = createUseStyles({
    editMatItemWr:{
        aspectRatio: "1 / 1",
        position: "relative",
        borderRight: "1px solid #E9E9E9",
        borderBottom: "1px solid #E9E9E9"
    },
    editMatItem:{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        '&:hover':{
            '& $editMat':{
                transform: 'translateY(0%)'
            }
        }
    },
    editMat:{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 30,
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        background: 'rgba(68, 68, 68, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'translateY(102%)',
        '@media screen and (max-width: 950px)':{
            transform: 'translateY(0%)',
            height: 20
        }
    },
    editMatImg:{
        width: '100%',
        height: '100%',
        cursor: 'pointer',
        backgroundSize: "cover",
        position: 'relative'
    },
    prod_item_zamok_btn:{
        width: "18px",
        height: "18px",
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
    editMatEditIcon:{
        extend: editMatEditIcon,
        cursor: 'pointer',
        '& rect':{
            transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        },
        '&:hover':{
            '& rect':{
                fill: '#B8E11F'
            }
        }
    },
    editMatEditIcon_disabled:{
        extend: editMatEditIcon
    },

    editMatAddColor:{
        color: "#65BCF1",
        letterSpacing: '.03em'
    },
    btn_hover:{
        position: "absolute",
        background: "#81e7ff",
        display: "none",
        fontSize: 12,
        width: "max-content",
        padding: "2px 7px",
        transition: "all .1s ease",
        userSelect: "none",
        zIndex: 999,
        visibility: 'hidden'
    },
    editMat_copy:{
        
    },
    editMat_paste:{
        
    },
    editMatItem_main:{
        width: '100%',
        height: '100%'
    }
});

const MaterialComponent = props => {
    let dispatch = useDispatch();

    const classes = useStyle();

    let translation = useSelector(selectTranslation);

    let [isLoaded, setIsLoaded] = useState({status: false, materialSrc: "", needUpdate: 0});
    let [matName, setMatName] = useState(null);
    let [showCopy, setShowCopy] = useState(props.onCopyPaste.hasOwnProperty('statusCopy') ? props.onCopyPaste.statusCopy : true);

    let catalogMaterials = planner.getCatalogMaterials();

    let mouseEnter = e => {
        let product = e.currentTarget;
        let hoverWindow = document.createElement("div");
        hoverWindow.classList.add("product_hover");
        document.querySelector("body").append(hoverWindow);
        let matColor = document.createElement("p");
        matColor.textContent = props.matId?.indexOf && ~props.matId.indexOf("#") ? props.matId : matName ? matName : R2D.Pool.getProductData(props.matId) ? R2D.Pool.getProductData(props.matId).name : translation['UPLOAD_FROM_MODEL'];
        if(props.addMaterial) {
            let materialsName = document.createElement("p");
            matColor.classList.add(classes.editMatAddColor);
            materialsName.textContent = matName ? matName : R2D.Pool.getProductData(props.addMaterial) ? R2D.Pool.getProductData(props.addMaterial).name : "";
            hoverWindow.append(materialsName);
        }
        hoverWindow.append(matColor);
        hoverWindow.style.left = (product.getBoundingClientRect().left + product.offsetWidth) + "px";
        hoverWindow.style.top = (product.getBoundingClientRect().top + ((product.offsetHeight - hoverWindow.offsetHeight) / 2)) + "px";

        if(props.mouseEnterMaterial) props.mouseEnterMaterial();
        if(props.selectMeshOnHover) {
            if(props.hash) R2D.modelUploader.selectPart(props.hash);
        }
    }
    
    let mouseLeave = () => {
        document.querySelector(".product_hover") ? document.querySelector(".product_hover").remove() : null;
        if(props.mouseLeaveMaterial) props.mouseLeaveMaterial();
        props.selectMeshOnHover && R2D.modelUploader.unselectParts();
    }

    let onPaste = e => {
        if(props.type == "group") props.onCopyPaste.paste(props.matId, props.addMaterial);
        else props.onCopyPaste.index || !isNaN(props.onCopyPaste.index) ? props.onCopyPaste.paste(props.onCopyPaste.index) : props.onCopyPaste.paste();
    }

    let historyUpdateFunctions = historyObj => {
        dispatch(controlPanelHistoryAddArray(historyObj));
        dispatch(controlPanelUpdateBreadCrumbs({data: historyObj, updateType: "addArray"}));
    }

    function goForward(objData, parentId = null) {
        let resultForward;
        if(objData.type == 'materials') {
            if(objData.materials.find(i => i.id == props.matId)) resultForward = [{type: "catalogMaterialsSets", parentId, id: objData.id, name: objData.text, data: objData.materials, added: true}];
            else resultForward = false;
        }
        else {
            objData.children.some(i => {
                resultForward = goForward(i, objData.id);
                if(resultForward) {
                    resultForward.push({type: "catalogSets", parentId, data: objData.children, id: objData.id, name: objData.text, added: true});
                    return true;
                }
                else return false;
            });
        }
        return resultForward;
    }

    let onClickPreview = async e => {
        let passedClickRes;
        if(props.onClick) {
            passedClickRes = props.onClick();
            if(passedClickRes === false) return;
        }
        let historyObj;
        if(catalogMaterials && catalogMaterials.materials && catalogMaterials.materials.length > 0) {
            let dataArray = [];
            if(props.materialsSource.type == "bank" || passedClickRes?.source == 'bank') {
                historyObj = { id: null, addType: "main", data: catalogMaterials.materials, type: "catalog" };
                dataArray.push(historyObj);
                if(R2D.Pool.getProductData(props.matId)) {
                    Object.values(typeof structuredClone !== 'undefined' ? structuredClone(R2D.Pool.getProductData(props.matId).categoryMaterial) : JSON.parse(JSON.stringify(R2D.Pool.getProductData(props.matId).categoryMaterial)))[0]?.reverse().reduce((prevVal, currVal, index, array) => {
                        let activeArray = prevVal.find(y => y.id == currVal.id);
                        let parentId = array[index - 1] && array[index - 1].id || null;
                        if(activeArray) {
                            if(activeArray.nodes) {
                                historyObj = {id: activeArray.id, parentId, data: activeArray.nodes, id: activeArray.id, name: activeArray.name, type: "catalog"};
                                dataArray.push(historyObj);
                                return activeArray.nodes;
                            } 
                            else {
                                historyObj = {type: "materials", matShowType: "bank", parentId, urlList: activeArray.urlList?.replace('/api/category/materialsByCategory', R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')) + '&category_type=1', privateMaterialType: activeArray.privateMaterialType, id: activeArray.id, name: activeArray.name, data: null};
                                dataArray.push(historyObj);
                            }
                        }
                        else array.splice(1);
                    }, catalogMaterials.materials);
                } else if(props.matId?.indexOf && ~props.matId.indexOf("#")) {
                    if(props.addMaterial && R2D.Pool.getProductData(props.addMaterial)) {
                        Object.values(typeof structuredClone !== 'undefined' ? structuredClone(R2D.Pool.getProductData(props.addMaterial).categoryMaterial) : JSON.parse(JSON.stringify(R2D.Pool.getProductData(props.addMaterial).categoryMaterial)))[0]?.reverse().reduce((prevVal, currVal, index, array) => {
                            let activeArray = prevVal.find(y => y.id == currVal.id);
                            let parentId = array[index - 1] && array[index - 1].id || null;
                            if(activeArray) {
                                if(activeArray.nodes && activeArray.type !== "colorpicker") {
                                    historyObj = {id: activeArray.id, parentId, name: activeArray.name, id: activeArray.id, data: activeArray.nodes, type: "catalog"};
                                    dataArray.push(historyObj);
                                    return activeArray.nodes;
                                } 
                                else {
                                    historyObj = {parentId, urlList: activeArray.urlList?.replace('/api/category/materialsByCategory', R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, '')) + '&category_type=1', id: activeArray.id, name: activeArray.name, privateMaterialType: activeArray.privateMaterialType, type: "colorpicker"};
                                    dataArray.push(historyObj);
                                }
                            }
                            else array.splice(1);
                        }, catalogMaterials.materials);
                    }
                }
            } 
            if(props.materialsSource.type == "set") {
                if(props.materialsSource.data) {
                    let loadedData = await user.loadRightPanelData(R2D.URL.URL_GET_SET_TREE + "&set_id=" + props.materialsSource.data);
                    if(loadedData.status != "success" || !loadedData?.products || (!loadedData?.products.set && !loadedData?.products.materials) || (!loadedData?.products.set.nodes && loadedData?.products.materials.length < 1)) {
                        dispatch(setActivePopup({name: "alert", data: "TEXT_ERROR_LOAD_DATA"}));
                    } else {
                        if(loadedData.products.materials.length > 0) {
                            dataArray.push({type: "catalogMaterialsSets", parentId: null, id: null, name: loadedData.products?.set?.text || '', data: loadedData.products.materials, added: true})
                        } else {
                            let result;
                            if(loadedData.products.set.nodes.length == 1) {
                                loadedData.products.set.nodes.some(i => {
                                    result = goForward(i);
                                    result && result.push({type: "catalogSets", parentId: null, data: loadedData.products.set.nodes, id: null, added: true});
                                    return result ? true : false;
                                });
                            } else {
                                result = [];
                                result.push({type: "catalogSets", parentId: null, data: loadedData.products.set.nodes, id: null, added: true});
                            }
                            dataArray = [...dataArray, ...result.reverse()]
                        }
                    }   
                }
            };
            dataArray && dataArray.length > 0 && historyUpdateFunctions(dataArray);
        }
        return historyObj;
    }

    let mainDiv = useRef(null);

    let copyPasteDiv = useRef(null);
    let copyDiv = useRef(null);
    let pasteDiv = useRef(null);

    let copyImage = useRef(null);
    let pasteImage = useRef(null);

    let timeoutId = null;

    let mouseLeaveCopyPaste = e => {
        clearTimeout(timeoutId);
        let hoverDiv = document.querySelector("." + classes.btn_hover);
        hoverDiv && hoverDiv.remove();
    }

    let mouseUpBtnCopy = e => props.onCopyPaste.copy(props.matId, props.addMaterial, props.onCopyPaste.index);

    let mouseUpBtnPaste = e => onPaste(e);

    let onMouseUpCopyPaste = e => {
        document.removeEventListener("mouseup", onMouseUpCopyPaste);
    }

    let mouseDownBtnCopyPaste = e => {
        document.addEventListener("mouseup", onMouseUpCopyPaste);
        mouseLeaveCopyPaste(e);
    }
    
    useEffect(() => () => {
        document.querySelector(".product_hover") ? document.querySelector(".product_hover").remove() : null
    }, []);

    useEffect(() => {
        const loadMaterial = async () => {
            setIsLoaded({...isLoaded, status: false});
            if(props.mesh) {
                let matSrc = R2D.Tool.getPrevEmbeddedMatFromMesh(R2D.scene.currentView3DObject.getMeshByHash(R2D.scene.currentSceneObject.getMaterials()[+props.mesh].hash))?.toDataURL();
                setIsLoaded({...isLoaded, materialSrc: matSrc || '', status: true});
            }
            else if(props.hash) setIsLoaded({...isLoaded, materialSrc: R2D.modelUploader.getPartMatPreview(props.hash).toDataURL(), status: true});
            else {
                if(!props.matId) {
                    if(props.matId === 0) setIsLoaded({...isLoaded, materialSrc: "", status: true});
                    else return;
                }
                else {
                    if(props.addMaterial) {
                        let matPrevCanvas = await R2D.Tool.getMatPrevFromMatIdAndColor(props.addMaterial, props.matId);
                        setIsLoaded({...isLoaded, materialSrc: matPrevCanvas.toDataURL(), status: true});
                    } else {
                        if(props.matId.indexOf && ~props.matId.indexOf("#")) setIsLoaded({...isLoaded, materialSrc: props.matId, status: true});
                        else if(R2D.Pool.getProductData(props.matId)) setIsLoaded({...isLoaded, materialSrc: R2D.URL.DOMAIN + R2D.Pool.getProductData(props.matId).source.images.preview, status: true});
                        else setTimeout(() => setIsLoaded({...isLoaded, needUpdate: Math.random()}), 100);
                    }
                } 
            }
        }

        loadMaterial();
    }, [props.matId, props.addMaterial, props.hash, props.mesh, isLoaded.needUpdate]);

    useEffect(() => {
        if(!props.addMaterial && props.matId && props.matId.indexOf && ~props.matId.indexOf("#")) return setMatName(props.matId);
        let currIdMat = props.addMaterial ? props.addMaterial : props.matId && (!props.matId.indexOf || props.matId.indexOf("#") == -1) ? props.matId : "";
        if(!currIdMat || !R2D.Pool.getProductData(currIdMat) || !R2D.Pool.getProductData(currIdMat).categoryMaterial) return;
        
        if(catalogMaterials && catalogMaterials.materials && catalogMaterials.materials.length > 0) {
            Object.values(typeof structuredClone !== 'undefined' ? structuredClone(R2D.Pool.getProductData(currIdMat).categoryMaterial) : JSON.parse(JSON.stringify(R2D.Pool.getProductData(currIdMat).categoryMaterial)))[0]?.reverse().reduce((prevVal, currVal, index, array) => {
                let activeArray = prevVal.find(y => y.id == currVal.id);
                if(activeArray) {
                    if(activeArray.nodes) return activeArray.nodes;
                    else if(activeArray.urlList){
                        (async () => {
                            let loadedData = await planner.scene.categoryDataLoad(activeArray.urlList.replace('/api/category/materialsByCategory', R2D.URL.URL_CATALOG_SEARCH.replace(/\?key=\w{1,}$/gm, ''))  + '&category_type=1');
                            let materialName = loadedData?.find && loadedData.find(i => i.id == currIdMat);
                            setMatName(materialName?.name || "");
                        })();
                    }
                }
                else array.splice(1);
            }, catalogMaterials.materials);
        }
    }, [props.matId, props.addMaterial]);

    useEffect(() => {
        setShowCopy(props.onCopyPaste.hasOwnProperty('statusCopy') ? props.onCopyPaste.statusCopy : true)
    }, [props.onCopyPaste])

    return (
        (props.matId != null || props.hash != null || props.mesh != null) &&
        <div className={classes.editMatItemWr} ref={mainDiv} style={props.customStyles}>
            <div className={classes.editMatItem} onMouseEnter={mouseEnter} onMouseLeave={mouseLeave}>
                {
                    isLoaded.status ? 
                    <div className={classes.editMatItem_main}>
                        <div className={classes.editMatImg + ' ' + (props.clickedElementAddClass || '')} style={~isLoaded.materialSrc.indexOf("#") ? { backgroundColor: isLoaded.materialSrc } : {backgroundImage: "url(" + isLoaded.materialSrc + ")"}} onClick={onClickPreview}></div>
                        {
                            props.lockMaterialStatus =='basic' ?
                                <Lock additionalClass={classes.prod_item_zamok_btn} tipPositionY={'top'} tipPositionX={'right'} upgradePro={true} upgradeBasic={true} textHover={"UPGRADE_YOUR_PLAN_TEXT"} parentClass={classes.editMatItem}/>
                                : props.lockMaterialStatus == 'pro' ?
                                    <Lock additionalClass={classes.prod_item_zamok_btn} tipPositionY={'top'} tipPositionX={'right'} upgradePro={true}  textHover={"UPGRADE_YOUR_PLAN_TEXT"} parentClass={classes.editMatItem}/>
                                    : null
                        }


                        <div className={classes.editMat} ref={copyPasteDiv}>
                            {
                                showCopy ?
                                    <div className={classes.editMat_copy} ref={copyDiv}>
                                        <HoverComponent hoverText={ translation["BUTTON_COPY_MATERIAL"] } parentRef={copyDiv} hoverTextPositionX={'right'} hoverTextPositionY={'top'}>
                                            <svg className={classes.editMatEditIcon} ref={copyImage} width="16" height="16" viewBox="0 0 16 16" fill="none" onMouseDown={mouseDownBtnCopyPaste} onMouseUp={mouseUpBtnCopy}>
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
                                    :
                                    <svg className={classes.editMatEditIcon_disabled} ref={copyImage} width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <rect x="3.5" y="0.5" width="12" height="12" stroke="#828282"/>
                                        <rect className={classes.rectHover2} y="3" width="2" height="1" fill="#828282"/>
                                        <rect className={classes.rectHover} y="15" width="13" height="1" fill="#828282"/>
                                        <rect className={classes.rectHover} y="15" width="11" height="1"
                                                transform="rotate(-90 0 15)" fill="#828282"/>
                                        <rect className={classes.rectHover} x="12" y="15" width="1" height="1"
                                                transform="rotate(-90 12 15)" fill="#828282"/>
                                    </svg>
                            }

                            <div className={classes.editMat_paste} ref={pasteDiv}>
                                <HoverComponent hoverText={ translation["BUTTON_PASTE_MATERIAL"] } parentRef={pasteDiv} hoverTextPositionX={'right'} hoverTextPositionY={'top'}>
                                    <svg className={classes.editMatEditIcon} ref={pasteImage} width="15" height="16" viewBox="0 0 15 16" fill="none" onMouseDown={mouseDownBtnCopyPaste} onMouseUp={mouseUpBtnPaste} >
                                        <rect x="0.5" y="-0.5" width="11.1875" height="12" transform="matrix(1 0 0 -1 2.8125 15)" fill="white" stroke="white"/>
                                        <rect width="1.875" height="1" transform="matrix(1 0 0 -1 0 13)" fill="white"/>
                                        <rect width="12.1875" height="1" transform="matrix(1 0 0 -1 0 1)" fill="white"/>
                                        <rect width="11" height="0.9375" transform="matrix(-4.37114e-08 1 1 4.37114e-08 0 1)" fill="white"/>
                                        <rect width="1" height="0.9375" transform="matrix(-4.09794e-08 1 1 4.66255e-08 11.25 1)" fill="white"/>
                                    </svg>
                                </HoverComponent>
                            </div>
                        </div>

                    </div>
                    :
                    <div className={"preloader-cube"}></div>
                }
            </div>
        </div>
    );
};

export default MaterialComponent;