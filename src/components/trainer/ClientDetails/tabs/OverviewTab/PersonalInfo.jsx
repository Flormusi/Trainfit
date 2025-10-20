import React from 'react';
import SummaryCard from '../../components/SummaryCard';
import InfoGrid from '../../components/InfoGrid';
import { useClient } from '../../context/ClientContext';

const PersonalInfo = () => {
  const { client } = useClient();

  const personalInfoItems = [
    { label: 'Edad', value: client?.age },
    { label: 'Género', value: client?.gender },
    { label: 'Altura', value: client?.height ? `${client.height} cm` : null },
    { label: 'Peso', value: client?.weight ? `${client.weight} kg` : null }
  ];

  return (
    <SummaryCard title="Información Personal">
      <InfoGrid items={personalInfoItems} />
    </SummaryCard>
  );
};

export default PersonalInfo;