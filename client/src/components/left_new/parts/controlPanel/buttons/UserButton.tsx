import React, { useEffect, useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner, user } from '../../../../../initR2D';
import { selectTranslation } from '../../../../../redux/features/language/languageSlice';
import { setActivePopup } from '../../../../../redux/features/popups/popupsSlice';
import { removeQuickPanelAll } from '../../../../../redux/features/quickPanels/quickPanelsSlice';
import {
  selectIsLogged,
  selectUserProfileData,
  setProfileData,
} from '../../../../../redux/features/user/userSlice';
import HoverComponent from '../components/HoverComponent';

const useStyle = createUseStyles({
  '@font-face': [
    {
      fontFamily: 'RobotoCondensed-Regular',
      fontWeight: 400,
      fontDisplay: 'swap',
      src: 'url("/src_designer/fonts/RobotoCondensed-Regular.ttf") format("truetype")',
    },
  ],
  menu_dop_btn_wrap: {
    height: '28px',
    width: '30px',
    marginBottom: 10,
    pointerEvents: 'all',
    position: 'relative',
  },
  menu_dop_btn_wr: {
    height: '38px',
    width: '40px',
    pointerEvents: 'none',
    position: 'relative',
    cursor: 'pointer',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    '&:hover $menu_dop_btn_icon path': {
      fill: '#ffffff',
    },
  },
  menu_dop_btn_wr_login: {
    pointerEvents: 'auto',
  },
  menu_dop_btn: {
    borderBottom: '1px solid #595959',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    background: '#2E3839',
    position: 'relative',
    zIndex: 3,
    height: '100%',
    transition: 'background .9s cubic-bezier(.19,1,.22,1)',
    '&:hover': {
      background: '#4E5455',
      '& path': {
        fill: '#B8E11F',
      },
    },
  },
  menu_dop_btn_icon: {
    display: 'block',
    margin: 'auto',
    '& path': {
      transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    },
  },
  menu_dop_info_wrap: {
    position: 'absolute',
    left: '100%',
    paddingLeft: '1px',
    top: 0,
    zIndex: 2,
    transform: 'translateX(-102%)',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  menu_dop_info_link: {
    background: '#2E3839',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    color: '#fff',
    whiteSpace: 'nowrap',
    paddingRight: '13px',
    paddingLeft: '12px',
    fontSize: '12px',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    position: 'relative',
    '&:hover': {
      background: '#4E5455',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: '11px',
    },
  },
  menu_dop_info_link_overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  menu_dop_info_info_link_icon: {
    height: '100%',
    width: '25px',
    marginRight: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& img': {
      maxWidth: '100%',
      maxHeight: '100%',
    },
  },
  menu_dop_info_info_link_pro: {
    fontFamily: 'RobotoCondensed-Regular',
    color: '#383C31',
    fontSize: '13px',
    marginLeft: '6px',
    borderRadius: '3px',
    padding: '2px 3px',
    position: 'relative',
    background: '#FFB400',
    textTransform: 'uppercase',
    zIndex: 1,
  },
  menu_dop_info_info_link_basic: {
    fontFamily: 'RobotoCondensed-Regular',
    color: '#383C31',
    fontSize: '13px',
    marginLeft: '6px',
    borderRadius: '3px',
    padding: '2px 3px',
    position: 'relative',
    background: '#BADCFF',
    textTransform: 'uppercase',
    zIndex: 1,
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      background: '#95c3f3',
    },
  },
  menu_dop_info_info_link_free: {
    fontFamily: 'RobotoCondensed-Regular',
    color: '#66ACF4',
    fontSize: '13px',
    marginLeft: '6px',
    padding: '0px 3px',
    textDecoration: 'underline',
    position: 'relative',
    zIndex: 1,
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      textDecoration: 'none',
    },
  },
  menu_dop_btn_wr_hover: {
    width: 40,
    '& $menu_dop_btn_wr': {
      pointerEvents: 'auto',
    },
    '& $menu_dop_info_wrap': {
      transform: 'translateX(0%)',
    },
  },
  menu_dop_info_user_name: {
    background: '#2E3839',
    height: '37px',
    display: 'flex',
    alignItems: 'center',
    color: '#fff',
    whiteSpace: 'nowrap',
    paddingRight: '13px',
    fontSize: '12px',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    borderBottom: '1px solid #595959',
    cursor: 'default',
    paddingLeft: 15,
  },
});

