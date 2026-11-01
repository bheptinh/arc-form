import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { closeActivePopup, selectPopups } from '../../redux/features/popups/popupsSlice';
import classes from './complete-message.module.css';

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
