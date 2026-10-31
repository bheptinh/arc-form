import { user } from '../initR2D';

export const getScenePlanRequirements = () => {
  const premiumPlans = new Set();
  const ownedTypes = new Set();

  (Object.values(R2D.Pool._products_data) as any[]).forEach((i) => {
    if (Array.isArray(i.plan)) {
      premiumPlans.add(i.plan[0]);
    }
    if (i.isOwner) {
      ownedTypes.add(i.type);
    }
  });

  const allPremiumPlanOfSceneObjects = Array.from(premiumPlans);
  const allElemsWithOwner = Array.from(ownedTypes);

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

  return {
    isThereObjectsWithOwnerThatDontMatchUserPremiumPlan,
    isTherePremiumObjectThatDontMatchUserPremiumPlan,
    neededPlan,
  };
};
