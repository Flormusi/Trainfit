import type { ExerciseData } from './bicepsExercises'; // Or your central types file
import { getExerciseImageUrl } from '../services/cloudinaryService';


// Función helper para generar URLs de imágenes
const getImageUrl = (exerciseName: string) => {
  return getExerciseImageUrl(exerciseName);
};

export const espinalesExercises: ExerciseData[] = [
  // NOTA: Ahora usando Cloudinary para gestión optimizada de imágenes
  { name: "Espinal cruzado", imageUrl: getImageUrl("Espinal cruzado") },
  { name: "Espinal isometrico", imageUrl: getImageUrl("Espinal isometrico") },
  { name: "Espinal Nado", imageUrl: getImageUrl("Espinal Nado") },
  { name: "Bird Dog", imageUrl: getImageUrl("Bird Dog") },
  { name: "Espinal Superman", imageUrl: getImageUrl("Espinal Superman") },
  { name: "Espinal caprichito", imageUrl: getImageUrl("Espinal caprichito") },
  { name: "Espinal paracaída", imageUrl: getImageUrl("Espinal paracaída") },
  { name: "Plancha con rodillas apoyadas", imageUrl: getImageUrl("Plancha con rodillas apoyadas") },
  { name: "Saludo al sol", imageUrl: getImageUrl("Saludo al sol") },
  { name: "Extensión lumbar acostado", imageUrl: getImageUrl("Extensión lumbar acostado") },
  { name: "Saludo al sol dinámico", imageUrl: getImageUrl("Saludo al sol dinámico") },
];