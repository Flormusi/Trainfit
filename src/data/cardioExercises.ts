import { ExerciseData } from './bicepsExercises';
import { getExerciseImageUrl } from '../services/cloudinaryService';

// Función helper para generar URLs de imágenes
const getImageUrl = (exerciseName: string): string => {
  return getExerciseImageUrl(exerciseName);
};

export const cardioExercises: ExerciseData[] = [
  // NOTA: Ahora usando Cloudinary para gestión optimizada de imágenes
  { name: "Elíptico", imageUrl: getImageUrl("Elíptico") },
  { name: "Cinta", imageUrl: getImageUrl("Cinta") },
  { name: "Stair master", imageUrl: getImageUrl("Stair master") },
  { name: "Bici", imageUrl: getImageUrl("Bici") },
  { name: "Air bike", imageUrl: getImageUrl("Air bike") },
  { name: "Jumping Jacks", imageUrl: getImageUrl("Jumping Jacks") },
  { name: "Golpes con mancuernas", imageUrl: getImageUrl("Golpes con mancuernas") },
  { name: "Soga", imageUrl: getImageUrl("Soga") },
  { name: "Battle Rope Alternado", imageUrl: getImageUrl("Battle Rope Alternado") },
  { name: "Battle rope Doble", imageUrl: getImageUrl("Battle rope Doble") },
  { name: "Seal Jack", imageUrl: getImageUrl("Seal Jack") },
  { name: "Saltos estrella", imageUrl: getImageUrl("Saltos estrella") },
  { name: "Burpee Completo", imageUrl: getImageUrl("Burpee Completo") },
  { name: "Subir escaleras", imageUrl: getImageUrl("Subir escaleras") },
  { name: "Repiqueteo", imageUrl: getImageUrl("Repiqueteo") },
  { name: "Talones a la cola", imageUrl: getImageUrl("Talones a la cola") },
  { name: "Saltos Split", imageUrl: getImageUrl("Saltos Split") },
  { name: "Skier Jack", imageUrl: getImageUrl("Skier Jack") },
];