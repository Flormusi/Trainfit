import React, { useState } from 'react';
import './CreateTrainingModal.css';

interface CreateTrainingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  onCreateTraining: (trainingData: TrainingData) => void;
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

const CreateTrainingModal: React.FC<CreateTrainingModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onCreateTraining
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
  
  const [exerciseInput, setExerciseInput] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const trainingTypes = [
    'Fuerza - Tren Superior',
    'Fuerza - Tren Inferior',
    'Cardio',
    'Cardio + Core',
    'Funcional',
    'Flexibilidad',
    'Entrenamiento Completo',
    'Personalizado'
  ];

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.type.trim()) {
      newErrors.type = 'El tipo de entrenamiento es requerido';
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
    
    if (!validateForm()) {
      return;
    }
    
    onCreateTraining(formData);
    handleClose();
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
    setExerciseInput('');
    setErrors({});
    onClose();
  };

  const addExercise = () => {
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

  const removeExercise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addExercise();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="create-training-modal-overlay" onClick={handleClose}>
      <div className="create-training-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Crear Nuevo Entrenamiento</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="selected-date">
            <strong>Fecha seleccionada:</strong> {selectedDate?.toLocaleDateString('es-ES', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          
          <form onSubmit={handleSubmit} className="training-form">
            {/* Tipo de entrenamiento */}
            <div className="form-group">
              <label htmlFor="type">Tipo de Entrenamiento *</label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className={errors.type ? 'error' : ''}
              >
                <option value="">Seleccionar tipo...</option>
                {trainingTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.type && <span className="error-message">{errors.type}</span>}
            </div>

            {/* Hora y duración */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hour">Hora</label>
                <div className="time-inputs">
                  <input
                    type="number"
                    id="hour"
                    min="0"
                    max="23"
                    value={formData.hour}
                    onChange={(e) => setFormData(prev => ({ ...prev, hour: parseInt(e.target.value) || 0 }))}
                  />
                  <span>:</span>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    step="15"
                    value={formData.minute}
                    onChange={(e) => setFormData(prev => ({ ...prev, minute: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="duration">Duración (horas)</label>
                <input
                  type="number"
                  id="duration"
                  min="0.5"
                  max="4"
                  step="0.5"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseFloat(e.target.value) || 1 }))}
                />
              </div>
            </div>

            {/* Ejercicios */}
            <div className="form-group">
              <label htmlFor="exercises">Ejercicios *</label>
              <div className="exercise-input-group">
                <input
                  type="text"
                  id="exercises"
                  value={exerciseInput}
                  onChange={(e) => setExerciseInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Agregar ejercicio..."
                  className={errors.exercises ? 'error' : ''}
                />
                <button type="button" onClick={addExercise} className="add-exercise-btn">
                  Agregar
                </button>
              </div>
              {errors.exercises && <span className="error-message">{errors.exercises}</span>}
              
              {formData.exercises.length > 0 && (
                <div className="exercises-list">
                  {formData.exercises.map((exercise, index) => (
                    <div key={index} className="exercise-tag">
                      <span>{exercise}</span>
                      <button
                        type="button"
                        onClick={() => removeExercise(index)}
                        className="remove-exercise-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Ubicación */}
            <div className="form-group">
              <label htmlFor="location">Ubicación *</label>
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className={errors.location ? 'error' : ''}
                placeholder="Ej: Gimnasio TrainFit, Casa, Parque..."
              />
              {errors.location && <span className="error-message">{errors.location}</span>}
            </div>

            {/* Notas */}
            <div className="form-group">
              <label htmlFor="notes">Notas adicionales</label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notas opcionales sobre el entrenamiento..."
                rows={3}
              />
            </div>

            {/* Botones */}
            <div className="form-actions">
              <button type="button" onClick={handleClose} className="cancel-btn">
                Cancelar
              </button>
              <button type="submit" className="create-btn">
                Crear Entrenamiento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTrainingModal;