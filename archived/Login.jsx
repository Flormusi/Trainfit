// Asumiendo una estructura similar a Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api'; // Ejemplo de otra importación
import './Auth.css'; // Ejemplo de otra importación
import logo from '/images/logo-trainfit.png'; // Esta línea funcionará si el logo está en client/public/images/

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.login(credentials);
      localStorage.setItem('token', response.data.token);
      
      // Redirect based on user role
      if (response.data.user.role === 'trainer') {
        navigate('/trainer-dashboard');
      } else {
        navigate(`/client-dashboard/${response.data.user.id}`);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="logo-container">
          <img src={logo} alt="TrainFit Logo" className="auth-logo" />
        </div>
        
        <h1>INICIAR SESIÓN</h1>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Contraseña"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Iniciando...' : 'INICIAR SESIÓN'}
          </button>
        </form>
        
        <div className="auth-links">
          <Link to="/register" className="register-link">REGISTRARSE</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;