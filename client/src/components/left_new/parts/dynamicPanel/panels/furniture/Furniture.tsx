import React, { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { selectActiveControlPanelModeData } from '../../../../../../redux/features/control/controlPanelSlice';
import Catalog from '../common/Catalog';
import Products from '../common/Products';

const useStyle = createUseStyles({
  furniture: {
    position: 'absolute',
    height: '100%',
    borderLeft: '1px solid #E0E0E0',
    left: 0,
    width: 310,
    zIndex: 1,
    overflow: 'hidden',
    '@media screen and (max-width: 950px)': {
      width: 190,
    },
  },
});

const Furniture = (props) => {
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = activeControlPanelData?.history;
  const lastHistoryElem =
    controlPanelModeHistory && controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const lastHistoryElemType = lastHistoryElem?.type;

  let keyTimeoutClearActiveComponents, keyTimeoutOverflow;

  const [activePanelComponents, setActivePanelComponents] = useState([]);
  const [needToOverflowHidden, setNeedToOverflowHidden] = useState(true);

  const classes = useStyle();

  const furnitureRef = useRef(null);
  const panelPreviewIcon = '/src_designer/images/icon_mebli.svg';

  useEffect(() => {
    if (lastHistoryElemType) {
      setActivePanelComponents((prevState) => [
        ...prevState,
        lastHistoryElemType == 'catalog' ? (
          <Catalog
            breadcrumsTitle={'HINT_PRODUCTS_CATALOG'}
            panelPreviewIcon={panelPreviewIcon}
            key={Math.random()}
          />
        ) : lastHistoryElemType == 'products' ? (
          <Products
            breadcrumsTitle={'HINT_PRODUCTS_CATALOG'}
            panelPreviewIcon={panelPreviewIcon}
            showUploadNewPlashka={true}
            key={Math.random()}
          />
        ) : null,
      ]);
    }
  }, [lastHistoryElem?.id]);

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
    <div
      className={classes.furniture}
      ref={furnitureRef}
      style={needToOverflowHidden ? { overflow: 'hidden' } : null}
    >
      {activePanelComponents}
    </div>
  );
};

export default Furniture;
