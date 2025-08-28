import { WorkoutPlan } from '../types/workoutTypes'; // Assuming workoutTypes.ts exists

export const sampleWorkoutPlans: WorkoutPlan[] = [
  // Example structure - you would populate this with actual workout plans
  {
    id: 'plan1',
    name: 'Beginner Full Body',
    description: 'A 3-day full body routine for beginners.',
    weeks: [
      {
        id: 'week1',
        name: 'Semana 1-4',
        exercises: [
          { id: 'ex1', name: 'Sentadillas', series: 3, reps: '8-12', weight: '#', notes: 'Focus on form.' },
          { id: 'ex2', name: 'Press de Banca', series: 3, reps: '8-12', weight: '#', notes: '' },
        ],
      },
    ],
    targetGroup: 'beginner',
  },
];

// Or it could be for other workout related types/interfaces if not covered elsewhere
// export interface WorkoutLog {
//   date: string;
//   exerciseId: string;
//   setsCompleted: Array<{ reps: number; weight: number }>;
// }

// Placeholder for workout definitions, types, or sample data
// For example, you might define an interface for a full workout routine here
// or list pre-defined workout plans.

export interface SampleWorkout {
  id: string;
  name: string;
  description?: string;
  // Further structure for exercises, sets, reps, etc.
}

export const sampleWorkouts: SampleWorkout[] = [
  { id: 'wk1', name: 'Beginner Full Body' },
  { id: 'wk2', name: 'Intermediate Upper Body' },
];

// Or this could be an extension of the workout plan types
// from src/types/workoutTypes.ts