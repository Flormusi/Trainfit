import React, { useState, useEffect } from 'react';
import { workoutPlanService } from '../../services/workoutPlanService';
import { toast, Toaster } from 'react-hot-toast';

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
  targetGroup: string;
}

const ClientPlan = () => {
  const [assignedPlans, setAssignedPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignedPlans();
  }, []);

  const fetchAssignedPlans = async () => {
    try {
      setLoading(true);
      const plans = await workoutPlanService.getAssignedPlans();
      setAssignedPlans(plans);
    } catch (err) {
      setError('Failed to load your workout plans');
      toast.error('Failed to load workout plans');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      
      <h2 className="text-2xl font-bold mb-6">My Workout Plans</h2>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="text-red-600 p-4 text-center">{error}</div>
      ) : assignedPlans.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No workout plans assigned yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignedPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-3">{plan.name}</h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <p className="text-sm text-gray-500 mb-4">Target Group: {plan.targetGroup}</p>
              
              <div className="space-y-4">
                <h4 className="font-medium text-lg">Exercises</h4>
                {plan.exercises.map((exercise) => (
                  <div key={exercise.id} className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-indigo-600">{exercise.name}</h5>
                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Sets:</span> {exercise.sets}
                      </div>
                      <div>
                        <span className="font-medium">Reps:</span> {exercise.reps}
                      </div>
                      <div>
                        <span className="font-medium">Rest:</span> {exercise.rest}s
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientPlan;