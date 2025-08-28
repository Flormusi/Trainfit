const axios = require('axios');

async function testLogin() {
  try {
    console.log('🔍 Probando conexión con el backend...');
    
    // Probar conexión básica
    const healthCheck = await axios.get('http://localhost:5002/api/health').catch(() => null);
    if (healthCheck) {
      console.log('✅ Backend responde correctamente');
    } else {
      console.log('❌ Backend no responde en /api/health');
    }

    // Probar login con credenciales de prueba
    console.log('\n🔐 Probando login...');
    
    const loginData = {
      email: 'trainer@test.com',
      password: 'password123'
    };

    const response = await axios.post('http://localhost:5002/api/auth/login', loginData);
    
    console.log('✅ Login exitoso!');
    console.log('📊 Respuesta:', {
      success: response.data.success,
      token: response.data.token ? 'Token recibido' : 'No token',
      user: response.data.user ? {
        id: response.data.user.id,
        email: response.data.user.email,
        role: response.data.user.role,
        hasCompletedOnboarding: response.data.user.hasCompletedOnboarding
      } : 'No user data'
    });

  } catch (error) {
    console.error('❌ Error durante el test:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Sugerencia: Verifica que el backend esté ejecutándose en puerto 5002');
    }
  }
}

// Ejecutar el test
testLogin();