import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { planner } from '../../../init';

export const changeUndoRedo = createAsyncThunk(
  'top/changeUndoRedo',
  (data, thunkAPI) => {
    let activeViewMode = thunkAPI.getState().viewMode_new.active;
    let sceneHistory = {...thunkAPI.getState().topPanel.scene};
    let constrHistory = {...thunkAPI.getState().topPanel.constr};
    let tileConfigHistory = {...thunkAPI.getState().topPanel.tileConfig};

    if(activeViewMode == "constr") {
      constrHistory.canUndo = planner.constr.canUndo();
      constrHistory.canRedo = planner.constr.canRedo();
    } 
    else if(activeViewMode == "tileConfig") {
        let tileEditor = planner.scene.getConfigurator().getTileEditor();
        tileConfigHistory.canUndo = tileEditor.history.canUndo();
        tileConfigHistory.canRedo = tileEditor.history.canRedo();
    }
    else {
        sceneHistory.canUndo = planner.scene.canUndo();
        sceneHistory.canRedo = planner.scene.canRedo();
    }
    
    return {...thunkAPI.getState().topPanel, scene: sceneHistory, constr: constrHistory, tileConfig: tileConfigHistory};
  }
)

export const topPanelSlice = createSlice({
  name: 'topPanel',
  initialState: { constr: {canUndo: false, canRedo: false}, scene: {canUndo: false, canRedo: false}, tileConfig: {canUndo: false, canRedo: false}},
  reducers: {
    changeUndoRedoConstr: (state, action) => {
      state.constr = action.payload;
    },
    changeUndoRedoScene: (state, action) => {
        state.scene = action.payload;
    },
    changeUndoRedoTileConfig: (state, action) => {
      state.tileConfig = action.payload;
    }
  },
  extraReducers: builder => {
    builder.addCase(changeUndoRedo.fulfilled, (state, action) => {
      return action.payload;
    });
  },
})

export const selectIsUndoRedoConstr = state => state.topPanel.constr;
export const selectIsUndoRedoScene = state => state.topPanel.scene;
export const selectIsUndoRedoTileConfig = state => state.topPanel.tileConfig;

export const { changeUndoRedoConstr, changeUndoRedoScene, changeUndoRedoTileConfig } = topPanelSlice.actions; 

export default topPanelSlice.reducer;