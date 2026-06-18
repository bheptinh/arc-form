import { IconArrowLeft, IconX } from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import { selectActiveControlPanelMode } from '../../../redux/features/control/controlPanelSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../../redux/features/popups/popupsSlice';
import Checkbox from '../../../shared-components/inputs/checkbox';
import RendersSliderAi from '../rendersExample/slider/RendersSliderAi';

const useStyle = createUseStyles({
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
    alignContent: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.8)',
    '@media screen and (max-width: 950px)': {},
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
    width: 1282,
    maxWidth: '95%',
    height: 'auto',
    maxHeight: '95%',
    transform: 'scale(0)',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 1.5s cubic-bezier(0.19, 1, 0.22, 1)',
    '@media screen and (max-width: 950px)': {
      width: '90%',
      maxWidth: '90%',
    },
  },
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#72C4FF',
    borderRadius: 6,
    height: '100%',
    position: 'relative',
    padding: '40px 34px 63px',
    '@media screen and (max-width: 1200px)': {
      padding: '9% 50px 13%',
    },
    '@media screen and (max-width: 950px)': {
      padding: '20px 34px 40px',
      height: 'auto',
    },
  },
  planner_popup_back: {
    width: 23,
    position: 'absolute',
    top: 8,
    left: 8,
    cursor: 'pointer',
    zIndex: '2',
    '& svg': {
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover': {
      '& svg': {
        stroke: '#BAE51F',
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
  upload_model_slider_wrap: {},
  upload_model_title: {
    color: '#282828',
    fontSize: 34,
    marginBottom: 31,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontFamily: 'RobotoCondensed-Regular',
    '@media screen and (max-width: 950px)': {
      fontSize: 15,
      marginBottom: 5,
    },
  },
  upload_model_text: {
    color: '#373737',
    fontSize: 21,
    textAlign: 'center',
    marginBottom: 18,
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      marginBottom: 9,
    },
  },
  upload_model_slider_wr: {
    position: 'relative',
    height: 407,
    overflow: 'hidden',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '@media screen and (max-width: 950px)': {
      height: 194,
    },
  },
  upload_model_slider_text_wr: {
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    padding: '0 72px',
    '@media screen and (max-width: 950px)': {
      padding: '0 40px',
    },
  },
  upload_model_btn_wr: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 26,
  },
  upload_model_btn: {
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
    },
  },
  upload_model_checkbox_wr: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: 23,
  },
  planner_popup_bottom_info_error: {
    marginLeft: 10,
    color: '#DD352E',
    fontSize: 13,
  },
});

const UploadModelAiInfoPopup = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);
  const controPanelActiveMode = useSelector(selectActiveControlPanelMode);

  const currOS = R2D.controller.getCurrentOS();

  const [animPopupClass, setAnimPopupClass] = useState(false);
  const checkBoxRef = useRef(null);
  const [uploadModelAiPopupShowCookie, setUploadModelAiPopupShowCookie] = useState(
    R2D.Storage.load('r2d_uploadModelAiPopup')
  );

  const notShowAgainClick = (e) => setUploadModelAiPopupShowCookie(!uploadModelAiPopupShowCookie);

  const onClosePopup = (e) => {
    if (checkBoxRef.current.querySelector('input').checked)
      R2D.Storage.save('r2d_uploadModelAiPopup', true);
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'uploadModelAiInfoPopup' })), 500);
  };

  const onUploadChoiceModelPopup = (e) => {
    if (checkBoxRef.current.querySelector('input').checked)
      R2D.Storage.save('r2d_uploadModelAiPopup', true);
    onClosePopup();
    dispatch(
      setActivePopup({
        name: 'uploadChoiceModelPopup',
        backBtn: controPanelActiveMode == 'userUpload' ? true : false,
      })
    );
  };

  const onUploadFile = (e) => {
    if (checkBoxRef.current.querySelector('input').checked)
      R2D.Storage.save('r2d_uploadModelAiPopup', true);
    onClosePopup();
    dispatch(setActivePopup({ name: 'uploadCustomModelAiPopup' }));
  };

  useEffect(() => {
    const timer = setTimeout(() => setAnimPopupClass(true), 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={
        animPopupClass
          ? classes.planner_popup_wrap + ' ' + classes.planner_popup_wrap_show
          : classes.planner_popup_wrap
      }
      style={{ zIndex: popups.uploadModelAiInfoPopup.zIndex }}
      key={'test'}
    >
      <div
        className={classes.planner_popup_wr}
        style={
          currOS == 'iOS' || currOS == 'Android'
            ? { width: '100%', height: '100%', maxHeight: '100%' }
            : undefined
        }
      >
        <div className={classes.planner_popup_cont}>
          <IconArrowLeft
            className={classes.planner_popup_back}
            onClick={onUploadChoiceModelPopup}
            size={25}
            color="#232323"
          />

          <div className={classes.planner_popup_close} onClick={onClosePopup}>
            <IconX size={24} color="#2F2F2F" className={classes.planner_popup_close_icon} />
          </div>
          <div className={classes.upload_model_slider_wrap}>
            <div className={classes.upload_model_title}>
              {translation['CREATE_MODEL_AI_EXAMPLE_TEXT']}
            </div>
            <div className={classes.upload_model_slider_text_wr}>
              <div className={classes.upload_model_text}>
                {translation['CREATE_MODEL_AI_PHOTO_TEXT']}
              </div>
              <div className={classes.upload_model_text}>
                {translation['CREATE_MODEL_AI_3D_MODEL_TEXT']}
              </div>
            </div>
            <div className={classes.upload_model_slider_wr}>
              {animPopupClass ? <RendersSliderAi /> : null}
            </div>

            <div className={classes.upload_model_btn_wr}>
              <div className={classes.upload_model_btn} onClick={onUploadFile}>
                {translation['RENDER_CONTINUE']}
              </div>
            </div>

            <div className={classes.upload_model_checkbox_wr} ref={checkBoxRef}>
              <Checkbox
                name={'uploadModelAiVisible'}
                label={translation['TEXT_DONT_SHOW_AGAIN']}
                onChange={notShowAgainClick}
                checked={uploadModelAiPopupShowCookie}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModelAiInfoPopup;
