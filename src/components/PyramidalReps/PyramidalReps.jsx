import React, { useState } from 'react';
import './PyramidalReps.css';

// Patrones predefinidos de repeticiones piramidales
export const PyramidalPattern = {
  ASCENDING: 'ascending',
  DESCENDING: 'descending',
  PYRAMID: 'pyramid',
  REVERSE_PYRAMID: 'reverse_pyramid',
  CUSTOM: 'custom'
};

const PyramidalReps = ({ 
  selectedPattern, 
  customSequence, 
  onPatternChange, 
  onCustomSequenceChange 
}) => {
  const [customInput, setCustomInput] = useState('');

  const patterns = [
    {
      id: PyramidalPattern.ASCENDING,
      name: 'Pirámide Ascendente',
      description: 'Incremento progresivo de repeticiones',
      example: '8, 10, 12, 15',
      icon: '📈'
    },
    {
      id: PyramidalPattern.DESCENDING,
      name: 'Pirámide Descendente',
      description: 'Reducción progresiva de repeticiones',
      example: '15, 12, 10, 8',
      icon: '📉'
    },
    {
      id: PyramidalPattern.PYRAMID,
      name: 'Pirámide Completa',
      description: 'Subida y bajada de repeticiones',
      example: '8, 10, 12, 10, 8',
      icon: '🔺'
    },
    {
      id: PyramidalPattern.REVERSE_PYRAMID,
      name: 'Pirámide Inversa',
      description: 'Bajada y subida de repeticiones',
      example: '12, 8, 6, 8, 12',
      icon: '🔻'
    },
    {
      id: PyramidalPattern.CUSTOM,
      name: 'Secuencia Personalizada',
      description: 'Define tu propia secuencia',
      example: 'Ej: 6, 8, 10, 12',
      icon: '⚙️'
    }
  ];

  const handlePatternSelect = (patternId) => {
    onPatternChange(patternId);
    
    // Si no es custom, limpiar la secuencia personalizada
    if (patternId !== PyramidalPattern.CUSTOM) {
      onCustomSequenceChange([]);
      setCustomInput('');
    }
  };

  const handleCustomSequenceChange = (value) => {
    setCustomInput(value);
    
    // Parsear la entrada y convertir a array de números
    const numbers = value
      .split(',')
      .map(num => parseInt(num.trim()))
      .filter(num => !isNaN(num) && num > 0);
    
    onCustomSequenceChange(numbers);
  };

  const getPatternPreview = (pattern) => {
    switch (pattern.id) {
      case PyramidalPattern.ASCENDING:
        return [8, 10, 12, 15];
      case PyramidalPattern.DESCENDING:
        return [15, 12, 10, 8];
      case PyramidalPattern.PYRAMID:
        return [8, 10, 12, 10, 8];
      case PyramidalPattern.REVERSE_PYRAMID:
        return [12, 8, 6, 8, 12];
      default:
        return [];
    }
  };

  return (
    <div className="pyramidal-reps">
      <h3 className="pyramidal-title">
        <span className="pyramidal-icon">🔢</span>
        Repeticiones Piramidales
      </h3>
      <p className="pyramidal-description">
        Selecciona un patrón de repeticiones para variar la intensidad
      </p>
      
      <div className="patterns-grid">
        {patterns.map(pattern => (
          <div
            key={pattern.id}
            className={`pattern-card ${
              selectedPattern === pattern.id ? 'selected' : ''
            }`}
            onClick={() => handlePatternSelect(pattern.id)}
          >
            <div className="pattern-header">
              <span className="pattern-icon">{pattern.icon}</span>
              <div className="pattern-info">
                <h4 className="pattern-name">{pattern.name}</h4>
                <p className="pattern-description">{pattern.description}</p>
              </div>
              <div className="pattern-radio">
                {selectedPattern === pattern.id && (
                  <span className="radio-selected">●</span>
                )}
              </div>
            </div>
            
            {pattern.id !== PyramidalPattern.CUSTOM && (
              <div className="pattern-preview">
                <span className="preview-label">Ejemplo:</span>
                <div className="preview-sequence">
                  {getPatternPreview(pattern).map((rep, index) => (
                    <span key={index} className="rep-number">{rep}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {selectedPattern === PyramidalPattern.CUSTOM && (
        <div className="custom-sequence-input">
          <label className="custom-label">
            <span className="label-text">Secuencia Personalizada:</span>
            <span className="label-hint">Ingresa los números separados por comas</span>
          </label>
          <input
            type="text"
            className="custom-input"
            placeholder="Ej: 6, 8, 10, 12, 10, 8"
            value={customInput}
            onChange={(e) => handleCustomSequenceChange(e.target.value)}
          />
          {customSequence.length > 0 && (
            <div className="custom-preview">
              <span className="preview-label">Vista previa:</span>
              <div className="preview-sequence">
                {customSequence.map((rep, index) => (
                  <span key={index} className="rep-number">{rep}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {selectedPattern && selectedPattern !== PyramidalPattern.CUSTOM && (
        <div className="selected-pattern-summary">
          <p className="summary-text">
            Patrón seleccionado: {patterns.find(p => p.id === selectedPattern)?.name}
          </p>
        </div>
      )}
    </div>
  );
};

export default PyramidalReps;