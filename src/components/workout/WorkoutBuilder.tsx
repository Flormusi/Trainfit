import React, { useState, useMemo, useEffect } from 'react'; // Añadido useEffect
import { WorkoutPlan, Week, WorkoutExercise, Exercise } from '../../types/workoutTypes';
import ExercisePicker from './ExercisePicker';
import WorkoutExerciseItem from './WorkoutExerciseItem';
import { v4 as uuidv4 } from 'uuid';

const MAX_WEEKS = 4;

const createInitialWeeks = (numWeeks: number): Week[] => {
  return Array.from({ length: numWeeks }, (_, i) => ({
    id: uuidv4(),
    name: `Semana ${i + 1}`,
    exercises: [],
  }));
};

interface WorkoutBuilderProps {
  userRole: 'trainer' | 'student';
  initialPlanData?: WorkoutPlan; // Plan inicial, especialmente para el alumno
  onSavePlan?: (plan: WorkoutPlan) => void; // Callback para guardar (usado por el entrenador)
  // Podríamos tener un onStudentUpdatePlan para guardar solo los pesos del alumno
}

const WorkoutBuilder: React.FC<WorkoutBuilderProps> = ({ 
  userRole, 
  initialPlanData,
  onSavePlan 
}) => {
  const [planName, setPlanName] = useState<string>('Nueva Rutina');
  const [weeks, setWeeks] = useState<Week[]>(createInitialWeeks(MAX_WEEKS));
  const [selectedWeekIndex, setSelectedWeekIndex] = useState<number>(0);
  const [showExercisePicker, setShowExercisePicker] = useState<boolean>(false);

  const isStudent = userRole === 'student';

  useEffect(() => {
    if (initialPlanData) {
      setPlanName(initialPlanData.name);
      // Asegurarse de que las semanas del plan inicial no excedan MAX_WEEKS
      // o ajustar MAX_WEEKS dinámicamente si es necesario.
      // Por simplicidad, si initialPlanData.weeks tiene menos semanas, se usarán esas.
      // Si tiene más, se truncarán o se podría ajustar MAX_WEEKS.
      // Aquí asumimos que initialPlanData.weeks.length <= MAX_WEEKS o que se maneja adecuadamente.
      const initialWeeks = initialPlanData.weeks.length > 0 
        ? initialPlanData.weeks 
        : createInitialWeeks(MAX_WEEKS);
      
      // Si el plan inicial tiene menos semanas que MAX_WEEKS, completamos hasta MAX_WEEKS con semanas vacías
      // para mantener la UI consistente con las pestañas.
      if (initialWeeks.length < MAX_WEEKS && userRole === 'trainer') { // Solo el trainer crea semanas vacías
         const diff = MAX_WEEKS - initialWeeks.length;
         for (let i = 0; i < diff; i++) {
            initialWeeks.push({id: uuidv4(), name: `Semana ${initialWeeks.length + 1}`, exercises: []});
         }
      }
      setWeeks(initialWeeks.slice(0, MAX_WEEKS)); // Asegurar que no exceda MAX_WEEKS
      setSelectedWeekIndex(0); // Empezar en la primera semana
    }
  }, [initialPlanData, userRole]);


  const selectedWeek = useMemo(() => weeks[selectedWeekIndex], [weeks, selectedWeekIndex]);

  const handleAddExercise = (exerciseBase: Exercise | string) => {
    if (!selectedWeek) return;

    const exerciseName = typeof exerciseBase === 'string' ? exerciseBase : exerciseBase.name;
    const exerciseId = typeof exerciseBase === 'string' ? uuidv4() : exerciseBase.id; // Usa ID si es objeto Exercise

    const newExercise: WorkoutExercise = {
      id: exerciseId, // Usar el ID del ejercicio seleccionado si es posible
      name: exerciseName,
      series: '#', // Placeholder inicial
      reps: '#',
      weight: '#',
      notes: '',
      // iconUrl: typeof exerciseBase === 'object' ? (exerciseBase as any).iconUrl : undefined, // Si tuvieras iconos
    };

    const updatedWeeks = weeks.map((week, index) => {
      if (index === selectedWeekIndex) {
        return { ...week, exercises: [...week.exercises, newExercise] };
      }
      return week;
    });
    setWeeks(updatedWeeks);
    setShowExercisePicker(false); // Cerrar el picker después de seleccionar
  };

  const handleUpdateExercise = (updatedExercise: WorkoutExercise) => {
    if (!selectedWeek) return;
    const updatedWeeks = weeks.map((week, index) => {
      if (index === selectedWeekIndex) {
        return {
          ...week,
          exercises: week.exercises.map(ex =>
            ex.id === updatedExercise.id ? updatedExercise : ex
          ),
        };
      }
      return week;
    });
    setWeeks(updatedWeeks);
  };

  const handleRemoveExercise = (exerciseIdToRemove: string) => {
    if (!selectedWeek) return;
    const updatedWeeks = weeks.map((week, index) => {
      if (index === selectedWeekIndex) {
        return {
          ...week,
          exercises: week.exercises.filter(ex => ex.id !== exerciseIdToRemove),
        };
      }
      return week;
    });
    setWeeks(updatedWeeks);
  };
  
  const handleSaveWorkout = () => {
    if (isStudent) {
      // Para el alumno, "guardar" podría significar actualizar los pesos en el estado local
      // o enviar solo los pesos actualizados a un backend si esa funcionalidad existe.
      // Por ahora, la edición de pesos ya actualiza el estado 'weeks'.
      // El botón principal de guardar es más para el entrenador.
      console.log('Pesos actualizados por el alumno (en estado local):', weeks);
      alert('Tus cambios de peso han sido actualizados localmente.');
      return;
    }

    // Lógica del entrenador
    if (onSavePlan) {
      const workoutPlanToSave: WorkoutPlan = {
        id: initialPlanData?.id || uuidv4(), // Usar ID existente si se edita
        name: planName,
        weeks: weeks.filter(week => week.exercises.length > 0 || userRole === 'trainer'), // Guardar solo semanas con ejercicios para alumnos, o todas para trainer
      };
      onSavePlan(workoutPlanToSave);
      console.log('Guardando rutina (entrenador):', workoutPlanToSave);
      // alert('Rutina guardada!'); // El feedback lo daría el componente padre
    } else {
      console.warn("onSavePlan callback no fue proporcionado.");
    }
  };

  const handleDownloadPlan = () => {
    const planToDownload: WorkoutPlan = {
      id: initialPlanData?.id || uuidv4(),
      name: planName,
      weeks: weeks,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(planToDownload, null, 2) // JSON formateado para legibilidad
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    // Crear un nombre de archivo más amigable
    const fileName = `${planName.toLowerCase().replace(/\s+/g, '_') || 'rutina'}_semanas_${weeks.length}.json`;
    link.download = fileName;
    document.body.appendChild(link); // Necesario para Firefox
    link.click();
    document.body.removeChild(link); // Limpiar
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {isStudent ? planName : 'Constructor de Rutinas'}
        </h1>
        
        {!isStudent && ( // El entrenador puede editar el nombre del plan
          <div className="mb-6">
            <label htmlFor="planName" className="block text-sm font-medium text-gray-400 mb-1">Nombre de la Rutina</label>
            <input
              type="text"
              id="planName"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg p-3"
              placeholder="Ej: Rutina de Fuerza General"
              readOnly={isStudent}
            />
          </div>
        )}

        <div className="mb-6">
          <div className="flex border-b border-gray-700">
            {weeks.map((week, index) => (
              <button
                key={week.id}
                onClick={() => setSelectedWeekIndex(index)}
                className={`py-3 px-4 -mb-px font-medium text-sm focus:outline-none
                  ${selectedWeekIndex === index
                    ? 'border-b-2 border-indigo-500 text-indigo-400'
                    : 'text-gray-400 hover:text-gray-200 hover:border-gray-500'
                  }`}
              >
                {week.name}
              </button>
            ))}
          </div>
        </div>

        {selectedWeek && (
          <div>
            {selectedWeek.exercises.map((exercise) => (
              <WorkoutExerciseItem
                key={exercise.id}
                exercise={exercise}
                onUpdateExercise={handleUpdateExercise}
                onRemoveExercise={handleRemoveExercise} // Esta función no hará nada si el botón está oculto para el alumno
                userRole={userRole}
              />
            ))}
            
            {!isStudent && ( // Botón "AGREGAR EJERCICIO" solo para el entrenador
              <button
                onClick={() => setShowExercisePicker(true)}
                className="w-full mt-4 px-6 py-3 bg-red-600 text-white font-semibold rounded-md shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                AGREGAR EJERCICIO
              </button>
            )}

            {showExercisePicker && !isStudent && ( // ExercisePicker solo para el entrenador
              <div className="mt-6 p-4 border border-gray-700 rounded-lg bg-gray-800">
                <ExercisePicker onSelectExercise={handleAddExercise} />
                <button 
                  onClick={() => setShowExercisePicker(false)}
                  className="mt-4 text-sm text-gray-400 hover:text-gray-200"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-10 pt-6 border-t border-gray-700 space-y-4">
          {!isStudent && onSavePlan && ( // Botón de guardar rutina completa solo para el entrenador
            <button
              onClick={handleSaveWorkout}
              className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              Guardar Rutina Completa
            </button>
          )}
          {/* El alumno siempre puede descargar */}
          <button
            onClick={handleDownloadPlan}
            className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Descargar Rutina
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutBuilder;