import { IconEyeClosed } from '@tabler/icons-react';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import HoverComponent from '../../left_new/parts/controlPanel/components/HoverComponent';

const useStyle = createUseStyles({
  info_model_btn: {
    width: 32,
    height: 32,
    background: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    position: 'relative',
    borderRadius: 3,
    border: '1px solid #fff',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '& img': {
      userSelect: 'none',
      pointerEvents: 'none',
    },
    '&:hover': {
      background: '#E9E9E9',
    },
  },
  info_model_btn_overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  info_model_main: {},
});

export const HiddenRef = forwardRef(({ onClick, addStyles, isPartialVisible }, ref) => (
  <Hidden
    isPartialVisible={isPartialVisible}
    onClick={onClick}
    addStyles={addStyles}
    reference={ref}
  />
));

const Hidden = (props) => {
  const translation = useTranslation();
  const dispatch = useDispatch();
  const classes = useStyle();
  const btnPartVis = useRef(null);

  const onMouseDown = (e) => {
    document.addEventListener('mouseup', mouseUp);
  };

  const onMouseUp = (e) => {
    props.onClick();
  };

  const mouseUp = (e) => {
    document.removeEventListener('mouseup', mouseUp);
  };

  return (
    <HoverComponent hoverText={translation['HINT_BUTTON_PART_VISIBLE']}>
      <div
        className={classes.info_model_btn}
        style={props.addStyles ? { ...props.addStyles } : null}
        ref={btnPartVis}
      >
        <IconEyeClosed size={16} color="#323232" />

        <div
          className={classes.info_model_btn_overlay}
          onMouseUp={onMouseUp}
          onMouseDown={onMouseDown}
        ></div>
      </div>
    </HoverComponent>
  );
};
