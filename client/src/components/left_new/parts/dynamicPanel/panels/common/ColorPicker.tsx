import { IconBulbFilled, IconCopy, IconHeart } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { planner, user } from '../../../../../../initR2D';
import {
  controlPanelHistoryDataUpdate,
  controlPanelHistoryRemove,
  controlPanelUpdateBreadCrumbs,
  selectActiveControlPanelModeData,
  updateAnimateFavoritesHideStatus,
  updateAnimateFavoritesShowStatus,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import { selectIsLogged } from '../../../../../../redux/features/user/userSlice';
import { useEffectAsync } from '../../../../../../utils/useEffectAsync';
import ChangeSize from '../../../../../common/ChangeSize';
import SharedColorPicker from '../../../../../../shared-components/ColorPicker';
import Tooltip from '../../../../../../shared-components/Tooltip';
import Navigation from '../../navigation/Navigation';
import CatalogScreen from './CatalogScreen';

const useStyle = createUseStyles({
  previewPreloader: {
    width: 120,
    height: 120,
    position: 'relative',
    border: '1px solid var(--color-surface-muted)',
  },

  content: {
    padding: '20px 14px',
    '@media screen and (max-width: 950px)': {
      padding: '10px 5px',
    },
  },
  title: {
    fontSize: '13px',
    color: 'var(--color-text)',
    padding: '10px 8px 10px',
  },
  grey_line: {
    borderBottom: '1px solid var(--color-border-light)',
  },

  top: {
    textAlign: 'center',
    marginBottom: 20,
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 6,
    '& canvas': {
      border: '1px solid var(--color-border-strong)',
      borderRadius: 6,
    },
    '&:hover': {
      '& $prod_item_dop_btns_wr': {
        transform: 'translateY(0)',
      },
    },
  },
  prod_item_dop_btns_wr: {
    left: 0,
    width: '100%',
    bottom: 0,
    height: 34,
    display: 'flex',
    position: 'absolute',
    transform: 'translateY(102%)',
    background: 'rgba(68, 68, 68, 0.7)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    alignItems: 'center',
    zIndex: 3,
    pointerEvents: 'none',
    padding: '0 6px',
  },
  prod_item_btn_copy: {
    display: 'flex',
    // width: 18,
    cursor: 'pointer',
    // height: 18,
    pointerEvents: 'auto',
    '& svg': {
      transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    },
    '&:hover': {
      '& svg': {
        stroke: 'var(--color-accent-soft)',
      },
    },
  },
  materials: {
    paddingBottom: 25,
    borderBottom: '1px solid var(--color-border-strong)',
    marginBottom: 20,
    '& fieldset': {
      marginBottom: 15,
      '&:last-child': {
        marginBottom: 0,
      },
      '& input': {
        marginRight: 7,
      },
    },
    '@media screen and (max-width: 950px)': {
      paddingBottom: 10,
      marginBottom: 15,
    },
  },
  matInput: {
    position: 'absolute',
    zIndex: '-1',
    opacity: 0,
    '&:checked+label': {
      '&:after': {
        opacity: '1!important',
      },
    },
  },
  matFieldset: {
    '& label': {
      position: 'relative',
      paddingLeft: 30,
      display: 'block',
      color: 'var(--color-slate)',
      fontSize: 13,
      cursor: 'pointer',

      '&:before': {
        content: '" "',
        transition: 'all .9s cubic-bezier(.19,1,.22,1)',
        width: 17,
        height: 17,
        borderRadius: '50%',
        background: 'var(--color-surface-muted)',
        position: 'absolute',
        border: '1px solid var(--color-surface-muted)',
        left: 0,
        top: 0,
        bottom: 0,
        margin: 'auto',
        '@media screen and (max-width: 950px)': {
          width: 14,
          height: 14,
        },
      },
      '&:after': {
        content: '" "',
        transition: 'all .9s cubic-bezier(.19,1,.22,1)',
        width: 9,
        height: 9,
        borderRadius: '50%',
        border: '1px solid #9DD112',
        background: 'var(--color-accent-strong)',
        position: 'absolute',
        left: 4,
        top: 0,
        bottom: 0,
        margin: 'auto',
        opacity: 0,
        '@media screen and (max-width: 950px)': {
          width: 8,
          height: 8,
          left: 3,
        },
      },
      '&:hover': {
        '&:after': {
          opacity: '0.5',
        },
      },
      '@media screen and (max-width: 950px)': {
        fontSize: 11,
        paddingLeft: 23,
      },
    },
  },
  prod_item_fav_btn: {
    width: '15px',
    height: '15px',
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
      '& path': {
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
      },
      '&:hover': {
        '& path': {
          fill: 'var(--color-icon-info)',
          stroke: 'var(--color-icon-info)',
        },
      },
    },
  },

  prod_item_fav_btn_active: {
    fill: 'var(--color-icon-info)',
    stroke: 'var(--color-icon-info)',
    '& path': {
      fill: 'var(--color-icon-info)',
      stroke: 'var(--color-icon-info)',
    },
  },
  lightObjectPower: {
    background: 'var(--color-icon-dark)',
    padding: '15px 20px 20px',
    height: 220,
    width: 'calc(100% + 28px)',
    marginLeft: '-14px',
    marginTop: '-20px',
    marginBottom: 20,
  },
  lightObjectPower_top: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
  },
  lightObjectPower_top_left: {
    display: 'flex',
    alignItems: 'center',
  },
  lightObjectPower_top_text: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-white)',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
  },
  lightObjectPower_top_tip: {
    width: 18,
    height: 18,
    borderRadius: 10,
    background: 'var(--color-white)',
    fontSize: '11.14px',
    fontWeight: 600,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    cursor: 'pointer',
  },
  lightObjectPower_center: {
    height: 'calc(100% - 20px)',
  },
  lightObjectPower_center_circle: {
    height: '100%',
    position: 'relative',
    '& svg': {
      position: 'absolute',
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 2,
    },
  },
  lightObjectPower_center_circle_background: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '50%',
    zIndex: 1,
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    boxShadow:
      'rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px',
  },
  hoverDivIcon: {
    position: 'absolute',
    background: 'var(--color-info-bright)',
    transition: 'all 0s ease-in-out 1s',
    display: 'none',
    fontSize: 12,
    width: 'max-content',
    zIndex: 9,
    padding: '2px 7px',
    transition: 'all .1s ease',
    userSelect: 'none',
  },
  navigation: {
    display: 'flex',
    borderBottom: '1px solid var(--color-border-light)',
    alignItems: 'center',
  },
});

