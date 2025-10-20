import React from 'react';
import SummaryCard from '../../components/SummaryCard';
import { useClient } from '../../context/ClientContext';

const RecentActivity = () => {
  const { client } = useClient();

  return (
    <SummaryCard title="Actividad Reciente">
      <div className="activity-content">
        {client?.recentActivity ? (
          <p className="activity-description">{client.recentActivity}</p>
        ) : (
          <p className="activity-description">No hay actividad reciente registrada.</p>
        )}
      </div>
    </SummaryCard>
  );
};

export default RecentActivity;