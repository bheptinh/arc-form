import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import classes from './ConfirmDialog.module.css';

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

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    _show = (next) => {
      setState(next);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(true), 0);
    };
    return () => {
      _show = null;
    };
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
          <button className={classes.cancel} onClick={() => finish(false)}>
            Cancel
          </button>
          <button className={classes.ok} onClick={() => finish(true)}>
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
