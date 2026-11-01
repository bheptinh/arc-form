import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { selectActiveControlPanelModeData } from '../../../../../../redux/features/control/controlPanelSlice';
import Material from '../common/Material';
import Main from './Main';

const useStyle = createUseStyles({
  favorites: {
    position: 'absolute',
    height: '100%',
    borderLeft: '1px solid var(--color-border-faint)',
    left: 0,
    top: 0,
    width: 310,
    zIndex: 1,
    '@media screen and (max-width: 950px)': {
      width: 190,
    },
  },
});

const Favorites = () => {
  const classes = useStyle();
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = activeControlPanelData.history;
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const lastHistoryElemType = lastHistoryElem?.type;
  let keyTimeoutClearActiveComponents, keyTimeoutOverflow;

  const [activePanelComponents, setActivePanelComponents] = useState([]);
  const [needToOverflowHidden, setNeedToOverflowHidden] = useState(true);

  useEffect(() => {
    if (lastHistoryElemType) {
      setActivePanelComponents((prevState) => [
        ...prevState,
        lastHistoryElemType == 'main' ? (
          <Main key={Math.random()} />
        ) : lastHistoryElemType == 'material' ? (
          <Material key={Math.random()} />
        ) : null,
      ]);
    }
  }, [controlPanelModeHistory.length]);

  useEffect(() => {
    setNeedToOverflowHidden(true);
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
      else keyTimeoutOverflow = setTimeout(() => setNeedToOverflowHidden(false), 600);
    }
    return () => {
      clearTimeout(keyTimeoutClearActiveComponents);
      clearTimeout(keyTimeoutOverflow);
    };
  }, [activePanelComponents]);

  return (
    <div className={classes.favorites} style={needToOverflowHidden ? { overflow: 'hidden' } : null}>
      {activePanelComponents}
    </div>
  );
};

export default Favorites;
