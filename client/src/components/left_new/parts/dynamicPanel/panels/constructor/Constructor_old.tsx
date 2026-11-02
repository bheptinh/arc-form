import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { planner } from '../../../../../../initR2D';
import {
  changeWallsHeight,
  selectImagePlanUploadedType,
  selectMaxWallsHeight,
  selectMinWallsHeight,
  selectWallsHeight,
} from '../../../../../../redux/features/constructor/constructorSlice';
import {
  changeActiveControlPanelMode,
  selectActiveControlPanelModeData,
  updateControlPanelStatus,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import { changeUndoRedo } from '../../../../../../redux/features/topPanel/topPanelSlice';
import { ActionList } from '../../../../../../shared-components/ActionList';
import ChangeSize from '../../../../../common/ChangeSize';
import classes from './Constructor_old.module.css';

const Constructor_old = (props) => {
  const translation = useTranslation();
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const isImagePlanUploaded = useSelector(selectImagePlanUploadedType);

  const [activeState, setActiveState] = useState('stateEditing');
  const dispatch = useDispatch();
  const wallsHeight = useSelector(selectWallsHeight);

  const minWallsHeight = useSelector(selectMinWallsHeight);
  const maxWallsHeight = useSelector(selectMaxWallsHeight);

  const [mouseDown, setMouseDown] = useState({ status: false, action: null });
  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

  const changeConstrState = (newState) => {
    planner.constr.finish();
    if (activeState == newState && newState != 'stateEditing') {
      dispatch(changeUndoRedo());
      document.removeEventListener('keydown', props.onKeyDownConstr);
      WC.WallsEditor._instance.changeState(WC.WallsEditor._instance.stateEditing);
      return changeConstrState('stateEditing');
    } else {
      document.addEventListener('keydown', props.onKeyDownConstr);

      switch (newState) {
        case 'stateMakeRoom':
          WC.wallsEditor.stateMakingRoom.cut = false;
          break;
        case 'stateCutRoom':
          WC.wallsEditor.stateMakingRoom.cut = true;
          break;
        case 'stateMakeCover':
          WC.wallsEditor.stateMakingCover.cut = false;
          break;
        case 'stateCutCover':
          WC.wallsEditor.stateMakingCover.cut = true;
          break;
        default:
          break;
      }
      planner.constr[newState] && planner.constr[newState]();
    }
    setActiveState(newState);
  };

  const onChangeSize = (mouseDown, value) => {
    setMouseDown({ ...mouseDown });
    if (!value || isNaN(value)) value = 0;

    if (value < minWallsHeight) {
      value = minWallsHeight;
    }
    if (value > maxWallsHeight) {
      value = maxWallsHeight;
    }

    dispatch(changeWallsHeight(value));
    planner.constr.setWallsHeight(value);
    !mouseDown.status &&
      planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
  };

  const onUploadPlan = () => {
    dispatch(setActivePopup({ name: 'uploadPlanPopup' }));
  };

  const onImagePlanSettingsClick = () => {
    dispatch(updateControlPanelStatus(false));
    WC.WallsEditor._instance.changeState(WC.WallsEditor._instance.stateAlignDrawing);
    dispatch(changeActiveControlPanelMode({ mode: 'alignDrawing', data: { type: 'main' } }));
  };

  const onChangeConstrState = (e) => changeConstrState(e.data.state);

  useEffect(() => {
    setStyleAnimation({ transform: 'translateX(0%)' });
    planner.apiConstr.addEventListener(planner.apiConstr.STATE_CONSTR_STOP, onChangeConstrState);
    return () => {
      document.removeEventListener('keydown', props.onKeyDownConstr);
      planner.apiConstr.removeEventListener(
        planner.apiConstr.STATE_CONSTR_STOP,
        onChangeConstrState
      );
    };
  }, []);

  useEffect(() => {
    if (activeState == 'stateEditing') {
      WC.wallsEditor.api.dispatchEvent(
        new Event(WC.wallsEditor.api.BOTTOM_HELPER_TAB_BTN, { status: false })
      );
    }
  }, [activeState]);

  return (
    <div className={classes.planerConstructor}>
      <div className={classes.planner_catalog_cont} style={styleAnimation}>
        <div className={classes.catalog_wr}>
          <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
            <div className={classes.planerWallsHeight} id="changerWallsHeight">
              <ChangeSize
                mouseDown={mouseDown}
                textAlign={'right'}
                changeValue={onChangeSize}
                value={wallsHeight}
                label={translation['TEXT_WALLS_HAIGHT']}
              />
            </div>
            <ActionList size="small" iconFit="contain">
              <ActionList.Item
                label={translation['TEXT_BUTTON_DRAW_WALL']}
                icon={<img src="/src_designer/images/draw_walls/icon_wall.svg" alt="" />}
                active={activeState == 'stateMakeWall'}
                onClick={() => changeConstrState('stateMakeWall')}
              />

              <ActionList.Item
                label={translation['TEXT_BUTTON_DRAW_ROOM']}
                icon={<img src="/src_designer/images/draw_walls/icon_room.svg" alt="" />}
                active={activeState == 'stateMakeRect'}
                onClick={() => changeConstrState('stateMakeRect')}
              />

              <ActionList.Item
                label={translation['TEXT_BUTTON_DRAW_FILL']}
                icon={
                  <img src="/src_designer/images/draw_walls/icon_custom_shpare_wall.svg" alt="" />
                }
                active={activeState == 'stateMakeRoom'}
                onClick={() => changeConstrState('stateMakeRoom')}
              />

              <ActionList.Item
                label={translation['TEXT_BUTTON_CUT_FILL']}
                icon={<img src="/src_designer/images/draw_walls/icon_wall_cutout.svg" alt="" />}
                active={activeState == 'stateCutRoom'}
                onClick={() => changeConstrState('stateCutRoom')}
              />

              <ActionList.Item
                label={translation['TEXT_BUTTON_DRAW_FLOOR']}
                icon={<img src="/src_designer/images/draw_walls/icon_floor.svg" alt="" />}
                active={activeState == 'stateMakeCover'}
                onClick={() => changeConstrState('stateMakeCover')}
              />

              <ActionList.Item
                label={translation['TEXT_BUTTON_CUT_FLOOR']}
                icon={<img src="/src_designer/images/draw_walls/icon_floor_cutout.svg" alt="" />}
                active={activeState == 'stateCutCover'}
                onClick={() => changeConstrState('stateCutCover')}
              />

              <ActionList.Item
                label={translation['BUTTON_START_LOWER_CONTOUR']}
                icon={
                  <img src="/src_designer/images/draw_walls/icon_change_wall_height.svg" alt="" />
                }
                active={activeState == 'stateSetWallHeight'}
                onClick={() => changeConstrState('stateSetWallHeight')}
              />

              {isImagePlanUploaded != null ? (
                <ActionList.Item
                  label={translation['BUTTON_SETTING_PLAN']}
                  icon={<img src="/src_designer/images/draw_walls/icon_edit_plan.svg" alt="" />}
                  onClick={onImagePlanSettingsClick}
                />
              ) : (
                <ActionList.Item
                  label={translation['BUTTON_UPLOAD_PLAN']}
                  icon={
                    <img src="/src_designer/images/draw_walls/icon_upload_floorplan.svg" alt="" />
                  }
                  onClick={onUploadPlan}
                />
              )}
            </ActionList>
          </SimpleBar>
        </div>
      </div>
    </div>
  );
};

export default Constructor_old;
