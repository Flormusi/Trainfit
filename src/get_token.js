// Script para obtener un token de autenticación mediante inicio de sesión
const axios = require('axios');
const fs = require('fs');

// Configurar axios para usar la URL base correcta
axios.defaults.baseURL = 'http://127.0.0.1:5002/api';

// Credenciales de un entrenador (reemplaza con credenciales válidas)
const credentials = {
  email: 'magagroca@gmail.com', // Reemplaza con el email del entrenador
  password: 'Maga1234' // Probando con otra contraseña
};

async function getToken() {
  try {
    console.log('Intentando iniciar sesión con:', credentials.email);
    const response = await axios.post('/auth/login', credentials);
    
    if (response.data && response.data.token) {
      const token = response.data.token;
      console.log('Token obtenido correctamente');
      
      // Guardar el token en un archivo
      fs.writeFileSync('./token.txt', token);
      console.log('Token guardado en token.txt');
      
      return token;
    } else {
      console.error('No se recibió un token en la respuesta:', response.data);
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
    }
  }
}

// Ejecutar la función
getToken();