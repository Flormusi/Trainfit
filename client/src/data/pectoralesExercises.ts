import type { ExerciseData } from './bicepsExercises'; // Or any other file exporting ExerciseData
import { getExerciseImageUrl } from '../services/cloudinaryService';

// Función helper para generar URLs de imágenes
const getImageUrl = (exerciseName: string): string => {
  return getExerciseImageUrl(exerciseName);
};

export const pectoralesExercises: ExerciseData[] = [
  // NOTA: Ahora usando Cloudinary para gestión optimizada de imágenes
  { name: "Flexiones contra pared", imageUrl: getImageUrl("Flexiones contra pared") },
  { name: "Press de banca plano", imageUrl: getImageUrl("Press de banca plano") },
  { name: "Press de banca inclinado", imageUrl: getImageUrl("Press de banca inclinado") },
  { name: "Press de banca declinado", imageUrl: getImageUrl("Press de banca declinado") },
  { name: "Flexiones de brazos en el suelo", imageUrl: getImageUrl("Flexiones de brazos en el suelo") },
  { name: "Press mancuernas banco plano", imageUrl: getImageUrl("Press mancuernas banco plano") },
  { name: "Aperturas mancuernas banco plano", imageUrl: getImageUrl("Aperturas mancuernas banco plano") },
  { name: "Press mancuernas banco inclinado", imageUrl: getImageUrl("Press mancuernas banco inclinado") },
  { name: "Aperturas mancuernas banco inclinado", imageUrl: getImageUrl("Aperturas mancuernas banco inclinado") },
  { name: "Aperturas en peck deck", imageUrl: getImageUrl("Aperturas en peck deck") },
  { name: "Cruces en poleas", imageUrl: getImageUrl("Cruces en poleas") },
  { name: "Pull-over con mancuerna", imageUrl: getImageUrl("Pull-over con mancuerna") },
  { name: "Press de Pecho en maquina", imageUrl: getImageUrl("Press de Pecho en maquina") },
  { name: "Press a 1 brazo 45", imageUrl: getImageUrl("Press a 1 brazo 45") },
  { name: "Press a 1 brazo plano", imageUrl: getImageUrl("Press a 1 brazo plano") },
  { name: "Press de pecho + control pelvico", imageUrl: getImageUrl("Press de pecho + control pelvico") },
  { name: "Flexiones de brazos con pies elevados", imageUrl: getImageUrl("Flexiones de brazos con pies elevados") },
  { name: "Aperturas en el piso", imageUrl: getImageUrl("Aperturas en el piso") },
  { name: "Flexiones de brazos sobre banco", imageUrl: getImageUrl("Flexiones de brazos sobre banco") },
  { name: "Flexiones de brazos con aplauso", imageUrl: getImageUrl("Flexiones de brazos con aplauso") }
];