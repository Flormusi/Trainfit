import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { FaWeight, FaArrowUp } from 'react-icons/fa';

interface PaymentStatus {
  status: string;
  amount: number;
  dueDate?: string;
  isUpToDate: boolean;
}

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

const ClientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { clientId } = useParams();
  const { routines: assignedRoutines, loading: isLoadingRoutines } = useClientRoutines();
  
  // Debug logs para rutinas
  useEffect(() => {
    console.log('🔍 ClientDashboard - Estado de rutinas:', {
      assignedRoutines,
      isLoadingRoutines,
      length: assignedRoutines?.length || 0
    });
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
  }>({ localTrainings: [], googleEvents: [] });
  const [showCreateTrainingModal, setShowCreateTrainingModal] = useState(false);
  const [createTrainingDate, setCreateTrainingDate] = useState<Date | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showEditTrainingModal, setShowEditTrainingModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState<any>(null);

  // Cargar eventos de Google Calendar cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const currentDate = new Date();
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      getEvents(startOfMonth, endOfMonth);
    }
  }, [isAuthenticated, getEvents]);

  // Función para cargar datos del dashboard
  const loadDashboardData = async () => {
    try {
      console.log('🔄 Iniciando carga de datos del dashboard para usuario:', user?.id);
      console.log('🔄 ClientId actual:', clientId);
      console.log('🔄 ¿Son iguales user.id y clientId?', user?.id === clientId);
      setIsLoadingData(true);
      
      // Cargar datos del perfil del usuario
      try {
        // Usar clientId para consistencia con handleUpdateProfile
        const targetId = clientId || user?.id || '';
        console.log('🎯 Usando ID para getProfile:', targetId);
        
        const profileResponse = await clientApi.getProfile(targetId);
        const profileData = profileResponse.data || profileResponse;
        
        console.log('📋 Datos del perfil cargados desde la API:', profileData);
        console.log('⚖️ Peso específico del perfil:', profileData.weight);
        console.log('🔍 Tipo de dato del peso:', typeof profileData.weight);
        
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
        
        console.log('📊 Construyendo progressMetrics:');
        console.log('  - Peso del perfil:', profileData.weight);
        console.log('  - Peso formateado:', profileData.weight ? `${profileData.weight} kg` : 'No registrado');
        console.log('  - Frecuencia:', profileData.trainingDaysPerWeek);
        console.log('  - Objetivo:', objective);
        console.log('📊 Métricas finales:', newProgressMetrics);
        setProgressMetrics(newProgressMetrics);
        
        // Forzar re-render del componente
        console.log('🔄 Forzando actualización del estado...');
        
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
        
        console.log('⚠️ Usando valores por defecto para progressMetrics:', defaultMetrics);
        setProgressMetrics(defaultMetrics);
        
        if (user?.name) {
          setNickname(user.name);
        }
      }
      
      // Cargar otros datos del dashboard
      setDashboardData(mockDashboardData);
      setPaymentStatus({
        status: 'up-to-date',
        amount: 15000,
        dueDate: '2024-01-15',
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

  // useEffect para forzar re-render cuando cambien las métricas
  useEffect(() => {
    if (progressMetrics) {
      console.log('📊 Métricas actualizadas, forzando re-render:', progressMetrics);
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
    
    return {
      localTrainings,
      googleEvents: dayGoogleEvents,
      hasEvents: localTrainings.length > 0 || dayGoogleEvents.length > 0,
      hasLocalTraining: localTrainings.length > 0,
      hasGoogleEvent: dayGoogleEvents.length > 0,
      hasBoth: localTrainings.length > 0 && dayGoogleEvents.length > 0
    };
  };

  const handleDayClick = (day: number) => {
    const dayEvents = getCombinedEventsForDay(day);
    console.log(`Día ${day} clickeado:`, dayEvents);
    
    const currentDate = new Date();
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    setSelectedDate(clickedDate);
    setSelectedDayEvents({
      localTrainings: dayEvents.localTrainings,
      googleEvents: dayEvents.googleEvents
    });
    setIsModalOpen(true);
  };

  // Funciones para el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSelectedDayEvents({ localTrainings: [], googleEvents: [] });
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
    console.log('Eliminando entrenamiento:', trainingId);
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
      console.log('🔄 Iniciando actualización de perfil:', profileData);
      console.log('📋 Datos que se enviarán al backend:', {
        weight: parseFloat(profileData.weight),
        trainingDaysPerWeek: parseInt(profileData.trainingFrequency),
        initialObjective: profileData.objective
      });
      
      // Actualizar el perfil usando la API
      const updateResponse = await clientApi.updateProfile(clientId, {
        weight: parseFloat(profileData.weight),
        trainingDaysPerWeek: parseInt(profileData.trainingFrequency),
        initialObjective: profileData.objective
      });
      
      console.log('✅ Respuesta del backend:', updateResponse);
      
      // Recargar todos los datos del dashboard para reflejar los cambios
      console.log('🔄 Recargando datos del dashboard...');
      
      // Pequeño delay para asegurar que el backend se actualice
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await loadDashboardData();
      console.log('✅ Datos del dashboard recargados');
      
      // Forzar re-render del componente con múltiples estrategias
      setIsLoadingData(false);
      setRenderKey(prev => prev + 1);
      setForceUpdate(prev => prev + 1);
      
      // Forzar actualización adicional después de un breve delay
      setTimeout(() => {
        setForceUpdate(prev => prev + 1);
        console.log('🔄 Actualización adicional forzada');
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
    setShowPaymentHistoryModal(true);
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
    <div key={`${renderKey}-${forceUpdate}`} className="client-dashboard-page">
      {/* Header Principal */}
      <div className="dashboard-header">
        <div className="user-info">
          <div className="user-avatar" onClick={() => document.getElementById('profile-image-input')?.click()} style={{ cursor: 'pointer', position: 'relative' }}>
            {profileImage ? (
              <img 
                src={profileImage} 
                alt="Foto de perfil" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                height: '100%',
                fontSize: '0.6rem',
                fontWeight: '600',
                textAlign: 'center',
                lineHeight: '1.1'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '4px' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="17,14 12,9 7,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="12" y1="9" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Subir imagen</span>
              </div>
            )}
            {isUploadingImage && (
              <div style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                backgroundColor: 'rgba(0,0,0,0.7)', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.7rem'
              }}>
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
                <h1 onClick={() => setIsEditingNickname(true)} style={{ cursor: 'pointer' }}>
                  {nickname || user?.name || 'Usuario'}
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
          <button className="logout-btn" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="dashboard-content">
        <div className="dashboard-left-column">
          {/* Rutina del Mes */}
          <div className="dashboard-section routine-overview">
            <div className="card main-routine-card">
              <h2>💪 TU RUTINA DEL MES</h2>
              {!isLoadingRoutines && assignedRoutines.length > 0 ? (
                <div className="routine-content">
                  <div className="routine-name">{assignedRoutines[0]?.name}</div>
                  <div className="routine-objective">🎯 Objetivo: {assignedRoutines[0]?.description || 'Objetivo no especificado'}</div>
                  <div className="routine-week-progress">📅 Rutina activa</div>
                  <button 
                    className="btn-primary" 
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
                  <div className="routine-objective">⏳ Obteniendo información</div>
                </div>
              ) : (
                <div className="routine-content">
                  <div className="routine-name">No hay rutinas asignadas</div>
                  <div className="routine-objective">📞 Contacta a tu entrenador para que te asigne una rutina</div>
                </div>
              )}
            </div>
          </div>

          {/* Calendario de Entrenamientos */}
          <div className="dashboard-section training-calendar">
            <div className="card">
              <div className="calendar-header">
                <h2>Calendario de entrenamientos</h2>
                <button className="btn-calendar-action" onClick={handleRequestChange}>Solicitar cambio</button>
              </div>
              <div className="calendar-grid">
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
                            {dayEvents.hasLocalTraining && <div className="training-indicator"></div>}
                            {dayEvents.hasGoogleEvent && <div className="google-indicator"></div>}
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
            <div className="card">
              <div className="card-header">
                <h2>Métricas de progreso</h2>
                <button 
                  className="edit-profile-btn"
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
              <div className="metrics-list">
                <div className="metric-item">
                  <div className="metric-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L8 6h3v12h2V6h3l-4-4z" fill="#ff4757"/>
                      <rect x="2" y="18" width="20" height="2" fill="#ff4757"/>
                    </svg>
                  </div>
                  <div className="metric-info">
                    <div className="metric-name">Peso actual</div>
                    <div className="metric-value">{progressMetrics?.weight || '-- kg'}</div>
                    <div className="metric-subtitle">Inicial: {progressMetrics?.weight || '-- kg'}</div>
                  </div>
                  <div className="metric-trend">{progressMetrics?.weight && progressMetrics.weight !== 'No registrado' ? 'Actualizado' : 'Sin datos'}</div>
                </div>

                <div className="metric-item">
                  <div className="metric-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#ff4757" strokeWidth="2"/>
                      <line x1="16" y1="2" x2="16" y2="6" stroke="#ff4757" strokeWidth="2"/>
                      <line x1="8" y1="2" x2="8" y2="6" stroke="#ff4757" strokeWidth="2"/>
                      <line x1="3" y1="10" x2="21" y2="10" stroke="#ff4757" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="metric-info">
                    <div className="metric-name">Entrenamientos semanales</div>
                    <div className="metric-value">
                      {progressMetrics?.trainingFrequency ? (
                        progressMetrics.trainingFrequency.includes('días/semana') ? (
                          <div className="training-frequency">
                            <span className="frequency-number">{progressMetrics.trainingFrequency.split(' ')[0]}</span>
                            <span className="frequency-text">días/semana</span>
                          </div>
                        ) : progressMetrics.trainingFrequency
                      ) : 'No definido'}
                    </div>
                  </div>
                  <div className="metric-trend">{progressMetrics?.trainingFrequency && progressMetrics.trainingFrequency !== 'No definido' ? 'Configurado' : 'Pendiente'}</div>
                </div>
                <div className="metric-item">
                  <div className="metric-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#ff4757" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="metric-info">
                    <div className="metric-name">Objetivo</div>
                    <div className="metric-value">{progressMetrics?.objective || 'No definido'}</div>
                  </div>
                  <div className="metric-trend">{progressMetrics?.objective && progressMetrics.objective !== 'No definido' ? 'Definido' : 'Sin datos'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Estado de Cuotas */}
          <div className="dashboard-section payment-management">
            <div className="card">
              <div className="payment-header">
                <h2>Estado de cuotas</h2>
                <div className={`status-badge ${paymentStatus?.isUpToDate ? 'up-to-date' : paymentStatus?.dueDate && new Date(paymentStatus.dueDate) < new Date() ? 'overdue' : 'due-soon'}`}>
                  {paymentStatus?.isUpToDate ? 'Al día' : paymentStatus?.dueDate && new Date(paymentStatus.dueDate) < new Date() ? 'Vencida' : 'Por vencer'}
                </div>
              </div>
              
              <div className="payment-overview">
                <div className="payment-main-info">
                  <div className="payment-amount-section">
                    <div className="amount-label">Cuota mensual</div>
                    <div className="amount-value">${paymentStatus?.amount || '--'}</div>
                  </div>
                  
                  <div className="payment-status-section">
                    <div className={`status-indicator ${paymentStatus?.isUpToDate ? 'paid' : 'pending'}`}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        {paymentStatus?.isUpToDate ? (
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        ) : (
                          <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        )}
                      </svg>
                    </div>
                    <div className="status-details">
                      <div className="status-text">
                        {paymentStatus?.isUpToDate ? 'Pago al día' : 'Pago pendiente'}
                      </div>
                      {paymentStatus?.dueDate && (
                        <div className="due-date">
                          {paymentStatus?.isUpToDate ? 
                            `Próximo: ${new Date(paymentStatus.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}` :
                            `Vence: ${new Date(paymentStatus.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`
                          }
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="payment-progress">
                  <div className="progress-info">
                    <span className="progress-label">Historial de pagos</span>
                    <span className="progress-value">11/12 meses</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: '92%'}}></div>
                  </div>
                </div>
              </div>
              
              <div className="payment-actions">
                <button className="btn-payment secondary" onClick={handleViewPaymentHistory}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Ver historial
                </button>
                {!paymentStatus?.isUpToDate && (
                  <button className="btn-payment primary" onClick={handleMakePayment}>
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
        }}
      />

      {/* Modal de Entrenamientos */}
      <TrainingModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedDate={selectedDate}
        localTrainings={selectedDayEvents.localTrainings}
        googleEvents={selectedDayEvents.googleEvents}
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