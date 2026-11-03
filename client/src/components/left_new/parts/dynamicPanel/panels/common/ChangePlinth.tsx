import { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { planner } from '../../../../../../initR2D';
import {
  selectActiveControlPanelModeData,
  selectDynamicPanelPreviewViewType,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { changeUndoRedo } from '../../../../../../redux/features/topPanel/topPanelSlice';
import { TileGrid } from '../../../../../../shared-components/TileGrid';
import SelectTile from '../../../../../../smart-components/catalog/select-tile';
import type { Product } from '../../../../../../smart-components/catalog/tile-parts';
import ChangeSize from '../../../../../common/ChangeSize';
import Navigation from '../../navigation/Navigation';

const useStyle = createUseStyles({
  planner_catalog_cont: {
    borderRight: '1px solid var(--color-border-light)',
    background: 'var(--color-white)',
    height: '100%',
    display: 'grid',
    alignContent: 'baseline',
    gridTemplateRows: 'auto 1fr',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
    width: 309,
    position: 'absolute',
    left: 0,
    top: 0,
    '@media screen and (max-width: 950px)': {
      width: 189,
    },
  },
  catalog_wr: {
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    borderTop: '1px solid var(--color-border)',
  },
  planerWallsInfo: {
    padding: '20px 14px',
    '@media screen and (max-width: 950px)': {
      padding: 5,
    },
  },
  planerWallsTitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 15,
    color: '#505050',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      marginBottom: 5,
    },
  },
  planerChangeSizes: {
    display: 'grid',
    justifyContent: 'flex-start',
  },
  planerWallsCurentMatWr: {
    display: 'grid',
    gridTemplateColumns: 100,
    justifyContent: 'center',
    marginBottom: 20,
  },
});

const ChangePlinth = (props) => {
  const classes = useStyle();
  const translation = useTranslation();
  const dispatch = useDispatch();
  const dynamicPanelPreviewViewType = useSelector(selectDynamicPanelPreviewViewType);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const currentPlinthType = lastHistoryElem.data;

  let currObj = R2D.scene.currentView3DObject;
  let constructionData = currObj?.getConstructorElementData();
  constructionData = currentPlinthType
    ? currentPlinthType == 'molding'
      ? constructionData?.topPlinth
      : constructionData?.bottomPlinth
    : constructionData;

  const [plinthHeight, setPlinthHeight] = useState(constructionData?.h);
  const [plinthDepth, setPlinthDepth] = useState(constructionData?.d);

  const [mouseDown, setMouseDown] = useState({ status: false, action: null, type: null });
  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

  const [activeShape, setActiveShape] = useState(constructionData?.shapeNum);

  const onChangeSize = (mouseDown, value, type) => {
    setMouseDown({ ...mouseDown, type });
    constructionData[type] = value;
    constructionData.dispatchUpdate();
    planner.scene.rebuildAllPlinths();
    type == 'h' ? setPlinthHeight(value) : setPlinthDepth(value);

    if (mouseDown.status == false) {
      planner.mih()._scene.history.saveState();
      dispatch(changeUndoRedo());
    }
    !mouseDown.status &&
      planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
  };

  const onChangePlinthType = (id: Product['id']) => {
    if (id == constructionData.shapeNum) return;
    setActiveShape(id);

    WC.plinthCreator.loadSVG(id).then(() => {
      constructionData.shapeNum = id;
      constructionData.h = WC.plinthCreator.PoolPlinthShape[id].defHeight;
      constructionData.d = WC.plinthCreator.PoolPlinthShape[id].defDepth;
      constructionData.dispatchUpdate();
      planner.scene.rebuildAllPlinths();
      setPlinthHeight(constructionData.h);
      setPlinthDepth(constructionData.d);
      R2D.scene.history.saveState();

      currObj = planner.mih()._scene.currentView3DObject;
      constructionData = currObj.getConstructorElementData();
      constructionData = currentPlinthType
        ? currentPlinthType == 'molding'
          ? constructionData.topPlinth
          : constructionData.bottomPlinth
        : constructionData;
      setPlinthDepth(constructionData.d);
      setPlinthHeight(constructionData.h);
      planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
    });
  };

  // Plinth and molding profiles of the edited element's kind, built by the engine.
  const plinthsList = useMemo(() => {
    let curType = '';
    if (currentPlinthType) curType = currentPlinthType === 'molding' ? 'moldings' : 'plinths';
    else curType = constructionData.type === 'topPlinth' ? 'moldings' : 'plinths';
    return WC.plinthCreator.getPlinthsList(curType);
  }, [currentPlinthType, constructionData?.type]);

  useEffect(() => {
    setStyleAnimation({ transform: 'translateX(0%)' });
  }, []);

  return (
    <div style={styleAnimation} className={classes.planner_catalog_cont}>
      <Navigation
        panelPreviewIcon={props.panelPreviewIcon}
        breadcrumsTitle={props.breadcrumsTitle}
        hideCategoryTree={props.hideCategoryTree}
        closeButtonStatus={props.closeButtonStatus}
      />
      <div className={classes.catalog_wr}>
        <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
          <div className={classes.planerWallsWr}>
            <div className={classes.planerWallsInfo}>
              <div
                className={classes.planerWallsTitle}
              >{`${translation['LENGTH']} ${planner.units.valueToString(constructionData?.length)} ${R2D.DimensionSystem.getName()}`}</div>

              <div className={classes.planerChangeSizes}>
                <ChangeSize
                  mouseDown={mouseDown}
                  valueChangeType={'h'}
                  zeroNotAllowed={true}
                  changeValue={onChangeSize}
                  value={plinthHeight}
                  label={translation['HEIGHT']}
                />
                <ChangeSize
                  mouseDown={mouseDown}
                  valueChangeType={'d'}
                  zeroNotAllowed={true}
                  changeValue={onChangeSize}
                  value={plinthDepth}
                  label={translation['DEPTH']}
                />
              </div>
            </div>

            <TileGrid size={dynamicPanelPreviewViewType}>
              {plinthsList.map((elem: Product) => (
                <SelectTile
                  key={elem.id}
                  product={elem}
                  active={elem.id == activeShape}
                  onSelect={() => onChangePlinthType(elem.id)}
                />
              ))}
            </TileGrid>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default ChangePlinth;
