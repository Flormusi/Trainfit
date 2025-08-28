import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutPlanService } from '../../services/workoutPlanService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { AxiosError } from 'axios';
import { trainerApi } from '../../services/api';

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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center py-4 text-red-500 bg-red-100 px-6 rounded-lg shadow">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchRoutines}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            ← Volver
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Todas las Rutinas</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCreateRoutine}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            + Nueva Rutina
          </button>
          <button
            onClick={fetchRoutines}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>

      {routines.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-600">No hay rutinas creadas</p>
          <p className="text-gray-500 mt-2">Comienza creando una nueva rutina</p>
          <button
            onClick={handleCreateRoutine}
            className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Crear Primera Rutina
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routines.map((routine) => (
            <div key={routine.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{routine.name}</h3>
              {routine.description && (
                <p className="text-gray-600 mb-4 line-clamp-3">{routine.description}</p>
              )}
              <div className="flex flex-wrap gap-2 mb-4">
                {routine.client && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Cliente: {routine.client.name}
                  </span>
                )}
                {routine.duration && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Duración: {routine.duration}
                  </span>
                )}
              </div>
              {routine.exercises && routine.exercises.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="font-medium text-gray-700">Ejercicios: {routine.exercises.length}</h4>
                  <div className="text-sm text-gray-500">
                    {routine.exercises.slice(0, 3).map((exercise: any, index: number) => (
                      <div key={index}>• {exercise.name}</div>
                    ))}
                    {routine.exercises.length > 3 && (
                      <div className="text-gray-400">... y {routine.exercises.length - 3} más</div>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-4 flex gap-2 flex-wrap">
                <button 
                  onClick={() => handleViewDetails(routine.id)}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  👁️ Ver Detalles
                </button>
                <button 
                  onClick={() => handleEditRoutine(routine.id)}
                  className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                >
                  ✏️ Editar
                </button>
                <button 
                  onClick={() => handleDeleteRoutine(routine.id, routine.name)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllRoutines;