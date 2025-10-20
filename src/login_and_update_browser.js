const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configurar axios para usar el backend
axios.defaults.baseURL = 'http://localhost:5002/api';

async function loginAndSaveToken() {
  try {
    console.log('Iniciando sesión para obtener token válido...');
    
    // Credenciales del entrenador
    const credentials = {
      email: 'magagroca@gmail.com',
      password: 'Maga1234'
    };
    
    // Hacer login
    const response = await axios.post('/auth/login', credentials);
    console.log('Respuesta de login:', response.data);
    
    if (response.data && response.data.token) {
      const token = response.data.token;
      console.log('Token obtenido:', token);
      
      // Guardar el token en token.txt
      const tokenPath = path.join(__dirname, 'token.txt');
      fs.writeFileSync(tokenPath, token);
      console.log('Token guardado en token.txt');
      
      // Generar código para ejecutar en el navegador
      const browserCode = `
// Ejecutar este código en la consola del navegador
localStorage.setItem('token', '${token}');
localStorage.setItem('user', JSON.stringify({
  id: '${response.data.user?.id || 'cmbh8k2h00000f5z8kprejtsP'}',
  email: '${response.data.user?.email || 'magagroca@gmail.com'}',
  name: '${response.data.user?.name || 'Maga'}',
  role: '${response.data.user?.role || 'trainer'}',
  hasCompletedOnboarding: true,
  token: '${token}'
}));
console.log('Token y usuario actualizados en localStorage');
console.log('Token guardado:', localStorage.getItem('token'));
console.log('Usuario guardado:', localStorage.getItem('user'));

// Recargar la página para que tome efecto
window.location.reload();
      `;
      
      console.log('\n=== CÓDIGO PARA EJECUTAR EN LA CONSOLA DEL NAVEGADOR ===');
      console.log(browserCode);
      console.log('=== FIN DEL CÓDIGO ===\n');
      
      console.log('Instrucciones:');
      console.log('1. Abre el navegador en http://localhost:5173/trainer/dashboard');
      console.log('2. Abre las herramientas de desarrollador (F12)');
      console.log('3. Ve a la pestaña "Console"');
      console.log('4. Copia y pega el código de arriba');
      console.log('5. Presiona Enter para ejecutarlo');
      console.log('6. La página se recargará automáticamente y deberías ver los clientes');
      
    } else {
      console.error('Error: No se pudo obtener el token del login');
    }
    
  } catch (error) {
    console.error('Error durante el login:', error.response?.data || error.message);
  }
}

loginAndSaveToken();