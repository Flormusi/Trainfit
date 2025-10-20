import React, { useState, useEffect } from 'react';
import './PyramidalReps.css';

interface PyramidalPattern {
  id: string;
  name: string;
  sequence: number[];
  description: string;
}

interface PyramidalRepsProps {
  selectedPattern: PyramidalPattern | null;
  customSequence: number[];
  onPatternChange: (pattern: PyramidalPattern | null) => void;
  onCustomSequenceChange: (sequence: number[]) => void;
  disabled?: boolean;
}

const PREDEFINED_PATTERNS: PyramidalPattern[] = [
  {
    id: 'classic_pyramid',
    name: 'Pirámide Clásica',
    sequence: [12, 10, 8, 6, 4],
    description: 'Reducción progresiva de repeticiones con aumento de peso'
  },
  {
    id: 'reverse_pyramid',
    name: 'Pirámide Inversa',
    sequence: [4, 6, 8, 10, 12],
    description: 'Aumento progresivo de repeticiones con reducción de peso'
  },
  {
    id: 'diamond_pyramid',
    name: 'Pirámide Diamante',
    sequence: [12, 8, 4, 8, 12],
    description: 'Patrón de subida y bajada para máximo estímulo'
  },
  {
    id: 'strength_focus',
    name: 'Enfoque Fuerza',
    sequence: [5, 3, 1, 3, 5],
    description: 'Patrón específico para desarrollo de fuerza máxima'
  },
  {
    id: 'hypertrophy_focus',
    name: 'Enfoque Hipertrofia',
    sequence: [15, 12, 10, 8, 10],
    description: 'Patrón optimizado para crecimiento muscular'
  },
  {
    id: 'endurance_pyramid',
    name: 'Pirámide Resistencia',
    sequence: [20, 15, 12, 15, 20],
    description: 'Patrón para desarrollo de resistencia muscular'
  }
];

