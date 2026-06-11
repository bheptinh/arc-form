import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { user } from '../../../initR2D';
import { selectIsProjectBelongToLoggedUser } from '../../../redux/features/common/commonSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../../redux/features/popups/popupsSlice';
import {
  selectUserProfileData,
  selectUserProjectActive,
} from '../../../redux/features/user/userSlice';
import { setActiveViewMode } from '../../../redux/features/viewMode/viewModeSlice';
import { useTranslation } from '../../../api/hooks/useTranslation';

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
    maxWidth: 540,
    width: '100%',
    maxHeight: '90%',
    transform: 'scale(0)',
    boxShadow: '0px 1px 10px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)',
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
  export_button: {
    marginTop: 10,
    cursor: 'pointer',
    '& input': {
      marginRight: 5,
      position: 'absolute',
      zIndex: '-1',
      opacity: 0,
      '&:checked': {
        '&+label:after': {
          opacity: 1,
        },
      },
    },
    '& label': {
      fontSize: 14,
      color: '#2F2F2F',
      position: 'relative',
      cursor: 'pointer',
      '& span': {
        color: '#73909F',
      },
      '&:before': {
        content: '" "',
        transition: 'all .9s cubic-bezier(.19,1,.22,1)',
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: '#E7E7E7',
        position: 'absolute',
        boxShadow:
          '0px 1px 0px 0px rgb(255 255 255 / 0%), inset 0px 1px 0px 0px rgb(191 191 191 / 85%)',
        left: -20,
        top: 0,
        bottom: 0,
      },
      '&:after': {
        content: '" "',
        transition: 'all .9s cubic-bezier(.19,1,.22,1)',
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: '#9DD900',
        border: '1px solid #9DD112',
        position: 'absolute',
        left: -16,
        top: 4,
        bottom: 0,
        opacity: 0,
      },
      '@media screen and (max-width: 950px)': {
        fontSize: 11,
      },
    },
    '@media screen and (max-width: 950px)': {
      marginTop: 6,
    },
  },
  export_button_recomm: {},
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
  formatColumns: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    textAlign: 'center',
    flexWrap: 'wrap',
    padding: '0 10px 0',
    margin: '20px 0 30px',
    position: 'relative',
    '&::after': {
      content: "''",
      width: 1,
      height: '100%',
      background: '#4C5D67',
      position: 'absolute',
      left: '50%',
      top: '0',
      display: 'inline-block',
      opacity: '.3',
    },
    '@media screen and (max-width: 950px)': {
      margin: '10px 0 12px',
    },
  },
  formatColumn: {
    width: '50%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  formatColumn_top: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 20,
    '& h2': {
      fontSize: 25,
      fontFamily: 'Roboto-Light, sans-serif',
      color: '#2F2F2F',
      fontWeight: 400,
    },
    '& img': {
      maxHeight: '100%',
    },
    '@media screen and (max-width: 950px)': {
      height: 50,
      marginBottom: 7,
    },
  },
  planner_popup_export_top: {
    height: 120,
    display: 'grid',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#72C4FF',
    position: 'relative',
    alignContent: 'center',
    textAlign: 'center',
    '& h2': {
      color: '#ffffff',
      fontSize: 32,
      fontFamily: 'Roboto-Light, sans-serif',
      fontWeight: 300,
      marginBottom: 10,
      '@media screen and (max-width: 950px)': {
        fontSize: 20,
        marginBottom: 5,
      },
    },
    '& h3': {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: 400,
      '@media screen and (max-width: 950px)': {
        fontSize: 11,
      },
    },
    '@media screen and (max-width: 950px)': {
      height: 60,
    },
  },
  formatColumn_bottom: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  formatColumn_bottom_title: {
    display: 'flex',
    minHeight: 14,
    '& h3': {
      fontSize: 12,
      color: '#2F2F2F',
      textTransform: 'uppercase',
      '@media screen and (max-width: 950px)': {
        fontSize: 11,
      },
    },
    '& span': {
      fontSize: 12,
      color: '#73909F',
      marginLeft: 5,
      '@media screen and (max-width: 950px)': {
        fontSize: 11,
      },
    },
  },
  formatColumn_bottom_formats: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  planner_popup_export_bottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 0 30px',
    flexDirection: 'column',
  },
  planner_popup_export_button: {
    marginTop: 22,
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
    minWidth: 96,
    outline: 'none',
    background: '#BBE521',
    border: '1px solid #BBE521',
    textTransform: 'uppercase',
    '& svg': {
      width: 11,
      height: 15,
      marginLeft: 7,
    },
    '&:hover': {
      background: '#8fc32d',
    },
    '@media screen and (max-width: 950px)': {
      marginTop: 0,
      height: 26,
      fontSize: 12,
      minWidth: 88,
    },
  },
  planner_popup_export_button_update: {
    background: '#fff',
    color: '#A7A7A7',
    border: '1px solid #C8C8C8',
    pointerEvents: 'none',
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
        fill: '#ffd119',
      },
    },
  },
  planner_popup_export_inside: {
    marginBottom: 20,
  },
  planner_popup_export_inside_block: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: '0 40px',
    padding: '40px 0',
    alignItems: 'center',
    borderBottom: '1px solid rgba(76, 93, 103, 0.3)',
  },
  planner_popup_export_inside_block_left: {
    flex: 1,
    '& h3': {
      fontWeight: 400,
      fontSize: 21,
      color: '#2F2F2F',
      marginBottom: 10,
    },
    '& p': {
      fontSize: 14,
      color: '#2F2F2F',
    },
  },
  planner_popup_export_inside_block_right: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flex: 1,
    '& svg': {
      margin: '0 20px',
    },
  },
  planner_popup_export_inside_block_bottom: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBottom: 40,
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
    background: '#9DD900',
    color: '#2B2B2B',
    border: '1px solid #9DD900',
    width: 155,
    padding: '10px 0',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all .3s ease',
    '&:hover': {
      background: '#ffd119',
      border: '1px solid #ffd119',
    },
  },
  planner_popup_export_inside_block_bottom_buttons_cancel: {
    background: '#fff',
    color: '#000000',
    border: '1px solid #000',
    width: 155,
    padding: '10px 0',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all .3s ease',
    '&:hover': {
      background: '#ffd119',
      border: '1px solid #ffd119',
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
  },
  planner_popup_export_downloading_text: {
    marginBottom: 40,
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
    },
    '& button': {
      background: '#9DD900',
      width: 175,
      padding: '10px 0',
      fontSize: 14,
      textTransform: 'uppercase',
      border: 'none',
      cursor: 'pointer',
      '&:hover': {
        background: '#ffd119',
      },
    },
  },
  planner_popup_export_bottom_error_text: {
    fontSize: 14,
    lineHeight: '16.41px',
    color: '#292A27',
    marginBottom: 5,
    display: 'flex',
    alignItems: 'center',

    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  planner_popup_export_bottom_error_basic: {
    background: '#BADCFF',
    borderRadius: 3,
    fontFamily: 'RobotoCondensed-Regular',
    fontSize: 13,
    color: '#292A27',
    padding: '2px 3px',
    marginLeft: 5,
    marginRight: 5,
    textTransform: 'uppercase',
  },
  planner_popup_export_bottom_error_pro: {
    background: '#FFB400',
    borderRadius: 3,
    fontFamily: 'RobotoCondensed-Regular',
    fontSize: 13,
    color: '#292A27',
    padding: '2px 3px',
    marginLeft: 5,
    textTransform: 'uppercase',
  },
  planner_popup_export_bottom_error_upgrate: {
    color: '#66ACF4',
    textDecoration: 'underline',
    fontSize: 13,
    cursor: 'pointer',
    marginLeft: 6,
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      textDecoration: 'none',
    },
  },
});

