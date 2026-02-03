import axios from './axiosConfig';

export interface CalendarEvent {
  id?: string;
  title: string;
  start: Date;
  end: Date;
  type: 'entrenamiento' | 'consulta' | 'evaluacion' | 'nutricion';
  status: 'programado' | 'completado' | 'cancelado';
  description?: string;
  location?: string;
  clientId?: string;
  clientName?: string;
}

export interface CalendarIntegration {
  id: string;
  provider: 'google' | 'outlook' | 'icloud';
  email: string;
  isActive: boolean;
  lastSync?: Date;
}

export const calendarService = {
  // Crear evento y generar archivo .ics
  createEvent: async (eventData: Omit<CalendarEvent, 'id'>): Promise<{ success: boolean; event: CalendarEvent; icsContent?: string }> => {
    try {
      const response = await axios.post('/calendar-api/events', eventData);
      return response.data;
    } catch (error: any) {
      console.error('Error creando evento:', error);
      throw new Error(error.response?.data?.message || 'Error al crear evento');
    }
  },

  // Descargar archivo .ics para un evento
  downloadICS: async (eventId: string): Promise<Blob> => {
    try {
      const response = await axios.get(`/calendar-api/events/${eventId}/ics`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error('Error descargando archivo .ics:', error);
      throw new Error(error.response?.data?.message || 'Error al descargar archivo .ics');
    }
  },

  // Sincronizar con Google Calendar
  syncWithGoogle: async (eventId: string): Promise<{ success: boolean; googleEventId?: string }> => {
    try {
      const response = await axios.post(`/calendar-api/sync/google/${eventId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error sincronizando con Google Calendar:', error);
      throw new Error(error.response?.data?.message || 'Error al sincronizar con Google Calendar');
    }
  },

  // Reenviar invitación por email
  resendInvitation: async (eventId: string): Promise<{ success: boolean }> => {
    try {
      const response = await axios.post(`/calendar-api/events/${eventId}/resend-invitation`);
      return response.data;
    } catch (error: any) {
      console.error('Error reenviando invitación:', error);
      throw new Error(error.response?.data?.message || 'Error al reenviar invitación');
    }
  },

  // Obtener integraciones de calendario
  getIntegrations: async (): Promise<CalendarIntegration[]> => {
    try {
      const response = await axios.get('/calendar-api/integrations');
      return response.data.integrations || [];
    } catch (error: any) {
      console.error('Error obteniendo integraciones:', error);
      return [];
    }
  },

  // Iniciar proceso OAuth para Google Calendar
  initiateGoogleOAuth: async (): Promise<{ authUrl: string }> => {
    try {
      const response = await axios.get('/calendar-api/oauth/google/auth');
      return response.data;
    } catch (error: any) {
      console.error('Error iniciando OAuth de Google:', error);
      throw new Error(error.response?.data?.message || 'Error al iniciar autenticación con Google');
    }
  },

  // Completar proceso OAuth
  completeOAuth: async (code: string, provider: string): Promise<{ success: boolean }> => {
    try {
      const response = await axios.post(`/calendar-api/oauth/${provider}/callback`, { code });
      return response.data;
    } catch (error: any) {
      console.error('Error completando OAuth:', error);
      throw new Error(error.response?.data?.message || 'Error al completar autenticación');
    }
  },

  // Desconectar integración
  disconnectIntegration: async (integrationId: string): Promise<{ success: boolean }> => {
    try {
      const response = await axios.delete(`/calendar-api/integrations/${integrationId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error desconectando integración:', error);
      throw new Error(error.response?.data?.message || 'Error al desconectar integración');
    }
  }
};

export default calendarService;