import { IconCalendarMonth, IconClock } from '@tabler/icons-react';
import { MouseEvent, ReactNode } from 'react';

import classes from './Card.module.css';

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
  actions?: Action[];
  onClick?: () => void;
  nameContent?: ReactNode;
  metaContent?: ReactNode;
  overlay?: ReactNode;
  className?: string;
};

export function Card({
  name,
  preview,
  modified,
  created,
  actions = [],
  onClick,
  nameContent,
  metaContent,
  overlay,
  className,
}: Props) {
  const rootClass = [classes.card, onClick && classes.clickable, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rootClass} onClick={onClick}>
      <div className={classes.imgWrap}>
        <img
          className={classes.img}
          src={preview || '/src_designer/images/no_preview_image.png'}
          alt=""
        />
        {actions.length > 0 && (
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
        )}
        {overlay && <div className={classes.overlay}>{overlay}</div>}
      </div>
      <div className={classes.info}>
        {nameContent ?? <div className={classes.name}>{name || 'Unnamed'}</div>}
        <div className={classes.meta}>
          {metaContent ?? (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
