const axios = require('axios');

// Configurar axios para usar el backend correcto
axios.defaults.baseURL = 'http://localhost:5002/api';
axios.defaults.headers.common['Content-Type'] = 'application/json';

async function assignClientToTrainer() {
  try {
    console.log('🔐 Iniciando sesión como entrenador...');
    
    // 1. Login como entrenador
    const trainerLoginResponse = await axios.post('/auth/login', {
      email: 'test@trainfit.com',
      password: 'test123'
    });
    
    const trainerToken = trainerLoginResponse.data.token;
    console.log('✅ Login de entrenador exitoso');
    
    // 2. Configurar axios con el token del entrenador
    axios.defaults.headers.common['Authorization'] = `Bearer ${trainerToken}`;
    
    // 3. Asociar el cliente existente al entrenador
    console.log('🔗 Asociando cliente al entrenador...');
    
    const assignResponse = await axios.post('/trainer/clients', {
      email: 'client@trainfit.com',
      password: 'test123',
      name: 'Cliente de Prueba'
    });
    
    console.log('✅ Cliente asociado exitosamente!');
    console.log('📋 Respuesta:', JSON.stringify(assignResponse.data, null, 2));
    
    // 4. Verificar que ahora el entrenador puede ver al cliente
    console.log('🔍 Verificando que el cliente aparece en la lista...');
    const clientsResponse = await axios.get('/trainer/clients');
    
    console.log('✅ Clientes del entrenador:');
    console.log('📋 Datos:', JSON.stringify(clientsResponse.data, null, 2));
    
    const clients = clientsResponse.data.data?.clients || [];
    if (clients.length > 0) {
      const clientId = clients[0].id;
      console.log(`🎉 ¡Perfecto! Cliente encontrado con ID: ${clientId}`);
      console.log(`🔗 URL de detalles del cliente: http://localhost:5173/trainer/clients/${clientId}`);
    }
    
  } catch (error) {
    console.error('❌ Error asociando cliente al entrenador:', error.response?.data || error.message);
    
    if (error.response?.status === 400 && error.response?.data?.message?.includes('ya está asociado')) {
      console.log('✅ El cliente ya estaba asociado al entrenador');
      
      // Verificar clientes existentes
      try {
        const clientsResponse = await axios.get('/trainer/clients');
        const clients = clientsResponse.data.data?.clients || [];
        if (clients.length > 0) {
          const clientId = clients[0].id;
          console.log(`🎉 Cliente encontrado con ID: ${clientId}`);
          console.log(`🔗 URL de detalles del cliente: http://localhost:5173/trainer/clients/${clientId}`);
        }
      } catch (getError) {
        console.error('❌ Error obteniendo clientes:', getError.response?.data || getError.message);
      }
    }
  }
}

assignClientToTrainer();