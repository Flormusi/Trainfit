const axios = require('axios');

async function checkClientsStatus() {
  try {
    console.log('🔍 Verificando estado de clientes...');
    
    // Login
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'magagroca@gmail.com',
      password: 'magaroca'
    });
    
    const token = loginResponse.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Obtener clientes del entrenador
    console.log('\n📋 Obteniendo clientes del entrenador...');
    const clientsResponse = await axios.get('http://localhost:5002/api/trainer/clients', { headers });
    
    console.log('Respuesta completa de clientes:');
    console.log(JSON.stringify(clientsResponse.data, null, 2));
    
    if (clientsResponse.data && clientsResponse.data.data && clientsResponse.data.data.clients) {
      const clients = clientsResponse.data.data.clients;
      console.log(`\n👥 Total de clientes encontrados: ${clients.length}`);
      
      clients.forEach((client, index) => {
        console.log(`\n${index + 1}. Cliente:`);
        console.log(`   ID: ${client.id}`);
        console.log(`   Nombre: ${client.name}`);
        console.log(`   Email: ${client.email}`);
        console.log(`   Status: ${client.status || 'No definido'}`);
        console.log(`   Rol: ${client.role || 'No definido'}`);
      });
    } else {
      console.log('❌ No se encontraron clientes o estructura de respuesta inesperada');
    }
    
    // También verificar el dashboard data
    console.log('\n📊 Verificando datos del dashboard...');
    const dashboardResponse = await axios.get('http://localhost:5002/api/trainer/dashboard', { headers });
    console.log('Dashboard data:');
    console.log(JSON.stringify(dashboardResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkClientsStatus();
