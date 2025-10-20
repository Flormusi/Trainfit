import React from 'react';
import { Link } from 'react-router-dom';
import { useClient } from '../../context/ClientContext';
import { useParams } from 'react-router-dom';
import { trainerApi } from '../../../../../services/api';
import '../../styles/routines.css';

const RoutinesTab = () => {
  const { client, routines } = useClient();
  const { clientId } = useParams();
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyRoutines = routines?.filter(routine => {
    const dateToCheck = routine.assignedDate || routine.createdAt;
    if (!dateToCheck) return false;
    const routineDate = new Date(dateToCheck);
    return routineDate.getMonth() === currentMonth && routineDate.getFullYear() === currentYear;
  }) || [];

  // Debug logs
  console.log('RoutinesTab - client:', client);
  console.log('RoutinesTab - routines:', routines);
  console.log('RoutinesTab - clientId:', clientId);
  console.log('RoutinesTab - monthlyRoutines:', monthlyRoutines);
  console.log('RoutinesTab - monthlyRoutines.length:', monthlyRoutines.length);

  // TEMPORAL: Agregar rutina de prueba para verificar el botón
  const testRoutine = {
    id: 'test-1',
    name: 'Rutina de Prueba',
    description: 'Esta es una rutina de prueba para verificar el botón de email',
    assignedDate: new Date().toISOString(),
    exerciseCount: 5,
    difficulty: 'Intermedio',
    estimatedDuration: 45,
    completionRate: 75,
    completedSessions: 9,
    totalSessions: 12
  };
  
  const routinesWithTest = [...monthlyRoutines, testRoutine];

  return (
    <div className="routines-tab">
      <div className="tab-actions">
        <Link to={`/trainer/clients/${clientId}/routines/assign`} className="action-btn">
          Asignar Rutina
        </Link>
        <Link to={`/trainer/routines/create?clientId=${clientId}`} className="action-btn">
          Crear Nueva Rutina
        </Link>
      </div>
      
      <div className="routines-header">
        <h2>Rutinas del Mes - {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h2>
        <p className="routines-subtitle">Rutinas asignadas y progreso del cliente este mes</p>
      </div>
      
      {routinesWithTest.length === 0 ? (
        <div className="empty-state">
          <p>No hay rutinas asignadas para este mes.</p>
          <p className="empty-subtitle">Asigna una rutina para comenzar el entrenamiento del cliente.</p>
          <p style={{color: 'red', marginTop: '10px'}}>DEBUG: Total rutinas: {routines?.length || 0}</p>
          <p style={{color: 'red'}}>DEBUG: Rutinas filtradas del mes: {monthlyRoutines.length}</p>
        </div>
      ) : (
        <div className="routines-grid">
          {routinesWithTest.map(routine => (
            <RoutineCard key={routine.id} routine={routine} clientId={clientId} />
          ))}
        </div>
      )}
      
      <MonthlySummary client={client} />
    </div>
  );
};

const RoutineCard = ({ routine, clientId }) => {
  console.log('RoutineCard - routine:', routine);
  console.log('RoutineCard - clientId:', clientId);
  
  const handleEditRoutine = () => {
    // Navegar a la página de edición de rutina
    window.location.href = `/trainer/routines/${routine.id}/edit`;
  };

  const handleRemoveRoutine = async () => {
    const confirmRemove = window.confirm(
      `¿Estás seguro de que quieres remover la rutina "${routine.name}" de este cliente?\n\nEsta acción no eliminará la rutina, solo la desasignará del cliente.`
    );
    
    if (!confirmRemove) return;

    try {
      await trainerApi.unassignRoutineFromClient(clientId, routine.id);
      alert(`✅ Rutina "${routine.name}" removida exitosamente del cliente.`);
      // Recargar la página para actualizar la lista
      window.location.reload();
    } catch (error) {
      console.error('Error al remover la rutina:', error);
      alert('❌ Error al remover la rutina. Por favor, inténtalo de nuevo.');
    }
  };

  const handleResendEmail = async () => {
    const confirmResend = window.confirm(
      `¿Quieres reenviar el email de la rutina "${routine.name}" al cliente?\n\nSe enviará una nueva notificación por correo electrónico.`
    );
    
    if (!confirmResend) return;

    try {
      const response = await trainerApi.resendRoutineEmail(clientId, routine.id);
      alert(`✅ ${response.message || 'Email reenviado exitosamente'}`);
    } catch (error) {
      console.error('Error al reenviar el email:', error);
      alert('❌ Error al reenviar el email. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="routine-card monthly-routine">
      <div className="routine-header">
        <h3>{routine.name}</h3>
        <span className="routine-date">
          Asignada: {(routine.assignedDate || routine.createdAt) ? new Date(routine.assignedDate || routine.createdAt).toLocaleDateString('es-ES') : 'N/A'}
        </span>
      </div>
      <p className="routine-description">{routine.description}</p>
      <div className="routine-meta">
        <span className="routine-exercises">
          <i className="icon-exercise"></i>
          {routine.exerciseCount || routine.exercises?.length || 0} ejercicios
        </span>
        <span className="routine-difficulty">
          <i className="icon-difficulty"></i>
          {routine.difficulty || 'Intermedio'}
        </span>
        <span className="routine-duration">
          <i className="icon-time"></i>
          {routine.estimatedDuration || '45'} min
        </span>
      </div>
      <div className="routine-progress">
        <div className="progress-header">
          <span className="progress-label">Progreso del mes</span>
          <span className="progress-percentage">{routine.completionRate || 0}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${routine.completionRate || 0}%` }}
          ></div>
        </div>
        <div className="progress-stats">
          <span className="sessions-completed">
            {routine.completedSessions || 0} de {routine.totalSessions || 12} sesiones
          </span>
        </div>
      </div>
      <div className="routine-actions">
        <Link to={`/trainer/routines/${routine.id}`} className="view-routine-btn primary">
          Ver Rutina
        </Link>
        <Link to={`/trainer/routines/${routine.id}/progress`} className="view-progress-btn">
          Ver Progreso
        </Link>
        <button 
          className="resend-email-btn" 
          title="Reenviar email de rutina"
          onClick={handleResendEmail}
          style={{
            backgroundColor: '#ff6600',
            color: 'white',
            border: '3px solid #ff4400',
            padding: '15px 25px',
            borderRadius: '10px',
            minWidth: '160px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            gap: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            transition: 'all 0.2s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#ff4400';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#ff6600';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
          }}
        >
          📧 ENVIAR EMAIL
        </button>
        <button 
          className="edit-routine-btn" 
          title="Editar rutina"
          onClick={handleEditRoutine}
        >
          ✏️
        </button>
        <button 
          className="remove-routine-btn" 
          title="Remover rutina"
          onClick={handleRemoveRoutine}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

const MonthlySummary = ({ client }) => {
  return (
    <div className="monthly-summary">
      <h3>Resumen del Mes</h3>
      <div className="summary-stats">
        <div className="stat-item">
          <span className="stat-value">{client?.routines?.filter(r => {
            const dateToCheck = r.assignedDate || r.createdAt;
            if (!dateToCheck) return false;
            const routineDate = new Date(dateToCheck);
            return routineDate.getMonth() === new Date().getMonth() && routineDate.getFullYear() === new Date().getFullYear();
          }).length || 0}</span>
          <span className="stat-label">Rutinas Asignadas</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{client?.monthlyStats?.completedWorkouts || 0}</span>
          <span className="stat-label">Entrenamientos Completados</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{client?.monthlyStats?.averageRating || 'N/A'}</span>
          <span className="stat-label">Calificación Promedio</span>
        </div>
      </div>
    </div>
  );
};

export default RoutinesTab;