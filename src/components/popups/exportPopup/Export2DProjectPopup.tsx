import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeActivePopup  } from '../../../redux/features/popups/popupsSlice';
import {createUseStyles} from "react-jss";
import { selectTranslation } from '../../../redux/features/language/languageSlice';
import { Document, Page } from 'react-pdf'
import Checkbox from '../../common/Checkbox';

import { selectActiveViewMode, setActiveViewMode } from '../../../redux/features/viewMode/viewModeSlice';
import {planner, user} from '../../../initR2D';
import { removeQuickPanelAll } from '../../../redux/features/quickPanels/quickPanelsSlice';
import SimpleBar from "simplebar-react";
import {Accordion} from "../../common/Accordion";

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
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.2)',

    },
    planner_popup_wrap_show:{
        opacity: '1',
        pointerEvents: 'auto',
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
        '& $planner_popup_wr':{
            transform: 'scale(1)',
            opacity: 1
        }
    },
    planner_popup_wr:{
        width: '100%',
        height: '100%',
        transform: 'scale(0.5)',
        opacity: 0,
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    planner_popup_cont:{
        color: '#2A3435',
        backgroundColor: '#f1f1f1',
        overflow: 'hidden',
        position: 'relative',
        height: '100%',
        display: 'flex',
        justifyContent: 'space-between'
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

    planner_popup_cont_left:{
      position: 'relative',
        borderRight: '1px solid #cdcdcd',
        background: '#ffffff',
        width: 300,
        overflow: 'hidden',
        display: "grid",
        gridTemplateRows: "1fr auto",
        height: "100%",
        zIndex: 1,
        '@media screen and (max-width: 950px)':{
            width: 189,
        }
    },
    planner_popup_cont_left_scroll:{
       position: 'relative',
        borderBottom: '1px solid #C6C4C4',
    },
    planner_popup_cont_center:{
        width: 'calc(100% - 300px)',
        height: '100%'
    },
    planner_popup_cont_left_main:{
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
    },
    planner_popup_cont_left_main_top: {
        padding: 14,
        '@media screen and (max-width: 950px)':{
            padding: 5,
        }
    },
    planner_popup_cont_left_main_title:{
        marginBottom: 15,
        width: '100%',
        borderBottom: '1px solid #66ACF4',
        '& > input':{
            fontSize: 16,
            color: '#66ACF4',
            border: 'none',
            width: '100%',
            fontWeight: 400,
            outline: 'none'
        }
    },
    planner_popup_cont_left_buttons:{
        display: "grid",
        padding: "14px",
        gridTemplateColumns: "repeat(2, calc(50% - 4px))",
        gridGap: "8px",
        '@media screen and (max-width: 950px)':{
            padding: 5,
            gridGap: 5
        }
    },
    planner_popup_cont_left_button:{
        cursor: 'pointer',
        height: '35px',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 14,
        borderRadius: 3,
        padding: '0 10px',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        minWidth: 120,
        border: 'none',
        outline: 'none',
        textTransform: 'uppercase',
        color: '#2A3435',
        '@media screen and (max-width: 950px)':{
            height: 26,
            padding: "0 5px",
            fontSize: 10,
            minWidth: 88
        }
    },
    planner_popup_cont_left_button_cancel:{
        justifyContent: 'flex-start',
        border: '1px solid #000000',
        '& svg':{
            marginRight: 10,
            '@media screen and (max-width: 950px)':{
                width: 10,
                height: 'auto',
                marginRight: 5,
            }
        },
        '& p':{
            flex: 2,
            textAlign: 'center',
            color: '#2A3435',
        },
        '&:hover':{
            background: '#E9E9E9',
            color: '#ffffff',
        },
    },
    planner_popup_cont_left_button_save:{
        background: '#BBE521',
        '& svg':{
            marginRight: 10,
            '@media screen and (max-width: 950px)':{
                width: 10,
                height: 'auto',
                marginRight: 5,
            }
        },
        '&:hover': {
            background: '#8fc32d'
        },
    },
    planner_popup_orientation_buttons:{
        border: "2px solid #fff",
        height: "40px",
        display: "inline-grid",
        gridGap: "2px",
        background: "#fff",
        boxShadow: "0px 0px 3px 0px rgba(0, 0, 0, 0.12)",
        borderRadius: "6px",
        gridTemplateColumns: "auto auto",
        marginBottom: 10,
        '@media screen and (max-width: 950px)':{
            height: 26,
        }
    },
    planner_popup_orientation_button:{
        color: "#2F2F2F",
        cursor: "pointer",
        display: "flex",
        padding: "0 20px",
        fontSize: "17px",
        transition: "all 0.9s cubic-bezier(0.19, 1, 0.22, 1)",
        alignItems: "center",
        borderRadius: "3px",
        minWidth: 60,
        '&:hover':{
            background: '#E9E9E9',
        },
        '@media screen and (max-width: 950px)':{
            '& svg':{
                maxHeight: '65%',
            }
        }
    },
    planner_popup_acc_type_accordion:{
        borderTop: "1px solid #BFBDBD",
        borderBottom: "1px solid #BFBDBD",
        marginLeft: "-14px",
        width: "calc(100% + 28px)",
        marginBottom: 10
    },
    planner_popup_orientation_button_active:{
        background: '#BAE51F',
        cursor: 'default',
        pointerEvents: 'none'
    },
    dropdown_arrow:{
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
        pointerEvents: 'none'
    },
    planner_popup_acc_title:{
        display: "flex",
        alignItems: "center",
        justifyContent: 'space-between',
        marginBottom: 10,
        fontSize: 18,
        fontWeight: 400,
        marginRight: 6,
        '& svg':{
             transition: 'all .1s cubic-bezier(0.19, 1, 0.22, 1)'
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 12,
        }
    },
    planner_popup_acc_types:{
        borderBottom: '1px solid rgba(196, 196, 196, .3)',
        paddingBottom: 5
    },
    planner_popup_acc_types_hide:{
        paddingBottom: 5
    },
    planner_popup_acc_types_toggle:{
        overflow: 'hidden',
         transition: 'all .1s cubic-bezier(0.19, 1, 0.22, 1)'
    },
    planner_popup_acc:{
        marginTop: 30,
        '@media screen and (max-width: 950px)':{
            marginTop: 0,
        }
    },
    planner_popup_acc_type_active:{
        cursor: "pointer",
        display: "flex",
        position: "relative",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "4px 13px",
        fontSize: "17px",
        transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
        '&:hover':{
            background: '#D9D9D9'
        },

    },
    planner_popup_acc_type_active_info:{
        display: 'flex',
        alignItems: 'center',
        pointerEvents: 'none'
    },
    planner_popup_acc_types_toggle_item:{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
         transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
        padding: '5px 14px',
        '&:hover':{
            background: '#E9E9E9'
        }
    },
    planner_popup_acc_type_active_right:{
        marginRight: 15,
        fontSize: 12,
        fontWeight: 400,
        color: '#73909F',
        pointerEvents: 'none',
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
        }
    },
    planner_popup_acc_types_toggle_item_right:{
        marginRight: 30,
        fontSize: 12,
        fontWeight: 400,
        color: '#73909F',
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
            marginRight: 0,
        }
    },
    planner_popup_acc_type_active_left:{
        fontSize: 15,
        fontWeight: 400,
        color: '#000',
        pointerEvents: 'none',
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
        }
    },
    planner_popup_acc_types_toggle_item_left:{
        fontSize: 13,
        fontWeight: 400,
        color: '#2F2F2F',
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
        }
    },
    planner_popup_acc_type_option_wrap:{
        padding: '10px 0',
    },
    pdfViewer:{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%'
    },
    pdfViewer_page:{
        display: 'flex',
        justifyContent: 'center',
        maxHeight: '97%',
        border: '2px dashed #B7B7B7',
        overflowY: 'scroll',
        '& canvas':{
            maxHeight: '100%'
        }
    },
    planner_popup_checkbox:{
        marginTop: 15,
        '& label':{
            '&:before':{
                content: '" "',
                marginRight: 10
            }
        }
    },
    planner_popup_checkboxes:{
        marginTop: 35,
        '& h2':{
            fontSize: 16,
            fontWeight: 700,
            marginRight: 6
        },
        '@media screen and (max-width: 950px)':{
            marginTop: 10,
        }
    },
    planner_popup_viewModes:{
        display: 'flex',
        '& > div':{
            margin: '0 5px'
        }
    },
    planner_popup_viewModes_button:{

    },
    planner_popup_viewModes_button_active:{
        background: 'green'
    }
});

