import { R2D } from './vendor/r2d';

export const user = new R2D.UserCore();
export const planner = new R2D.PlannerCore(user);
