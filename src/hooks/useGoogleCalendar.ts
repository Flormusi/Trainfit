import { useState, useEffect, useCallback } from 'react';
import googleCalendarService, { TrainingEvent } from '../services/googleCalendarService';
import { toast } from 'react-toastify';

interface UseGoogleCalendarReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  connectToGoogle: () => void;
  handleAuthCallback: (code: string) => Promise<void>;
  syncTrainings: (trainings: any[]) => Promise<void>;
  createEvent: (event: TrainingEvent) => Promise<string | null>;
  disconnect: () => void;
  isSyncing: boolean;
  getEvents: (startDate: Date, endDate: Date) => Promise<any[]>;
  googleEvents: any[];
}

export const useGoogleCalendar = (): UseGoogleCalendarReturn => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleEvents, setGoogleEvents] = useState<any[]>([]);

  // Verificar autenticación al cargar
  useEffect(() => {
    const checkAuth = () => {
      const hasTokens = googleCalendarService.loadSavedTokens();
      const authenticated = googleCalendarService.isAuthenticated();
      setIsAuthenticated(hasTokens && authenticated);
    };

    checkAuth();
  }, []);

  // Conectar con Google Calendar
  const connectToGoogle = useCallback(() => {
    try {
      setError(null);
      const authUrl = googleCalendarService.getAuthUrl();
      
      // Abrir ventana de autorización
      const popup = window.open(
        authUrl,
        'google-auth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Escuchar el mensaje de la ventana popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          handleAuthCallback(event.data.code);
          popup?.close();
          window.removeEventListener('message', handleMessage);
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          setError('Error en la autenticación con Google');
          popup?.close();
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

      // Verificar si la ventana se cerró manualmente
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
        }
      }, 1000);

    } catch (err) {
      setError('Error al iniciar la autenticación');
      console.error('Error connecting to Google:', err);
    }
  }, []);

  // Manejar callback de autenticación
  const handleAuthCallback = useCallback(async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await googleCalendarService.getTokens(code);
      setIsAuthenticated(true);
      toast.success('¡Conectado exitosamente con Google Calendar!');
    } catch (err) {
      setError('Error al obtener tokens de Google');
      toast.error('Error al conectar con Google Calendar');
      console.error('Error handling auth callback:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sincronizar entrenamientos
  const syncTrainings = useCallback(async (trainings: any[]) => {
    if (!isAuthenticated) {
      setError('No estás conectado con Google Calendar');
      return;
    }

    setIsSyncing(true);
    setError(null);

    try {
      const result = await googleCalendarService.syncTrainingSchedule(trainings);
      
      if (result.success > 0) {
        toast.success(`${result.success} entrenamientos sincronizados exitosamente`);
      }
      
      if (result.errors > 0) {
        toast.warning(`${result.errors} entrenamientos no pudieron sincronizarse`);
      }

      if (result.success === 0 && result.errors === 0) {
        toast.info('No hay entrenamientos para sincronizar');
      }

    } catch (err) {
      setError('Error al sincronizar entrenamientos');
      toast.error('Error al sincronizar con Google Calendar');
      console.error('Error syncing trainings:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated]);

  // Crear evento individual
  const createEvent = useCallback(async (event: TrainingEvent): Promise<string | null> => {
    if (!isAuthenticated) {
      setError('No estás conectado con Google Calendar');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const eventId = await googleCalendarService.createEvent(event);
      toast.success('Evento creado en Google Calendar');
      return eventId;
    } catch (err) {
      setError('Error al crear evento');
      toast.error('Error al crear evento en Google Calendar');
      console.error('Error creating event:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Obtener eventos de Google Calendar
  const getEvents = useCallback(async (startDate: Date, endDate: Date): Promise<any[]> => {
    if (!isAuthenticated) {
      setError('No estás conectado con Google Calendar');
      return [];
    }

    setIsLoading(true);
    setError(null);

    try {
      const events = await googleCalendarService.getEvents(startDate, endDate);
      setGoogleEvents(events);
      return events;
    } catch (err) {
      setError('Error al obtener eventos de Google Calendar');
      console.error('Error getting events:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Desconectar
  const disconnect = useCallback(() => {
    googleCalendarService.disconnect();
    setIsAuthenticated(false);
    setError(null);
    setGoogleEvents([]);
    toast.info('Desconectado de Google Calendar');
  }, []);

  return {
    isAuthenticated,
    isLoading,
    error,
    connectToGoogle,
    handleAuthCallback,
    syncTrainings,
    createEvent,
    disconnect,
    isSyncing,
    getEvents,
    googleEvents
  };
};

export default useGoogleCalendar;