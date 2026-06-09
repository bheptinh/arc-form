import React from 'react';
import ReactDOM from 'react-dom';
import { createUseStyles } from 'react-jss';

const useStyle = createUseStyles({
  planner_popup_close: {
    width: 20,
    height: 20,
    position: 'fixed',
    top: 8,
    right: 8,
    cursor: 'pointer',
    zIndex: 8,
    '& path': {
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover': {
      '& path': {
        fill: '#BAE51F',
      },
    },
  },
  planner_popup_close_icon: {
    width: '100%',
  },
});

const CloseModeBtn = ({ onCloseMode, statusVisible, customStyles = {} }) => {
  const classes = useStyle();

  return ReactDOM.createPortal(
    <div
      className={classes.planner_popup_close}
      onClick={onCloseMode}
      style={{
        opacity: statusVisible ? 1 : 0,
        ...customStyles,
      }}
    >
      <svg
        width="25"
        height="25"
        fill="none"
        viewBox="0 0 25 25"
        className={classes.planner_popup_close_icon}
      >
        <path
          fill="#2A3435"
          fillRule="evenodd"
          d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z"
          clipRule="evenodd"
        ></path>
        <path
          fill="#2A3435"
          fillRule="evenodd"
          d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z"
          clipRule="evenodd"
        ></path>
        <path
          fill="#2A3435"
          fillRule="evenodd"
          d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z"
          clipRule="evenodd"
        ></path>
        <path
          fill="#2A3435"
          fillRule="evenodd"
          d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z"
          clipRule="evenodd"
        ></path>
      </svg>
    </div>,
    document.body
  );
};

export default CloseModeBtn;
