import { createSlice } from '@reduxjs/toolkit';

const popupsSlice = createSlice({
  name: 'popups',
  initialState: {
    currentZindex: 5,
    lastClosedPopup: '',
    currentActivePopups: [],
    login: { status: false, zIndex: 5, type: null, data: null },
    registration: { status: false, zIndex: 5 },
    forgotPassword: { status: false, zIndex: 5 },
    profile: { status: false, zIndex: 5 },
    setProjectName: { status: false, type: null, data: null, addType: null, zIndex: 5 },
    confirm: { status: false, type: null, data: null, zIndex: 5 },
    alert: { status: false, type: null, data: null, zIndex: 5 },
    share: { status: false, data: null, zIndex: 5 },
    saveBefore: { status: false, data: null, zIndex: 5 },
    setValueInput: { status: false, type: null, data: null, zIndex: 5 },
    completeMessage: { status: false, data: null, zIndex: 5, positionX: null },
    loadingMessage: { status: false, data: null, zIndex: 5, type: null },
    imageUpload: { status: false, zIndex: 5 },
    alignerWidthSet: { status: false, zIndex: 5 },
    alignerWidthSetMetrics: { status: false, zIndex: 5, data: null },
    uploadCustomMaterialPopup: { status: false, zIndex: 5, data: null, backBtn: false },
    renderExample_360: { status: false, zIndex: 5, data: null },
    renderExample_big: { status: false, zIndex: 5, data: null },
    renderExample_small: { status: false, zIndex: 5, data: null, wasShowed: false },
    renderMade: { status: false, zIndex: 5, data: null },
    startPopup: { status: false, zIndex: 5, data: null },
    revert3DRotationPopup: { status: false, zIndex: 5, data: null },
    customRegistrationPopup: { status: false, zIndex: 5, data: null },
    registrationDonePopup: { status: false, zIndex: 5, data: null },
    updatePassword: { status: false, zIndex: 5, data: null },
    exportPopup: { status: false, zIndex: 5, data: null },
    uploadCustomModelPopup: { status: false, zIndex: 5, type: '', data: null, backBtn: false },
    export2DProjectPopup: { status: false, zIndex: 5, type: '', data: null },
    export3DProjectPopup: { status: false, zIndex: 5, type: '', data: null },
    tipsPopup: { status: false, zIndex: 5, data: null },
    renderExample4k: { status: false, zIndex: 5, data: null },
    tour360Create: { status: false, zIndex: 5, data: null },
    autoSaveEnable: { status: false, zIndex: 5, type: '', data: null },
    projectDataLoadPopup: {
      status: false,
      data: null,
      zIndex: 5,
      positionX: null,
      customZIndex: true,
    },
    changeProjectName: { status: false, type: null, data: null, addType: null, zIndex: 5 },
    uploadChoicePopup: { status: false, type: null, data: null, zIndex: 5 },
    uploadPlanPopup: { status: false, type: null, data: null, zIndex: 5 },
    uploadChoiceModelPopup: { status: false, type: null, data: null, zIndex: 5, backBtn: false },
    uploadModelAiInfoPopup: { status: false, type: null, data: null, zIndex: 5 },
    uploadCustomModelAiPopup: { status: false, type: null, data: null, zIndex: 5 },
    demoProjectsExample: { status: false, data: null, zIndex: 5, positionX: null },
    deleteAccountPopup: { status: false, data: null, zIndex: 5, positionX: null },
  },
  reducers: {
    setActivePopup: (state, action) => {
      if (action.payload.backBtn) state[action.payload.name].backBtn = action.payload.backBtn;
      if (action.payload.type) state[action.payload.name].type = action.payload.type;
      if (action.payload.data) state[action.payload.name].data = action.payload.data;
      if (action.payload.positionX) state[action.payload.name].positionX = action.payload.positionX;
      if (action.payload.addType) state[action.payload.name].addType = action.payload.addType;
      if (action.payload.oldName) state[action.payload.name].oldName = action.payload.oldName;
      if (action.payload.addData) state[action.payload.name].addData = action.payload.addData;
      state[action.payload.name].wasShowed = true;
      if (!state[action.payload.name].customZIndex) {
        if (!state[action.payload.name].status) {
          state.currentZindex =
            state.currentActivePopups?.length > 0
              ? state[state.currentActivePopups[state.currentActivePopups.length - 1]].zIndex + 1
              : state.currentZindex + 1;
        }
        state[action.payload.name].zIndex = state.currentZindex;
      }
      state.currentActivePopups.push(action.payload.name);
      state[action.payload.name].status = true;
    },
    closeActivePopup: (state, action) => {
      state.lastClosedPopup = action.payload.name;

      if (!state[action.payload.name].customZIndex) {
        state.currentZindex = state[state.lastClosedPopup].zIndex - 1;
      }

      state[action.payload.name].zIndex = 0;
      state[action.payload.name].status = false;
      state[action.payload.name].backBtn = false;
      state[action.payload.name].type =
        state[action.payload.name].addType =
        state[action.payload.name].addData =
          null;
      if (state[action.payload.name].data) {
        if (state[action.payload.name].data?.history) state[action.payload.name].data.history = [];
        else state[action.payload.name].data = null;
      }
      state.currentActivePopups = state.currentActivePopups.filter((i) => i != action.payload.name);
    },
    setPopupData: (state, action) => {
      state[action.payload.name].data = action.payload.data;
      if (state[action.payload.name].type) state[action.payload.name].type = action.payload.type;
    },
  },
});

export const selectPopups = (state) => state.popups;
export const selectPopupsLastClosedPopup = (state) => state.popups.lastClosedPopup;

export const { setActivePopup, closeActivePopup, setPopupData } = popupsSlice.actions;

export default popupsSlice.reducer;
