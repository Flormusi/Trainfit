const axios = require('axios');

// Configurar axios como en la aplicación
axios.defaults.baseURL = 'http://localhost:5002/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

async function testAPI() {
  try {
    console.log('🔍 Testing API endpoints...');
    
    // Primero, intentar obtener un token válido haciendo login
    console.log('\n1. Intentando hacer login...');
    const loginResponse = await axios.post('/auth/login', {
      email: 'magagroca@gmail.com',
      password: 'magaroca'
    });
    
    console.log('Login response status:', loginResponse.status);
    const token = loginResponse.data.token;
    console.log('Token obtenido:', token ? 'Sí' : 'No');
    
    if (token) {
      // Configurar el token para las siguientes requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      console.log('\n2. Probando endpoint /trainer/clients...');
      const clientsResponse = await axios.get('/trainer/clients');
      
      console.log('Clients response status:', clientsResponse.status);
      console.log('Clients response data:', JSON.stringify(clientsResponse.data, null, 2));
      
      // Buscar específicamente el cliente florenciamusitani@gmail.com
      const clients = clientsResponse.data;
      if (Array.isArray(clients)) {
        console.log('\n📊 Análisis de clientes:');
        console.log('Total de clientes:', clients.length);
        console.log('Emails de clientes:', clients.map(c => c.email));
        
        const florenciaClient = clients.find(c => c.email === 'florenciamusitani@gmail.com');
        if (florenciaClient) {
          console.log('✅ Cliente florenciamusitani@gmail.com encontrado:', florenciaClient);
        } else {
          console.log('❌ Cliente florenciamusitani@gmail.com NO encontrado');
        }
      } else {
        console.log('⚠️ La respuesta no es un array:', typeof clients);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAPI();