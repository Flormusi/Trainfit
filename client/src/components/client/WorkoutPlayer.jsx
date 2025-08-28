import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { clientApi } from '../../services/api.ts';
import './WorkoutPlayer.css';

const WorkoutPlayer = () => {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [weights, setWeights] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoutine = async () => {
      try {
        setLoading(true);
        const response = await clientApi.getRoutineDetails(routineId);
        setRoutine(response.data);
        
        // Initialize weights tracking
        const initialWeights = {};
        response.data.exercises.forEach((exercise, index) => {
          initialWeights[index] = exercise.lastWeight || '';
        });
        setWeights(initialWeights);
        
        setWorkoutStartTime(new Date());
        setLoading(false);
      } catch (err) {
        console.error('Error fetching routine:', err);
        setError('Failed to load workout. Please try again later.');
        setLoading(false);
      }
    };

    fetchRoutine();
  }, [routineId]);

  const handleWeightChange = (exerciseIndex, value) => {
    setWeights(prev => ({
      ...prev,
      [exerciseIndex]: value
    }));
  };

  const handleNextExercise = () => {
    if (routine && currentExerciseIndex < routine.exercises.length - 1) {
      setCurrentExerciseIndex(prevIndex => prevIndex + 1);
    } else {
      handleCompleteWorkout();
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleCompleteWorkout = async () => {
    try {
      const workoutEndTime = new Date();
      const duration = Math.floor((workoutEndTime - workoutStartTime) / 1000 / 60); // in minutes
      
      const completedExercises = Object.keys(weights).map(index => {
        const exerciseIndex = parseInt(index);
        const exercise = routine.exercises[exerciseIndex];
        
        return {
          exerciseId: exercise.id,
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: weights[exerciseIndex] || 0
        };
      });
      
      const workoutData = {
        routineId,
        routineName: routine.name,
        duration,
        exercises: completedExercises,
        completedAt: workoutEndTime.toISOString()
      };
      
      await clientApi.saveWorkoutSession(workoutData);
      setIsCompleted(true);
    } catch (err) {
      console.error('Error saving workout:', err);
      alert('Failed to save workout data. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading-container">Loading workout...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (isCompleted) {
    return (
      <div className="workout-completed">
        <div className="completion-card">
          <div className="completion-icon">🎉</div>
          <h1>Workout Completed!</h1>
          <div className="completion-stats">
            <div className="stat-item">
              <span className="stat-value">{routine.exercises.length}</span>
              <span className="stat-label">Exercises</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {Object.values(routine.exercises).reduce((total, exercise) => total + exercise.sets, 0)}
              </span>
              <span className="stat-label">Sets</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {Math.floor((new Date() - workoutStartTime) / 1000 / 60)}
              </span>
              <span className="stat-label">Minutes</span>
            </div>
          </div>
          <div className="completion-actions">
            <Link to="/client/dashboard" className="action-btn primary">
              Back to Dashboard
            </Link>
            <Link to={`/client/routines/${routineId}`} className="action-btn secondary">
              View Routine
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentExercise = routine?.exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === routine?.exercises.length - 1;

  return (
    <div className="workout-player">
      <div className="workout-header">
        <Link to={`/client/routines/${routineId}`} className="back-link">
          ← Exit Workout
        </Link>
        <h1>{routine?.name}</h1>
      </div>

      <div className="exercise-screen">
        <div className="exercise-details">
          <h2>{currentExercise?.name}</h2>
          <div className="exercise-instructions">
            <div className="exercise-image">
              {currentExercise?.imageUrl ? (
                <img src={currentExercise.imageUrl} alt={currentExercise.name} />
              ) : (
                <div className="placeholder-image">
                  <span>No image available</span>
                </div>
              )}
            </div>
            <div className="exercise-info">
              <div className="info-row">
                <div className="info-item">
                  <span className="info-label">Sets</span>
                  <span className="info-value">{currentExercise?.sets}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Reps</span>
                  <span className="info-value">{currentExercise?.reps}</span>
                </div>
              </div>
              <div className="exercise-description">
                <h3>Instructions</h3>
                <p>{currentExercise?.instructions || 'No instructions available for this exercise.'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="weight-tracker">
          <h3>Track Your Weight</h3>
          <div className="weight-input-container">
            <label htmlFor="weight-input">Weight Used (kg)</label>
            <input
              id="weight-input"
              type="number"
              min="0"
              step="0.5"
              value={weights[currentExerciseIndex] || ''}
              onChange={(e) => handleWeightChange(currentExerciseIndex, e.target.value)}
              placeholder="Enter weight"
            />
          </div>
          {currentExercise?.lastWeight && (
            <div className="last-weight">
              <span>Last time: {currentExercise.lastWeight} kg</span>
            </div>
          )}
        </div>

        <div className="navigation-controls">
          <button 
            className="nav-btn prev" 
            onClick={handlePreviousExercise}
            disabled={currentExerciseIndex === 0}
          >
            Previous
          </button>
          <button 
            className="nav-btn next" 
            onClick={handleNextExercise}
          >
            {isLastExercise ? 'Complete Workout' : 'Next Exercise'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutPlayer;