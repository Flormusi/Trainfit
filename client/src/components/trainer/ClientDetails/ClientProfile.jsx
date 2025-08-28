import React from 'react';
import { useClient } from './context/ClientContext';
import './styles/profile.css';

const ClientProfile = () => {
  const { client, handleSendPaymentReminder } = useClient();

  if (!client) {
    return (
      <div className="modern-profile-card">
        <div className="profile-header-section">
          <div className="avatar-section">
            <div className="profile-avatar">
              <div className="avatar-initials">?</div>
            </div>
          </div>
          <div className="profile-info-section">
            <div className="name-status-group">
              <h1 className="profile-name">Cliente no encontrado</h1>
            </div>
            <p className="profile-goal">No hay información disponible</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#10b981'; // Verde
      case 'inactive':
        return '#ef4444'; // Rojo
      case 'pending':
        return '#f59e0b'; // Amarillo
      default:
        return '#6b7280'; // Gris
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'Activo';
      case 'inactive':
        return 'Inactivo';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Sin estado';
    }
  };

  return (
    <div className="modern-profile-card">
      {/* Header con información principal */}
      <div className="profile-header-section">
        <div className="avatar-section">
          <div className="profile-avatar">
            {client?.profileImage ? (
              <img src={client.profileImage} alt={`${client.firstName} ${client.lastName}`} />
            ) : (
              <div className="avatar-initials">
                {client?.firstName?.charAt(0)}{client?.lastName?.charAt(0)}
              </div>
            )}
          </div>
          {client?.status && (
            <div 
              className="status-dot" 
              style={{ backgroundColor: getStatusColor(client.status) }}
            ></div>
          )}
        </div>

        <div className="profile-info-section">
          <div className="name-status-group">
            <h1 className="profile-name">
              {client?.firstName} {client?.lastName}
            </h1>
            {client?.status && (
              <span 
                className="status-pill"
                style={{ 
                  backgroundColor: `${getStatusColor(client.status)}20`,
                  color: getStatusColor(client.status),
                  border: `1px solid ${getStatusColor(client.status)}40`
                }}
              >
                {getStatusText(client.status)}
              </span>
            )}
          </div>
          <p className="profile-goal">
            {client?.fitnessGoals || 'Sin objetivos definidos'}
          </p>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="quick-stats">
        <div className="stat-card">
          <div className="stat-value">{client?.age || '--'}</div>
          <div className="stat-label">Edad</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{client?.weight ? `${client.weight} kg` : '--'}</div>
          <div className="stat-label">Peso</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{client?.height ? `${client.height} cm` : '--'}</div>
          <div className="stat-label">Altura</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {client?.weight && client?.height 
              ? (client.weight / Math.pow(client.height / 100, 2)).toFixed(1)
              : '--'
            }
          </div>
          <div className="stat-label">IMC</div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="action-buttons">
        <button 
          className="btn btn-primary"
          onClick={handleSendPaymentReminder}
          disabled={!client?.email}
        >
          <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Recordatorio de Pago
        </button>
        
        <button className="btn btn-secondary">
          <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Editar Perfil
        </button>
        
        <button className="btn btn-outline">
          <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          Contactar
        </button>
      </div>
    </div>
  );
};

export default ClientProfile;