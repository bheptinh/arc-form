import { AnimatePresence, motion } from 'framer-motion';
import React, { useMemo, useRef, useState } from 'react';
import { useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../../initR2D';
import { selectActiveControlPanelModeData } from '../../../redux/features/control/controlPanelSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../../redux/features/popups/popupsSlice';
import MaterialSize from './components/MaterialSize';
import { useTranslation } from '../../../api/hooks/useTranslation';

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
    background: 'rgba(0, 0, 0, 0.8)',
  },
  planner_popup_wrap_show: {
    opacity: '1',
    pointerEvents: 'auto',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    '& $planner_popup_wr': {
      transform: 'scale(1)',
    },
  },
  planner_popup_wr: {
    color: '#000',
    maxHeight: '90%',
    transform: 'scale(0)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    '& > $planner_popup_cont': {
      flexDirection: 'column',
    },
  },
  planner_popup_cont: {
    color: '#000',
    position: 'relative',
    height: '100%',
    transition: 'all 1.9s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  planner_popup_back: {
    width: 23,
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
  },
  upload_popup_top: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    background: '#72C4FF',
    padding: 30,
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
    bottom: 0,
    width: '100%',
    height: '100%',
    transform: 'translateY(-213px)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  upload_popup_bottom_wr_show: {
    transform: 'translateY(0)',
  },
  upload_popup_bottom_size_wr: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    fontSize: 14,
    color: '#2F2F2F',
    background: '#fff',
    borderRadius: '0 0 6px 6px',
    position: 'absolute',
    left: 0,
    width: '100%',
    bottom: 0,
    '& h2': {
      fontSize: 32,
      lineHeight: '27px',
      color: '#373737',
      marginBottom: 20,
      fontFamily: 'RobotoCondensed-Light',
      fontWeight: 400,
      '@media screen and (max-width: 950px)': {
        fontSize: 20,
        lineHeight: 1,
        marginBottom: 10,
      },
    },
    '@media screen and (max-width: 950px)': {
      padding: '14px 20px',
      fontSize: 11,
      '& $upload_popup_bottom_items': {
        gridTemplateColumns: 'auto',
        gridGap: 4,
        fontSize: 9,
      },
    },
  },
  upload_popup_bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 20,
    fontSize: 14,
    color: '#2F2F2F',
    background: '#fff',
    borderRadius: '0 0 6px 6px',
    position: 'absolute',
    left: 0,
    width: '100%',
    bottom: 0,
    '& h2': {
      fontSize: 32,
      lineHeight: '27px',
      color: '#373737',
      marginBottom: 20,
      fontFamily: 'RobotoCondensed-Light',
      fontWeight: 400,
      '@media screen and (max-width: 950px)': {
        fontSize: 20,
        lineHeight: 1,
        marginBottom: 10,
      },
    },
    '@media screen and (max-width: 950px)': {
      padding: '14px 20px',
      fontSize: 11,
    },
  },
  upload_popup_bottom_items: {
    display: 'grid',
    width: '100%',
    gridTemplateColumns: 'auto auto',
    gridGap: 10,
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
  upload_popup_bottom_size: {
    display: 'flex',
    alignItems: 'center',
  },
  planner_popup_bottom_size_btn: {
    marginRight: 40,
  },
  upload_popup_change_img_btn_wr: {
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    gridGap: 20,
    alignItems: 'center',
    '@media screen and (max-width: 950px)': {
      gridTemplateColumns: 'auto',
      justifyItems: 'baseline',
      gridGap: 10,
    },
  },
  upload_popup_change_img_btn: {
    cursor: 'pointer',
    height: '36px',
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
      background: '#E9E9E9',
    },
    '@media screen and (max-width: 950px)': {
      padding: '0 8px',
      minWidth: 88,
      fontSize: 12,
      height: 26,
    },
  },
  planerChangeSizesWrap: {
    display: 'grid',
    gridTemplateColumns: 'auto 27px',
    gridGap: 24,
    marginBottom: 20,
    paddingRight: 10,
  },
  planerChangeSizes: {},
  changeSizesLockWr: {
    position: 'relative',
    display: 'grid',
    paddingTop: 13,
  },
  lock_main: {
    position: 'absolute',
    top: 25,
    right: '-8px',
    '& svg': {
      width: 16,
      cursor: 'pointer',
    },
  },
  planner_popup_canvas_wr: {
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    position: 'relative',
    width: 615,
    overflow: 'hidden',
    borderRadius: '6px 6px 0 0 ',
    zIndex: 1,
    borderBottom: '1px solid #C6C4C4',
    '& canvas': {
      position: 'absolute',
      left: 0,
      top: 0,
    },
  },
});