const ExportPopup = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const userData = useSelector(selectUserProfileData);
  const popups = useSelector(selectPopups);
  const [currentFormat, setCurrentFormat] = useState(null);
  const formats = [
    { format: 'ifc', recommended: ['Revit', 'Archicad'] },
    { format: 'blend', recommended: ['Blender'] },
    { format: 'fbx', recommended: ['3ds Max'] },
    { format: 'glb', recommended: ['Web'] },
    { format: 'dxf', recommended: ['AutoCAD'] },
    { format: 'obj', recommended: [] },
    { format: 'dae', recommended: [] },
  ];
  const formats2D = [
    { format: 'pdf' },
    // { format: 'jpg'}
  ];
  const [currentFormat2D, setCurrentFormat2D] = useState(null);

  const isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);

  const [needPlan, setNeedPlan] = useState(null);

  const userProjectActive = useSelector(selectUserProjectActive);

  const classes = useStyle();
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const onContinue = async (e) => {
    if (currentFormat2D !== null) {
      dispatch(setActiveViewMode('view2d'));
      dispatch(setActivePopup({ name: 'export2DProjectPopup' }));
    } else if (currentFormat !== null)
      dispatch(
        setActivePopup({
          name: 'export3DProjectPopup',
          type: R2D.Storage.load('r2d_exportDownloadDetails') ? 'download' : 'predownload',
          data: formats[currentFormat]?.format,
        })
      );
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'exportPopup' })), 500);
  };

  const handleOptionChange = (index) => {
    setCurrentFormat(index);
    setCurrentFormat2D(null);
  };
  const handleOptionChange2D = (index) => {
    setCurrentFormat2D(index);
    setCurrentFormat(null);
  };

  const closeExportPopup = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'exportPopup' })), 500);
  };

  useEffect(() => {
    if (
      userData.plan == 'pro' ||
      (isProjectBelongToLoggedUser && userProjectActive.plan == 'pro')
    ) {
      setNeedPlan(null);
    } else {
      if (currentFormat !== null) {
        setNeedPlan('pro');
      }
      if (currentFormat2D !== null) {
        if (
          userData.plan == 'basic' ||
          (isProjectBelongToLoggedUser && userProjectActive.plan == 'basic')
        ) {
          setNeedPlan(null);
        } else {
          setNeedPlan('pro basic');
        }
      }
    }
  }, [currentFormat, currentFormat2D]);

  useEffect(() => {
    if (currentFormat2D === null && currentFormat === null) return;
    if (userData.plan == 'pro' || (userData.plan == 'basic' && currentFormat2D !== null)) {
      setNeedPlan(null);
    } else {
      setNeedPlan(translation[currentFormat !== null ? 'pro' : 'pro basic']);
    }
  }, [userData]);

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
      style={{ zIndex: popups.exportPopup.zIndex }}
    >
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_cont}>
          <div className={classes.planner_popup_export}>
            <div
              className={classes.planner_popup_close}
              id="js_close_popup"
              onClick={closeExportPopup}
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
            <div className={classes.planner_popup_export_top}>
              <h2>{translation['EXPORT_PROJECT_TITLE']}</h2>
              <h3>{translation['EXPORT_PROJECT_CHOOSE']}</h3>
            </div>

            <div className={classes.formatColumns}>
              <div className={classes.formatColumn}>
                <div className={classes.formatColumn_top}>
                  <h2>2D</h2>
                  <img src="/src_designer/images/export_img_2d.png" />
                </div>
                <div className={classes.formatColumn_bottom}>
                  <div className={classes.formatColumn_bottom_title}></div>
                  <div className={classes.formatColumn_bottom_formats}>
                    {formats2D.map((item, index) => (
                      <div key={index} className={classes.export_button}>
                        <input
                          type="radio"
                          name="react-tips"
                          id={'format2d_' + index}
                          value={item.format}
                          checked={formats2D[currentFormat2D]?.format === item.format}
                          onChange={(e) => handleOptionChange2D(index)}
                          className="form-check-input"
                        />
                        <label htmlFor={'format2d_' + index}>{item.format.toUpperCase()}</label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className={classes.formatColumn}>
                <div className={classes.formatColumn_top}>
                  <h2>3D</h2>
                  <img src="/src_designer/images/export_img_3d.png" />
                </div>
                <div className={classes.formatColumn_bottom}>
                  <div className={classes.formatColumn_bottom_title}>
                    <h3>{translation['EXPORT_PROJECT_FORMATS_TITLE']} - </h3>
                    <span>{translation['EXPORT_PROJECT_FORMATS_RECOMMEND']}</span>
                  </div>
                  <div className={classes.formatColumn_bottom_formats}>
                    {formats.map((item, index) => (
                      <div key={index} className={classes.export_button}>
                        <input
                          type="radio"
                          name="react-tips"
                          id={'format_' + index}
                          value={item.format}
                          checked={formats[currentFormat]?.format === item.format}
                          onChange={(e) => handleOptionChange(index)}
                          className="form-check-input"
                        />
                        <label htmlFor={'format_' + index}>
                          {item.format.toUpperCase()}
                          {item.recommended.length > 0 ? (
                            <span>
                              <span> - </span>
                              <span className={classes.export_button_recomm}>
                                {item.recommended.map(
                                  (recommended) =>
                                    recommended +
                                    (recommended == item.recommended[item.recommended.length - 1]
                                      ? ''
                                      : ', ')
                                )}
                              </span>
                            </span>
                          ) : null}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className={classes.planner_popup_export_bottom}>
              {needPlan == 'pro' ? (
                <div className={classes.planner_popup_export_bottom_error_text}>
                  {translation['EXPORT_ERROR_AVAIL_PRO']}
                  <div className={classes.planner_popup_export_bottom_error_pro}>pro</div>
                  <div
                    className={classes.planner_popup_export_bottom_error_upgrate}
                    onClick={(e) => dispatch(setActivePopup({ name: 'payPro', type: 'user' }))}
                  >
                    {translation['TEXT_UPDATE']}
                  </div>
                </div>
              ) : needPlan == 'pro basic' ? (
                <div className={classes.planner_popup_export_bottom_error_text}>
                  {translation['EXPORT_ERROR_AVAIL_PRO']}
                  <div className={classes.planner_popup_export_bottom_error_basic}>basic</div>
                  {translation['TEXT_OR']}
                  <div className={classes.planner_popup_export_bottom_error_pro}>pro</div>
                  <div
                    className={classes.planner_popup_export_bottom_error_upgrate}
                    onClick={(e) => dispatch(setActivePopup({ name: 'payPro', type: 'user' }))}
                  >
                    {translation['TEXT_UPDATE']}
                  </div>
                </div>
              ) : null}

              <button
                className={
                  classes.planner_popup_export_button +
                  ' ' +
                  (needPlan != null ? classes.planner_popup_export_button_update : '')
                }
                style={
                  currentFormat == null && currentFormat2D == null ? { visibility: 'hidden' } : {}
                }
                onClick={onContinue}
              >
                {translation['BUTTON_OK']}
                {needPlan != null ? (
                  <svg width="11" height="15" fill="none" viewBox="0 0 11 15">
                    <rect width="10.384" height="8.307" y="6.231" fill="#A7A7A7" rx="1" />
                    <path
                      fill="#A7A7A7"
                      fillRule="evenodd"
                      d="M2.738 3.79v2.44H1.384V3.74c-.003-.344-.009-1.205.404-1.998.233-.447.61-.9 1.206-1.235C3.592.171 4.327 0 5.19 0c.863 0 1.6.171 2.196.506a2.98 2.98 0 0 1 1.207 1.235c.413.793.407 1.653.404 1.998V6.23H7.642V3.79c0-.371.035-1.071-.17-1.464-.09-.175-.257-.533-.56-.777-.431-.35-.696-.511-1.722-.511-.507 0-1.095.068-1.661.511-.438.343-.57.602-.661.777-.205.393-.13 1.093-.13 1.464Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPopup;
