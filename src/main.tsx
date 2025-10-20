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
import './services/axiosConfig';

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