import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import './Login.css';
import { useAuth } from '../../contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, user, isAuthenticated, loading: authLoading } = useAuth();
  const [credentials, setCredentials] = useState({ 
    email: 'test.trainer@trainfit.com', 
    password: 'test123' 
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('[Login] Checking authentication state - User:', user, 'IsAuthenticated:', isAuthenticated);
    if (isAuthenticated() && user) {
      console.log('[Login] User is authenticated, redirecting based on role:', user.role);
      const role = user.role.toUpperCase();
      if (role === 'CLIENT') {
        if (!user.hasCompletedOnboarding) {
          console.log('[Login] Client has not completed onboarding, redirecting to onboarding');
          navigate('/client/onboarding', { replace: true });
        } else {
          console.log('[Login] Client has completed onboarding, redirecting to dashboard');
          navigate(`/client-dashboard/${user.id}`, { replace: true });
        }
      } else if (role === 'TRAINER') {
        console.log('[Login] Trainer detected, redirecting to trainer dashboard');
        navigate('/trainer-dashboard', { replace: true });
      }
    }
  }, [user, isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.email || !credentials.password) {
      toast.error('Por favor, completa todos los campos');
      return;
    }

    setLoading(true);
    console.log('[Login] Attempting login with email:', credentials.email);

    try {
      await login(credentials);
      // No necesitamos mostrar toast aquí ya que AuthContext lo maneja
    } catch (error: any) {
      console.error('[Login] Error during login:', error);
      toast.error(
        error.response?.data?.message ||
        'Error al iniciar sesión. Por favor, verifica tus credenciales e inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="login-container"><div>Cargando...</div></div>;
  }

  return (
    <div className="login-container">
      <img src="/images/logo-trainfit.png" alt="TrainFit Logo" className="login-logo" />
      <h1 className="login-title">INICIAR SESIÓN</h1>

      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={credentials.email}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          value={credentials.password}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading} className="btn-login">
          {loading ? 'Iniciando sesión...' : 'INICIAR SESIÓN'}
        </button>
      </form>



      <button className="btn-register-link" onClick={() => navigate('/register')} disabled={loading}>
        REGISTRARSE
      </button>
    </div>
  );
};

export default Login;
