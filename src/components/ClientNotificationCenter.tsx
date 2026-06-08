import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import './ClientNotificationCenter.css';
import axios from '../services/axiosConfig';

interface Notification {
  id: string;
  _id?: string; // compatibilidad con posibles respuestas con _id
  type:
    | 'routine_assigned'
    | 'progress_update'
    | 'payment_reminder'
    | 'goal_achieved'
    | 'trainer_message'
    | 'message'
    | 'appointment';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  clientId: string;
  trainerId?: string;
  routineId?: string;
  appointmentId?: string;
  eventDate?: string; // ISO date for calendar event if available
}

interface ClientNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRoutineModal?: (routineId: string) => void;
  onOpenPaymentHistory?: () => void;
  onOpenMessages?: (trainerId?: string) => void;
  onOpenCalendarEvent?: (dateISO?: string) => void;
}

const ClientNotificationCenter: React.FC<ClientNotificationCenterProps> = ({ isOpen, onClose, onOpenRoutineModal, onOpenPaymentHistory, onOpenMessages, onOpenCalendarEvent }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Cargar notificaciones del cliente
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const userId = user?.id;
      
      if (!userId) {
        console.error('No userId found');
        return;
      }

      const response = await axios.get(`/clients/${userId}/notifications`);
      const data = response?.data;
      const notifications = data?.notifications || data?.data?.notifications || [];
      setNotifications(Array.isArray(notifications) ? notifications : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Vaciar todas las notificaciones
  const clearAllNotifications = async () => {
    try {
      const confirmed = window.confirm('¿Seguro que querés eliminar todas las notificaciones?');
      if (!confirmed) return;

      await axios.delete(`/clients/notifications/clear`);
      setNotifications([]);
      toast.success('Todas las notificaciones eliminadas');
    } catch (error) {
      console.error('Error en clearAllNotifications:', error);
      toast.error('Error al eliminar todas las notificaciones');
    }
  };

  // Eliminar notificación individual
  const deleteNotification = async (notificationId: string) => {
    try {
      console.log('Eliminando notificación', notificationId);
      await axios.delete(`/clients/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => String(n._id || n.id) !== String(notificationId)));
      toast.success('Notificación eliminada');
    } catch (error) {
      console.error('Error al eliminar notificación:', error);
      toast.error('Error al eliminar notificación');
    }
  };

  // Marcar notificación como leída
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await axios.put(`/clients/notifications/${notificationId}/read`);

      if (response.status >= 200 && response.status < 300) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
      } else {
        console.error('Error marking notification as read:', response.status);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Navegar según el tipo de notificación
  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }

      const normalizedType = (notification.type || '').toLowerCase();
      const userId = user?.id;

      switch (normalizedType) {
        case 'routine_assigned': {
          const routineId = notification.routineId;
          if (routineId && onOpenRoutineModal) {
            // Abrir el mismo modal de "Ver detalles" del dashboard
            onOpenRoutineModal(routineId);
          } else if (userId) {
            navigate(`/client-dashboard/${userId}`);
          } else {
            console.warn('No se pudo navegar: faltan IDs');
          }
          break;
        }
        case 'progress_update':
        case 'goal_achieved': {
          navigate('/client/progress');
          break;
        }
        case 'payment_reminder': {
          if (onOpenPaymentHistory) {
            onOpenPaymentHistory();
          } else if (userId) {
            navigate(`/client-dashboard/${userId}`);
          } else {
            navigate('/client/subscription');
          }
          break;
        }
        case 'trainer_message':
        case 'message': {
          if (onOpenMessages) {
            onOpenMessages(notification.trainerId);
          } else {
            const to = notification.trainerId ? `?to=${notification.trainerId}` : '';
            navigate(`/client/messages${to}`);
          }
          break;
        }
        case 'appointment': {
          if (onOpenCalendarEvent) {
            onOpenCalendarEvent(notification.eventDate);
          } else if (userId) {
            navigate(`/client-dashboard/${userId}`);
          } else {
            console.warn('No se pudo abrir calendario: faltan datos');
          }
          break;
        }
        default: {
          // Fallback: ir al dashboard
          if (userId) {
            navigate(`/client-dashboard/${userId}`);
          }
        }
      }

      // Cerrar modal tras navegar
      onClose();
    } catch (error) {
      console.error('Error al manejar clic de notificación:', error);
    }
  };

  // Obtener icono según el tipo de notificación
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'routine_assigned':
        return '🏋️‍♂️';
      case 'progress_update':
        return '📈';
      case 'payment_reminder':
        return '💳';
      case 'goal_achieved':
        return '🎯';
      case 'trainer_message':
        return '💬';
      case 'message':
        return '💬';
      case 'appointment':
        return '📅';
      default:
        return '🔔';
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace unos minutos';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, user?.id]);

  // Log de depuración para cambios en notificaciones
  useEffect(() => {
    console.log('Notificaciones actualizadas. length=', notifications.length);
  }, [notifications]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="notification-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="notification-modal"
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="notification-header">
            <div className="notification-header-left">
              <h2>Notificaciones</h2>
              {notifications.length > 0 && (
                <button className="clear-all-button" onClick={clearAllNotifications}>
                  Vaciar todas
                </button>
              )}
            </div>
            <button className="close-button" onClick={onClose}>
              ✕
            </button>
          </div>

          <div className="notification-content">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Cargando notificaciones...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔔</div>
                <h3>No tienes notificaciones</h3>
                <p>Cuando tu entrenador te envíe actualizaciones, aparecerán aquí.</p>
              </div>
            ) : (
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-details">
                      <div className="notification-title">
                        {notification.title}
                        {!notification.isRead && <span className="unread-dot"></span>}
                      </div>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-time">
                        {formatDate(notification.createdAt)}
                      </div>
                    </div>
                    <button
                      className="delete-notification-button"
                      onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                      aria-label="Eliminar notificación"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ClientNotificationCenter;