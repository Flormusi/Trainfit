import type { ExerciseData } from './bicepsExercises'; // Or your central types file
import { getExerciseImageUrl } from '../services/cloudinaryService';

// Función helper para generar URLs de imágenes
const getImageUrl = (exerciseName: string): string => {
  return getExerciseImageUrl(exerciseName);
};

export const gemelosExercises: ExerciseData[] = [
  // NOTA: Ahora usando Cloudinary para gestión optimizada de imágenes
  { name: "Gemelos de Pie", imageUrl: getImageUrl("Gemelos de Pie") },
  { name: "Gemelos en Maquina", imageUrl: getImageUrl("Gemelos en Maquina") },
  { name: "Gemelos (soleo)en Maquina sentado", imageUrl: getImageUrl("Gemelos (soleo)en Maquina sentado") },
  { name: "Gemelos en Prensa", imageUrl: getImageUrl("Gemelos en Prensa") },
  { name: "Gemelos Burrito", imageUrl: getImageUrl("Gemelos Burrito") },
  { name: "Vitalizaciones s/ punta de pie (explosivas)", imageUrl: getImageUrl("Vitalizaciones s/ punta de pie (explosivas)") }
];