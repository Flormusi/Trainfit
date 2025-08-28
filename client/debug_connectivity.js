// Script de depuración de conectividad
console.log('🔧 Iniciando depuración de conectividad...');

async function testConnectivity() {
  console.log('📍 Configuración actual:');
  console.log('- Cliente: http://localhost:5174');
  console.log('- Backend: http://localhost:5004');
  
  // Test 1: Verificar si el backend responde
  console.log('\n🧪 Test 1: Verificando conectividad básica...');
  try {
    const response = await fetch('http://localhost:5004/api/auth/login', {
      method: 'OPTIONS'
    });
    console.log('✅ Backend responde a OPTIONS:', response.status);
  } catch (error) {
    console.error('❌ Backend no responde:', error.message);
    return;
  }
  
  // Test 2: Verificar CORS
  console.log('\n🧪 Test 2: Verificando CORS...');
  try {
    const response = await fetch('http://localhost:5004/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test'
      })
    });
    console.log('✅ CORS configurado correctamente, status:', response.status);
  } catch (error) {
    console.error('❌ Error de CORS:', error.message);
  }
  
  // Test 3: Verificar localStorage
  console.log('\n🧪 Test 3: Verificando localStorage...');
  console.log('- Token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
  console.log('- User:', localStorage.getItem('user') ? 'Presente' : 'Ausente');
  
  // Test 4: Verificar cliente específico
  console.log('\n🧪 Test 4: Verificando acceso al cliente específico...');
  const clientId = 'cmcxkgizo0002f5ljs8ubspxn';
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      const response = await fetch(`http://localhost:5004/api/trainer/clients/${clientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Cliente encontrado:', data);
      } else {
        console.log('⚠️ Cliente no encontrado o sin permisos, status:', response.status);
        const errorData = await response.text();
        console.log('Error:', errorData);
      }
    } catch (error) {
      console.error('❌ Error al obtener cliente:', error.message);
    }
  } else {
    console.log('⚠️ No hay token, ejecuta el script de login primero');
  }
}

testConnectivity();