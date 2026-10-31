import { createUseStyles } from 'react-jss';
import { useSelector } from 'react-redux';

import { selectPopups } from '../../redux/features/popups/popupsSlice';
import AlertPopup from './alert-popup';
import AlignerWidthSetMetricsPopup from './aligner-width-set-metrics-popup';
import AlignerWidthSetPopup from './aligner-width-set-popup';
import AuthForgotPasswordPopup from './auth-forgot-password-popup';
import AuthLoginPopup from './auth-login-popup';
import AuthRegistrationPopup from './auth-registration-popup';
import AutoSaveEnable from './auto-save-enable-popup';
import ChangeProjectName from './change-project-name';
import CompleteMessage from './complete-message';
import ConfirmPopup from './confirm-popup';
import CustomRegistrationPopup from './custom-registration-popup';
import DeleteAccountPopup from './delete-account-popup';
import DemoProjectsExample from './demo-projects-example';
import Export2DProjectPopup from './export-popup/export-2d-project-popup';
import Export3DProjectPopup from './export-popup/export-3d-project-popup';
import ExportPopup from './export-popup/export-popup';
import ImageUploadPopup from './image-upload-popup';
import LoadingMessagePopup from './loading-message';
import PayProPopup from './pay-pro-popup';
import ProfilePopup from './profile-popup';
import ProjectDataLoadPopup from './project-data-load-popup';
import ProjectSetNamePopup from './project-set-name-popup';
import RegistrationDonePopup from './registration-done-popup';
import RenderDone from './render-done';
import RenderExample from './renders-example/render-example';
import RendersSlider4k from './renders-example/slider/render-slider-4k';
import RendersSlider360 from './renders-example/slider/renders-slider-360';
import Revert3DRotation from './revert-3d-rotation';
import SaveBeforePopup from './save-before-popup';
import SetValueInput from './set-value-input';
import SharePopup from './share-popup';
import StartPopup from './start-popup';
import TipsPopup from './tips-popup';
import Tour360CreatePopup from './tour-360-create';
import UpdatePassword from './update-password';
import UpgradePlan from './upgrade-plan';
import UploadChoiceModelPopup from './upload-custom-popups/upload-choice-model-popup';
import UploadChoicePopup from './upload-custom-popups/upload-choice-popup';
import UploadCustomMaterialPopup from './upload-custom-popups/upload-custom-material-popup';
import UploadCustomModelAiPopup from './upload-custom-popups/upload-custom-model-ai-popup';
import UploadCustomModelPopup from './upload-custom-popups/upload-custom-model-popup';
import UploadModelAiInfoPopup from './upload-custom-popups/upload-model-ai-info-popup';
import UploadPlanPopup from './upload-custom-popups/upload-plan-popup';

const useStyle = createUseStyles({
  popups: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
  },
});

export default function PopupActions() {
  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';
  const activePopup = useSelector(selectPopups);
  const classes = useStyle();
  return (
    <div className={classes.popups}>
      {activePopup.login.status === true ? <AuthLoginPopup /> : null}
      {activePopup.registration.status === true ? <AuthRegistrationPopup /> : null}
      {activePopup.forgotPassword.status === true ? <AuthForgotPasswordPopup /> : null}
      {activePopup.profile.status === true ? <ProfilePopup /> : null}
      {activePopup.payPro.status === true ? <PayProPopup /> : null}
      {activePopup.setProjectName.status === true ? <ProjectSetNamePopup /> : null}
      {activePopup.confirm.status === true ? <ConfirmPopup /> : null}
      {activePopup.alert.status === true ? <AlertPopup /> : null}
      {activePopup.share.status === true ? <SharePopup /> : null}
      {activePopup.saveBefore.status === true ? <SaveBeforePopup /> : null}
      {activePopup.setValueInput.status === true ? <SetValueInput /> : null}
      {activePopup.completeMessage.status === true ? <CompleteMessage /> : null}
      {activePopup.loadingMessage.status === true ? <LoadingMessagePopup /> : null}
      {activePopup.imageUpload.status === true ? <ImageUploadPopup /> : null}
      {activePopup.alignerWidthSet.status === true ? <AlignerWidthSetPopup /> : null}
      {activePopup.alignerWidthSetMetrics.status === true ? <AlignerWidthSetMetricsPopup /> : null}
      {activePopup.renderExample_360.status === true ? (
        <RenderExample name="renderExample_360" analyticsEvent="click_gallery_360">
          <RendersSlider360 />
        </RenderExample>
      ) : null}
      {activePopup.renderExample_big.status === true ? (
        <RenderExample name="renderExample_big" analyticsEvent="click_gallery_render">
          <RendersSlider4k />
        </RenderExample>
      ) : null}
      {activePopup.renderExample_small.status === true ? (
        <RenderExample name="renderExample_small" analyticsEvent="click_gallery_render">
          <RendersSlider4k />
        </RenderExample>
      ) : null}
      {activePopup.renderMade.status === true ? <RenderDone /> : null}
      {activePopup.startPopup.status === true && !isCurrDeviceAPhone ? <StartPopup /> : null}
      {activePopup.revert3DRotationPopup.status === true ? <Revert3DRotation /> : null}
      {activePopup.customRegistrationPopup.status === true ? <CustomRegistrationPopup /> : null}
      {activePopup.registrationDonePopup.status === true ? <RegistrationDonePopup /> : null}
      {activePopup.updatePassword.status === true ? <UpdatePassword /> : null}
      {activePopup.upgradePlan.status === true ? <UpgradePlan /> : null}
      {activePopup.exportPopup.status === true ? <ExportPopup /> : null}
      {activePopup.uploadCustomModelPopup.status === true ? <UploadCustomModelPopup /> : null}
      {activePopup.uploadCustomMaterialPopup.status === true ? <UploadCustomMaterialPopup /> : null}
      {activePopup.export2DProjectPopup.status === true ? <Export2DProjectPopup /> : null}
      {activePopup.export3DProjectPopup.status === true ? <Export3DProjectPopup /> : null}
      {activePopup.tipsPopup.status === true ? <TipsPopup /> : null}
      {activePopup.renderExample4k.status === true ? (
        <RenderExample name="renderExample4k" analyticsEvent="click_gallery_render">
          <RendersSlider4k />
        </RenderExample>
      ) : null}
      {activePopup.tour360Create.status === true ? <Tour360CreatePopup /> : null}
      {activePopup.autoSaveEnable.status === true ? <AutoSaveEnable /> : null}
      {activePopup.projectDataLoadPopup.status === true ? <ProjectDataLoadPopup /> : null}
      {activePopup.changeProjectName.status === true ? <ChangeProjectName /> : null}
      {activePopup.uploadChoicePopup.status === true ? <UploadChoicePopup /> : null}
      {activePopup.uploadPlanPopup.status === true ? <UploadPlanPopup /> : null}
      {activePopup.uploadChoiceModelPopup.status === true ? (
        <UploadChoiceModelPopup key={'UploadChoiceModelPopup'} />
      ) : null}
      {activePopup.uploadModelAiInfoPopup.status === true ? (
        <UploadModelAiInfoPopup key={'UploadModelAiInfoPopup'} />
      ) : null}
      {activePopup.uploadCustomModelAiPopup.status === true ? <UploadCustomModelAiPopup /> : null}
      {activePopup.demoProjectsExample.status === true ? <DemoProjectsExample /> : null}
      {activePopup.deleteAccountPopup.status === true ? <DeleteAccountPopup /> : null}
    </div>
  );
}
