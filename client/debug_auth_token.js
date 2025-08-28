const axios = require('axios');

// Configurar axios con la URL base
const api = axios.create({
  baseURL: 'http://localhost:5002/api',
  timeout: 10000,
});

async function debugAuthToken() {
  try {
    console.log('🔍 Depurando token de autenticación...');
    
    // Paso 1: Iniciar sesión para obtener un token
    console.log('\n1. Intentando hacer login...');
    const loginResponse = await api.post('/auth/login', {
      email: 'magagroca@gmail.com',
      password: 'magaroca'
    });
    
    console.log('Login response status:', loginResponse.status);
    const token = loginResponse.data.token;
    console.log('Token obtenido:', token ? token.substring(0, 20) + '...' : 'No');
    
    if (!token) {
      throw new Error('No se pudo obtener el token');
    }
    
    // Configurar el token para las siguientes peticiones
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Paso 2: Verificar el token decodificando su contenido
    console.log('\n2. Verificando contenido del token...');
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.error('El token no tiene el formato JWT esperado (header.payload.signature)');
      return;
    }
    
    try {
      // Decodificar el payload (segunda parte del token)
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      console.log('Payload del token:', payload);
      console.log('Usuario ID:', payload.id);
      console.log('Email:', payload.email);
      console.log('Rol:', payload.role);
      console.log('Fecha de expiración:', new Date(payload.exp * 1000).toLocaleString());
      
      // Verificar si el token está expirado
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        console.error('⚠️ El token está expirado');
      } else {
        console.log('✅ El token es válido y no está expirado');
      }
    } catch (error) {
      console.error('Error al decodificar el token:', error);
    }
    
    // Paso 3: Probar el endpoint de clientes con el token
    console.log('\n3. Probando endpoint /trainer/clients con el token...');
    try {
      const clientsResponse = await api.get('/trainer/clients');
      console.log('Clients response status:', clientsResponse.status);
      console.log('Estructura de la respuesta:', JSON.stringify(clientsResponse.data, null, 2));
      
      // Verificar si la respuesta tiene la estructura esperada
      if (clientsResponse.data && clientsResponse.data.data && clientsResponse.data.data.clients) {
        console.log('✅ Estructura correcta: data.data.clients');
        console.log('Número de clientes:', clientsResponse.data.data.clients.length);
      } else {
        console.error('❌ La respuesta no tiene la estructura esperada');
      }
    } catch (error) {
      console.error('Error al obtener clientes:', error.message);
      if (error.response) {
        console.error('Detalles del error:', {
          status: error.response.status,
          data: error.response.data
        });
      }
    }
    
    // Paso 4: Verificar si el usuario tiene permisos de entrenador
    console.log('\n4. Verificando permisos de entrenador...');
    try {
      const userResponse = await api.get('/auth/me');
      console.log('User response status:', userResponse.status);
      console.log('Datos del usuario:', userResponse.data);
      
      if (userResponse.data && userResponse.data.role) {
        console.log('Rol del usuario:', userResponse.data.role);
        if (userResponse.data.role === 'TRAINER') {
          console.log('✅ El usuario tiene rol de TRAINER');
        } else {
          console.error(`❌ El usuario tiene rol ${userResponse.data.role}, no TRAINER`);
        }
      } else {
        console.error('❌ No se pudo determinar el rol del usuario');
      }
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error.message);
      if (error.response) {
        console.error('Detalles del error:', {
          status: error.response.status,
          data: error.response.data
        });
      }
    }
    
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

debugAuthToken();