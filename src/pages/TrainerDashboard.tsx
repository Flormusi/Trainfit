import React, { useState, useEffect, useRef } from "react";
import LoadingScreen from "../components/common/LoadingScreen";
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
import toast from "react-hot-toast";

const PaymentInfoSection: React.FC = () => {
  const [info, setInfo] = useState({ mpLink: '', cbu: '', alias: '', bankName: '', monthlyFee: '' });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    trainerApi.getPaymentInfo().then(res => {
      if (res?.data) {
        setInfo({
          mpLink: res.data.mpLink || '',
          cbu: res.data.cbu || '',
          alias: res.data.alias || '',
          bankName: res.data.bankName || '',
          monthlyFee: res.data.monthlyFee ? String(res.data.monthlyFee) : '',
        });
      }
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await trainerApi.savePaymentInfo({
        mpLink: info.mpLink || undefined,
        cbu: info.cbu || undefined,
        alias: info.alias || undefined,
        bankName: info.bankName || undefined,
        monthlyFee: info.monthlyFee ? parseFloat(info.monthlyFee) : undefined,
      });
      toast.success('Datos de cobro guardados');
      setEditing(false);
    } catch {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #3a3a3a', background: '#111', color: '#fff',
    fontSize: 14, boxSizing: 'border-box', outline: 'none'
  };

  const hasData = info.mpLink || info.cbu || info.alias;

  return (
    <section style={{ padding: '0 24px 24px' }}>
      <div style={{ background: '#1e1e1e', borderRadius: 12, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 18, fontWeight: 700 }}>💳 Mis datos de cobro</h2>
          {!editing && (
            <button onClick={() => setEditing(true)} style={{ background: '#2a2a2a', color: '#e5e7eb', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              {hasData ? 'Editar' : 'Configurar'}
            </button>
          )}
        </div>

        {!editing ? (
          <div>
            {!hasData && !info.monthlyFee ? (
              <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
                Configurá tus datos de cobro para que los alumnos puedan pagar y recibir recordatorios con la info correcta.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {info.mpLink && <div style={{ color: '#e5e7eb', fontSize: 14 }}><span style={{ color: '#6b7280' }}>Link MP:</span> <a href={info.mpLink} target="_blank" rel="noreferrer" style={{ color: '#009ee3' }}>{info.mpLink}</a></div>}
                {info.cbu && <div style={{ color: '#e5e7eb', fontSize: 14 }}><span style={{ color: '#6b7280' }}>CBU:</span> <span style={{ fontFamily: 'monospace' }}>{info.cbu}</span></div>}
                {info.alias && <div style={{ color: '#e5e7eb', fontSize: 14 }}><span style={{ color: '#6b7280' }}>Alias:</span> <span style={{ fontFamily: 'monospace' }}>{info.alias}</span></div>}
                {info.bankName && <div style={{ color: '#e5e7eb', fontSize: 14 }}><span style={{ color: '#6b7280' }}>Banco:</span> {info.bankName}</div>}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ color: '#9ca3af', fontSize: 12, display: 'block', marginBottom: 4 }}>Link de Mercado Pago</label>
              <input style={inputStyle} type="url" placeholder="https://link.mercadopago.com.ar/..." value={info.mpLink} onChange={e => setInfo(p => ({ ...p, mpLink: e.target.value }))} />
            </div>
            <div>
              <label style={{ color: '#9ca3af', fontSize: 12, display: 'block', marginBottom: 4 }}>CBU</label>
              <input style={inputStyle} type="text" placeholder="22 dígitos" value={info.cbu} onChange={e => setInfo(p => ({ ...p, cbu: e.target.value }))} />
            </div>
            <div>
              <label style={{ color: '#9ca3af', fontSize: 12, display: 'block', marginBottom: 4 }}>Alias</label>
              <input style={inputStyle} type="text" placeholder="nombre.apellido.banco" value={info.alias} onChange={e => setInfo(p => ({ ...p, alias: e.target.value }))} />
            </div>
            <div>
              <label style={{ color: '#9ca3af', fontSize: 12, display: 'block', marginBottom: 4 }}>Nombre del banco (opcional)</label>
              <input style={inputStyle} type="text" placeholder="Ej: Banco Galicia" value={info.bankName} onChange={e => setInfo(p => ({ ...p, bankName: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button onClick={() => setEditing(false)} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#2a2a2a', color: '#9ca3af', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
              <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

interface DashboardData {
  clientCount: number;
  routineCount: number;
  exerciseCount: number;
  sessionsToday?: number;
  overdueCount?: number;
  averageProgress?: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  status?: "active" | "overdue";
  clientProfile?: {
    profileImage?: string;
    initialObjective?: string;
    goals?: string[];
    nickname?: string;
    membershipTier?: string;
  };
  assignedRoutines?: { id: string; name: string }[];
  paymentStatus?: string;
}

const TrainerDashboard: React.FC = () => {
  // Flag de visibilidad del botón "Seguridad" en Acciones Rápidas.
  // Colocar en `true` para reactivar el botón en el dashboard.
  const SHOW_SECURITY = false;
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const trainerName = user?.name?.split(' ')[0] || 'Entrenador';
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
  const [unreadMessages, setUnreadMessages] = useState(0);

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

    const fetchUnreadMessages = async () => {
      try {
        const res = await api.get('/messages/unread-count');
        setUnreadMessages(res.data?.unreadCount || 0);
      } catch {
        setUnreadMessages(0);
      }
    };

    fetchData();
    fetchUnreadMessages();
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
  const handleViewRoutinesClick = () => navigate("/trainer/routines/library");

  const unassignedRoutines = Math.max(
    0,
    (dashboardData?.routineCount || 0) - activeClients
  );

  if (loading) {
    return <LoadingScreen message="Preparando tu dashboard..." />;
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
            <h2>¡Hola, {trainerName}!</h2>
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
              <span className="info-text">{activeClients === 1 ? '1 alumno' : `${activeClients} alumnos`}</span>
            </div>
          </div>
          <div className="summary-card">
            <FireIcon className="card-icon" />
            <div className="card-content">
              <h3>Sesiones Hoy</h3>
              <p className="card-number">{dashboardData?.sessionsToday ?? 0}</p>
              <span className="info-text">{dashboardData?.sessionsToday ? 'Programadas hoy' : 'Sin sesiones hoy'}</span>
            </div>
          </div>
          <div className="summary-card">
            <ChartBarIcon className="card-icon" />
            <div className="card-content">
              <h3>Progreso Promedio</h3>
              <div className="progress-container">
                <div className="progress-circle">
                  <span className="progress-percentage">{dashboardData?.averageProgress ?? 0}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="summary-card">
            <CreditCardIcon className="card-icon" />
            <div className="card-content">
              <h3>Cuotas Vencidas</h3>
              <p className="card-number">{dashboardData?.overdueCount ?? overduePayments}</p>
              <span className={dashboardData?.overdueCount ? 'variation negative' : 'variation neutral'}>
                {dashboardData?.overdueCount ? `${dashboardData.overdueCount} vencida${dashboardData.overdueCount > 1 ? 's' : ''}` : 'Todo al día'}
              </span>
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
          <button onClick={() => navigate('/trainer/exercises')} className="action-btn">
            <BookOpenIcon className="action-icon" />
            Mis ejercicios
          </button>
          <button onClick={handleCalendarClick} className="action-btn">
            <CalendarIcon className="action-icon" />
            Calendario
          </button>
          <button onClick={handleMessagesClick} className="action-btn" style={{ position: 'relative' }}>
            <ChatBubbleLeftRightIcon className="action-icon" />
            Mensajes
            {unreadMessages > 0 && (
              <span style={{
                position: 'absolute', top: 6, right: 6,
                background: '#ef4444', color: '#fff',
                borderRadius: '50%', width: 18, height: 18,
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1
              }}>
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
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

      {/* Mis Alumnos */}
      <section className="summary-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 className="section-title" style={{ margin: 0 }}>
            <UsersIcon className="section-icon" />
            Mis Alumnos
          </h2>
          <button
            onClick={handleViewClientsClick}
            style={{ background: 'none', border: '1px solid #444', color: '#aaa', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}
          >
            Ver todos →
          </button>
        </div>
        {clients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#666' }}>
            <p>No tenés alumnos aún.</p>
            <button onClick={handleAddClientClick} className="action-btn primary" style={{ marginTop: 12, display: 'inline-flex' }}>
              <PlusIcon className="action-icon" /> Agregar alumno
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {clients.map((client) => {
              const hasRoutine = client.assignedRoutines && client.assignedRoutines.length > 0;
              const objective = client.clientProfile?.initialObjective || (client.clientProfile?.goals?.[0]) || null;
              const isOverdue = client.status === 'overdue';
              const initials = (client.name || client.email || '?').split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
              return (
                <div
                  key={client.id}
                  onClick={() => navigate(`/trainer/clients/${client.id}`)}
                  style={{
                    background: '#1e1e1e', borderRadius: 14, padding: '18px 16px',
                    cursor: 'pointer', border: '1px solid #2a2a2a',
                    transition: 'border-color 0.2s',
                    display: 'flex', flexDirection: 'column', gap: 10
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#dc2626')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a2a')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {client.clientProfile?.profileImage ? (
                      <img
                        src={client.clientProfile.profileImage}
                        alt={client.name}
                        style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{
                        width: 44, height: 44, borderRadius: '50%', background: '#dc2626',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 16, color: '#fff', flexShrink: 0
                      }}>
                        {initials}
                      </div>
                    )}
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {client.name || client.email}
                        {client.clientProfile?.nickname && (
                          <span style={{ color: '#dc2626', fontStyle: 'italic', fontWeight: 500, fontSize: 13, marginLeft: 6 }}>
                            "{client.clientProfile.nickname}"
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {client.email}
                      </div>
                      {client.clientProfile?.membershipTier && (
                        <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 600, marginTop: 2 }}>
                          {client.clientProfile.membershipTier === 'semipersonalizado' ? 'Semipersonalizado' :
                           client.clientProfile.membershipTier === 'grupal' ? 'Grupal' :
                           client.clientProfile.membershipTier === 'distancia' ? 'A distancia' :
                           client.clientProfile.membershipTier}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {objective && (
                      <div style={{ fontSize: 12, color: '#bbb' }}>
                        🎯 <span>{objective}</span>
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: hasRoutine ? '#4ade80' : '#888' }}>
                      {hasRoutine ? `📋 ${client.assignedRoutines![0].name}` : '📋 Sin rutina asignada'}
                    </div>
                    <div style={{ fontSize: 12, color: isOverdue ? '#ef4444' : '#4ade80' }}>
                      {isOverdue ? '⚠️ Cuota vencida' : '✓ Pago al día'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
              {analyticsData?.routinesCreated ? <span className="variation positive">Este período</span> : <span className="info-text">Sin datos previos</span>}
            </div>
          </div>
          <div className="summary-card">
            <UsersIcon className="card-icon" />
            <div className="card-content">
              <h3>Nuevos Clientes</h3>
              <p className="card-number">{analyticsData?.newClients || 0}</p>
              {analyticsData?.newClients ? <span className="variation positive">Este período</span> : <span className="info-text">Sin datos previos</span>}
            </div>
          </div>
          <div className="summary-card">
            <ChartBarIcon className="card-icon" />
            <div className="card-content">
              <h3>Actualizaciones de Progreso</h3>
              <p className="card-number">
                {analyticsData?.progressUpdates || 0}
              </p>
              {analyticsData?.progressUpdates ? <span className="variation positive">Este período</span> : <span className="info-text">Sin datos previos</span>}
            </div>
          </div>
        </div>
      </section>

      {/* Datos de cobro */}
      <PaymentInfoSection />

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