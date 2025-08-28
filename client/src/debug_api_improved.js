// Script mejorado para depurar la API de TrainFit

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configurar axios para usar la URL base correcta
axios.defaults.baseURL = 'http://localhost:5002/api';

// Función para obtener el token de autenticación desde el archivo token.txt
const getToken = () => {
  try {
    // Leer el token desde el archivo token.txt
    const tokenPath = path.join(__dirname, 'token.txt');
    if (fs.existsSync(tokenPath)) {
      const token = fs.readFileSync(tokenPath, 'utf8').trim();
      console.log('Token leído desde archivo token.txt');
      return token;
    } else {
      console.error('El archivo token.txt no existe');
      return null;
    }
  } catch (error) {
    console.error('Error al leer el token:', error.message);
    return null;
  }
};

// Configurar axios para incluir el token en todas las solicitudes
axios.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Función para iniciar sesión y obtener un token válido
async function login(email, password) {
  try {
    console.log(`Intentando iniciar sesión con ${email}...`);
    const credentials = { email, password };
    
    const response = await axios.post('/auth/login', credentials);
    console.log('Respuesta de login:', response.data);
    
    if (response.data && response.data.token) {
      // Actualizar el token para las siguientes solicitudes
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      console.log('Token actualizado para las siguientes solicitudes');
      
      // Guardar el token en token.txt para futuras ejecuciones
      const tokenPath = path.join(__dirname, 'token.txt');
      fs.writeFileSync(tokenPath, response.data.token);
      console.log('Token guardado en token.txt');
      
      return response.data.token;
    } else {
      console.error('No se recibió un token en la respuesta de login');
      return null;
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
    }
    return null;
  }
}

// Función para obtener los clientes del entrenador
async function getClients() {
  try {
    console.log('Obteniendo clientes...');
    const response = await axios.get('/trainer/clients');
    console.log('Respuesta completa:', response.status, response.statusText);
    console.log('Headers:', response.headers);
    
    // Verificar la estructura de la respuesta
    console.log('Tipo de response.data:', typeof response.data);
    console.log('response.data es un array:', Array.isArray(response.data));
    
    if (Array.isArray(response.data)) {
      console.log('Número de clientes en response.data:', response.data.length);
      
      // Mostrar información resumida de todos los clientes
      console.log('\nResumen de clientes:');
      response.data.forEach((client, index) => {
        console.log(`\nCliente #${index + 1}:`);
        console.log(`- ID: ${client.id}`);
        console.log(`- Email: ${client.email}`);
        console.log(`- Nombre: ${client.name}`);
        console.log(`- Rol: ${client.role}`);
        console.log(`- Rutinas asignadas: ${client.assignedRoutines?.length || 0}`);
        console.log(`- Planes de nutrición asignados: ${client.assignedNutritionPlans?.length || 0}`);
      });
      
      // Buscar específicamente el cliente con email florenciamusitani@gmail.com
      const florenciaClient = response.data.find(client => client.email === 'florenciamusitani@gmail.com');
      if (florenciaClient) {
        console.log('\nCliente florenciamusitani@gmail.com encontrado:');
        console.log(JSON.stringify(florenciaClient, null, 2));
      } else {
        console.log('\nCliente florenciamusitani@gmail.com NO encontrado');
        
        // Mostrar todos los emails de clientes para verificar
        console.log('\nEmails de clientes disponibles:');
        response.data.forEach(client => {
          console.log(`- ${client.email}`);
        });
      }
    } else {
      console.log('response.data no es un array, contenido:', response.data);
    }
    return response.data;
  } catch (error) {
    console.error('Error al obtener clientes:', error.message);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
    return [];
  }
}

// Función para obtener los datos del dashboard
async function getDashboardData() {
  try {
    console.log('Obteniendo datos del dashboard...');
    const response = await axios.get('/trainer/dashboard');
    console.log('Respuesta completa:', response.status, response.statusText);
    
    // Verificar la estructura de la respuesta
    console.log('Tipo de response.data:', typeof response.data);
    console.log('Estructura de response.data:', Object.keys(response.data));
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener datos del dashboard:', error.message);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
    }
    return null;
  }
}

// Función para obtener las analíticas
async function getAnalytics() {
  try {
    console.log('Obteniendo analíticas...');
    const response = await axios.get('/trainer/analytics');
    console.log('Respuesta completa:', response.status, response.statusText);
    
    // Verificar la estructura de la respuesta
    console.log('Tipo de response.data:', typeof response.data);
    console.log('Estructura de response.data:', Object.keys(response.data));
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener analíticas:', error.message);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
    }
    return null;
  }
}

// Función principal que ejecuta todo el proceso
async function main() {
  try {
    console.log('=== INICIANDO DEPURACIÓN DE API TRAINFIT ===');
    console.log('Fecha y hora:', new Date().toLocaleString());
    console.log('URL base:', axios.defaults.baseURL);
    
    // Obtener el token desde el archivo token.txt
    const fileToken = getToken();
    if (fileToken) {
      console.log('\nUsando token del archivo token.txt');
      axios.defaults.headers.common['Authorization'] = `Bearer ${fileToken}`;
    } else {
      // Si no hay token en el archivo, intentamos iniciar sesión
      console.log('\nNo se encontró token en archivo, intentando login...');
      const loginToken = await login('magagroca@gmail.com', 'Maga1234');
      if (!loginToken) {
        console.error('No se pudo obtener un token válido mediante login.');
        console.log('Ejecuta el script test_api_with_token.js en el backend para generar un token válido.');
        return;
      }
    }
    
    console.log('\n=== OBTENIENDO CLIENTES ===');
    console.log('Configuración de autorización actual:', axios.defaults.headers.common['Authorization']);
    const clients = await getClients();
    
    console.log('\n=== OBTENIENDO DATOS DEL DASHBOARD ===');
    const dashboardData = await getDashboardData();
    
    console.log('\n=== OBTENIENDO ANALÍTICAS ===');
    const analytics = await getAnalytics();
    
    console.log('\n=== DEPURACIÓN COMPLETADA ===');
    console.log(`Clientes obtenidos: ${Array.isArray(clients) ? clients.length : 0}`);
    console.log(`Datos del dashboard obtenidos: ${dashboardData ? 'Sí' : 'No'}`);
    console.log(`Analíticas obtenidas: ${analytics ? 'Sí' : 'No'}`);
  } catch (error) {
    console.error('\nError en el proceso principal:', error);
  }
}

// Ejecutar la función principal
main();