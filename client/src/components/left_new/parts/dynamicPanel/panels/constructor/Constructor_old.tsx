import React, { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
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
import ChangeSize from '../../../../../common/ChangeSize';

const useStyle = createUseStyles({
  planerConstructor: {
    position: 'absolute',
    height: '100%',
    borderLeft: '1px solid var(--color-border-faint)',
    left: 0,
    top: 0,
    width: 310,
    overflow: 'hidden',
    zIndex: 1,
  },
  planner_catalog_cont: {
    borderRight: '1px solid var(--color-border-light)',
    background: 'var(--color-white)',
    height: '100%',
    display: 'grid',
    alignContent: 'baseline',
    gridTemplateRows: '1fr',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
    width: 309,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  catalog_wr: {
    overflow: 'hidden',
    height: '100%',
    position: 'relative',
    background: 'var(--color-white)',
    borderTop: '1px solid var(--color-border)',
  },
  planerWallsHeight: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: '10px 0',
    alignItems: 'center',
  },
  planerConstItemWrap: {
    width: '100%',
  },
  planerConstItem: {
    borderBottom: '1px solid var(--color-surface-muted)',
    background: 'var(--color-white)',
    height: 72,
    display: 'grid',
    gridTemplateColumns: '55px auto',
    padding: '0 28px',
    alignItems: 'center',
    cursor: 'pointer',
    gridGap: 11,
    position: 'relative',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    zIndex: 1,
    '&:after': {
      content: '""',
      height: 29,
      width: '100%',
      background: 'linear-gradient(to bottom, var(--color-surface-warm), transparent)',
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
      position: 'absolute',
      top: 0,
      left: 0,
      zIndex: '-1',
    },
    '&:hover': {
      '& $planner_cat_item_hover_left': {
        height: '100%',
      },
      '& $planner_cat_item_hover_top': {
        width: '100%',
      },
      '& $planner_cat_item_hover_right': {
        height: '100%',
      },
      '& $planner_cat_item_hover_bottom': {
        width: '100%',
      },
      '&:after': {
        opacity: 0,
      },
    },
    '& img:not(.planner_catalog_prem_add_img)': {
      maxWidth: '100%',
      maxHeight: '100%',
    },
  },
  planerConstItemActive: {
    background: 'var(--color-accent-soft)',
    '&:after': {
      opacity: 0,
    },
  },
  planner_cat_item_hover_left: {
    width: 2,
    height: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    zIndex: 1,
    background: 'var(--color-border)',
    transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:before': {
      content: '" "',
      position: 'absolute',
      left: '100%',
      top: 2,
      height: 'calc(100% - 4px)',
      width: 1,
      background: 'var(--color-white)',
    },
  },
  planner_cat_item_hover_top: {
    width: 0,
    height: 2,
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    zIndex: 1,
    background: 'var(--color-border)',
    transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:before': {
      content: '" "',
      position: 'absolute',
      top: '100%',
      left: 2,
      width: 'calc(100% - 4px)',
      height: 1,
      background: 'var(--color-white)',
    },
  },
  planner_cat_item_hover_right: {
    width: 2,
    height: 0,
    position: 'absolute',
    bottom: 0,
    right: 0,
    pointerEvents: 'none',
    zIndex: 1,
    background: 'var(--color-border)',
    transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:before': {
      content: '" "',
      position: 'absolute',
      right: '100%',
      top: 2,
      height: 'calc(100% - 4px)',
      width: 1,
      background: 'var(--color-white)',
    },
  },
  planner_cat_item_hover_bottom: {
    width: 0,
    height: 2,
    position: 'absolute',
    bottom: 0,
    right: 0,
    pointerEvents: 'none',
    zIndex: 1,
    background: 'var(--color-border)',
    transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
    '&:before': {
      content: '" "',
      position: 'absolute',
      bottom: '100%',
      left: 2,
      width: 'calc(100% - 4px)',
      height: 1,
      background: 'var(--color-white)',
    },
  },
  planerConstItemImgWr: {
    width: 55,
    height: 46,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planerConstItemImg: {},
  planerConstItemText: {
    color: 'var(--color-text)',
    fontSize: 14,
    fontFamily: 'RobotoCondensed-Regular',
  },
  planerConstItemCloseWr: {
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'none',
  },
  planerConstItemClose: {},
  roll_out_right: {
    transform: 'translateX(100%)',
  },
  plannerOrderPlanFloor: {
    position: 'relative',
    cursor: 'pointer',
    '&:after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      width: 'calc(100%)',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 1,
      boxShadow: 'inset 0 0 0 0px var(--color-accent)',
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      '&:after': {
        boxShadow: 'inset 0 0 0 4px var(--color-accent)',
      },
    },
  },
  plannerOrderPlanFloor_img: {
    transition: 'all .3s ease',
    '& > img': {
      width: '100%',
      display: 'block',
    },
  },
  plannerOrderPlanFloor_text: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    color: 'var(--color-white)',
  },
  plannerOrderPlanFloor_text_title: {
    fontSize: 16,
    marginBottom: 7,
    textTransform: 'uppercase',
    maxWidth: 110,
    lineHeight: 1.3,
    '@media screen and (max-width: 950px)': {
      fontSize: 13,
      maxWidth: 100,
    },
  },
  plannerOrderPlanFloor_text_subtitle: {
    fontSize: 14,
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
    },
  },
});

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

  const onUploadPlan = async (e) => {
    dispatch(setActivePopup({ name: 'uploadPlanPopup' }));
  };

  const onImagePlanSettingsClick = (e) => {
    dispatch(updateControlPanelStatus(false));
    WC.WallsEditor._instance.changeState(WC.WallsEditor._instance.stateAlignDrawing);
    dispatch(changeActiveControlPanelMode({ mode: 'alignDrawing', data: { type: 'main' } }));
  };

  const onChangeConstrState = (e) => changeConstrState(e.data.state);

  const onOrderFloorPlanClick = (e) =>
    window.open(R2D.config.data.additional.orderFloorPlanUrl, '_blank');

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

  const classes = useStyle();
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

            <div className={classes.planerConstItemWrap}>
              <div
                className={
                  activeState == 'stateMakeWall'
                    ? classes.planerConstItem + ' ' + classes.planerConstItemActive
                    : classes.planerConstItem
                }
                onClick={(e) => changeConstrState('stateMakeWall')}
              >
                <div className={classes.planner_cat_item_hover_left}></div>
                <div className={classes.planner_cat_item_hover_top}></div>
                <div className={classes.planner_cat_item_hover_right}></div>
                <div className={classes.planner_cat_item_hover_bottom}></div>

                <div className={classes.planerConstItemImgWr}>
                  <img
                    className={classes.planerConstItemImg}
                    src="/src_designer/images/draw_walls/icon_wall.svg"
                  />
                </div>
                <div className={classes.planerConstItemText}>
                  {translation['TEXT_BUTTON_DRAW_WALL']}
                </div>

                {activeState == 'stateMakeWall' && (
                  <div className={classes.planerConstItemCloseWr}>
                    <img
                      className={classes.planerConstItemClose}
                      src="/src_designer/images/icon_close.svg"
                    />
                  </div>
                )}
              </div>

              <div
                className={
                  activeState == 'stateMakeRect'
                    ? classes.planerConstItem + ' ' + classes.planerConstItemActive
                    : classes.planerConstItem
                }
                onClick={(e) => changeConstrState('stateMakeRect')}
              >
                <div className={classes.planner_cat_item_hover_left}></div>
                <div className={classes.planner_cat_item_hover_top}></div>
                <div className={classes.planner_cat_item_hover_right}></div>
                <div className={classes.planner_cat_item_hover_bottom}></div>

                <div className={classes.planerConstItemImgWr}>
                  <img
                    className={classes.planerConstItemImg}
                    src="/src_designer/images/draw_walls/icon_room.svg"
                  />
                </div>
                <div className={classes.planerConstItemText}>
                  {translation['TEXT_BUTTON_DRAW_ROOM']}
                </div>
              </div>

              <div
                className={
                  activeState == 'stateMakeRoom'
                    ? classes.planerConstItem + ' ' + classes.planerConstItemActive
                    : classes.planerConstItem
                }
                onClick={(e) => changeConstrState('stateMakeRoom')}
              >
                <div className={classes.planner_cat_item_hover_left}></div>
                <div className={classes.planner_cat_item_hover_top}></div>
                <div className={classes.planner_cat_item_hover_right}></div>
                <div className={classes.planner_cat_item_hover_bottom}></div>

                <div className={classes.planerConstItemImgWr}>
                  <img
                    className={classes.planerConstItemImg}
                    src="/src_designer/images/draw_walls/icon_custom_shpare_wall.svg"
                  />
                </div>
                <div
                  className={classes.planerConstItemText}
                  dangerouslySetInnerHTML={{ __html: translation['TEXT_BUTTON_DRAW_FILL'] }}
                ></div>
              </div>

              <div
                className={
                  activeState == 'stateCutRoom'
                    ? classes.planerConstItem + ' ' + classes.planerConstItemActive
                    : classes.planerConstItem
                }
                onClick={(e) => changeConstrState('stateCutRoom')}
              >
                <div className={classes.planner_cat_item_hover_left}></div>
                <div className={classes.planner_cat_item_hover_top}></div>
                <div className={classes.planner_cat_item_hover_right}></div>
                <div className={classes.planner_cat_item_hover_bottom}></div>

                <div className={classes.planerConstItemImgWr}>
                  <img
                    className={classes.planerConstItemImg}
                    src="/src_designer/images/draw_walls/icon_wall_cutout.svg"
                  />
                </div>
                <div className={classes.planerConstItemText}>
                  {translation['TEXT_BUTTON_CUT_FILL']}
                </div>
              </div>

              <div
                className={
                  activeState == 'stateMakeCover'
                    ? classes.planerConstItem + ' ' + classes.planerConstItemActive
                    : classes.planerConstItem
                }
                onClick={(e) => changeConstrState('stateMakeCover')}
              >
                <div className={classes.planner_cat_item_hover_left}></div>
                <div className={classes.planner_cat_item_hover_top}></div>
                <div className={classes.planner_cat_item_hover_right}></div>
                <div className={classes.planner_cat_item_hover_bottom}></div>

                <div className={classes.planerConstItemImgWr}>
                  <img
                    className={classes.planerConstItemImg}
                    src="/src_designer/images/draw_walls/icon_floor.svg"
                  />
                </div>
                <div className={classes.planerConstItemText}>
                  {translation['TEXT_BUTTON_DRAW_FLOOR']}
                </div>
              </div>

              <div
                className={
                  activeState == 'stateCutCover'
                    ? classes.planerConstItem + ' ' + classes.planerConstItemActive
                    : classes.planerConstItem
                }
                onClick={(e) => changeConstrState('stateCutCover')}
              >
                <div className={classes.planner_cat_item_hover_left}></div>
                <div className={classes.planner_cat_item_hover_top}></div>
                <div className={classes.planner_cat_item_hover_right}></div>
                <div className={classes.planner_cat_item_hover_bottom}></div>

                <div className={classes.planerConstItemImgWr}>
                  <img
                    className={classes.planerConstItemImg}
                    src="/src_designer/images/draw_walls/icon_floor_cutout.svg"
                  />
                </div>
                <div className={classes.planerConstItemText}>
                  {translation['TEXT_BUTTON_CUT_FLOOR']}
                </div>
              </div>

              <div
                className={
                  activeState == 'stateSetWallHeight'
                    ? classes.planerConstItem + ' ' + classes.planerConstItemActive
                    : classes.planerConstItem
                }
                onClick={(e) => changeConstrState('stateSetWallHeight')}
              >
                <div className={classes.planner_cat_item_hover_left}></div>
                <div className={classes.planner_cat_item_hover_top}></div>
                <div className={classes.planner_cat_item_hover_right}></div>
                <div className={classes.planner_cat_item_hover_bottom}></div>

                <div className={classes.planerConstItemImgWr}>
                  <img
                    className={classes.planerConstItemImg}
                    src="/src_designer/images/draw_walls/icon_change_wall_height.svg"
                  />
                </div>
                <div className={classes.planerConstItemText}>
                  {translation['BUTTON_START_LOWER_CONTOUR']}
                </div>
              </div>

              {isImagePlanUploaded != null ? (
                <div className={classes.planerConstItem} onClick={onImagePlanSettingsClick}>
                  <div className={classes.planner_cat_item_hover_left}></div>
                  <div className={classes.planner_cat_item_hover_top}></div>
                  <div className={classes.planner_cat_item_hover_right}></div>
                  <div className={classes.planner_cat_item_hover_bottom}></div>

                  <div className={classes.planerConstItemImgWr}>
                    <img
                      className={classes.planerConstItemImg}
                      src="/src_designer/images/draw_walls/icon_edit_plan.svg"
                    />
                  </div>
                  <div
                    className={classes.planerConstItemText}
                    dangerouslySetInnerHTML={{ __html: translation['BUTTON_SETTING_PLAN'] }}
                  ></div>
                </div>
              ) : (
                <div className={classes.planerConstItem} onClick={onUploadPlan}>
                  <div className={classes.planner_cat_item_hover_left}></div>
                  <div className={classes.planner_cat_item_hover_top}></div>
                  <div className={classes.planner_cat_item_hover_right}></div>
                  <div className={classes.planner_cat_item_hover_bottom}></div>

                  <div className={classes.planerConstItemImgWr}>
                    <img
                      className={classes.planerConstItemImg}
                      src="/src_designer/images/draw_walls/icon_upload_floorplan.svg"
                    />
                  </div>
                  <div className={classes.planerConstItemText}>
                    {translation['BUTTON_UPLOAD_PLAN']}
                  </div>
                </div>
              )}
            </div>
            {R2D.config.data.additional.orderFloorPlanUrl ? (
              <div className={classes.plannerOrderPlanFloor} onClick={onOrderFloorPlanClick}>
                <div className={classes.plannerOrderPlanFloor_img}>
                  <img src="/src_designer/images/order_plan_floor_new.png" alt="" />
                </div>

                <div className={classes.plannerOrderPlanFloor_text}>
                  <div className={classes.plannerOrderPlanFloor_text_title}>
                    {translation['ORDER_FLOOR_PLAN_TITLE']}
                  </div>
                  <div className={classes.plannerOrderPlanFloor_text_subtitle}>
                    {translation['ORDER_FLOOR_PLAN_SUBTITLE']}
                  </div>
                </div>
              </div>
            ) : null}
          </SimpleBar>
        </div>
      </div>
    </div>
  );
};

export default Constructor_old;
