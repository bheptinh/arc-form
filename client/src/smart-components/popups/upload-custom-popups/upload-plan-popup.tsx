import { IconPhotoScan, IconPlus } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import { planner } from '../../../initR2D';
import {
  changeActiveControlPanelMode,
  updateControlPanelStatus,
} from '../../../redux/features/control/controlPanelSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../../redux/features/popups/popupsSlice';
import { showTip } from '../../../redux/features/tips/tipsSlice';
import DefaultModal from '../../../shared-components/modals/default';

const useStyle = createUseStyles({
  '@keyframes shake': {
    '0%': { transform: 'translateX(0)' },
    '20%': { transform: 'translateX(-5px)' },
    '40%': { transform: 'translateX(5px)' },
    '60%': { transform: 'translateX(-5px)' },
    '80%': { transform: 'translateX(5px)' },
    '100%': { transform: 'translateX(0)' },
  },
  planner_popup_wr: {
    width: '100%',

    maxWidth: 615,
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
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    backgroundColor: 'transparent',
    borderRadius: 0,
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
    width: '100%',
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
});

const UploadPlanPopup = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();

  const popups = useSelector(selectPopups);

  const [statusErrorFormat, setStatusErrorFormat] = useState(false);
  const [statusErrorWeight, setStatusErrorWeight] = useState(false);
  const [preloaderStatus, setPreloaderStatus] = useState(false);
  const [animPopupClass, setAnimPopupClass] = useState(false);
  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

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

  const onUploadFile = async (e) => {
    const result = await planner.constr.uploadPlan(true);
    setTimeout(
      () =>
        document.querySelector('.preloader-grey') &&
        document.querySelector('.preloader-grey').remove(),
      200
    );

    if (result.state == 'stateAlignDrawing') {
      setAnimPopupClass(false);
      setTimeout(() => dispatch(closeActivePopup({ name: 'uploadPlanPopup' })), 500);
      dispatch(updateControlPanelStatus(false));
      !R2D.Storage.load('r2d_uploadImagePopup') &&
        dispatch(setActivePopup({ name: 'imageUpload' }));
      dispatch(changeActiveControlPanelMode({ mode: 'alignDrawing', data: { type: 'main' } }));
    }
  };

  const openFile = async (file) => {
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf'];
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
      setTimeout(() => setStatusErrorWeight(false), 4000);
      return;
    }

    setPreloaderStatus(true);

    const fileToBase64 = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); // base64 string
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    if (file.type == 'application/pdf') {
      file = await FILE.pdfPlanConvert(file);
      setAnimPopupClass(false);
      setTimeout(() => dispatch(closeActivePopup({ name: 'uploadPlanPopup' })), 500);
    } else {
      setAnimPopupClass(false);
      setTimeout(() => dispatch(closeActivePopup({ name: 'uploadPlanPopup' })), 500);
    }
    const base64Data = await fileToBase64(file);
    const result = await planner.constr.setPlan(base64Data);
    setTimeout(
      () =>
        document.querySelector('.preloader-grey') &&
        document.querySelector('.preloader-grey').remove(),
      200
    );

    if (result.state == 'stateAlignDrawing') {
      setAnimPopupClass(false);
      setTimeout(() => dispatch(closeActivePopup({ name: 'uploadPlanPopup' })), 500);
      dispatch(updateControlPanelStatus(false));
      !R2D.Storage.load('r2d_uploadImagePopup') &&
        dispatch(setActivePopup({ name: 'imageUpload' }));
      dispatch(changeActiveControlPanelMode({ mode: 'alignDrawing', data: { type: 'main' } }));
    }
  };

  const onClickClosePopUp = (e) => {
    dispatch(showTip({ name: 'constructorButtons' }));
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'uploadPlanPopup' })), 500);
  };

  const preloaderStyles = {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 99,
    background: 'rgba(0, 0, 0, 0.3)',
    display: preloaderStatus ? 'block' : 'none',
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DefaultModal
      visible={animPopupClass}
      zIndex={popups.uploadPlanPopup.zIndex}
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
            JPG, JPEG, PNG, GIF, PDF
          </p>
        </div>
      </div>
    </DefaultModal>
  );
};

export default UploadPlanPopup;
