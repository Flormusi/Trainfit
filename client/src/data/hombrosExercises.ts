import type { ExerciseData } from './bicepsExercises';
import { getExerciseImageUrl } from '../services/cloudinaryService';

// Función helper para generar URLs de imágenes
const getImageUrl = (exerciseName: string) => {
  return getExerciseImageUrl(exerciseName);
};

export const hombrosExercises: ExerciseData[] = [
  { name: "Rotación externa con banda unilateral", imageUrl: getImageUrl("Rotación externa con banda unilateral") },
  { name: "Vuelos laterales de pie con mancuernas", imageUrl: getImageUrl("Vuelos laterales de pie con mancuernas") },
  { name: "Vuelos Frontales", imageUrl: getImageUrl("Vuelos Frontales") },
  { name: "Press de hombros unilateral", imageUrl: getImageUrl("Press de hombros unilateral") },
  { name: "Thruster", imageUrl: getImageUrl("Thruster") },
  { name: "Press Militar", imageUrl: getImageUrl("Press Militar") },
  { name: "Press de Hombros de Pie con mancuernas", imageUrl: getImageUrl("Press de Hombros de Pie con mancuernas") },
  { name: "Face Pull", imageUrl: getImageUrl("Face Pull") }
];