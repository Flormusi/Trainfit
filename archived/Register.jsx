import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../services/api';
import './Auth.css';
import logo from '/images/logo-trainfit.png'; // Ruta actualizada

const Register = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'client' // Default role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (userData.password !== userData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...registrationData } = userData;
      
      const response = await authApi.register(registrationData);
      localStorage.setItem('token', response.data.token);
      
      // Redirect to profile completion page
      navigate('/complete-profile');
    } catch (err) {
      console.error('Registration error:', err);
      setError('Error al registrarse. Por favor intente nuevamente.');
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
        
        <h1>REGISTRARSE</h1>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              placeholder="Contraseña"
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="password"
              name="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirmar contraseña"
              required
            />
          </div>
          
          <div className="form-group role-selection">
            <label>Registrarse como:</label>
            <div className="role-options">
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="client"
                  checked={userData.role === 'client'}
                  onChange={handleChange}
                />
                <span>Cliente</span>
              </label>
              
              <label className="role-option">
                <input
                  type="radio"
                  name="role"
                  value="trainer"
                  checked={userData.role === 'trainer'}
                  onChange={handleChange}
                />
                <span>Entrenador</span>
              </label>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'REGISTRARSE'}
          </button>
        </form>
        
        <div className="auth-links">
          <Link to="/login" className="login-link">¿Ya tenés una cuenta? INICIAR SESIÓN</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;