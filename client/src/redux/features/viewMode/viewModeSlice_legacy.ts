import { createSlice } from '@reduxjs/toolkit';

import { planner } from '../../../initR2D';

const viewModeSlice = createSlice({
  name: 'viewMode',
  initialState: {
    active: 'view3d',
    view3d: {
      activeState: 'stateEditing',
      prevState: null,
      stateEditing: { history: [], breadCrumbs: [] },
      stateRendersShow: { history: [], isAllowedChangeHistoryState: true },
      stateProjectsShow: { history: [], isAllowedChangeHistoryState: true },
      stateRenderMake: { history: [], isAllowedChangeHistoryState: true },
      stateSelectedConstr: { history: [], breadCrumbs: [] },
      stateSelectedProduct: { history: [], breadCrumbs: [] },
      stateSelectedWall: { history: [], breadCrumbs: [] },
      stateSelectedPlinth: { history: [], breadCrumbs: [] },
      stateSelectedGroup: { history: [], breadCrumbs: [] },
      stateReplaceModel: { history: [], breadCrumbs: [] },
    },
    view2d: {
      activeState: 'stateEditing',
      prevState: null,
      stateEditing: { history: [], breadCrumbs: [] },
      stateRendersShow: { history: [], isAllowedChangeHistoryState: true },
      stateProjectsShow: { history: [], isAllowedChangeHistoryState: true },
      stateRenderMake: { history: [], isAllowedChangeHistoryState: true },
      stateSelectedConstr: { history: [], breadCrumbs: [] },
      stateSelectedProduct: { history: [], breadCrumbs: [] },
      stateSelectedGroup: { history: [], breadCrumbs: [] },
      stateReplaceModel: { history: [], breadCrumbs: [] },
    },
    constr: {
      activeState: 'stateEditing',
      prevState: null,
      stateEditing: { history: [{ added: true, type: 'main' }] },
      stateMakeWall: { history: [] },
      stateMakeRect: { history: [] },
      stateMakeRoom: { history: [] },
      stateCutRoom: { history: [] },
      stateMakeCover: { history: [] },
      stateCutCover: { history: [] },
      stateMakeArea: { history: [] },
      stateSetWallHeight: { history: [] },
      stateRendersShow: { history: [], isAllowedChangeHistoryState: true },
      stateProjectsShow: { history: [], isAllowedChangeHistoryState: true },
      stateRenderMake: { history: [], isAllowedChangeHistoryState: true },
      stateSelectedCover: { history: [] },
      stateSelectedArea: { history: [] },
      stateAlignDrawing: { history: [] },
      stateSelectedRuler: { history: [] },
    },
    viewWalk: {
      activeState: 'stateEditing',
      prevState: null,
      stateEditing: { history: [{ type: 'main', added: true, data: null, lastSavedScroll: 0 }] },
      stateRendersShow: { history: [], isAllowedChangeHistoryState: true },
      stateProjectsShow: { history: [], isAllowedChangeHistoryState: true },
      stateRenderMake: { history: [], isAllowedChangeHistoryState: true },
    },
    tileConfig: {
      activeState: 'stateEditing',
      prevState: null,
      stateEditing: { history: [] },
      stateMakingTiles: { history: [] },
      stateSelecting: { history: [] },
      stateSelected: { history: [] },
      stateDraggingCanvas: { history: [] },
      stateDraggingDelimiter: { history: [] },
      stateSelectedDelimiter: { history: [] },
      stateShiftingArea: { history: [] },
      stateDraggingMaterial: { history: [] },
    },
  },
  reducers: {
    setActiveViewMode: (state, action) => {
      const newMode = action.payload;

      if (state.active == newMode) return;

      if (state[state.active].activeState == 'stateProjectsShow')
        state[state.active][state[state.active].activeState].history = [];

      if (planner.scene.getCurrentSceneObject()) {
        planner.mih()._scene.savedCurrentSceneObject = planner.mih()._scene.currentSceneObject;
        planner.mih().unsetActiveObject();
      } else if (planner.scene.getCurrentGroup()) {
        planner.mih()._scene.savedCurrentGroup = planner.mih()._scene.currentGroup;
        planner.mih().unsetActiveObject();
      } else
        planner.mih()._scene.savedCurrentSceneObject = planner.mih()._scene.savedCurrentGroup =
          null;

      let activeViewModeState =
        newMode == 'view3d' || newMode == 'view2d'
          ? planner.scene.getSavedSceneObject()
            ? 'stateSelectedProduct'
            : planner.scene.getSavedGroup() || planner.scene.getCurrentGroup()
              ? 'stateSelectedGroup'
              : 'stateEditing'
          : 'stateEditing';

      if (state.active == 'tileConfig') activeViewModeState = 'stateSelectedWall';

      if (newMode != 'tileConfig') {
        planner[newMode].activate();
        state[state.active].activeState = activeViewModeState;
        state[state.active].prevState = null;
      }

      const newStateData = action.payload.data;

      state.active = newMode;

      if (newStateData) state[newMode][activeViewModeState].history.push(newStateData);

      if (action.payload.state && state[newMode].prevState == null) {
        state[newMode].prevState = 'stateEditing';
      }

      // if((newMode == "view2d" && (activeViewModeState == 'stateEditing' || planner.scene.getSavedSceneObject() || planner.scene.getSavedGroup() || planner.scene.getCurrentGroup()))) {
      //   state[newMode][activeViewModeState].history = state["view3d"][activeViewModeState].history;
      //   state[newMode][activeViewModeState].breadCrumbs = state["view3d"][activeViewModeState].breadCrumbs;
      //   if(activeViewModeState !== 'stateEditing') {
      //     state[newMode]['stateEditing'].history = state["view3d"]['stateEditing'].history;
      //     state[newMode]['stateEditing'].breadCrumbs = state["view3d"]['stateEditing'].breadCrumbs;
      //   }

      // }
      // else if((newMode == "view3d" && (activeViewModeState == 'stateEditing' || planner.scene.getSavedSceneObject() || planner.scene.getSavedGroup() || planner.scene.getCurrentGroup()))) {
      //   state[newMode][activeViewModeState].history = state["view2d"][activeViewModeState].history.length > 0 ? state["view2d"][activeViewModeState].history : state["view3d"][activeViewModeState].history;
      //   state[newMode][activeViewModeState].breadCrumbs = state["view2d"][activeViewModeState].breadCrumbs.length > 0 ? state["view2d"][activeViewModeState].breadCrumbs : state["view3d"][activeViewModeState].breadCrumbs;
      //   if(activeViewModeState !== 'stateEditing') {
      //     state[newMode]['stateEditing'].history = state["view2d"]['stateEditing'].history.length > 0 ? state["view2d"]['stateEditing'].history : state["view3d"]['stateEditing'].history;
      //     state[newMode]['stateEditing'].breadCrumbs = state["view2d"]['stateEditing'].breadCrumbs.length > 0 ? state["view2d"]['stateEditing'].breadCrumbs : state["view3d"]['stateEditing'].breadCrumbs;
      //   }
      // }

      state[state.active].activeState = activeViewModeState;
    },
    setActiveViewModeState(state, action) {
      const newState = action.payload.state;
      const newStateData = action.payload.data;

      const activeViewMode = state.active;
      const activeViewModeState = state[activeViewMode].activeState;

      if (
        newStateData &&
        state[state.active][newState] &&
        state[state.active][newState].history.length < 1
      )
        state[state.active][newState].history.push(newStateData);
      if (newState == activeViewModeState) return;

      if (state[activeViewMode][activeViewModeState]?.history.length > 0)
        state[activeViewMode][activeViewModeState].history[
          state[activeViewMode][activeViewModeState].history.length - 1
        ].added = false;

      state[state.active].prevState = state[state.active].activeState;

      if (
        state[activeViewMode][activeViewModeState] &&
        (newState == 'stateEditing' ||
          (newState == 'stateSelectedGroup' &&
            state[state.active].activeState == 'stateSelectedProduct'))
      ) {
        state[state.active].prevState = null;
        state[activeViewMode][activeViewModeState].history = [];
      }

      if (state[state.active].activeState == 'stateRenderMake') {
        planner.scene.offClipping();
        planner[activeViewMode].activate();
        R2D.view3d.changeIsRenderStateActive(false);
        R2D.viewWalk.changeIsRenderStateActive(false);
        R2D.view3d.setRenderMakeType('');
        planner.scene.showAllHiddenPartialVisibleElements();
        if (
          R2D.Viewers.getCurrentViewerType() == '3d' ||
          R2D.Viewers.getCurrentViewerType() == 'walk'
        ) {
          planner.scene.setDistFromCameraToPlane(20);
          planner.mih()._currentViewer.cameraMinHeightResetToDef &&
            planner.mih()._currentViewer.cameraMinHeightResetToDef();
          R2D.Viewers.getCurrentViewerType() == 'walk' && planner.mih()._currentViewer.showCursor();
        }
        R2D.Viewers.changeIsRenderActive(false);
        R2D.scene.checkSkybox();
        state[state.active].prevState = 'stateEditing';
      }

      state[state.active].activeState = newState;

      if (
        state[state.active].activeState == 'stateProjectsShow' ||
        state[state.active].activeState == 'stateRendersShow' ||
        state[state.active].activeState == 'stateRenderMake'
      )
        state[state.active].prevState = 'stateEditing';
    },
    updateMaterialId(state, action) {
      const activeViewMode = state.active;
      const activeViewModeState = state[activeViewMode].activeState;
      if (
        action.payload.id &&
        action.payload.addMaterial !== null &&
        state[activeViewMode][activeViewModeState]
      ) {
        state[activeViewMode][activeViewModeState].history[0].matId = action.payload.id;
        state[activeViewMode][activeViewModeState].history[0].addMatId = action.payload.addMaterial;
      } else {
        if (state[activeViewMode][activeViewModeState])
          state[activeViewMode][activeViewModeState].history[0].matId = action.payload;
      }
    },
    updateBreadCrumbs: (state, action) => {
      const activeViewMode = state.active;
      const activeViewModeData = state[activeViewMode];
      const activeViewModeState = activeViewModeData.activeState;
      const history = state[activeViewMode][activeViewModeState].history;
      let crumbs = activeViewModeData[activeViewModeData.activeState].breadCrumbs;
      switch (action.payload.updateType) {
        case 'add':
          const findedIndex = crumbs.findIndex(
            (i) =>
              (i?.id == action.payload.data?.id && i.name == action.payload.data.name) ||
              action.payload.data.addType == 'main'
          );
          if (~findedIndex) {
            const tempArray = crumbs.slice(0, findedIndex + 1);
            const lastBreadCrumbsElem = tempArray[tempArray.length - 1];
            crumbs = tempArray
              .reverse()
              .reduce(
                (prevItem, currentItem) =>
                  (currentItem.id &&
                    prevItem[prevItem.length - 1].parentId &&
                    prevItem[prevItem.length - 1].parentId == currentItem.id) ||
                  (currentItem.addType == 'main' &&
                    prevItem[prevItem.length - 1].addType !== currentItem.addType)
                    ? [...prevItem, currentItem]
                    : [...prevItem],
                [lastBreadCrumbsElem]
              )
              .reverse();
          } else crumbs = [...crumbs, action.payload.data];
          activeViewModeData[activeViewModeData.activeState].breadCrumbs = crumbs;
          break;
        case 'remove':
          if (crumbs.length > 1) crumbs.pop();
          const lastHistoryElem = history[history.length - 1];
          if (lastHistoryElem?.id != crumbs[crumbs.length - 1]?.id) {
            crumbs = history
              .reverse()
              .reduce(
                (prevItem, currentItem) =>
                  prevItem[prevItem.length - 1].parentId == currentItem.id &&
                  currentItem.type !== 'main'
                    ? [...prevItem, currentItem]
                    : [...prevItem],
                [lastHistoryElem]
              )
              .reverse();
            history.reverse();
          }
          activeViewModeData[activeViewModeData.activeState].breadCrumbs = crumbs;
          break;
        case 'update':
          crumbs[crumbs.length - 1].data = action.payload.data;
          activeViewModeData[activeViewModeData.activeState].breadCrumbs = crumbs;
          break;
        case 'clear':
          activeViewModeData[action.payload.data].breadCrumbs = [];
          break;
      }
    },
    historyAdd(state, action) {
      const activeViewMode = state.active;
      let activeStateElem =
        state[activeViewMode][state[activeViewMode].activeState].history[
          state[activeViewMode][state[activeViewMode].activeState].history.length - 1
        ];
      const preStateElem =
        state[activeViewMode][state[activeViewMode].activeState].history[
          state[activeViewMode][state[activeViewMode].activeState].history.length - 2
        ];
      if (state[activeViewMode][state[activeViewMode].activeState].history.length > 0)
        state[activeViewMode][state[activeViewMode].activeState].history[
          state[activeViewMode][state[activeViewMode].activeState].history.length - 1
        ].added = false;
      if (activeStateElem?.type == 'search' || activeStateElem?.type == 'favorites') {
        if (action.payload.type != 'model' && action.payload.type != 'material')
          state[activeViewMode][state[activeViewMode].activeState].history.pop();
      }
      if (activeStateElem?.type == 'model' || activeStateElem?.type == 'material') {
        if (preStateElem?.type == 'search' || preStateElem?.type == 'favorites') {
          state[activeViewMode][state[activeViewMode].activeState].history = state[activeViewMode][
            state[activeViewMode].activeState
          ].history.slice(
            0,
            state[activeViewMode][state[activeViewMode].activeState].history.length - 2
          );
        }
      }
      activeStateElem =
        state[activeViewMode][state[activeViewMode].activeState].history[
          state[activeViewMode][state[activeViewMode].activeState].history.length - 1
        ];
      if (
        activeStateElem?.type == 'catalog' &&
        activeStateElem?.addType == 'main' &&
        action.payload.type == activeStateElem?.type &&
        action.payload.addType == activeStateElem?.addType
      )
        return;
      state[activeViewMode][state[activeViewMode].activeState].history.push(action.payload);
    },
    historyRemove(state, action) {
      const activeViewMode = state.active;
      state[activeViewMode][state[activeViewMode].activeState].history.pop();
    },
    historyUpdate(state, action) {
      const activeViewMode = state.active;
      if (
        state[activeViewMode][state[activeViewMode].activeState] &&
        state[activeViewMode][state[activeViewMode].activeState].history[
          state[activeViewMode][state[activeViewMode].activeState].history.length - 1
        ]
      )
        state[activeViewMode][state[activeViewMode].activeState].history[
          state[activeViewMode][state[activeViewMode].activeState].history.length - 1
        ].data = action.payload;
    },
    historyClear(state, action) {
      const activeViewMode = state.active;
      state[activeViewMode][action.payload.state].history = [];
    },
    historyScrollSave(state, action) {
      const activeViewMode = state.active;

      if (
        !isNaN(
          state[activeViewMode][state[activeViewMode].activeState]?.history[
            state[activeViewMode][state[activeViewMode].activeState]?.history.length - 1
          ]?.lastSavedScroll
        )
      ) {
        state[activeViewMode][state[activeViewMode].activeState].history[
          state[activeViewMode][state[activeViewMode].activeState].history.length - 1
        ].lastSavedScroll = action.payload;
      }
    },
    updateCurrentProductSize(state, action) {
      const activeViewMode = state.active;
      state[activeViewMode][state[activeViewMode].activeState].history[0].data = action.payload;
    },
    historyStateUpdate(state, action) {
      const activeViewMode = state.active;
      if (state[activeViewMode][state[activeViewMode].activeState])
        state[activeViewMode][state[activeViewMode].activeState].history[
          state[activeViewMode][state[activeViewMode].activeState].history.length - 1
        ] = action.payload;
    },
  },
});

export const selectActiveViewModeState = (state) =>
  state.viewMode[state.viewMode.active].activeState;
export const selectActiveViewModeData = (state) => state.viewMode[state.viewMode.active];

export const { updateMaterialId, historyUpdate } = viewModeSlice.actions;

export default viewModeSlice.reducer;
