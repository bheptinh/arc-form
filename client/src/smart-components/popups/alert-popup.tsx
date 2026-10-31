import { useDispatch, useSelector } from 'react-redux';

import { useTranslation } from '../../api/hooks/useTranslation';
import { user } from '../../initR2D';
import {
  closeActivePopup,
  selectPopups,
  setActivePopup,
} from '../../redux/features/popups/popupsSlice';
import ActionModal from '../../shared-components/modals/action';

export default function AlertPopup() {
  const dispatch = useDispatch();
  const translation = useTranslation();
  const popups = useSelector(selectPopups);

  const alertText = popups.alert.data?.id || popups.alert.data;
  const alertType = popups.alert.type;

  const onClickOK = () => {
    dispatch(closeActivePopup({ name: 'alert' }));

    if (alertType == 'not_enough_credits') {
      dispatch(setActivePopup({ name: 'buyCredits' }));
    }

    if (alertType == 'saveAndUpgradeProjectToUsePro') {
      const allPremiumPlanOfSceneObjectsSet = new Set();
      const allElemsWithOwnerSet = new Set();

      Object.values(R2D.Pool._products_data).forEach((i) => {
        if (Array.isArray(i.plan)) {
          allPremiumPlanOfSceneObjectsSet.add(i.plan[0]);
        }
        if (i.isOwner) {
          allElemsWithOwnerSet.add(i.type);
        }
      });

      const allPremiumPlanOfSceneObjects = Array.from(allPremiumPlanOfSceneObjectsSet);
      const allElemsWithOwner = Array.from(allElemsWithOwnerSet);

      const isThereObjectsWithOwnerThatDontMatchUserPremiumPlan =
        allElemsWithOwner.length > 0 &&
        (user.data.plan == 'free' ||
          (user.data.plan == 'basic' && allElemsWithOwner.find((i) => i == R2D.ProductType.MODEL)));

      const isTherePremiumObjectThatDontMatchUserPremiumPlan =
        allPremiumPlanOfSceneObjects.length > 0 &&
        (user.data.plan == 'free' ||
          (user.data.plan == 'basic' && allPremiumPlanOfSceneObjects.find((i) => i == 'pro')));

      const neededPlan =
        allPremiumPlanOfSceneObjects.find((i) => i == 'pro') ||
        allElemsWithOwner.find((i) => i == R2D.ProductType.MODEL)
          ? 'pro'
          : allPremiumPlanOfSceneObjects.find((i) => i == 'basic') || allElemsWithOwner.length > 0
            ? 'basic'
            : 'free';

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
