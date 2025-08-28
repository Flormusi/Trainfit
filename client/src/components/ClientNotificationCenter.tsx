import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import './ClientNotificationCenter.css';

interface Notification {
  id: string;
  type: 'routine_assigned' | 'progress_update' | 'payment_reminder' | 'goal_achieved' | 'trainer_message';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  clientId: string;
  trainerId?: string;
}

interface ClientNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const ClientNotificationCenter: React.FC<ClientNotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Cargar notificaciones del cliente
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        console.error('No token or userId found');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/clients/${userId}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        console.error('Error fetching notifications:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marcar notificación como leída
  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/clients/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
      } else {
        console.error('Error marking notification as read:', response.statusText);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
  }, [isOpen]);

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
            <h2>Notificaciones</h2>
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
                    onClick={() => !notification.isRead && markAsRead(notification.id)}
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