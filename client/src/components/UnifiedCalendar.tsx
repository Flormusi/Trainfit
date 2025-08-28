import React, { useState, useEffect } from 'react';
import { Calendar, Views, dateFnsLocalizer, View } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, Plus, ArrowLeft, Edit, Trash2, Check, X, User, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './UnifiedCalendar.css';

// Hook personalizado para detectar el tamaño de ventana
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Configuración del localizador para español
const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => {
    return startOfWeek(date, { weekStartsOn: 1 });
  },
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'routine' | 'session' | 'consultation';
  status?: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  description?: string;
  location?: string;
  notes?: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  routine?: {
    id: string;
    name: string;
    type: string;
  };
  allDay?: boolean;
  color?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface Routine {
  id: string;
  name: string;
  type: string;
}

const UnifiedCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();
  const { width } = useWindowSize();

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'session' as 'routine' | 'session' | 'consultation',
    clientId: '',
    routineId: '',
    startTime: '',
    endTime: '',
    location: '',
    notes: ''
  });

  useEffect(() => {
    fetchEvents();
    fetchClients();
    fetchRoutines();
  }, [selectedDate]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Obtener rutinas programadas
      const routinesResponse = await fetch('/api/routine-schedule', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Obtener sesiones/citas
      const sessionsResponse = await fetch('/api/appointments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const routineEvents: CalendarEvent[] = [];
      const sessionEvents: CalendarEvent[] = [];

      if (routinesResponse.ok) {
        const routinesData = await routinesResponse.json();
        // Procesar datos de rutinas...
      }

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        // Procesar datos de sesiones...
      }

      // Por ahora, usar datos de ejemplo
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Rutina de Fuerza - Juan Pérez',
          start: new Date(2024, 0, 15, 10, 0),
          end: new Date(2024, 0, 15, 11, 0),
          type: 'routine',
          client: { id: 'client1', name: 'Juan Pérez', email: 'juan@email.com' },
          routine: { id: 'routine1', name: 'Rutina de Fuerza', type: 'Fuerza' },
          color: '#4CAF50'
        },
        {
          id: '2',
          title: 'Sesión Personal - María López',
          start: new Date(2024, 0, 16, 15, 0),
          end: new Date(2024, 0, 16, 16, 0),
          type: 'session',
          status: 'CONFIRMED',
          client: { id: 'client2', name: 'María López', email: 'maria@email.com' },
          location: 'Gimnasio Principal',
          color: '#2196F3'
        },
        {
          id: '3',
          title: 'Consulta Nutricional - Carlos Rodríguez',
          start: new Date(2024, 0, 17, 9, 0),
          end: new Date(2024, 0, 17, 10, 0),
          type: 'consultation',
          status: 'SCHEDULED',
          client: { id: 'client3', name: 'Carlos Rodríguez', email: 'carlos@email.com' },
          location: 'Oficina',
          color: '#9C27B0'
        }
      ];

      setEvents(mockEvents);
    } catch (error) {
      console.error('Error al obtener eventos:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.data || []);
      }
    } catch (error) {
      console.error('Error al obtener clientes:', error);
    }
  };

  const fetchRoutines = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/routines', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setRoutines(data.data || []);
      }
    } catch (error) {
      console.error('Error al obtener rutinas:', error);
    }
  };

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.clientId || !newEvent.startTime || !newEvent.endTime) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = newEvent.type === 'routine' ? '/api/routine-schedule' : '/api/appointments';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newEvent,
          startTime: new Date(newEvent.startTime).toISOString(),
          endTime: new Date(newEvent.endTime).toISOString()
        })
      });

      if (response.ok) {
        setShowCreateModal(false);
        resetNewEvent();
        fetchEvents();
      }
    } catch (error) {
      console.error('Error al crear evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetNewEvent = () => {
    setNewEvent({
      title: '',
      description: '',
      type: 'session',
      clientId: '',
      routineId: '',
      startTime: '',
      endTime: '',
      location: '',
      notes: ''
    });
  };

  const updateEventStatus = async (eventId: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/appointments/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Error al actualizar evento:', error);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) return;

    try {
      const token = localStorage.getItem('token');
      const event = events.find(e => e.id === eventId);
      const endpoint = event?.type === 'routine' ? `/api/routine-schedule/${eventId}` : `/api/appointments/${eventId}`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Error al eliminar evento:', error);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    if (event.type === 'routine') {
      // Navegar a detalles de rutina
      navigate(`/trainer/routines/${event.routine?.id}`);
    } else {
      // Mostrar detalles de sesión/cita
      setEditingEvent(event);
    }
  };

  const formatTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'routine': return <Dumbbell className="w-4 h-4" />;
      case 'session': return <User className="w-4 h-4" />;
      case 'consultation': return <Clock className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getEventTypeText = (type: string) => {
    switch (type) {
      case 'routine': return 'Rutina';
      case 'session': return 'Sesión';
      case 'consultation': return 'Consulta';
      default: return type;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'NO_SHOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Programada';
      case 'CONFIRMED': return 'Confirmada';
      case 'CANCELLED': return 'Cancelada';
      case 'COMPLETED': return 'Completada';
      case 'NO_SHOW': return 'No asistió';
      default: return status || 'Sin estado';
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    let className = 'calendar-event';
    
    // Añadir clase específica según el tipo de evento
    switch (event.type) {
      case 'routine':
        className += ' event-routine';
        break;
      case 'session':
        className += ' event-session';
        break;
      case 'consultation':
        className += ' event-consultation';
        break;
      default:
        className += ' event-default';
    }
    
    return { 
      className,
      style: {
        border: 'none',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '500'
      }
    };
  };

  return (
    <div className="unified-calendar">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="calendar-header">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/trainer-dashboard')}
              className="flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al Dashboard
            </button>
          </div>
          
          <div className="flex flex-col items-center">
            <h1 className="calendar-title flex items-center">
              <CalendarIcon className="w-8 h-8 mr-3 text-red-500" />
              Calendario Unificado
            </h1>
            <p className="text-gray-400">Gestiona rutinas, sesiones y consultas en un solo lugar</p>
          </div>
          
          <div className="calendar-actions">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-create-event"
              style={{
                width: width <= 768 ? '100%' : 'auto',
                maxWidth: width <= 768 ? '300px' : 'none',
                margin: width <= 768 ? '0 auto' : '0',
                padding: width <= 480 ? '14px 20px' : width <= 768 ? '16px 24px' : '12px 24px',
                fontSize: width <= 480 ? '0.9rem' : width <= 768 ? '1rem' : '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: width <= 768 ? 'center' : 'flex-start',
                gap: '8px'
              }}
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Evento</span>
            </button>
          </div>
        </div>

        {/* Calendario */}
        <div className="calendar-container">
          <div className="unified-calendar-container">
            <div className="calendar-toolbar">
              <div className="toolbar-left">
                <button 
                  className="btn-today"
                  onClick={() => setDate(new Date())}
                >
                  Hoy
                </button>
              </div>
              <div className="toolbar-right">
                <div className="view-selector">
                  <button 
                    className={`btn-view ${view === Views.MONTH ? 'active' : ''}`}
                    onClick={() => setView(Views.MONTH)}
                  >
                    Mes
                  </button>
                  <button 
                    className={`btn-view ${view === Views.WEEK ? 'active' : ''}`}
                    onClick={() => setView(Views.WEEK)}
                  >
                    Semana
                  </button>
                  <button 
                    className={`btn-view ${view === Views.DAY ? 'active' : ''}`}
                    onClick={() => setView(Views.DAY)}
                  >
                    Día
                  </button>
                </div>
              </div>
            </div>

            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
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
          </div>
        </div>

        {/* Leyenda */}
        <div className="calendar-legend">
          <h3 className="legend-title">Leyenda</h3>
          <div className="legend-items">
            <div className="legend-item">
              <div className="legend-color routine"></div>
              <span className="legend-text">Rutinas</span>
            </div>
            <div className="legend-item">
              <div className="legend-color session"></div>
              <span className="legend-text">Sesiones</span>
            </div>
            <div className="legend-item">
              <div className="legend-color consultation"></div>
              <span className="legend-text">Consultas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para crear nuevo evento */}
      {showCreateModal && (
        <div className="event-modal-overlay">
          <div className="event-modal">
            <div className="modal-header">
              <h2 className="modal-title">Nuevo Evento</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetNewEvent();
                }}
                className="modal-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form className="modal-form" onSubmit={(e) => { e.preventDefault(); createEvent(); }}>
              <div className="form-row-triple">
                <div className="form-group">
                  <label className="form-label">Tipo *</label>
                  <select
                    value={newEvent.type}
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})}
                    className="form-select"
                  >
                    <option value="session">Sesión</option>
                    <option value="consultation">Consulta</option>
                    <option value="routine">Rutina</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Cliente *</label>
                  <select
                    value={newEvent.clientId}
                    onChange={(e) => setNewEvent({...newEvent, clientId: e.target.value})}
                    className="form-select"
                  >
                    <option value="">Seleccionar</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Título *</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="form-input"
                    placeholder="Ej: Sesión"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Inicio *</label>
                  <input
                    type="datetime-local"
                    value={newEvent.startTime}
                    onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Fin *</label>
                  <input
                    type="datetime-local"
                    value={newEvent.endTime}
                    onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
            
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetNewEvent();
                  }}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-save"
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Creando...
                    </>
                  ) : (
                    'Crear'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedCalendar;