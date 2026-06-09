import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { logger } from 'redux-logger';

import commonReducer from './features/common/commonSlice';
import constructorReducer from './features/constructor/constructorSlice';
import controlReducer from './features/control/controlPanelSlice';
import languageReducer from './features/language/languageSlice';
import metricsReducer from './features/metrics/metricsSLice';
import popupsReducer from './features/popups/popupsSlice';
import quickPanelsReducer from './features/quickPanels/quickPanelsSlice';
import tipsReducer from './features/tips/tipsSlice';
import topPanelReducer from './features/topPanel/topPanelSlice';
import userReducer from './features/user/userSlice';
import viewModeReducer_new from './features/viewMode/viewModeSlice';
import viewModeReducer from './features/viewMode/viewModeSlice_legacy';

export const store = configureStore({
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(logger),

  reducer: combineReducers({
    popups: popupsReducer,
    viewMode: viewModeReducer,
    language: languageReducer,
    viewMode_new: viewModeReducer_new,
    user: userReducer,
    topPanel: topPanelReducer,
    constr: constructorReducer,
    quickPanels: quickPanelsReducer,
    metrics: metricsReducer,
    tips: tipsReducer,
    common: commonReducer,
    controlPanel: controlReducer,
  }),
});
