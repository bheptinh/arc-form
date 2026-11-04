import React, { useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import Tooltip from '../../../shared-components/Tooltip';

const useStyle = createUseStyles({
  info_model_pop_item_wr: {
    width: 32,
    height: 32,
    position: 'relative',
    '& svg': {
      userSelect: 'none',
      pointerEvents: 'none',
    },
    '&:hover': {
      '& $info_model_more_wr': {
        transform: 'translateY(0%)',
      },
      '& $info_model_more_wrap': {
        pointerEvents: 'auto',
      },
    },
  },
  info_model_btn_overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  info_model_pop_item: {
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
    '& img': {
      maxWidth: '70%',
      maxHeight: '70%',
    },
    '& svg': {
      maxWidth: '70%',
      maxHeight: '70%',
    },
    '&:hover': {
      background: 'var(--color-surface-muted)',
    },
  },
  info_model_more_wrap: {
    top: 'calc(100% - 4px)',
    right: '-4px',
    width: '100%',
    padding: '4px',
    zIndex: -1,
    overflow: 'hidden',
    position: 'absolute',
    minWidth: 'fit-content',
    pointerEvents: 'none',
    paddingTop: 6,
  },
  info_model_more_wr: {
    transform: 'translateY(calc(-100% - 15px))',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    pointerEvents: 'auto',
    display: 'grid',
    background: 'var(--color-white)',
    borderRadius: '3px',
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
  },
});

const More = (props) => {
  const classes = useStyle();
  const moreBtn = props.reference || useRef(null);
  const translation = useTranslation();

  return (
    <div className={classes.info_model_pop_item_wr}>
      <Tooltip content={translation['HINT_BUTTON_MORE']} side="bottom">
        <div
          className={classes.info_model_pop_item}
          ref={moreBtn}
          style={props.addStyles ? { ...props.addStyles } : null}
        >
          {/* TODO: Replace with three dots icon */}
          <svg width="16" height="4" viewBox="0 0 16 4" fill="none">
            <circle opacity="0.99" cx="2.40195" cy="1.73398" r="1.60898" fill="#323232" />
            <circle opacity="0.99" cx="8.01914" cy="1.73398" r="1.60898" fill="#323232" />
            <circle opacity="0.99" cx="13.6402" cy="1.73398" r="1.60898" fill="#323232" />
          </svg>
          <div className={classes.info_model_btn_overlay}></div>
        </div>
      </Tooltip>
      <div className={classes.info_model_more_wrap}>
        <div className={classes.info_model_more_wr}>{props.childrens}</div>
      </div>
    </div>
  );
};

export default More;