const Export2DProjectPopup = props => {
    const sizeTypes = [
        { type: 'A4', size: '210 x 297 mm'},
        { type: 'A5', size: '148 x 210 mm' }, 
        { type: 'A3', size: '297 x 420 mm' }, 
        { type: 'Letter', size: "8.5'' x 11''" },
        { type: 'B5', size: '176 x 250 mm' },
        { type: 'B4', size: '250 x 353 mm' } 
    ];

    const scaleTypes = [ 
        { type: '1:10', scale: '1 cm = 10 cm' }, 
        { type: '1:20', scale: '1 cm = 20 cm' }, 
        { type: '1:50', scale: '1 cm = 50 cm' }, 
        { type: '1:100', scale: '1 cm = 100 cm' }, 
        { type: '1:200', scale: '1 cm = 200 cm' },
        { type: '1:24', scale: "1/2'' = 1'" },
        { type: '1:48', scale: "1/4'' = 1'" },
        { type: '1:96', scale: "1/8'' = 1'" },
        { type: '1:192', scale: "1/16'' = 1'"},
        { type: 'fit', scale: ""}
    ];
    const indexFit = scaleTypes.findIndex(item => item.type == 'fit');

    let dispatch = useDispatch();
    let translation = useSelector(selectTranslation);

    let activeViewMode = useSelector(selectActiveViewMode);

    let [preloaderStatus, setPreloaderStatus] = useState(true);
    
    let [pdfFile, setPdfFile] = useState(null);

    let [orientationStatus, setOrientationStatus] = useState('portrait');


    let [sizeTypesMain, setSizeTypesMain] = useState(null);
    let [scaleTypesMain, setScaleTypesMain] = useState(null);

    let [sizeTypeCurrent, setSizeTypeCurrent] = useState(0);
    let [scaleTypeCurrent, setScaleTypeCurrent] = useState(indexFit);

    let [showScaleStatus, setShowScaleStatus] = useState(true);
    let [showRoomAreaStatus, setShowRoomAreaStatus] = useState(true);
    let [showRoomNameStatus, setShowRoomNameStatus] = useState(true);
    let [showSizesStatus, setShowSizesStatus] = useState(false);
    let [disabledSizesStatus, setDisabledSizesStatus] = useState(true);
    let [showTerrainTextureStatus, setShowTerrainTextureStatus] = useState(false);

    let [scalePdfNum, setScalePdfNum] = useState(1);

    let [animPopupClass, setAnimPopupClass] = useState(false);

    let pdfFileName = R2D.config.data.pdfFileNameCreate;

    let pdfElem = useRef(null);
    let pageRef = useRef(null);
    let pdfRef = useRef(null);
    
    const classes = useStyle();

    let timeoutId;

    let onMouseUp = e => {
        clearTimeout(timeoutId);
        document.removeEventListener('mouseup', onMouseUp);
        mouseDownHoverStatus = false;
    }

    let onSavePdf = e => {
        user.makeExport({type: 0, environment: null, format: 'pdf'});
        R2D.pdfCreator.download(pdfFileName || 'ROOMTODO');
        dispatch(closeActivePopup({name: 'export2DProjectPopup'}))
    }

    let changeOrientation = (e, type) => type != orientationStatus && setOrientationStatus(type);

    let onChangeSizeType = (e, index) => {
        setTimeout(() => setSizeTypeCurrent(index), 100)
    }

    let onChangeScaleType = (e, index) => {
        setTimeout(() => setScaleTypeCurrent(index), 100)
    }

    let preloaderStyles = {
        position: 'absolute', 
        left: 0, 
        top: 0, 
        zIndex: 99,
        background: 'rgba(0, 0, 0, 0.3)',
        display: preloaderStatus ? 'block' : 'none'
    }

    let onPageScroll = e => {
        if(e.ctrlKey) {
            e.preventDefault();
            if((e.wheelDelta > 0 && scalePdfNum < 1.5) || (e.wheelDelta < 0 && scalePdfNum > 0.5)) {
                pdfRef.current.removeEventListener('wheel', onPageScroll);
                setScalePdfNum(e.wheelDelta > 0 ? scalePdfNum < 1.5 ? scalePdfNum + 0.1 : 1.5 : scalePdfNum > 0.5 ? scalePdfNum - 0.1 : 0.5)
            }
        }
    }

    let onPageLoad = page => pdfRef.current.addEventListener('wheel', onPageScroll);

    let updatePDF = () => {
        setPreloaderStatus(true);
            R2D.pdfCreator.createView2D({
                activeViewMode,
                orientation: orientationStatus,
                size: sizeTypes[sizeTypeCurrent].type,
                scale: scaleTypes[scaleTypeCurrent].type,
                scaleTranslate: translation["EXPORT_PROJECT_SCALE"],
                settings:{
                    showScale: showScaleStatus,
                    showRoomArea: showRoomAreaStatus,
                    showRoomName: showRoomNameStatus,
                    showSizes: showSizesStatus,
                    showTerrainTexture: showTerrainTextureStatus
                }
            });
            setPdfFile(R2D.pdfCreator.getDataurlstring());
    };

    let changeViewMode = viewMode => {
        if(!planner.scene.getCurrentSceneObject() && !planner.scene.getCurrentGroup()) dispatch(removeQuickPanelAll());
        dispatch(setActiveViewMode(viewMode));
        props.onClick && props.onClick();
    }

    let onClickClosePopUp = e => {
        setAnimPopupClass(false);
        setTimeout(() => dispatch(closeActivePopup({name: "export2DProjectPopup"})), 500);
    }

    useEffect(() => {
        let sizesTypeArray = [];

        sizeTypes.forEach((item, index) => {
            if(sizeTypeCurrent != index) {
                sizesTypeArray.push(
                    <div className={ classes.planner_popup_acc_types_toggle_item } onClick={ e => onChangeSizeType(e, index) } key={index}>
                        <p className={ classes.planner_popup_acc_types_toggle_item_left }>{ item.type }</p>
                        <p className={ classes.planner_popup_acc_types_toggle_item_right }>{ item.size }</p>
                    </div>
                )
            }
        })
        setSizeTypesMain(sizesTypeArray);
    }, [sizeTypeCurrent]);

    useEffect(() => {
        let scaleTypeArray = [];

        scaleTypes.forEach((item, index) => {
            if(scaleTypeCurrent != index) {
                scaleTypeArray.push(
                    <div className={ classes.planner_popup_acc_types_toggle_item } onClick={ e => onChangeScaleType(e, index) } key={index}>
                        <p className={ classes.planner_popup_acc_types_toggle_item_left }>{ item.type != "fit" ? item.type : translation["EXPORT_PROJECT_FIT_THE_PAGE"] }</p>
                        <p className={ classes.planner_popup_acc_types_toggle_item_right }>{ item.scale }</p>
                    </div>
                )
            }
        })

        setScaleTypesMain(scaleTypeArray);
    }, [scaleTypeCurrent]);

    useEffect(() => setTimeout(() => pdfFile && setPreloaderStatus(false), 500), [pdfFile]);

    useEffect(() => R2D.pdfCreator && !preloaderStatus && updatePDF(), [orientationStatus, sizeTypeCurrent, scaleTypeCurrent, showScaleStatus, showRoomAreaStatus, showRoomNameStatus, showSizesStatus, showTerrainTextureStatus]);

    useEffect(() => {
        R2D.pdfCreator = new R2D.PDFCreator({ sizeTypes, scaleTypes });
        let startScale = R2D.pdfCreator.createView2D() || '1:48';
        setScaleTypeCurrent(scaleTypes.findIndex(item => item.type == startScale));
        setPdfFile(R2D.pdfCreator.getDataurlstring());
    }, []);

    useEffect(() => setDisabledSizesStatus(activeViewMode == 'constr' ? false : true), [activeViewMode]);

    useEffect(() => {
        if(showSizesStatus == !disabledSizesStatus) updatePDF();
        setShowSizesStatus(!disabledSizesStatus);
        setShowTerrainTextureStatus(false);
    }, [disabledSizesStatus]);

    useEffect(() => {
        const timer = setTimeout(() => setAnimPopupClass(true), 0);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={animPopupClass ? classes.planner_popup_wrap +' '+ classes.planner_popup_wrap_show : classes.planner_popup_wrap} >
            <div className='preloader' style={ {...preloaderStyles} }><div className="preloader-cube"></div></div>
            
            <div className={ classes.planner_popup_wr }>
                <div className={classes.planner_popup_cont}>

                    <div className={classes.planner_popup_close} onClick={onClickClosePopUp}>
                        <svg  width="25" height="25" fill="none" viewBox="0 0 25 25" className={classes.planner_popup_close_icon}>
                            <path fill="#2F2F2F" fillRule="evenodd" d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z" clipRule="evenodd"/>
                            <path fill="#2F2F2F" fillRule="evenodd" d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z" clipRule="evenodd"/>
                            <path fill="#2F2F2F" fillRule="evenodd" d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z" clipRule="evenodd"/>
                            <path fill="#2F2F2F" fillRule="evenodd" d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z" clipRule="evenodd"/>
                        </svg>
                    </div>

                    <div className={classes.planner_popup_cont_left}>


                        <div className={classes.planner_popup_cont_left_scroll}>
                            <div className={classes.planner_popup_cont_left_main}>
                                <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
                                    <div className={classes.planner_popup_cont_left_main_top}>
                                        <div className={ classes.planner_popup_orientation }>
                                            <div className={classes.planner_popup_acc_title}>{ translation["EXPORT_PROJECT_ORIENTATION"] }</div>
                                            <div className={ classes.planner_popup_orientation_buttons }>
                                                <div className={ classes.planner_popup_orientation_button + ' ' + (orientationStatus == 'portrait' ? classes.planner_popup_orientation_button_active : '') } onClick={e => changeOrientation(e, 'portrait')}>
                                                    <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
                                                        <path fillRule="evenodd" clipRule="evenodd" d="M15.4104 4.97317C15.383 4.92145 15.3493 4.87328 15.3102 4.82973L15.2982 4.81593L15.2856 4.80333L15.2796 4.79672L11.0785 0.595637L11.0647 0.582434L11.0503 0.56923L11.0455 0.565029C10.9087 0.442737 10.7315 0.375397 10.548 0.37598H0.945506C0.531399 0.37598 0.195312 0.712067 0.195312 1.12617V18.5307C0.195312 18.9448 0.531399 19.2809 0.945506 19.2809H14.7491C15.1632 19.2809 15.4993 18.9448 15.4993 18.5307V5.32726C15.4993 5.19943 15.4675 5.0788 15.4104 4.97317ZM9.7978 5.32726C9.7978 5.74137 10.1339 6.07746 10.548 6.07746H13.9989V17.7805H1.6957V1.87637H9.7978V5.32726Z" fill="#2A3435"/>
                                                    </svg>
                                                </div>
                                                <div className={ classes.planner_popup_orientation_button + ' ' + (orientationStatus == 'landscape' ? classes.planner_popup_orientation_button_active : '') } onClick={e => changeOrientation(e, 'landscape')}>
                                                    <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                                                        <path fillRule="evenodd" clipRule="evenodd" d="M14.4184 0.265335C14.4701 0.292774 14.5183 0.326432 14.5619 0.365562L14.5757 0.377564L14.5883 0.390168L14.5949 0.396168L18.796 4.59725L18.8092 4.61106L18.8224 4.62546L18.8266 4.63026C18.9489 4.76707 19.0162 4.94429 19.0156 5.12779L19.0156 14.7303C19.0156 15.1444 18.6795 15.4805 18.2654 15.4805L0.860924 15.4805C0.446817 15.4805 0.110731 15.1444 0.110731 14.7303L0.11073 0.926706C0.11073 0.512599 0.446817 0.176513 0.860923 0.176513L14.0643 0.176512C14.1922 0.176512 14.3128 0.208321 14.4184 0.265335ZM14.0643 5.87799C13.6502 5.87799 13.3141 5.5419 13.3141 5.12779L13.3141 1.6769L1.61112 1.6769L1.61112 13.9801L17.5152 13.9801L17.5152 5.87799L14.0643 5.87799Z" fill="#2A3435"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={ classes.planner_popup_orientation }>
                                            <div className={classes.planner_popup_acc_title}>Відображення</div>
                                            <div className={ classes.planner_popup_orientation_buttons }>
                                                <div className={ classes.planner_popup_orientation_button + ' ' + (activeViewMode == 'view2d' ? classes.planner_popup_orientation_button_active : '') } onClick={e => changeViewMode('view2d')}>
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <path opacity="0.99" d="M1.32873 6.09131L9.27122 9.62956V18.2154L1.32812 13.976L1.32873 6.09131Z" fill="#66ACF4"/>
                                                        <path opacity="0.99" d="M18.0619 6.09131L10.1194 9.62956V18.2154L18.0625 13.976L18.0619 6.09131Z" fill="#B2D924"/>
                                                        <path opacity="0.99" d="M17.5547 5.28782L9.70082 1.0932L1.75963 5.34621L9.69138 8.91793L17.5547 5.28782Z" fill="#F9ED32"/>
                                                        <path fillRule="evenodd" clipRule="evenodd" d="M9.66481 8.80656L1.8889 5.32405L9.70145 1.16733L17.4383 5.29971L9.66481 8.80656ZM9.19727 9.69287L1.37695 6.19048V13.948L9.19727 18.1054V9.69287ZM10.1973 18.1011L18.0132 13.9426L17.9946 6.14581L10.1973 9.6634V18.1011ZM18.9918 4.99576L19.0146 14.5425L9.69363 19.5018L0.376953 14.5489V4.99576L9.70236 0.0341187L18.9918 4.99576Z" fill="black"/>
                                                    </svg>
                                                </div>
                                                <div className={ classes.planner_popup_orientation_button + ' ' + (activeViewMode == 'constr' ? classes.planner_popup_orientation_button_active : '') } onClick={e => changeViewMode('constr')}>
                                                    <svg  width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <path fillRule="evenodd" clipRule="evenodd" d="M9.66481 9.13475L1.8889 5.65224L9.70145 1.49552L17.4383 5.6279L9.66481 9.13475ZM9.19727 10.0211L1.37695 6.51867V14.2762L9.19727 18.4336V10.0211ZM10.1973 18.4293L18.0132 14.2708L17.9946 6.474L10.1973 9.99159V18.4293ZM18.9918 5.32395L19.0146 14.8707L9.69363 19.83L0.376953 14.8771V5.32395L9.70236 0.362305L18.9918 5.32395Z" fill="black"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={ classes.planner_popup_acc }>
                                            <div className={classes.planner_popup_acc_title}>{ translation["EXPORT_PROJECT_SIZE"] }</div>

                                            <div className={classes.planner_popup_acc_type_accordion}>
                                                <Accordion customTitle={
                                                    <div className={ classes.planner_popup_acc_type_active } data-toggle="true">
                                                        <p className={ classes.planner_popup_acc_type_active_left }>{ sizeTypes[sizeTypeCurrent].type }</p>
                                                        <div className={classes.planner_popup_acc_type_active_info}>
                                                            <p className={ classes.planner_popup_acc_type_active_right }>{ sizeTypes[sizeTypeCurrent].size }</p>
                                                            <svg width="15" height="8" viewBox="0 0 15 8" fill="none" className={classes.dropdown_arrow + ' ' + 'dropdown_arrow'}>
                                                                <path fillRule="evenodd" clipRule="evenodd" d="M8.34954 6.68041L7.72708 7.30725L7.72269 7.30288L7.71927 7.30627L7.23596 6.81956L0.722721 0.351854L2.90449 0.351854L7.72269 5.18586L12.5419 0.350878L14.7236 0.350878L8.34954 6.68041Z" fill="black"></path>
                                                            </svg>
                                                        </div>
                                                    </div>} isOpened={false}
                                                >
                                                    <div className={classes.planner_popup_acc_type_option_wrap}>
                                                        { sizeTypesMain }
                                                    </div>
                                                </Accordion>
                                            </div>
                                        </div>
                                        <div className={ classes.planner_popup_acc }>
                                            <div className={classes.planner_popup_acc_title}>{ translation["EXPORT_PROJECT_SCALE"] }</div>

                                            <div className={classes.planner_popup_acc_type_accordion}>
                                                <Accordion customTitle={
                                                    <div className={ classes.planner_popup_acc_type_active } data-toggle="true">
                                                        <p className={ classes.planner_popup_acc_type_active_left }>{ scaleTypeCurrent == indexFit ? translation["EXPORT_PROJECT_FIT_THE_PAGE"] : scaleTypes[scaleTypeCurrent].type }</p>
                                                        <div className={classes.planner_popup_acc_type_active_info}>
                                                            <p className={ classes.planner_popup_acc_type_active_right }>{ scaleTypes[scaleTypeCurrent].scale }</p>
                                                            <svg width="15" height="8" viewBox="0 0 15 8" fill="none" className={classes.dropdown_arrow + ' ' + 'dropdown_arrow'}>
                                                                <path fillRule="evenodd" clipRule="evenodd" d="M8.34954 6.68041L7.72708 7.30725L7.72269 7.30288L7.71927 7.30627L7.23596 6.81956L0.722721 0.351854L2.90449 0.351854L7.72269 5.18586L12.5419 0.350878L14.7236 0.350878L8.34954 6.68041Z" fill="black"></path>
                                                            </svg>
                                                        </div>
                                                    </div>} isOpened={false}
                                                >
                                                    <div className={classes.planner_popup_acc_type_option_wrap}>
                                                        { scaleTypesMain }
                                                    </div>
                                                </Accordion>
                                            </div>
                                        </div>
                                        <div className={ classes.planner_popup_checkboxes }>
                                            <div className={classes.planner_popup_acc_title}>{ translation["EXPORT_PROJECT_SETTINGS"] }</div>
                                            <div className={ classes.planner_popup_checkboxes_main }>
                                                <div className={ classes.planner_popup_checkbox }>
                                                    <Checkbox onChange={status => setShowScaleStatus(status)} name={"showScale"} label={translation["EXPORT_PROJECT_SHOW_SCALE"]} checked={showScaleStatus}/>
                                                </div>
                                                <div className={ classes.planner_popup_checkbox }>
                                                    <Checkbox onChange={status => setShowRoomAreaStatus(status)} name={"showRoomArea"} label={translation["EXPORT_PROJECT_SHOW_ROOM_AREA"]} checked={showRoomAreaStatus}/>
                                                </div>
                                                <div className={ classes.planner_popup_checkbox }>
                                                    <Checkbox onChange={status => setShowRoomNameStatus(status)} name={"showRoomName"} label={translation["EXPORT_PROJECT_SHOW_ROOM_NAME"]} checked={showRoomNameStatus}/>
                                                </div>
                                                <div className={ classes.planner_popup_checkbox }>
                                                    <Checkbox disabled={disabledSizesStatus} onChange={status => setShowSizesStatus(status)} name={"showSizes"} label={translation["EXPORT_PROJECT_SHOW_SIZES"]} checked={showSizesStatus}/>
                                                </div>
                                                <div className={ classes.planner_popup_checkbox }>
                                                    <Checkbox disabled={!disabledSizesStatus} onChange={status => setShowTerrainTextureStatus(status)} name={"showTerrainTexture"} label={translation["EXPORT_PROJECT_SHOW_TER_TEXTURE"]} checked={showTerrainTextureStatus}/>
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                </SimpleBar>
                            </div>
                        </div>
                        <div className={classes.planner_popup_cont_left_buttons}>
                            <div className={classes.planner_popup_cont_left_button + ' ' + classes.planner_popup_cont_left_button_cancel} onClick={onClickClosePopUp}>
                                <svg width="21" height="22" viewBox="0 0 21 22" fill="none" >
                                    <path d="M19.799 0.600586L20.5061 1.30769L0.707107 21.1067L0 20.3996L19.799 0.600586Z" fill="black"/>
                                    <path d="M0.799112 0.600586L0.0920048 1.30769L19.891 21.1067L20.5981 20.3996L0.799112 0.600586Z" fill="black"/>
                                </svg>
                                <p>{ translation["UPLOAD_MODEL_TEXT_CANCEL"] }</p>
                            </div>
                            <div className={classes.planner_popup_cont_left_button + ' ' + classes.planner_popup_cont_left_button_save} onClick={onSavePdf}>
                                <svg width="22" height="18" viewBox="0 0 22 18" fill="none" >
                                    <path d="M0.5 9.5L7.5 16.5L21.5 0.5" stroke="#2A3435"/>
                                </svg>
                                <p>{ translation["UPLOAD_MODEL_TEXT_SAVE"] }</p>
                            </div>
                        </div>

                    </div>
                    <div className={classes.planner_popup_cont_center} ref={pdfElem}>
                        <Document file={ pdfFile } className={classes.pdfViewer} inputRef={pdfRef} >
                            <Page className={classes.pdfViewer_page} pageNumber={1} renderTextLayer={false} inputRef={pageRef} onLoadSuccess={onPageLoad} scale={ scalePdfNum } renderAnnotationLayer={false}/>
                        </Document>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Export2DProjectPopup;
