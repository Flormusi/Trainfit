import React from 'react';
import { Link } from 'react-router-dom';
import './MonthlyRoutine.css';

const MonthlyRoutine = ({ routine }) => {
  if (!routine) return <div className="no-routine">No routine assigned</div>;
  
  const startDate = new Date(routine.createdAt);
  const formattedDate = `${startDate.getDate()} de ${getMonthName(startDate.getMonth())}`;
  
  return (
    <div className="monthly-routine">
      <h2>Tu rutina del mes</h2>
      <div className="routine-card">
        <h3>{routine.name}</h3>
        <p className="routine-duration">{routine.duration || '4 semanas'} {routine.goal}</p>
        <p className="routine-start">Inicio: {formattedDate}</p>
        <Link to={`/routine/${routine.id}`} className="view-details">
          <span className="arrow-icon">→</span>
        </Link>
      </div>
    </div>
  );
};

function getMonthName(month) {
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  return months[month];
}

export default MonthlyRoutine;