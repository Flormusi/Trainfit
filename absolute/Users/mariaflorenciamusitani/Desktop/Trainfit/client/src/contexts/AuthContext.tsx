import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-hot-toast'; // Descomentado y necesario
import { useNavigate } from 'react-router-dom'; // Descomentado y necesario
import axios from 'axios'; // Importación necesaria para axios

// Define API_URL (reemplaza con tu URL real, idealmente desde variables de entorno)
const API_URL = 'http://localhost:5000/api'; // Ejemplo, ajusta a tu backend

type Role = 'client' | 'trainer';
type MembershipTier = 'basic' | 'gold' | 'platinum';

interface OnboardingData {
  weight?: string;
  height?: string;
  age?: string;
  gender?: 'female' | 'male' | 'other' | '';
  injuries?: string; // Considera si este debe ser 'yes' | 'no' | '' como en ClientOnboarding
  medicalConditions?: string;
  medications?: string; // Considera si este debe ser 'yes' | 'no' | ''
  previousTraining?: 'yes' | 'no' | '';
  objective?: 'lose_fat' | 'gain_muscle' | 'maintain' | 'other_objective' | '';
  otherObjectiveDetail?: string;
  // Campos que podrían faltar si los tienes en ClientOnboarding.tsx:
  // injuryDetails?: string;
  // medicationDetails?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  membershipTier?: MembershipTier;
  hasCompletedOnboarding?: boolean;
  onboardingData?: OnboardingData;
}

// Esta interfaz podría no ser necesaria si login toma email/password directamente
// interface LoginResponseData {
//   token: string;
//   user: User;
//   success?: boolean;
// }

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: Role;
  membershipTier?: MembershipTier;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>; // Firma corregida
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  saveOnboardingData: (onboardingPayload: OnboardingData) => Promise<void>; // Añadido
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setToken(null); // Asegúrate de limpiar el token también
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { user: loggedInUser, token: loggedInToken } = response.data;
      
      setUser(loggedInUser);
      setToken(loggedInToken);
      setIsAuthenticated(true);
      localStorage.setItem('token', loggedInToken);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      toast.success('Login successful!');

      if (loggedInUser.role === 'client') {
        if (!loggedInUser.hasCompletedOnboarding) {
          navigate('/client/onboarding', { replace: true });
        } else {
          navigate(`/client-dashboard/${loggedInUser.id}`, { replace: true });
        }
      } else if (loggedInUser.role === 'trainer') {
        navigate('/trainer-dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true }); 
      }
    } catch (error: any) {
      console.error("Error in AuthContext login:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      // No es necesario `throw error;` aquí a menos que lo manejes en un nivel superior
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => { // Tipo de parámetro corregido
    setLoading(true);
    try {
      // Lógica real de la API para registrar (ejemplo usando axios)
      const response = await axios.post(`${API_URL}/auth/register`, data); // Usar el parámetro 'data'
      const { user: registeredUser, token: registeredToken } = response.data;

      setUser(registeredUser);
      setToken(registeredToken);
      setIsAuthenticated(true);
      localStorage.setItem('token', registeredToken);
      localStorage.setItem('user', JSON.stringify(registeredUser));
      toast.success('¡Registro exitoso!');

      // Lógica de navegación post-registro
      if (registeredUser.role === 'client') {
        if (!registeredUser.hasCompletedOnboarding) {
          navigate('/client/onboarding', { replace: true });
        } else {
          navigate(`/client-dashboard/${registeredUser.id}`, { replace: true });
        }
      } else if (registeredUser.role === 'trainer') {
        navigate('/trainer-dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } catch (error: any) {
      console.error("Error in AuthContext register:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Ocurrió un error inesperado durante el registro.';
      toast.error(errorMessage); // Descomentado
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Has cerrado sesión.'); // Descomentado
    navigate('/login', { replace: true }); // Descomentado y recomendado
  };

  const saveOnboardingData = async (onboardingPayload: OnboardingData) => {
    if (!user || !token) {
      toast.error("Usuario no autenticado para guardar datos de onboarding.");
      navigate('/login', { replace: true });
      return;
    }
    setLoading(true);
    try {
      // Endpoint y método correctos para guardar/actualizar datos de onboarding
      const response = await axios.put( // Usar PUT para actualizar, o POST si es creación
        `${API_URL}/users/${user.id}/onboarding`, // Endpoint de ejemplo, ajústalo
        onboardingPayload, // Usar el payload correcto
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Asume que la API devuelve el usuario actualizado o los datos actualizados
      const updatedUserFromAPI: User = response.data.user || response.data; 

      const updatedUserData: User = {
        ...user,
        ...updatedUserFromAPI, // Fusionar con datos de la API
        onboardingData: { ...(user.onboardingData || {}), ...onboardingPayload },
        hasCompletedOnboarding: true,
      };
      
      setUser(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      toast.success('¡Datos de onboarding guardados exitosamente!');
      navigate(`/client-dashboard/${user.id}`, { replace: true });

    } catch (error: any) {
      console.error("Error guardando datos de onboarding:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al guardar los datos de onboarding.';
      toast.error(errorMessage); // Descomentado
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, register, logout, saveOnboardingData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};