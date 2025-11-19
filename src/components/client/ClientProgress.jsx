import React, { useState, useEffect } from 'react';
import { clientApi } from '../../services/api.ts';
import { 
  Line, 
  Bar,
  Radar
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './ClientProgress.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ClientProgress = () => {
  const [progressData, setProgressData] = useState(null);
  const [activeMetric, setActiveMetric] = useState('weight');
  const [timeRange, setTimeRange] = useState('3m'); // 1m, 3m, 6m, 1y, all
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        setLoading(true);
        const response = await clientApi.getClientProgress(timeRange);
        setProgressData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching progress data:', err);
        setError('Failed to load progress data. Please try again later.');
        setLoading(false);
      }
    };

    fetchProgressData();
  }, [timeRange]);

  const handleMetricChange = (metric) => {
    setActiveMetric(metric);
  };

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  const getChartData = () => {
    if (!progressData || !progressData.metrics || !progressData.metrics[activeMetric]) {
      return null;
    }

    const metricData = progressData.metrics[activeMetric];
    
    return {
      labels: metricData.dates,
      datasets: [
        {
          label: getMetricLabel(activeMetric),
          data: metricData.values,
          borderColor: '#D62828',
          backgroundColor: 'rgba(214, 40, 40, 0.12)',
          tension: 0.4,
          fill: true
        }
      ]
    };
  };

  const getWorkoutData = () => {
    if (!progressData || !progressData.workouts) {
      return null;
    }
    
    return {
      labels: progressData.workouts.months,
      datasets: [
        {
          label: 'Workouts Completed',
          data: progressData.workouts.counts,
          backgroundColor: '#D62828',
          borderRadius: 6
        }
      ]
    };
  };

  const getStrengthData = () => {
    if (!progressData || !progressData.strength) {
      return null;
    }
    
    return {
      labels: progressData.strength.categories,
      datasets: [
        {
          label: 'Current Strength',
          data: progressData.strength.values,
          backgroundColor: 'rgba(214, 40, 40, 0.7)',
          borderColor: '#D62828',
          pointBackgroundColor: '#D62828',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#D62828'
        }
      ]
    };
  };

  const getMetricLabel = (metric) => {
    const labels = {
      weight: 'Weight (kg)',
      bodyFat: 'Body Fat (%)',
      muscleMass: 'Muscle Mass (kg)',
      bmi: 'BMI',
      waist: 'Waist (cm)',
      chest: 'Chest (cm)',
      arms: 'Arms (cm)',
      legs: 'Legs (cm)'
    };
    
    return labels[metric] || metric;
  };

  const getMetricUnit = (metric) => {
    const units = {
      weight: 'kg',
      bodyFat: '%',
      muscleMass: 'kg',
      bmi: '',
      waist: 'cm',
      chest: 'cm',
      arms: 'cm',
      legs: 'cm'
    };
    
    return units[metric] || '';
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
        text: `${getMetricLabel(activeMetric)} Progress`,
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

  const barChartOptions = {
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
        text: 'Monthly Workout Frequency',
        color: '#fff'
      },
    },
    scales: {
      x: {
        grid: {
          display: false
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
          color: '#ddd',
          stepSize: 1
        }
      }
    }
  };

  const radarChartOptions = {
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
        text: 'Strength Profile',
        color: '#fff'
      },
    },
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.2)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.2)'
        },
        pointLabels: {
          color: '#ddd'
        },
        ticks: {
          color: '#ddd',
          backdropColor: 'transparent'
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
    <div className="client-progress">
      <div className="progress-header">
        <h1>My Progress</h1>
        <div className="time-range-selector">
          <select value={timeRange} onChange={handleTimeRangeChange}>
            <option value="1m">Last Month</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="metrics-summary">
        {progressData?.currentMetrics && Object.entries(progressData.currentMetrics).map(([key, value]) => (
          <div 
            key={key} 
            className={`metric-card ${activeMetric === key ? 'active' : ''}`}
            onClick={() => handleMetricChange(key)}
          >
            <span className="metric-value">
              {value}{getMetricUnit(key)}
            </span>
            <span className="metric-label">{getMetricLabel(key)}</span>
            {progressData.metricChanges && progressData.metricChanges[key] !== 0 && (
              <span className={`metric-change ${progressData.metricChanges[key] < 0 ? 'decrease' : 'increase'}`}>
                {progressData.metricChanges[key] > 0 ? '+' : ''}
                {progressData.metricChanges[key]}{getMetricUnit(key)}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="chart-container">
        {getChartData() ? (
          <Line data={getChartData()} options={chartOptions} />
        ) : (
          <div className="no-data-message">
            <p>No data available for the selected metric and time range.</p>
          </div>
        )}
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-wrapper">
            {getWorkoutData() ? (
              <Bar data={getWorkoutData()} options={barChartOptions} />
            ) : (
              <div className="no-data-message">
                <p>No workout data available for the selected time range.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="chart-card">
          <div className="chart-wrapper">
            {getStrengthData() ? (
              <Radar data={getStrengthData()} options={radarChartOptions} />
            ) : (
              <div className="no-data-message">
                <p>No strength data available for the selected time range.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="progress-stats">
        <h2>Workout Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{progressData?.stats?.totalWorkouts || 0}</span>
            <span className="stat-label">Total Workouts</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{progressData?.stats?.totalSets || 0}</span>
            <span className="stat-label">Total Sets</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{progressData?.stats?.totalMinutes || 0}</span>
            <span className="stat-label">Total Minutes</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{progressData?.stats?.consistency || 0}%</span>
            <span className="stat-label">Consistency</span>
          </div>
        </div>
      </div>

      <div className="recent-records">
        <h2>Recent Personal Records</h2>
        {progressData?.personalRecords && progressData.personalRecords.length > 0 ? (
          <div className="records-list">
            {progressData.personalRecords.map((record, index) => (
              <div key={index} className="record-item">
                <div className="record-exercise">{record.exercise}</div>
                <div className="record-details">
                  <span className="record-value">{record.value} {record.unit}</span>
                  <span className="record-date">{new Date(record.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No personal records yet. Keep working out to set new records!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProgress;