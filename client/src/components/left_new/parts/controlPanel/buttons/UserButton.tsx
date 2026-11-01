import { IconUser } from '@tabler/icons-react';
import React, { useEffect, useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from '../../../../../api/hooks/useTranslation';
import { planner } from '../../../../../initR2D';
import { updateIsProjectBelongToLoggedUser } from '../../../../../redux/features/common/commonSlice';
import { confirm } from '../../../../../shared-components/ConfirmDialog';
import { removeQuickPanelAll } from '../../../../../redux/features/quickPanels/quickPanelsSlice';
import {
  selectIsLogged,
  selectUserProfileData,
  userLogout,
} from '../../../../../redux/features/user/userSlice';
import HoverComponent from '../components/HoverComponent';
import { useMerchantLogin } from '../../../../../utils/useMerchantLogin';

const useStyle = createUseStyles({
  menu_dop_btn_wrap: {
    height: '38px',
    width: '30px',
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
      fill: 'var(--color-white)',
    },
  },
  menu_dop_btn_wr_login: {
    pointerEvents: 'auto',
  },
  menu_dop_btn: {
    borderTop: '1px solid #555555',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    background: 'var(--color-slate)',
    position: 'relative',
    zIndex: 3,
    height: '100%',
    transition: 'background .9s cubic-bezier(.19,1,.22,1)',
    '&:hover': {
      background: '#4E5455',
      '& path': {
        fill: 'var(--color-accent-soft)',
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
    bottom: 0,
    zIndex: 2,
    transform: 'translateX(-102%)',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  menu_dop_info_link: {
    background: 'var(--color-slate)',
    height: '34px',
    display: 'flex',
    alignItems: 'center',
    color: 'var(--color-white)',
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
    background: 'var(--color-slate)',
    height: '37px',
    display: 'flex',
    alignItems: 'center',
    color: 'var(--color-white)',
    whiteSpace: 'nowrap',
    paddingRight: '13px',
    fontSize: '12px',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    borderBottom: '1px solid #555555',
    cursor: 'default',
    paddingLeft: 15,
  },
});

const UserButton = (props) => {
  const dispatch = useDispatch();
  const verifyEnabledMerchantLogin = useMerchantLogin();
  const navigate = useNavigate();
  const classes = useStyle();
  const userData = useSelector(selectUserProfileData);
  const translation = useTranslation();

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
      verifyEnabledMerchantLogin();
      return;
    }
    R2D.config.data.my_projects_merchant_logic
      ? R2D.postMessageToParent(JSON.stringify({ action: 'my_projects' }))
      : navigate('/projects');
    dispatch(removeQuickPanelAll());
    planner.mih().unsetActiveObjectProduct();
    planner.mih().changeState(planner.mih().stateMain);
    onTouchStartHideDropdown(e);
  };

  const onLogout = async (e) => {
    onTouchStartHideDropdown(e);
    const ok = await confirm('Are you sure you want to log out?');
    if (ok) {
      dispatch(userLogout());
      planner.scene.setIsProjectBelongToLoggedUserStatus(false);
      dispatch(updateIsProjectBelongToLoggedUser(false));
    }
  };

  const onProfileButtonClick = (e) => {
    if (e.target.closest('.' + classes.bar_dropdown_option_plan)) return;
    dispatch(removeQuickPanelAll());
    planner.mih().unsetActiveObject();
    onTouchStartHideDropdown(e);
    navigate('/profile');
  };

  const onRendersButtonClick = (e) => {
    dispatch(removeQuickPanelAll());
    planner.mih().unsetActiveObject();
    onTouchStartHideDropdown(e);
    navigate('/renders');
  };

  const onToursButtonClick = (e) => {
    dispatch(removeQuickPanelAll());
    planner.mih().unsetActiveObject();
    onTouchStartHideDropdown(e);
    navigate('/tours');
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
              verifyEnabledMerchantLogin()
            }
          >
            <IconUser size={16} className={classes.menu_dop_btn_icon} />
          </div>
        </HoverComponent>
      </div>
    </div>
  ) : null;
};

export default UserButton;
