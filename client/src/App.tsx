import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ClientOnboarding from './components/onboarding/ClientOnboarding';
import ClientDashboard from './pages/ClientDashboard/ClientDashboard';
import ClientProgressPage from './pages/client/ClientProgressPage';
import TrainerDashboard from './pages/TrainerDashboard';
import CreateRoutinePage from './pages/TrainerDashboard/CreateRoutinePage';
import EditRoutinePage from './pages/TrainerDashboard/EditRoutinePage';
import UnassignedRoutines from './components/trainer/UnassignedRoutines';
import AllRoutines from './pages/TrainerDashboard/AllRoutines';
import AddClientPage from './pages/TrainerDashboard/AddClientPage';
import EditClientPage from './pages/TrainerDashboard/EditClientPage';
import { useAuth } from './contexts/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import ClientDetails from './components/trainer/ClientDetails';
import ClientList from './components/trainer/ClientList'; // ✅ Importar ClientList
import ClientListImproved from './components/trainer/ClientListImproved'; // ✅ Importar ClientListImproved
import ClientListComparison from './components/trainer/ClientListComparison'; // ✅ Importar ClientListComparison
import ExerciseLibrary from './components/ExerciseLibrary'; // ✅ Importar ExerciseLibrary
import GoogleAuthCallback from './pages/GoogleAuthCallback/GoogleAuthCallback'; // ✅ Importar GoogleAuthCallback
import TrainerClientProgressPage from './pages/TrainerDashboard/TrainerClientProgressPage';
import RoutineCalendarPage from './pages/TrainerDashboard/RoutineCalendarPage';
import RoutineDetails from './components/RoutineDetails'; // ✅ Importar RoutineDetails
import DebugClients from './components/DebugClients'; // Importar componente de depuración
import DebugClientsList from './components/DebugClientsList'; // Importar componente de depuración de lista de clientes
import MessagingSystem from './components/MessagingSystem'; // ✅ Importar sistema de mensajería
import AppointmentCalendar from './components/AppointmentCalendar'; // ✅ Importar calendario de citas
import UnifiedCalendar from './components/UnifiedCalendar'; // ✅ Importar calendario unificado
import SubscriptionPage from './pages/SubscriptionPage'; // ✅ Importar página de suscripciones

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: 'client' | 'trainer' }> = ({ children, role }) => {
  console.log('[ProtectedRoute] Initializing with role:', role);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    console.log('[ProtectedRoute] useEffect triggered. Loading:', loading, 'IsAuthenticated:', auth.isAuthenticated(), 'User:', user, 'Required role:', role);
    if (loading) return;

    if (!auth.isAuthenticated()) {
      console.log('[ProtectedRoute] Not authenticated, navigating to login.');
      navigate('/login', { replace: true });
      return;
    }

    if (role && user) {
      const normalizedUserRole = user.role.toUpperCase() === 'TRAINER' ? 'trainer' : 'client';
      console.log('[ProtectedRoute] Normalized user role:', normalizedUserRole, 'Required role:', role);
      if (normalizedUserRole !== role) {
        console.log('[ProtectedRoute] Role mismatch. User role:', normalizedUserRole, 'Required role:', role, 'Navigating to login.');
        toast.error('Acceso no autorizado para esta sección.');
        navigate('/login', { replace: true });
        return;
      }

      if (role === 'client' && !user.hasCompletedOnboarding && window.location.pathname !== '/client/onboarding') {
        console.log('[ProtectedRoute] Client has not completed onboarding. Navigating to onboarding.');
        navigate('/client/onboarding', { replace: true });
      }
    }
  }, [loading, auth, user, role, navigate]);

  if (loading) {
    console.log('[ProtectedRoute] Rendering: Loading...');
    return <div>Cargando...</div>;
  }

  if (!auth.isAuthenticated()) {
    console.log('[ProtectedRoute] Rendering: Redirecting... Not authenticated');
    return <div>Redirigiendo al login...</div>;
  }

  console.log('[ProtectedRoute] Rendering: Children. User role:', user?.role, 'Required role:', role);
  return <>{children}</>;
};

function App() {
  return (
    // El Router y AuthProvider han sido removidos de aquí, ya que están en main.tsx
    <>
      <Toaster position="top-center" reverseOrder={false} />
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
    </>
  );
}

export default App;

const RootRedirect: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'TRAINER') {
      navigate('/trainer-dashboard', { replace: true });
    } else if (user?.role === 'CLIENT') {
      navigate(`/client-dashboard/${user.id}`, { replace: true });
    }
  }, [user, navigate]);

  return <div>Redirigiendo...</div>;
};