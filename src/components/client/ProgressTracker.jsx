import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clientApi } from '../../services/api.ts';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './ProgressTracker.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProgressTracker = () => {
  const { clientId } = useParams();
  const [progressData, setProgressData] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        
        // Fetch progress data
        const progressResponse = await clientApi.getProgress(clientId);
        setProgressData(progressResponse.data);
        
        // Fetch workout history
        const historyResponse = await clientApi.getWorkoutHistory(clientId);
        setWorkoutHistory(historyResponse.data);
        
        // Set the first exercise as selected by default if available
        if (progressResponse.data.exercises && progressResponse.data.exercises.length > 0) {
          setSelectedExercise(progressResponse.data.exercises[0].id);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError('Failed to load progress data. Please try again later.');
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [clientId]);

  const handleExerciseSelect = (exerciseId) => {
    setSelectedExercise(exerciseId);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const getChartData = () => {
    if (!progressData || !selectedExercise) return null;

    const exerciseData = progressData.exercises.find(ex => ex.id === selectedExercise);
    if (!exerciseData) return null;

    // Filter data based on selected time range
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Filter and format data for the chart
    const filteredData = exerciseData.history
      .filter(entry => new Date(entry.date) >= startDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      labels: filteredData.map(entry => new Date(entry.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Weight (kg)',
          data: filteredData.map(entry => entry.weight),
          borderColor: '#D62828',
          backgroundColor: 'rgba(214, 40, 40, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Reps',
          data: filteredData.map(entry => entry.reps),
          borderColor: '#34c759',
          backgroundColor: 'rgba(52, 199, 89, 0.1)',
          tension: 0.4,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ddd'
        }
      },
      title: {
        display: true,
        text: selectedExercise ? `Progress for ${progressData?.exercises.find(ex => ex.id === selectedExercise)?.name}` : 'Select an exercise',
        color: '#fff'
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ddd'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: '#ddd'
        }
      }
    }
  };

  if (loading) {
    return <div className="loading-container">Loading progress data...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="progress-tracker">
      <div className="progress-header">
        <Link to={`/client/${clientId}/dashboard`} className="back-link">
          ← Back to Dashboard
        </Link>
        <h1>Your Progress</h1>
        <p className="progress-subtitle">Track your improvement over time</p>
      </div>

      <div className="progress-summary">
        <div className="summary-card">
          <span className="summary-value">{progressData?.stats?.workoutsCompleted || 0}</span>
          <span className="summary-label">Workouts Completed</span>
        </div>
        <div className="summary-card">
          <span className="summary-value">{progressData?.stats?.totalVolume || 0}</span>
          <span className="summary-label">Total Volume (kg)</span>
        </div>
        <div className="summary-card">
          <span className="summary-value">{progressData?.stats?.streakDays || 0}</span>
          <span className="summary-label">Day Streak</span>
        </div>
        <div className="summary-card">
          <span className="summary-value">{progressData?.stats?.personalRecords || 0}</span>
          <span className="summary-label">Personal Records</span>
        </div>
      </div>

      <div className="progress-content">
        <div className="exercise-selector">
          <h2>Exercises</h2>
          <div className="exercise-list">
            {progressData?.exercises.map(exercise => (
              <div 
                key={exercise.id} 
                className={`exercise-item ${selectedExercise === exercise.id ? 'active' : ''}`}
                onClick={() => handleExerciseSelect(exercise.id)}
              >
                <h3>{exercise.name}</h3>
                <div className="exercise-stats">
                  <span className="stat">
                    <strong>Max Weight:</strong> {exercise.maxWeight} kg
                  </span>
                  <span className="stat">
                    <strong>Max Reps:</strong> {exercise.maxReps}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="progress-chart">
          <div className="chart-controls">
            <div className="time-range-selector">
              <button 
                className={`time-range-btn ${timeRange === 'week' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('week')}
              >
                Week
              </button>
              <button 
                className={`time-range-btn ${timeRange === 'month' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('month')}
              >
                Month
              </button>
              <button 
                className={`time-range-btn ${timeRange === 'year' ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange('year')}
              >
                Year
              </button>
            </div>
          </div>
          
          <div className="chart-container">
            {getChartData() ? (
              <Line data={getChartData()} options={chartOptions} />
            ) : (
              <div className="no-data-message">
                <p>No progress data available for the selected exercise and time range.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="workout-history">
        <h2>Recent Workouts</h2>
        {workoutHistory.length === 0 ? (
          <div className="empty-state">
            <p>You haven't recorded any workouts yet.</p>
            <Link to={`/client/${clientId}/routines`} className="start-workout-btn">
              Start a Workout
            </Link>
          </div>
        ) : (
          <div className="history-list">
            {workoutHistory.slice(0, 5).map(workout => (
              <div key={workout.id} className="history-item">
                <div className="history-date">
                  <span className="day">{new Date(workout.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className="date">{new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="history-details">
                  <h3>{workout.routineName}</h3>
                  <div className="history-stats">
                    <span className="stat">{workout.exercisesCompleted} exercises</span>
                    <span className="stat">{workout.totalVolume} kg total</span>
                    <span className="stat">{workout.duration} min</span>
                  </div>
                </div>
                <Link to={`/client/${clientId}/workout-log/${workout.id}`} className="view-details-btn">
                  Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracker;