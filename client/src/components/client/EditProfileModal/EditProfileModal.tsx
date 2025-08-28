import React, { useState, useEffect } from 'react';
import './EditProfileModal.css';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    weight?: string;
    trainingFrequency?: string;
    objective?: string;
  } | null;
  onUpdateProfile: (profileData: {
    weight: string;
    trainingFrequency: string;
    objective: string;
  }) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onUpdateProfile
}) => {
  const [formData, setFormData] = useState({
    weight: '',
    trainingFrequency: '',
    objective: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentProfile) {
      setFormData({
        weight: currentProfile.weight?.replace(' kg', '') || '',
        trainingFrequency: currentProfile.trainingFrequency?.replace(' días/semana', '') || '',
        objective: currentProfile.objective || ''
      });
    }
  }, [isOpen, currentProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onUpdateProfile({
        weight: formData.weight,
        trainingFrequency: formData.trainingFrequency,
        objective: formData.objective
      });
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-profile-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Perfil</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="weight">Peso (kg)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder="Ej: 70"
              min="30"
              max="200"
              step="0.1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="trainingFrequency">Frecuencia de entrenamiento (días por semana)</label>
            <select
              id="trainingFrequency"
              name="trainingFrequency"
              value={formData.trainingFrequency}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar frecuencia</option>
              <option value="1">1 día por semana</option>
              <option value="2">2 días por semana</option>
              <option value="3">3 días por semana</option>
              <option value="4">4 días por semana</option>
              <option value="5">5 días por semana</option>
              <option value="6">6 días por semana</option>
              <option value="7">7 días por semana</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="objective">Objetivo</label>
            <textarea
              id="objective"
              name="objective"
              value={formData.objective}
              onChange={handleChange}
              placeholder="Describe tu objetivo de entrenamiento..."
              rows={4}
              required
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="save-btn" disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;