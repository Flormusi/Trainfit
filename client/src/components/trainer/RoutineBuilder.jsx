import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { trainerApi } from '../../services/api.ts';
import './RoutineBuilder.css';

const RoutineBuilder = () => {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!routineId;
  
  const [routine, setRoutine] = useState({
    name: '',
    description: '',
    frequency: 3,
    estimatedDuration: 45,
    trainerNotes: '',
    exercises: [],
    weeklyPlan: {
      week1: [],
      week2: [],
      week3: [],
      week4: []
    }
  });
  
  const [exerciseDatabase, setExerciseDatabase] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [activeWeek, setActiveWeek] = useState('week1');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch exercise database
        const exercisesResponse = await trainerApi.getExercises();
        setExerciseDatabase(exercisesResponse.data);
        
        // If editing, fetch routine details
        if (isEditMode) {
          const routineResponse = await trainerApi.getRoutineDetails(routineId);
          setRoutine(routineResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, [routineId, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoutine(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    setRoutine(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddExercise = (exercise) => {
    const newExercise = {
      ...exercise,
      sets: 3,
      reps: 10,
      rest: 60,
      notes: '',
      weights: {
        week1: '',
        week2: '',
        week3: '',
        week4: ''
      }
    };
    
    // Add to the current day in the weekly plan
    setRoutine(prev => {
      const updatedWeeklyPlan = { ...prev.weeklyPlan };
      
      if (!updatedWeeklyPlan[activeWeek]) {
        updatedWeeklyPlan[activeWeek] = [];
      }
      
      if (!updatedWeeklyPlan[activeWeek][activeDay - 1]) {
        updatedWeeklyPlan[activeWeek][activeDay - 1] = [];
      }
      
      updatedWeeklyPlan[activeWeek][activeDay - 1] = [
        ...updatedWeeklyPlan[activeWeek][activeDay - 1],
        newExercise
      ];
      
      return {
        ...prev,
        weeklyPlan: updatedWeeklyPlan
      };
    });
    
    setSearchTerm('');
  };

  const handleRemoveExercise = (exerciseIndex) => {
    setRoutine(prev => {
      const updatedWeeklyPlan = { ...prev.weeklyPlan };
      
      updatedWeeklyPlan[activeWeek][activeDay - 1] = 
        updatedWeeklyPlan[activeWeek][activeDay - 1].filter((_, i) => i !== exerciseIndex);
      
      return {
        ...prev,
        weeklyPlan: updatedWeeklyPlan
      };
    });
  };

  const handleExerciseChange = (exerciseIndex, field, value) => {
    setRoutine(prev => {
      const updatedWeeklyPlan = { ...prev.weeklyPlan };
      
      if (!updatedWeeklyPlan[activeWeek][activeDay - 1]) {
        return prev;
      }
      
      updatedWeeklyPlan[activeWeek][activeDay - 1] = 
        updatedWeeklyPlan[activeWeek][activeDay - 1].map((exercise, i) => {
          if (i === exerciseIndex) {
            return {
              ...exercise,
              [field]: field === 'sets' || field === 'reps' || field === 'rest' 
                ? parseInt(value) || 0 
                : value
            };
          }
          return exercise;
        });
      
      return {
        ...prev,
        weeklyPlan: updatedWeeklyPlan
      };
    });
  };

  const handleWeightChange = (exerciseIndex, week, value) => {
    setRoutine(prev => {
      const updatedWeeklyPlan = { ...prev.weeklyPlan };
      
      if (!updatedWeeklyPlan[activeWeek][activeDay - 1]) {
        return prev;
      }
      
      updatedWeeklyPlan[activeWeek][activeDay - 1] = 
        updatedWeeklyPlan[activeWeek][activeDay - 1].map((exercise, i) => {
          if (i === exerciseIndex) {
            return {
              ...exercise,
              weights: {
                ...exercise.weights,
                [week]: value
              }
            };
          }
          return exercise;
        });
      
      return {
        ...prev,
        weeklyPlan: updatedWeeklyPlan
      };
    });
  };

  const handleMoveExercise = (exerciseIndex, direction) => {
    setRoutine(prev => {
      const updatedWeeklyPlan = { ...prev.weeklyPlan };
      const currentExercises = [...updatedWeeklyPlan[activeWeek][activeDay - 1]];
      
      if (
        (direction === 'up' && exerciseIndex === 0) || 
        (direction === 'down' && exerciseIndex === currentExercises.length - 1)
      ) {
        return prev;
      }
      
      const newIndex = direction === 'up' ? exerciseIndex - 1 : exerciseIndex + 1;
      
      const temp = currentExercises[exerciseIndex];
      currentExercises[exerciseIndex] = currentExercises[newIndex];
      currentExercises[newIndex] = temp;
      
      updatedWeeklyPlan[activeWeek][activeDay - 1] = currentExercises;
      
      return {
        ...prev,
        weeklyPlan: updatedWeeklyPlan
      };
    });
  };

  const handleSaveRoutine = async () => {
    try {
      if (routine.name.trim() === '') {
        alert('Please enter a routine name');
        return;
      }
      
      // Check if any day has exercises
      let hasExercises = false;
      Object.values(routine.weeklyPlan).forEach(week => {
        if (week && week.some(day => day && day.length > 0)) {
          hasExercises = true;
        }
      });
      
      if (!hasExercises) {
        alert('Please add at least one exercise to the routine');
        return;
      }
      
      if (isEditMode) {
        await trainerApi.updateRoutine(routineId, routine);
        alert('Routine updated successfully!');
      } else {
        const response = await trainerApi.createRoutine(routine);
        alert('Routine created successfully!');
        navigate(`/trainer/routines/${response.data.id}`);
      }
    } catch (err) {
      console.error('Error saving routine:', err);
      alert('Failed to save routine. Please try again.');
    }
  };

  const filteredExercises = exerciseDatabase.filter(exercise => 
    (exercise.name ? exercise.name.toLowerCase() : '').includes(searchTerm.toLowerCase()) ||
    (exercise.muscleGroup ? exercise.muscleGroup.toLowerCase() : '').includes(searchTerm.toLowerCase())
  );

  const getCurrentDayExercises = () => {
    if (!routine.weeklyPlan[activeWeek] || !routine.weeklyPlan[activeWeek][activeDay - 1]) {
      return [];
    }
    return routine.weeklyPlan[activeWeek][activeDay - 1];
  };

  const handleDayChange = (day) => {
    setActiveDay(day);
  };

  const handleWeekChange = (week) => {
    setActiveWeek(week);
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="routine-builder">
      <div className="builder-header">
        <Link to="/trainer/routines" className="back-link">
          ← Back to Routines
        </Link>
        <h1>{isEditMode ? 'Edit Routine' : 'Create New Routine'}</h1>
      </div>

      <div className="builder-grid">
        <div className="routine-details">
          <div className="form-group">
            <label htmlFor="name">Routine Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={routine.name}
              onChange={handleInputChange}
              placeholder="e.g., Full Body Strength"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={routine.description}
              onChange={handleInputChange}
              placeholder="Describe the routine and its goals..."
              rows="3"
            ></textarea>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="frequency">Recommended Frequency (per week)</label>
              <input
                type="number"
                id="frequency"
                name="frequency"
                min="1"
                max="7"
                value={routine.frequency}
                onChange={handleNumberInputChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="estimatedDuration">Estimated Duration (minutes)</label>
              <input
                type="number"
                id="estimatedDuration"
                name="estimatedDuration"
                min="10"
                value={routine.estimatedDuration}
                onChange={handleNumberInputChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="trainerNotes">Trainer Notes (only visible to you)</label>
            <textarea
              id="trainerNotes"
              name="trainerNotes"
              value={routine.trainerNotes}
              onChange={handleInputChange}
              placeholder="Add private notes about this routine..."
              rows="3"
            ></textarea>
          </div>
        </div>

        <div className="weekly-plan">
          <div className="week-tabs">
            <button 
              className={`week-tab ${activeWeek === 'week1' ? 'active' : ''}`}
              onClick={() => handleWeekChange('week1')}
            >
              Week 1
            </button>
            <button 
              className={`week-tab ${activeWeek === 'week2' ? 'active' : ''}`}
              onClick={() => handleWeekChange('week2')}
            >
              Week 2
            </button>
            <button 
              className={`week-tab ${activeWeek === 'week3' ? 'active' : ''}`}
              onClick={() => handleWeekChange('week3')}
            >
              Week 3
            </button>
            <button 
              className={`week-tab ${activeWeek === 'week4' ? 'active' : ''}`}
              onClick={() => handleWeekChange('week4')}
            >
              Week 4
            </button>
          </div>
          
          <div className="day-tabs">
            {[1, 2, 3, 4, 5, 6, 7].map(day => (
              <button 
                key={day}
                className={`day-tab ${activeDay === day ? 'active' : ''}`}
                onClick={() => handleDayChange(day)}
              >
                Day {day}
              </button>
            ))}
          </div>
          
          <div className="day-content">
            <h2>Day {activeDay} Exercises</h2>
            
            <div className="exercise-search">
              <h3>Add Exercise</h3>
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search exercises by name or muscle group..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                
                <div className="search-results">
                  {searchTerm && (
                    <>
                      {filteredExercises.length > 0 ? (
                        filteredExercises.slice(0, 5).map(exercise => (
                          <div key={exercise.id} className="exercise-result">
                            <div className="exercise-info">
                              <h3>{exercise.name}</h3>
                              <span className="muscle-group">{exercise.muscleGroup}</span>
                            </div>
                            <button 
                              className="add-exercise-btn"
                              onClick={() => handleAddExercise(exercise)}
                            >
                              Add
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="no-results">
                          <p>No exercises found matching your search.</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {getCurrentDayExercises().length === 0 ? (
              <div className="empty-exercises">
                <p>No exercises added to Day {activeDay} yet. Use the search above to add exercises.</p>
              </div>
            ) : (
              <div className="day-exercises">
                <div className="exercise-table">
                  <div className="table-header">
                    <div className="col-exercise">Exercise</div>
                    <div className="col-sets">Sets</div>
                    <div className="col-reps">Reps</div>
                    <div className="col-rest">Rest</div>
                    <div className="col-week1">Week 1</div>
                    <div className="col-week2">Week 2</div>
                    <div className="col-week3">Week 3</div>
                    <div className="col-week4">Week 4</div>
                    <div className="col-actions">Actions</div>
                  </div>
                  
                  {getCurrentDayExercises().map((exercise, index) => (
                    <div key={index} className="table-row">
                      <div className="col-exercise">
                        <div className="exercise-cell">
                          <div className="exercise-number">{index + 1}</div>
                          <div className="exercise-details">
                            <div className="exercise-name">{exercise.name}</div>
                            <div className="exercise-muscle">{exercise.muscleGroup}</div>
                          </div>
                          {exercise.imageUrl && (
                            <div className="exercise-thumbnail">
                              <img src={exercise.imageUrl} alt={exercise.name} />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="col-sets">
                        <input
                          type="number"
                          min="1"
                          value={exercise.sets}
                          onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                        />
                      </div>
                      
                      <div className="col-reps">
                        <input
                          type="number"
                          min="1"
                          value={exercise.reps}
                          onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                        />
                      </div>
                      
                      <div className="col-rest">
                        <input
                          type="number"
                          min="0"
                          step="5"
                          value={exercise.rest}
                          onChange={(e) => handleExerciseChange(index, 'rest', e.target.value)}
                        />
                        <span className="unit">sec</span>
                      </div>
                      
                      <div className="col-week1">
                        <input
                          type="text"
                          placeholder="kg"
                          value={exercise.weights.week1}
                          onChange={(e) => handleWeightChange(index, 'week1', e.target.value)}
                        />
                      </div>
                      
                      <div className="col-week2">
                        <input
                          type="text"
                          placeholder="kg"
                          value={exercise.weights.week2}
                          onChange={(e) => handleWeightChange(index, 'week2', e.target.value)}
                        />
                      </div>
                      
                      <div className="col-week3">
                        <input
                          type="text"
                          placeholder="kg"
                          value={exercise.weights.week3}
                          onChange={(e) => handleWeightChange(index, 'week3', e.target.value)}
                        />
                      </div>
                      
                      <div className="col-week4">
                        <input
                          type="text"
                          placeholder="kg"
                          value={exercise.weights.week4}
                          onChange={(e) => handleWeightChange(index, 'week4', e.target.value)}
                        />
                      </div>
                      
                      <div className="col-actions">
                        <div className="exercise-actions">
                          <button 
                            className="move-btn up"
                            onClick={() => handleMoveExercise(index, 'up')}
                            disabled={index === 0}
                          >
                            ↑
                          </button>
                          <button 
                            className="move-btn down"
                            onClick={() => handleMoveExercise(index, 'down')}
                            disabled={index === getCurrentDayExercises().length - 1}
                          >
                            ↓
                          </button>
                          <button 
                            className="remove-btn"
                            onClick={() => handleRemoveExercise(index)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="exercise-notes-section">
              {getCurrentDayExercises().map((exercise, index) => (
                <div key={index} className="exercise-note-item">
                  <h4>{index + 1}. {exercise.name} - Instructions</h4>
                  <textarea
                    value={exercise.notes}
                    onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                    placeholder="Add specific instructions for this exercise..."
                    rows="2"
                  ></textarea>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="routine-actions">
          <button className="save-routine-btn" onClick={handleSaveRoutine}>
            {isEditMode ? 'Update Routine' : 'Create Routine'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoutineBuilder;