import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {closeActivePopup, selectPopups, setActivePopup} from '../../../redux/features/popups/popupsSlice';
import {selectTranslation} from '../../../redux/features/language/languageSlice';
import {createUseStyles} from "react-jss";
import {user} from "../../../initR2D";
import Checkbox from '../../common/Checkbox';
import { useEffectAsync } from '../../../utils/useEffectAsync';

const useStyle = createUseStyles({
    '@font-face': [
        {
            fontFamily: "Roboto-Light",
            fontWeight: 300,
            fontDisplay: 'swap',
            src: 'url("/src_designer/Roboto-Light.ttf") format("truetype")'
        },
        {
            fontFamily: "Roboto-Bold",
            fontWeight: 700,
            fontDisplay: 'swap',
            src: 'url("/src_designer/Roboto-Bold.ttf") format("truetype")'
        },
    ],
    planner_popup_wrap: {
        height: '100%',
        width: '100%',
        position: 'absolute',
        top: '0%',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        opacity: '0',
        pointerEvents: 'none',
        zIndex: '101',
        WebkitPerspective: '800px',
        perspective: '800px',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.2)',
    },
    planner_popup_wrap_show: {
        opacity: '1',
        pointerEvents: 'auto',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        '& $planner_popup_wr':{
            transform: 'scale(1)',
        }
    },
    planner_popup_wr: {
        color: '#000',
        width: '100vw',
        maxHeight: '90%',
        borderRadius: 6,
        transform: 'scale(0)',
        boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    planner_popup_cont: {
        color: '#000',
        backgroundColor: '#fff',
        borderRadius: 6,
        position: 'relative',
        height: '100%',
        overflow: 'hidden'
    },
    planner_popup_export: {
        
    },
    export_button: {
        marginTop: 10,
        cursor: 'pointer',
        '& input':{
            marginRight: 5,
            position: 'absolute',
            zIndex: '-1',
            opacity: 0,
            '&:checked':{
                '&+label:after':{
                    opacity: 1
                }
            }
        },
        '& label':{
            fontSize: 14,
            color: '#2F2F2F',
            position: 'relative',
            cursor: 'pointer',
            '& span': {
                color: '#73909F'
            },
            '&:before':{
                content: '" "',
                transition: 'all .9s cubic-bezier(.19,1,.22,1)',
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: '#E7E7E7',
                position: 'absolute',
                boxShadow: '0px 1px 0px 0px rgb(255 255 255 / 0%), inset 0px 1px 0px 0px rgb(191 191 191 / 85%)',
                left: -20,
                top: 0,
                bottom: 0
            },
            '&:after':{
                content: '" "',
                transition: 'all .9s cubic-bezier(.19,1,.22,1)',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#9DD900',
                border: '1px solid #9DD112',
                position: 'absolute',
                left: -16,
                top: 4,
                bottom: 0,
                opacity: 0
            }
        }
    },
    export_button_recomm:{
        
    },
    planner_popup_close: {
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
    planner_popup_close_icon: {
        width: '100%'
    },
    formatColumns: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        textAlign: 'center',
        flexWrap: 'wrap',
        padding: '0 10px 0',
        margin: '20px 0 30px',
        position: 'relative',
        '&::after':{
            content: "''",
            width: 1,
            height: '100%',
            background: '#4C5D67',
            position: 'absolute',
            left: '50%',
            top: '0',
            display: 'inline-block',
            opacity: '.3'
        }
    },
    formatColumn: {
        width: '50%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        flexWrap: 'wrap',
    },
    formatColumn_top:{
        display: 'flex',
        alignItems: 'center',
        marginBottom: 20,
        '& h2':{
            fontSize: 25,
            fontFamily: 'Roboto-Light, sans-serif',
            color: '#2F2F2F',
            fontWeight: 400
        }
    },
    planner_popup_export_top:{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#72C4FF',
        padding: '30px 10px',
        '& h2':{
            color: '#ffffff',
            fontSize: 32,
            fontFamily: 'Roboto-Light, sans-serif',
            fontWeight: 300,
            marginBottom: 10,
            '@media screen and (max-width: 950px)':{
                fontSize: 20,
                marginBottom: 0,
            }
        },
        '& h3':{
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 400
        },
        '@media screen and (max-width: 950px)':{
            padding: '15px 10px',
        }
    },
    formatColumn_bottom:{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    formatColumn_bottom_title:{
        display: 'flex',
        minHeight: 14,
        '& h3':{
            fontSize: 12,
            color: '#2F2F2F',
            textTransform: 'uppercase'
        },
        '& span':{
            fontSize: 12,
            color: '#73909F',
            marginLeft: 5
        }
    },
    formatColumn_bottom_formats:{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
    },
    planner_popup_export_bottom:{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 0 30px',
        flexDirection: 'column'
    },
    planner_popup_export_button:{
        background: '#9DD900',
        fontSize: 14,
        textTransform: 'uppercase',
        padding: '10px 0',
        width: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'none',
        cursor: 'pointer',
        transition: 'all .3s ease',
        '&:hover':{
            background: '#BAE51F'
        },

    },
    planner_popup_export_button_update:{
        background: '#66ACF4'
    },
    planner_popup_back:{
        position: 'absolute',
        left: 11,
        top: 12,
        cursor: 'pointer',
        zIndex: 1,
        '& path': {
            transition: 'all 0.9s cubic-bezier(.19,1,.22,1)'
        },
        '&:hover':{
            '& path':{
                fill: '#BAE51F'
            }
        }
    },
    planner_popup_export_inside:{
        marginBottom: 20,
        '@media screen and (max-width: 950px)':{
            marginBottom: 10,
        }
    },
    planner_popup_export_inside_block:{
        display: 'flex',
        justifyContent: 'space-between',
        margin: '0 40px',
        padding: '40px 0',
        alignItems: 'center',
        borderBottom: '1px solid #C6C4C4',
        '@media screen and (max-width: 950px)':{
            margin: '0 5px',
            padding: '5px 0',
        }
    },
    planner_popup_export_inside_block_left:{
        flex: 1,
        '& h3':{
            fontWeight: 400,
            fontSize: 21,
            color: '#2F2F2F',
            marginBottom: 10,
            '@media screen and (max-width: 950px)':{
                fontSize: 12,
                marginBottom: 5,
            }
        },
        '& p':{
            fontSize: 14,
            color: '#2F2F2F',
            '@media screen and (max-width: 950px)':{
                fontSize: 11,
            }
        }
    },
    planner_popup_export_inside_block_right:{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        flex: 1,
        '& svg':{
            margin: '0 20px',
            '@media screen and (max-width: 950px)':{
                margin: '0 5px',
                width: 40,
            }
        },
        '& img':{
            width: 100,
        }
    },
    planner_popup_export_inside_block_bottom:{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: 40,
        '@media screen and (max-width: 950px)':{
            paddingBottom: 30,
        }
    },
    planner_popup_export_inside_block_bottom_buttons:{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        '& button':{
            margin: '0 5px'
        }
    },
    planner_popup_export_inside_block_bottom_buttons_download:{
        cursor: 'pointer',
        height: '35px',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#2B2B2B',
        fontSize: 14,
        borderRadius: 3,
        padding: '0 20px',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        minWidth: 120,
        border: 'none',
        outline: 'none',
        background: '#BBE521',
        textTransform: 'uppercase',
        '&:hover': {
            background: '#8fc32d'
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 12,
            height: '26px',
            minWidth: 88
        }
    },
    planner_popup_export_inside_block_bottom_buttons_cancel:{
        cursor: 'pointer',
        height: '35px',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#2B2B2B',
        fontSize: 14,
        borderRadius: 3,
        padding: '0 20px',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        minWidth: 120,
        outline: 'none',
        background: '#fff',
        textTransform: 'uppercase',
        border: '1px solid #000',
        '&:hover': {
            background: '#E9E9E9'
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 12,
            height: '26px',
            minWidth: 88
        }
    },
    planner_popup_export_downloading:{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        padding: '80px 10px 140px',
        '& p':{
            fontSize: 14,
            color: '#2f2f2f',
            textAlign: 'center',

        },
        '& progress':{
            
        },
        '@media screen and (max-width: 950px)':{
            padding: '30px 10px 30px'
        }
    },
    planner_popup_export_downloading_text:{
        marginBottom: 40,
        '@media screen and (max-width: 950px)':{
            marginBottom: 30
        }
    },
    planner_popup_export_progressBar:{
        width: '100%',
        maxWidth: 300,
        height: 10,
        borderRadius: 7,
        boxShadow: 'inset rgba(0, 0, 0, 0.4) 0px 0.7px 2.81px 0px',
        position: 'relative',
        overflow: 'hidden',
        background: '#F6F6F6'
    },
    planner_popup_export_progressBar_progress:{
        width: 0,
        height: 'calc(100% - 4px)',
        position: 'absolute',
        left: 4,
        top: 2,
        background: '#9DD900',
        borderRadius: 7
    },
    planner_popup_export_downloaded_top:{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#72C4FF',
        padding: '50px 10px',
        borderBottom: '1px solid #000',
        '& h2':{
            color: '#ffffff',
            fontSize: 32,
            fontFamily: 'Roboto-Light, sans-serif',
            fontWeight: 300,
            marginBottom: 10
        },
        '& h3':{
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 400
        },
        '@media screen and (max-width: 950px)':{
            padding: '15px 10px',
            '& svg':{
                width: 57,
                height: 'auto'
            }
        }
    },
    planner_popup_export_downloaded_content:{
        padding: '50px 10px 80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        '& h2':{
            color: '#2F2F2F',
            fontSize: 32,
            fontFamily: 'Roboto-Light, sans-serif',
            fontWeight: 300,
            marginBottom: 50,
            '@media screen and (max-width: 950px)':{
                fontSize: 14,
                marginBottom: 30
            }
        },
        '& button':{
            cursor: 'pointer',
            height: '35px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#2B2B2B',
            fontSize: 14,
            borderRadius: 3,
            padding: '0 20px',
            transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
            minWidth: 120,
            border: 'none',
            outline: 'none',
            background: '#BBE521',
            textTransform: 'uppercase',
            '&:hover': {
                background: '#8fc32d'
            },
            '@media screen and (max-width: 950px)':{
                fontSize: 12,
                height: '26px',
                minWidth: 88
            }
        },
        '@media screen and (max-width: 950px)':{
            padding: '30px 10px 30px'
        }
    },
    planner_popup_export_bottom_error_text:{
        fontSize: 14,
        fontWeight: 400,
        lineHeight: '16.41px',
        color: '#AF3131',
        marginBottom: 5,
        minHeight: 17
    }
});

