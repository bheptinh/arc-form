import { ComponentType, ReactElement, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { selectActiveControlPanelModeData } from '../../../../../../redux/features/control/controlPanelSlice';
import classes from './PanelStack.module.css';

type Props = {
  // the screen for each history type, e.g. { main: Main, material: Material }
  screens: Record<string, ComponentType>;
  // catalog modes replace history in place (breadcrumbs, home), so they watch the last step's id
  changesOn?: 'length' | 'id';
};

// how long a screen takes to slide in; the screen it covered is removed after that
const SLIDE_DURATION = 600;

/** The active control-panel mode's screens: each history step slides a new screen over the last. */
export default function PanelStack({ screens, changesOn = 'length' }: Props) {
  const history = useSelector(selectActiveControlPanelModeData).history;
  const lastStep = history?.[history.length - 1];
  const lastType = lastStep?.type;

  const [stack, setStack] = useState<(ReactElement | null)[]>([]);
  const [clip, setClip] = useState(true);

  useEffect(() => {
    if (!lastType) return;
    const Screen = screens[lastType];
    setStack((prev) => [...prev, Screen ? <Screen key={Math.random()} /> : null]);
  }, [changesOn == 'id' ? lastStep?.id : history?.length]);

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

  return (
    <div className={classes.stack} style={clip ? { overflow: 'hidden' } : undefined}>
      {stack}
    </div>
  );
}
