import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

import { planner } from '../../../initR2D';
import { removeQuickPanelAll } from '../../../redux/features/quickPanels/quickPanelsSlice';
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

export const LockRef = forwardRef(({ onClick, addStyles, isLockedOnScene }, ref) => (
  <Lock isLockedOnScene={isLockedOnScene} onClick={onClick} addStyles={addStyles} reference={ref} />
));

const Lock = (props) => {
  const translation = useTranslation();
  const [mouseDown, setMouseDown] = useState(false);
  const dispatch = useDispatch();
  const classes = useStyle();
  const btnLock = useRef(null);
  const timeoutId = null;
  const mainDiv = props.reference.current.mainDiv;

  const onLockDown = (e) => {
    clearTimeout(timeoutId);
    document.addEventListener('mouseup', onMouseUp);
    setMouseDown(true);
  };

  const onLockUp = (e) => {
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
    props.isLockedOnScene
      ? document.addEventListener('click', onClickWhenSelectedLocked)
      : document.removeEventListener('click', onClickWhenSelectedLocked);
    return () => document.removeEventListener('click', onClickWhenSelectedLocked);
  }, [props.isLockedOnScene]);

  return (
    <HoverComponent
      hoverText={
        props.isLockedOnScene ? translation['HINT_BUTTON_LOCKED'] : translation['HINT_BUTTON_LOCK']
      }
    >
      <div
        className={classes.info_model_btn}
        style={props.addStyles ? { ...props.addStyles } : null}
        ref={btnLock}
      >
        {props.isLockedOnScene ? (
          <svg width="12" height="17" viewBox="0 0 12 17" fill="none">
            <rect x="0.730469" y="7.67188" width="11.1712" height="8.93693" rx="1" fill="#2D2D2D" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.67685 5.04549L3.67685 7.67145H2.21952V5.05725C2.21952 5.03772 2.21937 5.01553 2.2192 4.99091C2.21667 4.62069 2.21035 3.69495 2.65475 2.84162C2.90501 2.36108 3.31003 1.87395 3.95232 1.51353C4.59489 1.15294 5.38662 0.96875 6.31485 0.96875C7.24308 0.96875 8.03481 1.15294 8.67738 1.51353C9.31966 1.87396 9.72468 2.36109 9.97493 2.84163C10.4193 3.69486 10.413 4.62051 10.4105 4.99074C10.4103 5.01541 10.4102 5.03762 10.4102 5.05717V7.67145H8.95284V5.04529C8.95285 4.64687 8.98955 3.89368 8.76953 3.47119C8.67169 3.28331 8.49289 2.89789 8.16797 2.63525C7.70316 2.25954 7.41797 2.08539 6.31485 2.08539C5.76879 2.08539 5.13672 2.15869 4.52734 2.63525C4.05619 3.00372 3.91425 3.28331 3.81641 3.47119C3.59634 3.89376 3.67682 4.64712 3.67685 5.04549Z"
              fill="#2D2D2D"
            />
          </svg>
        ) : (
          <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.1417 4.18221L3.1417 6.80817H1.68436V4.19396L1.68404 4.12763C1.68151 3.75741 1.67519 2.83167 2.11959 1.97834C2.36985 1.4978 2.77488 1.01067 3.41716 0.650248C4.05973 0.289659 4.85146 0.105469 5.77969 0.105469C6.70792 0.105469 7.49965 0.289659 8.14222 0.650251C8.7845 1.01068 9.18952 1.49781 9.43977 1.97834C9.88411 2.83158 9.87785 3.75723 9.87534 4.12746L9.87502 4.19389V4.54102H8.41769V4.18201C8.41769 4.1358 8.41818 4.08482 8.41871 4.03014C8.42275 3.61333 8.42888 2.9814 8.23438 2.60791L8.20674 2.55418C8.10407 2.35342 7.92926 2.01159 7.63281 1.77197C7.168 1.39626 6.88281 1.22211 5.77969 1.22211C5.23364 1.22211 4.60156 1.29541 3.99219 1.77197C3.52702 2.13575 3.38276 2.41291 3.28501 2.6007L3.28125 2.60791C3.10337 2.94948 3.12185 3.50716 3.13549 3.91881L3.13549 3.91882C3.13873 4.01644 3.14169 4.10585 3.1417 4.18221ZM8.41769 6.80664V6.80817H9.87502V6.80664H8.41769ZM0.195312 7.8086C0.195312 7.25631 0.643028 6.80859 1.19531 6.80859H10.3665C10.9188 6.80859 11.3665 7.25631 11.3665 7.80859V14.7455C11.3665 15.2978 10.9188 15.7455 10.3665 15.7455H1.19531C0.643027 15.7455 0.195312 15.2978 0.195312 14.7455V7.8086Z"
              fill="#2D2D2D"
            />
          </svg>
        )}
        <div
          className={classes.info_model_btn_overlay}
          onMouseUp={onLockUp}
          onMouseDown={onLockDown}
        ></div>
      </div>
    </HoverComponent>
  );
};

