import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Calendar, Clock, Plus, X, Check, Trash2, CheckCheck } from 'lucide-react';
import notificationService, { Notification } from '../services/notificationService';
import { toast } from 'react-hot-toast';

interface Reminder {
  id: string;
  title: string;
  message: string;
  reminderTime: string;
  reminderType: 'WORKOUT' | 'APPOINTMENT' | 'GENERAL';
  isSent: boolean;
  userId: string;
  appointmentId?: string;
}

interface NotificationCenterProps {
  isVisible: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'reminders'>('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    message: '',
    reminderTime: '',
    reminderType: 'GENERAL' as 'WORKOUT' | 'APPOINTMENT' | 'GENERAL'
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isVisible) {
      fetchNotifications();
      fetchReminders();
    }
  }, [isVisible]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificationService.getNotifications({ limit: 20 });
      if (response.success) {
        setNotifications(response.data.notifications);
      } else {
        setError('Error al cargar las notificaciones');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Error al cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reminders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const json = await response.json();
        const normalized = Array.isArray(json)
          ? json
          : Array.isArray((json as any)?.data)
            ? (json as any).data
            : [];
        setReminders(normalized);
      } else {
        console.error('Error al obtener recordatorios:', response.statusText);
        setReminders([]);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setReminders([]);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, isRead: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const result = await notificationService.markAllAsRead();
      if (result.success) {
        setNotifications(prev =>
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        toast.success('Todas las notificaciones marcadas como leídas');
      }
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
      toast.error('Error al marcar notificaciones como leídas');
    }
  };

  const createReminder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newReminder)
      });
      
      if (response.ok) {
        setShowReminderModal(false);
        setNewReminder({
          title: '',
          message: '',
          reminderTime: '',
          reminderType: 'GENERAL'
        });
        fetchReminders();
      }
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  const deleteReminder = async (reminderId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reminders/${reminderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
      }
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    return notificationService.getNotificationIcon(type);
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'WORKOUT':
        return '🏋️‍♂️';
      case 'APPOINTMENT':
        return '📅';
      case 'GENERAL':
        return '⏰';
      default:
        return '⏰';
    }
  };

  const formatDate = (dateString: string) => {
    return notificationService.formatNotificationDate(dateString);
  };

  const formatReminderTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[#1a1a1a] text-white border border-[#333] rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#333] bg-gradient-to-r from-red-600 to-red-500">
          <h2 className="text-xl font-semibold text-white">Centro de Comunicación</h2>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#333] bg-[#1a1a1a]">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'notifications'
                ? 'text-red-400 border-b-2 border-red-500 bg-[#1e1e1e]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4 inline mr-2" />
            Notificaciones {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'reminders'
                ? 'text-red-400 border-b-2 border-red-500 bg-[#1e1e1e]'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Recordatorios ({reminders.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'notifications' ? (
            <div>
              {/* Header con botón de marcar todas como leídas */}
              {notifications.length > 0 && unreadCount > 0 && (
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-300">
                    {unreadCount} notificación{unreadCount !== 1 ? 'es' : ''} sin leer
                  </span>
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center space-x-1 text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    <CheckCheck size={16} />
                    <span>Marcar todas como leídas</span>
                  </button>
                </div>
              )}
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  <p className="mt-2 text-gray-300">Cargando notificaciones...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-400">{error}</div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400">No tienes notificaciones</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        !notification.isRead
                          ? 'bg-red-900/20 border-red-500/40 hover:bg-red-900/30'
                          : 'bg-[#1e1e1e] border-[#333] hover:bg-[#2a2a2a]'
                      }`}
                      onClick={() => !notification.isRead && markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{notification.title}</h4>
                          <p className="text-sm text-gray-300 mt-1">{notification.message}</p>
                          <span className="text-xs text-gray-500 mt-2 block">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">Mis Recordatorios</h3>
                <button
                  onClick={() => setShowReminderModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo</span>
                </button>
              </div>

              {reminders.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400">No tienes recordatorios</p>
                  <button
                    onClick={() => setShowReminderModal(true)}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Crear primer recordatorio
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className={`p-4 rounded-lg border ${
                        reminder.isSent
                          ? 'bg-[#1e1e1e] border-[#333]'
                          : 'bg-red-900/10 border-red-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{getReminderIcon(reminder.reminderType)}</div>
                          <div>
                            <h4 className="font-medium text-white">{reminder.title}</h4>
                            <p className="text-sm text-gray-300 mt-1">{reminder.message}</p>
                            <span className="text-xs text-gray-500 mt-2 block">
                              {formatReminderTime(reminder.reminderTime)}
                            </span>
                            {reminder.isSent && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-700/20 text-green-300 mt-2">
                                <Check className="w-3 h-3 mr-1" />
                                Enviado
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteReminder(reminder.id)}
                          className="p-2 text-red-400 hover:bg-red-900/20 rounded-full transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reminder Modal */}
        {showReminderModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[#1a1a1a] text-white border border-[#333] rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">Crear Recordatorio</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={newReminder.title}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#333] rounded-lg bg-[#1e1e1e] text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Título del recordatorio"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    value={newReminder.message}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#333] rounded-lg bg-[#1e1e1e] text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={3}
                    placeholder="Descripción del recordatorio"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Fecha y Hora
                  </label>
                  <input
                    type="datetime-local"
                    value={newReminder.reminderTime}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, reminderTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-[#333] rounded-lg bg-[#1e1e1e] text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Tipo
                  </label>
                  <select
                    value={newReminder.reminderType}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, reminderType: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-[#333] rounded-lg bg-[#1e1e1e] text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="GENERAL">General</option>
                    <option value="WORKOUT">Entrenamiento</option>
                    <option value="APPOINTMENT">Cita</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="px-4 py-2 text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={createReminder}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Crear Recordatorio
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;