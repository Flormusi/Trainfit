import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Ajusta la ruta
// Importa componentes de UI (ej. Material UI)
// import { Container, Box, Typography, TextField, Button, Alert, Link } from '@mui/material';
// import logo from '../assets/logo.png'; // Si tienes un logo

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // loading local, el contexto también tiene uno global
  const { login, isAuthenticated, user } = useAuth(); // login ahora es async y toma credenciales
  const navigate = useNavigate();

  console.log('[LoginPage] Component rendered. isAuthenticated:', isAuthenticated, 'User:', user);

  useEffect(() => {
    console.log('[LoginPage] useEffect triggered. isAuthenticated:', isAuthenticated, 'User:', user);
    if (isAuthenticated && user) {
      console.log('[LoginPage] Condition met. Navigating based on role:', user.role);
      if (user.role === 'trainer') {
        console.log('[LoginPage] Navigating to /trainer/dashboard');
        navigate('/trainer/dashboard');
      } else if (user.role === 'client') {
        console.log('[LoginPage] Navigating to /client/dashboard/', user.id);
        navigate(`/client/dashboard/${user.id}`);
      }
    } else {
      console.log('[LoginPage] Condition NOT met. isAuthenticated:', isAuthenticated, 'User:', user);
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[LoginPage] handleSubmit called with email:', email);
    if (!email || !password) {
      setError('Por favor ingresa email y contraseña.');
      console.log('[LoginPage] handleSubmit error: Email or password missing.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      console.log('[LoginPage] Calling login from useAuth...');
      await login({ email, password });
      console.log('[LoginPage] login call finished. isAuthenticated:', isAuthenticated, 'User:', user); // Check state immediately after login call
    } catch (err: any) {
      console.error('[LoginPage] handleSubmit error during login:', err);
      setError(err.response?.data?.message || err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
      console.log('[LoginPage] handleSubmit finally block. Loading set to false.');
    }
  };

  return (
    <div> {/* Reemplaza con tus componentes de UI */}
      {/* <img src={logo} alt="TrainFit Logo" style={{ width: '150px', marginBottom: '20px' }} /> */}
      <h1>Iniciar Sesión</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
      <p>
        ¿No tienes cuenta? <RouterLink to="/register">Regístrate aquí</RouterLink>
      </p>
    </div>
  );
};

export default LoginPage;