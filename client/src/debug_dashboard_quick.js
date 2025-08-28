// Script para verificar rápidamente el estado del dashboard
console.log('=== VERIFICACIÓN RÁPIDA DEL DASHBOARD ===');

// 1. Verificar token
const token = localStorage.getItem('token');
console.log('Token presente:', !!token);
console.log('Token (primeros 20 chars):', token ? token.substring(0, 20) + '...' : 'NO HAY TOKEN');

// 2. Verificar usuario
const user = localStorage.getItem('user');
console.log('Usuario presente:', !!user);
if (user) {
  try {
    const userData = JSON.parse(user);
    console.log('Usuario:', userData.name, userData.email);
  } catch (e) {
    console.log('Error parseando usuario:', e);
  }
}

// 3. Hacer llamada directa a la API de clientes
if (token) {
  console.log('=== PROBANDO API DE CLIENTES ===');
  fetch('http://localhost:5002/api/trainer/clients', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('Status de respuesta:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Respuesta de clientes:', data);
    if (data && data.data && Array.isArray(data.data)) {
      console.log('Número de clientes:', data.data.length);
      if (data.data.length > 0) {
        console.log('Primer cliente:', data.data[0]);
      }
    }
  })
  .catch(error => {
    console.error('Error en API de clientes:', error);
  });
} else {
  console.log('❌ NO HAY TOKEN - No se puede hacer la llamada a la API');
}

// 4. Verificar si estamos en la página correcta
console.log('URL actual:', window.location.href);
console.log('Pathname:', window.location.pathname);