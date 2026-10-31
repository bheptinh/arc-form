import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { user } from '../../initR2D';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import ActionModal from '../../shared-components/modals/action';
import { getScenePlanRequirements } from '../../utils/getScenePlanRequirements';

export default function AlertPopup() {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);

  const alertText = popups.alert.data?.id || popups.alert.data;
  const alertType = popups.alert.type;

  const onClickOK = () => {
    dispatch(closeActivePopup({ name: 'alert' }));

    if (alertType == 'saveAndUpgradeProjectToUsePro') {
      const {
        isThereObjectsWithOwnerThatDontMatchUserPremiumPlan,
        isTherePremiumObjectThatDontMatchUserPremiumPlan,
        neededPlan,
      } = getScenePlanRequirements();

      if (user.data.maxProjects > 0 && user.data.projectCount >= user.data.maxProjects)
        dispatch(
          setActivePopup({
            name: 'upgradePlan',
            type: 'upgradeOverLimit',
            addData: { plan: neededPlan },
          })
        );
      else {
        if (
          isTherePremiumObjectThatDontMatchUserPremiumPlan ||
          isThereObjectsWithOwnerThatDontMatchUserPremiumPlan
        ) {
          dispatch(
            setActivePopup({
              name: 'upgradePlan',
              type: 'createNewPremiumProject',
              addData: { plan: neededPlan },
            })
          );
        } else {
          dispatch(setActivePopup({ name: 'setProjectName', type: 'create' }));
        }
      }
    }
  };

  return (
    <ActionModal
      content={
        translation[alertText?.toUpperCase()] || alertText || translation['TEXT_ERROR_LOAD_DATA']
      }
      onConfirm={onClickOK}
    />
  );
}
