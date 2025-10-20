import { getExerciseImageUrl } from '../services/cloudinaryService';

export interface ExerciseData {
  name: string;
  imageUrl: string;
}

// Función helper para generar URLs de imágenes
const getImageUrl = (exerciseName: string): string => {
  return getExerciseImageUrl(exerciseName);
};

export const bicepsExercises: ExerciseData[] = [
  // NOTA: Ahora usando Cloudinary para gestión optimizada de imágenes
  // Las imágenes se cargan automáticamente con optimización de tamaño y formato
  { name: "Curl bíceps alterno con supinación", imageUrl: getImageUrl("Curl bíceps alterno con supinación") },
  { name: "Curl bíceps concentrado en muslo", imageUrl: getImageUrl("Curl bíceps concentrado en muslo") },
  { name: "Biceps en banco scott", imageUrl: getImageUrl("Biceps en banco scott") },
  { name: "Curl bíceps alterno tipo martillo", imageUrl: getImageUrl("Curl bíceps alterno tipo martillo") },
  { name: "Curl de bíceps con polea", imageUrl: getImageUrl("Curl de bíceps con polea") },
  { name: "Brazos en cruz en polea alta", imageUrl: getImageUrl("Brazos en cruz en polea alta") },
  { name: "Curl de bíceps con barra", imageUrl: getImageUrl("Curl de bíceps con barra") },
  { name: "Bíceps en banco Scott (barra ez)", imageUrl: getImageUrl("Bíceps en banco Scott (barra ez)") },
  { name: "Biceps sentado", imageUrl: getImageUrl("Biceps sentado") },
  { name: "Biceps con mancuernas", imageUrl: getImageUrl("Biceps con mancuernas") },
  { name: "Curl de biceps con barra en pronacion", imageUrl: getImageUrl("Curl de biceps con barra en pronacion") },
  { name: "Biceps mas sentadillas", imageUrl: getImageUrl("Biceps mas sentadillas") },
  { name: "Biceps sobre pelota", imageUrl: getImageUrl("Biceps sobre pelota") },
  { name: "Biceps + press de hombros", imageUrl: getImageUrl("Biceps + press de hombros") }
];