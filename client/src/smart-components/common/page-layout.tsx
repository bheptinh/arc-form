import { createUseStyles } from 'react-jss';
import { Link, NavLink, Outlet } from 'react-router-dom';

import { useTranslation } from '../../api/hooks/useTranslation';

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
});

export default function PageLayout() {
  const classes = useStyles();
  const translation = useTranslation();

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
      </header>
      <Outlet />
    </div>
  );
}
