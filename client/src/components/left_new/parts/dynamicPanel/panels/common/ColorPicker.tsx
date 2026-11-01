import { IconBulbFilled, IconCopy } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

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
import FavoriteStarIcon from '../../../../../common/FavoriteStarIcon';
import HoverComponent from '../../../controlPanel/components/HoverComponent';
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
    overflow: 'hidden',
    height: '100%',
    position: 'relative',
    background: 'var(--color-white)',
    borderTop: '1px solid var(--color-border)',
  },
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
  color_picker_palette: {
    display: 'block',
    margin: '0',
    padding: '0',
    outline: 'solid 1px #aaaaaa',
    position: 'relative',
    borderRadius: 6,
  },

  color_picker_slider: {
    display: 'block',
    margin: '0',
    padding: '0',
    position: 'relative',
  },

  color_picker_canvas: {
    display: 'block',
    margin: 0,
    padding: 0,
  },
  color_picker_pointer: {
    pointerEvents: 'none',
    display: 'block',
    margin: 0,
    padding: 0,
    outline: '2px solid var(--color-black)',
    outlineOffset: '-1px',
    position: 'absolute',
    '& color_picker_pointer': {
      outline: 'rgb(255, 255, 255) solid 2px',
      outlineOffset: '-2px',
    },
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
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingRight: 5,
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
      color: 'var(--color-text-slate)',
      fontSize: 13,
      cursor: 'pointer',

      '&:before': {
        content: '" "',
        transition: 'all .9s cubic-bezier(.19,1,.22,1)',
        width: 17,
        height: 17,
        borderRadius: '50%',
        background: '#EAEAEA',
        position: 'absolute',
        border: '1px solid #E7E7E7',
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
  color_picker_input_wr: {
    '& input': {
      width: '100%',
      height: '35px',
      border: '1px solid var(--color-border-strong)',
      borderRadius: '3px',
      padding: '0 10px',
      outline: 'none',
      '@media screen and (max-width: 950px)': {
        height: 25,
        padding: '0 5px',
        fontSize: 9,
      },
    },
  },
  preloaderBlock: {
    background: 'rgba(0, 0, 0, .2)',
    zIndex: 4,
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '100%',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
  },
});

