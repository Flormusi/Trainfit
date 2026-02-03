import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  MapPinIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { trainerApi, Client } from '../services/api';
import { calendarService } from '../services/calendarService';
import './EventModal.css';

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'entrenamiento' | 'consulta' | 'evaluacion' | 'nutricion';
  status: 'programado' | 'completado' | 'cancelado';
  description?: string;
  location?: string;
  notes?: string;
  clientId?: string;
  clientName?: string;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
  onDelete?: (eventId: string) => void;
  event?: Event | null;
  mode: 'create' | 'edit' | 'view';
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  mode
}) => {
  const [formData, setFormData] = useState<Event>({
    id: '',
    title: '',
    start: new Date(),
    end: new Date(Date.now() + 60 * 60 * 1000), // 1 hora después
    type: 'entrenamiento',
    status: 'programado',
    description: '',
    location: '',
    notes: '',
    clientId: '',
    clientName: ''
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDownloadingICS, setIsDownloadingICS] = useState(false);
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);

  // Cargar lista de clientes al abrir el modal
  useEffect(() => {
    if (isOpen && mode !== 'view') {
      loadClients();
    }
  }, [isOpen, mode]);

  const loadClients = async () => {
    try {
      setLoadingClients(true);
      const response = await trainerApi.getClients();
      if (response.data && Array.isArray(response.data)) {
        setClients(response.data);
      }
    } catch (error) {
      console.error('Error cargando clientes:', error);
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  useEffect(() => {
    if (event && (mode === 'edit' || mode === 'view')) {
      setFormData({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end)
      });
    } else if (mode === 'create') {
      // Configurar fechas por defecto más inteligentes
      const now = new Date();
      
      // Redondear a la próxima hora completa
      const startTime = new Date(now);
      startTime.setMinutes(0, 0, 0);
      if (now.getMinutes() > 0) {
        startTime.setHours(startTime.getHours() + 1);
      }
      
      // Duración por defecto de 1 hora
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
      
      setFormData({
        id: '',
        title: '',
        start: startTime,
        end: endTime,
        type: 'entrenamiento',
        status: 'programado',
        description: '',
        location: '',
        notes: '',
        clientId: '',
        clientName: ''
      });
    }
    setErrors({});
  }, [event, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (!formData.clientId?.trim()) {
      newErrors.clientId = 'Debe seleccionar un cliente';
    }

    // Validación mejorada de fechas - permite eventos que terminen al día siguiente
    const startTime = formData.start.getTime();
    const endTime = formData.end.getTime();
    const timeDifference = endTime - startTime;
    
    // Permitir eventos de hasta 24 horas de duración
    if (timeDifference <= 0) {
      newErrors.end = 'La hora de fin debe ser posterior a la de inicio';
    } else if (timeDifference > 24 * 60 * 60 * 1000) {
      newErrors.end = 'El evento no puede durar más de 24 horas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClientChange = (clientId: string) => {
    const selectedClient = clients.find(client => client.id === clientId);
    setFormData(prev => ({
      ...prev,
      clientId,
      clientName: selectedClient ? selectedClient.name : ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleDelete = () => {
    if (event?.id && onDelete) {
      onDelete(event.id);
      onClose();
    }
  };

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleDateTimeChange = (field: 'start' | 'end', value: string) => {
    const date = new Date(value);
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  // Función para descargar archivo .ics
  const handleDownloadICS = async () => {
    if (!event?.id) return;
    
    try {
      setIsDownloadingICS(true);
      const blob = await calendarService.downloadICS(event.id);
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `evento-${event.title.replace(/[^a-zA-Z0-9]/g, '-')}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando archivo .ics:', error);
      alert('Error al descargar el archivo de calendario');
    } finally {
      setIsDownloadingICS(false);
    }
  };

  // Función para sincronizar con Google Calendar
  const handleSyncWithGoogle = async () => {
    if (!event?.id) return;
    
    try {
      setIsSyncingGoogle(true);
      const result = await calendarService.syncWithGoogle(event.id);
      
      if (result.success) {
        alert('Evento sincronizado exitosamente con Google Calendar');
      } else {
        alert('Error al sincronizar con Google Calendar');
      }
    } catch (error) {
      console.error('Error sincronizando con Google Calendar:', error);
      alert('Error al sincronizar con Google Calendar');
    } finally {
      setIsSyncingGoogle(false);
    }
  };

  // Función para reenviar invitación
  const handleResendInvitation = async () => {
    if (!event?.id) return;
    
    try {
      const result = await calendarService.resendInvitation(event.id);
      
      if (result.success) {
        alert('Invitación reenviada exitosamente');
      } else {
        alert('Error al reenviar la invitación');
      }
    } catch (error) {
      console.error('Error reenviando invitación:', error);
      alert('Error al reenviar la invitación');
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const isEditing = mode === 'edit';

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <div className="event-modal-header">
          <h3>
            {mode === 'create' && 'Crear Evento'}
            {mode === 'edit' && 'Editar Evento'}
            {mode === 'view' && 'Detalles del Evento'}
          </h3>
          <button className="close-modal-btn" onClick={onClose}>
            <XMarkIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="event-modal-content">
          <div className="form-group">
            <label>
              <TagIcon className="form-icon" />
              Título del evento
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ej: Entrenamiento de fuerza"
              disabled={isReadOnly}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label>
              <UserIcon className="form-icon" />
              Cliente
            </label>
            {isReadOnly ? (
              <input
                type="text"
                value={formData.clientName || ''}
                disabled
                className="readonly-input"
              />
            ) : (
              <select
                value={formData.clientId || ''}
                onChange={(e) => handleClientChange(e.target.value)}
                className={errors.clientId ? 'error' : ''}
                disabled={loadingClients}
              >
                <option value="">
                  {loadingClients ? 'Cargando clientes...' : 'Seleccionar cliente'}
                </option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.email}
                  </option>
                ))}
              </select>
            )}
            {errors.clientId && <span className="error-message">{errors.clientId}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <CalendarIcon className="form-icon" />
                Fecha y hora de inicio
              </label>
              <input
                type="datetime-local"
                value={formatDateTimeLocal(formData.start)}
                onChange={(e) => handleDateTimeChange('start', e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            <div className="form-group">
              <label>
                <ClockIcon className="form-icon" />
                Fecha y hora de fin
              </label>
              <input
                type="datetime-local"
                value={formatDateTimeLocal(formData.end)}
                onChange={(e) => handleDateTimeChange('end', e.target.value)}
                disabled={isReadOnly}
                className={errors.end ? 'error' : ''}
              />
              {errors.end && <span className="error-message">{errors.end}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tipo de evento</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Event['type'] }))}
                disabled={isReadOnly}
              >
                <option value="entrenamiento">Entrenamiento</option>
                <option value="consulta">Consulta</option>
                <option value="evaluacion">Evaluación</option>
                <option value="nutricion">Nutrición</option>
              </select>
            </div>

            <div className="form-group">
              <label>Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Event['status'] }))}
                disabled={isReadOnly}
              >
                <option value="programado">Programado</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>
              <MapPinIcon className="form-icon" />
              Ubicación
            </label>
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Ej: Gimnasio principal, Sala 2"
              disabled={isReadOnly}
            />
          </div>

          <div className="form-group">
            <label>
              <DocumentTextIcon className="form-icon" />
              Descripción
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detalles adicionales del evento..."
              rows={3}
              disabled={isReadOnly}
            />
          </div>
        </form>

        <div className="form-actions">
          {mode === 'view' && (
            <>
              <div className="calendar-actions">
                <button 
                  type="button" 
                  className="btn-calendar-action"
                  onClick={handleDownloadICS}
                  disabled={isDownloadingICS}
                  title="Descargar archivo .ics para añadir a cualquier calendario"
                >
                  <ArrowDownTrayIcon className="btn-icon" />
                  {isDownloadingICS ? 'Descargando...' : 'Descargar .ics'}
                </button>
                
                <button 
                  type="button" 
                  className="btn-calendar-action btn-google"
                  onClick={handleSyncWithGoogle}
                  disabled={isSyncingGoogle}
                  title="Sincronizar con Google Calendar"
                >
                  <CalendarIcon className="btn-icon" />
                  {isSyncingGoogle ? 'Sincronizando...' : 'Añadir a Google'}
                </button>
                
                <button 
                  type="button" 
                  className="btn-calendar-action btn-resend"
                  onClick={handleResendInvitation}
                  title="Reenviar invitación por email"
                >
                  <ShareIcon className="btn-icon" />
                  Reenviar invitación
                </button>
              </div>
              
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cerrar
              </button>
            </>
          )}
          
          {mode === 'create' && (
            <>
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-save" onClick={handleSubmit}>
                Crear Evento
              </button>
            </>
          )}
          
          {mode === 'edit' && (
            <>
              {onDelete && (
                <button type="button" className="btn-delete" onClick={handleDelete}>
                  Eliminar
                </button>
              )}
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-save" onClick={handleSubmit}>
                Guardar Cambios
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventModal;