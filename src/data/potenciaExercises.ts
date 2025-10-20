import type { ExerciseData } from './bicepsExercises'; // Or any other file exporting ExerciseData
import { getExerciseImageUrl } from '../services/cloudinaryService';


// Función helper para generar URLs de imágenes
const getImageUrl = (exerciseName: string) => {
  return getExerciseImageUrl(exerciseName);
};

export const potenciaExercises: ExerciseData[] = [
  { name: "Arranque a 1 Brazo", imageUrl: getImageUrl("Arranque a 1 Brazo") },
  { name: "Cargada", imageUrl: getImageUrl("Clean") },
  { name: "Salto CMJ", imageUrl: getImageUrl("CMJ Jump") },
  { name: "Drop jump", imageUrl: getImageUrl("Drop Jump") },
  { name: "Escalera lateral", imageUrl: getImageUrl("Lateral Ladder") },
  { name: "Escalera de frente", imageUrl: getImageUrl("Front Ladder") },
  { name: "Adentro Afuera", imageUrl: getImageUrl("Adentro Afuera") },
  { name: "Escalera lateral de brazos", imageUrl: getImageUrl("Lateral Arm Ladder") },
  { name: "Saltos lado a lado", imageUrl: getImageUrl("Saltos lado a lado") },
  { name: "Saltos adelante", imageUrl: getImageUrl("Saltos adelante") },
  { name: "Salto con soga", imageUrl: getImageUrl("Salto con soga") },
  { name: "Salto desde arrodillado", imageUrl: getImageUrl("Salto desde arrodillado") },
  { name: "Sentadilla con Salto", imageUrl: getImageUrl("Sentadilla con Salto") },
  { name: "Lanzamiento medicine Ball de Rodilla", imageUrl: getImageUrl("Lanzamiento medicine Ball de Rodilla") },
  { name: "Lanzamiento rotacional con medicinal ball", imageUrl: getImageUrl("Lanzamiento rotacional con medicinal ball") },
  { name: "Saltos al Bosu 1 Pierna", imageUrl: getImageUrl("Saltos al Bosu 1 Pierna") },
  { name: "Salto al Cajon", imageUrl: getImageUrl("Salto al Cajon") },
  { name: "Saltos Estocada lateral al banco", imageUrl: getImageUrl("Saltos Estocada lateral al banco") },
  { name: "Repiqueteo con banda", imageUrl: getImageUrl("Repiqueteo con banda") },
  { name: "Saltos al cajon 1 pierna", imageUrl: getImageUrl("Saltos al cajon 1 pierna") },
  { name: "Estocada bulgara explosiva", imageUrl: getImageUrl("Estocada bulgara explosiva") },
];