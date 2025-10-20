// Script para depurar la estructura exacta de la respuesta de la API
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configurar axios para usar la URL base correcta
axios.defaults.baseURL = 'http://localhost:5002/api';

// Función para obtener el token de autenticación
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

// Función para obtener clientes
async function getClients() {
  try {
    const token = getToken();
    if (!token) {
      console.error('No se pudo obtener el token');
      return;
    }
    
    console.log('Obteniendo clientes...');
    const response = await axios.get('/trainer/clients', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Respuesta completa:', JSON.stringify(response.data, null, 2));
    
    // Analizar la estructura de la respuesta
    console.log('\nEstructura de la respuesta:');
    console.log('- Tipo de response.data:', typeof response.data);
    
    if (typeof response.data === 'object') {
      console.log('- Propiedades de response.data:', Object.keys(response.data));
      
      if (response.data.data) {
        console.log('- Propiedades de response.data.data:', Object.keys(response.data.data));
        
        if (response.data.data.clients) {
          console.log('- response.data.data.clients es un array:', Array.isArray(response.data.data.clients));
          console.log('- Número de clientes:', response.data.data.clients.length);
          
          if (response.data.data.clients.length > 0) {
            const firstClient = response.data.data.clients[0];
            console.log('- Propiedades del primer cliente:', Object.keys(firstClient));
            console.log('- Datos del primer cliente:', JSON.stringify(firstClient, null, 2));
            
            // Buscar a Florencia
            const florencia = response.data.data.clients.find(client => 
              client.email === 'florenciamusitani@gmail.com');
            
            if (florencia) {
              console.log('\nCliente Florencia encontrado:');
              console.log(JSON.stringify(florencia, null, 2));
            } else {
              console.log('\nCliente Florencia NO encontrado.');
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error al obtener clientes:', 
      error.response ? error.response.data : error.message);
  }
}

// Función principal
async function main() {
  try {
    console.log('Iniciando depuración de estructura de API...');
    await getClients();
    console.log('\nDepuración completada.');
  } catch (error) {
    console.error('Error en la depuración:', error);
  }
}

// Ejecutar
main();