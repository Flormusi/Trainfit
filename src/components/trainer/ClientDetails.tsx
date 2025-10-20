import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { trainerApi } from '../../services/api';
import './ClientDetails.css';

interface Client {
  id: string;
  name: string;
  email: string;
  goal?: string;
  status?: 'active' | 'overdue';
  lastActivity?: string;
}

const ClientDetails: React.FC = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!clientId) {
        setError('ID de cliente no válido');
        setLoading(false);
        return;
      }

      try {
        const response = await trainerApi.getClientDetails(clientId);
        // Manejar diferentes estructuras de respuesta
        const clientData = response.data || response;
        setClient(clientData);
      } catch (error) {
        console.error('Error fetching client details:', error);
        setError('Error al cargar los detalles del cliente');
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [clientId]);

  const handleViewProgress = () => {
    navigate(`/trainer/clients/${clientId}`);
  };

  const handleBackToDashboard = () => {
    navigate('/trainer/clients');
  };

  if (loading) {
    return (
      <div className="client-details">
        <div className="loading-container">
          <p>Cargando información del cliente...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="client-details">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error || 'Cliente no encontrado'}</p>
          <button onClick={handleBackToDashboard} className="back-btn">
            Volver a Clientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="client-details">
      <header className="client-details-header">
        <button onClick={handleBackToDashboard} className="back-btn">
          ← Volver a Clientes
        </button>
        <h1>Detalles del Cliente</h1>
      </header>

      <div className="client-info-card">
        <div className="client-header">
          <h2>{client.name}</h2>
          <span className={`status-badge ${client.status === 'overdue' ? 'overdue' : 'active'}`}>
            {client.status === 'overdue' ? 'Cuota Vencida' : 'Activo'}
          </span>
        </div>
        
        <div className="client-details-grid">
          <div className="detail-item">
            <label>Email:</label>
            <span>{client.email}</span>
          </div>
          
          <div className="detail-item">
            <label>Objetivo:</label>
            <span>{client.goal || 'No especificado'}</span>
          </div>
          
          <div className="detail-item">
            <label>Última Actividad:</label>
            <span>{client.lastActivity || 'Sin actividad reciente'}</span>
          </div>
        </div>

        <div className="client-actions">
          <button onClick={handleViewProgress} className="view-progress-btn">
            Ver Progreso Detallado
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;