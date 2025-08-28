const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configurar axios
axios.defaults.baseURL = 'http://localhost:5002/api';

async function main() {
  try {
    // Leer el token
    const tokenPath = path.join(__dirname, 'src', 'token.txt');
    const token = fs.readFileSync(tokenPath, 'utf8').trim();
    console.log('Token leído correctamente');
    
    // Hacer la solicitud
    const response = await axios.get('/trainer/routines', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Tipo de datos de response.data:', Array.isArray(response.data) ? 'Array' : typeof response.data);
    console.log('Estructura de response.data:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();