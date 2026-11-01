import {
  IconDownload,
  IconFileSymlink,
  IconRotateClockwise2,
  IconTrash,
} from '@tabler/icons-react';

import { useTranslation } from '../../api/hooks/useTranslation';
import type { Render } from '../../api/renders';
import { Card } from '../../shared-components/Card';
import classes from './RenderCards.module.css';

type Props = {
  renders: Render[];
  onOpen: (renderId: string, type: string, actions?: { open: { link: string } }) => void;
  onDownload: (renderId: string) => void;
  onDelete: (renderId: string) => void;
  onReload: (renderId: string) => void;
};

const IN_PROGRESS = new Set(['waiting', 'created', 'rendering', 'taken', 'start', 'finished']);

export function RenderCards({ renders, onOpen, onDownload, onDelete, onReload }: Props) {
  const translation = useTranslation();

  return (
    <>
      {renders
        .filter((r) => r.status !== 'deleted')
        .map((item) => {
          const d = new Date(item.created * 1000);
          const createdFormatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

          const deleteAction = {
            icon: <IconTrash size={25} color="#AF3131" />,
            label: translation['BUTTON_DELETE_PLAN'],
            onClick: () => onDelete(item.renderId),
          };
          const openAction = {
            icon: <IconFileSymlink size={25} color="#fff" />,
            label: translation['BUTTON_OPEN_PLAN'],
            onClick: () => onOpen(item.renderId, item.type, item.actions),
          };
          const downloadAction = {
            icon: <IconDownload size={25} color="#fff" />,
            label: translation['BUTTON_DOWNLOAD_RENDER'],
            onClick: () => onDownload(item.renderId),
          };
          const reloadAction = {
            icon: <IconRotateClockwise2 size={25} color="#fff" />,
            label: translation['BUTTON_RELOAD_RENDER'],
            onClick: () => onReload(item.renderId),
          };

          let actions;
          if (item.status === 'stored') actions = [openAction, downloadAction, deleteAction];
          if (item.status === 'error') actions = [reloadAction, deleteAction];

          return (
            <Card
              key={item.id}
              name={item.type}
              preview={item.preview ? `${R2D.URL.DOMAIN}${item.preview}` : undefined}
              created={createdFormatted}
              actions={actions}
              className={item.status === 'error' ? classes.cardError : undefined}
              overlay={
                IN_PROGRESS.has(item.status) && (
                  <p>
                    {item.status === 'waiting'
                      ? translation['TEXT_RENDER_WAITING']
                      : translation['TEXT_RENDER_IN_PROGRESS']}
                  </p>
                )
              }
              metaContent={
                item.status === 'error' ? (
                  <div className={classes.errorText}>{translation['TEXT_RENDER_ERROR']}</div>
                ) : undefined
              }
            />
          );
        })}
    </>
  );
}
