import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../../../../../../api/hooks/useTranslation';
import { planner, user } from '../../../../../../../initR2D';
import {
  selectActiveControlPanelModeData,
  updateAnimateFavoritesHideStatus,
  updateAnimateFavoritesShowStatus,
} from '../../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../../redux/features/popups/popupsSlice';
import { changeUndoRedo } from '../../../../../../../redux/features/topPanel/topPanelSlice';
import { selectIsLogged } from '../../../../../../../redux/features/user/userSlice';
import { selectActiveViewMode } from '../../../../../../../redux/features/viewMode/viewModeSlice';
import Checkbox from '../../../../../../../shared-components/inputs/checkbox';
import FavoriteStarIcon from '../../../../../../common/FavoriteStarIcon';
import MaterialComponent from '../../../components/MaterialComponent';

const useStyle = createUseStyles({
  planerWallsCont: {
    borderRight: '1px solid #cdcdcd',
    background: '#fff',
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
    borderTop: '1px solid #C6C4C4',
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
    color: '#2F2F2F',
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
      width: 11,
      height: 14,
    },
  },
  planerWallsWrap: {
    overflow: 'hidden',
    height: '100%',
    position: 'relative',
    background: '#fff',
  },
  prod_item_fav_btn: {
    width: '18px',
    height: '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    background: '#fff',
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
      '& path': {
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
      },
      '&:hover': {
        '& path': {
          stroke: '#64BCF0',
          fillOpacity: 0,
          '@media screen and (max-width: 950px)': {
            stroke: '#464646',
            fillOpacity: 1,
          },
        },
      },
    },
    '@media screen and (max-width: 950px)': {
      opacity: 1,
    },
  },
  prod_item_fav_btn_active: {
    '& path': {
      fill: '#64BCF0',
      stroke: '#64BCF0',
      fillOpacity: 1,
    },
  },
  planerWallsCurentMatWr: {
    borderBottom: '1px solid #BEBCBC',
    display: 'grid',
    marginBottom: 10,
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      '& $prod_item_fav_btn': {
        opacity: 1,
      },
    },
  },
  showItemWr: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'start',
    gap: 10,
    margin: '0 14px',
    '@media screen and (max-width: 950px)': {
      margin: '0 5px',
    },
  },
  showItemIconWr: {},
  showItemIcon: {
    width: 20,
    height: 'auto',
    cursor: 'pointer',
    '& svg path': {
      transition: 'all .9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      '& path': {
        fill: '#a0a0a0',
      },
    },
    '@media screen and (max-width: 950px)': {
      width: 12,
    },
  },
  showItemInput: {
    color: '#2F2F2F',
    border: 'none',
    margin: '0 8px 0 4px',
    outline: 'none',
    padding: '3px 5px',
    maxWidth: 'calc(100% - 12px)',
    fontSize: 14,
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      padding: '3px 2px',
    },
  },
  showItemText: {
    color: '#2F2F2F',
    border: 'none',
    margin: '0 8px 0 4px',
    outline: 'none',
    padding: '3px 5px',
    maxWidth: 'calc(100% - 12px)',
    fontSize: 14,
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      padding: '3px 2px',
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

  const activeViewMode = useSelector(selectActiveViewMode);
  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;

  const isLogged = useSelector(selectIsLogged);

  const currObj = useMemo(
    () =>
      planner.mih()._scene.currentView3DObject?.constructorElementData ||
      planner.mih()._scene.prevSelectedView3DObject?.constructorElementData,
    []
  );

  const [previewMaterialId, setPreviewMaterialId] = useState(null);
  const [previewAddMaterialId, setPreviewAddMaterialId] = useState(null);
  const [preloaderStatus, setPreloaderStatus] = useState(true);
  const [isInFavorites, setIsInFavorites] = useState(
    user.data.favorites?.items?.find((i) =>
      currObj?.addMaterialID
        ? i?.id == currObj?.addMaterialID && i.addData == currObj?.materialID
        : i?.id == currObj?.materialID
    )
      ? true
      : false
  );

  const [area, setArea] = useState('');

  const [isRoomNameVisible, setRoomNameVisible] = useState(
    !!currObj?.title?.visible?.[R2D.Viewers.getCurrentViewerName()]
  );
  const [isAreaTextVisible, setAreaTextVisible] = useState(
    !!currObj?.title?.areaVisible?.[R2D.Viewers.getCurrentViewerName()]
  );
  const [isCeilingVisible, setCeilingVisible] = useState(
    !!(currObj?.ceiling?.exists && !currObj?.ceiling?.partialVisible)
  );

  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

  const onSetCeilingVisible = (isChecked: boolean) => {
    if (!currObj) {
      return;
    }

    if (isChecked) {
      planner.scene.makeElementHidden('ceilings', currObj.ceiling.id);
    } else {
      planner.scene.makeElementVisible('ceilings', currObj.ceiling.id);
    }

    setCeilingVisible(isChecked);
  };

  const onHideRoomName = (isChecked: boolean) => {
    if (!currObj.title) return;
    currObj.title.visible[R2D.Viewers.getCurrentViewerName()] = isChecked;
    setRoomNameVisible(isChecked);

    if (activeViewMode === 'view3d') {
      R2D.view3d.coversTitleViewer3D.update();
    } else {
      planner.mih()._titlesTool.updateValues(currObj.id);
    }
  };

  const onHideAreaText = (isChecked: boolean) => {
    if (!currObj.title) return;
    currObj.title.areaVisible[R2D.Viewers.getCurrentViewerName()] = isChecked;
    setAreaTextVisible(isChecked);
    if (activeViewMode === 'view3d') {
      R2D.view3d.coversTitleViewer3D.update();
    } else {
      planner.mih()._titlesTool.updateValues(currObj.id);
    }
  };

  const onCopyMaterial = (id, addMaterial) =>
    R2D.CopyPaste.copyMaterial({
      id,
      addMaterial,
      materialRotation: currObj.getMaterialRotation(),
    });

  const onPasteMaterial = () => {
    const mat = R2D.CopyPaste.pasteMaterial();
    if (mat?.id) {
      setPreviewMaterialId(mat.id);
      setPreviewAddMaterialId(mat.addMaterial);
      currObj.setMaterial(mat.id);
      currObj.setAddMaterial(mat.addMaterial);
      currObj.setMaterialRotation(mat.materialRotation);
      currObj.build3D();
      currObj.dispatchUpdate();
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

  const updateFavorites = async () => {
    if (!isLogged) return dispatch(setActivePopup({ name: 'login' }));
    const id = currObj.addMaterialID || currObj.materialID;
    const color = currObj.addMaterialID ? currObj.materialID : '';
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

  const updateMaterialsEvent = () => {
    setPreviewMaterialId(currObj?.getMaterial());
    setPreviewAddMaterialId(currObj?.getAddMaterial());
  };

  useEffect(() => {
    const keyTimeout = setTimeout(() => setStyleAnimation({ transform: 'translateX(0%)' }), 50);
    setPreviewMaterialId(currObj?.getMaterial());
    setPreviewAddMaterialId(currObj?.getAddMaterial());
    setArea(planner.units.squareToString(currObj?.area));
    setPreloaderStatus(false);
    planner.scene.addEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
    return () => {
      planner.scene.removeEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
      clearTimeout(keyTimeout);
    };
  }, []);

  return (
    previewMaterialId && (
      <div className={classes.planerWallsCont} style={styleAnimation}>
        <div className={classes.catalog_top_wr}>
          <div className={classes.planerWallsTitleWr}>
            <div className={classes.catalog_top_selected_preview}>
              <img src={props.panelPreviewIcon} />
            </div>
            <div className={classes.planerWallsTitle}>{translation['PANEL_FLOOR_WALL']}</div>
          </div>
        </div>
        <div className={classes.catalog_wr}>
          <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
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
                  <FavoriteStarIcon />
                </div>
                <MaterialComponent
                  customStyles={{ border: 0 }}
                  matId={previewMaterialId}
                  materialsSource={{ type: 'bank', data: null }}
                  addMaterial={previewAddMaterialId}
                  onCopyPaste={{
                    copy: onCopyMaterial,
                    paste: onPasteMaterial,
                    statusCopy: true,
                  }}
                  lock={false}
                />
              </div>

              <div className={classes.showItemWr}>
                <Checkbox
                  checked={isRoomNameVisible}
                  onChange={onHideRoomName}
                  label={translation['ROOM_TITLE_TEXT']}
                  visualType="eye"
                />

                <Checkbox
                  checked={isAreaTextVisible}
                  onChange={onHideAreaText}
                  label={translation['TEXT_CONSTRUCTION_ELEMENT_AREA'] + ' ' + area}
                  visualType="eye"
                />

                <Checkbox
                  checked={isCeilingVisible}
                  onChange={onSetCeilingVisible}
                  label={translation['TEXT_SHOW_CEIL']}
                  visualType="eye"
                />
              </div>
            </div>
          </SimpleBar>
          <div
            className={classes.preloaderBlock}
            style={preloaderStatus ? { opacity: 1 } : { opacity: 0, zIndex: -1 }}
          >
            <div className={'preloader-cube'}></div>
          </div>
        </div>
      </div>
    )
  );
};

export default Main;
