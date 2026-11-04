import { IconArrowLeft } from '@tabler/icons-react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import {
  controlPanelHistoryRemove,
  controlPanelUpdateBreadCrumbs,
  selectActiveControlPanelModeData,
} from '../../../../../../redux/features/control/controlPanelSlice';
import Tooltip from '../../../../../../shared-components/Tooltip';

const useStyle = createUseStyles({
  planner_catalog_btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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

  return (
    <Tooltip content={translation['HINT_BUTTON_BACK']} side="bottom">
      <div className={classes.planner_catalog_btn} onMouseUp={onPrevClick}>
        <IconArrowLeft size={16} color="#2f2f2f" />
      </div>
    </Tooltip>
  );
};

export default Prev;
