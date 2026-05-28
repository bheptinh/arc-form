import React, { useState, useEffect, useMemo, useRef } from 'react';
import {createUseStyles} from "react-jss";
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from "simplebar-react";

import { planner, user } from '../../../../../../../initR2D';

import { selectTranslation } from '../../../../../../../redux/features/language/languageSlice';
import { changeUndoRedo } from '../../../../../../../redux/features/topPanel/topPanelSlice';
import { setActivePopup } from '../../../../../../../redux/features/popups/popupsSlice';
import { selectIsLogged } from '../../../../../../../redux/features/user/userSlice';
import {
    selectActiveControlPanelModeData,
    updateAnimateFavoritesHideStatus, updateAnimateFavoritesShowStatus
} from '../../../../../../../redux/features/control/controlPanelSlice';
import { selectActiveViewMode } from '../../../../../../../redux/features/viewMode/viewModeSlice';

import FavoriteStarIcon from "../../../../../../common/FavoriteStarIcon";
import MaterialComponent from '../../../components/MaterialComponent';

const useStyle = createUseStyles({
    '@font-face': [
        {
            fontFamily: "RobotoCondensed-Regular",
            fontWeight: 300,
            fontDisplay: 'swap',
            src: 'url("/src_designer/fonts/RobotoCondensed-Regular.ttf") format("truetype")'
        },
    ],
    planerWallsCont: {
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
        borderTop: '1px solid #C6C4C4',
    },
    catalog_top_wr:{
        padding: "10px 10px 10px 10px",
        '@media screen and (max-width: 950px)':{
            padding: 5,
        }
    },
    planerWallsTitleWr:{
        display: 'flex',
        alignItems: 'center'
    },
    planerWallsTitle:{
        fontSize: 17,
        color: "#2F2F2F",
        fontFamily: "RobotoCondensed-Regular",
        marginLeft: 10,
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
            marginLeft: 3,
        }
    },
    catalog_top_selected_preview:{
        width: "21px",
        height: "16px",
        position: "relative",
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
        flexShrink: 0,
        '& img':{
            top: "50%",
            left: "0",
            position: "absolute",
            maxWidth: "100%",
            transform: "translateY(-50%)"
        },
        '@media screen and (max-width: 950px)':{
            width: 11,
            height: 14,
        }
    },
    planerWallsWrap: {
        overflow: 'hidden',
        height: '100%',
        position: 'relative',
        background: '#fff',
    },
    prod_item_fav_btn:{
        width: "18px",
        height: "18px",
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
            height: "auto",
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
        '@media screen and (max-width: 950px)':{
            opacity: 1,
        }
    },
    prod_item_fav_btn_active:{
        '& path': {
            fill: '#64BCF0',
            stroke: '#64BCF0',
            fillOpacity: 1
        }
    },
    planerWallsCurentMatWr:{
        borderBottom: "1px solid #BEBCBC",
        display: "grid",
        marginBottom: 10,
        position: 'relative',
        overflow: "hidden",
        '&:hover':{
            '& $prod_item_fav_btn':{
                opacity: 1
            }
        }
    },
    showItemWr:{
        display: 'flex',
        alignItems: 'center',
        margin: '0 14px',
        '@media screen and (max-width: 950px)':{
            margin: '0 5px',
        }
    },
    showItemIconWr:{

    },
    showItemIcon:{
        width: 20,
        height: 'auto',
        cursor: 'pointer',
        '& svg path':{
            transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)'
        },
        '&:hover':{
            '& path':{
                fill: '#a0a0a0'
            }
        },
        '@media screen and (max-width: 950px)':{
            width: 12,
        }
    },
    showItemInput:{
        color: '#2F2F2F',
        border: 'none',
        margin: '0 8px 0 4px',
        outline: 'none',
        padding: '3px 5px',
        maxWidth: 'calc(100% - 12px)',
        fontSize: 14,
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
            padding: '3px 2px',
        }
    },
    showItemText: {
        color: '#2F2F2F',
        border: 'none',
        margin: '0 8px 0 4px',
        outline: 'none',
        padding: '3px 5px',
        maxWidth: 'calc(100% - 12px)',
        fontSize: 14,
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
            padding: '3px 2px',
        }
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
    const classes = useStyle();
    let dispatch = useDispatch();
    let translation = useSelector(selectTranslation);

    let activeViewMode = useSelector(selectActiveViewMode)
    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let isAdded = lastHistoryElem?.isAdded;

    let isLogged = useSelector(selectIsLogged);

    let currObj = useMemo(() => planner.mih()._scene.currentView3DObject?.constructorElementData || planner.mih()._scene.prevSelectedView3DObject?.constructorElementData, []);

    let roomName = useRef();
    let areaText = useRef();
    let ceilingVisibleText = useRef();

    let [previewMaterialId, setPreviewMaterialId] = useState(null);
    let [previewAddMaterialId, setPreviewAddMaterialId] = useState(null);
    let [preloaderStatus, setPreloaderStatus] = useState(true);
    let [isInFavorites, setIsInFavorites] = useState(user.data.favorites?.items?.find(i => currObj?.addMaterialID ? i?.id == currObj?.addMaterialID && i.addData == currObj?.materialID : i?.id == currObj?.materialID) ? true : false);

    let [area, setArea] = useState("");

    let [isRoomNameVisible, setRoomNameVisible] = useState();
    let [isAreaTextVisible, setAreaTextVisible] = useState();
    let [isCeilingVisible, setCeilingVisible] = useState();
    let [lockMaterialStatus, setLockMaterialStatus] = useState(false);

    let [styleAnimation, setStyleAnimation] = useState(isAdded ? {transform: "translateX(100%)"} : { transform: "translateX(-100%)" });

    let onSetCeilingVisible = e => {
        if(!currObj) return;
        isCeilingVisible ? planner.scene.makeElementHidden('ceilings', currObj.ceiling.id) : planner.scene.makeElementVisible('ceilings', currObj.ceiling.id);
        setCeilingVisible(!isCeilingVisible);
    }

    let onHideRoomName = e => {
        if(!currObj.title) return;
        currObj.title.visible[R2D.Viewers.getCurrentViewerName()] = !isRoomNameVisible;
        setRoomNameVisible(currObj.title.visible[R2D.Viewers.getCurrentViewerName()]);
        if (activeViewMode === "view3d") R2D.view3d.coversTitleViewer3D.update();
        else planner.mih()._titlesTool.updateValues(currObj.id);
    }

    let onHideAreaText = e => {
        if(!currObj.title) return;
        currObj.title.areaVisible[R2D.Viewers.getCurrentViewerName()] = !isAreaTextVisible;
        setAreaTextVisible(currObj.title.areaVisible[R2D.Viewers.getCurrentViewerName()]);
        if (activeViewMode === "view3d") R2D.view3d.coversTitleViewer3D.update();
        else planner.mih()._titlesTool.updateValues(currObj.id);
    }

    let onCopyMaterial = (id, addMaterial) => R2D.CopyPaste.copyMaterial({id, addMaterial, materialRotation: currObj.getMaterialRotation()});

    let onPasteMaterial = () => {
        let mat = R2D.CopyPaste.pasteMaterial();
        if (mat?.id) {
            setPreviewMaterialId(mat.id);
            setPreviewAddMaterialId(mat.addMaterial);
            currObj.setMaterial(mat.id);
            currObj.setAddMaterial(mat.addMaterial);
            currObj.setMaterialRotation(mat.materialRotation);
            currObj.build3D();
            currObj.dispatchUpdate();
            R2D.scene.history.saveState();
            dispatch(changeUndoRedo());
            planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
        } else if(mat?.type == "logoMesh") {
            dispatch(setActivePopup({name: "alert", data: translation["TEXT_PASTE_LOGO_INTO_MATERIAL_MESH_ERROR"]}))
        }
    }

    let updateFavorites = async () => {
        if(!isLogged) return dispatch(setActivePopup({name: "login"}));
        let id = currObj.addMaterialID || currObj.materialID;
        let color = currObj.addMaterialID ? currObj.materialID : "";
        if(isInFavorites) {
            await user.uRemoveFromFavorites(id, color);
            dispatch(updateAnimateFavoritesHideStatus(true));
            setTimeout(() =>  dispatch(updateAnimateFavoritesHideStatus(false)), 10);
        }
        else {
            await user.uAddToFavorites(id, color);

            dispatch(updateAnimateFavoritesShowStatus(true));
            setTimeout(() =>  dispatch(updateAnimateFavoritesShowStatus(false)), 10);
        }
        setIsInFavorites(!isInFavorites);
        planner.apiScene.dispatchEvent(new Event(planner.apiScene.FAVORITES_BUTTON, {}));
    };

    let updateMaterialsEvent = e => {
        setPreviewMaterialId(currObj?.getMaterial());
        setPreviewAddMaterialId(currObj?.getAddMaterial());
    };

    useEffect(() => {
        let keyTimeout = setTimeout(() => setStyleAnimation({ transform: "translateX(0%)"}), 50);
        setPreviewMaterialId(currObj?.getMaterial());
        setPreviewAddMaterialId(currObj?.getAddMaterial());
        setArea(planner.units.squareToString(currObj?.area));
        setRoomNameVisible(currObj?.title ? currObj.title.visible[R2D.Viewers.getCurrentViewerName()] : null);
        setAreaTextVisible(currObj?.title ? currObj.title.areaVisible[R2D.Viewers.getCurrentViewerName()] : null);
        setCeilingVisible(currObj?.ceiling?.exists && !currObj?.ceiling?.partialVisible ? true : false);
        setPreloaderStatus(false);
        planner.scene.addEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
        return () => {
            planner.scene.removeEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
            clearTimeout(keyTimeout);
        }
    }, []);

    useEffect(() => {
        let pollMaterials = Object.entries(R2D.Pool._products_data);
        let currentMaterial = pollMaterials.find(y=>y[0] == previewMaterialId);
        let plan = currentMaterial?.[1]?.plan;

        if(user.data.plan == 'free'){
            if (Array.isArray(plan) || plan !== 'free' && plan) {
                setLockMaterialStatus(true);
            } else{
                setLockMaterialStatus(false);
            }
        }
    }, [lockMaterialStatus, isLogged, previewMaterialId]);

    return (
        previewMaterialId &&
        <div className={classes.planerWallsCont} style={styleAnimation}>
            <div className={classes.catalog_top_wr}>
                <div className={classes.planerWallsTitleWr}>
                    <div className={classes.catalog_top_selected_preview}>
                        <img src={props.panelPreviewIcon}/>
                    </div>
                    <div className={classes.planerWallsTitle}>{ translation["PANEL_FLOOR_WALL"] }</div>
                </div>
            </div>
            <div className={classes.catalog_wr}>
                <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
                    <div className={classes.planerWallsWrap}>
                    <div className={classes.planerWallsCurentMatWr}>
                        <div className={isInFavorites ? classes.prod_item_fav_btn + ' ' + classes.prod_item_fav_btn_active : classes.prod_item_fav_btn} onClick={updateFavorites}>
                            <FavoriteStarIcon/>
                        </div>
                        <MaterialComponent customStyles={{border: 0}} lockMaterialStatus={lockMaterialStatus} matId={previewMaterialId} materialsSource={{type: "bank", data: null}} addMaterial={previewAddMaterialId} onCopyPaste={{copy: onCopyMaterial, paste: onPasteMaterial,statusCopy: lockMaterialStatus ? false : true}} lock={false}/>
                    </div>

                    <div className={classes.showItemWr}>
                        {
                            <div className={classes.showItemIconWr} onClick={onHideRoomName}>
                                {
                                    isRoomNameVisible ?
                                    <svg className={classes.showItemIcon} width="17" height="11" viewBox="0 0 17 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g id="Group 858">
                                            <path id="Vector (Stroke)" fillRule="evenodd" clipRule="evenodd" d="M1.29185 5.40909C1.7668 6.04297 2.60517 7.03185 3.74832 7.8932C5.02799 8.85742 6.62925 9.61818 8.50001 9.61818C10.3708 9.61818 11.972 8.85742 13.2517 7.8932C14.3948 7.03186 15.2332 6.04298 15.7082 5.40909C15.2332 4.7752 14.3948 3.78632 13.2517 2.92498C11.972 1.96076 10.3708 1.2 8.50001 1.2C6.62925 1.2 5.02799 1.96076 3.74832 2.92498C2.60517 3.78633 1.7668 4.77521 1.29185 5.40909ZM0.157638 4.92719C1.10347 3.60183 4.08046 0 8.50001 0C12.9196 0 15.8965 3.60183 16.8424 4.92719C17.0525 5.22172 17.0525 5.59646 16.8424 5.89099C15.8965 7.21635 12.9196 10.8182 8.50001 10.8182C4.08046 10.8182 1.10347 7.21635 0.157638 5.89099C-0.0525461 5.59646 -0.0525461 5.22172 0.157638 4.92719Z" fill="#444444"/>
                                            <path id="Vector" d="M11.5881 5.40875C11.5881 7.11585 10.2042 8.49969 8.49714 8.49969C6.79015 8.49969 5.40625 7.11585 5.40625 5.40875C5.40625 4.94233 5.50959 4.4999 5.69463 4.10338C5.99312 3.46368 6.50421 2.94313 7.13695 2.63247C7.54738 2.431 8.00905 2.31787 8.49714 2.31787C10.2042 2.31787 11.5881 3.70175 11.5881 5.40875Z" fill="#444444"/>
                                        </g>
                                    </svg>
                                    :
                                    <svg className={classes.showItemIcon} width="20" height="8" viewBox="0 0 20 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g opacity="0.99">
                                        <path d="M2.51735 1.5L3.82567 2.49474L1.80832 4.781L0.5 3.78626L2.51735 1.5Z" fill="#444444"/>
                                        <path d="M5.26159 4.05685L6.91179 4.52952L5.7509 7.73986L4.1007 7.26719L5.26159 4.05685Z" fill="#444444"/>
                                        <path d="M13.185 4.06411L11.5119 4.4836L12.5652 7.72581L14.2383 7.30632L13.185 4.06411Z" fill="#444444"/>
                                        <path d="M16.9732 1.5L15.6648 2.49474L17.754 4.87551L19.0624 3.88077L16.9732 1.5Z" fill="#444444"/>
                                        </g>
                                        <path fillRule="evenodd" clipRule="evenodd" d="M1.00781 0.5C1.02341 0.636435 1.07423 0.770432 1.16027 0.890988C2.1061 2.21635 5.08308 5.81818 9.50264 5.81818C13.9222 5.81818 16.8992 2.21635 17.845 0.890988C17.931 0.770432 17.9818 0.636435 17.9974 0.5H16.642C16.157 1.1349 15.3442 2.07201 14.2543 2.8932C12.9747 3.85742 11.3734 4.61818 9.50264 4.61818C7.63188 4.61818 6.03062 3.85742 4.75094 2.8932C3.66109 2.072 2.84826 1.13489 2.36326 0.5H1.00781Z" fill="#444444"/>
                                    </svg>
                                }
                            </div>
                        }
                        <p className={classes.showItemInput} ref={roomName}>{ translation["ROOM_TITLE_TEXT"] }</p>
                    </div>


                    <div className={classes.showItemWr}>
                        {
                            <div className={classes.showItemIconWr} onClick={onHideAreaText}>
                                {
                                    isAreaTextVisible ?
                                    <svg className={classes.showItemIcon} width="17" height="11" viewBox="0 0 17 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g id="Group 858">
                                            <path id="Vector (Stroke)" fillRule="evenodd" clipRule="evenodd" d="M1.29185 5.40909C1.7668 6.04297 2.60517 7.03185 3.74832 7.8932C5.02799 8.85742 6.62925 9.61818 8.50001 9.61818C10.3708 9.61818 11.972 8.85742 13.2517 7.8932C14.3948 7.03186 15.2332 6.04298 15.7082 5.40909C15.2332 4.7752 14.3948 3.78632 13.2517 2.92498C11.972 1.96076 10.3708 1.2 8.50001 1.2C6.62925 1.2 5.02799 1.96076 3.74832 2.92498C2.60517 3.78633 1.7668 4.77521 1.29185 5.40909ZM0.157638 4.92719C1.10347 3.60183 4.08046 0 8.50001 0C12.9196 0 15.8965 3.60183 16.8424 4.92719C17.0525 5.22172 17.0525 5.59646 16.8424 5.89099C15.8965 7.21635 12.9196 10.8182 8.50001 10.8182C4.08046 10.8182 1.10347 7.21635 0.157638 5.89099C-0.0525461 5.59646 -0.0525461 5.22172 0.157638 4.92719Z" fill="#444444"/>
                                            <path id="Vector" d="M11.5881 5.40875C11.5881 7.11585 10.2042 8.49969 8.49714 8.49969C6.79015 8.49969 5.40625 7.11585 5.40625 5.40875C5.40625 4.94233 5.50959 4.4999 5.69463 4.10338C5.99312 3.46368 6.50421 2.94313 7.13695 2.63247C7.54738 2.431 8.00905 2.31787 8.49714 2.31787C10.2042 2.31787 11.5881 3.70175 11.5881 5.40875Z" fill="#444444"/>
                                        </g>
                                    </svg>
                                    :
                                    <svg className={classes.showItemIcon} width="20" height="8" viewBox="0 0 20 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g opacity="0.99">
                                        <path d="M2.51735 1.5L3.82567 2.49474L1.80832 4.781L0.5 3.78626L2.51735 1.5Z" fill="#444444"/>
                                        <path d="M5.26159 4.05685L6.91179 4.52952L5.7509 7.73986L4.1007 7.26719L5.26159 4.05685Z" fill="#444444"/>
                                        <path d="M13.185 4.06411L11.5119 4.4836L12.5652 7.72581L14.2383 7.30632L13.185 4.06411Z" fill="#444444"/>
                                        <path d="M16.9732 1.5L15.6648 2.49474L17.754 4.87551L19.0624 3.88077L16.9732 1.5Z" fill="#444444"/>
                                        </g>
                                        <path fillRule="evenodd" clipRule="evenodd" d="M1.00781 0.5C1.02341 0.636435 1.07423 0.770432 1.16027 0.890988C2.1061 2.21635 5.08308 5.81818 9.50264 5.81818C13.9222 5.81818 16.8992 2.21635 17.845 0.890988C17.931 0.770432 17.9818 0.636435 17.9974 0.5H16.642C16.157 1.1349 15.3442 2.07201 14.2543 2.8932C12.9747 3.85742 11.3734 4.61818 9.50264 4.61818C7.63188 4.61818 6.03062 3.85742 4.75094 2.8932C3.66109 2.072 2.84826 1.13489 2.36326 0.5H1.00781Z" fill="#444444"/>
                                    </svg>
                                }
                            </div>
                        }
                        <p className={classes.showItemText} ref={areaText} >{ translation["TEXT_CONSTRUCTION_ELEMENT_AREA"] + " " + area }</p>
                    </div>

                    <div className={classes.showItemWr}>
                        {
                            <div className={classes.showItemIconWr} onClick={onSetCeilingVisible}>
                                {
                                    isCeilingVisible ?
                                    <svg className={classes.showItemIcon} width="17" height="11" viewBox="0 0 17 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g id="Group 858">
                                            <path id="Vector (Stroke)" fillRule="evenodd" clipRule="evenodd" d="M1.29185 5.40909C1.7668 6.04297 2.60517 7.03185 3.74832 7.8932C5.02799 8.85742 6.62925 9.61818 8.50001 9.61818C10.3708 9.61818 11.972 8.85742 13.2517 7.8932C14.3948 7.03186 15.2332 6.04298 15.7082 5.40909C15.2332 4.7752 14.3948 3.78632 13.2517 2.92498C11.972 1.96076 10.3708 1.2 8.50001 1.2C6.62925 1.2 5.02799 1.96076 3.74832 2.92498C2.60517 3.78633 1.7668 4.77521 1.29185 5.40909ZM0.157638 4.92719C1.10347 3.60183 4.08046 0 8.50001 0C12.9196 0 15.8965 3.60183 16.8424 4.92719C17.0525 5.22172 17.0525 5.59646 16.8424 5.89099C15.8965 7.21635 12.9196 10.8182 8.50001 10.8182C4.08046 10.8182 1.10347 7.21635 0.157638 5.89099C-0.0525461 5.59646 -0.0525461 5.22172 0.157638 4.92719Z" fill="#444444"/>
                                            <path id="Vector" d="M11.5881 5.40875C11.5881 7.11585 10.2042 8.49969 8.49714 8.49969C6.79015 8.49969 5.40625 7.11585 5.40625 5.40875C5.40625 4.94233 5.50959 4.4999 5.69463 4.10338C5.99312 3.46368 6.50421 2.94313 7.13695 2.63247C7.54738 2.431 8.00905 2.31787 8.49714 2.31787C10.2042 2.31787 11.5881 3.70175 11.5881 5.40875Z" fill="#444444"/>
                                        </g>
                                    </svg>
                                    :
                                    <svg className={classes.showItemIcon} width="20" height="8" viewBox="0 0 20 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g opacity="0.99">
                                        <path d="M2.51735 1.5L3.82567 2.49474L1.80832 4.781L0.5 3.78626L2.51735 1.5Z" fill="#444444"/>
                                        <path d="M5.26159 4.05685L6.91179 4.52952L5.7509 7.73986L4.1007 7.26719L5.26159 4.05685Z" fill="#444444"/>
                                        <path d="M13.185 4.06411L11.5119 4.4836L12.5652 7.72581L14.2383 7.30632L13.185 4.06411Z" fill="#444444"/>
                                        <path d="M16.9732 1.5L15.6648 2.49474L17.754 4.87551L19.0624 3.88077L16.9732 1.5Z" fill="#444444"/>
                                        </g>
                                        <path fillRule="evenodd" clipRule="evenodd" d="M1.00781 0.5C1.02341 0.636435 1.07423 0.770432 1.16027 0.890988C2.1061 2.21635 5.08308 5.81818 9.50264 5.81818C13.9222 5.81818 16.8992 2.21635 17.845 0.890988C17.931 0.770432 17.9818 0.636435 17.9974 0.5H16.642C16.157 1.1349 15.3442 2.07201 14.2543 2.8932C12.9747 3.85742 11.3734 4.61818 9.50264 4.61818C7.63188 4.61818 6.03062 3.85742 4.75094 2.8932C3.66109 2.072 2.84826 1.13489 2.36326 0.5H1.00781Z" fill="#444444"/>
                                    </svg>

                                }
                            </div>
                        }
                        <p className={classes.showItemText} ref={ceilingVisibleText}>{ translation["TEXT_SHOW_CEIL"] }</p>
                    </div>
                </div>
                </SimpleBar>
                <div className={classes.preloaderBlock} style={preloaderStatus ? { opacity: 1 } : { opacity: 0, zIndex: -1 }}><div className={"preloader-cube"}></div></div>
            </div>
        </div>          
    );
};

export default Main;