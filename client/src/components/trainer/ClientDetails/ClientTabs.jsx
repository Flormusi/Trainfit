import React from 'react';
import './styles/tabs.css';

const ClientTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="client-tabs">
      <button 
        className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
        onClick={() => onTabChange('overview')}
      >
        Resumen
      </button>
      <button 
        className={`tab-btn ${activeTab === 'routines' ? 'active' : ''}`}
        onClick={() => onTabChange('routines')}
      >
        Rutinas Asignadas
      </button>
      <button 
        className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
        onClick={() => onTabChange('progress')}
      >
        Progreso
      </button>
      <button 
        className={`tab-btn ${activeTab === 'nutrition' ? 'active' : ''}`}
        onClick={() => onTabChange('nutrition')}
      >
        Nutrición
      </button>
      <button 
        className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
        onClick={() => onTabChange('payments')}
      >
        Pagos
      </button>
      <button 
        className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
        onClick={() => onTabChange('notes')}
      >
        Notas
      </button>
    </div>
  );
};

export default ClientTabs;