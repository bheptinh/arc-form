import {
  IconCalendarMonth,
  IconDownload,
  IconFileSymlink,
  IconRotateClockwise2,
  IconTrash,
} from '@tabler/icons-react';
import { createUseStyles } from 'react-jss';

import { useTranslation } from '../../api/hooks/useTranslation';
import type { Render } from '../../api/renders';

type Props = {
  renders: Render[];
  onOpen: (renderId: string, type: string, actions?: { open: { link: string } }) => void;
  onDownload: (renderId: string) => void;
  onDelete: (renderId: string) => void;
  onReload: (renderId: string) => void;
  hasMore?: boolean;
  onLoadMore?: () => void;
};

const IN_PROGRESS = new Set(['waiting', 'created', 'rendering', 'taken', 'start', 'finished']);

const useStyles = createUseStyles({
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, calc(25% - 29px))',
    gridGap: 38,
    padding: '0 11% 70px',
    '@media screen and (max-width: 1250px)': { gridTemplateColumns: 'repeat(3, calc(33% - 22px))' },
    '@media screen and (max-width: 950px)': {
      padding: '0 0 14px',
      gridGap: 10,
      gridTemplateColumns: 'repeat(3, calc(33% - 5px))',
    },
  },
  card: {
    background: 'var(--color-white)',
    borderRadius: 6,
    position: 'relative',
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 6,
      boxShadow: 'inset 0 0 0 0px var(--color-accent)',
      transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1)',
      pointerEvents: 'none',
      zIndex: 1,
    },
    '&:hover::after': { boxShadow: 'inset 0 0 0 4px var(--color-accent)' },
    '&:hover $actions': { opacity: 1, pointerEvents: 'auto' },
    '@media screen and (max-width: 950px)': {
      '& $actions': { opacity: 1, pointerEvents: 'all' },
    },
  },
  cardError: {
    '&::after': { boxShadow: 'inset 0 0 0 4px #ff3333 !important' },
  },
  imgWrap: {
    height: 181,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
    '&:hover path': { fill: 'var(--color-accent-soft)' },
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
    color: 'var(--color-accent-soft)',
    fontSize: 12,
    opacity: 0,
    whiteSpace: 'nowrap',
    transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1)',
    '@media screen and (max-width: 950px)': { display: 'none' },
  },
  progressOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: '6px 6px 0 0',
    background: 'rgba(0,0,0,0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 10px',
  },
  progressText: { color: 'var(--color-white)' },
  info: {
    padding: '11px 20px 20px',
    '@media screen and (max-width: 950px)': { padding: 10 },
  },
  name: {
    color: 'var(--color-text)',
    fontSize: 18,
    marginBottom: 10,
    '@media screen and (max-width: 950px)': { fontSize: 12, marginBottom: 5 },
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: 13,
    color: 'var(--color-text-subtle)',
    '@media screen and (max-width: 950px)': { fontSize: 11 },
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 6,
    '& span': { margin: '0 5px 0 8px' },
  },
  errorText: {
    color: '#ff3333',
    fontSize: 13,
  },
  loadMore: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '0 0 40px',
    cursor: 'pointer',
    color: 'var(--color-text-slate)',
    fontSize: 14,
    '&:hover': { textDecoration: 'underline' },
  },
});

export function RendersGrid({
  renders,
  onOpen,
  onDownload,
  onDelete,
  onReload,
  hasMore,
  onLoadMore,
}: Props) {
  const classes = useStyles();
  const translation = useTranslation();

  return (
    <div className={classes.grid}>
      {renders
        .filter((r) => r.status !== 'deleted')
        .map((item) => {
          const d = new Date(item.created * 1000);
          const createdFormatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

          return (
            <div
              key={item.id}
              className={`${classes.card}${item.status === 'error' ? ` ${classes.cardError}` : ''}`}
            >
              <div className={classes.imgWrap}>
                <img
                  className={classes.img}
                  src={
                    item.preview
                      ? `${R2D.URL.DOMAIN}${item.preview}`
                      : '/src_designer/images/no_preview_image.png'
                  }
                  alt=""
                />

                {item.status === 'stored' && (
                  <div className={classes.actions}>
                    <div
                      className={classes.actionBtn}
                      onClick={() => onOpen(item.renderId, item.type, item.actions)}
                    >
                      <IconFileSymlink size={25} color="#fff" />
                      <div className={classes.actionLabel}>
                        {translation['BUTTON_OPEN_PLAN']}
                      </div>
                    </div>
                    <div className={classes.actionBtn} onClick={() => onDownload(item.renderId)}>
                      <IconDownload size={25} color="#fff" />
                      <div className={classes.actionLabel}>
                        {translation['BUTTON_DOWNLOAD_RENDER']}
                      </div>
                    </div>
                    <div className={classes.actionBtn} onClick={() => onDelete(item.renderId)}>
                      <IconTrash size={25} color="#AF3131" />
                      <div className={classes.actionLabel}>
                        {translation['BUTTON_DELETE_PLAN']}
                      </div>
                    </div>
                  </div>
                )}

                {item.status === 'error' && (
                  <div className={classes.actions}>
                    <div className={classes.actionBtn} onClick={() => onReload(item.renderId)}>
                      <IconRotateClockwise2 size={25} color="#fff" />
                      <div className={classes.actionLabel}>
                        {translation['BUTTON_RELOAD_RENDER']}
                      </div>
                    </div>
                    <div className={classes.actionBtn} onClick={() => onDelete(item.renderId)}>
                      <IconTrash size={25} color="#AF3131" />
                      <div className={classes.actionLabel}>
                        {translation['BUTTON_DELETE_PLAN']}
                      </div>
                    </div>
                  </div>
                )}

                {IN_PROGRESS.has(item.status) && (
                  <div className={classes.progressOverlay}>
                    <p className={classes.progressText}>
                      {item.status === 'waiting'
                        ? translation['TEXT_RENDER_WAITING']
                        : translation['TEXT_RENDER_IN_PROGRESS']}
                    </p>
                  </div>
                )}
              </div>

              <div className={classes.info}>
                <div className={classes.name}>{item.type}</div>
                <div className={classes.meta}>
                  {item.status === 'error' ? (
                    <div className={classes.errorText}>{translation['TEXT_RENDER_ERROR']}</div>
                  ) : (
                    <div className={classes.metaRow}>
                      <IconCalendarMonth size={16} color="#7B7B7B" />
                      <span>Created:</span>
                      {createdFormatted}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

      {hasMore && (
        <div className={classes.loadMore} onClick={onLoadMore}>
          Load more
        </div>
      )}
    </div>
  );
}
