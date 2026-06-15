import 'simplebar-react/dist/simplebar.min.css';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { planner, user, GEOM } from '../../../../../../initR2D';
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
import {
  selectIsLogged,
  selectUserProfileData,
  selectUserProjectActive,
} from '../../../../../../redux/features/user/userSlice';
import ChangeSize from '../../../../../common/ChangeSize';
import FavoriteStarIcon from '../../../../../common/FavoriteStarIcon';
import Lock from '../../../../../common/Lock';
import LockSize from '../../../../../common/LockSize';
import RemoteComponentMain from '../../../../../common/RemoteComponentMain';
import BlueButton from '../../components/BlueButton';
import LogoComponent from '../../components/LogoComponent';
import MaterialComponent from '../../components/MaterialComponent';
import { useTranslation } from '../../../../../../api/hooks/useTranslation';

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
  '@font-face': [
    {
      fontFamily: 'RobotoCondensed-Regular',
      fontWeight: 300,
      fontDisplay: 'swap',
      src: 'url("/src_designer/fonts/RobotoCondensed-Regular.ttf") format("truetype")',
    },
  ],
  planner_catalog_cont: {
    background: '#fff',
    height: '100%',
    display: 'grid',
    alignContent: 'baseline',
    gridTemplateRows: '1fr',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
    width: 309,
    position: 'absolute',
    left: 0,
    top: 0,
    borderRight: '1px solid #cdcdcd',
    '@media screen and (max-width: 950px)': {
      width: 189,
    },
  },
  catalog_wr: {
    overflow: 'hidden',
    height: '100%',
    background: '#fff',
  },

  item_info_content: {
    padding: '0 6px 8px 6px',
    color: '#7B7B7B',
    fontSize: '13px',
    lineHeight: 1.4,
    marginTop: 8,
    '& span': {
      color: '#000',
    },
    '&>div>div': {
      fontSize: '17px',
      color: '#000000',
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
    color: ' #000',
    marginBottom: 8,
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      marginBottom: 3,
    },
  },
  prod_item_url: {
    color: '#66ACF4!important',
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
    background: '#fff',
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
        stroke: '#64BCF0',
        fillOpacity: 0,
        '@media screen and (max-width: 950px)': {
          stroke: '#464646',
          fillOpacity: 1,
        },
      },
    },
  },
  prod_item_fav_btn_active: {
    '& path': {
      fill: '#64BCF0',
      stroke: '#64BCF0',
      fillOpacity: 1,
    },
  },
  title: {
    width: '100%',
    minHeight: '29px',
    backgroundColor: 'rgba(129, 129, 129, 0.9)',
    fontSize: '13px',
    color: '#fff',
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
    background: '#66ACF4',
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
    borderTop: '1px solid #A1A1A1',
    borderRight: '1px solid #A1A1A1',
    opacity: '0.5',
  },
  changeSizesLockLine2: {
    borderTop: '1px solid #A1A1A1',
    opacity: '0.5',
    width: 13,
  },
  changeSizesLockLine3: {
    width: '100%',
    height: 11,
    borderBottom: '1px solid #A1A1A1',
    borderRight: '1px solid #A1A1A1',
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
      border: '1px solid #E9E9E9',
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
        fill: '#a0a0a0',
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
    border: '2px solid #000000',
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
    backgroundColor: '#D9D9D9',
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
      backgroundColor: '#2A3435',
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
      color: '#ffffff',
      fontSize: 13,
      fontWeight: 400,
      border: 'none',
      cursor: 'pointer',
      transition: 'all .3s ease',
      '&:hover': {
        background: '#ffd119',
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
    color: '#66ACF4',
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
    background: '#D9D9D9',
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
    background: '#66ACF4',
    padding: '10px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '10px 0 10px',
    textTransform: 'uppercase',
    fontSize: 13,
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all .5s ease',
    '& svg': {
      marginLeft: 5,
    },
    '&:hover': {
      background: '#fcc749',
    },
  },
  prod_item_img_wr_icons: {
    position: 'absolute',
    top: 5,
    right: 5,
    display: 'flex',
    flexDirection: 'column',
  },
  prod_item_zamok_btn: {
    width: '18px',
    height: '18px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#fff',
    borderRadius: '50%',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    marginBottom: 10,
    cursor: 'default',
    '& svg': {
      width: 18,
      height: 18,
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
    background: '#fff',
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
      color: '#7B7B7B',
      fontSize: 13,
      fontWeight: 400,
    },
    '& > span:last-child': {
      color: '#000000',
      fontSize: 13,
      fontWeight: 400,
    },
  },
  item_info_attributes_price: {
    '& > span:first-child': {
      color: '#7B7B7B',
      fontSize: 13,
      fontWeight: 400,
      margin: 0,
    },
    '& > span:last-child': {
      color: '#000000',
      fontSize: 17,
      fontWeight: 400,
    },
  },
  product_hover_discount: {
    maxWidth: 200,
    maxHeight: 200,
    padding: '10px 20px',
    textAlign: 'center',
    border: '1px solid #BEBCBC',
    position: 'absolute',
    borderRadius: 3,
    display: 'inline',
    zIndex: 105,
    background: '#fff',
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
      background: '#fff',
      borderRight: '1px solid #BEBCBC',
      borderBottom: '1px solid #BEBCBC',
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

  const userData = useSelector(selectUserProfileData);
  const userProjectActive = useSelector(selectUserProjectActive);

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

  const [mouseDown, setMouseDown] = useState({ status: false, action: null, type: null });

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

    setMouseDown({ ...mouseDown, type });
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
    setMouseDown({ ...mouseDown, type });
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
              lockMaterialStatus={false}
              previewSrc={i.src}
              onCopyPaste={{ paste: onPasteLogoMesh, index, statusCopy: true }}
            />
          );
        });
      }

      previewMaterialsId.forEach((i, index) => {
        const pollMaterials = Object.entries(R2D.Pool._products_data);
        let needToLock = false;
        const id = i.addMaterial || i.matId;
        const currentMaterial = pollMaterials.find((y) => y[0] == id);
        const plan = currentMaterial?.[1]?.plan;

        if (user.data.plan == 'free') {
          if (Array.isArray(plan) || (plan !== 'free' && plan)) {
            needToLock = true;
          }
        }

        if (i.source && i.source != 'none')
          prevMatArray.push(
            <MaterialComponent
              key={prevMatArray.length + index}
              mouseLeaveMaterial={mouseLeaveMaterial}
              mouseEnterMaterial={(e) => mouseEnterMaterial(index)}
              lockMaterialStatus={needToLock}
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
                statusCopy: needToLock ? false : true,
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
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <g clipPath="url(#clip0_4324_6932)">
                        <path
                          d="M7.94443 11H1.83332C1.34359 11 0.88321 10.8093 0.536953 10.463C0.190697 10.1167 0 9.65633 0 9.16666V3.05555C0 2.56584 0.190719 2.10546 0.536975 1.7592C0.883231 1.41295 1.34361 1.22223 1.83334 1.22223H4.27778C4.61531 1.22223 4.8889 1.49582 4.8889 1.83334C4.8889 2.17087 4.61531 2.44446 4.27778 2.44446H1.83332C1.67008 2.44446 1.51663 2.50803 1.40123 2.62344C1.28582 2.73884 1.22223 2.89231 1.22223 3.05555V9.16666C1.22223 9.3299 1.2858 9.48335 1.40123 9.59879C1.51663 9.71418 1.67008 9.77777 1.83332 9.77777H7.9444C8.10765 9.77777 8.2611 9.7142 8.37652 9.59875C8.49193 9.48335 8.5555 9.32988 8.5555 9.16663V6.72222C8.5555 6.38469 8.82911 6.11113 9.16663 6.11113C9.50416 6.11113 9.77777 6.38471 9.77777 6.72222V9.16666C9.77777 9.65637 9.58705 10.1167 9.24077 10.463C8.8945 10.8093 8.43409 11 7.94443 11ZM4.27778 7.33331C4.12137 7.33331 3.96498 7.27367 3.84566 7.15433C3.60702 6.91569 3.60702 6.52873 3.84566 6.29008L8.9135 1.22223H6.72222C6.38469 1.22223 6.11112 0.94864 6.11112 0.611115C6.11112 0.27359 6.38469 4.03588e-07 6.72222 4.03588e-07H10.3889C10.5485 -0.000183134 10.7017 0.0622398 10.8158 0.173854L10.8158 0.173897L10.817 0.175093L10.8174 0.175434L10.8183 0.176373L10.8189 0.176992L10.8196 0.177676L10.8209 0.178999L10.8223 0.180323L10.8229 0.181006L10.8235 0.181625C10.824 0.182029 10.8244 0.182464 10.8248 0.182927L10.826 0.184144L10.8261 0.184187C10.9377 0.298242 11.0001 0.451519 10.9999 0.611094V4.27776C10.9999 4.61528 10.7263 4.88888 10.3888 4.88888C10.0513 4.88888 9.77768 4.61528 9.77768 4.27776V2.08648L4.70979 7.15436C4.59056 7.27369 4.43417 7.33331 4.27778 7.33331Z"
                          fill="#66ACF4"
                        ></path>
                      </g>
                      <defs>
                        <clipPath id="clip0_4324_6932">
                          <rect width="11" height="11" fill="#66ACF4"></rect>
                        </clipPath>
                      </defs>
                    </svg>
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
              <div className={classes.prod_item_img_wr_icons}>
                {currSceneObj?.plan == 'free' ||
                (currSceneObj?.plan?.find &&
                  (currSceneObj?.plan.find((i) => i == userData.plan) ||
                    currSceneObj?.plan.find(
                      (i) => i == userProjectActive.plan
                    ))) ? null : currSceneObj?.objectData?.plan?.includes('basic') ? (
                  <Lock
                    additionalClass={classes.prod_item_zamok_btn}
                    tipPositionY={'top'}
                    tipPositionX={'right'}
                    upgradePro={true}
                    upgradeBasic={true}
                    textHover={'UPGRADE_YOUR_PLAN_TEXT'}
                    parentClass={classes.prod_item_img_wr}
                  />
                ) : currSceneObj?.objectData?.plan?.includes('pro') ? (
                  <Lock
                    additionalClass={classes.prod_item_zamok_btn}
                    tipPositionY={'top'}
                    tipPositionX={'right'}
                    upgradePro={true}
                    textHover={'UPGRADE_YOUR_PLAN_TEXT'}
                    parentClass={classes.prod_item_img_wr}
                  />
                ) : null}
              </div>
              {matchedLinkObject?.discount ? (
                <div className={classes.prod_item_promocode_btn}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    className={classes.prod_item_promocode}
                    onMouseLeave={mouseDiscountLeave}
                    onMouseEnter={(event) =>
                      mouseDiscountEnter(
                        event,
                        matchedLinkObject?.discount,
                        matchedLinkObject?.promocode
                      )
                    }
                  >
                    <path
                      d="M19.0737 7.7565L18.4632 7.14582C18.1684 6.85104 18 6.45093 18 6.02982V5.16648C18 3.41889 16.5789 1.99764 14.8316 1.99764H13.9684C13.5474 1.99764 13.1474 1.83979 12.8526 1.53449L12.2421 0.923802C11.0105 -0.307934 9 -0.307934 7.75789 0.923802L7.14735 1.53449C6.85261 1.83979 6.45261 1.99764 6.03156 1.99764H5.16839C3.42102 1.99764 2.00002 3.41889 2.00002 5.16648V6.02982C2.00002 6.45093 1.84213 6.85104 1.53686 7.14582L0.926316 7.7565C0.326316 8.35662 0 9.15652 0 9.99873C0 10.8409 0.326316 11.6409 0.926316 12.241L1.53686 12.8517C1.84213 13.1465 2.00002 13.5467 2.00002 13.9678V14.831C2.00002 16.5786 3.42102 17.9999 5.16839 17.9999H6.03156C6.45261 17.9999 6.85261 18.1578 7.14735 18.4631L7.75789 19.0738C8.37895 19.6949 9.18947 20 10 20C10.8105 20 11.6211 19.6949 12.2421 19.0738L12.8526 18.4631C13.1474 18.1578 13.5474 17.9999 13.9684 17.9999H14.8316C16.5789 17.9999 18 16.5786 18 14.831V13.9678C18 13.5467 18.1684 13.1465 18.4632 12.8517L19.0737 12.241C19.6737 11.6409 20 10.8409 20 9.99873C20 9.15652 19.6737 8.35662 19.0737 7.7565ZM7.36842 6.0509C8.09474 6.0509 8.68421 6.64045 8.68421 7.36685C8.68421 8.09322 8.09474 8.68277 7.36842 8.68277C6.64211 8.68277 6.05263 8.09322 6.05263 7.36685C6.05263 6.64045 6.64211 6.0509 7.36842 6.0509ZM12.6316 13.9466C11.9053 13.9466 11.3158 13.357 11.3158 12.6306C11.3158 11.9042 11.9053 11.3147 12.6316 11.3147C13.3579 11.3147 13.9474 11.9042 13.9474 12.6306C13.9474 13.357 13.3579 13.9466 12.6316 13.9466ZM13.9053 7.58789L7.5895 13.9045C7.37897 14.1045 7.11579 14.2098 6.84211 14.2098C6.57895 14.2098 6.30524 14.1045 6.09472 13.9045C5.68419 13.4939 5.68419 12.8202 6.09472 12.4097L12.4105 6.09305C12.8316 5.68247 13.4947 5.68247 13.9053 6.09305C14.3158 6.50363 14.3158 7.17731 13.9053 7.58789Z"
                      fill="#FFB400"
                    />
                  </svg>
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
                  <svg
                    width="14"
                    height="20"
                    viewBox="0 0 14 20"
                    fill="none"
                    className={classes.plannerLight_off}
                  >
                    <g opacity="0.5">
                      <path
                        d="M10.6889 14.2901C10.8528 13.63 10.4497 12.9611 9.7898 12.7974L9.7898 12.7974L9.78643 12.7965C9.11222 12.6342 8.45766 13.0482 8.29647 13.6971L8.29646 13.6972C8.13999 14.3274 7.5321 14.8991 6.66171 14.8991C5.98073 14.8991 5.42928 15.4506 5.42928 16.1315C5.42928 16.8125 5.98073 17.364 6.66171 17.364C8.70259 17.364 10.2726 15.97 10.6889 14.2901ZM10.6889 14.2901L10.2037 14.1696L10.689 14.2898C10.689 14.2899 10.6889 14.29 10.6889 14.2901ZM8.13108 19.1161L8.13108 19.1161L8.12745 19.1169C6.25331 19.5651 4.34554 19.1442 2.8707 17.9809C1.40869 16.8163 0.569909 15.0711 0.569909 13.2018C0.569909 11.5784 1.20443 10.0502 2.34161 8.89806C3.09338 8.16132 3.4996 7.05572 3.4996 5.98993L3.4996 5.8288C3.4996 5.69479 3.598 5.59637 3.73202 5.59637L9.59139 5.59637C9.72541 5.59637 9.82382 5.69479 9.82382 5.8288L9.82382 5.98993C9.82382 7.06572 10.2126 8.14339 10.9225 8.8533L10.9256 8.85638C12.4809 10.3847 13.0933 12.5758 12.5627 14.753C12.0365 16.8979 10.2918 18.6164 8.13108 19.1161ZM9.09139 2.89911L9.09139 3.13153L4.23202 3.13153L4.23202 2.89911C4.23202 1.96363 4.99381 1.20184 5.92929 1.20184L7.39413 1.20184C8.32961 1.20184 9.0914 1.96363 9.09139 2.89911Z"
                        fill="#444444"
                        stroke="#444444"
                      />
                    </g>
                  </svg>
                  <div className={classes.plannerLight_button} onClick={onChangeLightState}>
                    <span
                      style={
                        isLightOn
                          ? { transform: 'translateX(100%)' }
                          : { transform: 'translateX(-40%)' }
                      }
                    ></span>
                  </div>
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 26 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={classes.plannerLight_on}
                  >
                    <path
                      d="M18.3142 19.9344L20.3856 22.0058C20.6717 22.2918 21.1352 22.2918 21.4213 22.0058C21.7074 21.7197 21.7074 21.2562 21.4213 20.9701L19.3499 18.8987C19.0638 18.6126 18.6003 18.6126 18.3142 18.8987C18.0281 19.1848 18.0281 19.6483 18.3142 19.9344ZM21.4063 13.9341L24.3848 13.9341C24.7896 13.9341 25.1172 13.6065 25.1172 13.2017C25.1172 12.7968 24.7896 12.4692 24.3848 12.4692L21.4063 12.4692C21.0014 12.4692 20.6738 12.7968 20.6738 13.2017C20.6738 13.6065 21.0014 13.9341 21.4063 13.9341ZM0.849608 13.9341L3.82812 13.9341C4.23296 13.9341 4.56055 13.6065 4.56055 13.2017C4.56055 12.7968 4.23296 12.4692 3.82812 12.4692L0.849609 12.4692C0.444774 12.4692 0.117187 12.7968 0.117187 13.2017C0.117187 13.6065 0.444774 13.9341 0.849608 13.9341ZM3.81308 22.0058C4.09917 22.2918 4.56269 22.2918 4.84878 22.0058L6.92017 19.9344C7.20625 19.6483 7.20625 19.1848 6.92017 18.8987C6.63408 18.6126 6.17056 18.6126 5.88447 18.8987L3.81308 20.9701C3.527 21.2562 3.527 21.7196 3.81308 22.0058ZM12.6172 25.7017C13.022 25.7017 13.3496 25.3741 13.3496 24.9692L13.3496 21.9907C13.3496 21.5859 13.022 21.2583 12.6172 21.2583C12.2124 21.2583 11.8848 21.5859 11.8848 21.9907L11.8848 24.9692C11.8848 25.3741 12.2124 25.7017 12.6172 25.7017ZM8.51562 18.3726C10.1123 19.6324 12.1777 20.0864 14.1992 19.603C16.543 19.061 18.4326 17.2007 19.0039 14.8716C19.5752 12.5279 18.916 10.1548 17.2315 8.49956C16.6309 7.89893 16.2793 6.95659 16.2793 5.98975L16.2793 5.82861C16.2793 5.41851 15.9571 5.09619 15.5469 5.09619L9.6875 5.09619C9.2773 5.09619 8.95508 5.41851 8.95508 5.82861L8.95508 5.98974C8.95508 6.94194 8.58887 7.91362 7.94434 8.54351C6.71382 9.78862 6.02539 11.4438 6.02539 13.2017C6.02539 15.2231 6.93359 17.1128 8.51562 18.3726ZM12.6172 15.3989C13.7222 15.3989 14.5266 14.666 14.7372 13.8175C14.8331 13.4316 15.2213 13.1853 15.6249 13.2825C16.0168 13.3797 16.2564 13.7774 16.1591 14.1694C15.7962 15.6342 14.4204 16.8638 12.6172 16.8638C12.2124 16.8638 11.8848 16.5362 11.8848 16.1313C11.8848 15.7265 12.2124 15.3989 12.6172 15.3989ZM15.5469 3.63135L15.5469 2.89893C15.5469 1.68731 14.5612 0.701661 13.3496 0.701661L11.8848 0.701661C10.6731 0.701661 9.6875 1.68731 9.6875 2.89893L9.6875 3.63135L15.5469 3.63135Z"
                      fill="#444444"
                    />
                  </svg>
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
                  mouseDown={mouseDown}
                  isFixedSize={isFixedSize}
                  valueChangeType={'width'}
                  changeValue={onChangeSize}
                  value={objectWidth}
                  label={translation['WIDTH']}
                />
                <ChangeSize
                  mouseDown={mouseDown}
                  isFixedSize={isFixedSize}
                  valueChangeType={'height'}
                  changeValue={onChangeSize}
                  value={objectHeight}
                  label={translation['HEIGHT']}
                />
                <ChangeSize
                  mouseDown={mouseDown}
                  isFixedSize={isFixedSize}
                  valueChangeType={'depth'}
                  changeValue={onChangeSize}
                  value={objectDepth}
                  label={translation['DEPTH']}
                />
                <ChangeSize
                  mouseDown={mouseDown}
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
                            mouseDown={mouseDown}
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
                            mouseDown={mouseDown}
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
                            mouseDown={mouseDown}
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
