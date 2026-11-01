import { IconFocusCentered } from '@tabler/icons-react';
import React, { useRef } from 'react';
import { createUseStyles } from 'react-jss';

import { useTranslation } from '../../../api/hooks/useTranslation';
import { planner } from '../../../initR2D';
import HoverComponent from '../../left_new/parts/controlPanel/components/HoverComponent';

const useStyle = createUseStyles({
  toCenter_main: {
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

const ToCenter = (props) => {
  const classes = useStyle();
  const translation = useTranslation();
  const hoverButton = useRef(null);
  return (
    <div className={classes.toCenter_main} ref={hoverButton} onClick={planner.toCenter}>
      <HoverComponent
        hoverText={translation['HINT_BUTTON_TO_CENTER']}
        parentRef={hoverButton}
        hoverTextPositionX={'left'}
        hoverTextPositionY={'top'}
      >
        <IconFocusCentered size={17} color="#2A3435" />
      </HoverComponent>
    </div>
  );
};

export default ToCenter;
