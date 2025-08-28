const axios = require('axios');

// Configurar axios para usar el proxy de Vite
const api = axios.create({
  baseURL: 'http://localhost:5173/api',
  timeout: 10000,
});

async function testFixedAPI() {
  try {
    console.log('🧪 === PROBANDO API CORREGIDA ===');
    
    // 1. Login para obtener token
    console.log('🔐 Haciendo login...');
    const loginResponse = await api.post('/auth/login', {
      email: 'trainer.test@trainfit.com',
      password: 'test123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso, token obtenido');
    
    // 2. Configurar token para siguientes requests
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // 3. Obtener detalles del cliente
    console.log('📋 Obteniendo detalles del cliente...');
    const clientResponse = await api.get('/trainer/clients/cmdm9rl0l0001f5xbjlr0wwm2');
    
    console.log('✅ Respuesta recibida');
    console.log('📊 Estructura de la respuesta:', typeof clientResponse.data);
    console.log('📊 Datos del cliente:', JSON.stringify(clientResponse.data, null, 2));
    
    // 4. Verificar campos específicos
    const clientData = clientResponse.data.data; // Acceder a los datos reales
    console.log('\n🔍 === VERIFICACIÓN DE CAMPOS ===');
    console.log('👤 Nombre:', clientData.name);
    console.log('📧 Email:', clientData.email);
    console.log('🎂 Edad (directa):', clientData.age);
    console.log('🎂 Edad (perfil):', clientData.clientProfile?.age);
    console.log('⚧ Género (directo):', clientData.gender);
    console.log('⚧ Género (perfil):', clientData.clientProfile?.gender);
    console.log('💪 Nivel fitness (directo):', clientData.fitnessLevel);
    console.log('💪 Nivel fitness (perfil):', clientData.clientProfile?.fitnessLevel);
    
    console.log('\n🔍 === ESTRUCTURA REAL ===');
    console.log('🔑 Claves del objeto clientData:', Object.keys(clientData));
    console.log('📋 Datos del perfil:', clientData.clientProfile);
    
    // 5. Verificar que los campos no son undefined
    const hasAge = clientData.clientProfile?.age !== undefined;
    const hasGender = clientData.clientProfile?.gender !== undefined;
    const hasFitnessLevel = clientData.clientProfile?.fitnessLevel !== undefined;
    
    console.log('\n✅ === RESULTADO DE LA PRUEBA ===');
    console.log('🎂 Edad disponible:', hasAge ? '✅' : '❌');
    console.log('⚧ Género disponible:', hasGender ? '✅' : '❌');
    console.log('💪 Nivel fitness disponible:', hasFitnessLevel ? '✅' : '❌');
    
    if (hasAge && hasGender && hasFitnessLevel) {
      console.log('🎉 ¡ÉXITO! Todos los campos están disponibles');
    } else {
      console.log('❌ FALLO: Algunos campos siguen sin estar disponibles');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

testFixedAPI();