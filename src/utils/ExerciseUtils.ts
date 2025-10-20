import * as allExercises from '../data/exercisesIndex';
import { ExerciseCategory } from '../types/exerciseTypes'; // Ajusta la ruta si es necesario

export const getAllExerciseArrays = () => {
  return [
    allExercises.bicepsExercises,
    allExercises.cardioExercises,
    allExercises.circuitoExercises,
    allExercises.coreExercises,
    allExercises.dorsalesExercises,
    allExercises.espinalesExercises,
    allExercises.gemelosExercises,
    allExercises.gluteoExercises,
    allExercises.hombrosExercises,
    allExercises.isquiosExercises,
    allExercises.movilidadExercises,
    allExercises.pectoralesExercises,
    allExercises.piernasExercises,
    allExercises.potenciaExercises,
    allExercises.tricepsExercises,
  ];
};

export const getAllExercisesList = (): string[] => {
  return getAllExerciseArrays().flat();
};

export const getExercisesByCategory = (category: ExerciseCategory): string[] => {
  switch (category) {
    case ExerciseCategory.BICEPS: return allExercises.bicepsExercises;
    case ExerciseCategory.CARDIO: return allExercises.cardioExercises;
    case ExerciseCategory.CIRCUITO: return allExercises.circuitoExercises;
    case ExerciseCategory.CORE: return allExercises.coreExercises;
    case ExerciseCategory.DORSALES: return allExercises.dorsalesExercises;
    case ExerciseCategory.ESPINALES: return allExercises.espinalesExercises;
    case ExerciseCategory.GEMELOS: return allExercises.gemelosExercises;
    case ExerciseCategory.GLUTEOS: return allExercises.gluteoExercises;
    case ExerciseCategory.HOMBROS: return allExercises.hombrosExercises;
    case ExerciseCategory.ISQUIOS: return allExercises.isquiosExercises;
    case ExerciseCategory.MOVILIDAD: return allExercises.movilidadExercises;
    case ExerciseCategory.PECTORALES: return allExercises.pectoralesExercises;
    case ExerciseCategory.PIERNAS: return allExercises.piernasExercises;
    case ExerciseCategory.POTENCIA: return allExercises.potenciaExercises;
    case ExerciseCategory.TRICEPS: return allExercises.tricepsExercises;
    default:
      console.warn(`Categoría de ejercicio desconocida: ${category}`);
      return [];
  }
};

export const getExerciseCategories = (): ExerciseCategory[] => {
  return Object.values(ExerciseCategory);
};