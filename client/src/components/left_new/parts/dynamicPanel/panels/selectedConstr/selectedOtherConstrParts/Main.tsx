import { IconHeart } from '@tabler/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

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
import MaterialComponent from '../../../components/MaterialComponent';
import CatalogScreen from '../../common/CatalogScreen';

const useStyle = createUseStyles({
  planerWallsWrap: {
    height: '100%',
    background: 'var(--color-white)',
  },
  planerCeilingAreaTitle: {
    color: 'var(--color-text)',
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
      '& path': {
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
      },
      '&:hover': {
        '& path': {
          stroke: 'var(--color-icon-info)',
          fillOpacity: 0,
          '@media screen and (max-width: 950px)': {
            stroke: 'var(--color-icon-dark)',
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
      fill: 'var(--color-icon-info)',
      stroke: 'var(--color-icon-info)',
      fillOpacity: 1,
    },
  },
  planerWallsCurentMatWr: {
    display: 'grid',
    position: 'relative',
    margin: '0 0 10px',
    borderBottom: '1px solid var(--color-border-strong)',
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
});

const Main = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const translation = useTranslation();

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);

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
    };
  }, []);

  useEffect(() => {
    if (controlPanelModeHistory && currObj) {
      setPreviewMaterialId(currObj?.getMaterial());
      setPreviewAddMaterialId(currObj?.getAddMaterial());
    }
  }, [currObj, controlPanelModeHistory]);

  return (
    previewMaterialId && (
      <CatalogScreen
        header={
          <CatalogScreen.Header
            icon={props.panelPreviewIcon}
            title={translation[props.panelTitle]}
            settings={false}
          />
        }
        isLoading={preloaderStatus}
      >
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
              <IconHeart size={20} color="#464646" />
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
          <div className={classes.planerCeilingAreaTitle}>
            {translation['TEXT_CONSTRUCTION_ELEMENT_AREA'] + ' ' + area}
          </div>
        </div>
      </CatalogScreen>
    )
  );
};

export default Main;
