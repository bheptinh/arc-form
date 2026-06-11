// TODO: remove this slice — languageChange catalog/controlPanel side-effects should move
//       to useLanguageChange hook once call sites are converted to use the mutation directly.
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { languagesQueryOptions, setLanguage, translationQueryOptions } from '../../../api/i18n';
import { queryClient } from '../../../api/queryClient';
import { planner, user } from '../../../initR2D';
import {
  controlPanelHistoryClear,
  controlPanelHistoryDataUpdate,
  controlPanelUpdateBreadCrumbs,
} from '../control/controlPanelSlice';

export const languageChange = createAsyncThunk(
  'language/languageChange',
  async (code: string, thunkAPI) => {
    await setLanguage(code);
    queryClient.invalidateQueries({ queryKey: languagesQueryOptions.queryKey });
    await queryClient.invalidateQueries({ queryKey: translationQueryOptions.queryKey });

    const catalogMaterials = await user.loadRightPanelData(R2D.URL.CATALOG_MATERIALS_TREE_FOR_MODELS);
    planner.setCatalogMaterials(catalogMaterials);

    const catalogTree = await user.loadRightPanelData(R2D.URL.CATALOG_TREE);
    planner.setCatalogProducts(catalogTree.tree);

    const panorams = await user.loadPano();
    planner.setPanorams(panorams);

    thunkAPI.dispatch(controlPanelUpdateBreadCrumbs({ updateType: 'clear', forMode: 'furniture' }));
    thunkAPI.dispatch(controlPanelUpdateBreadCrumbs({ updateType: 'clear', forMode: 'decor' }));
    thunkAPI.dispatch(controlPanelHistoryClear({ forMode: 'furniture' }));
    thunkAPI.dispatch(controlPanelHistoryClear({ forMode: 'decor' }));

    const furnitureData = planner.getCatalogProducts();
    thunkAPI.dispatch(
      controlPanelHistoryDataUpdate({
        forMode: 'furniture',
        data: { type: 'catalog', addType: 'main', lastSavedScroll: 0, id: null, data: furnitureData, isAdded: false },
      })
    );
    thunkAPI.dispatch(
      controlPanelHistoryDataUpdate({
        forMode: 'decor',
        data: { type: 'catalog', addType: 'main', lastSavedScroll: 0, id: null, data: planner.getCatalogMaterials().materials, isAdded: false },
      })
    );
  }
);

export const languageSlice = createSlice({
  name: 'language',
  initialState: {},
  reducers: {},
});

export default languageSlice.reducer;
