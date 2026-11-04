import { IconLock, IconLockOpen } from '@tabler/icons-react';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import { planner } from '../../../initR2D';
import { removeQuickPanelAll } from '../../../redux/features/quickPanels/quickPanelsSlice';
import Tooltip from '../../../shared-components/Tooltip';

const useStyle = createUseStyles({
  info_model_btn: {
    width: 32,
    height: 32,
    background: 'var(--color-white)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    position: 'relative',
    borderRadius: 3,
    border: '1px solid var(--color-white)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '& img': {
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
  info_model_main: {},
});

export const LockRef = forwardRef(({ onClick, addStyles, isLockedOnScene }, ref) => (
  <Lock isLockedOnScene={isLockedOnScene} onClick={onClick} addStyles={addStyles} reference={ref} />
));

const Lock = (props) => {
  const translation = useTranslation();
  const [mouseDown, setMouseDown] = useState(false);
  const dispatch = useDispatch();
  const classes = useStyle();
  const btnLock = useRef(null);
  const timeoutId = undefined;
  const mainDiv = props.reference.current.mainDiv;

  const onLockDown = () => {
    clearTimeout(timeoutId);
    document.addEventListener('mouseup', onMouseUp);
    setMouseDown(true);
  };

  const onLockUp = () => {
    clearTimeout(timeoutId);
    setMouseDown(false);
    props.onClick();
  };

  const onMouseUp = (e) => {
    clearTimeout(timeoutId);
    document.removeEventListener('mouseup', onMouseUp);
    if (!e.target.closest('.' + classes.info_model_btn)) setMouseDown(false);
  };

  const onClickWhenSelectedLocked = (e) => {
    if (e.target.closest('canvas')) return;
    if (props && !e.target.closest('.' + mainDiv.current?.classList[0])) {
      planner.mih().unsetActiveObjectProduct();
      planner.mih().unsetActiveGroup();
      planner.mih().changeState(planner.mih().stateMain);
      dispatch(removeQuickPanelAll());
    }
  };

  useEffect(() => {
    if (props.isLockedOnScene) {
      document.addEventListener('click', onClickWhenSelectedLocked);
    } else {
      document.removeEventListener('click', onClickWhenSelectedLocked);
    }

    return () => document.removeEventListener('click', onClickWhenSelectedLocked);
  }, [props.isLockedOnScene]);

  return (
    <Tooltip
      content={
        props.isLockedOnScene ? translation['HINT_BUTTON_LOCKED'] : translation['HINT_BUTTON_LOCK']
      }
      side="bottom"
    >
      <div
        className={classes.info_model_btn}
        style={props.addStyles ? { ...props.addStyles } : null}
        ref={btnLock}
      >
        {props.isLockedOnScene ? (
          <IconLock size={16} color="#2D2D2D" />
        ) : (
          <IconLockOpen size={16} color="#2D2D2D" />
        )}
        <div
          className={classes.info_model_btn_overlay}
          onMouseUp={onLockUp}
          onMouseDown={onLockDown}
        ></div>
      </div>
    </Tooltip>
  );
};
