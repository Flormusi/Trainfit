import React from 'react';
import { Link } from 'react-router-dom';
import SummaryCard from '../../components/SummaryCard';
import { useClient } from '../../context/ClientContext';
import { useParams } from 'react-router-dom';

const CurrentRoutine = () => {
  const { client } = useClient();
  const { clientId } = useParams();
  
  const currentRoutine = client?.currentRoutine || client?.routines?.[0];

  return (
    <SummaryCard title="Rutina actual">
      {currentRoutine ? (
        <div className="current-plan">
          <div>
            <div className="plan-name">{currentRoutine.name}</div>
            <div className="plan-details">
              <span>Semana {currentRoutine.currentWeek || '1'}/{currentRoutine.totalWeeks || '8'}</span>
            </div>
          </div>
          <Link 
            to={`/trainer/clients/${clientId}`} 
            className="view-progress"
            onClick={() => {
              console.log('🔥 BOTÓN VER PROGRESO CLICKEADO!');
              console.log('🚀 Navegando desde:', window.location.pathname);
              console.log('🎯 Navegando hacia:', `/trainer/clients/${clientId}`);
            }}
          >
            Ver progreso
          </Link>
        </div>
      ) : (
        <p>No hay rutina asignada actualmente.</p>
      )}
    </SummaryCard>
  );
};

export default CurrentRoutine;