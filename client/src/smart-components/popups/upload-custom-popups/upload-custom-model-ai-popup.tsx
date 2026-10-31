import { IconArrowLeft, IconPhotoScan, IconPlus, IconX } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import {
  changeActiveControlPanelMode,
  selectActiveControlPanelModeData,
} from '../../../redux/features/control/controlPanelSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../../redux/features/popups/popupsSlice';
import Checkbox from '../../../shared-components/inputs/checkbox';
import DefaultModal from '../../../shared-components/modals/default';

const useStyle = createUseStyles({
  '@font-face': [
    {
      fontFamily: 'RobotoCondensed-Light',
      fontWeight: 300,
      fontDisplay: 'swap',
      src: 'url("/src_designer/fonts/RobotoCondensed-Light.ttf") format("truetype")',
    },
    {
      fontFamily: 'Roboto-Light',
      fontWeight: 300,
      fontDisplay: 'swap',
      src: 'url("/src_designer/Roboto-Light.ttf") format("truetype")',
    },
    {
      fontFamily: 'Roboto-Bold',
      fontWeight: 700,
      fontDisplay: 'swap',
      src: 'url("/src_designer/Roboto-Bold.ttf") format("truetype")',
    },
  ],
  '@keyframes shake': {
    '0%': { transform: 'translateX(0)' },
    '20%': { transform: 'translateX(-5px)' },
    '40%': { transform: 'translateX(5px)' },
    '60%': { transform: 'translateX(-5px)' },
    '80%': { transform: 'translateX(5px)' },
    '100%': { transform: 'translateX(0)' },
  },
  planner_popup_wrap: {
    background: 'rgba(0, 0, 0, 0.8)',
  },
  planner_popup_wr: {
    width: '100%',
    maxWidth: 1200,
    borderRadius: 6,
    '& > $planner_popup_cont': {
      flexDirection: 'column',
    },
    '@media screen and (max-width: 950px)': {
      width: '70%',
    },
    boxShadow: 'none',
  },
  planner_popup_cont: {
    color: '#000',
    position: 'relative',
    height: '100%',
    transition: 'all 1.9s cubic-bezier(0.19, 1, 0.22, 1)',
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  planner_popup_back: {
    width: 17,
    height: 'auto',
    position: 'absolute',
    top: 8,
    left: 8,
    cursor: 'pointer',
    zIndex: '2',
    '& path': {
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover': {
      '& path': {
        fill: '#BAE51F',
      },
    },
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
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover': {
      '& path': {
        fill: '#BAE51F',
      },
    },
  },
  planner_popup_close_icon: {
    width: '100%',
    height: 'auto',
  },
  upload_popup_top: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    padding: 30,
    background: '#72C4FF',
    borderRadius: '6px 6px 0 0',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    '@media screen and (max-width: 950px)': {
      padding: 20,
    },
  },
  upload_popup_top_main: {
    border: '2px dashed #ffffff',
    height: 294,
    width: '100%',
    padding: 13,
    borderRadius: 7,
    '@media screen and (max-width: 950px)': {
      padding: 10,
      height: 130,
    },
  },
  upload_popup_top_preview_wr: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& img': {
      maxWidth: '100%',
      maxHeight: '100%',
    },
  },
  upload_popup_top_set_file_wrap: {
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
    '@media screen and (max-width: 950px)': {
      padding: 10,
    },
  },
  green_outline: {
    outline: 'solid 2px #bae51f',
    background: 'rgb(89 141 179)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '& $upload_popup_top_icon': {
      width: 93,
      height: 'auto',
      transform: 'translateY(47px)',
    },
    '& $upload_popup_top_text': {
      transform: 'translateY(-30px)',
      opacity: 0,
    },
    '& $upload_popup_set_file_btn': {
      transform: 'translateY(-30px)',
      pointerEvents: 'none',
      opacity: 0,
    },
  },
  upload_popup_top_icon: {
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    pointerEvents: 'none',
    width: 49,
    height: 'auto',
    '@media screen and (max-width: 950px)': {
      width: 29,
    },
  },
  upload_popup_top_text: {
    fontSize: '18px',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    display: 'flex',
    margin: '15px 0',
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    pointerEvents: 'none',
    '& p': {
      margin: '0 2.5px',
    },
    '@media screen and (max-width: 950px)': {
      margin: '10px 0',
      fontSize: 11,
    },
  },
  upload_popup_set_file_btn: {
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
    '&:hover': {
      background: '#8fc32d',
    },
    '& svg': {
      marginRight: 5,
    },
    '@media screen and (max-width: 950px)': {
      height: 26,
      fontSize: 12,
      marginTop: 10,
    },
  },
  upload_popup_change_img_btn: {
    color: '#fff',
    fontSize: 13,
    textDecoration: 'underline',
    position: 'absolute',
    bottom: '8px',
    left: '50%',
    transform: 'translateX(-50%)',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'none',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      bottom: 5,
    },
  },
  upload_popup_bottom_wrap: {
    overflow: 'hidden',
    position: 'relative',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  upload_popup_bottom_wr: {
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
  upload_popup_bottom_wr_show: {
    transform: 'translateY(0)',
  },
  upload_popup_bottom: {
    padding: '37px 63px',
    fontSize: 14,
    color: '#2F2F2F',
    background: '#fff',
    borderRadius: '0 0 6px 6px',
    position: 'absolute',
    left: 0,
    width: '100%',
    bottom: 0,
    '@media screen and (max-width: 950px)': {
      padding: '14px 20px',
      fontSize: 11,
    },
  },
  upload_popup_bottom_items: {
    display: 'inline-grid',
    justifyContent: 'flex-start',
    width: '100%',
    gridTemplateColumns: 'auto auto',
    gridGap: '10px 14px',
    alignItems: 'center',
    marginBottom: 20,
    '& b': {
      display: 'inline-block',
      marginLeft: 5,
    },
  },
  upload_popup_bottom_item_right: {
    fontWeight: 700,
    color: '#2F2F2F',
    transition: 'color 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  upload_popup_bottom_item_error: {
    color: '#DD352E',
    animation: '$shake 0.4s ease',
  },
  upload_model_img_correct_wr: {
    display: 'grid',
    marginTop: 20,
    gridTemplateColumns: 'repeat(6, auto)',
    justifyContent: 'flex-start',
    margin: 'auto',
    '& img': {
      width: '100%',
    },
    '@media screen and (max-width: 950px)': {
      '& img': {},
    },
  },
  upload_popup_checkbox_wr: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 14,
    '& a': {
      color: '#66ACF4',
      fontSize: 14,
      textDecoration: 'underline',
      cursor: 'pointer',
      fontWeight: 400,
      display: 'inline-block',
      margin: '0 6px',
      '&:hover': {
        textDecoration: 'none',
      },
      '@media screen and (max-width: 950px)': {
        fontSize: 11,
      },
    },
  },
  upload_popup_checkbox_wr_important: {
    '& a': {
      color: 'red!important',
      transition: 'all .2s ease',
    },
    '& label': {
      color: 'red!important',
      transition: 'all .2s ease',
    },
  },
  upload_popup_ai_warning_wr: {
    marginTop: 25,
    display: 'flex',
    justifyContent: 'center',
  },
  upload_popup_ai_warning: {
    color: '#2F2F2F',
    fontSize: 14,
    lineHeight: '1.5',
    padding: '8px 35px',
    borderRadius: 6,
    background: '#FFB400',
    textAlign: 'center',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  planner_popup_generate_btn_wr: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 12,
    alignSelf: 'center',
  },
  planner_popup_generate_btn: {
    color: '#2B2B2B',
    border: 'none',
    cursor: 'pointer',
    height: '36px',
    display: 'flex',
    padding: '15px',
    fontSize: '14px',
    background: '#9DD900',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    alignItems: 'center',
    borderRadius: '3px',
    textTransform: 'uppercase',
    justifyContent: 'center',
    '&:hover': {
      background: '#8fc32d',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
      height: '26px',
      minWidth: 88,
    },
  },
  planner_popup_export_progressBar_wr: {
    background: '#fff',
    borderRadius: 6,
    overflow: 'hidden',
  },
  planner_popup_export_downloading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    padding: '80px 10px 140px',
    '& p': {
      fontSize: 14,
      color: '#2f2f2f',
      textAlign: 'center',
    },
    '& progress': {},
    '@media screen and (max-width: 950px)': {
      padding: '30px 10px 30px',
    },
  },
  planner_popup_export_downloading_text: {
    marginBottom: 40,
    '@media screen and (max-width: 950px)': {
      marginBottom: 30,
    },
  },
  planner_popup_export_progressBar: {
    width: '100%',
    maxWidth: 300,
    height: 10,
    borderRadius: 7,
    boxShadow: 'inset rgba(0, 0, 0, 0.4) 0px 0.7px 2.81px 0px',
    position: 'relative',
    overflow: 'hidden',
    background: '#F6F6F6',
  },
  planner_popup_export_progressBar_progress: {
    width: 0,
    height: 'calc(100% - 4px)',
    position: 'absolute',
    left: 4,
    top: 2,
    background: '#9DD900',
    borderRadius: 7,
  },
  planner_popup_export_top: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#72C4FF',
    padding: '30px 10px',
    '& h2': {
      color: '#ffffff',
      fontSize: 32,
      fontFamily: 'Roboto-Light, sans-serif',
      fontWeight: 300,
      marginBottom: 10,
      '@media screen and (max-width: 950px)': {
        fontSize: 20,
        marginBottom: 0,
      },
    },
    '& h3': {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: 400,
    },
    '@media screen and (max-width: 950px)': {
      padding: '15px 10px',
    },
  },
});

