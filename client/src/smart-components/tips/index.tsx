import { type ReactNode, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import Tip from '../../components/tips/Tip';
import { planner } from '../../initR2D';
import { selectDynamicPanelStatus } from '../../redux/features/control/controlPanelSlice';
import { selectTips } from '../../redux/features/tips/tipsSlice';
import { selectUserProfileData } from '../../redux/features/user/userSlice';

type TipsProps = {
  showTipUseTab?: {
    status: boolean;
    position: { x: number; y: number };
    isEnterTipActive: boolean;
  };
  showTipUseEnter?: { status: boolean; position: { x: number; y: number } };
};

export default function Tips(props: TipsProps) {
  const dynamicPanelStatus = useSelector(selectDynamicPanelStatus);
  const userProfileData = useSelector(selectUserProfileData);
  const tips = useSelector(selectTips);

  const [showTipChangeWallHeight, setTipChangeWallHeight] = useState(false);
  const [showTipUploadCustomMat, setTipUploadCustomMat] = useState(false);
  const [showTipMergeGroupButton, setShowTipMergeGroupButton] = useState(false);
  const [showTipPanorams, setShowTipPanorams] = useState(false);
  const [showTipRenderMake, setShowTipRenderMake] = useState(false);
  const [showTipSelectGroup, setTipSelectGroup] = useState(false);

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  useEffect(() => {
    function customUploadListener() {
      if (userProfileData?.tips && userProfileData.tips != 0) {
        setTimeout(function () {
          if (!tips.uploadCustomMat.showed) {
            setTipUploadCustomMat(true);
          }
        }, 100);
      }
    }
    function tipMergeGroupButtonListener() {
      if (userProfileData?.tips && userProfileData.tips != 0) {
        setTimeout(function () {
          if (!tips.mergeGroupButton.showed) {
            setShowTipMergeGroupButton(true);
          }
        }, 100);
      }
    }
    function tipPanoramsListener() {
      if (userProfileData?.tips && userProfileData.tips != 0) {
        setTimeout(function () {
          if (!tips.panorams.showed) {
            setShowTipPanorams(true);
          }
        }, 100);
      }
    }
    function tipRenderMakeListener() {
      if (userProfileData?.tips && userProfileData.tips != 0) {
        setTimeout(function () {
          if (!tips.tipRenderMake.showed) {
            setShowTipRenderMake(true);
          }
        }, 100);
      }
    }
    function changeMIHStateListener(e: any) {
      if (userProfileData?.tips && userProfileData.tips != 0) {
        const mih = planner.mih();
        setTimeout(function () {
          if (
            !tips.selectGroup.showed &&
            e.newState == mih.stateMain &&
            e.oldState == mih.stateDraggingProdFromCatalog
          ) {
            const sceneObjs = R2D.scene.getSceneObjects();
            let num = 0;
            for (let i = 0; i < sceneObjs.length; i++) {
              if (R2D.ObjectViewer3DGroup.validSceneObject(sceneObjs[i])) num++;
              if (num >= 3) break;
            }

            if (num >= 3) setTipSelectGroup(true);
          }
        }, 100);

        if (e.newState == mih.stateMain)
          planner.apiScene.dispatchEvent(new Event(planner.apiScene.TIPS_SAVE_PROJECT, {}));
      }
    }

    planner
      .mih()
      .addEventListener(R2D.MouseInteractionHelper.STATE_CHANGED, changeMIHStateListener);
    planner.scene.addEventListener(planner.scene.TIPS_UPLOAD_CUSTOM_MAT, customUploadListener);
    planner.scene.addEventListener(
      planner.scene.TIPS_MERGE_GROUP_BUTTON,
      tipMergeGroupButtonListener
    );
    planner.scene.addEventListener(planner.scene.TIPS_PANORAMS, tipPanoramsListener);
    planner.scene.addEventListener(planner.scene.TIPS_RENDER_MAKE, tipRenderMakeListener);

    return () => {
      planner
        .mih()
        .removeEventListener(R2D.MouseInteractionHelper.STATE_CHANGED, changeMIHStateListener);
      planner.scene.removeEventListener(planner.scene.TIPS_UPLOAD_CUSTOM_MAT, customUploadListener);
      planner.scene.removeEventListener(
        planner.scene.TIPS_MERGE_GROUP_BUTTON,
        tipMergeGroupButtonListener
      );
      planner.scene.removeEventListener(planner.scene.TIPS_PANORAMS, tipPanoramsListener);
      planner.scene.removeEventListener(planner.scene.TIPS_RENDER_MAKE, tipRenderMakeListener);
    };
  }, [userProfileData, tips]);

  useEffect(() => {
    function changeConstructorStateListener() {
      if (userProfileData?.tips && userProfileData.tips != 0) {
        setTimeout(function () {
          if (
            WC.core.roomPoints.length > 0 &&
            R2D.viewConstructor.state == R2D.viewConstructor.stateEditing &&
            (R2D.viewConstructor.prevState == R2D.viewConstructor.stateMakingRoom ||
              R2D.viewConstructor.prevState == R2D.viewConstructor.stateMakingWalls ||
              R2D.viewConstructor.prevState == R2D.viewConstructor.stateMakingRect)
          ) {
            setTipChangeWallHeight(true);
          }
        }, 200);
      }

      if (R2D.viewConstructor.state == R2D.viewConstructor.stateEditing) {
        planner.apiScene.dispatchEvent(new Event(planner.apiScene.TIPS_SAVE_PROJECT, {}));
      }
    }

    R2D.viewConstructor.addEventListener(WC.EDITOR_CHANGE_STATE, changeConstructorStateListener);

    return () =>
      R2D.viewConstructor.removeEventListener(
        WC.EDITOR_CHANGE_STATE,
        changeConstructorStateListener
      );
  }, [userProfileData]);

  const tipsToShow = [] as ReactNode[];

  if (
    dynamicPanelStatus &&
    userProfileData?.tips &&
    userProfileData.tips != 0 &&
    !tips.constructorButtons.showed &&
    !isCurrDeviceAPhone &&
    tips.constructorButtons.status
  ) {
    tipsToShow.push(
      <Tip
        key="TUT_FROM_SCRATCH"
        name="constructorButtons"
        showTime={500}
        arrow={{ position: 'top', direction: 'left' }}
        text={'TUT_FROM_SCRATCH'}
        position={{ x: 370, y: 135, from: 'left' }}
      />
    );
    tipsToShow.push(
      <Tip
        key="TUT_UPLOAD_FLOORPLAN"
        name="constructorButtons"
        showTime={1000}
        arrow={{ position: 'bottom', direction: 'left' }}
        text={'TUT_UPLOAD_FLOORPLAN'}
        position={{ x: 370, y: 438, from: 'left' }}
      />
    );
  }

  if (showTipSelectGroup && !tips.selectGroup.showed && !isCurrDeviceAPhone) {
    tipsToShow.push(
      <Tip
        key="TUT_CREATE_GROUP"
        name={'selectGroup'}
        showTime={1000}
        arrow={{}}
        text={'TUT_CREATE_GROUP'}
        position={{ x: '50%', y: '50%', from: 'left' }}
      />
    );
  }

  if (showTipChangeWallHeight && !tips.changeWallHeight.showed && !isCurrDeviceAPhone) {
    tipsToShow.push(
      <Tip
        key="TUT_CHANGE_WALLS_HEIGHT"
        name={'changeWallHeight'}
        showTime={1000}
        arrow={{ position: 'top', direction: 'left' }}
        text={'TUT_CHANGE_WALLS_HEIGHT'}
        position={{ x: 370, y: 68, from: 'left' }}
      />
    );
  }

  if (showTipUploadCustomMat && !tips.uploadCustomMat.showed && !isCurrDeviceAPhone) {
    tipsToShow.push(
      <Tip
        key="TUT_UPLOAD_MATERIAL"
        name={'uploadCustomMat'}
        showTime={1000}
        arrow={{ position: 'top', direction: 'left' }}
        text={'TUT_UPLOAD_MATERIAL'}
        position={{ x: 370, y: 135, from: 'left' }}
      />
    );
  }

  if (props.showTipUseTab?.status && !tips.tipUseTab.showed && !isCurrDeviceAPhone) {
    tipsToShow.push(
      <Tip
        key="TUT_USE_TAB"
        name={'tipUseTab'}
        showTime={100}
        arrow={
          props.showTipUseTab.isEnterTipActive
            ? { position: 'right', direction: 'top', size: 'small' }
            : { position: 'left', direction: 'bottom', size: 'small' }
        }
        text={'TUT_USE_TAB'}
        isEnterTipActive={props.showTipUseTab.isEnterTipActive}
        position={{
          x: props.showTipUseTab.position.x,
          y: props.showTipUseTab.position.y,
          from: 'left',
        }}
      />
    );
  }

  if (props.showTipUseEnter?.status && !tips.tipUseEnter.showed && !isCurrDeviceAPhone) {
    tipsToShow.push(
      <Tip
        key="TUT_USE_ENTER"
        name={'tipUseEnter'}
        showTime={100}
        arrow={{ position: 'left', direction: 'bottom', size: 'small' }}
        text={'TUT_USE_ENTER'}
        position={{
          x: props.showTipUseEnter.position.x,
          y: props.showTipUseEnter.position.y,
          from: 'left',
        }}
      />
    );
  }

  if (showTipMergeGroupButton && !tips.mergeGroupButton.showed && !isCurrDeviceAPhone) {
    tipsToShow.push(
      <Tip
        key="TUT_MERGE_GROUP"
        name={'mergeGroupButton'}
        showTime={1000}
        arrow={{ position: 'top', direction: 'left' }}
        text={'TUT_MERGE_GROUP'}
        position={{ x: 370, y: 147, from: 'left' }}
      />
    );
  }

  if (showTipPanorams && !tips.panorams.showed && !isCurrDeviceAPhone) {
    tipsToShow.push(
      <Tip
        key="TUT_CHANGE_PANORAMA"
        name={'panorams'}
        showTime={1000}
        arrow={{ position: 'top', direction: 'left' }}
        text={'TUT_CHANGE_PANORAMA'}
        position={{ x: 370, y: 116, from: 'left' }}
      />
    );
  }

  if (showTipRenderMake && !tips.tipRenderMake.showed && !isCurrDeviceAPhone) {
    tipsToShow.push(
      <Tip
        key="TUT_RENDER_MAKE"
        name={'tipRenderMake'}
        showTime={1000}
        arrow={{ position: 'top', direction: 'left' }}
        text={'TUT_RENDER_MAKE'}
        position={{ x: 330, y: 133, from: 'left' }}
      />
    );
  }

  return tipsToShow;
}
