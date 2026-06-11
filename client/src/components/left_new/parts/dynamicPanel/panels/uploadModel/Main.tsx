import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { planner } from '../../../../../../initR2D';
import { selectIsProjectBelongToLoggedUser } from '../../../../../../redux/features/common/commonSlice';
import {
  changeActiveControlPanelMode,
  selectActiveControlPanelModeData,
  selectControlPanelData,
  selectPrevControlPanelMode,
  updateControlPanelStatus,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import { showQuickPanelVisible } from '../../../../../../redux/features/quickPanels/quickPanelsSlice';
import {
  selectUserProfileData,
  selectUserProjectActive,
} from '../../../../../../redux/features/user/userSlice';
import HoverComponent from '../../../controlPanel/components/HoverComponent';
import Lock from '../../components/Lock';
import MaterialComponent from '../../components/MaterialComponent';
import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { useLanguages } from '../../../../../../api/hooks/useLanguages';

const useStyle = createUseStyles({
  '@font-face': [
    {
      fontFamily: 'Roboto-Light',
      fontWeight: 300,
      fontDisplay: 'swap',
      src: 'url("/src_designer/Roboto-Light.ttf") format("truetype")',
    },
    {
      fontFamily: 'Roboto-Bold',
      fontWeight: 700,
      fontDisplay: 'swap',
      src: 'url("/src_designer/Roboto-Bold.ttf") format("truetype")',
    },
  ],
  planner_upload_catalog_cont: {
    borderRight: '1px solid #cdcdcd',
    background: '#fff',
    height: '100%',
    display: 'grid',
    alignContent: 'baseline',
    gridTemplateRows: '1fr',
    transition: 'all .5s cubic-bezier(0.19, 1, 0.22, 1)',
    width: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  planner_popup_close: {
    width: 20,
    height: 20,
    position: 'fixed',
    top: 8,
    right: 8,
    opacity: 0,
    cursor: 'pointer',
    zIndex: '2',
    '& path': {
      transition: 'all 0.9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover': {
      '& path': {
        fill: '#BAE51F',
      },
    },
  },
  planner_popup_close_icon: {
    width: '100%',
  },
  planner_upload_catalog_wr: {
    overflow: 'hidden',
    height: '100%',
    position: 'relative',
    borderTop: '1px solid #C6C4C4',
    borderBottom: '1px solid #C6C4C4',
  },
  planner_popup_cont_right_adv: {
    paddingTop: 8,
    '@media screen and (max-width: 950px)': {
      paddingTop: 5,
    },
  },
  planner_popup_cont_right_adv_title: {
    margin: '10px 0 15px',
    display: 'flex',
    alignItems: 'center',
    paddingRight: 5,
    justifyContent: 'space-between',
    '& h2': {
      fontSize: 18,
      fontWeight: 300,
      marginRight: 6,
    },
    '& svg': {
      marginRight: 10,
      transition: 'all .3s cubic-bezier(0.19, 1, 0.22, 1)',
    },
  },
  planner_popup_cont_right_adv_inputs: {},
  planner_popup_cont_right_adv_info: {
    marginLeft: 5,
  },
  planner_popup_cont_right_adv_info_hover: {
    position: 'absolute',
    background: '#81e7ff',
    display: 'none',
    fontSize: 12,
    width: 'max-content',
    zIndex: 999,
    padding: '2px 7px',
    transition: 'all .1s ease',
    userSelect: 'none',
  },
  planner_popup_cont_right_adv_input: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '& input': {
      position: 'absolute',
      zIndex: '-1',
      opacity: 0,
      '&:checked': {
        '&+label:after': {
          opacity: 1,
        },
      },
    },
    '& label': {
      color: '#373737',
      fontSize: 13,
      fontWeight: 400,
      paddingLeft: 22,
      alignItems: 'center',
      userSelect: 'none',
      cursor: 'pointer',
      display: 'block',
      position: 'relative',
      marginLeft: 7,
      maxWidth: 95,
      '&:before': {
        content: '" "',
        transition: 'all .9s cubic-bezier(.19,1,.22,1)',
        width: 17,
        height: 17,
        borderRadius: '50%',
        background: '#E7E7E7',
        position: 'absolute',
        boxShadow:
          '0px 1px 0px 0px rgb(255 255 255 / 0%), inset 0px 1px 0px 0px rgb(191 191 191 / 85%)',
        left: 0,
        top: 0,
        bottom: 0,
        margin: 'auto',
        '@media screen and (max-width: 950px)': {
          height: 14,
          width: 14,
        },
      },
      '&:after': {
        content: '" "',
        transition: 'all .9s cubic-bezier(.19,1,.22,1)',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: '#9DD900',
        border: '1px solid #9DD112',
        position: 'absolute',
        left: 5,
        top: 0,
        bottom: 0,
        opacity: 0,
        margin: 'auto',
        '@media screen and (max-width: 950px)': {
          left: 3,
          width: 8,
          height: 8,
          top: 0,
          border: 'none',
        },
      },
      '@media screen and (max-width: 950px)': {
        fontSize: 11,
        width: 'calc(100% - 57px)',
      },
    },
  },
  planner_popup_cont_right_adv_input_left: {
    display: 'flex',
    alignItems: 'center',
  },
  planner_popup_cont_right_adv_input_right: {
    display: 'flex',
    alignItems: 'center',
  },
  planner_popup_cont_right_adv_input_img: {
    minWidth: 87,
    '& img': {
      maxWidth: '100%',
    },
    '@media screen and (max-width: 950px)': {
      minWidth: 'auto',
      width: 57,
    },
  },
  planner_popup_cont_right_materials: {
    marginTop: 20,
    '@media screen and (max-width: 950px)': {
      marginTop: 0,
    },
  },
  planner_popup_cont_right_material: {
    '&:not(:last-child)': {
      marginBottom: 20,
      paddingBottom: 20,
      '@media screen and (max-width: 950px)': {
        marginBottom: 0,
      },
    },
  },
  planner_popup_cont_right_material_instruments: {
    marginLeft: 15,
  },
  planner_popup_cont_right_material_change: {
    border: '1px solid #BEBCBC',
    height: '100px',
    display: 'grid',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: 20,
    '@media screen and (max-width: 950px)': {
      marginBottom: 14,
      height: 70,
    },
  },
  planner_popup_cont_right_material_instruments_input: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '&:not(:last-child)': {
      marginBottom: 15,
    },
    '& input': {
      position: 'absolute',
      zIndex: '-1',
      opacity: 0,
      '&:checked': {
        '&+label:after': {
          opacity: 1,
        },
      },
    },
    '& label': {
      color: '#2f2f2f',
      fontWeight: '400',
      fontSize: 13,
      paddingLeft: 23,
      alignItems: 'center',
      userSelect: 'none',
      cursor: 'pointer',
      display: 'block',
      position: 'relative',
      '&:before': {
        content: '" "',
        transition: 'all .9s cubic-bezier(.19,1,.22,1)',
        width: 17,
        height: 17,
        borderRadius: '50%',
        background: '#E7E7E7',
        position: 'absolute',
        boxShadow:
          '0px 1px 0px 0px rgb(255 255 255 / 0%), inset 0px 1px 0px 0px rgb(191 191 191 / 85%)',
        left: 0,
        top: 0,
        bottom: 0,
        margin: 'auto',
        '@media screen and (max-width: 950px)': {
          height: 14,
          width: 14,
        },
      },
      '&:after': {
        content: '" "',
        transition: 'all .9s cubic-bezier(.19,1,.22,1)',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: '#9DD900',
        border: '1px solid #9DD112',
        position: 'absolute',
        left: 5,
        top: 0,
        bottom: 0,
        opacity: 0,
        margin: 'auto',
        '@media screen and (max-width: 950px)': {
          left: 3,
          width: 8,
          height: 8,
          top: 0,
          border: 'none',
        },
      },
      '@media screen and (max-width: 950px)': {
        fontSize: 11,
      },
    },
  },
  planner_popup_cont_right_material_instruments_top: {
    marginBottom: 20,
  },
  planner_popup_cont_right_material_instruments_bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    '& svg': {
      cursor: 'pointer',
    },
  },
  planner_upload_content: {
    padding: 20,
    '@media screen and (max-width: 950px)': {
      padding: '5px 5px 14px',
    },
  },
  planner_popup_cont_right_catalog: {
    height: '100%',
    position: 'relative',
  },
  planner_upload_model_title: {
    width: '100%',
    '& > input': {
      color: '#000',
      width: '100%',
      border: '1px solid #e8dede',
      height: '30px',
      resize: 'none',
      outline: 'none',
      fontSize: '14px',
      background: '#ffffff',
      transition: 'all 0.4s ease-out',
      paddingLeft: '5px',
      borderRadius: '3px',
      '@media screen and (max-width: 950px)': {
        height: 26,
        fontSize: 11,
      },
    },
  },
  planner_popup_cont_right_buttons: {
    display: 'grid',
    padding: '14px',
    gridGap: '8px',
    paddingLeft: 14,
    gridTemplateColumns: 'repeat(2, calc(50% - 4px))',
    '@media screen and (max-width: 950px)': {
      padding: 5,
      gridGap: 5,
    },
  },
  planner_popup_cont_right_button: {
    color: '#2A3435',
    border: 'none',
    cursor: 'pointer',
    height: '35px',
    display: 'inline-flex',
    outline: 'none',
    padding: '0 10px',
    fontSize: '14px',
    minWidth: '120px',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    alignItems: 'center',
    borderRadius: '3px',
    textTransform: 'uppercase',
    justifyContent: 'center',
    '@media screen and (max-width: 950px)': {
      minWidth: 88,
      fontSize: 10,
      height: 26,
      padding: '0 5px',
    },
  },
  planner_popup_cont_right_button_cancel: {
    border: '1px solid #000000',
    justifyContent: 'flex-start',
    '& svg': {
      marginRight: 10,
      '@media screen and (max-width: 950px)': {
        marginRight: 5,
        width: 10,
        height: 'auto',
      },
    },
    '& p': {
      flex: 2,
      color: '#2A3435',
      textAlign: 'center',
    },
    '&:hover': {
      background: '#E9E9E9',
    },
  },
  planner_popup_cont_right_button_save: {
    background: '#fff',
    border: '1px solid #C8C8C8',
    color: '#A7A7A7',
    '& svg': {
      marginRight: 10,
      '@media screen and (max-width: 950px)': {
        marginRight: 10,
        width: 10,
        height: 'auto',
      },
    },
    '&:hover': {
      background: '#E9E9E9',
    },
    '& $planner_lock_img': {
      marginRight: 0,
      marginLeft: 10,
      '& circle': {
        fill: 'none',
      },
      '& path, & rect': {
        fill: '#A7A7A7',
      },
    },
  },
  planner_popup_cont_right_button_save_ready: {
    background: '#BBE521',
    '& svg': {
      marginRight: 10,
    },
    '&:hover': {
      background: '#8fc32d',
    },
  },
  planner_catalog_prem_zamok: {},
  planner_lock_img: {
    '& > rect:first-child': {
      fill: 'transparent',
    },
  },
});

