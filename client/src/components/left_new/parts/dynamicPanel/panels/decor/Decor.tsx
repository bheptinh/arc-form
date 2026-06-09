import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { selectActiveControlPanelModeData } from '../../../../../../redux/features/control/controlPanelSlice';
import Catalog from '../common/Catalog';
import ColorPicker from '../common/ColorPicker';
import Products from '../common/Products';

const useStyle = createUseStyles({
  decor: {
    position: 'absolute',
    height: '100%',
    borderLeft: '1px solid #E0E0E0',
    left: 0,
    top: 0,
    width: 311,
    zIndex: 1,
    overflow: 'hidden',
    '@media screen and (max-width: 950px)': {
      width: 190,
    },
  },
});

const Decor = (props) => {
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = activeControlPanelData?.history;
  const lastHistoryElem =
    controlPanelModeHistory && controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const lastHistoryElemType = lastHistoryElem?.type;

  let keyTimeoutClearActiveComponents, keyTimeoutOverflow;

  const [activePanelComponents, setActivePanelComponents] = useState([]);
  const [needToOverflowHidden, setNeedToOverflowHidden] = useState(true);
  const panelPreviewIcon = '/src_designer/images/icon_decor.svg';

  const classes = useStyle();

  useEffect(() => {
    if (lastHistoryElemType) {
      setActivePanelComponents((prevState) => [
        ...prevState,
        lastHistoryElemType == 'catalog' ? (
          <Catalog
            breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
            panelPreviewIcon={panelPreviewIcon}
            key={Math.random()}
          />
        ) : lastHistoryElemType == 'products' ? (
          <Products
            breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
            panelPreviewIcon={panelPreviewIcon}
            key={Math.random()}
          />
        ) : lastHistoryElemType == 'colorpicker' ? (
          <ColorPicker
            breadcrumsTitle={'MENU_BTN_TEXT_DECOR'}
            panelPreviewIcon={panelPreviewIcon}
            isAddSettingsDisabled={true}
            key={Math.random()}
            onDragColor={true}
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
    <div className={classes.decor} style={needToOverflowHidden ? { overflow: 'hidden' } : null}>
      {activePanelComponents}
    </div>
  );
};

export default Decor;
