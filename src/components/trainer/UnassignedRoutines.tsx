import React, { useState, useEffect } from 'react';
import { workoutPlanService } from '../../services/workoutPlanService';
import { toast } from 'react-hot-toast';
import axios from '../../services/axiosConfig';
import { useNavigate } from 'react-router-dom';

interface Exercise {
  id: number;
  name: string;
  sets: number;
  reps: number;
  rest: number;
}

interface WorkoutPlan {
  id: number;
  name: string;
  description: string;
  exercises: Exercise[];
  type: string;
  difficulty: string;
}

const UnassignedRoutines = () => {
  const [unassignedPlans, setUnassignedPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUnassignedPlans();
  }, []);

  const fetchUnassignedPlans = async () => {
    try {
      setLoading(true);
      const plans = await workoutPlanService.getUnassignedWorkoutPlans();
      setUnassignedPlans(plans);
    } catch (err) {
      setError('Error al cargar las rutinas sin asignar');
      toast.error('Error al cargar las rutinas sin asignar');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClick = (planId: number) => {
    navigate(`/trainer/assign-routine/${planId}`);
  };

  const handleEditClick = (planId: number) => {
    navigate(`/trainer/routines/${planId}/edit`);
  };

  const handleDeleteClick = async (planId: number, planName: string) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la rutina "${planName}"?\n\nEsta acción no se puede deshacer.`
    );
    
    if (!confirmDelete) return;

    try {
      await axios.delete(`/trainer/routines/${planId}`);
      toast.success(`✅ Rutina "${planName}" eliminada exitosamente.`);
      // Actualizar la lista de rutinas
      fetchUnassignedPlans();
    } catch (error) {
      console.error('Error al eliminar la rutina:', error);
      toast.error('❌ Error al eliminar la rutina. Por favor, inténtalo de nuevo.');
    }
  };

  if (loading) {
    return <div className="text-center py-4">Cargando rutinas...</div>;
  }

  if (error) {
    return <div className="text-center py-4" style={{ color: '#ff3b30' }}>{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Rutinas sin Asignar</h1>
      {unassignedPlans.length === 0 ? (
        <p className="text-center py-4">No hay rutinas sin asignar</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {unassignedPlans.map((plan) => (
            <div key={plan.id} className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
              <p className="text-gray-300 mb-4">{plan.description}</p>
              <div className="flex gap-2 text-sm text-gray-400 mb-2">
                <p>Tipo: {plan.type}</p>
                <p>Dificultad: {plan.difficulty}</p>
              </div>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Ejercicios:</h3>
                <ul className="list-disc list-inside">
                  {plan.exercises.map((exercise) => (
                    <li key={exercise.id} className="text-sm">
                      {exercise.name} - {exercise.sets}x{exercise.reps}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleAssignClick(plan.id)}
                  className="flex-1 text-white py-2 px-4 rounded transition-colors"
                  style={{ backgroundColor: '#D62828' }}
                >
                  Asignar Rutina
                </button>
                <button
                  onClick={() => handleEditClick(plan.id)}
                  className="bg-blue-500 text-white py-2 px-3 rounded hover:bg-blue-600 transition-colors"
                  title="Editar rutina"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteClick(plan.id, plan.name)}
                  className="text-white py-2 px-3 rounded transition-colors"
                  style={{ backgroundColor: '#D62828' }}
                  title="Eliminar rutina"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnassignedRoutines;