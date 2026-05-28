import { createSlice } from '@reduxjs/toolkit'

export const controlPanelSlice = createSlice({
  name: 'controlPanel',
  initialState: { 
    activeName: 'constructor',
    animateFavoritesShowStatus: false,
    animateFavoritesHideStatus: false,
    prevName: '',
    controlPanelStatus: true,
    dynamicPanelStatus: false,
    dynamicToggleButtonStatus: false,
    dynamicPanelProductsPreviewViewType: localStorage.getItem('productsViewType') || 'medium',
    dynamicPanelCatalogPreviewViewType: localStorage.getItem('catalogViewType') || 'big',
    categoryTreePanelStatus: false,
    dynamicPanelPrevButtonKeyTimeout: 0,
    furniture: { history: [], isInControlPanel: true, breadCrumbs: [], showCategoryTreePanel: true },
    decor: { history: [], isInControlPanel: true, breadCrumbs: [], showCategoryTreePanel: true },
    to2d3d: { history: [], isInControlPanel: true, breadCrumbs: [] },
    constructor: { history: [], isInControlPanel: true, breadCrumbs: [] },
    selectedModel: { history: [], breadCrumbs: [], showCategoryTreePanel: true },
    selectedOtherConstrParts: { history: [], breadCrumbs: [], showCategoryTreePanel: true },
    selectedCover: { history: [], breadCrumbs: [], showCategoryTreePanel: true },
    selectedWall: { history: [], breadCrumbs: [], showCategoryTreePanel: true },
    selectedGroup: { history: [], breadCrumbs: [], showCategoryTreePanel: true },
    selectedPlinth: { history: [], breadCrumbs: [], showCategoryTreePanel: true },
    replaceModel: { history: [], breadCrumbs: [], showCategoryTreePanel: true },
    walk: { history: [], isInControlPanel: true, breadCrumbs: [] },
    favorites: { history: [], isInControlPanel: true, breadCrumbs: [] },
    search: { history: [], isInControlPanel: true, breadCrumbs: [] },
    renderMake: { history: [], breadCrumbs: [] },
    alignDrawing: { history: [], breadCrumbs: [] },
    uploadModel: { history: [], breadCrumbs: [] },
    wallSlice: { history: [], breadCrumbs: [] },
    userUpload: { history: [], isInControlPanel: true, breadCrumbs: [] },
    selectedCover_constr: { history: [], breadCrumbs: [] },
    selectedArea: { history: [], breadCrumbs: [] }
  },
  reducers: {
    changeActiveControlPanelMode: (state, action) => {
        let newMode = action.payload.mode;
        let newModeData = action.payload.data;
        let activeMode = state.activeName;

        if(newModeData) {
          state[newMode].history.push({...newModeData, isAdded: false});
          state[newMode].breadCrumbs.push({...newModeData, isAdded: false});
        }

        if(newMode == activeMode) {
          if(state[state.activeName].isInControlPanel) {
            state[state.activeName].history = [state[state.activeName].history[0]];
            state[state.activeName].breadCrumbs = [state[state.activeName].breadCrumbs[0]];
          }
          else return;
        } else {
          if(state[state.activeName]) {
            if(state[state.activeName].isInControlPanel) state.prevName = state.activeName;
            else {
              state[state.activeName].history = [];
              state[state.activeName].breadCrumbs = [];
            }

            if(state[state.activeName].history[state[state.activeName].history.length - 1]) {
              state[state.activeName].history[state[state.activeName].history.length - 1].isAdded = state[state.activeName].breadCrumbs[state[state.activeName].breadCrumbs.length - 1].isAdded = !state[newMode].isInControlPanel;
            }
          }
          state.activeName = newMode;
        }
    },
    controlPanelUpdateBreadCrumbs: (state, action) => {
        let activeControlMode = action.payload.forMode || state.activeName;
        let activeControlModeData = state[activeControlMode];
        let crumbs = activeControlModeData?.breadCrumbs;
        let activeHistoryElem = state[activeControlMode].history[state[activeControlMode].history.length - 1];
        switch(action.payload.updateType) {
          case "add":
            let findedIndex = crumbs.findIndex(i => (i?.id == action.payload.data?.id && i.name == action.payload.data.name) || action.payload.data.addType == "main");
            if(~findedIndex) {
              let tempArray = crumbs.slice(0, findedIndex + 1);
              let lastBreadCrumbsElem = tempArray[tempArray.length - 1];
              crumbs = tempArray.reverse().reduce((prevItem, currentItem) => currentItem.id && prevItem[prevItem.length - 1].parentId && prevItem[prevItem.length - 1].parentId == currentItem.id || currentItem.addType == "main" && prevItem[prevItem.length - 1].addType !== currentItem.addType ? [...prevItem, currentItem] : [...prevItem], [lastBreadCrumbsElem]).reverse();
            } else crumbs = [...crumbs, action.payload.data];
            
            activeControlModeData.breadCrumbs = crumbs;
            break;
          case "addArray": 
            activeControlModeData.breadCrumbs = [...activeControlModeData.breadCrumbs, ...action.payload.data];
            break;
          case "replaceArray":
            activeControlModeData.breadCrumbs = [activeControlModeData.breadCrumbs[0], ...action.payload.data];
            break;
          case "remove":
            crumbs.pop();
            if((activeControlModeData.history.length > 1 && crumbs.length < 1) || (activeHistoryElem?.id != crumbs[crumbs.length - 1]?.id)) {
              crumbs = activeControlModeData.history.reverse().reduce((prevItem, currentItem) => prevItem[prevItem.length - 1].parentId == currentItem.id && currentItem.type !== "main" ? [...prevItem, currentItem] : [...prevItem], [activeHistoryElem]).reverse();
              activeControlModeData.history.reverse();
            }
            activeControlModeData.breadCrumbs = crumbs;
            break;
          case "update":
            crumbs[crumbs.length - 1].data = action.payload.data;
            activeControlModeData.breadCrumbs = crumbs;
            break;
          case "clear":
            activeControlModeData.breadCrumbs = [];
            break;
          case "home":
            activeControlModeData.breadCrumbs = [activeControlModeData.breadCrumbs[0]];
            break;
        }
    },
    controlPanelHistoryAdd(state, action) {
        let activeControlMode = state.activeName;
        if(action.payload?.type == 'catalog' && action.payload?.addType == 'main') {
          state[activeControlMode].history = [action.payload];
        } else {
          state[activeControlMode].history.push(action.payload);
        }
    },
    controlPanelHistoryAddArray(state, action) {
      let activeControlMode = state.activeName;
      state[activeControlMode].history = [...state[activeControlMode].history.concat([...action.payload.slice(0, action.payload.length - 1), {...action.payload[action.payload.length - 1], isAdded: false}])];
    },
    controlPanelHistoryReplaceArray(state, action) {
      let activeControlMode = state.activeName;
      if(action.payload.length > 0) state[activeControlMode].history = [state[activeControlMode].history[0], ...action.payload.slice(0, action.payload.length - 1), {...action.payload[action.payload.length - 1], isAdded: false}];
      else state[activeControlMode].history = [{...state[activeControlMode].history[0], isAdded: true}];
    },
    controlPanelHistoryRemove(state, action) {
      let activeControlMode = state.activeName;
      if(state[activeControlMode].history[state[activeControlMode].history.length - 2]) state[activeControlMode].history[state[activeControlMode].history.length - 2].isAdded = true;
      if(state[activeControlMode].breadCrumbs[state[activeControlMode].breadCrumbs.length - 2]) state[activeControlMode].breadCrumbs[state[activeControlMode].breadCrumbs.length - 2].isAdded = true;
      state[activeControlMode].history.pop();
    },
    controlPanelHistoryDataUpdate(state, action) {
      let activeControlMode = action.payload.forMode || state.activeName;
      if(state[activeControlMode] && state[activeControlMode].history[state[activeControlMode].history.length - 1]) state[activeControlMode].history[state[activeControlMode].history.length - 1].data = action.payload;
      if(action.payload.forMode) {
        state[activeControlMode].history.push(action.payload.data);
        state[activeControlMode].breadCrumbs.push(action.payload.data);
      }
    },
    controlPanelHistoryClear(state, action) {
      let activeControlMode = action.payload.forMode || state.activeName;
      if(!action.payload.forMode) state.activeName = '';
      if(state[activeControlMode]) {
        state[activeControlMode].history = [];
        state[activeControlMode].breadCrumbs = [];
      }
    },
    controlPanelHistoryScrollSave(state, action) {
      let activeControlMode = state.activeName;
      if(!isNaN(state[activeControlMode]?.history[state[activeControlMode]?.history.length - 1]?.lastSavedScroll)) {
          state[activeControlMode].history[state[activeControlMode].history.length - 1].lastSavedScroll = action.payload;
      }
    },
    controlPanelHistoryStateUpdate(state, action) {
      let activeControlMode = state.activeName;
      if(state[activeControlMode][state[activeControlMode].activeState]) state[activeControlMode][state[activeControlMode].activeState].history[state[activeControlMode][state[activeControlMode].activeState].history.length - 1] = action.payload;
    },
    updateAnimateFavoritesShowStatus(state, action) {
      state.animateFavoritesShowStatus = action.payload;
    },
    updateAnimateFavoritesHideStatus(state, action) {
      state.animateFavoritesHideStatus = action.payload;
    },
    updateDynamicPanelStatus(state, action) {
      if(action.payload && state[state.activeName]?.history && state[state.activeName].history[state[state.activeName].history.length - 1]) state[state.activeName].history[state[state.activeName].history.length - 1].isAdded = false;
      state.dynamicPanelStatus = action.payload;
      if(!action.payload && state.categoryTreePanelStatus) state.categoryTreePanelStatus = false;
    },
    updateControlPanelStatus(state, action) {
      state.controlPanelStatus = action.payload;
    },
    updateDynamicToggleButtonStatus(state, action) {
      state.dynamicToggleButtonStatus = action.payload;
    },
    updateDynamicPanelPreviewViewType(state, action) {
      state.dynamicPanelProductsPreviewViewType = action.payload;
      localStorage.setItem('productsViewType', action.payload);
    },
    updateCategoryTreePanelStatus(state, action) {
      state.categoryTreePanelStatus = action.payload;
    },
    updateDynamicPanelCatalogPreviewViewType(state, action) {
      state.dynamicPanelCatalogPreviewViewType = action.payload;
      localStorage.setItem('catalogViewType', action.payload);
    }
  }
})

