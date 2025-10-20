import React, { useState, useEffect } from 'react';
import './EditTrainingModal.css';

interface EditTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainingData: any;
  onUpdateTraining: (trainingData: TrainingData) => void;
}

interface TrainingData {
  type: string;
  hour: number;
  minute: number;
  duration: number;
  exercises: string[];
  location: string;
  notes?: string;
}

const EditTrainingModal: React.FC<EditTrainingModalProps> = ({
  isOpen,
  onClose,
  trainingData,
  onUpdateTraining
}) => {
  const [formData, setFormData] = useState<TrainingData>({
    type: '',
    hour: 9,
    minute: 0,
    duration: 1,
    exercises: [],
    location: 'Gimnasio TrainFit',
    notes: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [exerciseInput, setExerciseInput] = useState('');

  // Prellenar el formulario con los datos del entrenamiento a editar
  useEffect(() => {
    if (trainingData && isOpen) {
      setFormData({
        type: trainingData.type || '',
        hour: trainingData.hour || 9,
        minute: trainingData.minute || 0,
        duration: trainingData.duration || 1,
        exercises: trainingData.exercises || [],
        location: trainingData.location || 'Gimnasio TrainFit',
        notes: trainingData.notes || ''
      });
    }
  }, [trainingData, isOpen]);

  const trainingTypes = [
    'Fuerza - Tren Superior',
    'Fuerza - Tren Inferior',
    'Cardio + Core',
    'Funcional',
    'Yoga/Estiramiento',
    'Crossfit',
    'Natación',
    'Ciclismo',
    'Running',
    'Otro'
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.type.trim()) {
      newErrors.type = 'El tipo de entrenamiento es requerido';
    }

    if (formData.duration <= 0 || formData.duration > 5) {
      newErrors.duration = 'La duración debe estar entre 0.5 y 5 horas';
    }

    if (formData.exercises.length === 0) {
      newErrors.exercises = 'Debe agregar al menos un ejercicio';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const trainingDataToSubmit = {
        ...formData,
        date: trainingData?.date || new Date()
      };
      onUpdateTraining(trainingDataToSubmit);
    }
  };

  const handleAddExercise = () => {
    if (exerciseInput.trim() && !formData.exercises.includes(exerciseInput.trim())) {
      setFormData(prev => ({
        ...prev,
        exercises: [...prev.exercises, exerciseInput.trim()]
      }));
      setExerciseInput('');
      if (errors.exercises) {
        setErrors(prev => ({ ...prev, exercises: '' }));
      }
    }
  };

  const handleRemoveExercise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (field: keyof TrainingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleClose = () => {
    setFormData({
      type: '',
      hour: 9,
      minute: 0,
      duration: 1,
      exercises: [],
      location: 'Gimnasio TrainFit',
      notes: ''
    });
    setErrors({});
    setExerciseInput('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="edit-training-modal-overlay" onClick={handleClose}>
      <div className="edit-training-modal" onClick={(e) => e.stopPropagation()}>
        <div className="edit-training-modal-header">
          <h2>Editar Entrenamiento</h2>
          <button className="close-button" onClick={handleClose}>
            ✕
          </button>
        </div>

        <div className="edit-training-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="type">Tipo de Entrenamiento *</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className={errors.type ? 'error' : ''}
              >
                <option value="">Selecciona un tipo</option>
                {trainingTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.type && <span className="error-message">{errors.type}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hour">Hora</label>
                <select
                  id="hour"
                  value={formData.hour}
                  onChange={(e) => handleInputChange('hour', parseInt(e.target.value))}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="duration">Duración (horas) *</label>
                <input
                  type="number"
                  id="duration"
                  min="0.5"
                  max="5"
                  step="0.5"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseFloat(e.target.value))}
                  className={errors.duration ? 'error' : ''}
                />
                {errors.duration && <span className="error-message">{errors.duration}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Ejercicios *</label>
              <div className="exercise-input-container">
                <input
                  type="text"
                  placeholder="Agregar ejercicio"
                  value={exerciseInput}
                  onChange={(e) => setExerciseInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExercise())}
                />
                <button type="button" onClick={handleAddExercise} className="add-exercise-btn">
                  Agregar
                </button>
              </div>
              
              <div className="exercises-list">
                {formData.exercises.map((exercise, index) => (
                  <div key={index} className="exercise-item">
                    <span>{exercise}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(index)}
                      className="remove-exercise-btn"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              {errors.exercises && <span className="error-message">{errors.exercises}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="location">Ubicación *</label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ej: Gimnasio TrainFit"
                className={errors.location ? 'error' : ''}
              />
              {errors.location && <span className="error-message">{errors.location}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notas adicionales</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Notas opcionales sobre el entrenamiento"
                rows={3}
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleClose} className="cancel-btn">
                Cancelar
              </button>
              <button type="submit" className="submit-btn">
                Actualizar Entrenamiento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTrainingModal;