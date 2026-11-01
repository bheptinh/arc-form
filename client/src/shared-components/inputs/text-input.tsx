import { IconEye, IconPassword } from '@tabler/icons-react';
import cls from 'classnames';
import { Ref, useId, useState } from 'react';

import classes from './text-input.module.css';

type TextInputProps = {
  type?: 'password' | 'text' | 'email' | 'number';
  label?: string;
  ref?: Ref<HTMLInputElement>;

  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string | number;
  defaultValue?: string | number;
  placeholder?: string;
  name?: string;
  required?: boolean;
  readOnly?: boolean;
  inset?: boolean;
  className?: string;
  inputClassName?: string;
};

export default function TextInput(props: TextInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const type = props.type === 'password' && isPasswordVisible ? 'text' : (props.type ?? 'text');

  const id = useId();

  return (
    <fieldset
      className={cls(classes.fieldset, { [classes.fieldsetInset]: props.inset }, props.className)}
    >
      {props.label && (
        <label htmlFor={id} className={classes.label}>
          {props.label}
        </label>
      )}
      <div className={classes.formInputWrapper}>
        <input
          id={id}
          ref={props.ref}
          className={cls(classes.formInput, props.inputClassName)}
          type={type}
          name={props.name}
          placeholder={props.placeholder}
          required={props.required}
          readOnly={props.readOnly}
          onChange={props.onChange}
          value={props.value}
          defaultValue={props.defaultValue}
        />

        {props.type === 'password' && (
          <div
            className={classes.formInputPasswordButton}
            onClick={() => setIsPasswordVisible((prev) => !prev)}
          >
            {!isPasswordVisible ? (
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
