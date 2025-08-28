import React, { useEffect, useState } from 'react';
import axios from '../services/axiosConfig';

interface Client {
  id: string;
  name: string;
  email: string;
  [key: string]: any;
}

const DebugClientsList: React.FC = () => {
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [processedClients, setProcessedClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        
        // Obtener directamente de la API para evitar cualquier transformación
        const response = await axios.get('/trainer/clients');
        console.log('Respuesta directa de la API:', response);
        setApiResponse(response.data);
        
        // Procesar los clientes según las diferentes estructuras posibles
        let clients: Client[] = [];
        
        if (response.data && response.data.data && Array.isArray(response.data.data.clients)) {
          // Estructura anidada: response.data.data.clients
          clients = response.data.data.clients;
          console.log('Clientes extraídos de estructura anidada:', clients);
        } else if (response.data && Array.isArray(response.data)) {
          // Array directo
          clients = response.data;
          console.log('Clientes extraídos de array directo:', clients);
        } else if (Array.isArray(response.data)) {
          // Solo por si acaso
          clients = response.data;
          console.log('Clientes extraídos de response.data array:', clients);
        } else {
          console.log('No se pudo extraer clientes de la respuesta');
        }
        
        setProcessedClients(clients);
      } catch (err) {
        console.error('Error al obtener clientes:', err);
        setError('Error al cargar los clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Depuración de Lista de Clientes</h1>
      
      {loading ? (
        <p>Cargando datos...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div>
          <h2>Respuesta de la API:</h2>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px', overflow: 'auto', maxHeight: '300px' }}>
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
          
          <h2>Clientes procesados ({processedClients.length}):</h2>
          {processedClients.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {processedClients.map((client) => (
                <li key={client.id} style={{ marginBottom: '10px', padding: '15px', border: 'none', borderRadius: '5px', background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ margin: '0 0 10px 0' }}>{client.name}</h3>
                      <p style={{ margin: '0 0 5px 0' }}><strong>Email:</strong> {client.email}</p>
                      <p style={{ margin: '0 0 5px 0' }}><strong>ID:</strong> {client.id}</p>
                      {client.clientProfile && (
                        <div style={{ marginTop: '10px' }}>
                          <p><strong>Perfil:</strong></p>
                          <ul>
                            {client.clientProfile.initialObjective && (
                              <li>Objetivo: {client.clientProfile.initialObjective}</li>
                            )}
                            {client.clientProfile.weight && (
                              <li>Peso: {client.clientProfile.weight} kg</li>
                            )}
                            {client.clientProfile.trainingDaysPerWeek && (
                              <li>Días de entrenamiento: {client.clientProfile.trainingDaysPerWeek}</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No se encontraron clientes</p>
          )}
          
          <h2>Búsqueda específica:</h2>
          <div style={{ padding: '15px', border: 'none', borderRadius: '5px', background: '#f9f9f9' }}>
            <p>
              <strong>Cliente florenciamusitani@gmail.com: </strong>
              {processedClients.some(c => c.email === 'florenciamusitani@gmail.com') ? (
                <span style={{ color: 'green', fontWeight: 'bold' }}>✅ ENCONTRADO</span>
              ) : (
                <span style={{ color: 'red', fontWeight: 'bold' }}>❌ NO ENCONTRADO</span>
              )}
            </p>
            
            <h3>Emails disponibles:</h3>
            {processedClients.length > 0 ? (
              <ul>
                {processedClients.map(client => (
                  <li key={client.id}>{client.email}</li>
                ))}
              </ul>
            ) : (
              <p>No hay emails disponibles</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugClientsList;