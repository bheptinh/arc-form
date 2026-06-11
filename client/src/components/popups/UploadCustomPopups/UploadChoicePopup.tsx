import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../../redux/features/popups/popupsSlice';
import { useTranslation } from '../../../api/hooks/useTranslation';

const useStyle = createUseStyles({
  '@font-face': [
    {
      fontFamily: 'RobotoCondensed-Regular',
      fontWeight: 400,
      fontDisplay: 'swap',
      src: 'url("/src_designer/fonts/RobotoCondensed-Regular.ttf") format("truetype")',
    },
    {
      fontFamily: 'Roboto-Light',
      fontWeight: 300,
      fontDisplay: 'swap',
      src: 'url("/src_designer/Roboto-Light.ttf") format("truetype")',
    },
  ],
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
      justifyItems: 'center',
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
    width: 1226,
    maxWidth: '95%',
    height: 'auto',
    maxHeight: '95%',
    transform: 'scale(0)',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
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
    padding: '62px 53px 86px',
    '@media screen and (max-width: 1200px)': {
      padding: '9% 50px 13%',
    },
    '@media screen and (max-width: 950px)': {
      padding: '14px 14px 14px',
      height: 'auto',
    },
  },
  modal_pro_wr: {
    background: '#63bbf0',
    width: '100%',
    height: '100%',
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
  start_title: {
    color: '#282828',
    fontSize: 34,
    fontWeight: 300,
    marginBottom: 40,
    textAlign: 'center',
    fontFamily: 'RobotoCondensed-Regular',
    '@media screen and (max-width: 950px)': {
      fontSize: 20,
      marginBottom: 25,
    },
  },
  start_items: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  start_item: {
    width: 'calc(25% - (23px * 3) / 4)',
    cursor: 'pointer',
    position: 'relative',
    '&:hover $start_item_img_wr:after': {
      opacity: 1,
    },
    '&:hover $start_item_img_wr': {
      borderRadius: 7,
    },
    '@media screen and (max-width: 950px)': {
      '&:not(:last-child)': {
        marginBottom: 14,
      },
    },
  },
  start_item_img_wr: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 212,
    background: '#fff',
    borderRadius: 6,
    marginBottom: 16,
    position: 'relative',
    transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    '&:after': {
      top: '-2%',
      left: '-2%',
      width: '104%',
      border: '1px solid #fff',
      height: '104%',
      content: '" "',
      position: 'absolute',
      boxShadow: 'inset 0px 0px 0px 5px #9dd900',
      opacity: 0,
      borderRadius: 12,
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '@media screen and (max-width: 950px)': {
      height: 110,
    },
  },
  start_item_img: {
    maxWidth: '100%',
    '@media screen and (max-width: 950px)': {
      width: '70%',
    },
  },
  start_item_title: {
    textAlign: 'center',
    fontSize: 15,
    color: '#373737',
    textTransform: 'uppercase',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  start_item_subtitle: {
    textAlign: 'center',
    fontSize: 15,
    color: '#373737',
  },
  start_item_plashka: {
    position: 'absolute',
    top: 7,
    right: 7,
    color: '#2A3435',
    textTransform: 'uppercase',
    fontSize: 13,
    background: '#FFB400',
    padding: '3px 4px',
    borderRadius: 3,
    '@media screen and (max-width: 950px)': {
      fontSize: 9,
      top: 3,
      right: 3,
    },
  },
});

const UploadChoicePopup = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);

  const currOS = R2D.controller.getCurrentOS();

  const [animPopupClass, setAnimPopupClass] = useState(false);

  const onClosePopup = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'uploadChoicePopup' })), 500);
  };

  const startUpload = (type) => {
    onClosePopup();
    //type == R2D.ProductType.MODEL ? dispatch(setActivePopup({name: 'uploadChoiceModelPopup', backBtn: true})) : dispatch(setActivePopup({name: 'uploadCustomMaterialPopup', data: { privateMaterialType: type }, backBtn: true}));
    type == R2D.ProductType.MODEL
      ? dispatch(setActivePopup({ name: 'uploadCustomModelPopup', backBtn: true }))
      : dispatch(
          setActivePopup({
            name: 'uploadCustomMaterialPopup',
            data: { privateMaterialType: type },
            backBtn: true,
          })
        );
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
      style={{ zIndex: popups.uploadChoicePopup.zIndex }}
    >
      <div
        className={classes.planner_popup_wr}
        style={
          currOS == 'iOS' || currOS == 'Android'
            ? { width: '100%', height: '100%', maxHeight: '100%' }
            : null
        }
      >
        <div className={classes.planner_popup_cont}>
          <div className={classes.planner_popup_close} onClick={onClosePopup}>
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
          <div className={classes.start_title}>{translation['UPLOAD_CHOICE_TITLE']}</div>
          <div className={classes.start_items}>
            <div className={classes.start_item} onClick={(e) => startUpload(R2D.ProductType.MODEL)}>
              <div className={classes.start_item_img_wr}>
                <img
                  className={classes.start_item_img}
                  src="/src_designer/images/icon_upload_choice_model_new.jpg"
                />
              </div>
              <div className={classes.start_item_title}>{translation['TEXT_3D_MODEL']}</div>
              {/*<div className={classes.start_item_plashka} key={'model_upload_custom_plashka'}>NEW</div>*/}
            </div>
            <div
              className={classes.start_item}
              onClick={(e) => startUpload(R2D.ProductType.MATERIAL)}
            >
              <div className={classes.start_item_img_wr}>
                <img
                  className={classes.start_item_img}
                  src="/src_designer/images/icon_upload_choice_material_new.jpg"
                />
              </div>
              <div className={classes.start_item_title}>{translation['TEXT_MATERIAL']}</div>
            </div>
            <div
              className={classes.start_item}
              onClick={(e) => startUpload(R2D.ProductType.POSTER)}
            >
              <div className={classes.start_item_img_wr}>
                <img
                  className={classes.start_item_img}
                  src="/src_designer/images/icon_upload_choice_picture_new.jpg"
                />
              </div>
              <div className={classes.start_item_title}>{translation['TEXT_PORTRET']}</div>
            </div>
            <div
              className={classes.start_item}
              onClick={(e) => startUpload(R2D.ProductType.CARPET)}
            >
              <div className={classes.start_item_img_wr}>
                <img
                  className={classes.start_item_img}
                  src="/src_designer/images/icon_upload_choice_kulum_new.jpg"
                />
              </div>
              <div className={classes.start_item_title}>{translation['TEXT_CARPET']}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadChoicePopup;