const UploadCustomMaterialPopup = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();

  const popups = useSelector(selectPopups);

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const privateMaterialType =
    popups.uploadCustomMaterialPopup?.data?.privateMaterialType ||
    lastHistoryElem.privateMaterialType;
  const categoryId = lastHistoryElem?.id;

  let defWidth = 800;
  let defHeight = 600;

  const startWidth = 500;
  const startHeight = 300;

  let width = startWidth;
  let height = startHeight;

  const defImageWidth = 60;
  const defCarpetWidth = 120;
  const uploadType = privateMaterialType;
  const uploadCategory = categoryId;
  const uploadToBank = true;

  const callbackComplete = async (e) => {
    dispatch(closeActivePopup({ name: 'loadingMessage' }));
    dispatch(
      setActivePopup({ name: 'completeMessage', data: 'NOTIFY_PRODUCT_ADDED', positionX: 'right' })
    );
    const userUpload = await planner.scene.categoryDataLoad(
      `${R2D.URL.DOMAIN + R2D.URL.URL_CATALOG_SEARCH}&category_tag&my=1`
    );
    planner.setUserUpload(userUpload);
    planner.apiScene.dispatchEvent(
      new Event(planner.apiScene.USER_UPLOAD_BUTTON, { status: userUpload?.length > 0 })
    );
    planner.scene.dispatchEvent(new Event(planner.scene.PRODUCTS_UPDATED, {}));
  };
  let imageUploaded = false;
  var panelHeight = 80;
  const imageRotated = false;
  let imgSrc = null;
  var panelHeight = 80;

  const [imageLoaded, setImageLoaded] = useState({});
  let [imageWidth, setImageWidth] = useState(defImageWidth);
  let [imageHeight, setImageHeight] = useState(defImageWidth * 2);
  const [ratioOfSizes, setRatioOfSizes] = useState(1);
  const [animPopupClass, setAnimPopupClass] = useState(false);
  const [statusErrorFormat, setStatusErrorFormat] = useState(false);
  const [statusErrorWeight, setStatusErrorWeight] = useState(false);
  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  let imgFile = null;

  const prev3d = useMemo(
    () => new R2D.MaterialUploaderPreview3d(defWidth, defHeight - panelHeight),
    []
  );

  const preview = useRef(null);
  const dropMatDiv = useRef(null);
  const classes = useStyle();

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

  const openFile = (file) => {
    const allowedExtensions = ['jpg', 'webp', 'jpeg', 'png', 'gif', 'svg'];
    const extension = file.name.split('.').pop().toLowerCase();

    const fileSizeInBytes = file.size;
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

    if (!allowedExtensions.includes(extension)) {
      setStatusErrorFormat(true);
      setTimeout(function () {
        setStatusErrorFormat(false);
      }, 4000);
      return;
    }

    if (fileSizeInMB > 20) {
      setStatusErrorWeight(true);
      setTimeout(function () {
        setStatusErrorWeight(false);
      }, 4000);
      return;
    }

    const loader = new R2D.ImagesLoader();
    FILE.loadFileAsImage(file, procImg);
    function procImg(imgSrc) {
      loader.addEventListener(Event.COMPLETE, loaderListener);
      loader.load([imgSrc]);
    }

    function loaderListener(e) {
      if (!e.data[0].width || !e.data[0].height) return;
      imageUploaded = true;
      resizeListener();
      preview.current.append(prev3d.getRenderer().domElement);

      const isPortrait = e.data[0].height > e.data[0].width && uploadType == 4;
      let prodWidth = defImageWidth;
      if (uploadType == 4) prodWidth = defCarpetWidth;

      prev3d.setImage(e.data[0], imageRotated);

      let width = 0;
      let height = 0;

      if (isPortrait) {
        height = prodWidth;
        width = (prodWidth / e.data[0].height) * e.data[0].width;
      } else {
        width = prodWidth;
        height = (prodWidth / e.data[0].width) * e.data[0].height;
      }

      prev3d.setImageSize(width, height);

      loader.removeEventListener(Event.COMPLETE, loaderListener);
      loader.close();

      imgSrc = e.data[0].src;

      setImageWidth(width);
      setImageHeight(height);
      setRatioOfSizes(width / height);
      setImageLoaded({ status: true, file, src: imgSrc });
    }
    function resizeListener() {
      if (imageUploaded) {
        defWidth = Math.max(document.body.clientWidth - 400, 500);
        defHeight = Math.max(document.body.clientHeight - 150, 300);

        width = defWidth;
        height = defHeight;
        prev3d.setSize(defWidth, defHeight - panelHeight);

        preview.current.style.width = defWidth + 'px';
        preview.current.style.height = defHeight - panelHeight + 'px';
      }
    }
  };

  const onImageSizeChage = (width, height) => {
    if (imageRotated) {
      imageHeight = width;
      imageWidth = height;
    } else {
      imageWidth = width;
      imageHeight = height;
    }
    setImageWidth(imageWidth);
    setImageHeight(imageHeight);
    prev3d.setImageSize(imageWidth, imageHeight);
  };

  const onApplyImage = (e) => {
    prev3d.disposeRenderer();
    const uploader = new R2D.CustomUploader();

    onClickClosePopUp(e);
    dispatch(setActivePopup({ name: 'loadingMessage', data: 'TEXT_WAIT' }));

    if (uploadType == 3) {
      uploader.uploadPoster(
        imageLoaded.file,
        imageLoaded.src,
        imageWidth,
        imageHeight,
        uploadCategory,
        callbackComplete
      );
    } else if (uploadType == 4) {
      uploader.uploadCarpet(
        imageLoaded.file,
        imageLoaded.src,
        imageWidth,
        imageHeight,
        uploadCategory,
        callbackComplete
      );
    } else if (uploadType == 1 || uploadType == 5 || uploadType == 7) {
      uploader.uploadMaterial(
        imageLoaded.file,
        imageLoaded.src,
        imageWidth,
        imageHeight,
        uploadCategory,
        callbackComplete,
        uploadType,
        uploadToBank
      );
    }
  };

  const onClickClosePopUp = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => {
      dispatch(closeActivePopup({ name: 'uploadCustomMaterialPopup' }));
      prev3d.disposeRenderer();
    }, 500);
  };

  const onUploadChoicePopup = (e) => {
    dispatch(setActivePopup({ name: 'uploadChoicePopup' }));
    onClickClosePopUp();
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    prev3d.setType(privateMaterialType);
    prev3d.clear();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={
        animPopupClass
          ? classes.planner_popup_wrap + ' ' + classes.planner_popup_wrap_show
          : classes.planner_popup_wrap
      }
      style={{ zIndex: popups.uploadCustomMaterialPopup.zIndex }}
    >
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_cont}>
          {popups.uploadCustomMaterialPopup.backBtn ? (
            <svg
              className={classes.planner_popup_back}
              width="23"
              height="26"
              fill="none"
              viewBox="0 0 23 26"
              onClick={onUploadChoicePopup}
            >
              <path
                fill="#232323"
                d="M14.352 1.236 3.416 11.931h18.708v1.692H3.302l11.096 10.685-1.172 1.159L1.31 13.99l-.008.01-1.18-1.15L13.17.086l1.18 1.15Z"
                opacity=".99"
              />
            </svg>
          ) : null}

          <div className={classes.planner_popup_close} onClick={onClickClosePopUp}>
            <svg
              width="25"
              height="25"
              fill="none"
              viewBox="0 0 25 25"
              className={classes.planner_popup_close_icon}
            >
              <path
                fill="#2F2F2F"
                fillRule="evenodd"
                d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z"
                clipRule="evenodd"
              />
              <path
                fill="#2F2F2F"
                fillRule="evenodd"
                d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z"
                clipRule="evenodd"
              />
              <path
                fill="#2F2F2F"
                fillRule="evenodd"
                d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z"
                clipRule="evenodd"
              />
              <path
                fill="#2F2F2F"
                fillRule="evenodd"
                d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          {!imageLoaded.status ? (
            <div className={classes.upload_popup_top}>
              <div className={classes.upload_popup_top_main}>
                <div
                  className={classes.upload_popup_top_set_file_wrap}
                  ref={dropMatDiv}
                  onDrop={dropListener}
                  onDragLeave={dragLeaveListener}
                  onDragEnter={dragEnterListener}
                  onDragOver={dragOverListener}
                >
                  <svg
                    width="49"
                    height="37"
                    viewBox="0 0 49 37"
                    fill="none"
                    className={classes.upload_popup_top_icon}
                  >
                    <path
                      d="M46.3496 0.25H2.43945C1.09423 0.25 0 1.34423 0 2.68945V33.5892C0 34.9344 1.09423 36.0287 2.43945 36.0287H46.3496C47.6948 36.0287 48.7891 34.9344 48.7891 33.5892V2.68945C48.7891 1.34423 47.6948 0.25 46.3496 0.25ZM2.43945 34.4023C1.9912 34.4023 1.62633 34.0375 1.62633 33.5892V23.5014L9.18969 15.9377C9.49538 15.628 10.0163 15.624 10.33 15.9417L18.3672 23.9714L7.93308 34.4023H2.43945ZM47.1627 33.5891C47.1627 34.0374 46.7979 34.4022 46.3496 34.4022H10.2331L34.3973 10.2456C34.703 9.93587 35.2244 9.93186 35.5373 10.2496L47.1628 21.8673L47.1627 33.5891ZM47.1627 19.5677L36.6906 9.10293C35.7687 8.16984 34.1586 8.17384 33.2438 9.09893L19.5171 22.8217L11.4831 14.795C10.5611 13.862 8.95108 13.8656 8.03628 14.7915L1.62633 21.2018V2.68945C1.62633 2.2412 1.9912 1.87633 2.43945 1.87633H46.3496C46.7979 1.87633 47.1627 2.2412 47.1627 2.68945V19.5677Z"
                      fill="white"
                    />
                    <path
                      d="M20.3262 5.94238C17.6358 5.94238 15.4473 8.13093 15.4473 10.8213C15.4473 13.5116 17.6358 15.7002 20.3262 15.7002C23.0165 15.7002 25.2051 13.5116 25.2051 10.8213C25.2051 8.13093 23.0166 5.94238 20.3262 5.94238ZM20.3262 14.0739C18.5327 14.0739 17.0736 12.6147 17.0736 10.8213C17.0736 9.02791 18.5327 7.56872 20.3262 7.56872C22.1196 7.56872 23.5787 9.02791 23.5787 10.8213C23.5787 12.6147 22.1196 14.0739 20.3262 14.0739Z"
                      fill="white"
                    />
                  </svg>
                  {!isCurrDeviceAPhone ? (
                    <div className={classes.upload_popup_top_text}>
                      {translation['DRAG_FILE']}
                      <br />
                      {translation['TEXT_SIGN_IN_OR']}
                    </div>
                  ) : null}
                  <div className={classes.upload_popup_set_file_btn} onClick={onUploadFile}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <rect x="6" width="1" height="13" fill="black" />
                      <rect
                        x="13"
                        y="6"
                        width="1"
                        height="13"
                        transform="rotate(90 13 6)"
                        fill="black"
                      />
                    </svg>
                    {translation['SELECT_FILE']}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <div className={classes.planner_popup_canvas_wr} ref={preview}></div>

          <div
            className={classes.upload_popup_bottom_wrap}
            style={
              imageLoaded.status
                ? !isCurrDeviceAPhone
                  ? { height: 110 }
                  : { height: 98 }
                : !isCurrDeviceAPhone
                  ? { height: 82 }
                  : { height: 62 }
            }
          >
            <div
              className={
                imageLoaded.status
                  ? classes.upload_popup_bottom_wr + ' ' + classes.upload_popup_bottom_wr_show
                  : classes.upload_popup_bottom_wr
              }
            >
              <div className={classes.upload_popup_bottom_size_wr}>
                <div className={classes.upload_popup_change_img_btn_wr}>
                  <div className={classes.upload_popup_change_img_btn} onClick={onUploadFile}>
                    {' '}
                    {translation['BUTTON_TEXT_REPLACE_FILE']}
                  </div>

                  <AnimatePresence>
                    {statusErrorFormat || statusErrorWeight ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        key={'error'}
                        className={classes.upload_popup_bottom_items}
                      >
                        {!isCurrDeviceAPhone ? (
                          <p className={classes.upload_popup_bottom_info_left}>
                            {translation['UPLOAD_FILE_FORMAT']}:
                          </p>
                        ) : null}
                        <p
                          className={
                            statusErrorFormat
                              ? classes.upload_popup_bottom_item_right +
                                ' ' +
                                classes.upload_popup_bottom_item_error
                              : classes.upload_popup_bottom_item_right
                          }
                        >
                          JPG, JPEG, PNG, WEBP, GIF, SVG
                        </p>
                        {!isCurrDeviceAPhone ? (
                          <p className={classes.upload_popup_bottom_info_left}>
                            {translation['FILE_SIZE_TEXT']}:
                          </p>
                        ) : null}

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
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                <div className={classes.upload_popup_bottom_size}>
                  <MaterialSize
                    onApply={onApplyImage}
                    ratio={ratioOfSizes}
                    changeSize={onImageSizeChage}
                    imgWidth={imageWidth}
                    imgHeight={imageHeight}
                  />
                </div>
              </div>
            </div>
            <div
              className={
                !imageLoaded.status
                  ? classes.upload_popup_bottom_wr + ' ' + classes.upload_popup_bottom_wr_show
                  : classes.upload_popup_bottom_wr
              }
            >
              <div className={classes.upload_popup_bottom}>
                <div className={classes.upload_popup_bottom_items}>
                  <p className={classes.upload_popup_bottom_info_left}>
                    {translation['UPLOAD_FILE_FORMAT']}:
                  </p>
                  <p
                    className={
                      statusErrorFormat
                        ? classes.upload_popup_bottom_item_right +
                          ' ' +
                          classes.upload_popup_bottom_item_error
                        : classes.upload_popup_bottom_item_right
                    }
                  >
                    JPG, JPEG, PNG, WEBP, GIF, SVG
                  </p>
                  <p className={classes.upload_popup_bottom_info_left}>
                    {translation['FILE_SIZE_TEXT']}:
                  </p>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadCustomMaterialPopup;
