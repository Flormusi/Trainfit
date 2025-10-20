export type { ExerciseData } from './bicepsExercises'; // O desde donde prefieras exportarla si la mueves a un archivo de tipos general
export { bicepsExercises } from './bicepsExercises';
export { cardioExercises } from './cardioExercises';
export { circuitoExercises } from './circuitoExercises';
export { coreExercises } from './coreExercises';
export { dorsalesExercises } from './dorsalesExercises';
export { espinalesExercises } from './espinalesExercises';
export { gemelosExercises } from './gemelosExercises';
export { gluteoExercises } from './gluteoExercises';
export { hombrosExercises } from './hombrosExercises';
export { isquiosExercises } from './isquiosExercises';
export * from './movilidadExercises'; // Asegúrate de que este archivo exporte movilidadExercises y ExerciseData si es necesario
export { pectoralesExercises } from './pectoralesExercises';
export { piernasExercises } from './piernasExercises';
export { potenciaExercises } from './potenciaExercises';
export { tricepsExercises } from './tricepsExercises';

// Podrías también crear un objeto que agrupe todos los ejercicios por categoría aquí
// import { ExerciseCategory } from '../types/exerciseTypes'; // Asegúrate que la ruta sea correcta

// export const allExercisesByCategory = {
//   [ExerciseCategory.BICEPS]: bicepsExercises,
//   [ExerciseCategory.CARDIO]: cardioExercises,
//   // ... y así sucesivamente para todas las categorías
// };

// Si ExerciseData está definida en un archivo (ej. bicepsExercises.ts) y la quieres usar globalmente:
// export type { ExerciseData } from './bicepsExercises'; 
// O si cada archivo la define, asegúrate de que sean consistentes.
// Lo ideal sería tener ExerciseData en un archivo de tipos centralizado e importarla donde se necesite.