import React, { forwardRef } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { planner } from '../../../initR2D';
import {
  changeActiveControlPanelMode,
  selectControlPanelData,
  selectPrevControlPanelMode,
} from '../../../redux/features/control/controlPanelSlice';
import { removeQuickPanelAll } from '../../../redux/features/quickPanels/quickPanelsSlice';
import HoverComponent from '../../left_new/parts/controlPanel/components/HoverComponent';
import { useTranslation } from '../../../api/hooks/useTranslation';

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
    prevControlPanelMode
      ? dispatch(changeActiveControlPanelMode({ mode: prevControlPanelMode }))
      : dispatch(
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

    dispatch(removeQuickPanelAll());
  };

  const documentMouseUp = (e) => {
    document.removeEventListener('mouseup', documentMouseUp);
    document.removeEventListener('touchend', documentMouseUp);
  };

  const mouseDownDelete = (e) => {
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
        <svg width="19" height="14" viewBox="0 0 19 14" fill="none">
          <path
            d="M9.56126 1.20752C5.02354 1.20752 1.96696 5.02123 0.995838 6.42455C0.780033 6.7364 0.780033 7.13319 0.995838 7.44504C1.96696 8.84836 5.02354 12.6621 9.56126 12.6621C14.099 12.6621 17.1556 8.84836 18.1267 7.44504C18.3425 7.13319 18.3425 6.7364 18.1267 6.42455C17.1556 5.02123 14.099 1.20752 9.56126 1.20752Z"
            stroke="black"
            strokeWidth="1.2"
          />
          <path
            d="M12.7338 6.93431C12.7338 8.74184 11.313 10.2071 9.56025 10.2071C7.80762 10.2071 6.38672 8.74184 6.38672 6.93431C6.38672 6.44046 6.49283 5.97201 6.68281 5.55216C6.98928 4.87483 7.51403 4.32366 8.16369 3.99473C8.5851 3.7814 9.05911 3.66162 9.56025 3.66162C11.313 3.66162 12.7338 5.12691 12.7338 6.93431Z"
            fill="#2D2D2D"
          />
        </svg>
        <div
          className={classes.info_model_btn_overlay}
          onMouseDown={mouseDownDelete}
          onMouseUp={onHideSelectedElem}
        ></div>
      </div>
    </HoverComponent>
  );
};

export default Hide;
