import { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import { selectActiveControlPanelMode } from '../../../redux/features/control/controlPanelSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../../redux/features/popups/popupsSlice';
import Checkbox from '../../../shared-components/inputs/checkbox';
import DefaultModal from '../../../shared-components/modals/default';
import RendersSliderAi from '../renders-example/slider/renders-slider-ai';

const useStyle = createUseStyles({
  planner_popup_wrap: {
    alignContent: 'center',
    background: 'rgba(0, 0, 0, 0.8)',
  },
  planner_popup_wr: {
    width: 1282,
    maxWidth: '95%',
    height: 'auto',
    '@media screen and (max-width: 950px)': {
      width: '90%',
      maxWidth: '90%',
    },
    maxHeight: '95%',
    transition: 'all 1.5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  planner_popup_cont: {
    color: 'var(--color-black)',
    backgroundColor: 'var(--color-info-light)',
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
    color: 'var(--color-text-muted)',
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
    color: 'var(--color-text-strong)',
    border: 'none',
    cursor: 'pointer',
    height: '36px',
    display: 'flex',
    padding: '15px',
    fontSize: '14px',
    background: 'var(--color-accent-strong)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    alignItems: 'center',
    borderRadius: '3px',
    textTransform: 'uppercase',
    justifyContent: 'center',
    '&:hover': {
      background: 'var(--color-accent-hover)',
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
    <DefaultModal
      visible={animPopupClass}
      zIndex={popups.uploadModelAiInfoPopup.zIndex}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
      wrapClassName={classes.planner_popup_wrap}
      style={
        currOS == 'iOS' || currOS == 'Android'
          ? { width: '100%', height: '100%', maxHeight: '100%' }
          : undefined
      }
      onClose={onClosePopup}
      onBack={onUploadChoiceModelPopup}
    >
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
    </DefaultModal>
  );
};

export default UploadModelAiInfoPopup;
