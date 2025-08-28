const axios = require('axios');

// Configurar axios con la URL base
const api = axios.create({
  baseURL: 'http://localhost:5002/api',
  timeout: 10000,
});

async function debugApiStructure() {
  try {
    console.log('🔍 Depurando estructura de la API...');
    
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
    
    // Paso 2: Obtener clientes y analizar la estructura
    console.log('\n2. Obteniendo clientes...');
    const clientsResponse = await api.get('/trainer/clients');
    
    console.log('Clients response status:', clientsResponse.status);
    console.log('Estructura completa de la respuesta:', JSON.stringify(clientsResponse.data, null, 2));
    
    // Analizar la estructura
    console.log('\n3. Analizando estructura de la respuesta:');
    console.log('Tipo de clientsResponse.data:', typeof clientsResponse.data);
    console.log('¿Es un array?', Array.isArray(clientsResponse.data));
    
    if (typeof clientsResponse.data === 'object' && !Array.isArray(clientsResponse.data)) {
      console.log('Propiedades de primer nivel:', Object.keys(clientsResponse.data));
      
      // Verificar si tiene la estructura esperada
      if (clientsResponse.data.data && clientsResponse.data.data.clients) {
        console.log('\n✅ Estructura anidada detectada: data.data.clients');
        console.log('Número de clientes:', clientsResponse.data.data.clients.length);
        console.log('Primer cliente:', clientsResponse.data.data.clients[0]);
        
        // Verificar si florenciamusitani@gmail.com está en la lista
        const florenciaClient = clientsResponse.data.data.clients.find(
          client => client.email === 'florenciamusitani@gmail.com'
        );
        
        if (florenciaClient) {
          console.log('\n✅ Cliente florenciamusitani@gmail.com encontrado:', florenciaClient);
        } else {
          console.log('\n❌ Cliente florenciamusitani@gmail.com NO encontrado');
          console.log('Emails disponibles:', clientsResponse.data.data.clients.map(c => c.email));
        }
      } else {
        console.log('\n❌ No se encontró la estructura esperada (data.data.clients)');
      }
    } else if (Array.isArray(clientsResponse.data)) {
      console.log('\n✅ La respuesta es directamente un array de clientes');
      console.log('Número de clientes:', clientsResponse.data.length);
      
      // Verificar si florenciamusitani@gmail.com está en la lista
      const florenciaClient = clientsResponse.data.find(
        client => client.email === 'florenciamusitani@gmail.com'
      );
      
      if (florenciaClient) {
        console.log('\n✅ Cliente florenciamusitani@gmail.com encontrado:', florenciaClient);
      } else {
        console.log('\n❌ Cliente florenciamusitani@gmail.com NO encontrado');
        console.log('Emails disponibles:', clientsResponse.data.map(c => c.email));
      }
    }
    
    // Paso 3: Simular el procesamiento en el frontend
    console.log('\n4. Simulando procesamiento en el frontend:');
    
    let clientsData;
    
    // Verificar si la respuesta tiene la estructura esperada con datos anidados
    if (clientsResponse.data && clientsResponse.data.data && clientsResponse.data.data.clients) {
      console.log('Usando estructura anidada: data.data.clients');
      clientsData = clientsResponse.data.data.clients;
    } 
    // Compatibilidad con estructura anterior
    else if (Array.isArray(clientsResponse.data)) {
      console.log('Usando array directo de clientes');
      clientsData = clientsResponse.data;
    } else {
      console.log('Estructura no reconocida, usando array vacío');
      clientsData = [];
    }
    
    console.log('Clientes procesados:', clientsData.length);
    console.log('Nombres de clientes:', clientsData.map(c => c.name));
    
  } catch (error) {
    console.error('Error durante la depuración:', error.message);
    if (error.response) {
      console.error('Detalles de la respuesta de error:', {
        status: error.response.status,
        data: error.response.data
      });
    }
  }
}

debugApiStructure();