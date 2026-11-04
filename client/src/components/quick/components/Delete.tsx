import { IconTrash } from '@tabler/icons-react';
import React, { forwardRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import Tooltip from '../../../shared-components/Tooltip';

const useStyle = createUseStyles({
  info_model_btn: {
    position: 'relative',
    width: 32,
    height: 32,
    background: 'var(--color-white)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    borderRadius: 3,
    border: '1px solid var(--color-white)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '& svg': {
      userSelect: 'none',
      pointerEvents: 'none',
    },
    '&:hover': {
      background: 'var(--color-surface-muted)',
    },
  },
  info_model_btn_overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

export const DeleteRef = forwardRef(({ onDelClick, positionBtn, addStyles }, ref) => (
  <Delete positionBtn={positionBtn} addStyles={addStyles} onDelClick={onDelClick} reference={ref} />
));

const Delete = (props) => {
  const classes = useStyle();

  const positionBtn = props.positionBtn;
  const addStyles = props.addStyles;
  const translation = useTranslation();
  let mouseDown = false;

  const onDelete = (e) => {
    props.onDelClick();
    mouseDown = false;
  };

  const mouseDownDelete = (e) => {
    mouseDown = true;
  };

  return (
    <Tooltip content={translation['HINT_BUTTON_DELETE']} side="bottom">
      <div
        className={classes.info_model_btn}
        ref={props.reference}
        style={addStyles ? { ...addStyles } : { left: positionBtn.x, top: positionBtn.y }}
      >
        <IconTrash width={16} height={16} color="#AF3131" />
        <div
          className={classes.info_model_btn_overlay}
          onMouseDown={mouseDownDelete}
          onMouseUp={onDelete}
        ></div>
      </div>
    </Tooltip>
  );
};
