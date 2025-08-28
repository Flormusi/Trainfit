import React from 'react';
import './ProgressTracker.css';

const ProgressTracker = ({ percentage, bodyWeight }) => {
  return (
    <div className="progress-tracker">
      <div className="progress-section">
        <h2>Avances</h2>
        <div className="weight-tracker">
          <p>Peso corporal</p>
          <h3>{bodyWeight} kg</h3>
        </div>
      </div>
      
      <div className="completion-section">
        <div className="progress-chart">
          <svg width="100" height="50">
            <path 
              d="M0,25 Q25,50 50,25 T100,25" 
              stroke="#ff3b30" 
              strokeWidth="3" 
              fill="none"
            />
          </svg>
        </div>
        <h2>{percentage}%</h2>
        <p>Plan completado</p>
      </div>
    </div>
  );
};

export default ProgressTracker;