// FIXME: This component contains a duplicated code - RenderExampleSmall.tsx, RenderExample360.tsx and RenderExampleBig.tsx

import { IconFile, IconFileHorizontal, IconX } from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { Document, Page } from 'react-pdf';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../../api/hooks/useTranslation';
import { planner, user } from '../../../initR2D';
import { closeActivePopup } from '../../../redux/features/popups/popupsSlice';
import { removeQuickPanelAll } from '../../../redux/features/quickPanels/quickPanelsSlice';
import {
  selectActiveViewMode,
  setActiveViewMode,
} from '../../../redux/features/viewMode/viewModeSlice';
import Checkbox from '../../../shared-components/inputs/checkbox';
import { Accordion } from '../../common/Accordion';

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
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.2)',
  },
  planner_popup_wrap_show: {
    opacity: '1',
    pointerEvents: 'auto',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
    '& $planner_popup_wr': {
      transform: 'scale(1)',
      opacity: 1,
    },
  },
  planner_popup_wr: {
    width: '100%',
    height: '100%',
    transform: 'scale(0.5)',
    opacity: 0,
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  planner_popup_cont: {
    color: '#2A3435',
    backgroundColor: '#f1f1f1',
    overflow: 'hidden',
    position: 'relative',
    height: '100%',
    display: 'flex',
    justifyContent: 'space-between',
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

  planner_popup_cont_left: {
    position: 'relative',
    borderRight: '1px solid #cdcdcd',
    background: '#ffffff',
    width: 300,
    overflow: 'hidden',
    display: 'grid',
    gridTemplateRows: '1fr auto',
    height: '100%',
    zIndex: 1,
    '@media screen and (max-width: 950px)': {
      width: 189,
    },
  },
  planner_popup_cont_left_scroll: {
    position: 'relative',
    borderBottom: '1px solid #C6C4C4',
  },
  planner_popup_cont_center: {
    width: 'calc(100% - 300px)',
    height: '100%',
  },
  planner_popup_cont_left_main: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
  planner_popup_cont_left_main_top: {
    padding: 14,
    '@media screen and (max-width: 950px)': {
      padding: 5,
    },
  },
  planner_popup_cont_left_main_title: {
    marginBottom: 15,
    width: '100%',
    borderBottom: '1px solid #66ACF4',
    '& > input': {
      fontSize: 16,
      color: '#66ACF4',
      border: 'none',
      width: '100%',
      fontWeight: 400,
      outline: 'none',
    },
  },
  planner_popup_cont_left_buttons: {
    display: 'grid',
    padding: '14px',
    gridTemplateColumns: 'repeat(2, calc(50% - 4px))',
    gridGap: '8px',
    '@media screen and (max-width: 950px)': {
      padding: 5,
      gridGap: 5,
    },
  },
  planner_popup_cont_left_button: {
    cursor: 'pointer',
    height: '35px',
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 14,
    borderRadius: 3,
    padding: '0 10px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    minWidth: 120,
    border: 'none',
    outline: 'none',
    textTransform: 'uppercase',
    color: '#2A3435',
    '@media screen and (max-width: 950px)': {
      height: 26,
      padding: '0 5px',
      fontSize: 10,
      minWidth: 88,
    },
  },
  planner_popup_cont_left_button_cancel: {
    justifyContent: 'flex-start',
    border: '1px solid #000000',
    '& svg': {
      marginRight: 10,
      '@media screen and (max-width: 950px)': {
        width: 10,
        height: 'auto',
        marginRight: 5,
      },
    },
    '& p': {
      flex: 2,
      textAlign: 'center',
      color: '#2A3435',
    },
    '&:hover': {
      background: '#E9E9E9',
      color: '#ffffff',
    },
  },
  planner_popup_cont_left_button_save: {
    background: '#BBE521',
    '& svg': {
      marginRight: 10,
      '@media screen and (max-width: 950px)': {
        width: 10,
        height: 'auto',
        marginRight: 5,
      },
    },
    '&:hover': {
      background: '#8fc32d',
    },
  },
  planner_popup_orientation_buttons: {
    border: '2px solid #fff',
    height: '40px',
    display: 'inline-grid',
    gridGap: '2px',
    background: '#fff',
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    borderRadius: '6px',
    gridTemplateColumns: 'auto auto',
    marginBottom: 10,
    '@media screen and (max-width: 950px)': {
      height: 26,
    },
  },
  planner_popup_orientation_button: {
    color: '#2F2F2F',
    cursor: 'pointer',
    display: 'flex',
    padding: '0 20px',
    fontSize: '17px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    alignItems: 'center',
    borderRadius: '3px',
    minWidth: 60,
    '&:hover': {
      background: '#E9E9E9',
    },
    '@media screen and (max-width: 950px)': {
      '& svg': {
        maxHeight: '65%',
      },
    },
  },
  planner_popup_acc_type_accordion: {
    borderTop: '1px solid #BFBDBD',
    borderBottom: '1px solid #BFBDBD',
    marginLeft: '-14px',
    width: 'calc(100% + 28px)',
    marginBottom: 10,
  },
  planner_popup_orientation_button_active: {
    background: '#BAE51F',
    cursor: 'default',
    pointerEvents: 'none',
  },
  dropdown_arrow: {
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    pointerEvents: 'none',
  },
  planner_popup_acc_title: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 400,
    marginRight: 6,
    '& svg': {
      transition: 'all .1s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
    },
  },
  planner_popup_acc_types: {
    borderBottom: '1px solid rgba(196, 196, 196, .3)',
    paddingBottom: 5,
  },
  planner_popup_acc_types_hide: {
    paddingBottom: 5,
  },
  planner_popup_acc_types_toggle: {
    overflow: 'hidden',
    transition: 'all .1s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  planner_popup_acc: {
    marginTop: 30,
    '@media screen and (max-width: 950px)': {
      marginTop: 0,
    },
  },
  planner_popup_acc_type_active: {
    cursor: 'pointer',
    display: 'flex',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 13px',
    fontSize: '17px',
    transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      background: '#D9D9D9',
    },
  },
  planner_popup_acc_type_active_info: {
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  planner_popup_acc_types_toggle_item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
    padding: '5px 14px',
    '&:hover': {
      background: '#E9E9E9',
    },
  },
  planner_popup_acc_type_active_right: {
    marginRight: 15,
    fontSize: 12,
    fontWeight: 400,
    color: '#73909F',
    pointerEvents: 'none',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  planner_popup_acc_types_toggle_item_right: {
    marginRight: 30,
    fontSize: 12,
    fontWeight: 400,
    color: '#73909F',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      marginRight: 0,
    },
  },
  planner_popup_acc_type_active_left: {
    fontSize: 15,
    fontWeight: 400,
    color: '#000',
    pointerEvents: 'none',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  planner_popup_acc_types_toggle_item_left: {
    fontSize: 13,
    fontWeight: 400,
    color: '#2F2F2F',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  planner_popup_acc_type_option_wrap: {
    padding: '10px 0',
  },
  pdfViewer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  pdfViewer_page: {
    display: 'flex',
    justifyContent: 'center',
    maxHeight: '97%',
    border: '2px dashed #B7B7B7',
    overflowY: 'scroll',
    '& canvas': {
      maxHeight: '100%',
    },
  },
  planner_popup_checkbox: {
    marginTop: 15,
    '& label': {
      '&:before': {
        content: '" "',
        marginRight: 10,
      },
    },
  },
  planner_popup_checkboxes: {
    marginTop: 35,
    '& h2': {
      fontSize: 16,
      fontWeight: 700,
      marginRight: 6,
    },
    '@media screen and (max-width: 950px)': {
      marginTop: 10,
    },
  },
  planner_popup_viewModes: {
    display: 'flex',
    '& > div': {
      margin: '0 5px',
    },
  },
  planner_popup_viewModes_button: {},
  planner_popup_viewModes_button_active: {
    background: 'green',
  },
});

