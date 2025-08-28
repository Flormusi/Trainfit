import React, { useState } from 'react';
import PersonalInfo from './PersonalInfo';
import HealthInfo from './HealthInfo';
import RecentActivity from './RecentActivity';
import FitnessGoals from './FitnessGoals';
import CurrentRoutine from './CurrentRoutine';
import { useClient } from '../../context/ClientContext';
import '../../styles/overview.css';

const OverviewTab = () => {
  const { loading, error, client } = useClient();
  const [showEditModal, setShowEditModal] = useState(false);

  const handleRefreshClient = async () => {
    try {
      // Recargar la página para actualizar todos los datos del cliente
      window.location.reload();
    } catch (error) {
      console.error('Error al actualizar datos del cliente:', error);
      alert('Error al actualizar los datos. Por favor, intenta nuevamente.');
    }
  };

  const handleEditClient = () => {
    setShowEditModal(true);
    // Por ahora solo mostrar un alert, luego se puede implementar un modal de edición
    alert('Función de editar cliente - Por implementar');
  };

  if (loading) {
    return <div className="loading-state">Cargando información del cliente...</div>;
  }

  if (error) {
    return (
      <div className="error-state">
        <p>Error al cargar la información: {error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="overview-tab">
      {/* Header con botones de acción solo en resumen */}
      <div className="overview-header">
        <h2>Resumen del Cliente</h2>
        <div className="overview-actions">
          <button 
            className="refresh-btn" 
            onClick={handleRefreshClient}
            title="Actualizar datos del cliente"
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            🔄 Actualizar
          </button>
          <button 
            className="edit-client-btn" 
            onClick={handleEditClient}
            title="Editar cliente"
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            ✏️ Editar Cliente
          </button>
        </div>
      </div>
      
      <div className="overview-grid">
        <PersonalInfo />
        <HealthInfo />
        <RecentActivity />
        <FitnessGoals />
        <CurrentRoutine />
      </div>
    </div>
  );
};

export default OverviewTab;