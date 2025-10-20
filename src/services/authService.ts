import axios from './axiosConfig';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role: string;
  membershipTier?: 'basic' | 'platinum' | 'gold';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  membershipTier?: 'basic' | 'platinum' | 'gold';
  token: string;
  hasCompletedOnboarding: boolean;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      console.log('[AuthService] Iniciando login con:', { ...credentials, password: '***' });
      
      const response = await axios.post('/auth/login', credentials);
      const { success, token, user: userDetails } = response.data;

      if (!success || !token) {
        throw new Error('Error en la autenticación: No se recibió token o respuesta exitosa');
      }

      // Normalizar el rol a mayúsculas
      if (userDetails?.role) {
        userDetails.role = userDetails.role.toUpperCase();
      }

      // Verificar onboarding status
      if (typeof userDetails?.hasCompletedOnboarding === 'undefined') {
        console.warn('[AuthService] Campo hasCompletedOnboarding no presente en la respuesta');
      }

      const userToStore: User = {
        ...userDetails,
        token
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userToStore));

      console.log('[AuthService] Login exitoso para:', userDetails.email);
      return userToStore;
    } catch (error) {
      console.error('[AuthService] Error durante el login:', error);
      throw error;
    }
  },

  async register(data: RegisterData): Promise<User> {
    try {
      console.log('[AuthService] Iniciando registro con:', { ...data, password: '***' });
      
      const response = await axios.post('/auth/register', data);
      const { token, user: userDetails } = response.data;

      if (!token || !userDetails) {
        throw new Error('Error en el registro: Datos de usuario o token no recibidos');
      }

      const userToStore: User = {
        ...userDetails,
        token
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userToStore));

      console.log('[AuthService] Registro exitoso para:', userDetails.email);
      return userToStore;
    } catch (error) {
      console.error('[AuthService] Error durante el registro:', error);
      throw error;
    }
  },

  logout(): void {
    try {
      console.log('[AuthService] Iniciando proceso de logout');
      
      // Limpiar localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');

      // Limpiar cookies
      document.cookie.split(';').forEach(cookie => {
        document.cookie = cookie
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });

      console.log('[AuthService] Logout completado exitosamente');
    } catch (error) {
      console.error('[AuthService] Error durante el logout:', error);
      // No lanzamos el error para asegurar que el logout siempre se complete
    }
  },

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('[AuthService] Error al obtener usuario actual:', error);
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  }
};