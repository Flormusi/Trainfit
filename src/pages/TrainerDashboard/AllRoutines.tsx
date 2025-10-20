import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutPlanService } from '../../services/workoutPlanService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { AxiosError } from 'axios';
import { trainerApi } from '../../services/api';
import { 
  PlusIcon, 
  ArrowLeftIcon, 
  ArrowPathIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClipboardDocumentListIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import './AllRoutines.css';

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  type: string | null;
  difficulty: string | null;
  equipment: string | null;
  muscles: string[];
  trainerId: string;
  createdAt: string;
  updatedAt: string;
}

const AllRoutines = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'TRAINER') {
      setError('No tienes autorización para ver esta página');
      toast.error('No tienes autorización para ver esta página');
      return;
    }
    fetchRoutines();
  }, [isAuthenticated, user]);

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await trainerApi.getRoutines();
      console.log('[AllRoutines] Rutinas recibidas:', response.data);
      
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Formato de datos inválido recibido del servidor');
      }

      setRoutines(response.data);
      toast.success('Rutinas cargadas exitosamente');
    } catch (err: unknown) {
      console.error('[AllRoutines] Error al cargar las rutinas:', err);
      const error = err as AxiosError;
      
      if (error.response?.status === 401) {
        const errorMsg = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
        setError(errorMsg);
        toast.error(errorMsg);
      } else {
        const errorMsg = 'Error al cargar las rutinas. Por favor, intente nuevamente.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (routineId: string) => {
    navigate(`/trainer/routines/${routineId}`);
  };

  const handleEditRoutine = (routineId: string) => {
    navigate(`/trainer/routines/${routineId}/edit`);
  };

  const handleDeleteRoutine = async (routineId: string, routineName: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la rutina "${routineName}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/trainer/routines/${routineId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success(`✅ Rutina "${routineName}" eliminada exitosamente.`);
        // Actualizar la lista de rutinas
        setRoutines(routines.filter(routine => routine.id !== routineId));
      } else {
        throw new Error('Error al eliminar la rutina');
      }
    } catch (error) {
      console.error('Error al eliminar la rutina:', error);
      toast.error('❌ Error al eliminar la rutina. Por favor, inténtalo de nuevo.');
    }
  };

  const handleCreateRoutine = () => {
    navigate('/trainer/create-routine');
  };

  if (loading) {
    return (
      <div className="all-routines-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando rutinas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="all-routines-page">
        <div className="error-container">
          <div className="error-card">
            <p className="error-message">{error}</p>
            <button
              onClick={fetchRoutines}
              className="retry-btn"
            >
              <ArrowPathIcon className="btn-icon" />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="all-routines-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-left">
          <button
            onClick={() => navigate(-1)}
            className="back-btn"
          >
            <ArrowLeftIcon className="btn-icon" />
            Volver al dashboard
          </button>
          <div className="page-title-section">
            <h1 className="page-title">
              <ClipboardDocumentListIcon className="title-icon" />
              Todas las Rutinas
            </h1>
            <p className="page-subtitle">Gestiona y organiza todas tus rutinas de entrenamiento</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            onClick={fetchRoutines}
            className="secondary-btn"
          >
            <ArrowPathIcon className="btn-icon" />
            Actualizar
          </button>
          <button
            onClick={handleCreateRoutine}
            className="primary-btn"
          >
            <PlusIcon className="btn-icon" />
            Nueva Rutina
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="routines-content">
        {routines.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ClipboardDocumentListIcon />
            </div>
            <h3 className="empty-state-title">No hay rutinas creadas</h3>
            <p className="empty-state-description">
              Comienza creando tu primera rutina de entrenamiento personalizada
            </p>
            <button
              onClick={handleCreateRoutine}
              className="primary-btn large"
            >
              <PlusIcon className="btn-icon" />
              Crear Primera Rutina
            </button>
          </div>
        ) : (
          <div className="routines-grid">
            {routines.map((routine) => (
              <div key={routine.id} className="routine-card">
                <div className="routine-card-header">
                  <h3 className="routine-title">{routine.name}</h3>
                  {routine.description && (
                    <p className="routine-description">{routine.description}</p>
                  )}
                </div>

                <div className="routine-info">
                  {routine.client && (
                    <div className="info-item">
                      <UserIcon className="info-icon" />
                      <span className="info-label">Cliente:</span>
                      <span className="info-value">{routine.client.name}</span>
                    </div>
                  )}
                  {routine.duration && (
                    <div className="info-item">
                      <ClockIcon className="info-icon" />
                      <span className="info-label">Duración:</span>
                      <span className="info-value">{routine.duration}</span>
                    </div>
                  )}
                </div>

                {routine.exercises && routine.exercises.length > 0 && (
                  <div className="exercises-preview">
                    <h4 className="exercises-title">
                      Ejercicios ({routine.exercises.length})
                    </h4>
                    <div className="exercises-list">
                      {routine.exercises.slice(0, 3).map((exercise: any, index: number) => (
                        <div key={index} className="exercise-item">
                          • {exercise.name}
                        </div>
                      ))}
                      {routine.exercises.length > 3 && (
                        <div className="exercise-item more">
                          ... y {routine.exercises.length - 3} más
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="routine-actions">
                  <button 
                    onClick={() => handleViewDetails(routine.id)}
                    className="action-btn view"
                    title="Ver detalles"
                  >
                    <EyeIcon className="btn-icon" />
                    Ver
                  </button>
                  <button 
                    onClick={() => handleEditRoutine(routine.id)}
                    className="action-btn edit"
                    title="Editar rutina"
                  >
                    <PencilIcon className="btn-icon" />
                    Editar
                  </button>
                  <button 
                    onClick={() => handleDeleteRoutine(routine.id, routine.name)}
                    className="action-btn delete"
                    title="Eliminar rutina"
                  >
                    <TrashIcon className="btn-icon" />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllRoutines;