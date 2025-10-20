import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trainerApi } from '../../services/api.ts';
import './TrainerDashboard.css';

const TrainerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [clients, setClients] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard summary data
        const dashboardResponse = await trainerApi.getDashboardData();
        setDashboardData(dashboardResponse.data);
        
        // Fetch clients
        const clientsResponse = await trainerApi.getClients();
        setClients(clientsResponse.data);
        
        // Fetch upcoming classes
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        const classesResponse = await trainerApi.getClasses(
          today.toISOString().split('T')[0],
          nextWeek.toISOString().split('T')[0]
        );
        setUpcomingClasses(classesResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading-container">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="trainer-dashboard">
      <header className="dashboard-header">
        <h1>Trainer Dashboard</h1>
        <div className="header-actions">
          <Link to="/trainer/profile" className="profile-link">
            My Profile
          </Link>
        </div>
      </header>

      <div className="dashboard-summary">
        <div className="summary-card">
          <span className="summary-value">{dashboardData?.clientCount || 0}</span>
          <span className="summary-label">Alumnos Activos</span>
          <div style={{fontSize: '16px', color: '#ffffff', backgroundColor: '#ff0000', padding: '10px', marginTop: '10px', borderRadius: '5px', border: '2px solid #ffffff'}}>
            🔍 DEBUG: {dashboardData ? JSON.stringify(dashboardData) : 'dashboardData is null/undefined'}
          </div>
          <div style={{fontSize: '16px', color: '#000000', backgroundColor: '#00ff00', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '2px solid #000000'}}>
            ⚡ STATUS: Loading={loading ? 'true' : 'false'} | Error={error || 'none'}
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-value">{dashboardData?.routineCount || 0}</span>
          <span className="summary-label">Rutinas Creadas</span>
        </div>
        <div className="summary-card">
          <span className="summary-value">{dashboardData?.exerciseCount || 0}</span>
          <span className="summary-label">Ejercicios</span>
        </div>
        <div className="summary-card">
          <span className="summary-value">1</span>
          <span className="summary-label">Rutinas sin Asignar</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-section clients-section">
          <div className="section-header">
            <h2>Clientes Recientes</h2>
            <Link to="/trainer/clients" className="view-all-link">Ver Todos</Link>
          </div>
          
          {clients.length === 0 ? (
            <div className="empty-state">
              <p>Aún no tienes clientes registrados.</p>
              <Link to="/trainer/clients/add" className="add-client-btn">
                Agregar Nuevo Cliente
              </Link>
            </div>
          ) : (
            <div className="clients-list">
              {clients.slice(0, 5).map(client => (
                <div key={client.id} className="client-item">
                  <div className="client-avatar">
                    {client.profileImage ? (
                      <img src={client.profileImage} alt={client.name} />
                    ) : (
                      <div className="avatar-placeholder">
                        {client.name ? client.name.charAt(0) : 'C'}
                      </div>
                    )}
                  </div>
                  <div className="client-info">
                    <h3>{client.name}</h3>
                    <div className="client-meta">
                      <span className="client-membership">
                        {client.clientProfile?.trainingDaysPerWeek ? 
                          `${client.clientProfile.trainingDaysPerWeek} días/semana` : 
                          'Plan básico'
                        }
                      </span>
                      <span className="client-status">Activo</span>
                    </div>
                    <p className="client-last-activity">
                      Registrado: {new Date(client.createdAt).toLocaleDateString()}
                    </p>
                    {client.clientProfile?.goals && (
                      <p className="client-goals">
                        Objetivos: {client.clientProfile.goals.slice(0, 2).join(', ')}
                        {client.clientProfile.goals.length > 2 && '...'}
                      </p>
                    )}
                  </div>
                  <div className="client-actions">
                    <Link to={`/trainer/clients/${client.id}`} className="view-client-btn">
                      Ver
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section schedule-section">
          <div className="section-header">
            <h2>Upcoming Classes</h2>
            <Link to="/trainer/schedule" className="view-all-link">View Schedule</Link>
          </div>
          
          {upcomingClasses.length === 0 ? (
            <div className="empty-state">
              <p>You don't have any upcoming classes.</p>
              <Link to="/trainer/classes/create" className="create-class-btn">
                Create New Class
              </Link>
            </div>
          ) : (
            <div className="classes-list">
              {upcomingClasses.slice(0, 3).map(classItem => (
                <div key={classItem.id} className="class-item">
                  <div className="class-time">
                    <span className="day">{new Date(classItem.startTime).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="date">{new Date(classItem.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span className="time">
                      {new Date(classItem.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="class-info">
                    <h3>{classItem.name}</h3>
                    <p className="class-details">
                      <span>{classItem.attendees}/{classItem.capacity} attendees</span>
                      <span>{classItem.duration} min</span>
                    </p>
                  </div>
                  <div className="class-actions">
                    <Link to={`/trainer/classes/${classItem.id}`} className="view-class-btn">
                      Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section analytics-section">
          <div className="section-header">
            <h2>Analytics Overview</h2>
            <Link to="/trainer/analytics" className="view-all-link">View Details</Link>
          </div>
          
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Client Retention</h3>
              <div className="analytics-value">
                {dashboardData?.analytics?.retentionRate || 0}%
                <span className={`trend ${(dashboardData?.analytics?.retentionTrend || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {(dashboardData?.analytics?.retentionTrend || 0) >= 0 ? '↑' : '↓'} 
                  {Math.abs(dashboardData?.analytics?.retentionTrend || 0)}%
                </span>
              </div>
            </div>
            <div className="analytics-card">
              <h3>Class Attendance</h3>
              <div className="analytics-value">
                {dashboardData?.analytics?.attendanceRate || 0}%
                <span className={`trend ${(dashboardData?.analytics?.attendanceTrend || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {(dashboardData?.analytics?.attendanceTrend || 0) >= 0 ? '↑' : '↓'} 
                  {Math.abs(dashboardData?.analytics?.attendanceTrend || 0)}%
                </span>
              </div>
            </div>
            <div className="analytics-card">
              <h3>New Clients</h3>
              <div className="analytics-value">
                {dashboardData?.analytics?.newClients || 0}
                <span className={`trend ${(dashboardData?.analytics?.newClientsTrend || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {(dashboardData?.analytics?.newClientsTrend || 0) >= 0 ? '↑' : '↓'} 
                  {Math.abs(dashboardData?.analytics?.newClientsTrend || 0)}
                </span>
              </div>
            </div>
            <div className="analytics-card">
              <h3>Revenue Growth</h3>
              <div className="analytics-value">
                {dashboardData?.analytics?.revenueGrowth || 0}%
                <span className={`trend ${(dashboardData?.analytics?.revenueTrend || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {(dashboardData?.analytics?.revenueTrend || 0) >= 0 ? '↑' : '↓'} 
                  {Math.abs(dashboardData?.analytics?.revenueTrend || 0)}%
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-section actions-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          
          <div className="actions-grid">
            <Link to="/trainer/clients/add" className="action-card">
              <div className="action-icon">👤</div>
              <h3>Add New Client</h3>
            </Link>
            <Link to="/trainer/classes/create" className="action-card">
              <div className="action-icon">📅</div>
              <h3>Create Class</h3>
            </Link>
            <Link to="/trainer/routines/create" className="action-card">
              <div className="action-icon">🏋️‍♂️</div>
              <h3>Create Routine</h3>
            </Link>
            <Link to="/trainer/exercises" className="action-card">
              <div className="action-icon">💪</div>
              <h3>Exercise Library</h3>
            </Link>
            <Link to="/trainer/nutrition-plans" className="action-card">
              <div className="action-icon">🥗</div>
              <h3>Nutrition Plans</h3>
            </Link>
            <Link to="/trainer/payments" className="action-card">
              <div className="action-icon">💰</div>
              <h3>Payment Reminders</h3>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TrainerDashboard;// Cache buster: Mon Sep 22 17:41:18 -03 2025
