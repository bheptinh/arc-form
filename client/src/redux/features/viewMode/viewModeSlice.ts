import { createSlice } from '@reduxjs/toolkit';

import { planner } from '../../../initR2D';

const viewModeNewSlice = createSlice({
  name: 'viewMode_new',
  initialState: {
    active: 'constr',
    prevActive: '',
    prevActive3d: '',
  },
  reducers: {
    setActiveViewMode: (state, action) => {
      let newMode = action.payload;

      if (state.active == newMode) return;

      if (planner.scene.getCurrentSceneObject()) {
        planner.mih()._scene.savedCurrentSceneObject = planner.mih()._scene.currentSceneObject;
        planner.mih().unsetActiveObject();
      } else if (planner.scene.getCurrentGroup()) {
        planner.mih()._scene.savedCurrentGroup = planner.mih()._scene.currentGroup;
        planner.mih().unsetActiveObject();
      } else
        planner.mih()._scene.savedCurrentSceneObject = planner.mih()._scene.savedCurrentGroup =
          null;

      state.prevActive = state.active;

      if (
        newMode != 'view2d' &&
        newMode != 'view3d' &&
        (state.active == 'view2d' || state.active == 'view3d')
      ) {
        state.prevActive3d = state.prevActive;
      }

      if ((newMode == 'view2d' || newMode == 'view3d') && state.prevActive3d) {
        newMode = state.prevActive3d;
        state.prevActive3d = '';
      }

      if (newMode != 'tileConfig') planner[newMode].activate();

      state.active = newMode;
    },
  },
});

export const selectActiveViewMode = (state) => state.viewMode_new.active;

export const { setActiveViewMode } = viewModeNewSlice.actions;

export default viewModeNewSlice.reducer;
