import cls from 'classnames';
import { ButtonHTMLAttributes, Ref } from 'react';
import { createUseStyles } from 'react-jss';

const useStyle = createUseStyles({
  button: {
    cursor: 'pointer',
    height: 35,
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'var(--color-text-strong)',
    fontSize: 14,
    borderRadius: 3,
    padding: '0 20px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    minWidth: 120,
    outline: 'none',
    textTransform: 'uppercase',
    margin: '0 3px',
    '&:disabled': {
      opacity: 0.6,
      cursor: 'default',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
      height: 26,
      minWidth: 88,
    },
  },
  primary: {
    border: 'none',
    background: 'var(--color-accent-bright)',
    '&:hover': {
      background: 'var(--color-accent-hover)',
    },
  },
  secondary: {
    border: '1px solid var(--color-black)',
    background: 'var(--color-white)',
    '&:hover': {
      background: 'var(--color-surface-muted)',
    },
  },
});

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
  ref?: Ref<HTMLButtonElement>;
};

export default function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  const classes = useStyle();

  return (
    <button type="button" className={cls(classes.button, classes[variant], className)} {...props} />
  );
}
