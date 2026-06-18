import { IconForms, IconLogin2, IconPlus, IconTrash } from '@tabler/icons-react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useNavigate } from 'react-router-dom';

import { deleteProject, projectsInfiniteQueryOptions, renameProject } from '../api/projects';
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

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery(
    projectsInfiniteQueryOptions
  );
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
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: projectsInfiniteQueryOptions.queryKey }),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameProject(id, name),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: projectsInfiniteQueryOptions.queryKey }),
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
          onOptionSelect={(opt) => {
            setSortField(opt.value as 'modified' | 'opened');
            setSortLabel(opt.label);
          }}
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
            <IconPlus size={26} color="#2E3839" />
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
                  icon: <IconLogin2 size={26} color="#ffffff" />,
                  label: 'Open',
                  onClick: () => handleOpen(item.id),
                },
                {
                  icon: <IconForms size={26} color="#fff" />,
                  label: 'Rename',
                  onClick: (e) => startRename(e, item),
                },
                {
                  icon: <IconTrash size={26} color="#fff" />,
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
