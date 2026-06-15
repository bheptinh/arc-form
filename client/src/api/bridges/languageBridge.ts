import {
  controlPanelHistoryClear,
  controlPanelHistoryDataUpdate,
  controlPanelUpdateBreadCrumbs,
} from '../../redux/features/control/controlPanelSlice';
import { planner, user } from '../../initR2D';
import { store } from '../../redux/store';
import { materialsNavQueryOptions } from '../catalog';
import { translationQueryOptions } from '../i18n';
import { queryClient } from '../queryClient';

let prevTranslationData: unknown = undefined;

export function setupLanguageBridge() {
  prevTranslationData = queryClient.getQueryData(translationQueryOptions.queryKey);

  queryClient.getQueryCache().subscribe((event) => {
    if (
      event.type === 'updated' &&
      (event.action as { type: string }).type === 'success' &&
      event.query.queryKey[0] === 'translation'
    ) {
      const next = queryClient.getQueryData(translationQueryOptions.queryKey);
      if (next === prevTranslationData) return;
      prevTranslationData = next;
      reloadCatalog();
    }
  });
}

async function reloadCatalog() {
  const dispatch = store.dispatch;

  const tree = await user.loadRightPanelData(R2D.URL.CATALOG_TREE);
  planner.setCatalogProducts(tree.tree);

  const panorams = await user.loadPano();
  planner.setPanorams(panorams);

  dispatch(controlPanelUpdateBreadCrumbs({ updateType: 'clear', forMode: 'furniture' }));
  dispatch(controlPanelUpdateBreadCrumbs({ updateType: 'clear', forMode: 'decor' }));
  dispatch(controlPanelHistoryClear({ forMode: 'furniture' }));
  dispatch(controlPanelHistoryClear({ forMode: 'decor' }));

  dispatch(
    controlPanelHistoryDataUpdate({
      forMode: 'furniture',
      data: {
        type: 'catalog',
        addType: 'main',
        lastSavedScroll: 0,
        id: null,
        data: planner.getCatalogProducts(),
        isAdded: false,
      },
    })
  );
  dispatch(
    controlPanelHistoryDataUpdate({
      forMode: 'decor',
      data: {
        type: 'catalog',
        addType: 'main',
        lastSavedScroll: 0,
        id: null,
        data: queryClient.getQueryData(materialsNavQueryOptions.queryKey) ?? [],
        isAdded: false,
      },
    })
  );
}
