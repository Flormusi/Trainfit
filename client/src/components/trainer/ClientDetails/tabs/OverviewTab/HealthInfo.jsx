import React from 'react';
import SummaryCard from '../../components/SummaryCard';
import { useClient } from '../../context/ClientContext';

const HealthInfo = () => {
  const { client } = useClient();

  return (
    <SummaryCard title="Información de Salud">
      <div className="health-info-content">
        {client?.healthInfo ? (
          <p>{client.healthInfo}</p>
        ) : (
          <p>N/A</p>
        )}
      </div>
    </SummaryCard>
  );
};

export default HealthInfo;