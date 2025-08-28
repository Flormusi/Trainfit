import type { ExerciseData } from './bicepsExercises'; // Or your central types file
import { getExerciseImageUrl } from '../services/cloudinaryService';

// Función helper para generar URLs de imágenes
const getImageUrl = (exerciseName: string): string => {
  return getExerciseImageUrl(exerciseName);
};

export const isquiosExercises: ExerciseData[] = [
  // NOTA: Ahora usando Cloudinary para gestión optimizada de imágenes
  { name: "Flexión de piernas en silla romana", imageUrl: getImageUrl("Flexión de piernas en silla romana") },
  { name: "Peso muerto piernas semirrígidas", imageUrl: getImageUrl("Peso muerto piernas semirrígidas") },
  { name: "Peso muerto con barra", imageUrl: getImageUrl("Peso muerto con barra") },
  { name: "Peso muerto estilo sumo", imageUrl: getImageUrl("Peso muerto estilo sumo") },
  { name: "Peso Muerto a 1 Pierna", imageUrl: getImageUrl("Peso Muerto a 1 Pierna") },
  { name: "Isquios en camilla", imageUrl: getImageUrl("Isquios en camilla") },
  { name: "Isquios camilla 1 pierna", imageUrl: getImageUrl("Isquios camilla 1 pierna") },
  { name: "Isquios sentado en máquina", imageUrl: getImageUrl("Isquios sentado en máquina") },
  { name: "Curl Nordico", imageUrl: getImageUrl("Curl Nordico") },
  { name: "Peso Muerto con mancuernas", imageUrl: getImageUrl("Peso Muerto con mancuernas") },
  { name: "Flexion de isquios con pelota", imageUrl: getImageUrl("Flexion de isquios con pelota") },
  { name: "Flexion de isquis unilateral", imageUrl: getImageUrl("Flexion de isquis unilateral") },
  { name: "Isquios en banco con mancuernas", imageUrl: getImageUrl("Isquios en banco con mancuernas") },
  { name: "Isquios con Hamroll", imageUrl: getImageUrl("Isquios con Hamroll") },
  { name: "Flexion de Isquios Acostoado con banda", imageUrl: getImageUrl("Flexion de Isquios Acostoado con banda") },
  { name: "Control pelvico con talones", imageUrl: getImageUrl("Control pelvico con talones") },
  { name: "Control pelvico escalera", imageUrl: getImageUrl("Control pelvico escalera") },
  { name: "Toco punta de pie sobre escalón", imageUrl: getImageUrl("Toco punta de pie sobre escalón") },
];