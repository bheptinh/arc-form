import { createSlice } from '@reduxjs/toolkit'

export const tipsSlice = createSlice({
  name: 'tips',
  initialState: {
    lastTriggerTime: Date.now(),
    constructorButtons: {status: false, showed: false},
    panorams: {status: false, showed: false},
    selectGroup: {status: false, showed: false},
    mergeGroupButton: {status: false, showed: false},
    changeWallHeight: {status: false, showed: false},
    saveProject: {status: false, showed: false},
    uploadCustomMat: {status: false, showed: false},
    replaceModel: {status: false, showed: false},
    tipUseTab: {status: false, showed: false},
    tipUseEnter: {status: false, showed: false},
    tipRenderMake: {status: false, showed: false}
  },
  reducers: {
    showTip: (state, action) => {
        state[action.payload.name].status = true;
    },
    hideTip: (state, action) => {
      state.lastTriggerTime = Date.now();
      state[action.payload.name].status = false;
      state[action.payload.name].showed = true;
    },
  },
})

export const selectTips = state => state.tips;

export const { showTip, hideTip } = tipsSlice.actions; 

export default tipsSlice.reducer;