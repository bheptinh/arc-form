import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
  overlayVisible: { opacity: 1 },
  box: {
    background: 'var(--color-white)',
    borderRadius: 6,
    padding: '40px 60px',
    minWidth: 320,
    maxWidth: 480,
    boxShadow: '0px 1px 10px 0px rgba(0,0,0,0.15)',
    transform: 'scale(0.95)',
    transition: 'transform 0.2s ease',
  },
  boxVisible: { transform: 'scale(1)' },
  text: {
    fontSize: 14,
    color: 'var(--color-text)',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 1.5,
  },
  buttons: { display: 'flex', justifyContent: 'center', gap: 8 },
  cancel: {
    cursor: 'pointer',
    height: 35,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-strong)',
    fontSize: 14,
    borderRadius: 3,
    padding: '0 20px',
    minWidth: 120,
    background: 'var(--color-white)',
    border: '1px solid var(--color-black)',
    textTransform: 'uppercase',
    outline: 'none',
    '&:hover': { background: 'var(--color-surface-muted)' },
  },
  ok: {
    cursor: 'pointer',
    height: 35,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-strong)',
    fontSize: 14,
    borderRadius: 3,
    padding: '0 20px',
    minWidth: 120,
    background: 'var(--color-accent-bright)',
    border: 'none',
    textTransform: 'uppercase',
    outline: 'none',
    '&:hover': { background: 'var(--color-accent-hover)' },
  },
});

type ConfirmState = { message: string; resolve: (v: boolean) => void } | null;

let _show: ((state: ConfirmState) => void) | null = null;

export function confirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    _show?.({ message, resolve });
  });
}

export function ConfirmDialogProvider() {
  const [state, setState] = useState<ConfirmState>(null);
  const [visible, setVisible] = useState(false);
  const classes = useStyles();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    _show = (next) => {
      setState(next);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(true), 0);
    };
    return () => { _show = null; };
  }, []);

  const finish = (value: boolean) => {
    setVisible(false);
    setTimeout(() => {
      state?.resolve(value);
      setState(null);
    }, 200);
  };

  if (!state) return null;

  return createPortal(
    <div
      className={visible ? `${classes.overlay} ${classes.overlayVisible}` : classes.overlay}
      onClick={() => finish(false)}
    >
      <div
        className={visible ? `${classes.box} ${classes.boxVisible}` : classes.box}
        onClick={(e) => e.stopPropagation()}
      >
        <p className={classes.text}>{state.message}</p>
        <div className={classes.buttons}>
          <button className={classes.cancel} onClick={() => finish(false)}>Cancel</button>
          <button className={classes.ok} onClick={() => finish(true)}>OK</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
