// Script de login automático para puerto 5004
console.log('🔄 Iniciando login automático...');

// Función para hacer login
async function autoLogin() {
  try {
    const response = await fetch('http://localhost:5004/api/auth/login', {
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
      
      // Recargar la página
      console.log('🔄 Recargando página...');
      window.location.reload();
    } else {
      console.error('❌ Error en login:', data);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
}

// Ejecutar login
autoLogin();