const ColorPicker = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = activeControlPanelData.history;
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const lastHistoryElemData = lastHistoryElem?.data;
  const isLogged = useSelector(selectIsLogged);
  const translation = useTranslation();

  const [isInFavorites, setIsInFavorites] = useState(null);
  const [userFavorites, setUserFavorites] = useState(user.data.favorites?.items);
  const [currMatMesh, setCurrMatMesh] = useState(null);
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);
  const [valAll, setValAll] = useState({ valH: 0, valS: 0, valB: 100, changedVal: '' });
  const [mouseDown, setMouseDown] = useState(false);
  const [sliderCtx, setSliderCtx] = useState(null);
  const [palCtx, setPalCtx] = useState(null);
  const [prevContext, setPrevContext] = useState(null);
  const [lightPower, setLightPower] = useState(props.lightPowerValue);
  const [materialsArrayData, setMaterialsArrayData] = useState([]);
  const [materialsArray, setMaterialsArray] = useState(null);
  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );
  const [preloaderStatus, setPreloaderStatus] = useState(true);

  const [selectedMaterial, setSelecterdMaterial] = useState(props.matId);
  const [selectedAddMaterial, setSelecterdAddMaterial] = useState(props.addMaterial);

  const palPointer = useRef(null);
  const sliderPointer = useRef(null);
  const sliderCanvas = useRef(null);
  const palCanvas = useRef(null);
  const text = useRef(null);
  const colorPrev = useRef(null);

  const selectedMaterialId = lastHistoryElemData?.id;
  const currentColor = lastHistoryElemData?.color;

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  const palWidth = !isCurrDeviceAPhone ? 200 : 140;
  const palHeight = !isCurrDeviceAPhone ? 150 : 80;
  const sliderWidth = 20;
  const palPointerSize = 12;
  const sliderPointerSize = 8;
  const prevSize = 271;

  const onColorPowerChange = (mouseDown, value, type) => {
    if (!R2D.scene.currentView3DObject) return;
    const newValue = R2D.scene.currentView3DObject.lightViewer.setLightPower(value);
    setMouseDown({ ...mouseDown, type });
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
    planner.scene.dragProductFromCatalog(getHex(), selectedMaterial);
  };

  const updateSelectedObj = (color, addMatId) => {
    if (props.onDragColor) return;
    if (props.onlyColor) {
      props.materialSelect(
        ~color.indexOf('#') ? color : getHex(),
        null,
        selectedMaterial,
        selectedAddMaterial
      );
      setSelecterdMaterial(~color.indexOf('#') ? color : getHex());
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
          ~color.indexOf('#') ? color : getHex(),
          addMatId && match
            ? addMatId
            : materialsArrayData.length > 0
              ? materialsArrayData[0].id
              : '',
          selectedMaterial,
          selectedAddMaterial
        );
        setSelecterdMaterial(~color.indexOf('#') ? color : getHex());
        setSelecterdAddMaterial(
          addMatId && match
            ? addMatId
            : materialsArrayData.length > 0
              ? materialsArrayData[0].id
              : ''
        );
      } else drawColorPrev(text.current.value);
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

  const onEnterClickColor = (e) => {
    if (e.code == 'Enter' && text.current) {
      text.current.value = text.current.value.trim();
      if (setHex(text.current.value)) {
        drawColorPrev(text.current.value);
        sliderCtx && drawSlider(sliderCtx, sliderWidth, palHeight);
        const match = materialsArrayData.some((i) => selectedMaterialId == i.id);
        dispatch(
          controlPanelHistoryDataUpdate({
            id: match ? selectedMaterialId : materialsArrayData[0] && materialsArrayData[0].id,
            color: text.current.value,
          })
        );
        updateSelectedObj(text.current.value, selectedMaterialId);
      } else updateText();
    }
  };

  const colorTextFocusListener = (e) => document.addEventListener('keyup', onEnterClickColor);

  const colorTextChangeListener = (e) => {
    text.current.value = text.current.value.trim();
    document.removeEventListener('keyup', onEnterClickColor);
    if (text.current.value == getHex()) return;
    if (setHex(text.current.value)) {
      drawColorPrev(text.current.value);
      sliderCtx && drawSlider(sliderCtx, sliderWidth, palHeight);
      const match = materialsArrayData.some((i) => selectedMaterialId == i.id);
      dispatch(
        controlPanelHistoryDataUpdate({
          id: match ? selectedMaterialId : materialsArrayData[0] && materialsArrayData[0].id,
          color: text.current.value,
        })
      );
      updateSelectedObj(text.current.value, selectedMaterialId);
    } else updateText();
  };

  const sliderDownListener = (e) => {
    e.preventDefault();
    e = e.nativeEvent;
    setMouseDown(true);
    setValAll((prevVal) => {
      return { ...prevVal, valB: (1 - e.offsetY / palHeight) * 100, changedVal: 'valB' };
    });
  };

  const palDownListener = (e) => {
    e = e.nativeEvent;
    setMouseDown(true);
    setValAll((prevVal) => {
      return {
        ...prevVal,
        valH: (e.offsetX / palWidth) * 360,
        valS: (1 - e.offsetY / palHeight) * 100,
        changedVal: '',
      };
    });
  };

  const sliderMoveListener = (e) => {
    e = e.nativeEvent;
    if (mouseDown)
      setValAll((prevVal) => {
        return { ...prevVal, valB: (1 - e.offsetY / palHeight) * 100, changedVal: 'valB' };
      });
  };

  const palMoveListener = (e) => {
    e = e.nativeEvent;
    if (mouseDown)
      setValAll((prevVal) => {
        return {
          ...prevVal,
          valH: (e.offsetX / palWidth) * 360,
          valS: (1 - e.offsetY / palHeight) * 100,
          changedVal: '',
        };
      });
  };

  const palUpListener = (e) => {
    if (e.type == 'mouseleave' && !mouseDown) return;
    updateText();
    const match = materialsArrayData.some((i) => selectedMaterialId == i.id);
    dispatch(
      controlPanelHistoryDataUpdate({
        id: match ? selectedMaterialId : materialsArrayData[0]?.id,
        color: text.current.value,
      })
    );
    updateSelectedObj(getHex(), selectedMaterialId);
  };

  const sliderUpListener = (e) => {
    if (e.type == 'mouseleave' && !mouseDown) return;
    updateText();
    const match = materialsArrayData.some((i) => selectedMaterialId == i.id);
    dispatch(
      controlPanelHistoryDataUpdate({
        id: match ? selectedMaterialId : materialsArrayData[0] && materialsArrayData[0].id,
        color: text.current.value,
      })
    );
    updateSelectedObj(getHex(), selectedMaterialId);
  };

  const mouseUpListener = () => setMouseDown(false);

  const placePointers = () => {
    palPointer.current.style.left =
      Math.floor((valAll.valH / 360) * palWidth - Math.floor(palPointerSize / 2)) + 'px';
    palPointer.current.style.top =
      Math.floor((1 - valAll.valS / 100) * palHeight - Math.floor(palPointerSize / 2)) + 'px';
    sliderPointer.current.style.top =
      Math.floor((1 - valAll.valB / 100) * palHeight - Math.floor(sliderPointerSize / 2)) + 'px';
  };

  const drawSlider = (ctx, w, h) => {
    const rgb = HSVtoRGB(valAll.valH, valAll.valS, 100);
    if (!rgb) return;
    const color1 =
      'rgb(' + Math.round(rgb[0]) + ',' + Math.round(rgb[1]) + ',' + Math.round(rgb[2]) + ')';
    const color2 = '#000';

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color1);
    grad.addColorStop(1, color2);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  };

  const drawPalette = (ctx, w, h) => {
    const hGrad = ctx.createLinearGradient(0, 0, palWidth, 0);
    hGrad.addColorStop(0 / 6, '#F00');
    hGrad.addColorStop(1 / 6, '#FF0');
    hGrad.addColorStop(2 / 6, '#0F0');
    hGrad.addColorStop(3 / 6, '#0FF');
    hGrad.addColorStop(4 / 6, '#00F');
    hGrad.addColorStop(5 / 6, '#F0F');
    hGrad.addColorStop(6 / 6, '#F00');

    ctx.fillStyle = hGrad;
    ctx.fillRect(0, 0, w, h);

    const type = 's';
    const vGrad = ctx.createLinearGradient(0, 0, 0, h);
    switch (type.toLowerCase()) {
      case 's':
        vGrad.addColorStop(0, 'rgba(255,255,255,0)');
        vGrad.addColorStop(1, 'rgba(255,255,255,1)');
        break;
      case 'v':
        vGrad.addColorStop(0, 'rgba(0,0,0,0)');
        vGrad.addColorStop(1, 'rgba(0,0,0,1)');
        break;
    }
    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, w, h);
  };

  const HSVtoRGB = (h, s, v) => {
    const u = 255 * (v / 100);

    if (h === null) return [u, u, u];

    h /= 60;
    s /= 100;

    const i = Math.floor(h);
    const f = i % 2 ? h - i : 1 - (h - i);
    const m = u * (1 - s);
    const n = u * (1 - s * f);
    switch (i) {
      case 6:
      case 0:
        return [Math.round(u), Math.round(n), Math.round(m)];
      case 1:
        return [Math.round(n), Math.round(u), Math.round(m)];
      case 2:
        return [Math.round(m), Math.round(u), Math.round(n)];
      case 3:
        return [Math.round(m), Math.round(n), Math.round(u)];
      case 4:
        return [Math.round(n), Math.round(m), Math.round(u)];
      case 5:
        return [Math.round(u), Math.round(m), Math.round(n)];
    }
  };

  const RGBtoHSV = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const n = Math.min(Math.min(r, g), b);
    const v = Math.max(Math.max(r, g), b);
    const m = v - n;
    if (m === 0) {
      return [0, 0, 100 * v];
    }
    const h = r === n ? 3 + (b - g) / m : g === n ? 5 + (r - b) / m : 1 + (g - r) / m;
    return [
      Math.round((60 * (h === 6 ? 0 : h)).toFixed(2) * 10) / 10,
      Math.round((100 * (m / v)).toFixed(2) * 10) / 10,
      Math.round((100 * v).toFixed(2) * 10) / 10,
    ];
  };

  const componentToHex = (c) => {
    const hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  };

  const RGBToHex = (r, g, b) => '#' + componentToHex(r) + componentToHex(g) + componentToHex(b);

  const hexToRGB = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
      : null;
  };

  const getHex = () => {
    const rgb = HSVtoRGB(valAll.valH, valAll.valS, valAll.valB);
    return (rgb && rgb[0] && RGBToHex(rgb[0], rgb[1], rgb[2])) || text.current.value || '';
  };

  const setHex = (hex) => {
    const rgb = hexToRGB(hex);
    if (!rgb) return false;
    setRGB(rgb[0], rgb[1], rgb[2]);
    updateText(hex);
    drawColorPrev(currentColor || hex);
    return true;
  };

  const updateText = (hex) => (text.current.value = hex ? hex : getHex());

  const setRGB = (r, g, b) => {
    const hsb = RGBtoHSV(r, g, b);
    setValAll({ valH: hsb[0], valS: hsb[1], valB: hsb[2] });
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
    R2D.CopyPaste.copyMaterial({ id: text.current.value, addMaterial: selectedMaterialId });

  // TODO: optimize this, maybe move some code to onClickMaterial and onColorPickedMouseUp
  useEffectAsync(async () => {
    setStyleAnimation({ transform: 'translateX(0%)' });
    if (props.onlyColor) {
      setPreloaderStatus(true);
      const currSelectedColor =
        (props.matId && props.matId.indexOf && ~props.matId.indexOf('#') ? props.matId : null) ||
        currentColor ||
        '#aaaaaa';
      sliderCanvas.current && setSliderCtx(sliderCanvas.current.getContext('2d'));
      palCanvas.current && setPalCtx(palCanvas.current.getContext('2d'));
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
      sliderCanvas.current && setSliderCtx(sliderCanvas.current.getContext('2d'));
      palCanvas.current && setPalCtx(palCanvas.current.getContext('2d'));
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
      if (props.isForLightObjects) {
        setHex(currentColor && ~currentColor.indexOf('#') ? currentColor : '#aaaaaa');
        drawColorPrev(currentColor && ~currentColor.indexOf('#') ? currentColor : '#aaaaaa');
      } else {
        prevContext &&
          setHex(currentColor && ~currentColor.indexOf('#') ? currentColor : '#aaaaaa');
        drawColorPrev(currentColor && ~currentColor.indexOf('#') ? currentColor : '#aaaaaa');
      }
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
      prevContext &&
        setHex(currentColor && ~currentColor.indexOf('#') && match ? currentColor : '#aaaaaa');
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
    sliderCtx && drawSlider(sliderCtx, sliderWidth, palHeight);
  }, [sliderCtx]);

  useEffect(() => {
    palCtx && drawPalette(palCtx, palWidth, palHeight);
  }, [palCtx]);

  useEffect(() => {
    if (props.isForLightObjects) {
      if (sliderCtx && palCtx) {
        updateText();
        if (valAll.changedVal != 'valB') drawSlider(sliderCtx, sliderWidth, palHeight);
        placePointers();
      }
    } else {
      if (sliderCtx && palCtx && prevContext) {
        updateText();
        if (valAll.changedVal != 'valB') drawSlider(sliderCtx, sliderWidth, palHeight);
        placePointers();
      }
    }
  }, [valAll]);

  useEffect(() => {
    mouseDown
      ? window.addEventListener('mouseup', mouseUpListener)
      : window.removeEventListener('mouseup', mouseUpListener);
    return () => window.removeEventListener('mouseup', mouseUpListener);
  }, [mouseDown]);

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
    <div className={classes.planner_catalog_cont} style={styleAnimation}>
      <Navigation
        panelPreviewIcon={props.panelPreviewIcon}
        hideCategoryTree={props.hideCategoryTree}
        breadcrumsTitle={props.breadcrumsTitle}
        disableBreadcrumbs={props.onlyColor}
        closeButtonStatus={true}
        isAddSettingsDisabled={props.isAddSettingsDisabled}
      />
      <div className={classes.catalog_wr}>
        <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
          <div className={classes.content}>
            {props.isForLightObjects ? (
              <div className={classes.lightObjectPower}>
                <div className={classes.lightObjectPower_top}>
                  <div className={classes.lightObjectPower_top_left}>
                    <p className={classes.lightObjectPower_top_text}>
                      {translation['LIGHT_TIP_TEXT']}
                    </p>
                  </div>
                  <div className={classes.lightObjectPower_top_right}>
                    <ChangeSize
                      mouseDown={mouseDown}
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
                    <div className={classes.prod_item_btn_copy} onClick={(e) => copyMaterial(e)}>
                      <HoverComponent
                        hoverText={translation['BUTTON_COPY_MATERIAL']}
                        hoverTextPositionX={'right'}
                        hoverTextPositionY={'top'}
                      >
                        <IconCopy size={18} color="#ffffff" />
                      </HoverComponent>
                    </div>
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
                      <FavoriteStarIcon />
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
              <div className={classes.bottom}>
                <div className={classes.color_picker_palette}>
                  <canvas
                    ref={palCanvas}
                    onMouseLeave={palUpListener}
                    onMouseUp={palUpListener}
                    onMouseMove={palMoveListener}
                    onMouseDown={palDownListener}
                    className={classes.color_picker_canvas}
                    width={!isCurrDeviceAPhone ? 200 : 140}
                    height={!isCurrDeviceAPhone ? 150 : 80}
                    style={{ borderRadius: 6 }}
                  ></canvas>
                  <div
                    className={classes.color_picker_pointer}
                    ref={palPointer}
                    style={{ width: '12px', height: '12px' }}
                  >
                    <div
                      className={classes.color_picker_pointer}
                      style={{ width: '12px', height: '12px' }}
                    ></div>
                  </div>
                </div>
                <div className={classes.color_picker_slider}>
                  <canvas
                    ref={sliderCanvas}
                    onMouseLeave={sliderUpListener}
                    onMouseUp={sliderUpListener}
                    onMouseMove={sliderMoveListener}
                    onMouseDown={sliderDownListener}
                    className={classes.color_picker_canvas}
                    width={!isCurrDeviceAPhone ? 20 : 10}
                    height={!isCurrDeviceAPhone ? 150 : 80}
                  ></canvas>
                  <div
                    className={classes.color_picker_pointer}
                    ref={sliderPointer}
                    style={
                      !isCurrDeviceAPhone
                        ? { width: '28px', height: '8px', left: '-4px' }
                        : { width: '18px', height: '8px', left: '-4px' }
                    }
                  >
                    <div
                      className={classes.color_picker_pointer}
                      style={
                        !isCurrDeviceAPhone
                          ? { width: '28px', height: '8px' }
                          : { width: '18px', height: '8px' }
                      }
                    ></div>
                  </div>
                </div>
              </div>
              <div className={classes.color_picker_input_wr}>
                <input
                  type="text"
                  name="color"
                  onBlur={colorTextChangeListener}
                  onFocus={colorTextFocusListener}
                  className={classes.color_picker_input}
                  ref={text}
                ></input>
              </div>
            </div>
          </div>
        </SimpleBar>
      </div>

      <div
        className={classes.preloaderBlock}
        style={preloaderStatus ? { opacity: 1 } : { opacity: 0, zIndex: -1 }}
      >
        <div className="preloader-cube"></div>
      </div>
    </div>
  );
};

export default ColorPicker;
