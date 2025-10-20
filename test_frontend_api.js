// Script para probar la API desde el frontend usando el mismo método que la aplicación
const axios = require('axios');

// Configurar axios igual que en el frontend
axios.defaults.baseURL = 'http://localhost:5173/api'; // Usar el proxy de Vite
axios.defaults.headers.common['Content-Type'] = 'application/json';

async function testFrontendAPI() {
  try {
    console.log('🔍 Probando API desde el frontend (con proxy de Vite)...');
    
    // Hacer login
    console.log('📝 Haciendo login...');
    const loginResponse = await axios.post('/auth/login', {
      email: 'trainer.test@trainfit.com',
      password: 'test123'
    });
    
    console.log('Login response:', loginResponse.data);
    
    const token = loginResponse.data.token;
    if (!token) {
      console.log('❌ Error: No se pudo obtener el token');
      return;
    }
    
    console.log('✅ Token obtenido:', token.substring(0, 20) + '...');
    
    // Configurar token para próximas solicitudes
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Obtener detalles del cliente
    console.log('📋 Obteniendo detalles del cliente...');
    const clientResponse = await axios.get('/trainer/clients/cmdm9rl0l0001f5xbjlr0wwm2');
    
    console.log('🔍 === RESPUESTA DEL CLIENTE ===');
    console.log('Status:', clientResponse.status);
    console.log('Data:', JSON.stringify(clientResponse.data, null, 2));
    
    const clientData = clientResponse.data;
    console.log('🔍 === CAMPOS ESPECÍFICOS ===');
    console.log('Age (profile):', clientData?.clientProfile?.age);
    console.log('Gender (profile):', clientData?.clientProfile?.gender);
    console.log('Fitness Level (profile):', clientData?.clientProfile?.fitnessLevel);
    console.log('Age (direct):', clientData?.age);
    console.log('Gender (direct):', clientData?.gender);
    console.log('Fitness Level (direct):', clientData?.fitnessLevel);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testFrontendAPI();