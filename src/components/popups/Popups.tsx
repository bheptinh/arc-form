import React from 'react';
import { useSelector } from 'react-redux';
import {createUseStyles} from "react-jss";

import { selectPopups } from '../../redux/features/popups/popupsSlice';

import RegistrationPopup from './RegistrationPopup';
import LoginPopup from './LoginPopup';
import ForgotPassPopup from './ForgotPassPopup';
import ProfilePopup from './ProfilePopup';
import PayProPopup from './PayProPopup';
import SetProjectNamePopup from './SetProjectNamePopup';
import ConfirmPopup from './ConfirmPopup';
import AlertPopup from './AlertPopup';
import SharePopup from './SharePopup'
import SaveBeforePopup from './SaveBeforePopup';
import SetValueInput from './SetValueInput';
import CompleteMessage from './CompleteMessage';
import LoadingMessagePopup from './LoadingMessage';
import ImageUploadPopup from './ImageUploadPopup';
import AlignerWidthSetMetricsPopup from './AlignerWidthSetMetricsPopup';
import AlignerWidthSetPopup from './AlignerWidthSetPopup';
import BuyCredits from './BuyCredits';
import RenderExample360 from './rendersExample/RenderExample360';
import RenderExampleBig from './rendersExample/RenderExampleBig';
import RenderExampleSmall from './rendersExample/RenderExampleSmall';
import RenderDone from './RenderDone';
import StartPopup from './StartPopup';
import Revert3DRotation from './Revert3DRotation';
import CustomRegistrationPopup from './CustomRegistrationPopup';
import RegistrationDonePopup from './RegistrationDonePopup';
import UpdatePassword from './UpdatePassword';
import UpgradePlan from './UpgradePlan';
import ExportPopup from './exportPopup/ExportPopup';
import Export2DProjectPopup from './exportPopup/Export2DProjectPopup';
import Export3DProjectPopup from './exportPopup/Export3DProjectPopup';
import TipsPopup from './TipsPopup';
import RenderExample4k from './rendersExample/RenderExample4k';
import Tour360CreatePopup from './Tour360Create';
import AutoSaveEnable from './AutoSaveEnablePopup';
import ProjectDataLoadPopup from './ProjectDataLoadPopup';
import ProjectsPopup from "./ProjectsPopup";
import ChangeProjectName from "./ChangeProjectName";
import RendersAnd360Popup from "./RendersAnd360Popup";
import UploadCustomMaterialPopup from './UploadCustomPopups/UploadCustomMaterialPopup';
import UploadCustomModelPopup from './UploadCustomPopups/UploadCustomModelPopup';
import UploadPlanPopup from "./UploadCustomPopups/UploadPlanPopup";
import UploadChoiceModelPopup from "./UploadCustomPopups/UploadChoiceModelPopup";
import UploadModelAiInfoPopup from "./UploadCustomPopups/UploadModelAiInfoPopup";
import UploadCustomModelAiPopup from "./UploadCustomPopups/UploadCustomModelAiPopup";
import UploadChoicePopup from "./UploadCustomPopups/UploadChoicePopup";
import DemoProjectsExample from './DemoProjectsExample';
import DeleteAccountPopup from './DeleteAccountPopup';

const useStyle = createUseStyles({
    popups: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
    }
});

