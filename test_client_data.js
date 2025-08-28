const axios = require('axios');

async function testClientData() {
  try {
    // Primero hacer login para obtener el token
    console.log('🔐 Haciendo login...');
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      email: 'trainer.demo@trainfit.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login exitoso, token obtenido');

    // Obtener lista de clientes
    console.log('📋 Obteniendo lista de clientes...');
    const clientsResponse = await axios.get('http://localhost:5002/api/trainer/clients', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const clients = clientsResponse.data.data || clientsResponse.data;
    console.log('👥 Clientes encontrados:', clients.length);

    if (clients.length > 0) {
      const firstClient = clients[0];
      console.log('🔍 Primer cliente:', firstClient.name, 'ID:', firstClient.id);

      // Obtener detalles del primer cliente
      console.log('📊 Obteniendo detalles del cliente...');
      const clientDetailsResponse = await axios.get(`http://localhost:5002/api/trainer/clients/${firstClient.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const clientDetails = clientDetailsResponse.data.data || clientDetailsResponse.data;
      console.log('📋 Detalles completos del cliente:');
      console.log(JSON.stringify(clientDetails, null, 2));

      console.log('\n🎯 Campos específicos:');
      console.log('- Edad:', clientDetails.clientProfile?.age || clientDetails.age || 'No especificada');
      console.log('- Género:', clientDetails.clientProfile?.gender || clientDetails.gender || 'No especificado');
      console.log('- Nivel de fitness:', clientDetails.clientProfile?.fitnessLevel || clientDetails.fitnessLevel || 'No especificado');
      console.log('- Objetivos:', clientDetails.clientProfile?.goals || clientDetails.goals || 'No especificados');
    } else {
      console.log('❌ No se encontraron clientes');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testClientData();