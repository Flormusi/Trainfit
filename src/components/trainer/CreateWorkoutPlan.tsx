import React, { useState, useEffect } from 'react';
import * as AllExercises from '../../data/exercisesIndex';

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
  sets: number;
  reps: number;
  rest: number;
}

interface ExerciseOption {
  name: string;
  category: string;
  imageUrl?: string;
}

interface CreateWorkoutPlanProps {
  onClose: () => void;
  onSave: (plan: any) => void;
}

const CreateWorkoutPlan: React.FC<CreateWorkoutPlanProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetGroup, setTargetGroup] = useState('beginners');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableExercises, setAvailableExercises] = useState<ExerciseOption[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<ExerciseOption[]>([]);

  useEffect(() => {
    // Recopila todos los ejercicios de todas las categorías
    const exercises: ExerciseOption[] = [];
    Object.entries(AllExercises).forEach(([key, value]) => {
      if (Array.isArray(value) && key.endsWith('Exercises')) {
        const category = key.replace('Exercises', '');
        value.forEach(exercise => {
          exercises.push({
            name: exercise.name,
            category: category,
            imageUrl: (exercise as any).imageUrl
          });
        });
      }
    });
    setAvailableExercises(exercises);
  }, []);

  useEffect(() => {
    const filtered = availableExercises.filter(exercise =>
      (exercise.name ? exercise.name.toLowerCase() : '').includes(searchTerm.toLowerCase())
    );
    setFilteredExercises(filtered);
  }, [searchTerm, availableExercises]);

  const handleAddExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      description: '',
      type: '',
      difficulty: 'intermediate',
      equipment: '',
      muscles: [],
      trainerId: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sets: 3,
      reps: 10,
      rest: 60
    };
    setExercises([...exercises, newExercise]);
  };

  const handleExerciseChange = (id: string, field: keyof Exercise, value: string | number) => {
    setExercises(exercises.map(exercise => 
      exercise.id === id ? { ...exercise, [field]: value } : exercise
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      targetGroup,
      exercises
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Create New Workout Plan</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <div className="mb-4 relative">
              <div className="flex items-center border rounded-md shadow-sm focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-white">
                <input
                  type="text"
                  placeholder="Buscar ejercicio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border-none focus:ring-0 text-gray-900"
                />
                <span className="px-3 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
              {searchTerm && (
                <div className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto bg-white border rounded-md shadow-lg">
                  {filteredExercises.map((exercise, index) => (
                    <div
                      key={index}
                      className="p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ease-in-out border-b last:border-b-0"
                      onClick={() => {
                        const newExercise: Exercise = {
                          id: Date.now().toString(),
                          name: exercise.name,
                          description: '',
                          type: exercise.category,
                          difficulty: 'intermediate',
                          equipment: '',
                          muscles: [],
                          trainerId: '',
                          createdAt: new Date().toISOString(),
                          updatedAt: new Date().toISOString(),
                          sets: 3,
                          reps: 10,
                          rest: 60
                        };
                        setExercises([...exercises, newExercise]);
                        setSearchTerm('');
                      }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {exercise.imageUrl ? (
                            <img 
                              src={exercise.imageUrl} 
                              alt={exercise.name} 
                              className="w-16 h-16 object-cover rounded-lg shadow-sm"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/150?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{exercise.name}</p>
                          <p className="text-sm text-gray-500">{exercise.category}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Create Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkoutPlan;