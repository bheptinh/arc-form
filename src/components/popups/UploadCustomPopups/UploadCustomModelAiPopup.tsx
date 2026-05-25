import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeActivePopup, selectPopups, setActivePopup } from '../../../redux/features/popups/popupsSlice';
import {createUseStyles} from "react-jss";
import { selectTranslation } from '../../../redux/features/language/languageSlice';
import {selectUserProfileData} from "../../../redux/features/user/userSlice";
import Checkbox from "../../left_new/parts/dynamicPanel/components/Checkbox";
import { AnimatePresence, motion } from "framer-motion";
import { changeActiveControlPanelMode, selectActiveControlPanelModeData } from '../../../redux/features/control/controlPanelSlice';

const useStyle = createUseStyles({
    '@font-face': [
        {
            fontFamily: "RobotoCondensed-Light",
            fontWeight: 300,
            fontDisplay: 'swap',
            src: 'url("/src_designer/fonts/RobotoCondensed-Light.ttf") format("truetype")'
        },
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
    '@keyframes shake': {
        '0%':{ transform: 'translateX(0)' },
        '20%': { transform: 'translateX(-5px)' },
        '40%': { transform: 'translateX(5px)' },
        '60%': { transform: 'translateX(-5px)' },
        '80%': { transform: 'translateX(5px)' },
        '100%': { transform: 'translateX(0)' },
    },
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
        background: 'rgba(0, 0, 0, 0.8)'
    },
    planner_popup_wrap_show:{
        opacity: '1',
        pointerEvents: 'auto',
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
        '& $planner_popup_wr':{
            transform: 'scale(1)',
        }
    },
    planner_popup_wr:{
        color: '#000',
        width: '100%',
        maxHeight: '90%',
        transform: 'scale(0)',
        transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
        maxWidth: 1200,
        borderRadius: 6,
        '& > $planner_popup_cont':{
            flexDirection: 'column',
        },
        '@media screen and (max-width: 950px)':{
            width: '70%',
        }
    },
    planner_popup_cont:{
        color: '#000',
        position: 'relative',
        height: '100%',
        transition: 'all 1.9s cubic-bezier(0.19, 1, 0.22, 1)',

    },
    planner_popup_back:{
        width:   17,
        height: 'auto',
        position: 'absolute',
        top: 8,
        left: 8,
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
        width: '100%',
        height: 'auto'
    },
    upload_popup_top: {
        position: 'relative',
        zIndex: 1,
        display: "flex",
        justifyContent: "center",
        textAlign: "center",
        alignItems: "center",
        padding: 30,
        background: '#72C4FF',
        borderRadius: '6px 6px 0 0',
        boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
        '@media screen and (max-width: 950px)':{
            padding: 20,
        }
    },
    upload_popup_top_main: {
        border: '2px dashed #ffffff',
        height: 294,
        width: '100%',
        padding: 13,
        borderRadius: 7,
        '@media screen and (max-width: 950px)':{
            padding: 10,
            height: 130,
        }
    },
    upload_popup_top_preview_wr:{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        '& img':{
            maxWidth: '100%',
            maxHeight: '100%'
        }
    },
    upload_popup_top_set_file_wrap:{
        background: '#81CAFF',
        padding: 20,
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        outline: 'solid 2px transparent',
        outlineOffset: '-4px',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        '@media screen and (max-width: 950px)':{
            padding: 10,
        }
    },
    green_outline: {
        outline: 'solid 2px #bae51f',
        background: 'rgb(89 141 179)',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        '& $upload_popup_top_icon':{
            width: 93,
            height: 'auto',
            transform: 'translateY(47px)'
        },
        '& $upload_popup_top_text':{
            transform: 'translateY(-30px)',
            opacity: 0
        },
        '& $upload_popup_set_file_btn':{
            transform: 'translateY(-30px)',
            pointerEvents: 'none',
            opacity: 0
        },
    },
    upload_popup_top_icon:{
        transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
        pointerEvents: 'none',
        width: 49,
        height: 'auto',
        '@media screen and (max-width: 950px)':{
            width: 29,
        }
    },
    upload_popup_top_text:{
        fontSize: '18px',
        color: '#ffffff',
        whiteSpace: 'nowrap',
        display: 'flex',
        margin: '15px 0',
        transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
        pointerEvents: 'none',
        '& p':{
            margin: '0 2.5px'
        },
        '@media screen and (max-width: 950px)':{
            margin: '10px 0',
            fontSize: 11,
        }
    },
    upload_popup_set_file_btn:{
        color: '#2B2B2B',
        border: 'none',
        cursor: 'pointer',
        height: 36,
        display: 'flex',
        borderRadius: 3,
        padding: 15,
        fontSize: 14,
        textTransform: 'uppercase',
        background: '#9DD900',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
        alignItems: 'center',
        justifyContent: 'center',
        '&:hover':{
            background: '#8fc32d',
        },
        '& svg':{
            marginRight: 5
        },
        '@media screen and (max-width: 950px)':{
            height: 26,
            fontSize: 12,
            marginTop: 10
        }
    },
    upload_popup_change_img_btn:{
        color: '#fff',
        fontSize: 13,
        textDecoration: 'underline',
        position: 'absolute',
        bottom: "8px",
        left: "50%",
        transform: "translateX(-50%)",
        cursor: 'pointer',
        '&:hover':{
            textDecoration: 'none'
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
            bottom: 5,
        }
    },
    upload_popup_bottom_wrap:{
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    upload_popup_bottom_wr:{
        background: '#fff',
        overflow: 'hidden',
        borderRadius: '0 0 6px 6px',
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        transform: 'translateY(-100%)',
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',

    },
    upload_popup_bottom_wr_show:{
        transform: 'translateY(0)'
    },
    upload_popup_bottom:{
        padding: '37px 63px',
        fontSize: 14,
        color: '#2F2F2F',
        background: '#fff',
        borderRadius: "0 0 6px 6px",
        position: 'absolute',
        left: 0,
        width: '100%',
        bottom: 0,
       '& h2':{
            fontSize: 32,
            lineHeight: '27px',
            color: '#373737',
            marginBottom: 20,
            fontFamily: "RobotoCondensed-Light",
            fontWeight: 400,
            '@media screen and (max-width: 950px)':{
                fontSize: 20,
                lineHeight: 1,
                marginBottom: 10,
            }
        },
        '@media screen and (max-width: 950px)':{
            padding: '14px 20px',
            fontSize: 11,
        }
    },
    upload_popup_bottom_items:{
        display: 'inline-grid',
        justifyContent: 'flex-start',
        width: '100%',
        gridTemplateColumns: 'auto auto',
        gridGap: '10px 14px',
        alignItems: 'center',
        marginBottom: 20,
        '& b':{
            display: 'inline-block',
            marginLeft: 5
        },
    },
    upload_popup_bottom_item_right:{
        fontWeight: 700,
        color: '#2F2F2F',
        transition: "color 0.9s cubic-bezier(0.19, 1, 0.22, 1)",
    },
    upload_popup_bottom_item_error:{
        color: '#DD352E',
        animation: '$shake 0.4s ease'
    },
    upload_model_img_correct_wr:{
        display: "grid",
        marginTop: 20,
        gridTemplateColumns: "repeat(6, auto)",
        justifyContent: "flex-start",
        margin: 'auto',
        '& img':{
            width: '100%'
        },
        '@media screen and (max-width: 950px)':{
            '& img':{

            },
        }
    },
    upload_popup_get_credits_btn:{
        color: '#66ACF4',
        fontSize: 14,
        textDecoration: 'underline',
        cursor: 'pointer',
        fontWeight: 400,
        display: 'inline-block',
        marginLeft: 10,
        '&:hover':{
            textDecoration: 'none',
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
        }
    },
    upload_popup_checkbox_wr:{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 14,
        '& a':{
            color: '#66ACF4',
            fontSize: 14,
            textDecoration: 'underline',
            cursor: 'pointer',
            fontWeight: 400,
            display: 'inline-block',
            margin: '0 6px',
            '&:hover':{
                textDecoration: 'none',
            },
            '@media screen and (max-width: 950px)':{
                fontSize: 11,
            }
        }
    },
    upload_popup_checkbox_wr_important:{
        '& a':{
            color: "red!important",
            transition: 'all .2s ease'
        },
        '& label':{
            color: "red!important",
            transition: 'all .2s ease'
        }
    },
    upload_popup_ai_warning_wr:{
        marginTop: 25,
        display: 'flex',
        justifyContent: 'center'
    },
    upload_popup_ai_warning:{
        color: '#2F2F2F',
        fontSize: 14,
        lineHeight: '1.5',
        padding: '8px 35px',
        borderRadius: 6,
        background: '#FFB400',
       textAlign: 'center',
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
        }
    },
    planner_popup_generate_btn_wr:{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 12,
        alignSelf: 'center'
    },
    planner_popup_generate_btn:{
        color: "#2B2B2B",
        border: "none",
        cursor: "pointer",
        height: "36px",
        display: "flex",
        padding: "15px",
        fontSize: "14px",
        background: "#9DD900",
        transition: "all 0.9s cubic-bezier(0.19, 1, 0.22, 1)",
        alignItems: "center",
        borderRadius: "3px",
        textTransform: "uppercase",
        justifyContent: "center",
        '&:hover':{
            background: '#8fc32d'
        },
        '@media screen and (max-width: 950px)':{
            fontSize: 12,
            height: '26px',
            minWidth: 88
        }
    },
    planner_popup_export_progressBar_wr:{
        background: '#fff',
        borderRadius: 6,
        overflow: 'hidden'
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
            textAlign: 'center'
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
                marginBottom: 0
            }
        },
        '& h3':{
            color: '#ffffff',
            fontSize: 14,
            fontWeight: 400
        },
        '@media screen and (max-width: 950px)':{
            padding: '15px 10px'
        }
    }
});

