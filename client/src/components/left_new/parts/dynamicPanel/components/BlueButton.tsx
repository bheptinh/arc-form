import React from 'react';
import { createUseStyles } from 'react-jss';

const useStyle = createUseStyles({
  blueButton: {
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    padding: '5px 9px',
    fontSize: '14px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    height: '35px',
    borderRadius: '3px',
    background: '#66ACF4',
    '&:hover': {
      background: '#5795d5',
    },
    '@media screen and (max-width: 950px)': {
      height: 26,
      fontSize: 11,
    },
  },
});

const BlueButton = (props) => {
  const classes = useStyle();
  return (
    <div
      onClick={(e) => (props.onClickData ? props.onClick(props.onClickData) : props.onClick())}
      className={classes.blueButton}
    >
      {props.label}
    </div>
  );
};

export default BlueButton;
