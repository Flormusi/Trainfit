export interface Exercise {
  id: string; // Podría ser un UUID o un ID numérico único
  name: string;
  // Otros campos que puedas necesitar, como:
  // muscleGroup?: string;
  // description?: string;
  // videoUrl?: string;
}

export interface WorkoutExercise extends Exercise {
  // id: string; // Ya está en Exercise
  // name: string; // Ya está en Exercise
  series: string | number; // Cambiado para permitir placeholder '#' o número
  reps: string | number;
  weight?: string | number; // Añadido campo Peso, opcional
  notes?: string;
  // 'rest' ha sido eliminado según la imagen
  // Agregamos un campo para el icono del ejercicio si lo tuvieras
  iconUrl?: string; 
}

// Eliminamos WorkoutDay por ahora para simplificar y acercarnos a la imagen
// Si cada semana tuviera múltiples días, lo reintroduciríamos aquí.
// export interface WorkoutDay {
//   id: string;
//   name: string; 
//   exercises: WorkoutExercise[];
// }

export interface Week {
  id: string;
  name: string; // Ej: "Semana 1"
  exercises: WorkoutExercise[];
}

export interface WorkoutPlan {
  id: string;
  name: string; // Nombre general de la rutina
  description?: string;
  weeks: Week[]; // El plan ahora consiste en semanas
  // targetGroup y durationInWeeks pueden permanecer si son útiles
  targetGroup?: 'beginner' | 'intermediate' | 'advanced' | string;
  // durationInWeeks?: number; 
}