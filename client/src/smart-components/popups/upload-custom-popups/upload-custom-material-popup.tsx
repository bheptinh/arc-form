import { IconArrowLeft, IconPhotoScan, IconPlus } from '@tabler/icons-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import { planner } from '../../../initR2D';
import { selectActiveControlPanelModeData } from '../../../redux/features/control/controlPanelSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../../redux/features/popups/popupsSlice';
import DefaultModal from '../../../shared-components/modals/default';
import MaterialSize from './components/material-size';

const useStyle = createUseStyles({
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
    '& > $planner_popup_cont': {
      flexDirection: 'column',
    },
    boxShadow: 'none',
  },
  planner_popup_cont: {
    color: 'var(--color-black)',
    position: 'relative',
    height: '100%',
    transition: 'all 1.9s cubic-bezier(0.19, 1, 0.22, 1)',
    backgroundColor: 'transparent',
    borderRadius: 0,
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
        fill: 'var(--color-accent)',
      },
    },
  },
  upload_popup_top: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    background: 'var(--color-info-light)',
    padding: 30,
    borderRadius: '6px 6px 0 0',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    '@media screen and (max-width: 950px)': {
      padding: 20,
    },
  },
  upload_popup_top_main: {
    border: '2px dashed var(--color-white)',
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
    outline: 'solid 2px var(--color-accent)',
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
    color: 'var(--color-white)',
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
    color: 'var(--color-text-strong)',
    border: 'none',
    cursor: 'pointer',
    height: 36,
    display: 'flex',
    borderRadius: 3,
    padding: 15,
    fontSize: 14,
    textTransform: 'uppercase',
    background: 'var(--color-accent-strong)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      background: 'var(--color-accent-hover)',
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
    background: 'var(--color-white)',
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
    color: 'var(--color-text)',
    background: 'var(--color-white)',
    borderRadius: '0 0 6px 6px',
    position: 'absolute',
    left: 0,
    width: '100%',
    bottom: 0,
    '& h2': {
      fontSize: 32,
      lineHeight: '27px',
      color: 'var(--color-text-muted)',
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
    color: 'var(--color-text)',
    background: 'var(--color-white)',
    borderRadius: '0 0 6px 6px',
    position: 'absolute',
    left: 0,
    width: '100%',
    bottom: 0,
    '& h2': {
      fontSize: 32,
      lineHeight: '27px',
      color: 'var(--color-text-muted)',
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
    color: 'var(--color-text)',
    transition: 'color 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  upload_popup_bottom_item_error: {
    color: 'var(--color-danger-bright)',
    animation: '$shake 0.4s ease',
  },
  upload_popup_bottom_size: {
    display: 'flex',
    alignItems: 'center',
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
    color: 'var(--color-text-strong)',
    fontSize: 14,
    borderRadius: 3,
    padding: '0 20px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    minWidth: 120,
    outline: 'none',
    background: 'var(--color-white)',
    textTransform: 'uppercase',
    border: '1px solid var(--color-black)',
    '&:hover': {
      background: 'var(--color-surface-muted)',
    },
    '@media screen and (max-width: 950px)': {
      padding: '0 8px',
      minWidth: 88,
      fontSize: 12,
      height: 26,
    },
  },
  planner_popup_canvas_wr: {
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    position: 'relative',
    width: 615,
    overflow: 'hidden',
    borderRadius: '6px 6px 0 0 ',
    zIndex: 1,
    borderBottom: '1px solid var(--color-border)',
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
    const fileReader = new FileReader();
    fileReader.addEventListener('load', (e) => procImg(e.currentTarget.result as string));
    fileReader.readAsDataURL(file);
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
    <DefaultModal
      visible={animPopupClass}
      zIndex={popups.uploadCustomMaterialPopup.zIndex}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
      wrapClassName={classes.planner_popup_wrap}
      onClose={onClickClosePopUp}
    >
      {popups.uploadCustomMaterialPopup.backBtn ? (
        <IconArrowLeft
          className={classes.planner_popup_back}
          onClick={onUploadChoicePopup}
          size={24}
          color="#232323"
        />
      ) : null}

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
              {/* TODO: replace with image file */}
              <IconPhotoScan size={50} color="#fff" className={classes.upload_popup_top_icon} />
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
                    {!isCurrDeviceAPhone ? <p>{translation['UPLOAD_FILE_FORMAT']}:</p> : null}
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
                    {!isCurrDeviceAPhone ? <p>{translation['FILE_SIZE_TEXT']}:</p> : null}

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
                JPG, JPEG, PNG, WEBP, GIF, SVG
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
          </div>
        </div>
      </div>
    </DefaultModal>
  );
};

export default UploadCustomMaterialPopup;
