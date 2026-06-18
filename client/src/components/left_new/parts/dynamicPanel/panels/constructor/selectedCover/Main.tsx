import { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { useTranslation } from '../../../../../../../api/hooks/useTranslation';
import { planner } from '../../../../../../../initR2D';
import { selectActiveControlPanelModeData } from '../../../../../../../redux/features/control/controlPanelSlice';
import Checkbox from '../../../../../../../shared-components/inputs/checkbox';

const useStyle = createUseStyles({
  planerEditFloorWr: {
    padding: 20,
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
    borderRight: '1px solid #cdcdcd',
    height: '100%',
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
});

const Main = () => {
  const classes = useStyle();

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const translation = useTranslation();
  const currCover = planner.constr.selectedCovers()[0];

  const [currentDataKey, setCurrentDataKey] = useState(null);
  const [currentCoverArea, setCurrentCoverArea] = useState(null);

  const [isRoomNameVisible, setRoomNameVisible] = useState(
    !!currCover?.data?.title?.visible?.viewConstructor
  );
  const [isAreaTextVisible, setAreaTextVisible] = useState(
    !!currCover?.data?.title?.areaVisible?.viewConstructor
  );
  const [isCeilingVisible, setCeilingVisible] = useState(!!currCover?.getCeilingVisible?.());

  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

  const onSetCeilingVisible = (isChecked: boolean) => {
    if (currCover) {
      currCover.data.ceiling.exists = isChecked;
      currCover.data?.ceiling?.dispatchUpdate();
      planner.mih()._currentViewer?.rendererUpdate();
      setCeilingVisible(isChecked);
    }
  };

  const onSelectCover = (e) => setCurrentDataKey(e.data.key);

  const onChangeArea = () =>
    setCurrentCoverArea(
      planner.units.squareToString(planner.constr.selectedCovers()[0]?.getFillArea())
    );

  const onHideRoomName = (isChecked: boolean) => {
    if (!currCover?.data.title) return;
    currCover.data.title.visible.viewConstructor = isChecked;
    currCover.data.title.visible.view2d = isChecked;
    currCover.data.dispatchUpdate();
    WC.wallsEditor.titlesTool.updateValues(currCover.data.id);
    setRoomNameVisible(isChecked);
  };

  const onHideAreaText = (isChecked: boolean) => {
    if (!currCover?.data.title) return;
    currCover.data.title.areaVisible.viewConstructor = isChecked;
    currCover.data.title.areaVisible.view2d = isChecked;
    currCover.data.dispatchUpdate();
    WC.wallsEditor.titlesTool.updateValues(currCover.data.id);
    setAreaTextVisible(isChecked);
  };

  useEffect(() => {
    const keyTimeout = setTimeout(() => setStyleAnimation({ transform: 'translateX(0%)' }), 50);
    planner.apiConstr.addEventListener(planner.apiConstr.SELECTED_COVER_AGAIN, onSelectCover);
    planner.apiConstr.addEventListener(planner.apiConstr.CHANGE_AREA_VALUE, onChangeArea);

    return () => {
      planner.apiConstr.removeEventListener(planner.apiConstr.SELECTED_COVER_AGAIN, onSelectCover);
      planner.apiConstr.removeEventListener(planner.apiConstr.CHANGE_AREA_VALUE, onChangeArea);
      clearTimeout(keyTimeout);
    };
  }, []);

  useEffect(() => {
    if (currCover) {
      setCurrentCoverArea(planner.units.squareToString(currCover.getFillArea()));
      setRoomNameVisible(!!currCover.data.title?.visible.viewConstructor);
      setAreaTextVisible(!!currCover?.data?.title?.areaVisible?.viewConstructor);
      setCeilingVisible(!!currCover?.getCeilingVisible?.());
    }
  }, [currCover]);

  return (
    <div className={classes.planerEditFloorWr} key={currentDataKey} style={styleAnimation}>
      <Checkbox
        checked={isRoomNameVisible}
        onChange={onHideRoomName}
        label={translation['ROOM_TITLE_TEXT']}
        visualType="eye"
      />

      <Checkbox
        checked={isAreaTextVisible}
        onChange={onHideAreaText}
        label={translation['TEXT_CONSTRUCTION_ELEMENT_AREA'] + ' ' + currentCoverArea}
        visualType="eye"
      />

      <Checkbox
        checked={isCeilingVisible}
        onChange={onSetCeilingVisible}
        label={translation['TEXT_SHOW_CEIL']}
        visualType="eye"
      />
    </div>
  );
};

export default Main;
