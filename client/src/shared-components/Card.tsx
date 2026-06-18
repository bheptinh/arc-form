import { IconCalendarMonth, IconClock } from '@tabler/icons-react';
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

export function Card({
  name,
  preview,
  modified,
  created,
  userPlan,
  actions,
  onClick,
  nameContent,
  className,
}: Props) {
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
              onClick={(e) => {
                e.stopPropagation();
                onAction(e);
              }}
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
              <IconClock size={16} color="#7B7B7B" />

              <span>Modified:</span>
              {modified.substring(0, 10)}
            </div>
          )}
          {created && created.substring(0, 10) !== '0000-00-00' && (
            <div className={classes.metaRow}>
              <IconCalendarMonth size={16} color="#7B7B7B" />
              <span>Created:</span>
              {created.substring(0, 10)}
            </div>
          )}
        </div>
      </div>
      {userPlan && userPlan !== 'free' && <div className={classes.planBadge}>{userPlan}</div>}
    </div>
  );
}
