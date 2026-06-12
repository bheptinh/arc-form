import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useNavigate } from 'react-router-dom';

import {
  deleteProject,
  projectsInfiniteQueryOptions,
  renameProject,
} from '../api/projects';

const LIMIT = 20;

const useStyles = createUseStyles({
  page: {
    width: '100%',
    height: '100vh',
    backgroundColor: '#EBEBEB',
    display: 'grid',
    gridTemplateRows: 'auto 1fr',
    overflow: 'hidden',
    padding: '38px 0 0',
  },
  top: {
    padding: '0 11%',
    paddingRight: 'calc(11% + 38px)',
    '@media screen and (max-width: 950px)': { padding: 0 },
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    color: '#2F2F2F',
    fontSize: 32,
    fontWeight: 300,
    '@media screen and (max-width: 950px)': { fontSize: 20 },
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  dropdown: {
    position: 'relative',
    height: 26,
    borderRight: '1px solid #C4C4C4',
    '&:hover $dropdownOptions': { transform: 'translateY(0)', pointerEvents: 'all' },
    '&:hover $dropdownActive svg': { transform: 'rotate(180deg)' },
  },
  dropdownActive: {
    boxShadow: '0px 0px 3px 0px rgba(0,0,0,0.12)',
    background: '#fff',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    borderRadius: '3px 0 0 3px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    color: '#2A3435',
    fontSize: 12,
    padding: '0 7px',
    gap: 20,
    transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1)',
    '& svg': { transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1)' },
    '&:hover': { background: '#E9E9E9' },
  },
  dropdownOptionsWrap: {
    position: 'absolute',
    right: -4,
    width: 'calc(100% + 8px)',
    overflow: 'hidden',
    minWidth: 'fit-content',
    pointerEvents: 'none',
    zIndex: 10,
    padding: 4,
    top: 'calc(100% - 4px)',
  },
  dropdownOptions: {
    pointerEvents: 'auto',
    transform: 'translateY(calc(-100% - 15px))',
    transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1)',
    borderRadius: 3,
    overflow: 'hidden',
    boxShadow: '0px 0px 7px 0px rgba(0,0,0,0.15)',
  },
  dropdownOption: {
    background: '#fff',
    cursor: 'pointer',
    height: 30,
    display: 'flex',
    alignItems: 'center',
    fontSize: 12,
    whiteSpace: 'nowrap',
    color: '#2A3435',
    padding: '0 10px',
    transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1)',
    '&:hover': { background: '#E9E9E9' },
  },
  sortBtn: {
    boxShadow: '0px 0px 3px 0px rgba(0,0,0,0.12)',
    background: '#fff',
    cursor: 'pointer',
    borderRadius: '0 3px 3px 0',
    height: 26,
    width: 26,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1)',
    '&:hover': { background: '#E9E9E9' },
  },
  scroll: {
    overflowY: 'auto',
    position: 'relative',
  },
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
  addCard: {
    background: '#fff',
    borderRadius: 6,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 19,
    color: '#2F2F2F',
    cursor: 'pointer',
    minHeight: 304,
    position: 'relative',
    gap: 12,
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 6,
      boxShadow: 'inset 0 0 0 0px #BAE51F',
      transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1)',
      pointerEvents: 'none',
    },
    '&:hover::after': { boxShadow: 'inset 0 0 0 4px #BAE51F' },
  },
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
    '&:hover $cardActions': { opacity: 1, pointerEvents: 'auto' },
  },
  cardImg: {
    height: 181,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '6px 6px 0 0',
    background: '#F5F5F5',
  },
  cardActions: {
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
  },
  actionBtn: {
    cursor: 'pointer',
    position: 'relative',
    '& path': { transition: '0.9s cubic-bezier(0.19,1,0.22,1)' },
    '&:hover path': { fill: '#B8E11F' },
    '&:hover $actionLabel': { opacity: 1 },
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
  },
  cardInfo: { padding: '11px 20px 20px' },
  cardName: {
    color: '#2F2F2F',
    fontSize: 18,
    marginBottom: 10,
  },
  cardMeta: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: 13,
    gap: 6,
    color: '#7B7B7B',
  },
  metaRow: { display: 'flex', alignItems: 'center', gap: 6 },
  renameInput: {
    fontSize: 18,
    color: '#2F2F2F',
    border: 'none',
    borderBottom: '1px solid #BAE51F',
    outline: 'none',
    background: 'transparent',
    width: '100%',
    marginBottom: 10,
  },
  preloader: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(255,255,255,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  loadMore: {
    textAlign: 'center',
    padding: '0 0 40px',
    gridColumn: '1 / -1',
    cursor: 'pointer',
    color: '#2A3435',
    fontSize: 14,
    '&:hover': { textDecoration: 'underline' },
  },
});

