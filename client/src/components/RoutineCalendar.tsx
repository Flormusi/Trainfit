import React, { useState, useEffect } from 'react';
import { Calendar, Views, dateFnsLocalizer, View } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './RoutineCalendar.css';
import { trainerApi } from '../services/api';

// Configuración del localizador para español
const locales = {
  'es': es,
};

// Crear el localizador con date-fns
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => {
    // Configurar para que la semana comience el lunes
    return startOfWeek(date, { weekStartsOn: 1 });
  },
  getDay,
  locales,
});

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  clientId?: string;
  clientName?: string;
  routineId?: string;
  routineName?: string;
  allDay?: boolean;
  color?: string;
}

interface RoutineCalendarProps {
  onEventClick?: (event: Event) => void;
}

const RoutineCalendar: React.FC<RoutineCalendarProps> = ({ onEventClick }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const fetchRoutineSchedule = async () => {
      setLoading(true);
      try {
        // Aquí se conectaría con el backend para obtener las rutinas programadas
        // Por ahora, usaremos datos de ejemplo
        const mockEvents: Event[] = [
          {
            id: '1',
            title: 'Rutina de Fuerza - Juan Pérez',
            start: new Date(2023, 6, 10, 10, 0),
            end: new Date(2023, 6, 10, 11, 0),
            clientId: 'client1',
            clientName: 'Juan Pérez',
            routineId: 'routine1',
            routineName: 'Rutina de Fuerza',
            color: '#4CAF50'
          },
          {
            id: '2',
            title: 'Cardio - María López',
            start: new Date(2023, 6, 12, 15, 0),
            end: new Date(2023, 6, 12, 16, 0),
            clientId: 'client2',
            clientName: 'María López',
            routineId: 'routine2',
            routineName: 'Cardio',
            color: '#2196F3'
          },
          {
            id: '3',
            title: 'Yoga - Carlos Rodríguez',
            start: new Date(2023, 6, 14, 9, 0),
            end: new Date(2023, 6, 14, 10, 30),
            clientId: 'client3',
            clientName: 'Carlos Rodríguez',
            routineId: 'routine3',
            routineName: 'Yoga',
            color: '#9C27B0'
          }
        ];

        // Actualizar los eventos con la fecha actual
        const currentDate = new Date();
        const updatedEvents = mockEvents.map(event => {
          const startDate = new Date(event.start);
          const endDate = new Date(event.end);
          
          // Ajustar al mes y año actuales
          startDate.setFullYear(currentDate.getFullYear());
          startDate.setMonth(currentDate.getMonth());
          endDate.setFullYear(currentDate.getFullYear());
          endDate.setMonth(currentDate.getMonth());
          
          // Asegurarse de que las fechas estén en el futuro
          if (startDate < currentDate) {
            startDate.setDate(startDate.getDate() + 7);
            endDate.setDate(endDate.getDate() + 7);
          }
          
          return {
            ...event,
            start: startDate,
            end: endDate
          };
        });

        setEvents(updatedEvents);
      } catch (error) {
        console.error('Error al cargar el calendario de rutinas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutineSchedule();
  }, []);

  const handleEventClick = (event: Event) => {
    if (onEventClick) {
      onEventClick(event);
    } else {
      // Comportamiento predeterminado si no se proporciona un manejador
      alert(`Evento: ${event.title}\nCliente: ${event.clientName}\nRutina: ${event.routineName}`);
    }
  };

  const eventStyleGetter = (event: Event) => {
    const style = {
      backgroundColor: event.color || '#3174ad',
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: 'none',
      display: 'block'
    };
    return {
      style
    };
  };

  return (
    <div className="routine-calendar-container">
      {loading ? (
        <div className="calendar-loading">
          <div className="spinner"></div>
          <p>Cargando calendario...</p>
        </div>
      ) : (
        <>
          <div className="calendar-header">
            <button 
              className="today-btn"
              onClick={() => setDate(new Date())}
            >
              Hoy
            </button>
            <div className="view-selector">
              <button 
                className={`view-btn ${view === Views.MONTH ? 'active' : ''}`}
                onClick={() => setView(Views.MONTH)}
              >
                Mes
              </button>
              <button 
                className={`view-btn ${view === Views.WEEK ? 'active' : ''}`}
                onClick={() => setView(Views.WEEK)}
              >
                Semana
              </button>
              <button 
                className={`view-btn ${view === Views.DAY ? 'active' : ''}`}
                onClick={() => setView(Views.DAY)}
              >
                Día
              </button>
            </div>
          </div>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            onSelectEvent={handleEventClick}
            eventPropGetter={eventStyleGetter}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            messages={{
              next: "Siguiente",
              previous: "Anterior",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
              agenda: "Agenda",
              date: "Fecha",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "No hay eventos en este rango",
            }}
          />
        </>
      )}
    </div>
  );
};

export default RoutineCalendar;