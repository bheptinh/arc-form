import { IconZoomIn, IconZoomOut } from '@tabler/icons-react';
import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { useTranslation } from '../../../api/hooks/useTranslation';
import { planner } from '../../../initR2D';
import { selectActiveViewMode } from '../../../redux/features/viewMode/viewModeSlice';
import HoverComponent from '../../left_new/parts/controlPanel/components/HoverComponent';

const useStyle = createUseStyles({
  zoomInOut_main: {
    display: 'flex',
    height: '100%',
  },
  persentOfZoom: {
    padding: '0 6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    background: '#ffffff',
    width: 38,
    fontSize: 11,
    fontWeight: 400,
    color: '#2A3435',
  },
  zoomInOutBtn: {
    cursor: 'pointer',
    background: '#fff',
    borderRadius: 3,
    border: '1px solid #fff',
    display: 'flex',
    justifyContent: 'center',
    height: '100%',
    alignItems: 'center',
    position: 'relative',
    minWidth: 30,
    marginRight: '1px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:hover': {
      background: '#E9E9E9',
    },
  },
});

const ZoomInOut = (props) => {
  const activeViewMode = useSelector(selectActiveViewMode);
  let tileConfigurator = null;
  let tileEditor = null;
  const translation = useTranslation();
  const hoverButton = useRef(null);
  const hoverButton2 = useRef(null);

  const [persentOfZoomState, setPersentOfZoomState] = useState(100);
  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  if (activeViewMode == 'tileConfig') {
    tileConfigurator = planner.scene.getConfigurator();
    tileEditor = tileConfigurator.getTileEditor();
  }

  const zoomIn = (e) => {
    activeViewMode == 'tileConfig'
      ? tileEditor.zoom(tileEditor.canvasWidth / 2, tileEditor.canvasHeight / 2, 2)
      : planner.zoomIn();
  };

  const zoomOut = (e) => {
    activeViewMode == 'tileConfig'
      ? tileEditor.zoom(tileEditor.canvasWidth / 2, tileEditor.canvasHeight / 2, -2)
      : planner.zoomOut();
  };

  const onUpdateZoomInput = (e) => {
    if (activeViewMode == 'view2d') setPersentOfZoomState(R2D.view2d.getCameraZoomPercentages());
    else if (activeViewMode == 'view3d')
      setPersentOfZoomState(R2D.view3d.getCameraZoomPercentages());
    else if (activeViewMode == 'constr')
      setPersentOfZoomState(WC.wallsEditor.getCameraZoomPercentages());
  };

  const onClickPercentagesValue = (e) => {
    planner.zoomToMax();
    if (activeViewMode == 'view2d') setPersentOfZoomState(R2D.view2d.getCameraZoomPercentages());
    else if (activeViewMode == 'view3d')
      setPersentOfZoomState(R2D.view3d.getCameraZoomPercentages());
    else if (activeViewMode == 'constr')
      setPersentOfZoomState(WC.wallsEditor.getCameraZoomPercentages());
  };

  const classes = useStyle();

  useEffect(() => {
    if (activeViewMode == 'view2d') setPersentOfZoomState(R2D.view2d.getCameraZoomPercentages());
    else if (activeViewMode == 'view3d')
      setPersentOfZoomState(R2D.view3d.getCameraZoomPercentages());
    else if (activeViewMode == 'constr')
      setPersentOfZoomState(WC.wallsEditor.getCameraZoomPercentages());
    planner.apiScene.addEventListener(planner.apiScene.UPDATE_ZOOM_INPUT, onUpdateZoomInput);
    planner.apiConstr.addEventListener(planner.apiConstr.UPDATE_ZOOM_INPUT, onUpdateZoomInput);

    return () => {
      planner.apiScene.removeEventListener(planner.apiScene.UPDATE_ZOOM_INPUT, onUpdateZoomInput);
      planner.apiConstr.removeEventListener(planner.apiConstr.UPDATE_ZOOM_INPUT, onUpdateZoomInput);
    };
  }, [activeViewMode]);

  return (
    <div className={classes.zoomInOut_main}>
      <div className={classes.zoomInOutBtn} ref={hoverButton} onClick={zoomOut}>
        <HoverComponent
          hoverText={translation['HINT_BUTTON_ZOOM_MINUS']}
          parentRef={hoverButton}
          hoverTextPositionX={'left'}
          hoverTextPositionY={'top'}
        >
          <IconZoomOut size={17} color="#2A3435" />
        </HoverComponent>
      </div>

      {!isCurrDeviceAPhone ? (
        <div className={classes.persentOfZoom} onClick={onClickPercentagesValue}>
          {persentOfZoomState + '%'}
        </div>
      ) : null}

      <div className={classes.zoomInOutBtn} ref={hoverButton2} onClick={zoomIn}>
        <HoverComponent
          hoverText={translation['HINT_BUTTON_ZOOM_PLUS']}
          parentRef={hoverButton2}
          hoverTextPositionX={'left'}
          hoverTextPositionY={'top'}
        >
          <IconZoomIn size={17} color="#2A3435" />
        </HoverComponent>
      </div>
    </div>
  );
};

export default ZoomInOut;
