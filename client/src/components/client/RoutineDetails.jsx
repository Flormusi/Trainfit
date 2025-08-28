import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clientApi } from '../../services/api.ts';
import './RoutineDetails.css';

const RoutineDetails = () => {
  const { clientId, routineId } = useParams();
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeExercise, setActiveExercise] = useState(null);
  const [workoutLog, setWorkoutLog] = useState({});

  useEffect(() => {
    const fetchRoutineDetails = async () => {
      try {
        setLoading(true);
        const response = await clientApi.getRoutineDetails(routineId);
        setRoutine(response.data);
        
        // Initialize workout log with empty values for each exercise
        const initialLog = {};
        response.data.exercises.forEach(exercise => {
          initialLog[exercise.id] = {
            weight: '',
            reps: '',
            sets: '',
            completed: false
          };
        });
        setWorkoutLog(initialLog);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching routine details:', err);
        setError('Failed to load routine details. Please try again later.');
        setLoading(false);
      }
    };

    fetchRoutineDetails();
  }, [routineId]);

  const handleExerciseClick = (exercise) => {
    setActiveExercise(exercise);
  };

  const handleLogChange = (exerciseId, field, value) => {
    setWorkoutLog({
      ...workoutLog,
      [exerciseId]: {
        ...workoutLog[exerciseId],
        [field]: value
      }
    });
  };

  const handleToggleComplete = (exerciseId) => {
    setWorkoutLog({
      ...workoutLog,
      [exerciseId]: {
        ...workoutLog[exerciseId],
        completed: !workoutLog[exerciseId].completed
      }
    });
  };

  const handleSaveProgress = async () => {
    try {
      const progressData = {
        routineId,
        date: new Date().toISOString(),
        exercises: Object.keys(workoutLog).map(exerciseId => ({
          exerciseId,
          ...workoutLog[exerciseId]
        }))
      };
      
      await clientApi.recordProgress(clientId, progressData);
      alert('Progress saved successfully!');
    } catch (err) {
      console.error('Error saving progress:', err);
      alert('Failed to save progress. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading routine details...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="routine-details">
      <div className="routine-header">
        <Link to={`/client/${clientId}/dashboard`} className="back-link">
          ← Back to Dashboard
        </Link>
        <h1>{routine?.name}</h1>
        <p className="routine-description">{routine?.description}</p>
        <div className="routine-meta">
          <span className="routine-difficulty">{routine?.difficulty}</span>
          <span className="routine-duration">{routine?.estimatedDuration} min</span>
        </div>
      </div>

      <div className="routine-content">
        <div className="exercises-list">
          <h2>Exercises</h2>
          {routine?.exercises.map((exercise, index) => (
            <div 
              key={exercise.id} 
              className={`exercise-item ${activeExercise?.id === exercise.id ? 'active' : ''} ${workoutLog[exercise.id]?.completed ? 'completed' : ''}`}
              onClick={() => handleExerciseClick(exercise)}
            >
              <div className="exercise-number">{index + 1}</div>
              <div className="exercise-info">
                <h3>{exercise.name}</h3>
                <p className="exercise-target">{exercise.targetMuscles}</p>
              </div>
              <div className="exercise-sets">
                {exercise.sets}×{exercise.reps}
              </div>
              <div className="exercise-status">
                <input 
                  type="checkbox" 
                  checked={workoutLog[exercise.id]?.completed || false}
                  onChange={() => handleToggleComplete(exercise.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="exercise-details">
          {activeExercise ? (
            <>
              <div className="exercise-header">
                <h2>{activeExercise.name}</h2>
                <span className="exercise-category">{activeExercise.category}</span>
              </div>
              
              {activeExercise.videoUrl && (
                <div className="video-container">
                  <iframe
                    src={activeExercise.videoUrl.replace('watch?v=', 'embed/')}
                    title={activeExercise.name}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              
              <div className="exercise-instructions">
                <h3>Instructions</h3>
                <p>{activeExercise.instructions}</p>
              </div>
              
              <div className="exercise-log">
                <h3>Track Your Progress</h3>
                <div className="log-form">
                  <div className="log-field">
                    <label>Weight (kg)</label>
                    <input 
                      type="number" 
                      value={workoutLog[activeExercise.id]?.weight || ''}
                      onChange={(e) => handleLogChange(activeExercise.id, 'weight', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <div className="log-field">
                    <label>Sets</label>
                    <input 
                      type="number" 
                      value={workoutLog[activeExercise.id]?.sets || ''}
                      onChange={(e) => handleLogChange(activeExercise.id, 'sets', e.target.value)}
                      placeholder={activeExercise.sets}
                    />
                  </div>
                  <div className="log-field">
                    <label>Reps</label>
                    <input 
                      type="number" 
                      value={workoutLog[activeExercise.id]?.reps || ''}
                      onChange={(e) => handleLogChange(activeExercise.id, 'reps', e.target.value)}
                      placeholder={activeExercise.reps}
                    />
                  </div>
                </div>
                <div className="log-actions">
                  <button 
                    className={`complete-btn ${workoutLog[activeExercise.id]?.completed ? 'completed' : ''}`}
                    onClick={() => handleToggleComplete(activeExercise.id)}
                  >
                    {workoutLog[activeExercise.id]?.completed ? 'Completed' : 'Mark as Complete'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="no-exercise-selected">
              <p>Select an exercise to see details and track your progress.</p>
            </div>
          )}
        </div>
      </div>

      <div className="routine-actions">
        <button className="save-progress-btn" onClick={handleSaveProgress}>
          Save Workout Progress
        </button>
      </div>
    </div>
  );
};

export default RoutineDetails;