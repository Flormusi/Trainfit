import type { ExerciseData } from './bicepsExercises'; // Or your central types file
import { getExerciseImageUrl } from '../services/cloudinaryService';

// Función helper para generar URLs de imágenes
const getImageUrl = (exerciseName: string): string => {
  return getExerciseImageUrl(exerciseName);
};

export const dorsalesExercises: ExerciseData[] = [
  // NOTA: Ahora usando Cloudinary para gestión optimizada de imágenes
  { name: "Remo con TRX", imageUrl: getImageUrl("Remo con TRX") },
  { name: "Remo con barra invertido", imageUrl: getImageUrl("Remo con barra invertido") },
  { name: "Subo rodilla + remo", imageUrl: getImageUrl("Subo rodilla + remo") },
  { name: "Dominadas en barra fija", imageUrl: getImageUrl("Dominadas en barra fija") },
  { name: "Dominadas en barra fija, agarre en supinación", imageUrl: getImageUrl("Dominadas en barra fija, agarre en supinación") },
  { name: "Dorsal al frente en polea", imageUrl: getImageUrl("Dorsal al frente en polea") },
  { name: "Polea tras nuca", imageUrl: getImageUrl("Polea tras nuca") },
  { name: "Polea al pecho agarre estrecho", imageUrl: getImageUrl("Polea al pecho agarre estrecho") },
  { name: "Pull-over con polea alta, brazos extendidos", imageUrl: getImageUrl("Pull-over con polea alta, brazos extendidos") },
  { name: "Remo sentado", imageUrl: getImageUrl("Remo sentado") },
  { name: "Dorsales en máquina", imageUrl: getImageUrl("Dorsales en máquina") },
  { name: "Remo con mancuernas s/ banco inclinado", imageUrl: getImageUrl("Remo con mancuernas s/ banco inclinado") },
  { name: "Remo a un brazo", imageUrl: getImageUrl("Remo a un brazo") },
  { name: "Remo horizontal con barra, manos en pronación", imageUrl: getImageUrl("Remo horizontal con barra, manos en pronación") },
  { name: "Remo en barra T con apoyo al pecho", imageUrl: getImageUrl("Remo en barra T con apoyo al pecho") },
  { name: "Remos con barra", imageUrl: getImageUrl("Remos con barra") },
  { name: "Extensión de tronco en banco", imageUrl: getImageUrl("Extensión de tronco en banco") },
  { name: "Pull over con mancuerna", imageUrl: getImageUrl("Pull over con mancuerna") },
  { name: "Gorilla row", imageUrl: getImageUrl("Gorilla row") },
  { name: "Remo al menton con barra", imageUrl: getImageUrl("Remo al menton con barra") },
  { name: "Encogimiento de hombros con barra", imageUrl: getImageUrl("Encogimiento de hombros con barra") },
  { name: "Encogimiento de hombros con mancuernas", imageUrl: getImageUrl("Encogimiento de hombros con mancuernas") },
  { name: "Rowing", imageUrl: getImageUrl("Rowing") }
];