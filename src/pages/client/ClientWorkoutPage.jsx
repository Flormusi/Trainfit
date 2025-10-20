import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, PlayIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import './ClientWorkoutPage.css';
// import WorkoutRoutineViewer from '../../components/workout/WorkoutRoutineViewer'; // Example
// import WorkoutBuilder from '../../components/workout/WorkoutBuilder'; // If client can edit weights
// import { fetchClientWorkoutPlan } from '../../services/api.ts'; // Example API call

const ClientWorkoutPage = () => {
  const [workoutPlan, setWorkoutPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeWeek, setActiveWeek] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadWorkout = async () => {
      try {
        // const plan = await fetchClientWorkoutPlan(); // Replace with actual API call
        // setWorkoutPlan(plan);
        // Dummy data for now:
        setWorkoutPlan({
          id: 'clientPlan1',
          name: "Mi Rutina Actual",
          description: "Plan de entrenamiento personalizado diseñado por tu entrenador",
          weeks: [
            { 
              id: 'w1', 
              name: 'Semana 1 - Adaptación', 
              status: 'completed',
              exercises: [
                { id: 'ex1', name: 'Push Ups', series: 3, reps: 10, weight: 'Peso corporal', completed: true, notes: 'Mantén la forma correcta' },
                { id: 'ex2', name: 'Squats', series: 3, reps: 15, weight: 'Peso corporal', completed: true, notes: 'Baja hasta 90 grados' },
                { id: 'ex3', name: 'Plank', series: 3, reps: '30s', weight: 'Peso corporal', completed: false, notes: 'Mantén el core activo' }
              ]
            },
            { 
              id: 'w2', 
              name: 'Semana 2 - Progresión', 
              status: 'active',
              exercises: [
                { id: 'ex4', name: 'Push Ups', series: 4, reps: 12, weight: 'Peso corporal', completed: false, notes: 'Incrementa las repeticiones' },
                { id: 'ex5', name: 'Squats', series: 4, reps: 18, weight: 'Peso corporal', completed: false, notes: 'Controla la bajada' },
                { id: 'ex6', name: 'Plank', series: 3, reps: '45s', weight: 'Peso corporal', completed: false, notes: 'Aumenta el tiempo' }
              ]
            },
            { 
              id: 'w3', 
              name: 'Semana 3 - Intensificación', 
              status: 'pending',
              exercises: [
                { id: 'ex7', name: 'Push Ups', series: 4, reps: 15, weight: 'Peso corporal', completed: false, notes: 'Forma perfecta' },
                { id: 'ex8', name: 'Squats', series: 4, reps: 20, weight: 'Peso corporal', completed: false, notes: 'Explosividad en la subida' },
                { id: 'ex9', name: 'Plank', series: 4, reps: '60s', weight: 'Peso corporal', completed: false, notes: 'Resistencia máxima' }
              ]
            }
          ]
        });
      } catch (err) {
        setError('Error al cargar el plan de entrenamiento.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadWorkout();
  }, []);

  const handleStartWorkout = (weekId) => {
    // Navigate to workout execution or mark as started
    console.log('Starting workout for week:', weekId);
  };

  const toggleExerciseComplete = (weekIndex, exerciseId) => {
    setWorkoutPlan(prev => ({
      ...prev,
      weeks: prev.weeks.map((week, idx) => 
        idx === weekIndex 
          ? {
              ...week,
              exercises: week.exercises.map(ex => 
                ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
              )
            }
          : week
      )
    }));
  };

  if (loading) {
    return (
      <div className="client-workout-page">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Cargando plan de entrenamiento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-workout-page">
        <div className="error-container">
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!workoutPlan) {
    return (
      <div className="client-workout-page">
        <div className="empty-state">
          <div className="empty-state-icon">
            <ClockIcon className="w-16 h-16" />
          </div>
          <h3 className="empty-state-title">Sin Plan Asignado</h3>
          <p className="empty-state-description">
            Aún no tienes un plan de entrenamiento asignado. Contacta a tu entrenador para obtener tu rutina personalizada.
          </p>
          <button onClick={() => navigate('/client-dashboard')} className="btn btn-primary">
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="client-workout-page">
      {/* Header */}
      <div className="workout-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <ArrowLeftIcon className="w-5 h-5" />
          Volver
        </button>
        <div className="header-content">
          <h1>{workoutPlan.name}</h1>
          <p className="workout-description">{workoutPlan.description}</p>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="week-navigation">
        {workoutPlan.weeks.map((week, index) => (
          <button
            key={week.id}
            onClick={() => setActiveWeek(index)}
            className={`week-tab ${activeWeek === index ? 'active' : ''} ${week.status}`}
          >
            <span className="week-name">{week.name}</span>
            <span className={`week-status status-${week.status}`}>
              {week.status === 'completed' && <CheckCircleIcon className="w-4 h-4" />}
              {week.status === 'active' && <PlayIcon className="w-4 h-4" />}
              {week.status === 'pending' && <ClockIcon className="w-4 h-4" />}
            </span>
          </button>
        ))}
      </div>

      {/* Active Week Content */}
      {workoutPlan.weeks[activeWeek] && (
        <div className="week-content">
          <div className="week-header">
            <h2>{workoutPlan.weeks[activeWeek].name}</h2>
            <button 
              onClick={() => handleStartWorkout(workoutPlan.weeks[activeWeek].id)}
              className="btn btn-primary start-workout-btn"
              disabled={workoutPlan.weeks[activeWeek].status === 'pending'}
            >
              <PlayIcon className="w-5 h-5" />
              {workoutPlan.weeks[activeWeek].status === 'completed' ? 'Repetir Semana' : 'Comenzar Entrenamiento'}
            </button>
          </div>

          {/* Exercises Grid */}
          <div className="exercises-grid">
            {workoutPlan.weeks[activeWeek].exercises.map((exercise) => (
              <div key={exercise.id} className={`exercise-card ${exercise.completed ? 'completed' : ''}`}>
                <div className="exercise-header">
                  <h3 className="exercise-name">{exercise.name}</h3>
                  <button
                    onClick={() => toggleExerciseComplete(activeWeek, exercise.id)}
                    className={`completion-toggle ${exercise.completed ? 'completed' : ''}`}
                    disabled={workoutPlan.weeks[activeWeek].status === 'pending'}
                  >
                    <CheckCircleIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="exercise-details">
                  <div className="detail-item">
                    <span className="label">Series:</span>
                    <span className="value">{exercise.series}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Repeticiones:</span>
                    <span className="value">{exercise.reps}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Peso:</span>
                    <span className="value">{exercise.weight}</span>
                  </div>
                </div>

                {exercise.notes && (
                  <div className="exercise-notes">
                    <p><strong>Notas:</strong> {exercise.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Week Progress */}
          <div className="week-progress">
            <div className="progress-header">
              <h3>Progreso de la Semana</h3>
              <span className="progress-text">
                {workoutPlan.weeks[activeWeek].exercises.filter(ex => ex.completed).length} / {workoutPlan.weeks[activeWeek].exercises.length} ejercicios completados
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${(workoutPlan.weeks[activeWeek].exercises.filter(ex => ex.completed).length / workoutPlan.weeks[activeWeek].exercises.length) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientWorkoutPage;