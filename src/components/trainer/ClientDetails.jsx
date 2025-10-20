import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { trainerApi } from '../../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './ClientDetails.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ClientDetails = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        setLoading(true);
        
        // Fetch client details
        const clientResponse = await trainerApi.getClientDetails(clientId);
        setClient(clientResponse.data);
        
        // Fetch client routines
        try {
          console.log('Fetching routines for client:', clientId);
          const routinesResponse = await trainerApi.getClientRoutines(clientId);
          console.log('Routines response:', routinesResponse);
          setRoutines(routinesResponse.data || []);
          console.log('Routines set to state:', routinesResponse.data || []);
        } catch (routinesError) {
          console.error('Error obteniendo rutinas:', routinesError);
          setRoutines([]);
        }
        
        // Fetch client progress
        try {
          const progressResponse = await trainerApi.getClientProgress(clientId);
          setProgress(progressResponse.data);
        } catch (progressError) {
          console.log('Error obteniendo progreso, continuando sin él');
        }
        
        // Set notes from client data
        if (clientResponse.data.notes) {
          setNotes(clientResponse.data.notes);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching client data:', err);
        setError('Failed to load client data. Please try again later.');
        setLoading(false);
      }
    };

    fetchClientData();
  }, [clientId]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
  };

  const handleSaveNotes = async () => {
    try {
      await trainerApi.saveClientNotes(clientId, notes);
      alert('¡Notas guardadas exitosamente!');
    } catch (err) {
      console.error('Error al guardar notas:', err);
      alert('Error al guardar las notas. Por favor, intenta nuevamente.');
    }
  };

  const handleSendPaymentReminder = async () => {
    try {
      await trainerApi.sendPaymentReminder(clientId);
      alert('¡Recordatorio de pago enviado exitosamente!');
    } catch (err) {
      console.error('Error al enviar recordatorio de pago:', err);
      alert('Error al enviar recordatorio de pago. Por favor, intenta nuevamente.');
    }
  };

  const handleRemoveRoutine = async (routineId, routineName) => {
    const confirmRemove = window.confirm(
      `¿Estás seguro de que quieres desasignar la rutina "${routineName}" de este cliente?`
    );
    
    if (confirmRemove) {
      try {
        await trainerApi.unassignRoutineFromClient(clientId, routineId);
        
        // Actualizar la lista de rutinas
        setRoutines(prevRoutines => 
          prevRoutines.filter(routine => routine.id !== routineId)
        );
        
        alert('Rutina desasignada exitosamente');
      } catch (error) {
        console.error('Error al desasignar rutina:', error);
        alert('Error al desasignar la rutina. Por favor, intenta nuevamente.');
      }
    }
  };

  const handleRefreshRoutines = async () => {
    try {
      console.log('Refreshing routines for client:', clientId);
      const routinesResponse = await trainerApi.getClientRoutines(clientId);
      console.log('Refresh routines response:', routinesResponse);
      setRoutines(routinesResponse.data || []);
      console.log('Routines refreshed:', routinesResponse.data || []);
      alert('Rutinas actualizadas exitosamente');
    } catch (error) {
      console.error('Error al actualizar rutinas:', error);
      alert('Error al actualizar las rutinas. Por favor, intenta nuevamente.');
    }
  };

  const handleViewProgress = () => {
    console.log('🚀 INICIO - handleViewProgress ejecutándose');
    console.log('📍 clientId:', clientId);
    console.log('🧭 navigate function:', navigate);
    console.log('🎯 URL destino:', `/trainer/clients/${clientId}`);
    
    // Verificar que tenemos los valores necesarios
    if (!clientId) {
      console.error('❌ ERROR: clientId es undefined o null');
      alert('Error: ID del cliente no disponible');
      return;
    }
    
    if (!navigate) {
      console.error('❌ ERROR: navigate function no disponible');
      alert('Error: Función de navegación no disponible');
      return;
    }
    
    try {
      console.log('🔄 Ejecutando navigate...');
      navigate(`/trainer/clients/${clientId}`);
      console.log('✅ Navigate ejecutado exitosamente');
    } catch (error) {
      console.error('❌ ERROR en navigate:', error);
      alert('Error en la navegación: ' + error.message);
    }
  };

  const getProgressChartData = () => {
    if (!progress || !progress.metrics) return null;

    return {
      labels: progress.metrics.dates,
      datasets: [
        {
          label: 'Peso (kg)',
          data: progress.metrics.weight,
          borderColor: '#ff3b30',
          backgroundColor: 'rgba(255, 59, 48, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Grasa Corporal (%)',
          data: progress.metrics.bodyFat,
          borderColor: '#34c759',
          backgroundColor: 'rgba(52, 199, 89, 0.1)',
          tension: 0.4,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ddd'
        }
      },
      title: {
        display: true,
        text: 'Métricas de Progreso del Cliente',
        color: '#fff'
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ddd'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ddd'
        }
      }
    }
  };

  if (loading) {
    return <div className="loading-state">Cargando información del cliente...</div>;
  }

  if (error) {
    return <div className="error-state">
      <p>Error al cargar la información: {error}</p>
      <button onClick={() => window.location.reload()} className="retry-btn">
        Reintentar
      </button>
    </div>;
  }

  return (
    <div className="client-details">
      <div className="client-header">
        <div className="trainfit-logo">
        <h2>TRAINFIT</h2>
      </div>
        <Link to="/trainer/clients" className="back-link">
          &larr; Volver a la lista de clientes
        </Link>
      </div>
      
      <div className="client-profile">
        <div className="client-avatar">
          {client?.profileImage ? (
            <img src={client.profileImage} alt={`${client.firstName} ${client.lastName}`} />
          ) : (
            <div className="avatar-placeholder">
              {client?.firstName?.charAt(0)}{client?.lastName?.charAt(0)}
            </div>
          )}
        </div>
        <div className="client-info">
          <h1>{client?.firstName} {client?.lastName}</h1>
          <p>{client?.fitnessGoals || 'Sin objetivos definidos'}</p>
          
          <div className="client-actions">
            <button 
              className="action-btn payment-reminder"
              onClick={handleSendPaymentReminder}
              disabled={!client?.email}
            >
              Enviar recordatorio
            </button>
            
            <Link 
              to={`/trainer/clients/edit/${clientId}`}
              className="action-btn edit-client"
            >
              Editar
            </Link>
          </div>
        </div>
        
        <div className="client-status active">
          Activo
        </div>
      </div>

      <div className="client-summary">
        <div className="summary-section">
          <h2>Información Personal</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Edad</span>
              <span className="info-value">{client?.age || 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Género</span>
              <span className="info-value">{client?.gender === 'Male' ? 'Masculino' : 
                                            client?.gender === 'Female' ? 'Femenino' : 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Altura</span>
              <span className="info-value">{client?.height ? `${client.height} cm` : 'N/A'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Peso</span>
              <span className="info-value">{client?.weight ? `${client.weight} kg` : 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div className="summary-section">
          <h2>Información de Salud</h2>
          <div className="info-value">{client?.medicalConditions || 'N/A'}</div>
        </div>
        
        <div className="summary-section">
          <h2>Actividad Reciente</h2>
          <div className="activity-description">
            Entrenó dos veces<br />
            en los últimos 7 días
          </div>
        </div>
        
        <div className="summary-section">
          <h2>Objetivos de fitness</h2>
          <ul className="goals-list">
            <li className="goal-item">{client?.fitnessGoals || 'Perder grasa corporal'}</li>
          </ul>
        </div>
        
        <div className="summary-section">
          <h2>Rutina actual</h2>
          {(() => {
            // Obtener la rutina más reciente asignada
            const currentRoutine = routines && routines.length > 0 
              ? routines.sort((a, b) => new Date(b.createdAt || b.assignedDate) - new Date(a.createdAt || a.assignedDate))[0]
              : null;
            
            return currentRoutine ? (
              <div className="current-plan">
                <div className="routine-name">{currentRoutine.name}</div>
                <div className="routine-info">
                  <span className="routine-exercises">
                    {currentRoutine.exercises?.length || currentRoutine.exerciseCount || 0} ejercicios
                  </span>
                  <span className="routine-difficulty">
                    {currentRoutine.difficulty || 'Intermedio'}
                  </span>
                </div>
                <div className="routine-progress">
                  <span className="progress-text">
                    Progreso: {currentRoutine.completionRate || 0}%
                  </span>
                  <div className="progress-bar-mini">
                    <div 
                      className="progress-fill-mini" 
                      style={{ width: `${currentRoutine.completionRate || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="current-plan no-routine">
                <div className="no-routine-message">Sin rutina asignada</div>
                <div className="no-routine-subtitle">Asigna una rutina para comenzar</div>
              </div>
            );
          })()}
          <div className="routine-actions-summary">
            {/* SOLUCIÓN SIMPLE Y DIRECTA */}
            <button 
              style={{
                backgroundColor: '#ff3b30',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-block',
                marginTop: '10px',
                fontWeight: 'bold',
                textAlign: 'center',
                border: 'none',
                outline: 'none'
              }}
              onClick={() => {
                console.log('🔥 BOTÓN CLICKEADO! ClientId:', clientId);
                console.log('🚀 Navegando a:', `/trainer/clients/${clientId}`);
                window.location.href = `/trainer/clients/${clientId}`;
              }}
            >
              Ver progreso
            </button>
            <Link to={`/trainer/clients/${clientId}/routines/assign`} className="assign-routine-btn">
              Asignar rutina
            </Link>
          </div>
        </div>
      </div>

      <div className="client-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          Resumen
        </button>
        <button 
          className={`tab-btn ${activeTab === 'routines' ? 'active' : ''}`}
          onClick={() => handleTabChange('routines')}
        >
          Rutinas Asignadas
        </button>
        <button 
          className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => handleTabChange('progress')}
        >
          Progreso
        </button>
        <button 
          className={`tab-btn ${activeTab === 'nutrition' ? 'active' : ''}`}
          onClick={() => handleTabChange('nutrition')}
        >
          Nutrición
        </button>
        <button 
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => handleTabChange('payments')}
        >
          Pagos
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => handleTabChange('notes')}
        >
          Notas
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* El contenido del resumen ya está mostrado arriba */}
          </div>
        )}
        
        {activeTab === 'progress' && (
          <div className="progress-tab">
            <div className="progress-metrics">
              <div className="metrics-summary">
                <div className="metric-card">
                  <span className="metric-value">{progress?.stats?.workoutsCompleted || 0}</span>
                  <span className="metric-label">Entrenamientos Completados</span>
                </div>
                <div className="metric-card">
                  <span className="metric-value">{progress?.stats?.classesAttended || 0}</span>
                  <span className="metric-label">Clases Asistidas</span>
                </div>
                <div className="metric-card">
                  <span className="metric-value">{progress?.stats?.streakDays || 0}</span>
                  <span className="metric-label">Días Consecutivos</span>
                </div>
                <div className="metric-card">
                  <span className="metric-value">{progress?.stats?.consistency || 0}%</span>
                  <span className="metric-label">Consistencia</span>
                </div>
              </div>
              
              <div className="progress-chart-container">
                {getProgressChartData() ? (
                  <Line data={getProgressChartData()} options={chartOptions} />
                ) : (
                  <div className="no-data-message">
                    <p>No hay datos de progreso disponibles para este cliente.</p>
                  </div>
                )}
              </div>
              
              <div className="body-metrics">
                <h3>Métricas Corporales Actuales</h3>
                <div className="metrics-grid">
                  <div className="metric-item">
                    <span className="metric-name">Peso</span>
                    <span className="metric-current">{progress?.currentMetrics?.weight || 0} kg</span>
                    <span className={`metric-change ${(progress?.metricChanges?.weight || 0) >= 0 ? 'positive' : 'negative'}`}>
                      {(progress?.metricChanges?.weight || 0) >= 0 ? '+' : ''}{progress?.metricChanges?.weight || 0} kg
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-name">Grasa Corporal</span>
                    <span className="metric-current">{progress?.currentMetrics?.bodyFat || 0}%</span>
                    <span className={`metric-change ${(progress?.metricChanges?.bodyFat || 0) >= 0 ? 'positive' : 'negative'}`}>
                      {(progress?.metricChanges?.bodyFat || 0) >= 0 ? '+' : ''}{progress?.metricChanges?.bodyFat || 0}%
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-name">Masa Muscular</span>
                    <span className="metric-current">{progress?.currentMetrics?.muscleMass || 0} kg</span>
                    <span className={`metric-change ${(progress?.metricChanges?.muscleMass || 0) >= 0 ? 'positive' : 'negative'}`}>
                      {(progress?.metricChanges?.muscleMass || 0) >= 0 ? '+' : ''}{progress?.metricChanges?.muscleMass || 0} kg
                    </span>
                  </div>
                  <div className="metric-item">
                    <span className="metric-name">BMI</span>
                    <span className="metric-current">{progress?.currentMetrics?.bmi || 0}</span>
                    <span className={`metric-change ${(progress?.metricChanges?.bmi || 0) >= 0 ? 'positive' : 'negative'}`}>
                      {(progress?.metricChanges?.bmi || 0) >= 0 ? '+' : ''}{progress?.metricChanges?.bmi || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'routines' && (
          <div className="routines-tab">
            <div className="tab-actions">
              <Link to={`/trainer/clients/${clientId}/routines/assign`} className="action-btn primary">
                <span className="btn-icon">📋</span>
                Asignar Rutina Existente
              </Link>
              <Link to={`/trainer/routines/create?clientId=${clientId}`} className="action-btn secondary">
                <span className="btn-icon">➕</span>
                Crear Nueva Rutina
              </Link>
              <button 
                onClick={handleRefreshRoutines} 
                className="action-btn refresh"
                title="Actualizar rutinas"
              >
                <span className="btn-icon">🔄</span>
                Actualizar
              </button>
            </div>
            
            <div className="routines-header">
              <h2>Rutinas del Mes - {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h2>
              <p className="routines-subtitle">Rutinas asignadas y progreso del cliente este mes</p>
            </div>
            
            {(() => {
              const currentMonth = new Date().getMonth();
              const currentYear = new Date().getFullYear();
              
              // ✅ CORRECCIÓN: Usar el estado 'routines' en lugar de 'client?.routines'
              const monthlyRoutines = routines?.filter(routine => {
                const dateToCheck = routine.assignedDate || routine.createdAt;
                if (!dateToCheck) return false;
                const routineDate = new Date(dateToCheck);
                const routineMonth = routineDate.getMonth();
                const routineYear = routineDate.getFullYear();
                const isCurrentMonth = routineMonth === currentMonth && routineYear === currentYear;
                return isCurrentMonth;
              }) || [];
              
              return monthlyRoutines.length === 0 ? (
                <div className="empty-state">
                  <p>No hay rutinas asignadas para este mes.</p>
                  <p className="empty-subtitle">Asigna una rutina para comenzar el entrenamiento del cliente.</p>
                </div>
              ) : (
                <div className="routines-grid">
                  {monthlyRoutines.map(routine => (
                    <div key={routine.id} className="routine-card monthly-routine">
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
                        <Link to={`/trainer/routines/${routine.id}`} className="routine-action-btn primary">
                          <span className="btn-icon">👁️</span>
                          Ver Rutina
                        </Link>
                        <Link to={`/trainer/routines/${routine.id}/progress`} className="routine-action-btn secondary">
                          <span className="btn-icon">📊</span>
                          Progreso
                        </Link>
                        <Link 
                          to={`/trainer/routines/${routine.id}/edit`} 
                          className="routine-action-btn edit" 
                          title="Editar rutina"
                        >
                          <span className="btn-icon">✏️</span>
                          Editar
                        </Link>
                        <button 
                          className="routine-action-btn danger" 
                          title="Remover rutina del cliente"
                          onClick={() => handleRemoveRoutine(routine.id, routine.name)}
                        >
                          <span className="btn-icon">🗑️</span>
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
            
            <div className="monthly-summary">
              <h3>Resumen del Mes</h3>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-value">{routines?.filter(r => {
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
          </div>
        )}

        {activeTab === 'nutrition' && (
          <div className="nutrition-tab">
            <div className="tab-actions">
              <Link to={`/trainer/clients/${clientId}/nutrition/assign`} className="action-btn">
                Asignar Plan
              </Link>
              <Link to={`/trainer/nutrition-plans/create?clientId=${clientId}`} className="action-btn">
                Crear Nuevo Plan
              </Link>
            </div>
            
            <h2>Plan de Nutrición</h2>
            {!client?.nutritionPlan ? (
              <div className="empty-state">
                <p>No hay plan de nutrición asignado a este cliente todavía.</p>
              </div>
            ) : (
              <div className="nutrition-plan">
                <div className="plan-header">
                  <h3>{client.nutritionPlan.name}</h3>
                  <span className="plan-type">{client.nutritionPlan.type}</span>
                </div>
                
                <div className="plan-details">
                  <div className="plan-macros">
                    <h4>Macros Diarios</h4>
                    <div className="macros-grid">
                      <div className="macro-item">
                        <span className="macro-value">{client.nutritionPlan.calories}</span>
                        <span className="macro-label">Calorías</span>
                      </div>
                      <div className="macro-item">
                        <span className="macro-value">{client.nutritionPlan.protein}g</span>
                        <span className="macro-label">Proteínas</span>
                      </div>
                      <div className="macro-item">
                        <span className="macro-value">{client.nutritionPlan.carbs}g</span>
                        <span className="macro-label">Carbohidratos</span>
                      </div>
                      <div className="macro-item">
                        <span className="macro-value">{client.nutritionPlan.fat}g</span>
                        <span className="macro-label">Grasas</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="plan-notes">
                    <h4>Notas</h4>
                    <p>{client.nutritionPlan.notes}</p>
                  </div>
                </div>
                
                <div className="plan-actions">
                  <Link to={`/trainer/nutrition-plans/${client.nutritionPlan.id}`} className="view-plan-btn">
                    Ver Plan Completo
                  </Link>
                  <button className="remove-plan-btn">Eliminar Plan</button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="payments-tab">
            <div className="payment-summary">
              <div className="payment-status">
                <h3>Estado de Pago</h3>
                <div className={`status-indicator ${client?.paymentStatus ? client.paymentStatus.toLowerCase() : ''}`}>
                  {client?.paymentStatus || 'Sin estado de pago'}
                </div>
              </div>
              
              <div className="payment-details">
                <div className="payment-item">
                  <span className="payment-label">Tipo de Membresía</span>
                  <span className="payment-value">{client?.membershipType}</span>
                </div>
                <div className="payment-item">
                  <span className="payment-label">Cuota Mensual</span>
                  <span className="payment-value">${client?.monthlyFee}</span>
                </div>
                <div className="payment-item">
                  <span className="payment-label">Próximo Pago</span>
                  <span className="payment-value">{client?.nextPaymentDate ? new Date(client.nextPaymentDate).toLocaleDateString('es-AR') : 'N/A'}</span>
                </div>
                <div className="payment-item">
                  <span className="payment-label">Método de Pago</span>
                  <span className="payment-value">{client?.paymentMethod}</span>
                </div>
              </div>
            </div>
            
            <h3>Historial de Pagos</h3>
            {!client?.paymentHistory || client.paymentHistory.length === 0 ? (
              <div className="empty-state">
                <p>No hay historial de pagos disponible.</p>
              </div>
            ) : (
              <div className="payment-history">
                <table className="payment-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Monto</th>
                      <th>Estado</th>
                      <th>Método</th>
                    </tr>
                  </thead>
                  <tbody>
                    {client.paymentHistory.map((payment, index) => (
                      <tr key={index}>
                        <td>{payment.date ? new Date(payment.date).toLocaleDateString('es-AR') : 'Sin fecha'}</td>
                        <td>${payment.amount}</td>
                        <td>
                          <span className={`payment-status ${payment.status ? payment.status.toLowerCase() : ''}`}>
                            {payment.status || 'Sin estado'}
                          </span>
                        </td>
                        <td>{payment.method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="notes-tab">
            <div className="notes-container">
              <textarea 
                className="notes-textarea" 
                value={notes} 
                onChange={handleNotesChange}
                placeholder="Añade notas sobre este cliente aquí..."
              ></textarea>
              <button className="save-notes-btn" onClick={handleSaveNotes}>
                Guardar Notas
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetails;
