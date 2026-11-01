import 'simplebar-react/dist/simplebar.min.css';

import { IconTrash } from '@tabler/icons-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createUseStyles } from 'react-jss';
import { useDispatch, useSelector } from 'react-redux';
import SimpleBar from 'simplebar-react';

import { useTranslation } from '../../../../../../api/hooks/useTranslation';
import { planner } from '../../../../../../initR2D';
import {
  selectLockState,
  updatePreloaderStatus,
} from '../../../../../../redux/features/common/commonSlice';
import {
  controlPanelHistoryReplaceArray,
  controlPanelUpdateBreadCrumbs,
  selectActiveControlPanelModeData,
} from '../../../../../../redux/features/control/controlPanelSlice';
import {
  removeQuickPanel,
  selectQuickPanels,
  showQuickPanel,
} from '../../../../../../redux/features/quickPanels/quickPanelsSlice';
import { changeUndoRedo } from '../../../../../../redux/features/topPanel/topPanelSlice';
import ChangeSize from '../../../../../common/ChangeSize';
import LockSize from '../../../../../common/LockSize';
import LogoComponent from '../../components/LogoComponent';
import Navigation from '../../navigation/Navigation';

const useStyle = createUseStyles({
  planner_logoMesh_cont: {
    background: 'var(--color-white)',
    height: '100%',
    alignContent: 'baseline',
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
  planner_logoMesh_prod_item: {},
  planner_logoMesh_prod_item_img_wr: {
    overflow: 'hidden',
    width: '100%',
    height: 300,
    display: 'flex',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 7,
    '& img': {
      maxWidth: '100%',
      maxHeight: '100%',
      transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    },
    '@media screen and (max-width: 950px)': {
      height: 188,
      padding: 13,
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
  changeSizesLockWr: {
    position: 'relative',
    height: 75,
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
  changeSizesLockLine3: {
    width: '100%',
    height: 11,
    borderBottom: '1px solid var(--color-border-grey)',
    borderRight: '1px solid var(--color-border-grey)',
    opacity: '0.5',
  },
  planner_logoMesh_buttons: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 20,
    padding: '0 14px',
    '@media screen and (max-width: 950px)': {
      padding: '0px 5px',
      marginTop: 10,
    },
  },
  planner_logoMesh_button_delete: {
    border: '1px solid var(--color-danger)',
    color: 'var(--color-danger)',
    width: '100%',
    padding: '7px 15px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    '& > svg': {
      marginRight: 5,
    },
    '& path, & rect': {
      transition: 'all .9s cubic-bezier(.19,1,.22,1)',
    },
    '&:hover': {
      background: 'var(--color-danger)',
      color: 'var(--color-white)',
      '& path, & rect': {
        fill: 'var(--color-white)',
      },
    },
    '@media screen and (max-width: 950px)': {
      padding: '5px 9px',
      fontSize: 9,
      height: 26,
    },
  },
  svg_rect_hover_stroke: {},
});

const LogoEditor = (props) => {
  const classes = useStyle();
  const dispatch = useDispatch();
  const translation = useTranslation();
  const quickPanels = useSelector(selectQuickPanels);

  const activeControlPanelData = useSelector(selectActiveControlPanelModeData);
  const controlPanelModeHistory = useMemo(() => activeControlPanelData.history, []);
  const lastHistoryElem = controlPanelModeHistory[controlPanelModeHistory.length - 1];
  const isAdded = lastHistoryElem?.isAdded;
  const activeLogoIndex = lastHistoryElem?.index;
  const currObj = R2D.scene.currentView3DObject || R2D.scene.prevSelectedView3DObject;
  const currSceneObj = currObj?.sceneObject;

  const currentStateBreadCrumbs = activeControlPanelData?.breadCrumbs;

  const [activeMeshLogo, setActiveMeshLogo] = useState(
    currObj?.logoEditor
      ? Object.values(currObj.logoEditor.getDataForUIAllLogos())[activeLogoIndex]
      : null
  );
  const activeMeshLogoHash =
    currObj?.logoEditor && Object.keys(currObj.logoEditor.getDataForUIAllLogos())[activeLogoIndex];

  const lockState = useSelector(selectLockState);

  const [objectWidth, setObjectWidth] = useState(activeMeshLogo?.width || 0);
  const [objectHeight, setObjectHeight] = useState(activeMeshLogo?.height || 0);

  const panelPreviewIcon = currSceneObj?.getObjectData
    ? R2D.URL.DOMAIN + currSceneObj.getObjectData().source.images.preview
    : '';

  const [mouseDown, setMouseDown] = useState({ status: false, action: null, type: null });
  const [styleAnimation, setStyleAnimation] = useState(
    isAdded ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }
  );

  const mainDiv = useRef(null);

  const onChangeSize = (mouseDown, value, type) => {
    if (!currObj) return;

    setMouseDown({ ...mouseDown, type });
    switch (type) {
      case 'width':
        currObj.logoEditor.setLogoWidth(activeMeshLogoHash, value, lockState);
        break;
      case 'height':
        currObj.logoEditor.setLogoHeight(activeMeshLogoHash, value, lockState);
        break;
    }

    const logoParams = currObj.logoEditor.getLogoParams(activeMeshLogoHash);

    setObjectWidth(logoParams.logoWidth);
    setObjectHeight(logoParams.logoHeight);

    !mouseDown.status &&
      planner.apiScene.dispatchEvent(new Event(planner.apiScene.ESTIMATION_SEND, {}));

    if (mouseDown.status == false) dispatch(changeUndoRedo());
  };

  const onChangeLogoSize = (e) => {
    setObjectWidth(e.data.width);
    setObjectHeight(e.data.height);
  };

  const onDeleteLogoMesh = (e) => {
    currObj.logoEditor.hideLogo(activeMeshLogoHash);
    setActiveMeshLogo(
      currObj ? Object.values(currObj.logoEditor?.getDataForUIAllLogos())[activeLogoIndex] : null
    );
    dispatch(controlPanelHistoryReplaceArray([]));
    dispatch(
      controlPanelUpdateBreadCrumbs({ data: currentStateBreadCrumbs[0], updateType: 'add' })
    );
  };

  const onUploadLogoMesh = (e) => {
    R2D.LogoEditor.uploadLogoImg().then((curLogoIndex) => {
      currObj.logoEditor.updateAfterUploadLogo(activeMeshLogoHash, curLogoIndex).then((res) => {
        setTimeout(() => {
          const newMeshLogo = currObj
            ? Object.values(currObj.logoEditor?.getDataForUIAllLogos())[activeLogoIndex]
            : null;
          setActiveMeshLogo(newMeshLogo);
          setObjectWidth(newMeshLogo?.width);
          setObjectHeight(newMeshLogo?.height);
          dispatch(updatePreloaderStatus(false));
        }, 0);
      });
    });
  };

  const onPasteLogoMesh = (hash) => {
    const pasteObj = R2D.CopyPaste.objFromClipboard();
    if (!pasteObj) return;

    if (pasteObj.type == 'logoMesh') {
      currObj.logoEditor.pasteLogo(hash, pasteObj.value);
      const newMeshLogo = currObj
        ? Object.values(currObj.logoEditor?.getDataForUIAllLogos())[activeLogoIndex]
        : null;
      setActiveMeshLogo(newMeshLogo);
      setObjectWidth(newMeshLogo?.width);
      setObjectHeight(newMeshLogo?.height);
    } else if (pasteObj.type == 'material') {
      currObj.logoEditor
        .pasteTextureAsLogo(hash, pasteObj.value.id, pasteObj.value.addMaterial)
        .then(() => {
          const newMeshLogo = currObj
            ? Object.values(currObj.logoEditor?.getDataForUIAllLogos())[activeLogoIndex]
            : null;
          setActiveMeshLogo(newMeshLogo);
          setObjectWidth(newMeshLogo?.width);
          setObjectHeight(newMeshLogo?.height);
        });
    }
  };

  useEffect(() => {
    dispatch(
      showQuickPanel({
        name: 'helper_logo_mesh',
        position: {
          x: quickPanels.helper_model.position.x,
          y: quickPanels.helper_model.position.y,
        },
        data: activeLogoIndex,
      })
    );
    dispatch(removeQuickPanel({ name: 'helper_model' }));

    currObj.logoEditor.focusCamera(activeMeshLogoHash);

    setStyleAnimation({ transform: 'translateX(0%)' });
    planner.scene.addEventListener(planner.scene.LOGO_CHANGE_SIZE, onChangeLogoSize);

    setObjectWidth(activeMeshLogo?.width);
    setObjectHeight(activeMeshLogo?.height);

    return () => {
      R2D.LogoEditor.unfocusCamera();
      planner.scene.removeEventListener(planner.scene.LOGO_CHANGE_SIZE, onChangeLogoSize);
    };
  }, []);

  return (
    <div className={classes.planner_logoMesh_cont} ref={mainDiv} style={styleAnimation}>
      <Navigation
        breadcrumsTitle={currSceneObj?.objectData?.name}
        panelPreviewIcon={panelPreviewIcon}
        isAddSettingsDisabled={true}
        closeButtonStatus={props.closeButtonStatus}
      />

      <div className={classes.catalog_wr}>
        <SimpleBar style={{ height: '100%' }} autoHide={false} forceVisible="y">
          <div className={classes.planner_logoMesh_prod_item}>
            <div className={classes.planner_logoMesh_prod_item_img_wr}>
              <LogoComponent
                onCustomClick={onUploadLogoMesh}
                previewSrc={activeMeshLogo?.src}
                onCopyPaste={{ paste: onPasteLogoMesh, index: activeLogoIndex, statusCopy: true }}
              />
            </div>

            <div className={classes.plannerChangeSizesWrap}>
              <div className={classes.plannerChangeSizes}>
                <ChangeSize
                  additionalStyles={{ marginBottom: 10 }}
                  mouseDown={mouseDown}
                  valueChangeType={'width'}
                  changeValue={onChangeSize}
                  value={objectWidth}
                  label={translation['WIDTH']}
                />
                <ChangeSize
                  mouseDown={mouseDown}
                  valueChangeType={'height'}
                  changeValue={onChangeSize}
                  value={objectHeight}
                  label={translation['HEIGHT']}
                />
              </div>
              <div>
                <div className={classes.changeSizesLockWr}>
                  <div className={classes.changeSizesLockLine1}></div>
                  <div className={classes.changeSizesLockLine3}></div>

                  <LockSize lockState={lockState} right={'-7px'} top={'28px'} />
                </div>
              </div>
            </div>

            <div className={classes.planner_logoMesh_buttons}>
              <div onClick={onDeleteLogoMesh} className={classes.planner_logoMesh_button_delete}>
                <IconTrash size={16} color="#AF3131" />
                {translation['BUTTON_DELETE_PLAN']}
              </div>
            </div>
          </div>
        </SimpleBar>
      </div>
    </div>
  );
};

export default LogoEditor;
