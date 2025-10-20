import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { trainerApi } from '../../services/api';
import './RoutineAssignment.css';

const RoutineAssignment = () => {
  const [clients, setClients] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedRoutine, setSelectedRoutine] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch clients
        const clientsResponse = await trainerApi.getClients();
        console.log('Respuesta de getClients:', clientsResponse);
        
        // Verificar la estructura de la respuesta y extraer los clientes
        if (clientsResponse && clientsResponse.data && clientsResponse.data.clients) {
          // Nueva estructura: { success, message, data: { clients: [...] } }
          setClients(clientsResponse.data.clients);
        } else if (clientsResponse && Array.isArray(clientsResponse.data)) {
          // Estructura antigua: array directo
          setClients(clientsResponse.data);
        } else {
          console.error('Estructura de respuesta inesperada en getClients:', clientsResponse);
          setClients([]);
        }
        
        // Fetch routines
        const routinesResponse = await trainerApi.getRoutines();
        console.log('Respuesta de getRoutines:', routinesResponse);
        
        // Verificar la estructura de la respuesta y extraer las rutinas
        if (routinesResponse && Array.isArray(routinesResponse.data)) {
          // La respuesta ya es un array de rutinas
          setRoutines(routinesResponse.data);
        } else if (routinesResponse && routinesResponse.data && routinesResponse.data.routines) {
          // Nueva estructura: { success, message, data: { routines: [...] } }
          setRoutines(routinesResponse.data.routines);
        } else {
          console.error('Estructura de respuesta inesperada en getRoutines:', routinesResponse);
          setRoutines([]);
        }
        
        // Fetch current assignments
        await fetchAssignments(currentMonth);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchAssignments = async (date) => {
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // JavaScript months are 0-indexed
      
      const response = await trainerApi.getRoutineAssignments(year, month);
      setAssignments(response.data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      setError('Failed to load assignments. Please try again later.');
    }
  };

  const handlePreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
    fetchAssignments(prevMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
    fetchAssignments(nextMonth);
  };

  const handleAssignRoutine = async () => {
    if (!selectedClient || !selectedRoutine || !startDate || !endDate) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      const assignmentData = {
        clientId: selectedClient,
        routineId: selectedRoutine,
        startDate,
        endDate
      };
      
      const response = await trainerApi.assignRoutine(assignmentData);
      
      // Reset form
      setSelectedClient('');
      setSelectedRoutine('');
      setStartDate('');
      setEndDate('');
      
      // Refresh assignments
      await fetchAssignments(currentMonth);
      
      // Obtener información del cliente y rutina para el mensaje
      const client = clients.find(c => c.id === selectedClient);
      const routine = routines.find(r => r.id === selectedRoutine);
      
      alert(`¡Rutina asignada exitosamente!\n\n` +
            `Cliente: ${client?.firstName} ${client?.lastName}\n` +
            `Rutina: ${routine?.name}\n\n` +
            `✅ Notificación enviada al dashboard del cliente\n` +
            `📧 Notificación por email programada\n\n` +
            `El cliente podrá ver su nueva rutina en su dashboard.`);
    } catch (err) {
      console.error('Error assigning routine:', err);
      alert('Error al asignar la rutina. Por favor intenta nuevamente.');
    }
  };

  const handleRemoveAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to remove this assignment?')) {
      try {
        await trainerApi.removeRoutineAssignment(assignmentId);
        
        // Refresh assignments
        await fetchAssignments(currentMonth);
        
        alert('Assignment removed successfully!');
      } catch (err) {
        console.error('Error removing assignment:', err);
        alert('Failed to remove assignment. Please try again.');
      }
    }
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid date';
    }
  };

  const getClientById = (clientId) => {
    return clients.find(client => client.id === clientId);
  };

  const getRoutineById = (routineId) => {
    return routines.find(routine => routine.id === routineId);
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="routine-assignment">
      <div className="assignment-header">
        <h1>Routine Assignments</h1>
        <Link to="/trainer/routines" className="create-routine-btn">
          Create New Routine
        </Link>
      </div>

      <div className="assignment-grid">
        <div className="new-assignment">
          <h2>Assign Monthly Routine</h2>
          <div className="assignment-form">
            <div className="form-group">
              <label htmlFor="client">Client</label>
              <select
                id="client"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="routine">Routine</label>
              <select
                id="routine"
                value={selectedRoutine}
                onChange={(e) => setSelectedRoutine(e.target.value)}
              >
                <option value="">Select a routine</option>
                {routines.map(routine => (
                  <option key={routine.id} value={routine.id}>
                    {routine.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            
            <button className="assign-btn" onClick={handleAssignRoutine}>
              Assign Routine
            </button>
          </div>
        </div>

        <div className="current-assignments">
          <div className="month-navigation">
            <button className="month-nav-btn" onClick={handlePreviousMonth}>
              &lt; Previous
            </button>
            <h2>{formatMonthYear(currentMonth)}</h2>
            <button className="month-nav-btn" onClick={handleNextMonth}>
              Next &gt;
            </button>
          </div>
          
          {assignments.length === 0 ? (
            <div className="empty-assignments">
              <p>No routines assigned for this month.</p>
            </div>
          ) : (
            <div className="assignments-list">
              {assignments.map(assignment => {
                // Usar los datos incluidos en la respuesta del backend
                const client = assignment.client || getClientById(assignment.clientId);
                const routine = assignment.routine || getRoutineById(assignment.routineId);
                
                // Extraer nombre y apellido del cliente
                let firstName = '', lastName = '';
                if (client) {
                  if (client.name) {
                    const nameParts = client.name.split(' ');
                    firstName = nameParts[0] || '';
                    lastName = nameParts.slice(1).join(' ') || '';
                  } else if (client.firstName && client.lastName) {
                    firstName = client.firstName;
                    lastName = client.lastName;
                  } else if (client.clientProfile) {
                    firstName = client.clientProfile.firstName || '';
                    lastName = client.clientProfile.lastName || '';
                  }
                }
                
                return (
                  <div key={assignment.id} className="assignment-card">
                    <div className="assignment-client">
                      <div className="client-avatar">
                        {firstName.charAt(0)}{lastName.charAt(0)}
                      </div>
                      <div className="client-info">
                        <h3>{firstName} {lastName}</h3>
                        <span className="client-email">{client?.email}</span>
                      </div>
                    </div>
                    
                    <div className="assignment-details">
                      <div className="routine-info">
                        <h4>{routine?.name}</h4>
                        <p>{routine?.description}</p>
                      </div>
                      
                      <div className="assignment-dates">
                        <div className="date-item">
                          <span className="date-label">Start:</span>
                          <span className="date-value">{formatDate(assignment.startDate)}</span>
                        </div>
                        <div className="date-item">
                          <span className="date-label">End:</span>
                          <span className="date-value">{formatDate(assignment.endDate)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="assignment-actions">
                      <Link to={`/trainer/clients/${assignment.clientId}`} className="view-progress-btn">
                        View Progress
                      </Link>
                      <button 
                        className="remove-assignment-btn"
                        onClick={() => handleRemoveAssignment(assignment.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoutineAssignment;