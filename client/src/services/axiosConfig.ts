import axios from 'axios';
import { authService } from './authService';

// Configuración base de axios
// Usar la URL del backend configurada en el .env
axios.defaults.baseURL = 'http://localhost:5002/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

// Interceptor de solicitudes
axios.interceptors.request.use(
  (config) => {
    console.log('[Axios] Preparando solicitud:', config.url);
    const token = authService.getToken();
    if (token) {
      console.log('[Axios] Token encontrado, añadiendo a headers');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('[Axios] No se encontró token');
    }
    return config;
  },
  (error) => {
    console.error('[Axios] Error en interceptor de solicitud:', error);
    return Promise.reject(error);
  }
);

// Interceptor de respuestas
axios.interceptors.response.use(
  (response) => {
    console.log('[Axios] Respuesta exitosa:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('[Axios] Error en respuesta:', error.response?.status, error.config?.url);
    if (error.response?.status === 401) {
      console.log('[Axios] Error de autenticación, redirigiendo a login');
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;