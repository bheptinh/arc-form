import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

// import 'lazysizes';
import { selectActiveControlPanelModeData } from '../../../../../../redux/features/control/controlPanelSlice';
import Panorams from './components/Panorams';

const useStyle = createUseStyles({
  walk: {
    position: 'absolute',
    left: 0,
    height: '100%',
    width: 310,
    top: 0,
    overflow: 'hidden',
    borderLeft: '1px solid var(--color-border-faint)',
    zIndex: 1,
    '@media screen and (max-width: 950px)': {
      width: 190,
    },
  },
});

const Walk = (props) => {
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = activeControlPanelData.history;
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const lastHistoryElemType = lastHistoryElem?.type;
  let keyTimeoutClearActiveComponents;

  const [activePanelComponents, setActivePanelComponents] = useState([]);

  const classes = useStyle();

  useEffect(() => {
    if (lastHistoryElemType) {
      setActivePanelComponents((prevState) => [
        ...prevState,
        lastHistoryElemType == 'panorams' ? <Panorams key={Math.random()} /> : null,
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

  return <div className={classes.walk}>{activePanelComponents}</div>;
};

export default Walk;
