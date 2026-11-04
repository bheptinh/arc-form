import { IconFocusCentered } from '@tabler/icons-react';
import React from 'react';
import { createUseStyles } from 'react-jss';

import { useTranslation } from '../../../api/hooks/useTranslation';
import { planner } from '../../../initR2D';
import Tooltip from '../../../shared-components/Tooltip';

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
  return (
    <Tooltip content={translation['HINT_BUTTON_TO_CENTER']}>
      <div className={classes.toCenter_main} onClick={planner.toCenter}>
        <IconFocusCentered size={17} color="#2A3435" />
      </div>
    </Tooltip>
  );
};

export default ToCenter;
