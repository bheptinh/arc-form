import { IconLock } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';

import { useTranslation } from '../../api/hooks/useTranslation';

const useStyle = createUseStyles({
  lock: {
    width: 'auto',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    position: 'relative',
    cursor: 'pointer',
  },
  btn_hover: {
    position: 'fixed',
    background: '#fff',
    fontSize: 12,
    width: 'max-content',
    padding: '4px 7px',
    userSelect: 'none',
    zIndex: 999,
    color: '#2A3435',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    borderRadius: 3,
    boxShadow: '0 0px 4px 0 rgba(0, 0, 0, 0.25)',
    whiteSpace: 'pre',
  },
  btn_hover_basic: {
    background: '#BADCFF',
    borderRadius: 3,
    fontFamily: 'RobotoCondensed-Regular',
    fontSize: 13,
    color: '#292A27',
    padding: '2px 3px',
    marginLeft: 5,
  },
  btn_hover_pro: {
    background: '#FFB400',
    borderRadius: 3,
    fontFamily: 'RobotoCondensed-Regular',
    fontSize: 13,
    color: '#292A27',
    padding: '2px 3px',
    marginLeft: 5,
  },
});

const Lock = (props) => {
  const classes = useStyle();

  const translation = useTranslation();
  let timeoutId = null;
  let mouseDown = false;

  const [text, setText] = useState(props.textHover);
  const [basic, setBasic] = useState(props.upgradeBasic);
  const [pro, setPro] = useState(props.upgradePro);
  const [parentClass, setParentClass] = useState(props.parentClass);
  const [parentElem, setParentElem] = useState('');

  const imgLock = useRef(null);

  const mouseEnter = (e) => {
    if (props.dontShowText) return;
    if (!mouseDown) {
      const mainDiv = e.currentTarget.closest('.' + props.parentClass);
      if (props.wrapClass) mainDiv.closest('.' + props.wrapClass).style.overflow = 'inherit';
      const hoverDiv = document.createElement('div');
      hoverDiv.classList.add(classes.btn_hover);
      hoverDiv.textContent = translation[text];

      if (basic) {
        const basicDiv = document.createElement('div');
        basicDiv.textContent = 'BASIC';
        basicDiv.classList.add(classes.btn_hover_basic);
        hoverDiv.append(basicDiv);
      }
      if (basic && pro) {
        hoverDiv.append(' ' + translation['TEXT_OR']);
      }

      if (pro) {
        const proDiv = document.createElement('div');
        proDiv.textContent = 'PRO';
        proDiv.classList.add(classes.btn_hover_pro);
        hoverDiv.append(proDiv);
      }
      document.querySelector('body').append(hoverDiv);
      if (!mainDiv) return;
      //mainDiv.style.zIndex = 9;
      if (props.tipPositionX == 'left')
        hoverDiv.style.left = e.clientX - hoverDiv.offsetWidth - 10 + 'px';
      else hoverDiv.style.left = e.clientX + 20 + 'px';
      if (props.tipPositionY == 'top')
        hoverDiv.style.top = e.clientY - hoverDiv.offsetHeight - 10 + 'px';
      else hoverDiv.style.top = e.clientY + 10 + 'px';
      timeoutId = setTimeout(() => (hoverDiv.style.opacity = '1'), 500);
    }
  };

  const mouseMove = (e) => {
    if (props.dontShowText) return;
    if (!mouseDown) {
      const mainDiv = e.currentTarget.closest('.' + props.parentClass);
      const hoverDiv = document.querySelector('.' + classes.btn_hover);
      if (!hoverDiv || !mainDiv) return;
      if (props.tipPositionX == 'left')
        hoverDiv.style.left = e.clientX - hoverDiv.offsetWidth - 10 + 'px';
      else hoverDiv.style.left = e.clientX + 20 + 'px';
      if (props.tipPositionY == 'top')
        hoverDiv.style.top = e.clientY - hoverDiv.offsetHeight - 10 + 'px';
      else hoverDiv.style.top = e.clientY + 10 + 'px';
    }
  };

  const mouseLeave = (e) => {
    clearTimeout(timeoutId);
    const mainDiv = e.currentTarget.closest('.' + props.parentClass);
    if (mainDiv) {
      const hoverDiv = document.querySelector('.' + classes.btn_hover);
      hoverDiv?.remove();
      mainDiv.removeAttribute('style');
      props.wrapClass && mainDiv.closest('.' + props.wrapClass).removeAttribute('style');
    }
  };

  const mouseUpBtn = (e) => props.onClick && props.onClick();

  const onMouseUp = (e) => {
    mouseDown = false;
    document.removeEventListener('mouseup', onMouseUp);
  };

  const mouseDownBtn = (e) => {
    mouseDown = true;
    document.addEventListener('mouseup', onMouseUp);
    mouseLeave(e);
  };

  useEffect(() => {
    setParentElem(imgLock.current.closest('.' + props.parentClass));
  }, []);

  useEffect(() => {
    if (!parentElem) return;
    parentElem.addEventListener('mouseenter', mouseEnter);
    parentElem.addEventListener('mousemove', mouseMove);
    parentElem.addEventListener('mouseleave', mouseLeave);
    parentElem.addEventListener('mousedown', mouseDownBtn);
    parentElem.addEventListener('mouseup', mouseUpBtn);

    return () => {
      if (!parentElem) return;
      parentElem.removeEventListener('mouseenter', mouseEnter);
      parentElem.removeEventListener('mousemove', mouseMove);
      parentElem.removeEventListener('mouseleave', mouseLeave);
      parentElem.removeEventListener('mousedown', mouseDownBtn);
      parentElem.removeEventListener('mouseup', mouseUpBtn);
    };
  }, [parentElem]);

  return (
    <div
      ref={imgLock}
      className={
        props.additionalClass
          ? props.additionalClass + ' prod_item_zamok_btn ' + classes.lock
          : classes.lock
      }
    >
      <IconLock size={15} color={basic ? '#C7DAED' : '#FFCB4E'} />
    </div>
  );
};

export default Lock;
