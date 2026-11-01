import cls from 'classnames';
import { MouseEventHandler, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import classes from './icon-button.module.css';

type IconButtonProps = {
  icon: ReactNode;
  label: string;
  to?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  className?: string;
};

export default function IconButton({ icon, label, to, onClick, className }: IconButtonProps) {
  const sharedProps = {
    className: cls(classes.iconButton, className),
    'aria-label': label,
    title: label,
    onClick,
  };

  if (to) {
    return (
      <Link to={to} {...sharedProps}>
        {icon}
      </Link>
    );
  }

  return (
    <button type="button" {...sharedProps}>
      {icon}
    </button>
  );
}