const UploadCustomModelAiPopup = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);
  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';
  const checkBoxRef = useRef(null);
  const previewWrap = useRef(null);
  const dropMatDiv = useRef(null);

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = activeControlPanelData.history;
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];

  const [statusErrorFormat, setStatusErrorFormat] = useState(false);
  const [statusErrorWeight, setStatusErrorWeight] = useState(false);
  const [animPopupClass, setAnimPopupClass] = useState(false);
  const [agreeUmovu, setAgreeUmovu] = useState(true);
  const [previewStatus, setPreviewStatus] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const [popupStage, setPopupStage] = useState(1);
  const [progress, setProgress] = useState(0);
  const [currentModelLoadingId, setCurrentModelLoadingId] = useState(null);
  const [currentModelEntityId, setCurrentModelEntityId] = useState(false);

  let imgFile = null;
  let interval;

  const dragOverListener = (e) => {
    e.preventDefault();
    dropMatDiv.current.classList.add(classes.green_outline);
  };

  const dragEnterListener = (e) => e.preventDefault();

  const dragLeaveListener = (e) => {
    e.preventDefault();
    dropMatDiv.current.classList.remove(classes.green_outline);
  };

  const dropListener = (e) => {
    e.preventDefault();
    dropMatDiv.current.classList.remove(classes.green_outline);

    if (e.dataTransfer.files.length > 0) {
      imgFile = e.dataTransfer.files[0];
      openFile(imgFile);
    }
  };

  const onUploadFile = (e) => {
    let inputFile = document.createElement('input');
    inputFile.accept = 'image/*';

    function inputFileChangeEventHandler(event) {
      imgFile = event.currentTarget.files[0];
      inputFile.removeEventListener('change', inputFileChangeEventHandler);
      inputFile = null;
      openFile(imgFile);
    }

    inputFile.setAttribute('type', 'file');
    inputFile.addEventListener('change', inputFileChangeEventHandler);
    inputFile.click();
  };

  const changeImage = (e) => {
    setPreviewStatus(false);
    setPreviewFile(null);
  };

  const openFile = (file) => {
    const allowedExtensions = ['jpeg', 'png', 'jpg'];
    const extension = file.name.split('.').pop().toLowerCase();

    const fileSizeInBytes = file.size;
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

    if (!allowedExtensions.includes(extension)) {
      setStatusErrorFormat(true);
      return setTimeout(() => setStatusErrorFormat(false), 4000);
    }

    if (fileSizeInMB > 20) {
      setStatusErrorWeight(true);
      setTimeout(() => setStatusErrorWeight(false), 4000);
      return;
    }

    setPreviewStatus(true);
    setPreviewFile(file);
  };

  const onClickClosePopUp = (e) => {
    if (R2D.modelUploader) {
      R2D.modelUploader.dispose();
      R2D.modelUploader = null;
    }
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'uploadCustomModelAiPopup' })), 500);
  };

  const onUploadChoiceModelPopup = (e) => {
    R2D.Storage.load('r2d_uploadModelAiPopup')
      ? dispatch(setActivePopup({ name: 'uploadChoiceModelPopup' }))
      : dispatch(setActivePopup({ name: 'uploadModelAiInfoPopup' }));
    onClickClosePopUp();
  };

  const agreeUmovuClick = (e) => setAgreeUmovu(!agreeUmovu);

  const onGenerateModel = async (e) => {
    if (!agreeUmovu) {
      document
        .querySelector(`.${classes.upload_popup_checkbox_wr}`)
        .classList.add(classes.upload_popup_checkbox_wr_important);
      return setTimeout(
        () =>
          document
            .querySelector(`.${classes.upload_popup_checkbox_wr}`)
            .classList.remove(classes.upload_popup_checkbox_wr_important),
        300
      );
    }

    R2D.modelAIUploader = new R2D.ModelAIUploader();

    const newFormData = new FormData();
    newFormData.append('file', previewFile, previewFile.name);
    newFormData.append('categoryId', lastHistoryElem.id || null);

    const taskId = await R2D.modelAIUploader.createNewModel(newFormData);
    setPopupStage(2);
    setCurrentModelLoadingId(taskId);
  };

  const checkStatus = async () => {
    const response = await R2D.modelAIUploader.checkStatus(currentModelLoadingId);
    if (response.type == 'error') {
      dispatch(setActivePopup({ name: 'alert', data: result?.data || 'TEXT_ERROR_LOAD_DATA' }));
    }
    setProgress(response.data.task.progress);
    return {
      entityId: response.data.entityId,
      status: response.status,
      dataStatus: response.data.status,
    };
  };

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
    } else if (previewWrap.current) {
      previewWrap.current.innerHTML = '';
    }
  }, [previewStatus, previewWrap.current, previewFile]);

  useEffect(() => {
    if (currentModelLoadingId) {
      const timeIntervalStarted = Date.now();
      interval = setInterval(async () => {
        const result = await checkStatus();
        if (result.entityId && result.status == 'ok' && result.dataStatus == 'success') {
          clearInterval(interval);
          setCurrentModelEntityId(result.entityId);
          R2D.modelAIUploader.clearModelId(currentModelLoadingId);
        } else if (result.status == 'failed' || Date.now() - timeIntervalStarted > 300000) {
          clearInterval(interval);
          R2D.modelAIUploader.clearModelId(currentModelLoadingId);
          dispatch(setActivePopup({ name: 'alert', data: 'FR_SOMETHING_WRONG' }));
          dispatch(closeActivePopup({ name: 'uploadCustomModelAiPopup' }));
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [currentModelLoadingId]);

  useEffect(() => {
    if (currentModelEntityId) {
      if (R2D.modelUploader) {
        R2D.modelUploader.dispose();
        R2D.modelUploader = null;
      }
      R2D.modelUploader = new R2D.ModelUploader();
      dispatch(
        changeActiveControlPanelMode({
          mode: 'uploadModel',
          data: {
            type: 'main',
            lastSavedScroll: 0,
            data: { type: 'change', id: currentModelEntityId },
          },
        })
      );
      dispatch(closeActivePopup({ name: 'uploadCustomModelAiPopup' }));
    }
  }, [currentModelEntityId]);

  return (
    <DefaultModal
      visible={animPopupClass}
      zIndex={popups.uploadCustomModelAiPopup.zIndex}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
      wrapClassName={classes.planner_popup_wrap}
    >
      {popupStage == 1 ? (
        <div>
          <div
            className={classes.planner_popup_close}
            id="js_close_popup"
            onClick={onClickClosePopUp}
          >
            <IconX size={24} color="#2F2F2F" className={classes.planner_popup_close_icon} />
          </div>

          <IconArrowLeft
            className={classes.planner_popup_back}
            onClick={onUploadChoiceModelPopup}
            size={24}
            color="#2F2F2F"
          />

          <div className={classes.upload_popup_top}>
            <div className={classes.upload_popup_top_main}>
              <AnimatePresence>
                {previewStatus ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{
                      duration: 1.9,
                      ease: [0.19, 1, 0.22, 1],
                    }}
                    className={classes.upload_popup_top_preview_wr}
                    ref={previewWrap}
                  ></motion.div>
                ) : (
                  <div
                    className={classes.upload_popup_top_set_file_wrap}
                    ref={dropMatDiv}
                    onDrop={dropListener}
                    onDragLeave={dragLeaveListener}
                    onDragEnter={dragEnterListener}
                    onDragOver={dragOverListener}
                  >
                    <IconPhotoScan
                      size={50}
                      color="#fff"
                      className={classes.upload_popup_top_icon}
                    />

                    {!isCurrDeviceAPhone ? (
                      <div className={classes.upload_popup_top_text}>
                        {translation['DRAG_FILE']}
                        <br />
                        {translation['TEXT_SIGN_IN_OR']}
                      </div>
                    ) : null}

                    <div className={classes.upload_popup_set_file_btn} onClick={onUploadFile}>
                      <IconPlus size={13} color="#2B2B2B" />
                      {translation['SELECT_FILE']}
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
            {previewStatus ? (
              <div className={classes.upload_popup_change_img_btn} onClick={changeImage}>
                {translation['BUTTON_TEXT_REPLACE_FILE']}
              </div>
            ) : null}
          </div>

          <div
            className={classes.upload_popup_bottom_wrap}
            style={
              previewStatus
                ? !isCurrDeviceAPhone
                  ? { height: 298 }
                  : { height: 231 }
                : !isCurrDeviceAPhone
                  ? { height: 307 }
                  : { height: 179 }
            }
          >
            <div
              className={
                previewStatus
                  ? classes.upload_popup_bottom_wr + ' ' + classes.upload_popup_bottom_wr_show
                  : classes.upload_popup_bottom_wr
              }
            >
              <div className={classes.upload_popup_bottom}>
                <div className={classes.upload_popup_ai_warning_wr}>
                  <div className={classes.upload_popup_ai_warning}>
                    {translation['CREATE_MODEL_AI_WARNING_TEXT_1']}
                    <br />
                    {translation['CREATE_MODEL_AI_WARNING_TEXT_2']}
                  </div>
                </div>

                <div className={classes.upload_popup_checkbox_wr} ref={checkBoxRef}>
                  <Checkbox
                    name={'agreeUmovu'}
                    label={
                      <>
                        {translation['RENDER_BUY_TERMS_AGREE']}{' '}
                        <a href="#" target="_blank">
                          {translation['RENDER_BUY_TERMS_OF_USE']}
                        </a>
                      </>
                    }
                    onChange={agreeUmovuClick}
                    checked={agreeUmovu}
                  />
                </div>

                <div className={classes.planner_popup_generate_btn_wr}>
                  <div className={classes.planner_popup_generate_btn} onClick={onGenerateModel}>
                    {translation['GENERATE_TEXT']}
                  </div>
                </div>
              </div>
            </div>

            <div
              className={
                !previewStatus
                  ? classes.upload_popup_bottom_wr + ' ' + classes.upload_popup_bottom_wr_show
                  : classes.upload_popup_bottom_wr
              }
            >
              <div className={classes.upload_popup_bottom}>
                <div className={classes.upload_popup_bottom_items}>
                  <p>{translation['UPLOAD_FILE_FORMAT']}:</p>
                  <p
                    className={
                      statusErrorFormat
                        ? classes.upload_popup_bottom_item_right +
                          ' ' +
                          classes.upload_popup_bottom_item_error
                        : classes.upload_popup_bottom_item_right
                    }
                  >
                    JPEG, PNG
                  </p>
                  <p>{translation['FILE_SIZE_TEXT']}:</p>
                  <p
                    className={
                      statusErrorWeight
                        ? classes.upload_popup_bottom_item_right +
                          ' ' +
                          classes.upload_popup_bottom_item_error
                        : classes.upload_popup_bottom_item_right
                    }
                  >
                    {translation['DRAG_IMG_UP_TO_20']}
                  </p>
                </div>

                <div>
                  <p>{translation['CREATE_MODEL_AI_REQUIREMENTS']}</p>

                  <div className={classes.upload_model_img_correct_wr}>
                    <div>
                      <img src="/src_designer/images/popup_upload_model_ai/upload_model_img_correct_1.jpg" />
                    </div>
                    <div>
                      <img src="/src_designer/images/popup_upload_model_ai/upload_model_img_correct_2.jpg" />
                    </div>
                    <div>
                      <img src="/src_designer/images/popup_upload_model_ai/upload_model_img_in_correct_2.jpg" />
                    </div>
                    <div>
                      <img src="/src_designer/images/popup_upload_model_ai/upload_model_img_in_correct_4.jpg" />
                    </div>
                    <div>
                      <img src="/src_designer/images/popup_upload_model_ai/upload_model_img_in_correct_3.jpg" />
                    </div>
                    <div>
                      <img src="/src_designer/images/popup_upload_model_ai/upload_model_img_in_correct_1.jpg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : popupStage == 2 ? (
        <div className={classes.planner_popup_export_progressBar_wr}>
          <div className={classes.planner_popup_export_top}>
            <h2>{translation['CREATE_MODEL_AI_PREPARING_TITLE']}</h2>
          </div>
          <div className={classes.planner_popup_export_downloading}>
            <div className={classes.planner_popup_export_downloading_text}>
              <p
                dangerouslySetInnerHTML={{
                  __html: translation['CREATE_MODEL_AI_PREPARING_TEXT_1'],
                }}
              ></p>
            </div>
            <div className={classes.planner_popup_export_progressBar}>
              <div
                className={classes.planner_popup_export_progressBar_progress}
                style={{ width: progress * 3 }}
              ></div>
            </div>
          </div>
        </div>
      ) : null}
    </DefaultModal>
  );
};

export default UploadCustomModelAiPopup;
