// Placeholder for workout related types or data
// You might want to reuse or adapt types from workoutTypes.ts

export interface BasicWorkout {
  id: string;
  name: string;
  description?: string;
  // Add other relevant fields
}

export const sampleWorkouts: BasicWorkout[] = [
  { id: 'w1', name: 'Full Body Strength', description: 'A beginner full body workout.' },
  { id: 'w2', name: 'Upper Body Focus', description: 'Targets chest, back, shoulders, and arms.' },
];