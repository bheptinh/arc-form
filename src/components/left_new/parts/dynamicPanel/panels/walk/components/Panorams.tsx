import React, { useRef, useState, useEffect, useMemo } from 'react';
import {createUseStyles} from "react-jss";
import { useSelector, useDispatch } from 'react-redux';
import SimpleBar from 'simplebar-react';

import 'simplebar-react/dist/simplebar.min.css';

import { planner } from '../../../../../../../initR2D';
import { selectLanguages, selectTranslation } from '../../../../../../../redux/features/language/languageSlice';
import { selectUserProfileData  } from '../../../../../../../redux/features/user/userSlice';
import { changeActivePano, selectActivePano } from '../../../../../../../redux/features/common/commonSlice';
import {
    controlPanelHistoryAdd,
    controlPanelHistoryScrollSave,
    controlPanelUpdateBreadCrumbs,
    selectActiveControlPanelMode,
    selectActiveControlPanelModeData
} from '../../../../../../../redux/features/control/controlPanelSlice';
import Navigation from '../../../navigation/Navigation';

const useStyle = createUseStyles({
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
        borderTop: '1px solid #C6C4C4',

    },
    roll_out_left:{
        transform: "translateX(-100%)"
    },
    roll_out_right:{
        transform: "translateX(100%)"
    },

    wr:{

    },
    title: {
        width: '100%',
        height: '29px',
        backgroundColor: 'rgba(129, 129, 129, 0.9)',
        fontSize: '13px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        padding: '0 5px'
    },
    viewItemStandart:{
        cursor: "pointer",
        height: "160px",
        position: "relative",
        '&:after':{
            top: "0",
            left: "0",
            width: "calc(100%)",
            height: "100%",
            content: '""',
            zIndex: 1,
            position: "absolute",
            boxShadow: "inset 0 0 0 0px #BAE51F",
            transition: "all 0.9s cubic-bezier(0.19, 1, 0.22, 1)",
            pointerEvents: "none"
        },
        '& path':{
            transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        },
        '&:hover':{
            '&:after':{
                boxShadow: "inset 0 0 0 4px #BAE51F"
            }
        },
        '@media screen and (max-width: 950px)':{
            height: 110,
        }
    },
    viewItemStandart_active:{
        '&:after':{
            boxShadow: "inset 0 0 0 4px #BAE51F"
        }
    },
    viewItemIcon:{
        '@media screen and (max-width: 950px)':{
            height: 'auto',
            width: 40,
        }
    },
    planner_catalog_elem_overlay:{
        position: 'absolute',
        left: '0',
        top: '0',
        width: '100%',
        height: '100%'
    },
    help_bot_item:{
        display: 'flex',
        alignItems: 'center',
        marginTop: 10,
        fontSize: 13,
        color: '#fff',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        '& svg': {
            marginLeft: 10,
            '@media screen and (max-width: 950px)':{
                marginLeft: 7,
                height: 'auto',
                width: 10
            }
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
            marginTop: 6,
        }
    },
    viewItem:{
        width: '100%',
        height: 115,
        border: '1px solid #dddddd',
        position: 'relative',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        '&:hover':{
            border: '1px solid #ffd119'
        }
    },
    viewItemImg:{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        cursor: 'pointer',
        position: "absolute",
        left: 0,
        top: 0
    },
    viewItemLock:{
        border: '1px solid #ca0707',
    },
    activePano:{
        position: "absolute",
        left: 0,
        top: 0,
        zIndex: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: "rgba(47, 47, 47, 0.7)",
        boxShadow: "inset 0 0 0 4px #BAE51F",
        '&:hover':{
            '& path:not($leftMouse)':{
                fill: '#BAE51F'
            },
            '& $help_bot_item':{
                color: '#BAE51F'
            },
            '& p':{
                color: '#BAE51F'
            }
        }
    },
    leftMouse:{

    },
    preloadContainer:{
        width: '100%',
        height: '100%',
        position: "absolute",
        left: 0,
        top: 0,
        background: "rgba(255, 255, 255, .5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    rotateText:{
        position: "absolute",
        top: 20,
        color: "#fff",
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    }
});

