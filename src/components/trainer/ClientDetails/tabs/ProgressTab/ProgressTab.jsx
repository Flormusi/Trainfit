import React, { useState } from 'react';
import { useClient } from '../../context/ClientContext';
import '../../styles/progress.css';

const ProgressTab = () => {
  const { client, generateProgressChartData } = useClient();
  const [activeMetric, setActiveMetric] = useState('weight');
  const [timeRange, setTimeRange] = useState('3months');
  
  // Datos de ejemplo para las gráficas
  const chartData = generateProgressChartData(activeMetric, timeRange);
  
  const metrics = [
    { id: 'weight', label: 'Peso' },
    { id: 'bodyFat', label: '% Grasa Corporal' },
    { id: 'muscle', label: 'Masa Muscular' },
    { id: 'attendance', label: 'Asistencia' },
    { id: 'performance', label: 'Rendimiento' }
  ];
  
  const timeRanges = [
    { id: '1month', label: '1 Mes' },
    { id: '3months', label: '3 Meses' },
    { id: '6months', label: '6 Meses' },
    { id: '1year', label: '1 Año' },
    { id: 'all', label: 'Todo' }
  ];

  return (
    <div className="progress-tab">
      <div className="progress-header">
        <h2>Progreso de {client?.firstName} {client?.lastName}</h2>
        <p className="progress-subtitle">Seguimiento de métricas y evolución</p>
      </div>
      
      <div className="metric-selector">
        {metrics.map(metric => (
          <button 
            key={metric.id}
            className={`metric-btn ${activeMetric === metric.id ? 'active' : ''}`}
            onClick={() => setActiveMetric(metric.id)}
          >
            {metric.label}
          </button>
        ))}
      </div>
      
      <div className="time-range-selector">
        {timeRanges.map(range => (
          <button 
            key={range.id}
            className={`range-btn ${timeRange === range.id ? 'active' : ''}`}
            onClick={() => setTimeRange(range.id)}
          >
            {range.label}
          </button>
        ))}
      </div>
      
      <div className="chart-container">
        {/* Aquí se renderizaría la gráfica con los datos de chartData */}
        <div className="chart-placeholder">
          <p>Gráfica de {metrics.find(m => m.id === activeMetric)?.label} - {timeRanges.find(r => r.id === timeRange)?.label}</p>
          <p className="chart-note">Implementar gráfica con biblioteca como Chart.js o Recharts</p>
        </div>
      </div>
      
      <div className="progress-stats">
        <div className="stat-card">
          <h3>Resumen</h3>
          <div className="stat-grid">
            <div className="stat-item">
              <span className="stat-label">Inicial</span>
              <span className="stat-value">{client?.initialMetrics?.[activeMetric] || 'N/A'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Actual</span>
              <span className="stat-value">{client?.currentMetrics?.[activeMetric] || 'N/A'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Cambio</span>
              <span className="stat-value change">
                {client?.metricChanges?.[activeMetric] 
                  ? (client.metricChanges[activeMetric] > 0 ? '+' : '') + client.metricChanges[activeMetric]
                  : 'N/A'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Meta</span>
              <span className="stat-value">{client?.goals?.[activeMetric] || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <h3>Historial de Mediciones</h3>
          <div className="measurement-history">
            {client?.measurements?.[activeMetric]?.slice(0, 5).map((measurement, index) => (
              <div key={index} className="measurement-item">
                <span className="measurement-date">{new Date(measurement.date).toLocaleDateString('es-ES')}</span>
                <span className="measurement-value">{measurement.value}</span>
              </div>
            )) || (
              <p className="no-data">No hay mediciones registradas</p>
            )}
          </div>
          <button className="add-measurement-btn">
            Agregar Medición
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressTab;