import { useEffect } from 'react';

const BACKEND_URL = import.meta.env.VITE_API_URL || '/api';
const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutos

/**
 * Hace un ping al backend cada 14 minutos para evitar que Render
 * duerma el servidor free tier. Silencioso — no afecta la UI.
 */
export function useKeepAlive() {
  useEffect(() => {
    if (import.meta.env.DEV) return; // Solo en producción

    const ping = () => {
      fetch(`${BACKEND_URL}/health`, { method: 'GET', credentials: 'omit' })
        .catch(() => {}); // Ignorar errores silenciosamente
    };

    ping(); // Ping inmediato al montar
    const interval = setInterval(ping, PING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);
}
