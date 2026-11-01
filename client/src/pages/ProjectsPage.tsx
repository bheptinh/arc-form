import {
  IconArchive,
  IconCopy,
  IconForms,
  IconLayoutGrid,
  IconLogin2,
  IconPlus,
  IconRestore,
  IconShare,
  IconTrash,
} from '@tabler/icons-react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  deleteProject,
  type Project,
  projectsInfiniteQueryOptions,
  type ProjectSortField,
  renameProject,
  setProjectArchived,
  type SortDirection,
  sortedProjectsQueryOptions,
} from '../api/projects';
import { selectPopups, setActivePopup } from '../redux/features/popups/popupsSlice';
import { Card } from '../shared-components/Card';
import { confirm } from '../shared-components/ConfirmDialog';
import { GridPage } from '../shared-components/GridPage';
import IconButton from '../shared-components/inputs/icon-button';
import { SortBar } from '../shared-components/SortBar';
import ProjectSetNamePopup from '../smart-components/popups/project-set-name-popup';
import SharePopup from '../smart-components/popups/share-popup';
import classes from './ProjectsPage.module.css';

export default function ProjectsPage({ archived = false }: { archived?: boolean }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const popups = useSelector(selectPopups);
  const queryClient = useQueryClient();

  const [sortField, setSortField] = useState<ProjectSortField>('modified');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [sortLabel, setSortLabel] = useState('Last updated');

  const { data, fetchNextPage, hasNextPage, isLoading } = useInfiniteQuery(
    sortedProjectsQueryOptions(archived, sortField, sortDir)
  );
  const projects = data?.pages.flatMap((p) => p.items) ?? [];

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

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
    <>
      <GridPage
        title={archived ? 'Archive' : 'My projects'}
        actions={
          <div className={classes.titleActions}>
            <SortBar
              options={[
                { value: 'opened', label: 'Created' },
                { value: 'modified', label: 'Last updated' },
              ]}
              activeLabel={sortLabel}
              direction={sortDir}
              onOptionSelect={(opt) => {
                setSortField(opt.value as ProjectSortField);
                setSortLabel(opt.label);
              }}
              onDirectionToggle={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            />
            <IconButton
              icon={
                archived ? (
                  <IconLayoutGrid size={14} color="#555555" />
                ) : (
                  <IconArchive size={14} color="#555555" />
                )
              }
              label={archived ? 'My projects' : 'Archive'}
              to={archived ? '/projects' : '/projects/archive'}
            />
          </div>
        }
        isLoading={isLoading}
        onLoadMore={hasNextPage ? () => fetchNextPage() : undefined}
      >
        {!archived && (
          <div className={classes.addCard} onClick={handleCreateNew}>
            <IconPlus size={26} color="#2a3435" />
            New project
          </div>
        )}
        {archived && !isLoading && projects.length === 0 && (
          <div className={classes.empty}>Projects you delete will appear here.</div>
        )}

        {projects.map((item) => (
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
      </GridPage>

      {popups.share.status && <SharePopup />}
      {popups.setProjectName.status && <ProjectSetNamePopup />}
    </>
  );
}
