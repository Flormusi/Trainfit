import React, { useState } from 'react';
import './TrainingObjectives.css';

interface TrainingObjectivesProps {
  selectedObjectives: string[];
  onObjectivesChange: (objectives: string[]) => void;
  disabled?: boolean;
}

const TRAINING_OBJECTIVES = [
  {
    id: 'fuerza',
    name: 'Fuerza',
    description: 'Desarrollo de fuerza máxima y potencia muscular',
    icon: '💪'
  },
  {
    id: 'hipertrofia',
    name: 'Hipertrofia',
    description: 'Aumento del volumen y masa muscular',
    icon: '🏋️'
  },
  {
    id: 'resistencia',
    name: 'Resistencia',
    description: 'Mejora de la capacidad cardiovascular y resistencia muscular',
    icon: '🏃'
  },
  {
    id: 'perdida_peso',
    name: 'Pérdida de Peso',
    description: 'Reducción de grasa corporal y definición muscular',
    icon: '⚖️'
  },
  {
    id: 'tonificacion',
    name: 'Tonificación',
    description: 'Mejora del tono muscular y definición corporal',
    icon: '✨'
  },
  {
    id: 'funcional',
    name: 'Entrenamiento Funcional',
    description: 'Mejora de movimientos cotidianos y estabilidad',
    icon: '🤸'
  },
  {
    id: 'rehabilitacion',
    name: 'Rehabilitación',
    description: 'Recuperación de lesiones y mejora de movilidad',
    icon: '🩹'
  },
  {
    id: 'flexibilidad',
    name: 'Flexibilidad',
    description: 'Aumento del rango de movimiento y elasticidad',
    icon: '🧘'
  }
];

const TrainingObjectives: React.FC<TrainingObjectivesProps> = ({
  selectedObjectives,
  onObjectivesChange,
  disabled = false
}) => {
  const handleObjectiveToggle = (objectiveId: string) => {
    if (disabled) return;
    
    const updatedObjectives = selectedObjectives.includes(objectiveId)
      ? selectedObjectives.filter(id => id !== objectiveId)
      : [...selectedObjectives, objectiveId];
    
    onObjectivesChange(updatedObjectives);
  };

  return (
    <div className="training-objectives">
      <div className="training-objectives__header">
        <h3 className="training-objectives__title">
          Objetivos de Entrenamiento
        </h3>
        <p className="training-objectives__subtitle">
          Selecciona uno o más objetivos para personalizar la rutina
        </p>
      </div>
      
      <div className="training-objectives__grid">
        {TRAINING_OBJECTIVES.map((objective) => {
          const isSelected = selectedObjectives.includes(objective.id);
          
          return (
            <div
              key={objective.id}
              className={`training-objective-card ${
                isSelected ? 'training-objective-card--selected' : ''
              } ${
                disabled ? 'training-objective-card--disabled' : ''
              }`}
              onClick={() => handleObjectiveToggle(objective.id)}
            >
              <div className="training-objective-card__icon">
                {objective.icon}
              </div>
              <div className="training-objective-card__content">
                <h4 className="training-objective-card__name">
                  {objective.name}
                </h4>
                <p className="training-objective-card__description">
                  {objective.description}
                </p>
              </div>
              <div className="training-objective-card__checkbox">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleObjectiveToggle(objective.id)}
                  disabled={disabled}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedObjectives.length > 0 && (
        <div className="training-objectives__summary">
          <h4>Objetivos seleccionados:</h4>
          <div className="training-objectives__selected">
            {selectedObjectives.map(objectiveId => {
              const objective = TRAINING_OBJECTIVES.find(obj => obj.id === objectiveId);
              return objective ? (
                <span key={objectiveId} className="training-objectives__tag">
                  {objective.icon} {objective.name}
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingObjectives;
export { TRAINING_OBJECTIVES };