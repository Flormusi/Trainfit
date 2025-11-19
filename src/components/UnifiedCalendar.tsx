import React, { useState, useEffect } from 'react';
import { Calendar, Views, dateFnsLocalizer, View } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import endOfWeek from 'date-fns/endOfWeek';
import startOfMonth from 'date-fns/startOfMonth';
import endOfMonth from 'date-fns/endOfMonth';
import getDay from 'date-fns/getDay';
import isSameDay from 'date-fns/isSameDay';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, Plus, ArrowLeft, ArrowRight, Edit, Trash2, Check, X, User, Dumbbell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './UnifiedCalendar.css';
import './UnifiedCalendar.override.css';
import { trainerApi } from '../services/api';
import axios from '../services/axiosConfig';
import { Toaster, toast } from 'react-hot-toast';

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
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editValues, setEditValues] = useState({
    title: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const navigate = useNavigate();
  const { width } = useWindowSize();

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    // Usamos valores en español para coincidir con la selección del formulario
    type: 'sesion' as string,
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
  }, [date, view]);

  useEffect(() => {
    if (editingEvent) {
      setEditValues({
        title: editingEvent.title || '',
        startTime: format(new Date(editingEvent.start), "yyyy-MM-dd'T'HH:mm"),
        endTime: format(new Date(editingEvent.end), "yyyy-MM-dd'T'HH:mm"),
        location: editingEvent.location || '',
        description: editingEvent.description || '',
        notes: editingEvent.notes || ''
      });
      setEditing(false);
    }
  }, [editingEvent]);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No hay token de autenticación');
        setEvents([]);
        return;
      }

      // Calcular rango según la vista actual
      let rangeStart: Date;
      let rangeEnd: Date;
      if (view === Views.MONTH) {
        // Incluir todo el mes actual
        rangeStart = startOfWeek(startOfMonth(date), { weekStartsOn: 1 });
        rangeEnd = endOfWeek(endOfMonth(date), { weekStartsOn: 1 });
      } else if (view === Views.WEEK) {
        rangeStart = startOfWeek(date, { weekStartsOn: 1 });
        rangeEnd = endOfWeek(date, { weekStartsOn: 1 });
      } else {
        // Día y Agenda: rango del día seleccionado
        rangeStart = new Date(date);
        rangeStart.setHours(0, 0, 0, 0);
        rangeEnd = new Date(date);
        rangeEnd.setHours(23, 59, 59, 999);
      }

      const params = new URLSearchParams({
        startDate: rangeStart.toISOString(),
        endDate: rangeEnd.toISOString()
      });

      // Realizar llamadas paralelas: rutinas, sesiones (appointments), consultas
      const [routinesRes, appointmentsRes, consultationsRes] = await Promise.all([
        axios.get(`/routine-schedule`, { params: Object.fromEntries(params) }),
        axios.get(`/appointments`, { params: Object.fromEntries(params) }),
        axios.get(`/appointments/consultations`, { params: Object.fromEntries(params) })
      ]);

      const routinesJson = routinesRes?.data ?? [];
      const appointmentsJson = appointmentsRes?.data ?? [];
      const consultationsJson = consultationsRes?.data ?? [];

      const toCalendarEvent = (ap: any): CalendarEvent => {
        const start = new Date(ap.startTime);
        const end = new Date(ap.endTime);
        const clientObj = ap.client || {};
        const clientName = clientObj.name || clientObj.clientProfile?.name || clientObj.email || 'Cliente';
        const rawType = String(ap.type || '').toUpperCase();
        let mappedType: 'routine' | 'session' | 'consultation';
        if (rawType === 'ROUTINE') mappedType = 'routine';
        else if (rawType === 'SESSION') mappedType = 'session';
        else if (rawType === 'CONSULTATION') mappedType = 'consultation';
        else mappedType = 'session';
        return {
          id: String(ap.id),
          title: ap.title || `Sesión - ${clientName}`,
          start,
          end,
          type: mappedType,
          status: ap.status,
          description: ap.description,
          location: ap.location,
          notes: ap.notes,
          client: {
            id: String(clientObj.id || ap.clientId || ''),
            name: String(clientName),
            email: String(clientObj.email || '')
          }
        };
      };

      const routines = (Array.isArray(routinesJson) ? routinesJson : routinesJson?.data || [])
        .filter((ap: any) => ap?.status !== 'CANCELLED')
        .map(toCalendarEvent)
        .filter((ev: CalendarEvent) => ev.type === 'routine');

      const sessions = (Array.isArray(appointmentsJson) ? appointmentsJson : appointmentsJson?.data || [])
        .filter((ap: any) => ap?.status !== 'CANCELLED')
        .map(toCalendarEvent)
        .filter((ev: CalendarEvent) => ev.type === 'session');

      const consultations = (Array.isArray(consultationsJson) ? consultationsJson : consultationsJson?.data || [])
        .filter((ap: any) => ap?.status !== 'CANCELLED')
        .map(toCalendarEvent)
        .filter((ev: CalendarEvent) => ev.type === 'consultation');

      setEvents([...routines, ...sessions, ...consultations]);
    } catch (error) {
      console.error('Error al obtener eventos:', error);
      setEvents([]);
    }
  };

  const fetchClients = async () => {
    try {
      // Usar trainerApi que ya normaliza respuestas del backend
      const res = await trainerApi.getClients();
      const raw = (res && (res as any).data) ? (res as any).data : [];

      // Soportar posibles estructuras: array directo, { clients: [] }, { items: [] }
      const list = Array.isArray(raw)
        ? raw
        : (raw?.clients ?? raw?.items ?? []);

      // Normalizar a la forma esperada por el calendario
      const normalized: Client[] = list.map((c: any) => ({
        id: String(c.id ?? c._id ?? c.clientId ?? ''),
        name: String(c.name ?? c.clientProfile?.nickname ?? c.clientProfile?.name ?? c.email ?? 'Sin nombre'),
        email: String(c.email ?? c.clientProfile?.email ?? '')
      })).filter((c: Client) => c.id);

      setClients(normalized);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      setClients([]);
    }
  };

  // Eliminado: la carga de rutinas ya se maneja desde el endpoint de calendario
  // '/api/routine-schedule' dentro de fetchEvents. Quitamos la llamada redundante
  // a '/api/routines' que provocaba un 404 innecesario.

  const createEvent = async () => {
    if (!newEvent.title || !newEvent.clientId || !newEvent.startTime || !newEvent.endTime) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Soportar valores en español e inglés para decidir endpoint
      const isRoutine = newEvent.type === 'routine' || newEvent.type === 'rutina';
      const endpoint = isRoutine ? '/routine-schedule' : '/appointments';
      const response = await axios.post(endpoint, {
        ...newEvent,
        startTime: new Date(newEvent.startTime).toISOString(),
        endTime: new Date(newEvent.endTime).toISOString()
      });

      if (response.status >= 200 && response.status < 300) {
        toast.success('Evento creado con éxito', {
          duration: 3000,
          style: { background: '#2d2d2d', color: '#fff' }
        });
        setShowCreateModal(false);
        resetNewEvent();
        fetchEvents();
      } else {
        toast.error('Error al procesar la acción', {
          duration: 3000,
          style: { background: '#2d2d2d', color: '#fff' }
        });
      }
    } catch (error) {
      console.error('Error al crear evento:', error);
      toast.error('Error al procesar la acción', {
        duration: 3000,
        style: { background: '#2d2d2d', color: '#fff' }
      });
    } finally {
      setLoading(false);
    }
  };

  const resetNewEvent = () => {
    setNewEvent({
      title: '',
      description: '',
      // Default en español
      type: 'sesion',
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
      const response = await axios.put(`/appointments/${eventId}`, { status });
      if (response.status >= 200 && response.status < 300) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Error al actualizar evento:', error);
    }
  };

  const saveEventChanges = async () => {
    if (!editingEvent) return;
    if (!editValues.title || !editValues.startTime || !editValues.endTime) {
      alert('Completa título e inicio/fin');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`/appointments/${editingEvent.id}`, {
        title: editValues.title,
        description: editValues.description,
        location: editValues.location,
        notes: editValues.notes,
        startTime: new Date(editValues.startTime).toISOString(),
        endTime: new Date(editValues.endTime).toISOString()
      });

      if (response.status >= 200 && response.status < 300) {
        setEditingEvent(null);
        setEditing(false);
        fetchEvents();
      }
    } catch (error) {
      console.error('Error al guardar cambios del evento:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) return;

    try {
      const token = localStorage.getItem('token');
      const event = events.find(e => e.id === eventId);
      const endpoint = event?.type === 'routine' ? `/routine-schedule/${eventId}` : `/appointments/${eventId}`;
      const response = await axios.delete(endpoint);
      if (response.status >= 200 && response.status < 300) {
        // Actualización optimista: quitar del estado local inmediatamente
        setEvents(prev => prev.filter(e => e.id !== eventId));
        // Notificación y cierre de modal
        toast.success('Evento eliminado con éxito', {
          duration: 3000,
          style: { background: '#2d2d2d', color: '#fff' }
        });
        setEditingEvent(null);
      } else {
        toast.error('Error al procesar la acción', {
          duration: 3000,
          style: { background: '#2d2d2d', color: '#fff' }
        });
      }
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      toast.error('Error al procesar la acción', {
        duration: 3000,
        style: { background: '#2d2d2d', color: '#fff' }
      });
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

  const formatTimeRange = (start: string | Date, end: string | Date) => {
    const s = typeof start === 'string' ? new Date(start) : start;
    const e = typeof end === 'string' ? new Date(end) : end;
    const sStr = formatTime(s);
    const eStr = formatTime(e);
    if (s.getTime() === e.getTime()) {
      return sStr;
    }
    return `${sStr}–${eStr}`;
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'routine': return <Dumbbell className="w-4 h-4" />;
      case 'session': return <User className="w-4 h-4" />;
      case 'consultation': return <Clock className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'routine': return 'Rutina';
      case 'session': return 'Sesión';
      case 'consultation': return 'Consulta';
      default: return 'Evento';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Programado';
      case 'CONFIRMED': return 'Confirmado';
      case 'CANCELLED': return 'Cancelado';
      case 'COMPLETED': return 'Completado';
      case 'NO_SHOW': return 'No presentado';
      default: return 'Sin estado';
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
    // Normalización completa del tipo (tildes, mayúsculas y espacios)
    const type = event.type
      ?.toString()
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0301\u0308]/g, '')
      .replace(/\s+/g, '');

    // Asignación explícita de color por tipo, contemplando plurales, con fallback rojo
    let backgroundColor: string;
    if (["rutina", "routine", "rutinas"].includes(type || '')) {
      backgroundColor = '#E53935';
    } else if (["sesion", "session", "sesiones"].includes(type || '')) {
      backgroundColor = '#FB8C00';
    } else if (["consulta", "consultation", "consultas"].includes(type || '')) {
      backgroundColor = '#8E24AA';
    } else {
      backgroundColor = '#E53935';
    }

    // Mantener clases específicas por tipo (incluyendo plurales)
    let className = 'calendar-event';
    if (["rutina", "routine", "rutinas"].includes(type || '')) className += ' event-rutina';
    else if (["sesion", "session", "sesiones"].includes(type || '')) className += ' event-sesion';
    else if (["consulta", "consultation", "consultas"].includes(type || '')) className += ' event-consulta';
    else className += ' event-default';

    // Mantener diseño indicado (bordes, texto blanco, padding)
    return {
      className,
      style: {
        backgroundColor,
        color: 'white',
        borderRadius: '8px',
        borderLeft: `4px solid ${backgroundColor}`,
        padding: '2px 6px'
      }
    };
  };

  // Permitir crear evento haciendo click/selección en el calendario
  const handleSelectSlot = (slotInfo: any) => {
    try {
      const start: Date = slotInfo?.start ? new Date(slotInfo.start) : new Date();
      const end: Date = slotInfo?.end ? new Date(slotInfo.end) : new Date(start.getTime() + 60 * 60 * 1000);

      // Prellenar datos del nuevo evento
      setNewEvent(prev => ({
        ...prev,
        title: prev.title || '',
        startTime: format(start, "yyyy-MM-dd'T'HH:mm"),
        endTime: format(end, "yyyy-MM-dd'T'HH:mm"),
      }));

      setSelectedDate(start);
      setShowCreateModal(true);
    } catch (e) {
      console.error('Error al seleccionar slot:', e);
      setShowCreateModal(true);
    }
  };

  // Click en celda de fecha del MES para prellenar y abrir modal
  const handleDateCellClick = (day: Date) => {
    const start = new Date(day);
    start.setHours(9, 0, 0, 0); // hora por defecto 09:00
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    setNewEvent(prev => ({
      ...prev,
      startTime: format(start, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(end, "yyyy-MM-dd'T'HH:mm"),
    }));
    setSelectedDate(start);
    setShowCreateModal(true);
  };

  // Wrapper para celdas de fecha que captura clic en vista MES
  const DateCellWrapper: React.FC<any> = ({ value, children }) => {
    // Obtener tipos de evento presentes en ese día
    const getTypesForDate = (day: Date): Array<'routine' | 'session' | 'consultation'> => {
      const typeSet = new Set<'routine' | 'session' | 'consultation'>();
      events.forEach(ev => {
        try {
          if (isSameDay(day, ev.start)) {
            typeSet.add(ev.type);
          }
        } catch {}
      });
      return Array.from(typeSet);
    };

    const types = getTypesForDate(value);
    const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (view !== Views.MONTH) return;
      const target = e.target as HTMLElement;
      // No interferir con clics en eventos dentro de la celda
      if (target && (target.closest('.rbc-event') || target.closest('.rbc-event-content') || target.closest('.rbc-event-label'))) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      handleDateCellClick(value as Date);
    };
    return (
      <div onClick={onClick} className="date-cell-wrapper" role="button" tabIndex={0}>
        {children}
        {view === Views.MONTH && types.length > 0 && (
          <div className="day-markers" aria-hidden>
            {types.includes('routine') && <span className="day-marker marker-rutina" />}
            {types.includes('session') && <span className="day-marker marker-sesion" />}
            {types.includes('consultation') && <span className="day-marker marker-consulta" />}
          </div>
        )}
      </div>
    );
  };

  // Componente de evento personalizado con tooltip en hover
  const EventComponent: React.FC<{ event: CalendarEvent }> = ({ event }) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const time = `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
    const emoji = event.type === 'routine' ? '🔴' : event.type === 'session' ? '🟠' : '🟣';
    return (
      <div title={`${emoji} ${event.title} · ${time}`}>{event.title}</div>
    );
  };

  return (
    <div className="unified-calendar">
      <Toaster position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#2d2d2d', color: '#fff' }
        }}
      />
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
                  className="btn-nav"
                  onClick={() => {
                    // Navegar a la fecha anterior según la vista actual
                    const current = new Date(date);
                    if (view === Views.MONTH) {
                      current.setMonth(current.getMonth() - 1);
                    } else if (view === Views.WEEK) {
                      current.setDate(current.getDate() - 7);
                    } else {
                      current.setDate(current.getDate() - 1);
                    }
                    setDate(current);
                  }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
                <button 
                  className="btn-today"
                  onClick={() => setDate(new Date())}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Hoy</span>
                </button>
                <button 
                  className="btn-nav"
                  onClick={() => {
                    // Navegar a la fecha siguiente según la vista actual
                    const current = new Date(date);
                    if (view === Views.MONTH) {
                      current.setMonth(current.getMonth() + 1);
                    } else if (view === Views.WEEK) {
                      current.setDate(current.getDate() + 7);
                    } else {
                      current.setDate(current.getDate() + 1);
                    }
                    setDate(current);
                  }}
                >
                  <span>Siguiente</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="toolbar-right">
                <div className="view-selector">
                  <button 
                    className={`btn-view ${view === Views.MONTH ? 'active' : ''}`}
                    onClick={() => setView(Views.MONTH)}
                  >
                    <span>Mes</span>
                  </button>
                  <button 
                    className={`btn-view ${view === Views.WEEK ? 'active' : ''}`}
                    onClick={() => setView(Views.WEEK)}
                  >
                    <span>Semana</span>
                  </button>
                  <button 
                    className={`btn-view ${view === Views.DAY ? 'active' : ''}`}
                    onClick={() => setView(Views.DAY)}
                  >
                    <span>Día</span>
                  </button>
                  <button 
                    className={`btn-view ${view === Views.AGENDA ? 'active' : ''}`}
                    onClick={() => setView(Views.AGENDA)}
                  >
                    <span>Agenda</span>
                  </button>
                </div>
              </div>
            </div>
            {view === Views.AGENDA && (
              <p style={{ color: '#B0B0B0', marginBottom: 12 }}>
                La agenda muestra un listado de eventos por fecha. Usa "Nuevo Evento" para crear uno.
              </p>
            )}

            <Calendar
              {...({ showCurrentTimeIndicator: false } as any)}
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              onSelectEvent={handleEventClick}
              selectable
              onSelectSlot={handleSelectSlot}
              eventPropGetter={eventStyleGetter}
              view={view}
              onView={setView}
              date={date}
              onNavigate={setDate}
              components={{ dateCellWrapper: DateCellWrapper, event: EventComponent }}
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

        {/* Leyenda inferior con puntos de color y etiquetas */}
        <div className="calendar-legend">
          <div className="legend-items">
            <div className="legend-item"><span className="legend-dot legend-rutina" /> <span>Rutinas</span></div>
            <div className="legend-item"><span className="legend-dot legend-sesion" /> <span>Sesiones</span></div>
            <div className="legend-item"><span className="legend-dot legend-consulta" /> <span>Consultas</span></div>
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
                    onChange={(e) => setNewEvent({...newEvent, type: e.target.value})}
                    className="form-select"
                  >
                    <option value="sesion">Sesión</option>
                    <option value="consulta">Consulta</option>
                    <option value="rutina">Rutina</option>
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
                        {client.name || client.email}
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

      {/* Modal para ver detalles de evento (sesión/consulta) */}
      {editingEvent && (
        <div className="event-modal-overlay" onClick={() => setEditingEvent(null)}>
          <div className="event-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <span className={`type-dot ${editingEvent.type === 'routine' ? 'dot-rutina' : editingEvent.type === 'session' ? 'dot-sesion' : 'dot-consulta'}`}></span>
                {getTypeLabel(editingEvent.type)}
                {`  —  `}
                {editingEvent.client?.name || editingEvent.client?.email || 'Cliente'}
              </h2>
              <button
                onClick={() => setEditingEvent(null)}
                className="modal-close"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-form" style={{ display: 'grid', gap: 12 }}>
              {!editing ? (
                <>
                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group" style={{ display: 'grid', gap: 6 }}>
                      <label className="form-label">Tipo</label>
                      <div className="form-input" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {getEventTypeIcon(editingEvent.type)}
                        <span>{getTypeLabel(editingEvent.type)}</span>
                      </div>
                    </div>
                    <div className="form-group" style={{ display: 'grid', gap: 6 }}>
                      <label className="form-label">Estado</label>
                      <div className="form-input">{getStatusLabel(editingEvent.status)}</div>
                    </div>
                  </div>

                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group" style={{ display: 'grid', gap: 6 }}>
                      <label className="form-label">Cliente</label>
                      <div className="form-input">{editingEvent.client?.name || editingEvent.client?.email || '—'}</div>
                    </div>
                    <div className="form-group" style={{ display: 'grid', gap: 6 }}>
                      <label className="form-label">Horario</label>
                      <div className="form-input">{new Date(editingEvent.start).toLocaleDateString('es-ES')} • {formatTimeRange(editingEvent.start, editingEvent.end)}</div>
                    </div>
                  </div>

                  {editingEvent.location && (
                    <div className="form-group" style={{ display: 'grid', gap: 6 }}>
                      <label className="form-label">Ubicación</label>
                      <div className="form-input">{editingEvent.location}</div>
                    </div>
                  )}

                  {editingEvent.description && (
                    <div className="form-group" style={{ display: 'grid', gap: 6 }}>
                      <label className="form-label">Descripción</label>
                      <div className="form-textarea" style={{ whiteSpace: 'pre-wrap' }}>{editingEvent.description}</div>
                    </div>
                  )}

                  {editingEvent.notes && (
                    <div className="form-group" style={{ display: 'grid', gap: 6 }}>
                      <label className="form-label">Notas</label>
                      <div className="form-textarea" style={{ whiteSpace: 'pre-wrap' }}>{editingEvent.notes}</div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group" style={{ display: 'grid', gap: 6 }}>
                      <label className="form-label">Título *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={editValues.title}
                        onChange={(e) => setEditValues({ ...editValues, title: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group" style={{ display: 'grid', gap: 6 }}>
                      <label className="form-label">Inicio *</label>
                      <input
                        type="datetime-local"
                        className="form-input"
                        value={editValues.startTime}
                        onChange={(e) => setEditValues({ ...editValues, startTime: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ display: 'grid', gap: 6 }}>
                      <label className="form-label">Fin *</label>
                      <input
                        type="datetime-local"
                        className="form-input"
                        value={editValues.endTime}
                        onChange={(e) => setEditValues({ ...editValues, endTime: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ display: 'grid', gap: 6 }}>
                    <label className="form-label">Ubicación</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editValues.location}
                      onChange={(e) => setEditValues({ ...editValues, location: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ display: 'grid', gap: 6 }}>
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={editValues.description}
                      onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ display: 'grid', gap: 6 }}>
                    <label className="form-label">Notas</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={editValues.notes}
                      onChange={(e) => setEditValues({ ...editValues, notes: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="modal-actions" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                {!editing ? (
                  <>
                    <button type="button" className="btn-secondary" onClick={() => setEditing(true)}>
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn-confirm"
                      onClick={() => { updateEventStatus(editingEvent.id, 'CONFIRMED'); setEditingEvent(null); }}
                      title="Confirmar"
                    >
                      Confirmar
                    </button>
                    <button
                      type="button"
                      className="btn-completed"
                      onClick={() => { updateEventStatus(editingEvent.id, 'COMPLETED'); setEditingEvent(null); }}
                      title="Marcar como completado"
                    >
                      Completado
                    </button>
                    <button
                      type="button"
                      className="btn-no-show"
                      onClick={() => { updateEventStatus(editingEvent.id, 'NO_SHOW'); setEditingEvent(null); }}
                      title="Marcar como no presentado"
                    >
                      No presentado
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => { updateEventStatus(editingEvent.id, 'CANCELLED'); setEditingEvent(null); }}
                      title="Cancelar evento"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => { deleteEvent(editingEvent.id); setEditingEvent(null); }}
                      title="Eliminar evento"
                    >
                      Eliminar
                    </button>
                    <button type="button" className="btn-close-primary" onClick={() => setEditingEvent(null)}>
                      Cerrar
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn-close-primary" onClick={() => setEditing(false)}>
                      Cancelar edición
                    </button>
                    <button
                      type="button"
                      className="btn-save"
                      onClick={saveEventChanges}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="loading-spinner"></span>
                          Guardando...
                        </>
                      ) : (
                        'Guardar cambios'
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedCalendar;