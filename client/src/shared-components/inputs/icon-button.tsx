import cls from 'classnames';
import { ComponentPropsWithRef, MouseEventHandler, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import Tooltip from '../Tooltip';
import classes from './icon-button.module.css';

type IconButtonProps = Omit<ComponentPropsWithRef<'button'>, 'onClick' | 'className'> & {
  icon: ReactNode;
  label: string;
  to?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  // `dark` sits on slate backgrounds; the icon follows the button's text colour
  variant?: 'light' | 'dark';
  active?: boolean;
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left';
  // e.g. for a menu trigger, where the open menu would cover the tooltip
  hideTooltip?: boolean;
  className?: string;
};

// extra props and the ref reach the <button>, so it can be a Radix trigger
export default function IconButton({
  icon,
  label,
  to,
  onClick,
  variant = 'light',
  active,
  tooltipSide,
  hideTooltip,
  className,
  ...buttonProps
}: IconButtonProps) {
  const sharedProps = {
    className: cls(classes.iconButton, variant === 'dark' && classes.dark, className),
    'aria-label': label,
    onClick,
  };

  const element = to ? (
    <Link to={to} {...sharedProps}>
      {icon}
    </Link>
  ) : (
    <button type="button" aria-pressed={active} {...buttonProps} {...sharedProps}>
      {icon}
    </button>
  );

  if (hideTooltip) return element;

  return (
    <Tooltip content={label} side={tooltipSide}>
      {element}
    </Tooltip>
  );
}
