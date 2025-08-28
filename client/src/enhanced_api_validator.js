/**
 * Script mejorado para validar la estructura y funcionamiento de la API de TrainFit
 * Este script realiza pruebas exhaustivas en los endpoints principales y proporciona
 * información detallada sobre posibles problemas.
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuración
axios.defaults.baseURL = 'http://localhost:5002/api';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Función para obtener el token de autenticación
const getToken = () => {
  try {
    const tokenPath = path.join(__dirname, 'token.txt');
    if (fs.existsSync(tokenPath)) {
      return fs.readFileSync(tokenPath, 'utf8').trim();
    }
    console.log(`${colors.red}Error: No se encontró el archivo token.txt${colors.reset}`);
    console.log(`Genera un token con el script test_api_with_token.js en el directorio backend`);
    return null;
  } catch (error) {
    console.error(`${colors.red}Error al leer el token:${colors.reset}`, error);
    return null;
  }
};

// Configurar axios con el token
const configureAxios = (token) => {
  if (!token) return false;
  
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  return true;
};

// Función para validar la estructura de un objeto
const validateStructure = (obj, requiredProps, name = 'objeto') => {
  const results = {
    valid: true,
    missingProps: [],
    message: ''
  };

  if (!obj) {
    results.valid = false;
    results.message = `El ${name} es nulo o indefinido`;
    return results;
  }

  for (const prop of requiredProps) {
    if (!(prop in obj)) {
      results.valid = false;
      results.missingProps.push(prop);
    }
  }

  if (results.missingProps.length > 0) {
    results.message = `El ${name} no tiene las siguientes propiedades requeridas: ${results.missingProps.join(', ')}`;
  } else {
    results.message = `El ${name} tiene todas las propiedades requeridas`;
  }

  return results;
};

// Función para verificar la estructura de la respuesta de clientes
const verifyClientsApiStructure = async () => {
  console.log(`\n${colors.bright}${colors.blue}Verificando estructura de la API de clientes...${colors.reset}`);
  
  try {
    const response = await axios.get('/trainer/clients');
    console.log(`${colors.green}✓ Respuesta recibida de /trainer/clients${colors.reset}`);
    
    // Verificar si la respuesta es un array o tiene una propiedad data que es un array
    let clients;
    if (Array.isArray(response.data)) {
      console.log(`${colors.green}✓ La respuesta es un array${colors.reset}`);
      clients = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      console.log(`${colors.yellow}⚠ La respuesta tiene una propiedad 'data' que es un array${colors.reset}`);
      console.log(`${colors.yellow}  Esto es aceptable, pero considera estandarizar todas las respuestas${colors.reset}`);
      clients = response.data.data;
    } else {
      console.log(`${colors.red}✗ La respuesta no es un array ni tiene una propiedad 'data' que sea un array${colors.reset}`);
      console.log(`Estructura de la respuesta:`, JSON.stringify(response.data, null, 2));
      return false;
    }
    
    // Verificar si hay clientes
    if (clients.length === 0) {
      console.log(`${colors.yellow}⚠ No hay clientes en la respuesta${colors.reset}`);
      return true; // No hay clientes, pero la estructura es correcta
    }
    
    console.log(`${colors.green}✓ Se encontraron ${clients.length} clientes${colors.reset}`);
    
    // Verificar la estructura del primer cliente
    const firstClient = clients[0];
    const requiredClientProps = ['id', 'email', 'name', 'role'];
    const clientValidation = validateStructure(firstClient, requiredClientProps, 'cliente');
    
    if (clientValidation.valid) {
      console.log(`${colors.green}✓ ${clientValidation.message}${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ ${clientValidation.message}${colors.reset}`);
      console.log(`Estructura del primer cliente:`, JSON.stringify(firstClient, null, 2));
    }
    
    // Buscar cliente específico
    const targetEmail = 'florenciamusitani@gmail.com';
    const targetClient = clients.find(client => client.email === targetEmail);
    
    if (targetClient) {
      console.log(`${colors.green}✓ Cliente con email ${targetEmail} encontrado${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠ Cliente con email ${targetEmail} no encontrado${colors.reset}`);
      console.log(`Emails de clientes disponibles:`, clients.map(c => c.email).join(', '));
    }
    
    return clientValidation.valid;
  } catch (error) {
    console.log(`${colors.red}✗ Error al verificar la estructura de la API de clientes${colors.reset}`);
    if (error.response) {
      console.log(`  Status: ${error.response.status}`);
      console.log(`  Mensaje: ${error.response.data?.message || 'No hay mensaje'}`);
      console.log(`  Datos: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`  Error: ${error.message}`);
    }
    return false;
  }
};

// Función para verificar la estructura de la respuesta del dashboard
const verifyDashboardApiStructure = async () => {
  console.log(`\n${colors.bright}${colors.blue}Verificando estructura de la API del dashboard...${colors.reset}`);
  
  try {
    const response = await axios.get('/trainer/dashboard');
    console.log(`${colors.green}✓ Respuesta recibida de /trainer/dashboard${colors.reset}`);
    
    // Verificar la estructura de la respuesta
    const requiredDashboardProps = ['clientCount', 'routineCount', 'exerciseCount'];
    let dashboardData = response.data;
    
    // Si la respuesta tiene una propiedad data, usar esa
    if (response.data && response.data.data && typeof response.data.data === 'object') {
      console.log(`${colors.yellow}⚠ La respuesta tiene una propiedad 'data' anidada${colors.reset}`);
      dashboardData = response.data.data;
    }
    
    const dashboardValidation = validateStructure(dashboardData, requiredDashboardProps, 'dashboard');
    
    if (dashboardValidation.valid) {
      console.log(`${colors.green}✓ ${dashboardValidation.message}${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ ${dashboardValidation.message}${colors.reset}`);
      console.log(`Estructura de la respuesta:`, JSON.stringify(dashboardData, null, 2));
    }
    
    return dashboardValidation.valid;
  } catch (error) {
    console.log(`${colors.red}✗ Error al verificar la estructura de la API del dashboard${colors.reset}`);
    if (error.response) {
      console.log(`  Status: ${error.response.status}`);
      console.log(`  Mensaje: ${error.response.data?.message || 'No hay mensaje'}`);
      console.log(`  Datos: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`  Error: ${error.message}`);
    }
    return false;
  }
};

// Función para verificar la estructura de la respuesta de analytics
const verifyAnalyticsApiStructure = async () => {
  console.log(`\n${colors.bright}${colors.blue}Verificando estructura de la API de analytics...${colors.reset}`);
  
  try {
    const response = await axios.get('/trainer/analytics?period=week');
    console.log(`${colors.green}✓ Respuesta recibida de /trainer/analytics${colors.reset}`);
    
    // Verificar la estructura de la respuesta
    const requiredAnalyticsProps = ['routinesCreated', 'newClients', 'progressUpdates'];
    let analyticsData = response.data;
    
    // Si la respuesta tiene una propiedad data, usar esa
    if (response.data && response.data.data && typeof response.data.data === 'object') {
      console.log(`${colors.yellow}⚠ La respuesta tiene una propiedad 'data' anidada${colors.reset}`);
      analyticsData = response.data.data;
    }
    
    const analyticsValidation = validateStructure(analyticsData, requiredAnalyticsProps, 'analytics');
    
    if (analyticsValidation.valid) {
      console.log(`${colors.green}✓ ${analyticsValidation.message}${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ ${analyticsValidation.message}${colors.reset}`);
      console.log(`Estructura de la respuesta:`, JSON.stringify(analyticsData, null, 2));
    }
    
    return analyticsValidation.valid;
  } catch (error) {
    console.log(`${colors.red}✗ Error al verificar la estructura de la API de analytics${colors.reset}`);
    if (error.response) {
      console.log(`  Status: ${error.response.status}`);
      console.log(`  Mensaje: ${error.response.data?.message || 'No hay mensaje'}`);
      console.log(`  Datos: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.log(`  Error: ${error.message}`);
    }
    return false;
  }
};

// Función principal
const main = async () => {
  console.log(`${colors.bright}${colors.magenta}=== Validador Mejorado de API de TrainFit ===${colors.reset}`);
  console.log(`${colors.dim}Fecha: ${new Date().toLocaleString()}${colors.reset}\n`);
  
  // Obtener y configurar el token
  const token = getToken();
  if (!configureAxios(token)) {
    return;
  }
  
  // Verificar la estructura de las APIs
  const clientsValid = await verifyClientsApiStructure();
  const dashboardValid = await verifyDashboardApiStructure();
  const analyticsValid = await verifyAnalyticsApiStructure();
  
  // Resumen
  console.log(`\n${colors.bright}${colors.magenta}=== Resumen de Validación ===${colors.reset}`);
  console.log(`${clientsValid ? colors.green : colors.red}Clientes API: ${clientsValid ? 'VÁLIDO' : 'INVÁLIDO'}${colors.reset}`);
  console.log(`${dashboardValid ? colors.green : colors.red}Dashboard API: ${dashboardValid ? 'VÁLIDO' : 'INVÁLIDO'}${colors.reset}`);
  console.log(`${analyticsValid ? colors.green : colors.red}Analytics API: ${analyticsValid ? 'VÁLIDO' : 'INVÁLIDO'}${colors.reset}`);
  
  const allValid = clientsValid && dashboardValid && analyticsValid;
  console.log(`\n${allValid ? colors.green : colors.red}${colors.bright}Resultado final: ${allValid ? 'TODAS LAS APIS SON VÁLIDAS' : 'HAY PROBLEMAS EN ALGUNAS APIS'}${colors.reset}`);
  
  if (!allValid) {
    console.log(`\n${colors.yellow}Recomendaciones:${colors.reset}`);
    if (!clientsValid) {
      console.log(`- Revisa la estructura de la respuesta de /trainer/clients`);
      console.log(`  Debe ser un array de objetos con las propiedades: id, email, name, role`);
    }
    if (!dashboardValid) {
      console.log(`- Revisa la estructura de la respuesta de /trainer/dashboard`);
      console.log(`  Debe ser un objeto con las propiedades: clientCount, routineCount, exerciseCount`);
    }
    if (!analyticsValid) {
      console.log(`- Revisa la estructura de la respuesta de /trainer/analytics`);
      console.log(`  Debe ser un objeto con las propiedades: routinesCreated, newClients, progressUpdates`);
    }
    console.log(`\n${colors.cyan}Consulta el archivo API_RECOMMENDATIONS.md para más información sobre cómo mejorar la API.${colors.reset}`);
  }
};

// Ejecutar la función principal
main().catch(error => {
  console.error(`${colors.red}Error en la ejecución principal:${colors.reset}`, error);
});