import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../../initR2D';
import {
  changeImagePlanUploadType,
  selectImagePlanUploadedType,
} from '../../../redux/features/constructor/constructorSlice';
import {
  changeActiveControlPanelMode,
  updateControlPanelStatus,
} from '../../../redux/features/control/controlPanelSlice';
import { removeQuickPanelAll } from '../../../redux/features/quickPanels/quickPanelsSlice';
import {
  selectActiveViewMode,
  setActiveViewMode,
} from '../../../redux/features/viewMode/viewModeSlice';
import { useTranslation } from '../../../api/hooks/useTranslation';

const bar_settings_dropdown_title = {
  background: '#DADADA',
  fontSize: 13,
  padding: 7,
  display: 'flex',
  height: 29,
};

const useStyles = createUseStyles({
  bar_dropdown_wrap: {
    position: 'relative',
    width: 30,
    margin: '0 1px 1px 0',
    zIndex: 1,
    '&:hover': {
      pointerEvents: 'auto',
      '&  $bar_dropdown_option_wrap': {
        pointerEvents: 'auto',
      },
      '&  $bar_dropdown_option_wr': {
        transform: 'translateX(0%)',
        pointerEvents: 'auto',
      },
    },
  },
  bar_dropdown_title: {
    extend: bar_settings_dropdown_title,
    alignItems: 'center',
  },
  bar_dropdown_active: {
    cursor: 'pointer',
    width: 30,
    height: 30,
    borderRadius: 3,
    background: 'var(--color-white)',
    border: '1px solid var(--color-white)',
    boxShadow: '0px 0px 3px 0px rgba(0, 0, 0, 0.12)',
    display: 'flex',
    alignItems: 'center',
    color: 'var(--color-white)',
    fontSize: 11,
    justifyContent: 'center',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    position: 'relative',
    zIndex: 2,
    '&:hover': {
      background: 'var(--color-surface-muted)',
      color: 'var(--color-highlight)',
    },
  },
  bar_dropdown_option_wrap: {
    top: '-4px',
    right: 'calc(100% - 2px)',
    padding: '4px',
    zIndex: -2,
    overflow: 'hidden',
    position: 'absolute',
    minWidth: 'fit-content',
    pointerEvents: 'none',
  },
  bar_dropdown_option_wr: {
    transform: 'translateX(calc(100% + 15px))',
    boxShadow: '0px 0px 7px 0px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    borderRadius: 3,
    pointerEvents: 'auto',
    overflow: 'hidden',
  },

  bar_dropdown_option: {
    background: 'var(--color-white)',
    cursor: 'pointer',
    height: 30,
    alignItems: 'center',
    fontSize: 12,
    color: 'var(--color-text-slate)',
    padding: '0 15px 0 30px',
    whiteSpace: 'nowrap',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    gridTemplateColumns: '24px auto',
    gridGap: 21,
    display: 'grid',
    '&:hover': {
      background: 'var(--color-surface-muted)',
    },
  },
  bar_dropdown_option_active: {
    background: 'var(--color-accent)',
    pointerEvents: 'none',
  },
  arrow_right_down: {
    width: 0,
    height: 0,
    borderLeft: '5px solid transparent',
    borderBottom: '5px solid var(--color-white)',
    position: 'absolute',
    right: 3,
    bottom: 3,
  },
});

const ImagePlan = (props) => {
  const translation = useTranslation();
  const classes = useStyles();

  const isImagePlanUploaded = useSelector(selectImagePlanUploadedType);
  const activeViewMode = useSelector(selectActiveViewMode);
  const dispatch = useDispatch();

  const imagePlanStates = [
    {
      type: 0,
      translation: 'FLOORPLAN_OFF',
      drawType: WC.DRAWING_HIDE,
      img: '/src_designer/images/plan_hidden_dark.svg',
    },
    {
      type: 1,
      translation: 'FLOORPLAN_BELOW',
      drawType: WC.DRAWING_BELOW,
      img: '/src_designer/images/plan_down_dark.svg',
    },
    {
      type: 2,
      translation: 'FLOORPLAN_ABOVE',
      drawType: WC.DRAWING_ABOVE,
      img: '/src_designer/images/plan_up_dark.svg',
    },
  ];

  const [imagePlanStatesDataReact, setImagePlanStatesDataReact] = useState(null);

  const onClickImagePlanStatesItem = (newType) => {
    imagePlanStates.forEach((i) => {
      if (i.type == newType) {
        WC.wallsEditor.drawingPosition = i.drawType;
        WC.wallsEditor.draw();
      }
    });

    R2D.commonSceneHelper.drawingHelper.setState(newType);

    dispatch(changeImagePlanUploadType(newType));
  };

  const onImagePlanSettingsClick = (e) => {
    dispatch(updateControlPanelStatus(false));
    planner.mih().unsetActiveObject();
    planner['constr'].activate();
    WC.wallsEditor.changeState(WC.WallsEditor._instance.stateAlignDrawing);
    WC.wallsEditor.state.changeToModeAfter(activeViewMode);
    dispatch(removeQuickPanelAll());
    dispatch(setActiveViewMode('constr'));
    dispatch(changeActiveControlPanelMode({ mode: 'alignDrawing', data: { type: 'main' } }));
  };

  useEffect(() => {
    const imagePlanStatesData = [];
    imagePlanStates.forEach((item) => {
      imagePlanStatesData.push(
        <div
          key={item.type}
          className={
            classes.bar_dropdown_option +
            ' ' +
            (item.type == isImagePlanUploaded ? classes.bar_dropdown_option_active : '')
          }
          onClick={(e) => onClickImagePlanStatesItem(item.type)}
        >
          <img src={item.img} />
          {translation[item.translation]}
        </div>
      );
    });
    setImagePlanStatesDataReact(imagePlanStatesData);
  }, [isImagePlanUploaded, translation]);

  return (
    <div className={classes.bar_dropdown_wrap}>
      <div className={classes.bar_dropdown_active}>
        <img src={imagePlanStates[isImagePlanUploaded].img} />
        <span className={classes.arrow_right_down}></span>
      </div>
      <div className={classes.bar_dropdown_option_wrap}>
        <div className={classes.bar_dropdown_option_wr}>
          {imagePlanStatesDataReact}
          <div className={classes.bar_dropdown_option} onClick={onImagePlanSettingsClick}>
            <img src="/src_designer/images/draw_walls/icon_edit_plan.svg" style={{ width: 18 }} />
            {translation['BUTTON_SETTING_PLAN']}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePlan;
