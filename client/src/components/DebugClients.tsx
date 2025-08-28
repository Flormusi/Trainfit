import React, { useEffect, useState } from 'react';
import { trainerApi } from '../services/api';

interface Client {
  id: string;
  name: string;
  email: string;
  // Otros campos según sea necesario
}

const DebugClients: React.FC = () => {
  const [clientsData, setClientsData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await trainerApi.getClients();
        console.log('Respuesta completa de getClients:', response);
        setClientsData(response);
      } catch (err) {
        console.error('Error al obtener clientes:', err);
        setError('Error al cargar los clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Función para extraer clientes de diferentes estructuras posibles
  const extractClients = (data: any): Client[] => {
    if (!data) return [];
    
    // Caso 1: data es un array directamente
    if (Array.isArray(data)) {
      return data;
    }
    
    // Caso 2: data.data es un array
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    // Caso 3: data.data.data.clients es un array (estructura anidada)
    if (data.data && data.data.data && Array.isArray(data.data.data.clients)) {
      return data.data.data.clients;
    }
    
    // Fallback: devolver array vacío
    return [];
  };

  const clients = clientsData ? extractClients(clientsData) : [];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Depuración de Clientes</h1>
      
      {loading ? (
        <p>Cargando clientes...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div>
          <h2>Estructura de la respuesta:</h2>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
            {JSON.stringify(clientsData, null, 2)}
          </pre>
          
          <h2>Clientes extraídos ({clients.length}):</h2>
          {clients.length > 0 ? (
            <ul>
              {clients.map((client: Client) => (
                <li key={client.id} style={{ marginBottom: '10px', padding: '10px', border: 'none', borderRadius: '5px' }}>
                  <strong>Nombre:</strong> {client.name}<br />
                  <strong>Email:</strong> {client.email}<br />
                  <strong>ID:</strong> {client.id}
                </li>
              ))}
            </ul>
          ) : (
            <p>No se encontraron clientes</p>
          )}
          
          <h2>Búsqueda específica:</h2>
          <p>
            Cliente florenciamusitani@gmail.com: {' '}
            {clients.some((c: Client) => c.email === 'florenciamusitani@gmail.com') ? (
              <span style={{ color: 'green' }}>✅ Encontrado</span>
            ) : (
              <span style={{ color: 'red' }}>❌ No encontrado</span>
            )}
          </p>
          
          <h3>Emails disponibles:</h3>
          <ul>
            {clients.map((client: Client) => (
              <li key={client.id}>{client.email}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DebugClients;
