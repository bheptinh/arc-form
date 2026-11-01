import { IconArrowsMaximize, IconArrowsMinimize } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';

import { useTranslation } from '../../../api/hooks/useTranslation';
import { planner } from '../../../initR2D';
import HoverComponent from '../../left_new/parts/controlPanel/components/HoverComponent';

const useStyle = createUseStyles({
  fullScreen_main: {
    cursor: 'pointer',
    background: 'var(--color-white)',
    borderRadius: 3,
    border: '1px solid var(--color-white)',
    display: 'flex',
    justifyContent: 'center',
    height: '100%',
    alignItems: 'center',
    position: 'relative',
    minWidth: 30,
    marginRight: '1px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      background: 'var(--color-surface-muted)',
    },
  },
});
const FullScreen = (props) => {
  const classes = useStyle();

  const [isFullScreen, setIsFullScreen] = useState(false);

  const onClickFullScreen = () => {
    if (isFullScreen) {
      planner.fullscreenOff();
    } else {
      planner.fullscreen(false);
    }
    setIsFullScreen(!isFullScreen);
  };
  const translation = useTranslation();
  const hoverButton = useRef(null);
  return (
    <div className={classes.fullScreen_main} onClick={onClickFullScreen} ref={hoverButton}>
      {isFullScreen ? (
        <HoverComponent
          hoverText={translation['HINT_FULLSCREEN']}
          parentRef={hoverButton}
          hoverTextPositionX={'left'}
          hoverTextPositionY={'top'}
        >
          <IconArrowsMinimize size={17} color="#2A3435" />
        </HoverComponent>
      ) : (
        <HoverComponent
          hoverText={translation['HINT_FULLSCREEN']}
          parentRef={hoverButton}
          hoverTextPositionX={'left'}
          hoverTextPositionY={'top'}
        >
          <IconArrowsMaximize size={17} color="#2A3435" />
        </HoverComponent>
      )}
    </div>
  );
};

export default FullScreen;
