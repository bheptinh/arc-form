import { createUseStyles } from 'react-jss';
import cls from 'classnames';

const useStyle = createUseStyles({
  textArea: {
    padding: 5,
    fontSize: 14,
    borderRadius: 3,
    color: '#000',
    width: '100%',
    border: '1px solid #e8dede',
    height: 100,
    background: '#ffffff',
    outline: 'none',
    resize: 'none',
    transition: 'all 0.4s ease-out',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      height: 55,
    },
  },
});

type TextAreaProps = {
  name?: string;
  value?: string;
  readOnly?: boolean;
  className?: string;
};

export default function TextArea(props: TextAreaProps) {
  const classes = useStyle();

  return (
    <textarea
      className={cls(classes.textArea, props.className)}
      name={props.name}
      value={props.value}
      readOnly={props.readOnly}
    />
  );
}
