import React, { useEffect, useMemo, useState } from 'react';
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
  planerWallsWrap: {
    height: '100%',
    background: '#fff',
  },
  catalog_top_wr: {
    padding: '10px 10px 10px 10px',
    '@media screen and (max-width: 950px)': {
      padding: 5,
    },
  },
  planerCeilingTitleWr: {
    display: 'flex',
    alignItems: 'center',
  },
  planerCeilingTitle: {
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
      height: 14,
      width: 11,
    },
  },
  planerCeilingAreaTitle: {
    color: '#2F2F2F',
    fontSize: 14,
    margin: '0 14px 37px',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      margin: '0 5px 14px',
    },
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
    display: 'grid',
    position: 'relative',
    margin: '0 0 10px',
    borderBottom: '1px solid #BEBCBC',
    '&:hover': {
      '& $prod_item_fav_btn': {
        opacity: 1,
      },
    },
  },
  showItemWr: {
    display: 'flex',
    alignItems: 'center',
  },
  showItemIconWr: {},
  showItemIcon: {
    width: 20,
    cursor: 'pointer',
  },
  showItemInput: {
    color: '#5F5F5F',
    border: 'none',
    margin: '0 8px 0 4px',
    outline: 'none',
    padding: '3px 5px',
    maxWidth: 'calc(100% - 12px)',
    fontSize: 13,
    letterSpacing: '-0.39px',
    fontWeight: 400,
  },
  showItemText: {
    color: '#5F5F5F',
    border: 'none',
    margin: '0 8px 0 4px',
    outline: 'none',
    padding: '3px 5px',
    maxWidth: 'calc(100% - 12px)',
    fontSize: 13,
    fontWeight: 400,
    letterSpacing: '-0.39px',
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
  const [isInFavorites, setIsInFavorites] = useState(false);

  const [area, setArea] = useState('');

  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );
  const [lockMaterialStatus, setLockMaterialStatus] = useState(false);

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
    setPreviewMaterialId(currObj?.getMaterial());
    setPreviewAddMaterialId(currObj?.getAddMaterial());
  };

  useEffect(() => {
    const keyTimeout = setTimeout(() => setStyleAnimation({ transform: 'translateX(0%)' }), 50);
    const id =
      R2D.scene.currentConstructorElementData?.addMaterialID ||
      R2D.scene.currentConstructorElementData?.materialID;
    if (id && Array.isArray(user.data.favorites?.items)) {
      const isFav = user.data.favorites.items.some((item) => Number(item.id) === Number(id));
      setIsInFavorites(isFav);
    }
    setArea(planner.units.squareToString(currObj?.area));
    setPreloaderStatus(false);
    planner.scene.addEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
    return () => {
      planner.scene.removeEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
      clearTimeout(keyTimeout);
    };
  }, []);

  useEffect(() => {
    if (controlPanelModeHistory && currObj) {
      setPreviewMaterialId(currObj?.getMaterial());
      setPreviewAddMaterialId(currObj?.getAddMaterial());
    }
  }, [currObj, controlPanelModeHistory]);

  useEffect(() => {
    const pollMaterials = Object.entries(R2D.Pool._products_data);
    const currentMaterial = pollMaterials.find((y) => y[0] == previewMaterialId);
    const plan = currentMaterial?.[1]?.plan;

    if (user.data.plan == 'free') {
      if (Array.isArray(plan) || (plan !== 'free' && plan)) {
        setLockMaterialStatus(true);
      } else {
        setLockMaterialStatus(false);
      }
    }
  }, [lockMaterialStatus, isLogged, previewMaterialId]);

  return (
    previewMaterialId && (
      <div className={classes.planerWallsCont} style={styleAnimation}>
        <div className={classes.catalog_top_wr}>
          <div className={classes.planerCeilingTitleWr}>
            <div className={classes.catalog_top_selected_preview}>
              <img src={props.panelPreviewIcon} />
            </div>
            <div className={classes.planerCeilingTitle}>{translation[props.panelTitle]}</div>
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
                  lockMaterialStatus={lockMaterialStatus}
                  matId={previewMaterialId}
                  materialsSource={{ type: 'bank', data: null }}
                  addMaterial={previewAddMaterialId}
                  onCopyPaste={{
                    copy: onCopyMaterial,
                    paste: onPasteMaterial,
                    statusCopy: lockMaterialStatus ? false : true,
                  }}
                  lock={false}
                />
              </div>
              <div className={classes.planerCeilingAreaTitle}>
                {translation['TEXT_CONSTRUCTION_ELEMENT_AREA'] + ' ' + area}
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
