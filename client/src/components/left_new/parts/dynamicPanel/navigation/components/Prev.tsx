import { IconArrowLeft } from '@tabler/icons-react';
import { useRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import {
  controlPanelHistoryRemove,
  controlPanelUpdateBreadCrumbs,
  selectActiveControlPanelModeData,
} from '../../../../../../redux/features/control/controlPanelSlice';
import HoverComponent from '../../../controlPanel/components/HoverComponent';

const useStyle = createUseStyles({
  planner_catalog_btn: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    position: 'relative',
    '& svg': {
      marginRight: '7px',
      cursor: 'pointer',
      '& path': {
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
      },
    },
    '&:hover': {
      '& path': {
        fill: '#939393',
      },
    },
  },
  planner_catalog_btn_not_active: {
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      marginRight: '7px',
      cursor: 'pointer',
      opacity: 0.3,
    },
    cursor: 'default',
  },
});

const Prev = (props) => {
  const translation = useTranslation();
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const currentStateBreadCrumbs = activeControlPanelData?.breadCrumbs;

  const classes = useStyle();

  const dispatch = useDispatch();

  const onPrevClick = () => {
    dispatch(controlPanelHistoryRemove());

    if (currentStateBreadCrumbs && currentStateBreadCrumbs.length > 0) {
      dispatch(controlPanelUpdateBreadCrumbs({ data: null, updateType: 'remove' }));
    }
  };

  const hoverButton = useRef(null);

  return (
    <div className={classes.planner_catalog_btn} ref={hoverButton} onMouseUp={onPrevClick}>
      <HoverComponent hoverText={translation['HINT_BUTTON_BACK']} parentRef={hoverButton}>
        <IconArrowLeft size={16} color="#2f2f2f" />
      </HoverComponent>
    </div>
  );
};

export default Prev;
