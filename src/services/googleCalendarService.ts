// Google Calendar REST API Service
// Using direct REST API calls instead of googleapis library for browser compatibility

// Configuración de Google Calendar API
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Google Calendar API configuration
const CLIENT_ID = '571621235878-4snhh9pjm3hlb4gng0c0p5kkggn4eiqn.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://trainfit.vercel.app/auth/google/callback';

interface TrainingEvent {
  id?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
}

interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

class GoogleCalendarService {
  private tokens: GoogleTokens | null = null;

  constructor() {
    this.loadSavedTokens();
  }

  // Generar URL de autorización
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: CLIENT_ID || '',
      redirect_uri: REDIRECT_URI,
      scope: SCOPES.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Intercambiar código de autorización por tokens
  async getTokens(code: string): Promise<GoogleTokens> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID || '',
          client_secret: CLIENT_SECRET || '',
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: REDIRECT_URI,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const tokens = await response.json();
      this.tokens = tokens;
      
      // Guardar tokens en localStorage para persistencia
      localStorage.setItem('google_calendar_tokens', JSON.stringify(tokens));
      
      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw error;
    }
  }

  // Cargar tokens guardados
  loadSavedTokens(): boolean {
    try {
      const savedTokens = localStorage.getItem('google_calendar_tokens');
      if (savedTokens) {
        this.tokens = JSON.parse(savedTokens);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading saved tokens:', error);
      return false;
    }
  }

  // Verificar si está autenticado
  isAuthenticated(): boolean {
    return this.tokens !== null && this.tokens.access_token !== undefined;
  }

  // Hacer petición autenticada a la API de Google Calendar
  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.isAuthenticated()) {
      throw new Error('No authenticated with Google Calendar');
    }

    const headers = {
      'Authorization': `Bearer ${this.tokens!.access_token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expirado, intentar refrescar
      if (this.tokens?.refresh_token) {
        await this.refreshToken();
        // Reintentar la petición
        return this.makeAuthenticatedRequest(url, options);
      } else {
        throw new Error('Token expired and no refresh token available');
      }
    }

    return response;
  }

  // Refrescar token de acceso
  private async refreshToken(): Promise<void> {
    if (!this.tokens?.refresh_token) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID || '',
          client_secret: CLIENT_SECRET || '',
          refresh_token: this.tokens.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newTokens = await response.json();
      this.tokens = { ...this.tokens, ...newTokens };
      localStorage.setItem('google_calendar_tokens', JSON.stringify(this.tokens));
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  // Crear evento en Google Calendar
  async createEvent(event: TrainingEvent): Promise<string | null> {
    try {
      const calendarEvent = {
        summary: event.title,
        description: event.description || 'Entrenamiento programado desde TrainFit',
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        location: event.location,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 día antes
            { method: 'popup', minutes: 30 }, // 30 minutos antes
          ],
        },
      };

      const response = await this.makeAuthenticatedRequest(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          body: JSON.stringify(calendarEvent),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.id;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  // Actualizar evento existente
  async updateEvent(eventId: string, event: TrainingEvent): Promise<void> {
    try {
      const calendarEvent = {
        summary: event.title,
        description: event.description || 'Entrenamiento programado desde TrainFit',
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        location: event.location,
      };

      const response = await this.makeAuthenticatedRequest(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'PUT',
          body: JSON.stringify(calendarEvent),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  // Eliminar evento
  async deleteEvent(eventId: string): Promise<void> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  // Obtener eventos del calendario
  async getEvents(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const params = new URLSearchParams({
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
      });

      const response = await this.makeAuthenticatedRequest(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.items || [];
    } catch (error) {
      console.error('Error getting calendar events:', error);
      throw error;
    }
  }

  // Sincronizar entrenamientos con Google Calendar
  async syncTrainingSchedule(trainingDays: any[]): Promise<{ success: number; errors: number }> {
    let success = 0;
    let errors = 0;

    for (const training of trainingDays) {
      try {
        const startTime = new Date(training.date);
        startTime.setHours(training.hour || 9, training.minute || 0); // Hora por defecto 9:00 AM
        
        const endTime = new Date(startTime);
        endTime.setHours(startTime.getHours() + (training.duration || 1)); // Duración por defecto 1 hora

        const event: TrainingEvent = {
          title: `Entrenamiento - ${training.type || 'Rutina'}`,
          description: `Entrenamiento programado\n${training.exercises ? training.exercises.join(', ') : ''}`,
          startTime,
          endTime,
          location: training.location || 'Gimnasio'
        };

        await this.createEvent(event);
        success++;
      } catch (error) {
        console.error('Error syncing training:', training, error);
        errors++;
      }
    }

    return { success, errors };
  }

  // Desconectar de Google Calendar
  disconnect(): void {
    localStorage.removeItem('google_calendar_tokens');
    this.tokens = null;
  }
}

export default new GoogleCalendarService();
export type { TrainingEvent };
