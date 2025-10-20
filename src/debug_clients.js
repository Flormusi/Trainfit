// Script para depurar la respuesta de la API de clientes

const axios = require('axios');

// Configurar axios para usar la URL base correcta
axios.defaults.baseURL = 'http://localhost:5002/api';

// Función para obtener el token de autenticación
const getToken = () => {
  // En un entorno Node.js, no tenemos localStorage, así que usamos un token hardcodeado para pruebas
  // Reemplaza esto con tu token de autenticación válido
  return 'tu_token_aqui';
};

// Configurar axios para incluir el token en todas las solicitudes
axios.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Función para obtener los clientes del entrenador
async function getClients() {
  try {
    console.log('Obteniendo clientes...');
    const response = await axios.get('/trainer/clients');
    console.log('Respuesta completa:', JSON.stringify(response.data, null, 2));
    
    // Verificar si la respuesta es un array
    if (Array.isArray(response.data)) {
      console.log('La respuesta es un array con', response.data.length, 'elementos');
      
      // Buscar específicamente el cliente con email florenciamusitani@gmail.com
      const florenciaClient = response.data.find(client => client.email === 'florenciamusitani@gmail.com');
      if (florenciaClient) {
        console.log('Cliente florenciamusitani@gmail.com encontrado:', florenciaClient);
      } else {
        console.log('Cliente florenciamusitani@gmail.com NO encontrado en la respuesta');
      }
    } else {
      console.log('La respuesta NO es un array, es:', typeof response.data);
      
      // Si la respuesta tiene una propiedad data, verificar si es un array
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        console.log('response.data.data es un array con', response.data.data.length, 'elementos');
        
        // Buscar específicamente el cliente con email florenciamusitani@gmail.com
        const florenciaClient = response.data.data.find(client => client.email === 'florenciamusitani@gmail.com');
        if (florenciaClient) {
          console.log('Cliente florenciamusitani@gmail.com encontrado en data:', florenciaClient);
        } else {
          console.log('Cliente florenciamusitani@gmail.com NO encontrado en data');
        }
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener clientes:', error.message);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
      console.error('Status del error:', error.response.status);
    }
    throw error;
  }
}

// Ejecutar la función
getClients()
  .then(() => {
    console.log('Proceso completado');
  })
  .catch(error => {
    console.error('Error en la ejecución principal:', error);
  });