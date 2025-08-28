import React from 'react';
import './TrainingModal.css';

interface Training {
  id: number;
  date: Date;
  type: string;
  hour: number;
  minute: number;
  duration: number;
  exercises: string[];
  location: string;
}

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  description?: string;
  location?: string;
}

interface TrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  localTrainings: Training[];
  googleEvents: GoogleCalendarEvent[];
  onEditTraining?: (training: Training) => void;
  onDeleteTraining?: (trainingId: number) => void;
  onCreateTraining?: (date: Date) => void;
}

const TrainingModal: React.FC<TrainingModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  localTrainings,
  googleEvents,
  onEditTraining,
  onDeleteTraining,
  onCreateTraining
}) => {
  if (!isOpen || !selectedDate) return null;

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const formatGoogleEventTime = (event: GoogleCalendarEvent) => {
    if (event.start?.dateTime) {
      const startTime = new Date(event.start.dateTime);
      return startTime.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    return 'Todo el día';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="training-modal-overlay" onClick={onClose}>
      <div className="training-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📅 {formatDate(selectedDate)}</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          {/* Entrenamientos Locales */}
          {localTrainings.length > 0 && (
            <div className="training-section">
              <h3>🏋️‍♂️ Entrenamientos Programados</h3>
              {localTrainings.map((training) => (
                <div key={training.id} className="training-card">
                  <div className="training-info">
                    <div className="training-header">
                      <h4>{training.type}</h4>
                      <div className="training-time">
                        {formatTime(training.hour, training.minute)} 
                        ({training.duration}h)
                      </div>
                    </div>
                    <div className="training-details">
                      <p><strong>📍 Ubicación:</strong> {training.location}</p>
                      <p><strong>💪 Ejercicios:</strong></p>
                      <ul className="exercises-list">
                        {training.exercises.map((exercise, index) => (
                          <li key={index}>{exercise}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="training-actions">
                    {onEditTraining && (
                      <button 
                        className="btn-edit"
                        onClick={() => onEditTraining(training)}
                      >
                        ✏️ Editar
                      </button>
                    )}
                    {onDeleteTraining && (
                      <button 
                        className="btn-delete"
                        onClick={() => onDeleteTraining(training.id)}
                      >
                        🗑️ Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Eventos de Google Calendar */}
          {googleEvents.length > 0 && (
            <div className="training-section">
              <h3>📅 Eventos de Google Calendar</h3>
              {googleEvents.map((event) => (
                <div key={event.id} className="google-event-card">
                  <div className="event-info">
                    <div className="event-header">
                      <h4>{event.summary}</h4>
                      <div className="event-time">
                        {formatGoogleEventTime(event)}
                      </div>
                    </div>
                    {event.description && (
                      <p className="event-description">{event.description}</p>
                    )}
                    {event.location && (
                      <p><strong>📍 Ubicación:</strong> {event.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sin eventos */}
          {localTrainings.length === 0 && googleEvents.length === 0 && (
            <div className="no-events">
              <p>No hay entrenamientos programados para este día.</p>
              {onCreateTraining && (
                <button 
                  className="btn-create"
                  onClick={() => onCreateTraining(selectedDate)}
                >
                  ➕ Crear Entrenamiento
                </button>
              )}
            </div>
          )}

          {/* Botón para crear nuevo entrenamiento */}
          {(localTrainings.length > 0 || googleEvents.length > 0) && onCreateTraining && (
            <div className="create-training-section">
              <button 
                className="btn-create"
                onClick={() => onCreateTraining(selectedDate)}
              >
                ➕ Añadir Entrenamiento
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingModal;