import React, {useEffect, useRef, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {createUseStyles} from "react-jss";
import SimpleBar from "simplebar-react";
import 'simplebar-react/dist/simplebar.min.css';
import {planner, user} from "../../initR2D";

import {historyUpdate} from "../../redux/features/viewMode/viewModeSlice_legacy";
import { closeActivePopup, selectPopups, setActivePopup } from '../../redux/features/popups/popupsSlice';
import {selectLanguages, selectTranslation} from '../../redux/features/language/languageSlice';

const useStyle = createUseStyles({
    planner_popup_wrap:{
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: '0%',
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
        opacity: '0',
        pointerEvents: 'none',
        zIndex: '101',
        WebkitPerspective: '800px',
        perspective: '800px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.2)',
        '& .simplebar-scrollable-y .simplebar-content': {
            paddingRight: '38px !important'
        }
    },
    planner_popup_wrap_show:{
        opacity: '1',
        pointerEvents: 'auto',
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
        '& $planner_popup_wr':{
            transform: 'scale(1)'
        }
    },
    planner_popup_wr:{
        color: '#000',
        width: '100%',
        height: '100%',
        transform: 'scale(0.5)',
        boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
        padding: '73px 0px 0px ',
        backgroundColor: "#EBEBEB",
        '@media screen and (max-width: 950px)':{
            padding: '14px 0px 0px '
        }
    },
    planner_popup_cont:{
        color: "#000",
        height: "100%",
        display: "grid",
        gridGap: "30px",
        position: "relative",
        padding: '0 13px',
        gridTemplateRows: "auto 1fr",
        alignItems: "stretch",
        margin: 'auto',
        '@media screen and (max-width: 950px)':{
            gridGap: 14
        }
    },
    planner_popup_close:{
        width: 20,
        height: 20,
        position: 'absolute',
        top: 8,
        right: 8,
        cursor: 'pointer',
        zIndex: '2',
        '& path': {
            transition: 'all 0.9s cubic-bezier(.19,1,.22,1)'
        },
        '&:hover':{
            '& path':{
                fill: '#BAE51F'
            }
        }
    },
    planner_popup_close_icon:{
        width: '100%'
    },
    planner_popup_top:{
        padding: '0 11%',
        '@media screen and (max-width: 950px)':{
            padding: 0
        }
    },
    planner_popup_info:{
        marginTop: 24,
    },
    planner_popup_text:{
        color: "#373737",
        fontSize: 13,
        '& span':{
            fontWeight: 700
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 11
        }
    },
    planner_popup_link:{
        color: "#66ACF4",
        fontSize: 13,
        marginTop: 5,
        textDecoration: 'underline',
        cursor: "pointer",
        '&:hover':{
            textDecoration: 'none'
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 11
        }
    },
    planner_popup_tabs_wrap:{
        display: 'flex',
        justifyContent: 'center',
        position: 'relative'
    },
    planner_popup_create_tour_btn:{
        fontSize: 14,
        color: '#2B2B2B',
        textTransform: 'uppercase',
        background: '#BAE51F',
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        height: 36,
        padding: '0 14px',
        cursor: 'pointer',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        '&:hover':{
            background: '#8fc32d'
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 10,
            height: 28,
            padding: '0 7px'
        }
    },
    planner_popup_create_tour_btn_icon:{
        width: 18,
        marginRight: 7,
        '@media screen and (max-width: 950px)':{
            width: 11
        }
    },
    planner_popup_tabs_wr:{
        display: "inline-grid",
        gridTemplateColumns: 'auto auto',
        gridGap: 2,
        border: "2px solid #fff",
        height: "40px",
        background: "#fff",
        borderRadius: "6px",
        boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
        '@media screen and (max-width: 950px)':{
            height: 28
        }
    },
    planner_popup_tab:{
        color: "#2F2F2F",
        fontSize: "17px",
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        borderRadius: "3px",
        cursor: "pointer",
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        '&:hover':{
            background: '#E9E9E9'
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 12
        }
    },
    planner_popup_tab_active:{
        pointerEvents: 'none',
        background: '#BAE51F',
        color: "#2F2F2F",
        fontSize: "17px",
        padding: "0 20px",
        display: "flex",
        alignItems: "center",
        borderRadius: "3px",
        cursor: "pointer",
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        '@media screen and (max-width: 950px)':{
            fontSize: 12
        }
    },

    planner_popup_scroll:{
        position: 'relative',
        overflow: 'hidden',
        height: '100%'
    },
    planner_popup_projects:{
        gridGap: 38,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, calc(25% - 29px))',
        padding: '0 11% 70px',
        '@media screen and (max-width: 1250px)':{
            gridTemplateColumns: 'repeat(3, calc(33% - 22px))',
        },
        '@media screen and (max-width: 950px)':{
            padding: '0 0 14px',
            gridGap: 10,
            gridTemplateColumns: 'repeat(3, calc(33% - 5px))'
        }
    },
    planner_popup_tab_content:{
        height: '100%',
        position: 'relative'
    },
    planner_popup_tab_cont:{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        opacity: 0,
        pointerEvents: 'none',
        transform: 'translateY(-102%)',
        transition: "all 0.9s cubic-bezier(0.19, 1, 0.22, 1)"
    },
    planner_popup_tab_cont_show:{
        position: 'absolute',
        top: 0,
        left: 0,
        height: '100%',
        width: '100%',
        opacity: 1,
        pointerEvents: 'auto',
        transform: 'translateY(0)',
        transition: "all 0.9s cubic-bezier(0.19, 1, 0.22, 1)"
    },
    planner_popup_proj:{
        background: "#fff",
        borderRadius: "6px",
        position: 'relative',
        '&:after':{
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            content: '""',
            zIndex: 1,
            position: "absolute",
            boxShadow: "inset 0 0 0 0px #BAE51F",
            transition: "all 0.9s cubic-bezier(0.19, 1, 0.22, 1)",
            pointerEvents: "none",
            borderRadius: 6
        },
    },
    planner_popup_proj_hover:{
        '& $planner_popup_proj_btns_wr':{
            opacity: 1,
            pointerEvents: 'auto'
        },
        '&:after':{
            boxShadow: 'inset 0 0 0 4px #BAE51F',
            '@media screen and (max-width: 950px)':{
                display: 'none',
            }
        },
        '& $planner_popup_proj_btn':{
            display: 'block'
        }
    },
    planner_popup_proj_error:{
        '&:after':{
            boxShadow: "inset 0 0 0 4px #ff3333!important",
        }
    },
    planner_popup_proj_img_wr:{
        height: "181px",
        position: "relative",
        zIndex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        '@media screen and (max-width: 950px)':{
            height: 'auto',
            display: 'block'
        }
    },
    planner_popup_proj_img:{
        maxWidth: "100%",
        maxHeight: "100%",
        objectFit: "cover",
        '@media screen and (max-width: 950px)':{
            height: 108,
            margin: 'auto',
            display: 'block'
        }
    },
    planner_popup_proj_btns_wr:{
        position: "absolute",
        borderRadius: '6px 6px 0 0',
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "rgb(0 0 0 / 75%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 10px",
        transition: '0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        opacity: 0,
        '@media screen and (max-width: 950px)':{
            position: 'relative',
            height: 'auto',
            opacity: 1,
            pointerEvents: 'all',
            borderRadius: 0,
            padding: '5px 2px'
        }
    },
    planner_popup_proj_btn:{
        cursor: 'pointer',
        position: 'relative',
        '& path':{
            transition: '0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        },
        '&:hover':{
            '& path':{
                fill: '#B8E11F'
            },
            '& $planner_popup_proj_btn_text':{
                opacity: 1
            }
        },
        '@media screen and (max-width: 950px)':{
            width: 15,
            height: 20,
            '& svg':{
                maxWidth:  '100%',
                maxHeight: '100%'
            }
        }
    },
    planner_popup_proj_btn_text:{
        top: "calc(100% + 2px)",
        left: "50%",
        color: "#B8E11F",
        opacity: 0,
        position: "absolute",
        fontSize: "12px",
        transform: "translateX(-50%)",
        transition: "all 0.9s cubic-bezier(0.19, 1, 0.22, 1)",
        '@media screen and (max-width: 950px)':{
            display: 'none'
        }
    },
    planner_popup_proj_info:{
        padding: "11px 20px 20px",
        '@media screen and (max-width: 950px)':{
            padding: 10
        }
    },
    planner_popup_proj_title:{
        color: '#2F2F2F',
        fontSize: 18,
        marginBottom: 10,
        '@media screen and (max-width: 950px)':{
            fontSize: 12,
            marginBottom: 5
        }
    },
    planner_popup_proj_content:{
        display: "flex",
        flexDirection: 'column',
        justifyContent: "flex-start",
        fontSize: 13,
        '& span':{
            color: '#7B7B7B'
        },
        '& div:first-child':{
            color: '#7B7B7B'
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
            gridGap: "3px 7px",
            '& svg':{
                width: 12,
                height: 'auto'
            }
        }
    },
    preloader_render:{
        background: 'rgba(255, 255, 255, 0.6)',
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 99
    },
    planner_popup_proj_process:{
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        display: "flex",
        padding: "0 10px",
        position: "absolute",
        background: "rgb(0 0 0 / 75%)",
        transition: "0.9s cubic-bezier(0.19, 1, 0.22, 1)",
        alignItems: "center",
        borderRadius: "6px 6px 0 0",
        justifyContent: "center"
    },
    planner_popup_proj_process_text:{
        color: '#fff',
    },
    planner_popup_proj_content_error_text:{
        color: '#ff3333',
        gridColumnStart: 1,
        gridColumnEnd: 3
    },
    planner_popup_proj_id:{
        display: 'flex',
        marginBottom: 6,
        '& p':{
            marginLeft: 8,
            color: '#000'
        }
    },
    planner_popup_proj_modified:{
        display: 'flex',
        marginBottom: 6,
        '& span':{
            margin: '0 5px 0 8px'
        }
    },
    planner_popup_proj_info_created:{
        display: 'flex',
        alignItems: 'center',
        '& span':{
            margin: '0 5px 0 8px'
        }
    }
});

const RendersAnd360Popup = props => {
    const classes = useStyle();
    let dispatch = useDispatch();
    let translation = useSelector(selectTranslation);
    let popups = useSelector(selectPopups);
    let startType = popups.rendersAnd360Popup.data.type;
    let [animPopupClass, setAnimPopupClass] = useState(false);
    let [rendersTotal, setRendersTotal] = useState(0);
    let [rendersShow, setRendersShow] = useState([]);
    let [rendersData, setRendersData] = useState([]);
    let [activeRenderTypeShow, setActiveRenderTypeShow] = useState(startType || 'renders');
    let [currentOffsetForRenders, setCurrentOffsetForRenders] = useState(0);
    let languages = useSelector(selectLanguages);
    let currLanguage = languages.find(i => i.current == 1).code;

    let [tours360Show, setTours360Show] = useState([]);
    let [tours360Data, setTours360Data] = useState([]);
    let [renders360Array, setRenders360Array] = useState(false);
    let [needToUploadMore, setNeedToUploadMore] = useState(false);
    let [preloaderStatus, setPreloaderStatus] = useState(true);

    const scrollRef = useRef();

    let onClickClose = e => {
        setAnimPopupClass(false);
        setTimeout(() => dispatch(closeActivePopup({name: "rendersAnd360Popup"})), 500);
    }

    let openRender = async (id, type, actions) => {
        if(R2D.Storage.load("r2d_rendersOpenPopup")) {
            if(type == "360") window.open(`${R2D.URL.DOMAIN}${actions.open.link}`);
            else {
                let renderImgUrl =  await user.openRender(id);
                if(renderImgUrl.type == "error") return dispatch(setActivePopup({ name: "alert", data: renderImgUrl.data }));
                window.open(`${R2D.URL.DOMAIN}${renderImgUrl.url}`);
            }
        }
        else dispatch(setActivePopup({name: "confirm", type: "render_open", data: {id, type, actions}}))
    };

    let loadRender = async id => {
        dispatch(setActivePopup({name: "loadingMessage", data: "TEXT_WAIT"}))
        let renderImgUrl = await user.openRender(id);
        if(renderImgUrl.type == "error") return dispatch(setActivePopup({name: "alert", data: renderImgUrl.data}));

        let canvas = document.createElement("canvas");
        let context = canvas.getContext('2d');
        let imageNew = new Image();
        imageNew.crossOrigin = "anonymous";
        imageNew.src = R2D.URL.DOMAIN + renderImgUrl.url;
        imageNew.onload = () => {
            canvas.width = imageNew.width;
            canvas.height = imageNew.height;
            context.drawImage(imageNew, 0, 0);
            let link = document.createElement('a');
            link.setAttribute("href", canvas.toDataURL());
            link.setAttribute("download", `render_ID_${id}`);
            link.click();
            dispatch(closeActivePopup({name: "loadingMessage"}));
        };
    };

    let onCreateNewTour = e => {
        if(!user.isLogged()) {
            !R2D.config.data.enable_merchant_login ?
            dispatch(setActivePopup({name: "login"})) :
            R2D.postMessageToParent(JSON.stringify({ action: "merchant_login" }));
            return;
        }
        dispatch(setActivePopup({name: 'tour360Create'}));
    };

    let deleteRender = id => dispatch(setActivePopup({name: "confirm", type: "render_delete", data: id}));

    let onReloadRender = async id => {
        dispatch(setActivePopup({name: "loadingMessage", data: "TEXT_WAIT"}))
        let response = await user.reloadRender(id);
        if(response.type == "error") dispatch(setActivePopup({name: "alert", data: response.data}));
        else {
            let renders = await user.loadRenders();
            if(renders.type == "error") dispatch(setActivePopup({name: "alert", data: renders.data.items}));
            else {
                dispatch(closeActivePopup({name: "loadingMessage"}));
                dispatch(historyUpdate(renders.data.items));

                clearInterval(planner.renders.activeIntId);
                planner.renders.activeIntId = null;

                planner.renders.inProgressIds.push(response.data.renderId);

                setTimeout(() => {
                    let key = setInterval(async () => {

                        let inProgressIds = planner.renders.inProgressIds;
                        if(inProgressIds.length < 1) {
                            clearInterval(key);
                            planner.renders.activeIntId = null;
                            return;
                        }

                        let renders = await user.loadRenders();
                        if(!renders || renders.type == "error") {
                            dispatch(setActivePopup({name: "alert", data: renders.data.items}));
                            clearInterval(key);
                            return;
                        }
                        if(renders.data.items) {
                            renders.data.items.forEach(item => {
                                inProgressIds.forEach(renderId => {
                                    if(item.renderId == renderId && (item.status == "stored" || item.status == "error")) {
                                        planner.renders.inProgressIds = inProgressIds.filter(i => i != renderId);
                                        planner.apiScene.dispatchEvent(new Event(planner.apiScene.RENDERS_UPDATE, {renders: renders.data.items, status: item.status}));
                                    }
                                })
                            })
                        }
                    }, 15000)
                    planner.renders.activeIntId = key;
                }, 15000)
            }
        }
        dispatch(closeActivePopup({name: "loadingMessage"}));
    }

    let onRendersUpdate = async e => {
        let response = await user.loadRenders(20, currentOffsetForRenders);
        if(response.type == "error") {
            dispatch(setActivePopup({name: "alert", data: response.data}))
        } else {
            setRendersData(response.data.items);
            setRendersTotal(response.data.total);
        }
    }

    let update360Data = async e => {
        let tours360 = await user.uTours360_load();
        if(tours360.type == 'error') dispatch(setActivePopup({name: "alert", data: tours360.data}))
        else setTours360Data(tours360.reverse());
    }

    let onScrollItemsWrap = e => {
        const el = e.target;
        if (
            el.scrollTop + el.offsetHeight >= el.scrollHeight - 10 &&
            rendersData.length !== rendersTotal
        ) {
            el.removeEventListener('scroll', onScrollItemsWrap);
            setPreloaderStatus(true);
            setCurrentOffsetForRenders(rendersData.length);
            setNeedToUploadMore(true);
        }
    }

    let onTourOpen = async tourUrl => dispatch(setActivePopup({name: 'tour360Create', data: tourUrl}));

    let onTourShare = view => dispatch(setActivePopup({ name: "share", data: view, type: 'tour'}));

    let deleteTour = async item => dispatch(setActivePopup({name: "confirm", type: "tour_delete", data: item.delete}));

    let onEnterItem = e => e.currentTarget.classList.add(classes.planner_popup_proj_hover);
    let onLeaveItem = e => e.currentTarget.classList.remove(classes.planner_popup_proj_hover);

    let onTouchStartItem = e => {
        document.removeEventListener('touchstart', onTouchStartHideItem);
        setTimeout(() => document.addEventListener('touchstart', onTouchStartHideItem), 0);
        if(!e.target.closest('.' + classes.planner_popup_proj)) e.currentTarget.classList.toggle(classes.planner_popup_proj_hover);
    }

    let onTouchStartHideItem = e => {
        document.querySelector('.' + classes.planner_popup_proj_hover)?.classList.remove(classes.planner_popup_proj_hover);
        document.removeEventListener('touchstart', onTouchStartItem);
    };

    function onChangeRenderTypeShow(type){
        setActiveRenderTypeShow(type);
    }

    useEffect(async () => {        
        const timer = setTimeout(() => setAnimPopupClass(true), 0);
        clearInterval(planner.renders.activeIntId);
        planner.renders.activeIntId = null;
        planner.renders.inProgressIds = [];

        let response = await user.loadRenders(20, 0);
        setRendersData(response.data.items);
        setRendersTotal(response.data.total);

        let tours360 = await user.uTours360_load();
        setTours360Data(tours360.reverse());

        planner.apiScene.addEventListener(planner.apiScene.UPDATE_TOURS, update360Data);
        planner.scene.addEventListener(planner.scene.RENDERS_DATA_UPDATED, onRendersUpdate);
        setPreloaderStatus(false);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        let rendersArray = [];
        if(rendersData && rendersData.length > 0) {
            rendersData.forEach && rendersData.forEach(item => {
                let createdDate = new Date(item.created*1000);
                const createdYear = createdDate.getFullYear();
                const createdMonth = String(createdDate.getMonth() + 1).padStart(2, '0');
                const createdDay = String(createdDate.getDate()).padStart(2, '0');
                const createdFormattedDate = `${createdYear}-${createdMonth}-${createdDay}`;
                if(item.status != "deleted") {
                    rendersArray.push(
                        <div className={classes.planner_popup_proj +' ' + (item.status == "error" ? classes.planner_popup_proj_error : null)} key={item.id} onMouseLeave={onLeaveItem}  onMouseEnter={onEnterItem} onTouchStart={onTouchStartItem}>
                            <div className={classes.planner_popup_proj_img_wr}>
                                <img className={classes.planner_popup_proj_img}
                                     src={item.preview ? R2D.URL.DOMAIN + item.preview : '/src_designer/images/no_preview_image.png'}/>

                                {
                                    item.status == "stored" ?
                                        <div className={classes.planner_popup_proj_btns_wr}>
                                            <div className={classes.planner_popup_proj_btn}
                                                 onClick={e => openRender(item.renderId, item.type, item.actions)}>
                                                <svg width="25" height="25" fill="none" viewBox="0 0 25 25">
                                                    <path fill="#fff"
                                                          d="M.879 24.429v-20h2v20h-2Zm21 0v-11h2v11h-2Zm0 0h-19v-2h19v2Z"/>
                                                    <path fill="#fff" d="M6.879 6.429h-4v-2h4v2Z"/>
                                                    <path fill="#fff" fillRule="evenodd"
                                                          d="M17.842 1.26 18.945.186l5.356 5.238-.006.006.037.037-5.477 5.274-1.094-1.083 3.353-3.229h-7.227v9h-2v-11h9.195l-3.24-3.169Z"
                                                          clipRule="evenodd"/>
                                                </svg>
                                                <div
                                                    className={classes.planner_popup_proj_btn_text}>{translation["BUTTON_OPEN_PLAN"]}</div>
                                            </div>

                                            <div className={classes.planner_popup_proj_btn}
                                                 onClick={e => loadRender(item.renderId)}>
                                                <svg width="24" height="27" fill="none" viewBox="0 0 24 27">
                                                    <path fill="#fff" d="M1.922 24.307h20v2h-20zm9-24h2v20h-2z"/>
                                                    <path fill="#fff" d="m21.648 8.722 1.414 1.414-10.727 10.727-1.414-1.414z"/>
                                                    <path fill="#fff" d="M2.336 8.722.922 10.137l11.07 11.07 1.414-1.415z"/>
                                                </svg>
                                                <div
                                                    className={classes.planner_popup_proj_btn_text}>{translation["BUTTON_DOWNLOAD_RENDER"]}</div>
                                            </div>

                                            <div className={classes.planner_popup_proj_btn}
                                                 onClick={e => deleteRender(item.renderId)}>
                                                <svg width="24" height="31.38" viewBox="0 0 13 17" fill="none">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M5.10547 0.164063V0.164083H7.50437V0.164062L7.98438 0.164063V0.164083H7.985V0.644083H7.98438V1.60406H7.50437V0.644083H5.10547L5.10547 1.60406H4.62547L4.62547 0.644083H4.625V0.164083H4.62547V0.164062L5.10547 0.164063Z" fill="#AF3131"></path>
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M5.10547 0.164063V0.164083H7.50437V0.164062L7.98438 0.164063V0.164083H7.985V0.644083H7.98438V1.60406H7.50437V0.644083H5.10547L5.10547 1.60406H4.62547L4.62547 0.644083H4.625V0.164083H4.62547V0.164062L5.10547 0.164063Z" fill="#AF3131"></path>
                                                    <path d="M0.304688 2.08355C4.24869 1.13699 8.36069 1.13699 12.3047 2.08355V3.04355H0.304688V2.08355Z" fill="#AF3131"></path>
                                                    <path d="M0.304688 2.08355C4.24869 1.13699 8.36069 1.13699 12.3047 2.08355V3.04355H0.304688V2.08355Z" fill="#AF3131"></path>
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M10.8656 3.52344H1.26562V15.725C1.26562 16.1436 1.60355 16.4834 2.0197 16.4834H10.5915C11.0077 16.4834 11.3456 16.1436 11.3456 15.725V3.52344H10.8656ZM9.9068 5.20383C9.9068 4.80639 9.58424 4.48383 9.1868 4.48383C8.78936 4.48383 8.4668 4.80639 8.4668 5.20383V13.3638C8.4668 13.7613 8.78936 14.0838 9.1868 14.0838C9.58424 14.0838 9.9068 13.7613 9.9068 13.3638V5.20383ZM6.30594 4.48384C6.70338 4.48384 7.02594 4.8064 7.02594 5.20384V13.3638C7.02594 13.7613 6.70338 14.0838 6.30594 14.0838C5.9085 14.0838 5.58594 13.7613 5.58594 13.3638V5.20384C5.58594 4.8064 5.9085 4.48384 6.30594 4.48384ZM4.14508 5.20383C4.14508 4.80639 3.82252 4.48383 3.42508 4.48383C3.02764 4.48383 2.70508 4.80639 2.70508 5.20383V13.3638C2.70508 13.7613 3.02764 14.0838 3.42508 14.0838C3.82252 14.0838 4.14508 13.7613 4.14508 13.3638V5.20383Z" fill="#AF3131"></path>
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M10.8656 3.52344H1.26562V15.725C1.26562 16.1436 1.60355 16.4834 2.0197 16.4834H10.5915C11.0077 16.4834 11.3456 16.1436 11.3456 15.725V3.52344H10.8656ZM9.9068 5.20383C9.9068 4.80639 9.58424 4.48383 9.1868 4.48383C8.78936 4.48383 8.4668 4.80639 8.4668 5.20383V13.3638C8.4668 13.7613 8.78936 14.0838 9.1868 14.0838C9.58424 14.0838 9.9068 13.7613 9.9068 13.3638V5.20383ZM6.30594 4.48384C6.70338 4.48384 7.02594 4.8064 7.02594 5.20384V13.3638C7.02594 13.7613 6.70338 14.0838 6.30594 14.0838C5.9085 14.0838 5.58594 13.7613 5.58594 13.3638V5.20384C5.58594 4.8064 5.9085 4.48384 6.30594 4.48384ZM4.14508 5.20383C4.14508 4.80639 3.82252 4.48383 3.42508 4.48383C3.02764 4.48383 2.70508 4.80639 2.70508 5.20383V13.3638C2.70508 13.7613 3.02764 14.0838 3.42508 14.0838C3.82252 14.0838 4.14508 13.7613 4.14508 13.3638V5.20383Z" fill="#AF3131"></path>
                                                </svg>
                                                <div className={classes.planner_popup_proj_btn_text}>{translation["BUTTON_DELETE_PLAN"]}</div>
                                            </div>
                                        </div>
                                    :
                                    item.status == "error" ?
                                        <div className={classes.planner_popup_proj_btns_wr}>

                                            <div className={classes.planner_popup_proj_btn}
                                                 onClick={e => onReloadRender(item.renderId)}>
                                                <svg width="29" height="28" viewBox="0 0 29 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M5.34711 26.2922L3.80755 26.2719L3.72445 18.7806L3.73526 18.7808L3.73498 18.7294L11.3369 18.8727L11.3452 20.4124L5.28062 20.298L5.34711 26.2922Z" fill="white"/>
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M5.34711 26.2922L3.80755 26.2719L3.72445 18.7806L3.73526 18.7808L3.73498 18.7294L11.3369 18.8727L11.3452 20.4124L5.28062 20.298L5.34711 26.2922Z" fill="white"/>
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M12.8165 1.39258C11.3835 1.75329 10.045 2.35192 8.84558 3.144L10.053 4.74457C11.0273 4.1172 12.1072 3.63949 13.26 3.34393L12.8165 1.39258ZM19.2101 3.47571C23.7193 4.84934 27 9.04152 27 14C27 20.0751 22.0751 25 16 25C11.7215 25 8.01356 22.5573 6.19458 18.9905L3.98143 18.9641C5.93187 23.681 10.5783 27 16 27C23.1797 27 29 21.1797 29 14C29 8.08904 25.055 3.09952 19.6544 1.52063L19.2101 3.47571ZM6.57275 5.04855L8.26629 6.17756C7.2129 7.21908 6.36881 8.47185 5.80276 9.86711L3.98024 9.03869C4.59574 7.54915 5.48007 6.19894 6.57275 5.04855ZM3.22344 11.5874L5.18044 12.005C5.06192 12.652 5 13.3187 5 14C5 14.8599 5.09869 15.6969 5.28536 16.5001H3.24018C3.08257 15.691 3 14.8551 3 14C3 13.1756 3.07673 12.3692 3.22344 11.5874Z" fill="white"/>
                                                    <rect x="15" width="2.5" height="9" fill="white"/>
                                                </svg>
                                                <div
                                                    className={classes.planner_popup_proj_btn_text}>{translation["BUTTON_RELOAD_RENDER"]}</div>
                                            </div>

                                            <div className={classes.planner_popup_proj_btn}
                                                 onClick={e => deleteRender(item.renderId)}>
                                                <svg width="24" height="31.38" viewBox="0 0 13 17" fill="none">
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M5.10547 0.164063V0.164083H7.50437V0.164062L7.98438 0.164063V0.164083H7.985V0.644083H7.98438V1.60406H7.50437V0.644083H5.10547L5.10547 1.60406H4.62547L4.62547 0.644083H4.625V0.164083H4.62547V0.164062L5.10547 0.164063Z" fill="#AF3131"></path>
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M5.10547 0.164063V0.164083H7.50437V0.164062L7.98438 0.164063V0.164083H7.985V0.644083H7.98438V1.60406H7.50437V0.644083H5.10547L5.10547 1.60406H4.62547L4.62547 0.644083H4.625V0.164083H4.62547V0.164062L5.10547 0.164063Z" fill="#AF3131"></path>
                                                    <path d="M0.304688 2.08355C4.24869 1.13699 8.36069 1.13699 12.3047 2.08355V3.04355H0.304688V2.08355Z" fill="#AF3131"></path>
                                                    <path d="M0.304688 2.08355C4.24869 1.13699 8.36069 1.13699 12.3047 2.08355V3.04355H0.304688V2.08355Z" fill="#AF3131"></path>
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M10.8656 3.52344H1.26562V15.725C1.26562 16.1436 1.60355 16.4834 2.0197 16.4834H10.5915C11.0077 16.4834 11.3456 16.1436 11.3456 15.725V3.52344H10.8656ZM9.9068 5.20383C9.9068 4.80639 9.58424 4.48383 9.1868 4.48383C8.78936 4.48383 8.4668 4.80639 8.4668 5.20383V13.3638C8.4668 13.7613 8.78936 14.0838 9.1868 14.0838C9.58424 14.0838 9.9068 13.7613 9.9068 13.3638V5.20383ZM6.30594 4.48384C6.70338 4.48384 7.02594 4.8064 7.02594 5.20384V13.3638C7.02594 13.7613 6.70338 14.0838 6.30594 14.0838C5.9085 14.0838 5.58594 13.7613 5.58594 13.3638V5.20384C5.58594 4.8064 5.9085 4.48384 6.30594 4.48384ZM4.14508 5.20383C4.14508 4.80639 3.82252 4.48383 3.42508 4.48383C3.02764 4.48383 2.70508 4.80639 2.70508 5.20383V13.3638C2.70508 13.7613 3.02764 14.0838 3.42508 14.0838C3.82252 14.0838 4.14508 13.7613 4.14508 13.3638V5.20383Z" fill="#AF3131"></path>
                                                    <path fillRule="evenodd" clipRule="evenodd" d="M10.8656 3.52344H1.26562V15.725C1.26562 16.1436 1.60355 16.4834 2.0197 16.4834H10.5915C11.0077 16.4834 11.3456 16.1436 11.3456 15.725V3.52344H10.8656ZM9.9068 5.20383C9.9068 4.80639 9.58424 4.48383 9.1868 4.48383C8.78936 4.48383 8.4668 4.80639 8.4668 5.20383V13.3638C8.4668 13.7613 8.78936 14.0838 9.1868 14.0838C9.58424 14.0838 9.9068 13.7613 9.9068 13.3638V5.20383ZM6.30594 4.48384C6.70338 4.48384 7.02594 4.8064 7.02594 5.20384V13.3638C7.02594 13.7613 6.70338 14.0838 6.30594 14.0838C5.9085 14.0838 5.58594 13.7613 5.58594 13.3638V5.20384C5.58594 4.8064 5.9085 4.48384 6.30594 4.48384ZM4.14508 5.20383C4.14508 4.80639 3.82252 4.48383 3.42508 4.48383C3.02764 4.48383 2.70508 4.80639 2.70508 5.20383V13.3638C2.70508 13.7613 3.02764 14.0838 3.42508 14.0838C3.82252 14.0838 4.14508 13.7613 4.14508 13.3638V5.20383Z" fill="#AF3131"></path>
                                                </svg>
                                                <div
                                                    className={classes.planner_popup_proj_btn_text}>{translation["BUTTON_DELETE_PLAN"]}</div>
                                            </div>
                                        </div>
                                    : null
                                }

                                {
                                    item.status == "waiting" || item.status == "created" || item.status == "rendering" || item.status == "taken" || item.status == "start" || item.status == "finished" ?

                                        <div className={classes.planner_popup_proj_process}>
                                            <p className={classes.planner_popup_proj_process_text}>
                                                { item.status == "waiting" ? translation["TEXT_RENDER_WAITING"] : translation["TEXT_RENDER_IN_PROGRESS"] }
                                            </p>
                                        </div>
                                    : null
                                }

                            </div>

                            <div className={classes.planner_popup_proj_info}>
                                <div className={classes.planner_popup_proj_title}>  {item.type}</div>
                                <div className={classes.planner_popup_proj_content}>
                                    <div className={ classes.planner_popup_proj_id }>
                                        ID:
                                        <p>{ item.id }</p>
                                    </div>
                                    {
                                        item.status == "error" ?
                                            <div className={classes.planner_popup_proj_content_error_text}>{translation["TEXT_RENDER_ERROR"]}</div>
                                        : 
                                        <div className={classes.planner_popup_proj_info_created}>
                                            
                                                <svg width="16" height="17" fill="none" viewBox="0 0 16 17">
                                                    <path fill="#7B7B7B"
                                                            d="M.385 4.706a3.018 3.018 0 0 1 3.014-2.828h.777v-.603a.604.604 0 0 1 1.207 0v.603h4.827v-.603a.603.603 0 0 1 1.207 0v.603h.777a3.018 3.018 0 0 1 3.014 2.828 74.009 74.009 0 0 1-.01 8.992 3.021 3.021 0 0 1-2.823 2.824 73.783 73.783 0 0 1-9.156 0 3.021 3.021 0 0 1-2.823-2.824 74.006 74.006 0 0 1-.011-8.992ZM1.6 13.623a1.812 1.812 0 0 0 1.694 1.694c2.987.186 6.018.186 9.006 0a1.812 1.812 0 0 0 1.693-1.694c.142-2.303.174-4.61.096-6.917H1.504a72.905 72.905 0 0 0 .096 6.917Zm9.214-9.33a.604.604 0 0 1-.604-.604v-.604H5.383v.604a.603.603 0 1 1-1.207 0v-.604h-.777a1.81 1.81 0 0 0-1.81 1.693c-.013.24-.02.481-.031.721h12.477c-.012-.24-.018-.48-.032-.72a1.81 1.81 0 0 0-1.81-1.694h-.775v.604a.604.604 0 0 1-.604.603Z"/>
                                                    <path fill="#7B7B7B"
                                                            d="M10.813 10.327a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm-3.015 0a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm3.015 3.018a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm-6.035-3.018a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm0 3.018a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm3.02 0a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Z"/>
                                                </svg>
                                            
                                            <span>Created:</span> {createdFormattedDate}
                                        </div>
                                    }
                                </div>
                            </div>

                        </div>
                    )
                }
            });

            setRendersShow(rendersArray);
            rendersData && setRenders360Array(rendersData.find(i => i.type == '360') || false);
        };
        if(rendersData && rendersData.filter && !planner.renders.activeIntId) {
            const rendersNotCreatedArray = rendersData.filter(i => i.status == 'created' || i.status == 'start' || i.status == 'finished');
            rendersNotCreatedArray.forEach(i => planner.renders.inProgressIds.push(i.renderId));
            if(rendersNotCreatedArray.length > 0) {
                setTimeout(() => {
                    let key = setInterval(async () => {
                        let renders = await user.loadRenders();
                        if(renders) {
                            renders.data.items.forEach(item => {
                                if(planner.renders.inProgressIds.length < 1) {
                                    clearInterval(key);
                                    planner.renders.activeIntId = null;
                                }
                                planner.renders.inProgressIds.forEach(renderId => {
                                    if(item.renderId == renderId && (item.status == "stored" || item.status == "error")) {
                                        planner.renders.inProgressIds = planner.renders.inProgressIds.filter(i => i != renderId);
                                        planner.apiScene.dispatchEvent(new Event(planner.apiScene.RENDERS_UPDATE, {renders: renders.data.items, status: item.status}));
                                    }
                                })
                            })
                        }
                    }, 15000)
                    planner.renders.activeIntId = key;
                })
            }
        }
    }, [rendersData]);

    useEffect(() => {
        let tours360Array = [];
        if(tours360Data && tours360Data.length > 0) {
            tours360Data.forEach && tours360Data.forEach(item => {
                tours360Array.push(
                    <div className={classes.planner_popup_proj} key={ Math.random() } onMouseLeave={onLeaveItem}  onMouseEnter={onEnterItem} onTouchStart={onTouchStartItem}>
                        <div className={classes.planner_popup_proj_img_wr}>
                            <img className={classes.planner_popup_proj_img} src={item.preview ? R2D.URL.DOMAIN + item.preview :  '/src_designer/images/no_preview_image.png'}/>
                            <div className={classes.planner_popup_proj_btns_wr}>
                                <div className={classes.planner_popup_proj_btn} onClick={ e => onTourOpen(item.edit)}>
                                    <svg width="25" height="25" fill="none" viewBox="0 0 25 25">
                                        <path fill="#fff" d="M.879 24.429v-20h2v20h-2Zm21 0v-11h2v11h-2Zm0 0h-19v-2h19v2Z"/>
                                        <path fill="#fff" d="M6.879 6.429h-4v-2h4v2Z"/>
                                        <path fill="#fff" fillRule="evenodd" d="M17.842 1.26 18.945.186l5.356 5.238-.006.006.037.037-5.477 5.274-1.094-1.083 3.353-3.229h-7.227v9h-2v-11h9.195l-3.24-3.169Z" clipRule="evenodd"/>
                                    </svg>
                                    <div className={classes.planner_popup_proj_btn_text}>{ translation["BUTTON_OPEN_PLAN"] }</div>
                                </div>

                                <div className={classes.planner_popup_proj_btn}  onClick={e => onTourShare(item.view)}>
                                    <svg width="24" height="29" fill="none" viewBox="0 0 24 29">
                                        <path fill="#fff" fillRule="evenodd" d="M23.167 4.45a4.107 4.107 0 0 1-7.145 2.764L8.039 12.66c.22.504.343 1.061.343 1.646 0 .415-.061.815-.175 1.192l8.157 5.567a4.107 4.107 0 1 1-1 1.306L7.419 16.95a4.107 4.107 0 1 1-.327-5.632L15.18 5.8a4.107 4.107 0 1 1 7.988-1.35Z" clipRule="evenodd"/>
                                    </svg>
                                    <div className={classes.planner_popup_proj_btn_text}>{translation["BUTTON_SHARE_PLAN"] }</div>
                                </div>


                                <div className={classes.planner_popup_proj_btn} onClick={ e => deleteTour(item) }>
                                    <svg width="24" height="31.38" viewBox="0 0 13 17" fill="none">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M5.10547 0.164063V0.164083H7.50437V0.164062L7.98438 0.164063V0.164083H7.985V0.644083H7.98438V1.60406H7.50437V0.644083H5.10547L5.10547 1.60406H4.62547L4.62547 0.644083H4.625V0.164083H4.62547V0.164062L5.10547 0.164063Z" fill="#AF3131"></path>
                                        <path fillRule="evenodd" clipRule="evenodd" d="M5.10547 0.164063V0.164083H7.50437V0.164062L7.98438 0.164063V0.164083H7.985V0.644083H7.98438V1.60406H7.50437V0.644083H5.10547L5.10547 1.60406H4.62547L4.62547 0.644083H4.625V0.164083H4.62547V0.164062L5.10547 0.164063Z" fill="#AF3131"></path>
                                        <path d="M0.304688 2.08355C4.24869 1.13699 8.36069 1.13699 12.3047 2.08355V3.04355H0.304688V2.08355Z" fill="#AF3131"></path>
                                        <path d="M0.304688 2.08355C4.24869 1.13699 8.36069 1.13699 12.3047 2.08355V3.04355H0.304688V2.08355Z" fill="#AF3131"></path>
                                        <path fillRule="evenodd" clipRule="evenodd" d="M10.8656 3.52344H1.26562V15.725C1.26562 16.1436 1.60355 16.4834 2.0197 16.4834H10.5915C11.0077 16.4834 11.3456 16.1436 11.3456 15.725V3.52344H10.8656ZM9.9068 5.20383C9.9068 4.80639 9.58424 4.48383 9.1868 4.48383C8.78936 4.48383 8.4668 4.80639 8.4668 5.20383V13.3638C8.4668 13.7613 8.78936 14.0838 9.1868 14.0838C9.58424 14.0838 9.9068 13.7613 9.9068 13.3638V5.20383ZM6.30594 4.48384C6.70338 4.48384 7.02594 4.8064 7.02594 5.20384V13.3638C7.02594 13.7613 6.70338 14.0838 6.30594 14.0838C5.9085 14.0838 5.58594 13.7613 5.58594 13.3638V5.20384C5.58594 4.8064 5.9085 4.48384 6.30594 4.48384ZM4.14508 5.20383C4.14508 4.80639 3.82252 4.48383 3.42508 4.48383C3.02764 4.48383 2.70508 4.80639 2.70508 5.20383V13.3638C2.70508 13.7613 3.02764 14.0838 3.42508 14.0838C3.82252 14.0838 4.14508 13.7613 4.14508 13.3638V5.20383Z" fill="#AF3131"></path>
                                        <path fillRule="evenodd" clipRule="evenodd" d="M10.8656 3.52344H1.26562V15.725C1.26562 16.1436 1.60355 16.4834 2.0197 16.4834H10.5915C11.0077 16.4834 11.3456 16.1436 11.3456 15.725V3.52344H10.8656ZM9.9068 5.20383C9.9068 4.80639 9.58424 4.48383 9.1868 4.48383C8.78936 4.48383 8.4668 4.80639 8.4668 5.20383V13.3638C8.4668 13.7613 8.78936 14.0838 9.1868 14.0838C9.58424 14.0838 9.9068 13.7613 9.9068 13.3638V5.20383ZM6.30594 4.48384C6.70338 4.48384 7.02594 4.8064 7.02594 5.20384V13.3638C7.02594 13.7613 6.70338 14.0838 6.30594 14.0838C5.9085 14.0838 5.58594 13.7613 5.58594 13.3638V5.20384C5.58594 4.8064 5.9085 4.48384 6.30594 4.48384ZM4.14508 5.20383C4.14508 4.80639 3.82252 4.48383 3.42508 4.48383C3.02764 4.48383 2.70508 4.80639 2.70508 5.20383V13.3638C2.70508 13.7613 3.02764 14.0838 3.42508 14.0838C3.82252 14.0838 4.14508 13.7613 4.14508 13.3638V5.20383Z" fill="#AF3131"></path>
                                    </svg>
                                    <div className={classes.planner_popup_proj_btn_text}>{ translation["BUTTON_DELETE_PLAN"] }</div>
                                </div>
                            </div>
                        </div>

                        <div className={classes.planner_popup_proj_info}>
                            <div className={classes.planner_popup_proj_title}>  { item.name}</div>
                            <div className={classes.planner_popup_proj_content}>

                                <div className={ classes.planner_popup_proj_id }>
                                    ID:
                                    <p>{ item.h }</p>
                                </div>
                                <div className={ classes.planner_popup_proj_modified }>
                                    <svg width="17" height="16" fill="none" viewBox="0 0 17 16">
                                        <path fill="#7B7B7B" fillRule="evenodd" d="m3.306 15.27-.879-.012-.047-4.275h.006v-.03l4.338.082.005.88-3.461-.066.038 3.42Z" clipRule="evenodd"/>
                                        <path fill="#7B7B7B" fillRule="evenodd" d="m3.306 15.27-.879-.012-.047-4.275h.006v-.03l4.338.082.005.88-3.461-.066.038 3.42Z" clipRule="evenodd"/>
                                        <path fill="#7B7B7B" fillRule="evenodd" d="M7.502 1.078a7.382 7.382 0 0 0-2.191.981L6 2.973a6.246 6.246 0 0 1 1.773-.785l-.27-1.11Zm1.243.931A6.278 6.278 0 1 1 3.8 11.102l-1.263-.015a7.422 7.422 0 0 0 14.279-2.833A7.42 7.42 0 0 0 8.754.862l-.009 1.147Zm-4.73 1.137.966.645a6.287 6.287 0 0 0-1.405 2.105l-1.04-.473a7.4 7.4 0 0 1 1.479-2.277ZM2.104 6.877l1.117.239a6.315 6.315 0 0 0 .06 2.565H2.114a7.457 7.457 0 0 1-.01-2.804Z" clipRule="evenodd"/>
                                        <path fill="#7B7B7B" d="M8.816 3.229h1.427v5.137H8.816z"/>
                                        <path fill="#7B7B7B" d="m13.45 10.876-1.008 1.01-3.633-3.633 1.01-1.01z"/>
                                    </svg>
                                    <span>{ translation["TEXT_MODIFIED"] }:</span> {item.updatedAt.substring(0, 10)}
                                </div>
                                {
                                    item.status == "error" ?
                                        <div className={classes.planner_popup_proj_content_error_text}>{translation["TEXT_RENDER_ERROR"]}</div>
                                    : 
                                    <div className={classes.planner_popup_proj_info_created}>
                                        <svg width="16" height="17" fill="none" viewBox="0 0 16 17">
                                            <path fill="#7B7B7B" d="M.385 4.706a3.018 3.018 0 0 1 3.014-2.828h.777v-.603a.604.604 0 0 1 1.207 0v.603h4.827v-.603a.603.603 0 0 1 1.207 0v.603h.777a3.018 3.018 0 0 1 3.014 2.828 74.009 74.009 0 0 1-.01 8.992 3.021 3.021 0 0 1-2.823 2.824 73.783 73.783 0 0 1-9.156 0 3.021 3.021 0 0 1-2.823-2.824 74.006 74.006 0 0 1-.011-8.992ZM1.6 13.623a1.812 1.812 0 0 0 1.694 1.694c2.987.186 6.018.186 9.006 0a1.812 1.812 0 0 0 1.693-1.694c.142-2.303.174-4.61.096-6.917H1.504a72.905 72.905 0 0 0 .096 6.917Zm9.214-9.33a.604.604 0 0 1-.604-.604v-.604H5.383v.604a.603.603 0 1 1-1.207 0v-.604h-.777a1.81 1.81 0 0 0-1.81 1.693c-.013.24-.02.481-.031.721h12.477c-.012-.24-.018-.48-.032-.72a1.81 1.81 0 0 0-1.81-1.694h-.775v.604a.604.604 0 0 1-.604.603Z"/>
                                            <path fill="#7B7B7B" d="M10.813 10.327a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm-3.015 0a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm3.015 3.018a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm-6.035-3.018a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm0 3.018a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm3.02 0a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Z"/>
                                        </svg>
                                        <span>Created:</span> {item.createdAt.substring(0, 10)}
                                    </div>
                                }

                            </div>
                        </div>

                    </div>
                )
            });

            setTours360Show(tours360Array);
        }
    }, [tours360Data]);

    useEffect(() => {
        const el = scrollRef.current?.getScrollElement?.();
        if (el && rendersShow?.length > 0) {

            const shouldAttachScroll = rendersShow.length < rendersTotal;
            if (shouldAttachScroll) {
                el.addEventListener('scroll', onScrollItemsWrap);
            }
            return () => {
                if (shouldAttachScroll) {
                    el.removeEventListener('scroll', onScrollItemsWrap);
                }
            };
        }
    }, [rendersShow.length, rendersTotal]);

    useEffect(async () => {
        if(needToUploadMore) {
            let response = await user.loadRenders(20, currentOffsetForRenders);
            if(response.type == "error") return dispatch(setActivePopup({name: "alert", data: response.data.items}));
            setRendersData(state => state.concat(response.data.items || []));
            setNeedToUploadMore(false);
            setPreloaderStatus(false);
        }
    }, [needToUploadMore]);

    return (
        <div className={animPopupClass ? classes.planner_popup_wrap +' '+ classes.planner_popup_wrap_show : classes.planner_popup_wrap} style={{zIndex: popups.rendersAnd360Popup.zIndex}}>
            <div className={classes.planner_popup_wr}>

                <div className={classes.planner_popup_close} onClick={onClickClose}>
                    <svg  width="25" height="25" fill="none" viewBox="0 0 25 25" className={classes.planner_popup_close_icon}>
                        <path fill="#2F2F2F" fillRule="evenodd" d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z" clipRule="evenodd"/>
                        <path fill="#2F2F2F" fillRule="evenodd" d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z" clipRule="evenodd"/>
                        <path fill="#2F2F2F" fillRule="evenodd" d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z" clipRule="evenodd"/>
                        <path fill="#2F2F2F" fillRule="evenodd" d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z" clipRule="evenodd"/>
                    </svg>
                </div>

                <div className={classes.planner_popup_cont}>
                    <div className={classes.planner_popup_top}>
                        <div className={classes.planner_popup_tabs_wrap}>

                            {
                                renders360Array && activeRenderTypeShow === '360'?
                                    <div className={classes.planner_popup_create_tour_btn} onClick={onCreateNewTour}>
                                        <svg width="18" height="18" fill="none" viewBox="0 0 18 18" className={classes.planner_popup_create_tour_btn_icon}>
                                            <path fill="#2B2B2B" d="M8.648.77h1.184v16.995H8.648V.769Z"/>
                                            <path fill="#2B2B2B" d="M17.5 8.675V9.86H.98V8.675H17.5Z"/>
                                        </svg>
                                        {translation["TOURS_MAKE_NEW"]}
                                    </div>
                                    : null
                            }

                            <div className={classes.planner_popup_tabs_wr}>
                                <div className={activeRenderTypeShow === 'renders' ? classes.planner_popup_tab_active : classes.planner_popup_tab} onClick={e => onChangeRenderTypeShow('renders')}>{ translation['FR_TOURS_TRANS_123'] }</div>
                                <div className={activeRenderTypeShow === '360' ? classes.planner_popup_tab_active : classes.planner_popup_tab} onClick={e => onChangeRenderTypeShow('360')}>{ translation['TEXT_360_TOURS'] }</div>
                            </div>
                        </div>
                        {
                            activeRenderTypeShow === '360' ?
                                <div className={classes.planner_popup_info}>
                                    <div>
                                        <div className={classes.planner_popup_text}>{ translation['TOURS_MAKE_WARNING'] }</div>
                                        <a href={R2D.URL.DOMAIN + '/' + currLanguage + '/tour/aap/'} target='_blank' className={classes.planner_popup_link}>{ translation["TOURS_MAKE_EXAMPLE"] }</a>
                                    </div>
                                </div>
                                : null
                        }

                    </div>

                    <div className={classes.planner_popup_scroll}>

                        {
                            preloaderStatus ? <div className={classes.preloader_render + ' preloader'}><div className="preloader-cube"></div></div> : null
                        }

                        <div className={classes.planner_popup_tab_content}>

                            <div className={activeRenderTypeShow === 'renders' ? classes.planner_popup_tab_cont_show : classes.planner_popup_tab_cont}>
                                <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y" ref={scrollRef}>
                                    <div className={classes.planner_popup_projects}>
                                        { rendersShow }
                                    </div>
                                </SimpleBar>
                            </div>

                            <div className={activeRenderTypeShow === '360' ? classes.planner_popup_tab_cont_show : classes.planner_popup_tab_cont}>
                                <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
                                    <div className={classes.planner_popup_projects}>
                                        { tours360Show }
                                    </div>
                                </SimpleBar>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default RendersAnd360Popup;