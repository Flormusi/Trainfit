// Script para depurar la estructura de la respuesta de getRoutines
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

// Función para obtener rutinas
async function getRoutines() {
  try {
    const token = getToken();
    if (!token) {
      console.error('No se pudo obtener el token');
      return;
    }
    
    console.log('Obteniendo rutinas...');
    const response = await axios.get('/trainer/routines', {
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
        
        if (response.data.data.routines) {
          console.log('- response.data.data.routines es un array:', Array.isArray(response.data.data.routines));
          console.log('- Número de rutinas:', response.data.data.routines.length);
          
          if (response.data.data.routines.length > 0) {
            const firstRoutine = response.data.data.routines[0];
            console.log('- Propiedades de la primera rutina:', Object.keys(firstRoutine));
            console.log('- Datos de la primera rutina:', JSON.stringify(firstRoutine, null, 2));
          }
        }
      }
    }
    
  } catch (error) {
    console.error('Error al obtener rutinas:', 
      error.response ? error.response.data : error.message);
  }
}

// Función principal
async function main() {
  try {
    console.log('Iniciando depuración de estructura de API getRoutines...');
    await getRoutines();
    console.log('\nDepuración completada.');
  } catch (error) {
    console.error('Error en la depuración:', error);
  }
}

// Ejecutar
main();