const ColorPicker = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = activeControlPanelData.history;
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const lastHistoryElemData = lastHistoryElem?.data;
  const isLogged = useSelector(selectIsLogged);
  const translation = useTranslation();

  const [isInFavorites, setIsInFavorites] = useState(null);
  const [userFavorites, setUserFavorites] = useState(user.data.favorites?.items);
  const [currMatMesh, setCurrMatMesh] = useState(null);
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);
  // the colour shown in the picker
  const [pickerColor, setPickerColor] = useState('#aaaaaa');
  const [prevContext, setPrevContext] = useState(null);
  const [lightPower, setLightPower] = useState(props.lightPowerValue);
  const [materialsArrayData, setMaterialsArrayData] = useState([]);
  const [materialsArray, setMaterialsArray] = useState(null);
  const [preloaderStatus, setPreloaderStatus] = useState(true);

  const [selectedMaterial, setSelecterdMaterial] = useState(props.matId);
  const [selectedAddMaterial, setSelecterdAddMaterial] = useState(props.addMaterial);

  const colorPrev = useRef(null);

  const selectedMaterialId = lastHistoryElemData?.id;
  const currentColor = lastHistoryElemData?.color;

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const prevSize = 271;

  const onColorPowerChange = (_, value) => {
    if (!R2D.scene.currentView3DObject) return;
    const newValue = R2D.scene.currentView3DObject.lightViewer.setLightPower(value);
    setLightPower(newValue);
  };

  const onColorPickedMove = (e) => planner.mih().state && planner.mih().state.mouseMove(e);

  const onColorPickedMouseUp = (e) => {
    planner.mih().state && planner.mih().state.mouseUp(e);
    document.removeEventListener('mousemove', onColorPickedMove);
    document.removeEventListener('mouseup', onColorPickedMouseUp);
  };

  const downOnPrevListener = (e) => {
    document.addEventListener('mousemove', onColorPickedMove);
    document.addEventListener('mouseup', onColorPickedMouseUp);
    let selectedMaterial = selectedMaterialId;
    Array.from(document.querySelectorAll('.' + classes.matInput)).forEach((i) => {
      if (i.checked) selectedMaterial = i.id.replace('material_', '');
    });
    planner.scene.dragProductFromCatalog(pickerColor, selectedMaterial);
  };

  const updateSelectedObj = (color, addMatId) => {
    if (props.onDragColor) return;
    if (props.onlyColor) {
      props.materialSelect(
        ~color.indexOf('#') ? color : pickerColor,
        null,
        selectedMaterial,
        selectedAddMaterial
      );
      setSelecterdMaterial(~color.indexOf('#') ? color : pickerColor);
      setSelecterdAddMaterial(null);
    } else {
      if (props.materialSelect) {
        let match;
        if (
          (!addMatId && !materialsArrayData) ||
          (materialsArrayData && materialsArrayData.length < 1)
        )
          match = true;
        else match = materialsArrayData && materialsArrayData.some((i) => addMatId == i.id);
        props.materialSelect(
          ~color.indexOf('#') ? color : pickerColor,
          addMatId && match
            ? addMatId
            : materialsArrayData.length > 0
              ? materialsArrayData[0].id
              : '',
          selectedMaterial,
          selectedAddMaterial
        );
        setSelecterdMaterial(~color.indexOf('#') ? color : pickerColor);
        setSelecterdAddMaterial(
          addMatId && match
            ? addMatId
            : materialsArrayData.length > 0
              ? materialsArrayData[0].id
              : ''
        );
      } else drawColorPrev(pickerColor);
    }
  };

  function drawColorPrev(color) {
    if (!prevContext) return;
    if (currMatMesh && currMatMesh.material) {
      currMatMesh.material.color = new THREE.Color(color);
      const matPrevCanvas = R2D.Tool.getMatPrevFromAnyMesh(currMatMesh);
      prevContext.drawImage(matPrevCanvas, 0, 0, prevSize, prevSize);
    } else {
      prevContext.fillStyle = color;
      prevContext.fillRect(0, 0, prevSize, prevSize);
    }
  }

  const onColorPicked = (hex) => {
    setPickerColor(hex);
    const match = materialsArrayData.some((i) => selectedMaterialId == i.id);
    dispatch(
      controlPanelHistoryDataUpdate({
        id: match ? selectedMaterialId : materialsArrayData[0]?.id,
        color: hex,
      })
    );
    updateSelectedObj(hex, selectedMaterialId);
  };

  const onClickMaterial = async (mat) => {
    if (document.querySelector(`#material_${mat.id}`).checked) return;
    Array.from(
      document.querySelector('.' + classes.materials).getElementsByTagName('input')
    ).forEach(
      (i) => (i.checked = i.getAttribute('id') !== `material_${mat.id}` ? false : i.checked)
    );
    document.querySelector(`#material_${mat.id}`).checked = !document.querySelector(
      `#material_${mat.id}`
    ).checked;
    const background = new Image();
    background.src = R2D.URL.DOMAIN + mat.source.images.preview;
    background.onload = (e) => {
      const match = materialsArrayData.some((i) => selectedMaterialId == i.id);
      dispatch(
        controlPanelHistoryDataUpdate({ color: match ? currentColor : '#aaaaaa', id: mat.id })
      );
      updateSelectedObj(match ? currentColor : '#aaaaaa', mat.id);
    };
  };

  const updateFavorites = async () => {
    if (!isLogged) return dispatch(setActivePopup({ name: 'login' }));
    if (isInFavorites) {
      await user.uRemoveFromFavorites(selectedMaterialId, currentColor);
      setUserFavorites((prev) =>
        prev.filter((i) => i.id != selectedMaterialId || i.addData != currentColor)
      );
      dispatch(updateAnimateFavoritesHideStatus(true));
      setTimeout(() => dispatch(updateAnimateFavoritesHideStatus(false)), 10);
    } else {
      const response = await user.uAddToFavorites(selectedMaterialId, currentColor);
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

  const updateMaterialsEvent = (e) =>
    dispatch(
      controlPanelHistoryDataUpdate({
        color: R2D.scene.currentConstructorElementData.getMaterial(),
        id: R2D.scene.currentConstructorElementData.getAddMaterial(),
      })
    );

  const copyMaterial = (e) =>
    R2D.CopyPaste.copyMaterial({ id: pickerColor, addMaterial: selectedMaterialId });

  // TODO: optimize this, maybe move some code to onClickMaterial and onColorPickedMouseUp
  useEffectAsync(async () => {
    if (props.onlyColor) {
      setPreloaderStatus(true);
      const currSelectedColor =
        (props.matId && props.matId.indexOf && ~props.matId.indexOf('#') ? props.matId : null) ||
        currentColor ||
        '#aaaaaa';
      colorPrev.current && setPrevContext(colorPrev.current.getContext('2d'));
      dispatch(controlPanelHistoryDataUpdate({ ...lastHistoryElemData, color: currSelectedColor }));
      setPreloaderStatus(false);
    } else {
      setPreloaderStatus(true);
      const response = await planner.scene.categoryDataLoad(lastHistoryElem.urlList);
      if (
        response.type == 'error' ||
        response?.length < 1 ||
        response?.length == 0 ||
        !response[0]
      ) {
        dispatch(setActivePopup({ name: 'alert', data: 'TEXT_ERROR_LOAD_DATA' }));
        dispatch(controlPanelHistoryRemove());
        dispatch(controlPanelUpdateBreadCrumbs({ data: null, updateType: 'remove' }));
        setPreloaderStatus(false);
        return;
      }
      const currtSelelectedMatId = props.addMaterial || selectedMaterialId || response[0].id;
      const currSelectedColor =
        (props.matId && props.matId.indexOf && ~props.matId.indexOf('#') ? props.matId : null) ||
        currentColor ||
        '#aaaaaa';
      colorPrev.current && setPrevContext(colorPrev.current.getContext('2d'));
      if (!selectedMaterialId && !R2D.PoolMaterials.isMaterial(response[0].id))
        R2D.PoolMaterials.create('#aaaaaa', response[0].id);
      setMaterialsArrayData(response);
      setIsInFavorites(
        userFavorites?.find((i) => i?.id == currtSelelectedMatId && i.addData == currSelectedColor)
          ? true
          : false
      );
      dispatch(
        controlPanelHistoryDataUpdate({
          ...lastHistoryElemData,
          id: currtSelelectedMatId,
          color: currSelectedColor,
        })
      );
      setPreloaderStatus(false);
    }
    planner.scene.addEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
    return () =>
      planner.scene.removeEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
  }, []);

  useEffect(() => {
    setIsInFavorites(
      userFavorites?.find((i) => i?.id == selectedMaterialId && i?.addData == currentColor)
        ? true
        : false
    );
  }, [selectedMaterialId, currentColor]);

  useEffect(() => {
    if (props.onlyColor) {
      const color = currentColor && ~currentColor.indexOf('#') ? currentColor : '#aaaaaa';
      setPickerColor(color);
      drawColorPrev(color);
    } else {
      if (!selectedMaterialId) return;
      const materials = [];
      let match;
      if (
        (!selectedMaterialId && !materialsArrayData) ||
        (materialsArrayData && materialsArrayData.length < 1)
      )
        match = true;
      else match = materialsArrayData && materialsArrayData.some((i) => selectedMaterialId == i.id);
      if (prevContext) {
        const color =
          currentColor && ~currentColor.indexOf('#') && match ? currentColor : '#aaaaaa';
        setPickerColor(color);
        drawColorPrev(currentColor || color);
      }
      if (materialsArrayData && materialsArrayData.length > 1) {
        materialsArrayData.forEach((i) => {
          materials.push(
            <fieldset key={i.id} className={classes.matFieldset}>
              <input
                className={classes.matInput}
                type="radio"
                name={'material_' + i.id}
                id={'material_' + i.id}
                defaultChecked={
                  match ? selectedMaterialId == i.id : materialsArrayData[0].id == i.id
                }
              />
              <label htmlFor={'material_' + i.id} onClick={(e) => onClickMaterial(i)}>
                <span>{i.name.trim()}</span>
              </label>
            </fieldset>
          );
        });
        setMaterialsArray(materials);
      }
    }
  }, [materialsArrayData, prevContext, currentColor, selectedMaterialId]);

  useEffect(() => {
    isPreviewLoaded && colorPrev.current && setPrevContext(colorPrev.current.getContext('2d'));
  }, [isPreviewLoaded]);

  useEffectAsync(async () => {
    if (props.onlyColor) return setIsPreviewLoaded(true);
    setPreloaderStatus(true);
    setIsPreviewLoaded(false);
    if (materialsArrayData && materialsArrayData.length > 0) {
      let match;
      if (!selectedMaterialId && materialsArrayData.length < 1) match = true;
      else {
        match = materialsArrayData.some((i) => selectedMaterialId == i.id);
        const mesh = await R2D.Tool.loadMeshFromMatIdAndColor(
          (match && selectedMaterialId) || materialsArrayData[0].id
        );
        setCurrMatMesh(mesh);
      }
      setIsPreviewLoaded(true);
    }
    setPreloaderStatus(false);
  }, [selectedMaterialId, materialsArrayData]);

  useEffect(() => {
    setUserFavorites(user.data.favorites?.items || []);
  }, [isLogged]);
  useEffect(() => {
    currMatMesh &&
      drawColorPrev(
        (materialsArrayData.some((i) => selectedMaterialId == i.id) && currentColor) || '#aaaaaa'
      );
  }, [currMatMesh]);

  return (
    <CatalogScreen
      header={
        <Navigation
          panelPreviewIcon={props.panelPreviewIcon}
          hideCategoryTree={props.hideCategoryTree}
          breadcrumsTitle={props.breadcrumsTitle}
          disableBreadcrumbs={props.onlyColor}
          closeButtonStatus={true}
          isAddSettingsDisabled={props.isAddSettingsDisabled}
        />
      }
      isLoading={preloaderStatus}
    >
      <div className={classes.content}>
        {props.isForLightObjects ? (
          <div className={classes.lightObjectPower}>
            <div className={classes.lightObjectPower_top}>
              <div className={classes.lightObjectPower_top_left}>
                <p className={classes.lightObjectPower_top_text}>{translation['LIGHT_TIP_TEXT']}</p>
              </div>
              <div className={classes.lightObjectPower_top_right}>
                <ChangeSize
                  changeValue={onColorPowerChange}
                  type={'style_3'}
                  value={lightPower}
                  labelAfter={'%'}
                />
              </div>
            </div>
            <div className={classes.lightObjectPower_center}>
              <div className={classes.lightObjectPower_center_circle}>
                <div
                  className={classes.lightObjectPower_center_circle_background}
                  style={{
                    background: currentColor,
                    width: (150 / 100) * lightPower + 'px',
                    height: (150 / 100) * lightPower + 'px',
                  }}
                ></div>
                <IconBulbFilled size={32} color="#2F2F2F" />
              </div>
            </div>
          </div>
        ) : null}

        <div>
          <div></div>
          {materialsArray ? <form className={classes.materials}>{materialsArray}</form> : null}
          {props.isForLightObjects ? null : (
            <div className={classes.top}>
              <div className={classes.prod_item_dop_btns_wr}>
                <Tooltip content={translation['BUTTON_COPY_MATERIAL']}>
                  <div className={classes.prod_item_btn_copy} onClick={(e) => copyMaterial(e)}>
                    <IconCopy size={18} color="#ffffff" />
                  </div>
                </Tooltip>
              </div>

              {props.onlyColor ? null : (
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
              )}
              {isPreviewLoaded ? (
                <canvas
                  ref={colorPrev}
                  onMouseDown={props.onDragColor ? downOnPrevListener : null}
                  width={!isCurrDeviceAPhone ? 271 : 168}
                  height={!isCurrDeviceAPhone ? 120 : 80}
                ></canvas>
              ) : (
                <div className={classes.previewPreloader}>
                  <div className={'preloader-cube'}></div>
                </div>
              )}
            </div>
          )}
          <SharedColorPicker
            value={pickerColor}
            onChangeEnd={onColorPicked}
            size={isCurrDeviceAPhone ? 'small' : 'normal'}
          />
        </div>
      </div>
    </CatalogScreen>
  );
};

export default ColorPicker;
