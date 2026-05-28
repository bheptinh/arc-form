import React, {useEffect, useRef, useState} from 'react';
import {createUseStyles} from "react-jss";
import { useDispatch, useSelector } from 'react-redux';
import {AnimatePresence, motion} from 'framer-motion';

import { planner, user } from '../../../../initR2D';
import {
    changeActiveControlPanelMode,
    selectActiveControlPanelMode,
    selectAnimateFavoritesShowStatus,
    selectAnimateFavoritesHideStatus,
    selectControlPanelData, selectDynamicPanelStatus, updateDynamicPanelStatus
} from '../../../../redux/features/control/controlPanelSlice';
import { setActiveViewMode, selectActiveViewMode } from '../../../../redux/features/viewMode/viewModeSlice';
import { removeQuickPanelAll } from '../../../../redux/features/quickPanels/quickPanelsSlice';
import {selectLanguages, selectTranslation} from "../../../../redux/features/language/languageSlice";
import {setActivePopup} from "../../../../redux/features/popups/popupsSlice";
import {selectIsLogged} from "../../../../redux/features/user/userSlice";
import {showTip} from "../../../../redux/features/tips/tipsSlice";
import { selectIsProjectBelongToLoggedUser, selectIsProjectOnlyView } from '../../../../redux/features/common/commonSlice';

import UserButton from './buttons/UserButton';
import HoverComponent from './components/HoverComponent'

const useStyle = createUseStyles({
    controlPanel:{
        width: "40px",
        zIndex: 4,
        display: "grid",
        alignContent: "space-between",
        position: "relative",
        height: '100%',
        '&:before':{
            background: "#2E3839",
            content: "''",
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            zIndex: 3,
            pointerEvents: "none"
        }
    },
    menu_top:{
        pointerEvents: "none"
    },
    menu_dop_btn_wr:{
        height: "38px",
        width: "40px",
        pointerEvents: "all",
        position: "relative",
        cursor: "pointer",
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
        "&:hover $menu_dop_info_wrap":{
            transform: "translateX(0%)",
        }
    },
    menu_dop_btn:{
        borderBottom: "1px solid #595959",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#2E3839",
        position: "relative",
        zIndex: 3,
        height: "100%",
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
        '&:hover':{
            background: '#4E5455',
            '& path':{
                fill: '#B8E11F'
            }
        }
    },
    menu_dop_btn_icon:{
        width: "10px",
        height: "14px",
        display: "block",
        margin: "auto",
        '& path':{
            transition: "all .9s cubic-bezier(.19,1,.22,1)",
        }
    },
    menu_dop_info_wrap:{
        position: "absolute",
        left: "100%",
        paddingLeft: "1px",
        top: "0",
        zIndex: 2,
        transform: "translateX(-102%)",
        transition: "all .9s cubic-bezier(.19,1,.22,1)"
    },
    menu_dop_info_link:{
        background: "#2E3839",
        height: "34px",
        display: "flex",
        alignItems: "center",
        color: "#fff",
        whiteSpace: "nowrap",
        paddingRight: "13px",
        paddingLeft: "12px",
        fontSize: "12px",
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
        "&:hover":{
            background: "#4E5455"
        },
        '@media screen and (max-width: 950px)':{
            fontSize: "11px",
        }
    },
    menu_dop_info_info_link_icon:{
        height: "100%",
        width: "25px",
        marginRight: "10px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    menu_dop_info_info_link_pro:{
        color: "#fff",
        fontSize: "12px",
        marginLeft: "6px",
        border: "1px solid #9AA3A4",
        borderRadius: "3px",
        padding: "3px 4px"
    },
    menu_rozdil_wr:{
        pointerEvents: "none",
        overflow: 'hidden',
        position: 'relative',
        zIndex: 3
    },
    menu_rozdil_btn:{
        height: "45px",
        display: "grid",
        pointerEvents: "none",
        position: "relative",
        zIndex: 4,
        cursor: "pointer",
        gridTemplateColumns: "40px auto",
        "&:first-child $menu_rozdil_btn_img_wr":{
            borderTopLeftRadius: "0 !important",
            borderBottomLeftRadius: "0 !important"
        },
        "&:first-child $menu_rozdil_btn_text":{
            "&:before":{
                borderRadius: "0 3px 0 0"
            }
        },
        "&:last-child $menu_rozdil_btn_img_wr":{
            borderBottomLeftRadius: "0 !important"
        },
        "&:last-child $menu_rozdil_btn_text":{
            "&:before":{
                borderRadius: "0 0 3px 0"
            }
        },
        "&:not($menu_rozdil_btn_active):hover $menu_rozdil_btn_img_wr": {
           background: "#4E5455"

        },
        "&:not($menu_rozdil_btn_active):hover $menu_rozdil_btn_text": {
            "&:before":{
                background: "#4E5455"
            }
        },
        "&:hover $menu_rozdil_btn":{
            pointerEvents: "all",
        },
       /* "&:hover $menu_rozdil_btn_text":{
            transform: "translateX(0%)"
        },*/
        "&:hover $menu_rozdil_btn_img_wr":{
     /*       borderRadius: "5px 0 0 5px"*/
        },
        '@media screen and (max-width: 950px)':{
            height: 30,
        }
    },
    menu_rozdil_btn_active:{
        cursor: "default",
        borderRadius: "0",
        zIndex: 3,
        "& $menu_rozdil_btn_img_wr":{
            background: "#bae51f",
            transition: "background 0s cubic-bezier(.19,1,.22,1)",
            "&:before":{
                background: "#B9E31F",
                opacity: 1
            }
        },
        "& $svg_hover_path":{
            fill: "#2E3839"
        },
        "& $menu_rozdil_btn_text":{
            color: "#2E3839",
            "&:before":{
                background: "#bae51f",
                transition: "all 0s cubic-bezier(.19,1,.22,1)"
            }
        }
    },
    menu_rozdil_btn_img_wr:{
        borderRadius: "0 3px 3px 0",
        padding: "5px 0",
        pointerEvents: "all",
        width: "40px",
        background: "#2E3839",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2,
        position: "relative",
        transition: "background .9s cubic-bezier(.19,1,.22,1)",
        "&:before":{
            content: "''",
            position: "absolute",
            top: "-3px",
            left: "0",
            width: "100%",
            background: "#B9E31F",
            opacity: 0,
            height: "calc(100% + 6px)"
        },
        "& svg":{
            maxWidth: "100%",
            display: "block",
            margin: "auto",
            position: "relative",
            '@media screen and (max-width: 950px)':{
                maxHeight: '72%'
            }
        }
    },
    svg_hover_path:{
        transition: "all .9s cubic-bezier(.19,1,.22,1)"
    },
    svg_hover_stroke:{
        transition: "all .9s cubic-bezier(.19,1,.22,1)"
    },
    menu_rozdil_btn_text:{
        fontSize: "13px",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        position: "relative",
        zIndex: 1,
        padding: "0 12px 0 3px",
        transform: "translateX(-102%)",
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
        "&:before":{
            content: "''",
            position: "absolute",
            top: "0",
            right: "0",
            width: "101%",
            height: "100%",
            zIndex: -1,
            background: "#2E3839",
            transition: "all .9s cubic-bezier(.19,1,.22,1)"
        }
    },
    menu_btns:{
        background: "#2E3839",
        width: "40px",
        position: "relative",
        zIndex: 3,
        borderTop: "1px solid #595959"
    },
    menu_btn:{
        height: "45px",
        width: '100%',
        cursor: "pointer",
        position: "relative",
        pointerEvents: "all",
        transition: "all .9s cubic-bezier(.19,1,.22,1)",

        '@media screen and (max-width: 950px)':{
            height: 30,
        }
    },
    menu_btn_hover:{
        "& $menu_btn_img_wr":{
            background: "#4E5455"
        },
        "& $menu_btn_path":{
            fill: "#fff"
        },
        "& $menu_btn_rect":{
            fill: "#fff"
        },
        "& $menu_btn_stroke":{
            stroke: "#fff"
        },
        "& $menu_btn_info_wrap":{
            transform: "translate(0, -50%)",
            '@media screen and (max-width: 950px)':{
                transform: "translate(0, 0%)",
            }
        },
    },
    menu_btn_img_wr:{
        height: "100%",
        width: "100%",
        background: "#2E3839",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 3,
        position: "relative",
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
        "& svg":{
            display: "block",
            margin: "auto",
            transition: "all 1.9s cubic-bezier(.19,1,.22,1)",
        }
    },
    menu_btn_path:{
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
    },
    menu_btn_stroke:{
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
    },
    menu_btn_rect:{
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
    },
    menu_btn_svg_anim:{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        margin: "auto",
        pointerEvents: 'none'
    },
    menu_bot:{
        width: "40px",
        paddingBottom: "10px"
    },
    menu_btn_info_wrap:{
        position: "absolute",
        left: "100%",
        paddingLeft: "1px",
        top: "50%",
        zIndex: 2,
        overflow: 'hidden',
        borderRadius: 3,
        transform: "translate(-102%, -50%)",
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
        '@media screen and (max-width: 950px)':{
            transform: "translate(-102%, 0%)",
            top: 'auto',
            bottom: 0
        }
    },
    menu_logo:{
        background: "#2E3839",
        position: "relative",
        zIndex: 3,
        "& img":{
            width: "30px",
            display: "block",
            margin: "auto",
            filter: "grayscale(100%)",
            transition: "all .9s cubic-bezier(.19,1,.22,1)"
        },
        "&:hover img":{
            filter: "grayscale(0%)"
        }
    },
    menu_btn_active:{   
        cursor: "default",
        borderRadius: "0",
        zIndex: 3,
        "&:hover $menu_btn_img_wr":{
            background: "#bae51f"
        },
        "&:hover $menu_btn_path":{
            fill: "#2E3839"
        },
        "&:hover $menu_btn_rect":{
            fill: "#2E3839"
        },
        "&:hover $menu_btn_stroke":{
            stroke: "#2E3839"
        },
        "& $menu_btn_path":{
            fill: "#2E3839"
        },
        "& $menu_btn_stroke":{
            stroke: "#2E3839"
        },
        '& $menu_btn_rect':{
            fill: "#2E3839"
        },
        "& $menu_btn_img_wr":{
            background: "#bae51f",
            transition: "background 0s cubic-bezier(.19,1,.22,1)",
            "&:before":{
                background: "#B9E31F",
                opacity: 1
            }
        },
    }
});

