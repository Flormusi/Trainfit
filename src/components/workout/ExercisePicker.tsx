import React, { useState, useMemo } from 'react';
import { getExercisesByCategory, getExerciseCategories } from '../../utils/ExerciseUtils'; // Ajusta la ruta
import { ExerciseCategory } from '../../types/exerciseTypes'; // Ajusta la ruta

interface ExercisePickerProps {
  onSelectExercise: (exerciseName: string) => void;
}

const ExercisePicker: React.FC<ExercisePickerProps> = ({ onSelectExercise }) => {
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | ''>('');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = useMemo(() => getExerciseCategories(), []);
  
  const exercisesForCategory = useMemo(() => {
    if (!selectedCategory) return [];
    return getExercisesByCategory(selectedCategory);
  }, [selectedCategory]);

  const filteredExercises = useMemo(() => {
    if (!selectedCategory) return []; // O mostrar todos si no hay categoría seleccionada
    return exercisesForCategory.filter(exercise =>
      (exercise ? exercise.toLowerCase() : '').includes(searchTerm.toLowerCase())
    );
  }, [exercisesForCategory, searchTerm, selectedCategory]);

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-xl font-semibold mb-3">Seleccionar Ejercicio</h3>
      <div className="mb-4">
        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">
          Categoría
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as ExerciseCategory | '')}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Todas las categorías</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {selectedCategory && (
        <div className="mb-4">
          <label htmlFor="exercise-search" className="block text-sm font-medium text-gray-700 mb-1">
            Buscar en "{selectedCategory}"
          </label>
          <input
            type="text"
            id="exercise-search"
            placeholder="Buscar ejercicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      )}

      {selectedCategory && (
        <div className="max-h-60 overflow-y-auto border rounded-md">
          {filteredExercises.length > 0 ? (
            filteredExercises.map(exerciseName => (
              <button
                key={exerciseName}
                onClick={() => onSelectExercise(exerciseName)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-200"
              >
                {exerciseName}
              </button>
            ))
          ) : (
            <p className="px-4 py-2 text-sm text-gray-500">No hay ejercicios en esta categoría o que coincidan con la búsqueda.</p>
          )}
        </div>
      )}
       {!selectedCategory && (
         <p className="text-sm text-gray-500">Por favor, selecciona una categoría para ver los ejercicios.</p>
       )}
    </div>
  );
};

export default ExercisePicker;