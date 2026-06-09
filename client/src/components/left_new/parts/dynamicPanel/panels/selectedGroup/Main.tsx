import React, { useEffect, useMemo,useState } from 'react';
import {createUseStyles} from "react-jss";
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from "simplebar-react";

import {planner, user} from '../../../../../../initR2D';
import { changeActiveControlPanelMode, selectActiveControlPanelModeData, selectPrevControlPanelMode } from '../../../../../../redux/features/control/controlPanelSlice';
import { selectTranslation } from '../../../../../../redux/features/language/languageSlice';
import { setActivePopup } from '../../../../../../redux/features/popups/popupsSlice';
import { removeQuickPanelAll } from '../../../../../../redux/features/quickPanels/quickPanelsSlice';
import { changeUndoRedo } from '../../../../../../redux/features/topPanel/topPanelSlice';
import ChangeSize from '../../../../../common/ChangeSize';
import RemoteComponentMain from '../../../../../common/RemoteComponentMain';
import LockSize from '../../components/LockSize';
import MaterialComponent from '../../components/MaterialComponent';

const useStyle = createUseStyles({
  '@font-face': [
    {
      fontFamily: 'RobotoCondensed-Regular',
      fontWeight: 400,
      fontDisplay: 'swap',
      src: 'url("/src_designer/fonts/RobotoCondensed-Regular.ttf") format("truetype")',
    },
  ],
  planerWallsCont: {
    borderRight: '1px solid #cdcdcd',
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
    '@media screen and (max-width: 950px)': {
      width: 189,
    },
  },
  planerWallsWrap: {
    height: '100%',
    background: '#fff',
    overflow: 'hidden',
  },
  title: {
    fontSize: 17,
    color: '#2A3435',
    marginBottom: 17,
    fontFamily: 'RobotoCondensed-Regular',
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
      marginBottom: 5,
    },
  },
  cont: {
    padding: '14px 14px 0',
    '@media screen and (max-width: 950px)': {
      padding: '5px 5px 0',
    },
  },
  planerChangeSizesWrap: {
    display: 'grid',
    gridTemplateColumns: 'auto 27px',
    gridGap: 24,
    marginBottom: 20,
    paddingRight: 10,
    '@media screen and (max-width: 950px)': {
      gridGap: 13,
    },
  },
  planerChangeSizes: {},
  groupWr: {
    height: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #cdcdcd',
    borderRadius: 6,
    overflow: 'hidden',
    cursor: 'pointer',
    paddingRight: 14,
    transition: 'all 0.9s cubic-bezier(0.19, 1, 0.22, 1)',
    marginBottom: 20,
    '&:hover': {
      background: '#E9E9E9',
    },
    '& svg': {
      flex: 1,
      '@media screen and (max-width: 950px)': {
        width: 51,
        height: 'auto',
        flex: 'none',
        marginRight: 5,
      },
    },
    '@media screen and (max-width: 950px)': {
      paddingRight: 0,
      marginBottom: 10,
      padding: 5,
      height: 50,
    },
  },
  groupText: {
    fontSize: 13,
    color: '#2A3435',
    flex: 1,
    '@media screen and (max-width: 950px)': {
      fontSize: 11,
    },
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
  zamokLock: {
    position: 'absolute',
    top: 35,
    right: '-7px',
    width: 15,
    opacity: '.5',
  },
  materialsGrid: {
    display: 'grid',
    borderTop: '1px solid #BFBDBD',
    justifyContent: 'space-between',
    gridTemplateColumns: 'repeat(2, calc(calc(50%)))',
    width: 'calc(100% + 28px)',
    marginLeft: '-14px',
    '@media screen and (max-width: 950px)': {
      width: 'calc(100% + 10px)',
      marginLeft: '-5px',
    },
  },
  materialsGrid_1: {
    gridTemplateColumns: '100%',
    '& .editMatItemWr': {
      aspectRatio: 'auto',
      height: 151,
    },
  },
  materialsGrid_3: {
    gridTemplateColumns: 'repeat(3, calc(calc(34%)))',
    '& .prod_item_zamok_btn': {
      width: 15,
      height: 15,
      right: 2,
      top: 2,
    },
  },
  materialsGrid_4: {
    gridTemplateColumns: 'repeat(4, calc(calc(25%)))',
    '& .prod_item_zamok_btn': {
      width: 15,
      height: 15,
      right: 2,
      top: 2,
    },
  },
});

const Main = (props) => {
  const classes = useStyle();
  let dispatch = useDispatch();
  const translation = useSelector(selectTranslation);

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  let controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  let isAdded = lastHistoryElem?.isAdded;

  const prevControlPanelMode = useSelector(selectPrevControlPanelMode);

  let [currentGroup, setCurrentGroup] = useState(null);
  const [currentObjects, setCurrentObjects] = useState(null);

  const [objectWidth, setObjectWidth] = useState(0);
  let [objectHeight, setObjectHeight] = useState(0);
  let [objectDepth, setObjectDepth] = useState(0);
  let [objectElevation, setObjectElevation] = useState(0);

  let [isFixedSize, setIsFixedSize] = useState(false);

  let [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

  const [isMerged, setIsMerged] = useState(planner.scene.currentGroupIsMerged());

  let [mouseDown, setMouseDown] = useState({ status: false, action: null, type: null });

  let ratioWvH = objectWidth / objectHeight;
  let ratioWvD = objectWidth / objectDepth;

  let [currentObjectsMaterialsIds, setCurrentObjectsMaterialsIds] = useState(
    props.currentObjectsMaterialsIds
  );

  const [previewMaterials, setPreviewMaterials] = useState(null);
  let [materislsCount, setMaterislsCount] = useState(0);
  const [productApplications, updateProductApplications] = useState(null);

  let onClickPreview = (matId, addMatId) => props.onClickPreview(matId, addMatId);

  let onCopyMaterial = (id, addMaterial) => R2D.CopyPaste.copyMaterial({ id, addMaterial });

  const onPasteMaterial = (prevMatId, prevAddMatId) => {
        if(!currentObjectsMaterialsIds || currentObjectsMaterialsIds.length < 1) return;
        let mat = R2D.CopyPaste.pasteMaterial();
        if (mat?.id) {
            currentObjects.forEach((i, index) => {
                currentObjectsMaterialsIds[index]?.forEach(y => {
                    if(prevMatId == y.id && prevAddMatId == y.addMaterial) {
                        const materialIndex = i.getMaterialsObjects().findIndex(m => m.hash == y.hash)
                        i.setAddMaterialAt(materialIndex, mat.addMaterial);
                        i.setMaterialAt(materialIndex, mat.id);
                        i.dispatchUpdate();
                    }
                });
            });
            planner.mih()._scene.history.saveState();
            let newCurrentObjectsMaterialsIds = currentObjects.map(i => i?.getMaterials && i.getMaterials()).filter(i => i).map(i => i.filter(z => z.source == "bank").map(y => { return {id: y.current, addMaterial: y.addMaterial, hash: y.hash} }));
            setCurrentObjectsMaterialsIds(newCurrentObjectsMaterialsIds.filter(i => i.length > 0));

            dispatch(changeUndoRedo());
            planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
        } else if(mat?.type == "logoMesh") {
            dispatch(setActivePopup({name: "alert", data: translation["TEXT_PASTE_LOGO_INTO_MATERIAL_MESH_ERROR"]}))
        }
    }
  };

  const onChangeSize = (mouseDown, value, type) => {
        setMouseDown({...mouseDown, type});
        switch(type) {
            case "width":
                currentGroup.setWidth(value);
                currentGroup.setHeight(value / ratioWvH);
                currentGroup.setDepth(value / ratioWvD);
                break;
            case "height":
                currentGroup.setHeight(value);
                currentGroup.setWidth(value * ratioWvH);
                currentGroup.setDepth(value * ratioWvH / ratioWvD);
                break;
            case "depth":
                currentGroup.setDepth(value);
                currentGroup.setWidth(value * ratioWvD);
                currentGroup.setHeight(value * ratioWvD / ratioWvH);
                break;
            case "elevation":
                currentGroup.y = value;
                break;
        }
        planner.mih()._ruler3d.findRules(planner.mih()._scene.currentGroup);
        currentGroup.update();
        
        if(mouseDown.status == false) {
            planner.mih()._scene.history.saveState();
            dispatch(changeUndoRedo());
        }
        setObjectWidth(Math.round(currentGroup.getWidth() * 10) / 10);
        setObjectHeight(Math.round(currentGroup.getHeight() * 10) / 10);
        setObjectDepth(Math.round(currentGroup.getDepth() * 10) / 10);
        setObjectElevation(currentGroup.y);
        !mouseDown.status && planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));
    }

  let onClickMergeButton = (e) => {
    if (isMerged) {
      planner.scene.unmergeCurrentGroup();
      dispatch(changeActiveControlPanelMode({ mode: prevControlPanelMode }));
      dispatch(removeQuickPanelAll());
    } else {
      planner.scene.mergeCurrentGroup();
    }
    setIsMerged(!isMerged);
  };

  let elevationUpdate = (e) => setObjectElevation(e.data.elevation);

  let rotationUpdate = (e) => {
    setObjectElevation(e.data.elevation);
    setObjectWidth(Math.round(e.data.width * 10) / 10);
    setObjectDepth(Math.round(e.data.depth * 10) / 10);
    setObjectHeight(Math.round(e.data.height * 10) / 10);
  };

  let groupUpdate = (e) => {
    setCurrentGroup(
      planner.mih()._scene.currentGroup || planner.mih()._scene.prevSelectedView3DObject
    );
    setCurrentObjects(
      planner.mih()._scene.currentGroup
        ? planner
            .mih()
            ._scene.currentGroup.getObjViews()
            .map((i) => (i && typeof i.getSceneObject === 'function' ? i.getSceneObject() : null))
        : planner.mih()._scene.prevSelectedView3DObject?.getObjViews &&
            planner
              .mih()
              ._scene.prevSelectedView3DObject?.getObjViews()
              .map((i) => (i && typeof i.getSceneObject === 'function' ? i.getSceneObject() : null))
    );
  };

  useEffect(() => {
    if (currentGroup) {
      currentGroup.getObjViews &&
        setCurrentObjects(
          currentGroup
            .getObjViews()
            .map((i) => (i && typeof i.getSceneObject === 'function' ? i.getSceneObject() : null))
        );
      setObjectWidth(Math.round(currentGroup.getWidth() * 10) / 10);
      setObjectHeight(Math.round(currentGroup.getHeight() * 10) / 10);
      setObjectDepth(Math.round(currentGroup.getDepth() * 10) / 10);
      setObjectElevation(currentGroup.y);
    }
  }, [currentGroup]);

  useEffect(() => {
    if (currentObjects) {
      currentObjects.forEach((i) => {
        const metadata = i?.objectData?.metadata;
        if (i.objectData?.applications) {
          let applicationsReactArray = [];
          for (const key in i.objectData?.applications) {
            if (
              metadata[key.toLowerCase()]?.config?.useForGroup &&
              !applicationsReactArray.length
            ) {
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
                  zipUrl={i.objectData?.applications[key]}
                />
              );
              updateProductApplications(applicationsReactArray);
            }
          }
        }
        let disabledSizes =
          metadata && Object.entries(metadata)?.find((i) => i[1]?.config?.disableSizes);
        (disabledSizes || i?.getIsFixedSizeEnabled()) && setIsFixedSize(true);
      });
      let newCurrentObjectsMaterialsIds = currentObjects
        .map((i) => i.getMaterials && i.getMaterials())
        .filter((i) => i)
        .map((i) =>
          i
            .filter((z) => z.source == 'bank' || z.source == 'set')
            .map((y) => {
              return {
                id: y.current,
                addMaterial: y.addMaterial,
                hash: y.hash,
                source: y.source,
                setId: y.setId,
              };
            })
        );
      setCurrentObjectsMaterialsIds(newCurrentObjectsMaterialsIds.filter((i) => i.length > 0));
    }
  }, [currentObjects]);

  useEffect(() => {
    setStyleAnimation({ transform: 'translateX(0%)' });
    planner.apiScene.addEventListener(planner.apiScene.ELEVATION_OBJECT, elevationUpdate);
    planner.apiScene.addEventListener(planner.apiScene.ROTATION_GROUP, rotationUpdate);
    planner.apiScene.addEventListener(planner.apiScene.GROUP_COUNT_UPDATE, groupUpdate);
    setCurrentGroup(
      planner.mih()._scene.currentGroup || planner.mih()._scene.prevSelectedView3DObject
    );

    return () => {
      planner.apiScene.removeEventListener(planner.apiScene.ELEVATION_OBJECT, elevationUpdate);
      planner.apiScene.removeEventListener(planner.apiScene.ROTATION_GROUP, rotationUpdate);
    };
  }, []);

  useEffect(() => {
    if (currentObjectsMaterialsIds && currentObjectsMaterialsIds.length > 0) {
      let currentObjectsMaterialsIdsConcat = currentObjectsMaterialsIds.reduce(
        (previousValue, currentValue) => previousValue.concat(currentValue)
      );
      let currentObjectsMatIdsRepeat = currentObjectsMaterialsIdsConcat.reduce(
        (prevVal, currVal) =>
          prevVal.find(
            (k) => k.id == currVal.id && k.id != '0' && k.addMaterial == currVal.addMaterial
          )
            ? [...prevVal]
            : [...prevVal, currVal],
        []
      );

      const matArray = [];
      currentObjectsMatIdsRepeat.forEach((i) => {
        let pollMaterials = Object.entries(R2D.Pool._products_data);
        let needToLock = false;
        let id = i.addMaterial || i.id;
        let currentMaterial = pollMaterials.find((y) => y[0] == id);
        let plan = currentMaterial?.[1]?.plan;

        if (user.data.plan == 'free') {
          if (Array.isArray(plan) || (plan !== 'free' && plan)) {
            needToLock = true;
          }
        }

        matArray.push(
          <MaterialComponent
            type={'group'}
            lockMaterialStatus={needToLock}
            previewMaterialsId={currentObjectsMatIdsRepeat}
            addMaterial={i.addMaterial}
            materialsSource={{ type: i.source, data: i.setId }}
            matId={i.id}
            key={i.id}
            onCopyPaste={{
              copy: onCopyMaterial,
              paste: onPasteMaterial,
              statusCopy: needToLock ? false : true,
            }}
            onClick={(e) => onClickPreview(i.id, i.addMaterial)}
          />
        );
      });
      setPreviewMaterials(matArray);
      setMaterislsCount(matArray.length);
    }
  }, [currentObjectsMaterialsIds]);

  useEffect(() => {
    planner.scene.dispatchEvent(new Event(planner.scene.TIPS_MERGE_GROUP_BUTTON, {}));
  }, []);

  return (
    <div className={classes.planerWallsCont} style={styleAnimation}>
      <div className={classes.planerWallsWrap}>
        <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
          <div className={classes.cont}>
            <div className={classes.title}>{translation['TEXT_A_GROUP']}</div>
            {isMerged ? (
              <div className={classes.groupWr} onClick={onClickMergeButton}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="95"
                  height="58"
                  viewBox="0 0 95 58"
                  fill="none"
                >
                  <path d="M33 11L45 6V21L33 26V11Z" fill="#CBCBCB" />
                  <path d="M63 11L75 6V21L63 26V11Z" fill="#CBCBCB" />
                  <path d="M21 5L32.5 0L44 5L32.5 10L21 5Z" fill="#CBCBCB" />
                  <path d="M51 5L62.5 0L74 5L62.5 10L51 5Z" fill="#CBCBCB" />
                  <path d="M32 11L20 6V21L32 26V11Z" fill="#CBCBCB" />
                  <path d="M62 11L50 6V21L62 26V11Z" fill="#CBCBCB" />
                  <path d="M48 22L60 17V32L48 37V22Z" fill="#A1A1A1" />
                  <path d="M36 16L47.5 11L59 16L47.5 21L36 16Z" fill="#A1A1A1" />
                  <path d="M47 22L35 17V32L47 37V22Z" fill="#A1A1A1" />
                  <path d="M9.5 8.5L18 13L16.5 14L8 9.5L5 11.5L0 4L13 6L9.5 8.5Z" fill="#444444" />
                  <path
                    d="M85.5 8.5L77 13L78.5 14L87 9.5L90 11.5L95 4L82 6L85.5 8.5Z"
                    fill="#444444"
                  />
                  <path
                    d="M46.4166 47.9701L46.4166 39.9702L48.4169 39.9701L48.417 47.9702L52.9168 47.9701L47.4172 57.4701L42.417 47.9702L46.4166 47.9701Z"
                    fill="#444444"
                  />
                </svg>
                <div className={classes.groupText}>{translation['TEXT_UNGROUP']}</div>
              </div>
            ) : (
              <div className={classes.groupWr} onClick={onClickMergeButton}>
                <svg width="95" height="58" viewBox="0 0 95 58" fill="none">
                  <path d="M33 11L45 6V21L33 26V11Z" fill="#CBCBCB" />
                  <path d="M63 11L75 6V21L63 26V11Z" fill="#CBCBCB" />
                  <path d="M21 5L32.5 0L44 5L32.5 10L21 5Z" fill="#CBCBCB" />
                  <path d="M51 5L62.5 0L74 5L62.5 10L51 5Z" fill="#CBCBCB" />
                  <path d="M32 11L20 6V21L32 26V11Z" fill="#CBCBCB" />
                  <path d="M62 11L50 6V21L62 26V11Z" fill="#CBCBCB" />
                  <path d="M48 22L60 17V32L48 37V22Z" fill="#A1A1A1" />
                  <path d="M36 16L47.5 11L59 16L47.5 21L36 16Z" fill="#A1A1A1" />
                  <path d="M47 22L35 17V32L47 37V22Z" fill="#A1A1A1" />
                  <path d="M8.5 9.5L0 5L1.5 4L10 8.5L13 6.5L18 14L5 12L8.5 9.5Z" fill="#444444" />
                  <path
                    d="M86.5 9.5L95 5L93.5 4L85 8.5L82 6.5L77 14L90 12L86.5 9.5Z"
                    fill="#444444"
                  />
                  <path
                    d="M46.4166 48.5462L46.4166 56.5461L48.4169 56.5462L48.417 48.5461L52.9168 48.5462L47.4172 39.0462L42.417 48.5461L46.4166 48.5462Z"
                    fill="#444444"
                  />
                </svg>
                <div className={classes.groupText}>{translation['TEXT_GROUP']}</div>
              </div>
            )}

            {productApplications}

            <div className={classes.planerChangeSizesWrap}>
              <div className={classes.planerChangeSizes}>
                <ChangeSize
                  isFixedSize={isFixedSize}
                  mouseDown={mouseDown}
                  valueChangeType={'width'}
                  changeValue={onChangeSize}
                  value={objectWidth}
                  label={translation['WIDTH']}
                />
                <ChangeSize
                  isFixedSize={isFixedSize}
                  mouseDown={mouseDown}
                  valueChangeType={'height'}
                  changeValue={onChangeSize}
                  value={objectHeight}
                  label={translation['HEIGHT']}
                />
                <ChangeSize
                  isFixedSize={isFixedSize}
                  mouseDown={mouseDown}
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

              <div className={classes.changeSizesLockWr}>
                <div className={classes.changeSizesLockLine1}></div>
                <div className={classes.changeSizesLockLine2}></div>
                <div className={classes.changeSizesLockLine3}></div>
                <LockSize
                  isFixedSize={true}
                  right={'-7px'}
                  top={window.innerWidth > 950 ? '35px' : '35px'}
                />
              </div>
            </div>

            {previewMaterials && previewMaterials.length > 0 ? (
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
                {previewMaterials}
              </div>
            ) : null}
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default Main;
