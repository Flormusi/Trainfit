import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getJSON, setJSON, removeItem } from '../utils/storageUtils';
import { authService } from '../services/authService';

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  hasCompletedOnboarding: boolean;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (updatedFields: Partial<User>) => Promise<User | null>;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    const token = localStorage.getItem('token');

    if (storedUser && storedUser.token) {
      setUser(storedUser);
      setIsAuthenticated(true);
      if (token !== storedUser.token) {
        setJSON('token', storedUser.token);
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const loggedInUser = await authService.login(credentials);

      if (loggedInUser && loggedInUser.token) {
        const normalizedUser = {
          ...loggedInUser,
          role: loggedInUser.role ? loggedInUser.role.toLowerCase() : ''
        };
        setJSON('token', loggedInUser.token);
        setUser(normalizedUser);
        setIsAuthenticated(true);
      } else {
        throw new Error('Login failed: Invalid response from server.');
      }
    } catch (error) {
      console.error('[AuthContext] Error during login:', error);
      setIsAuthenticated(false);
      setUser(null);
      removeItem('user');
      removeItem('token');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    removeItem('user');
    removeItem('token');
  };

  const updateProfile = async (updatedFields: Partial<User>): Promise<User | null> => {
    if (!user) return null;
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    setJSON('user', updatedUser);
    return updatedUser;
  };

  const completeOnboarding = () => {
    if (user) {
      const updatedUser = { ...user, hasCompletedOnboarding: true };
      setUser(updatedUser);
      setJSON('user', updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, updateProfile, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};