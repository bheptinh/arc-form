import { IconArrowLeft, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../../redux/features/popups/popupsSlice';

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
    '@media screen and (max-width: 950px)': {
      display: 'grid',
    },
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
    maxWidth: 1282,
    maxHeight: '90%',
    transform: 'scale(0)',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    '@media screen and (max-width: 950px)': {},
  },
  planner_popup_cont: {
    color: '#000',
    backgroundColor: '#72C4FF',
    borderRadius: 6,
    position: 'relative',
    padding: '58px 103px 42px',
    width: '100%',
    '@media screen and (max-width: 1200px)': {
      padding: '40px 34px 63px',
    },
    '@media screen and (max-width: 950px)': {
      padding: '20px 40px 30px 40px',
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
  upload_model_items: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, calc(50% - 10px))',
    gridGap: '20px',
    width: '100%',
    '@media screen and (max-width: 950px)': {
      gridTemplateColumns: 'repeat(2, 145px)',
      gridGap: 5,
    },
  },
  upload_model_item: {
    display: 'grid',
    alignContent: 'baseline',
    gridTemplateRows: 'auto 1fr',
    width: '100%',
  },
  upload_model_title: {
    color: '#373737',
    fontSize: 24,
    marginBottom: 9,
    textTransform: 'uppercase',
    textAlign: 'center',
    fontFamily: 'RobotoCondensed-Regular',
    '@media screen and (max-width: 950px)': {
      fontSize: 10,
      marginBottom: 5,
      height: 29,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
  upload_model_item_img_wr: {
    background: '#fff',
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    borderRadius: 6,
    cursor: 'pointer',
    position: 'relative',
    width: '100%',
    '& img': {
      width: '100%',
      overflow: 'hidden',
      borderRadius: 6,
      '@media screen and (max-width: 950px)': {
        width: 'auto',
        height: 70,
        margin: 'auto',
      },
    },
    '&:after': {
      top: '-6px',
      left: '-6px',
      width: 'calc(100% + 10px)',
      border: '1px solid #fff',
      height: 'calc(100% + 10px)',
      content: '" "',
      opacity: 0,
      position: 'absolute',
      boxShadow: 'inset 0px 0px 0px 5px #9dd900',
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
      borderRadius: '12px',
    },
    '&:hover': {
      '&:after': {
        opacity: 1,
      },
    },
  },
  upload_model_plashka: {
    position: 'absolute',
    top: 7,
    right: 7,
    color: '#2A3435',
    textTransform: 'uppercase',
    fontSize: 29,
    background: '#FFB400',
    padding: '3px 4px',
    borderRadius: 3,
    '@media screen and (max-width: 1200px)': {
      fontSize: 10,
      top: 3,
      right: 3,
    },
  },
  upload_model_text: {
    fontSize: 21,
    color: '#373737',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    padding: 10,
    '@media screen and (max-width: 1200px)': {
      fontSize: 9,
      padding: 5,
    },
  },
});

const UploadChoiceModelPopup = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);

  const catagoryId = popups.uploadChoiceModelPopup.data;

  const currOS = R2D.controller.getCurrentOS();

  const [animPopupClass, setAnimPopupClass] = useState(false);

  const onClosePopup = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'uploadChoiceModelPopup' })), 500);
  };

  const startUploadModelGlb = (e) => {
    dispatch(setActivePopup({ name: 'uploadCustomModelPopup', data: catagoryId }));
    onClosePopup();
  };

  const startUploadModelAi = (e) => {
    onClosePopup();
    R2D.Storage.load('r2d_uploadModelAiPopup')
      ? dispatch(setActivePopup({ name: 'uploadCustomModelAiPopup' }))
      : dispatch(setActivePopup({ name: 'uploadModelAiInfoPopup' }));
  };

  const onUploadChoicePopup = (e) => {
    dispatch(setActivePopup({ name: 'uploadChoicePopup' }));
    onClosePopup();
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
      style={{ zIndex: popups.uploadChoiceModelPopup.zIndex }}
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
          <div className={classes.planner_popup_close} onClick={onClosePopup}>
            <IconX size={24} color="#2F2F2F" className={classes.planner_popup_close_icon} />
          </div>

          {popups.uploadChoiceModelPopup.backBtn ? (
            <IconArrowLeft
              className={classes.planner_popup_back}
              onClick={onUploadChoicePopup}
              size={24}
              color="#2F2F2F"
            />
          ) : null}

          <div className={classes.upload_model_items}>
            <div className={classes.upload_model_item}>
              <div className={classes.upload_model_title}>
                {translation['UPLOAD_CHOICE_MODEL_3D_TITLE']}
              </div>
              <div className={classes.upload_model_item_img_wr} onClick={startUploadModelGlb}>
                <img src="/src_designer/images/popup_upload_model_ai/choice_upload_model_glb.jpg" />
                <div className={classes.upload_model_text}>
                  {translation['UPLOAD_CHOICE_MODEL_3D_TEXT']}
                </div>
              </div>
            </div>
            <div className={classes.upload_model_item}>
              <div className={classes.upload_model_title}>
                {translation['UPLOAD_CHOICE_MODEL_AI_TITLE']}
              </div>
              <div className={classes.upload_model_item_img_wr} onClick={startUploadModelAi}>
                <img src="/src_designer/images/popup_upload_model_ai/choice_upload_model_img.jpg" />
                <div className={classes.upload_model_text}>
                  {translation['UPLOAD_CHOICE_MODEL_AI_TEXT']}
                </div>
                <div className={classes.upload_model_plashka}>NEW</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadChoiceModelPopup;
