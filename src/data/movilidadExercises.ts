import type { ExerciseData } from './bicepsExercises'; // Or any other file exporting ExerciseData
import { getExerciseImageUrl } from '../services/cloudinaryService';


// Función helper para generar URLs de imágenes
const getImageUrl = (exerciseName: string) => {
  return getExerciseImageUrl(exerciseName);
};

export const movilidadExercises: ExerciseData[] = [
  // NOTA: Ahora usando Cloudinary para gestión optimizada de imágenes
  { name: "Liberación pelvica", imageUrl: getImageUrl("Liberacion pelvica") },
  { name: "Flexión-extensión rodilla", imageUrl: getImageUrl("Flexion extension rodilla") },
  { name: "Movilidad piramidal/gluteo", imageUrl: getImageUrl("Movilidad piramidal") },
  { name: "estiramiento flexores", imageUrl: getImageUrl("Estiramiento flexores") },
  { name: "Estiramiento cuadriceps psoas", imageUrl: getImageUrl("Estiramiento cuadriceps") },
  { name: "estiramiento piramidal/cadena posterior", imageUrl: getImageUrl("Estiramiento piramidal") },
  { name: "Estiramiento aductores", imageUrl: getImageUrl("Estiramiento aductores") },
  { name: "Estiramiento dinámico lumbar caderas", imageUrl: getImageUrl("Estiramiento lumbar") },
  { name: "Rotación torácica en tracción", imageUrl: getImageUrl("Rotacion toracica") },
  { name: "Apertura lateral acostado", imageUrl: getImageUrl("Apertura lateral acostado") },
  { name: "Apertura toracica", imageUrl: getImageUrl("Apertura toracica") },
  { name: "Dorsiflexión en banco", imageUrl: getImageUrl("Dorsiflexión en banco") },
  { name: "Bisagra rodillas en TRX", imageUrl: getImageUrl("Bisagra rodillas en TRX") },
  { name: "Gato contento-enojado", imageUrl: getImageUrl("Gato contento-enojado") },
  { name: "Toco adelante y atrás step", imageUrl: getImageUrl("Toco adelante y atrás step") },
  { name: "Estiramiento Cervical", imageUrl: getImageUrl("Estiramiento Cervical") },
  { name: "Estiramiento Dorsal", imageUrl: getImageUrl("Estiramiento Dorsal") },
  { name: "Circuito de estiramiento cervical", imageUrl: getImageUrl("Circuito de estiramiento cervical") },
  { name: "Circuito de estiramiento lumbar", imageUrl: getImageUrl("Circuito de estiramiento lumbar") },
  { name: "Estiramiento Lumbar", imageUrl: getImageUrl("Estiramiento Lumbar") },
  { name: "Rechazo Escapular", imageUrl: getImageUrl("Rechazo Escapular") },
  { name: "Apertura toracica de rodillas", imageUrl: getImageUrl("Apertura toracica de rodillas") },
  { name: "Estiramiento isquios extension", imageUrl: getImageUrl("Estiramiento isquios extension") },
  { name: "Flexion hacia adelante con pierna flex", imageUrl: getImageUrl("Flexion hacia adelante con pierna flex") },
  { name: "Estiramiento isquios en banco", imageUrl: getImageUrl("Estiramiento isquios en banco") },
  { name: "Flexión de caderas", imageUrl: getImageUrl("Flexión de caderas") },
  { name: "Estiramiento de isquio sentado", imageUrl: getImageUrl("Estiramiento de isquio sentado") },
  { name: "Estiramiento de isquios en pared tumbado", imageUrl: getImageUrl("Estiramiento de isquios en pared tumbado") },
  { name: "Estiramiento cadena Anterolateral", imageUrl: getImageUrl("Estiramiento cadena Anterolateral") },
  { name: "Movilidad de cadera", imageUrl: getImageUrl("Movilidad de cadera") },
  { name: "Estiramiento aductor dinámico", imageUrl: getImageUrl("Estiramiento aductor dinámico") },
  { name: "Estiramiento banda iliotibial", imageUrl: getImageUrl("Estiramiento banda iliotibial") },
  { name: "Estiramiento torácico con roller foam", imageUrl: getImageUrl("Estiramiento torácico con roller foam") },
  { name: "Rotaciones de cadera acostado", imageUrl: getImageUrl("Rotaciones de cadera acostado") },
  { name: "Estiramiento dinámico patada al frente", imageUrl: getImageUrl("Estiramiento dinámico patada al frente") },
  { name: "Molinos", imageUrl: getImageUrl("Molinos") },
  { name: "Circuito Estiramiento lumbar", imageUrl: getImageUrl("Circuito Estiramiento lumbar") },
  { name: "Estiramiento cadena lateral sobre pared", imageUrl: getImageUrl("Estiramiento cadena lateral sobre pared") },
  { name: "Estiramiento lateral sobre pelota", imageUrl: getImageUrl("Estiramiento lateral sobre pelota") },
  { name: "Escorpiones", imageUrl: getImageUrl("Escorpiones") },
  { name: "Estiramiento de piramidal acostado", imageUrl: getImageUrl("Estiramiento de piramidal acostado") },
];