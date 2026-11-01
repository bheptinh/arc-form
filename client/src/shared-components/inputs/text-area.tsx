import cls from 'classnames';

import classes from './text-area.module.css';

type TextAreaProps = {
  name?: string;
  value?: string;
  readOnly?: boolean;
  className?: string;
};

export default function TextArea(props: TextAreaProps) {
  return (
    <textarea
      className={cls(classes.textArea, props.className)}
      name={props.name}
      value={props.value}
      readOnly={props.readOnly}
    />
  );
}
