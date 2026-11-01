import './tokens.css';
import './index.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { pdfjs } from 'react-pdf';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import sunEditor from 'suneditor';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();
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
import PasswordRecoveryPage from './pages/PasswordRecoveryPage';
import ProfilePage from './pages/ProfilePage';
import ProjectsPage from './pages/ProjectsPage';
import RendersPage from './pages/RendersPage';
import ToursPage from './pages/ToursPage';
import { setActivePopup } from './redux/features/popups/popupsSlice';
import { saveLoggedStatus } from './redux/features/user/userSlice';
import { setActiveViewMode } from './redux/features/viewMode/viewModeSlice';
import { store } from './redux/store';
import { ConfirmDialogProvider } from './shared-components/ConfirmDialog';
import ErrorBoundary from './smart-components/common/error-boundary';
import PageLayout from './smart-components/common/page-layout';

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
  if (responseIsLogged.type == 'error') {
    store.dispatch(setActivePopup({ name: 'alert', data: responseIsLogged.data }));
  } else {
    store.dispatch(saveLoggedStatus(responseIsLogged));
  }

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

  // FIXME: debug timer, opens a popup 2s after every load. Comment out before release.
  // setTimeout(() => {
  //   // store.dispatch(setActivePopup({ name: 'export2DProjectPopup' }));
  //   store.dispatch(
  //     // changeActiveControlPanelMode({
  //     //   mode: 'renderExample_small',
  //     //   data: { type: 'main', lastSavedScroll: 0 },
  //     // })
  //     // setActivePopup({ name: 'renderExample_big' })
  //     // setActivePopup({
  //     //   name: 'export3DProjectPopup',
  //     //   type: R2D.Storage.load('r2d_exportDownloadDetails') ? 'download' : 'predownload',
  //     //   data: {},
  //     // })
  //     setActivePopup({ name: 'imageUpload' })
  //   );
  // }, 2000);

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <ErrorBoundary>
            <Router basename={R2D.URL.REACT_BASEPATH}>
              <ConfirmDialogProvider />
              <Toaster position="bottom-right" richColors />
              <Routes>
                <Route path="/" element={<Navigate to="/projects" replace />} />
                <Route element={<PageLayout />}>
                  <Route path="/projects" element={<ProjectsPage key="projects" />} />
                  <Route
                    path="/projects/archive"
                    element={<ProjectsPage key="archive" archived />}
                  />
                  <Route path="/renders" element={<RendersPage />} />
                  <Route path="/tours" element={<ToursPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
                <Route path="/toc" element={<MarkdownPage slug="toc" />} />
                <Route path="/auth/reset-password" element={<PasswordRecoveryPage />} />
                <Route path="/project" element={<Navigate to="/projects" replace />} />
                <Route path="/project/*" element={<App />} />
                <Route path="/view/:uuid" element={<App />} />
              </Routes>
            </Router>
          </ErrorBoundary>
        </Provider>
      </QueryClientProvider>
    </StrictMode>
  );
}

init();
