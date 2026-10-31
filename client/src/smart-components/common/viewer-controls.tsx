import { IconWalk } from '@tabler/icons-react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import View2D from '../../components/right_new/viewModesButtons/View2D';
import View3D from '../../components/right_new/viewModesButtons/View3D';
import {
  selectActiveViewMode,
  setActiveViewMode,
} from '../../redux/features/viewMode/viewModeSlice';

const useStyles = createUseStyles({
  controls: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 5,
    display: 'flex',
    gap: 2,
    padding: 2,
    borderRadius: 3,
    backgroundColor: '#fff',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.2)',
  },
  walk: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: 3,
    background: 'none',
    cursor: 'pointer',
    '&:focus-visible': { outline: '2px solid #2F2F2F', outlineOffset: -2 },
  },
  walkActive: { backgroundColor: '#BAE51F' },
});

export default function ViewerControls() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const translation = useTranslation();
  const activeViewMode = useSelector(selectActiveViewMode);

  return (
    <div className={classes.controls}>
      <View2D />
      <View3D />
      <button
        type="button"
        aria-label={translation['PROJECT_EDIT_PUBLIC_POPUP_VIEW_WALK']}
        className={
          activeViewMode == 'viewWalk' ? `${classes.walk} ${classes.walkActive}` : classes.walk
        }
        onClick={() => dispatch(setActiveViewMode('viewWalk'))}
      >
        <IconWalk size={24} color="#424242" />
      </button>
    </div>
  );
}
