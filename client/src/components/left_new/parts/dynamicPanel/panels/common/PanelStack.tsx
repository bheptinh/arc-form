import cls from 'classnames';
import { Fragment, ReactElement, ReactNode, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { selectActiveControlPanelModeData } from '../../../../../../redux/features/control/controlPanelSlice';
import classes from './PanelStack.module.css';

type Props = {
  // renders the screen for each history type, e.g. { main: () => <Main /> }; called once, when the
  // step is added, so the screen keeps the props it had then
  screens: Record<string, () => ReactNode>;
  // catalog modes replace history in place (breadcrumbs, home), so they watch the last step's id
  changesOn?: 'length' | 'id';
  className?: string;
  // shown over the screens, e.g. a tip
  children?: ReactNode;
};

// how long a screen takes to slide in; the screen it covered is removed after that
const SLIDE_DURATION = 600;

/**
 * Screens that slide over each other: each new `step` adds the screen from `render` (skipped when
 * it's undefined), and once it has slid in, the one it covered is removed. `clip` is true while a
 * screen is sliding.
 */
export function useScreenStack(step: unknown, render?: () => ReactNode) {
  const [stack, setStack] = useState<(ReactElement | null)[]>([]);
  const [clip, setClip] = useState(true);

  useEffect(() => {
    if (!render) return;
    const screen = render();
    setStack((prev) => [
      ...prev,
      screen ? <Fragment key={Math.random()}>{screen}</Fragment> : null,
    ]);
  }, [step]);

  useEffect(() => {
    setClip(true);
    if (stack.length > 2) {
      setStack((prev) => prev.slice(-2));
      return;
    }
    const timer = setTimeout(
      stack.length > 1 ? () => setStack((prev) => prev.slice(-1)) : () => setClip(false),
      SLIDE_DURATION
    );
    return () => clearTimeout(timer);
  }, [stack]);

  return { stack, clip };
}

/** The active control-panel mode's screens: each history step slides a new screen over the last. */
export default function PanelStack({ screens, changesOn = 'length', className, children }: Props) {
  const history = useSelector(selectActiveControlPanelModeData).history;
  const lastStep = history?.[history.length - 1];
  const lastType = lastStep?.type;

  const { stack, clip } = useScreenStack(
    changesOn == 'id' ? lastStep?.id : history?.length,
    lastType ? () => screens[lastType]?.() : undefined
  );

  return (
    <div
      className={cls(classes.stack, className)}
      style={clip ? { overflow: 'hidden' } : undefined}
    >
      {stack}
      {children}
    </div>
  );
}
