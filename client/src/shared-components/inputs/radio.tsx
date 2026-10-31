import cls from 'classnames';
import { PropsWithChildren } from 'react';
import { createUseStyles } from 'react-jss';

const useStyle = createUseStyles({
  radio: {
    marginTop: 10,
    cursor: 'pointer',
    '& input': {
      marginRight: 5,
      position: 'absolute',
      zIndex: '-1',
      opacity: 0,
      '&:checked': {
        '&+label:after': {
          opacity: 1,
        },
      },
    },
    '& label': {
      fontSize: 14,
      color: '#2F2F2F',
      position: 'relative',
      cursor: 'pointer',
      '& span': {
        color: '#73909F',
      },
      '&:before': {
        content: '" "',
        transition: 'all .9s cubic-bezier(.19,1,.22,1)',
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: '#E7E7E7',
        position: 'absolute',
        boxShadow:
          '0px 1px 0px 0px rgb(255 255 255 / 0%), inset 0px 1px 0px 0px rgb(191 191 191 / 85%)',
        left: -20,
        top: 0,
        bottom: 0,
      },
      '&:after': {
        content: '" "',
        transition: 'all .9s cubic-bezier(.19,1,.22,1)',
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: '#9DD900',
        border: '1px solid #9DD112',
        position: 'absolute',
        left: -16,
        top: 4,
        bottom: 0,
        opacity: 0,
      },
      '@media screen and (max-width: 950px)': {
        fontSize: 11,
      },
    },
    '@media screen and (max-width: 950px)': {
      marginTop: 6,
    },
  },
});

type RadioProps = PropsWithChildren<{
  id: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: VoidFunction;
  className?: string;
}>;

export default function Radio(props: RadioProps) {
  const classes = useStyle();

  return (
    <div className={cls(classes.radio, props.className)}>
      <input
        type="radio"
        name={props.name}
        id={props.id}
        value={props.value}
        checked={props.checked}
        onChange={props.onChange}
        className="form-check-input"
      />
      <label htmlFor={props.id}>{props.children}</label>
    </div>
  );
}
