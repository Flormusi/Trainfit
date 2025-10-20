import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  UsersIcon,
  FireIcon,
  ChartBarIcon,
  CreditCardIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  PlusIcon,
  PlusCircleIcon,
  BookOpenIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  BellIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { Dumbbell } from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate } from "react-router-dom";
import { trainerApi, AnalyticsData } from "../services/api";
import api from "../services/api";
import NotificationCenter from "../components/NotificationCenter";
import DashboardCharts from "../components/charts/DashboardCharts";
import RoutineManagement from "../components/RoutineManagement";
import "./TrainerDashboard.css";

interface DashboardData {
  clientCount: number;
  routineCount: number;
  exerciseCount: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  status?: "active" | "overdue";
}

const TrainerDashboard: React.FC = () => {
  // Flag de visibilidad del botón "Seguridad" en Acciones Rápidas.
  // Colocar en `true` para reactivar el botón en el dashboard.
  const SHOW_SECURITY = false;
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    clientCount: 0,
    routineCount: 0,
    exerciseCount: 0,
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoutineManagement, setShowRoutineManagement] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener datos del dashboard
        const dashboardResponse = await trainerApi.getDashboardData();
        
        if (dashboardResponse?.data) {
          setDashboardData(dashboardResponse.data);
        }

        // Obtener clientes
        const clientsResponse = await trainerApi.getClients();
        
        if (clientsResponse?.data) {
          setClients(clientsResponse.data);
        }

        // Obtener analytics
        const analyticsResponse = await trainerApi.getAnalytics(selectedPeriod);
        
        if (analyticsResponse?.data) {
          setAnalyticsData(analyticsResponse.data);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        
        // Si hay error de autenticación, redirigir al login
        if ((error as any)?.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, selectedPeriod]);

  // Cálculos de métricas
  const activeClients = clients.filter(client => !client.status || client.status !== 'overdue').length;
  const overduePayments = clients.filter(client => client.status === 'overdue').length;

  const handleCreateRoutineClick = () => navigate("/trainer/create-routine");
  const handleAddClientClick = () => navigate("/add-client");
  const handleCalendarClick = () => navigate("/trainer/calendar");
  const handleViewClientsClick = () => navigate("/trainer/clients");
  const handleMessagesClick = () => navigate("/trainer/messages");
  const handleSecurityClick = () => navigate("/trainer/security");
  const handleViewRoutinesClick = () => setShowRoutineManagement(true);

  const unassignedRoutines = Math.max(
    0,
    (dashboardData?.routineCount || 0) - activeClients
  );

  if (loading) {
    return (
      <div className="trainer-dashboard">
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="trainer-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="trainfit-logo">
            TRAINFIT <Dumbbell className="logo-icon" />
          </h1>
          <div className="greeting">
            <h2>¡Hola, Maga!</h2>
            <p>Aquí tienes un resumen de tu actividad</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="notification-btn"
            title="Notificaciones"
            aria-label="Abrir notificaciones"
            onClick={() => setShowNotifications(true)}
          >
            <BellIcon className="notification-icon" />
          </button>
          <button className="logout-btn" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Resumen General */}
      <section className="summary-section">
        <h2 className="section-title">
          <ChartBarIcon className="section-icon" />
          Resumen general
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="summary-card">
            <UsersIcon className="card-icon" />
            <div className="card-content">
              <h3>Alumnos Activos</h3>
              <p className="card-number">{activeClients}</p>
              <span className="variation positive">+5% esta semana</span>
            </div>
          </div>
          <div className="summary-card">
            <FireIcon className="card-icon" />
            <div className="card-content">
              <h3>Sesiones Activas Hoy</h3>
              <p className="card-number">{Math.floor(activeClients * 0.7)}</p>
              <span className="info-text">Última: hace 2h</span>
            </div>
          </div>
          <div className="summary-card">
            <ChartBarIcon className="card-icon" />
            <div className="card-content">
              <h3>Progreso Promedio</h3>
              <div className="progress-container">
                <div className="progress-circle">
                  <span className="progress-percentage">{activeClients > 0 ? 78 : 0}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="summary-card">
            <CreditCardIcon className="card-icon" />
            <div className="card-content">
              <h3>Cuotas Vencidas</h3>
              <p className="card-number">{overduePayments}</p>
              <span className="variation neutral">Todo al día</span>
            </div>
          </div>
          <div className="summary-card">
            <ClipboardDocumentListIcon className="card-icon" />
            <div className="card-content">
              <h3>Rutinas sin Asignar</h3>
              <p className="card-number">{unassignedRoutines}</p>
              <span className="variation neutral">
                {unassignedRoutines > 0 ? "Listas para usar" : "Todas asignadas"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Acciones Rápidas */}
      <section className="actions-section">
        <h2 className="section-title">
          <SparklesIcon className="section-icon" />
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <button onClick={handleAddClientClick} className="action-btn primary">
            <PlusIcon className="action-icon" />
            Agregar alumno
          </button>
          <button onClick={handleViewClientsClick} className="action-btn">
            <UsersIcon className="action-icon" />
            Alumnos
          </button>
          <button onClick={handleCreateRoutineClick} className="action-btn primary">
            <PlusCircleIcon className="action-icon" />
            Crear nueva rutina
          </button>
          <button onClick={handleViewRoutinesClick} className="action-btn">
            <BookOpenIcon className="action-icon" />
            Biblioteca de rutinas
          </button>
          <button onClick={handleCalendarClick} className="action-btn">
            <CalendarIcon className="action-icon" />
            Calendario
          </button>
          <button onClick={handleMessagesClick} className="action-btn">
            <ChatBubbleLeftRightIcon className="action-icon" />
            Mensajes
          </button>
          {/* Oculto intencionalmente: botón "Seguridad" desactivado en la UI.
              La ruta /trainer/security y su funcionalidad siguen activas.
              Poner SHOW_SECURITY en `true` para volver a mostrar el botón. */}
          {SHOW_SECURITY && (
            <button onClick={handleSecurityClick} className="action-btn">
              <ShieldCheckIcon className="action-icon" />
              Seguridad
            </button>
          )}
        </div>
      </section>

      {/* Gráficos */}
      <section className="charts-section">
        <h2 className="section-title">
          <ChartBarIcon className="section-icon" />
          Gráficos de Progreso
        </h2>
        <DashboardCharts />
      </section>

      {/* Analíticas */}
      <section className="analytics-section">
        <h2 className="section-title">
          <ChartBarIcon className="section-icon" />
          Analíticas de Rendimiento
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="summary-card">
            <ArrowTrendingUpIcon className="card-icon" />
            <div className="card-content">
              <h3>Rutinas Creadas</h3>
              <p className="card-number">
                {analyticsData?.routinesCreated || 0}
              </p>
              <span className="variation positive">+12% vs periodo anterior</span>
            </div>
          </div>
          <div className="summary-card">
            <UsersIcon className="card-icon" />
            <div className="card-content">
              <h3>Nuevos Clientes</h3>
              <p className="card-number">{analyticsData?.newClients || 0}</p>
              <span className="variation positive">+15% vs periodo anterior</span>
            </div>
          </div>
          <div className="summary-card">
            <ChartBarIcon className="card-icon" />
            <div className="card-content">
              <h3>Actualizaciones de Progreso</h3>
              <p className="card-number">
                {analyticsData?.progressUpdates || 0}
              </p>
              <span className="variation positive">+8% actualizaciones</span>
            </div>
          </div>
        </div>
      </section>

      <NotificationCenter
        isVisible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
      <RoutineManagement
        isOpen={showRoutineManagement}
        onClose={() => setShowRoutineManagement(false)}
      />
    </div>
  );
};

export default TrainerDashboard;