const PyramidalReps: React.FC<PyramidalRepsProps> = ({
  selectedPattern,
  customSequence,
  onPatternChange,
  onCustomSequenceChange,
  disabled = false
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [inputError, setInputError] = useState('');

  useEffect(() => {
    if (customSequence.length > 0) {
      setCustomInput(customSequence.join(', '));
      setIsCustomMode(true);
    }
  }, [customSequence]);

  const handlePatternSelect = (pattern: PyramidalPattern) => {
    if (disabled) return;
    
    setIsCustomMode(false);
    setInputError('');
    onPatternChange(pattern);
    onCustomSequenceChange([]);
  };

  const handleCustomModeToggle = () => {
    if (disabled) return;
    
    if (isCustomMode) {
      // Salir del modo personalizado
      setIsCustomMode(false);
      setCustomInput('');
      setInputError('');
      onPatternChange(null);
      onCustomSequenceChange([]);
    } else {
      // Entrar al modo personalizado
      setIsCustomMode(true);
      onPatternChange(null);
    }
  };

  const handleCustomInputChange = (value: string) => {
    setCustomInput(value);
    setInputError('');
    
    // Validar y parsear la secuencia
    const cleanValue = value.replace(/[^0-9,\s]/g, '');
    const numbers = cleanValue
      .split(',')
      .map(num => parseInt(num.trim()))
      .filter(num => !isNaN(num) && num > 0);
    
    if (numbers.length > 0) {
      if (numbers.length > 10) {
        setInputError('Máximo 10 series permitidas');
        return;
      }
      
      if (numbers.some(num => num > 50)) {
        setInputError('Máximo 50 repeticiones por serie');
        return;
      }
      
      onCustomSequenceChange(numbers);
    } else if (value.trim() !== '') {
      setInputError('Ingresa números separados por comas (ej: 12, 10, 8)');
    } else {
      onCustomSequenceChange([]);
    }
  };

  const renderSequencePreview = (sequence: number[]) => {
    return (
      <div className="sequence-preview">
        {sequence.map((reps, index) => (
          <div key={index} className="sequence-preview__item">
            <span className="sequence-preview__number">{reps}</span>
            <span className="sequence-preview__label">reps</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="pyramidal-reps">
      <div className="pyramidal-reps__header">
        <h3 className="pyramidal-reps__title">
          Repeticiones Piramidales
        </h3>
        <p className="pyramidal-reps__subtitle">
          Configura patrones de repeticiones variables para mayor estímulo
        </p>
      </div>

      <div className="pyramidal-reps__modes">
        <button
          className={`mode-toggle ${!isCustomMode ? 'mode-toggle--active' : ''}`}
          onClick={() => !isCustomMode || handleCustomModeToggle()}
          disabled={disabled}
        >
          Patrones Predefinidos
        </button>
        <button
          className={`mode-toggle ${isCustomMode ? 'mode-toggle--active' : ''}`}
          onClick={handleCustomModeToggle}
          disabled={disabled}
        >
          Secuencia Personalizada
        </button>
      </div>

      {!isCustomMode ? (
        <div className="pyramidal-patterns">
          <div className="pyramidal-patterns__grid">
            {PREDEFINED_PATTERNS.map((pattern) => {
              const isSelected = selectedPattern?.id === pattern.id;
              
              return (
                <div
                  key={pattern.id}
                  className={`pattern-card ${
                    isSelected ? 'pattern-card--selected' : ''
                  } ${
                    disabled ? 'pattern-card--disabled' : ''
                  }`}
                  onClick={() => handlePatternSelect(pattern)}
                >
                  <div className="pattern-card__header">
                    <h4 className="pattern-card__name">{pattern.name}</h4>
                    <div className="pattern-card__radio">
                      <input
                        type="radio"
                        name="pyramidal-pattern"
                        checked={isSelected}
                        onChange={() => handlePatternSelect(pattern)}
                        disabled={disabled}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <p className="pattern-card__description">
                    {pattern.description}
                  </p>
                  {renderSequencePreview(pattern.sequence)}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="custom-sequence">
          <div className="custom-sequence__input-group">
            <label className="custom-sequence__label">
              Secuencia Personalizada
            </label>
            <input
              type="text"
              className={`custom-sequence__input ${
                inputError ? 'custom-sequence__input--error' : ''
              }`}
              placeholder="Ej: 12, 10, 8, 8, 6"
              value={customInput}
              onChange={(e) => handleCustomInputChange(e.target.value)}
              disabled={disabled}
            />
            {inputError && (
              <span className="custom-sequence__error">{inputError}</span>
            )}
            <p className="custom-sequence__help">
              Ingresa las repeticiones separadas por comas. Máximo 10 series de 50 repeticiones cada una.
            </p>
          </div>
          
          {customSequence.length > 0 && !inputError && (
            <div className="custom-sequence__preview">
              <h4>Vista previa:</h4>
              {renderSequencePreview(customSequence)}
            </div>
          )}
        </div>
      )}

      {((selectedPattern && !isCustomMode) || (customSequence.length > 0 && isCustomMode)) && (
        <div className="pyramidal-reps__summary">
          <h4>Configuración seleccionada:</h4>
          <div className="pyramidal-reps__selected">
            {!isCustomMode && selectedPattern ? (
              <div className="selected-pattern">
                <span className="selected-pattern__name">
                  📊 {selectedPattern.name}
                </span>
                <span className="selected-pattern__sequence">
                  {selectedPattern.sequence.join(' → ')} reps
                </span>
              </div>
            ) : (
              <div className="selected-pattern">
                <span className="selected-pattern__name">
                  🎯 Secuencia Personalizada
                </span>
                <span className="selected-pattern__sequence">
                  {customSequence.join(' → ')} reps
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PyramidalReps;
export type { PyramidalPattern };
export { PREDEFINED_PATTERNS };