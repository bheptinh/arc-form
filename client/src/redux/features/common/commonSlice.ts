import { createSlice } from '@reduxjs/toolkit';

const commonSlice = createSlice({
  name: 'common',
  initialState: {
    is3DRotationModeActive: false,
    lockState: true,
    activePano: { id: 0, previewImgSrc: '', rotation: 0 },
    isThereHiddenElements: false,
    preloaderStatus: false,
    renderMakeState: { type: 'interior', screen: 'landscape', fromApply: false },
    hiddenButtonWasShowed: false,
    isProjectBelongToLoggedUser: false,
    isProjectOnlyView: true,
  },
  reducers: {
    changeLockState: (state, action) => {
      state.lockState = action.payload;
    },
    changeActivePano: (state, action) => {
      state.activePano = { ...action.payload };
    },
    updateIs3DRotationModeActive: (state, action) => {
      state.is3DRotationModeActive = action.payload;
    },
    updateIsThereHiddenElements: (state, action) => {
      state.isThereHiddenElements = action.payload;
    },
    updatePreloaderStatus: (state, action) => {
      state.preloaderStatus = action.payload;
    },
    updateRenderMakeState: (state, action) => {
      state.renderMakeState = action.payload;
      state.renderMakeState.fromApply = action.payload.fromApply;
    },
    updateHiddenButtonWasShowedStatus: (state, action) => {
      state.hiddenButtonWasShowed = action.payload;
    },
    updateIsProjectBelongToLoggedUser: (state, action) => {
      state.isProjectBelongToLoggedUser = action.payload;
    },
    updateIsProjectOnlyView: (state, action) => {
      state.isProjectOnlyView = action.payload;
    },
  },
});

export const selectLockState = (state) => state.common.lockState;
export const selectActivePano = (state) => state.common.activePano;
export const selectIs3DRotationModeActive = (state) => state.common.is3DRotationModeActive;
export const selectIsThereHiddenElements = (state) => state.common.isThereHiddenElements;
export const selectPreloaderStatus = (state) => state.common.preloaderStatus;
export const selectRenderMakeState = (state) => state.common.renderMakeState;
export const selectHiddenButtonWasShowed = (state) => state.common.hiddenButtonWasShowed;
export const selectIsProjectBelongToLoggedUser = (state) =>
  state.common.isProjectBelongToLoggedUser;
export const selectIsProjectOnlyView = (state) => state.common.isProjectOnlyView;

export const {
  changeLockState,
  changeActivePano,
  updateIs3DRotationModeActive,
  updateIsThereHiddenElements,
  updatePreloaderStatus,
  updateRenderMakeState,
  updateHiddenButtonWasShowedStatus,
  updateIsProjectBelongToLoggedUser,
  updateIsProjectOnlyView,
} = commonSlice.actions;

export default commonSlice.reducer;
