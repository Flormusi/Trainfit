const fs = require('fs');
const path = require('path');

// Script para actualizar el token en localStorage del navegador
// Este script debe ejecutarse en la consola del navegador

function updateBrowserToken() {
  try {
    // Leer el token desde el archivo token.txt
    const tokenPath = path.join(__dirname, 'token.txt');
    
    if (fs.existsSync(tokenPath)) {
      const token = fs.readFileSync(tokenPath, 'utf8').trim();
      console.log('Token leído desde archivo:', token);
      
      // Generar el código JavaScript para ejecutar en el navegador
      const browserCode = `
// Ejecutar este código en la consola del navegador
localStorage.setItem('token', '${token}');
console.log('Token actualizado en localStorage');
console.log('Token guardado:', localStorage.getItem('token'));

// También actualizar el header de autorización de axios si está disponible
if (typeof axios !== 'undefined') {
  axios.defaults.headers.common['Authorization'] = 'Bearer ${token}';
  console.log('Header de autorización actualizado para axios');
}

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
      console.log('6. La página se recargará automáticamente');
      
    } else {
      console.error('El archivo token.txt no existe');
    }
  } catch (error) {
    console.error('Error al leer el token:', error.message);
  }
}

updateBrowserToken();