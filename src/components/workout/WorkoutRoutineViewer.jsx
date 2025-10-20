import React from 'react';
// import { WorkoutPlan } from '../../types/workoutTypes'; // Assuming types
// import './WorkoutRoutineViewer.css'; // If you have specific styles

// interface WorkoutRoutineViewerProps {
//   plan: WorkoutPlan;
// }

const WorkoutRoutineViewer = ({ plan }) => {
  if (!plan) {
    return <p>No workout plan data provided.</p>;
  }

  return (
    <div className="workout-routine-viewer" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>{plan.name || 'Workout Routine'}</h1>
      {plan.description && <p style={{ textAlign: 'center', color: '#555' }}>{plan.description}</p>}

      {(plan.weeks || plan.days)?.map((weekOrDay, index) => ( // Adapt based on your WorkoutPlan structure
        <div key={weekOrDay.id || index} className="week-section" style={{ marginBottom: '30px', padding: '15px', border: 'none', borderRadius: '5px' }}>
        <h2 style={{ color: '#444', borderBottom: 'none', paddingBottom: '10px' }}>
            {weekOrDay.name || `Week ${index + 1}` / `Day ${index + 1}`}
          </h2>
          {weekOrDay.exercises?.length > 0 ? (
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {weekOrDay.exercises.map((exercise, exIndex) => (
                <li key={exercise.id || exIndex} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#007bff' }}>{exercise.name}</h4>
                  <p style={{ margin: '2px 0' }}>Series: {exercise.series}</p>
                  <p style={{ margin: '2px 0' }}>Reps: {exercise.reps}</p>
                  {exercise.weight && <p style={{ margin: '2px 0' }}>Weight: {exercise.weight}</p>}
                  {exercise.notes && <p style={{ margin: '2px 0', fontSize: '0.9em', color: '#666' }}>Notes: {exercise.notes}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p>No exercises for this period.</p>
          )}
        </div>
      ))}
      {(!plan.weeks && !plan.days) && <p>Workout plan structure is not recognized or empty.</p>}
    </div>
  );
};

export default WorkoutRoutineViewer;