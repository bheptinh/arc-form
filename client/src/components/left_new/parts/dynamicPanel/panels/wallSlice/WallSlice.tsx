import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { planner } from '../../../../../../initR2D';
import { selectActiveControlPanelModeData } from '../../../../../../redux/features/control/controlPanelSlice';
import Main from './Main';

const useStyle = createUseStyles({
  wallSlice: {
    position: 'absolute',
    left: 0,
    width: 310,
    height: '100%',
    borderLeft: '1px solid var(--color-border-faint)',
    zIndex: 1,
  },
});

const WallSlice = () => {
  const classes = useStyle();

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = activeControlPanelData.history;
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const lastHistoryElemType = lastHistoryElem?.type;
  let keyTimeoutClearActiveComponents;

  const [activePanelComponents, setActivePanelComponents] = useState([]);

  const tileConfigurator = planner.scene.getConfigurator();

  useEffect(() => {
    tileConfigurator.appendCanvas();
  }, []);

  useEffect(() => {
    if (lastHistoryElemType) {
      setActivePanelComponents((prevState) => [
        ...prevState,
        lastHistoryElemType == 'main' ? <Main key={Math.random()} /> : null,
      ]);
    }
  }, [controlPanelModeHistory?.length]);

  useEffect(() => {
    if (activePanelComponents.length > 2)
      setActivePanelComponents((prevState) => [
        prevState[prevState.length - 2],
        prevState[prevState.length - 1],
      ]);
    else {
      if (activePanelComponents.length > 1)
        keyTimeoutClearActiveComponents = setTimeout(
          () => setActivePanelComponents((prevState) => [prevState[prevState.length - 1]]),
          600
        );
    }
    return () => clearTimeout(keyTimeoutClearActiveComponents);
  }, [activePanelComponents]);

  return <div className={classes.wallSlice}>{activePanelComponents}</div>;
};

export default WallSlice;
