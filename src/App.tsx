import React, { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Toaster, toast } from 'react-hot-toast';

const Login = React.lazy(() => import('./components/auth/Login'));
const Register = React.lazy(() => import('./components/auth/Register'));
const ClientOnboarding = React.lazy(() => import('./components/onboarding/ClientOnboarding'));
const ClientDashboard = React.lazy(() => import('./pages/ClientDashboard/ClientDashboard'));
const ClientProgressPage = React.lazy(() => import('./pages/client/ClientProgressPage'));
const TrainerDashboard = React.lazy(() => import('./pages/TrainerDashboard'));
const CreateRoutinePage = React.lazy(() => import('./pages/TrainerDashboard/CreateRoutinePage'));
const EditRoutinePage = React.lazy(() => import('./pages/TrainerDashboard/EditRoutinePage'));
const RoutineLibraryPage = React.lazy(() => import('./pages/TrainerDashboard/RoutineLibraryPage'));
const UnassignedRoutines = React.lazy(() => import('./components/trainer/UnassignedRoutines'));
const AllRoutines = React.lazy(() => import('./pages/TrainerDashboard/AllRoutines'));
const AddClientPage = React.lazy(() => import('./pages/TrainerDashboard/AddClientPage'));
const EditClientPage = React.lazy(() => import('./pages/TrainerDashboard/EditClientPage'));
const ClientDetails = React.lazy(() => import('./components/trainer/ClientDetails'));
const SecurityPage = React.lazy(() => import('./pages/SecurityPage'));
const ClientList = React.lazy(() => import('./components/trainer/ClientList'));
const ClientListImproved = React.lazy(() => import('./components/trainer/ClientListImproved'));
const ClientListComparison = React.lazy(() => import('./components/trainer/ClientListComparison'));
const ExerciseLibrary = React.lazy(() => import('./components/ExerciseLibrary'));
const GoogleAuthCallback = React.lazy(() => import('./pages/GoogleAuthCallback/GoogleAuthCallback'));
const TrainerClientProgressPage = React.lazy(() => import('./pages/TrainerDashboard/TrainerClientProgressPage'));
const RoutineCalendarPage = React.lazy(() => import('./pages/TrainerDashboard/RoutineCalendarPage'));
const RoutineDetails = React.lazy(() => import('./components/RoutineDetails'));
const DebugClients = React.lazy(() => import('./components/DebugClients'));
const DebugClientsList = React.lazy(() => import('./components/DebugClientsList'));
const MessagingSystem = React.lazy(() => import('./components/MessagingSystem'));
const AppointmentCalendar = React.lazy(() => import('./components/AppointmentCalendar'));
const UnifiedCalendar = React.lazy(() => import('./components/UnifiedCalendar'));
const SubscriptionPage = React.lazy(() => import('./pages/SubscriptionPage'));

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: 'client' | 'trainer' }> = ({ children, role }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ color: '#fff' }}>Cargando...</div>;
  }

  const authed = isAuthenticated();
  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  if (role && user) {
    const normalizedUserRole = user.role.toUpperCase() === 'TRAINER' ? 'trainer' : 'client';
    if (normalizedUserRole !== role) {
      toast.error('Acceso no autorizado para esta sección.');
      return <Navigate to="/login" replace />;
    }

    // Evitar bucle de redirección cuando ya estamos en la ruta de onboarding
    if (role === 'client' && !user.hasCompletedOnboarding) {
      if (location.pathname !== '/client/onboarding') {
        return <Navigate to="/client/onboarding" replace />;
      }
    }
  }

  return <>{children}</>;
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, color: '#fff', backgroundColor: '#121212' }}>
          <h2>Ha ocurrido un error</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

function App() {
  return (
    // El Router y AuthProvider han sido removidos de aquí, ya que están en main.tsx
    <ErrorBoundary>
      <Toaster position="top-center" reverseOrder={false} />
      <Suspense fallback={<div style={{ color: '#fff' }}>Cargando...</div>}>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
        <Route path="/debug-clients" element={<ProtectedRoute role="trainer"><DebugClients /></ProtectedRoute>} />
        <Route path="/debug-clients-list" element={<ProtectedRoute role="trainer"><DebugClientsList /></ProtectedRoute>} />
        <Route
          path="/trainer/routines"
          element={
            <ProtectedRoute role="trainer">
              <AllRoutines />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/routines/library"
          element={
            <ProtectedRoute role="trainer">
              <RoutineLibraryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainer/unassigned-routines"
          element={
            <ProtectedRoute role="trainer">
              <UnassignedRoutines />
            </ProtectedRoute>
          }
        />

        {/* Rutas de Cliente */}
        <Route
          path="/client/onboarding"
          element={
            <ProtectedRoute role="client">
              <ClientOnboarding />
            </ProtectedRoute>
          }
        />
        
        {/* MODIFICADO: Ruta para ClientDashboard descomentada */}
        <Route
          path="/client-dashboard/:clientId" // Asumiendo que necesitas un ID de cliente
          element={
            <ProtectedRoute role="client">
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        
        {/* Ruta para la página de progreso del cliente */}
        <Route
          path="/client/progress"
          element={
            <ProtectedRoute role="client">
              <ClientProgressPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ Agregar ruta para mensajería del cliente */}
        <Route
          path="/client/messages"
          element={
            <ProtectedRoute role="client">
              <MessagingSystem />
            </ProtectedRoute>
          }
        />

        {/* ✅ Agregar ruta para calendario del cliente */}
        <Route
          path="/client/appointments"
          element={
            <ProtectedRoute role="client">
              <UnifiedCalendar />
            </ProtectedRoute>
          }
        />

        {/* ✅ Agregar ruta para suscripciones del cliente */}
        <Route
          path="/client/subscription"
          element={
            <ProtectedRoute role="client">
              <SubscriptionPage />
            </ProtectedRoute>
          }
        />
        

        {/* Ruta para Trainer Dashboard */}
        <Route
          path="/trainer-dashboard"
          element={
            <ProtectedRoute role="trainer">
              <TrainerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Ruta para Seguridad interna */}
        <Route
          path="/trainer/security"
          element={
            <ProtectedRoute role="trainer">
              <SecurityPage />
            </ProtectedRoute>
          }
        />

        {/* Ruta para el Calendario Unificado */}
        <Route
          path="/trainer/calendar"
          element={
            <ProtectedRoute role="trainer">
              <UnifiedCalendar />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trainer/create-routine" 
          element={
            <ProtectedRoute role="trainer">
              <CreateRoutinePage />
            </ProtectedRoute>
          }
        />

        {/* AÑADIR O VERIFICAR ESTA RUTA PARA AGREGAR CLIENTE */}
        <Route
          path="/add-client" // Esta es la ruta que usa el botón en TrainerDashboard
          element={
            <ProtectedRoute role="trainer">
              <AddClientPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ Agregar ruta para la Biblioteca de Ejercicios */}
        <Route
          path="/trainer/exercises"
          element={
            <ProtectedRoute role="trainer">
              <ExerciseLibrary />
            </ProtectedRoute>
          }
        />

        {/* ✅ Agregar ruta para el sistema de mensajería */}
        <Route
          path="/trainer/messages"
          element={
            <ProtectedRoute role="trainer">
              <MessagingSystem />
            </ProtectedRoute>
          }
        />

        {/* ✅ Agregar ruta para suscripciones del entrenador */}
        <Route
          path="/trainer/subscription"
          element={
            <ProtectedRoute role="trainer">
              <SubscriptionPage />
            </ProtectedRoute>
          }
        />

        {/* ✅ Agregar ruta para la lista de clientes */}
        <Route
          path="/trainer/clients"
          element={
            <ProtectedRoute role="trainer">
              <ClientList />
            </ProtectedRoute>
          }
        />

        {/* ✅ Agregar ruta para la lista de clientes mejorada */}
        <Route
          path="/trainer/clients-improved"
          element={
            <ProtectedRoute role="trainer">
              <ClientListImproved />
            </ProtectedRoute>
          }
        />

        {/* ✅ Agregar ruta para la comparación de clientes */}
        <Route
          path="/trainer/clients-comparison"
          element={
            <ProtectedRoute role="trainer">
              <ClientListComparison />
            </ProtectedRoute>
          }
        />

        {/* ✅ Ruta para ver perfil del cliente - NUEVO DISEÑO */}
        <Route
          path="/trainer/clients/:clientId"
          element={
            <ProtectedRoute role="trainer">
              <TrainerClientProgressPage />
            </ProtectedRoute>
          }
        />
        
        {/* ✅ Ruta para editar cliente */}
        <Route
          path="/trainer/clients/:clientId/edit"
          element={
            <ProtectedRoute role="trainer">
              <EditClientPage />
            </ProtectedRoute>
          }
        />
        
        {/* ✅ Ruta alternativa para ClientDetails (si se necesita) */}
        <Route
          path="/trainer/clients/:clientId/details"
          element={
            <ProtectedRoute role="trainer">
              <ClientDetails />
            </ProtectedRoute>
          }
        />
        
        {/* ✅ Agregar rutas para rutinas */}
        <Route
          path="/trainer/routines/:routineId"
          element={
            <ProtectedRoute role="trainer">
              <RoutineDetails />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/trainer/routines/:routineId/edit"
          element={
            <ProtectedRoute role="trainer">
              <EditRoutinePage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/client/:clientId/routine/:routineId"
          element={
            <ProtectedRoute role="client">
              <RoutineDetails />
            </ProtectedRoute>
          }
        />
        
        {/* Ruta por defecto o página de inicio */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RootRedirect />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div style={{ color: '#fff' }}>Cargando...</div>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role?.toUpperCase();
  if (role === 'TRAINER') {
    return <Navigate to="/trainer-dashboard" replace />;
  }
  if (role === 'CLIENT' && user) {
    return <Navigate to={`/client-dashboard/${user.id}`} replace />;
  }
  return <Navigate to="/login" replace />;
};