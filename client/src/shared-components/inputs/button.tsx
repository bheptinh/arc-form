import cls from 'classnames';
import { ButtonHTMLAttributes, Ref } from 'react';

import classes from './button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  // fills its container's width
  fullWidth?: boolean;
  ref?: Ref<HTMLButtonElement>;
};

export default function Button({
  variant = 'primary',
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={cls(classes.button, classes[variant], fullWidth && classes.fullWidth, className)}
      {...props}
    />
  );
}
