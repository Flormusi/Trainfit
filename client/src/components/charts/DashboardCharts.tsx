import React from 'react';
import ProgressChart from './ProgressChart';
import './DashboardCharts.css';

const DashboardCharts: React.FC = () => {
  // Datos de ejemplo para progreso de peso de clientes
  const weightProgressData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Florencia M.',
        data: [68, 67.5, 67, 66.8, 66.2, 65.8],
        borderColor: '#ff3b30',
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Cliente 2',
        data: [75, 74.5, 74, 73.5, 73, 72.5],
        borderColor: '#ff9500',
        backgroundColor: 'rgba(255, 149, 0, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Datos de entrenamientos completados por mes
  const workoutCompletionData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Entrenamientos Completados',
        data: [12, 15, 18, 16, 20, 22],
        backgroundColor: 'rgba(255, 59, 48, 0.8)',
        borderColor: '#ff3b30',
      },
    ],
  };

  // Datos de nuevos clientes por mes
  const newClientsData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Nuevos Clientes',
        data: [2, 1, 3, 2, 4, 1],
        backgroundColor: 'rgba(255, 149, 0, 0.8)',
        borderColor: '#ff9500',
      },
    ],
  };

  return (
    <div className="dashboard-charts">
      <div className="charts-grid">
        <div className="chart-card">
          <ProgressChart
            type="line"
            title="Progreso de Peso - Clientes"
            data={weightProgressData}
          />
        </div>
        
        <div className="chart-card">
          <ProgressChart
            type="bar"
            title="Entrenamientos Completados"
            data={workoutCompletionData}
          />
        </div>
        
        <div className="chart-card">
          <ProgressChart
            type="bar"
            title="Nuevos Clientes por Mes"
            data={newClientsData}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;