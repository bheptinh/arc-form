import { IconArrowLeft } from '@tabler/icons-react';
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
import DefaultModal from '../../../shared-components/modals/default';

const useStyle = createUseStyles({
  planner_popup_wrap: {
    alignContent: 'center',
    background: 'rgba(0, 0, 0, 0.8)',
    '@media screen and (max-width: 950px)': {
      display: 'grid',
    },
  },
  planner_popup_wr: {
    width: '100%',
    maxWidth: 1282,
    '@media screen and (max-width: 950px)': {},
  },
  planner_popup_cont: {
    color: 'var(--color-black)',
    backgroundColor: 'var(--color-info-light)',
    borderRadius: 6,
    position: 'relative',
    padding: '58px 103px 42px',
    width: '100%',
    height: 'auto',
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
        fill: 'var(--color-accent)',
      },
    },
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
    color: 'var(--color-text-muted)',
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
    background: 'var(--color-white)',
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
      border: '1px solid var(--color-white)',
      height: 'calc(100% + 10px)',
      content: '" "',
      opacity: 0,
      position: 'absolute',
      boxShadow: 'inset 0px 0px 0px 5px var(--color-accent-strong)',
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
    color: 'var(--color-text-slate)',
    textTransform: 'uppercase',
    fontSize: 29,
    background: 'var(--color-warning)',
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
    color: 'var(--color-text-muted)',
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
    <DefaultModal
      visible={animPopupClass}
      zIndex={popups.uploadChoiceModelPopup.zIndex}
      className={classes.planner_popup_wr}
      contentClassName={classes.planner_popup_cont}
      wrapClassName={classes.planner_popup_wrap}
      style={
        currOS == 'iOS' || currOS == 'Android'
          ? { width: '100%', height: '100%', maxHeight: '100%' }
          : undefined
      }
      onClose={onClosePopup}
    >
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
    </DefaultModal>
  );
};

export default UploadChoiceModelPopup;
