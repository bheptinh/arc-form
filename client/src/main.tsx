import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import { pdfjs } from 'react-pdf'; // ????? TODO: check if this import is needed
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min`;
import sunEditor from 'suneditor';
import lang from 'suneditor/src/lang';
import plugins from 'suneditor/src/plugins';

import App from './App';
import ErrorFallback from './components/common/ErrorFallback';
import { planner, user } from './initR2D';
import ProjectsPage from './pages/ProjectsPage';
import { languagesInit, translationInit } from './redux/features/language/languageSlice';
import { setActivePopup } from './redux/features/popups/popupsSlice';
import { saveLoggedStatus } from './redux/features/user/userSlice';
import { setActiveViewMode } from './redux/features/viewMode/viewModeSlice';
import { store } from './redux/store';

window.sunEditor = sunEditor;
window.sunEditorPlugins = plugins;
window.sunEditorLanguages = lang;

const app_version = __APP_VERSION__;
window.app_version = app_version;

async function init() {
  console.log('[init] start');
  await store.dispatch(languagesInit());
  console.log('[init] languages done');

  R2D.languages = user.languages;

  await store.dispatch(translationInit());
  console.log('[init] translation done');
  const responseIsLogged = await user.checkIsLogged();
  console.log('[init] checkIsLogged done', responseIsLogged);
  if (responseIsLogged.type == 'error')
    store.dispatch(setActivePopup({ name: 'alert', data: responseIsLogged.data }));
  else store.dispatch(saveLoggedStatus(responseIsLogged));

  await planner.init();
  console.log('[init] planner.init done');

  R2D.SceneParser.projectMissingDataCorrector.addEventListener('sendToSentry', (error) => {
    console.error('[ErrorBoundary]', error);
  });

  const catalogMaterialsArray = await user.loadRightPanelData(
    R2D.URL.CATALOG_MATERIALS_TREE_FOR_MODELS
  );
  planner.setCatalogMaterials(catalogMaterialsArray);

  const start2D3DData = await user.loadRightPanelData(R2D.URL.CATALOG_TREE);
  planner.setCatalogProducts(start2D3DData.tree);

  const panorams = await user.loadPano();
  planner.setPanorams(panorams);
  planner.scene.setDefaultPanoId(panorams.find((i) => i.tags.includes('skybox_default'))?.id);

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  isCurrDeviceAPhone && store.dispatch(setActiveViewMode('view3d'));

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary
        FallbackComponent={Fallback}
        onReset={(details) => {
          // Reset the state of your app so the error doesn't happen again
        }}
      >
        <Router basename={R2D.URL.REACT_BASEPATH}>
          <Routes>
            <Route
              path="/"
              element={
                <Provider store={store}>
                  <App />
                </Provider>
              }
            />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route
              path="/project/*"
              element={
                <Provider store={store}>
                  <App />
                </Provider>
              }
            />
            <Route
              path="/password_recovery/*"
              element={
                <Provider store={store}>
                  <App />
                </Provider>
              }
            />
          </Routes>
        </Router>
      </ErrorBoundary>
    </StrictMode>
  );
}

function Fallback({ error, resetErrorBoundary }) {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.

  return (
    <Provider store={store}>
      <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
    </Provider>
    // <div role="alert">
    //     <p>Something went wrong:</p>
    //     <pre style={{ color: "red" }}>{error.message}</pre>
    //     <pre style={{ color: "red" }}>{error.stack}</pre>
    //
    //     <button onClick={()=>{window.location.reload()}}>Try again</button>
    // </div>
  );
}

init();
