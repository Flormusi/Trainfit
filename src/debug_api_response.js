// Este script es para depuración y se puede eliminar después

// Importar axios para hacer solicitudes HTTP
const axios = require('axios');

// Configurar axios para usar la URL base correcta
axios.defaults.baseURL = 'http://localhost:5002/api';

// Función para obtener el token de autenticación
const fs = require('fs');
const path = require('path');

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
      // Token simulado como fallback
      return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwicm9sZSI6IlRSQUlORVIiLCJlbWFpbCI6Im1hZ2Fncm9jYUBnbWFpbC5jb20iLCJpYXQiOjE2MTYxNjI4MDAsImV4cCI6MTYxNjE2NjQwMH0.token_simulado_para_pruebas';
    }
  } catch (error) {
    console.error('Error al leer el token:', error.message);
    // Token simulado como fallback
    return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwicm9sZSI6IlRSQUlORVIiLCJlbWFpbCI6Im1hZ2Fncm9jYUBnbWFpbC5jb20iLCJpYXQiOjE2MTYxNjI4MDAsImV4cCI6MTYxNjE2NjQwMH0.token_simulado_para_pruebas';
  }
}

// Configurar axios para incluir el token en todas las solicitudes
axios.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Función para iniciar sesión y obtener un token válido
async function login() {
  try {
    console.log('Intentando iniciar sesión...');
    const credentials = {
      email: 'magagroca@gmail.com',
      password: 'Maga1234' // Intenta con esta contraseña
    };
    
    const response = await axios.post('/auth/login', credentials);
    console.log('Respuesta de login:', response.data);
    
    if (response.data && response.data.token) {
      // Actualizar el token para las siguientes solicitudes
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      console.log('Token actualizado para las siguientes solicitudes');
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
      
      // Buscar específicamente el cliente con email florenciamusitani@gmail.com
      const florenciaClient = response.data.find(client => client.email === 'florenciamusitani@gmail.com');
      if (florenciaClient) {
        console.log('Cliente florenciamusitani@gmail.com encontrado en response.data:', florenciaClient);
      } else {
        console.log('Cliente florenciamusitani@gmail.com NO encontrado en response.data');
        
        // Mostrar todos los emails de clientes para verificar
        console.log('Emails de clientes en response.data:');
        response.data.forEach(client => {
          console.log('- Email:', client.email);
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
    }
    return [];
  }
}

// Función principal que ejecuta todo el proceso
async function main() {
  try {
    console.log('Iniciando proceso de depuración...');
    
    // Obtener el token desde el archivo token.txt
    const fileToken = getToken();
    if (fileToken) {
      console.log('Usando token del archivo token.txt');
      axios.defaults.headers.common['Authorization'] = `Bearer ${fileToken}`;
    } else {
      // Si no hay token en el archivo, intentamos iniciar sesión
      console.log('No se encontró token en archivo, intentando login...');
      const loginToken = await login();
      if (!loginToken) {
        console.error('No se pudo obtener un token válido mediante login.');
      }
    }
    
    // Luego obtenemos los clientes
    console.log('Configuración de autorización actual:', axios.defaults.headers.common['Authorization']);
    const clients = await getClients();
    
    console.log('Proceso completado.');
  } catch (error) {
    console.error('Error en el proceso principal:', error);
  }
}

// Ejecutar la función principal
main();