const Main = (props) => {
  const dispatch = useDispatch();
  const translation = useTranslation();

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;

  const controlPanelData = useSelector(selectControlPanelData);
  const prevControlPanelMode = useSelector(selectPrevControlPanelMode);

  const [materialsRadioBtnsState, setMaterialsRadioBtnsState] = useState(
    R2D.modelUploader?.getPartHashesMaterialsType()
  );
  const [appointmentRadioStatus, setAppointmentRadioStatus] = useState(
    R2D.modelUploader?.getAppointment()
  );

  const isProjectBelongToLoggedUser = useSelector(selectIsProjectBelongToLoggedUser);
  const userProjectActive = useSelector(selectUserProjectActive);

  const userData = useSelector(selectUserProfileData);

  const languages = useLanguages();
  const currLanguage = languages.find((i) => i.current == 1);

  const [modelName, setModelName] = useState(R2D.modelUploader?.getModelName());
  const [materialsArray, setMaterialsArray] = useState(null);
  const [previewMaterialsId, setPreviewMaterialsId] = useState(
    R2D.modelUploader?.getPartsMaterials()
  );
  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );
  const [closeStyleAnimation, setCloseStyleAnimation] = useState({ opacity: 0 });

  const advancedSettings = useRef(null);

  const classes = useStyle();

  let timeoutId, infoText;

  const onCopyMaterial = (id, addMaterial) => R2D.CopyPaste.copyMaterial({ id, addMaterial });

  const onPasteMaterial = (index) => {
    const radioObj = R2D.modelUploader.getPartHashesMaterialsType();
    radioObj[index] = { fromModelRadio: false, fromCatalogRadio: true };
    R2D.modelUploader.setPartHashesMaterialsType(radioObj);
    setMaterialsRadioBtnsState(radioObj);
    const mat = R2D.CopyPaste.pasteMaterial();
    if (mat?.id) {
      if (mat.id.indexOf && ~mat.id.indexOf('#'))
        R2D.modelUploader.setPartMatId(
          R2D.modelUploader.getPartsHashes()[index],
          mat.addMaterial,
          mat.id
        );
      else
        R2D.modelUploader.setPartMatId(
          R2D.modelUploader.getPartsHashes()[index],
          mat.id,
          mat.addMaterial
        );
      setPreviewMaterialsId(R2D.modelUploader.getPartsMaterials());
    } else if (mat?.type == 'logoMesh') {
      dispatch(
        setActivePopup({
          name: 'alert',
          data: translation['TEXT_PASTE_LOGO_INTO_MATERIAL_MESH_ERROR'],
        })
      );
    }
  };

  const onClickPreview = (index) => {
    if (R2D.modelUploader.getPartHashesMaterialsType()[index]['fromModelRadio']) return false;
    else {
      props.onClickPreview(index);
      return { source: 'bank' };
    }
  };

  const onCloseUploadPanel = (e) => {
    R2D.modelUploader.removeEventListener(R2D.ModelUploader.PART_UPDATED, updateMaterials);
    R2D.modelUploader.removeEventListener(R2D.ModelUploader.MODEL_OPENED, updateMaterials);

    setCloseStyleAnimation({ opacity: 0 });

    if (props.showType == 'change' && R2D.scene.currentSceneObject) {
      dispatch(changeActiveControlPanelMode({ mode: 'selectedModel', data: { type: 'main' } }));
      dispatch(showQuickPanelVisible({ name: 'helper_model' }));
      R2D.modelUploader.hideCanvases();
      R2D.modelUploader.dispose();
      R2D.modelUploader = null;
    } else {
      const furnitureData = planner.getCatalogProducts();
      prevControlPanelMode
        ? dispatch(changeActiveControlPanelMode({ mode: prevControlPanelMode }))
        : dispatch(
            changeActiveControlPanelMode({
              mode: 'furniture',
              data:
                controlPanelData['furniture'].history.length < 1
                  ? {
                      type: 'catalog',
                      addType: 'main',
                      id: null,
                      lastSavedScroll: 0,
                      data: furnitureData,
                    }
                  : null,
            })
          );
      R2D.modelUploader.hideCanvases();
      R2D.modelUploader.dispose();
      R2D.modelUploader = null;
    }

    dispatch(updateControlPanelStatus(true));
  };

  const onSaveModel = (e) => {
    if (
      userData?.plan == 'pro' ||
      (isProjectBelongToLoggedUser && userProjectActive.plan == 'pro')
    ) {
      dispatch(setActivePopup({ name: 'loadingMessage', data: 'TEXT_WAIT' }));
      R2D.modelUploader.setAllPartsSourcesAsBank();
      R2D.modelUploader.save(
        R2D.URL.DOMAIN + R2D.URL.URL_UPLOAD_FILE,
        R2D.URL.DOMAIN + R2D.URL.URL_UPLOAD_ENTITY
      );
    } else {
      R2D.OPTIONS.PRO_PLAN
        ? !R2D.config.data.enable_merchant_login
          ? dispatch(setActivePopup({ name: 'login' }))
          : R2D.postMessageToParent(JSON.stringify({ action: 'merchant_login' }))
        : dispatch(setActivePopup({ name: 'payPro', type: 'user' }));
    }
  };

  const onMouseDown = (e) => {
    clearTimeout(timeoutId);
    infoText && infoText.remove();
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseUp = (e) => {
    clearTimeout(timeoutId);
    document.removeEventListener('mouseup', onMouseUp);
  };

  const updateMaterials = (e) => setPreviewMaterialsId(R2D.modelUploader.getPartsMaterials());

  const onChangeRadio = (e, index, type) => {
    const radioObj = [...R2D.modelUploader.getPartHashesMaterialsType()];
    radioObj[index] = {
      fromModelRadio: type == 'fromModelRadio' ? true : false,
      fromCatalogRadio: type == 'fromCatalogRadio' ? true : false,
    };
    R2D.modelUploader.setPartHashesMaterialsType(radioObj);
    setMaterialsRadioBtnsState((prev) => [...radioObj]);
    if (type == 'fromCatalogRadio') document.querySelector('.materialChange_' + index).click();
    else R2D.modelUploader.restoreEmbeddedMaterial(R2D.modelUploader.getPartsHashes()[index]);
  };

  const transformPartUVCW = (index) =>
    R2D.modelUploader.transformPartUVCW(R2D.modelUploader.getPartsHashes()[index]);

  const transformPartUVCCW = (index) =>
    R2D.modelUploader.transformPartUVCCW(R2D.modelUploader.getPartsHashes()[index]);

  const transformPartUVFlipX = (index) =>
    R2D.modelUploader.transformPartUVFlipX(R2D.modelUploader.getPartsHashes()[index]);

  const transformPartUVFlipY = (index) =>
    R2D.modelUploader.transformPartUVFlipY(R2D.modelUploader.getPartsHashes()[index]);

  const onSetAppointmentStatus = (value) => {
    R2D.modelUploader.setAppointment(value);
    setAppointmentRadioStatus(value);
  };

  const onChangeModelTitle = (e) => setModelName(e.target.value);

  const onBlurModelName = (e) => {
    const newTitleObj = { ...R2D.modelUploader.getTitles() };
    newTitleObj[currLanguage.code] = e.target.value;
    R2D.modelUploader.setTitles(newTitleObj);
  };

  useEffect(() => {
    const keyTimeout = setTimeout(() => setStyleAnimation({ transform: 'translateX(0%)' }), 50);
    setTimeout(() => setCloseStyleAnimation({ opacity: 1 }), 50);

    const materials = R2D.modelUploader.getPartsMaterials();
    const radioObj = R2D.modelUploader.getPartHashesMaterialsType();

    materials.forEach((item, index) => {
      if (item.matId == 0 && item.addMaterial == undefined && radioObj[index].fromCatalogRadio)
        radioObj[index] = { fromModelRadio: true, fromCatalogRadio: false };
    });

    if (radioObj != R2D.modelUploader.getPartHashesMaterialsType()) {
      R2D.modelUploader.setPartHashesMaterialsType(radioObj);
      setMaterialsRadioBtnsState(radioObj);
    }

    const canvasElem = document.querySelector('#planner');
    R2D.modelUploader.setSize(canvasElem.offsetWidth, canvasElem.offsetHeight);
    R2D.modelUploader.addEventListener(R2D.ModelUploader.PART_UPDATED, updateMaterials);
    R2D.modelUploader.addEventListener(R2D.ModelUploader.MODEL_OPENED, updateMaterials);

    return () => clearTimeout(keyTimeout);
  }, []);

  useEffect(() => {
    if (materialsRadioBtnsState && materialsRadioBtnsState.length > 0) {
      const hashes = R2D.modelUploader.getPartsHashes();
      const materials = R2D.modelUploader.getPartsMaterials();
      const prevMatArray = [];
      hashes.forEach((i, index) => {
        const setId = R2D.modelUploader.getPartSetId(i);
        const source = R2D.modelUploader.getPartSource(i);

        if (source) {
          prevMatArray.push(
            <div className={classes.planner_popup_cont_right_material} key={index}>
              <div className={classes.planner_popup_cont_right_material_change}>
                <MaterialComponent
                  customStyles={{ aspectRatio: 'auto', border: 0 }}
                  key={index}
                  clickedElementAddClass={`materialChange_${index}`}
                  selectMeshOnHover={true}
                  hash={i}
                  matId={materials[index].matId}
                  addMaterial={materials[index].addMaterial}
                  materialsSource={{ type: source, data: setId }}
                  onCopyPaste={{
                    copy: onCopyMaterial,
                    paste: onPasteMaterial,
                    index,
                    statusCopy: materialsRadioBtnsState[index]?.fromCatalogRadio,
                  }}
                  onClick={(e) => onClickPreview(index)}
                  lock={false}
                />
              </div>
              <div className={classes.planner_popup_cont_right_material_instruments}>
                <div className={classes.planner_popup_cont_right_material_instruments_top}>
                  <div className={classes.planner_popup_cont_right_material_instruments_input}>
                    <input
                      type="radio"
                      id={`fromModel_${index}`}
                      name={`materialSource_${index}`}
                      onChange={(e) => onChangeRadio(e, index, 'fromModelRadio')}
                      checked={materialsRadioBtnsState[index]?.fromModelRadio}
                    />
                    <label htmlFor={`fromModel_${index}`}>{translation['UPLOAD_FROM_MODEL']}</label>
                  </div>

                  <div className={classes.planner_popup_cont_right_material_instruments_input}>
                    <input
                      type="radio"
                      id={`fromCatalog_${index}`}
                      name={`materialSource_${index}`}
                      onChange={(e) => onChangeRadio(e, index, 'fromCatalogRadio')}
                      checked={materialsRadioBtnsState[index]?.fromCatalogRadio}
                    />
                    <label htmlFor={`fromCatalog_${index}`}>
                      {translation['UPLOAD_FROM_CATALOG']}
                    </label>
                  </div>
                </div>
                <div className={classes.planner_popup_cont_right_material_instruments_bottom}>
                  <div>
                    <HoverComponent hoverText={translation['UPLOAD_CW']}>
                      <svg
                        width="22"
                        height="18"
                        viewBox="0 0 22 18"
                        fill="none"
                        onMouseDown={onMouseDown}
                        onMouseUp={(e) => transformPartUVCW(index)}
                      >
                        <path
                          d="M16.6015 11.7319L12.8525 7.97043C12.7052 7.8226 12.7054 7.58327 12.8533 7.43569C13.0011 7.28823 13.2405 7.28861 13.388 7.43645L16.8692 10.9294L20.3504 7.4363C20.4978 7.28848 20.7371 7.2881 20.885 7.43554C20.9591 7.50952 20.9961 7.60644 20.9961 7.70335C20.9961 7.80002 20.9593 7.89656 20.8857 7.97041L17.1369 11.7319C17.066 11.8031 16.9696 11.843 16.8692 11.843C16.7687 11.843 16.6724 11.803 16.6015 11.7319Z"
                          fill="#2B2B2B"
                          stroke="#323232"
                          strokeWidth="0.25"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.036 16.3972C9.73782 16.4054 9.43599 16.4082 9.13212 16.4082C5.11364 16.4082 1.85601 13.1506 1.85601 9.13212C1.85601 5.11364 5.11364 1.85601 9.13212 1.85601C13.1506 1.85601 16.4082 5.11364 16.4082 9.13212C16.4476 9.79233 16.4484 10.393 16.414 10.9394H17.2834C17.3082 10.3865 17.3027 9.78545 17.2642 9.13212C17.2642 4.64087 13.6234 1 9.13212 1C4.64087 1 1 4.64087 1 9.13212C1 13.6234 4.64087 17.2642 9.13212 17.2642C9.43566 17.2642 9.73738 17.2622 10.036 17.256V16.3972Z"
                          fill="#2B2B2B"
                        />
                        <path
                          d="M10.036 16.3972H10.161V16.2687L10.0326 16.2722L10.036 16.3972ZM16.4082 9.13212H16.283L16.2834 9.13956L16.4082 9.13212ZM16.414 10.9394L16.2893 10.9315L16.2809 11.0644H16.414V10.9394ZM17.2834 10.9394V11.0644H17.4029L17.4083 10.945L17.2834 10.9394ZM17.2642 9.13212H17.139L17.1394 9.13946L17.2642 9.13212ZM10.036 17.256L10.0386 17.3809L10.161 17.3784V17.256H10.036ZM9.13212 16.5332C9.43674 16.5332 9.73977 16.5304 10.0394 16.5221L10.0326 16.2722C9.73586 16.2804 9.43524 16.2832 9.13212 16.2832V16.5332ZM1.73101 9.13212C1.73101 13.2196 5.0446 16.5332 9.13212 16.5332V16.2832C5.18267 16.2832 1.98101 13.0816 1.98101 9.13212H1.73101ZM9.13212 1.73101C5.0446 1.73101 1.73101 5.0446 1.73101 9.13212H1.98101C1.98101 5.18267 5.18267 1.98101 9.13212 1.98101V1.73101ZM16.5332 9.13212C16.5332 5.0446 13.2196 1.73101 9.13212 1.73101V1.98101C13.0816 1.98101 16.2832 5.18267 16.2832 9.13212H16.5332ZM16.5388 10.9472C16.5735 10.395 16.5726 9.78923 16.533 9.12467L16.2834 9.13956C16.3226 9.79543 16.3233 10.3909 16.2893 10.9315L16.5388 10.9472ZM16.414 11.0644H17.2834V10.8144H16.414V11.0644ZM17.4083 10.945C17.4333 10.3872 17.4277 9.78185 17.389 9.12478L17.1394 9.13946C17.1777 9.78904 17.1831 10.3857 17.1586 10.9338L17.4083 10.945ZM17.3892 9.13212C17.3892 4.57184 13.6924 0.875 9.13212 0.875V1.125C13.5543 1.125 17.1392 4.70991 17.1392 9.13212H17.3892ZM9.13212 0.875C4.57184 0.875 0.875 4.57184 0.875 9.13212H1.125C1.125 4.70991 4.70991 1.125 9.13212 1.125V0.875ZM0.875 9.13212C0.875 13.6924 4.57184 17.3892 9.13212 17.3892V17.1392C4.70991 17.1392 1.125 13.5543 1.125 9.13212H0.875ZM9.13212 17.3892C9.4362 17.3892 9.73884 17.3872 10.0386 17.3809L10.0334 17.131C9.73593 17.1372 9.43512 17.1392 9.13212 17.1392V17.3892ZM10.161 17.256V16.3972H9.91101V17.256H10.161Z"
                          fill="#323232"
                        />
                      </svg>
                    </HoverComponent>
                  </div>

                  <div>
                    <HoverComponent hoverText={translation['UPLOAD_CCW']}>
                      <svg
                        width="22"
                        height="18"
                        viewBox="0 0 22 18"
                        fill="none"
                        onMouseDown={onMouseDown}
                        onMouseUp={(e) => transformPartUVCCW(index)}
                      >
                        <path
                          d="M5.39852 11.7319L9.1475 7.97043C9.29483 7.8226 9.29458 7.58327 9.14674 7.43569C8.99892 7.28823 8.75945 7.28861 8.61201 7.43645L5.13082 10.9294L1.64965 7.4363C1.50219 7.28848 1.26287 7.2881 1.11503 7.43554C1.04092 7.50952 1.00386 7.60644 1.00386 7.70335C1.00386 7.80002 1.04067 7.89656 1.11427 7.97041L4.86314 11.7319C4.93397 11.8031 5.03038 11.843 5.13082 11.843C5.23126 11.843 5.32755 11.803 5.39852 11.7319Z"
                          fill="#2B2B2B"
                          stroke="#323232"
                          strokeWidth="0.25"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M11.9718 16.3972C12.27 16.4054 12.5718 16.4082 12.8757 16.4082C16.8942 16.4082 20.1518 13.1506 20.1518 9.13212C20.1518 5.11364 16.8942 1.85601 12.8757 1.85601C8.85721 1.85601 5.59959 5.11364 5.59959 9.13212C5.56021 9.79233 5.55942 10.393 5.59379 10.9394H4.72439C4.6996 10.3865 4.70515 9.78545 4.74358 9.13212C4.74358 4.64087 8.38445 1 12.8757 1C17.3669 1 21.0078 4.64087 21.0078 9.13212C21.0078 13.6234 17.3669 17.2642 12.8757 17.2642C12.5722 17.2642 12.2704 17.2622 11.9718 17.256V16.3972Z"
                          fill="#2B2B2B"
                        />
                        <path
                          d="M11.9718 16.3972H11.8468V16.2687L11.9752 16.2722L11.9718 16.3972ZM5.59959 9.13212H5.72481L5.72437 9.13956L5.59959 9.13212ZM5.59379 10.9394L5.71855 10.9315L5.72691 11.0644H5.59379V10.9394ZM4.72439 10.9394V11.0644H4.60486L4.59951 10.945L4.72439 10.9394ZM4.74358 9.13212H4.8688L4.86836 9.13946L4.74358 9.13212ZM11.9718 17.256L11.9692 17.3809L11.8468 17.3784V17.256H11.9718ZM12.8757 16.5332C12.5711 16.5332 12.268 16.5304 11.9684 16.5221L11.9752 16.2722C12.2719 16.2804 12.5726 16.2832 12.8757 16.2832V16.5332ZM20.2768 9.13212C20.2768 13.2196 16.9632 16.5332 12.8757 16.5332V16.2832C16.8251 16.2832 20.0268 13.0816 20.0268 9.13212H20.2768ZM12.8757 1.73101C16.9632 1.73101 20.2768 5.0446 20.2768 9.13212H20.0268C20.0268 5.18267 16.8251 1.98101 12.8757 1.98101V1.73101ZM5.47459 9.13212C5.47459 5.0446 8.78818 1.73101 12.8757 1.73101V1.98101C8.92625 1.98101 5.72459 5.18267 5.72459 9.13212H5.47459ZM5.46904 10.9472C5.4343 10.395 5.43517 9.78923 5.47481 9.12467L5.72437 9.13956C5.68525 9.79543 5.68454 10.3909 5.71855 10.9315L5.46904 10.9472ZM5.59379 11.0644H4.72439V10.8144H5.59379V11.0644ZM4.59951 10.945C4.57451 10.3872 4.58014 9.78185 4.6188 9.12478L4.86836 9.13946C4.83015 9.78904 4.82469 10.3857 4.84926 10.9338L4.59951 10.945ZM4.61858 9.13212C4.61858 4.57184 8.31542 0.875 12.8757 0.875V1.125C8.45349 1.125 4.86858 4.70991 4.86858 9.13212H4.61858ZM12.8757 0.875C17.436 0.875 21.1328 4.57184 21.1328 9.13212H20.8828C20.8828 4.70991 17.2979 1.125 12.8757 1.125V0.875ZM21.1328 9.13212C21.1328 13.6924 17.436 17.3892 12.8757 17.3892V17.1392C17.2979 17.1392 20.8828 13.5543 20.8828 9.13212H21.1328ZM12.8757 17.3892C12.5716 17.3892 12.269 17.3872 11.9692 17.3809L11.9744 17.131C12.2719 17.1372 12.5727 17.1392 12.8757 17.1392V17.3892ZM11.8468 17.256V16.3972H12.0968V17.256H11.8468Z"
                          fill="#323232"
                        />
                      </svg>
                    </HoverComponent>
                  </div>

                  <div>
                    <HoverComponent hoverText={translation['UPLOAD_FLIP_X']}>
                      <svg
                        width="21"
                        height="20"
                        viewBox="0 0 21 20"
                        fill="none"
                        onMouseDown={onMouseDown}
                        onMouseUp={(e) => transformPartUVFlipX(index)}
                      >
                        <path d="M10.0238 0H10.9762V2H10.0238V0Z" fill="#2B2B2B" />
                        <path d="M10.0238 3H10.9762V5H10.0238V3Z" fill="#2B2B2B" />
                        <path d="M10.0238 6H10.9762V8H10.0238V6Z" fill="#2B2B2B" />
                        <path d="M10.0238 9H10.9762V11H10.0238V9Z" fill="#2B2B2B" />
                        <path d="M10.0238 12H10.9762V14H10.0238V12Z" fill="#2B2B2B" />
                        <path d="M10.0238 15H10.9762V17H10.0238V15Z" fill="#2B2B2B" />
                        <path d="M10.0238 18H10.9762V20H10.0238V18Z" fill="#2B2B2B" />
                        <path d="M8.11905 2V17H0.5L8.11905 2Z" fill="#2B2B2B" />
                        <path d="M12.881 2V17H20.5L12.881 2Z" fill="#2B2B2B" />
                      </svg>
                    </HoverComponent>
                  </div>

                  <div>
                    <HoverComponent hoverText={translation['UPLOAD_FLIP_Y']}>
                      <svg
                        width="20"
                        height="21"
                        viewBox="0 0 20 21"
                        fill="none"
                        onMouseDown={onMouseDown}
                        onMouseUp={(e) => transformPartUVFlipY(index)}
                      >
                        <path d="M20 10L20 11L18 11L18 10L20 10Z" fill="#2B2B2B" />
                        <path d="M17 10L17 11L15 11L15 10L17 10Z" fill="#2B2B2B" />
                        <path d="M14 10L14 11L12 11L12 10L14 10Z" fill="#2B2B2B" />
                        <path d="M11 10L11 11L9 11L9 10L11 10Z" fill="#2B2B2B" />
                        <path d="M8 10L8 11L6 11L6 10L8 10Z" fill="#2B2B2B" />
                        <path d="M5 10L5 11L3 11L3 10L5 10Z" fill="#2B2B2B" />
                        <path d="M2 10L2 11L-4.80825e-07 11L-4.37114e-07 10L2 10Z" fill="#2B2B2B" />
                        <path d="M18 8L3 8L3 -7.43094e-07L18 8Z" fill="#2B2B2B" />
                        <path d="M18 13L3 13L3 21L18 13Z" fill="#2B2B2B" />
                      </svg>
                    </HoverComponent>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      });
      setMaterialsArray(prevMatArray);
    }
  }, [materialsRadioBtnsState, previewMaterialsId]);

  return (
    <div>
      <div
        className={classes.planner_popup_close}
        onClick={onCloseUploadPanel}
        style={closeStyleAnimation}
      >
        <svg
          width="25"
          height="25"
          fill="none"
          viewBox="0 0 25 25"
          className={classes.planner_popup_close_icon}
        >
          <path
            fill="#2A3435"
            fillRule="evenodd"
            d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z"
            clipRule="evenodd"
          ></path>
          <path
            fill="#2A3435"
            fillRule="evenodd"
            d="M.102 1.417 1.22.329l12.34 12.07-.007.006v.002l-.23.221-.88.858-.005-.005L1.172 24.329.064 23.233l11.259-10.842L.103 1.417Z"
            clipRule="evenodd"
          ></path>
          <path
            fill="#2A3435"
            fillRule="evenodd"
            d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z"
            clipRule="evenodd"
          ></path>
          <path
            fill="#2A3435"
            fillRule="evenodd"
            d="M24.73 1.417 23.613.329 11.273 12.4l.008.006-.002.002.23.221.881.858.005-.005L23.66 24.329l1.108-1.096L13.51 12.391 24.73 1.417Z"
            clipRule="evenodd"
          ></path>
        </svg>
      </div>

      <div className={classes.planner_upload_catalog_cont} style={styleAnimation}>
        <div className={classes.planner_upload_catalog_wr}>
          <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
            <div className={classes.planner_upload_content}>
              <h2 className={classes.planner_upload_model_title}>
                <input
                  type="text"
                  value={modelName}
                  onBlur={onBlurModelName}
                  onChange={onChangeModelTitle}
                />
              </h2>

              <div className={classes.planner_popup_cont_right_adv}>
                <div className={classes.planner_popup_cont_right_adv_inputs} ref={advancedSettings}>
                  <div className={classes.planner_popup_cont_right_adv_input}>
                    <div className={classes.planner_popup_cont_right_adv_input_left}>
                      <div className={classes.planner_popup_cont_right_adv_input_img}>
                        <img src="/src_designer/images/import_model_add_1.png" />
                      </div>
                      <input
                        type="radio"
                        id="onScene"
                        name="positionStatus"
                        onChange={(e) => onSetAppointmentStatus('scene')}
                        checked={appointmentRadioStatus == 'scene' ? true : false}
                      />
                      <label htmlFor="onScene">{translation['UPLOAD_TEXT_ON_SCENE']}</label>
                    </div>
                    <div>
                      <HoverComponent
                        hoverText={translation['UPLOAD_TEXT_ON_SCENE_TIP']}
                        showOnMobile={true}
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 17 17"
                          fill="none"
                          className={classes.planner_popup_cont_right_adv_info}
                        >
                          <rect opacity="0.7" width="17" height="17" rx="8.5" fill="#2F2F2F" />
                          <path
                            d="M9.1335 9.94172H7.93437C7.93867 9.52911 7.9752 9.19172 8.04397 8.92955C8.11703 8.66307 8.23523 8.42024 8.39855 8.20104C8.56187 7.98185 8.77892 7.73256 9.04969 7.4532C9.2474 7.25119 9.42791 7.06208 9.59123 6.88587C9.75885 6.70535 9.89424 6.51194 9.99739 6.30564C10.1005 6.09504 10.1521 5.84361 10.1521 5.55135C10.1521 5.25479 10.0984 4.99906 9.99094 4.78416C9.88779 4.56927 9.73307 4.4038 9.52676 4.28775C9.32476 4.17171 9.07333 4.11368 8.77247 4.11368C8.52319 4.11368 8.2868 4.15881 8.06331 4.24907C7.83981 4.33933 7.6593 4.47901 7.52177 4.66812C7.38423 4.85293 7.31331 5.09577 7.30902 5.39662H6.11633C6.12493 4.91095 6.24527 4.49405 6.47736 4.14592C6.71375 3.79778 7.0318 3.53131 7.43151 3.3465C7.83122 3.16169 8.27821 3.06928 8.77247 3.06928C9.31831 3.06928 9.78249 3.16813 10.165 3.36584C10.5518 3.56354 10.8462 3.84721 11.0482 4.21683C11.2502 4.58216 11.3512 5.01625 11.3512 5.51912C11.3512 5.90593 11.2717 6.26266 11.1127 6.58931C10.958 6.91165 10.7581 7.21466 10.5131 7.49833C10.2682 7.78199 10.0081 8.05276 9.73307 8.31064C9.49668 8.52984 9.33765 8.77697 9.25599 9.05204C9.17433 9.32711 9.1335 9.62367 9.1335 9.94172ZM7.88279 11.9854C7.88279 11.792 7.94297 11.6287 8.06331 11.4954C8.18365 11.3622 8.35772 11.2956 8.58551 11.2956C8.8176 11.2956 8.99382 11.3622 9.11416 11.4954C9.2345 11.6287 9.29467 11.792 9.29467 11.9854C9.29467 12.1702 9.2345 12.3292 9.11416 12.4625C8.99382 12.5957 8.8176 12.6623 8.58551 12.6623C8.35772 12.6623 8.18365 12.5957 8.06331 12.4625C7.94297 12.3292 7.88279 12.1702 7.88279 11.9854Z"
                            fill="#FCFCFC"
                          />
                        </svg>
                      </HoverComponent>
                    </div>
                  </div>

                  <div className={classes.planner_popup_cont_right_adv_input}>
                    <div className={classes.planner_popup_cont_right_adv_input_right}>
                      <div className={classes.planner_popup_cont_right_adv_input_img}>
                        <img src="/src_designer/images/import_model_add_2.png" />
                      </div>

                      <input
                        type="radio"
                        id="inWall"
                        name="positionStatus"
                        onChange={(e) => onSetAppointmentStatus('wall')}
                        checked={appointmentRadioStatus == 'wall' ? true : false}
                      />
                      <label htmlFor="inWall">{translation['UPLOAD_TEXT_BUILD_IN_WALL']}</label>
                    </div>

                    <div>
                      <HoverComponent
                        hoverText={translation['UPLOAD_TEXT_BUILD_IN_WALL_TIP']}
                        showOnMobile={true}
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 17 17"
                          fill="none"
                          className={classes.planner_popup_cont_right_adv_info}
                        >
                          <rect opacity="0.7" width="17" height="17" rx="8.5" fill="#2F2F2F" />
                          <path
                            d="M9.1335 9.94172H7.93437C7.93867 9.52911 7.9752 9.19172 8.04397 8.92955C8.11703 8.66307 8.23523 8.42024 8.39855 8.20104C8.56187 7.98185 8.77892 7.73256 9.04969 7.4532C9.2474 7.25119 9.42791 7.06208 9.59123 6.88587C9.75885 6.70535 9.89424 6.51194 9.99739 6.30564C10.1005 6.09504 10.1521 5.84361 10.1521 5.55135C10.1521 5.25479 10.0984 4.99906 9.99094 4.78416C9.88779 4.56927 9.73307 4.4038 9.52676 4.28775C9.32476 4.17171 9.07333 4.11368 8.77247 4.11368C8.52319 4.11368 8.2868 4.15881 8.06331 4.24907C7.83981 4.33933 7.6593 4.47901 7.52177 4.66812C7.38423 4.85293 7.31331 5.09577 7.30902 5.39662H6.11633C6.12493 4.91095 6.24527 4.49405 6.47736 4.14592C6.71375 3.79778 7.0318 3.53131 7.43151 3.3465C7.83122 3.16169 8.27821 3.06928 8.77247 3.06928C9.31831 3.06928 9.78249 3.16813 10.165 3.36584C10.5518 3.56354 10.8462 3.84721 11.0482 4.21683C11.2502 4.58216 11.3512 5.01625 11.3512 5.51912C11.3512 5.90593 11.2717 6.26266 11.1127 6.58931C10.958 6.91165 10.7581 7.21466 10.5131 7.49833C10.2682 7.78199 10.0081 8.05276 9.73307 8.31064C9.49668 8.52984 9.33765 8.77697 9.25599 9.05204C9.17433 9.32711 9.1335 9.62367 9.1335 9.94172ZM7.88279 11.9854C7.88279 11.792 7.94297 11.6287 8.06331 11.4954C8.18365 11.3622 8.35772 11.2956 8.58551 11.2956C8.8176 11.2956 8.99382 11.3622 9.11416 11.4954C9.2345 11.6287 9.29467 11.792 9.29467 11.9854C9.29467 12.1702 9.2345 12.3292 9.11416 12.4625C8.99382 12.5957 8.8176 12.6623 8.58551 12.6623C8.35772 12.6623 8.18365 12.5957 8.06331 12.4625C7.94297 12.3292 7.88279 12.1702 7.88279 11.9854Z"
                            fill="#FCFCFC"
                          />
                        </svg>
                      </HoverComponent>
                    </div>
                  </div>
                </div>
              </div>

              <div className={classes.planner_popup_cont_right_materials}>{materialsArray}</div>
            </div>
          </SimpleBar>
        </div>

        <div className={classes.planner_popup_cont_right_buttons}>
          <div
            className={
              classes.planner_popup_cont_right_button +
              ' ' +
              classes.planner_popup_cont_right_button_cancel
            }
            onClick={onCloseUploadPanel}
          >
            <svg width="21" height="22" viewBox="0 0 21 22" fill="none">
              <path
                d="M19.799 0.600586L20.5061 1.30769L0.707107 21.1067L0 20.3996L19.799 0.600586Z"
                fill="#2A3435"
              />
              <path
                d="M0.799112 0.600586L0.0920048 1.30769L19.891 21.1067L20.5981 20.3996L0.799112 0.600586Z"
                fill="#2A3435"
              />
            </svg>
            <p>{translation['UPLOAD_MODEL_TEXT_CANCEL']}</p>
          </div>
          <div
            className={
              classes.planner_popup_cont_right_button +
              ' ' +
              classes.planner_popup_cont_right_button_save +
              ' ' +
              (userData.plan == 'pro' ||
              (isProjectBelongToLoggedUser && userProjectActive.plan == 'pro')
                ? classes.planner_popup_cont_right_button_save_ready
                : '')
            }
            onClick={onSaveModel}
          >
            {userData?.plan == 'pro' ||
            (isProjectBelongToLoggedUser && userProjectActive.plan == 'pro') ? (
              <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
                <path d="M0.5 9.5L7.5 16.5L21.5 0.5" stroke="#2A3435" />
              </svg>
            ) : null}

            <p>{translation['UPLOAD_MODEL_TEXT_SAVE']}</p>
            {userData?.plan == 'pro' ||
            (isProjectBelongToLoggedUser && userProjectActive.plan == 'pro') ? null : (
              <Lock
                additionalClass={classes.planner_catalog_prem_zamok}
                additionalImgClass={classes.planner_lock_img}
                tipPositionY={'top'}
                tipPositionX={'right'}
                upgradePro={true}
                textHover={'UPGRADE_YOUR_PLAN_TEXT'}
                parentClass={classes.planner_popup_cont_right_button_save}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
