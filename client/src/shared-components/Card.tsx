import { MouseEvent, ReactNode } from 'react';
import { createUseStyles } from 'react-jss';

type Action = {
  icon: ReactNode;
  label: string;
  onClick: (e: MouseEvent) => void;
};

type Props = {
  name: string;
  preview?: string;
  modified?: string;
  created?: string;
  userPlan?: string;
  actions: Action[];
  onClick?: () => void;
  nameContent?: ReactNode;
  className?: string;
};

const useStyles = createUseStyles({
  card: {
    background: '#fff',
    borderRadius: 6,
    position: 'relative',
    cursor: 'pointer',
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 6,
      boxShadow: 'inset 0 0 0 0px #BAE51F',
      transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1)',
      pointerEvents: 'none',
      zIndex: 1,
    },
    '&:hover::after': { boxShadow: 'inset 0 0 0 4px #BAE51F' },
    '&:hover $actions': { opacity: 1, pointerEvents: 'auto' },
    '@media screen and (max-width: 950px)': {
      '& $actions': { opacity: 1, pointerEvents: 'all' },
    },
  },
  imgWrap: {
    height: 181,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '6px 6px 0 0',
    background: '#F5F5F5',
    '@media screen and (max-width: 950px)': { height: 'auto', display: 'block' },
  },
  img: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'cover',
    '@media screen and (max-width: 950px)': { height: 108, margin: 'auto', display: 'block' },
  },
  actions: {
    position: 'absolute',
    inset: 0,
    borderRadius: '6px 6px 0 0',
    background: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '0 10px',
    opacity: 0,
    pointerEvents: 'none',
    transition: '0.9s cubic-bezier(0.19,1,0.22,1)',
    '@media screen and (max-width: 950px)': {
      position: 'relative',
      height: 'auto',
      opacity: 1,
      pointerEvents: 'all',
      borderRadius: 0,
      padding: '5px 2px',
    },
  },
  actionBtn: {
    cursor: 'pointer',
    position: 'relative',
    '& path': { transition: '0.9s cubic-bezier(0.19,1,0.22,1)' },
    '&:hover path': { fill: '#B8E11F' },
    '&:hover $actionLabel': { opacity: 1 },
    '@media screen and (max-width: 950px)': {
      width: 15,
      height: 20,
      '& svg': { maxWidth: '100%', maxHeight: '100%' },
    },
  },
  actionLabel: {
    position: 'absolute',
    top: 'calc(100% + 2px)',
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#B8E11F',
    opacity: 0,
    fontSize: 12,
    whiteSpace: 'nowrap',
    transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1)',
    '@media screen and (max-width: 950px)': { display: 'none' },
  },
  info: {
    padding: '11px 20px 20px',
    '@media screen and (max-width: 950px)': { padding: 10 },
  },
  name: {
    color: '#2F2F2F',
    fontSize: 18,
    marginBottom: 10,
    '@media screen and (max-width: 950px)': { fontSize: 12, marginBottom: 5 },
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: 13,
    color: '#7B7B7B',
    '& span': { margin: '0 5px 0 8px' },
    '@media screen and (max-width: 950px)': { fontSize: 11 },
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 6,
  },
  planBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    textTransform: 'uppercase',
    border: '1px solid #9AA3A4',
    color: '#9AA3A4',
    borderRadius: 3,
    padding: '1px 4px',
    fontSize: 14,
    '@media screen and (max-width: 950px)': { fontSize: 9 },
  },
});

