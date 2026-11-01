import {
  IconCopy,
  IconForms,
  IconLogin2,
  IconPlus,
  IconRestore,
  IconShare,
  IconTrash,
} from '@tabler/icons-react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  archivedProjectsInfiniteQueryOptions,
  deleteProject,
  type Project,
  projectsInfiniteQueryOptions,
  renameProject,
  setProjectArchived,
} from '../api/projects';
import { selectPopups, setActivePopup } from '../redux/features/popups/popupsSlice';
import { Card } from '../shared-components/Card';
import { confirm } from '../shared-components/ConfirmDialog';
import { SortBar } from '../shared-components/SortBar';
import ProjectSetNamePopup from '../smart-components/popups/project-set-name-popup';
import SharePopup from '../smart-components/popups/share-popup';

const useStyles = createUseStyles({
  page: {
    width: '100%',
    height: '100%',
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
    color: 'var(--color-text)',
    fontSize: 32,
    fontWeight: 300,
    '@media screen and (max-width: 950px)': { fontSize: 20 },
  },
  titleLink: {
    color: 'var(--color-text-slate)',
    fontSize: 14,
    '&:hover': { textDecoration: 'underline' },
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
    background: 'var(--color-white)',
    borderRadius: 6,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: 19,
    color: 'var(--color-text)',
    cursor: 'pointer',
    minHeight: 304,
    position: 'relative',
    gap: 12,
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: 6,
      boxShadow: 'inset 0 0 0 0px var(--color-accent)',
      transition: 'all 0.9s cubic-bezier(0.19,1,0.22,1)',
      pointerEvents: 'none',
    },
    '&:hover::after': { boxShadow: 'inset 0 0 0 4px var(--color-accent)' },
  },
  renameInput: {
    fontSize: 18,
    color: 'var(--color-text)',
    border: 'none',
    borderBottom: '1px solid var(--color-accent)',
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
    color: 'var(--color-text-slate)',
    fontSize: 14,
    '&:hover': { textDecoration: 'underline' },
  },
  empty: {
    gridColumn: '1 / -1',
    color: '#5F6566',
    fontSize: 15,
  },
});

export default function ProjectsPage({ archived = false }: { archived?: boolean }) {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const popups = useSelector(selectPopups);
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery(
    archived ? archivedProjectsInfiniteQueryOptions : projectsInfiniteQueryOptions
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

  const deleteMutation = useMutation({ mutationFn: deleteProject });

  const archiveMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: boolean }) => setProjectArchived(id, value),
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => renameProject(id, name),
  });

  useEffect(() => {
    if (deleteMutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: projectsInfiniteQueryOptions.queryKey });
      toast.success('Project deleted');
    }
  }, [deleteMutation.status]);

  useEffect(() => {
    if (archiveMutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: projectsInfiniteQueryOptions.queryKey });
      toast.success(archiveMutation.variables.value ? 'Project deleted' : 'Project restored');
    }
    if (archiveMutation.isError) toast.error('Could not update the project');
  }, [archiveMutation.status]);

  useEffect(() => {
    if (renameMutation.isSuccess) {
      queryClient.invalidateQueries({ queryKey: projectsInfiniteQueryOptions.queryKey });
    }
  }, [renameMutation.status]);

  const sorted = [...projects].sort((a, b) => {
    const va = new Date(a[sortField]).getTime();
    const vb = new Date(b[sortField]).getTime();
    return sortDir === 'asc' ? va - vb : vb - va;
  });

  const handleOpen = (id: string) => navigate(`/project/${id}`);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await confirm('Delete this project? You can restore it from the archive.');
    if (ok) archiveMutation.mutate({ id, value: true });
  };

  const handleDeletePermanently = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const ok = await confirm('Permanently delete this project? This cannot be undone.');
    if (ok) deleteMutation.mutate(id);
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

  const handleCopy = (e: React.MouseEvent, item: Project) => {
    e.stopPropagation();
    dispatch(setActivePopup({ name: 'setProjectName', data: item, type: 'copy' }));
  };

  const handleShare = (e: React.MouseEvent, item: Project) => {
    e.stopPropagation();
    dispatch(setActivePopup({ name: 'share', type: 'listProject', data: item.hash }));
  };

  // Full page load: the planner singleton keeps the last opened scene across client-side routes.
  const handleCreateNew = () => {
    R2D.Storage.clear('r2d_project');
    window.location.assign(`${R2D.URL.REACT_BASEPATH}/project/new`);
  };

  return (
    <div className={classes.page}>
      <div className={classes.top}>
        <div className={classes.titleRow}>
          <div className={classes.title}>{archived ? 'Archive' : 'My projects'}</div>
          <Link to={archived ? '/projects' : '/projects/archive'} className={classes.titleLink}>
            {archived ? 'My projects' : 'Archive'}
          </Link>
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
          {!archived && (
            <div className={classes.addCard} onClick={handleCreateNew}>
              <IconPlus size={26} color="#2E3839" />
              New project
            </div>
          )}
          {archived && !isLoading && projects.length === 0 && (
            <div className={classes.empty}>Projects you delete will appear here.</div>
          )}

          {sorted.map((item) => (
            <Card
              key={item.id}
              name={item.name}
              modified={item.modified}
              created={item.opened}
              onClick={archived ? undefined : () => handleOpen(item.id)}
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
              actions={
                archived
                  ? [
                      {
                        icon: <IconRestore size={26} color="#fff" />,
                        label: 'Restore',
                        onClick: () => archiveMutation.mutate({ id: item.id, value: false }),
                      },
                      {
                        icon: <IconTrash size={26} color="#fff" />,
                        label: 'Delete',
                        onClick: (e) => handleDeletePermanently(e, item.id),
                      },
                    ]
                  : [
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
                        icon: <IconCopy size={26} color="#fff" />,
                        label: 'Copy',
                        onClick: (e) => handleCopy(e, item),
                      },
                      {
                        icon: <IconShare size={26} color="#fff" />,
                        label: 'Share',
                        onClick: (e) => handleShare(e, item),
                      },
                      {
                        icon: <IconTrash size={26} color="#fff" />,
                        label: 'Delete',
                        onClick: (e) => handleDelete(e, item.id),
                      },
                    ]
              }
            />
          ))}

          {hasNextPage && (
            <div className={classes.loadMore} onClick={() => fetchNextPage()}>
              Load more
            </div>
          )}
        </div>
      </div>

      {popups.share.status && <SharePopup />}
      {popups.setProjectName.status && <ProjectSetNamePopup />}
    </div>
  );
}