const Popups = props => {
    let currOS = R2D.controller.getCurrentOS();
    let isCurrDeviceAPhone = currOS == "iOS" || currOS == "Android";
    let activePopup = useSelector(selectPopups);
    const classes = useStyle();
    return (
        <div className={classes.popups}>
            { activePopup.login.status === true ? <LoginPopup /> : null }
            { activePopup.registration.status === true ? <RegistrationPopup /> : null }
            { activePopup.forgotPassword.status === true ? <ForgotPassPopup /> : null }
            { activePopup.profile.status === true ? <ProfilePopup /> : null }
            { activePopup.payPro.status === true ? <PayProPopup /> : null }
            { activePopup.setProjectName.status === true ? <SetProjectNamePopup /> : null }
            { activePopup.confirm.status === true ? <ConfirmPopup /> : null }
            { activePopup.alert.status === true ? <AlertPopup /> : null }
            { activePopup.share.status === true ? <SharePopup /> : null }
            { activePopup.saveBefore.status === true ? <SaveBeforePopup /> : null }
            { activePopup.setValueInput.status === true ? <SetValueInput /> : null }
            { activePopup.completeMessage.status === true ? <CompleteMessage /> : null }
            { activePopup.loadingMessage.status === true ? <LoadingMessagePopup /> : null }
            { activePopup.imageUpload.status === true ? <ImageUploadPopup /> : null }
            { activePopup.alignerWidthSet.status === true ? <AlignerWidthSetPopup /> : null }
            { activePopup.alignerWidthSetMetrics.status === true ? <AlignerWidthSetMetricsPopup /> : null }
            { activePopup.buyCredits.status === true ? <BuyCredits /> : null }
            { activePopup.renderExample_360.status === true ? <RenderExample360 /> : null }
            { activePopup.renderExample_big.status === true ? <RenderExampleBig /> : null }
            { activePopup.renderExample_small.status === true ? <RenderExampleSmall /> : null }
            { activePopup.renderMade.status === true ? <RenderDone /> : null }
            { activePopup.startPopup.status === true && !isCurrDeviceAPhone ? <StartPopup/> : null }
            { activePopup.revert3DRotationPopup.status === true ? <Revert3DRotation/> : null }
            { activePopup.customRegistrationPopup.status === true ? <CustomRegistrationPopup/> : null }
            { activePopup.registrationDonePopup.status === true ? <RegistrationDonePopup/> : null }
            { activePopup.updatePassword.status === true ? <UpdatePassword/> : null }
            { activePopup.upgradePlan.status === true ? <UpgradePlan/> : null }
            { activePopup.exportPopup.status === true ? <ExportPopup/> : null }
            { activePopup.uploadCustomModelPopup.status === true ? <UploadCustomModelPopup/> : null }
            { activePopup.uploadCustomMaterialPopup.status === true ? <UploadCustomMaterialPopup /> : null }
            { activePopup.export2DProjectPopup.status === true ? <Export2DProjectPopup/> : null }
            { activePopup.export3DProjectPopup.status === true ? <Export3DProjectPopup/> : null }
            { activePopup.tipsPopup.status === true ? <TipsPopup/> : null }
            { activePopup.renderExample4k.status === true ? <RenderExample4k/> : null }
            { activePopup.tour360Create.status === true ? <Tour360CreatePopup/> : null }
            { activePopup.autoSaveEnable.status === true ? <AutoSaveEnable/> : null }
            { activePopup.projectDataLoadPopup.status === true ? <ProjectDataLoadPopup/> : null }
            { activePopup.projectsPopup.status === true ? <ProjectsPopup/> : null }
            { activePopup.changeProjectName.status === true ? <ChangeProjectName /> : null }
            { activePopup.rendersAnd360Popup.status === true ? <RendersAnd360Popup /> : null }
            { activePopup.uploadChoicePopup.status === true ? <UploadChoicePopup/> : null }
            { activePopup.uploadPlanPopup.status === true ? <UploadPlanPopup/> : null }
            { activePopup.uploadChoiceModelPopup.status === true ? <UploadChoiceModelPopup key={'UploadChoiceModelPopup'}/> : null }
            { activePopup.uploadModelAiInfoPopup.status === true ? <UploadModelAiInfoPopup key={'UploadModelAiInfoPopup'}/> : null }
            { activePopup.uploadCustomModelAiPopup.status === true ? <UploadCustomModelAiPopup/> : null }
            { activePopup.demoProjectsExample.status === true ? <DemoProjectsExample/> : null  }
            { activePopup.deleteAccountPopup.status === true ? <DeleteAccountPopup/> : null  }
        </div>
    )
}

export default Popups;
