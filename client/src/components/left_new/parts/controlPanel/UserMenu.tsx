import { IconUser } from '@tabler/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { useTranslation } from '../../../../api/hooks/useTranslation';
import { planner } from '../../../../initR2D';
import { updateIsProjectBelongToLoggedUser } from '../../../../redux/features/common/commonSlice';
import { removeQuickPanelAll } from '../../../../redux/features/quickPanels/quickPanelsSlice';
import {
  selectIsLogged,
  selectUserProfileData,
  userLogout,
} from '../../../../redux/features/user/userSlice';
import { confirm } from '../../../../shared-components/ConfirmDialog';
import IconButton from '../../../../shared-components/inputs/icon-button';
import Menu from '../../../../shared-components/Menu';
import Tooltip from '../../../../shared-components/Tooltip';
import { useMerchantLogin } from '../../../../utils/useMerchantLogin';
import classes from './control-panel.module.css';

const UserMenu = () => {
  const dispatch = useDispatch();
  const verifyEnabledMerchantLogin = useMerchantLogin();
  const navigate = useNavigate();
  const userData = useSelector(selectUserProfileData);
  const translation = useTranslation();
  const isLogged = useSelector(selectIsLogged);

  const goTo = (path: string) => {
    dispatch(removeQuickPanelAll());
    planner.mih().unsetActiveObject();
    navigate(path);
  };

  const projectsShow = () => {
    R2D.config.data.my_projects_merchant_logic
      ? R2D.postMessageToParent(JSON.stringify({ action: 'my_projects' }))
      : navigate('/projects');
    dispatch(removeQuickPanelAll());
    planner.mih().unsetActiveObjectProduct();
    planner.mih().changeState(planner.mih().stateMain);
  };

  const onLogout = async () => {
    const ok = await confirm('Are you sure you want to log out?');
    if (ok) {
      dispatch(userLogout());
      planner.scene.setIsProjectBelongToLoggedUserStatus(false);
      dispatch(updateIsProjectBelongToLoggedUser(false));
    }
  };

  if (isLogged && R2D.config.data.ui.top_user)
    return (
      <Menu
        className={classes.menu}
        align="end"
        trigger={
          <IconButton
            variant="dark"
            hideTooltip
            className={classes.user}
            icon={<img src="/src_designer/images/icon_profil_active.svg" />}
            label={userData.name}
          />
        }
        header={
          <Tooltip content={userData.email}>
            <span>{userData.name}</span>
          </Tooltip>
        }
        items={[
          {
            icon: <img src="/src_designer/images/icon_profil_login.svg" />,
            label: translation['FR_TOURS_TRANS_121'],
            onSelect: () => goTo('/profile'),
          },
          {
            icon: <img src="/src_designer/images/profil_menu_bud.svg" />,
            label: translation['FR_TOURS_TRANS_122'],
            onSelect: projectsShow,
          },
          {
            icon: <img src="/src_designer/images/profil_menu_renders.svg" />,
            label: translation['FR_TOURS_TRANS_123'],
            onSelect: () => goTo('/renders'),
            visible: R2D.config.data.ui.my_renders_button,
          },
          {
            icon: <img src="/src_designer/images/profil_menu_360.svg" />,
            label: translation['FR_TOURS_TRANS_152'],
            onSelect: () => goTo('/tours'),
            visible: R2D.config.data.ui.my_tours_button,
          },
          {
            icon: <img src="/src_designer/images/profil_menu_logout.svg" />,
            label: translation['FR_TOURS_TRANS_115'],
            onSelect: onLogout,
          },
        ]}
      />
    );

  if (R2D.config.data.ui.top_login)
    return (
      <IconButton
        variant="dark"
        className={classes.user}
        icon={<IconUser size={16} />}
        label={translation['FR_TOURS_TRANS_104']}
        tooltipSide="right"
        onClick={() => verifyEnabledMerchantLogin()}
      />
    );

  return null;
};

export default UserMenu;
