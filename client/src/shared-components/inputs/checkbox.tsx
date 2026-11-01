import { IconCheckbox, IconEye, IconEyeClosed, IconSquare } from '@tabler/icons-react';
import cls from 'classnames';
import { useMemo } from 'react';

import classes from './checkbox.module.css';

type CheckboxProps = {
  label: string;
  name?: string;
  id?: string;
  checked?: boolean;
  disabled?: boolean;
  visualType?: 'default' | 'eye';
  onChange?: (checked: boolean) => void;
};

const Checkbox = (props: CheckboxProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange?.(e.target.checked);
  };

  const id = useMemo(() => props.id || `checkbox-${crypto.randomUUID()}`, [props.id]);
  const iconsSet = useMemo(() => {
    if (props.visualType === 'eye') {
      return {
        checked: IconEye,
        unchecked: IconEyeClosed,
      };
    }
    return {
      checked: IconCheckbox,
      unchecked: IconSquare,
    };
  }, [props.visualType]);

  const Icon = props.checked ? iconsSet.checked : iconsSet.unchecked;

  return (
    <div className={classes.checkboxInputWr}>
      <input
        id={id}
        className={cls(classes.checkboxInput, { [classes.checkboxInput_disabled]: props.disabled })}
        type="checkbox"
        onChange={handleChange}
        checked={props.checked}
        name={props.name}
        disabled={props.disabled}
      />
      <label htmlFor={id}>
        <Icon size={18} color="#4a4a4a" />
        {props.label}
      </label>
    </div>
  );
};

export default Checkbox;
