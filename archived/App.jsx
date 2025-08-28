import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Auth Components
import Login from './components/Login';
import Register from './components/Register';

// Client Components
import ClientDashboard from './components/ClientDashboard';
import RoutineDetails from './components/RoutineDetails';
import ClientOnboarding from './components/onboarding/ClientOnboarding'; // Changed path

// Trainer Components
import TrainerDashboard from './components/TrainerDashboard';
import AddClient from './components/AddClient';
import CreateRoutine from './components/CreateRoutine';
import ClientProgress from './components/ClientProgress';
import ClassScheduler from './components/ClassScheduler';
import ExerciseLibrary from './components/ExerciseLibrary';

// Dynamic Redirect Component
import RedirectLogic from './components/RedirectLogic';

// Context
import { useAuth } from './context/AuthContext';

// Auth Guard Component
const PrivateRoute = ({ element, allowedRoles }) => {
  const authState = useAuth(); // Primero obtenemos el estado completo del contexto

  // 1. Verificar si authState es null (esto es lo que causa tu error)
  if (!authState) {
    // Esto indica un problema de configuración con AuthProvider.
    // Deberías asegurarte de que AuthProvider envuelve tu aplicación.
    console.error("Error crítico: AuthContext no está disponible. Verifica la configuración de AuthProvider.");
    return <Navigate to="/login" replace />;
  }

  const { user, token, loading } = authState; // Ahora destructuramos user, token y loading

  // 2. Considerar el estado de carga
  if (loading) {
    // Muestra un indicador de carga mientras se verifica la autenticación
    // Puedes reemplazar esto con tu componente de Spinner/Loading global si tienes uno
    return <div>Verificando autenticación...</div>;
  }

  // 3. Si después de cargar, no hay token o usuario, redirigir a login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 4. Lógica existente para onboarding y roles
  // Esta lógica ahora es más segura porque 'user' no será null aquí
  if (user.role === 'client' && !user.hasCompletedOnboarding) {
    return <Navigate to="/client/onboarding" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />; // O a una página de "No autorizado"
  }

  return element;
};

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Redirección centralizada */}
          <Route 
            path="/" 
            element={
              <PrivateRoute 
                element={<Navigate to="/redirect" replace />} 
                allowedRoles={['client', 'trainer']} 
              />
            } 
          />
          <Route path="/redirect" element={<RedirectLogic />} />

          {/* Client Onboarding */}
          <Route 
            path="/client/onboarding" 
            element={
              <PrivateRoute 
                element={<ClientOnboarding />} 
                allowedRoles={['client']} 
              />
            } 
          />

          {/* Client Routes */}
          <Route 
            path="/client-dashboard/:clientId" 
            element={
              <PrivateRoute 
                element={<ClientDashboard />} 
                allowedRoles={['client']} 
              />
            } 
          />
          <Route 
            path="/routine/:routineId" 
            element={
              <PrivateRoute 
                element={<RoutineDetails />} 
                allowedRoles={['client']} 
              />
            } 
          />

          {/* Trainer Routes */}
          <Route 
            path="/trainer-dashboard" 
            element={
              <PrivateRoute 
                element={<TrainerDashboard />} 
                allowedRoles={['trainer']} 
              />
            } 
          />
          <Route 
            path="/add-client" 
            element={
              <PrivateRoute 
                element={<AddClient />} 
                allowedRoles={['trainer']} 
              />
            } 
          />
          <Route 
            path="/create-routine" 
            element={
              <PrivateRoute 
                element={<CreateRoutine />} 
                allowedRoles={['trainer']} 
              />
            } 
          />
          <Route 
            path="/client/:clientId/progress" 
            element={
              <PrivateRoute 
                element={<ClientProgress />} 
                allowedRoles={['trainer']} 
              />
            } 
          />
          <Route 
            path="/class-scheduler" 
            element={
              <PrivateRoute 
                element={<ClassScheduler />} 
                allowedRoles={['trainer']} 
              />
            } 
          />
          <Route 
            path="/exercise-library" 
            element={
              <PrivateRoute 
                element={<ExerciseLibrary />} 
                allowedRoles={['trainer']} 
              />
            } 
          />

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;