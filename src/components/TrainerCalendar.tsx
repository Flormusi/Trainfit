import React, { useState, useEffect } from 'react';
import DayEventsModal from './DayEventsModal';
import EventModal from './EventModal';
import './TrainerCalendar.css';
import './responsive-calendar.css';

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

interface TrainerCalendarProps {
  onDayClick?: (day: number, events: TrainingEvent[]) => void;
  onRequestChange?: () => void;
}

const TrainerCalendar: React.FC<TrainerCalendarProps> = ({ 
  onDayClick, 
  onRequestChange 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<TrainingEvent[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Función para obtener eventos desde la API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No hay token de autenticación');
        return;
      }

      const response = await fetch('/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const appointments = await response.json();
        
        // Convertir appointments a formato TrainingEvent
        const trainingEvents: TrainingEvent[] = appointments.map((appointment: any) => ({
          id: appointment.id,
          date: new Date(appointment.startTime).toISOString().split('T')[0],
          title: appointment.title,
          type: 'local' as const,
          clientName: appointment.client?.name || appointment.client?.clientProfile?.name || 'Cliente desconocido',
          time: new Date(appointment.startTime).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          description: appointment.description || 'Sin descripción',
          status: appointment.status?.toLowerCase() === 'completed' ? 'completado' : 
                  appointment.status?.toLowerCase() === 'cancelled' ? 'cancelado' : 'programado'
        }));

        setEvents(trainingEvents);
      } else {
        console.error('Error al obtener appointments:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Generar días del calendario
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    
    // Ajustar al lunes de la semana
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(firstDay.getDate() - daysToSubtract);
    
    const days = [];
    const currentDateForLoop = new Date(startDate);
    
    // Generar 42 días (6 semanas)
    for (let i = 0; i < 42; i++) {
      if (currentDateForLoop.getMonth() === month) {
        days.push(currentDateForLoop.getDate());
      } else {
        days.push(null);
      }
      currentDateForLoop.setDate(currentDateForLoop.getDate() + 1);
    }
    
    return days;
  };

  // Obtener eventos para un día específico
  const getEventsForDay = (day: number) => {
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = targetDate.toISOString().split('T')[0];
    
    const dayEvents = events.filter(event => event.date === dateString);
    
    const localEvents = dayEvents.filter(event => event.type === 'local' || event.type === 'both');
    const googleEvents = dayEvents.filter(event => event.type === 'google' || event.type === 'both');
    
    return {
      events: dayEvents,
      hasEvents: dayEvents.length > 0,
      hasLocalTraining: localEvents.length > 0,
      hasGoogleEvent: googleEvents.length > 0,
      hasBoth: localEvents.length > 0 && googleEvents.length > 0
    };
  };

  const handleDayClick = (day: number) => {
    const dayEvents = getEventsForDay(day);
    setSelectedDay(day);
    setSelectedEvents(dayEvents.events);
    setIsModalOpen(true);
    
    if (onDayClick) {
      onDayClick(day, dayEvents.events);
    }
  };

  const handleRequestChange = () => {
    if (onRequestChange) {
      onRequestChange();
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="trainer-calendar">
      <div className="card">
        <div className="calendar-header">
          <div className="calendar-navigation">
            <button className="nav-btn" onClick={() => navigateMonth('prev')}>
              ‹
            </button>
            <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button className="nav-btn" onClick={() => navigateMonth('next')}>
              ›
            </button>
          </div>
          <div className="calendar-actions">
            <button className="btn-today" onClick={goToToday}>
              Hoy
            </button>
            <button className="btn-calendar-action" onClick={handleRequestChange}>
              Gestionar eventos
            </button>
          </div>
        </div>
        
        <div className="calendar-grid">
          <div className="calendar-day-headers">
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
              <div key={index} className="day-header">{day}</div>
            ))}
          </div>
          
          <div className="calendar-days">
            {generateCalendarDays().map((day, index) => {
              if (day === null) {
                return (
                  <div key={index} className="calendar-day empty"></div>
                );
              }
              
              const dayEvents = getEventsForDay(day);
              const isToday = new Date().getDate() === day && 
                             new Date().getMonth() === currentDate.getMonth() &&
                             new Date().getFullYear() === currentDate.getFullYear();
              
              let dayClass = 'calendar-day';
              if (isToday) dayClass += ' today';
              if (dayEvents.hasBoth) dayClass += ' has-both-events';
              else if (dayEvents.hasLocalTraining) dayClass += ' has-training';
              else if (dayEvents.hasGoogleEvent) dayClass += ' has-google-event';
              
              return (
                <div 
                  key={index} 
                  className={dayClass}
                  onClick={() => handleDayClick(day)}
                >
                  <span className="day-number">{day}</span>
                  {dayEvents.hasEvents && (
                    <div className="day-indicators">
                      {dayEvents.hasLocalTraining && <div className="training-indicator local"></div>}
                      {dayEvents.hasGoogleEvent && <div className="training-indicator google"></div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-color training"></div>
            <span>Entrenamiento local</span>
          </div>
          <div className="legend-item">
            <div className="legend-color google-event"></div>
            <span>Evento Google Calendar</span>
          </div>
          <div className="legend-item">
            <div className="legend-color both-events"></div>
            <span>Ambos eventos</span>
          </div>
          <div className="legend-item">
            <div className="legend-color today"></div>
            <span>Hoy</span>
          </div>
        </div>
      </div>
      
      {/* Modal de eventos */}
      {isModalOpen && selectedDay && (
        <DayEventsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          selectedDay={selectedDay}
          selectedMonth={currentDate.getMonth()}
          selectedYear={currentDate.getFullYear()}
          events={selectedEvents}
          onCreateEvent={() => {
            setIsModalOpen(false);
            setIsCreateModalOpen(true);
          }}
        />
      )}
      
      {/* Modal para crear eventos */}
      {isCreateModalOpen && selectedDay && (
        <EventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          mode="create"
          onSave={async (event) => {
            try {
              const token = localStorage.getItem('token');
              
              if (!token) {
                console.error('No hay token de autenticación');
                return;
              }

              const appointmentData = {
                title: event.title,
                description: event.description,
                startTime: event.start.toISOString(),
                endTime: new Date(event.start.getTime() + 60 * 60 * 1000).toISOString(), // +1 hora por defecto
                clientId: event.clientId,
                location: event.location || '',
                notes: event.notes || ''
              };

              const response = await fetch('/api/appointments', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(appointmentData)
              });

              if (response.ok) {
                const newAppointment = await response.json();
                
                // Convertir el nuevo appointment a formato TrainingEvent
                const newEvent: TrainingEvent = {
                  id: newAppointment.id,
                  date: new Date(newAppointment.startTime).toISOString().split('T')[0],
                  title: newAppointment.title,
                  type: 'local' as const,
                  clientName: newAppointment.client?.name || newAppointment.client?.clientProfile?.name || 'Cliente desconocido',
                  time: new Date(newAppointment.startTime).toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }),
                  description: newAppointment.description || 'Sin descripción',
                  status: 'programado' as const
                };

                // Actualizar la lista de eventos
                setEvents(prev => [...prev, newEvent]);
                setIsCreateModalOpen(false);
              } else {
                console.error('Error al crear appointment:', response.statusText);
              }
            } catch (error) {
              console.error('Error al guardar evento:', error);
            }
          }}
        />
      )}
    </div>
  );
};

export default TrainerCalendar;