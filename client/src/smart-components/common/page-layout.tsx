import { IconLogout, IconUser } from '@tabler/icons-react';
import { createUseStyles } from 'react-jss';
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

const NAV_ITEMS = [
  { to: '/projects', labelKey: 'TEXT_MY_PLANS' },
  { to: '/renders', labelKey: 'TEXT_MY_RENDERS' },
  { to: '/tours', labelKey: 'TEXT_MY_TOURS' },
];

const useStyles = createUseStyles({
  layout: {
    height: '100vh',
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
  },
  header: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 48,
    height: 56,
    padding: '0 11%',
    backgroundColor: '#fff',
    boxShadow: '0 1px 0 rgba(0, 0, 0, 0.08)',
    position: 'relative',
    zIndex: 1,
    '@media screen and (max-width: 950px)': { gap: 20, padding: '0 12px' },
  },
  brand: {
    alignSelf: 'center',
    color: '#2F2F2F',
    fontSize: 20,
    fontWeight: 500,
    textDecoration: 'none',
    '@media screen and (max-width: 950px)': { display: 'none' },
  },
  nav: {
    display: 'flex',
    gap: 32,
    flex: 1,
    minWidth: 0,
    overflowX: 'auto',
    '@media screen and (max-width: 950px)': { gap: 20 },
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    color: '#5F6566',
    fontSize: 15,
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    '&:hover': { color: '#2F2F2F' },
    '&:focus-visible': { outline: '2px solid #2F2F2F', outlineOffset: -2 },
  },
  linkActive: {
    color: '#2F2F2F',
    boxShadow: 'inset 0 -4px 0 #BAE51F',
  },
  account: {
    display: 'flex',
    gap: 20,
  },
  accountBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    border: 'none',
    background: 'none',
    color: '#5F6566',
    fontSize: 15,
    fontFamily: 'inherit',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    '&:hover': { color: '#2F2F2F' },
    '&:focus-visible': { outline: '2px solid #2F2F2F', outlineOffset: -2 },
  },
  accountLabel: {
    '@media screen and (max-width: 950px)': { display: 'none' },
  },
});

export default function PageLayout() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);

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