export default function ProjectsPage() {
  const classes = useStyles();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery(projectsInfiniteQueryOptions);
  const projects = data?.pages.flatMap((p) => p.items) ?? [];

  const [sortField, setSortField] = useState<'modified' | 'opened'>('modified');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [sortLabel, setSortLabel] = useState('Last updated');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = document.querySelector('.preloader_main') as HTMLElement | null;
    if (el) el.remove();
  }, []);

  useEffect(() => {
    if (renamingId && renameInputRef.current) renameInputRef.current.focus();
  }, [renamingId]);

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectsInfiniteQueryOptions.queryKey }),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameProject(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: projectsInfiniteQueryOptions.queryKey }),
  });

  const sorted = [...projects].sort((a, b) => {
    const va = new Date(a[sortField]).getTime();
    const vb = new Date(b[sortField]).getTime();
    return sortDir === 'asc' ? va - vb : vb - va;
  });

  const handleOpen = (id: string) => navigate(`/project/${id}`);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  const startRename = (e: React.MouseEvent, item: { id: string; name: string }) => {
    e.stopPropagation();
    setRenamingId(item.id);
    setRenameValue(item.name);
  };

  const commitRename = (id: string) => {
    const name = renameValue.trim();
    if (name) renameMutation.mutate({ id, name });
    setRenamingId(null);
  };

  const handleCreateNew = () => navigate('/');

  return (
    <div className={classes.page}>
      <div className={classes.top}>
        <div className={classes.titleRow}>
          <div className={classes.title}>My projects</div>
        </div>
        <div className={classes.filterRow}>
          <div className={classes.dropdown}>
            <div className={classes.dropdownActive}>
              {sortLabel}
              <svg width="11" height="7" fill="none" viewBox="0 0 11 7">
                <path
                  fill="#555"
                  fillRule="evenodd"
                  d="m9.514 1.18.408.414-4.526 4.57-.408-.413.003-.003L.92 1.575l.412-.41L5.4 5.335l4.114-4.154Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className={classes.dropdownOptionsWrap}>
              <div className={classes.dropdownOptions}>
                <div
                  className={classes.dropdownOption}
                  onClick={() => {
                    setSortField('opened');
                    setSortLabel('Created');
                  }}
                >
                  Created
                </div>
                <div
                  className={classes.dropdownOption}
                  onClick={() => {
                    setSortField('modified');
                    setSortLabel('Last updated');
                  }}
                >
                  Last updated
                </div>
              </div>
            </div>
          </div>
          <div
            className={classes.sortBtn}
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
          >
            {sortDir === 'desc' ? (
              <svg width="15" height="11" fill="none" viewBox="0 0 15 11">
                <path
                  fill="#555"
                  d="M1.01 7.737a.48.48 0 0 0-.011.68l2.004 2.012c-.06-.026.044.046 0 0 .059.025.128.115.192.115.065 0 .123-.09.182-.115-.044.046.06-.026 0 0l2.005-2.013a.48.48 0 1 0-.69-.668L3.67 8.802V1.126a.48.48 0 1 0-.96 0v7.675L1.629 7.708c-.089-.091-.15-.104-.278-.106a.48.48 0 0 0-.342.135Zm11.8-3.658a.48.48 0 0 0-.48-.48H7.12a.48.48 0 0 0 0 .96h5.21a.48.48 0 0 0 .48-.48Zm-1.498 2.954a.48.48 0 0 0-.48-.48H7.119a.48.48 0 0 0 0 .96h3.713a.48.48 0 0 0 .48-.48ZM7.12 9.507a.48.48 0 1 0 0 .96h2.215a.48.48 0 0 0 0-.96H7.119ZM13.83.646H7.12a.48.48 0 0 0 0 .96h6.71a.48.48 0 1 0 0-.96Z"
                />
              </svg>
            ) : (
              <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
                <path
                  fill="#555"
                  d="M1.009 3.764a.48.48 0 0 1 .341-.136c.128.002.19.015.278.107l1.081 1.093V1.126a.48.48 0 1 1 .96 0v7.676l1.022-1.064a.48.48 0 1 1 .69.668L3.376 10.42c-.059.026-.118.115-.182.115-.065 0-.134-.09-.193-.115-.044.046.06-.026 0 0L.998 8.406a.48.48 0 0 1 .011-.68v.038Zm11.8 3.658a.48.48 0 0 1-.48.48H7.12a.48.48 0 0 1 0-.96h5.21a.48.48 0 0 1 .48.48Zm-1.498-2.954a.48.48 0 0 1-.48.48H7.119a.48.48 0 0 1 0-.96h3.713a.48.48 0 0 1 .48.48ZM7.12 1.606a.48.48 0 1 1 0-.96h2.215a.48.48 0 0 1 0 .96H7.119ZM13.83 4.56H7.12a.48.48 0 0 1 0-.96h6.71a.48.48 0 1 1 0 .96Z"
                />
              </svg>
            )}
          </div>
        </div>
      </div>

      <div className={classes.scroll}>
        {isLoading && (
          <div className={classes.preloader}>
            <div className="preloader-cube" />
          </div>
        )}
        <div className={classes.grid}>
          <div className={classes.addCard} onClick={handleCreateNew}>
            <svg width="26" height="26" fill="none" viewBox="0 0 26 26">
              <rect width="2.977" height="25" x="11.506" y=".209" fill="#2E3839" rx="1.488" />
              <rect
                width="2.977"
                height="25"
                x="25.494"
                y="11.221"
                fill="#2E3839"
                rx="1.488"
                transform="rotate(90 25.494 11.221)"
              />
            </svg>
            New project
          </div>

          {sorted.map((item) => (
            <div key={item.id} className={classes.card} onClick={() => handleOpen(item.id)}>
              <div className={classes.cardImg}>
                <div className={classes.cardActions}>
                  <div
                    className={classes.actionBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpen(item.id);
                    }}
                  >
                    <svg width="27" height="27" fill="none" viewBox="0 0 27 27">
                      <path
                        fill="#fff"
                        d="M13.5 1a12.5 12.5 0 1 0 0 25A12.5 12.5 0 0 0 13.5 1Zm0 22.727A10.227 10.227 0 1 1 13.5 3.273a10.227 10.227 0 0 1 0 20.454Z"
                      />
                      <path
                        fill="#fff"
                        d="M17.682 12.41 11.5 8.637a1.136 1.136 0 0 0-1.136 1.966v7.546a1.136 1.136 0 0 0 1.136 0l6.182-3.773a1.136 1.136 0 0 0 0-1.966Z"
                      />
                    </svg>
                    <div className={classes.actionLabel}>Open</div>
                  </div>
                  <div className={classes.actionBtn} onClick={(e) => startRename(e, item)}>
                    <svg width="27" height="27" fill="none" viewBox="0 0 27 27">
                      <path
                        fill="#fff"
                        fillRule="evenodd"
                        d="M22.733 26.164V.45h2.005v25.712h-2.005Zm-1.629-25.758h5.271V2.41h-5.271V.406Zm-.035 24.274h5.27v2.006h-5.27v-2.005Zm-.01-20.93H.859v19.114h20.2v-1.607H2.466v-15.9H21.06V3.748Zm2.26 19.114h.001V3.75h-.002v19.115Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className={classes.actionLabel}>Rename</div>
                  </div>
                  <div className={classes.actionBtn} onClick={(e) => handleDelete(e, item.id)}>
                    <svg width="24" height="31" viewBox="0 0 13 17" fill="none">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M5.105.164h2.4v1.44h-2.4V.164Z"
                        fill="#fff"
                      />
                      <path
                        d="M0.305 2.084c3.944-.947 8.056-.947 12 0v.96H.305v-.96Z"
                        fill="#fff"
                      />
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M10.866 3.523H1.266V15.725c0 .418.338.758.754.758h8.571c.416 0 .754-.34.754-.758V3.523h-.48ZM9.907 5.204a.72.72 0 1 0-1.44 0v8.16a.72.72 0 1 0 1.44 0V5.204Zm-3.12-1.44a.72.72 0 0 1 .72.72v8.16a.72.72 0 0 1-1.44 0V4.484a.72.72 0 0 1 .72-.72Zm-2.64 1.44a.72.72 0 1 0-1.44 0v8.16a.72.72 0 1 0 1.44 0V5.204Z"
                        fill="#fff"
                      />
                    </svg>
                    <div className={classes.actionLabel}>Delete</div>
                  </div>
                </div>
              </div>
              <div className={classes.cardInfo}>
                {renamingId === item.id ? (
                  <input
                    ref={renameInputRef}
                    className={classes.renameInput}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onBlur={() => commitRename(item.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename(item.id);
                      if (e.key === 'Escape') setRenamingId(null);
                    }}
                  />
                ) : (
                  <div className={classes.cardName}>{item.name || 'Unnamed'}</div>
                )}
                <div className={classes.cardMeta}>
                  <div className={classes.metaRow}>
                    <span>Modified:</span> {item.modified?.substring(0, 10)}
                  </div>
                  {item.opened?.substring(0, 10) !== '0000-00-00' && (
                    <div className={classes.metaRow}>
                      <span>Created:</span> {item.opened?.substring(0, 10)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {hasNextPage && (
            <div className={classes.loadMore} onClick={() => fetchNextPage()}>
              Load more
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
