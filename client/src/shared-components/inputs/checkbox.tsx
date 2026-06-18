import { IconCheckbox, IconEye, IconEyeClosed, IconSquare } from '@tabler/icons-react';
import cls from 'classnames';
import { useMemo } from 'react';
import { createUseStyles } from 'react-jss';

const useStyle = createUseStyles({
  checkboxInputWr: {
    display: 'flex',
  },
  checkboxInput: {
    position: 'absolute',
    zIndex: '-1',
    opacity: 0,

    '& + label ': {
      display: 'inline-flex',
      alignItems: 'center',
      userSelect: 'none',
      fontSize: '13px',
      color: '#373737',
      cursor: 'pointer',
      position: 'relative',
      gap: '8px',

      '@media screen and (max-width: 950px)': {
        fontSize: '11px',
      },
    },
  },
  checkboxInput_disabled: {
    '& + label ': {
      cursor: 'default',
      opacity: 0.2,
    },
  },
});

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
  const classes = useStyle();

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
