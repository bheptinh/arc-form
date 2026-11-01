import { IconHeart } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../../../../../../api/hooks/useTranslation';
import { planner, user } from '../../../../../../../initR2D';
import {
  changeActiveControlPanelMode,
  controlPanelHistoryAdd,
  controlPanelUpdateBreadCrumbs,
  selectActiveControlPanelModeData,
  updateAnimateFavoritesHideStatus,
  updateAnimateFavoritesShowStatus,
  updateControlPanelStatus,
} from '../../../../../../../redux/features/control/controlPanelSlice';
import { selectMetrics } from '../../../../../../../redux/features/metrics/metricsSLice';
import { setActivePopup } from '../../../../../../../redux/features/popups/popupsSlice';
import { hideQuickPanelVisible } from '../../../../../../../redux/features/quickPanels/quickPanelsSlice';
import { changeUndoRedo } from '../../../../../../../redux/features/topPanel/topPanelSlice';
import { selectIsLogged } from '../../../../../../../redux/features/user/userSlice';
import Checkbox from '../../../../../../../shared-components/inputs/checkbox';
import BlueButton from '../../../components/BlueButton';
import MaterialComponent from '../../../components/MaterialComponent';
import PlinthComponent from '../../../components/PlinthComponent';

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
    overflow: 'hidden',
    height: '100%',
    position: 'relative',
    borderTop: '1px solid var(--color-border)',
  },
  planerWallsCont: {
    padding: '0 0 20px',
    width: 'calc(100% + 1px)',
  },
  catalog_top_wr: {
    padding: '10px 10px 10px 10px',
    '@media screen and (max-width: 950px)': {
      padding: 5,
    },
  },
  planerWallsTitleWr: {
    display: 'flex',
    alignItems: 'center',
  },
  planerWallsTitle: {
    fontSize: 17,
    color: 'var(--color-text)',
    fontFamily: 'RobotoCondensed-Regular',
    marginLeft: 10,
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      marginLeft: 3,
    },
  },
  catalog_top_selected_preview: {
    width: '21px',
    height: '16px',
    position: 'relative',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    flexShrink: 0,
    '& img': {
      top: '50%',
      left: '0',
      position: 'absolute',
      maxWidth: '100%',
      transform: 'translateY(-50%)',
    },
    '@media screen and (max-width: 950px)': {
      height: 14,
      width: 11,
    },
  },
  planerWallsWrap: {},
  planerWallsCurentMatWr: {
    display: 'grid',
    position: 'relative',
    margin: '0 0 20px',
    '&:hover': {
      '& $prod_item_fav_btn': {
        opacity: 1,
      },
    },
  },
  prod_item_fav_btn: {
    width: '18px',
    height: '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    background: 'var(--color-white)',
    position: 'absolute',
    top: 5,
    left: 5,
    zIndex: 3,
    opacity: 0,
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    cursor: 'pointer',
    '& svg': {
      cursor: 'pointer',
      maxWidth: '100%',
      maxHeight: '100%',
      width: 'auto',
      height: 'auto',
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
      '&:hover': {
        stroke: 'var(--color-icon-info)',
        fillOpacity: 0,
      },
    },
    '@media screen and (max-width: 950px)': {
      opacity: 1,
    },
  },
  prod_item_fav_btn_active: {
    '& svg': {
      stroke: 'var(--color-icon-info)',
      fillOpacity: 1,
    },
  },
  planerWallsWrap_material: {
    display: 'grid',
    borderBottom: '1px solid var(--color-border-strong)',
  },
  divideWallWr: {
    padding: '0 14px',
    '@media screen and (max-width: 950px)': {
      padding: '0 5px',
    },
  },
  divideWall: {
    height: 53,
    borderRadius: 3,
    border: '1px solid var(--color-surface-grey)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    cursor: 'pointer',
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    gridGap: 16,
    padding: '0 25px',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 15,
    '&:hover': {
      background: 'var(--color-surface-muted)',
    },
    '@media screen and (max-width: 950px)': {
      padding: '10px',
      gridGap: 10,
    },
  },
  lockOn: {
    border: '1px solid #969696',
  },
  divideWallImg: {
    width: 28,
    '@media screen and (max-width: 950px)': {
      width: 21,
    },
  },
  divideWallText: {
    color: 'var(--color-black)',
    fontSize: 14,
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  divideWallGrid: {
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    marginBottom: 12,
    borderTop: '1px solid var(--color-surface-muted)',
    borderBottom: '1px solid var(--color-surface-muted)',
    overflow: 'hidden',
    position: 'relative',
    '& .prod_item_zamok_btn': {
      width: 15,
      height: 15,
      right: 2,
      top: 2,
    },
    '@media screen and (max-width: 950px)': {
      marginBottom: 10,
    },
  },
  divideWallGridMany: {
    '&:before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '50%',
      height: '100%',
      width: 1,
      background: 'var(--color-surface-muted)',
      zIndex: 1,
    },
  },
  planer_walls_sizes_wr: {
    margin: '0 14px 20px',
    color: 'rgb(68, 68, 68)',
    display: 'grid',
    justifyContent: 'space-between',
    gridTemplateColumns: 'auto auto',
    gridGap: 12,
    fontSize: 13,
    '& div:nth-child(2n)': {
      textAlign: 'right',
    },
    '@media screen and (max-width: 950px)': {
      margin: '0 5px 12px',
    },
  },
  planerWallsAreaTitle: {
    color: '#828282',
    fontSize: 13,
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  divide_wall_items: {
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    marginBottom: 22,
  },
  divide_wall_item: {},
  divide_checkbox_wr: {
    padding: '0 14px',
  },
  lockImg: {
    position: 'absolute',
    top: -8,
    left: -6,
  },
  divideWallBtnWrap: {
    padding: '0 14px',
    '@media screen and (max-width: 950px)': {
      padding: '0 5px',
    },
  },
  preloaderBlock: {
    background: 'rgba(0, 0, 0, .2)',
    zIndex: 9,
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
});