const UploadCustomModelAiPopup = props => {
    const classes = useStyle();
    let dispatch = useDispatch();
    let translation = useSelector(selectTranslation);
    let userProfileData = useSelector(selectUserProfileData);
    let popups = useSelector(selectPopups);
    let currOS = R2D.controller.getCurrentOS();
    let isCurrDeviceAPhone = currOS == "iOS" || currOS == "Android";
    let checkBoxRef = useRef(null);
    let previewWrap = useRef(null);
    let dropMatDiv = useRef(null);

    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = activeControlPanelData.history;
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];

    let [statusErrorFormat, setStatusErrorFormat] = useState(false);
    let [statusErrorWeight, setStatusErrorWeight] = useState(false);
    let [animPopupClass, setAnimPopupClass] = useState(false);
    let [agreeUmovu, setAgreeUmovu] = useState(true);
    let [previewStatus, setPreviewStatus] = useState(false);
    let [previewFile, setPreviewFile] = useState(null);

    let [popupStage, setPopupStage] = useState(1);
    let [progress, setProgress] = useState(0);
    let [currentModelLoadingId, setCurrentModelLoadingId] = useState(null);
    let [currentModelEntityId, setCurrentModelEntityId] = useState(false);

    let imgFile = null;
    let interval;

    let dragOverListener = e => {
        e.preventDefault();
        dropMatDiv.current.classList.add(classes.green_outline)
    }

    let dragEnterListener = e => e.preventDefault();

    let dragLeaveListener = e => {
        e.preventDefault();
        dropMatDiv.current.classList.remove(classes.green_outline);
    }

    let dropListener = e => {
        e.preventDefault();
        dropMatDiv.current.classList.remove(classes.green_outline);

        if (e.dataTransfer.files.length > 0) {
            imgFile = e.dataTransfer.files[0];
            openFile(imgFile);
        }
    }

    let onUploadFile = e => {
        var inputFile = document.createElement('input');
        inputFile.accept='image/*';

        function inputFileChangeEventHandler(event) {
            imgFile = event.currentTarget.files[0];
            inputFile.removeEventListener('change', inputFileChangeEventHandler);
            inputFile = null;
            openFile(imgFile);
        }

        inputFile.setAttribute('type', 'file');
        inputFile.addEventListener('change', inputFileChangeEventHandler);
        inputFile.click();
    }

    let changeImage = e =>{
        setPreviewStatus(false);
        setPreviewFile(null);
    }

    let openFile = file => {
        const allowedExtensions = ['jpeg', 'png', 'jpg'];
        const extension = file.name.split('.').pop().toLowerCase();

        const fileSizeInBytes = file.size;
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

        if (!allowedExtensions.includes(extension)) {
            setStatusErrorFormat(true);
            return setTimeout(() => setStatusErrorFormat(false), 4000);
        }

        if(fileSizeInMB > 20){
            setStatusErrorWeight(true);
            setTimeout(() => setStatusErrorWeight(false), 4000);
            return;
        }

        setPreviewStatus(true);
        setPreviewFile(file);
    }

    let onClickClosePopUp = e => {
        if(R2D.modelUploader) {
            R2D.modelUploader.dispose();
            R2D.modelUploader = null;
        }
        setAnimPopupClass(false);
        setTimeout(() => dispatch(closeActivePopup({name: "uploadCustomModelAiPopup"})), 500);
    }

    let onUploadChoiceModelPopup = e =>{
        R2D.Storage.load("r2d_uploadModelAiPopup")? dispatch(setActivePopup({name: "uploadChoiceModelPopup"})) : dispatch(setActivePopup({name: "uploadModelAiInfoPopup"}));
        onClickClosePopUp();
    }

    let agreeUmovuClick = e => setAgreeUmovu(!agreeUmovu);

    let onGenerateModel = async e => {
        if( !agreeUmovu ) {
            document.querySelector(`.${classes.upload_popup_checkbox_wr}`).classList.add(classes.upload_popup_checkbox_wr_important);
            return setTimeout(() => document.querySelector(`.${classes.upload_popup_checkbox_wr}`).classList.remove(classes.upload_popup_checkbox_wr_important), 300);
        }

        if(!userProfileData.credits || +userProfileData.credits < 1) {
            return dispatch(setActivePopup({name: "buyCredits"}));
        }

        R2D.modelAIUploader = new R2D.ModelAIUploader();

        let newFormData = new FormData();
        newFormData.append('file', previewFile, previewFile.name);
        newFormData.append('categoryId', lastHistoryElem.id || null)

        let taskId = await R2D.modelAIUploader.createNewModel(newFormData);
        setPopupStage(2);
        setCurrentModelLoadingId(taskId);
    }

    const checkStatus = async () => {
        let response = await R2D.modelAIUploader.checkStatus(currentModelLoadingId);
        if(response.type == 'error') {
            dispatch(setActivePopup({name: "alert", data: result?.data || 'TEXT_ERROR_LOAD_DATA'}));
        }
        setProgress(response.data.task.progress);
        return { entityId: response.data.entityId, status: response.status, dataStatus: response.data.status }
    }

    useEffect(() => {
        const timer = setTimeout(() => setAnimPopupClass(true), 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (previewStatus && previewWrap.current && previewFile) {
            previewWrap.current.innerHTML = '';
            const img = document.createElement('img');
            img.src = URL.createObjectURL(previewFile);
            img.alt = 'preview';
            previewWrap.current.appendChild(img);
        } else if (previewWrap.current){
            previewWrap.current.innerHTML = ''
        }
    }, [previewStatus, previewWrap.current, previewFile]);

    useEffect(() => {
        if(currentModelLoadingId) {
            let timeIntervalStarted = Date.now();
            interval = setInterval(async () => {
                let result = await checkStatus();
                if(result.entityId && result.status == 'ok' && result.dataStatus == 'success') {
                    clearInterval(interval);
                    setCurrentModelEntityId(result.entityId);
                    R2D.modelAIUploader.clearModelId(currentModelLoadingId);
                }
                else if(result.status == 'failed' || Date.now() - timeIntervalStarted > 300000) {
                    clearInterval(interval);
                    R2D.modelAIUploader.clearModelId(currentModelLoadingId);
                    dispatch(setActivePopup({name: "alert", data: 'FR_SOMETHING_WRONG'}));
                    dispatch(closeActivePopup({name: 'uploadCustomModelAiPopup'}));
                }
            }, 500);
        };
        return () => clearInterval(interval);
    }, [currentModelLoadingId]);

    useEffect(() => {
        if(currentModelEntityId) {
            if (R2D.modelUploader) {
                R2D.modelUploader.dispose();
                R2D.modelUploader = null;
            }
            R2D.modelUploader = new R2D.ModelUploader();
            dispatch(changeActiveControlPanelMode({mode: 'uploadModel', data: {type: "main", lastSavedScroll: 0, data: {type: 'change', id: currentModelEntityId}}}));
            dispatch(closeActivePopup({name: 'uploadCustomModelAiPopup'}));
        }
    }, [currentModelEntityId]);

    return (
        <div className={animPopupClass ? classes.planner_popup_wrap + ' ' + classes.planner_popup_wrap_show : classes.planner_popup_wrap} style={{zIndex: popups.uploadCustomModelAiPopup.zIndex}}>
            
            <div className={ classes.planner_popup_wr }>
                <div className={classes.planner_popup_cont}>
                    {
                        popupStage == 1 ?
                            <div>
                                <div className={classes.planner_popup_close} id="js_close_popup" onClick={onClickClosePopUp}>
                                    <svg  width="25" height="25" fill="none" viewBox="0 0 25 25" className={classes.planner_popup_close_icon}>
                                        <path fill="#2F2F2F" fillRule="evenodd" d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z" clipRule="evenodd"/>
                                        <path fill="#2F2F2F" fillRule="evenodd" d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z" clipRule="evenodd"/>
                                        <path fill="#2F2F2F" fillRule="evenodd" d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z" clipRule="evenodd"/>
                                        <path fill="#2F2F2F" fillRule="evenodd" d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z" clipRule="evenodd"/>
                                    </svg>
                                </div>
                                <svg className={classes.planner_popup_back} width="23" height="26" fill="none" viewBox="0 0 23 26" onClick={onUploadChoiceModelPopup}>
                                    <path fill="#232323" d="M14.352 1.236 3.416 11.931h18.708v1.692H3.302l11.096 10.685-1.172 1.159L1.31 13.99l-.008.01-1.18-1.15L13.17.086l1.18 1.15Z" opacity=".99"/>
                                </svg>
                                <div className={classes.upload_popup_top}>
                                    <div className={classes.upload_popup_top_main}>
                                        <AnimatePresence>
                                        {
                                            previewStatus ?
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    exit={{ scale: 0  }}
                                                    transition={{
                                                        duration: 1.9,
                                                        ease: [0.19, 1, 0.22, 1]
                                                    }}
                                                    className={classes.upload_popup_top_preview_wr} ref={previewWrap}></motion.div>
                                                :
                                                <div className={classes.upload_popup_top_set_file_wrap} ref={dropMatDiv} onDrop={dropListener} onDragLeave={dragLeaveListener} onDragEnter={dragEnterListener} onDragOver={dragOverListener}>
                                                    <svg width="49" height="37" viewBox="0 0 49 37" fill="none" className={classes.upload_popup_top_icon}>
                                                        <path d="M46.3496 0.25H2.43945C1.09423 0.25 0 1.34423 0 2.68945V33.5892C0 34.9344 1.09423 36.0287 2.43945 36.0287H46.3496C47.6948 36.0287 48.7891 34.9344 48.7891 33.5892V2.68945C48.7891 1.34423 47.6948 0.25 46.3496 0.25ZM2.43945 34.4023C1.9912 34.4023 1.62633 34.0375 1.62633 33.5892V23.5014L9.18969 15.9377C9.49538 15.628 10.0163 15.624 10.33 15.9417L18.3672 23.9714L7.93308 34.4023H2.43945ZM47.1627 33.5891C47.1627 34.0374 46.7979 34.4022 46.3496 34.4022H10.2331L34.3973 10.2456C34.703 9.93587 35.2244 9.93186 35.5373 10.2496L47.1628 21.8673L47.1627 33.5891ZM47.1627 19.5677L36.6906 9.10293C35.7687 8.16984 34.1586 8.17384 33.2438 9.09893L19.5171 22.8217L11.4831 14.795C10.5611 13.862 8.95108 13.8656 8.03628 14.7915L1.62633 21.2018V2.68945C1.62633 2.2412 1.9912 1.87633 2.43945 1.87633H46.3496C46.7979 1.87633 47.1627 2.2412 47.1627 2.68945V19.5677Z" fill="white"/>
                                                        <path d="M20.3262 5.94238C17.6358 5.94238 15.4473 8.13093 15.4473 10.8213C15.4473 13.5116 17.6358 15.7002 20.3262 15.7002C23.0165 15.7002 25.2051 13.5116 25.2051 10.8213C25.2051 8.13093 23.0166 5.94238 20.3262 5.94238ZM20.3262 14.0739C18.5327 14.0739 17.0736 12.6147 17.0736 10.8213C17.0736 9.02791 18.5327 7.56872 20.3262 7.56872C22.1196 7.56872 23.5787 9.02791 23.5787 10.8213C23.5787 12.6147 22.1196 14.0739 20.3262 14.0739Z" fill="white"/>
                                                    </svg>

                                                    {
                                                        !isCurrDeviceAPhone ?
                                                            <div className={classes.upload_popup_top_text}>

                                                                {translation["DRAG_FILE"]}
                                                                <br/>
                                                                {translation["TEXT_SIGN_IN_OR"]}
                                                            </div>
                                                        : null
                                                    }

                                                    <div className={classes.upload_popup_set_file_btn} onClick={onUploadFile}>
                                                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                                            <rect x="6" width="1" height="13" fill="black"/>
                                                            <rect x="13" y="6" width="1" height="13" transform="rotate(90 13 6)" fill="black"/>
                                                        </svg>
                                                        { translation["SELECT_FILE"] }
                                                    </div>
                                                </div>
                                        }
                                        </AnimatePresence>
                                    </div>
                                    {
                                        previewStatus ?
                                            <div className={classes.upload_popup_change_img_btn} onClick={changeImage}>{ translation["BUTTON_TEXT_REPLACE_FILE"] }</div>
                                        : null
                                    }
                                </div>

                                <div className={classes.upload_popup_bottom_wrap} style={ previewStatus ? !isCurrDeviceAPhone ? {height: 298} : {height: 231} : !isCurrDeviceAPhone ? {height: 307} : {height: 179}}>
                                    <div className={previewStatus ? classes.upload_popup_bottom_wr + ' '+ classes.upload_popup_bottom_wr_show: classes.upload_popup_bottom_wr}>
                                        <div className={classes.upload_popup_bottom}>
                                            <h2> { translation["NEED_CREDITS_TEXT"] }: 1</h2>
                                            <div className={classes.planner_popup_bottom_info}>
                                                { translation["RENDER_MY_CREDITS"] }:
                                                <b>{(+userProfileData.credits || 0).toFixed(0)}</b>
                                                <div className={classes.upload_popup_get_credits_btn} onClick={e => dispatch(setActivePopup({name: "buyCredits"}))}>
                                                    { translation["RENDER_GET_MORE"] }
                                                </div>
                                            </div>

                                            <div className={classes.upload_popup_ai_warning_wr}>
                                                <div className={classes.upload_popup_ai_warning}>
                                                    { translation["CREATE_MODEL_AI_WARNING_TEXT_1"] }<br/>
                                                    { translation["CREATE_MODEL_AI_WARNING_TEXT_2"] }
                                                </div>
                                            </div>

                                            <div className={classes.upload_popup_checkbox_wr} ref={checkBoxRef}>
                                                <Checkbox name={"agreeUmovu"} label={<>{translation["RENDER_BUY_TERMS_AGREE"]} <a href="#" target="_blank">{translation["RENDER_BUY_TERMS_OF_USE"]}</a></>} onChange={agreeUmovuClick} checked={agreeUmovu}/>
                                            </div>

                                            <div className={classes.planner_popup_generate_btn_wr}>
                                                <div className={classes.planner_popup_generate_btn} onClick={onGenerateModel}>{ translation["GENERATE_TEXT"] }</div>
                                            </div>

                                        </div>
                                    </div>

                                    <div className={!previewStatus ? classes.upload_popup_bottom_wr + ' '+ classes.upload_popup_bottom_wr_show: classes.upload_popup_bottom_wr}>
                                        <div className={classes.upload_popup_bottom}>
                                            <div className={classes.upload_popup_bottom_items}>
                                                <p className={classes.upload_popup_bottom_info_left}>{ translation["UPLOAD_FILE_FORMAT"] }:</p>
                                                <p className={statusErrorFormat ? classes.upload_popup_bottom_item_right + ' ' + classes.upload_popup_bottom_item_error : classes.upload_popup_bottom_item_right}>
                                                    JPEG, PNG
                                                </p>
                                                <p className={classes.upload_popup_bottom_info_left}>{ translation["FILE_SIZE_TEXT"] }:</p>
                                                <p className={statusErrorWeight ? classes.upload_popup_bottom_item_right + ' ' + classes.upload_popup_bottom_item_error : classes.upload_popup_bottom_item_right}>
                                                    {translation["DRAG_IMG_UP_TO_20"]}
                                                </p>
                                            </div>

                                            <div>
                                                <p className={classes.upload_popup_bottom_info_left}>{ translation["CREATE_MODEL_AI_REQUIREMENTS"] }</p>

                                                <div className={classes.upload_model_img_correct_wr}>
                                                    <div>
                                                        <img src="/src_designer/images/popup_upload_model_ai/upload_model_img_correct_1.jpg"/>
                                                    </div>
                                                    <div>
                                                        <img src="/src_designer/images/popup_upload_model_ai/upload_model_img_correct_2.jpg"/>
                                                    </div>
                                                    <div>
                                                        <img src="/src_designer/images/popup_upload_model_ai/upload_model_img_in_correct_2.jpg"/>
                                                    </div>
                                                    <div>
                                                        <img src="/src_designer/images/popup_upload_model_ai/upload_model_img_in_correct_4.jpg"/>
                                                    </div>
                                                    <div>
                                                        <img src="/src_designer/images/popup_upload_model_ai/upload_model_img_in_correct_3.jpg"/>
                                                    </div>
                                                    <div>
                                                        <img src="/src_designer/images/popup_upload_model_ai/upload_model_img_in_correct_1.jpg"/>
                                                    </div>
                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        :
                        popupStage == 2 ?
                            <div className={classes.planner_popup_export_progressBar_wr}>
                                <div className={classes.planner_popup_export_top}>
                                    <h2>{ translation["CREATE_MODEL_AI_PREPARING_TITLE"] }</h2>
                                </div>
                                <div className={classes.planner_popup_export_downloading}>
                                    <div className={classes.planner_popup_export_downloading_text}>
                                        <p dangerouslySetInnerHTML={{__html: translation["CREATE_MODEL_AI_PREPARING_TEXT_1"]}}></p>
                                    </div>
                                    <div className={classes.planner_popup_export_progressBar}>
                                        <div className={classes.planner_popup_export_progressBar_progress} style={{width: progress * 3}}></div>
                                    </div>
                                </div>
                            </div>
                        : null
                    }
                </div>
            </div>
        </div>
    )
}

export default UploadCustomModelAiPopup;