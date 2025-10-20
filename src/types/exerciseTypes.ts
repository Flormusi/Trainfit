export enum ExerciseCategory {
  BICEPS = "Bíceps",
  TRICEPS = "Tríceps",
  PECTORALES = "Pectorales",
  DORSALES = "Dorsales",
  HOMBROS = "Hombros",
  PIERNAS = "Piernas (Cuádriceps)",
  ISQUIOS = "Isquiotibiales",
  GLUTEOS = "Glúteos",
  GEMELOS = "Gemelos",
  CORE = "Core/Abdominales",
  ESPINALES = "Espinales",
  CARDIO = "Cardio",
  MOVILIDAD = "Movilidad",
  POTENCIA = "Potencia",
  CIRCUITO = "Circuito",
  // Agrega más categorías según sea necesario
}

// Podrías tener una interfaz más detallada para los ejercicios si los datos en /data fueran objetos
// export interface ExerciseDetail {
//   name: string;
//   category: ExerciseCategory;
//   muscleGroup?: string[]; // e.g., ['Pectoralis Major', 'Anterior Deltoid']
//   equipmentNeeded?: string[]; // e.g., ['Dumbbell', 'Bench']
//   difficulty?: 'beginner' | 'intermediate' | 'advanced';
// }