import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { selectActiveControlPanelMode } from '../../../../redux/features/control/controlPanelSlice';
import AlignDrawing from './panels/constructor/alignDrawing/AlignDrawing';
import Constructor_old from './panels/constructor/Constructor_old';
import SelectedArea from './panels/constructor/selectedArea/SelectedArea';
import SelectedCover_constr from './panels/constructor/selectedCover/SelectedCover_constr';
import Decor from './panels/decor/Decor';
import Favorites from './panels/favorites/Favorites';
import Furniture from './panels/furniture/Furniture';
import RenderMake from './panels/renderMake/RenderMake';
import ReplaceModel from './panels/replaceModel/ReplaceModel';
import Search from './panels/search/Search';
import SelectedCover from './panels/selectedConstr/selectedCover/SelectedCover';
import SelectedOtherConstrParts from './panels/selectedConstr/selectedOtherConstrParts/SelectedOtherConstrParts';
import SelectedPlinth from './panels/selectedConstr/selectedPlinth/SelectedPlinth';
import SelectedWall from './panels/selectedConstr/selectedWall/SelectedWall';
import SelectedGroup from './panels/selectedGroup/SelectedGroup';
import SelectedModel from './panels/selectedModel/SelectedModel';
import UploadModel from './panels/uploadModel/UploadModel';
import UserUpload from './panels/usersUploads/UserUpload';
import Walk from './panels/walk/Walk';
import WallSlice from './panels/wallSlice/WallSlice';

const useStyle = createUseStyles({
  dynamicPanel: {
    width: 310,
    position: 'relative',
    height: '100%',
    '@media screen and (max-width: 950px)': {
      width: 190,
    },
  },
});

const DynamicPanel = (props) => {
  const controPanelActiveMode = useSelector(selectActiveControlPanelMode);
  const [activeDynamicPanelComponents, setActiveDynamicPanelComponents] = useState([]);

  let keyTimeoutClearActiveComponents;

  const classes = useStyle();

  useEffect(() => {
    if (controPanelActiveMode) {
      setActiveDynamicPanelComponents((prevState) => [
        ...prevState,
        controPanelActiveMode == 'furniture' ? (
          <Furniture key={Math.random()} />
        ) : controPanelActiveMode == 'decor' ? (
          <Decor key={Math.random()} />
        ) : controPanelActiveMode == 'constructor' ? (
          <Constructor_old key={Math.random()} />
        ) : controPanelActiveMode == 'walk' ? (
          <Walk key={Math.random()} />
        ) : controPanelActiveMode == 'selectedModel' ? (
          <SelectedModel key={Math.random()} />
        ) : controPanelActiveMode == 'selectedOtherConstrParts' ? (
          <SelectedOtherConstrParts key={Math.random()} />
        ) : controPanelActiveMode == 'selectedCover' ? (
          <SelectedCover key={Math.random()} />
        ) : controPanelActiveMode == 'selectedPlinth' ? (
          <SelectedPlinth key={Math.random()} />
        ) : controPanelActiveMode == 'selectedWall' ? (
          <SelectedWall key={Math.random()} />
        ) : controPanelActiveMode == 'favorites' ? (
          <Favorites key={Math.random()} />
        ) : controPanelActiveMode == 'search' ? (
          <Search key={Math.random()} />
        ) : controPanelActiveMode == 'selectedGroup' ? (
          <SelectedGroup key={Math.random()} />
        ) : controPanelActiveMode == 'replaceModel' ? (
          <ReplaceModel key={Math.random()} />
        ) : controPanelActiveMode == 'renderMake' ? (
          <RenderMake key={Math.random()} />
        ) : controPanelActiveMode == 'alignDrawing' ? (
          <AlignDrawing key={Math.random()} />
        ) : controPanelActiveMode == 'uploadModel' ? (
          <UploadModel key={Math.random()} />
        ) : controPanelActiveMode == 'wallSlice' ? (
          <WallSlice key={Math.random()} />
        ) : controPanelActiveMode == 'userUpload' ? (
          <UserUpload key={Math.random()} />
        ) : controPanelActiveMode == 'selectedCover_constr' ? (
          <SelectedCover_constr key={Math.random()} />
        ) : controPanelActiveMode == 'selectedArea' ? (
          <SelectedArea key={Math.random()} />
        ) : null,
      ]);
    }
  }, [controPanelActiveMode]);

  useEffect(() => {
    if (activeDynamicPanelComponents.length > 2)
      setActiveDynamicPanelComponents((prevState) => [
        prevState[prevState.length - 2],
        prevState[prevState.length - 1],
      ]);
    else {
      if (activeDynamicPanelComponents.length > 1)
        setTimeout(
          () => setActiveDynamicPanelComponents((prevState) => [prevState[prevState.length - 1]]),
          600
        );
    }
    return () => clearTimeout(keyTimeoutClearActiveComponents);
  }, [activeDynamicPanelComponents]);

  return (
    <div className={classes.dynamicPanel + ' dynamicPanel'}>{activeDynamicPanelComponents}</div>
  );
};

export default DynamicPanel;
