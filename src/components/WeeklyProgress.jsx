import React from 'react';
import './WeeklyProgress.css';

const WeeklyProgress = ({ completedDays = [] }) => {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const today = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
  
  // Adjust to make Monday the first day
  const adjustedToday = today === 0 ? 6 : today - 1;
  
  return (
    <div className="weekly-progress">
      <h2>Semana actual</h2>
      <div className="days-container">
        {days.map((day, index) => (
          <div key={index} className="day-item">
            <div className="day-label">{day}</div>
            <div className={`day-status ${getDayStatus(index, adjustedToday, completedDays)}`}>
              {getDayIcon(index, adjustedToday, completedDays)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function getDayStatus(dayIndex, today, completedDays) {
  if (completedDays.includes(dayIndex)) return 'completed';
  if (dayIndex === today) return 'today';
  if (dayIndex < today) return 'missed';
  return 'upcoming';
}

function getDayIcon(dayIndex, today, completedDays) {
  if (completedDays.includes(dayIndex)) return '✓';
  if (dayIndex === today) return '⏱️';
  return '';
}

export default WeeklyProgress;