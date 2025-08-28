// Script de login automático para configuración estándar
console.log('🔄 Iniciando login automático con configuración estándar...');
console.log('📍 Frontend: http://localhost:5173');
console.log('📍 Backend: http://localhost:5002');

// Función para hacer login
async function autoLogin() {
  try {
    console.log('🔐 Intentando login...');
    
    const response = await fetch('http://localhost:5002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'trainer@example.com',
        password: 'password123'
      })
    });

    console.log('📡 Status de respuesta:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('📡 Respuesta del login:', data);

    if (data.success && data.token) {
      // Guardar token
      localStorage.setItem('token', data.token);
      
      // Guardar datos del usuario
      const userData = {
        ...data.user,
        token: data.token
      };
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('✅ Login exitoso! Token guardado:', data.token.substring(0, 20) + '...');
      console.log('👤 Usuario:', data.user);
      
      // Verificar que se guardó correctamente
      console.log('🔍 Verificando localStorage:');
      console.log('- Token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
      console.log('- User:', localStorage.getItem('user') ? 'Presente' : 'Ausente');
      
      // Recargar la página
      console.log('🔄 Recargando página...');
      window.location.reload();
    } else {
      console.error('❌ Error en login:', data);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    console.log('🔧 Verifica que el backend esté ejecutándose en puerto 5002');
  }
}

// Función para verificar el estado actual
function checkCurrentState() {
  console.log('🔍 Estado actual:');
  console.log('- URL actual:', window.location.href);
  console.log('- Token en localStorage:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
  console.log('- User en localStorage:', localStorage.getItem('user') ? 'Presente' : 'Ausente');
}

// Verificar estado actual primero
checkCurrentState();

// Ejecutar login
autoLogin();