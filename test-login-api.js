const axios = require('axios');

async function testLoginAPI() {
  console.log('🧪 Probando login directo con la API del backend...');
  
  try {
    const credentials = {
      email: 'test.trainer@trainfit.com',
      password: 'test123'
    };
    
    console.log('📤 Enviando credenciales:', { ...credentials, password: '***' });
    
    const response = await axios.post('http://localhost:5002/api/auth/login', credentials, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    
    console.log('✅ Respuesta exitosa:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success && response.data.token) {
      console.log('🎉 Login exitoso! Token recibido.');
      console.log('👤 Usuario:', response.data.user);
      
      // Probar una llamada autenticada
      console.log('\n🔐 Probando llamada autenticada...');
      const clientsResponse = await axios.get('http://localhost:5002/api/trainer/clients', {
        headers: {
          'Authorization': `Bearer ${response.data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Llamada autenticada exitosa:');
      console.log('Clientes:', clientsResponse.data);
      
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

testLoginAPI();