import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { planner } from '../../../initR2D';

export const changeUndoRedo = createAsyncThunk('top/changeUndoRedo', (data, thunkAPI) => {
  const activeViewMode = thunkAPI.getState().viewMode_new.active;
  const sceneHistory = { ...thunkAPI.getState().topPanel.scene };
  const constrHistory = { ...thunkAPI.getState().topPanel.constr };
  const tileConfigHistory = { ...thunkAPI.getState().topPanel.tileConfig };

  if (activeViewMode == 'constr') {
    constrHistory.canUndo = planner.constr.canUndo();
    constrHistory.canRedo = planner.constr.canRedo();
  } else if (activeViewMode == 'tileConfig') {
    const tileEditor = planner.scene.getConfigurator().getTileEditor();
    tileConfigHistory.canUndo = tileEditor.history.canUndo();
    tileConfigHistory.canRedo = tileEditor.history.canRedo();
  } else {
    sceneHistory.canUndo = planner.scene.canUndo();
    sceneHistory.canRedo = planner.scene.canRedo();
  }

  return {
    ...thunkAPI.getState().topPanel,
    scene: sceneHistory,
    constr: constrHistory,
    tileConfig: tileConfigHistory,
  };
});

const topPanelSlice = createSlice({
  name: 'topPanel',
  initialState: {
    constr: { canUndo: false, canRedo: false },
    scene: { canUndo: false, canRedo: false },
    tileConfig: { canUndo: false, canRedo: false },
  },
  reducers: {
    changeUndoRedoConstr: (state, action) => {
      state.constr = action.payload;
    },
    changeUndoRedoScene: (state, action) => {
      state.scene = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(changeUndoRedo.fulfilled, (state, action) => {
      return action.payload;
    });
  },
});

export const selectIsUndoRedoConstr = (state) => state.topPanel.constr;
export const selectIsUndoRedoScene = (state) => state.topPanel.scene;
export const selectIsUndoRedoTileConfig = (state) => state.topPanel.tileConfig;

export const { changeUndoRedoConstr, changeUndoRedoScene } = topPanelSlice.actions;

export default topPanelSlice.reducer;
