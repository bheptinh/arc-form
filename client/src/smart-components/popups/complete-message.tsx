import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { closeActivePopup, selectPopups } from '../../redux/features/popups/popupsSlice';
import { useTranslation } from '../../api/hooks/useTranslation';

const useStyle = createUseStyles({
  alert_status_wr: {
    position: 'absolute',
    top: 34,
    fontSize: 12,
    color: '#2A3435',
    right: 0,
    padding: '7px 11px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
    borderRadius: 3,
    zIndex: 10000,
    pointerEvents: 'none',
  },
  alert_status_done: {
    background: '#BAE51F',
  },
  alert_status_error: {
    background: '#AF3131',
  },
  alert_status_icon: {
    width: 13,
    marginRight: 6,
  },
  alert_status_left: {},
  alert_status_right: {},
});

const CompleteMessage = (props) => {
  const popups = useSelector(selectPopups);
  const translation = useTranslation();
  const doneText = translation[popups.completeMessage.data];
  const positionX = popups.completeMessage.positionX;
  const type = popups.completeMessage.type;
  const doneDiv = useRef(null);
  const isPositionRight = positionX == 'right';
  const dispatch = useDispatch();
  const [isShow, setShow] = useState(true);

  const variants = {
    hidden: {
      transform: isPositionRight ? 'translateX(100%)' : 'translateX(100%)',
    },
    visible: {
      transform: 'translateX(0)',
    },
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => setShow(!isShow), 4700);
    const timeoutId_1 = setTimeout(
      () => dispatch(closeActivePopup({ name: 'completeMessage' })),
      5000
    );

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(timeoutId_1);
    };
  }, []);

  const classes = useStyle();

  return (
    <AnimatePresence>
      {isShow && (
        <motion.div
          exit={{ transform: isPositionRight ? 'translateX(100%)' : 'translateX(100%)' }}
          animate={'visible'}
          initial={'hidden'}
          variants={variants}
          className={cx(classes.alert_status_wr, {
            [classes.alert_status_done]: !type || type == 'complete',
            [classes.alert_status_error]: type == 'error',
            [classes.alert_status_left]: !isPositionRight,
            [classes.alert_status_right]: isPositionRight,
          })}
          ref={doneDiv}
        >
          <img className={classes.alert_status_icon} src="/src_designer/images/icon_check.svg" />
          {doneText}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompleteMessage;
