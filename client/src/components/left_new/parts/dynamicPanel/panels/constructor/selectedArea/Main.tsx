import { IconTrash } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../../../../../../api/hooks/useTranslation';
import { planner } from '../../../../../../../initR2D';
import {
  changeActiveControlPanelMode,
  selectActiveControlPanelModeData,
} from '../../../../../../../redux/features/control/controlPanelSlice';
import Checkbox from '../../../../../../../shared-components/inputs/checkbox';
import ChangeSize from '../../../../../../common/ChangeSize';

const useStyle = createUseStyles({
  planerWallsCont: {
    top: 0,
    left: 0,
    width: 309,
    height: '100%',
    display: 'grid',
    position: 'absolute',
    background: 'var(--color-surface-subtle)',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
    borderRight: '1px solid var(--color-border-light)',
  },
  planerWallsWrap: {
    height: '100%',
    overflow: 'auto',
    background: 'var(--color-white)',
    padding: 20,
  },
  planerWallsTitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 15,
    color: '#505050',
  },
  divide_checkbox_wr: {
    marginBottom: 15,
  },
  planerChangeSizes: {
    gridTemplateColumns: 'auto 28% 16px',
    alignItems: 'center',
    gridGap: '5px 0',
    marginBottom: 20,
  },
  planerDelete: {
    height: 120,
    border: '1px solid var(--color-surface-grey)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      background: '#FFCC00',
    },
  },
});

const Main = () => {
  const classes = useStyle();
  const dispatch = useDispatch();

  const [wallSegmentHeight, setWallSegmentHeight] = useState(
    planner.constr.stateSelectedArea()[0]?.getHeight()
  );
  const [ceilingHeight, setCeilingHeight] = useState(
    planner.constr.stateSelectedArea()[0]?.getCeilingHeight()
  );

  const translation = useTranslation();
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;

  const [mouseDown, setMouseDown] = useState({ status: false, action: null, type: null });
  const [checkboxStatus, setСheckboxStatus] = useState(
    !!planner.constr.stateSelectedArea()[0]?.getCeilingVisible()
  );

  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

  const onChangeHeight = (mouseDown, value, type) => {
    setMouseDown({ ...mouseDown, type });
    switch (type) {
      case 'segment':
        setWallSegmentHeight(planner.units.stringToValue(planner.units.valueToString(value)));
        planner.constr.setAreaHeight(
          planner.units.stringToValue(planner.units.valueToString(value))
        );
        break;

      case 'ceiling':
        setCeilingHeight(planner.units.stringToValue(planner.units.valueToString(value)));
        planner.constr.setAreaCeilingHeight(
          planner.units.stringToValue(planner.units.valueToString(value))
        );
        break;
    }
  };

  const onDeleteSelected = () => {
    planner.constr.delSelectedAreas();
    dispatch(changeActiveControlPanelMode({ mode: 'constructor' }));
  };
  const onChangeCeilingVisible = (isChecked: boolean) => {
    planner.constr.setAreaCeilingVisible(isChecked);
    setСheckboxStatus(isChecked);
  };

  useEffect(() => {
    setStyleAnimation({ transform: 'translateX(0%)' });
  }, []);

  return (
    <div className={classes.planerWallsCont} style={styleAnimation}>
      <div className={classes.planerWallsWrap}>
        <div className={classes.planerChangeSizes}>
          <ChangeSize
            mouseDown={mouseDown}
            valueChangeType={'segment'}
            changeValue={onChangeHeight}
            value={wallSegmentHeight}
            label={'Висота сегменту стіни'}
          />
          <ChangeSize
            mouseDown={mouseDown}
            valueChangeType={'ceiling'}
            changeValue={onChangeHeight}
            value={ceilingHeight}
            label={'Висота стелі'}
          />
        </div>

        <div className={classes.divide_checkbox_wr}>
          <Checkbox
            label={translation['TEXT_CEILING_SHOW']}
            name={'ceilingVisible'}
            onChange={onChangeCeilingVisible}
            checked={checkboxStatus}
          />
        </div>
        <div className={classes.planerDelete} onClick={onDeleteSelected}>
          <IconTrash size={25} color="#626262" />
        </div>
      </div>
    </div>
  );
};

export default Main;
