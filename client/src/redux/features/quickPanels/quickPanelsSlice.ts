import { createSlice } from '@reduxjs/toolkit';

const quickPanelsSlice = createSlice({
  name: 'quickPanels',
  initialState: {
    active: '',
    panels: {
      helper: { status: false, visible: true, position: {}, type: '' },
      delete: { status: false, visible: true, position: {}, type: '' },
      helper_model: { status: false, visible: true, position: {}, type: '' },
      helper_group: { status: false, visible: true, position: {}, type: '' },
      helper_plinth: { status: false, visible: true, position: {}, type: '' },
      helper_carpet: { status: false, visible: true, position: {}, type: '' },
      helper_portrets: { status: false, visible: true, position: {}, type: '' },
      helper_logo_mesh: { status: false, visible: true, position: {}, type: '' },
    },
  },
  reducers: {
    showQuickPanel: (state, action) => {
      state.panels[action.payload.name].status = true;
      state.panels[action.payload.name].position = action.payload.position;
      if ('visible' in action.payload)
        state.panels[action.payload.name].visible = action.payload.visible;
      if ('type' in action.payload) state.panels[action.payload.name].type = action.payload.type;
      state.active = action.payload;
    },
    removeQuickPanel: (state, action) => {
      state.active = '';
      state.panels[action.payload.name].status = false;
      state.panels[action.payload.name].type = '';
    },
    removeQuickPanelAll: (state, action) => {
      state.active = '';
      for (const panel in state.panels) {
        state.panels[panel].status = false;
        state.panels[panel].visible = true;
        state.panels[panel].type = '';
      }
    },
    hideQuickPanelVisible: (state, action) => {
      state.panels[action.payload.name].visible = false;
    },
    showQuickPanelVisible: (state, action) => {
      state.panels[action.payload.name].visible = true;
    },
    toggleQuickPanelVisible: (state, action) => {
      state.panels[action.payload.name].visible = !state.panels[action.payload.name].visible;
      state.panels[action.payload.name].position = action.payload.position;
    },
    updateQuickPanelPosition: (state, action) => {
      state.panels[action.payload.name].position = action.payload.position;
      state.active = action.payload;
    },
  },
});

export const selectQuickPanels = (state) => state.quickPanels.panels;
export const {
  showQuickPanel,
  removeQuickPanel,
  removeQuickPanelAll,
  toggleQuickPanelVisible,
  hideQuickPanelVisible,
  updateQuickPanelPosition,
  showQuickPanelVisible,
} = quickPanelsSlice.actions;

export default quickPanelsSlice.reducer;
