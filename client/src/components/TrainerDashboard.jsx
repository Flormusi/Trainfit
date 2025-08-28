import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { trainerApi } from '../services/api.ts';
import './TrainerDashboard.css';

const TrainerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    activeClients: 0,
    overduePayments: 0,
    unassignedRoutines: 0,
    clients: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch trainer dashboard data
    const fetchTrainerData = async () => {
      try {
        const response = await trainerApi.getDashboardData();
        setDashboardData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trainer data:', error);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchTrainerData();
  }, []);

  const handleSendPaymentReminder = async (clientId) => {
    try {
      await trainerApi.sendPaymentReminder(clientId);
      // Refresh dashboard data
      const response = await trainerApi.getDashboardData();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error sending payment reminder:', error);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="trainer-dashboard">
      <header className="dashboard-header">
        <h1>Hola, Maga</h1>
      </header>

      <section className="summary-section">
        <h2>Resumen general</h2>
        <div className="summary-card">
          <div className="summary-item">
            <p>Alumnos activos: {dashboardData.activeClients}</p>
            <p>Cuotas vencidas: {dashboardData.overduePayments}</p>
            <p>Rutinas sin asignar: {dashboardData.unassignedRoutines}</p>
          </div>
        </div>
      </section>

      <section className="quick-actions">
        <h2>Acciones rápidas</h2>
        <div className="actions-container">
          <Link to="/add-client" className="action-card">
            <div className="action-icon add-icon">+</div>
            <p>Agregar alumno</p>
          </Link>
          
          <Link to="/payment-reminders" className="action-card">
            <div className="action-icon reminder-icon">📊</div>
            <p>Recordatorio de cuota</p>
          </Link>
          
          <Link to="/create-routine" className="action-card">
            <div className="action-icon routine-icon">+</div>
            <p>Crear nueva rutina</p>
          </Link>
        </div>
      </section>

      <section className="clients-list">
        <h2>Lista de alumnos</h2>
        <div className="clients-container">
          {dashboardData.clients.map(client => (
            <div key={client.id} className="client-card">
              <h3>{client.name}</h3>
              <div className={`payment-status ${client.paymentStatus}`}>
                {client.paymentStatus === 'paid' ? (
                  <>
                    <span className="status-icon">✓</span>
                    <span>Cuota al día</span>
                  </>
                ) : (
                  <>
                    <span className="status-icon">✗</span>
                    <span>Cuota vencida</span>
                    <button 
                      className="send-reminder-btn"
                      onClick={() => handleSendPaymentReminder(client.id)}
                    >
                      Enviar recordatorio
                    </button>
                  </>
                )}
              </div>
              <p>Objetivo: {client.goal}</p>
              <p>Rutina: {client.routineName}</p>
              <Link to={`/client/${client.id}/progress`} className="view-progress-btn">
                Ver progreso
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="statistics-section">
        <h2>Estadísticas</h2>
        <div className="statistics-card">
          <p>Próximamente: gráficos de progreso y estadísticas de entrenamiento</p>
        </div>
      </section>
    </div>
  );
};

export default TrainerDashboard;