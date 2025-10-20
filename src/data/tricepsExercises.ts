import type { ExerciseData } from './bicepsExercises'; // Or any other file exporting ExerciseData
import { getExerciseImageUrl } from '../services/cloudinaryService';


// Función helper para generar URLs de imágenes
function getImageUrl(exerciseName: string): string {
  return getExerciseImageUrl(exerciseName);
};

export const tricepsExercises: ExerciseData[] = [
  // NOTA: Ahora usando Cloudinary para gestión optimizada de imágenes
  { name: "Press de Triceps plano manos juntas", imageUrl: getImageUrl("Press Triceps plano") },
  { name: "Fondos paralelas", imageUrl: getImageUrl("Fondos paralelas") },
  { name: "Extensiones de tríceps en polea alta", imageUrl: getImageUrl("Triceps polea alta") },
  { name: "Extensiones de tríceps en polea alta con cuerda", imageUrl: getImageUrl("Triceps polea cuerda") },
  { name: "Extensiones tríceps en polea agarre invertido", imageUrl: getImageUrl("Triceps agarre invertido") },
  { name: "Extensión alternada polea alta en supinación", imageUrl: getImageUrl("Triceps alternado supinacion") },
  { name: "Press francés en banco plano", imageUrl: getImageUrl("Press frances plano") },
  { name: "Press francés en banco plano con mancuernas", imageUrl: getImageUrl("Press frances mancuernas") },
  { name: "Extensión vertical de codos con mancuerna", imageUrl: getImageUrl("Extension vertical codos") },
  { name: "Extensión codos con mancuerna a dos manos", imageUrl: getImageUrl("Extension codos dos manos") },
  { name: "Extensión de los codos sentado con barra", imageUrl: getImageUrl("Extension codos barra") },
  { name: "Extensión de codos con mancuerna", imageUrl: getImageUrl("Extension codos mancuerna") },
  { name: "Fondos entre dos bancos", imageUrl: getImageUrl("Fondos entre bancos") },
  { name: "Flexion triceps corazón", imageUrl: "https://drive.google.com/uc?export=view&id=1m85PsAd4q92qO2Wg2hQJ5FXoEQpR1tSE" },
  { name: "Fondos de triceps", imageUrl: "https://drive.google.com/uc?export=view&id=1U-9N81cx4QW-Z-kzZ_x_zxFJTLbFjXjv" },
  { name: "Triceps sobre pelota", imageUrl: getImageUrl("Triceps sobre pelota") },
];