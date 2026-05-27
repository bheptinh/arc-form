import { configureStore, combineReducers  } from '@reduxjs/toolkit';

import { logger } from 'redux-logger'

import popupsReducer from "./features/popups/popupsSlice"
import viewModeReducer_new from "./features/viewMode/viewModeSlice";
import viewModeReducer from "./features/viewMode/viewModeSlice_legacy"
import languageReducer from "./features/language/languageSlice"
import userReducer from './features/user/userSlice';
import topPanelReducer from './features/topPanel/topPanelSlice';
import constructorReducer from './features/constructor/constructorSlice';
import quickPanelsReducer from './features/quickPanels/quickPanelsSlice'
import metricsReducer from './features/metrics/metricsSLice';
import tipsReducer from './features/tips/tipsSlice';
import commonReducer from './features/common/commonSlice';
import controlReducer from './features/control/controlPanelSlice';

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
    controlPanel: controlReducer
  })
});