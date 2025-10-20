// Script para solucionar el problema del token JWT
console.log('🔧 Solucionando problema de token JWT...');

// Función para hacer login y obtener token válido
async function fixTokenIssue() {
  try {
    console.log('🔐 Haciendo login para obtener token válido...');
    
    // Limpiar tokens existentes
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('🧹 Tokens anteriores eliminados');
    
    // Hacer login con credenciales válidas
    const response = await fetch('http://localhost:5002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'magagroca@gmail.com',
        password: 'magaroca'
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📡 Respuesta del login:', data);
    
    if (data.success && data.token) {
      // Guardar token y usuario en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      console.log('✅ Token válido guardado en localStorage');
      console.log('🔑 Token:', data.token.substring(0, 30) + '...');
      console.log('👤 Usuario:', data.user);
      
      // Probar el token con la API de rutinas
      console.log('\n🧪 Probando token con API de rutinas...');
      
      const routinesResponse = await fetch('http://localhost:5002/api/trainer/routines', {
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (routinesResponse.ok) {
        const routinesData = await routinesResponse.json();
        console.log('✅ API de rutinas funciona correctamente:', routinesData);
        
        // Recargar la página para aplicar cambios
        console.log('\n🔄 Recargando página para aplicar cambios...');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        console.error('❌ Error al probar API de rutinas:', routinesResponse.status);
      }
    } else {
      console.error('❌ Login falló:', data.message || 'Error desconocido');
    }
  } catch (error) {
    console.error('❌ Error durante el proceso:', error);
  }
}

// Ejecutar la función
fixTokenIssue();

console.log('\n📋 Instrucciones:');
console.log('1. Abre el navegador en http://localhost:5173');
console.log('2. Abre las herramientas de desarrollador (F12)');
console.log('3. Ve a la pestaña Console');
console.log('4. Copia y pega este script completo');
console.log('5. Presiona Enter para ejecutarlo');
console.log('6. La página se recargará automáticamente con el token correcto');