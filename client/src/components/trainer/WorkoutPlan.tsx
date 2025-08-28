import React, { useState, useEffect } from 'react';
import CreateWorkoutPlan from './CreateWorkoutPlan';
import AssignWorkoutModal from './AssignWorkoutModal';
import { workoutPlanService } from '../../services/workoutPlanService';
import { clientService } from '../../services/clientService';
import EditWorkoutPlan from './EditWorkoutPlan';
import { toast, Toaster } from 'react-hot-toast';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

interface Exercise {
  id: string;
  name: string;
  description: string;
  type: string;
  difficulty: string;
  equipment: string;
  muscles: string[];
  trainerId: string;
  createdAt: string;
  updatedAt: string;
  sets?: number;
  reps?: number;
  rest?: number;
}

interface WorkoutPlan {
  id: number;
  name: string;
  description: string;
  exercises: Exercise[];
  targetGroup: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
}

const WorkoutPlan = () => {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState('');
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState<WorkoutPlan | null>(null);

  useEffect(() => {
    fetchWorkoutPlans();
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setClientsLoading(true);
      const fetchedClients = await clientService.getClients();
      setClients(fetchedClients);
    } catch (err) {
      setClientsError('Failed to load clients');
    } finally {
      setClientsLoading(false);
    }
  };

  const fetchWorkoutPlans = async () => {
    try {
      setLoading(true);
      const plans = await workoutPlanService.getAllWorkoutPlans();
      setWorkoutPlans(plans);
    } catch (err) {
      setError('Failed to load workout plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveWorkoutPlan = async (newPlan: Omit<WorkoutPlan, 'id'>) => {
    try {
      const createdPlan = await workoutPlanService.createWorkoutPlan(newPlan);
      setWorkoutPlans([...workoutPlans, createdPlan]);
      setShowCreateForm(false);
      toast.success('Workout plan created successfully');
    } catch (err) {
      toast.error('Failed to create workout plan');
    }
  };

  const handleDeletePlan = async (id: number) => {
    try {
      await workoutPlanService.deleteWorkoutPlan(id);
      setWorkoutPlans(workoutPlans.filter(plan => plan.id !== id));
      toast.success('Workout plan deleted successfully');
    } catch (err) {
      toast.error('Failed to delete workout plan');
    }
  };

  const handleEditClick = (plan: WorkoutPlan) => {
    setSelectedPlanForEdit(plan);
  };

  const handleAssignClick = (planId: number) => {
    setSelectedPlanId(planId);
  };

  const handleAssignSuccess = () => {
    fetchWorkoutPlans();
    toast.success('Client assigned successfully');
  };

  const handleEditSuccess = () => {
    fetchWorkoutPlans();
    toast.success('Workout plan updated successfully');
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <Toaster position="top-right" />
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 p-4 text-center">{error}</div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-lg font-medium">Available Plans</h4>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-lg hover:bg-red-700 transition duration-150 ease-in-out flex items-center gap-2"
            >
              <PlusCircleIcon className="h-5 w-5" />
              Crear Nueva Rutina
            </button>
          </div>

          {showCreateForm && (
            <CreateWorkoutPlan
              onClose={() => setShowCreateForm(false)}
              onSave={handleSaveWorkoutPlan}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workoutPlans.map((plan) => (
              <div key={plan.id} className="border rounded-lg p-4">
                <h5 className="font-medium text-lg mb-2">{plan.name}</h5>
                <p className="text-gray-600 mb-2">{plan.description}</p>
                <p className="text-sm text-gray-500 mb-4">Target: {plan.targetGroup}</p>
                
                <div className="space-y-2">
                  <h6 className="font-medium">Exercises:</h6>
                  {plan.exercises.map((exercise) => (
                    <div key={exercise.id} className="bg-gray-50 p-2 rounded">
                      <p className="font-medium">{exercise.name}</p>
                      <p className="text-sm text-gray-600">
                        {exercise.sets} sets × {exercise.reps} reps
                        <span className="ml-2">({exercise.rest}s rest)</span>
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={() => handleEditClick(plan)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeletePlan(plan.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                  <button 
                    onClick={() => handleAssignClick(plan.id)}
                    className="text-green-600 hover:text-green-900"
                  >
                    Assign
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedPlanForEdit && (
            <EditWorkoutPlan
              plan={selectedPlanForEdit}
              onClose={() => setSelectedPlanForEdit(null)}
              onSave={handleEditSuccess}
            />
          )}

          {selectedPlanId && (
            <AssignWorkoutModal
              planId={selectedPlanId}
              clients={clients}
              onClose={() => setSelectedPlanId(null)}
              onAssign={handleAssignSuccess}
              loading={clientsLoading}
              error={clientsError}
            />
          )}
        </>
      )}
    </div>
  );
};

export default WorkoutPlan;