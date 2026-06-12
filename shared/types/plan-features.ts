export const PlanFeature = {
  WallEditor: 'wall_editor',
  Plinth: 'plintus',
  PrivateMaterial: 'private_material',
} as const;

export type PlanFeature = typeof PlanFeature[keyof typeof PlanFeature];
