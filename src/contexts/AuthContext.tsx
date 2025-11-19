import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { LoginCredentials, User } from '../services/authService';
import axios from '../services/axiosConfig';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  loading: boolean;
  saveOnboardingData: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[AuthContext] useEffect running to check current user');
    try {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        console.log('[AuthContext] Current user found in localStorage:', currentUser);
        setUser(currentUser);
      } else {
        console.log('[AuthContext] No current user in localStorage');
      }
    } catch (error) {
      console.error("[AuthContext] Error loading current user from localStorage:", error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setLoading(false);
  }, []);

  const navigateBasedOnRole = useCallback((user: User) => {
    console.log('[AuthContext] Navigating based on role for user:', user);
    const normalizedUserRole = user.role.toUpperCase() === 'TRAINER' ? 'trainer' : 'client';
    console.log('[AuthContext] Normalized user role:', normalizedUserRole);
    
    if (normalizedUserRole === 'client') {
      if (!user.hasCompletedOnboarding) {
        navigate('/client/onboarding', { replace: true });
      } else {
        navigate(`/client-dashboard/${user.id}`, { replace: true });
      }
    } else if (normalizedUserRole === 'trainer') {
      navigate('/trainer-dashboard', { replace: true });
    } else {
      console.error('[AuthContext] Invalid user role:', user.role);
      toast.error('Error: Rol de usuario inválido');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    console.log('[AuthContext] Attempting login with credentials:', credentials);
    setLoading(true);
    try {
      const userData = await authService.login(credentials);
      console.log('[AuthContext] Login successful, user data:', userData);
      if (userData && userData.token) {
        setUser(userData);
        localStorage.setItem('token', userData.token);
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('[AuthContext] User and token set. User state:', userData);
        toast.success('¡Inicio de sesión exitoso!');
        console.log('[AuthContext] Navigating based on role...');
        navigateBasedOnRole(userData);
      } else {
        console.error('[AuthContext] Login failed: No user data or token returned');
        toast.error('Error de inicio de sesión: Respuesta inválida del servidor.');
      }
    } catch (error) {
      console.error('[AuthContext] Login error caught:', error);
      let errorMessage = 'Error al iniciar sesión. Por favor, intente nuevamente.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [navigate, navigateBasedOnRole]);

  const logout = useCallback(() => {
    console.log('[AuthContext] Logging out user');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
    toast.info('Sesión cerrada exitosamente');
  }, [navigate]);

  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    console.log('[AuthContext] Checking authentication - Token:', !!token, 'User:', !!storedUser);
    return !!token && !!storedUser;
  }, []);

  // Auto-login de desarrollo para facilitar pruebas de sockets y navegación
  useEffect(() => {
    const enabled = String(import.meta.env.VITE_DEV_AUTO_LOGIN || '').toLowerCase() === 'true';
    const email = String(import.meta.env.VITE_DEV_LOGIN_EMAIL || '');
    const password = String(import.meta.env.VITE_DEV_LOGIN_PASSWORD || '');

    if (enabled) {
      const hasSession = isAuthenticated();
      if (!hasSession && email && password) {
        console.log('[AuthContext] Dev auto-login enabled. Attempting login for:', email);
        // Usa el mismo flujo de login para mantener navegación y toasts
        login({ email, password });
      }
    }
  }, [login, isAuthenticated]);

  const saveOnboardingData = useCallback(async (data: any) => {
    console.log('[AuthContext] Saving onboarding data:', data);
    try {
      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token no encontrado');
      }

      // Hacer la llamada al backend para guardar los datos de onboarding
      const response = await axios.put(
        `/users/${user.id}/onboarding`,
        data
      );

      console.log('[AuthContext] Onboarding data saved successfully:', response.data);

      // Actualizar el estado local con la respuesta del servidor
      const updatedUser = { ...user, hasCompletedOnboarding: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Datos de onboarding guardados exitosamente');
      navigateBasedOnRole(updatedUser);
    } catch (error) {
      console.error('[AuthContext] Error saving onboarding data:', error);
      let errorMessage = 'Error al guardar los datos de onboarding';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }
      toast.error(errorMessage);
      throw error;
    }
  }, [user, navigateBasedOnRole]);

  const contextValue = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated,
      loading,
      saveOnboardingData,
    }),
    [user, login, logout, isAuthenticated, loading, saveOnboardingData]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthProvider;