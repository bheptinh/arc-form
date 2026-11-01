import { IconLogout, IconUser } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, Outlet } from 'react-router-dom';

import { useTranslation } from '../../api/hooks/useTranslation';
import { selectPopups } from '../../redux/features/popups/popupsSlice';
import { userLogout } from '../../redux/features/user/userSlice';
import { confirm } from '../../shared-components/ConfirmDialog';
import AlertPopup from '../popups/alert-popup';
import CompleteMessage from '../popups/complete-message';
import DeleteAccountPopup from '../popups/delete-account-popup';
import LoadingMessagePopup from '../popups/loading-message';
import UpdatePassword from '../popups/update-password';
import classes from './page-layout.module.css';

const NAV_ITEMS = [
  { to: '/projects', labelKey: 'TEXT_MY_PLANS' },
  { to: '/renders', labelKey: 'TEXT_MY_RENDERS' },
  { to: '/tours', labelKey: 'TEXT_MY_TOURS' },
];

export default function PageLayout() {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);

  useEffect(() => {
    const el = document.querySelector('.preloader_main') as HTMLElement | null;
    if (el) el.remove();
  }, []);

  const handleLogout = async () => {
    const ok = await confirm('Are you sure you want to log out?');
    if (!ok) return;
    await dispatch(userLogout());
    window.location.assign(`${R2D.URL.REACT_BASEPATH}/projects`);
  };

  return (
    <div className={classes.layout}>
      <header className={classes.header}>
        <Link to="/projects" className={classes.brand}>
          ArcForm
        </Link>
        <nav className={classes.nav}>
          {NAV_ITEMS.map(({ to, labelKey }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? `${classes.link} ${classes.linkActive}` : classes.link
              }
            >
              {translation[labelKey]}
            </NavLink>
          ))}
        </nav>
        <div className={classes.account}>
          <NavLink
            to="/profile"
            aria-label={translation['FR_TOURS_TRANS_121']}
            className={({ isActive }) =>
              isActive ? `${classes.accountBtn} ${classes.linkActive}` : classes.accountBtn
            }
          >
            <IconUser size={20} />
            <span className={classes.accountLabel}>{translation['FR_TOURS_TRANS_121']}</span>
          </NavLink>
          <button
            type="button"
            className={classes.accountBtn}
            aria-label={translation['FR_TOURS_TRANS_115']}
            onClick={handleLogout}
          >
            <IconLogout size={20} />
            <span className={classes.accountLabel}>{translation['FR_TOURS_TRANS_115']}</span>
          </button>
        </div>
      </header>
      <Outlet />

      {popups.updatePassword.status && <UpdatePassword />}
      {popups.deleteAccountPopup.status && <DeleteAccountPopup />}
      {popups.loadingMessage.status && <LoadingMessagePopup />}
      {popups.completeMessage.status && <CompleteMessage />}
      {popups.alert.status && <AlertPopup />}
    </div>
  );
}
