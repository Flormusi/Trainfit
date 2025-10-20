import type { ExerciseData } from './bicepsExercises'; // O desde tu archivo de tipos central si lo moviste
import { getExerciseImageUrl } from '../services/cloudinaryService';


// Función helper para generar URLs de imágenes
const getImageUrl = (exerciseName: string) => {
  return getExerciseImageUrl(exerciseName);
};

export const gluteoExercises: ExerciseData[] = [
  // NOTA: Ahora usando Cloudinary para gestión optimizada de imágenes
  { name: "Control Pelvico", imageUrl: getImageUrl("Control Pelvico") },
  { name: "Control pelvico con barra", imageUrl: getImageUrl("Control pelvico barra") },
  { name: "Control pélvico con mancuerna", imageUrl: getImageUrl("Control pelvico mancuerna") },
  { name: "Puente de glúteo rodilla cruzada", imageUrl: getImageUrl("Puente gluteo cruzado") },
  { name: "Control pelvico alto", imageUrl: getImageUrl("Control pelvico alto") },
  { name: "Patada de Perrito", imageUrl: getImageUrl("Patada de Perrito") },
  { name: "Hip Thrust en Maquina", imageUrl: getImageUrl("Hip Thrust en Maquina") },
  { name: "Swing Ketbell", imageUrl: getImageUrl("Swing Ketbell") },
  { name: "Patada de glúteo 4 apoyos tobillera", imageUrl: getImageUrl("Patada de glúteo 4 apoyos tobillera") },
  { name: "Patada Gluteo polea pierna recta", imageUrl: getImageUrl("Patada Gluteo polea pierna recta") },
  { name: "Abductores en polea", imageUrl: getImageUrl("Abductores en polea") },
  { name: "Pull Through", imageUrl: getImageUrl("Pull Through") },
  { name: "Hip Thrust en banco", imageUrl: getImageUrl("Hip Thrust en banco") },
  { name: "Hip thrust a 1 pierna", imageUrl: getImageUrl("Hip thrust a 1 pierna") },
  { name: "Hip Thrust con Barra", imageUrl: getImageUrl("Hip Thrust con Barra") },
  { name: "Control Pelvico Elevado", imageUrl: getImageUrl("Control Pelvico Elevado") },
  { name: "Abductor con banda y pelota", imageUrl: getImageUrl("Abductor con banda y pelota") },
  { name: "Puente de Glúteos Rana", imageUrl: getImageUrl("Puente de Glúteos Rana") },
  { name: "Extensión de cadera en silla romana", imageUrl: getImageUrl("Extensión de cadera en silla romana") },
  { name: "Control pélvico isométrico", imageUrl: getImageUrl("Control pélvico isométrico") },
  { name: "Hip thrust con mancuerna", imageUrl: getImageUrl("Hip thrust con mancuerna") },
  { name: "Abducción de cadera con disco de pie", imageUrl: getImageUrl("Abducción de cadera con disco de pie") },
];