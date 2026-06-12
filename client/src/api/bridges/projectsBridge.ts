import { planner } from '../../initR2D';
import { queryClient } from '../queryClient';
import { projectsInfiniteQueryOptions } from '../projects';

export function setupProjectsBridge() {
  planner.scene.addEventListener(planner.scene.PROJECTS_UPDATE, () => {
    queryClient.invalidateQueries({ queryKey: projectsInfiniteQueryOptions.queryKey });
  });
}
