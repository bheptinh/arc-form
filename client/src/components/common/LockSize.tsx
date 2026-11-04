// TODO: move to shared-components/ once props are typed and domain imports (Redux) are extracted
import { IconLink, IconUnlink } from '@tabler/icons-react';
import { useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { changeLockState } from '../../redux/features/common/commonSlice';
import Tooltip from '../../shared-components/Tooltip';

const useStyle = createUseStyles({
  lock_main: {
    display: 'flex',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    '& svg': {
      width: 16,
    },
  },
  lock_main_overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  zamokLock: {
    opacity: '.5',
  },
});

const LockSize = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const translation = useTranslation();

  const mainDiv = useRef(null);

  const mouseUpLock = (e) => {
    if (props.isFixedSize) return;
    dispatch(changeLockState(!props.lockState));
  };

  return (
    <Tooltip content={translation['HINT_LOCK_DIMENSIONS']} side="bottom">
      <div
        className={classes.lock_main}
        ref={mainDiv}
        style={{
          right: props.right,
          top: props.top,
          cursor: props.isFixedSize ? 'auto' : 'pointer',
        }}
      >
        {props.isFixedSize ? (
          <IconLink className={classes.zamokLock} size={17} color="#444444" />
        ) : props.lockState ? (
          <IconLink size={17} color="#444444" />
        ) : (
          <IconUnlink size={17} color="#444444" />
        )}
        <div className={classes.lock_main_overlay} onMouseUp={mouseUpLock}></div>
      </div>
    </Tooltip>
  );
};

export default LockSize;
