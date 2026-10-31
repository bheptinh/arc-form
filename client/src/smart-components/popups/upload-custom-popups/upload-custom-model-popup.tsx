import { IconArrowLeft, IconCloudUpload, IconPlus } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import { changeActiveControlPanelMode } from '../../../redux/features/control/controlPanelSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../../redux/features/popups/popupsSlice';
import DefaultModal from '../../../shared-components/modals/default';

const useStyle = createUseStyles({
  planner_popup_wr: {
    width: '100%',

    maxWidth: 615,
    '& > $planner_popup_cont': {
      flexDirection: 'column',
    },
    boxShadow: 'none',
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
});

const UploadCustomModelPopup = () => {
  const dispatch = useDispatch();
  const translation = useTranslation();

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

  const onUploadFile = () => {
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

  const modelOpenedListener = () => {
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

  const onClickClosePopUp = () => {
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

  const onUploadChoiceModelPopup = () => {
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
    <DefaultModal
      visible={animPopupClass}
      zIndex={popups.uploadCustomModelPopup.zIndex}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
      style={preloaderStatus ? { visibility: 'hidden' } : {}}
      onClose={onClickClosePopUp}
      overlay={
        <>
          <div className="preloader" style={{ ...preloaderStyles }}>
            <div className="preloader-cube"></div>
          </div>
        </>
      }
    >
      {popups.uploadCustomModelPopup.backBtn ? (
        <IconArrowLeft
          className={classes.planner_popup_back}
          size={25}
          color="#232323"
          onClick={onUploadChoiceModelPopup}
        />
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
            <IconCloudUpload size={36} color="#ffffff" className={classes.upload_popup_top_icon} />

            <div className={classes.upload_popup_top_text}>
              {translation['DRAG_FILE']}
              <br />
              {translation['TEXT_SIGN_IN_OR']}
            </div>
            <div className={classes.upload_popup_set_file_btn} onClick={onUploadFile}>
              <IconPlus size={13} color="#000000" />
              {translation['SELECT_FILE']}
            </div>
          </div>
        </div>
      </div>

      <div ref={preview}></div>

      <div className={classes.planner_popup_bottom}>
        <h2>{translation['UPLOAD_MODEL_REQ_TITLE']}</h2>
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
            GLB
          </p>
          <p>{translation['UPLOAD_MAX_NUMBER_OF_POLYG']}:</p>
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
          <p>{translation['UPLOAD_MAX_NUMBER_OF_MESHES']}:</p>
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
            {translation['DRAG_FILE_UP_TO']}
          </p>
        </div>

        <p>{translation['UPLOAD_ADD_ELEMS_NOT_ALLOWED']}</p>
      </div>
    </DefaultModal>
  );
};

export default UploadCustomModelPopup;
