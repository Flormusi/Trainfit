// Script para verificar qué usuario está logueado actualmente
console.log('🔍 Verificando usuario actual...');

// Verificar localStorage
const token = localStorage.getItem('token');
const userData = localStorage.getItem('user');

console.log('Token presente:', !!token);
console.log('Datos de usuario:', userData ? JSON.parse(userData) : 'No hay datos');

if (userData) {
  const user = JSON.parse(userData);
  console.log('Usuario actual:');
  console.log('- Nombre:', user.name);
  console.log('- Email:', user.email);
  console.log('- Rol:', user.role);
  console.log('- ID:', user.id);
}

// Verificar si hay contexto de React disponible
if (window.React && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
  console.log('React DevTools disponible - verificando contexto...');
}

// Función para hacer logout y login con Maga
window.loginAsMaga = async function() {
  try {
    console.log('🔄 Haciendo logout...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    console.log('🔑 Intentando login como Maga...');
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'magagroca@gmail.com',
        password: 'password123'
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      console.log('✅ Login exitoso como Maga');
      console.log('Recargando página...');
      window.location.reload();
    } else {
      console.error('❌ Error en login:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

console.log('💡 Para cambiar a Maga, ejecuta: loginAsMaga()');