const ControlPanel = props => {
    let dispatch = useDispatch();
    let controlPanelData = useSelector(selectControlPanelData);
    let activeControlPanelMode = useSelector(selectActiveControlPanelMode);
    let isLogged = useSelector(selectIsLogged);
    let activeViewMode = useSelector(selectActiveViewMode)
    let translation = useSelector(selectTranslation);
    let dynamicPanelStatus = useSelector(selectDynamicPanelStatus);
    let isProjectOnlyView = useSelector(selectIsProjectOnlyView);
    let isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);

    const [favoritesList, setFavoritesList] = useState(user.data.favorites?.items || []);
    const [userUploadButtonStatus, setUserUploadButtonStatus] = useState(planner.getUserUpload());

    const classes = useStyle();

    let onClickMenuItem = e => {
        let buttonType = e.currentTarget.getAttribute('datatype');
        let needToAddStartData = controlPanelData[buttonType].history.length < 1;
        if(planner.mih().state != planner.mih().stateMain || activeViewMode == "constr") {
            planner.mih().unsetActiveObject();
            dispatch(removeQuickPanelAll());
        };

        switch(buttonType) {
            case 'furniture':
                let furnitureData = planner.getCatalogProducts();
                dispatch(changeActiveControlPanelMode({mode: buttonType, data: needToAddStartData ? {type: "catalog", addType: "main", id: null, lastSavedScroll: 0, data: furnitureData} : null}));
                activeViewMode != 'view2d' && dispatch(setActiveViewMode('view3d'));
                break;
            case 'decor':
                dispatch(changeActiveControlPanelMode({mode: buttonType, data: needToAddStartData ? {type: "catalog", addType: "main", lastSavedScroll: 0, data: planner.getCatalogMaterials().materials} : null}));
                activeViewMode != 'view2d' && dispatch(setActiveViewMode('view3d'));
                break;
            case 'constructor':
                R2D.mouseInteractionHelper.api.dispatchEvent(
                    new Event(R2D.mouseInteractionHelper.api.QUICK_PANELS_HIDE, {})
                );
                dispatch(setActiveViewMode('constr'));
                dispatch(changeActiveControlPanelMode({mode: buttonType, data: needToAddStartData ? {type: "main", lastSavedScroll: 0} : null}));
                dispatch(showTip({name: 'constructorButtons'}))
                break;
            case 'walk':
                dispatch(setActiveViewMode('viewWalk'));
                dispatch(changeActiveControlPanelMode({mode: buttonType, data: needToAddStartData ? {type: "panorams", lastSavedScroll: 0} : null}));
                break;
            case 'favorites':
                (activeViewMode == "constr" || activeViewMode == "viewWalk") && dispatch(setActiveViewMode('view3d'));
                dispatch(changeActiveControlPanelMode({mode: buttonType, data: needToAddStartData ? {type: "main", lastSavedScroll: 0} : null}));
                break;
            case 'search':
                (activeViewMode == "constr" || activeViewMode == "viewWalk") && dispatch(setActiveViewMode('view3d'));
                dispatch(changeActiveControlPanelMode({mode: buttonType, data: needToAddStartData ? {type: "main", lastSavedScroll: 0} : null}));
                break;
            case 'userUpload':
                (activeViewMode == "constr" || activeViewMode == "viewWalk") && dispatch(setActiveViewMode('view3d'));
                dispatch(changeActiveControlPanelMode({mode: buttonType, data: needToAddStartData ? {type: "main", lastSavedScroll: 0} : null}));
                break;
            case 'to2d3d': 
                activeViewMode != 'view2d' && dispatch(setActiveViewMode('view3d'));
                dispatch(changeActiveControlPanelMode({mode: buttonType}));
                break;
            default:
                break;
        };

        !dynamicPanelStatus && (!isProjectOnlyView || (isProjectOnlyView && isProjectBelongToLoggedUser)) && dispatch(updateDynamicPanelStatus(true));
    };

    let hoverButtonSearch = useRef(null);
    let hoverButtonFav = useRef(null);
    let hoverButtonUpload = useRef(null);
    let mainDiv = useRef(null);
    let languages = useSelector(selectLanguages);
    let currentLanguage = languages?.find(i => i?.current == 1)?.code;
    let youTubeLinks = {
        'en': 'https://www.youtube.com/playlist?list=PLpksFTMOBAbtlpPja4fqttp-Qu2rE8hz9',
        'ru': 'https://www.youtube.com/playlist?list=PLpksFTMOBAbtlpPja4fqttp-Qu2rE8hz9',
        'ua': 'https://www.youtube.com/playlist?list=PLpksFTMOBAbsw6r7Jod8faobeiCj73tF4'
    };
    let onClickVideos = e => {
        window.open(youTubeLinks[currentLanguage] || youTubeLinks['en'], '_blank');
    };

    let onClickTips = e => {
        dispatch(setActivePopup({name: 'tipsPopup'}));
    };

    let onClickSupport = e => {
        throw new Error("Support email is currently unavailable");
        // window.location.href = 'mailto:support@roomtodo.com?subject=support:%20';
    }

    let favoritesButtonEvent = e => setFavoritesList(user.data.favorites?.items ? [...user.data.favorites?.items] : []);

    let userUploadButtonEvent = e => setUserUploadButtonStatus(e.data.status);

    let animateFavoritesShowStatus = useSelector(selectAnimateFavoritesShowStatus);
    let animateFavoritesHideStatus = useSelector(selectAnimateFavoritesHideStatus);

    let currOS = R2D.controller.getCurrentOS();
    let isCurrDeviceAPhone = currOS == "iOS" || currOS == "Android";

    let onEnterDropdown = e => e.currentTarget.classList.add(classes.menu_btn_hover);

    let onLeaveDropdown = e => e.currentTarget.classList.remove(classes.menu_btn_hover);

    let onTouchStartDropdown = e => {
        document.removeEventListener('touchstart', onTouchStartHideDropdown);
        setTimeout(() => document.addEventListener('touchstart', onTouchStartHideDropdown), 0);
        if(!e.target.closest('.' + classes.menu_btn_info_wrap)) e.currentTarget.classList.toggle(classes.menu_btn_hover);
    }

    let onTouchStartHideDropdown = e => {
        document.querySelector('.' + classes.menu_btn_hover)?.classList.remove(classes.menu_btn_hover);
        document.removeEventListener('touchstart', onTouchStartHideDropdown);
    };

    const variantsAddFavoritesAnim = {
        visible: { transform:  "scale(1)", opacity: 1},
        hidden: { transform:  "scale(15)", opacity: 0},
        exit: { transform:  "scale(0)", opacity: 1}
    };

    const variantsRemoveFavoritesAnimLeft = {
        visible: {transform:  "translateX(-10px) rotate(-14deg)", opacity: 0},
        hidden: { transform:  "translateX(0px)", opacity: 1},
        exit: {transform:  "translateX(-10px) rotate(-14deg)", opacity: 0}
    };

    const variantsRemoveFavoritesAnimRight = {
        visible: {transform:  "translateX(10px) rotate(14deg)", opacity: 0},
        hidden: { transform:  "translateX(0px)", opacity: 1},
        exit: {transform:  "translateX(10px) rotate(14deg)", opacity: 0}
    };

    useEffect(() => {
        Array.from(document.querySelectorAll('.' + classes.menu_rozdil_btn)).forEach(i => {
            i.classList.remove(classes.menu_rozdil_btn_active);
            i.getAttribute('datatype') == activeControlPanelMode && i.classList.add(classes.menu_rozdil_btn_active);
        });
        Array.from(document.querySelectorAll('.' + classes.menu_btn)).forEach(i => {
            i.classList.remove(classes.menu_btn_active);
            i.getAttribute('datatype') == activeControlPanelMode && i.classList.add(classes.menu_btn_active);
        });
    }, [activeControlPanelMode, isProjectBelongToLoggedUser, isProjectOnlyView]);

    useEffect(() => {
        setTimeout(() => mainDiv.current?.removeAttribute('style'), 1000);
        planner.scene.addEventListener(planner.scene.FAVORITES_BUTTON, favoritesButtonEvent);
        planner.scene.addEventListener(planner.scene.USER_UPLOAD_BUTTON, userUploadButtonEvent);
    }, []);

    return (
        <div className={classes.controlPanel} ref={ mainDiv } style={ { overflow:  'hidden'} }>
            <div className={classes.menu_top} >

                <UserButton />

                <div className={classes.menu_rozdil_wr}>
                    {!isCurrDeviceAPhone && (!isProjectOnlyView || isProjectBelongToLoggedUser) ?
                        <div className={classes.menu_rozdil_btn} onClick={onClickMenuItem} datatype={'constructor'}>
                            <HoverComponent hoverText={ translation["MENU_BTN_TEXT_CONSTRUCTOR"] }>
                                <div className={classes.menu_rozdil_btn_img_wr}>
                                    <svg width="22" height="21" viewBox="0 0 22 21" fill="none">
                                        <path className={classes.svg_hover_path} d="M0 15.4903L10.9873 11.3124L21.9746 15.4903V15.9818L10.9873 20.1106L0 15.9818V15.4903Z" fill="white"/>
                                        <path className={classes.svg_hover_path} fillRule="evenodd" clipRule="evenodd" d="M10.9873 20.1106L0 15.9818V15.4903L10.9873 11.3124L21.9746 15.4903V15.9818L10.9873 20.1106ZM18.0932 15.7287L10.9873 18.3989L3.88141 15.7287L10.9873 13.0266L18.0932 15.7287Z" fill="white"/>
                                        <path className={classes.svg_hover_path} fillRule="evenodd" clipRule="evenodd" d="M10.3418 12.5689V1.25684H11.6344V12.5689H10.3418Z" fill="white"/>
                                        <path className={classes.svg_hover_path} fillRule="evenodd" clipRule="evenodd" d="M13.7754 5.83667L17.9581 7.41855V14.5527H16.7581V8.24767L14.9754 7.57346V13.6219H13.7754V5.83667Z" fill="white"/>
                                        <path className={classes.svg_hover_path} fillRule="evenodd" clipRule="evenodd" d="M20.5746 5.18794L10.9873 1.50001L1.4 5.18794V15.1079L10.9873 18.7524L20.5746 15.1079V5.18794ZM21.9746 16.0734V4.22647L10.9873 0L0 4.22647V16.0734L10.9873 20.2502L21.9746 16.0734Z" fill="white"/>
                                    </svg>
                                </div>
                            </HoverComponent>
                        </div>
                        : null
                    }

                    {
                        isProjectOnlyView && !isProjectBelongToLoggedUser ?
                        <div className={classes.menu_rozdil_btn} onClick={onClickMenuItem} datatype={'to2d3d'}>
                            <HoverComponent hoverText={ translation["HINT_BUTTON_3D"] }>
                                <div className={classes.menu_rozdil_btn_img_wr}>
                                    <svg width="23" height="21" viewBox="0 0 23 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M0.802734 4.59259L11.8841 0.316131L22.7773 4.59259L22.7773 5.88521L11.8841 1.86606L0.802734 5.88521L0.802734 4.59259Z" fill="white"/>
                                        <path d="M22.7773 4.5762L11.8398 8.15843V20.6646L15.777 19.0629V11.8306L19.2365 10.6421V17.6905L22.7773 16.3733V4.5762Z" fill="white"/>
                                        <path d="M11.8398 8.16V20.6639L0.802734 16.3895V4.59262L11.8398 8.16ZM3.40234 13.4989L8.14941 15.7069V11.3758L3.40234 9.41293V13.4989Z" fill="white"/>
                                    </svg>
                                </div>
                            </HoverComponent>
                        </div> 
                        : 
                        <div>
                            <div className={classes.menu_rozdil_btn} onClick={onClickMenuItem} datatype={'furniture'}>
                                <HoverComponent hoverText={ translation["HINT_PRODUCTS_CATALOG"] }>
                                    <div className={classes.menu_rozdil_btn_img_wr}>
                                        <svg width="24" height="22" viewBox="0 0 24 22" fill="none">
                                            <path className={classes.svg_hover_path} fillRule="evenodd" clipRule="evenodd" d="M3.78516 3.82031C3.78516 2.16346 5.1283 0.820312 6.78516 0.820312H17.2137C18.8706 0.820312 20.2137 2.16346 20.2137 3.82031V7.28403H3.78516V3.82031ZM7.07031 7.28418H16.9275V15.3638H7.07031V7.28418ZM19.3927 16.1709H4.60714V15.3645H6.25V8.09277H3.5C1.84315 8.09277 0.5 9.43592 0.5 11.0928V15.3633V15.3645V16.1709V16.1715V20.2107H4.60742V21.8253H7.07171V20.2107H16.9277V21.8253H19.392V20.2107H23.5V16.1709H23.4999V15.3645H23.5V11.0928C23.5 9.43592 22.1569 8.09277 20.5 8.09277H17.75V15.3645H19.3927V16.1709Z" fill="white"></path>
                                        </svg>
                                    </div>
                                </HoverComponent>
                            </div>
                            <div className={classes.menu_rozdil_btn} onClick={onClickMenuItem} datatype={'decor'}>
                                <HoverComponent hoverText={ translation["MENU_BTN_TEXT_DECOR"] }>
                                    <div className={classes.menu_rozdil_btn_img_wr}>
                                        <svg width="24" height="19" viewBox="0 0 24 19" fill="none">
                                            <path className={classes.svg_hover_path} fillRule="evenodd" clipRule="evenodd" d="M20.433 0.825195H0.5V6.82322H20.433V0.825195ZM13.5312 18.2193V10.4219H12V8.02246H10.4667V10.4219H8.93134V18.2193L13.5312 18.2193ZM12.0002 9.22266L23.5 9.22266V8.02346L12.0002 8.02346V9.22266ZM23.5 4.42285L20.4334 4.42285V3.22365L23.5 3.22365V4.42285ZM21.9648 4.42365V8.02246H23.4981V4.42365H21.9648Z" fill="white"></path>
                                        </svg>
                                    </div>
                                </HoverComponent>
                            </div>
                        </div>
                    }
                    
                    <div className={classes.menu_rozdil_btn} onClick={onClickMenuItem} datatype={'walk'}>
                        <HoverComponent hoverText={ translation["PROJECT_EDIT_PUBLIC_POPUP_VIEW_WALK"] }>
                            <div className={classes.menu_rozdil_btn_img_wr}>
                                <svg width="16" height="23" viewBox="0 0 16 23" fill="none">
                                    <path className={classes.svg_hover_path} fillRule="evenodd" clipRule="evenodd" d="M15.6836 12.192C15.516 12.5407 15.1533 12.747 14.7723 12.747C14.6343 12.747 14.494 12.7214 14.3583 12.6619L11.0586 11.2405C10.8191 11.1373 10.6309 10.947 10.5385 10.7131L9.9865 9.33421L9.27365 12.6523L10.9583 15.1912L11.573 15.9683C11.6266 16.0332 11.67 16.1055 11.7031 16.1842L13.7025 20.9205C13.9066 21.4075 13.6568 21.9593 13.1436 22.1527C13.0227 22.1995 12.8972 22.2197 12.7729 22.2197C12.3771 22.2197 12.0019 21.9954 11.8433 21.6244L9.97966 17.2048L6.47357 13.8835C6.47357 13.8835 5.4733 13.1265 5.77327 11.7997C5.97401 11.2309 6.3732 9.43096 6.67317 8.01057C6.67317 8.01057 6.69598 7.87236 6.73932 7.66505L4.4582 8.74522L2.60593 11.3776C2.41317 11.6519 2.09495 11.7997 1.77217 11.7997C1.58284 11.7997 1.39009 11.7476 1.21786 11.6402C0.759355 11.35 0.635033 10.7631 0.941845 10.3261L2.94125 7.48431C3.0382 7.34716 3.1705 7.23766 3.32676 7.16323L7.32671 5.26868C7.46244 5.20383 7.60729 5.17831 7.74986 5.17406C7.7567 5.17406 7.76583 5.16874 7.77267 5.16874C8.07264 5.16874 9.77322 5.16874 9.77322 5.16874L9.77664 5.17406C10.1793 5.17512 10.5579 5.4037 10.7085 5.78112L12.2653 9.67867L15.1886 10.9385C15.6905 11.1533 15.9117 11.7157 15.6836 12.192ZM10.2728 4.483C11.516 4.483 12.5231 3.52829 12.5231 2.35137C12.5231 1.17338 11.516 0.219727 10.2728 0.219727C9.03071 0.219727 8.0236 1.17338 8.0236 2.35137C8.0236 3.52829 9.03071 4.483 10.2728 4.483ZM5.4733 14.0738L4.81063 17.1208L1.97405 20.7047C1.64215 21.1204 1.73111 21.7147 2.17365 22.0284C2.35386 22.1581 2.56486 22.2197 2.77245 22.2197C3.07698 22.2197 3.37695 22.0879 3.57312 21.8402L6.4827 18.1659C6.62299 18.0394 6.7302 17.8778 6.77354 17.6726L7.47385 16.0619L5.87364 14.5469C5.77327 14.4523 5.57367 14.262 5.4733 14.0738Z" fill="white"></path>
                                </svg>
                            </div>
                        </HoverComponent>
                    </div>
                </div>

                {
                    isProjectOnlyView && !isProjectBelongToLoggedUser ? 
                    null :
                    <div className={classes.menu_btns} >
                        <div className={classes.menu_btn} onClick={onClickMenuItem} datatype={'search'} ref={hoverButtonSearch}>
                            <HoverComponent hoverText={translation["SEARCH_PLACEHOLDER"]} parentRef={hoverButtonSearch}>
                                <div className={classes.menu_btn_img_wr}>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path className={classes.menu_btn_path} d="M5.6389 0C8.7532 0 11.2778 2.52462 11.2778 5.63889C11.2778 6.98593 10.8054 8.22259 10.0174 9.19241L13.8291 13.0042C14.057 13.232 14.057 13.6013 13.8291 13.8291C13.6221 14.0363 13.298 14.0551 13.0696 13.8856L13.0042 13.8291L9.19241 10.0174C8.2226 10.8054 6.98593 11.2778 5.6389 11.2778C2.52462 11.2778 0 8.75319 0 5.63889C0 2.52462 2.52462 0 5.6389 0ZM5.6389 1.16667C3.16895 1.16667 1.16667 3.16895 1.16667 5.63889C1.16667 8.10881 3.16895 10.1111 5.6389 10.1111C8.10881 10.1111 10.1111 8.10881 10.1111 5.63889C10.1111 3.16895 8.10881 1.16667 5.6389 1.16667Z" fill="#999999"></path>
                                    </svg>
                                </div>
                            </HoverComponent>
                        </div>

                        {
                            isLogged ? 
                            <div>
                                {
                                    favoritesList && favoritesList.length > 0 ?
                                    <div className={classes.menu_btn} onClick={onClickMenuItem} datatype={'favorites'} ref={hoverButtonFav} style={{zIndex: 6}}>
                                        <HoverComponent hoverText={ translation["FAVORITES_TITLE"] } parentRef={hoverButtonFav}>
                                            <div className={classes.menu_btn_img_wr}>
                                                <svg  width="15" height="14" viewBox="0 0 15 14" fill="none">
                                                    <path className={classes.menu_btn_path + ' ' + classes.menu_btn_stroke} d="M7.5 0.979654L9.61942 4.55066C9.69067 4.67072 9.80889 4.75552 9.94546 4.78454L14.0435 5.65542L11.2553 8.71771C11.1595 8.82296 11.113 8.96406 11.1276 9.10564L11.5503 13.2023L7.69846 11.5365C7.57182 11.4818 7.42818 11.4818 7.30154 11.5365L3.4497 13.2023L3.87236 9.10564C3.88697 8.96406 3.84054 8.82296 3.74471 8.71771L0.956532 5.65542L5.05454 4.78454C5.19111 4.75552 5.30932 4.67072 5.38058 4.55066L7.5 0.979654Z"  stroke="#999999" strokeLinejoin="round"></path>
                                                </svg>

                                                <AnimatePresence>
                                                {favoritesList && favoritesList.length > 0 && animateFavoritesShowStatus ?
                                                    <motion.svg key={"trigger-on-add"} transition={{ duration: 0.5,  ease: [0.19, 1, 0.22, 1] }} initial="hidden" animate="visible" exit="exit" variants={variantsAddFavoritesAnim} width="15" height="14" viewBox="0 0 15 14" className={classes.menu_btn_svg_anim}>
                                                        <path className={classes.menu_btn_path + ' ' + classes.menu_btn_stroke} d="M7.5 0.979654L9.61942 4.55066C9.69067 4.67072 9.80889 4.75552 9.94546 4.78454L14.0435 5.65542L11.2553 8.71771C11.1595 8.82296 11.113 8.96406 11.1276 9.10564L11.5503 13.2023L7.69846 11.5365C7.57182 11.4818 7.42818 11.4818 7.30154 11.5365L3.4497 13.2023L3.87236 9.10564C3.88697 8.96406 3.84054 8.82296 3.74471 8.71771L0.956532 5.65542L5.05454 4.78454C5.19111 4.75552 5.30932 4.67072 5.38058 4.55066L7.5 0.979654Z" fill="#999999"  stroke="#999999" strokeLinejoin="round"></path>
                                                    </motion.svg>
                                                : null
                                                }
                                                </AnimatePresence>
                                                <AnimatePresence>
                                                {animateFavoritesHideStatus ?
                                                    <svg  width="40" height="45" fill="none" viewBox="0 0 40 45" className={classes.menu_btn_svg_anim}>
                                                        <motion.path key={"trigger-on-remove"} transition={{ duration: 0.9,  ease: [0.19, 1, 0.22, 1] }} initial="hidden" animate="visible" exit="exit" variants={variantsRemoveFavoritesAnimLeft} className={classes.menu_btn_path} stroke="#999999" strokeLinejoin="round" d="m20.25 15.5-2.55 4.296-4.95 1.052 3.375 3.706-.51 4.946 4.635-2.005"/>
                                                        <motion.path key={"trigger-on-remove2"} transition={{ duration: 0.9,  ease: [0.19, 1, 0.22, 1] }} initial="hidden" animate="visible" exit="exit" variants={variantsRemoveFavoritesAnimRight} className={classes.menu_btn_path} stroke="#999999" strokeLinejoin="round" d="m19.75 15.5 2.55 4.296 4.95 1.052-3.375 3.706.51 4.946-4.635-2.005"/>
                                                    </svg>
                                                    : null
                                                }
                                                </AnimatePresence>
                                            </div>
                                        </HoverComponent>
                                    </div>
                                    : null
                                }
                                {
                                    userUploadButtonStatus ? 
                                    <div className={classes.menu_btn} onClick={onClickMenuItem} datatype={'userUpload'} ref={hoverButtonUpload}>
                                        <HoverComponent hoverText={ translation["MY_UPLOUDS_TITLE"] } parentRef={hoverButtonUpload}>
                                            <div className={classes.menu_btn_img_wr}>
                                                <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
                                                    <rect className={classes.menu_btn_rect} x="11.5942" y="1.09705" width="10.9673" height="1.09673" transform="rotate(-180 11.5942 1.09705)" fill="#999999"></rect>
                                                    <rect className={classes.menu_btn_rect} x="6.65869" y="14.2578" width="1.09673" height="10.9673" transform="rotate(-180 6.65869 14.2578)" fill="#999999"></rect>
                                                    <rect className={classes.menu_btn_rect} x="0.775879" y="9.64331" width="1.09673" height="8.31892" transform="rotate(-135 0.775879 9.64331)" fill="#999999"></rect>
                                                    <rect className={classes.menu_btn_rect} width="1.09673" height="8.58471" transform="matrix(0.707107 -0.707107 -0.707107 -0.707107 11.3672 9.64331)" fill="#999999"></rect>
                                                </svg>
                                            </div>
                                        </HoverComponent>
                                    </div> 
                                    : null
                                }
                            </div> : null
                        }
                    </div>
                }
            </div>

            <div className={classes.menu_bot}>
                <div className={classes.menu_btn} onMouseEnter={onEnterDropdown} onMouseLeave={onLeaveDropdown} onTouchStart={onTouchStartDropdown}>
                    <div className={classes.menu_btn_img_wr}>
                        <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                            <path className={classes.menu_btn_path} d="M4.26188 8.56782H2.7806C2.78591 8.05813 2.83104 7.64136 2.91599 7.3175C3.00624 6.98832 3.15225 6.68835 3.354 6.41758C3.55575 6.14681 3.82387 5.83887 4.15835 5.49377C4.40257 5.24424 4.62556 5.01063 4.82731 4.79295C5.03437 4.56996 5.20162 4.33105 5.32904 4.0762C5.45646 3.81605 5.52017 3.50546 5.52017 3.14443C5.52017 2.77809 5.45381 2.46219 5.32107 2.19673C5.19365 1.93127 5.00252 1.72686 4.74768 1.58351C4.49814 1.44016 4.18755 1.36849 3.8159 1.36849C3.50797 1.36849 3.21596 1.42423 2.93988 1.53573C2.6638 1.64722 2.44081 1.81977 2.27091 2.05338C2.10102 2.28168 2.01341 2.58165 2.00811 2.9533H0.53479C0.545409 2.35335 0.694067 1.83835 0.980767 1.40831C1.27278 0.978257 1.66566 0.649084 2.15942 0.420787C2.65318 0.192489 3.20534 0.0783402 3.8159 0.0783402C4.49018 0.0783402 5.06358 0.200453 5.5361 0.444678C6.01393 0.688903 6.37761 1.03931 6.62715 1.49591C6.87668 1.94719 7.00145 2.48343 7.00145 3.10461C7.00145 3.58244 6.90323 4.02311 6.70679 4.42661C6.51565 4.8248 6.26877 5.19911 5.96615 5.54952C5.66352 5.89993 5.34231 6.23441 5.00252 6.55296C4.71051 6.82374 4.51407 7.12902 4.41319 7.46881C4.31232 7.8086 4.26188 8.17494 4.26188 8.56782ZM2.71689 11.0924C2.71689 10.8535 2.79122 10.6517 2.93988 10.4871C3.08854 10.3225 3.30356 10.2402 3.58495 10.2402C3.87165 10.2402 4.08933 10.3225 4.23799 10.4871C4.38665 10.6517 4.46098 10.8535 4.46098 11.0924C4.46098 11.3207 4.38665 11.5171 4.23799 11.6817C4.08933 11.8463 3.87165 11.9286 3.58495 11.9286C3.30356 11.9286 3.08854 11.8463 2.93988 11.6817C2.79122 11.5171 2.71689 11.3207 2.71689 11.0924Z" fill="#999999"></path>
                        </svg>
                    </div>
                    <div className={classes.menu_btn_info_wrap}>
                        <div className={classes.menu_dop_info_link}  onClick={onClickVideos}>
                            <div className={classes.menu_dop_info_info_link_icon}>
                                <img src="/src_designer/images/menu_help_videos.svg"/>
                            </div>
                            { translation['TEXT_HELP_VIDEOS'] }
                        </div>
                        {
                            !isCurrDeviceAPhone ?
                                <div className={classes.menu_dop_info_link} onClick={onClickTips}>
                                    <div className={classes.menu_dop_info_info_link_icon}>
                                        <img src="/src_designer/images/menu_help_hotkeys.svg"/>
                                    </div>
                                    { translation['TEXT_HELP_HOT_KEYS'] }
                                </div>
                                : null
                        }

                        <div className={classes.menu_dop_info_link} onClick={onClickSupport}>
                            <div className={classes.menu_dop_info_info_link_icon}>
                                <img src="/src_designer/images/menu_help_contactsus.svg"/>
                            </div>
                            { translation['TEXT_HELP_SUPPORT'] }
                        </div>
                    </div>
                </div>

                {
                    !isCurrDeviceAPhone ?
                        <a href={R2D.URL.DOMAIN} target="_blank" className={classes.menu_logo}>
                            <img src="/src_designer/images/logo_roomtodo_mini.svg"/>
                        </a>
                        : null
                }

            </div>

        </div>
    )
}

export default ControlPanel;