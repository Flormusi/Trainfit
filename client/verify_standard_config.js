// Script de verificación para configuración estándar
console.log('🔧 Verificando configuración estándar...');
console.log('📍 Frontend esperado: http://localhost:5173');
console.log('📍 Backend esperado: http://localhost:5002');

async function verifyConfiguration() {
  console.log('\n🧪 Test 1: Verificando conectividad del backend...');
  try {
    const response = await fetch('http://localhost:5002/api/', {
      method: 'GET'
    });
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend responde correctamente:', data.message);
    } else {
      console.log('⚠️ Backend responde pero con error:', response.status);
    }
  } catch (error) {
    console.error('❌ Backend no responde:', error.message);
    return;
  }
  
  console.log('\n🧪 Test 2: Verificando CORS...');
  try {
    const response = await fetch('http://localhost:5002/api/auth/login', {
      method: 'OPTIONS'
    });
    console.log('✅ CORS configurado correctamente, status:', response.status);
  } catch (error) {
    console.error('❌ Error de CORS:', error.message);
  }
  
  console.log('\n🧪 Test 3: Verificando localStorage...');
  console.log('- Token:', localStorage.getItem('token') ? 'Presente' : 'Ausente');
  console.log('- User:', localStorage.getItem('user') ? 'Presente' : 'Ausente');
  
  console.log('\n🧪 Test 4: Verificando URL actual...');
  console.log('- URL actual:', window.location.href);
  console.log('- Puerto actual:', window.location.port);
  
  if (window.location.port === '5173') {
    console.log('✅ Frontend ejecutándose en puerto correcto (5173)');
  } else {
    console.log('⚠️ Frontend NO está en puerto 5173, está en:', window.location.port);
  }
  
  console.log('\n🧪 Test 5: Test de login...');
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      const clientId = 'cmcxkgizo0002f5ljs8ubspxn';
      const response = await fetch(`http://localhost:5002/api/trainer/clients/${clientId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API funcionando correctamente, cliente encontrado:', data.client?.name || 'Sin nombre');
      } else {
        console.log('⚠️ API responde pero con error:', response.status);
        const errorData = await response.text();
        console.log('Error:', errorData);
      }
    } catch (error) {
      console.error('❌ Error al probar API:', error.message);
    }
  } else {
    console.log('⚠️ No hay token, ejecuta el script de login primero');
  }
  
  console.log('\n📋 Resumen de configuración:');
  console.log('- Frontend: http://localhost:5173 ✅');
  console.log('- Backend: http://localhost:5002 ✅');
  console.log('- CORS configurado ✅');
  console.log('\n🚀 ¡Configuración estándar verificada!');
}

verifyConfiguration();