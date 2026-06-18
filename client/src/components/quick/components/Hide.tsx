import { IconEye } from '@tabler/icons-react';
import React, { forwardRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import { planner } from '../../../initR2D';
import {
  changeActiveControlPanelMode,
  selectControlPanelData,
  selectPrevControlPanelMode,
} from '../../../redux/features/control/controlPanelSlice';
import { removeQuickPanelAll } from '../../../redux/features/quickPanels/quickPanelsSlice';
import HoverComponent from '../../left_new/parts/controlPanel/components/HoverComponent';

const useStyle = createUseStyles({
  info_model_btn: {
    position: 'relative',
    width: 32,
    height: 32,
    background: '#fff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    borderRadius: 3,
    border: '1px solid #fff',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '& svg': {
      userSelect: 'none',
      pointerEvents: 'none',
    },
    '&:hover': {
      background: '#E9E9E9',
    },
  },
  info_model_btn_overlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

export const HideRef = forwardRef(({ typeToHide, addStyles }, ref) => (
  <Hide typeToHide={typeToHide} addStyles={addStyles} reference={ref} />
));

const Hide = (props) => {
  const classes = useStyle();

  const dispatch = useDispatch();

  const addStyles = props.addStyles;
  const translation = useTranslation();

  const controlPanelData = useSelector(selectControlPanelData);
  const prevControlPanelMode = useSelector(selectPrevControlPanelMode);

  const onHideSelectedElem = (e) => {
    const data = planner.scene.getCurrentSceneObject()
      ? planner.scene.getCurrentSceneObject().objectId
      : planner.scene.getCurrentConstructorElementData()
        ? planner.scene.getCurrentConstructorElementData().type == 'topPlinth' ||
          planner.scene.getCurrentConstructorElementData().type == 'bottomPlinth'
          ? planner.scene.getCurrentConstructorElementData().wall.id
          : planner.scene.getCurrentConstructorElementData().id
        : planner.scene
            .getCurrentGroup()
            ?.getObjViews()
            .map((i) => i.sceneObject.objectId);

    planner.scene.makeElementHidden(props.typeToHide, data);
    planner.mih().unsetActiveObject();

    const furnitureData = planner.getCatalogProducts();
    if (prevControlPanelMode) {
      dispatch(changeActiveControlPanelMode({ mode: prevControlPanelMode }));
    } else {
      dispatch(
        changeActiveControlPanelMode({
          mode: 'furniture',
          data:
            controlPanelData['furniture'].history.length < 1
              ? {
                  type: 'catalog',
                  addType: 'main',
                  id: null,
                  lastSavedScroll: 0,
                  data: furnitureData,
                }
              : null,
        })
      );
    }

    dispatch(removeQuickPanelAll());
  };

  const documentMouseUp = () => {
    document.removeEventListener('mouseup', documentMouseUp);
    document.removeEventListener('touchend', documentMouseUp);
  };

  const mouseDownDelete = () => {
    document.addEventListener('mouseup', documentMouseUp);
    document.addEventListener('touchend', documentMouseUp);
  };

  return (
    <HoverComponent hoverText={translation['HINT_BUTTON_HIDE_PANEL']}>
      <div
        className={classes.info_model_btn}
        ref={props.reference}
        style={addStyles ? { ...addStyles } : null}
      >
        <IconEye size={16} color="#2D2D2D" />
        <div
          className={classes.info_model_btn_overlay}
          onMouseDown={mouseDownDelete}
          onMouseUp={onHideSelectedElem}
        ></div>
      </div>
    </HoverComponent>
  );
};