const Panorams = props => {
    let dispatch = useDispatch();
    let translation = useSelector(selectTranslation);
    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let activeControlPanelMode = useSelector(selectActiveControlPanelMode);
    let controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let isAdded = lastHistoryElem?.isAdded;
    let lastHistoryElemScroll = lastHistoryElem.lastSavedScroll;
    let activePano = useSelector(selectActivePano);
    let userData = useSelector(selectUserProfileData);
    let languages = useSelector(selectLanguages);
    
    let [activePanoId, setActivePanoId] = useState(R2D.scene.skyboxId);
    let [rotation, setRotaion] = useState(activePano.rotation);
    let [pannoArrayIter, setPannoArrayIter] = useState(0);
    let [styleAnimation, setStyleAnimation] = useState(isAdded ? {transform: "translateX(100%)"} : { transform: "translateX(-100%)" });
    let [panoArray, setPanoArray] = useState();

    let startRotation = 0;
    let startX = 0;
    var sensitivity = 0.5;
    let positionX = 0;
    let activeId = null;

    let panoData = planner.getPanorams();

    let panorams = [];

    const classes = useStyle();

    let onSelectPano = async ({e, id, rotation, previewImgSrc}) => {
        props.preloader && props.preloader(true);
        document.querySelector(".product_hover") && document.querySelector(".product_hover").remove();
        document.querySelector("." + classes.preloadContainer) && Array.from(document.querySelectorAll("." + classes.preloadContainer)).forEach(i => i.remove());
        activeId = id; 
        let preloadContainer = document.createElement("div");
        preloadContainer.classList.add(classes.preloadContainer)
        let preload = document.createElement("div");
        preload.classList.add("preloader-cube");
        preloadContainer.append(preload);
        e.currentTarget.append(preloadContainer);
        if(id == 'transparent') {
            R2D.scene.skyboxId = id;
            R2D.scene.checkSkybox();
            if (props.renderType != 'topView') {
                R2D.scene.repositionSkybox();
            }
        } else {
            await R2D.scene.setSkyboxMat(activeId);
        }
       
        R2D.scene.setSkyboxRotation(rotation);
        R2D.scene.history.saveState();
        preloadContainer.remove();
        props.preloader && props.preloader(false);
        if(activeId == id) {
            dispatch(changeActivePano({ id, previewImgSrc: previewImgSrc, rotation}));
            setActivePanoId(activeId);
            setRotaion(0);
        }
    }

    let mouseEnter = (event, data) => {
        document.querySelector(".product_hover") && document.querySelector(".product_hover").remove();
        let product = event.target;
        let hoverWindow = document.createElement("div");
        hoverWindow.classList.add("product_hover");
        hoverWindow.innerHTML = data.name;
        document.querySelector("body").append(hoverWindow);
        hoverWindow.style.left = (product.getBoundingClientRect().left + product.offsetWidth - 20) + "px";
        hoverWindow.style.top = (product.getBoundingClientRect().top + ((product.offsetHeight - hoverWindow.offsetHeight) / 2)) + "px";
    }

    let mouseLeave = () => document.querySelector(".product_hover") && document.querySelector(".product_hover").remove();
    
    let rightPanelData = useRef(null);

    function startRotatePano(e) {
        startX = e.clientX;
        startRotation = rotation;
        document.addEventListener("mousemove", rotatePano);
        document.addEventListener("mouseup", endRotatePano);
    }

    function rotatePano(e) {
        positionX = e.clientX;
        let distance = startX - positionX;

        let newRotation = Math.round(startRotation + distance * sensitivity + 360) % 360;
        R2D.scene.setSkyboxRotation(newRotation);
        setRotaion(newRotation);
        dispatch(changeActivePano({...activePano, rotation: newRotation}));
    }
    
    function endRotatePano(e) {
        document.removeEventListener("mousemove", rotatePano);
        document.removeEventListener("mouseup", endRotatePano);
        R2D.scene.history.saveState();
    }

    let mainDiv = useRef(null);
    let scrollDiv = useRef(null);

    let onOpenColorPicker = e => {
        document.querySelector(".product_hover") && document.querySelector(".product_hover").remove();
        document.querySelector("." + classes.preloadContainer) && Array.from(document.querySelectorAll("." + classes.preloadContainer)).forEach(i => i.remove());
        dispatch(controlPanelHistoryAdd({type: "colorpicker"}));
        dispatch(controlPanelUpdateBreadCrumbs({data: {type: "colorpicker"}, updateType: "add"}));
    };

    useEffect(() => {
        setTimeout(() => setStyleAnimation({ transform: "translateX(0%)" }), 0)
    }, []);

    useEffect(() => {
        if(mainDiv.current) mainDiv.current.scrollTop = lastHistoryElemScroll;
    }, [mainDiv.current, lastHistoryElemScroll]);

    useEffect(() => {
        panoData.forEach(elem => {
            panorams.push(
                <div key={elem.id} className={classes.viewItemStandart} onMouseLeave={mouseLeave} onMouseEnter={e => mouseEnter(e, elem)}>
                    <img data-src={R2D.URL.DOMAIN + elem.source.images.preview} src={R2D.URL.DOMAIN + elem.source.images.preview} className={classes.viewItemImg + ' lazyload'} />
                    {
                        activePanoId == elem.id ?
                            <div className={classes.activePano} onMouseDown={startRotatePano}>
                                <p className={classes.rotateText}> { rotation }° </p>
                                <svg width="67" height="42" viewBox="0 0 67 42" fill="none" className={classes.viewItemIcon}>
                                    <path d="M0 21.0735C0 16.5687 5.09113 12.5608 13 10V14.2263C12.4303 14.4314 11.8813 14.6444 11.3543 14.8647C8.6132 16.0102 6.65554 17.2723 5.44397 18.4694C4.24683 19.6523 4 20.5296 4 21.0735C4 21.6174 4.24683 22.4947 5.44397 23.6776C6.65554 24.8746 8.6132 26.1368 11.3543 27.2823C15.873 29.1707 22.0067 30.5282 29 30.9417V34.9483C12.6264 34.0296 0 28.1678 0 21.0735Z" fill="#FCFFFF"/>
                                    <path d="M46 34.0664C58.3101 31.996 67 26.9589 67 21.0735C67 16.5687 61.9089 12.5608 54 10V14.2263C54.5697 14.4314 55.1187 14.6444 55.6457 14.8647C58.3868 16.0102 60.3445 17.2723 61.556 18.4694C62.7532 19.6523 63 20.5296 63 21.0735C63 21.6174 62.7532 22.4947 61.556 23.6776C60.3445 24.8746 58.3868 26.1368 55.6457 27.2823C52.9513 28.4083 49.6827 29.3456 46 30.0065V34.0664Z" fill="#FCFFFF"/>
                                    <path d="M29 23L39.5 32.5L29 42V23Z" fill="#FCFFFF"/>
                                </svg>
                                <div className={classes.help_bot_item}>
                                    <div>{ translation["TEXT_ROTATE_PANORAMA"] }</div>
                                    <svg width="19" height="26" viewBox="0 0 19 26" xmlns="http://www.w3.org/2000/svg">
                                        <path fill="#fff" d="M4.39176 0.5H14.6071C16.7746 0.5 18.5 2.18908 18.5 4.23597V21.764C18.5 23.8099 16.7745 25.5 14.6071 25.5H4.39176C2.22554 25.5 0.5 23.81 0.5 21.764V4.23597C0.5 2.189 2.22546 0.5 4.39176 0.5Z" stroke="#828282"/>
                                        <rect x="9" width="1" height="11" fill="#828282"/>
                                        <rect x="17" y="11" width="1" height="15" transform="rotate(90 17 11)" fill="#828282"/>
                                        <path fillRule="evenodd" className={classes.leftMouse} clipRule="evenodd" d="M4.68837 2H9C9.01951 3.67815 9 10.9992 9 10.9992C7.05106 11.0301 4.59176 11.004 1.99998 10.9992V4.51191C1.99998 3.05816 3.20298 2 4.68837 2Z" fill="#2F2F2F"/>
                                    </svg>
                                </div>
                            </div>
                        :
                            <div className={classes.planner_catalog_elem_overlay} onClick={e => onSelectPano({e, id: elem.id, rotation: 0, previewImgSrc: elem.source.images.preview})}></div> 
                    }
                </div>
            )
        });
        setPanoArray(panorams);
    }, [activePanoId, rotation, userData.plan, languages]);

    useEffect(() => {
        setRotaion(activePano.rotation || 0);
        setActivePanoId(activePano.id || planner.scene.getDefaultPanoId());
    }, [activePano]);

    useEffect(() => {
        if(pannoArrayIter == 0 && panoArray && panoArray.length > 0) {
            let activeElem = document.querySelector('.' + classes.activePano);
            if(!activeElem) return;
            mainDiv.current.scrollTop = (activeElem.getBoundingClientRect().top - (mainDiv.current.offsetHeight / 2) + (document.querySelector('.' + classes.activePano / 2)));
            setPannoArrayIter(++pannoArrayIter);
            dispatch(controlPanelHistoryScrollSave((activeElem.getBoundingClientRect().top - (mainDiv.current.offsetHeight / 2)) + (document.querySelector('.' + classes.activePano / 2))));
        }
    }, [panoArray]);

    useEffect(() => {
        planner.scene.dispatchEvent(new Event(planner.scene.TIPS_PANORAMS, {}))
    }, []);

    return (
        <div className={classes.planner_catalog_cont} ref={rightPanelData} style={styleAnimation}>
            {
                activeControlPanelMode == 'renderMake'?
                    <Navigation disableBreadcrumbs={props.disableBreadcrumbs} isAddSettingsDisabled={props.isAddSettingsDisabled} />
                : null
            }

            <div className={classes.catalog_wr} ref={ mainDiv }>

                <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
                    <div className={classes.wr} ref={ scrollDiv }>
                        {
                            props.renderType == 'exterior' || props.renderType == 'topView' ?
                            <div className={classes.viewItemStandart + ' ' + (activePano.id?.indexOf && ~activePano.id.indexOf('#') ? classes.viewItemStandart_active : '')} onMouseLeave={mouseLeave} onMouseEnter={e => mouseEnter(e, { name: translation['COLORED_BACKGROUND']})}>
                                <img data-src={'/src_designer/images/colorPickerBackground.png'} src={'/src_designer/images/colorPickerBackground.png'} className={classes.viewItemImg + ' lazyload'} />
                                <div className={classes.planner_catalog_elem_overlay} onClick={onOpenColorPicker}></div>
                            </div>
                            : null
                        }
                        {
                            props.renderType == 'exterior' || props.renderType == 'topView' ?
                            <div className={classes.viewItemStandart + ' ' + (activePano.id == 'transparent' ? classes.viewItemStandart_active : '')} onMouseLeave={mouseLeave} onMouseEnter={e => mouseEnter(e, { name: translation['TRANSPARENT_BACKGROUND']})}>
                                <img data-src={'/src_designer/images/transparent_background.png'} src={'/src_designer/images/transparent_background.png'} className={classes.viewItemImg + ' lazyload'} />
                                <div className={classes.planner_catalog_elem_overlay} onClick={e => onSelectPano({e, id: 'transparent', rotation: 0, previewImgSrc: '/src_designer/images/transparent_background.png'})}></div>
                            </div>
                            :
                            null
                        }
                        { props.renderType != 'topView' ? panoArray : null }
                    </div>
                </SimpleBar>

            </div>
        </div> 
    );
};

export default Panorams;