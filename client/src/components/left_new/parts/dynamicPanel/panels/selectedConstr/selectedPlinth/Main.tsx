import React, { useEffect, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch } from 'react-redux';

import { useTranslation } from '../../../../../../../api/hooks/useTranslation';
import { planner } from '../../../../../../../initR2D';
import {
  controlPanelHistoryAdd,
  controlPanelUpdateBreadCrumbs,
} from '../../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../../redux/features/popups/popupsSlice';
import { changeUndoRedo } from '../../../../../../../redux/features/topPanel/topPanelSlice';
import Checkbox from '../../../../../../../shared-components/inputs/checkbox';
import ChangeSize from '../../../../../../common/ChangeSize';
import BlueButton from '../../../components/BlueButton';
import EditPlinthItem from '../../../components/EditPlinthItem';
import MaterialComponent from '../../../components/MaterialComponent';
import CatalogScreen from '../../common/CatalogScreen';

const useStyle = createUseStyles({
  planerWallsWrap: {},
  planerWallsTitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 15,
    color: '#505050',
  },
  planerWallsCurentMatWr: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  planerWallsWrap_favorites: {
    left: '5px',
    width: '15px',
    height: '15px',
    display: 'flex',
    zIndex: 1,
    position: 'absolute',
    alignItems: 'center',
    borderRadius: '50%',
    justifyContent: 'center',
    '& svg': {
      cursor: 'pointer',
      marginBottom: 1,
      '& path': {
        transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
      },
      '&:hover': {
        '& path': {
          fill: 'var(--color-icon-info)',
          stroke: 'var(--color-icon-info)',
          fillOpacity: '0.5',
        },
      },
    },
  },
  planerWallsWrap_top_favorites: {},
  planerWallsWrap_top_favorites_active: {
    '& path': {
      fill: 'var(--color-icon-info)',
      stroke: 'var(--color-icon-info)',
      fillOpacity: 1,
    },
  },
  divideWall: {
    height: 100,
    border: '1px solid var(--color-surface-grey)',
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    cursor: 'pointer',
    display: 'grid',
    gridTemplateColumns: 'auto auto',
    gridGap: 31,
    padding: '10px 25px',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 20,
    '&:hover': {
      border: '1px solid var(--color-accent-strong)',
    },
    '@media screen and (max-width: 950px)': {
      padding: '10px',
      gridGap: 10,
    },
  },
  lockOn: {
    border: '1px solid #969696',
  },
  divideWallImg: {},
  divideWallText: {
    color: '#444444',
    fontSize: 14,
    '@media screen and (max-width: 950px)': {
      fontSize: 12,
    },
  },
  divideWallGrid: {
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    marginBottom: 14,
    borderBottom: '1px solid var(--color-border-strong)',
    overflow: 'hidden',
    position: 'relative',
    '@media screen and (max-width: 950px)': {
      marginBottom: 10,
    },
  },
  divideWallGridMany: {
    '&:before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '50%',
      height: '100%',
      width: 1,
      background: 'var(--color-surface-muted)',
      zIndex: 1,
    },
  },
  planerChangeSizes: {
    margin: '0 14px 30px',
    '@media screen and (max-width: 950px)': {
      margin: '0 5px 20px',
    },
  },
  divide_checkbox_wr: {
    margin: '0 14px 15px',
    '@media screen and (max-width: 950px)': {
      margin: '0 5px 15px',
    },
  },
  lockImg: {
    position: 'absolute',
    top: -8,
    left: -6,
  },
  planerPlintusAreaTitle: {
    color: 'var(--color-text)',
    fontSize: 14,
    margin: '0 14px 8px',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      margin: '0 5px 8px',
    },
  },
  divideWallBtnWrap: {
    padding: '0 14px',
    '@media screen and (max-width: 950px)': {
      padding: '0 5px',
    },
  },
});

const Main = (props) => {
  const classes = useStyle();
  const constructionData = props.constructionData;

  const translation = useTranslation();

  const dispatch = useDispatch();

  const imgSrc = WC.plinthCreator.getImgSrc(constructionData?.shapeNum, constructionData?.type);

  const [plinthHeight, setPlinthHeight] = useState(constructionData?.h);
  const [plinthDepth, setPlinthDepth] = useState(constructionData?.d);

  const [previewMaterialId, setPreviewMaterialId] = useState(constructionData?.getMaterial());
  const [previewAddMaterialId, setPreviewAddMaterialId] = useState(
    constructionData?.getAddMaterial()
  );

  const [checkBoxStatus, setCheckBoxStatus] = useState(constructionData?.exists);

  const onCopyMaterial = (id, addMaterial) =>
    R2D.CopyPaste.copyMaterial({
      id,
      addMaterial,
      materialRotation: constructionData.getMaterialRotation(),
    });

  const onPasteMaterial = () => {
    const mat = R2D.CopyPaste.pasteMaterial();
    if (mat?.id) {
      setPreviewMaterialId(mat.id);
      setPreviewAddMaterialId(mat.addMaterial);
      constructionData.setMaterial(mat.id);
      constructionData.setAddMaterial(mat.addMaterial);
      constructionData.setMaterialRotation(mat.materialRotation);
      constructionData.build3D();
      constructionData.dispatchUpdate();
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

  const changeMoldingVisible = (checked) => {
    constructionData.exists = checked;
    constructionData.dispatchUpdate();
    R2D.scene.history.saveState();
    dispatch(changeUndoRedo());
    setCheckBoxStatus(checked);
  };

  const onChangeSize = (mouseDown, value, type) => {
    constructionData[type] = value;
    constructionData.dispatchUpdate();
    planner.scene.rebuildAllPlinths();
    type == 'h' ? setPlinthHeight(value) : setPlinthDepth(value);

    if (mouseDown.status == false) {
      planner.mih()._scene.history.saveState();
      dispatch(changeUndoRedo());
    }

    !mouseDown.status &&
      planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
  };

  const onClickPlinthChange = () => {
    dispatch(controlPanelHistoryAdd({ added: true, type: 'changePlinth' }));
    dispatch(
      controlPanelUpdateBreadCrumbs({
        data: { added: true, type: 'changePlinth' },
        updateType: 'add',
      })
    );
    props.onChangeSelectedType(constructionData.type);
  };

  const onApplyToAllRoom = () => {
    planner.scene.setPlinthToRoom(constructionData);
    constructionData?.dispatchUpdate();
    R2D.scene.history.saveState();
    dispatch(changeUndoRedo());
    planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
  };

  const updateMaterialsEvent = (e) => {
    setPreviewMaterialId(constructionData.getMaterial());
    setPreviewAddMaterialId(constructionData.getAddMaterial());
  };

  useEffect(() => {
    planner.scene.addEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
    return () => {
      planner.scene.removeEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
    };
  }, []);

  return (
    <CatalogScreen
      header={
        <CatalogScreen.Header
          icon={imgSrc}
          title={
            constructionData?.type == 'topPlinth'
              ? translation['TEXT_MOLDING']
              : translation['PANEL_TITLE_PLINTUS']
          }
          settings={false}
        />
      }
    >
      <div className={classes.planerWallsWrap}>
        <div className={classes.divideWallGrid + ' ' + classes.divideWallGridMany}>
          <EditPlinthItem
            customStyles={{ border: 'none' }}
            onClick={onClickPlinthChange}
            src={`${imgSrc}`}
          />

          <MaterialComponent
            customStyles={{ border: 'none' }}
            addMaterial={previewAddMaterialId}
            materialsSource={{ type: 'bank', data: null }}
            matId={previewMaterialId}
            onCopyPaste={{ copy: onCopyMaterial, paste: onPasteMaterial }}
          />
        </div>

        <div
          className={classes.planerPlintusAreaTitle}
        >{`${translation['LENGTH']} ${planner.units.valueToString(constructionData?.length)} ${R2D.DimensionSystem.getName()}`}</div>

        <div className={classes.planerChangeSizes}>
          <ChangeSize
            valueChangeType={'h'}
            zeroNotAllowed={true}
            changeValue={onChangeSize}
            value={plinthHeight}
            label={translation['HEIGHT']}
          />
          <ChangeSize
            valueChangeType={'d'}
            zeroNotAllowed={true}
            changeValue={onChangeSize}
            value={plinthDepth}
            label={translation['DEPTH']}
          />
        </div>

        <div className={classes.divide_checkbox_wr}>
          <Checkbox
            name={'plinthVisible'}
            onChange={changeMoldingVisible}
            checked={checkBoxStatus}
            label={translation['TEXT_SHOW']}
          />
        </div>

        <div className={classes.divideWallBtnWrap}>
          <BlueButton label={translation['TEXT_APPLY_TO_ROOM']} onClick={onApplyToAllRoom} />
        </div>
      </div>
    </CatalogScreen>
  );
};

export default Main;
