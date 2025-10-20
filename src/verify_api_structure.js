// Script para verificar la estructura de la respuesta de la API y compararla con lo esperado en el frontend

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configurar axios para usar la URL base correcta
axios.defaults.baseURL = 'http://localhost:5002/api';

// Función para obtener el token de autenticación desde el archivo token.txt
const getToken = () => {
  try {
    // Leer el token desde el archivo token.txt
    const tokenPath = path.join(__dirname, 'token.txt');
    if (fs.existsSync(tokenPath)) {
      const token = fs.readFileSync(tokenPath, 'utf8').trim();
      console.log('Token leído desde archivo token.txt');
      return token;
    } else {
      console.error('El archivo token.txt no existe');
      return null;
    }
  } catch (error) {
    console.error('Error al leer el token:', error.message);
    return null;
  }
};

// Configurar axios para incluir el token en todas las solicitudes
axios.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Función para verificar la estructura de la respuesta de la API de clientes
async function verifyClientsApiStructure() {
  try {
    console.log('Verificando estructura de la API de clientes...');
    const response = await axios.get('/trainer/clients');
    
    console.log('\nRespuesta completa:');
    console.log('- Status:', response.status, response.statusText);
    console.log('- Content-Type:', response.headers['content-type']);
    
    // Verificar la estructura de la respuesta
    console.log('\nEstructura de la respuesta:');
    console.log('- Tipo de response.data:', typeof response.data);
    console.log('- response.data es un array:', Array.isArray(response.data));
    
    if (Array.isArray(response.data)) {
      console.log('- Número de clientes:', response.data.length);
      
      if (response.data.length > 0) {
        // Mostrar las propiedades del primer cliente
        const firstClient = response.data[0];
        console.log('\nPropiedades del primer cliente:');
        console.log(Object.keys(firstClient));
        
        // Verificar propiedades específicas que espera el frontend
        const expectedProperties = ['id', 'email', 'name', 'role', 'clientProfile', 'assignedRoutines', 'assignedNutritionPlans'];
        const missingProperties = expectedProperties.filter(prop => !(prop in firstClient));
        
        if (missingProperties.length === 0) {
          console.log('\n✅ La estructura de la respuesta coincide con lo esperado en el frontend');
        } else {
          console.log('\n❌ Faltan propiedades esperadas por el frontend:', missingProperties);
        }
        
        // Verificar la estructura específica que espera TrainerDashboard.tsx
        console.log('\nVerificación para TrainerDashboard.tsx:');
        console.log('- Array.isArray(response.data):', Array.isArray(response.data));
        console.log('- response.data tiene propiedad "data":', 'data' in response.data);
        
        // Verificar si hay un cliente específico
        const florenciaClient = response.data.find(client => client.email === 'florenciamusitani@gmail.com');
        console.log('- Cliente florenciamusitani@gmail.com encontrado:', !!florenciaClient);
      }
    } else {
      console.log('\nresponse.data no es un array:');
      console.log('- Tipo:', typeof response.data);
      console.log('- Tiene propiedad "data":', 'data' in response.data);
      
      if ('data' in response.data && Array.isArray(response.data.data)) {
        console.log('- response.data.data es un array:', Array.isArray(response.data.data));
        console.log('- Número de clientes en response.data.data:', response.data.data.length);
        
        // Verificar si hay un cliente específico en response.data.data
        if (response.data.data.length > 0) {
          const florenciaClient = response.data.data.find(client => client.email === 'florenciamusitani@gmail.com');
          console.log('- Cliente florenciamusitani@gmail.com encontrado en response.data.data:', !!florenciaClient);
        }
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error al verificar la estructura de la API de clientes:', error.message);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
      console.error('Status:', error.response.status);
    }
    return null;
  }
}

// Función principal
async function main() {
  try {
    console.log('=== VERIFICACIÓN DE ESTRUCTURA DE API ===');
    console.log('Fecha y hora:', new Date().toLocaleString());
    
    // Verificar que tenemos un token válido
    const token = getToken();
    if (!token) {
      console.error('No se encontró un token válido. Ejecuta test_api_with_token.js en el backend primero.');
      return;
    }
    
    // Verificar la estructura de la API de clientes
    await verifyClientsApiStructure();
    
    console.log('\n=== VERIFICACIÓN COMPLETADA ===');
  } catch (error) {
    console.error('Error en el proceso principal:', error);
  }
}

// Ejecutar la función principal
main();