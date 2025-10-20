import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trainerApi } from '../services/api';
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
import './ClientProgress.css';

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

const ClientProgress = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [clientData, setClientData] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchClientProgress = async () => {
      try {
        const [clientResponse, progressResponse] = await Promise.all([
          trainerApi.getClientDetails(clientId),
          trainerApi.getClientProgress(clientId)
        ]);
        
        setClientData(clientResponse.data);
        setProgressData(progressResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching client progress:', err);
        setError('Failed to load client progress data');
        setLoading(false);
      }
    };

    fetchClientProgress();
  }, [clientId]);

  const prepareChartData = () => {
    if (!progressData.length) return null;
    
    // Group progress by exercise
    const exerciseGroups = {};
    progressData.forEach(record => {
      if (!exerciseGroups[record.exerciseId]) {
        exerciseGroups[record.exerciseId] = [];
      }
      exerciseGroups[record.exerciseId].push(record);
    });
    
    // Sort by week for each exercise
    Object.keys(exerciseGroups).forEach(exerciseId => {
      exerciseGroups[exerciseId].sort((a, b) => a.week - b.week);
    });
    
    // Prepare chart data for the first exercise (as an example)
    const exerciseId = Object.keys(exerciseGroups)[0];
    if (!exerciseId) return null;
    
    const exerciseData = exerciseGroups[exerciseId];
    const exerciseName = exerciseData[0]?.exerciseName || 'Exercise';
    
    return {
      labels: exerciseData.map(record => `Week ${record.week}`),
      datasets: [
        {
          label: exerciseName,
          data: exerciseData.map(record => record.weight),
          borderColor: '#ff3b30',
          backgroundColor: 'rgba(255, 59, 48, 0.5)',
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weight Progress Over Time',
      },
    },
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!clientData) return <div className="no-data">Client not found</div>;

  const chartData = prepareChartData();

  return (
    <div className="client-progress-container">
      <div className="progress-header">
        <button className="back-button" onClick={() => navigate('/trainer/clients')}>
          ← Volver a Clientes
        </button>
        <h1>{clientData.name}'s Progress</h1>
      </div>

      <div className="client-stats">
        <div className="stat-card">
          <h3>Peso inicial</h3>
          <p>{clientData.initialWeight} kg</p>
        </div>
        <div className="stat-card">
          <h3>Peso actual</h3>
          <p>{clientData.currentWeight || clientData.initialWeight} kg</p>
        </div>
        <div className="stat-card">
          <h3>Cambio</h3>
          <p className={clientData.weightChange > 0 ? 'positive' : 'negative'}>
            {clientData.weightChange || 0} kg
          </p>
        </div>
        <div className="stat-card">
          <h3>Asistencia</h3>
          <p>{clientData.attendanceRate || 0}%</p>
        </div>
      </div>

      <div className="progress-tabs">
        <button 
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Resumen
        </button>
        <button 
          className={`tab-button ${activeTab === 'weights' ? 'active' : ''}`}
          onClick={() => setActiveTab('weights')}
        >
          Pesos
        </button>
        <button 
          className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          Asistencia
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="progress-summary">
              <h2>Resumen de progreso</h2>
              <p>Objetivo: {clientData.goal || 'No definido'}</p>
              <p>Semanas completadas: {clientData.completedWeeks || 0}</p>
              <p>Rutina actual: {clientData.currentRoutine || 'No asignada'}</p>
            </div>
            
            <div className="notes-section">
              <h2>Notas</h2>
              <textarea 
                placeholder="Agregar notas sobre el progreso del alumno..."
                className="trainer-notes"
              ></textarea>
              <button className="save-notes-btn">Guardar notas</button>
            </div>
          </div>
        )}

        {activeTab === 'weights' && (
          <div className="weights-tab">
            <h2>Progreso de pesos</h2>
            {chartData ? (
              <div className="chart-container">
                <Line options={chartOptions} data={chartData} />
              </div>
            ) : (
              <p className="no-data-message">No hay datos de progreso disponibles</p>
            )}
            
            <div className="weight-records">
              <h3>Registros recientes</h3>
              <table className="records-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Ejercicio</th>
                    <th>Peso</th>
                    <th>Semana</th>
                  </tr>
                </thead>
                <tbody>
                  {progressData.slice(0, 5).map((record, index) => (
                    <tr key={index}>
                      <td>{new Date(record.createdAt).toLocaleDateString()}</td>
                      <td>{record.exerciseName || `Exercise ${record.exerciseId}`}</td>
                      <td>{record.weight} kg</td>
                      <td>{record.week}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="attendance-tab">
            <h2>Registro de asistencia</h2>
            <div className="attendance-calendar">
              {/* Calendar visualization would go here */}
              <p className="coming-soon">Visualización de calendario próximamente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProgress;