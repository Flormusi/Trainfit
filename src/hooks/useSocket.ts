import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

// Derivar la URL del socket priorizando VITE_SOCKET_URL para evitar desalineaciones
const deriveSocketURL = (): string => {
  // 1) Si está definida VITE_SOCKET_URL, usarla directamente
  const socketUrl = (import.meta.env as any)?.VITE_SOCKET_URL as string | undefined;
  if (socketUrl && typeof socketUrl === 'string' && socketUrl.trim().length > 0) {
    return socketUrl;
  }

  // 2) Intentar derivar del VITE_API_URL si es absoluto
  const apiUrl = (import.meta.env as any)?.VITE_API_URL as string | undefined;
  if (apiUrl) {
    try {
      const url = new URL(apiUrl);
      // Si la API corre en otro puerto, el socket puede no estar ahí; preferir fallback si el puerto es 5002
      const baseOrigin = `${url.protocol}//${url.host}`;
      return baseOrigin;
    } catch {
      // Si VITE_API_URL es relativo (p.ej. '/api'), no siempre hay servidor de Socket.IO en el mismo origin (Vite 5173)
      // En ese caso, preferir fallback al puerto típico del servidor de sockets en desarrollo
      if (apiUrl.startsWith('/')) {
        return 'http://localhost:5004';
      }
    }
  }

  // 3) Fallback razonable en desarrollo
  return 'http://localhost:5004';
};
const SOCKET_URL = deriveSocketURL();

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();
  // Almacenar handlers pendientes para adjuntarlos cuando el socket se conecte
  const notificationHandlersRef = useRef<{ onNew: Set<(payload: any) => void>; onRead: Set<(payload: any) => void> }>({
    onNew: new Set(),
    onRead: new Set(),
  });

  useEffect(() => {
    if (user?.id && !socketRef.current) {
      // Obtener token para autenticación
      const token = authService.getToken();
      // Crear conexión de socket con autenticación del usuario
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        auth: token ? { token } : undefined,
        withCredentials: true
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('🔌 Conectado al servidor WebSocket');
        // Unirse a la sala específica del usuario
        socket.emit('join-user-room', user.id);

        // Adjuntar handlers de notificaciones pendientes
        notificationHandlersRef.current.onNew.forEach((handler) => socket.on('notification:new', handler));
        notificationHandlersRef.current.onRead.forEach((handler) => socket.on('notification:read', handler));
      });

      socket.on('disconnect', () => {
        console.log('🔌 Desconectado del servidor WebSocket');
      });

      socket.on('connect_error', (error) => {
        console.error("❌ Error de conexión WebSocket:");
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?.id]);

  const subscribeToPaymentUpdates = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('payment-updated', callback);
    }
  };

  const unsubscribeFromPaymentUpdates = () => {
    if (socketRef.current) {
      socketRef.current.off('payment-updated');
    }
  };

  // Suscripciones específicas para notificaciones
  const subscribeToNotificationEvents = (handlers: {
    onNew?: (payload: any) => void;
    onRead?: (payload: any) => void;
  }) => {
    if (handlers.onNew) {
      notificationHandlersRef.current.onNew.add(handlers.onNew);
      if (socketRef.current) socketRef.current.on('notification:new', handlers.onNew);
    }
    if (handlers.onRead) {
      notificationHandlersRef.current.onRead.add(handlers.onRead);
      if (socketRef.current) socketRef.current.on('notification:read', handlers.onRead);
    }
  };

  const unsubscribeFromNotificationEvents = () => {
    if (socketRef.current) {
      // Remover cada handler registrado explícitamente
      notificationHandlersRef.current.onNew.forEach((handler) => socketRef.current!.off('notification:new', handler));
      notificationHandlersRef.current.onRead.forEach((handler) => socketRef.current!.off('notification:read', handler));
    }
    // Limpiar colecciones
    notificationHandlersRef.current.onNew.clear();
    notificationHandlersRef.current.onRead.clear();
  };

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    subscribeToPaymentUpdates,
    unsubscribeFromPaymentUpdates,
    subscribeToNotificationEvents,
    unsubscribeFromNotificationEvents
  };
};