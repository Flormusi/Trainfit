import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ClientHeader from './ClientHeader';
import ClientProfile from './ClientProfile';
import ClientTabs from './ClientTabs';
import OverviewTab from './tabs/OverviewTab';
import RoutinesTab from './tabs/RoutinesTab/RoutinesTab';
import ProgressTab from './tabs/ProgressTab/ProgressTab';
import NutritionTab from './tabs/NutritionTab/NutritionTab';
import PaymentsTab from './tabs/PaymentsTab/PaymentsTab';
import NotesTab from './tabs/NotesTab/NotesTab';
import { ClientProvider } from './context/ClientContext';
import './styles/index.css';

const ClientDetails = () => {
  const { clientId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <ClientProvider clientId={clientId}>
      <div className="client-details">
        <ClientHeader />
        <ClientProfile />
        
        <ClientTabs activeTab={activeTab} onTabChange={handleTabChange} />
        
        <div className="tab-content">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'rutinas' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Rutinas Asignadas</h2>
                {/* Remover el botón de actualizar de aquí ya que solo debe estar en resumen */}
              </div>
              <RoutinesTab />
            </div>
          )}
          {activeTab === 'progress' && <ProgressTab />}
          {activeTab === 'nutrition' && <NutritionTab />}
          {activeTab === 'payments' && <PaymentsTab />}
          {activeTab === 'notes' && <NotesTab />}
        </div>
      </div>
    </ClientProvider>
  );
};

export default ClientDetails;