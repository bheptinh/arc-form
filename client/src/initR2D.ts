import { R2D, GEOM, TR } from './vendor/r2d';

export const user = new R2D.UserCore();
export const planner = new R2D.PlannerCore(user);
export { GEOM, TR };
