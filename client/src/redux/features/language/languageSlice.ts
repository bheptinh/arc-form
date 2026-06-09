import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { planner, user } from '../../../initR2D';
import {
  controlPanelHistoryClear,
  controlPanelHistoryDataUpdate,
  controlPanelUpdateBreadCrumbs,
} from '../control/controlPanelSlice';

export const languagesInit = createAsyncThunk('language/languagesInit', async (thunkAPI) => {
  return await user.loadLanguages();
});

export const translationInit = createAsyncThunk('language/translationInit', async (thunkAPI) => {
  const translation = await user.loadTranslation();
  const updatedTranslation = {};
  for (const i in translation) {
    updatedTranslation[i.toUpperCase()] = translation[i];
  }
  return updatedTranslation;
});

export const languageChange = createAsyncThunk(
  'language/languageChange',
  async (code, thunkAPI) => {
    const languages = await user.setLanguageCode(thunkAPI.getState().language.languages, code);
    const translation = await user.loadTranslation();

    const updatedTranslation = {};
    for (const i in translation) {
      updatedTranslation[i.toUpperCase()] = translation[i];
    }

    const catalogMaterialsArray = await user.loadRightPanelData(
      R2D.URL.CATALOG_MATERIALS_TREE_FOR_MODELS
    );
    planner.setCatalogMaterials(catalogMaterialsArray);

    const start2D3DData = await user.loadRightPanelData(R2D.URL.CATALOG_TREE);
    planner.setCatalogProducts(start2D3DData.tree);

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
        data: {
          type: 'catalog',
          addType: 'main',
          lastSavedScroll: 0,
          id: null,
          data: furnitureData,
          isAdded: false,
        },
      })
    );
    thunkAPI.dispatch(
      controlPanelHistoryDataUpdate({
        forMode: 'decor',
        data: {
          type: 'catalog',
          addType: 'main',
          lastSavedScroll: 0,
          id: null,
          data: planner.getCatalogMaterials().materials,
          isAdded: false,
        },
      })
    );
    return { languages, translation: updatedTranslation };
  }
);

export const languageSlice = createSlice({
  name: 'language',
  initialState: { translation: {}, languages: [] },
  extraReducers: (builder) => {
    builder.addCase(languagesInit.fulfilled, (state, action) => {
      state.languages = action.payload;
    });
    builder.addCase(translationInit.fulfilled, (state, action) => {
      state.translation = action.payload;
    });
    builder.addCase(languageChange.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

export const selectLanguages = (state) => state.language.languages;
export const selectTranslation = (state) => state.language.translation;

export default languageSlice.reducer;
