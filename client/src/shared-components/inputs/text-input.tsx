import { IconEye, IconPassword } from '@tabler/icons-react';
import cls from 'classnames';
import { useState } from 'react';
import { createUseStyles } from 'react-jss';

const useStyle = createUseStyles({
  fieldset: {
    padding: '0 65px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'start',

    '@media screen and (max-width: 950px)': {
      padding: '0 15px',
      gridGap: 14,
    },
  },
  label: {
    fontSize: 14,
    color: '#2f2f2f',
    whiteSpace: 'nowrap',
    padding: '0 10px',
  },
  formInputWrapper: {
    position: 'relative',
    color: '#fff',
  },
  formInput: {
    borderRadius: 3,
    paddingLeft: 10,
    fontSize: 14,
    color: '#000',
    width: '100%',
    border: '1px solid #e8dede',
    height: 30,
    background: '#ffffff',
    outline: 'none',
    resize: 'none',
    transition: 'all 0.4s ease-out',
  },
  formInputPasswordButton: {
    position: 'absolute',
    top: 6,
    right: -20,
    cursor: 'pointer',
  },
});

type TextInputProps = {
  type?: 'password' | 'text' | 'email';
  label: string;

  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  name?: string;
  required?: boolean;
  className?: string;
};

export default function TextInput(props: TextInputProps) {
  const classes = useStyle();
  const [inputType, setInputType] = useState(props.type ?? 'text');

  const togglePasswordInputType = () => {
    if (props.type !== 'password') {
      return;
    }

    setInputType((prevType) => (prevType === 'password' ? 'text' : 'password'));
  };

  // FIXME: id changes on every render and randomUUID fails on non-HTTPS origins. Use useId().
  const id = crypto.randomUUID();

  return (
    <fieldset className={cls(classes.fieldset, props.className)}>
      <label htmlFor={id} className={classes.label}>
        {props.label}
      </label>
      <div className={classes.formInputWrapper}>
        <input
          id={id}
          className={classes.formInput}
          type={inputType}
          name={props.name}
          placeholder={props.placeholder}
          required={props.required}
          onChange={props.onChange}
          value={props.value}
          defaultValue={props.defaultValue}
        />

        {props.type === 'password' && (
          <div className={classes.formInputPasswordButton} onClick={togglePasswordInputType}>
            {inputType === 'password' ? (
              <IconEye size={16} color="#2F2F2F" />
            ) : (
              <IconPassword size={16} color="#2F2F2F" />
            )}
          </div>
        )}
      </div>
    </fieldset>
  );
}
