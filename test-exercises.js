// Script de prueba para verificar la funcionalidad de ejercicios por objetivo
const axios = require('axios');

// Configurar la URL base
const baseURL = 'http://localhost:5002/api';

// Función para probar el login y obtener token
async function testLogin() {
  try {
    // Intentar login con credenciales de prueba
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      email: 'test.trainer@trainfit.com', // Cambiar por credenciales válidas
      password: 'test123'
    });
    
    console.log('Login exitoso:', loginResponse.data);
    return loginResponse.data.token;
  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message);
    return null;
  }
}

// Función para probar obtener ejercicios por objetivo
async function testExercisesByObjective(token, objective) {
  try {
    const response = await axios.get(`${baseURL}/trainer/exercises`, {
      params: { objective },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`\n=== Ejercicios para objetivo: ${objective} ===`);
    console.log('Respuesta:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error(`Error obteniendo ejercicios para ${objective}:`, error.response?.data || error.message);
    return null;
  }
}

// Función principal
async function main() {
  console.log('🔍 Probando funcionalidad de ejercicios por objetivo...');
  
  // Paso 1: Login
  const token = await testLogin();
  if (!token) {
    console.log('❌ No se pudo obtener token. Verifica las credenciales.');
    return;
  }
  
  // Paso 2: Probar diferentes objetivos
  const objetivos = ['fuerza', 'hipertrofia', 'resistencia-cardio', 'potencia'];
  
  for (const objetivo of objetivos) {
    await testExercisesByObjective(token, objetivo);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo entre peticiones
  }
  
  console.log('\n✅ Pruebas completadas.');
}

// Ejecutar
main().catch(console.error);