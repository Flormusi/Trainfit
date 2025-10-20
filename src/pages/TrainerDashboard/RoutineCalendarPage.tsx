import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import RoutineCalendar from '../../components/RoutineCalendar';
import './RoutineCalendarPage.css';

const RoutineCalendarPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/trainer-dashboard');
  };

  return (
    <div className="routine-calendar-page">
      {/* Header */}
      <header className="calendar-page-header">
        <button 
          onClick={handleBackToDashboard}
          className="back-btn"
          title="Volver al Dashboard"
        >
          <ArrowLeftIcon className="back-icon" />
          Volver al Dashboard
        </button>
        
        <div className="page-title-section">
          <h1 className="page-title">
            <CalendarIcon className="title-icon" />
            Calendario de Rutinas
          </h1>
          <p className="page-description">
            Organiza y visualiza las rutinas programadas para tus clientes
          </p>
        </div>
      </header>

      {/* Calendar Content */}
      <section className="calendar-content">
        <RoutineCalendar 
          onEventClick={(event) => {
            // Aquí puedes manejar el clic en un evento del calendario
            console.log('Evento seleccionado:', event);
            // Por ejemplo, navegar a la página de detalles de la rutina
            // navigate(`/trainer/routines/${event.routineId}`);
          }}
        />
      </section>
    </div>
  );
};

export default RoutineCalendarPage;