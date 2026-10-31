// import { FacebookShareButton } from 'next-share';
import { IconCopy, IconHelpHexagon, IconX } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { planner } from '../../initR2D';
import {
  selectIsProjectBelongToLoggedUser,
  updateIsProjectOnlyView,
} from '../../redux/features/common/commonSlice';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import {
  selectUserProfileData,
  selectUserProjectActive,
} from '../../redux/features/user/userSlice';
import { useEffectAsync } from '../../utils/useEffectAsync';
import Checkbox from '../../shared-components/inputs/checkbox';
import HoverComponent from '../left_new/parts/controlPanel/components/HoverComponent';

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
    },
  },
  planner_popup_wr: {
    color: '#000',
    maxWidth: 542,
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
    height: '100%',
    padding: '29px 60px 67px',
    position: 'relative',
    '@media screen and (max-width: 950px)': {
      padding: '14px 20px 14px',
    },
  },
  planner_popup_login_wrap: {
    position: 'relative',
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
        fill: '#a0a0a0',
      },
    },
  },
  planner_popup_close_icon: {
    width: '100%',
  },
  planner_popup_title: {
    fontSize: 25,
    fontWeight: 300,
    marginBottom: 25,
    color: '#373737',
    textAlign: 'center',
    '@media screen and (max-width: 950px)': {
      fontSize: 20,
    },
  },
  planner_popup_facebook: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 15,
  },
  planner_popup_facebook_icon: {
    width: 29,
    marginLeft: 13,
    '& img': {
      display: 'block',
    },
    '@media screen and (max-width: 950px)': {
      width: 22,
      marginLeft: 9,
      transform: 'translateY(-5px)',
    },
  },
  planner_popup_facebook_line: {
    background: '#D9D9D9',
    height: 1,
    marginBottom: 15,
  },
  planner_popup_login_wr: {},
  input_wrap: {
    display: 'grid',
    gridGap: '10px',
    marginBottom: 15,
  },
  input_wr: {
    color: '#fff',
    '&:last-child': {
      marginBottom: '0',
    },
  },
  planner_popup_text: {
    fontSize: 14,
    color: '#2F2F2F',
    marginBottom: 10,
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  formInputWr: {
    display: 'grid',
    gridTemplateColumns: 'auto 22px',
    alignItems: 'center',
    gridGap: 6,
  },
  formShareIcon: {
    width: 22,
    height: 22,
    cursor: 'pointer',
    '& path': {
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      '& path': {
        fill: '#a0a0a0',
      },
    },
  },
  formInput: {
    borderRadius: 3,
    paddingLeft: 10,
    fontSize: 14,
    color: '#000',
    width: '100%',
    border: '1px solid #e8dede',
    height: 30,
    background: '#ffffff',
    outline: 'none',
    resize: 'none',
    transition: 'all 0.4s ease-out',
    '@media screen and (max-width: 950px)': {
      height: 26,
      fontSize: 11,
    },
  },
  formTextarea: {
    padding: 5,
    fontSize: 14,
    borderRadius: 3,
    color: '#000',
    width: '100%',
    border: '1px solid #e8dede',
    height: 100,
    background: '#ffffff',
    outline: 'none',
    resize: 'none',
    transition: 'all 0.4s ease-out',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      height: 55,
    },
  },

  important_input: {
    '& $formInput': {
      border: '1px solid #e84343 !important',
    },
  },
  planner_popup_report: {
    color: 'red',
    fontSize: '12px',
    marginBottom: '10px',
  },
  planner_btn_done_wrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planner_btn_done: {
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
  },
  planner_popup_bottom: {
    display: 'grid',
    gridTemplateColumns: 'auto auto auto auto',
    justifyContent: 'left',
    gridGap: 6,
    alignItems: 'center',
    fontSize: 14,
    color: '#2F2F2F',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  formInputSize: {
    fontSize: '13px',
    borderRadius: 3,
    color: '#000',
    width: 45,
    textAlign: 'center',
    border: '1px solid #e8dede',
    height: 32,
    background: '#ffffff',
    outline: 'none',
    resize: 'none',
    transition: 'all 0.4s ease-out',
    '@media screen and (max-width: 950px)': {
      height: 26,
      fontSize: 11,
      width: 40,
    },
  },
  planner_popup_checkbox: {
    margin: '10px 0',
    display: 'flex',
    flexDirection: 'column',
  },
  planner_popup_checkbox_top: {
    display: 'flex',
    alignItems: 'start',
  },
  preloaderDiv: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
    zIndex: 5,
    background: 'rgba(0, 0, 0, .5)',
  },
  additional_info: {
    marginLeft: 5,
  },
  additional_info_hover: {
    position: 'absolute',
    background: '#81e7ff',
    display: 'none',
    fontSize: 12,
    width: 'max-content',
    zIndex: 999,
    padding: '2px 7px',
    transition: 'all .1s ease',
    userSelect: 'none',
  },
  planner_popup_checkbox_error: {
    paddingLeft: 22,
    marginTop: 2,
    display: 'flex',
    alignItems: 'center',
    '& > p': {
      fontSize: 13,
      color: '#2F2F2F',
    },
  },
  planner_popup_checkbox_error_red: {
    '& > p': {
      color: '#AF3131',
    },
  },
  planner_popup_checkbox_error_pro: {
    color: '#000',
    fontSize: '13px',
    marginLeft: '6px',
    borderRadius: '3px',
    padding: '5px 6px',
    position: 'relative',
    background: '#FFB400',
    textTransform: 'uppercase',
    zIndex: 1,
    marginRight: 9,
  },
  planner_popup_checkbox_error_text: {
    fontSize: 13,
    color: '#66ACF4',
    fontWeight: 400,
    textDecoration: 'underline',
    cursor: 'pointer',
    '&:hover': {
      textDecoration: 'none',
    },
  },
});