export const { 
  changeActiveControlPanelMode, controlPanelUpdateBreadCrumbs, controlPanelHistoryAdd, controlPanelHistoryRemove, controlPanelHistoryDataUpdate, 
  controlPanelHistoryAddArray, controlPanelHistoryClear, controlPanelHistoryScrollSave, controlPanelHistoryStateUpdate, updateDynamicPanelStatus, 
  updateDynamicPanelPreviewViewType, updateCategoryTreePanelStatus, controlPanelHistoryReplaceArray, updateControlPanelStatus,
  updateDynamicPanelCatalogPreviewViewType, updateAnimateFavoritesShowStatus, updateAnimateFavoritesHideStatus, updateDynamicToggleButtonStatus
} = controlPanelSlice.actions;

export const selectControlPanelData = state => state.controlPanel;
export const selectActiveControlPanelMode = state => state.controlPanel.activeName;
export const selectPrevControlPanelMode = state => state.controlPanel.prevName;
export const selectActiveControlPanelModeData = state => state.controlPanel[state.controlPanel.activeName];
export const selectDynamicPanelStatus = state => state.controlPanel.dynamicPanelStatus;
export const selectDynamicToggleButtonStatus = state => state.controlPanel.dynamicToggleButtonStatus;
export const selectControlPanelStatus = state => state.controlPanel.controlPanelStatus;
export const selectDynamicPanelPreviewViewType = state => state.controlPanel.dynamicPanelProductsPreviewViewType;
export const selectDynamicPanelCatalogPreviewViewType = state => state.controlPanel.dynamicPanelCatalogPreviewViewType;
export const selectCategoryTreePanelStatus = state => state.controlPanel.categoryTreePanelStatus;
export const selectDynamicPanelPrevButtonKeyTimeout = state => state.controlPanel.dynamicPanelPrevButtonKeyTimeout;
export const selectAnimateFavoritesShowStatus = state => state.controlPanel.animateFavoritesShowStatus;
export const selectAnimateFavoritesHideStatus = state => state.controlPanel.animateFavoritesHideStatus;
export const selectActiveControlPanelCatagoryTreeShowStatus = state => state.controlPanel[state.controlPanel.activeName]?.showCategoryTreePanel;

export default controlPanelSlice.reducer;