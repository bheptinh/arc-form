import { IconChevronDown, IconChevronUp, IconHelpHexagonFilled } from '@tabler/icons-react';
import cls from 'classnames';
import { CSSProperties, KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react';

import Tooltip from '../Tooltip';
import classes from './number-input.module.css';

type Props = {
  // the shown value, already formatted by the caller
  value: string;
  // the typed text, on blur or Enter
  onCommit: (text: string) => void;
  // an arrow step: repeats with final false while an arrow is held, then once more with final true
  onStep: (direction: 1 | -1, final: boolean) => void;
  label?: ReactNode;
  // after the field, e.g. a unit
  suffix?: ReactNode;
  // help text in a tooltip on an icon beside the label
  info?: ReactNode;
  // shows the value without arrows and can't be edited
  readOnly?: boolean;
  // default: label and field on one row; stacked: label above; compact: no field margins; dark: for dark backgrounds
  variant?: 'default' | 'stacked' | 'compact' | 'dark';
  style?: CSSProperties;
};

const HOLD_DELAY = 200;
const REPEAT_INTERVAL = 100;

/** Number field with up/down arrows that repeat while held. */
export default function NumberInput({
  value,
  onCommit,
  onStep,
  label,
  suffix,
  info,
  readOnly,
  variant = 'default',
  style,
}: Props) {
  const [text, setText] = useState(value);
  const [holding, setHolding] = useState<1 | -1 | null>(null);
  // the latest onStep, so repeats step from the latest value
  const step = useRef(onStep);
  step.current = onStep;

  useEffect(() => setText(value), [value]);

  useEffect(() => {
    if (!holding) return;
    let repeat: number | undefined;
    const hold = window.setTimeout(() => {
      step.current(holding, false);
      repeat = window.setInterval(() => step.current(holding, false), REPEAT_INTERVAL);
    }, HOLD_DELAY);
    // letting go anywhere ends the hold with one last step
    const release = () => {
      setHolding(null);
      step.current(holding, true);
    };
    window.addEventListener('mouseup', release);
    return () => {
      clearTimeout(hold);
      clearInterval(repeat);
      window.removeEventListener('mouseup', release);
    };
  }, [holding]);

  const commit = () => {
    onCommit(text);
    setText(value);
  };

  // grows with the text
  const width = (text.length + 1) * 7 + (variant == 'stacked' || variant == 'compact' ? -3 : 5);

  return (
    <div className={cls(classes.main, variant != 'default' && classes[variant])} style={style}>
      <div className={classes.label}>
        {label}
        {info ? (
          <Tooltip content={info} side="left">
            <IconHelpHexagonFilled className={classes.info} size={18} color="#2D8BDB" />
          </Tooltip>
        ) : null}
      </div>
      <div className={classes.controls}>
        {readOnly ? (
          <input className={classes.readOnly} value={text} type="text" style={{ width }} disabled />
        ) : (
          <>
            <div className={classes.field}>
              <input
                className={classes.input}
                value={text}
                type="text"
                style={{ width }}
                onChange={(e) => setText(e.target.value)}
                onBlur={commit}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                  e.code == 'Enter' && e.currentTarget.blur()
                }
              />
              {suffix ? <div className={classes.suffix}>{suffix}</div> : null}
            </div>
            <div className={classes.stepper}>
              <div className={classes.arrows}>
                <IconChevronUp
                  className={cls(classes.arrow, classes.arrowUp)}
                  onMouseDown={() => setHolding(1)}
                  color="#2F2F2F"
                  size={15}
                />
                <IconChevronDown
                  className={cls(classes.arrow, classes.arrowDown)}
                  onMouseDown={() => setHolding(-1)}
                  color="#2F2F2F"
                  size={15}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