const UserButton = (props) => {
  const dispatch = useDispatch();
  const classes = useStyle();
  const userData = useSelector(selectUserProfileData);
  const translation = useSelector(selectTranslation);

  const isLogged = useSelector(selectIsLogged);

  const configMyRendersButton = R2D.config.data.ui.my_renders_button;
  const configMyToursButton = R2D.config.data.ui.my_tours_button;

  const userButton = useRef(null);

  const onEnterDropdown = (e) =>
    isLogged && userButton.current.classList.add(classes.menu_dop_btn_wr_hover);
  const onLeaveDropdown = (e) =>
    isLogged && userButton.current.classList.remove(classes.menu_dop_btn_wr_hover);

  const onTouchStartDropdown = (e) => {
    if (!isLogged || e.target.closest('.' + classes.menu_dop_info_link)) return;
    document.removeEventListener('touchstart', onTouchStartHideDropdown);
    setTimeout(() => document.addEventListener('touchstart', onTouchStartHideDropdown), 100);
    if (!e.target.closest('.' + classes.bar_dropdown_option_wr))
      userButton.current.classList.toggle(classes.menu_dop_btn_wr_hover);
  };

  const onTouchStartHideDropdown = (e) => {
    if (!isLogged || e.target.closest('.' + classes.menu_dop_info_link)) return;
    document
      .querySelector('.' + classes.menu_dop_btn_wr_hover)
      ?.classList.remove(classes.menu_dop_btn_wr_hover);
    document.removeEventListener('touchstart', onTouchStartHideDropdown);
  };

  const projectsShow = async (e) => {
    if (!isLogged) {
      !R2D.config.data.enable_merchant_login
        ? dispatch(setActivePopup({ name: 'login' }))
        : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }));
      return;
    }
    R2D.config.data.my_projects_merchant_logic
      ? R2D.postMessageToParent(JSON.stringify({ action: 'my_projects' }))
      : dispatch(setActivePopup({ name: 'projectsPopup' }));
    dispatch(removeQuickPanelAll());
    planner.mih().unsetActiveObjectProduct();
    planner.mih().changeState(planner.mih().stateMain);
    onTouchStartHideDropdown(e);
  };

  const onLogout = (e) => {
    dispatch(setActivePopup({ name: 'confirm', type: 'logout' }));
    onTouchStartHideDropdown(e);
  };

  const onProfileButtonClick = async (e) => {
    if (e.target.closest('.' + classes.bar_dropdown_option_plan)) return;
    const response = await user.loadProfileData();
    if (response.type == 'error') dispatch(setActivePopup({ name: 'alert', data: response.data }));
    else {
      dispatch(setProfileData(response));
      dispatch(setActivePopup({ name: 'profile' }));
    }
    onTouchStartHideDropdown(e);
  };

  const onRendersButtonClick = (e) => {
    dispatch(removeQuickPanelAll());
    planner.mih().unsetActiveObject();
    onTouchStartHideDropdown(e);
    dispatch(setActivePopup({ name: 'rendersAnd360Popup', data: { type: 'renders' } }));
  };

  const onToursButtonClick = (e) => {
    dispatch(removeQuickPanelAll());
    planner.mih().unsetActiveObject();
    onTouchStartHideDropdown(e);
    dispatch(setActivePopup({ name: 'rendersAnd360Popup', data: { type: '360' } }));
  };

  return isLogged && R2D.config.data.ui.top_user ? (
    <div
      className={classes.menu_dop_btn_wrap}
      ref={userButton}
      onMouseLeave={onLeaveDropdown}
      onMouseEnter={onEnterDropdown}
      onTouchStart={onTouchStartDropdown}
    >
      <div className={classes.menu_dop_btn_wrap_overlay}></div>
      <div className={classes.menu_dop_btn_wr}>
        <div className={classes.menu_dop_btn}>
          <img
            className={classes.menu_dop_btn_icon}
            src="/src_designer/images/icon_profil_active.svg"
          />
        </div>
        <div className={classes.menu_dop_info_wrap}>
          <div className={classes.menu_dop_info_user_name}>
            <HoverComponent hoverText={userData.email}>{userData.name}</HoverComponent>
          </div>

          <div className={classes.menu_dop_info_link}>
            <div className={classes.menu_dop_info_info_link_icon}>
              <img src="/src_designer/images/icon_profil_login.svg" />
            </div>
            {translation['FR_TOURS_TRANS_121']}
            <div
              className={classes.menu_dop_info_link_overlay}
              onClick={onProfileButtonClick}
              onTouchStart={onProfileButtonClick}
            ></div>
            {userData?.plan == 'pro' ? (
              <div className={classes.menu_dop_info_info_link_pro}>
                {translation['PL_PLAN_PRO_TEXT']}
              </div>
            ) : userData?.plan == 'basic' ? (
              <div
                className={classes.menu_dop_info_info_link_basic}
                onClick={(e) => dispatch(setActivePopup({ name: 'payPro', type: 'user' }))}
              >
                {translation['PL_PLAN_BASIC_TEXT']}
              </div>
            ) : (
              <div
                className={classes.menu_dop_info_info_link_free}
                onClick={(e) => dispatch(setActivePopup({ name: 'payPro', type: 'user' }))}
              >
                {translation['FR_TOURS_TRANS_108']}
              </div>
            )}
          </div>
          <div
            className={classes.menu_dop_info_link}
            onClick={projectsShow}
            onTouchStart={projectsShow}
          >
            <div className={classes.menu_dop_info_info_link_icon}>
              <img src="/src_designer/images/profil_menu_bud.svg" />
            </div>
            {translation['FR_TOURS_TRANS_122']}
          </div>
          {configMyRendersButton ? (
            <div
              className={classes.menu_dop_info_link}
              onClick={onRendersButtonClick}
              onTouchStart={onRendersButtonClick}
            >
              <div className={classes.menu_dop_info_info_link_icon}>
                <img src="/src_designer/images/profil_menu_renders.svg" />
              </div>
              {translation['FR_TOURS_TRANS_123']}
            </div>
          ) : null}
          {configMyToursButton ? (
            <div
              className={classes.menu_dop_info_link}
              onClick={onToursButtonClick}
              onTouchStart={onToursButtonClick}
            >
              <div className={classes.menu_dop_info_info_link_icon}>
                <img src="/src_designer/images/profil_menu_360.svg" />
              </div>
              {translation['FR_TOURS_TRANS_152']}
            </div>
          ) : null}
          <div className={classes.menu_dop_info_link} onClick={onLogout} onTouchStart={onLogout}>
            <div className={classes.menu_dop_info_info_link_icon}>
              <img src="/src_designer/images/profil_menu_logout.svg" />
            </div>
            {translation['FR_TOURS_TRANS_115']}
          </div>
        </div>
      </div>
    </div>
  ) : R2D.config.data.ui.top_login ? (
    <div className={classes.menu_dop_btn_wrap}>
      <div className={classes.menu_dop_btn_wr + ' ' + classes.menu_dop_btn_wr_login}>
        <HoverComponent hoverText={translation['FR_TOURS_TRANS_104']} parentRef={userButton}>
          <div
            className={classes.menu_dop_btn}
            onClick={() =>
              !R2D.config.data.enable_merchant_login
                ? dispatch(setActivePopup({ name: 'login' }))
                : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }))
            }
          >
            <svg
              width="21"
              height="15"
              viewBox="0 0 21 15"
              fill="none"
              className={classes.menu_dop_btn_icon}
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.37699 3.54742L3.52441 4.37778L6.18025 6.97534L0.304688 6.97535L0.304688 8.28116L6.14801 8.28116L3.46065 10.869L4.30676 11.706L8.54004 7.62942L8.51178 7.60146L8.51689 7.59648L4.37699 3.54742Z"
                fill="white"
              />
              <path
                d="M20.1777 7.91529V13.9253C20.1777 14.3035 19.8978 14.6277 19.5162 14.6277C18.9915 14.6277 18.6973 14.3305 18.6973 13.9253L18.6971 9.77954C18.6971 9.50928 18.4936 9.26615 18.2136 9.26615C17.9591 9.26615 17.8875 9.48232 17.8875 9.77954V14.4186C17.8875 14.4996 17.8366 14.5537 17.7603 14.5537H12.595C12.5187 14.5537 12.4678 14.4996 12.4678 14.4186V9.77954C12.4678 9.50928 12.4216 9.26615 12.1416 9.26615C11.8871 9.26615 11.6582 9.48232 11.6582 9.77954V13.9253C11.6582 14.3035 11.5155 14.6277 10.8392 14.6277C10.483 14.6277 10.1777 14.3305 10.1777 13.9253V7.91529C10.1777 6.86158 10.9921 5.9969 11.9844 5.9969H18.3456C19.3633 5.9969 20.1776 6.86158 20.1776 7.91529H20.1777ZM15.1906 5.66581C16.6154 5.66581 17.786 4.45004 17.786 2.90991C17.786 1.39694 16.6154 0.181122 15.1906 0.181122C13.7657 0.181122 12.5952 1.39689 12.5952 2.93702C12.5952 4.44999 13.7657 5.66581 15.1906 5.66581Z"
                fill="white"
              />
            </svg>
          </div>
        </HoverComponent>
      </div>
    </div>
  ) : null;
};

export default UserButton;
