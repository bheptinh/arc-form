import { CSSProperties, ReactNode } from 'react';
import { useSelector } from 'react-redux';

import { planner } from '../../initR2D';
import { selectMetrics } from '../../redux/features/metrics/metricsSLice';
import NumberInput from '../../shared-components/inputs/number-input';

const VARIANTS = { style_1: 'stacked', style_2: 'compact', style_3: 'dark' } as const;

type MouseDown = { status: boolean; action: 'incr' | 'decr' | null };

type Props = {
  // in scene units, unless notConvertToCurrentMetric
  value: number | string;
  changeValue: (mouseDown: MouseDown, value: any, valueChangeType?: string) => void;
  // passed back to changeValue, so one handler can serve several fields
  valueChangeType?: string;
  label?: ReactNode;
  labelAfter?: ReactNode;
  infoHover?: ReactNode;
  type?: keyof typeof VARIANTS;
  notConvertToCurrentMetric?: boolean;
  revertedSign?: boolean;
  lessThenZero?: boolean;
  zeroNotAllowed?: boolean;
  isFixedSize?: boolean;
  additionalStyles?: CSSProperties;
  // no longer read: the arrows repeat on their own while held
  mouseDown?: unknown;
};

/**
 * NumberInput for scene values: shows them in the user's units (unless notConvertToCurrentMetric)
 * and reports changes as changeValue({ status, action }, value, valueChangeType), where status is
 * true while an arrow is held.
 */
const ChangeSize = (props: Props) => {
  // re-renders when the user switches units
  useSelector(selectMetrics);

  const convert = !props.notConvertToCurrentMetric;
  const shown = convert ? planner.units.valueToString(+props.value) : String(+props.value);
  const sign = (value: any) => (props.revertedSign ? value * -1 : value);

  const emit = (status: boolean, action: MouseDown['action'], value: any) =>
    props.valueChangeType
      ? props.changeValue({ status, action }, value, props.valueChangeType)
      : props.changeValue({ status, action }, value);

  const onStep = (direction: 1 | -1, final: boolean) => {
    const step = convert ? planner.units.getStep() : 1;
    let next = direction > 0 ? +props.value + step : +props.value - step;
    if (direction < 0) {
      if (props.zeroNotAllowed && next == 0) return;
      if (!props.lessThenZero) next = next <= 0 ? 0 : next;
    }
    emit(!final, direction > 0 ? 'incr' : 'decr', sign(next));
  };

  const onCommit = (text: string) => {
    const converted = convert ? planner.units.stringToValue(text) : text;
    let next = convert ? planner.units.valueToString(converted) : converted;
    next = planner.units.getSystem() == 1 ? next : isNaN(next) ? props.value : next;
    if (!props.lessThenZero) next = next <= 0 ? 0 : next;
    emit(false, null, convert ? planner.units.stringToValue(next) : sign(next));
  };

  return (
    <NumberInput
      value={shown}
      onCommit={onCommit}
      onStep={onStep}
      label={props.label}
      suffix={props.labelAfter}
      info={props.infoHover}
      readOnly={props.isFixedSize && props.valueChangeType !== 'elevation'}
      variant={props.type ? VARIANTS[props.type] : 'default'}
      style={props.additionalStyles}
    />
  );
};

export default ChangeSize;
