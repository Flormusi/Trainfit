import api from './api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'payment_reminder' | 'system' | 'routine_update' | 'appointment' | 'general';
  isRead: boolean;
  createdAt: string;
  userId: string;
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    totalCount: number;
    unreadCount: number;
    hasMore: boolean;
  };
}

class NotificationService {
  /**
   * Obtener notificaciones del usuario
   */
  async getNotifications(params?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.unreadOnly) queryParams.append('unreadOnly', params.unreadOnly.toString());

    const response = await api.get(`/payment-reminders/notifications?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.patch(`/payment-reminders/notifications/${notificationId}/read`);
    return response.data;
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    const response = await api.patch('/payment-reminders/notifications/mark-all-read');
    return response.data;
  }

  /**
   * Enviar recordatorio manual de pago (solo para entrenadores)
   */
  async sendManualPaymentReminder(clientId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/payment-reminders/send-manual-reminder/${clientId}`);
    return response.data;
  }

  /**
   * Probar recordatorios automáticos (solo para desarrollo)
   */
  async testAutomaticReminders(): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/payment-reminders/test-automatic-reminders');
    return response.data;
  }

  /**
   * Crear suscripción de prueba (solo para desarrollo)
   */
  async createTestSubscription(clientId: string, daysUntilDue: number = 3): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.post(`/payment-reminders/create-test-subscription/${clientId}`, {
      daysUntilDue
    });
    return response.data;
  }

  /**
   * Obtener solo el conteo de notificaciones no leídas
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await this.getNotifications({ limit: 1, unreadOnly: true });
      return response.data.unreadCount;
    } catch (error) {
      console.error('Error obteniendo conteo de notificaciones:', error);
      return 0;
    }
  }

  /**
   * Formatear fecha de notificación
   */
  formatNotificationDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Ahora mismo';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInMinutes < 1440) { // 24 horas
      const hours = Math.floor(diffInMinutes / 60);
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (diffInMinutes < 10080) { // 7 días
      const days = Math.floor(diffInMinutes / 1440);
      return `Hace ${days} día${days > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }

  /**
   * Obtener icono según el tipo de notificación
   */
  getNotificationIcon(type: Notification['type']): string {
    switch (type) {
      case 'payment_reminder':
        return '💳';
      case 'routine_update':
        return '💪';
      case 'appointment':
        return '📅';
      case 'system':
        return '⚙️';
      default:
        return '📢';
    }
  }

  /**
   * Obtener color según el tipo de notificación
   */
  getNotificationColor(type: Notification['type']): string {
    switch (type) {
      case 'payment_reminder':
        return 'text-red-600';
      case 'routine_update':
        return 'text-blue-600';
      case 'appointment':
        return 'text-green-600';
      case 'system':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  }
}

export default new NotificationService();