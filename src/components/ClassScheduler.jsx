import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainerApi } from '../services/api.ts';
import './ClassScheduler.css';

const ClassScheduler = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddClassForm, setShowAddClassForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedClass, setSelectedClass] = useState(null);
  const [newClass, setNewClass] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 60,
    clientIds: [],
    maxParticipants: 5,
    notes: '',
    type: 'individual'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsResponse, classesResponse] = await Promise.all([
          trainerApi.getClients(),
          trainerApi.getClasses()
        ]);
        
        setClients(clientsResponse.data);
        setClasses(classesResponse.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePrevMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setSelectedDate(newDate);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleClassClick = (classItem) => {
    setSelectedClass(classItem);
  };

  const handleNewClassChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'clientIds') {
      // Handle multi-select for clients
      const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
      setNewClass({
        ...newClass,
        clientIds: selectedOptions
      });
    } else {
      setNewClass({
        ...newClass,
        [name]: value
      });
    }
  };

  const handleSubmitClass = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Combine date and time
      const dateTime = new Date(`${newClass.date}T${newClass.time}`);
      
      const classData = {
        ...newClass,
        date: dateTime.toISOString(),
        clientIds: newClass.clientIds
      };
      
      const response = await trainerApi.createClass(classData);
      setClasses([...classes, response.data]);
      setShowAddClassForm(false);
      setNewClass({
        title: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        duration: 60,
        clientIds: [],
        maxParticipants: 5,
        notes: '',
        type: 'individual'
      });
    } catch (err) {
      console.error('Error creating class:', err);
      setError('Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta clase?')) {
      setLoading(true);
      
      try {
        await trainerApi.deleteClass(classId);
        setClasses(classes.filter(c => c.id !== classId));
        setSelectedClass(null);
      } catch (err) {
        console.error('Error deleting class:', err);
        setError('Failed to delete class');
      } finally {
        setLoading(false);
      }
    }
  };

  // Calendar generation functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push(date);
    }
    
    return days;
  };

  const getClassesForDate = (date) => {
    if (!date) return [];
    
    return classes.filter(classItem => {
      const classDate = new Date(classItem.date);
      return (
        classDate.getDate() === date.getDate() &&
        classDate.getMonth() === date.getMonth() &&
        classDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getClientNames = (clientIds) => {
    return clientIds.map(id => {
      const client = clients.find(c => c.id === id);
      return client ? client.name : 'Cliente desconocido';
    }).join(', ');
  };

  if (loading && clients.length === 0 && classes.length === 0) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="class-scheduler">
      <div className="scheduler-header">
        <button className="back-button" onClick={() => navigate('/trainer-dashboard')}>
          ← Volver
        </button>
        <h1>Programador de clases</h1>
        <button 
          className="add-class-btn"
          onClick={() => setShowAddClassForm(true)}
        >
          + Nueva clase
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="scheduler-container">
        <div className="calendar-section">
          <div className="calendar-header">
            <button onClick={handlePrevMonth}>&lt;</button>
            <h2>
              {selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={handleNextMonth}>&gt;</button>
          </div>
          
          <div className="calendar-grid">
            <div className="calendar-day-header">Dom</div>
            <div className="calendar-day-header">Lun</div>
            <div className="calendar-day-header">Mar</div>
            <div className="calendar-day-header">Mié</div>
            <div className="calendar-day-header">Jue</div>
            <div className="calendar-day-header">Vie</div>
            <div className="calendar-day-header">Sáb</div>
            
            {generateCalendarDays().map((day, index) => (
              <div 
                key={index} 
                className={`calendar-day ${!day ? 'empty-day' : ''} ${
                  day && day.getDate() === selectedDate.getDate() && 
                  day.getMonth() === selectedDate.getMonth() ? 'selected-day' : ''
                }`}
                onClick={() => day && handleDateClick(day)}
              >
                {day && (
                  <>
                    <div className="day-number">{day.getDate()}</div>
                    {getClassesForDate(day).length > 0 && (
                      <div className="day-event-indicator">
                        {getClassesForDate(day).length}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="schedule-section">
          <h2>{formatDate(selectedDate)}</h2>
          
          <div className="day-schedule">
            {getClassesForDate(selectedDate).length === 0 ? (
              <p className="no-classes">No hay clases programadas para este día</p>
            ) : (
              <div className="classes-list">
                {getClassesForDate(selectedDate)
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((classItem, index) => (
                    <div 
                      key={index} 
                      className={`class-item ${selectedClass && selectedClass.id === classItem.id ? 'selected' : ''}`}
                      onClick={() => handleClassClick(classItem)}
                    >
                      <div className="class-time">{formatTime(classItem.date)}</div>
                      <div className="class-info">
                        <h3>{classItem.title}</h3>
                        <p className="class-type">
                          {classItem.type === 'individual' ? 'Individual' : 'Grupal'}
                        </p>
                        <p className="class-clients">
                          {classItem.clientIds.length} cliente(s)
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
        
        {selectedClass && (
          <div className="class-details-section">
            <div className="details-header">
              <h2>Detalles de la clase</h2>
              <button 
                className="close-details-btn"
                onClick={() => setSelectedClass(null)}
              >
                ✕
              </button>
            </div>
            
            <div className="class-details">
              <h3>{selectedClass.title}</h3>
              
              <div className="detail-item">
                <span className="detail-label">Fecha:</span>
                <span className="detail-value">
                  {new Date(selectedClass.date).toLocaleDateString('es-ES')}
                </span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Hora:</span>
                <span className="detail-value">{formatTime(selectedClass.date)}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Duración:</span>
                <span className="detail-value">{selectedClass.duration} minutos</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Tipo:</span>
                <span className="detail-value">
                  {selectedClass.type === 'individual' ? 'Individual' : 'Grupal'}
                </span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Clientes:</span>
                <span className="detail-value">
                  {getClientNames(selectedClass.clientIds)}
                </span>
              </div>
              
              {selectedClass.notes && (
                <div className="detail-item notes-item">
                  <span className="detail-label">Notas:</span>
                  <span className="detail-value">{selectedClass.notes}</span>
                </div>
              )}
              
              <div className="class-actions">
                <button className="edit-class-btn">Editar</button>
                <button 
                  className="delete-class-btn"
                  onClick={() => handleDeleteClass(selectedClass.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {showAddClassForm && (
        <div className="modal-overlay">
          <div className="add-class-modal">
            <div className="modal-header">
              <h2>Programar nueva clase</h2>
              <button 
                className="close-modal-btn"
                onClick={() => setShowAddClassForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmitClass}>
              <div className="form-group">
                <label htmlFor="title">Título de la clase</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newClass.title}
                  onChange={handleNewClassChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Fecha</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={newClass.date}
                    onChange={handleNewClassChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="time">Hora</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={newClass.time}
                    onChange={handleNewClassChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="duration">Duración (minutos)</label>
                  <input
                    type="number"
                    id="duration"
                    name="duration"
                    value={newClass.duration}
                    onChange={handleNewClassChange}
                    min="15"
                    step="15"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="type">Tipo de clase</label>
                  <select
                    id="type"
                    name="type"
                    value={newClass.type}
                    onChange={handleNewClassChange}
                  >
                    <option value="individual">Individual</option>
                    <option value="group">Grupal</option>
                  </select>
                </div>
              </div>
              
              {newClass.type === 'group' && (
                <div className="form-group">
                  <label htmlFor="maxParticipants">Máximo de participantes</label>
                  <input
                    type="number"
                    id="maxParticipants"
                    name="maxParticipants"
                    value={newClass.maxParticipants}
                    onChange={handleNewClassChange}
                    min="2"
                    required
                  />
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="clientIds">Clientes</label>
                <select
                  id="clientIds"
                  name="clientIds"
                  multiple
                  value={newClass.clientIds}
                  onChange={handleNewClassChange}
                  required
                  size={Math.min(5, clients.length)}
                >
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                <small className="form-help">
                  Mantén presionado Ctrl (o Cmd en Mac) para seleccionar múltiples clientes
                </small>
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notas</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={newClass.notes}
                  onChange={handleNewClassChange}
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowAddClassForm(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar clase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassScheduler;