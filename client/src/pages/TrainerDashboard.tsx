import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PlusIcon, ClipboardDocumentListIcon, PlusCircleIcon, ChartBarIcon, CalendarIcon, UsersIcon, ChatBubbleLeftRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { trainerApi, AnalyticsData } from '../services/api';
import NotificationCenter from '../components/NotificationCenter';
import DashboardCharts from '../components/charts/DashboardCharts';
import './TrainerDashboard.css';

interface DashboardData {
  clientCount: number;
  routineCount: number;
  exerciseCount: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  lastActivity?: string;
  status?: 'active' | 'overdue';
  goal?: string;
  clientProfile?: {
    initialObjective?: string;
    [key: string]: any;
  };
}

const TrainerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    clientCount: 0,
    routineCount: 0,
    exerciseCount: 0
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('week');
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  // useEffect para monitorear cambios en el estado de clientes
  useEffect(() => {
    console.log('🔍 Estado de clientes actualizado:', clients);
    console.log('🔍 Número de clientes:', clients.length);
    if (clients.length > 0) {
      console.log('🔍 Primer cliente:', clients[0]);
    }
  }, [clients]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log('🔄 Iniciando carga de datos del dashboard...');
        setLoading(true);
        
        // Cargar los datos secuencialmente para mejor depuración
        console.log('🔄 Obteniendo datos del dashboard...');
        const dashboardResponse = await trainerApi.getDashboardData();
        console.log('✅ Datos del dashboard obtenidos:', dashboardResponse);
        
        console.log('🔄 Obteniendo clientes...');
        const clientsResponse = await trainerApi.getClients();
        console.log('✅ Clientes obtenidos:', clientsResponse);
        
        console.log('🔄 Obteniendo analíticas...');
        const analyticsResponse = await trainerApi.getAnalytics(selectedPeriod);
        console.log('✅ Analíticas obtenidas:', analyticsResponse);
        
        // Verificar si dashboardResponse.data existe y tiene la estructura esperada
        if (dashboardResponse && dashboardResponse.data) {
          setDashboardData(dashboardResponse.data);
        } else {
          console.error('Error: dashboardResponse.data es undefined o no tiene la estructura esperada');
          // Mantener los valores por defecto definidos en el estado inicial
        }
        
        // Procesar la respuesta de clientes
        if (clientsResponse && clientsResponse.data) {
          console.log('=== PROCESANDO CLIENTES ===');
          console.log('clientsResponse:', clientsResponse);
          console.log('clientsResponse.data:', clientsResponse.data);
          
          // El controlador mejorado devuelve { data: { clients: [...], pagination: {...} } }
          let clientsData = [];
          
          if (Array.isArray(clientsResponse.data)) {
            // Formato anterior: { data: clients[] }
            clientsData = clientsResponse.data;
          } else if (clientsResponse.data.clients && Array.isArray(clientsResponse.data.clients)) {
            // Formato nuevo: { data: { clients: [...], pagination: {...} } }
            clientsData = clientsResponse.data.clients;
          }
          
          console.log('Clientes procesados:', clientsData);
          console.log('Número de clientes:', clientsData.length);
          
          if (clientsData.length > 0) {
            console.log('Primer cliente:', clientsData[0]);
          }
          
          console.log('🔄 Estableciendo clientes en el estado:', clientsData);
          setClients(clientsData);
        } else {
          console.error('❌ Error: clientsResponse no tiene la estructura esperada');
          console.error('clientsResponse:', clientsResponse);
          setClients([]);
        }
        
        setAnalyticsData(analyticsResponse?.data || null);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedPeriod]);

  const handleCreateRoutineClick = () => {
    navigate('/trainer/create-routine'); 
  };

  const handleAddClientClick = () => {
    navigate('/add-client');
  };

  const handleRecordProgress = () => {
    navigate('/trainer/record-progress');
  };

  const handleCalendarClick = () => {
    navigate('/trainer/calendar');
  };

  const handleViewClientsClick = () => {
    navigate('/trainer/clients');
  };

  const handleMessagesClick = () => {
    navigate('/trainer/messages');
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  // Calcular estadísticas
  const activeClients = clients.filter(client => client.status !== 'overdue').length;
  const overduePayments = clients.filter(client => client.status === 'overdue').length;
  // Asegurarse de que dashboardData.routineCount existe antes de usarlo
  const unassignedRoutines = Math.max(0, (dashboardData?.routineCount || 0) - activeClients);

  if (loading) {
    return (
      <div className="trainer-dashboard">
        <div className="loading-container">
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="trainer-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <img 
            src="/images/trainfit-logo.svg" 
            alt="TrainFit Logo" 
            className="trainfit-logo"
          />
          <div className="greeting">
            <h1>¡Hola, Maga!</h1>
            <p>Aquí tienes un resumen de tu actividad</p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(true)}
            title="Notificaciones"
          >
            <svg className="notification-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v2.25l2.25 2.25v2.25h-15V14.25L6 12V9.75a6 6 0 0 1 6-6z" />
            </svg>
          </button>
          <button className="logout-btn" onClick={logout}>
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Resumen General */}
      <section className="summary-section">
        <h2 className="section-title">Resumen general</h2>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Alumnos activos:</span>
            <span className="summary-value">{activeClients}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Cuotas vencidas:</span>
            <span className="summary-value">{overduePayments}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Rutinas sin asignar:</span>
            <span className="summary-value">{unassignedRoutines}</span>
          </div>
        </div>
      </section>

      {/* Acciones Rápidas */}
      <section className="actions-section">
        <h2 className="section-title">Acciones rápidas</h2>
        <div className="actions-grid">
          <button onClick={handleAddClientClick} className="action-btn add-client">
            <PlusIcon className="action-icon" />
            <span>Agregar alumno</span>
          </button>
          <button onClick={handleViewClientsClick} className="action-btn view-clients">
            <UsersIcon className="action-icon" />
            <span>Alumnos</span>
          </button>
          <button onClick={handleCreateRoutineClick} className="action-btn create-routine">
            <PlusCircleIcon className="action-icon" />
            <span>Crear nueva rutina</span>
          </button>
          <button onClick={handleCalendarClick} className="action-btn calendar-btn">
            <CalendarIcon className="action-icon" />
            <span>Calendario</span>
          </button>
          <button onClick={handleMessagesClick} className="action-btn messages-btn">
            <ChatBubbleLeftRightIcon className="action-icon" />
            <span>Mensajes</span>
          </button>
        </div>
      </section>

      {/* Gráficos de Progreso */}
      <section className="charts-section">
        <h2 className="section-title">
          <ChartBarIcon className="analytics-icon" />
          Gráficos de Progreso
        </h2>
        <DashboardCharts />
      </section>

      {/* Analíticas */}
      <section className="analytics-section">
        <div className="analytics-header">
          <h2 className="section-title">
            <ChartBarIcon className="analytics-icon" />
            Analíticas de Rendimiento
          </h2>
          <div className="period-selector">
            <button 
              className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('week')}
            >
              Semana
            </button>
            <button 
              className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('month')}
            >
              Mes
            </button>
            <button 
              className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('year')}
            >
              Año
            </button>
          </div>
        </div>
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-card-header">
              <h3>Rutinas Creadas</h3>
              <span className="analytics-period">
                {selectedPeriod === 'week' ? 'Esta semana' : 
                 selectedPeriod === 'month' ? 'Este mes' : 'Este año'}
              </span>
            </div>
            <div className="analytics-value">{analyticsData?.routinesCreated || 0}</div>
            <div className="analytics-description">
              Nuevas rutinas diseñadas para tus clientes
            </div>
          </div>
          <div className="analytics-card">
            <div className="analytics-card-header">
              <h3>Nuevos Clientes</h3>
              <span className="analytics-period">
                {selectedPeriod === 'week' ? 'Esta semana' : 
                 selectedPeriod === 'month' ? 'Este mes' : 'Este año'}
              </span>
            </div>
            <div className="analytics-value">{analyticsData?.newClients || 0}</div>
            <div className="analytics-description">
              Clientes que se unieron a tu entrenamiento
            </div>
          </div>
          <div className="analytics-card">
            <div className="analytics-card-header">
              <h3>Actualizaciones de Progreso</h3>
              <span className="analytics-period">
                {selectedPeriod === 'week' ? 'Esta semana' : 
                 selectedPeriod === 'month' ? 'Este mes' : 'Este año'}
              </span>
            </div>
            <div className="analytics-value">{analyticsData?.progressUpdates || 0}</div>
            <div className="analytics-description">
              Registros de progreso completados por clientes
            </div>
          </div>
        </div>
      </section>

      {/* Notification Center */}
      <NotificationCenter 
        isVisible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};

export default TrainerDashboard;