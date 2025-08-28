import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './RoutineDetails.css';

const RoutineDetails = () => {
  const { routineId, clientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Determinar si es vista de entrenador o cliente
  const isTrainerView = location.pathname.includes('/trainer/');
  const isClientView = location.pathname.includes('/client/');

  useEffect(() => {
    const fetchRoutineDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        let url;
        if (isTrainerView) {
          url = `/api/trainer/routines/${routineId}`;
        } else {
          url = `/api/client/routines/${routineId}`;
        }

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Error al cargar los detalles de la rutina');
        }

        const data = await response.json();
        setRoutine(data.data || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutineDetails();
  }, [routineId, isTrainerView]);

  const handleDayChange = (day) => {
    setActiveDay(day);
  };

  const handleExerciseClick = (exercise) => {
    setSelectedExercise(exercise);
  };

  const handleCloseDetails = () => {
    setSelectedExercise(null);
  };

  const handleEditRoutine = () => {
    if (isTrainerView) {
      navigate(`/trainer/routines/${routineId}/edit`);
    } else {
      // Los clientes no pueden editar rutinas
      alert('Solo los entrenadores pueden editar rutinas.');
    }
  };

  const handleDeleteRoutine = async () => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la rutina "${routine.name}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      let url;
      
      if (isTrainerView) {
        url = `/api/trainer/routines/${routineId}`;
      } else {
        url = `/api/client/routines/${routineId}`;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert(`✅ Rutina "${routine.name}" eliminada exitosamente.`);
        navigate(-1); // Volver a la página anterior
      } else {
        throw new Error('Error al eliminar la rutina');
      }
    } catch (error) {
      console.error('Error al eliminar la rutina:', error);
      alert('❌ Error al eliminar la rutina. Por favor, inténtalo de nuevo.');
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    
    // Extract video ID from various YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    return (match && match[2].length === 11)
      ? `https://www.youtube.com/embed/${match[2]}`
      : null;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!routine) {
    return <div className="error-message">Routine not found</div>;
  }

  // Group exercises by day
  const exercisesByDay = {};
  routine.exercises.forEach(exercise => {
    if (!exercisesByDay[exercise.day]) {
      exercisesByDay[exercise.day] = [];
    }
    exercisesByDay[exercise.day].push(exercise);
  });

  // Get unique days
  const days = Object.keys(exercisesByDay).map(Number).sort((a, b) => a - b);

  return (
    <div className="routine-details">
      <div className="details-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <div className="header-title">
          <h1>{routine.name}</h1>
        </div>
        <div className="header-actions">
          {isTrainerView && (
            <>
              <button 
                className="action-btn edit-btn" 
                title="Editar rutina"
                onClick={handleEditRoutine}
              >
                ✏️ Editar
              </button>
              <button 
                className="action-btn delete-btn" 
                title="Eliminar rutina"
                onClick={handleDeleteRoutine}
              >
                🗑️ Eliminar
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="routine-meta-info">
        <div className="meta-item">
          <span className="meta-label">Duración:</span>
          <span className="meta-value">{routine.duration || 4} semanas</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Objetivo:</span>
          <span className="meta-value">{routine.goal || 'No especificado'}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Nivel:</span>
          <span className="meta-value">{routine.level || 'Intermedio'}</span>
        </div>
      </div>
      
      <div className="routine-description">
        <p>{routine.description}</p>
      </div>
      
      <div className="days-tabs">
        {days.map(day => (
          <button 
            key={day}
            className={`day-tab ${activeDay === day ? 'active' : ''}`}
            onClick={() => handleDayChange(day)}
          >
            Día {day}
          </button>
        ))}
      </div>
      
      <div className="day-exercises">
        <h2>Ejercicios - Día {activeDay}</h2>
        
        {!exercisesByDay[activeDay] || exercisesByDay[activeDay].length === 0 ? (
          <p className="no-exercises">No hay ejercicios para este día</p>
        ) : (
          <div className="exercises-list">
            {exercisesByDay[activeDay].map((exercise, index) => (
              <div 
                key={index} 
                className="exercise-item"
                onClick={() => handleExerciseClick(exercise)}
              >
                <div className="exercise-number">{index + 1}</div>
                <div className="exercise-content">
                  <h3>{exercise.name}</h3>
                  <div className="exercise-details">
                    <span className="exercise-sets">{exercise.sets} series</span>
                    <span className="exercise-reps">{exercise.reps} repeticiones</span>
                    {exercise.rest && <span className="exercise-rest">{exercise.rest}s descanso</span>}
                  </div>
                  <p className="exercise-notes">{exercise.notes}</p>
                </div>
                <div className="exercise-actions">
                  <button className="view-details-btn">Ver detalles</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedExercise && (
        <div className="exercise-details-overlay">
          <div className="exercise-details">
            <button 
              className="close-details-btn"
              onClick={handleCloseDetails}
            >
              ✕
            </button>
            
            <h2>{selectedExercise.name}</h2>
            
            {selectedExercise.videoUrl && (
              <div className="video-container">
                <iframe
                  src={getYoutubeEmbedUrl(selectedExercise.videoUrl)}
                  title={selectedExercise.name}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            
            <div className="exercise-instructions">
              <h3>Instrucciones</h3>
              <p>{selectedExercise.instructions || 'No hay instrucciones disponibles para este ejercicio.'}</p>
            </div>
            
            <div className="exercise-prescription">
              <h3>Prescripción</h3>
              <div className="prescription-details">
                <div className="prescription-item">
                  <span className="prescription-label">Series:</span>
                  <span className="prescription-value">{selectedExercise.sets}</span>
                </div>
                <div className="prescription-item">
                  <span className="prescription-label">Repeticiones:</span>
                  <span className="prescription-value">{selectedExercise.reps}</span>
                </div>
                {selectedExercise.rest && (
                  <div className="prescription-item">
                    <span className="prescription-label">Descanso:</span>
                    <span className="prescription-value">{selectedExercise.rest} segundos</span>
                  </div>
                )}
                {selectedExercise.tempo && (
                  <div className="prescription-item">
                    <span className="prescription-label">Tempo:</span>
                    <span className="prescription-value">{selectedExercise.tempo}</span>
                  </div>
                )}
              </div>
            </div>
            
            {selectedExercise.notes && (
              <div className="exercise-notes-section">
                <h3>Notas</h3>
                <p>{selectedExercise.notes}</p>
              </div>
            )}
            
            <div className="record-progress-section">
              <button className="record-progress-btn">
                Registrar progreso
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineDetails;