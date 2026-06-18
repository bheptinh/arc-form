import React, { useEffect, useMemo, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../../../../../../api/hooks/useTranslation';
import { planner } from '../../../../../../../initR2D';
import {
  controlPanelHistoryAdd,
  controlPanelUpdateBreadCrumbs,
  selectActiveControlPanelModeData,
} from '../../../../../../../redux/features/control/controlPanelSlice';
import { setActivePopup } from '../../../../../../../redux/features/popups/popupsSlice';
import { changeUndoRedo } from '../../../../../../../redux/features/topPanel/topPanelSlice';
import Checkbox from '../../../../../../../shared-components/inputs/checkbox';
import ChangeSize from '../../../../../../common/ChangeSize';
import BlueButton from '../../../components/BlueButton';
import EditPlinthItem from '../../../components/EditPlinthItem';
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
    background: '#fff',
    borderTop: '1px solid #C6C4C4',
  },
  planerWallsWrap: {},
  catalog_top_wr: {
    padding: '10px 10px 10px 10px',
    '@media screen and (max-width: 950px)': {
      padding: 5,
    },
  },
  planerPlintusTitleWr: {
    display: 'flex',
    alignItems: 'center',
  },
  planerPlintusTitle: {
    fontSize: 17,
    color: '#2F2F2F',
    fontFamily: 'RobotoCondensed-Regular',
    marginLeft: 10,
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      marginLeft: 5,
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
          fill: '#64BCF0',
          stroke: '#64BCF0',
          fillOpacity: '0.5',
        },
      },
    },
  },
  planerWallsWrap_top_favorites: {},
  planerWallsWrap_top_favorites_active: {
    '& path': {
      fill: '#64BCF0',
      stroke: '#64BCF0',
      fillOpacity: 1,
    },
  },
  divideWall: {
    height: 100,
    border: '1px solid #d9d9d9',
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
      border: '1px solid #9DD900',
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
    borderBottom: '1px solid #BEBCBC',
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
      background: '#E9E9E9',
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
    color: '#2F2F2F',
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

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;

  const translation = useTranslation();

  const dispatch = useDispatch();

  const imgSrc = WC.plinthCreator.getImgSrc(constructionData?.shapeNum, constructionData?.type);

  const [plinthHeight, setPlinthHeight] = useState(constructionData?.h);
  const [plinthDepth, setPlinthDepth] = useState(constructionData?.d);

  const [mouseDown, setMouseDown] = useState({ status: false, action: null, type: null });
  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

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
    setMouseDown({ ...mouseDown, type });
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
    const keyTimeout = setTimeout(() => setStyleAnimation({ transform: 'translateX(0%)' }), 50);
    planner.scene.addEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
    return () => {
      planner.scene.removeEventListener(planner.scene.CLEAR_MATERIALS, updateMaterialsEvent);
      clearTimeout(keyTimeout);
    };
  }, []);

  return (
    <div style={styleAnimation} className={classes.planerWallsCont}>
      <div className={classes.catalog_top_wr}>
        <div className={classes.planerPlintusTitleWr}>
          <div className={classes.catalog_top_selected_preview}>
            <img src={`${imgSrc}`} />
          </div>
          <div className={classes.planerPlintusTitle}>
            {constructionData?.type == 'topPlinth'
              ? translation['TEXT_MOLDING']
              : translation['PANEL_TITLE_PLINTUS']}
          </div>
        </div>
      </div>

      <div style={styleAnimation} className={classes.catalog_wr}>
        <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
          <div className={classes.planerWallsWrap}>
            <div className={classes.divideWallGrid + ' ' + classes.divideWallGridMany}>
              {R2D.config.data.enable_pro ? (
                <EditPlinthItem
                  customStyles={{ border: 'none' }}
                  onClick={onClickPlinthChange}
                  src={`${imgSrc}`}
                />
              ) : null}

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
                mouseDown={mouseDown}
                valueChangeType={'h'}
                zeroNotAllowed={true}
                changeValue={onChangeSize}
                value={plinthHeight}
                label={translation['HEIGHT']}
              />
              <ChangeSize
                mouseDown={mouseDown}
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
        </SimpleBar>
      </div>
    </div>
  );
};

export default Main;
