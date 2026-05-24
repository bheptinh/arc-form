import React, {useRef, useEffect, useState, useMemo} from 'react';
import {createUseStyles} from "react-jss";
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from "simplebar-react";

import { planner, user } from '../../../../../../initR2D';

import { selectIsLogged } from '../../../../../../redux/features/user/userSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import { selectTranslation } from '../../../../../../redux/features/language/languageSlice';
import { controlPanelHistoryDataUpdate, controlPanelHistoryRemove, controlPanelUpdateBreadCrumbs, selectActiveControlPanelModeData, updateAnimateFavoritesHideStatus, updateAnimateFavoritesShowStatus } from '../../../../../../redux/features/control/controlPanelSlice';

import ChangeSize from '../../../../../common/ChangeSize';
import FavoriteStarIcon from "../../../../../common/FavoriteStarIcon";

import HoverComponent from "../../../controlPanel/components/HoverComponent";
import Navigation from '../../navigation/Navigation';

const useStyle = createUseStyles({
    planner_catalog_cont:{
        borderRight: '1px solid #cdcdcd',
        background: '#fff',
        height: '100%',
        display: "grid",
        alignContent: "baseline",
        gridTemplateRows: "auto 1fr",
        transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
        width: 309,
        position: 'absolute',
        left: 0,
        top: 0,
        '@media screen and (max-width: 950px)':{
            width: 189,
        }
    },
    catalog_wr:{
        overflow: 'hidden',
        height: '100%',
        position: 'relative',
        background: '#fff',
        borderTop: '1px solid #C6C4C4',

    },
    previewPreloader:{
        width: 120,
        height: 120,
        position: "relative",
        border: '1px solid #e9e9e9'
    },

    content:{
        padding: '20px 14px',
        '@media screen and (max-width: 950px)':{
            padding: '10px 5px',
        }
    },
    title: {
        fontSize: '13px',
        color: '#2F2F2F',
        padding: "10px 8px 10px",

    },
    grey_line: {
        borderBottom: '1px solid #cdcdcd'
    },
    color_picker_palette: {
        display: "block",
        margin: "0",
        padding: "0",
        outline: "solid 1px #aaaaaa",
        position: "relative",
        borderRadius: 6
    },

    color_picker_slider: {
        display: 'block',
        margin: '0',
        padding: '0',
        position: 'relative'
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
        outline: '2px solid #000000',
        outlineOffset: '-1px',
        position: "absolute",
        "& color_picker_pointer": {
            outline: 'rgb(255, 255, 255) solid 2px',
            outlineOffset: '-2px'
        }
    },
    top: {
        textAlign: 'center',
        marginBottom: 20,
        display: "flex",
        justifyContent: "center",
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 6,
        '& canvas':{
            border: '1px solid #BEBCBC',
            borderRadius: 6
        },
        '&:hover':{
            '& $prod_item_dop_btns_wr':{
                transform: "translateY(0)",
            }
        }
    },
    prod_item_dop_btns_wr:{
        left: 0,
        width: "100%",
        bottom: 0,
        height: 34,
        display: "flex",
        position: "absolute",
        transform: "translateY(102%)",
        background: "rgba(68, 68, 68, 0.7)",
        transition: "all 0.9s cubic-bezier(0.19, 1, 0.22, 1)",
        alignItems: "center",
        zIndex: 3,
        pointerEvents: 'none',
        padding: '0 6px'
    },
    prod_item_btn_copy:{
        width: 16,
        cursor: "pointer",
        height: 16,
        pointerEvents: 'auto',
        '& rect':{
            transition: "all 0.9s cubic-bezier(0.19, 1, 0.22, 1)",
        },
        '&:hover':{
            '& rect':{
                fill: '#B8E11F'
            }
        }
    },
    prod_item_btn_icon:{
        width: '100%',
        height: 'auto'
    },
    bottom: {
        display: 'flex',
        justifyContent: "space-between",
        marginBottom: 20,
        paddingRight: 5
    },
    materials:{
        paddingBottom: 25,
        borderBottom: "1px solid #BEBCBC",
        marginBottom: 20,
        '& fieldset':{
            marginBottom: 15,
            '&:last-child':{
                marginBottom: 0,
            },
            '& input': {
                marginRight: 7
            }
        },
        '@media screen and (max-width: 950px)':{
            paddingBottom: 10,
            marginBottom: 15,
        }
    },
    matInput:{
        position: 'absolute',
        zIndex: '-1',
        opacity: 0,
        '&:checked+label':{
            '&:after':{
                opacity: '1!important'
            }
        },


    },
    matFieldset:{
        '& label':{
            position: 'relative',
            paddingLeft: 30,
            display: 'block',
            color: '#2A3435',
            fontSize: 13,
            cursor: 'pointer',

            '&:before':{
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
                '@media screen and (max-width: 950px)':{
                    width: 14,
                    height: 14,
                }
            },
            '&:after':{
                content: '" "',
                transition: 'all .9s cubic-bezier(.19,1,.22,1)',
                width: 9,
                height: 9,
                borderRadius: '50%',
                border: '1px solid #9DD112',
                background: '#9DD900',
                position: 'absolute',
                left: 4,
                top: 0,
                bottom: 0,
                margin: 'auto',
                opacity: 0,
                '@media screen and (max-width: 950px)':{
                    width: 8,
                    height: 8,
                    left: 3,
                }
            },
            '&:hover':{
                '&:after':{
                    opacity: '0.5'
                }
            },
            '@media screen and (max-width: 950px)':{
                fontSize: 11,
                paddingLeft: 23,
            }
        }
    },
    prod_item_fav_btn:{
        width: "15px",
        height: "15px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: "50%",
        background: '#fff',
        position: 'absolute',
        top: 5,
        left: 5,
        zIndex: 3,
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
        cursor: 'pointer',
        '& svg':{
            cursor: 'pointer',
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            '& path': {
                transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
            },
            '&:hover':{
                '& path': {
                    fill: '#64BCF0',
                    stroke: '#64BCF0',
                }
            }
        },
    },

    prod_item_fav_btn_active:{
        fill: '#64BCF0',
        stroke: '#64BCF0',
        '& path': {
            fill: '#64BCF0',
            stroke: '#64BCF0'
        }
    },
    lightObjectPower:{
        background: '#464646',
        padding: '15px 20px 20px',
        height: 220,
        width: 'calc(100% + 28px)',
        marginLeft: '-14px',
        marginTop: '-20px',
        marginBottom: 20
    },
    lightObjectPower_top:{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 10,
    },
    lightObjectPower_top_left:{
        display: 'flex',
        alignItems: 'center'
    },
    lightObjectPower_top_text:{
        fontSize: 13,
        fontWeight: 400,
        color: '#ffffff',
        '@media screen and (max-width: 950px)':{
            fontSize: 11,
        }
    },
    lightObjectPower_top_tip:{
        width: 18,
        height: 18,
        borderRadius: 10,
        background: '#ffffff',
        fontSize: '11.14px',
        fontWeight: 600,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        cursor: 'pointer'
    },
    lightObjectPower_center:{
        height: 'calc(100% - 20px)'
    },
    lightObjectPower_center_circle:{
        height: '100%',
        position: 'relative',
        '& svg':{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2
        }
    },
    lightObjectPower_center_circle_background:{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        zIndex: 1,
        transition: "all .9s cubic-bezier(.19,1,.22,1)",
        boxShadow: 'rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px'
    },
    hoverDivIcon:{
        position: "absolute",
        background: "#81e7ff",
        transition: "all 0s ease-in-out 1s",
        display: "none",
        fontSize: 12,
        width: "max-content",
        zIndex: 9,
        padding: "2px 7px",
        transition: "all .1s ease",
        userSelect: "none"
    },
    navigation:{
        display: 'flex',
        borderBottom: '1px solid #cdcdcd',
        alignItems: 'center'
    },
    color_picker_input_wr:{
        '& input':{
            width: "100%",
            height: "35px",
            border: "1px solid #BEBCBC",
            borderRadius: "3px",
            padding: "0 10px",
            outline: 'none',
            '@media screen and (max-width: 950px)':{
                height: 25,
                padding: "0 5px",
                fontSize: 9
            }
        }
    },
    preloaderBlock:{
        background: 'rgba(0, 0, 0, .2)',
        zIndex: 4,
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: '100%',
        transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)'
    }
});

