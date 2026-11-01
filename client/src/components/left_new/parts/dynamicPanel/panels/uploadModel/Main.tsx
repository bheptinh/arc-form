import {
  IconFlipHorizontal,
  IconFlipVertical,
  IconHelpHexagonFilled,
  IconPlus,
  IconRotate,
  IconRotateClockwise,
  IconX,
} from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useLanguages } from '../../../../../../api/hooks/useLanguages';
import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { planner } from '../../../../../../initR2D';
import {
  changeActiveControlPanelMode,
  selectActiveControlPanelModeData,
  selectControlPanelData,
  selectPrevControlPanelMode,
  updateControlPanelStatus,
} from '../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import { showQuickPanelVisible } from '../../../../../../redux/features/quickPanels/quickPanelsSlice';
import HoverComponent from '../../../controlPanel/components/HoverComponent';
import MaterialComponent from '../../components/MaterialComponent';

const useStyle = createUseStyles({
  planner_upload_catalog_cont: {
    borderRight: '1px solid var(--color-border-light)',
    background: 'var(--color-white)',
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
        fill: 'var(--color-accent)',
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
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
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
    background: 'var(--color-info-bright)',
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
      color: 'var(--color-text-muted)',
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
        background: 'var(--color-surface-muted)',
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
        background: 'var(--color-accent-strong)',
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
    border: '1px solid var(--color-border-strong)',
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
      color: 'var(--color-text)',
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
        background: 'var(--color-surface-muted)',
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
        background: 'var(--color-accent-strong)',
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
      color: 'var(--color-black)',
      width: '100%',
      border: '1px solid var(--color-border-warm)',
      height: '30px',
      resize: 'none',
      outline: 'none',
      fontSize: '14px',
      background: 'var(--color-white)',
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
    color: 'var(--color-slate)',
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
    border: '1px solid var(--color-black)',
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
      color: 'var(--color-slate)',
      textAlign: 'center',
    },
    '&:hover': {
      background: 'var(--color-surface-muted)',
    },
  },
  planner_popup_cont_right_button_save: {
    background: 'var(--color-white)',
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
      background: 'var(--color-surface-muted)',
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
    background: 'var(--color-accent-bright)',
    '& svg': {
      marginRight: 10,
    },
    '&:hover': {
      background: 'var(--color-accent-hover)',
    },
  },
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
    dispatch(setActivePopup({ name: 'loadingMessage', data: 'TEXT_WAIT' }));
    R2D.modelUploader.setAllPartsSourcesAsBank();
    R2D.modelUploader.save(
      R2D.URL.DOMAIN + R2D.URL.URL_UPLOAD_FILE,
      R2D.URL.DOMAIN + R2D.URL.URL_UPLOAD_ENTITY
    );
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
                      <IconRotateClockwise
                        size={18}
                        color="#2B2B2B"
                        onMouseDown={onMouseDown}
                        onMouseUp={() => transformPartUVCW(index)}
                      />
                    </HoverComponent>
                  </div>

                  <div>
                    <HoverComponent hoverText={translation['UPLOAD_CCW']}>
                      <IconRotate
                        size={18}
                        color="#2B2B2B"
                        onMouseDown={onMouseDown}
                        onMouseUp={() => transformPartUVCCW(index)}
                      />
                    </HoverComponent>
                  </div>

                  <div>
                    <HoverComponent hoverText={translation['UPLOAD_FLIP_X']}>
                      <IconFlipVertical
                        size={18}
                        color="#2B2B2B"
                        onMouseDown={onMouseDown}
                        onMouseUp={() => transformPartUVFlipX(index)}
                      />
                    </HoverComponent>
                  </div>

                  <div>
                    <HoverComponent hoverText={translation['UPLOAD_FLIP_Y']}>
                      <IconFlipHorizontal
                        size={18}
                        color="#2B2B2B"
                        onMouseDown={onMouseDown}
                        onMouseUp={() => transformPartUVFlipY(index)}
                      />
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
        <IconX size={24} color="#2F2F2F" className={classes.planner_popup_close_icon} />
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
                        onChange={() => onSetAppointmentStatus('scene')}
                        checked={appointmentRadioStatus == 'scene' ? true : false}
                      />
                      <label htmlFor="onScene">{translation['UPLOAD_TEXT_ON_SCENE']}</label>
                    </div>
                    <div>
                      <HoverComponent
                        hoverText={translation['UPLOAD_TEXT_ON_SCENE_TIP']}
                        showOnMobile={true}
                      >
                        <IconHelpHexagonFilled
                          size={17}
                          color="#2F2F2F"
                          className={classes.planner_popup_cont_right_adv_info}
                        />
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
                        <IconHelpHexagonFilled
                          size={17}
                          color="#2F2F2F"
                          className={classes.planner_popup_cont_right_adv_info}
                        />
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
            <IconX size={22} color="#2A3435" />
            <p>{translation['UPLOAD_MODEL_TEXT_CANCEL']}</p>
          </div>
          <div
            className={
              classes.planner_popup_cont_right_button +
              ' ' +
              classes.planner_popup_cont_right_button_save +
              ' ' +
              classes.planner_popup_cont_right_button_save_ready
            }
            onClick={onSaveModel}
          >
            <IconPlus size={22} color="#2A3435" />

            <p>{translation['UPLOAD_MODEL_TEXT_SAVE']}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
