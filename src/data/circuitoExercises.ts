import type { ExerciseData } from './bicepsExercises'; // Or your central types file
import { getExerciseImageUrl } from '../services/cloudinaryService';

// Función helper para generar URLs de imágenes
const getImageUrl = (exerciseName: string) => {
  return getExerciseImageUrl(exerciseName);
};

export const circuitoExercises: ExerciseData[] = [
  { name: "Tabata 20x10", imageUrl: getImageUrl("Tabata 20x10") },
  { name: "Intermitente 30x15", imageUrl: getImageUrl("Intermitente 30x15") },
  { name: "Intermitente 30x30", imageUrl: getImageUrl("Intermitente 30x30") },
  { name: "intermitente 1'x2'", imageUrl: getImageUrl("intermitente 1'x2'") },
  { name: "Intermitente con elevación 2'x1'", imageUrl: getImageUrl("Intermitente elevacion") },
  { name: "Intermitente 2x1", imageUrl: getImageUrl("Intermitente 2x1") },
  { name: "Aerobico continuo", imageUrl: getImageUrl("Aerobico continuo") },
  { name: "Cardio 3 minutos", imageUrl: getImageUrl("Cardio 3 minutos") },
  { name: "Cardio 3x1", imageUrl: getImageUrl("Cardio 3x1") },
  { name: "Cardio 30'", imageUrl: getImageUrl("Cardio 30") },
  { name: "Intermitente 45x15", imageUrl: getImageUrl("Intermitente 45x15") },
  { name: "Pasadas 100", imageUrl: getImageUrl("Pasadas 100") },
  { name: "Pasadas 400", imageUrl: getImageUrl("Pasadas 400") },
  { name: "Pasadas 200", imageUrl: getImageUrl("Pasadas 200") },
  { name: "Pasadas 50", imageUrl: getImageUrl("Pasadas 50") },
];