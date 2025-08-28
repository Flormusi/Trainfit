/**
 * Pruebas de integración para la comunicación entre frontend y backend
 * Este script verifica que el frontend pueda comunicarse correctamente con la API
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// URL base de la API (ajustar según el entorno)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Función para leer el token de prueba
const getTestToken = () => {
  try {
    const tokenPath = path.join(__dirname, '..', 'token.txt');
    if (fs.existsSync(tokenPath)) {
      return fs.readFileSync(tokenPath, 'utf8').trim();
    }
    return null;
  } catch (error) {
    console.error('Error al leer el token de prueba:', error);
    return null;
  }
};

// Cliente HTTP configurado con el token de autenticación
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Configurar interceptor para agregar el token a las solicitudes
apiClient.interceptors.request.use((config) => {
  const token = getTestToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Función para ejecutar las pruebas
const runIntegrationTests = async () => {
  console.log('Iniciando pruebas de integración...');
  console.log(`URL de la API: ${API_URL}`);
  
  const token = getTestToken();
  if (!token) {
    console.error('No se encontró un token de prueba. Ejecute primero test_api_with_token.js');
    process.exit(1);
  }
  
  console.log('Token de prueba encontrado ✓');
  
  // Resultados de las pruebas
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: [],
  };
  
  // Función auxiliar para ejecutar y registrar una prueba
  const runTest = async (name, testFn) => {
    results.total++;
    try {
      console.log(`Ejecutando: ${name}...`);
      await testFn();
      console.log(`✅ PASÓ: ${name}`);
      results.passed++;
      results.tests.push({ name, status: 'passed' });
    } catch (error) {
      console.error(`❌ FALLÓ: ${name}`);
      console.error(`   Error: ${error.message}`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      results.failed++;
      results.tests.push({ 
        name, 
        status: 'failed', 
        error: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : null
      });
    }
  };
  
  // Prueba 1: Verificar que el servidor esté en línea
  await runTest('Verificar estado del servidor', async () => {
    const response = await apiClient.get('/health');
    if (response.status !== 200 || !response.data.status === 'ok') {
      throw new Error('El servidor no está respondiendo correctamente');
    }
  });
  
  // Prueba 2: Verificar autenticación con el token
  await runTest('Verificar autenticación', async () => {
    const response = await apiClient.get('/trainer/profile');
    if (response.status !== 200 || !response.data.success) {
      throw new Error('Fallo en la autenticación con el token proporcionado');
    }
  });
  
  // Prueba 3: Verificar obtención de datos del dashboard
  await runTest('Obtener datos del dashboard', async () => {
    const response = await apiClient.get('/trainer/dashboard');
    if (response.status !== 200) {
      throw new Error('No se pudieron obtener los datos del dashboard');
    }
    
    // Verificar estructura de la respuesta
    const data = response.data;
    if (!data.hasOwnProperty('clientCount') || 
        !data.hasOwnProperty('routineCount') || 
        !data.hasOwnProperty('exerciseCount')) {
      throw new Error('La estructura de la respuesta del dashboard no es correcta');
    }
  });
  
  // Prueba 4: Verificar obtención de clientes
  await runTest('Obtener lista de clientes', async () => {
    const response = await apiClient.get('/trainer/clients');
    if (response.status !== 200 || !response.data.success) {
      throw new Error('No se pudieron obtener los clientes');
    }
    
    // Verificar estructura de la respuesta
    const data = response.data.data;
    if (!Array.isArray(data.clients) || !data.hasOwnProperty('pagination')) {
      throw new Error('La estructura de la respuesta de clientes no es correcta');
    }
  });
  
  // Prueba 5: Verificar obtención de ejercicios
  await runTest('Obtener lista de ejercicios', async () => {
    const response = await apiClient.get('/trainer/exercises');
    if (response.status !== 200 || !response.data.success) {
      throw new Error('No se pudieron obtener los ejercicios');
    }
    
    // Verificar estructura de la respuesta
    const data = response.data.data;
    if (!Array.isArray(data.exercises) || !data.hasOwnProperty('pagination')) {
      throw new Error('La estructura de la respuesta de ejercicios no es correcta');
    }
  });
  
  // Prueba 6: Verificar obtención de rutinas
  await runTest('Obtener lista de rutinas', async () => {
    const response = await apiClient.get('/trainer/routines');
    if (response.status !== 200 || !response.data.success) {
      throw new Error('No se pudieron obtener las rutinas');
    }
    
    // Verificar estructura de la respuesta
    const data = response.data.data;
    if (!Array.isArray(data.routines) || !data.hasOwnProperty('pagination')) {
      throw new Error('La estructura de la respuesta de rutinas no es correcta');
    }
  });
  
  // Prueba 7: Verificar obtención de analíticas
  await runTest('Obtener datos de analíticas', async () => {
    const response = await apiClient.get('/trainer/analytics');
    if (response.status !== 200 || !response.data.success) {
      throw new Error('No se pudieron obtener los datos de analíticas');
    }
    
    // Verificar estructura de la respuesta
    const data = response.data.data;
    if (!data.hasOwnProperty('routinesCreated') || 
        !data.hasOwnProperty('newClients') || 
        !data.hasOwnProperty('progressUpdates')) {
      throw new Error('La estructura de la respuesta de analíticas no es correcta');
    }
  });
  
  // Prueba 8: Verificar manejo de errores (ruta inexistente)
  await runTest('Verificar manejo de errores (ruta inexistente)', async () => {
    try {
      await apiClient.get('/ruta-inexistente');
      throw new Error('La solicitud a una ruta inexistente no falló como se esperaba');
    } catch (error) {
      if (!error.response || error.response.status !== 404) {
        throw new Error(`Se esperaba un error 404, pero se recibió: ${error.response ? error.response.status : 'sin respuesta'}`);
      }
      // La prueba pasa si recibimos un 404
    }
  });
  
  // Mostrar resumen de resultados
  console.log('\n===== RESUMEN DE PRUEBAS DE INTEGRACIÓN =====');
  console.log(`Total de pruebas: ${results.total}`);
  console.log(`Pruebas exitosas: ${results.passed}`);
  console.log(`Pruebas fallidas: ${results.failed}`);
  console.log('==========================================\n');
  
  // Guardar resultados en un archivo
  const resultsPath = path.join(__dirname, 'integration_test_results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`Resultados guardados en: ${resultsPath}`);
  
  return results;
};

// Ejecutar las pruebas si este archivo se ejecuta directamente
if (require.main === module) {
  runIntegrationTests()
    .then((results) => {
      if (results.failed > 0) {
        process.exit(1); // Salir con error si alguna prueba falló
      }
    })
    .catch((error) => {
      console.error('Error al ejecutar las pruebas de integración:', error);
      process.exit(1);
    });
}

module.exports = {
  runIntegrationTests,
  apiClient,
};