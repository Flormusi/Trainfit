import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainerApi } from '../services/api.ts';
import './AddClient.css';

const AddClient = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    goal: 'weight_loss',
    initialWeight: '',
    height: '',
    age: '',
    gender: '',
    medicalConditions: '',
    previousTraining: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await trainerApi.addClient(formData);
      navigate('/trainer/clients');
    } catch (err) {
      console.error('Error adding client:', err);
      setError('Failed to add client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-client-container">
      <h1>Agregar nuevo alumno</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="client-form">
        <div className="form-group">
          <label htmlFor="name">Nombre completo</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Contraseña inicial</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="goal">Objetivo principal</label>
          <select
            id="goal"
            name="goal"
            value={formData.goal}
            onChange={handleChange}
          >
            <option value="weight_loss">Perder grasa</option>
            <option value="muscle_gain">Ganar masa muscular</option>
            <option value="maintenance">Mantener</option>
            <option value="other">Otro</option>
          </select>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="initialWeight">Peso inicial (kg)</label>
            <input
              type="number"
              id="initialWeight"
              name="initialWeight"
              value={formData.initialWeight}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="height">Altura (cm)</label>
            <input
              type="number"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="age">Edad</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="gender">Género</label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar</option>
              <option value="female">Femenino</option>
              <option value="male">Masculino</option>
              <option value="other">Otro</option>
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="medicalConditions">Condiciones médicas o lesiones</label>
          <textarea
            id="medicalConditions"
            name="medicalConditions"
            value={formData.medicalConditions}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>
        
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="previousTraining"
            name="previousTraining"
            checked={formData.previousTraining}
            onChange={handleChange}
          />
          <label htmlFor="previousTraining">¿Venía entrenando antes?</label>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/trainer/clients')}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Agregando...' : 'Agregar alumno'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddClient;