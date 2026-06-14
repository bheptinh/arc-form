import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useNavigate } from 'react-router-dom';

import {
  deleteProject,
  projectsInfiniteQueryOptions,
  renameProject,
} from '../api/projects';
import { Card } from '../shared-components/Card';
import { SortBar } from '../shared-components/SortBar';

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
        <SortBar
          options={[
            { value: 'opened', label: 'Created' },
            { value: 'modified', label: 'Last updated' },
          ]}
          activeLabel={sortLabel}
          direction={sortDir}
          onOptionSelect={(opt) => { setSortField(opt.value as 'modified' | 'opened'); setSortLabel(opt.label); }}
          onDirectionToggle={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
        />
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
            <Card
              key={item.id}
              name={item.name}
              modified={item.modified}
              created={item.opened}
              userPlan={item.userPlan}
              onClick={() => handleOpen(item.id)}
              nameContent={
                renamingId === item.id ? (
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
                ) : undefined
              }
              actions={[
                {
                  icon: (
                    <svg width="27" height="27" fill="none" viewBox="0 0 27 27">
                      <path fill="#fff" d="M13.5 1a12.5 12.5 0 1 0 0 25A12.5 12.5 0 0 0 13.5 1Zm0 22.727A10.227 10.227 0 1 1 13.5 3.273a10.227 10.227 0 0 1 0 20.454Z" />
                      <path fill="#fff" d="M17.682 12.41 11.5 8.637a1.136 1.136 0 0 0-1.136 1.966v7.546a1.136 1.136 0 0 0 1.136 0l6.182-3.773a1.136 1.136 0 0 0 0-1.966Z" />
                    </svg>
                  ),
                  label: 'Open',
                  onClick: () => handleOpen(item.id),
                },
                {
                  icon: (
                    <svg width="27" height="27" fill="none" viewBox="0 0 27 27">
                      <path fill="#fff" fillRule="evenodd" d="M22.733 26.164V.45h2.005v25.712h-2.005Zm-1.629-25.758h5.271V2.41h-5.271V.406Zm-.035 24.274h5.27v2.006h-5.27v-2.005Zm-.01-20.93H.859v19.114h20.2v-1.607H2.466v-15.9H21.06V3.748Zm2.26 19.114h.001V3.75h-.002v19.115Z" clipRule="evenodd" />
                    </svg>
                  ),
                  label: 'Rename',
                  onClick: (e) => startRename(e, item),
                },
                {
                  icon: (
                    <svg width="24" height="31" viewBox="0 0 13 17" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M5.105.164h2.4v1.44h-2.4V.164Z" fill="#fff" />
                      <path d="M0.305 2.084c3.944-.947 8.056-.947 12 0v.96H.305v-.96Z" fill="#fff" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M10.866 3.523H1.266V15.725c0 .418.338.758.754.758h8.571c.416 0 .754-.34.754-.758V3.523h-.48ZM9.907 5.204a.72.72 0 1 0-1.44 0v8.16a.72.72 0 1 0 1.44 0V5.204Zm-3.12-1.44a.72.72 0 0 1 .72.72v8.16a.72.72 0 0 1-1.44 0V4.484a.72.72 0 0 1 .72-.72Zm-2.64 1.44a.72.72 0 1 0-1.44 0v8.16a.72.72 0 1 0 1.44 0V5.204Z" fill="#fff" />
                    </svg>
                  ),
                  label: 'Delete',
                  onClick: (e) => handleDelete(e, item.id),
                },
              ]}
            />
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
