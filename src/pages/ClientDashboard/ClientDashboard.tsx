import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, FileText, MessageSquare } from 'lucide-react';
import './ClientDashboard.css';
import './force-dark-theme.css';
import SkeletonCard from '../../components/common/SkeletonCard';
import RoutineDetailsModal from '../../components/RoutineDetailsModal';
import ClientNotificationCenter from '../../components/ClientNotificationCenter';
import GoogleCalendarIntegration from '../../components/GoogleCalendarIntegration/GoogleCalendarIntegration';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useClientRoutines } from '../../hooks/useClientRoutines';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';
import TrainingModal from '../../components/client/TrainingModal/TrainingModal';
import CreateTrainingModal from '../../components/client/CreateTrainingModal/CreateTrainingModal';
import EditTrainingModal from '../../components/client/EditTrainingModal/EditTrainingModal';
import EditProfileModal from '../../components/client/EditProfileModal/EditProfileModal';
import PaymentHistoryModal from '../../components/client/PaymentHistoryModal/PaymentHistoryModal';
import { clientApi } from '../../services/api';
import { toast } from 'react-toastify';
import { formatCurrencyARS, calculateAnnualTotal } from '../../utils/payments';
import { useSocket } from '../../hooks/useSocket';
import axios from '../../services/axiosConfig';

interface PaymentStatus {
  status: string;
  amount: number;
  dueDate?: string;
  isUpToDate: boolean;
}
// 🔧 Corrige imágenes que vienen con localhost desde el backend
const normalizeImageUrl = (url?: string) => {
  if (!url) return "";

  const API_BASE = import.meta.env.VITE_API_URL.replace("/api", "");

  // Si viene con localhost, lo convertimos a Render
  return url.startsWith("http://localhost")
    ? url.replace("http://localhost:5002", API_BASE)
    : url;
};

interface ProgressMetrics {
  weight?: string;
  currentWeight?: string;
  weightChange?: string;
  trainingFrequency?: string;
  objective?: string;
}

interface ScheduleItem {
  date: string;
  title?: string;
  type?: string;
}

const mockDashboardData = {
  userName: 'Florencia',
  currentRoutine: {
    name: 'Rutina de Fuerza - Mes 1',
    progress: 60,
    daysCompleted: '3/5 esta semana',
  },
  weeklyProgress: [
    { day: 'Lun', completed: true },
    { day: 'Mar', completed: true },
    { day: 'Mié', completed: false },
    { day: 'Jue', completed: true },
    { day: 'Vie', completed: false },
    { day: 'Sáb', completed: false },
    { day: 'Dom', completed: false },
  ],
  todayExercises: [
    { id: 'ex1', name: 'Sentadilla', sets: '4 x 12', status: 'Pendiente' },
    { id: 'ex2', name: 'Press de banca', sets: '4 x 10', status: 'Pendiente' },
    { id: 'ex3', name: 'Peso muerto', sets: '4 x 8', status: 'Pendiente' },
  ],
  recentAchievements: [
    { id: 'ach1', description: 'Nuevo PR en Peso Muerto: 80kg!' },
    { id: 'ach2', description: 'Completaste 4 semanas seguidas de entrenamiento.' },
  ],
};

// Mock data para el calendario de entrenamientos
const mockTrainingSchedule = [
  {
    id: 1,
    date: new Date(2024, 11, 23), // 23 de diciembre
    type: 'Fuerza - Tren Superior',
    hour: 9,
    minute: 0,
    duration: 1.5,
    exercises: ['Sentadilla', 'Press de banca', 'Remo con barra'],
    location: 'Gimnasio TrainFit'
  },
  {
    id: 2,
    date: new Date(2024, 11, 25), // 25 de diciembre
    type: 'Cardio + Core',
    hour: 18,
    minute: 30,
    duration: 1,
    exercises: ['Cinta', 'Bicicleta', 'Plancha', 'Abdominales'],
    location: 'Gimnasio TrainFit'
  },
  {
    id: 3,
    date: new Date(2024, 11, 27), // 27 de diciembre
    type: 'Fuerza - Tren Inferior',
    hour: 10,
    minute: 0,
    duration: 1.5,
    exercises: ['Peso muerto', 'Sentadilla búlgara', 'Extensiones'],
    location: 'Gimnasio TrainFit'
  },
  {
    id: 4,
    date: new Date(2024, 11, 30), // 30 de diciembre
    type: 'Funcional',
    hour: 16,
    minute: 0,
    duration: 1,
    exercises: ['Burpees', 'Mountain climbers', 'Kettlebell swings'],
    location: 'Gimnasio TrainFit'
  }
];

// Format date as "14 ene 2024" with forced 12:00 to avoid timezone shifts
const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  // Force 12:00 to avoid timezone shifts
  date.setHours(12, 0, 0, 0);
  
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

// Format time as HH:MM in Spanish locale
const formatShortTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

// Format currency amounts for Argentina with proper thousand separators
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(amount);
};

// Calculate next payment date dynamically (monthly cycle) - Always returns a future date
const calculateNextPaymentDate = (): string => {
  const today = new Date();
  // Set to noon to avoid timezone issues
  today.setHours(12, 0, 0, 0);
  
  // Calculate next month's payment date (same day of next month)
  let nextPaymentDate = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
  nextPaymentDate.setHours(12, 0, 0, 0);
  
  // If the calculated date is not in the future or if we're at month end and next month has fewer days
  if (nextPaymentDate <= today || nextPaymentDate.getDate() !== today.getDate()) {
    // Handle month-end edge cases (e.g., Jan 31 -> Feb 28/29)
    const targetDay = Math.min(today.getDate(), new Date(today.getFullYear(), today.getMonth() + 2, 0).getDate());
    nextPaymentDate = new Date(today.getFullYear(), today.getMonth() + 1, targetDay);
    nextPaymentDate.setHours(12, 0, 0, 0);
    
    // If still not in future, add another month
    if (nextPaymentDate <= today) {
      const nextTargetDay = Math.min(today.getDate(), new Date(today.getFullYear(), today.getMonth() + 3, 0).getDate());
      nextPaymentDate = new Date(today.getFullYear(), today.getMonth() + 2, nextTargetDay);
      nextPaymentDate.setHours(12, 0, 0, 0);
    }
  }
  
  return nextPaymentDate.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });
};

const calculatePaymentProgress = (isUpToDate: boolean): { monthsPaid: number, totalMonths: number, percent: number, label: string } => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const totalMonths = 12;
  const monthsPaidRaw = isUpToDate ? currentMonth : currentMonth - 1;
  const monthsPaid = Math.min(totalMonths, Math.max(0, monthsPaidRaw));
  const percent = Math.min(100, Math.max(0, Math.round((monthsPaid / totalMonths) * 100)));
  const label = `${String(monthsPaid).padStart(2, '0')}/${totalMonths} meses`;
  return { monthsPaid, totalMonths, percent, label };
};

// Truncar textos largos para previews de mensajes
const truncate = (text: string, maxLen = 120): string => {
  if (!text) return '';
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
};

const ClientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { clientId } = useParams();
  const { routines: assignedRoutines, loading: isLoadingRoutines } = useClientRoutines();
  
  // Debug logs para rutinas
  useEffect(() => {
    // Removed console.log statements for cleaner production code
  }, [assignedRoutines, isLoadingRoutines]);
  
  // Estados principales
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [progressMetrics, setProgressMetrics] = useState<ProgressMetrics | null>(null);
  const [renderKey, setRenderKey] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [nickname, setNickname] = useState<string>('');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  
  // Google Calendar integration
  const { isAuthenticated, getEvents, googleEvents } = useGoogleCalendar();

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{
    localTrainings: any[];
    googleEvents: any[];
    serverEvents?: CalendarEvent[];
  }>({ localTrainings: [], googleEvents: [], serverEvents: [] });
  const [showCreateTrainingModal, setShowCreateTrainingModal] = useState(false);
  const [createTrainingDate, setCreateTrainingDate] = useState<Date | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [showEditTrainingModal, setShowEditTrainingModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState<any>(null);
  // Añadir contador de mensajes no leídos
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  // Preview del último mensaje recibido
const [lastMessagePreview, setLastMessagePreview] = useState<{ trainerName: string; content: string; time?: string } | null>(null);
  const { subscribeToNotificationEvents, unsubscribeFromNotificationEvents } = useSocket();
  // Highlight del icono 💬 ante nuevos mensajes
  const [isMessageIconHighlight, setIsMessageIconHighlight] = useState(false);
  const prevUnreadRef = useRef<number>(0);
  // Eventos del servidor (rutinas, sesiones, consultas)
  interface CalendarEvent {
    id: string;
    type: 'routine' | 'session' | 'consultation';
    title: string;
    start: Date;
    end: Date;
    status?: string;
    clientId?: string;
  }
  const [serverEvents, setServerEvents] = useState<CalendarEvent[]>([]);
  
  
  // Cargar eventos de Google Calendar cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      getEvents(startOfMonth, endOfMonth);
    }
  }, [isAuthenticated, getEvents]);

  // Cargar eventos del servidor para el cliente (rutinas, sesiones, consultas)
  useEffect(() => {
    const fetchClientCalendarEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const id = clientId || user?.id || localStorage.getItem('userId') || '';
        if (!id || !token) {
          setServerEvents([]);
          return;
        }

        const params = new URLSearchParams();
        params.set('clientId', id);
        // Limitar por mes actual para obtener solo eventos relevantes
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        params.set('startDate', startOfMonth.toISOString());
        params.set('endDate', endOfMonth.toISOString());

        const [routinesRes, sessionsRes, consultationsRes] = await Promise.all([
          axios.get(`/routine-schedule`, { params: Object.fromEntries(params) }),
          axios.get(`/appointments`, { params: Object.fromEntries(params) }),
          axios.get(`/appointments/consultations`, { params: Object.fromEntries(params) })
        ]);

        const routinesJson = routinesRes?.data ?? [];
        const sessionsJson = sessionsRes?.data ?? [];
        const consultationsJson = consultationsRes?.data ?? [];

        const normalizeArray = (raw: any) => Array.isArray(raw) ? raw : (raw?.data || []);
        const normalizeDate = (v: any) => v ? new Date(v) : undefined;

        const mapEvent = (ap: any, forcedType: 'routine' | 'session' | 'consultation'): CalendarEvent | null => {
          const start = normalizeDate(ap.startTime || ap.start || ap.dateStart || ap.start_date);
          const end = normalizeDate(ap.endTime || ap.end || ap.dateEnd || ap.end_date);
          if (!start || !end) return null;
          const title = ap.title || ap.name || (forcedType === 'routine' ? 'Rutina' : forcedType === 'session' ? 'Sesión' : 'Consulta');
          const status = ap.status || ap.state || ap.currentStatus || '';
          const cid = String(ap.clientId || ap.client?.id || ap.client?.clientId || id);
          return {
            id: String(ap.id || ap._id || `${forcedType}-${start.toISOString()}`),
            type: forcedType,
            title,
            start,
            end,
            status,
            clientId: cid
          };
        };

        const onlyActiveForClient = (ev: CalendarEvent | null) => {
          if (!ev) return false;
          const statusUpper = String(ev.status || '').toUpperCase();
          // Mostrar sólo activos; excluir cancelados
          const isActive = statusUpper === 'ACTIVE' || statusUpper === 'SCHEDULED' || statusUpper === '';
          const sameClient = !ev.clientId || ev.clientId === id;
          return isActive && sameClient;
        };

        // Filtrar por tipo real antes de mapear para evitar clasificaciones incorrectas
        const getTypeUpper = (ap: any) => String(ap?.type || ap?.category || ap?.eventType || '').toUpperCase();

        const routines = normalizeArray(routinesJson)
          .filter((ap: any) => getTypeUpper(ap) === 'ROUTINE')
          .map((ap: any) => mapEvent(ap, 'routine'))
          .filter(onlyActiveForClient) as CalendarEvent[];

        const sessions = normalizeArray(sessionsJson)
          .filter((ap: any) => getTypeUpper(ap) === 'SESSION')
          .map((ap: any) => mapEvent(ap, 'session'))
          .filter(onlyActiveForClient) as CalendarEvent[];

        const consultations = normalizeArray(consultationsJson)
          .filter((ap: any) => {
            const t = getTypeUpper(ap);
            return t === 'CONSULTATION' || t === 'CONSULTA' || String(ap?.type).toLowerCase() === 'consultation';
          })
          .map((ap: any) => mapEvent(ap, 'consultation'))
          .filter(onlyActiveForClient) as CalendarEvent[];

        setServerEvents([
          ...routines,
          ...sessions,
          ...consultations
        ]);
      } catch (error) {
        console.error('Error al cargar eventos del servidor:', error);
        setServerEvents([]);
      }
    };

    // Cargar al iniciar y actualizar cuando cambie clientId o user.id
    fetchClientCalendarEvents();

    // Actualizar periódicamente para evitar depender de notificaciones (cada 60s)
    const interval = window.setInterval(fetchClientCalendarEvents, 60000);
    return () => window.clearInterval(interval);
  }, [clientId, user?.id]);

  // Obtener conteo de notificaciones no leídas para la campanita
  useEffect(() => {
    let interval: number | undefined;
    const fetchUnreadCount = async () => {
      try {
        const id = user?.id || localStorage.getItem('userId') || '';
        if (!id) return;
        const { count } = await clientApi.getUnreadNotificationCount(id);
        setUnreadNotifications(count || 0);
      } catch (error) {
        console.error('Error obteniendo conteo de notificaciones:', error);
      }
    };

    // Cargar al iniciar
    fetchUnreadCount();
    // Refrescar periódicamente (cada 30s)
    interval = window.setInterval(fetchUnreadCount, 30000);

    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [user?.id]);

  // Suscribirse a eventos de notificación vía WebSocket
  useEffect(() => {
    subscribeToNotificationEvents({
      onNew: () => {
        setUnreadNotifications((prev) => Math.max((prev || 0) + 1, 1));
      },
      onRead: (payload: any) => {
        if (payload?.all) {
          setUnreadNotifications(0);
        } else {
          setUnreadNotifications((prev) => Math.max((prev || 0) - 1, 0));
        }
      }
    });
    return () => {
      unsubscribeFromNotificationEvents();
    };
  }, [subscribeToNotificationEvents, unsubscribeFromNotificationEvents]);

  // Activar highlight sutil cuando aumenta el conteo de mensajes no leídos
  useEffect(() => {
    if (unreadMessages > (prevUnreadRef.current || 0)) {
      setIsMessageIconHighlight(true);
      const t = window.setTimeout(() => setIsMessageIconHighlight(false), 900);
      return () => window.clearTimeout(t);
    }
    prevUnreadRef.current = unreadMessages;
  }, [unreadMessages]);


  // Función para cargar datos del dashboard
  const loadDashboardData = async () => {
    try {
        setIsLoadingData(true);
        
        // Cargar datos del perfil del usuario
        try {
          // Usar clientId para consistencia con handleUpdateProfile
          const targetId = clientId || user?.id || '';
          
          const profileResponse = await clientApi.getProfile(targetId);
          const profileData = profileResponse.data || profileResponse;
          
          // Actualizar métricas de progreso con datos reales
          const objective = profileData.initialObjective || 
                           (Array.isArray(profileData.goals) ? profileData.goals[0] : profileData.goals) || 
                           'No definido';
          
          // Simplificar métricas usando solo datos del perfil
          const newProgressMetrics = {
            weight: profileData.weight ? `${profileData.weight} kg` : 'No registrado',
            trainingFrequency: profileData.trainingDaysPerWeek ? `${profileData.trainingDaysPerWeek} días/semana` : 'No definido',
            objective: objective
          };
          
          setProgressMetrics(newProgressMetrics);
        
        // Cargar nickname del perfil
        if (profileData.name) {
          setNickname(profileData.name);
        } else if (user?.name) {
          setNickname(user.name);
        }
        
        // Cargar imagen de perfil
        if (profileData.profileImage) {
          setProfileImage(profileData.profileImage);
        }
        
      } catch (profileError) {
        console.error('Error cargando perfil del usuario:', profileError);
        // Usar valores por defecto si no se puede cargar el perfil
        const defaultMetrics = {
          weight: 'No registrado',
          trainingFrequency: 'No definido',
          objective: 'No definido'
        };
        
        setProgressMetrics(defaultMetrics);
        
        if (user?.name) {
          setNickname(user.name);
        }
      }
      
      // Cargar otros datos del dashboard
      setDashboardData(mockDashboardData);
      setPaymentStatus({
        status: 'up-to-date',
        amount: 45000,
         dueDate: '2025-11-04T12:00:00',
          isUpToDate: true
      });
      
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Obtener contador de mensajes no leídos al montar (y cuando cambie el usuario)
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const res = await axios.get(`/messages/unread-count`);
        const payload = res?.data;
        const count = typeof payload?.unreadCount !== 'undefined' ? payload.unreadCount : (payload?.count ?? 0);
        setUnreadMessages(Number(count) || 0);
      } catch (e) {
        setUnreadMessages(0);
      }
    };
    fetchUnreadMessages();
  }, [user]);

  // Obtener el último mensaje recibido y el nombre del entrenador
  useEffect(() => {
    const fetchLastMessage = async () => {
      try {
        const res = await axios.get(`/messages/conversations`);
        const payload: any = res?.data ?? null;
        const items: any[] = Array.isArray(payload)
          ? payload
          : (Array.isArray(payload?.data)
              ? payload.data
              : (Array.isArray(payload?.data?.data) ? payload.data.data : []));
        if (!items || !items.length) {
          setLastMessagePreview(null);
          return;
        }

        const mapped = items
          .map((item: any) => {
            const u = item.user || {};
            const name = u?.trainerProfile?.name || u?.clientProfile?.name || u?.name || u?.email || 'Usuario';
            return {
              name,
              content: item?.lastMessage?.content || '',
              time: item?.lastMessage?.createdAt || ''
            };
          })
          .filter((x: any) => x.content);

        if (!mapped.length) {
          setLastMessagePreview(null);
          return;
        }

        mapped.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());
        const latest = mapped[0];
        setLastMessagePreview({ trainerName: latest.name, content: latest.content, time: latest.time });
      } catch (e) {
        setLastMessagePreview(null);
      }
    };
    fetchLastMessage();
  }, [user]);

  // useEffect para forzar re-render cuando cambien las métricas
  useEffect(() => {
    if (progressMetrics) {
      // Removed console.log for cleaner production code
      setForceUpdate(prev => prev + 1);
    }
  }, [progressMetrics]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Función para generar el calendario correctamente
  const generateCalendarDays = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);
    
    // Día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
    // Convertimos para que lunes sea 0
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Lunes = 0
    
    const daysInMonth = lastDay.getDate();
    const calendarDays = [];
    
    // Agregar días vacíos al inicio
    for (let i = 0; i < startDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Agregar todos los días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(day);
    }
    
    return calendarDays;
  };

  // Función para combinar eventos locales y de Google Calendar
  const getCombinedEventsForDay = (day: number) => {
    const currentDate = new Date();
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    // Filtrar entrenamientos locales para el día específico
    const localTrainings = mockTrainingSchedule.filter(training => {
      const trainingDate = new Date(training.date);
      return trainingDate.getDate() === day &&
             trainingDate.getMonth() === currentDate.getMonth() &&
             trainingDate.getFullYear() === currentDate.getFullYear();
    });
    
    // Filtrar eventos de Google Calendar para el día específico
    const dayGoogleEvents = googleEvents.filter(event => {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      return eventDate.getDate() === day &&
             eventDate.getMonth() === currentDate.getMonth() &&
             eventDate.getFullYear() === currentDate.getFullYear();
    });
    
    // Filtrar eventos del servidor por día
    const dayServerEvents = serverEvents.filter(ev => {
      const d = new Date(ev.start);
      return d.getDate() === day &&
             d.getMonth() === currentDate.getMonth() &&
             d.getFullYear() === currentDate.getFullYear();
    });

    return {
      localTrainings,
      googleEvents: dayGoogleEvents,
      serverEvents: dayServerEvents,
      hasEvents: localTrainings.length > 0 || dayGoogleEvents.length > 0 || dayServerEvents.length > 0,
      hasLocalTraining: localTrainings.length > 0,
      hasGoogleEvent: dayGoogleEvents.length > 0,
      hasServerEvent: dayServerEvents.length > 0,
      hasBoth: (localTrainings.length > 0 && dayGoogleEvents.length > 0) ||
               (localTrainings.length > 0 && dayServerEvents.length > 0) ||
               (dayGoogleEvents.length > 0 && dayServerEvents.length > 0)
    };
  };

  const handleDayClick = (day: number) => {
    const dayEvents = getCombinedEventsForDay(day);
    // Removed console.log for cleaner production code
    
    const currentDate = new Date();
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    setSelectedDate(clickedDate);
    setSelectedDayEvents({
      localTrainings: dayEvents.localTrainings,
      googleEvents: dayEvents.googleEvents,
      serverEvents: dayEvents.serverEvents
    });
    setIsModalOpen(true);
  };

  // Funciones para el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSelectedDayEvents({ localTrainings: [], googleEvents: [], serverEvents: [] });
  };

  const handleEditTraining = (training: any) => {
    setEditingTraining(training);
    setShowEditTrainingModal(true);
  };

  const handleEditTrainingSubmit = async (trainingData: any) => {
    try {
      if (editingTraining?.id) {
        await clientApi.updateTraining(editingTraining.id, trainingData);
        toast.success('Entrenamiento actualizado exitosamente');
      }
      setShowEditTrainingModal(false);
      setEditingTraining(null);
      // Recargar eventos si es necesario
      if (isAuthenticated) {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        getEvents(startOfMonth, endOfMonth);
      }
    } catch (error) {
      console.error('Error al actualizar entrenamiento:', error);
      toast.error('Error al actualizar el entrenamiento');
    }
  };

  const handleCloseEditTrainingModal = () => {
    setShowEditTrainingModal(false);
    setEditingTraining(null);
  };

  const handleDeleteTraining = (trainingId: number) => {
    // Removed console.log for cleaner production code
    toast.info('Función de eliminación en desarrollo');
    // TODO: Implementar eliminación de entrenamientos
  };

  const handleCreateTraining = (date: Date) => {
    setCreateTrainingDate(date);
    setShowCreateTrainingModal(true);
    handleCloseModal();
  };

  const handleCreateTrainingSubmit = async (trainingData: any) => {
    try {
      await clientApi.createTraining(trainingData);
      toast.success('Entrenamiento creado exitosamente');
      setShowCreateTrainingModal(false);
      setCreateTrainingDate(null);
      // Recargar eventos si es necesario
      if (isAuthenticated) {
        const currentDate = new Date();
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        getEvents(startOfMonth, endOfMonth);
      }
    } catch (error) {
      console.error('Error al crear entrenamiento:', error);
      toast.error('Error al crear el entrenamiento');
    }
  };

  const handleCloseCreateTrainingModal = () => {
    setShowCreateTrainingModal(false);
    setCreateTrainingDate(null);
  };

  // Función para actualizar el perfil del cliente
  const handleUpdateProfile = async (profileData: {
    weight: string;
    trainingFrequency: string;
    objective: string;
  }) => {
    if (!clientId) {
      toast.error('Error: ID de cliente no disponible');
      return;
    }
    
    try {
      // Actualizar el perfil usando la API
      const updateResponse = await clientApi.updateProfile(clientId, {
        weight: parseFloat(profileData.weight),
        trainingDaysPerWeek: parseInt(profileData.trainingFrequency),
        initialObjective: profileData.objective
      });
      
      // Recargar todos los datos del dashboard para reflejar los cambios
      
      // Pequeño delay para asegurar que el backend se actualice
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await loadDashboardData();
      
      // Forzar re-render del componente con múltiples estrategias
      setIsLoadingData(false);
      setRenderKey(prev => prev + 1);
      setForceUpdate(prev => prev + 1);
      
      // Forzar actualización adicional después de un breve delay
      setTimeout(() => {
        setForceUpdate(prev => prev + 1);
        // Removed console.log for cleaner production code
      }, 100);
      
      toast.success('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error);
      toast.error('Error al actualizar el perfil');
      throw error;
    }
  };

  // Función para solicitar cambio en el calendario
  const handleRequestChange = () => {
    toast.info('Solicitud de cambio enviada al entrenador');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB');
      return;
    }

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('profileImage', file);

      const response = await clientApi.uploadProfileImage(formData);
      setProfileImage(response.data?.profileImage || response.profileImage);
      toast.success('Imagen de perfil actualizada');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleNicknameUpdate = async () => {
    try {
      // TODO: Implementar API para actualizar perfil
       // await clientApi.updateProfile({ nickname });
      setIsEditingNickname(false);
      toast.success('Nickname actualizado');
    } catch (error) {
      console.error('Error updating nickname:', error);
      toast.error('Error al actualizar el nickname');
    }
  };

  const handleViewPaymentHistory = () => {
    // Siempre inicializar el historial con los montos correctos (9 x 40.000, 3 x 45.000)
    setPaymentHistory([
      { id: '1', date: '2025-12-04T12:00:00', description: 'Cuota mensual - Diciembre 2025', amount: 45000, status: 'pending', method: 'Transferencia bancaria' },
      { id: '2', date: '2025-11-04T12:00:00', description: 'Cuota mensual - Noviembre 2025', amount: 45000, status: 'pending', method: 'Efectivo' },
      { id: '3', date: '2025-10-04T12:00:00', description: 'Cuota mensual - Octubre 2025', amount: 45000, status: 'paid', method: 'Transferencia bancaria' },
      { id: '4', date: '2025-09-04T12:00:00', description: 'Cuota mensual - Septiembre 2025', amount: 40000, status: 'paid', method: 'Efectivo' },
      { id: '5', date: '2025-08-04T12:00:00', description: 'Cuota mensual - Agosto 2025', amount: 40000, status: 'paid', method: 'Transferencia bancaria' },
      { id: '6', date: '2025-07-04T12:00:00', description: 'Cuota mensual - Julio 2025', amount: 40000, status: 'paid', method: 'Efectivo' },
      { id: '7', date: '2025-06-04T12:00:00', description: 'Cuota mensual - Junio 2025', amount: 40000, status: 'paid', method: 'Transferencia bancaria' },
      { id: '8', date: '2025-05-04T12:00:00', description: 'Cuota mensual - Mayo 2025', amount: 40000, status: 'paid', method: 'Efectivo' },
      { id: '9', date: '2025-04-04T12:00:00', description: 'Cuota mensual - Abril 2025', amount: 40000, status: 'paid', method: 'Transferencia bancaria' },
      { id: '10', date: '2025-03-04T12:00:00', description: 'Cuota mensual - Marzo 2025', amount: 40000, status: 'paid', method: 'Efectivo' },
      { id: '11', date: '2025-02-04T12:00:00', description: 'Cuota mensual - Febrero 2025', amount: 40000, status: 'paid', method: 'Transferencia bancaria' },
      { id: '12', date: '2025-01-04T12:00:00', description: 'Cuota mensual - Enero 2025', amount: 40000, status: 'paid', method: 'Efectivo' },
    ]);
    setShowPaymentHistoryModal(true);
  };

  // Abrir modal de calendario/entrenamientos para una fecha específica (desde notificaciones)
  const openTrainingModalForDate = (dateISO?: string) => {
    try {
      const targetDate = dateISO ? new Date(dateISO) : new Date();
      setSelectedDate(targetDate);

      // Filtrar entrenamientos locales por fecha
      const localTrainings = mockTrainingSchedule.filter(training => {
        const d = new Date(training.date);
        return (
          d.getDate() === targetDate.getDate() &&
          d.getMonth() === targetDate.getMonth() &&
          d.getFullYear() === targetDate.getFullYear()
        );
      });

      // Filtrar eventos de Google por fecha
      const dayGoogleEvents = googleEvents.filter(event => {
        const raw = event.start.dateTime || event.start.date || '';
        if (!raw) return false;
        const d = new Date(raw);
        return (
          d.getDate() === targetDate.getDate() &&
          d.getMonth() === targetDate.getMonth() &&
          d.getFullYear() === targetDate.getFullYear()
        );
      });

      // Incluir eventos del servidor en el modal
      const currentDate = new Date();
      const dayServerEvents = serverEvents.filter(ev => {
        const d = new Date(ev.start);
        return (
          d.getDate() === targetDate.getDate() &&
          d.getMonth() === targetDate.getMonth() &&
          d.getFullYear() === targetDate.getFullYear()
        );
      });

      setSelectedDayEvents({ localTrainings, googleEvents: dayGoogleEvents, serverEvents: dayServerEvents });
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error abriendo modal de entrenamientos:', err);
      setIsModalOpen(true);
    }
  };

  const handleMakePayment = () => {
    toast.info('Función de pago en desarrollo');
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (isLoadingData || !dashboardData) {
    return (
      <div className={`client-dashboard-page ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <motion.aside
          className="dashboard-sidebar"
          initial={false}
          animate={{ width: isSidebarOpen ? 250 : 60 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="sidebar-header">
            <motion.h2 
              animate={{ opacity: isSidebarOpen ? 1 : 0, x: isSidebarOpen ? 0 : -10 }}
              transition={{ delay: isSidebarOpen ? 0.1 : 0 }}
            >
              {isSidebarOpen ? "TRAINFIT" : ""} 
            </motion.h2>
            <button onClick={toggleSidebar} className="sidebar-toggle">
              {isSidebarOpen ? '←' : '→'}
            </button>
          </div>
          <nav className="sidebar-nav">
            {isSidebarOpen ? (
              <>
                <a href="#/">Cargando...</a>
                <a href="#/">Cargando...</a>
              </>
            ) : (
              <>
                <a href="#/" title="Cargando">...</a>
                <a href="#/" title="Cargando">...</a>
              </>
            )}
          </nav>
        </motion.aside>
        <div className="dashboard-content-wrapper">
          <header className="dashboard-header">
            <h1>Cargando...</h1>
          </header>
          <main className="dashboard-main-content">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div key={`${renderKey}-${forceUpdate}`} className="client-dashboard-page max-w-[1200px] mx-auto px-6 py-6 md:px-8 md:py-6 overflow-x-hidden">
      {/* Header Principal */}
      <header className="dashboard-header flex items-center justify-between mb-6">
        <div className="user-info">
          <div className="user-avatar relative cursor-pointer" onClick={() => document.getElementById('profile-image-input')?.click()}>
            {profileImage ? (
              <img
  src={normalizeImageUrl(profileImage)}
  alt="Foto de perfil"
  className="w-full h-full object-cover rounded-full"
/>

            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-[0.6rem] font-semibold leading-[1.1]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mb-1">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="17,14 12,9 7,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="9" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Subir imagen</span>
              </div>
            )}
            {isUploadingImage && (
              <div className="absolute inset-0 rounded-full flex items-center justify-center text-white bg-black/70 text-[0.7rem]">
                Subiendo...
              </div>
            )}
          </div>
          <input
            id="profile-image-input"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <div className="user-details">
            <div className="user-name-section">
              {isEditingNickname ? (
                <div className="nickname-edit">
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleNicknameUpdate()}
                    autoFocus
                  />
                  <button onClick={handleNicknameUpdate}>✓</button>
                  <button onClick={() => setIsEditingNickname(false)}>✕</button>
                </div>
              ) : (
                <h1 onClick={() => setIsEditingNickname(true)} className="cursor-pointer">
                  <span className="greeting">Hola, </span>
                  <span className="user-name-display">{nickname || user?.name || 'Usuario'}</span>
                  <span className="wave"> 👋</span>
                </h1>
              )}
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="notification-btn"
            onClick={() => setShowNotificationCenter(!showNotificationCenter)}
          >
            🔔
            {unreadNotifications > 0 && (
              <span className="notification-badge">{unreadNotifications}</span>
            )}
          </button>
          <button className="logout-btn bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold px-5 py-2 rounded-lg" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <div className="dashboard-content grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="dashboard-left-column">
          {/* Rutina del Mes */}
          <div className="dashboard-section routine-overview">
            <div className="card main-routine-card bg-[#1e1e1e] rounded-xl p-6 shadow-md">
              <h2>💪 TU RUTINA DEL MES</h2>
              {!isLoadingRoutines && assignedRoutines.length > 0 ? (
                <div className="routine-content">
                  <div className="routine-name">{assignedRoutines[0]?.name}</div>
                  <div className="routine-objective text-gray-400">🎯 Objetivo: {assignedRoutines[0]?.description || 'Objetivo no especificado'}</div>
                  <div className="routine-week-progress text-gray-400">📅 Rutina activa</div>
                  <button 
                    className="routine-details-btn bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold px-5 py-2 rounded-lg" 
                    onClick={() => {
                      setSelectedRoutine(assignedRoutines[0]);
                      setShowRoutineModal(true);
                    }}
                  >
                    Ver detalles
                  </button>
                  </div>
                ) : isLoadingRoutines ? (
                  <div className="routine-content">
                    <div className="routine-name">Cargando rutina...</div>
                    <div className="routine-objective text-gray-400">⏳ Obteniendo información</div>
                  </div>
                ) : (
                  <div className="routine-content">
                    <div className="routine-name">No hay rutinas asignadas</div>
                    <div className="routine-objective text-gray-400">📞 Contacta a tu entrenador para que te asigne una rutina</div>
                  </div>
                )}
              </div>
            </div>

          {/* Calendario de Entrenamientos */}
          <div className="dashboard-section training-calendar">
            <div className="card bg-[#1e1e1e] rounded-xl p-6 shadow-md">
              <div className="calendar-header">
                <h2>Calendario de entrenamientos</h2>
                <button className="request-change-btn bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold px-5 py-2 rounded-lg" style={{ marginBottom: 8 }} onClick={handleRequestChange}>Solicitar cambio</button>
              </div>
              <div className="calendar-grid">
                {/* Desktop/Tablet Month View */}
                <div className="calendar-day-headers">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
                    <div key={index} className="day-header">{day}</div>
                  ))}
                </div>
                <div className="calendar-days">
                  {generateCalendarDays().map((day, index) => {
                    // Si day es null, es un día vacío
                    if (day === null) {
                      return (
                        <div key={index} className="calendar-day empty">
                        </div>
                      );
                    }
                    
                    const dayEvents = getCombinedEventsForDay(day);
                    const isToday = new Date().getDate() === day && 
                                   new Date().getMonth() === new Date().getMonth() &&
                                   new Date().getFullYear() === new Date().getFullYear();
                    
                    let dayClass = 'calendar-day';
                    if (isToday) dayClass += ' today';
                    if (dayEvents.hasBoth) {
                      dayClass += ' has-both-events';
                    } else if (dayEvents.hasServerEvent) {
                      const hasRoutine = dayEvents.serverEvents?.some(ev => ev.type === 'routine');
                      const hasSession = dayEvents.serverEvents?.some(ev => ev.type === 'session');
                      const hasConsultation = dayEvents.serverEvents?.some(ev => ev.type === 'consultation');
                      // Prioridad visual: sesión (naranja) > consulta (violeta) > rutina (rojo)
                      if (hasSession) dayClass += ' has-server-session';
                      else if (hasConsultation) dayClass += ' has-server-consultation';
                      else if (hasRoutine) dayClass += ' has-server-routine';
                    } else if (dayEvents.hasLocalTraining) {
                      dayClass += ' has-training';
                    } else if (dayEvents.hasGoogleEvent) {
                      dayClass += ' has-google-event';
                    }
                    
                    return (
                      <div 
                        key={index} 
                        className={dayClass}
                        onClick={() => handleDayClick(day)}
                      >
                        <span className="calendar-day-number">{day}</span>
                        {dayEvents.hasEvents && (
                          <div className="day-indicators" style={{ display: 'flex', gap: 4 }}>
                            {dayEvents.hasLocalTraining && <div className="training-indicator" />}
                            {dayEvents.hasGoogleEvent && <div className="google-indicator" />}
                            {dayEvents.hasServerEvent && (
                              <>
                                {/* Indicadores por tipo de evento del servidor */}
                                {dayEvents.serverEvents?.some(ev => ev.type === 'routine') && (
                                  <div title="Rutina" style={{ width: 8, height: 8, borderRadius: 999, background: '#ff4757' }} />
                                )}
                                {dayEvents.serverEvents?.some(ev => ev.type === 'session') && (
                                  <div title="Sesión" style={{ width: 8, height: 8, borderRadius: 999, background: '#f59e0b' }} />
                                )}
                                {dayEvents.serverEvents?.some(ev => ev.type === 'consultation') && (
                                  <div title="Consulta" style={{ width: 8, height: 8, borderRadius: 999, background: '#8b5cf6' }} />
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Weekly Scroll View */}
                <div className="calendar-weekly-mobile">
                  <div className="weekly-scroll-container">
                    {(() => {
                      const today = new Date();
                      const currentWeekDays = [];
                      const startOfWeek = new Date(today);
                      const dayOfWeek = today.getDay();
                      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
                      startOfWeek.setDate(today.getDate() + mondayOffset);

                      // Generate 7 days starting from Monday
                      for (let i = 0; i < 7; i++) {
                        const date = new Date(startOfWeek);
                        date.setDate(startOfWeek.getDate() + i);
                        currentWeekDays.push(date);
                      }

                      return currentWeekDays.map((date, index) => {
                        const dayNumber = date.getDate();
                        const dayName = ['L', 'M', 'M', 'J', 'V', 'S', 'D'][index];
                        const isToday = date.toDateString() === today.toDateString();
                        
                        // Check for training on this day
                        const hasTraining = mockTrainingSchedule.some(training => 
                          training.date.toDateString() === date.toDateString()
                        );
                        
                        const trainingForDay = mockTrainingSchedule.find(training => 
                          training.date.toDateString() === date.toDateString()
                        );

                        let cardClass = 'weekly-day-card';
                        if (isToday) cardClass += ' today';
                        if (hasTraining) cardClass += ' has-training';

                        return (
                          <div 
                            key={index} 
                            className={cardClass}
                            onClick={() => handleDayClick(dayNumber)}
                          >
                            <div className="weekly-day-name">{dayName}</div>
                            <div className="weekly-day-number">{dayNumber}</div>
                            {hasTraining && (
                              <>
                                <div className="weekly-training-indicator"></div>
                                {trainingForDay && (
                                  <div className="weekly-training-type">
                                    {trainingForDay.type.split(' - ')[0]}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
              <div className="calendar-legend">
                <div className="legend-item">
                  <span className="legend-icon" aria-hidden="true">🏋️</span>
                  <span>Entrenamiento local</span>
                </div>
                <div className="legend-item">
                  <span className="legend-icon" aria-hidden="true">📆</span>
                  <span>Evento Google Calendar</span>
                </div>
                <div className="legend-item">
                  <span className="legend-icon" aria-hidden="true">🔁</span>
                  <span>Ambos eventos</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color today"></div>
                  <span>Hoy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Integración Google Calendar */}
          <GoogleCalendarIntegration 
            trainingSchedule={mockTrainingSchedule}
            onSyncComplete={() => {
              toast.success('Entrenamientos sincronizados con Google Calendar');
            }}
          />
        </div>

        <div className="dashboard-right-column">
          {/* Métricas de Progreso */}
          <div className="dashboard-section progress-metrics">
            <div className="card bg-[#1e1e1e] rounded-xl p-6 shadow-md">
              <div className="card-header">
                <h2>Métricas de progreso</h2>
                <button 
                  className="edit-profile-btn bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold px-5 py-2 rounded-lg"
                  onClick={() => setShowEditProfileModal(true)}
                  title="Editar perfil"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Editar perfil
                </button>
              </div>
              <div className="progress-metrics">
                <div className="metric-block">
                  <div className="metric-label">⚖️ Peso actual</div>
                  <div className="metric-value">{progressMetrics?.weight || '-- kg'}</div>
                  <div className="metric-subtext">Inicial: {progressMetrics?.weight || '-- kg'} · {progressMetrics?.weight && progressMetrics.weight !== 'No registrado' ? 'Actualizado' : 'Sin datos'}</div>
                </div>
                <div className="metric-block">
                  <div className="metric-label">📅 Entrenamientos semanales</div>
                  <div className="metric-value">{progressMetrics?.trainingFrequency ? (
                    progressMetrics.trainingFrequency
                  ) : 'No definido'}</div>
                  <div className="metric-subtext">{progressMetrics?.trainingFrequency && progressMetrics.trainingFrequency !== 'No definido' ? 'Configurado' : 'Pendiente'}</div>
                </div>
                <div className="metric-block">
                  <div className="metric-label">🎯 Objetivo</div>
                  <div className="metric-value">{progressMetrics?.objective || 'No definido'}</div>
                  <div className="metric-subtext">{progressMetrics?.objective && progressMetrics.objective !== 'No definido' ? 'Definido' : 'Sin datos'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Mensajes */}
          <div className="dashboard-section messages-card">
            <div className="card rounded-xl p-6 shadow-md">
              <div className="card-header">
                <h2 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  Mensajes
                  <motion.span
                    className="messages-icon"
                    animate={isMessageIconHighlight ? { scale: [1, 1.1, 1], y: [0, -3, 0], opacity: [1, 0.9, 1] } : {}}
                    transition={{ duration: 0.8 }}
                    aria-hidden="true"
                  >
                    💬
                  </motion.span>
                </h2>
              </div>
              {lastMessagePreview?.content && (
                <div className="messages-preview">
                  <div className="messages-preview-name"><strong>{lastMessagePreview.trainerName}</strong></div>
                  <div className="messages-preview-content">{truncate(lastMessagePreview.content, 120)}</div>
                  {lastMessagePreview.time && (
                    <div className="messages-preview-time">{formatShortTime(lastMessagePreview.time)}</div>
                  )}
                </div>
              )}
              <div className="messages-summary">
                {unreadMessages > 0 
                  ? `Tienes ${unreadMessages} mensajes sin leer.` 
                  : '📭 No tienes mensajes nuevos. Mantente atento a las notificaciones de tu entrenador.'}
              </div>

              <div>
                <button
                  className="open-messaging-btn"
                  onClick={() => navigate('/client/messages')}
                  title="Abrir mensajería"
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={16} />
                    {'Ver bandeja'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Estado de Cuotas */}
          <div className="dashboard-section payment-management" style={{ marginTop: 16 }}>
            <div className="card bg-[#1e1e1e] rounded-xl p-6 shadow-md">
              <div className="payment-header">
                <h2>Estado de cuotas</h2>
              </div>
              
              <div className="payment-overview">
                {/* Block 1: Total amount + Monthly fee + status */}
                <div className="payment-block payment-fee-block">
                  <div className="payment-amount-section">
                    <div className="total-label">Total anual</div>
                    <div className="total-value">{formatCurrencyARS((paymentHistory && paymentHistory.length > 0
                      ? calculateAnnualTotal(paymentHistory, 2025)
                      : Array.from({ length: 12 }, (_, i) => i + 1).reduce((sum, month) => sum + (month >= 10 ? 45000 : 40000), 0)
                    ))}</div>
                    <div className="amount-label">Cuota mensual</div>
                    <div className="amount-value">{paymentStatus?.amount ? formatCurrencyARS(paymentStatus.amount) : formatCurrencyARS(45000)}</div>
                  </div>
                  
                  <div className="payment-status-section">
                    <div className={`status-indicator ${paymentStatus?.isUpToDate ? 'paid' : (paymentStatus?.dueDate && new Date(paymentStatus.dueDate) < new Date() ? 'overdue' : 'pending')}`}>
                      {paymentStatus?.isUpToDate ? (
                        <CheckCircle size={16} />
                      ) : (
                        <AlertCircle size={16} />
                      )}
                    </div>
                    <div className="status-details">
                      {!paymentStatus?.isUpToDate && (
                        <div className="status-text">
                          {paymentStatus?.dueDate && new Date(paymentStatus.dueDate) < new Date() ? 'Pago vencido' : 'Pago pendiente'}
                        </div>
                      )}
                      <span className={`status-badge ${paymentStatus?.isUpToDate ? 'up-to-date' : paymentStatus?.dueDate && new Date(paymentStatus.dueDate) < new Date() ? 'overdue' : 'due-soon'}`}>
                        {paymentStatus?.isUpToDate ? 'Al día' : paymentStatus?.dueDate && new Date(paymentStatus.dueDate) < new Date() ? 'Vencida' : 'Por vencer'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Block 2: Next due date with calendar icon */}
                <div className="payment-block payment-date-block">
                  <div className="due-date-section">
                    <div className="due-date-info">
                      <div className="due-date-label">Próximo pago</div>
                      <div className="due-date-row">
                        <div className="due-date-icon" title={(() => {
                          const dueDateStr = paymentStatus?.dueDate;
                          if (!dueDateStr) return '';
                          try {
                            const today = new Date();
                            const baseToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0, 0);
                            const due = new Date(dueDateStr);
                            due.setHours(12, 0, 0, 0);
                            const diffDays = Math.round((due.getTime() - baseToday.getTime()) / (1000 * 60 * 60 * 24));
                            const isUpToDate = !!paymentStatus?.isUpToDate;
                            if (isUpToDate) {
                              if (diffDays === 0) return 'Vence hoy';
                              if (diffDays > 0) return `Vence en ${diffDays} día${diffDays === 1 ? '' : 's'}`;
                              return '';
                            } else {
                              if (diffDays === 0) return 'Vence hoy';
                              if (diffDays > 0) return `Vence en ${diffDays} día${diffDays === 1 ? '' : 's'}`;
                              return `Venció hace ${Math.abs(diffDays)} día${Math.abs(diffDays) === 1 ? '' : 's'}`;
                            }
                          } catch {
                            return '';
                          }
                        })()}>
                          <Clock size={16} />
                        </div>
                        <div className="due-date-value">
                        {calculatePaymentProgress(!!paymentStatus?.isUpToDate).monthsPaid < 12 ? (
                          paymentStatus?.dueDate ? 
                            formatShortDate(paymentStatus.dueDate) : 
                            calculateNextPaymentDate()
                        ) : (
                          'No hay más pagos este año'
                        )}
                      </div>
                      </div>
                      <div className="due-date-relative">
                        {(() => {
                          const dueDateStr = paymentStatus?.dueDate;
                          if (!dueDateStr) return '';
                          try {
                            const today = new Date();
                            const baseToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0, 0);
                            const due = new Date(dueDateStr);
                            due.setHours(12, 0, 0, 0);
                            const diffDays = Math.round((due.getTime() - baseToday.getTime()) / (1000 * 60 * 60 * 24));
                            const isUpToDate = !!paymentStatus?.isUpToDate;
                            if (isUpToDate) {
                              if (diffDays === 0) return 'Vence hoy';
                              if (diffDays > 0) return `Vence en ${diffDays} día${diffDays === 1 ? '' : 's'}`;
                              return '';
                            } else {
                              if (diffDays === 0) return 'Vence hoy';
                              if (diffDays > 0) return `Vence en ${diffDays} día${diffDays === 1 ? '' : 's'}`;
                              return `Venció hace ${Math.abs(diffDays)} día${Math.abs(diffDays) === 1 ? '' : 's'}`;
                            }
                          } catch (e) {
                            return '';
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Block 3: Payment history with progress bar */}
                <div className="payment-block payment-history-block">
                  {(() => {
                    const progress = calculatePaymentProgress(!!paymentStatus?.isUpToDate);
                    return (
                      <div className={`payment-progress ${paymentStatus?.isUpToDate ? 'paid' : (paymentStatus?.dueDate && new Date(paymentStatus.dueDate) < new Date() ? 'overdue' : 'pending')}`}>
                        <div className="progress-title">Historial de pagos</div>
                        <div className="progress-months">{progress.monthsPaid}/{progress.totalMonths} meses</div>
                        <div className="progress-bar centered">
                          <div className="progress-fill" style={{ width: `${progress.percent}%` }}></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
              
              <div className="payment-actions">
                <button className={`btn-payment secondary ${paymentStatus?.isUpToDate ? 'accent-green' : 'accent-amber'} text-white px-5 py-2 rounded-lg`} onClick={handleViewPaymentHistory}>
                  <FileText size={16} />
                  Ver historial
                </button>
                {!paymentStatus?.isUpToDate && (
                  <button className="btn-payment primary bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold px-5 py-2 rounded-lg" onClick={handleMakePayment}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Pagar ahora
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {selectedRoutine && (
         <RoutineDetailsModal
           routineId={selectedRoutine.id}
           isOpen={showRoutineModal}
           onClose={() => {
             setShowRoutineModal(false);
             setSelectedRoutine(null);
           }}
         />
       )}

      <ClientNotificationCenter 
        isOpen={showNotificationCenter}
        onClose={() => {
          setShowNotificationCenter(false);
          // Refrescar conteo al cerrar el centro (por si se leyeron notificaciones)
          (async () => {
            try {
              const id = user?.id || localStorage.getItem('userId') || '';
              if (!id) return;
              const { count } = await clientApi.getUnreadNotificationCount(id);
              setUnreadNotifications(count || 0);
            } catch (error) {
              console.error('Error refrescando conteo de notificaciones:', error);
            }
          })();
        }}
        onOpenRoutineModal={(routineId: string) => {
          // Abrir el mismo modal de "Ver detalles" que usa el botón del dashboard
          setSelectedRoutine({ id: routineId });
          setShowRoutineModal(true);
          setShowNotificationCenter(false);
        }}
        onOpenPaymentHistory={() => {
          handleViewPaymentHistory();
          setShowNotificationCenter(false);
        }}
        onOpenMessages={(trainerId?: string) => {
          const to = trainerId ? `?to=${trainerId}` : '';
          navigate(`/client/messages${to}`);
          setShowNotificationCenter(false);
        }}
        onOpenCalendarEvent={(dateISO?: string) => {
          openTrainingModalForDate(dateISO);
          setShowNotificationCenter(false);
        }}
      />

      {/* Modal de Entrenamientos */}
      <TrainingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedDate={selectedDate}
        localTrainings={selectedDayEvents.localTrainings}
        googleEvents={selectedDayEvents.googleEvents}
        serverEvents={selectedDayEvents.serverEvents || []}
        onEditTraining={handleEditTraining}
        onDeleteTraining={handleDeleteTraining}
        onCreateTraining={handleCreateTraining}
      />

      <CreateTrainingModal
        isOpen={showCreateTrainingModal}
        onClose={handleCloseCreateTrainingModal}
        onCreateTraining={handleCreateTrainingSubmit}
        selectedDate={createTrainingDate}
      />

      <EditTrainingModal
        isOpen={showEditTrainingModal}
        onClose={handleCloseEditTrainingModal}
        trainingData={editingTraining}
        onUpdateTraining={handleEditTrainingSubmit}
      />

      {/* Modal de Editar Perfil */}
      {showEditProfileModal && (
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          currentProfile={progressMetrics}
          onUpdateProfile={handleUpdateProfile}
        />
      )}

      {/* Modal de Historial de Pagos */}
      {showPaymentHistoryModal && (
        <PaymentHistoryModal
          isOpen={showPaymentHistoryModal}
          onClose={() => setShowPaymentHistoryModal(false)}
          paymentHistory={paymentHistory}
        />
      )}
    </div>
  );
};

export default ClientDashboard;
