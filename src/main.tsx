import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

// import { pdfjs } from 'react-pdf'; // ????? TODO: check if this import is needed
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

import ErrorFallback from "./components/common/ErrorFallback";


import { planner, user } from './initR2D';
import { App } from './App';

import './index.css';


const app_version = __APP__VERSION__;
window.app_version = app_version;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);



import { store } from "./redux/store";
import { languagesInit, translationInit } from './redux/features/language/languageSlice';
import { setActivePopup } from './redux/features/popups/popupsSlice';
import { saveLoggedStatus } from './redux/features/user/userSlice';
import { setActiveViewMode } from './redux/features/viewMode/viewModeSlice';






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

async function init() {
    await store.dispatch(languagesInit());

    R2D.languages = user.languages;

    await store.dispatch(translationInit());
    let responseIsLogged = await user.checkIsLogged();
    if(responseIsLogged.type == "error") store.dispatch(setActivePopup({name: "alert", data: responseIsLogged.data}));
    else store.dispatch(saveLoggedStatus(responseIsLogged));

    await planner.init();

    window.sunEditor = sunEditor;
    window.sunEditorPlugins = plugins;
    window.sunEditorLanguages = lang;

    R2D.SceneParser.projectMissingDataCorrector.addEventListener("sendToSentry", (e) => {
        Sentry.captureMessage("Something went wrong");
    });

    let catalogMaterialsArray = await user.loadRightPanelData(R2D.URL.CATALOG_MATERIALS_TREE_FOR_MODELS);
    planner.setCatalogMaterials(catalogMaterialsArray);

    let start2D3DData = await user.loadRightPanelData(R2D.URL.CATALOG_TREE);
    planner.setCatalogProducts(start2D3DData.tree);

    let panorams = await user.loadPano();
    planner.setPanorams(panorams);
    planner.scene.setDefaultPanoId(panorams.find(i => i.tags.includes("skybox_default"))?.id);

    let currOS = R2D.controller.getCurrentOS();
    let isCurrDeviceAPhone = currOS == "iOS" || currOS == "Android";

    isCurrDeviceAPhone && store.dispatch(setActiveViewMode('view3d'));

    ReactDOM.render(
        <React.StrictMode>
            <ErrorBoundary FallbackComponent={Fallback}
                           onReset={(details) => {
                               // Reset the state of your app so the error doesn't happen again
                           }}>
                <Router basename={R2D.URL.REACT_BASEPATH}>
                    <Routes>
                        <Route path="/" element={
                            <Provider store={store}>
                                <Main/>
                            </Provider>
                        } />
                        <Route path="/project/*" element={
                            <Provider store={store}>
                                <Main />
                            </Provider>
                        } />
                        <Route path="/password_recovery/*" element={
                            <Provider store={store}>
                                <Main />
                            </Provider>
                        } />
                    </Routes>
                </Router>
            </ErrorBoundary>
        </React.StrictMode>,
        document.getElementById("app")
    );
}

init();