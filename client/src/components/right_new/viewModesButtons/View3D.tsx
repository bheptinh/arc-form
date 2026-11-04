import React from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import {
  selectActiveViewMode,
  setActiveViewMode,
} from '../../../redux/features/viewMode/viewModeSlice';
import Tooltip from '../../../shared-components/Tooltip';

const useStyles = createUseStyles({
  right_bar_btn: {
    background: 'var(--color-white)',
    cursor: 'pointer',
    height: 36,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    position: 'relative',
    borderRadius: 3,
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      background: 'var(--color-surface-muted)',
    },
    '@media screen and (max-width: 950px)': {
      height: 30,
      width: 30,
    },
  },
  right_bar_btn_active: {
    background: 'var(--color-accent)',
    position: 'relative',
    '& path, & circle, & rect': {
      fill: '#424242',
    },
    height: 36,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    borderRadius: 3,
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '@media screen and (max-width: 950px)': {
      height: 30,
      width: 30,
    },
  },
  right_bar_btn_hover: {
    position: 'fixed',
    background: 'var(--color-info-bright)',
    display: 'none',
    transform: 'translateX(-100%)',
    fontSize: 12,
    width: 'max-content',
    zIndex: 9,
    padding: '2px 7px',
    userSelect: 'none',
  },
  right_bar_btn_overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  viewModeButton: {
    display: 'flex',
    position: 'relative',
    justifyContent: 'center',
  },
});

const View3D = (props) => {
  const dispatch = useDispatch();
  const activeViewMode = useSelector(selectActiveViewMode);
  const translation = useTranslation();
  const classes = useStyles();

  const changeViewMode = (e) => dispatch(setActiveViewMode('view3d'));

  return (
    <div className={classes.viewModeButton}>
      <Tooltip content={translation['HINT_BUTTON_3D']} side="left">
        <div
          className={
            activeViewMode == 'view3d' ? classes.right_bar_btn_active : classes.right_bar_btn
          }
          onClick={changeViewMode}
        >
          {/* TODO: Replace with "2D" icon */}
          <svg width="23" height="10" viewBox="0 0 23 10" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M21.658 8.385C21.259 8.801 20.509 9.009 19.409 9.009H11.947V0.104H19.409C20.509 0.104 21.259 0.308 21.658 0.716C22.247 1.324 22.542 2.604 22.542 4.557C22.542 6.501 22.247 7.777 21.658 8.385ZM20.839 1.965C20.587 1.522 20.106 1.3 19.396 1.3H13.273V7.813H19.396C20.115 7.813 20.598 7.594 20.845 7.156C21.092 6.717 21.216 5.851 21.216 4.557C21.216 3.272 21.09 2.408 20.839 1.965ZM8.736 8.671C8.155 9.001 6.903 9.165 4.979 9.165C2.821 9.165 1.451 8.98 0.871 8.611C0.29 8.241 0 7.329 0 5.876H1.326C1.326 6.871 1.501 7.468 1.852 7.668C2.203 7.869 3.245 7.969 4.979 7.969C6.53 7.969 7.486 7.874 7.845 7.683C8.205 7.493 8.385 6.99 8.385 6.175C8.385 5.863 8.296 5.61 8.118 5.415C7.941 5.22 7.678 5.122 7.332 5.122H3.653V3.926H7.332C7.618 3.926 7.856 3.831 8.047 3.639C8.272 3.413 8.385 3.095 8.385 2.685C8.385 2.059 8.151 1.656 7.683 1.477C7.215 1.299 6.313 1.209 4.979 1.209C3.349 1.209 2.34 1.326 1.95 1.56C1.629 1.751 1.469 2.262 1.469 3.094H0.143C0.143 1.751 0.476 0.884 1.144 0.494C1.716 0.165 2.977 0 4.927 0C6.773 0 8.003 0.152 8.619 0.456C9.347 0.812 9.711 1.558 9.711 2.695C9.711 3.216 9.641 3.606 9.503 3.867C9.364 4.127 9.143 4.349 8.84 4.531C9.42 4.722 9.711 5.295 9.711 6.249C9.711 7.49 9.386 8.298 8.736 8.671Z"
              fill="#2A3435"
            />
          </svg>
        </div>
      </Tooltip>
    </div>
  );
};

export default View3D;
