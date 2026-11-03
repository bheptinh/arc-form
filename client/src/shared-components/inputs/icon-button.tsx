import cls from 'classnames';
import { MouseEventHandler, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import Tooltip from '../Tooltip';
import classes from './icon-button.module.css';

type IconButtonProps = {
  icon: ReactNode;
  label: string;
  to?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  // `dark` sits on slate backgrounds; the icon follows the button's text colour
  variant?: 'light' | 'dark';
  active?: boolean;
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
};

export default function IconButton({
  icon,
  label,
  to,
  onClick,
  variant = 'light',
  active,
  tooltipSide,
  className,
}: IconButtonProps) {
  const sharedProps = {
    className: cls(classes.iconButton, variant === 'dark' && classes.dark, className),
    'aria-label': label,
    onClick,
  };

  return (
    <Tooltip content={label} side={tooltipSide}>
      {to ? (
        <Link to={to} {...sharedProps}>
          {icon}
        </Link>
      ) : (
        <button type="button" aria-pressed={active} {...sharedProps}>
          {icon}
        </button>
      )}
    </Tooltip>
  );
}
