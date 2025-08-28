const axios = require('axios');

// Configurar axios como lo hace el frontend
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5002/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

async function testFrontendLogin() {
  try {
    console.log('🧪 Probando login desde el frontend...');
    
    const credentials = {
      email: 'trainer.demo@trainfit.com',
      password: 'test123'
    };
    
    console.log('📤 Enviando credenciales:', { ...credentials, password: '***' });
    
    const response = await axiosInstance.post('/auth/login', credentials);
    
    console.log('✅ Respuesta exitosa:');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    
    if (response.data.success && response.data.token) {
      console.log('🎉 Login exitoso! Token recibido.');
    } else {
      console.log('❌ Login falló: No se recibió token o success=false');
    }
    
  } catch (error) {
    console.error('❌ Error durante el login:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testFrontendLogin();