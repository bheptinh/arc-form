import cls from 'classnames';
import { ButtonHTMLAttributes, Ref } from 'react';

import classes from './button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  ref?: Ref<HTMLButtonElement>;
};

export default function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button type="button" className={cls(classes.button, classes[variant], className)} {...props} />
  );
}
