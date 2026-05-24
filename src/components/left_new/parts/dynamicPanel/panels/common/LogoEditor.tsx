import React, { useState, useEffect, useMemo, useRef } from 'react';
import {createUseStyles} from "react-jss";
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import 'simplebar-react/dist/simplebar.min.css';

import { planner } from '../../../../../../initR2D';
import { selectTranslation } from '../../../../../../redux/features/language/languageSlice';
import { changeUndoRedo } from '../../../../../../redux/features/topPanel/topPanelSlice';
import { selectLockState, updatePreloaderStatus } from '../../../../../../redux/features/common/commonSlice';
import { controlPanelHistoryReplaceArray, controlPanelUpdateBreadCrumbs, selectActiveControlPanelModeData } from '../../../../../../redux/features/control/controlPanelSlice';
import { removeQuickPanel, selectQuickPanels, showQuickPanel } from '../../../../../../redux/features/quickPanels/quickPanelsSlice';

import ChangeSize from '../../../../../common/ChangeSize';
import LockSize from '../../../../../common/LockSize';

import Navigation from '../../navigation/Navigation';
import LogoComponent from '../../components/LogoComponent';

const useStyle = createUseStyles({
    '@font-face': [
        {
            fontFamily: "RobotoCondensed-Regular",
            fontWeight: 300,
            fontDisplay: 'swap',
            src: 'url("/src_designer/fonts/RobotoCondensed-Regular.ttf") format("truetype")'
        },
    ],
    planner_logoMesh_cont:{
        background: '#fff',
        height: '100%',
        alignContent: "baseline",
        transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
        width: 309,
        position: 'absolute',
        left: 0,
        top: 0,
        borderRight: '1px solid #cdcdcd',
        '@media screen and (max-width: 950px)':{
            width: 189
        }
    },
    catalog_wr:{
        overflow: 'hidden',
        height: '100%',
        background: '#fff'
    },
    item_info_content:{
        padding: '0 6px 8px 6px',
        color: "#7B7B7B",
        fontSize: "13px",
        lineHeight: 1.4,
        marginTop: 8,
        '& span':{
            color: '#000'
        },
        '&>div>div': {
            fontSize: "17px",
            color: "#000000",
            display: "inline-block",
            fontFamily: "RobotoCondensed-Regular",
        },
        '@media screen and (max-width: 950px)':{
            padding: '0 5px 5px 5px',
            marginTop: 5,
            fontSize: 11
        }
    },
    item_info_name:{
        fontSize: "17px",
        fontFamily: "RobotoCondensed-Regular",
        lineHeight: 0.8,
        color:' #000',
        marginBottom: 8,
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
            marginBottom: 3
        }
    },
    planner_logoMesh_prod_item: {

    },
    planner_logoMesh_prod_item_img_wr:{
        overflow: "hidden",
        width: "100%",
        height: 300,
        display: "flex",
        position: 'relative',
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 7,
        '& img':{
            maxWidth: "100%",
            maxHeight: "100%",
            transition: "all .9s cubic-bezier(.19,1,.22,1)"
        },
        '@media screen and (max-width: 950px)':{
            height: 188,
            padding: 13
        }
    },
    plannerChangeSizesWrap:{
        display: 'grid',
        gridTemplateColumns: 'auto 27px',
        gridGap: 10,
        padding: '0 50px 0 14px',
        '@media screen and (max-width: 950px)':{
            padding: '0 14px 0 5px'
        }
    },
    plannerChangeSizes:{

    },
    changeSizesLockWr:{
        position: 'relative',
        height: 75,
        display: 'grid',
        paddingTop: 13
    },
    changeSizesLockLine1:{
        width: '100%',
        height: 11,
        borderTop: '1px solid #A1A1A1',
        borderRight: '1px solid #A1A1A1',
        opacity: '0.5'
    },
    changeSizesLockLine3:{
        width: '100%',
        height: 11,
        borderBottom: '1px solid #A1A1A1',
        borderRight: '1px solid #A1A1A1',
        opacity: '0.5'
    },
    planner_logoMesh_buttons:{
        display: "flex",
        justifyContent: 'space-between',
        marginTop: 20,
        padding: "0 14px",
        '@media screen and (max-width: 950px)':{
            padding: '0px 5px',
            marginTop: 10
        }
    },
    planner_logoMesh_button_delete :{
        border: '1px solid #AF3131',
        color: "#AF3131",
        width: '100%',
        padding: "7px 15px",
        textAlign: "center",
        cursor: 'pointer',
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
        '& > svg':{
            marginRight: 5
        },
        '& path, & rect':{
            transition: "all .9s cubic-bezier(.19,1,.22,1)",
        },
        '&:hover':{
            background: "#AF3131",
            color: '#ffffff',
            '& path, & rect':{
                fill: '#fff'
            }
        },
        '@media screen and (max-width: 950px)':{
            padding: '5px 9px',
            fontSize: 9,
            height: 26
        }
    },
    svg_rect_hover_stroke:{

    }
});

