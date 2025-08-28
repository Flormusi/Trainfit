// Este script debe ejecutarse en Node.js para simular el comportamiento del componente TrainerDashboard
const axios = require('axios');

// Configurar axios con la URL base
const api = axios.create({
  baseURL: 'http://localhost:5002/api',
  timeout: 10000,
});

// Simular la función getClients del archivo api.ts
async function getClients() {
  try {
    const response = await api.get('/trainer/clients');
    console.log('API getClients response:', response.data);
    
    // Verificar si la respuesta tiene la estructura esperada con datos anidados
    if (response && response.data && response.data.data && response.data.data.clients) {
      console.log('Estructura anidada detectada, devolviendo clients desde data.data.clients');
      // Devolver directamente el array de clientes para que el componente pueda usarlo
      return {
        data: response.data.data.clients
      };
    } 
    // Compatibilidad con estructura anterior
    else if (response && response.data) {
      console.log('Estructura simple detectada, devolviendo directamente response.data');
      return {
        data: response.data
      };
    } else {
      console.error('Error: La respuesta de getClients no tiene la estructura esperada');
      return {
        data: []
      };
    }
  } catch (error) {
    console.error('Error en getClients:', error);
    return [];
  }
}

// Simular el comportamiento del componente TrainerDashboard
async function simulateTrainerDashboard() {
  try {
    console.log('🔍 Simulando comportamiento del componente TrainerDashboard...');
    
    // Paso 1: Iniciar sesión para obtener un token
    console.log('\n1. Intentando hacer login...');
    const loginResponse = await api.post('/auth/login', {
      email: 'magagroca@gmail.com',
      password: 'magaroca'
    });
    
    console.log('Login response status:', loginResponse.status);
    const token = loginResponse.data.token;
    console.log('Token obtenido:', token ? 'Sí' : 'No');
    
    if (!token) {
      throw new Error('No se pudo obtener el token');
    }
    
    // Configurar el token para las siguientes peticiones
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Paso 2: Obtener clientes usando la función simulada
    console.log('\n2. Obteniendo clientes...');
    const clientsResponse = await getClients();
    
    console.log('Respuesta procesada de getClients:', clientsResponse);
    
    // Paso 3: Simular el procesamiento en el componente TrainerDashboard
    console.log('\n3. Simulando procesamiento en el componente TrainerDashboard:');
    
    // Verificar si clientsResponse.data existe y es un array
    if (clientsResponse && clientsResponse.data) {
      console.log('Tipo de clientsResponse.data:', typeof clientsResponse.data);
      console.log('¿Es un array?', Array.isArray(clientsResponse.data));
      
      // Establecer el estado de clientes
      const clients = Array.isArray(clientsResponse.data) ? clientsResponse.data : [];
      console.log('Clientes procesados:', clients.length);
      
      if (clients.length > 0) {
        console.log('Nombres de clientes:', clients.map(c => c.name));
        
        // Buscar específicamente el cliente con email florenciamusitani@gmail.com
        const florenciaClient = clients.find(client => client.email === 'florenciamusitani@gmail.com');
        if (florenciaClient) {
          console.log('\n✅ Cliente florenciamusitani@gmail.com encontrado:', florenciaClient);
        } else {
          console.log('\n❌ Cliente florenciamusitani@gmail.com NO encontrado');
          console.log('Emails disponibles:', clients.map(c => c.email));
        }
        
        // Simular renderizado de clientes
        console.log('\n4. Simulando renderizado de clientes:');
        console.log('Renderizando', clients.length, 'tarjetas de cliente');
        clients.forEach((client, index) => {
          console.log(`Cliente ${index + 1}: ${client.name} (${client.email})`);
        });
      } else {
        console.log('\n❌ No hay clientes para renderizar');
        console.log('Renderizando mensaje "No hay clientes registrados"');
      }
    } else {
      console.error('Error: clientsResponse no tiene la estructura esperada');
    }
    
  } catch (error) {
    console.error('Error durante la simulación:', error.message);
    if (error.response) {
      console.error('Detalles de la respuesta de error:', {
        status: error.response.status,
        data: error.response.data
      });
    }
  }
}

simulateTrainerDashboard();