const SharePopup = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);

  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);

  const [needToUpgrade, setNeedToUpgrade] = useState(false);

  const popupType = popups.share.type;

  const popupData =
    popupType == 'tour'
      ? R2D.URL.DOMAIN + popups.share.data
      : popups.share.data
        ? popups.share.data
        : R2D.scene.getProjectHash();

  const createdLink = popupType == 'tour' ? popupData : R2D.URL.DOMAIN + popupData;

  const [configFacebookSharing, setFacebookSharing] = useState(R2D.config.data.ui.facebook_sharing);

  const isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);

  const userProjectActive = useSelector(selectUserProjectActive);

  const classes = useStyle();

  const [checkboxProjectOnlyView, setCheckboxProjectOnlyView] = useState(
    planner.scene.getProjectOnlyViewState()
  );

  const [preloaderStatus, setPreloaderStatus] = useState(false);
  const [animPopupClass, setAnimPopupClass] = useState(false);

  const inputRef = useRef(null);

  const userData = useSelector(selectUserProfileData);

  const onClickClosePopUp = (e) => {
    setAnimPopupClass(false);
    setTimeout(() => dispatch(closeActivePopup({ name: 'share' })), 500);
  };

  const handleCopy = () => {
    if (inputRef.current) {
      inputRef.current.select();
      const textToCopy = inputRef.current.value;
      navigator.clipboard.writeText(textToCopy);
    }
  };

  const onChangeOnlyView = async (status) => {
    if (
      userData.plan == 'pro' ||
      (isProjectBelongToLoggedUser && userProjectActive.plan == 'pro')
    ) {
      setNeedToUpgrade(false);
      setPreloaderStatus(true);
      setCheckboxProjectOnlyView(status);
      await planner.scene.setOnlyViewParam(status, popupData);
      if (R2D.scene.getProjectHash() == popupData) {
        planner.scene.updateProjectOnlyViewState(status);
        dispatch(updateIsProjectOnlyView(status));
      }
      setCheckboxProjectOnlyView(status);
      setPreloaderStatus(false);
    } else setNeedToUpgrade(true);
  };

  useEffect(() => {
    userData.plan == 'pro' && setNeedToUpgrade(false);
  }, [userData.plan]);

  useEffectAsync(async () => {
    if (popupType == 'listProject') {
      setPreloaderStatus(true);
      if (R2D.scene.getProjectHash() == popupData) {
        setCheckboxProjectOnlyView(R2D.scene.viewOnly);
      } else {
        const result = await R2D.controller.shareDataLoad(popupData);
        setCheckboxProjectOnlyView(result.data.viewOnly);
      }
      setPreloaderStatus(false);
    }
  }, [popupType]);

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
      style={{ zIndex: popups.share.zIndex }}
    >
      <div className={classes.planner_popup_wr}>
        <div className={classes.planner_popup_cont}>
          {preloaderStatus ? (
            <div className={classes.preloaderDiv}>
              <div className="preloader">
                <div className="preloader-cube"></div>
              </div>
            </div>
          ) : null}
          <div
            className={classes.planner_popup_close}
            id="js_close_popup"
            onClick={onClickClosePopUp}
          >
            <IconX size={24} color="#2F2F2F" className={classes.planner_popup_close_icon} />
          </div>
          <div className={classes.planner_popup_login_wrap}>
            <div className={classes.planner_popup_title}>
              {popupType == 'tour'
                ? translation['TITLE_SHARE_TOUR']
                : translation['TITLE_SHARE_PROJECT']}
            </div>
            {popupType != 'tour' && configFacebookSharing ? (
              <div>
                <div className={classes.planner_popup_facebook}>
                  <div className={classes.planner_popup_text}>{translation['TEXT_SHARE_BY']}</div>
                  {/* TODO: fix share button */}
                  [debug:FACEBOOK BUTTON HERE]
                  {/* <FacebookShareButton
                                        url={createdLink}
                                        children={<img src={`${R2D.URL.DOMAIN}/files/render/69682/105640/013048a81eb659fe3f17fafaba8c8c70.png`}/>}
                                        hashtag={'#myProjectInRoomtodo'}
                                    >
                                        <div className={classes.planner_popup_facebook_icon}>
                                            <img src="/src_designer/images/icon_facebook.svg" />
                                        </div>
                                    </FacebookShareButton> */}
                </div>
                <div className={classes.planner_popup_facebook_line}></div>
              </div>
            ) : null}

            <div className={classes.planner_popup_login_wr}>
              <form>
                <fieldset className={classes.input_wrap}>
                  <div className={classes.input_wr}>
                    <div className={classes.planner_popup_text}>
                      {popupType == 'tour'
                        ? translation['TEXT_SHARE_LINK_TO_TOUR']
                        : translation['TEXT_SHARE_LINK_TO_PROJECT']}
                    </div>
                    <div className={classes.formInputWr}>
                      <input
                        ref={inputRef}
                        className={classes.formInput}
                        type="text"
                        name="link"
                        readOnly
                        value={createdLink}
                      />
                      <IconCopy
                        onClick={handleCopy}
                        className={classes.formShareIcon}
                        size={22}
                        color="#323232"
                      />
                    </div>
                  </div>

                  <fieldset className={classes.planner_popup_checkbox}>
                    <div className={classes.planner_popup_checkbox_top}>
                      <Checkbox
                        name={'viewOnly'}
                        label={translation['TEXT_PROJECT_ONLY_VIEW']}
                        checked={checkboxProjectOnlyView}
                        onChange={onChangeOnlyView}
                      />
                      <div>
                        <HoverComponent
                          hoverText={translation['TIPS_SHARE_ONLY_VIEW']}
                          hoverTextPositionX={'left'}
                          showOnMobile={true}
                        >
                          <IconHelpHexagon
                            size={18}
                            color="#2D8BDB"
                            className={classes.additional_info}
                          />
                        </HoverComponent>
                      </div>
                    </div>
                    {userData?.plan != 'pro' ? (
                      <div
                        className={
                          needToUpgrade
                            ? classes.planner_popup_checkbox_error +
                              ' ' +
                              classes.planner_popup_checkbox_error_red
                            : classes.planner_popup_checkbox_error
                        }
                      >
                        <p>{translation['EXPORT_ERROR_AVAIL_PRO']}</p>
                        <div className={classes.planner_popup_checkbox_error_pro}>pro</div>
                        <a
                          className={classes.planner_popup_checkbox_error_text}
                          onClick={(e) =>
                            dispatch(setActivePopup({ name: 'payPro', type: 'user' }))
                          }
                        >
                          {translation['TEXT_UPDATE']}
                        </a>
                      </div>
                    ) : null}
                  </fieldset>

                  {popupType != 'tour' ? (
                    <div className={classes.input_wr}>
                      <div className={classes.planner_popup_text}>
                        {translation['TEXT_SHARE_EMBED']}
                      </div>
                      <textarea
                        className={classes.formTextarea}
                        type="text"
                        name="embed"
                        readOnly
                        value={
                          "<iframe src='" +
                          createdLink +
                          "' style='width:" +
                          width +
                          'px' +
                          '; height:' +
                          height +
                          'px' +
                          ";'></iframe>"
                        }
                      />
                    </div>
                  ) : null}
                </fieldset>
                {popupType != 'tour' ? (
                  <fieldset className={classes.planner_popup_bottom}>
                    <div>{translation['TEXT_SHARE_EMBED_SIZE']}</div>
                    <input
                      type="text"
                      className={classes.formInputSize}
                      onChange={(e) =>
                        isNaN(e.target.value) ? setWidth(800) : setWidth(+e.target.value)
                      }
                      name="width"
                      value={width}
                    />
                    x
                    <input
                      type="text"
                      className={classes.formInputSize}
                      onChange={(e) =>
                        isNaN(e.target.value) ? setHeight(600) : setHeight(e.target.value)
                      }
                      name="height"
                      value={height}
                    />
                  </fieldset>
                ) : null}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePopup;
