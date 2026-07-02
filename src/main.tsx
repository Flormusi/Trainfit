import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/modern-design.css';
// import './styles/no-borders.css';
// import './styles/nuclear-no-borders.css';
// import './styles/eliminate-all-white-backgrounds.css';

// Inicializar configuración global de Axios (baseURL, interceptores)
import axios from './services/axiosConfig';
// Inicializa configuración global de Axios
// Además, ejecuta un health check al arrancar para verificar conectividad con backend
axios.get('/health')
  .then((res) => {
    console.log('[Startup Health] OK:', res.status, res.data);
  })
  .catch((err) => {
    console.warn('[Startup Health] Failed:', err?.response?.status, err?.message);
  });

// Registrar Service Worker para actualizaciones automáticas
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Hay una nueva versión disponible — recargar automáticamente
            window.location.reload();
          }
        });
      });
    });
  });
}

const root = document.getElementById('root');
if (!root) {
  throw new Error('No se encontró el elemento root');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);