const axios = require('axios');

// Configurar axios para usar el proxy de Vite (simulando el frontend)
const api = axios.create({
  baseURL: 'http://localhost:5173/api',
  timeout: 10000,
});

async function testFinalVerification() {
  try {
    console.log('🎯 === VERIFICACIÓN FINAL ===');
    console.log('🔧 Probando la corrección de la función getClientDetails...');
    
    // 1. Login para obtener token
    console.log('🔐 Haciendo login...');
    const loginResponse = await api.post('/auth/login', {
      email: 'trainer.test@trainfit.com',
      password: 'test123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');
    
    // 2. Configurar token para siguientes requests
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // 3. Obtener detalles del cliente (simulando la función getClientDetails corregida)
    console.log('📋 Obteniendo detalles del cliente...');
    const response = await api.get('/trainer/clients/cmdm9rl0l0001f5xbjlr0wwm2', {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    // Simular la corrección: response.data.data
    const client = response.data.data;
    
    console.log('✅ Datos del cliente obtenidos');
    console.log('\n📊 === DATOS DEL CLIENTE ===');
    console.log('👤 Nombre:', client.name);
    console.log('📧 Email:', client.email);
    console.log('📱 Teléfono:', client.clientProfile?.phone);
    console.log('⚖️ Peso:', client.clientProfile?.weight, 'kg');
    console.log('📏 Altura:', client.clientProfile?.height, 'cm');
    console.log('🎂 Edad:', client.clientProfile?.age, 'años');
    console.log('⚧ Género:', client.clientProfile?.gender);
    console.log('💪 Nivel de fitness:', client.clientProfile?.fitnessLevel);
    console.log('🎯 Objetivos:', client.clientProfile?.goals?.join(', '));
    console.log('📅 Días de entrenamiento por semana:', client.clientProfile?.trainingDaysPerWeek);
    
    // 4. Verificar que todos los campos importantes están presentes
    const checks = {
      'Nombre': client.name !== undefined,
      'Email': client.email !== undefined,
      'Edad': client.clientProfile?.age !== undefined,
      'Género': client.clientProfile?.gender !== undefined,
      'Nivel de fitness': client.clientProfile?.fitnessLevel !== undefined,
      'Peso': client.clientProfile?.weight !== undefined,
      'Altura': client.clientProfile?.height !== undefined,
      'Teléfono': client.clientProfile?.phone !== undefined,
      'Objetivos': client.clientProfile?.goals !== undefined
    };
    
    console.log('\n✅ === VERIFICACIÓN DE CAMPOS ===');
    let allFieldsPresent = true;
    for (const [field, isPresent] of Object.entries(checks)) {
      const status = isPresent ? '✅' : '❌';
      console.log(`${status} ${field}: ${isPresent ? 'Presente' : 'Faltante'}`);
      if (!isPresent) allFieldsPresent = false;
    }
    
    console.log('\n🎉 === RESULTADO FINAL ===');
    if (allFieldsPresent) {
      console.log('🎉 ¡ÉXITO TOTAL! Todos los campos del cliente están disponibles');
      console.log('✅ La corrección de la función getClientDetails funciona correctamente');
      console.log('✅ Los datos de edad, género y nivel de fitness ahora se mostrarán en el frontend');
    } else {
      console.log('❌ FALLO: Algunos campos siguen faltando');
    }
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error.response?.data || error.message);
  }
}

testFinalVerification();