const ExportPopup = props => {
    let dispatch = useDispatch();
    let translation = useSelector(selectTranslation);
    let popups = useSelector(selectPopups);

    let popupType = popups.export3DProjectPopup.type;
    let popupData = popups.export3DProjectPopup.data;

    let [popupStage, setPopupStage] = useState(null);

    let checkBoxRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [currentTask, setCurrentTask] = useState(null);
    const [taskFile, setTaskFile] = useState(null);
    let [checkBoxStatus, setCheckBoxStatus] = useState(false);

    let [preloaderStatus, setPreloaderStatus] = useState(true);

    const classes = useStyle();
    let [animPopupClass, setAnimPopupClass] = useState(false);

    let backToStart = e => {
        dispatch(setActivePopup({name: 'exportPopup'}))
        setAnimPopupClass(false);
        setTimeout(() => dispatch(closeActivePopup({name: "export3DProjectPopup"})), 500);
    }

    let onCancel = e => {
        dispatch(setActivePopup({name: 'exportPopup'}))
        setAnimPopupClass(false);
        setTimeout(() => dispatch(closeActivePopup({name: "export3DProjectPopup"})), 500);
    }

    let checkStatusIFC = e => {
        setProgress(e.data.status);
        if(e.data.status && e.data.status == '20') {
            setTaskFile(true)
            user.currentLoadingExportId = null;
        }
    }

    let onDownload = async e => {
        setPreloaderStatus(true);
        if(checkBoxRef.current.querySelector("input").checked) R2D.Storage.save("r2d_exportDownloadDetails", true);
        if(popupData == 'ifc') {
            R2D.controller.exportToIFC();
            R2D.ifcCreator.addEventListener("ifcStatus", checkStatusIFC);
            user.currentLoadingExportId = { exportId: '', format: popupData };
            user.makeExport({type: 1, environment: null, format: popupData});
        } else {
            let exportId = await user.makeExport({type: 1, environment: null, format: popupData});
            if(!exportId || exportId?.type == 'error') {
                dispatch(setActivePopup({name: "alert", data: "TEXT_ERROR_LOAD_DATA"}));
                return dispatch(closeActivePopup({name: "export3DProjectPopup"}));
            }
            else user.currentLoadingExportId = { exportId, format: popupData };
            setCurrentTask(exportId);
        }

        setPopupStage(2);
    }

    let onClickDownloadedFile = e => {
        if(popupData == 'ifc') {
            R2D.ifcCreator.exportToFile();
            R2D.ifcCreator.removeEventListener("ifcStatus", checkStatusIFC);
        }
        else window.open(taskFile, '_blank');
        dispatch(closeActivePopup({name: "export3DProjectPopup"}));
    }

    const checkStatus = async () => {
        let response = await user.checkExport(currentTask);
        setProgress(response.data.status);
        return { file: response.data.file, status: response.status, numStatus: response.data.status }
    }

    let interval;

    let closeExportPopup = e => {
        if(popupData == 'ifc') R2D.ifcCreator?.removeEventListener("ifcStatus", checkStatusIFC);
        setAnimPopupClass(false);
        setTimeout(() => dispatch(closeActivePopup({name: "export3DProjectPopup"})), 500);
    }

    let preloaderStyles = {
        position: 'absolute', 
        left: 0, 
        top: 0, 
        zIndex: 99, 
        background: 'rgba(0, 0, 0, 0.3)',
        display: preloaderStatus ? 'block' : 'none'
    }

    useEffect(() => {
        if(currentTask) {
            interval = setInterval(async () => {
                let result = await checkStatus();
                if(result.file && result.status == 'ok') {
                    clearInterval(interval);
                    setTaskFile(result.file);
                    user.currentLoadingExportId = null;
                    setPreloaderStatus(false);
                }
                else if(result.numStatus == -20) {
                    clearInterval(interval);
                    user.currentLoadingExportId = null;
                    dispatch(setActivePopup({name: "alert", data: 'FR_SOMETHING_WRONG'}));
                    dispatch(closeActivePopup({name: 'export3DProjectPopup'}));
                }
            }, 500);
        };
        return () => clearInterval(interval);
    }, [currentTask]);

    useEffect(() => {
        if(taskFile) {
            clearInterval(interval);
            setPopupStage(3);
        }
    }, [taskFile]);

    useEffectAsync(async () => {
        if(popupType == 'download') {
            if(popupData == 'ifc') {
                R2D.controller.exportToIFC();
                R2D.ifcCreator.addEventListener("ifcStatus", checkStatusIFC);
                user.currentLoadingExportId = { exportId: '', format: popupData };
            } else {
                let exportId = await user.makeExport({type: 1, environment: null, format: popupData});
                if(!exportId || exportId?.type == 'error') {
                    dispatch(setActivePopup({name: "alert", data: "TEXT_ERROR_LOAD_DATA"}));
                    return dispatch(closeActivePopup({name: "export3DProjectPopup"}));
                }
                else user.currentLoadingExportId = { exportId, format: popupData };
                setCurrentTask(exportId);
            }
            setPopupStage(2);
        } else if(popupType == 'predownload') {
            setPopupStage(1);
        }
    }, []);

    useEffect(() => {
        popupStage !== null && setPreloaderStatus(false)
    }, [popupStage]);

    useEffect(() => {
        const timer = setTimeout(() => setAnimPopupClass(true), 100);
        return () => clearTimeout(timer);
    }, []);


    return (
        <div className={animPopupClass ? classes.planner_popup_wrap +' '+ classes.planner_popup_wrap_show : classes.planner_popup_wrap} style={{zIndex: popups.export3DProjectPopup.zIndex}}>
            {
                preloaderStatus ?
                    <div className='preloader' style={ {...preloaderStyles} }><div className="preloader-cube"></div></div>
                : null
            }


                <div className={classes.planner_popup_wr} style={{maxWidth: popupStage == 1 ? 1070 : 540}}>
                    <div className={classes.planner_popup_cont}>
                        <div className={classes.planner_popup_export}>
                            <div className={classes.planner_popup_close} id="js_close_popup" onClick={closeExportPopup}>
                                <svg  width="25" height="25" fill="none" viewBox="0 0 25 25" className={classes.planner_popup_close_icon}>
                                    <path fill="#2F2F2F" fillRule="evenodd" d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z" clipRule="evenodd"/>
                                    <path fill="#2F2F2F" fillRule="evenodd" d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z" clipRule="evenodd"/>
                                    <path fill="#2F2F2F" fillRule="evenodd" d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z" clipRule="evenodd"/>
                                    <path fill="#2F2F2F" fillRule="evenodd" d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z" clipRule="evenodd"/>
                                </svg>
                            </div>
                            {
                                popupStage == 1 ? 
                                <div>
                                    <div className={classes.planner_popup_export_top}>
                                        <h2>{ translation["EXPORT_PROJECT_INSIDE_TITLE"] }</h2>
                                        <svg width="17" height="23" viewBox="0 0 17 23" fill="none" className={classes.planner_popup_back} onClick={backToStart}>
                                            <g filter="url(#filter0_d_6490_1969)">
                                            <path fillRule="evenodd" clipRule="evenodd" d="M12.4103 0.679673L11.7125 0L4 7.54323L4.69786 8.2229L4.70261 8.21825L11.7451 15L12.4375 14.3151L5.39901 7.53713L12.4103 0.679673Z" fill="black"/>
                                            <path fillRule="evenodd" clipRule="evenodd" d="M12.4103 0.679673L11.7125 0L4 7.54323L4.69786 8.2229L4.70261 8.21825L11.7451 15L12.4375 14.3151L5.39901 7.53713L12.4103 0.679673Z" fill="black"/>
                                            </g>
                                            <defs>
                                            <filter id="filter0_d_6490_1969" x="0" y="0" width="16.4375" height="23" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                                                <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                                                <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                                                <feOffset dy="4"/>
                                                <feGaussianBlur stdDeviation="2"/>
                                                <feComposite in2="hardAlpha" operator="out"/>
                                                <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                                                <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_6490_1969"/>
                                                <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_6490_1969" result="shape"/>
                                            </filter>
                                            </defs>
                                        </svg>
                                    </div>
                                    <div className={classes.planner_popup_export_inside}>
                                        <div className={classes.planner_popup_export_inside_block}>
                                            <div className={classes.planner_popup_export_inside_block_left}>
                                                <h3>{ translation["EXPORT_PROJECT_INSIDE_BLOCK_1_TITLE"] }</h3>
                                                <p>{ translation["EXPORT_PROJECT_INSIDE_BLOCK_1_TEXT"] }</p>
                                            </div>
                                            <div className={classes.planner_popup_export_inside_block_right}>
                                                <img src='/src_designer/images/export_inside_img_1.png'/>
                                                <svg width="79" height="66" viewBox="0 0 79 66" fill="none">
                                                    <path d="M75.9499 35.9841C70.191 41.2942 66.9809 46.1191 59.2609 48.8677C58.9907 48.9781 58.6881 48.9883 58.4157 48.8961C58.1434 48.804 57.9223 48.6166 57.7983 48.3728C57.6742 48.1289 57.6568 47.8474 57.7495 47.5866C57.8422 47.3258 58.038 47.1057 58.2963 46.9719C64.4092 42.84 66.7537 40.1054 71.719 35.1258C67.6146 33.1184 63.0403 31.6895 59.3555 29.119C59.0245 28.8905 58.7941 28.5576 58.7055 28.1795C58.6169 27.8014 58.6758 27.4028 58.8716 27.0544C59.0675 26.7061 59.3876 26.4307 59.7751 26.2773C60.1625 26.1239 60.5921 26.1024 60.9874 26.2166C66.268 27.8743 71.2554 30.2184 75.8052 33.1808C76.0361 33.3357 76.2261 33.5372 76.3614 33.7711C76.4967 34.0049 76.5741 34.2652 76.5879 34.5332C76.6017 34.8012 76.5517 35.0703 76.4414 35.3212C76.3311 35.572 76.1632 35.7984 75.9499 35.9841Z" fill="#9DD900"/>
                                                    <path d="M71.7736 36.946C70.6471 38.252 70.1276 37.833 66.8027 38.2039C63.4777 38.5749 38.2428 40.7621 18.2437 37.4447C-1.75536 34.1272 1.44506 29.8771 1.44506 29.8771C2.38183 28.7108 1.90542 29.2012 2.71322 28.6404C3.92146 27.9893 4.6538 29.0958 8.05855 30.4971C16.8156 34.2385 19.3866 34.1365 30.2301 35.1356C41.0736 36.1347 69.5828 34.1802 71.5112 34.1108C73.4395 34.0414 72.8906 35.6225 71.7736 36.946Z" fill="#9DD900"/>
                                                </svg>
                                                <img src='/src_designer/images/export_inside_img_2.png'/>
                                            </div>
                                        </div>
                                        <div className={classes.planner_popup_export_inside_block}>
                                            <div className={classes.planner_popup_export_inside_block_left}>
                                                <h3>{ translation["EXPORT_PROJECT_INSIDE_BLOCK_2_TEXT"] }</h3>
                                                <p>{ translation["EXPORT_PROJECT_INSIDE_BLOCK_2_TITLE"] }</p>
                                            </div>
                                            <div className={classes.planner_popup_export_inside_block_right}>
                                                <img src='/src_designer/images/export_inside_img_3.png'/>
                                                <svg width="79" height="66" viewBox="0 0 79 66" fill="none">
                                                    <path d="M75.9499 35.9841C70.191 41.2942 66.9809 46.1191 59.2609 48.8677C58.9907 48.9781 58.6881 48.9883 58.4157 48.8961C58.1434 48.804 57.9223 48.6166 57.7983 48.3728C57.6742 48.1289 57.6568 47.8474 57.7495 47.5866C57.8422 47.3258 58.038 47.1057 58.2963 46.9719C64.4092 42.84 66.7537 40.1054 71.719 35.1258C67.6146 33.1184 63.0403 31.6895 59.3555 29.119C59.0245 28.8905 58.7941 28.5576 58.7055 28.1795C58.6169 27.8014 58.6758 27.4028 58.8716 27.0544C59.0675 26.7061 59.3876 26.4307 59.7751 26.2773C60.1625 26.1239 60.5921 26.1024 60.9874 26.2166C66.268 27.8743 71.2554 30.2184 75.8052 33.1808C76.0361 33.3357 76.2261 33.5372 76.3614 33.7711C76.4967 34.0049 76.5741 34.2652 76.5879 34.5332C76.6017 34.8012 76.5517 35.0703 76.4414 35.3212C76.3311 35.572 76.1632 35.7984 75.9499 35.9841Z" fill="#9DD900"/>
                                                    <path d="M71.7736 36.946C70.6471 38.252 70.1276 37.833 66.8027 38.2039C63.4777 38.5749 38.2428 40.7621 18.2437 37.4447C-1.75536 34.1272 1.44506 29.8771 1.44506 29.8771C2.38183 28.7108 1.90542 29.2012 2.71322 28.6404C3.92146 27.9893 4.6538 29.0958 8.05855 30.4971C16.8156 34.2385 19.3866 34.1365 30.2301 35.1356C41.0736 36.1347 69.5828 34.1802 71.5112 34.1108C73.4395 34.0414 72.8906 35.6225 71.7736 36.946Z" fill="#9DD900"/>
                                                </svg>
                                                <img src='/src_designer/images/export_inside_img_4.png'/>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={classes.planner_popup_export_inside_block_bottom}>
                                        <div className={classes.planner_popup_export_inside_block_bottom_buttons}>
                                            <button className={classes.planner_popup_export_inside_block_bottom_buttons_cancel} onClick={onCancel}>{ translation["BUTTON_CANCEL"] }</button>
                                            <button className={classes.planner_popup_export_inside_block_bottom_buttons_download} onClick={onDownload}>{ translation["BUTTON_OK_DOWNLOAD"] }</button>
                                        </div>
                                        <div className={classes.compare_checkbox_wr} ref={checkBoxRef}>
                                            <Checkbox label={translation["TEXT_DONT_SHOW_AGAIN"]} onChange={e => setCheckBoxStatus(!checkBoxStatus)} checked={checkBoxStatus} name={"exportDownloadDetails"}/>
                                        </div>

                                    </div>
                                </div> : 
                                popupStage == 2 ? 
                                <div>
                                    <div className={classes.planner_popup_export_top}>
                                        <h2>{ translation["EXPORT_PROJECT_PREPARING_TITLE"] }</h2>
                                    </div>
                                    <div className={classes.planner_popup_export_downloading}>
                                        <div className={classes.planner_popup_export_downloading_text}>
                                            <p dangerouslySetInnerHTML={{__html: translation["EXPORT_PROJECT_PREPARING_TEXT_1"]}}></p>
                                        </div>
                                        <div className={classes.planner_popup_export_progressBar}>
                                            <div className={classes.planner_popup_export_progressBar_progress} style={{width: (progress * 15) - 8}}></div>
                                        </div>
                                    </div>
                                </div> : 
                                popupStage == 3 ? 
                                <div>
                                    <div className={classes.planner_popup_export_downloaded_top}>

                                        <svg className={classes.done_popup_top_icon} width="167" height="127" viewBox="0 0 167 127" fill="none">
                                            <mask id="path-1-inside-1_1056_971" fill="white">
                                                <path fillRule="evenodd" clipRule="evenodd" d="M166.309 17.6125L148.566 0L58.4549 90.7773L17.6777 50.0001L0 67.6777L58.4111 126.089L58.511 125.989L58.62 126.097L166.309 17.6125Z"/>
                                            </mask>
                                            <path fillRule="evenodd" clipRule="evenodd" d="M166.309 17.6125L148.566 0L58.4549 90.7773L17.6777 50.0001L0 67.6777L58.4111 126.089L58.511 125.989L58.62 126.097L166.309 17.6125Z" fill="#9DD900"/>
                                            <path d="M148.566 0L149.271 -0.709705L148.561 -1.4142L147.857 -0.704499L148.566 0ZM166.309 17.6125L167.019 18.317L167.723 17.6073L167.014 16.9028L166.309 17.6125ZM58.4549 90.7773L57.7478 91.4844L58.4575 92.1941L59.1646 91.4818L58.4549 90.7773ZM17.6777 50.0001L18.3848 49.293L17.6777 48.5859L16.9706 49.293L17.6777 50.0001ZM0 67.6777L-0.707107 66.9706L-1.41421 67.6777L-0.707107 68.3848L0 67.6777ZM58.4111 126.089L57.704 126.796L58.4111 127.503L59.1182 126.796L58.4111 126.089ZM58.511 125.989L59.2155 125.279L58.5084 124.577L57.8039 125.282L58.511 125.989ZM58.62 126.097L57.9155 126.807L58.6253 127.511L59.3297 126.802L58.62 126.097ZM147.862 0.709705L165.605 18.3222L167.014 16.9028L149.271 -0.709705L147.862 0.709705ZM59.1646 91.4818L149.276 0.704499L147.857 -0.704499L57.7452 90.0728L59.1646 91.4818ZM16.9706 50.7072L57.7478 91.4844L59.162 90.0702L18.3848 49.293L16.9706 50.7072ZM0.707107 68.3848L18.3848 50.7072L16.9706 49.293L-0.707107 66.9706L0.707107 68.3848ZM59.1182 125.382L0.707107 66.9706L-0.707107 68.3848L57.704 126.796L59.1182 125.382ZM57.8039 125.282L57.704 125.382L59.1182 126.796L59.2181 126.696L57.8039 125.282ZM59.3245 125.387L59.2155 125.279L57.8065 126.699L57.9155 126.807L59.3245 125.387ZM165.599 16.908L57.9103 125.393L59.3297 126.802L167.019 18.317L165.599 16.908Z" fill="#CCEB8E" mask="url(#path-1-inside-1_1056_971)"/>
                                        </svg>
                                    </div>
                                    <div className={classes.planner_popup_export_downloaded_content}>
                                        <h2>{ translation["EXPORT_PROJECT_CREATED_TITLE"] }</h2>
                                        <button onClick={onClickDownloadedFile}>{ translation["BUTTON_DOWNLOAD_RENDER"] }</button>
                                    </div>
                                </div> : 
                                null
                            }
                        </div>
                    </div>
                </div>

        </div>
    )
}

export default ExportPopup;