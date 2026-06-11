import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

import HoverComponent from '../../left_new/parts/controlPanel/components/HoverComponent';
import { useTranslation } from '../../../api/hooks/useTranslation';

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
        {
          <svg width="20" height="9" viewBox="0 0 20 9" fill="none">
            <g opacity="0.99">
              <path
                d="M0.20723 0.589844C1.55371 4.12163 5.39994 6.67446 9.94261 6.67446C14.4853 6.67446 18.3315 4.12163 19.678 0.589844H17.7781C16.52 3.05596 13.5722 4.936 9.94261 4.936C6.31305 4.936 3.36527 3.05596 2.1071 0.589844H0.20723Z"
                fill="#323232"
              />
              <path
                d="M2.29402 2.32876L3.67791 3.38096L1.54404 5.79926L0.160156 4.74707L2.29402 2.32876Z"
                fill="#323232"
              />
              <path
                d="M5.19676 5.03328L6.94227 5.53326L5.71433 8.92902L3.96882 8.42905L5.19676 5.03328Z"
                fill="#323232"
              />
              <path
                d="M13.5778 5.04096L11.808 5.48469L12.9221 8.91416L14.6919 8.47043L13.5778 5.04096Z"
                fill="#323232"
              />
              <path
                d="M17.5848 2.32876L16.2009 3.38096L18.4107 5.89923L19.7946 4.84704L17.5848 2.32876Z"
                fill="#323232"
              />
            </g>
          </svg>
        }
        <div
          className={classes.info_model_btn_overlay}
          onMouseUp={onMouseUp}
          onMouseDown={onMouseDown}
        ></div>
      </div>
    </HoverComponent>
  );
};

export default Hidden;
