import React, { useEffect } from 'react';
import { createUseStyles } from 'react-jss';

const useStyles = createUseStyles({
  '@global': {
    '.hover_elem': {
      position: 'fixed',
      background: 'var(--color-info-bright)',
      fontSize: 12,
      width: 'max-content',
      padding: '6px 10px',
      userSelect: 'none',
      zIndex: 999,
      color: '#262626',
      pointerEvents: 'none',
      display: 'block',
      borderRadius: 3,
      '&:empty': {
        padding: 0,
      },
      '@media screen and (max-width: 950px)': {
        fontSize: 10,
      },
    },
  },
  children_elem: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});

const HoverComponent = (props) => {
  const classes = useStyles();
  let mouseDown = false;
  let tip;
  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const mouseEnter = (e) => {
    if (!mouseDown) {
      tip = document.createElement('div');
      tip.classList.add('hover_elem');
      tip.innerHTML = props.hoverText;
      document.querySelector('body').append(tip);
      if (props.hoverTextPositionX === 'left') {
        tip.style.left = e.clientX - 10 + 'px';
        tip.style.transform = 'translateX(-100%)';
      } else tip.style.left = e.clientX + 10 + 'px';

      tip.style.top = e.clientY - 15 + 'px';

      if (props.hoverTextPositionY == 'top') {
        tip.style.top = e.clientY - 20 + 'px';
      } else tip.style.top = e.clientY + 10 + 'px';
    }
  };

  const mouseMove = (e) => {
    if (!mouseDown) {
      if (!tip) return;
      if (props.hoverTextPositionX === 'left') {
        tip.style.left = e.clientX - 10 + 'px';
        tip.style.transform = 'translateX(-100%)';
      } else tip.style.left = e.clientX + 10 + 'px';
      if (props.hoverTextPositionY == 'top') {
        tip.style.top = e.clientY - 20 + 'px';
      } else tip.style.top = e.clientY + 10 + 'px';
    } else {
      document.querySelectorAll('.hover_elem').forEach((elem) => elem.remove());
    }
  };

  const mouseLeave = (e) => {
    document.querySelectorAll('.hover_elem').forEach((elem) => elem.remove());
  };

  const mouseUp = (e) => null;

  const onMouseUp = (e) => {
    mouseDown = false;
    document.removeEventListener('mouseup', onMouseUp);
  };

  const mouseDownEvent = (e) => {
    mouseDown = true;
    document.addEventListener('mouseup', onMouseUp);
    mouseLeave(e);
  };

  const onTouchStart = (e) => {
    if (!props.showOnMobile) return;
    const touch = e.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;
    tip = document.createElement('div');
    tip.classList.add('hover_elem');
    tip.innerHTML = props.hoverText;
    document.querySelector('body').append(tip);
    if (props.hoverTextPositionX === 'left') {
      tip.style.left = touchX - 10 + 'px';
      tip.style.transform = 'translateX(-100%)';
    } else tip.style.left = touchX + 10 + 'px';

    tip.style.top = touchY - 15 + 'px';

    if (props.hoverTextPositionY == 'top') {
      tip.style.top = touchY - 20 + 'px';
    } else tip.style.top = touchY + 10 + 'px';

    setTimeout(
      () => document.querySelectorAll('.hover_elem').forEach((elem) => elem.remove()),
      3000
    );
  };

  useEffect(() => {
    return () => document.querySelectorAll('.hover_elem').forEach((elem) => elem.remove());
  }, []);

  return !isCurrDeviceAPhone ? (
    <div
      className={classes.children_elem}
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
      onMouseMove={mouseMove}
      onMouseDown={mouseDownEvent}
      onMouseUp={mouseUp}
    >
      {props.children}
    </div>
  ) : (
    <div className={classes.children_elem} onTouchStart={onTouchStart}>
      {props.children}
    </div>
  );
};

export default HoverComponent;
