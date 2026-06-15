import './index.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
// import { pdfjs } from 'react-pdf'; // ????? TODO: check if this import is needed
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min`;
import sunEditor from 'suneditor';
import lang from 'suneditor/src/lang';
import plugins from 'suneditor/src/plugins';

import { setupLanguageBridge } from './api/bridges/languageBridge';
import { setupProjectsBridge } from './api/bridges/projectsBridge';
import { materialsNavQueryOptions } from './api/catalog';
import { favoritesQueryOptions } from './api/favorites';
import { languagesQueryOptions, translationQueryOptions } from './api/i18n';
import { queryClient } from './api/queryClient';
import { userQueryOptions } from './api/user';
import App from './App';
import { planner, user } from './initR2D';
import { MarkdownPage } from './pages/MarkdownPage';
import ProjectsPage from './pages/ProjectsPage';
import { setActivePopup } from './redux/features/popups/popupsSlice';
import { saveLoggedStatus } from './redux/features/user/userSlice';
import { setActiveViewMode } from './redux/features/viewMode/viewModeSlice';
import { store } from './redux/store';
import ErrorBoundary from './smart-components/common/error-boundary';

window.sunEditor = sunEditor;
window.sunEditorPlugins = plugins;
window.sunEditorLanguages = lang;

console.info('App version:', __APP_VERSION__);

async function init() {
  await queryClient.ensureQueryData(userQueryOptions);
  await queryClient.ensureQueryData(favoritesQueryOptions);
  await queryClient.ensureQueryData(languagesQueryOptions);
  await queryClient.ensureQueryData(translationQueryOptions);

  const responseIsLogged = await user.checkIsLogged();
  if (responseIsLogged.type == 'error')
    store.dispatch(setActivePopup({ name: 'alert', data: responseIsLogged.data }));
  else store.dispatch(saveLoggedStatus(responseIsLogged));

  await planner.init();

  R2D.SceneParser.projectMissingDataCorrector.addEventListener('sendToSentry', (error) => {
    console.error('[ErrorBoundary]', error);
  });

  // TODO: move ensureQueryData call to LeftMain/Sidebar — data is only needed there
  await queryClient.ensureQueryData(materialsNavQueryOptions);

  const start2D3DData = await user.loadRightPanelData(R2D.URL.CATALOG_TREE);
  planner.setCatalogProducts(start2D3DData.tree);

  const panorams = await user.loadPano();
  planner.setPanorams(panorams);
  planner.scene.setDefaultPanoId(panorams.find((i) => i.tags.includes('skybox_default'))?.id);

  setupLanguageBridge();
  setupProjectsBridge();

  const currOS = R2D.controller.getCurrentOS();
  const isCurrDeviceAPhone = currOS == 'iOS' || currOS == 'Android';

  if (isCurrDeviceAPhone) {
    store.dispatch(setActiveViewMode('view3d'));
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <ErrorBoundary>
            <Router basename={R2D.URL.REACT_BASEPATH}>
              <Routes>
                <Route path="/" element={<Navigate to="/projects" replace />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/toc" element={<MarkdownPage slug="toc" />} />
                <Route path="/project/*" element={<App />} />
                <Route path="/password_recovery/*" element={<App />} />
              </Routes>
            </Router>
          </ErrorBoundary>
        </Provider>
      </QueryClientProvider>
    </StrictMode>
  );
}

init();
