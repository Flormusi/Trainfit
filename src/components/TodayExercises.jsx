import React, { useState } from 'react';
import axios from 'axios';
import './TodayExercises.css';

const TodayExercises = ({ exercises, clientId, onProgressRecord }) => {
  const [exerciseWeights, setExerciseWeights] = useState({});

  const handleWeightChange = (exerciseId, weight) => {
    setExerciseWeights({
      ...exerciseWeights,
      [exerciseId]: weight
    });
  };

  const recordProgress = async (exerciseId) => {
    try {
      await axios.post(`/api/clients/${clientId}/progress`, {
        exerciseId,
        weight: exerciseWeights[exerciseId] || 0
      });
      onProgressRecord();
    } catch (error) {
      console.error('Error recording progress:', error);
    }
  };

  return (
    <div className="today-exercises">
      <h2>Ejercicios de hoy</h2>
      {exercises.length === 0 ? (
        <p className="no-exercises">No hay ejercicios programados para hoy</p>
      ) : (
        <div className="exercises-list">
          {exercises.map(exercise => (
            <div key={exercise.id} className="exercise-item">
              <div className="exercise-details">
                <h3>{exercise.name}</h3>
                <p>{exercise.sets} x {exercise.reps} {exerciseWeights[exercise.id] || exercise.weight || 0} kg</p>
              </div>
              <button 
                className="edit-weight-btn"
                onClick={() => recordProgress(exercise.id)}
              >
                ✏️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodayExercises;