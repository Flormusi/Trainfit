import React from 'react';
import './TrainingObjectives.css';

const TrainingObjectives = ({ selectedObjectives, onObjectivesChange }) => {
  const objectives = [
    {
      id: 'strength',
      name: 'Fuerza',
      description: 'Desarrollo de fuerza máxima y potencia',
      icon: '💪'
    },
    {
      id: 'hypertrophy',
      name: 'Hipertrofia',
      description: 'Aumento de masa muscular',
      icon: '🏋️'
    },
    {
      id: 'endurance',
      name: 'Resistencia',
      description: 'Mejora de la resistencia cardiovascular y muscular',
      icon: '🏃'
    }
  ];

  const handleObjectiveToggle = (objectiveId) => {
    const updatedObjectives = selectedObjectives.includes(objectiveId)
      ? selectedObjectives.filter(id => id !== objectiveId)
      : [...selectedObjectives, objectiveId];
    
    onObjectivesChange(updatedObjectives);
  };

  return (
    <div className="training-objectives">
      <h3 className="objectives-title">
        <span className="objectives-icon">🎯</span>
        Objetivos de Entrenamiento
      </h3>
      <p className="objectives-description">
        Selecciona uno o más objetivos para personalizar la rutina
      </p>
      
      <div className="objectives-grid">
        {objectives.map(objective => (
          <div
            key={objective.id}
            className={`objective-card ${
              selectedObjectives.includes(objective.id) ? 'selected' : ''
            }`}
            onClick={() => handleObjectiveToggle(objective.id)}
          >
            <div className="objective-icon">{objective.icon}</div>
            <div className="objective-content">
              <h4 className="objective-name">{objective.name}</h4>
              <p className="objective-description">{objective.description}</p>
            </div>
            <div className="objective-checkbox">
              {selectedObjectives.includes(objective.id) && (
                <span className="checkmark">✓</span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {selectedObjectives.length > 0 && (
        <div className="selected-objectives-summary">
          <p className="summary-text">
            Objetivos seleccionados: {selectedObjectives.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default TrainingObjectives;