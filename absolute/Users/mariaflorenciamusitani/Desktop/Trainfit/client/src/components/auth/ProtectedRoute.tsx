import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // <-- Actualizado para usar useAuth

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('client' | 'trainer')[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();
  const auth = useAuth();

  // El hook useAuth() ya lanza un error si el contexto no está disponible,
  // por lo que una comprobación explícita de !auth podría no ser estrictamente necesaria aquí
  // si AuthProvider siempre envuelve la aplicación.

  const { user, isAuthenticated, loading } = auth;

  if (loading) {
    return <div>Verificando autenticación...</div>; // Considera usar un componente Spinner global
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Lógica de onboarding rescatada de App.jsx
  if (user.role === 'client' && user.hasCompletedOnboarding === false) {
    return <Navigate to="/client/onboarding" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirigir a /login si el rol no está permitido (consistente con App.jsx)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;