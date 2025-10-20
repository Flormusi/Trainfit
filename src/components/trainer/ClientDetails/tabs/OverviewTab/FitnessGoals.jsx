import React from 'react';
import SummaryCard from '../../components/SummaryCard';
import { useClient } from '../../context/ClientContext';

const FitnessGoals = () => {
  const { client } = useClient();
  
  // Convertir los objetivos en un array si existen, o usar un valor predeterminado
  const goals = client?.fitnessGoals 
    ? (Array.isArray(client.fitnessGoals) ? client.fitnessGoals : [client.fitnessGoals]) 
    : ['Perder grasa corporal'];

  return (
    <SummaryCard title="Objetivos de fitness">
      <ul className="goals-list">
        {goals.map((goal, index) => (
          <li key={index} className="goal-item">{goal}</li>
        ))}
      </ul>
    </SummaryCard>
  );
};

export default FitnessGoals;