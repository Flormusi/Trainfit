import React, { useState } from 'react';
import { workoutPlanService } from '../../services/workoutPlanService';

interface EditWorkoutPlanProps {
  plan: {
    id: number;
    name: string;
    description: string;
    exercises: Array<{
      id: number;
      name: string;
      sets: number;
      reps: number;
      rest: number;
    }>;
    targetGroup: string;
  };
  onClose: () => void;
  onSave: () => void;
}

const EditWorkoutPlan: React.FC<EditWorkoutPlanProps> = ({ plan, onClose, onSave }) => {
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description);
  const [targetGroup, setTargetGroup] = useState(plan.targetGroup);
  const [exercises, setExercises] = useState(plan.exercises);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddExercise = () => {
    setExercises([...exercises, {
      id: Date.now(),
      name: '',
      sets: 3,
      reps: 10,
      rest: 60
    }]);
  };

  const handleExerciseChange = (id: number, field: string, value: string | number) => {
    setExercises(exercises.map(exercise =>
      exercise.id === id ? { ...exercise, [field]: value } : exercise
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await workoutPlanService.updateWorkoutPlan(plan.id, {
        name,
        description,
        targetGroup,
        exercises
      });
      onSave();
      onClose();
    } catch (err) {
      setError('Failed to update workout plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Edit Workout Plan</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-600">{error}</p>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Plan Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Target Group</label>
            <select
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="beginners">Beginners</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">Exercises</label>
            {exercises.map((exercise) => (
              <div key={exercise.id} className="grid grid-cols-4 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Exercise name"
                  value={exercise.name}
                  onChange={(e) => handleExerciseChange(exercise.id, 'name', e.target.value)}
                  className="col-span-2 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Sets"
                  value={exercise.sets}
                  onChange={(e) => handleExerciseChange(exercise.id, 'sets', parseInt(e.target.value))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <input
                  type="number"
                  placeholder="Reps"
                  value={exercise.reps}
                  onChange={(e) => handleExerciseChange(exercise.id, 'reps', parseInt(e.target.value))}
                  className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddExercise}
              className="mt-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Add Exercise
            </button>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWorkoutPlan;