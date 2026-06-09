import React, { useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../../../initR2D';
import {
  changeActiveControlPanelMode,
  selectActiveControlPanelMode,
  selectDynamicPanelStatus,
  updateDynamicPanelStatus,
} from '../../../../redux/features/control/controlPanelSlice';

const useStyle = createUseStyles({
  dynamicPanelHideBtn: {
    cursor: 'pointer',
    position: 'absolute',
    top: '50%',
    left: '100%',
    transform: `translate(calc(-100% - 5px), -50%)`,
    transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
    '@media screen and (max-width: 950px)': {
      transform: 'translate(calc(-3px), -50%)',
    },
  },
  dynamicPanelHideBtnBg: {
    width: 22,
    display: 'block',
    '& path': {
      transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover path': {
      fill: '#fbfafa',
    },
  },
  dynamicPanelHideBtnArrow: {
    position: 'absolute',
    width: 7,
    height: 12,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    margin: 'auto',
    pointerEvents: 'none',
  },
});

const DynamicPanelToggleButton = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();

  const dynamicPanelStatus = useSelector(selectDynamicPanelStatus);
  const activeControlPanelMode = useSelector(selectActiveControlPanelMode);

  const onToggleDynamicPanel = (e) => {
    if (!dynamicPanelStatus && !activeControlPanelMode) {
      const furnitureData = planner.getCatalogProducts();
      dispatch(
        changeActiveControlPanelMode({
          mode: 'furniture',
          data: {
            type: 'catalog',
            addType: 'main',
            id: null,
            lastSavedScroll: 0,
            data: furnitureData,
          },
        })
      );
    }
    if (dynamicPanelStatus && R2D.Viewers._instance.isCategoryTreePanelOpen) {
      R2D.Viewers._instance.toggleCategoryTreePanelNeedToOpenStatus(true);
    }

    dispatch(updateDynamicPanelStatus(!dynamicPanelStatus));
  };

  return (
    <div
      className={classes.dynamicPanelHideBtn + ' dynamicPanelHideBtn'}
      style={!dynamicPanelStatus ? { transform: 'translate(-3px, -50%)' } : {}}
    >
      <svg
        className={classes.dynamicPanelHideBtnBg}
        width="27"
        height="57"
        fill="none"
        viewBox="0 0 27 57"
        onClick={onToggleDynamicPanel}
      >
        <path
          stroke="#E4E4E4"
          fill="#E4E4E4"
          d="M22.992 13.163c0-2.762-2.236-5-4.997-5H8.002c-.117 0-1.479.05-2.478-1.259-.999-1.31-1.532-3.662-1.532-3.662V52s.449-1.784 1.406-3.071c.957-1.287 2.663-1.214 2.663-1.214h9.931a5 5 0 0 0 5-5V13.163Z"
        />
      </svg>

      <svg
        className={classes.dynamicPanelHideBtnArrow}
        width="8"
        height="13"
        fill="none"
        viewBox="0 0 8 13"
        style={!dynamicPanelStatus ? { transform: 'rotate(180deg)' } : null}
      >
        <path fill="#2A3435" d="m7.969 12.023-.791.791-6-6 .79-.792z" />
        <path fill="#2A3435" d="M7.969 1.218 7.177.427.985 6.619l.791.791z" />
      </svg>
    </div>
  );
};

export default DynamicPanelToggleButton;
