import { IconArrowLeft, IconCheck } from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import { user } from '../../../initR2D';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../../redux/features/popups/popupsSlice';
import Checkbox from '../../../shared-components/inputs/checkbox';
import { useEffectAsync } from '../../../utils/useEffectAsync';
import DefaultModal from '../../../shared-components/modals/default';

const useStyle = createUseStyles({
  planner_popup_wrap: {
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  planner_popup_wr: {
    width: '100vw',
    borderRadius: 6,
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#fff',
    borderRadius: 6,
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
  },
  planner_popup_export: {},
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
  planner_popup_back: {
    position: 'absolute',
    left: 11,
    top: 12,
    cursor: 'pointer',
    zIndex: 1,
    '& path': {
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover': {
      '& path': {
        fill: '#BAE51F',
      },
    },
  },
  planner_popup_export_inside: {
    marginBottom: 20,
    '@media screen and (max-width: 950px)': {
      marginBottom: 10,
    },
  },
  planner_popup_export_inside_block: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '0 40px',
    padding: '40px 0',
    alignItems: 'center',
    borderBottom: '1px solid #C6C4C4',
    '@media screen and (max-width: 950px)': {
      margin: '0 5px',
      padding: '5px 0',
    },
  },
  planner_popup_export_inside_block_left: {
    flex: 1,
    '& h3': {
      fontWeight: 400,
      fontSize: 21,
      color: '#2F2F2F',
      marginBottom: 10,
      '@media screen and (max-width: 950px)': {
        fontSize: 12,
        marginBottom: 5,
      },
    },
    '& p': {
      fontSize: 14,
      color: '#2F2F2F',
      '@media screen and (max-width: 950px)': {
        fontSize: 11,
      },
    },
  },
  planner_popup_export_inside_block_right: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flex: 1,
    '& svg': {
      margin: '0 20px',
      '@media screen and (max-width: 950px)': {
        margin: '0 5px',
        width: 40,
      },
    },
    '& img': {
      width: 100,
    },
  },
  planner_popup_export_inside_block_bottom: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: 40,
    '@media screen and (max-width: 950px)': {
      paddingBottom: 30,
    },
  },
  planner_popup_export_inside_block_bottom_buttons: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    '& button': {
      margin: '0 5px',
    },
  },
  planner_popup_export_inside_block_bottom_buttons_download: {
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
      background: '#8fc32d',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
      height: '26px',
      minWidth: 88,
    },
  },
  planner_popup_export_inside_block_bottom_buttons_cancel: {
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
      background: '#E9E9E9',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
      height: '26px',
      minWidth: 88,
    },
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
  planner_popup_export_downloaded_top: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#72C4FF',
    padding: '50px 10px',
    borderBottom: '1px solid #000',
    '& h2': {
      color: '#ffffff',
      fontSize: 32,
      fontFamily: 'Roboto-Light, sans-serif',
      fontWeight: 300,
      marginBottom: 10,
    },
    '& h3': {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: 400,
    },
    '@media screen and (max-width: 950px)': {
      padding: '15px 10px',
      '& svg': {
        width: 57,
        height: 'auto',
      },
    },
  },
  planner_popup_export_downloaded_content: {
    padding: '50px 10px 80px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    '& h2': {
      color: '#2F2F2F',
      fontSize: 32,
      fontFamily: 'Roboto-Light, sans-serif',
      fontWeight: 300,
      marginBottom: 50,
      '@media screen and (max-width: 950px)': {
        fontSize: 14,
        marginBottom: 30,
      },
    },
    '& button': {
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
        background: '#8fc32d',
      },
      '@media screen and (max-width: 950px)': {
        fontSize: 12,
        height: '26px',
        minWidth: 88,
      },
    },
    '@media screen and (max-width: 950px)': {
      padding: '30px 10px 30px',
    },
  },
});

