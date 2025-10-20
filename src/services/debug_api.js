// Este archivo es para depuración y se puede eliminar después

// Importar axios para hacer solicitudes HTTP
const axios = require('axios');

// Configurar axios para usar la URL base correcta
axios.defaults.baseURL = 'http://localhost:5002/api';

// Función para obtener el token de autenticación del localStorage
const getToken = () => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
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
    console.log('Respuesta completa:', response);
    console.log('Datos de clientes:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw error;
  }
}

// Ejecutar la función si este archivo se ejecuta directamente
if (require.main === module) {
  getClients()
    .then(data => {
      console.log('Clientes obtenidos correctamente');
    })
    .catch(error => {
      console.error('Error en la ejecución principal:', error);
    });
}

module.exports = {
  getClients
};