const Main = (props) => {
  const classes = useStyle();

  const dispatch = useDispatch();

  const translation = useTranslation();
  const metrics = useSelector(selectMetrics);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const isLogged = useSelector(selectIsLogged);
  const currObj =
    planner.mih()._scene.currentView3DObject?.constructorElementData ||
    planner.mih()._scene.prevSelectedView3DObject?.constructorElementData;
  const topPlinth = currObj ? currObj.topPlinth : null;
  const bottomPlinth = currObj ? currObj.bottomPlinth : null;

  const [materialIdWall, setMaterialIdWall] = useState(
    currObj?.getMaterial(planner.mih()._scene.currentPartNum)
  );
  const [materialIdTop, setMaterialIdTop] = useState(topPlinth?.getMaterial());
  const [materialIdBottom, setMaterialIdBottom] = useState(bottomPlinth?.getMaterial());
  const [addMaterialIdWall, setAddMaterialIdWall] = useState(
    currObj?.getAddMaterial(planner.mih()._scene.currentPartNum)
  );
  const [addMaterialIdTop, setAddMaterialIdTop] = useState(topPlinth?.getAddMaterial());
  const [addMaterialIdBottom, setAddMaterialIdBottom] = useState(bottomPlinth?.getAddMaterial());
  const [wallArea, setWallArea] = useState(null);
  const [wallHeight, setWallHeight] = useState(null);
  const [wallLength, setWallLength] = useState(null);
  const [isInFavorites, setIsInFavorites] = useState(
    user.data.favorites?.items?.find((i) =>
      currObj?.getAddMaterial(planner.mih()._scene.currentPartNum)
        ? i?.id == currObj?.getAddMaterial(planner.mih()._scene.currentPartNum) &&
          i.addData == currObj?.getMaterial(planner.mih()._scene.currentPartNum)
        : i?.id == currObj?.getMaterial(planner.mih()._scene.currentPartNum)
    )
      ? true
      : false
  );
  const [checkboxMolding, setCheckboxMolding] = useState(topPlinth?.exists);
  const [checkboxPlinth, setCheckboxPlinth] = useState(bottomPlinth?.exists);
  const [preloaderStatus, setPreloaderStatus] = useState(true);
  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

  const imgSrcTopPlinth = WC.plinthCreator?.getImgSrc(topPlinth?.shapeNum, topPlinth?.type);
  const imgSrcBottomPlinth = WC.plinthCreator?.getImgSrc(
    bottomPlinth?.shapeNum,
    bottomPlinth?.type
  );

  const onCopyMaterial = (id, addMaterial, wallPart) => {
    let materialRotation = 0;
    switch (wallPart) {
      case 'wall':
        materialRotation = currObj.getMaterialRotation();
        break;
      case 'top':
        materialRotation = topPlinth.getMaterialRotation();
        break;

      case 'bottom':
        materialRotation = bottomPlinth.getMaterialRotation();
        break;
    }
    R2D.CopyPaste.copyMaterial({ id, addMaterial, materialRotation });
  };

  const onPasteMaterial = (type) => {
    const mat = R2D.CopyPaste.pasteMaterial();
    if (mat?.id) {
      switch (type) {
        case 'wall':
          setMaterialIdWall(mat.id);
          setAddMaterialIdWall(mat.addMaterial);
          currObj.setMaterial(mat.id, planner.mih()._scene.currentPartNum);
          currObj.setAddMaterial(mat.addMaterial, planner.mih()._scene.currentPartNum);
          currObj.setMaterialRotation(mat.materialRotation || 0);
          currObj.build3D();
          currObj.dispatchUpdate();
          break;
        case 'top':
          setMaterialIdTop(mat.id);
          setAddMaterialIdTop(mat.addMaterial);
          topPlinth.setMaterial(mat.id, planner.mih()._scene.currentPartNum);
          topPlinth.setAddMaterial(mat.addMaterial, planner.mih()._scene.currentPartNum);
          topPlinth.setMaterialRotation(mat.materialRotation || 0);
          topPlinth.build3D();
          topPlinth.dispatchUpdate();
          break;
        case 'bottom':
          setMaterialIdBottom(mat.id);
          setAddMaterialIdBottom(mat.addMaterial);
          bottomPlinth.setMaterial(mat.id, planner.mih()._scene.currentPartNum);
          bottomPlinth.setAddMaterial(mat.addMaterial, planner.mih()._scene.currentPartNum);
          bottomPlinth.setMaterialRotation(mat.materialRotation || 0);
          bottomPlinth.build3D();
          bottomPlinth.dispatchUpdate();
          break;
      }
      R2D.scene.history.saveState();
      dispatch(changeUndoRedo());
      planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
    } else if (mat?.type == 'logoMesh') {
      dispatch(
        setActivePopup({
          name: 'alert',
          data: translation['TEXT_PASTE_LOGO_INTO_MATERIAL_MESH_ERROR'],
        })
      );
    }
  };

  const onClickPreview = (type) => props.onChangeSelectedType(type);

  const changePlinthVisible = (checked) => {
    bottomPlinth.exists = checked;
    bottomPlinth.dispatchUpdate();
    R2D.scene.history.saveState();
    dispatch(changeUndoRedo());
    setCheckboxPlinth(checked);
  };

  const changeMoldingVisible = (checked) => {
    topPlinth.exists = checked;
    topPlinth.dispatchUpdate();
    R2D.scene.history.saveState();
    dispatch(changeUndoRedo());
    setCheckboxMolding(checked);
  };

  const onApplyToAllRoom = () => {
    planner.scene.setPlinthToRoom(topPlinth);
    planner.scene.setPlinthToRoom(bottomPlinth);
    planner.scene.setWallToRoom(currObj);
    currObj?.dispatchUpdate();
    R2D.scene.history.saveState();
    dispatch(changeUndoRedo());
    planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
  };

  const onClickWallSlice = (e) => {
    dispatch(hideQuickPanelVisible({ name: 'helper' }));
    planner.mih()._titlesTool.controlPanelToggle(false);
    planner.scene.toggleControlPanelStatus(false);
    dispatch(updateControlPanelStatus(false));
    planner.scene.runConfigurator(currObj);
    dispatch(changeActiveControlPanelMode({ mode: 'wallSlice', data: { type: 'main' } }));
  };

  const onClickPlinthChange = (plinthType) => {
    dispatch(controlPanelHistoryAdd({ data: plinthType, type: 'changePlinth' }));
    dispatch(
      controlPanelUpdateBreadCrumbs({
        data: { data: plinthType, type: 'changePlinth' },
        updateType: 'add',
      })
    );
  };

  const updateFavorites = async () => {
    if (!isLogged) return dispatch(setActivePopup({ name: 'login' }));
    const id =
      R2D.scene.currentConstructorElementData.addMaterialID ||
      R2D.scene.currentConstructorElementData.materialID;
    const color = R2D.scene.currentConstructorElementData.addMaterialID
      ? R2D.scene.currentConstructorElementData.materialID
      : '';
    if (isInFavorites) {
      await user.uRemoveFromFavorites(id, color);
      dispatch(updateAnimateFavoritesHideStatus(true));
      setTimeout(() => dispatch(updateAnimateFavoritesHideStatus(false)), 10);
    } else {
      await user.uAddToFavorites(id, color);

      dispatch(updateAnimateFavoritesShowStatus(true));
      setTimeout(() => dispatch(updateAnimateFavoritesShowStatus(false)), 10);
    }
    setIsInFavorites(!isInFavorites);
    planner.apiScene.dispatchEvent(new Event(planner.apiScene.FAVORITES_BUTTON, {}));
  };

  const updateMaterialsEvent = (e) => {
    setMaterialIdWall(currObj?.getMaterial(planner.mih()._scene.currentPartNum));
    setAddMaterialIdWall(currObj?.getAddMaterial(planner.mih()._scene.currentPartNum));
  };

  useEffect(() => {
    setStyleAnimation({ transform: 'translateX(0%)' });
    setPreloaderStatus(false);
    planner.scene.addEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
    return () =>
      planner.scene.removeEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
  }, []);

  useEffect(() => {
    if (!currObj) return;
    setWallArea(planner.units.squareToString(currObj.area));
    setWallHeight(planner.units.valueToString(currObj.height));
    setWallLength(planner.units.valueToString(TR.euclDistP(currObj.point1, currObj.point2)));
  }, [metrics]);

  return (
    <div className={classes.planner_catalog_cont} style={styleAnimation}>
      <div className={classes.catalog_top_wr}>
        <div className={classes.planerWallsTitleWr}>
          <div className={classes.catalog_top_selected_preview}>
            <img src={props.panelPreviewIcon} />
          </div>
          <div className={classes.planerWallsTitle}>{translation['PANEL_TITLE_WALL']}</div>
        </div>
      </div>
      <div className={classes.catalog_wr}>
        <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
          <div className={classes.planerWallsCont}>
            <div className={classes.planerWallsWrap}>
              <div className={classes.planerWallsCurentMatWr}>
                <div
                  className={
                    isInFavorites
                      ? classes.prod_item_fav_btn + ' ' + classes.prod_item_fav_btn_active
                      : classes.prod_item_fav_btn
                  }
                  onClick={updateFavorites}
                >
                  <IconHeart size={18} color="#464646" />
                </div>

                <div className={classes.planerWallsWrap_material}>
                  <MaterialComponent
                    customStyles={{ border: 'none' }}
                    addMaterial={addMaterialIdWall}
                    matId={materialIdWall}
                    materialsSource={{ type: 'bank', data: null }}
                    onCopyPaste={{
                      copy: onCopyMaterial,
                      paste: onPasteMaterial,
                      index: 'wall',
                      statusCopy: true,
                    }}
                    onClick={(e) => onClickPreview('wall')}
                    lock={false}
                  />
                </div>
              </div>

              <div className={classes.planer_walls_sizes_wr}>
                <div className={classes.planerWallsAreaTitle}>
                  {translation['SELECTED_WALLS_AREA_TEXT']}
                </div>
                <div>{wallArea}</div>
                <div className={classes.planerWallsAreaTitle}>
                  {translation['SELECTED_WALLS_HEIGHT_TEXT']}
                </div>
                <div>{wallHeight + ' ' + metrics.active}</div>
                <div className={classes.planerWallsAreaTitle}>
                  {translation['SELECTED_WALLS_LENGTH_TEXT']}
                </div>
                <div>{wallLength + ' ' + metrics.active}</div>
              </div>

              <div className={classes.divideWallWr}>
                <div onClick={onClickWallSlice} className={classes.divideWall}>
                  <img
                    className={classes.divideWallImg}
                    src={'/src_designer/images/icon_divide.svg'}
                  />
                  <div className={classes.divideWallText}>
                    {currObj?.configData
                      ? translation['TILE_CONFIG_EDIT']
                      : translation['TILE_CONFIG_INIT']}
                  </div>
                </div>
              </div>

              <div className={classes.divide_wall_items}>
                <div className={classes.divide_wall_item}>
                  <div className={classes.divideWallGrid + ' ' + classes.divideWallGridMany}>
                    <PlinthComponent
                      customStyles={{ border: 'none' }}
                      onClick={(e) => onClickPlinthChange('molding')}
                      src={imgSrcTopPlinth}
                    />

                    <MaterialComponent
                      customStyles={{ border: 'none' }}
                      addMaterial={addMaterialIdTop}
                      materialsSource={{ type: 'bank', data: null }}
                      matId={materialIdTop}
                      onCopyPaste={{
                        copy: onCopyMaterial,
                        paste: onPasteMaterial,
                        index: 'top',
                        statusCopy: true,
                      }}
                      onClick={(e) => onClickPreview('top')}
                    />
                  </div>

                  <div className={classes.divide_checkbox_wr}>
                    <Checkbox
                      name={'moldingVisible'}
                      label={translation['TEXT_MOLDING']}
                      onChange={changeMoldingVisible}
                      checked={checkboxMolding}
                    />
                  </div>
                </div>

                <div className={classes.divide_wall_item}>
                  <div className={classes.divideWallGrid + ' ' + classes.divideWallGridMany}>
                    <PlinthComponent
                      customStyles={{ border: 'none' }}
                      onClick={(e) => onClickPlinthChange('plinth')}
                      src={imgSrcBottomPlinth}
                    />

                    <MaterialComponent
                      customStyles={{ border: 'none' }}
                      addMaterial={addMaterialIdBottom}
                      materialsSource={{ type: 'bank', data: null }}
                      matId={materialIdBottom}
                      onCopyPaste={{
                        copy: onCopyMaterial,
                        paste: onPasteMaterial,
                        index: 'bottom',
                        statusCopy: true,
                      }}
                      onClick={(e) => onClickPreview('bottom')}
                    />
                  </div>
                  <div className={classes.divide_checkbox_wr}>
                    <Checkbox
                      name={'plinthVisible'}
                      label={translation['TEXT_PLINTH']}
                      onChange={changePlinthVisible}
                      checked={checkboxPlinth}
                    />
                  </div>
                </div>
              </div>

              <div className={classes.divideWallBtnWrap}>
                <BlueButton onClick={onApplyToAllRoom} label={translation['TEXT_APPLY_TO_ROOM']} />
              </div>
            </div>
          </div>
        </SimpleBar>
      </div>
      <div
        className={classes.preloaderBlock}
        style={preloaderStatus ? { opacity: 1 } : { opacity: 0, zIndex: -1 }}
      >
        <div className={'preloader-cube'}></div>
      </div>
    </div>
  );
};

export default Main;
