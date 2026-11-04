import 'simplebar-react/dist/simplebar.min.css';

import {
  IconBulb,
  IconBulbFilled,
  IconExternalLink,
  IconRosetteDiscountFilled,
} from '@tabler/icons-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { GEOM, planner, user } from '../../../../../../initR2D';
import {
  selectIs3DRotationModeActive,
  selectLockState,
  updateIs3DRotationModeActive,
} from '../../../../../../redux/features/common/commonSlice';
import {
  changeActiveControlPanelMode,
  controlPanelHistoryAdd,
  selectActiveControlPanelModeData,
  updateAnimateFavoritesHideStatus,
  updateAnimateFavoritesShowStatus,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import { hideQuickPanelVisible } from '../../../../../../redux/features/quickPanels/quickPanelsSlice';
import { changeUndoRedo } from '../../../../../../redux/features/topPanel/topPanelSlice';
import { selectIsLogged } from '../../../../../../redux/features/user/userSlice';
import ChangeSize from '../../../../../common/ChangeSize';
import FavoriteStarIcon from '../../../../../common/FavoriteStarIcon';
import LockSize from '../../../../../common/LockSize';
import RemoteComponentMain from '../../../../../common/RemoteComponentMain';
import BlueButton from '../../components/BlueButton';
import LogoComponent from '../../components/LogoComponent';
import MaterialComponent from '../../components/MaterialComponent';

const plannerChangeRotation_axis = {
  width: 10,
  height: 10,
  borderRadius: 10,
};

const plannerChangeRotation = {
  display: 'flex',
  justifyContent: 'space-between',
};

const useStyle = createUseStyles({
  planner_catalog_cont: {
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
    borderRight: '1px solid var(--color-border-light)',
    '@media screen and (max-width: 950px)': {
      width: 189,
    },
  },
  catalog_wr: {
    overflow: 'hidden',
    height: '100%',
    background: 'var(--color-white)',
  },

  item_info_content: {
    padding: '0 6px 8px 6px',
    color: 'var(--color-text-subtle)',
    fontSize: '13px',
    lineHeight: 1.4,
    marginTop: 8,
    '& span': {
      color: 'var(--color-black)',
    },
    '&>div>div': {
      fontSize: '17px',
      color: 'var(--color-black)',
      display: 'inline-block',
      fontFamily: 'RobotoCondensed-Regular',
    },
    '@media screen and (max-width: 950px)': {
      padding: '0 5px 5px 5px',
      marginTop: 5,
      fontSize: 11,
    },
  },
  item_info_name: {
    fontSize: '17px',
    fontFamily: 'RobotoCondensed-Regular',
    lineHeight: 0.8,
    color: ' var(--color-black)',
    marginBottom: 8,
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      marginBottom: 3,
    },
  },
  prod_item_url: {
    color: 'var(--color-info)!important',
    textTransform: 'lowercase',
    fontSize: '13px !important',
    marginLeft: '9px !important',
    textDecoration: 'underline',
    cursor: 'pointer',
    '& svg': {
      marginLeft: 4,
    },
    '&:hover': {
      textDecoration: 'none',
    },
  },
  prod_item: {},

  prod_item_img_wr: {
    overflow: 'hidden',
    width: '100%',
    display: 'flex',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: '1 / 1',
    marginBottom: 7,
    '& img': {
      maxWidth: '100%',
      maxHeight: '100%',
      transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    },
  },
  prod_item_fav_btn: {
    width: '24px',
    height: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '50%',
    background: 'var(--color-white)',
    position: 'absolute',
    top: 5,
    left: 5,
    zIndex: 3,
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    cursor: 'pointer',
    '& svg': {
      cursor: 'pointer',
      maxWidth: '100%',
      maxHeight: '100%',
      width: 'auto',
      height: 'auto',
    },
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
  prod_item_fav_btn_active: {
    '& path': {
      fill: 'var(--color-icon-info)',
      stroke: 'var(--color-icon-info)',
      fillOpacity: 1,
    },
  },
  title: {
    width: '100%',
    minHeight: '29px',
    backgroundColor: 'rgba(129, 129, 129, 0.9)',
    fontSize: '13px',
    color: 'var(--color-white)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 5px',
  },
  planner_configurtate_btn_wr: {
    padding: '0 14px',
    marginBottom: 10,
    '&:empty': {
      margin: 0,
    },
    '@media screen and (max-width: 950px)': {
      padding: '0 5px',
    },
  },
  plannerChangeSizesWrap: {
    display: 'grid',
    gridTemplateColumns: 'auto 27px',
    gridGap: 10,
    padding: '0 50px 0 14px',
    '@media screen and (max-width: 950px)': {
      padding: '0 14px 0 5px',
    },
  },
  plannerChangeSizes: {},
  plannerChangeRotationWrap: {},
  plannerChangeRotation: {
    extend: plannerChangeRotation,
    padding: 5,
  },
  plannerChangeRotation_hide: {
    display: 'none',
  },
  plannerChangeRotation_item: {
    display: 'flex',
    alignItems: 'center',
  },
  plannerChangeRotation_axis_x: {
    extend: plannerChangeRotation_axis,
    background: '#BE3939',
  },
  plannerChangeRotation_axis_y: {
    extend: plannerChangeRotation_axis,
    background: '#B5CB38',
  },
  plannerChangeRotation_axis_z: {
    extend: plannerChangeRotation_axis,
    background: 'var(--color-info)',
  },
  changeSizesLockWr: {
    position: 'relative',
    height: 94,
    display: 'grid',
    paddingTop: 13,
  },
  changeSizesLockLine1: {
    width: '100%',
    height: 11,
    borderTop: '1px solid var(--color-border-grey)',
    borderRight: '1px solid var(--color-border-grey)',
    opacity: '0.5',
  },
  changeSizesLockLine2: {
    borderTop: '1px solid var(--color-border-grey)',
    opacity: '0.5',
    width: 13,
  },
  changeSizesLockLine3: {
    width: '100%',
    height: 11,
    borderBottom: '1px solid var(--color-border-grey)',
    borderRight: '1px solid var(--color-border-grey)',
    opacity: '0.5',
  },
  materialsGrid: {
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, calc(calc(50%)))',
    borderTop: '1px solid #BFBDBD',
  },
  materialsGrid_1: {
    gridTemplateColumns: 'auto',
    justifyContent: 'center',
    justifyItems: 'center',
    borderTop: 0,
    '&>div': {
      height: 151,
      border: '1px solid var(--color-surface-muted)',
    },
  },
  materialsGrid_3: {
    gridTemplateColumns: 'repeat(3, calc(calc(34%)))',
  },
  materialsGrid_4: {
    gridTemplateColumns: 'repeat(4, calc(calc(25%)))',
  },
  plannerChangeRotation_accordion: {
    margin: '10px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '& h2': {
      fontSize: 13,
      fontWeight: 400,
      marginRight: 6,
    },
    '& svg': {
      transition: 'all .3s cubic-bezier(0.19, 1, 0.22, 1)',
    },
  },
  arrowUp: {
    transform: 'rotate(90deg)',
    marginRight: 5,
    cursor: 'pointer',
    '& path': {
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      '& path': {
        fill: 'var(--color-icon)',
      },
    },
  },
  prod_item_accordion: {
    borderBottom: '1px solid #BFBDBD',
    borderTop: '1px solid #BFBDBD',
    marginBottom: 15,
  },
  prod_item_accordion_option_wr: {
    padding: '10px 13px',
    '@media screen and (max-width: 950px)': {
      padding: 5,
    },
  },
  prod_item_setting: {
    display: 'grid',
    padding: '10px 0px',
    gridGap: '17px',

    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    alignItems: 'center',
    gridTemplateColumns: 'auto 24px',
  },
  prod_item_setting_title: {
    fontSize: '13px',
    '& span': {
      color: '#939393',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  prod_item_color_wr: {
    width: 20,
    height: 20,
    border: '2px solid var(--color-black)',
    cursor: 'pointer',
  },
  prod_item_setting_layer: {
    cursor: 'pointer',
    '& path': {
      transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover $svg_hover_path': {
      fill: '#B2D924',
    },
  },
  svg_hover_path: {
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
  },
  switch_wr: {
    position: 'relative',
    display: 'inline-block',
    height: '10px',
    width: '100%',
  },
  switch_slider: {
    position: 'absolute',
    cursor: 'pointer',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'var(--color-surface-grey)',
    WebkitTransition: '.4s',
    transition: '.4s',
    borderRadius: '8px',
    boxShadow: 'inset 0 0 1px 0 rgba(0, 0, 0, 0.25)',
    '&:before': {
      position: 'absolute',
      content: '""',
      height: '13px',
      width: '13px',
      left: '0px',
      bottom: '-1px',
      backgroundColor: 'var(--color-slate)',
      transition: '.4s',
      borderRadius: '50%',
    },
  },
  switch_wr_active: {
    '& $switch_slider:before': {
      transform: 'translateX(11px)',
    },
    '& $switch_slider': {
      background: '#B2D924',
    },
  },
  planner_origModel_button: {
    width: 'calc(100% - 28px)',
    margin: '20px 14px',
    '& button': {
      width: '100%',
      background: '#828282',
      padding: '7px 0',
      color: 'var(--color-white)',
      fontSize: 13,
      fontWeight: 400,
      border: 'none',
      cursor: 'pointer',
      transition: 'all .3s ease',
      '&:hover': {
        background: 'var(--color-highlight)',
      },
    },
    '@media screen and (max-width: 950px)': {
      width: 'calc(100% - 10px)',
      margin: '10px 5px',
    },
  },
  plannerLight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '30px 0 10px',
  },
  plannerLight_top: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 5,
  },
  plannerLight_settings: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-info)',
    textDecoration: 'underline',
    cursor: 'pointer',
    transition: 'all .2s ease',
    '&:hover': {
      color: '#F5D141',
    },
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  plannerLight_off: {
    marginRight: 5,
  },
  plannerLight_button: {
    background: 'var(--color-surface-grey)',
    borderRadius: 8,
    width: 21,
    height: 10,
    position: 'relative',
    margin: '0 7px',
    cursor: 'pointer',
    marginTop: 5,
    '& span': {
      width: 13.5,
      height: 13.5,
      borderRadius: 20,
      background: '#444444',
      position: 'absolute',
      top: -2,
      transition: 'all .1s ease',
    },
  },
  preloaderBlock: {
    background: 'rgba(0, 0, 0, .2)',
    zIndex: 99,
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
  },
  wr_top_productURL: {
    width: '100%',
    background: 'var(--color-info)',
    padding: '10px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px 0 10px',
    textTransform: 'uppercase',
    fontSize: 13,
    color: 'var(--color-white)',
    cursor: 'pointer',
    transition: 'all .5s ease',
    '& svg': {
      marginLeft: 5,
    },
    '&:hover': {
      background: '#fcc749',
    },
  },
  prod_item_promocode_btn: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: '18px',
    height: '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'var(--color-white)',
    borderRadius: '50%',
    transition: 'all .9s cubic-bezier(.19, 1, .22, 1)',
    '& svg': {
      width: 18,
      height: 18,
    },
  },
  item_info_attributes: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  item_info_attributes_brand: {
    '& > span:first-child': {
      color: 'var(--color-text-subtle)',
      fontSize: 13,
      fontWeight: 400,
    },
    '& > span:last-child': {
      color: 'var(--color-black)',
      fontSize: 13,
      fontWeight: 400,
    },
  },
  item_info_attributes_price: {
    '& > span:first-child': {
      color: 'var(--color-text-subtle)',
      fontSize: 13,
      fontWeight: 400,
      margin: 0,
    },
    '& > span:last-child': {
      color: 'var(--color-black)',
      fontSize: 17,
      fontWeight: 400,
    },
  },
  product_hover_discount: {
    maxWidth: 200,
    maxHeight: 200,
    padding: '10px 20px',
    textAlign: 'center',
    border: '1px solid var(--color-border-strong)',
    position: 'absolute',
    borderRadius: 3,
    display: 'inline',
    zIndex: 105,
    background: 'var(--color-white)',
    pointerEvents: 'none',
    '& > div': {
      display: 'flex',
    },
    '&:after': {
      content: "''",
      position: 'absolute',
      right: '100%',
      top: '50%',
      transform: 'translate(45%, -50%) rotate(135deg)',
      width: 10,
      height: 10,
      background: 'var(--color-white)',
      borderRight: '1px solid var(--color-border-strong)',
      borderBottom: '1px solid var(--color-border-strong)',
    },
    '& p': {
      fontSize: 12,
    },
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
  const currObj = R2D.scene.currentView3DObject || R2D.scene.prevSelectedView3DObject;
  const currSceneObj = currObj?.sceneObject;
  const attributesArray =
    currSceneObj?.objectData?.attributes && Object.values(currSceneObj.objectData.attributes);

  const productBrand = attributesArray?.find((i) => i.systemName == 'brand');
  const startingFrom = attributesArray?.find((i) => i.systemName == 'starting_from');
  const currency = attributesArray?.find((i) => i.systemName == 'currency');

  const is3DModeRotationActive = useSelector(selectIs3DRotationModeActive);

  const [isFixedSize, setIsFixedSize] = useState(null);

  const lockState = useSelector(selectLockState);

  const isLogged = useSelector(selectIsLogged);

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const { width, height, depth, elevation } = planner.scene.getCurrentModelSizes() || {
    width: 0,
    height: 0,
    depth: 0,
    elevation: 0,
  };

  const [objectWidth, setObjectWidth] = useState(width);
  const [objectHeight, setObjectHeight] = useState(height);
  const [objectDepth, setObjectDepth] = useState(depth);
  const [objectElevation, setObjectElevation] = useState(elevation);

  const [isInFavorites, setIsInFavorites] = useState(null);
  const [userFavorites, setUserFavorites] = useState(user.data.favorites?.items);

  const metadata = currSceneObj?.objectData?.metadata;
  const matchedLinkObject =
    metadata?.multilinkwithip?.data &&
    (Object.values(metadata?.multilinkwithip?.data)?.find(
      (i) => i.country == R2D.config.location
    ) ||
      Object.values(metadata?.multilinkwithip?.data)?.find((i) => i.country == 'all'));
  const disabledSizes =
    metadata && Object.entries(metadata)?.find((i) => i[1]?.config?.disableSizes);

  const [objectRotationX, setObjectRotationX] = useState(
    GEOM.toDeg(currObj?.object3d.rotation.x).toFixed(0)
  );
  const [objectRotationY, setObjectRotationY] = useState(
    GEOM.toDeg(currObj?.object3d.rotation.y).toFixed(0)
  );
  const [objectRotationZ, setObjectRotationZ] = useState(
    GEOM.toDeg(currObj?.object3d.rotation.z).toFixed(0)
  );

  const [previewMaterials, setPreviewMaterials] = useState([]);

  const [previewMaterialsId, setPreviewMaterialsId] = useState(props.previewMaterialsId);
  const [logoMeshes, setLogoMeshes] = useState(
    currObj?.logoEditor ? Object.values(currObj.logoEditor.getDataForUIAllLogos()) : null
  );

  const [isLightOn, setIsLightOn] = useState(props.isLightOn);

  const [preloaderStatus, setPreloaderStatus] = useState(false);
  const [materislsCount, setMaterislsCount] = useState(0);
  const [productApplications, updateProductApplications] = useState(null);

  const configProductDetailsMerchantLogic = R2D.config.data.product_details_show_merchant_logic;
  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

  const isOriginalModel = currSceneObj?.isOwner;

  let delayBeforeMaterialMouseEnter,
    delayAfterMaterialMouseLeave = null;

  const mainDiv = useRef(null);
  const mouseDownOnObj = false;

  const onCopyMaterial = (id, addMaterial) => R2D.CopyPaste.copyMaterial({ id, addMaterial });

  const onPasteMaterial = (index) => {
    const mat = R2D.CopyPaste.pasteMaterial();
    if (!mat) return;

    if (mat && R2D.scene.currentView3DObject && mat.id) {
      const sceneObject = currSceneObj;
      if (!sceneObject) return;
      sceneObject.setMaterialAt(index, mat.id);
      sceneObject.setAddMaterialAt(index, mat.addMaterial);
      sceneObject.update();
      R2D.scene.history.saveState();
      setPreviewMaterialsId([...planner.scene.getCurrentModelMaterials()]);
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

  const onPasteLogoMesh = (hash) => {
    const pasteObj = R2D.CopyPaste.objFromClipboard();
    if (!pasteObj) return;

    if (pasteObj.type == 'logoMesh') {
      currObj.logoEditor.pasteLogo(hash, pasteObj.value);
      setLogoMeshes(Object.values(currObj.logoEditor.getDataForUIAllLogos()));
    } else if (pasteObj.type == 'material') {
      currObj.logoEditor
        .pasteTextureAsLogo(hash, pasteObj.value.id, pasteObj.value.addMaterial)
        .then(() => {
          setLogoMeshes(Object.values(currObj.logoEditor.getDataForUIAllLogos()));
        });
    }
  };

  const onChangeSize = (mouseDown, value, type) => {
    if (!currObj) return;
    const isForWall = currObj.getForWall && currObj.getForWall();

    switch (type) {
      case 'width':
        planner.scene.setCurrentModelWidth(value, lockState, mouseDown.status);
        break;
      case 'height':
        planner.scene.setCurrentModelHeight(
          value,
          R2D.scene.currentView3DObject?.getType() == 4 ? false : lockState,
          mouseDown.status
        );
        break;
      case 'depth':
        planner.scene.setCurrentModelDepth(
          value,
          R2D.scene.currentView3DObject?.getType() == 3 ? false : lockState,
          mouseDown.status
        );
        break;
      case 'elevation':
        planner.scene.setCurrentModelElevation(value, mouseDown.status);
        break;
    }

    if (isForWall) {
      R2D.scene.constructor.pickElement(currSceneObj.objectId);
      R2D.scene.constructor.dropElement(R2D.Scene.getObjectDataForWallElement(currSceneObj), 10);
    }

    const { width, height, depth, elevation } = planner.scene.getCurrentModelSizes();

    setObjectWidth(width);
    setObjectHeight(height);
    setObjectDepth(depth);
    setObjectElevation(elevation);

    !mouseDown.status &&
      planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));

    if (mouseDown.status == false) dispatch(changeUndoRedo());
  };

  const onChangeRotation = (mouseDown, value, type) => {
    if (!R2D.scene.currentView3DObject) return;
    planner.scene.setCurrentObjectRotation(value, type, mouseDown.status);

    setObjectRotationX(GEOM.toDeg(R2D.scene.currentView3DObject?.object3d.rotation.x).toFixed(0));
    setObjectRotationY(GEOM.toDeg(R2D.scene.currentView3DObject?.object3d.rotation.y).toFixed(0));
    setObjectRotationZ(GEOM.toDeg(R2D.scene.currentView3DObject?.object3d.rotation.z).toFixed(0));

    if (mouseDown.status == false) dispatch(changeUndoRedo());
  };

  const onMoveObjectSmart = (e) => setObjectElevation(e.data.elevation);

  const onChange2dModelButtons = (e) => {
    setObjectWidth(e.data.size.width);
    setObjectDepth(e.data.size.depth);
  };

  const updateFavorites = async () => {
    if (!isLogged) return dispatch(setActivePopup({ name: 'login' }));
    const id = currSceneObj?.productId;
    if (isInFavorites) {
      await user.uRemoveFromFavorites(id);
      setUserFavorites((prev) => prev.filter((i) => i?.id != id));
      dispatch(updateAnimateFavoritesHideStatus(true));
      setTimeout(() => dispatch(updateAnimateFavoritesHideStatus(false)), 10);
    } else {
      const response = await user.uAddToFavorites(id);
      setUserFavorites((prev) => {
        const newArray = prev;
        return [...newArray, response];
      });

      dispatch(updateAnimateFavoritesShowStatus(true));
      setTimeout(() => dispatch(updateAnimateFavoritesShowStatus(false)), 10);
    }
    setIsInFavorites(!isInFavorites);
    planner.apiScene.dispatchEvent(new Event(planner.apiScene.FAVORITES_BUTTON, {}));
  };

  const elevationUpdate = (e) => setObjectElevation(e.data.elevation);

  const onObjectRotationAxis = (e) => {
    if (!R2D.scene.currentView3DObject) return;
    setObjectRotationX(GEOM.toDeg(R2D.scene.currentView3DObject?.object3d.rotation.x).toFixed(0));
    setObjectRotationY(GEOM.toDeg(R2D.scene.currentView3DObject?.object3d.rotation.y).toFixed(0));
    setObjectRotationZ(GEOM.toDeg(R2D.scene.currentView3DObject?.object3d.rotation.z).toFixed(0));
  };

  const onChangeRotationMode = (e) => {
    R2D.scene.isRotation3dActive = !is3DModeRotationActive;
    dispatch(updateIs3DRotationModeActive(!is3DModeRotationActive));
  };

  const redirectToProductURL = (e, id, url) => {
    e.preventDefault();
    configProductDetailsMerchantLogic
      ? R2D.postMessageToParent(JSON.stringify({ action: 'product_details_show', id }))
      : window.open(url);
  };

  const onClickChangeOrigModel = (e) => {
    const radioBtnsState = [];
    R2D.modelUploader = new R2D.ModelUploader();
    currSceneObj.getMaterials &&
      currSceneObj.getMaterials().forEach(
        (i, index) =>
          (radioBtnsState[index] = {
            fromModelRadio: i.default == '0' ? true : false,
            fromCatalogRadio: i.default == '0' ? false : true,
          })
      );
    dispatch(hideQuickPanelVisible({ name: 'helper_model' }));
    dispatch(
      changeActiveControlPanelMode({
        mode: 'uploadModel',
        data: {
          type: 'main',
          lastSavedScroll: 0,
          data: { type: 'change', categoryId: null, radioBtnsState },
        },
      })
    );
  };

  const onChangeLightState = async (e) => {
    setPreloaderStatus(true);
    const canLightSwitch = await R2D.scene.currentView3DObject.lightViewer?.switchLight();
    setPreloaderStatus(false);
    if (!canLightSwitch)
      return dispatch(setActivePopup({ name: 'alert', data: 'WARNING_TOOM_MANY_LIGHTS' }));
    setIsLightOn(!isLightOn);
    R2D.scene.history.saveState();
    dispatch(changeUndoRedo());
  };

  const onLightSettingsClick = (e) =>
    dispatch(controlPanelHistoryAdd({ type: 'colorpickerLight' }));

  const updateSomeDataAfterConfig = (e) => {
    const { width, height, depth, elevation } = planner.scene.getCurrentModelSizes() || {
      width: 0,
      height: 0,
      depth: 0,
      elevation: 0,
    };
    setObjectWidth(width);
    setObjectHeight(height);
    setObjectDepth(depth);
    setObjectElevation(elevation);
    setPreviewMaterialsId([...planner.scene.getCurrentModelMaterials()]);
  };

  const mouseEnterMaterial = (index) => {
    clearTimeout(delayAfterMaterialMouseLeave);
    delayBeforeMaterialMouseEnter = setTimeout(() => {
      const materialData = previewMaterialsId[index];
      const view3dObject = planner.mih()._scene.currentView3DObject.getObject3d();
      view3dObject.children.forEach((i) => {
        const userData = i.userData;
        if (materialData.hash == userData.md5 && materialData.setId == materialData.setId) {
          planner.mih().setActiveMesh(i);
          planner.mih()._currentViewer.rendererUpdate();
        }
      });
    }, 100);
  };

  const mouseLeaveMaterial = (index) => {
    clearTimeout(delayBeforeMaterialMouseEnter);
    delayAfterMaterialMouseLeave = setTimeout(() => {
      planner.mih().unsetActiveMesh();
      planner.mih()._currentViewer.rendererUpdate();
    }, 100);
  };

  const mouseLeaveLogoMaterial = (index) => {
    clearTimeout(delayBeforeMaterialMouseEnter);
    delayAfterMaterialMouseLeave = setTimeout(() => {
      if (!R2D.LogoEditor.isLogoEditing) planner.mih().unsetActiveMesh();
      planner.mih()._currentViewer.rendererUpdate();
    }, 100);
  };

  const mouseEnterLogoMesh = (mesh) => {
    clearTimeout(delayAfterMaterialMouseLeave);
    delayBeforeMaterialMouseEnter = setTimeout(() => {
      planner.mih().setActiveMesh(mesh);
      planner.mih()._currentViewer.rendererUpdate();
    }, 100);
  };

  const mouseDiscountEnter = async (event, discount, promocode) => {
    if (mouseDownOnObj || isCurrDeviceAPhone) return;
    document.querySelector('.' + classes.product_hover) &&
      document.querySelector('.' + classes.product_hover).classList.add(classes.hidden);

    const product = event.currentTarget;
    const closesetCatalogElem = event.target.closest('.' + classes.prod_item);
    const hoverWindow = document.createElement('div');
    hoverWindow.classList.add(classes.product_hover_discount);

    document.querySelector('body').append(hoverWindow);

    const discountDiv = document.createElement('div');
    const discountDivText = document.createElement('p');
    const discountDivValue = document.createElement('p');
    discountDivText.innerHTML = translation['PRODUCT_DISCOUNT'] + ': ';
    discountDivValue.innerHTML = discount + '%';
    discountDivValue.classList.add(classes.discountValueText);
    discountDiv.append(discountDivText);
    discountDiv.append(discountDivValue);

    const promocodeDiv = document.createElement('div');
    const promocodeDivText = document.createElement('p');
    const promocodeDivValue = document.createElement('p');
    promocodeDivValue.classList.add(classes.discountValueText);
    promocodeDivText.innerHTML = translation['PRODUCT_PROMOCODE'] + ': ';
    promocodeDivValue.innerHTML = promocode;
    promocodeDiv.append(promocodeDivText);
    promocodeDiv.append(promocodeDivValue);

    hoverWindow.append(discountDiv);
    hoverWindow.append(promocodeDiv);
    setTimeout(() => {
      hoverWindow.style.left =
        closesetCatalogElem.getBoundingClientRect().left + closesetCatalogElem.offsetWidth + 'px';
      hoverWindow.style.top =
        product.getBoundingClientRect().top +
        (product.getBBox().height - hoverWindow.offsetHeight) / 2 +
        'px';
    }, 50);
  };

  const mouseDiscountLeave = (e) => {
    document.querySelector('.' + classes.product_hover_discount) &&
      document.querySelector('.' + classes.product_hover_discount).remove();
  };

  useEffect(() => {
    setStyleAnimation({ transform: 'translateX(0%)' });
    planner.scene.addEventListener(planner.scene.MODEL_CHANGE_SIZE, onChange2dModelButtons);
    planner.scene.addEventListener(planner.scene.OBJECT_SMART_MOVE, onMoveObjectSmart);
    planner.scene.addEventListener(planner.scene.OBJECT_ROTATION_AXIS, onObjectRotationAxis);
    planner.scene.addEventListener(planner.scene.ELEVATION_OBJECT, elevationUpdate);
    planner.scene.addEventListener(
      planner.scene.SELECTED_PRODUCT_UPDATE_AFTER_CONFIG,
      updateSomeDataAfterConfig
    );

    setIsInFavorites(userFavorites?.find((i) => i?.id == currSceneObj?.productId));

    if (currSceneObj?.objectData?.applications) {
      const applicationsReactArray = [];
      for (const key in currSceneObj.objectData?.applications) {
        if (metadata[key.toLowerCase()]?.config?.start == 'disabled-react') continue;
        applicationsReactArray.push(
          <RemoteComponentMain
            key={key}
            data={{
              translation,
              plannerData: R2D,
              plannerApi: planner.apiScene,
              url: metadata[key.toLowerCase()]?.data?.url,
              applicationType: key.toLowerCase(),
            }}
            zipUrl={currSceneObj.objectData?.applications[key]}
          />
        );
      }
      updateProductApplications(applicationsReactArray);
    }

    setIsFixedSize(
      disabledSizes ||
        (currSceneObj?.getIsFixedSizeEnabled && currSceneObj?.getIsFixedSizeEnabled())
    );

    return () => {
      planner.scene.removeEventListener(planner.scene.MODEL_CHANGE_SIZE, onChange2dModelButtons);
      planner.scene.removeEventListener(planner.scene.OBJECT_SMART_MOVE, onMoveObjectSmart);
      planner.scene.removeEventListener(planner.scene.ELEVATION_OBJECT, elevationUpdate);
      planner.scene.removeEventListener(planner.scene.OBJECT_ROTATION_AXIS, onObjectRotationAxis);
      planner.scene.removeEventListener(
        planner.scene.SELECTED_PRODUCT_UPDATE_AFTER_CONFIG,
        updateSomeDataAfterConfig
      );
    };
  }, []);

  useEffect(() => {
    if (previewMaterialsId) {
      const prevMatArray = [];

      if (logoMeshes && logoMeshes.length > 0) {
        logoMeshes.forEach((i, index) => {
          prevMatArray.push(
            <LogoComponent
              key={index}
              mouseLeaveMaterial={mouseLeaveLogoMaterial}
              mouseEnterMaterial={(e) => mouseEnterLogoMesh(i.mesh)}
              previewSrc={i.src}
              onCopyPaste={{ paste: onPasteLogoMesh, index, statusCopy: true }}
            />
          );
        });
      }

      previewMaterialsId.forEach((i, index) => {
        if (i.source && i.source != 'none')
          prevMatArray.push(
            <MaterialComponent
              key={prevMatArray.length + index}
              mouseLeaveMaterial={mouseLeaveMaterial}
              mouseEnterMaterial={(e) => mouseEnterMaterial(index)}
              materialsSource={{
                type: previewMaterialsId[index].source,
                data: previewMaterialsId[index].setId,
              }}
              matId={i.matId}
              addMaterial={i.addMaterial}
              onCopyPaste={{
                copy: onCopyMaterial,
                paste: onPasteMaterial,
                index,
                statusCopy: true,
              }}
              onClick={(e) => props.onClickPreview(index)}
              mesh={!i.addMaterial && (!i.matId || i.matId === '0') ? index + '' : ''}
              lock={false}
            />
          );
      });
      setPreviewMaterials(prevMatArray);
      setMaterislsCount(prevMatArray.length);
    }

    setPreloaderStatus(false);
  }, [previewMaterialsId, isLogged, logoMeshes]);

  useEffect(() => {
    R2D.scene.isRotation3dActive = is3DModeRotationActive;
    if (is3DModeRotationActive) {
      const areRingsOnScene = R2D.scene3d.top.children.find((i) => i.name == 'rotationRings')
        ? true
        : false;
      if (!areRingsOnScene) {
        const rings = planner.mih().createRings3D();
        R2D.scene3d.add(rings, 'top');

        planner.mih()._currentViewer.rendererUpdate();
      }
    } else {
      R2D.scene3d.top.children.forEach((i) => {
        if (i.name == 'rotationRings') {
          i.clear();
          i.removeFromParent();
        }
      });

      planner.mih().state.setOnRotationDownStatus
        ? planner.mih().state.setOnRotationDownStatus(false)
        : planner.mih().stateSelectedProduct.setOnRotationDownStatus(false);
      planner.mih()._currentViewer.rendererUpdate();
    }
  }, [is3DModeRotationActive]);

  useEffect(() => {
    setUserFavorites(user.data.favorites?.items || []);
  }, [isLogged]);

  return previewMaterials ? (
    <div className={classes.planner_catalog_cont} ref={mainDiv} style={styleAnimation}>
      <div className={classes.catalog_wr}>
        <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
          <div className={classes.prod_item}>
            <div className={classes.item_info_content}>
              <div className={classes.item_info_name}>{currSceneObj?.objectData?.name}</div>

              {attributesArray &&
              attributesArray.length > 0 &&
              (productBrand || (startingFrom && currency)) ? (
                <div className={classes.item_info_attributes}>
                  {productBrand && (
                    <div className={classes.item_info_attributes_brand}>
                      <span>{productBrand?.name}:</span> <span>{productBrand?.value.value}</span>
                    </div>
                  )}
                  {startingFrom && currency && (
                    <div className={classes.item_info_attributes_price}>
                      <span>{startingFrom?.name}:</span>
                      <span>{startingFrom?.value + currency.value}</span>
                    </div>
                  )}
                </div>
              ) : null}

              <div>
                id: <span>{currSceneObj?.objectData?.id}</span>
                {matchedLinkObject?.url || currSceneObj?.objectData?.details.productPage.url ? (
                  <div
                    className={classes.prod_item_url}
                    onClick={(e) =>
                      redirectToProductURL(
                        e,
                        currSceneObj?.productId,
                        matchedLinkObject?.url || currSceneObj?.objectData?.details.productPage.url
                      )
                    }
                  >
                    {translation['PRODUCT_URL_DETAILS']}
                    <IconExternalLink size={11} color="#66ACF4" />
                  </div>
                ) : null}
              </div>
            </div>

            <div className={classes.prod_item_img_wr}>
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
              {matchedLinkObject?.discount ? (
                <div className={classes.prod_item_promocode_btn}>
                  <IconRosetteDiscountFilled
                    size={20}
                    color="#FFB400"
                    onMouseLeave={mouseDiscountLeave}
                    onMouseEnter={(event) =>
                      mouseDiscountEnter(
                        event,
                        matchedLinkObject?.discount,
                        matchedLinkObject?.promocode
                      )
                    }
                  />
                </div>
              ) : null}
              <img
                src={
                  currSceneObj
                    ? R2D.URL.DOMAIN + currSceneObj.objectData?.source.images.preview
                    : ''
                }
              />
            </div>

            {currSceneObj?.isLight ? (
              <div className={classes.plannerLight}>
                <div className={classes.plannerLight_top}>
                  <IconBulb size={26} color="#444444" className={classes.plannerLight_off} />

                  <div className={classes.plannerLight_button} onClick={onChangeLightState}>
                    <span
                      style={
                        isLightOn
                          ? { transform: 'translateX(100%)' }
                          : { transform: 'translateX(-40%)' }
                      }
                    ></span>
                  </div>
                  <IconBulbFilled size={26} color="#444444" />
                </div>
                <p
                  className={classes.plannerLight_settings}
                  style={isLightOn ? {} : { visibility: 'hidden' }}
                  onClick={onLightSettingsClick}
                >
                  {translation['TEXT_SETTINGS']}
                </p>
              </div>
            ) : null}

            {isOriginalModel ? (
              <div className={classes.planner_origModel_button}>
                <BlueButton
                  onClick={onClickChangeOrigModel}
                  label={translation['PRODUCT_CUSTOM_MODEL_EDIT']}
                />
              </div>
            ) : null}

            <div className={classes.planner_configurtate_btn_wr}>{productApplications}</div>

            <div className={classes.plannerChangeSizesWrap}>
              <div className={classes.plannerChangeSizes}>
                <ChangeSize
                  isFixedSize={isFixedSize}
                  valueChangeType={'width'}
                  changeValue={onChangeSize}
                  value={objectWidth}
                  label={translation['WIDTH']}
                />
                <ChangeSize
                  isFixedSize={isFixedSize}
                  valueChangeType={'height'}
                  changeValue={onChangeSize}
                  value={objectHeight}
                  label={translation['HEIGHT']}
                />
                <ChangeSize
                  isFixedSize={isFixedSize}
                  valueChangeType={'depth'}
                  changeValue={onChangeSize}
                  value={objectDepth}
                  label={translation['DEPTH']}
                />
                <ChangeSize
                  valueChangeType={'elevation'}
                  changeValue={onChangeSize}
                  value={objectElevation}
                  label={translation['ELEVATION']}
                />
              </div>
              <div>
                <div className={classes.changeSizesLockWr}>
                  <div className={classes.changeSizesLockLine1}></div>
                  <div className={classes.changeSizesLockLine2}></div>
                  <div className={classes.changeSizesLockLine3}></div>

                  <LockSize
                    isFixedSize={isFixedSize}
                    lockState={lockState}
                    right={'-7px'}
                    top={window.innerWidth > 950 ? '35px' : '35px'}
                  />
                </div>
              </div>
            </div>

            <div className={classes.prod_item_accordion_option_wr}>
              {!isCurrDeviceAPhone ? (
                <div>
                  <div className={classes.prod_item_setting}>
                    <div className={classes.prod_item_setting_title}>
                      {translation['3D_ROTATION_TEXT']}
                    </div>
                    <div
                      className={
                        is3DModeRotationActive
                          ? classes.switch_wr + ' ' + classes.switch_wr_active
                          : classes.switch_wr
                      }
                      onClick={onChangeRotationMode}
                    >
                      <span className={classes.switch_slider}></span>
                    </div>
                  </div>
                  {is3DModeRotationActive ? (
                    <div className={classes.plannerChangeRotationWrap}>
                      <div
                        className={
                          is3DModeRotationActive
                            ? classes.plannerChangeRotation
                            : classes.plannerChangeRotation_hide
                        }
                      >
                        <div className={classes.plannerChangeRotation_item}>
                          <div className={classes.plannerChangeRotation_axis_x}></div>
                          <ChangeSize
                            notConvertToCurrentMetric={true}
                            lessThenZero={true}
                            type={'style_2'}
                            valueChangeType={'x'}
                            labelAfter={'°'}
                            changeValue={onChangeRotation}
                            value={objectRotationX}
                          />
                        </div>
                        <div className={classes.plannerChangeRotation_item}>
                          <div className={classes.plannerChangeRotation_axis_y}></div>
                          <ChangeSize
                            notConvertToCurrentMetric={true}
                            lessThenZero={true}
                            type={'style_2'}
                            valueChangeType={'y'}
                            labelAfter={'°'}
                            changeValue={onChangeRotation}
                            value={objectRotationY}
                          />
                        </div>
                        <div className={classes.plannerChangeRotation_item}>
                          <div className={classes.plannerChangeRotation_axis_z}></div>
                          <ChangeSize
                            notConvertToCurrentMetric={true}
                            lessThenZero={true}
                            type={'style_2'}
                            valueChangeType={'z'}
                            labelAfter={'°'}
                            changeValue={onChangeRotation}
                            value={objectRotationZ}
                          />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div
              className={
                classes.materialsGrid +
                ' ' +
                (materislsCount > 3
                  ? classes.materialsGrid_4
                  : materislsCount === 3
                    ? classes.materialsGrid_3
                    : materislsCount === 1
                      ? classes.materialsGrid_1
                      : '')
              }
            >
              {previewMaterials || null}
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
  ) : null;
};

export default Main;
