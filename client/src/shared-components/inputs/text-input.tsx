import { IconEye, IconPassword } from '@tabler/icons-react';
import cls from 'classnames';
import { useState } from 'react';
import { createUseStyles } from 'react-jss';

const useStyle = createUseStyles({
  input_wrap: {
    padding: '0 65px',
    display: 'flex',
    border: 'none',
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 20,
    '@media screen and (max-width: 950px)': {
      padding: '0 15px',
      gridGap: 14,
    },
  },
  input_text: {
    fontFamily: 'Roboto, sans-serif',
    fontSize: 14,
    color: '#2f2f2f',
    whiteSpace: 'nowrap',
    textAlign: 'right',
    marginRight: 20,
  },
  input_wr: {
    position: 'relative',
    color: '#fff',

    '&:last-child': {
      marginBottom: '0',
    },
  },
  input_pass_btn: {
    position: 'absolute',
    top: 6,
    right: -20,
    cursor: 'pointer',
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
});

type TextInputProps = {
  type: 'password' | 'text' | 'email';
  label: string;

  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  name?: string;
  required?: boolean;
  className?: string;
};

export default function TextInput(props: TextInputProps) {
  const classes = useStyle();
  const [inputType, setInputType] = useState(props.type);

  const togglePasswordInputType = () => {
    if (props.type !== 'password') {
      return;
    }

    setInputType((prevType) => (prevType === 'password' ? 'text' : 'password'));
  };

  return (
    <fieldset className={cls(classes.input_wrap, props.className)}>
      <div className={classes.input_text}>{props.label}</div>
      <div className={classes.input_wr}>
        <input
          className={classes.formInput}
          type={inputType}
          name={props.name}
          placeholder=""
          required={props.required}
          onChange={props.onChange}
          value={props.value}
        />

        {props.type === 'password' && (
          <div className={classes.input_pass_btn} onClick={togglePasswordInputType}>
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