const Export3DProjectPopup = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);

  const popupType = popups.export3DProjectPopup.type;
  const popupData = popups.export3DProjectPopup.data;

  const [popupStage, setPopupStage] = useState(null);

  const checkBoxRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskFile, setTaskFile] = useState(null);
  const [checkBoxStatus, setCheckBoxStatus] = useState(false);

  const [preloaderStatus, setPreloaderStatus] = useState(true);

  const classes = useStyle();
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const backToStart = (e) => {
    dispatch(setActivePopup({ name: 'exportPopup' }));
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'export3DProjectPopup' })), 500);
  };

  const onCancel = (e) => {
    dispatch(setActivePopup({ name: 'exportPopup' }));
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'export3DProjectPopup' })), 500);
  };

  const checkStatusIFC = (e) => {
    setProgress(e.data.status);
    if (e.data.status && e.data.status == '20') {
      setTaskFile(true);
      user.currentLoadingExportId = null;
    }
  };

  const onDownload = async (e) => {
    setPreloaderStatus(true);
    if (checkBoxRef.current.querySelector('input').checked)
      R2D.Storage.save('r2d_exportDownloadDetails', true);
    if (popupData == 'ifc') {
      R2D.controller.exportToIFC();
      R2D.ifcCreator.addEventListener('ifcStatus', checkStatusIFC);
      user.currentLoadingExportId = { exportId: '', format: popupData };
      user.makeExport({ type: 1, environment: null, format: popupData });
    } else {
      const exportId = await user.makeExport({ type: 1, environment: null, format: popupData });
      if (!exportId || exportId?.type == 'error') {
        dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));
        return dispatch(closeActivePopup({ name: 'export3DProjectPopup' }));
      } else user.currentLoadingExportId = { exportId, format: popupData };
      setCurrentTask(exportId);
    }

    setPopupStage(2);
  };

  const onClickDownloadedFile = (e) => {
    if (popupData == 'ifc') {
      R2D.ifcCreator.exportToFile();
      R2D.ifcCreator.removeEventListener('ifcStatus', checkStatusIFC);
    } else window.open(taskFile, '_blank');
    dispatch(closeActivePopup({ name: 'export3DProjectPopup' }));
  };

  const checkStatus = async () => {
    const response = await user.checkExport(currentTask);
    setProgress(response.data.status);
    return { file: response.data.file, status: response.status, numStatus: response.data.status };
  };

  let interval;

  const closeExportPopup = (e) => {
    if (popupData == 'ifc') R2D.ifcCreator?.removeEventListener('ifcStatus', checkStatusIFC);
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'export3DProjectPopup' })), 500);
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
    if (currentTask) {
      interval = setInterval(async () => {
        const result = await checkStatus();
        if (result.file && result.status == 'ok') {
          clearInterval(interval);
          setTaskFile(result.file);
          user.currentLoadingExportId = null;
          setPreloaderStatus(false);
        } else if (result.numStatus == -20) {
          clearInterval(interval);
          user.currentLoadingExportId = null;
          dispatch(setActivePopup({ name: 'alert', data: 'FR_SOMETHING_WRONG' }));
          dispatch(closeActivePopup({ name: 'export3DProjectPopup' }));
        }
      }, 500);
    }
    return () => clearInterval(interval);
  }, [currentTask]);

  useEffect(() => {
    if (taskFile) {
      clearInterval(interval);
      setPopupStage(3);
    }
  }, [taskFile]);

  useEffectAsync(async () => {
    if (popupType == 'download') {
      if (popupData == 'ifc') {
        R2D.controller.exportToIFC();
        R2D.ifcCreator.addEventListener('ifcStatus', checkStatusIFC);
        user.currentLoadingExportId = { exportId: '', format: popupData };
      } else {
        const exportId = await user.makeExport({ type: 1, environment: null, format: popupData });
        if (!exportId || exportId?.type == 'error') {
          dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));
          return dispatch(closeActivePopup({ name: 'export3DProjectPopup' }));
        } else user.currentLoadingExportId = { exportId, format: popupData };
        setCurrentTask(exportId);
      }
      setPopupStage(2);
    } else if (popupType == 'predownload') {
      setPopupStage(1);
    }
  }, []);

  useEffect(() => {
    popupStage !== null && setPreloaderStatus(false);
  }, [popupStage]);

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <DefaultModal
      visible={animPopupClass}
      zIndex={popups.export3DProjectPopup.zIndex}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
      wrapClassName={classes.planner_popup_wrap}
      style={{ maxWidth: popupStage == 1 ? 1070 : 540 }}
      onClose={closeExportPopup}
      overlay={
        <>
          {preloaderStatus ? (
            <div className="preloader" style={{ ...preloaderStyles }}>
              <div className="preloader-cube"></div>
            </div>
          ) : null}
        </>
      }
    >
      <div className={classes.planner_popup_export}>
        {popupStage == 1 ? (
          <div>
            <div className={classes.planner_popup_export_top}>
              <h2>{translation['EXPORT_PROJECT_INSIDE_TITLE']}</h2>

              <IconArrowLeft className={classes.planner_popup_back} size={24} color="#444444" />
            </div>
            <div className={classes.planner_popup_export_inside}>
              <div className={classes.planner_popup_export_inside_block}>
                <div className={classes.planner_popup_export_inside_block_left}>
                  <h3>{translation['EXPORT_PROJECT_INSIDE_BLOCK_1_TITLE']}</h3>
                  <p>{translation['EXPORT_PROJECT_INSIDE_BLOCK_1_TEXT']}</p>
                </div>
                <div className={classes.planner_popup_export_inside_block_right}>
                  <img src="/src_designer/images/export_inside_img_1.png" />
                  {/* TODO: Replace arrow icon */}
                  <svg width="79" height="66" viewBox="0 0 79 66" fill="none">
                    <path
                      d="M75.9499 35.9841C70.191 41.2942 66.9809 46.1191 59.2609 48.8677C58.9907 48.9781 58.6881 48.9883 58.4157 48.8961C58.1434 48.804 57.9223 48.6166 57.7983 48.3728C57.6742 48.1289 57.6568 47.8474 57.7495 47.5866C57.8422 47.3258 58.038 47.1057 58.2963 46.9719C64.4092 42.84 66.7537 40.1054 71.719 35.1258C67.6146 33.1184 63.0403 31.6895 59.3555 29.119C59.0245 28.8905 58.7941 28.5576 58.7055 28.1795C58.6169 27.8014 58.6758 27.4028 58.8716 27.0544C59.0675 26.7061 59.3876 26.4307 59.7751 26.2773C60.1625 26.1239 60.5921 26.1024 60.9874 26.2166C66.268 27.8743 71.2554 30.2184 75.8052 33.1808C76.0361 33.3357 76.2261 33.5372 76.3614 33.7711C76.4967 34.0049 76.5741 34.2652 76.5879 34.5332C76.6017 34.8012 76.5517 35.0703 76.4414 35.3212C76.3311 35.572 76.1632 35.7984 75.9499 35.9841Z"
                      fill="#9DD900"
                    />
                    <path
                      d="M71.7736 36.946C70.6471 38.252 70.1276 37.833 66.8027 38.2039C63.4777 38.5749 38.2428 40.7621 18.2437 37.4447C-1.75536 34.1272 1.44506 29.8771 1.44506 29.8771C2.38183 28.7108 1.90542 29.2012 2.71322 28.6404C3.92146 27.9893 4.6538 29.0958 8.05855 30.4971C16.8156 34.2385 19.3866 34.1365 30.2301 35.1356C41.0736 36.1347 69.5828 34.1802 71.5112 34.1108C73.4395 34.0414 72.8906 35.6225 71.7736 36.946Z"
                      fill="#9DD900"
                    />
                  </svg>
                  <img src="/src_designer/images/export_inside_img_2.png" />
                </div>
              </div>
              <div className={classes.planner_popup_export_inside_block}>
                <div className={classes.planner_popup_export_inside_block_left}>
                  <h3>{translation['EXPORT_PROJECT_INSIDE_BLOCK_2_TEXT']}</h3>
                  <p>{translation['EXPORT_PROJECT_INSIDE_BLOCK_2_TITLE']}</p>
                </div>
                <div className={classes.planner_popup_export_inside_block_right}>
                  <img src="/src_designer/images/export_inside_img_3.png" />
                  {/* TODO: Replace arrow icon */}
                  <svg width="79" height="66" viewBox="0 0 79 66" fill="none">
                    <path
                      d="M75.9499 35.9841C70.191 41.2942 66.9809 46.1191 59.2609 48.8677C58.9907 48.9781 58.6881 48.9883 58.4157 48.8961C58.1434 48.804 57.9223 48.6166 57.7983 48.3728C57.6742 48.1289 57.6568 47.8474 57.7495 47.5866C57.8422 47.3258 58.038 47.1057 58.2963 46.9719C64.4092 42.84 66.7537 40.1054 71.719 35.1258C67.6146 33.1184 63.0403 31.6895 59.3555 29.119C59.0245 28.8905 58.7941 28.5576 58.7055 28.1795C58.6169 27.8014 58.6758 27.4028 58.8716 27.0544C59.0675 26.7061 59.3876 26.4307 59.7751 26.2773C60.1625 26.1239 60.5921 26.1024 60.9874 26.2166C66.268 27.8743 71.2554 30.2184 75.8052 33.1808C76.0361 33.3357 76.2261 33.5372 76.3614 33.7711C76.4967 34.0049 76.5741 34.2652 76.5879 34.5332C76.6017 34.8012 76.5517 35.0703 76.4414 35.3212C76.3311 35.572 76.1632 35.7984 75.9499 35.9841Z"
                      fill="#9DD900"
                    />
                    <path
                      d="M71.7736 36.946C70.6471 38.252 70.1276 37.833 66.8027 38.2039C63.4777 38.5749 38.2428 40.7621 18.2437 37.4447C-1.75536 34.1272 1.44506 29.8771 1.44506 29.8771C2.38183 28.7108 1.90542 29.2012 2.71322 28.6404C3.92146 27.9893 4.6538 29.0958 8.05855 30.4971C16.8156 34.2385 19.3866 34.1365 30.2301 35.1356C41.0736 36.1347 69.5828 34.1802 71.5112 34.1108C73.4395 34.0414 72.8906 35.6225 71.7736 36.946Z"
                      fill="#9DD900"
                    />
                  </svg>
                  <img src="/src_designer/images/export_inside_img_4.png" />
                </div>
              </div>
            </div>
            <div className={classes.planner_popup_export_inside_block_bottom}>
              <div className={classes.planner_popup_export_inside_block_bottom_buttons}>
                <button
                  className={classes.planner_popup_export_inside_block_bottom_buttons_cancel}
                  onClick={onCancel}
                >
                  {translation['BUTTON_CANCEL']}
                </button>
                <button
                  className={classes.planner_popup_export_inside_block_bottom_buttons_download}
                  onClick={onDownload}
                >
                  {translation['BUTTON_OK_DOWNLOAD']}
                </button>
              </div>
              <div ref={checkBoxRef}>
                <Checkbox
                  label={translation['TEXT_DONT_SHOW_AGAIN']}
                  onChange={setCheckBoxStatus}
                  checked={checkBoxStatus}
                  name={'exportDownloadDetails'}
                />
              </div>
            </div>
          </div>
        ) : popupStage == 2 ? (
          <div>
            <div className={classes.planner_popup_export_top}>
              <h2>{translation['EXPORT_PROJECT_PREPARING_TITLE']}</h2>
            </div>
            <div className={classes.planner_popup_export_downloading}>
              <div className={classes.planner_popup_export_downloading_text}>
                <p
                  dangerouslySetInnerHTML={{
                    __html: translation['EXPORT_PROJECT_PREPARING_TEXT_1'],
                  }}
                ></p>
              </div>
              <div className={classes.planner_popup_export_progressBar}>
                <div
                  className={classes.planner_popup_export_progressBar_progress}
                  style={{ width: progress * 15 - 8 }}
                ></div>
              </div>
            </div>
          </div>
        ) : popupStage == 3 ? (
          <div>
            <div className={classes.planner_popup_export_downloaded_top}>
              <IconCheck size={130} color="#9DD900" />
            </div>
            <div className={classes.planner_popup_export_downloaded_content}>
              <h2>{translation['EXPORT_PROJECT_CREATED_TITLE']}</h2>
              <button onClick={onClickDownloadedFile}>
                {translation['BUTTON_DOWNLOAD_RENDER']}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </DefaultModal>
  );
};

export default Export3DProjectPopup;
