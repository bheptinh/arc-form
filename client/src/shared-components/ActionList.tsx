import clsx from 'clsx';
import type { PropsWithChildren, ReactNode } from 'react';

import classes from './ActionList.module.css';

type ListProps = PropsWithChildren<{
  size?: 'big' | 'small';
  iconFit?: 'cover' | 'contain';
}>;

type ItemProps = {
  icon: ReactNode;
  label: ReactNode;
  active?: boolean;
  onClick: () => void;
};

function ActionListItem({ icon, label, active, onClick }: ItemProps) {
  return (
    <button
      type="button"
      className={clsx(classes.item, { [classes.active]: active })}
      onClick={onClick}
    >
      <span className={classes.icon}>{icon}</span>
      <span className={classes.label}>{label}</span>
    </button>
  );
}

export function ActionList({ size = 'big', iconFit = 'cover', children }: ListProps) {
  return (
    <div
      className={clsx(classes.list, {
        [classes.small]: size === 'small',
        [classes.contain]: iconFit === 'contain',
      })}
    >
      {children}
    </div>
  );
}

ActionList.Item = ActionListItem;
