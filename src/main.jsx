import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store, persistor } from './store/store';
import { PersistGate } from 'redux-persist/integration/react';
import { RouterProvider } from 'react-router-dom';
import Router from './Router';
import { initGA } from './utils/analytics';
import { captureAttribution } from './utils/visitor';
import { HelmetProvider } from 'react-helmet-async';

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/styles/main.scss';
import './App.css';
import './assets/styles/design-system.css';
// NOTA: chart.js NO se registra aquí (sacaba ~chart.js a TODAS las páginas, incl. home).
// El único consumidor (VentasPorVendedor) registra sus propios componentes de Chart.js.
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// react-hot-toast: lo usan ProyectosBoard y varias páginas admin. Sin este <Toaster />
// sus toasts (errores y éxitos) NO se mostraban → fallos "silenciosos".
import { Toaster } from 'react-hot-toast';

// Inicializar Google Analytics
initGA();

// Identidad persistente del visitante + captura de origen (first-touch) para la trazabilidad
captureAttribution();

const rootElement = document.getElementById('root');
const app = (
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <HelmetProvider>
          <RouterProvider router={Router} />
          <Toaster position="top-right" toastOptions={{ duration: 4000, style: { zIndex: 99999 } }} containerStyle={{ zIndex: 99999 }} />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </HelmetProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);

// Si la página fue pre-renderizada, hidratar en vez de renderizar desde cero
// Esto evita el "flash" de contenido y mejora el rendimiento
if (rootElement.hasChildNodes()) {
  ReactDOM.hydrateRoot(rootElement, app);
} else {
  ReactDOM.createRoot(rootElement).render(app);
}

