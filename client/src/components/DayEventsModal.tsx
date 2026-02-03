import React from 'react';
import { XMarkIcon, CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import './DayEventsModal.css';

interface TrainingEvent {
  id: string;
  date: string;
  title: string;
  type: 'local' | 'google' | 'both';
  clientName?: string;
  time?: string;
  description?: string;
  status?: 'programado' | 'completado' | 'cancelado';
}

interface DayEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDay: number;
  selectedMonth: number;
  selectedYear: number;
  events: TrainingEvent[];
  onCreateEvent?: () => void;
}

const DayEventsModal: React.FC<DayEventsModalProps> = ({
  isOpen,
  onClose,
  selectedDay,
  selectedMonth,
  selectedYear,
  events,
  onCreateEvent
}) => {
  if (!isOpen) return null;

  const formatDate = () => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    const dayName = dayNames[date.getDay()];
    
    return `${dayName}, ${selectedDay} de ${months[selectedMonth]} ${selectedYear}`;
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'local': return 'Entrenamiento Local';
      case 'google': return 'Evento Google';
      case 'both': return 'Ambos';
      default: return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'programado': return 'Programado';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      default: return 'Programado';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completado': return 'status-completed';
      case 'cancelado': return 'status-cancelled';
      default: return 'status-scheduled';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'local': return 'type-local';
      case 'google': return 'type-google';
      case 'both': return 'type-both';
      default: return 'type-local';
    }
  };

  return (
    <div className="day-events-modal-overlay" onClick={onClose}>
      <div className="day-events-modal" onClick={(e) => e.stopPropagation()}>
        <div className="day-events-modal-header">
          <div className="header-content">
            <CalendarIcon className="calendar-icon" />
            <div className="header-text">
              <h2>Eventos programados</h2>
              <p className="date-subtitle">{formatDate()}</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <XMarkIcon />
          </button>
        </div>

        <div className="day-events-modal-content">
          {events.length > 0 ? (
            <div className="events-list">
              {events.map((event) => (
                <div key={event.id} className={`event-card ${getTypeColor(event.type)}`}>
                  <div className="event-header">
                    <h3 className="event-title">{event.title}</h3>
                    <span className={`event-status ${getStatusColor(event.status || 'programado')}`}>
                      {getStatusLabel(event.status || 'programado')}
                    </span>
                  </div>
                  
                  <div className="event-details">
                    {event.time && (
                      <div className="event-detail">
                        <ClockIcon className="detail-icon" />
                        <span>{event.time}</span>
                      </div>
                    )}
                    
                    {event.clientName && (
                      <div className="event-detail">
                        <UserIcon className="detail-icon" />
                        <span>{event.clientName}</span>
                      </div>
                    )}
                    
                    <div className="event-detail">
                      <span className="event-type-badge">{getEventTypeLabel(event.type)}</span>
                    </div>
                  </div>
                  
                  {event.description && (
                    <div className="event-description">
                      <p>{event.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-events">
              <CalendarIcon className="no-events-icon" />
              <h3>No hay eventos programados</h3>
              <p>No tienes ningún evento programado para este día.</p>
            </div>
          )}

          <div className="modal-actions">
            {onCreateEvent && (
              <button className="btn-create-event" onClick={onCreateEvent}>
                Crear nuevo evento
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayEventsModal;