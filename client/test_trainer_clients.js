const axios = require('axios');

async function testTrainerClients() {
  try {
    console.log('🔐 Iniciando sesión...');
    
    // Paso 1: Login para obtener token
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'test@trainfit.com',
      password: 'test123'
    });
    
    const token = loginResponse.data.token;
    console.log('🔑 Token obtenido:', token.substring(0, 20) + '...');
    
    // Paso 2: Configurar axios con el token
    const apiClient = axios.create({
      baseURL: 'http://localhost:5002/api',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Paso 3: Obtener lista de clientes del entrenador
    console.log('🚀 Obteniendo lista de clientes del entrenador...');
    const clientsResponse = await apiClient.get('/trainer/clients');
    
    console.log('✅ ¡Éxito! Clientes obtenidos:');
    console.log('📊 Status:', clientsResponse.status);
    console.log('📋 Datos:', JSON.stringify(clientsResponse.data, null, 2));
    console.log('📈 Cantidad de clientes:', clientsResponse.data?.data?.clients?.length || clientsResponse.data?.length || 0);
    
    // Si hay clientes, probar con el primero
    const clients = clientsResponse.data?.data?.clients || clientsResponse.data || [];
    if (clients.length > 0) {
      const firstClient = clients[0];
      console.log('\n🎯 Probando con el primer cliente:', firstClient.id);
      
      const routinesResponse = await apiClient.get(`/trainer/clients/${firstClient.id}/routines`);
      console.log('✅ Rutinas del cliente obtenidas:');
      console.log('📋 Datos:', JSON.stringify(routinesResponse.data, null, 2));
    } else {
      console.log('⚠️ No hay clientes asignados a este entrenador');
    }
    
  } catch (error) {
    console.log('❌ Error en la solicitud:');
    console.log('📄 Status:', error.response?.status);
    console.log('📄 Status Text:', error.response?.statusText);
    console.log('📄 Data:', error.response?.data);
    console.log('📄 Error completo:', error.message);
  }
}

testTrainerClients();