export function Card({ name, preview, modified, created, userPlan, actions, onClick, nameContent, className }: Props) {
  const classes = useStyles();
  const rootClass = [classes.card, className].filter(Boolean).join(' ');

  return (
    <div className={rootClass} onClick={onClick}>
      <div className={classes.imgWrap}>
        <img
          className={classes.img}
          src={preview || '/src_designer/images/no_preview_image.png'}
          alt=""
        />
        <div className={classes.actions}>
          {actions.map(({ icon, label, onClick: onAction }) => (
            <div
              key={label}
              className={classes.actionBtn}
              onClick={(e) => { e.stopPropagation(); onAction(e); }}
            >
              {icon}
              <div className={classes.actionLabel}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className={classes.info}>
        {nameContent ?? <div className={classes.name}>{name || 'Unnamed'}</div>}
        <div className={classes.meta}>
          {modified && (
            <div className={classes.metaRow}>
              <svg width="17" height="16" fill="none" viewBox="0 0 17 16">
                <path
                  fill="#7B7B7B"
                  fillRule="evenodd"
                  d="m3.306 15.27-.879-.012-.047-4.275h.006v-.03l4.338.082.005.88-3.461-.066.038 3.42Z"
                  clipRule="evenodd"
                />
                <path
                  fill="#7B7B7B"
                  fillRule="evenodd"
                  d="M7.502 1.078a7.382 7.382 0 0 0-2.191.981L6 2.973a6.246 6.246 0 0 1 1.773-.785l-.27-1.11Zm1.243.931A6.278 6.278 0 1 1 3.8 11.102l-1.263-.015a7.422 7.422 0 0 0 14.279-2.833A7.42 7.42 0 0 0 8.754.862l-.009 1.147Zm-4.73 1.137.966.645a6.287 6.287 0 0 0-1.405 2.105l-1.04-.473a7.4 7.4 0 0 1 1.479-2.277ZM2.104 6.877l1.117.239a6.315 6.315 0 0 0 .06 2.565H2.114a7.457 7.457 0 0 1-.01-2.804Z"
                  clipRule="evenodd"
                />
                <path fill="#7B7B7B" d="M8.816 3.229h1.427v5.137H8.816z" />
                <path fill="#7B7B7B" d="m13.45 10.876-1.008 1.01-3.633-3.633 1.01-1.01z" />
              </svg>
              <span>Modified:</span>
              {modified.substring(0, 10)}
            </div>
          )}
          {created && created.substring(0, 10) !== '0000-00-00' && (
            <div className={classes.metaRow}>
              <svg width="16" height="17" fill="none" viewBox="0 0 16 17">
                <path
                  fill="#7B7B7B"
                  d="M.385 4.706a3.018 3.018 0 0 1 3.014-2.828h.777v-.603a.604.604 0 0 1 1.207 0v.603h4.827v-.603a.603.603 0 0 1 1.207 0v.603h.777a3.018 3.018 0 0 1 3.014 2.828 74.009 74.009 0 0 1-.01 8.992 3.021 3.021 0 0 1-2.823 2.824 73.783 73.783 0 0 1-9.156 0 3.021 3.021 0 0 1-2.823-2.824 74.006 74.006 0 0 1-.011-8.992ZM1.6 13.623a1.812 1.812 0 0 0 1.694 1.694c2.987.186 6.018.186 9.006 0a1.812 1.812 0 0 0 1.693-1.694c.142-2.303.174-4.61.096-6.917H1.504a72.905 72.905 0 0 0 .096 6.917Zm9.214-9.33a.604.604 0 0 1-.604-.604v-.604H5.383v.604a.603.603 0 1 1-1.207 0v-.604h-.777a1.81 1.81 0 0 0-1.81 1.693c-.013.24-.02.481-.031.721h12.477c-.012-.24-.018-.48-.032-.72a1.81 1.81 0 0 0-1.81-1.694h-.775v.604a.604.604 0 0 1-.604.603Z"
                />
                <path
                  fill="#7B7B7B"
                  d="M10.813 10.327a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm-3.015 0a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm3.015 3.018a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm-6.035-3.018a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm0 3.018a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Zm3.02 0a.905.905 0 1 1 0-1.81.905.905 0 0 1 0 1.81Z"
                />
              </svg>
              <span>Created:</span>
              {created.substring(0, 10)}
            </div>
          )}
        </div>
      </div>
      {userPlan && userPlan !== 'free' && (
        <div className={classes.planBadge}>{userPlan}</div>
      )}
    </div>
  );
}
