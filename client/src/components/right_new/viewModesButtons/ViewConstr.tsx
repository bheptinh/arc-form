import { IconTopologyRing3 } from '@tabler/icons-react';
import React, { useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import { removeQuickPanelAll } from '../../../redux/features/quickPanels/quickPanelsSlice';
import {
  selectActiveViewMode,
  setActiveViewMode,
} from '../../../redux/features/viewMode/viewModeSlice';
import HoverComponent from '../../left_new/parts/controlPanel/components/HoverComponent';

const useStyles = createUseStyles({
  right_bar_btn: {
    background: 'var(--color-white)',
    cursor: 'pointer',
    height: 36,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    position: 'relative',
    borderRadius: 3,
    border: '2px solid var(--color-white)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      background: 'var(--color-surface-muted)',
    },
  },
  right_bar_btn_active: {
    background: 'var(--color-accent)',
    position: 'relative',
    '& path, & circle, & rect': {
      fill: '#424242',
    },
    height: 36,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: 36,
    borderRadius: 3,
    border: '2px solid var(--color-white)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
  },
  viewModeButton: {
    position: 'relative',
  },
});

type ViewConstrProps = {
  onClick?: () => void;
};

const ViewConstr = (props: ViewConstrProps) => {
  const dispatch = useDispatch();
  const activeViewMode = useSelector(selectActiveViewMode);
  const translation = useTranslation();
  const classes = useStyles();
  const mainDiv = useRef(null);

  const changeViewMode = () => {
    dispatch(removeQuickPanelAll());
    dispatch(setActiveViewMode('constr'));
    props?.onClick?.();
  };

  return (
    <div className={classes.viewModeButton} ref={mainDiv}>
      <HoverComponent
        hoverText={translation['HINT_BUTTON_CONSTRUCTOR']}
        parentRef={mainDiv}
        hoverTextPositionX={'left'}
      >
        <div
          className={
            activeViewMode == 'constr' ? classes.right_bar_btn_active : classes.right_bar_btn
          }
          onClick={changeViewMode}
        >
          <IconTopologyRing3 size={20} color="#ffffff" />
        </div>
      </HoverComponent>
    </div>
  );
};

export default ViewConstr;
