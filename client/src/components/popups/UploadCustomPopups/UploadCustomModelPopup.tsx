import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import {
  changeActiveControlPanelMode,
  selectActiveControlPanelMode,
} from '../../../redux/features/control/controlPanelSlice';
import { selectTranslation } from '../../../redux/features/language/languageSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../../redux/features/popups/popupsSlice';

const useStyle = createUseStyles({
  '@font-face': [
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
  lock_main: {
    position: 'absolute',
    top: 25,
    right: '-8px',
    '& svg': {
      width: 16,
      cursor: 'pointer',
    },
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
    background: 'rgba(0, 0, 0, 0.2)',
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
    width: '100%',
    maxHeight: '90%',
    transform: 'scale(0)',

    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    maxWidth: 615,
    '& > $planner_popup_cont': {
      flexDirection: 'column',
    },
  },
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 6,
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
  },

  // planner_popup_wr_small:{
  //     maxWidth: 615,
  //     '& > $planner_popup_cont':{
  //         flexDirection: 'column',
  //     },
  // },
  // planner_popup_wr_big:{
  //     maxWidth: '100%',
  //     height: '100%',
  // },
  planner_popup_top: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'center',
    textAlign: 'center',
    alignItems: 'center',
    background: '#72C4FF',
    padding: 30,
    '@media screen and (max-width: 950px)': {
      padding: 10,
    },
  },
  planner_popup_top_main: {
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
  upload_popup_top_icon: {
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    pointerEvents: 'none',
    width: 49,
    height: 'auto',
    '@media screen and (max-width: 950px)': {
      width: 29,
      height: 'auto',
    },
  },
  upload_popup_top_text: {
    fontSize: '18px',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    display: 'flex',
    margin: '15px 0',
    '& p': {
      margin: '0 2.5px',
    },
    '@media screen and (max-width: 950px)': {
      margin: '10px 0',
      fontSize: 11,
    },
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
  planner_popup_bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 40,
    fontSize: 14,
    color: '#2F2F2F',
    '& h2': {
      fontSize: 32,
      lineHeight: '27px',
      color: '#373737',
      marginBottom: 20,
      fontFamily: 'Roboto-Light, sans-serif',
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
    marginBottom: 10,
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
  '@keyframes shake': {
    '0%': { transform: 'translateX(0)' },
    '20%': { transform: 'translateX(-5px)' },
    '40%': { transform: 'translateX(5px)' },
    '60%': { transform: 'translateX(-5px)' },
    '80%': { transform: 'translateX(5px)' },
    '100%': { transform: 'translateX(0)' },
  },
  planner_popup_bottom_size: {
    display: 'flex',
    alignItems: 'center',
  },
  planner_popup_bottom_size_btn: {
    marginRight: 40,
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
  planner_popup_bottom_info_error: {
    marginLeft: 10,
    color: '#DD352E',
    fontSize: 13,
  },
  planner_popup_cont_center: {
    width: '100%',
    height: '100%',
  },
  planner_popup_cont_cube: {
    position: 'absolute',
    left: 10,
    top: 10,
  },
  arrowUp: {
    transform: 'rotate(90deg)',
    cursor: 'pointer',
    '& path': {
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      '& path': {
        fill: '#a0a0a0',
      },
    },
  },
  planner_catalog_prem_zamok: {},
  planner_lock_img: {
    '& > rect:first-child': {
      fill: 'transparent',
    },
  },
});

const UploadCustomModelPopup = (props) => {
  const dispatch = useDispatch();
  const translation = useSelector(selectTranslation);
  const controPanelActiveMode = useSelector(selectActiveControlPanelMode);

  const popups = useSelector(selectPopups);
  const categoryId = popups.uploadCustomModelPopup.data;

  const [statusErrorFormat, setStatusErrorFormat] = useState(false);
  const [statusErrorWeight, setStatusErrorWeight] = useState(false);
  const [statusErrorPolygons, setStatusErrorPolygons] = useState(false);
  const [statusErrorMeshes, setStatusErrorMeshes] = useState(false);
  const [preloaderStatus, setPreloaderStatus] = useState(false);
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const preview = useRef(null);
  const dropMatDiv = useRef(null);
  const classes = useStyle();
  let imgFile = null;

  function dragOverListener(e) {
    e.preventDefault();
    dropMatDiv.current.classList.add(classes.green_outline);
  }

  function dragEnterListener(e) {
    e.preventDefault();
  }

  function dragLeaveListener(e) {
    e.preventDefault();
    dropMatDiv.current.classList.remove(classes.green_outline);
  }

  function dropListener(e) {
    e.preventDefault();
    dropMatDiv.current.classList.remove(classes.green_outline);

    if (e.dataTransfer.files.length > 0) {
      imgFile = e.dataTransfer.files[0];
      openFile(imgFile);
    }
  }

  const onUploadFile = (e) => {
    let inputFile = document.createElement('input');
    // inputFile.accept='image/*';

    function inputFileChangeEventHandler(event) {
      imgFile = event.currentTarget.files[0];

      inputFile.removeEventListener('change', inputFileChangeEventHandler);
      inputFile = null;

      openFile(imgFile);
    }

    inputFile.setAttribute('type', 'file');
    inputFile.accept = '.glb';
    inputFile.addEventListener('change', inputFileChangeEventHandler);
    inputFile.click();
  };

  const openFile = (file) => {
    if (file.size > 60 * 1e6) setStatusErrorWeight(true);
    else if (file.name.split('.')[file.name.split('.').length - 1] != 'glb') {
      setStatusErrorFormat(true);
      setTimeout(() => setStatusErrorFormat(false), 4000);
    } else {
      setStatusErrorFormat(false);
      setStatusErrorWeight(false);
      setStatusErrorPolygons(false);
      setStatusErrorMeshes(false);
      file.accept = 'glb';
      setPreloaderStatus(true);
      setTimeout(() => R2D.modelUploader.openUserGlb(URL.createObjectURL(file)), 0);
    }
  };

  const modelOpenedListener = (e) => {
    setPreloaderStatus(false);
    if (R2D.modelUploader.getTotalTriangles() > 60000) {
      R2D.modelUploader.clear();
      setStatusErrorPolygons(true);
      setTimeout(() => setStatusErrorPolygons(false), 4000);
      return;
    } else if (R2D.modelUploader.getPartsHashes().length > 50) {
      R2D.modelUploader.clear();
      setStatusErrorMeshes(true);
      setTimeout(() => setStatusErrorMeshes(false), 4000);
      return;
    }

    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'uploadCustomModelPopup' })), 500);
    dispatch(
      changeActiveControlPanelMode({
        mode: 'uploadModel',
        data: { type: 'main', lastSavedScroll: 0, data: { type: 'create', categoryId } },
      })
    );
  };

  const onClickClosePopUp = (e) => {
    R2D.modelUploader.dispose();
    R2D.modelUploader = null;

    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'uploadCustomModelPopup' })), 500);
  };

  const preloaderStyles = {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 99,
    background: 'rgba(0, 0, 0, 0.3)',
    display: preloaderStatus ? 'block' : 'none',
  };

  const onErrorOpenModel = (e) => dispatch(setActivePopup({ name: 'alert', data: e.data.info }));

  const onUploadChoiceModelPopup = (e) => {
    //dispatch(setActivePopup({name: 'uploadChoiceModelPopup', backBtn: controPanelActiveMode == 'userUpload' ? true : false })) ;
    dispatch(setActivePopup({ name: 'uploadChoicePopup' }));
    onClickClosePopUp();
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    if (R2D.modelUploader) {
      R2D.modelUploader.dispose();
      R2D.modelUploader = null;
    }
    R2D.modelUploader = new R2D.ModelUploader();
    R2D.modelUploader.addEventListener(R2D.ModelUploader.MODEL_OPENED, modelOpenedListener);
    R2D.modelUploader.addEventListener(Event.ERROR, onErrorOpenModel);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={
        animPopupClass
          ? classes.planner_popup_wrap + ' ' + classes.planner_popup_wrap_show
          : classes.planner_popup_wrap
      }
      style={{ zIndex: popups.uploadCustomModelPopup.zIndex }}
    >
      <div className="preloader" style={{ ...preloaderStyles }}>
        <div className="preloader-cube"></div>
      </div>

      <div
        className={classes.planner_popup_wr}
        style={preloaderStatus ? { visibility: 'hidden' } : {}}
      >
        <div className={classes.planner_popup_cont}>
          {popups.uploadCustomModelPopup.backBtn ? (
            <svg
              className={classes.planner_popup_back}
              width="23"
              height="26"
              fill="none"
              viewBox="0 0 23 26"
              onClick={onUploadChoiceModelPopup}
            >
              <path
                fill="#232323"
                d="M14.352 1.236 3.416 11.931h18.708v1.692H3.302l11.096 10.685-1.172 1.159L1.31 13.99l-.008.01-1.18-1.15L13.17.086l1.18 1.15Z"
                opacity=".99"
              />
            </svg>
          ) : null}

          <div className={classes.planner_popup_top}>
            <div className={classes.planner_popup_top_main}>
              <div
                className={classes.upload_popup_top_set_file_wrap}
                ref={dropMatDiv}
                onDrop={dropListener}
                onDragLeave={dragLeaveListener}
                onDragEnter={dragEnterListener}
                onDragOver={dragOverListener}
              >
                <svg
                  width="38"
                  height="36"
                  viewBox="0 0 38 36"
                  fill="none"
                  className={classes.upload_popup_top_icon}
                >
                  <path
                    d="M29.7239 8.1344C28.7709 5.59282 26.907 3.4527 24.4603 2.09054C22.0137 0.728385 19.1409 0.231457 16.3474 0.687184C13.5539 1.14291 11.0186 2.5221 9.18766 4.5821C7.35671 6.64211 6.34735 9.25096 6.33714 11.9497V12.8893C4.50725 13.4179 2.90389 14.4919 1.76307 15.9532C0.622249 17.4145 0.0042367 19.1859 0 21.0067C0.0031457 23.2457 0.938631 25.3922 2.60133 26.9754C4.26402 28.5587 6.51822 29.4494 8.86962 29.4524H11.414V27.041H8.86962C8.03642 27.041 7.21139 26.8845 6.44175 26.5806C5.67212 26.2766 4.97299 25.8311 4.38438 25.2696C3.79576 24.7081 3.32922 24.0415 3.01145 23.3081C2.69368 22.5747 2.53092 21.7888 2.53248 20.9954C2.53898 19.5465 3.09075 18.1478 4.08767 17.0531C5.08459 15.9584 6.4606 15.2403 7.96601 15.0291C8.13449 15.0044 8.29612 14.9479 8.44146 14.8631C8.5868 14.7783 8.71295 14.6668 8.81256 14.5351C8.91216 14.4033 8.98322 14.254 9.0216 14.0959C9.05997 13.9377 9.0649 13.7739 9.03608 13.6139C8.93141 13.0648 8.87968 12.5077 8.88151 11.9497C8.87581 9.76051 9.70302 7.64346 11.2101 5.99022C12.7171 4.33699 14.8021 3.25947 17.0791 2.95703C19.3561 2.65459 21.6711 3.14769 23.5958 4.34511C25.5204 5.54253 26.9245 7.36322 27.5481 9.47031C27.6115 9.68038 27.7334 9.87022 27.9008 10.0197C28.0683 10.1692 28.2751 10.2727 28.4993 10.3194C30.6395 10.7617 32.5326 11.9414 33.815 13.6318C35.0974 15.3223 35.6786 17.4042 35.4471 19.4779C35.2157 21.5516 34.1877 23.4707 32.5608 24.8666C30.9339 26.2626 28.8226 27.0369 26.6326 27.041V29.4524C29.3813 29.4417 32.0336 28.4869 34.1022 26.7634C36.1708 25.0398 37.5167 22.6634 37.8927 20.0706C38.2687 17.4779 37.6494 14.8431 36.1487 12.6503C34.648 10.4575 32.3667 8.85396 29.7239 8.1344Z"
                    fill="white"
                  />
                  <path
                    d="M18.2643 18.8334L13.1875 22.4562L14.7094 24.3922L17.7531 22.2185V35.4984H20.2856V22.2071L23.3293 24.3808L24.8512 22.4449L19.7743 18.8221C19.5544 18.6702 19.2891 18.5893 19.0174 18.5913C18.7457 18.5934 18.4818 18.6782 18.2643 18.8334Z"
                    fill="white"
                  />
                </svg>
                <div className={classes.upload_popup_top_text}>
                  {translation['DRAG_FILE']}
                  <br />
                  {translation['TEXT_SIGN_IN_OR']}
                </div>
                <div className={classes.upload_popup_set_file_btn} onClick={onUploadFile}>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 13 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
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

          <div ref={preview}></div>
          <div
            className={classes.planner_popup_close}
            id="js_close_popup"
            onClick={onClickClosePopUp}
          >
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
          <div className={classes.planner_popup_bottom}>
            <h2>{translation['UPLOAD_MODEL_REQ_TITLE']}</h2>
            <div className={classes.upload_popup_bottom_items}>
              <p className={classes.planner_popup_bottom_info_left}>
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
                GLB
              </p>
              <p className={classes.planner_popup_bottom_info_left}>
                {translation['UPLOAD_MAX_NUMBER_OF_POLYG']}:
              </p>
              <p
                className={
                  statusErrorPolygons
                    ? classes.upload_popup_bottom_item_right +
                      ' ' +
                      classes.upload_popup_bottom_item_error
                    : classes.upload_popup_bottom_item_right
                }
              >
                60000
              </p>
              <p className={classes.planner_popup_bottom_info_left}>
                {translation['UPLOAD_MAX_NUMBER_OF_MESHES']}:
              </p>
              <p
                className={
                  statusErrorMeshes
                    ? classes.upload_popup_bottom_item_right +
                      ' ' +
                      classes.upload_popup_bottom_item_error
                    : classes.upload_popup_bottom_item_right
                }
              >
                50
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
                {translation['DRAG_FILE_UP_TO']}
              </p>
            </div>

            <p>{translation['UPLOAD_ADD_ELEMS_NOT_ALLOWED']}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadCustomModelPopup;
