import type { PlanFeature } from './plan-features.js';

export interface User {
  id: string;
  key: string; // TODO: DELETE — alias for id, kept for legacy R2D engine compatibility
  email: string;
  name: string;
  plan: string;
  language_code: string;
  tips: Record<string, unknown>;
  projectCount: number;
  autoSave: boolean;
  maxProjects: number;
  credits: number;
  render: boolean;
  price: number;
  userPlanExpire: string;
  userPlanRecurringId: string | null;
  userPlanPeriod: number;
  subscriptionNews: boolean;
  userPlanFeatures: PlanFeature[];
}
