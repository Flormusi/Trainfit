import React from 'react';
import { WorkoutExercise } from '../../types/workoutTypes'; // Ajusta la ruta si es necesario

interface WorkoutExerciseItemProps {
  exercise: WorkoutExercise;
  onUpdateExercise: (updatedExercise: WorkoutExercise) => void;
  onRemoveExercise: (exerciseId: string) => void;
  userRole: 'trainer' | 'student'; // Nueva prop
}

// Un componente placeholder para el icono del ejercicio
const ExerciseIconPlaceholder: React.FC<{iconUrl?: string; altText?: string}> = ({ iconUrl, altText }) => {
  if (iconUrl) {
    return <img src={iconUrl} alt={altText || 'Exercise Icon'} className="w-16 h-16 md:w-24 md:h-24 object-cover rounded mr-4 bg-gray-700" />;
  }
  return (
    <div className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center bg-gray-700 text-gray-400 rounded mr-4">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  );
};


const WorkoutExerciseItem: React.FC<WorkoutExerciseItemProps> = ({
  exercise,
  onUpdateExercise,
  onRemoveExercise,
  userRole, // Usar la prop
}) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // Para series, reps, weight, intentamos convertir a número si es posible,
    // pero permitimos string para placeholders como '#' o rangos.
    let processedValue: string | number = value;
    if (name === 'series' || name === 'reps' || name === 'weight') {
      if (value === '' || value === '#') {
        processedValue = value; // Mantener placeholders
      } else if (!isNaN(Number(value))) {
        processedValue = Number(value);
      }
    }
    onUpdateExercise({ ...exercise, [name]: processedValue });
  };

  const isStudent = userRole === 'student';

  return (
    <div className="p-4 mb-6 rounded-lg bg-gray-800 text-white shadow-md">
      <div className="flex items-start mb-4">
        <ExerciseIconPlaceholder iconUrl={exercise.iconUrl} altText={exercise.name} />
        <div className="flex-grow">
          <h4 className="text-xl font-semibold mb-3 text-white">
            {exercise.name}
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor={`exercise-series-${exercise.id}`} className="block text-sm font-medium text-gray-400">
                Series
              </label>
              <input
                type="text"
                id={`exercise-series-${exercise.id}`}
                name="series"
                value={exercise.series}
                onChange={handleInputChange}
                placeholder="#"
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                readOnly={isStudent} // Solo editable por el entrenador
              />
            </div>
            <div>
              <label htmlFor={`exercise-reps-${exercise.id}`} className="block text-sm font-medium text-gray-400">
                Repeticiones
              </label>
              <input
                type="text"
                id={`exercise-reps-${exercise.id}`}
                name="reps"
                value={exercise.reps}
                onChange={handleInputChange}
                placeholder="#"
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                readOnly={isStudent} // Solo editable por el entrenador
              />
            </div>
            <div>
              <label htmlFor={`exercise-weight-${exercise.id}`} className="block text-sm font-medium text-gray-400">
                Peso (kg)
              </label>
              <input
                type="text"
                id={`exercise-weight-${exercise.id}`}
                name="weight"
                value={exercise.weight || ''}
                onChange={handleInputChange}
                placeholder="#"
                className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                // El peso es editable por ambos, o solo por el alumno si así se define la lógica de negocio
                // Para este caso, lo dejamos editable para ambos, pero el entrenador lo setea y el alumno lo ajusta.
              />
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor={`exercise-notes-${exercise.id}`} className="block text-sm font-medium text-gray-400">
          Notas
        </label>
        <textarea
          id={`exercise-notes-${exercise.id}`}
          name="notes"
          value={exercise.notes || ''}
          onChange={handleInputChange}
          rows={3}
          className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
          placeholder="Añade notas o instrucciones adicionales aquí..."
          readOnly={isStudent} // Solo editable por el entrenador
        />
      </div>

      {!isStudent && ( // El botón de eliminar solo es para el entrenador
        <button
          onClick={() => onRemoveExercise(exercise.id)}
          className="mt-4 px-3 py-1.5 text-sm font-medium text-red-400 border border-red-500 rounded-md hover:bg-red-700 hover:text-white"
        >
          Eliminar Ejercicio
        </button>
      )}
    </div>
  );
};

export default WorkoutExerciseItem;