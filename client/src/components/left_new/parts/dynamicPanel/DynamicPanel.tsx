import cls from 'classnames';
import { ReactNode } from 'react';
import { useSelector } from 'react-redux';

import { selectActiveControlPanelMode } from '../../../../redux/features/control/controlPanelSlice';
import { useScreenStack } from './panels/common/PanelStack';
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
import classes from './DynamicPanel.module.css';

const modes: Record<string, () => ReactNode> = {
  furniture: () => <Furniture />,
  decor: () => <Decor />,
  constructor: () => <Constructor_old />,
  walk: () => <Walk />,
  selectedModel: () => <SelectedModel />,
  selectedOtherConstrParts: () => <SelectedOtherConstrParts />,
  selectedCover: () => <SelectedCover />,
  selectedPlinth: () => <SelectedPlinth />,
  selectedWall: () => <SelectedWall />,
  favorites: () => <Favorites />,
  search: () => <Search />,
  selectedGroup: () => <SelectedGroup />,
  replaceModel: () => <ReplaceModel />,
  renderMake: () => <RenderMake />,
  alignDrawing: () => <AlignDrawing />,
  uploadModel: () => <UploadModel />,
  wallSlice: () => <WallSlice />,
  userUpload: () => <UserUpload />,
  selectedCover_constr: () => <SelectedCover_constr />,
  selectedArea: () => <SelectedArea />,
};

const DynamicPanel = () => {
  const controPanelActiveMode = useSelector(selectActiveControlPanelMode);

  const { stack } = useScreenStack(
    controPanelActiveMode,
    controPanelActiveMode ? () => modes[controPanelActiveMode]?.() : undefined
  );

  return <div className={cls(classes.dynamicPanel, 'dynamicPanel')}>{stack}</div>;
};

export default DynamicPanel;
