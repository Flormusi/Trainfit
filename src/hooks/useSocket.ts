import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5004';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id && !socketRef.current) {
      // Crear conexión de socket
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling']
      });

      const socket = socketRef.current;

      socket.on('connect', () => {
        console.log('🔌 Conectado al servidor WebSocket');
        // Unirse a la sala específica del usuario
        socket.emit('join-user-room', user.id);
      });

      socket.on('disconnect', () => {
        console.log('🔌 Desconectado del servidor WebSocket');
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Error de conexión WebSocket:', error);
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

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    subscribeToPaymentUpdates,
    unsubscribeFromPaymentUpdates
  };
};