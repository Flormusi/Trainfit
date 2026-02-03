// Script para hacer login como entrenador
console.log('🔐 === LOGIN COMO ENTRENADOR ===');

// Función para hacer login como entrenador
async function loginAsTrainer() {
  try {
    console.log('🔄 Iniciando login como entrenador...');
    
    const response = await fetch('http://localhost:5002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'trainer.test@trainfit.com',
        password: 'password123'
      })
    });

    console.log('📡 Status de respuesta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('📡 Respuesta del login:', data);

    if (data.success && data.token) {
      // Limpiar localStorage anterior
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Guardar nuevo token
      localStorage.setItem('token', data.token);
      
      // Guardar datos del usuario
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        token: data.token
      };
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('✅ Login exitoso como entrenador!');
      console.log('👤 Usuario:', {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role
      });
      console.log('🎫 Token guardado:', data.token.substring(0, 30) + '...');
      
      // Verificar que se guardó correctamente
      console.log('\n🔍 Verificando localStorage:');
      console.log('- Token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
      console.log('- User:', localStorage.getItem('user') ? 'Presente' : 'Ausente');
      
      console.log('\n💡 Ahora puedes acceder a las rutas de entrenador.');
      console.log('🔄 Recarga la página o navega a /trainer/clients');
      
      return true;
    } else {
      console.error('❌ Error en login:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error);
    console.log('🔧 Verifica que el backend esté ejecutándose en puerto 5002');
    return false;
  }
}

// Ejecutar el login automáticamente
loginAsTrainer().then(success => {
  if (success) {
    console.log('\n🎉 ¡Login completado exitosamente!');
    console.log('💡 Puedes recargar la página ahora.');
  } else {
    console.log('\n❌ Login falló. Revisa los logs anteriores.');
  }
});