const ColorPicker = props => {
    const classes = useStyle();
    let dispatch = useDispatch();

    let activeControlPanelData = useSelector(selectActiveControlPanelModeData);
    let controlPanelModeHistory = activeControlPanelData.history;
    let lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
    let isAdded = lastHistoryElem?.isAdded;
    let lastHistoryElemData = lastHistoryElem?.data;
    let isLogged = useSelector(selectIsLogged);
    let translation = useSelector(selectTranslation);
    
    let [isInFavorites, setIsInFavorites] = useState(null);
    let [userFavorites, setUserFavorites] = useState(user.data.favorites?.items);
    let [currMatMesh, setCurrMatMesh] = useState(null);
    let [isPreviewLoaded, setIsPreviewLoaded] = useState(false);
    let [valAll, setValAll] = useState({valH: 0, valS: 0, valB: 100, changedVal: ""});
    let [mouseDown, setMouseDown] = useState(false);
    let [sliderCtx, setSliderCtx] = useState(null);
    let [palCtx, setPalCtx] = useState(null);
    let [prevContext, setPrevContext] = useState(null);
    let [lightPower, setLightPower] = useState(props.lightPowerValue);
    let [materialsArrayData, setMaterialsArrayData] = useState([]);
    let [materialsArray, setMaterialsArray] = useState(null);
    let [styleAnimation, setStyleAnimation] = useState(isAdded ? {transform: "translateX(100%)"} : { transform: "translateX(-100%)" });
    let [preloaderStatus, setPreloaderStatus] = useState(true);

    let [selectedMaterial, setSelecterdMaterial] = useState(props.matId);
    let [selectedAddMaterial, setSelecterdAddMaterial] = useState(props.addMaterial);

    let palPointer = useRef(null);
    let sliderPointer = useRef(null);
    let sliderCanvas = useRef(null);
    let palCanvas = useRef(null);
    let text = useRef(null);
    let colorPrev = useRef(null);

    let selectedMaterialId = lastHistoryElemData?.id;
    let currentColor = lastHistoryElemData?.color;

    let currOS = R2D.controller.getCurrentOS();
    let isCurrDeviceAPhone = currOS == "iOS" || currOS == "Android";

    let palWidth = !isCurrDeviceAPhone? 200 : 140;
    let palHeight = !isCurrDeviceAPhone ? 150 : 80;
    let sliderWidth = 20;
    let palPointerSize = 12;
    let sliderPointerSize = 8;
    let prevSize = 271;

    let onColorPowerChange = (mouseDown, value, type) => {
        if(!R2D.scene.currentView3DObject) return;
        let newValue = R2D.scene.currentView3DObject.lightViewer.setLightPower(value);
        setMouseDown({...mouseDown, type});
        setLightPower(newValue);
    }

    let onColorPickedMove = e => planner.mih().state && planner.mih().state.mouseMove(e);

    let onColorPickedMouseUp = e => {
        planner.mih().state && planner.mih().state.mouseUp(e);
        document.removeEventListener("mousemove", onColorPickedMove);
        document.removeEventListener("mouseup", onColorPickedMouseUp);
    }

    let downOnPrevListener = e => {
        document.addEventListener("mousemove", onColorPickedMove);
        document.addEventListener("mouseup", onColorPickedMouseUp);
        let selectedMaterial = selectedMaterialId;
        Array.from(document.querySelectorAll("." + classes.matInput)).forEach(i => {
            if(i.checked) selectedMaterial = i.id.replace("material_", "");
        });
        planner.scene.dragProductFromCatalog(getHex(), selectedMaterial);
    }

    let updateSelectedObj = (color, addMatId) => {
        if(props.onDragColor) return;
        if(props.onlyColor) {
            props.materialSelect(~color.indexOf("#") ? color : getHex(), null, selectedMaterial, selectedAddMaterial);
            setSelecterdMaterial(~color.indexOf("#") ? color : getHex());
            setSelecterdAddMaterial(null)
        } else {
            if(props.materialSelect) {
                let match;
                if(!addMatId && !materialsArrayData || (materialsArrayData && materialsArrayData.length < 1)) match = true;
                else match = materialsArrayData && materialsArrayData.some(i => addMatId == i.id);
                props.materialSelect(~color.indexOf("#") ? color : getHex(), addMatId && match ? addMatId : materialsArrayData.length > 0 ? materialsArrayData[0].id : "", selectedMaterial, selectedAddMaterial);
                setSelecterdMaterial(~color.indexOf("#") ? color : getHex());
                setSelecterdAddMaterial(addMatId && match ? addMatId : materialsArrayData.length > 0 ? materialsArrayData[0].id : "");
            }
            else drawColorPrev(text.current.value);
        }
    }

    function drawColorPrev(color) {
        if(!prevContext) return;
        if(currMatMesh && currMatMesh.material) {
            currMatMesh.material.color = new THREE.Color(color);
            let matPrevCanvas = R2D.Tool.getMatPrevFromAnyMesh(currMatMesh);
            prevContext.drawImage(matPrevCanvas, 0, 0, prevSize, prevSize);
        }
        else {
            prevContext.fillStyle = color;
            prevContext.fillRect(0, 0, prevSize, prevSize);
        }
    }

    let onEnterClickColor = e => {
        if(e.code == "Enter" && text.current) {
            text.current.value = text.current.value.trim();
            if (setHex(text.current.value))
            {
                drawColorPrev(text.current.value);
                sliderCtx && drawSlider(sliderCtx, sliderWidth, palHeight);
                let match = materialsArrayData.some(i => selectedMaterialId == i.id);
                dispatch(controlPanelHistoryDataUpdate({ id: match ? selectedMaterialId : materialsArrayData[0] && materialsArrayData[0].id, color: text.current.value }));
                updateSelectedObj(text.current.value, selectedMaterialId);
            }
            else updateText();
        }
    }

    let colorTextFocusListener = e => document.addEventListener("keyup", onEnterClickColor);

    let colorTextChangeListener = e => {
        text.current.value = text.current.value.trim();
        document.removeEventListener("keyup", onEnterClickColor);
        if(text.current.value == getHex()) return;
        if (setHex(text.current.value)) {
            drawColorPrev(text.current.value);
            sliderCtx && drawSlider(sliderCtx, sliderWidth, palHeight);
            let match = materialsArrayData.some(i => selectedMaterialId == i.id);
            dispatch(controlPanelHistoryDataUpdate({ id: match ? selectedMaterialId : materialsArrayData[0] && materialsArrayData[0].id, color: text.current.value }));
            updateSelectedObj(text.current.value, selectedMaterialId);
        }
        else updateText();
    }

    let sliderDownListener = e => {
        e.preventDefault();
        e = e.nativeEvent;
        setMouseDown(true);
        setValAll(prevVal => {return {...prevVal, valB: (1 - e.offsetY / palHeight) * 100, changedVal: "valB"}})

    }

    let palDownListener = e => {
        e = e.nativeEvent;
        setMouseDown(true);
        setValAll(prevVal => {return {...prevVal, valH: e.offsetX / palWidth * 360, valS: (1 - e.offsetY / palHeight) * 100, changedVal: ""}})
    }

    let sliderMoveListener = e => {
        e = e.nativeEvent;
        if (mouseDown) setValAll(prevVal => {return {...prevVal, valB: (1 - e.offsetY / palHeight) * 100, changedVal: "valB"}})
    }

    let palMoveListener = e => {
        e = e.nativeEvent;
        if (mouseDown) setValAll(prevVal => {return {...prevVal, valH: e.offsetX / palWidth * 360, valS: (1 - e.offsetY / palHeight) * 100, changedVal: ""}})
    }

    let palUpListener = e => {
        if(e.type == "mouseleave" && !mouseDown) return;
        updateText();
        let match = materialsArrayData.some(i => selectedMaterialId == i.id);
        dispatch(controlPanelHistoryDataUpdate({ id: match ? selectedMaterialId : materialsArrayData[0]?.id, color: text.current.value }));
        updateSelectedObj(getHex(), selectedMaterialId);
    }

    let sliderUpListener = e => {
        if(e.type == "mouseleave" && !mouseDown) return;
        updateText();
        let match = materialsArrayData.some(i => selectedMaterialId == i.id);
        dispatch(controlPanelHistoryDataUpdate({ id: match ? selectedMaterialId : materialsArrayData[0] && materialsArrayData[0].id, color: text.current.value }));
        updateSelectedObj(getHex(), selectedMaterialId);
    }

    let mouseUpListener = () => setMouseDown(false);

    let placePointers = () => {
        palPointer.current.style.left = Math.floor(valAll.valH / 360 * palWidth - Math.floor(palPointerSize / 2)) + 'px';
        palPointer.current.style.top = Math.floor((1 - valAll.valS / 100) * palHeight - Math.floor(palPointerSize / 2)) + 'px';
        sliderPointer.current.style.top = Math.floor((1 - valAll.valB / 100) * palHeight - Math.floor(sliderPointerSize / 2)) + 'px';
    }

    let drawSlider = (ctx, w, h) => {
        let rgb = HSVtoRGB(valAll.valH, valAll.valS, 100);
        if(!rgb) return;
        let color1 = 'rgb(' +
            Math.round(rgb[0]) + ',' +
            Math.round(rgb[1]) + ',' +
            Math.round(rgb[2]) + ')';
        let color2 = '#000';

        let grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, color1);
        grad.addColorStop(1, color2);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
    }

    let drawPalette = (ctx, w, h) => {
        let hGrad = ctx.createLinearGradient(0, 0, palWidth, 0);
        hGrad.addColorStop(0 / 6, '#F00');
        hGrad.addColorStop(1 / 6, '#FF0');
        hGrad.addColorStop(2 / 6, '#0F0');
        hGrad.addColorStop(3 / 6, '#0FF');
        hGrad.addColorStop(4 / 6, '#00F');
        hGrad.addColorStop(5 / 6, '#F0F');
        hGrad.addColorStop(6 / 6, '#F00');

        ctx.fillStyle = hGrad;
        ctx.fillRect(0, 0, w, h);

        let type = 's';
        let vGrad = ctx.createLinearGradient(0, 0, 0, h);
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
    }

    let HSVtoRGB = (h, s, v) => {
        let u = 255 * (v / 100);

        if (h === null) return [ u, u, u ];

        h /= 60;
        s /= 100;

        let i = Math.floor(h);
        let f = i%2 ? h-i : 1-(h-i);
        let m = u * (1 - s);
        let n = u * (1 - s * f);
        switch (i) {
            case 6:
            case 0: return [Math.round(u), Math.round(n), Math.round(m)];
            case 1: return [Math.round(n), Math.round(u), Math.round(m)];
            case 2: return [Math.round(m), Math.round(u), Math.round(n)];
            case 3: return [Math.round(m), Math.round(n), Math.round(u)];
            case 4: return [Math.round(n), Math.round(m), Math.round(u)];
            case 5: return [Math.round(u), Math.round(m), Math.round(n)];
        }
    }

    let RGBtoHSV = (r, g, b) => {
        r /= 255;
        g /= 255;
        b /= 255;
        let n = Math.min(Math.min(r,g),b);
        let v = Math.max(Math.max(r,g),b);
        let m = v - n;
        if (m === 0) { return [ 0, 0, 100 * v ]; }
        let h = r===n ? 3+(b-g)/m : (g===n ? 5+(r-b)/m : 1+(g-r)/m);
        return [
            Math.round((60 * (h===6?0:h)).toFixed(2) * 10) / 10,
            Math.round((100 * (m/v)).toFixed(2) * 10) / 10,
            Math.round((100 * v).toFixed(2) * 10) / 10,
        ];
    }

    let componentToHex = c => {
        let hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    let RGBToHex = (r, g, b) => "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);

    let hexToRGB = hex =>
    {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    }

    let getHex = () => {
        let rgb = HSVtoRGB(valAll.valH, valAll.valS, valAll.valB);
        return (rgb && rgb[0] && RGBToHex(rgb[0], rgb[1], rgb[2])) || text.current.value || "";
    };

    let setHex = hex => {
        let rgb = hexToRGB(hex);
        if (!rgb) return false;
        setRGB(rgb[0], rgb[1], rgb[2]);
        updateText(hex);
        drawColorPrev(currentColor || hex);
        return true;
    };

    let updateText = hex => text.current.value = hex ? hex : getHex();

    let setRGB = (r, g, b) => {
        let hsb = RGBtoHSV(r, g, b);
        setValAll({valH: hsb[0], valS: hsb[1], valB: hsb[2]});
    };

    let onClickMaterial = async mat => {
        if(document.querySelector(`#material_${mat.id}`).checked) return;
        Array.from(document.querySelector("." + classes.materials).getElementsByTagName("input")).forEach(i => i.checked = i.getAttribute("id") !== `material_${mat.id}` ? false : i.checked);
        document.querySelector(`#material_${mat.id}`).checked = !document.querySelector(`#material_${mat.id}`).checked;
        let background = new Image();
        background.src = R2D.URL.DOMAIN + mat.source.images.preview;
        background.onload = e => {
            let match = materialsArrayData.some(i => selectedMaterialId == i.id);
            dispatch(controlPanelHistoryDataUpdate({ color: match ? currentColor : "#aaaaaa", id: mat.id }));
            updateSelectedObj(match ? currentColor : "#aaaaaa", mat.id);
        };
    };

    let updateFavorites = async () => {
        if(!isLogged) return dispatch(setActivePopup({name: "login"}));
        if(isInFavorites) {
            await user.uRemoveFromFavorites(selectedMaterialId, currentColor);
            setUserFavorites(prev => prev.filter(i => i.id != selectedMaterialId || i.addData != currentColor ));
            dispatch(updateAnimateFavoritesHideStatus(true));
            setTimeout(() =>  dispatch(updateAnimateFavoritesHideStatus(false)), 10);
        } else {
            let response = await user.uAddToFavorites(selectedMaterialId, currentColor);
            setUserFavorites(prev => {
                let newArray = prev;
                return [...newArray, response]
            });

            dispatch(updateAnimateFavoritesShowStatus(true));
            setTimeout(() =>  dispatch(updateAnimateFavoritesShowStatus(false)), 10);
        }
        setIsInFavorites(!isInFavorites);
        planner.apiScene.dispatchEvent(new Event(planner.apiScene.FAVORITES_BUTTON, {}));
    };

    let updateMaterialsEvent = e => dispatch(controlPanelHistoryDataUpdate({ color: R2D.scene.currentConstructorElementData.getMaterial(), id: R2D.scene.currentConstructorElementData.getAddMaterial() }));

    let copyMaterial = e => R2D.CopyPaste.copyMaterial({id: text.current.value, addMaterial: selectedMaterialId});

    useEffect(async () => {
        setStyleAnimation({ transform: "translateX(0%)" });
        if(props.onlyColor) {
            setPreloaderStatus(true);
            let currSelectedColor = (props.matId && props.matId.indexOf && ~props.matId.indexOf("#") ? props.matId : null) || currentColor || "#aaaaaa";
            sliderCanvas.current && setSliderCtx(sliderCanvas.current.getContext('2d'));
            palCanvas.current && setPalCtx(palCanvas.current.getContext('2d'));
            colorPrev.current && setPrevContext(colorPrev.current.getContext('2d'));
            dispatch(controlPanelHistoryDataUpdate({ ...lastHistoryElemData, color: currSelectedColor }));
            setPreloaderStatus(false);
        } else {
            setPreloaderStatus(true);
            let response = await planner.scene.categoryDataLoad(lastHistoryElem.urlList);
            if(response.type == "error" || response?.length < 1 || response?.length == 0 || !response[0]) {
                dispatch(setActivePopup({name: "alert", data: "TEXT_ERROR_LOAD_DATA"}));
                dispatch(controlPanelHistoryRemove());
                dispatch(controlPanelUpdateBreadCrumbs({data: null, updateType: "remove"}));
                setPreloaderStatus(false);
                return;
            }
            let currtSelelectedMatId = props.addMaterial || selectedMaterialId || response[0].id;
            let currSelectedColor = (props.matId && props.matId.indexOf && ~props.matId.indexOf("#") ? props.matId : null) || currentColor || "#aaaaaa";
            sliderCanvas.current && setSliderCtx(sliderCanvas.current.getContext('2d'));
            palCanvas.current && setPalCtx(palCanvas.current.getContext('2d'));
            colorPrev.current && setPrevContext(colorPrev.current.getContext('2d'));
            if(!selectedMaterialId && !R2D.PoolMaterials.isMaterial(response[0].id)) R2D.PoolMaterials.create("#aaaaaa", response[0].id);
            setMaterialsArrayData(response);
            setIsInFavorites(userFavorites?.find(i => i?.id == currtSelelectedMatId && i.addData == currSelectedColor) ? true : false)
            dispatch(controlPanelHistoryDataUpdate({ ...lastHistoryElemData, id: currtSelelectedMatId, color: currSelectedColor }));
            setPreloaderStatus(false);
        }
        planner.scene.addEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
        return () => planner.scene.removeEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
    }, []);

    useEffect(() => setIsInFavorites(userFavorites?.find(i => i?.id == selectedMaterialId && i?.addData == currentColor) ? true : false), [selectedMaterialId, currentColor])

    useEffect(() => {
        if(props.onlyColor) {
            if(props.isForLightObjects) {
                setHex(currentColor && ~currentColor.indexOf("#") ? currentColor : "#aaaaaa");
                drawColorPrev(currentColor && ~currentColor.indexOf("#") ? currentColor : "#aaaaaa")
            } else {
                prevContext && setHex(currentColor && ~currentColor.indexOf("#") ? currentColor : "#aaaaaa");
                drawColorPrev(currentColor && ~currentColor.indexOf("#") ? currentColor : "#aaaaaa")
            }
        }
        else {
            if(!selectedMaterialId) return;
            let materials = [];
            let match;
            if(!selectedMaterialId && !materialsArrayData || (materialsArrayData && materialsArrayData.length < 1)) match = true;
            else match = materialsArrayData && materialsArrayData.some(i => selectedMaterialId == i.id );
            prevContext && setHex(currentColor && ~currentColor.indexOf("#") && match ? currentColor : "#aaaaaa");
            if(materialsArrayData && materialsArrayData.length > 1) {
                materialsArrayData.forEach(i => {
                    materials.push(
                        <fieldset key={i.id} className={classes.matFieldset} >
                            <input className={classes.matInput} type="radio" name={"material_" + i.id} id={"material_" + i.id} defaultChecked={ match ? selectedMaterialId == i.id : materialsArrayData[0].id == i.id }/>
                            <label htmlFor={"material_" + i.id} onClick={e => onClickMaterial(i)}>
                                <span>{i.name.trim()}</span>
                            </label>
                        </fieldset>
                    )
                });
                setMaterialsArray(materials);
            }
        }
    }, [materialsArrayData, prevContext, currentColor, selectedMaterialId]);

    useEffect(() => isPreviewLoaded && colorPrev.current && setPrevContext(colorPrev.current.getContext('2d')), [isPreviewLoaded]);

    useEffect(async () => {
        if(props.onlyColor) return setIsPreviewLoaded(true);
        setPreloaderStatus(true);
        setIsPreviewLoaded(false);
        if(materialsArrayData && materialsArrayData.length > 0) {
            let match;
            if(!selectedMaterialId && materialsArrayData.length < 1) match = true;
            else {
                match = materialsArrayData.some(i => selectedMaterialId == i.id);
                let mesh = await R2D.Tool.loadMeshFromMatIdAndColor((match && selectedMaterialId) || materialsArrayData[0].id);
                setCurrMatMesh(mesh);
            }
            setIsPreviewLoaded(true);
        }
        setPreloaderStatus(false);
    }, [selectedMaterialId, materialsArrayData]);

    useEffect(() => sliderCtx && drawSlider(sliderCtx, sliderWidth, palHeight), [sliderCtx]);

    useEffect(() => palCtx && drawPalette(palCtx, palWidth, palHeight), [palCtx]);

    useEffect(() => {
        if(props.isForLightObjects) {
            if(sliderCtx && palCtx) {
                updateText();
                if(valAll.changedVal != "valB") drawSlider(sliderCtx, sliderWidth, palHeight);
                placePointers();
            }
        }
        else {
            if(sliderCtx && palCtx && prevContext) {
                updateText();
                if(valAll.changedVal != "valB") drawSlider(sliderCtx, sliderWidth, palHeight);
                placePointers();
            }
        }
    }, [valAll]);

    useEffect(() => {
        mouseDown ? window.addEventListener('mouseup', mouseUpListener) : window.removeEventListener('mouseup', mouseUpListener);
        return () => window.removeEventListener('mouseup', mouseUpListener);
    }, [mouseDown]);

    useEffect(() => setUserFavorites(user.data.favorites?.items || []), [isLogged]);
    useEffect(() => currMatMesh && drawColorPrev((materialsArrayData.some(i => selectedMaterialId == i.id) && currentColor) || "#aaaaaa"), [currMatMesh]);

    return (
        <div className={classes.planner_catalog_cont} style={styleAnimation}>

            <Navigation panelPreviewIcon={props.panelPreviewIcon} hideCategoryTree={props.hideCategoryTree} breadcrumsTitle={props.breadcrumsTitle} disableBreadcrumbs={props.onlyColor} closeButtonStatus={true} isAddSettingsDisabled={props.isAddSettingsDisabled}/>
            <div className={classes.catalog_wr}>
                <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
                    <div className={classes.content}>
                        {
                            props.isForLightObjects ?
                                <div className={classes.lightObjectPower}>
                                    <div className={classes.lightObjectPower_top}>
                                        <div className={classes.lightObjectPower_top_left}>
                                            <p className={classes.lightObjectPower_top_text}>{translation["LIGHT_TIP_TEXT"]}</p>
                                        </div>
                                        <div className={classes.lightObjectPower_top_right}>
                                            <ChangeSize mouseDown={mouseDown} changeValue={onColorPowerChange} type={"style_3"} value={lightPower} labelAfter={"%"} />
                                        </div>
                                    </div>
                                    <div className={classes.lightObjectPower_center}>
                                        <div className={classes.lightObjectPower_center_circle}>
                                            <div className={classes.lightObjectPower_center_circle_background} style={{ background: currentColor, width: ((150 / 100) * lightPower) + 'px', height: ((150 / 100) * lightPower) + 'px' }}></div>
                                            <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M22.3649 23.8292L24.8609 26.3253C25.2057 26.67 25.7642 26.67 26.1089 26.3253C26.4537 25.9805 26.4537 25.422 26.1089 25.0772L23.6129 22.5812C23.2682 22.2365 22.7096 22.2365 22.3649 22.5812C22.0202 22.926 22.0202 23.4845 22.3649 23.8292ZM26.0908 16.5989L29.6799 16.5989C30.1678 16.5989 30.5625 16.2041 30.5625 15.7163C30.5625 15.2285 30.1678 14.8337 29.6799 14.8337L26.0908 14.8337C25.603 14.8337 25.2083 15.2285 25.2083 15.7163C25.2083 16.2041 25.603 16.5989 26.0908 16.5989ZM1.32007 16.5989L4.90918 16.5989C5.397 16.5989 5.79175 16.2041 5.79175 15.7163C5.79175 15.2285 5.397 14.8337 4.90918 14.8337L1.32007 14.8337C0.832242 14.8337 0.437499 15.2285 0.437499 15.7163C0.437499 16.2041 0.832242 16.5989 1.32007 16.5989ZM4.89106 26.3252C5.23579 26.67 5.79434 26.67 6.13907 26.3252L8.63509 23.8292C8.97982 23.4845 8.97982 22.926 8.63509 22.5812C8.29036 22.2365 7.73181 22.2365 7.38708 22.5812L4.89106 25.0772C4.54632 25.422 4.54632 25.9805 4.89106 26.3252ZM15.5 30.7788C15.9878 30.7788 16.3826 30.3841 16.3826 29.8962L16.3826 26.3071C16.3826 25.8193 15.9878 25.4246 15.5 25.4246C15.0122 25.4246 14.6174 25.8193 14.6174 26.3071L14.6174 29.8962C14.6174 30.3841 15.0122 30.7788 15.5 30.7788ZM10.5576 21.9473C12.4816 23.4653 14.9705 24.0125 17.4063 23.43C20.2306 22.7769 22.5075 20.5352 23.196 17.7286C23.8844 14.9044 23.0901 12.0449 21.0602 10.0503C20.3365 9.32651 19.9128 8.191 19.9128 7.02595L19.9128 6.83179C19.9128 6.33761 19.5246 5.94922 19.0303 5.94922L11.9697 5.94922C11.4754 5.94922 11.0872 6.33761 11.0872 6.83179L11.0872 7.02595C11.0872 8.17335 10.6459 9.34423 9.86921 10.1032C8.38644 11.6036 7.55688 13.5981 7.55688 15.7163C7.55688 18.1522 8.65127 20.4293 10.5576 21.9473ZM15.5 18.364C16.8315 18.364 17.8008 17.4808 18.0546 16.4584C18.1701 15.9934 18.638 15.6966 19.1242 15.8137C19.5965 15.9309 19.8853 16.4101 19.768 16.8824C19.3308 18.6476 17.6728 20.1292 15.5 20.1292C15.0122 20.1291 14.6174 19.7344 14.6174 19.2466C14.6174 18.7588 15.0122 18.364 15.5 18.364ZM19.0303 4.18408L19.0303 3.30152C19.0303 1.84151 17.8426 0.653811 16.3826 0.653811L14.6174 0.653811C13.1574 0.653811 11.9697 1.84151 11.9697 3.30152L11.9697 4.18408L19.0303 4.18408Z" fill="#2F2F2F"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                : null
                        }

                        <div>
                            <div></div>
                            {
                                materialsArray ?
                                    <form className={classes.materials}>
                                        { materialsArray }
                                    </form>
                                    :
                                    null
                            }
                            {
                                props.isForLightObjects ?
                                    null :
                                    <div className={classes.top}>

                                        <div className={classes.prod_item_dop_btns_wr}>
                                            <div className={classes.prod_item_btn_copy} onClick={e => copyMaterial(e)}>
                                                <HoverComponent hoverText={ translation["BUTTON_COPY_MATERIAL"] } hoverTextPositionX={'right'} hoverTextPositionY={'top'}>
                                                    <svg className={classes.prod_item_btn_icon} width="16" height="16" viewBox="0 0 16 16" fill="transparent">
                                                        <rect x="3.5" y="0.5" width="12" height="12" stroke="white"/>
                                                        <rect className={classes.rectHover2} y="3" width="2" height="1" fill="white"/>
                                                        <rect className={classes.rectHover} y="15" width="13" height="1" fill="white"/>
                                                        <rect className={classes.rectHover} y="15" width="11" height="1"
                                                                transform="rotate(-90 0 15)" fill="white"/>
                                                        <rect className={classes.rectHover} x="12" y="15" width="1" height="1"
                                                                transform="rotate(-90 12 15)" fill="white"/>
                                                    </svg>
                                                </HoverComponent>
                                            </div>
                                        </div>


                                        {
                                            props.onlyColor ?
                                                null :
                                                <div className={isInFavorites ? classes.prod_item_fav_btn + ' ' + classes.prod_item_fav_btn_active : classes.prod_item_fav_btn}  onClick={updateFavorites}>
                                                    <FavoriteStarIcon/>
                                                </div>
                                        }
                                        {
                                            isPreviewLoaded ?
                                                <canvas ref={colorPrev} onMouseDown={props.onDragColor ? downOnPrevListener : null} width={!isCurrDeviceAPhone ? 271 : 168} height={!isCurrDeviceAPhone ? 120 : 80}></canvas> :
                                                <div className={classes.previewPreloader}>
                                                    <div className={"preloader-cube"}></div>
                                                </div>
                                        }
                                    </div>
                            }
                            <div className={classes.bottom}>
                                <div className={classes.color_picker_palette}>
                                    <canvas ref={palCanvas} onMouseLeave={palUpListener} onMouseUp={palUpListener} onMouseMove={palMoveListener} onMouseDown={palDownListener} className={classes.color_picker_canvas} width={!isCurrDeviceAPhone ? 200 : 140} height={!isCurrDeviceAPhone ? 150 : 80} style={{borderRadius:6}}></canvas>
                                    <div className={classes.color_picker_pointer} ref={palPointer} style={{width: "12px", height: "12px"}}>
                                        <div className={classes.color_picker_pointer} style={{width: "12px", height: "12px"}}></div>
                                    </div>
                                </div>
                                <div className={classes.color_picker_slider}>
                                    <canvas ref={sliderCanvas} onMouseLeave={sliderUpListener} onMouseUp={sliderUpListener} onMouseMove={sliderMoveListener} onMouseDown={sliderDownListener} className={classes.color_picker_canvas} width={!isCurrDeviceAPhone ? 20 : 10} height={!isCurrDeviceAPhone ? 150 : 80}></canvas>
                                    <div className={classes.color_picker_pointer} ref={sliderPointer} style={!isCurrDeviceAPhone ? {width: "28px", height: "8px", left: "-4px"} : {width: "18px", height: "8px", left: "-4px"}}>
                                        <div className={classes.color_picker_pointer} style={!isCurrDeviceAPhone ? {width: "28px", height: "8px"} : {width: "18px", height: "8px"}}></div>
                                    </div>
                                </div>
                            </div>
                            <div className={classes.color_picker_input_wr}>
                                <input type="text" name="color" onBlur={colorTextChangeListener} onFocus={colorTextFocusListener} className={classes.color_picker_input} ref={text}></input>
                            </div>
                        </div>
                    </div>
                </SimpleBar>
            </div>

            <div className={classes.preloaderBlock} style={ preloaderStatus ? {opacity: 1} : {opacity: 0, zIndex: -1} }>
                <div className="preloader-cube"></div>
            </div>
        </div>
    )
}

export default ColorPicker;