const LogoEditor = props => {
    const classes = useStyle();
    let dispatch = useDispatch();
    let translation = useSelector(selectTranslation);
    let quickPanels = useSelector(selectQuickPanels);

    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let isAdded = lastHistoryElem?.isAdded;
    let activeLogoIndex = lastHistoryElem?.index;
    let currObj = R2D.scene.currentView3DObject || R2D.scene.prevSelectedView3DObject;
    let currSceneObj = currObj?.sceneObject;

    let currentStateBreadCrumbs = activeControlPanelData?.breadCrumbs;

    let [activeMeshLogo, setActiveMeshLogo] = useState(currObj?.logoEditor ? Object.values(currObj.logoEditor.getDataForUIAllLogos())[activeLogoIndex] : null);
    let activeMeshLogoHash = currObj?.logoEditor && Object.keys(currObj.logoEditor.getDataForUIAllLogos())[activeLogoIndex];

    let lockState = useSelector(selectLockState);

    let [objectWidth, setObjectWidth] = useState(activeMeshLogo?.width || 0);
    let [objectHeight, setObjectHeight] = useState(activeMeshLogo?.height || 0);

    let panelPreviewIcon = currSceneObj?.getObjectData ? R2D.URL.DOMAIN + currSceneObj.getObjectData().source.images.preview : '';

    let [mouseDown, setMouseDown] = useState({status: false, action: null, type: null});
    let [styleAnimation, setStyleAnimation] = useState(isAdded ? {transform: "translateX(100%)"} : { transform: "translateX(-100%)" });

    let mainDiv = useRef(null);

    let onChangeSize = (mouseDown, value, type) => {
        if(!currObj) return;
        
        setMouseDown({...mouseDown, type});
        switch(type) {
            case "width":
                currObj.logoEditor.setLogoWidth(activeMeshLogoHash, value, lockState);
                break;
            case "height":
                currObj.logoEditor.setLogoHeight(activeMeshLogoHash, value, lockState);
                break;
        }

        let logoParams = currObj.logoEditor.getLogoParams(activeMeshLogoHash);

        setObjectWidth(logoParams.logoWidth);
        setObjectHeight(logoParams.logoHeight);

        !mouseDown.status && planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
        
        if(mouseDown.status == false) dispatch(changeUndoRedo());
    }

    let onChangeLogoSize = e => {
        setObjectWidth(e.data.width);
        setObjectHeight(e.data.height);
    };

    let onDeleteLogoMesh = e => {
        currObj.logoEditor.hideLogo(activeMeshLogoHash);
        setActiveMeshLogo(currObj ? Object.values(currObj.logoEditor?.getDataForUIAllLogos())[activeLogoIndex] : null);
        dispatch(controlPanelHistoryReplaceArray([]));
        dispatch(controlPanelUpdateBreadCrumbs({data: currentStateBreadCrumbs[0], updateType: "add"}));
    };

    let onUploadLogoMesh = e => {
        R2D.LogoEditor.uploadLogoImg().then((curLogoIndex) => {
            currObj.logoEditor.updateAfterUploadLogo(activeMeshLogoHash, curLogoIndex).then(res => {
                setTimeout(() => {
                    let newMeshLogo = currObj ? Object.values(currObj.logoEditor?.getDataForUIAllLogos())[activeLogoIndex] : null;
                    setActiveMeshLogo(newMeshLogo);
                    setObjectWidth(newMeshLogo?.width);
                    setObjectHeight(newMeshLogo?.height);
                    dispatch(updatePreloaderStatus(false));
                }, 0);
            });
        });
    };

    let onPasteLogoMesh = hash => {
        let pasteObj = R2D.CopyPaste.objFromClipboard();
        if (!pasteObj) return;

        if (pasteObj.type == "logoMesh") {
            currObj.logoEditor.pasteLogo(hash, pasteObj.value);
            let newMeshLogo = currObj ? Object.values(currObj.logoEditor?.getDataForUIAllLogos())[activeLogoIndex] : null;
            setActiveMeshLogo(newMeshLogo);
            setObjectWidth(newMeshLogo?.width);
            setObjectHeight(newMeshLogo?.height);
        } else if (pasteObj.type == "material") {
            currObj.logoEditor
                .pasteTextureAsLogo(hash, pasteObj.value.id, pasteObj.value.addMaterial)
                .then(() => {
                    let newMeshLogo = currObj ? Object.values(currObj.logoEditor?.getDataForUIAllLogos())[activeLogoIndex] : null;
                    setActiveMeshLogo(newMeshLogo);
                    setObjectWidth(newMeshLogo?.width);
                    setObjectHeight(newMeshLogo?.height);
                });
        }
    };

    useEffect(() => {
        dispatch(showQuickPanel({name: 'helper_logo_mesh', position: {x: quickPanels.helper_model.position.x, y: quickPanels.helper_model.position.y}, data: activeLogoIndex}));
        dispatch(removeQuickPanel({name: 'helper_model'}));

        currObj.logoEditor.focusCamera(activeMeshLogoHash);
                    
        setStyleAnimation({ transform: "translateX(0%)" });
        planner.scene.addEventListener(planner.scene.LOGO_CHANGE_SIZE, onChangeLogoSize);

        setObjectWidth(activeMeshLogo?.width);
        setObjectHeight(activeMeshLogo?.height);
        
        return () => {
            R2D.LogoEditor.unfocusCamera();
            planner.scene.removeEventListener(planner.scene.LOGO_CHANGE_SIZE, onChangeLogoSize);
        }
    }, []);

    return (
        <div className={classes.planner_logoMesh_cont} ref={mainDiv} style={styleAnimation}>

            <Navigation breadcrumsTitle={currSceneObj?.objectData?.name} panelPreviewIcon={panelPreviewIcon} isAddSettingsDisabled={true} closeButtonStatus={props.closeButtonStatus}/>

            <div className={classes.catalog_wr}>
                <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
                    <div className={classes.planner_logoMesh_prod_item}>

                        <div className={classes.planner_logoMesh_prod_item_img_wr}>
                            <LogoComponent onCustomClick={onUploadLogoMesh} lockMaterialStatus={false} previewSrc={activeMeshLogo?.src} 
                                onCopyPaste={{paste: onPasteLogoMesh, index: activeLogoIndex, statusCopy: true}}
                            />
                        </div>

                        <div className={classes.plannerChangeSizesWrap}>
                            <div className={classes.plannerChangeSizes}>
                                <ChangeSize additionalStyles={{marginBottom: 10}} mouseDown={mouseDown} valueChangeType={"width"} changeValue={onChangeSize} value={objectWidth} label={translation["WIDTH"]} />
                                <ChangeSize mouseDown={mouseDown} valueChangeType={"height"} changeValue={onChangeSize} value={objectHeight} label={translation["HEIGHT"]} />
                            </div>
                            <div>
                                <div className={classes.changeSizesLockWr}>
                                    <div className={classes.changeSizesLockLine1}></div>
                                    <div className={classes.changeSizesLockLine3}></div>

                                    <LockSize lockState={lockState} right={'-7px'} top={"28px"}/>

                                </div>
                            </div>
                        </div>

                        <div className={classes.planner_logoMesh_buttons}>
                            <div onClick={onDeleteLogoMesh} className={classes.planner_logoMesh_button_delete}>
                                <svg width="13" height="17" viewBox="0 0 13 17" fill="none" >
                                    <path fillRule="evenodd" clipRule="evenodd" d="M5.10547 0.164063V0.164083H7.50437V0.164062L7.98438 0.164063V0.164083H7.985V0.644083H7.98438V1.60406H7.50437V0.644083H5.10547L5.10547 1.60406H4.62547L4.62547 0.644083H4.625V0.164083H4.62547V0.164062L5.10547 0.164063Z" fill="white"/>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M5.10547 0.164063V0.164083H7.50437V0.164062L7.98438 0.164063V0.164083H7.985V0.644083H7.98438V1.60406H7.50437V0.644083H5.10547L5.10547 1.60406H4.62547L4.62547 0.644083H4.625V0.164083H4.62547V0.164062L5.10547 0.164063Z" fill="#AF3131"/>
                                    <path d="M0.304688 2.08355C4.24869 1.13699 8.36069 1.13699 12.3047 2.08355V3.04355H0.304688V2.08355Z" fill="white"/>
                                    <path d="M0.304688 2.08355C4.24869 1.13699 8.36069 1.13699 12.3047 2.08355V3.04355H0.304688V2.08355Z" fill="#AF3131"/>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M10.8656 3.52344H1.26562V15.725C1.26562 16.1436 1.60355 16.4834 2.0197 16.4834H10.5915C11.0077 16.4834 11.3456 16.1436 11.3456 15.725V3.52344H10.8656ZM9.9068 5.20383C9.9068 4.80639 9.58424 4.48383 9.1868 4.48383C8.78936 4.48383 8.4668 4.80639 8.4668 5.20383V13.3638C8.4668 13.7613 8.78936 14.0838 9.1868 14.0838C9.58424 14.0838 9.9068 13.7613 9.9068 13.3638V5.20383ZM6.30594 4.48384C6.70338 4.48384 7.02594 4.8064 7.02594 5.20384V13.3638C7.02594 13.7613 6.70338 14.0838 6.30594 14.0838C5.9085 14.0838 5.58594 13.7613 5.58594 13.3638V5.20384C5.58594 4.8064 5.9085 4.48384 6.30594 4.48384ZM4.14508 5.20383C4.14508 4.80639 3.82252 4.48383 3.42508 4.48383C3.02764 4.48383 2.70508 4.80639 2.70508 5.20383V13.3638C2.70508 13.7613 3.02764 14.0838 3.42508 14.0838C3.82252 14.0838 4.14508 13.7613 4.14508 13.3638V5.20383Z" fill="white"/>
                                    <path fillRule="evenodd" clipRule="evenodd" d="M10.8656 3.52344H1.26562V15.725C1.26562 16.1436 1.60355 16.4834 2.0197 16.4834H10.5915C11.0077 16.4834 11.3456 16.1436 11.3456 15.725V3.52344H10.8656ZM9.9068 5.20383C9.9068 4.80639 9.58424 4.48383 9.1868 4.48383C8.78936 4.48383 8.4668 4.80639 8.4668 5.20383V13.3638C8.4668 13.7613 8.78936 14.0838 9.1868 14.0838C9.58424 14.0838 9.9068 13.7613 9.9068 13.3638V5.20383ZM6.30594 4.48384C6.70338 4.48384 7.02594 4.8064 7.02594 5.20384V13.3638C7.02594 13.7613 6.70338 14.0838 6.30594 14.0838C5.9085 14.0838 5.58594 13.7613 5.58594 13.3638V5.20384C5.58594 4.8064 5.9085 4.48384 6.30594 4.48384ZM4.14508 5.20383C4.14508 4.80639 3.82252 4.48383 3.42508 4.48383C3.02764 4.48383 2.70508 4.80639 2.70508 5.20383V13.3638C2.70508 13.7613 3.02764 14.0838 3.42508 14.0838C3.82252 14.0838 4.14508 13.7613 4.14508 13.3638V5.20383Z" fill="#AF3131"/>
                                </svg>
                                { translation['BUTTON_DELETE_PLAN'] }
                            </div>
                        </div>
                    </div>
                </SimpleBar>
            </div>
        </div>
    );
};

export default LogoEditor;