const Export2DProjectPopup = (props) => {
  const sizeTypes = [
    { type: 'A4', size: '210 x 297 mm' },
    { type: 'A5', size: '148 x 210 mm' },
    { type: 'A3', size: '297 x 420 mm' },
    { type: 'Letter', size: "8.5'' x 11''" },
    { type: 'B5', size: '176 x 250 mm' },
    { type: 'B4', size: '250 x 353 mm' },
  ];

  const scaleTypes = [
    { type: '1:10', scale: '1 cm = 10 cm' },
    { type: '1:20', scale: '1 cm = 20 cm' },
    { type: '1:50', scale: '1 cm = 50 cm' },
    { type: '1:100', scale: '1 cm = 100 cm' },
    { type: '1:200', scale: '1 cm = 200 cm' },
    { type: '1:24', scale: "1/2'' = 1'" },
    { type: '1:48', scale: "1/4'' = 1'" },
    { type: '1:96', scale: "1/8'' = 1'" },
    { type: '1:192', scale: "1/16'' = 1'" },
    { type: 'fit', scale: '' },
  ];
  const indexFit = scaleTypes.findIndex((item) => item.type == 'fit');

  const dispatch = useDispatch();
  const translation = useTranslation();

  const activeViewMode = useSelector(selectActiveViewMode);

  const [preloaderStatus, setPreloaderStatus] = useState(true);

  const [pdfFile, setPdfFile] = useState(null);

  const [orientationStatus, setOrientationStatus] = useState('portrait');

  const [sizeTypesMain, setSizeTypesMain] = useState(null);
  const [scaleTypesMain, setScaleTypesMain] = useState(null);

  const [sizeTypeCurrent, setSizeTypeCurrent] = useState(0);
  const [scaleTypeCurrent, setScaleTypeCurrent] = useState(indexFit);

  const [showScaleStatus, setShowScaleStatus] = useState(true);
  const [showRoomAreaStatus, setShowRoomAreaStatus] = useState(true);
  const [showRoomNameStatus, setShowRoomNameStatus] = useState(true);
  const [showSizesStatus, setShowSizesStatus] = useState(false);
  const [disabledSizesStatus, setDisabledSizesStatus] = useState(true);
  const [showTerrainTextureStatus, setShowTerrainTextureStatus] = useState(false);

  const [scalePdfNum, setScalePdfNum] = useState(1);

  const [animPopupClass, setAnimPopupClass] = useState(false);

  const pdfFileName = R2D.config.data.pdfFileNameCreate;

  const pdfElem = useRef(null);
  const pageRef = useRef(null);
  const pdfRef = useRef(null);

  const classes = useStyle();

  let timeoutId;

  const onMouseUp = (e) => {
    clearTimeout(timeoutId);
    document.removeEventListener('mouseup', onMouseUp);
    mouseDownHoverStatus = false;
  };

  const onSavePdf = (e) => {
    user.makeExport({ type: 0, environment: null, format: 'pdf' });
    R2D.pdfCreator.download(pdfFileName || 'ROOMTODO');
    dispatch(closeActivePopup({ name: 'export2DProjectPopup' }));
  };

  const changeOrientation = (e, type) => type != orientationStatus && setOrientationStatus(type);

  const onChangeSizeType = (e, index) => {
    setTimeout(() => setSizeTypeCurrent(index), 100);
  };

  const onChangeScaleType = (e, index) => {
    setTimeout(() => setScaleTypeCurrent(index), 100);
  };

  const preloaderStyles = {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 99,
    background: 'rgba(0, 0, 0, 0.3)',
    display: preloaderStatus ? 'block' : 'none',
  };

  const onPageScroll = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      if ((e.wheelDelta > 0 && scalePdfNum < 1.5) || (e.wheelDelta < 0 && scalePdfNum > 0.5)) {
        pdfRef.current.removeEventListener('wheel', onPageScroll);
        setScalePdfNum(
          e.wheelDelta > 0
            ? scalePdfNum < 1.5
              ? scalePdfNum + 0.1
              : 1.5
            : scalePdfNum > 0.5
              ? scalePdfNum - 0.1
              : 0.5
        );
      }
    }
  };

  const onPageLoad = (page) => pdfRef.current.addEventListener('wheel', onPageScroll);

  const updatePDF = () => {
    setPreloaderStatus(true);
    R2D.pdfCreator.createView2D({
      activeViewMode,
      orientation: orientationStatus,
      size: sizeTypes[sizeTypeCurrent].type,
      scale: scaleTypes[scaleTypeCurrent].type,
      scaleTranslate: translation['EXPORT_PROJECT_SCALE'],
      settings: {
        showScale: showScaleStatus,
        showRoomArea: showRoomAreaStatus,
        showRoomName: showRoomNameStatus,
        showSizes: showSizesStatus,
        showTerrainTexture: showTerrainTextureStatus,
      },
    });
    setPdfFile(R2D.pdfCreator.getDataurlstring());
  };

  const changeViewMode = (viewMode) => {
    if (!planner.scene.getCurrentSceneObject() && !planner.scene.getCurrentGroup())
      dispatch(removeQuickPanelAll());
    dispatch(setActiveViewMode(viewMode));
    props.onClick && props.onClick();
  };

  const onClickClosePopUp = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'export2DProjectPopup' })), 500);
  };

  useEffect(() => {
    const sizesTypeArray = [];

    sizeTypes.forEach((item, index) => {
      if (sizeTypeCurrent != index) {
        sizesTypeArray.push(
          <div
            className={classes.planner_popup_acc_types_toggle_item}
            onClick={(e) => onChangeSizeType(e, index)}
            key={index}
          >
            <p className={classes.planner_popup_acc_types_toggle_item_left}>{item.type}</p>
            <p className={classes.planner_popup_acc_types_toggle_item_right}>{item.size}</p>
          </div>
        );
      }
    });
    setSizeTypesMain(sizesTypeArray);
  }, [sizeTypeCurrent]);

  useEffect(() => {
    const scaleTypeArray = [];

    scaleTypes.forEach((item, index) => {
      if (scaleTypeCurrent != index) {
        scaleTypeArray.push(
          <div
            className={classes.planner_popup_acc_types_toggle_item}
            onClick={(e) => onChangeScaleType(e, index)}
            key={index}
          >
            <p className={classes.planner_popup_acc_types_toggle_item_left}>
              {item.type != 'fit' ? item.type : translation['EXPORT_PROJECT_FIT_THE_PAGE']}
            </p>
            <p className={classes.planner_popup_acc_types_toggle_item_right}>{item.scale}</p>
          </div>
        );
      }
    });

    setScaleTypesMain(scaleTypeArray);
  }, [scaleTypeCurrent]);

  useEffect(() => {
    setTimeout(() => pdfFile && setPreloaderStatus(false), 500);
  }, [pdfFile]);

  useEffect(() => {
    R2D.pdfCreator && !preloaderStatus && updatePDF();
  }, [
    orientationStatus,
    sizeTypeCurrent,
    scaleTypeCurrent,
    showScaleStatus,
    showRoomAreaStatus,
    showRoomNameStatus,
    showSizesStatus,
    showTerrainTextureStatus,
  ]);

  useEffect(() => {
    R2D.pdfCreator = new R2D.PDFCreator({ sizeTypes, scaleTypes });
    const startScale = R2D.pdfCreator.createView2D() || '1:48';
    setScaleTypeCurrent(scaleTypes.findIndex((item) => item.type == startScale));
    setPdfFile(R2D.pdfCreator.getDataurlstring());
  }, []);

  useEffect(() => {
    setDisabledSizesStatus(activeViewMode == 'constr' ? false : true);
  }, [activeViewMode]);

  useEffect(() => {
    if (showSizesStatus == !disabledSizesStatus) updatePDF();
    setShowSizesStatus(!disabledSizesStatus);
    setShowTerrainTextureStatus(false);
  }, [disabledSizesStatus]);

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
    >
      <div className="preloader" style={{ ...preloaderStyles }}>
        <div className="preloader-cube"></div>
      </div>

      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_cont}>
          <div className={classes.planner_popup_close} onClick={onClickClosePopUp}>
            <IconX size={24} color="#2F2F2F" className={classes.planner_popup_close_icon} />
          </div>

          <div className={classes.planner_popup_cont_left}>
            <div className={classes.planner_popup_cont_left_scroll}>
              <div className={classes.planner_popup_cont_left_main}>
                <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
                  <div className={classes.planner_popup_cont_left_main_top}>
                    <div className={classes.planner_popup_orientation}>
                      <div className={classes.planner_popup_acc_title}>
                        {translation['EXPORT_PROJECT_ORIENTATION']}
                      </div>
                      <div className={classes.planner_popup_orientation_buttons}>
                        <div
                          className={
                            classes.planner_popup_orientation_button +
                            ' ' +
                            (orientationStatus == 'portrait'
                              ? classes.planner_popup_orientation_button_active
                              : '')
                          }
                          onClick={(e) => changeOrientation(e, 'portrait')}
                        >
                          <IconFile size={20} color="#2A3435" />
                        </div>
                        <div
                          className={
                            classes.planner_popup_orientation_button +
                            ' ' +
                            (orientationStatus == 'landscape'
                              ? classes.planner_popup_orientation_button_active
                              : '')
                          }
                          onClick={(e) => changeOrientation(e, 'landscape')}
                        >
                          <IconFileHorizontal size={20} color="#2A3435" />
                        </div>
                      </div>
                    </div>

                    <div className={classes.planner_popup_orientation}>
                      <div className={classes.planner_popup_acc_title}>Відображення</div>
                      <div className={classes.planner_popup_orientation_buttons}>
                        <div
                          className={
                            classes.planner_popup_orientation_button +
                            ' ' +
                            (activeViewMode == 'view2d'
                              ? classes.planner_popup_orientation_button_active
                              : '')
                          }
                          onClick={() => changeViewMode('view2d')}
                        >
                          {/* TODO: Replace icon color cube */}
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                              opacity="0.99"
                              d="M1.32873 6.09131L9.27122 9.62956V18.2154L1.32812 13.976L1.32873 6.09131Z"
                              fill="#66ACF4"
                            />
                            <path
                              opacity="0.99"
                              d="M18.0619 6.09131L10.1194 9.62956V18.2154L18.0625 13.976L18.0619 6.09131Z"
                              fill="#B2D924"
                            />
                            <path
                              opacity="0.99"
                              d="M17.5547 5.28782L9.70082 1.0932L1.75963 5.34621L9.69138 8.91793L17.5547 5.28782Z"
                              fill="#F9ED32"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M9.66481 8.80656L1.8889 5.32405L9.70145 1.16733L17.4383 5.29971L9.66481 8.80656ZM9.19727 9.69287L1.37695 6.19048V13.948L9.19727 18.1054V9.69287ZM10.1973 18.1011L18.0132 13.9426L17.9946 6.14581L10.1973 9.6634V18.1011ZM18.9918 4.99576L19.0146 14.5425L9.69363 19.5018L0.376953 14.5489V4.99576L9.70236 0.0341187L18.9918 4.99576Z"
                              fill="black"
                            />
                          </svg>
                        </div>
                        <div
                          className={
                            classes.planner_popup_orientation_button +
                            ' ' +
                            (activeViewMode == 'constr'
                              ? classes.planner_popup_orientation_button_active
                              : '')
                          }
                          onClick={() => changeViewMode('constr')}
                        >
                          {/* TODO: Replace icon cube */}
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M9.66481 9.13475L1.8889 5.65224L9.70145 1.49552L17.4383 5.6279L9.66481 9.13475ZM9.19727 10.0211L1.37695 6.51867V14.2762L9.19727 18.4336V10.0211ZM10.1973 18.4293L18.0132 14.2708L17.9946 6.474L10.1973 9.99159V18.4293ZM18.9918 5.32395L19.0146 14.8707L9.69363 19.83L0.376953 14.8771V5.32395L9.70236 0.362305L18.9918 5.32395Z"
                              fill="black"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className={classes.planner_popup_acc}>
                      <div className={classes.planner_popup_acc_title}>
                        {translation['EXPORT_PROJECT_SIZE']}
                      </div>

                      <div className={classes.planner_popup_acc_type_accordion}>
                        <Accordion
                          title={sizeTypes[sizeTypeCurrent].type}
                          subTitle={sizeTypes[sizeTypeCurrent].size}
                        >
                          <div className={classes.planner_popup_acc_type_option_wrap}>
                            {sizeTypesMain}
                          </div>
                        </Accordion>
                      </div>
                    </div>
                    <div className={classes.planner_popup_acc}>
                      <div className={classes.planner_popup_acc_title}>
                        {translation['EXPORT_PROJECT_SCALE']}
                      </div>

                      <div className={classes.planner_popup_acc_type_accordion}>
                        <Accordion
                          title={
                            scaleTypeCurrent == indexFit
                              ? translation['EXPORT_PROJECT_FIT_THE_PAGE']
                              : scaleTypes[scaleTypeCurrent].type
                          }
                          subTitle={scaleTypes[scaleTypeCurrent].scale}
                        >
                          <div className={classes.planner_popup_acc_type_option_wrap}>
                            {scaleTypesMain}
                          </div>
                        </Accordion>
                      </div>
                    </div>
                    <div className={classes.planner_popup_checkboxes}>
                      <div className={classes.planner_popup_acc_title}>
                        {translation['EXPORT_PROJECT_SETTINGS']}
                      </div>
                      <div className={classes.planner_popup_checkboxes_main}>
                        <div className={classes.planner_popup_checkbox}>
                          <Checkbox
                            onChange={(status) => setShowScaleStatus(status)}
                            name={'showScale'}
                            label={translation['EXPORT_PROJECT_SHOW_SCALE']}
                            checked={showScaleStatus}
                          />
                        </div>
                        <div className={classes.planner_popup_checkbox}>
                          <Checkbox
                            onChange={(status) => setShowRoomAreaStatus(status)}
                            name={'showRoomArea'}
                            label={translation['EXPORT_PROJECT_SHOW_ROOM_AREA']}
                            checked={showRoomAreaStatus}
                          />
                        </div>
                        <div className={classes.planner_popup_checkbox}>
                          <Checkbox
                            onChange={(status) => setShowRoomNameStatus(status)}
                            name={'showRoomName'}
                            label={translation['EXPORT_PROJECT_SHOW_ROOM_NAME']}
                            checked={showRoomNameStatus}
                          />
                        </div>
                        <div className={classes.planner_popup_checkbox}>
                          <Checkbox
                            disabled={disabledSizesStatus}
                            onChange={(status) => setShowSizesStatus(status)}
                            name={'showSizes'}
                            label={translation['EXPORT_PROJECT_SHOW_SIZES']}
                            checked={showSizesStatus}
                          />
                        </div>
                        <div className={classes.planner_popup_checkbox}>
                          <Checkbox
                            disabled={!disabledSizesStatus}
                            onChange={(status) => setShowTerrainTextureStatus(status)}
                            name={'showTerrainTexture'}
                            label={translation['EXPORT_PROJECT_SHOW_TER_TEXTURE']}
                            checked={showTerrainTextureStatus}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </SimpleBar>
              </div>
            </div>
            <div className={classes.planner_popup_cont_left_buttons}>
              <div
                className={
                  classes.planner_popup_cont_left_button +
                  ' ' +
                  classes.planner_popup_cont_left_button_cancel
                }
                onClick={onClickClosePopUp}
              >
                <p>{translation['UPLOAD_MODEL_TEXT_CANCEL']}</p>
              </div>
              <div
                className={
                  classes.planner_popup_cont_left_button +
                  ' ' +
                  classes.planner_popup_cont_left_button_save
                }
                onClick={onSavePdf}
              >
                <p>{translation['UPLOAD_MODEL_TEXT_SAVE']}</p>
              </div>
            </div>
          </div>
          <div className={classes.planner_popup_cont_center} ref={pdfElem}>
            <Document file={pdfFile} className={classes.pdfViewer} inputRef={pdfRef}>
              <Page
                className={classes.pdfViewer_page}
                pageNumber={1}
                renderTextLayer={false}
                inputRef={pageRef}
                onLoadSuccess={onPageLoad}
                scale={scalePdfNum}
                renderAnnotationLayer={false}
              />
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Export2DProjectPopup;
