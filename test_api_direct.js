// Script para probar directamente la API de actualización de perfil

// Función para obtener el token del localStorage
function getAuthToken() {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ No se encontró token de autenticación');
    return null;
  }
  console.log('✅ Token encontrado:', token.substring(0, 20) + '...');
  return token;
}

// Función para obtener el ID del usuario actual
function getCurrentUserId() {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('✅ User ID:', payload.id);
    return payload.id;
  } catch (error) {
    console.error('❌ Error decodificando token:', error);
    return null;
  }
}

// Función para probar la actualización del perfil
async function testProfileUpdate() {
  console.log('\n🧪 === PRUEBA DIRECTA DE API ===');
  
  const token = getAuthToken();
  const userId = getCurrentUserId();
  
  if (!token || !userId) {
    console.error('❌ No se puede proceder sin token o userId');
    return;
  }
  
  const testData = {
    weight: 76.5,
    trainingDaysPerWeek: 4,
    initialObjective: 'Ganar masa muscular y mejorar resistencia - Prueba API'
  };
  
  console.log('📤 Enviando datos:', testData);
  console.log('🎯 URL:', `http://localhost:5002/api/clients/${userId}/profile`);
  
  try {
    const response = await fetch(`http://localhost:5002/api/clients/${userId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📥 Status:', response.status, response.statusText);
    
    const responseData = await response.text();
    console.log('📥 Response:', responseData);
    
    if (response.ok) {
      console.log('✅ Actualización exitosa!');
      
      // Verificar que los datos se actualizaron obteniendo el perfil
      console.log('\n🔍 Verificando actualización...');
      await verifyProfileUpdate(userId, token);
    } else {
      console.error('❌ Error en la actualización:', response.status, responseData);
    }
    
  } catch (error) {
    console.error('❌ Error de red:', error);
  }
}

// Función para verificar que el perfil se actualizó
async function verifyProfileUpdate(userId, token) {
  try {
    const response = await fetch(`http://localhost:5002/api/clients/${userId}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const profileData = await response.json();
      console.log('📋 Perfil actual:', profileData);
      
      // Verificar campos específicos
      const profile = profileData.data?.clientProfile || profileData.clientProfile || profileData;
      console.log('\n🎯 Campos verificados:');
      console.log('  Peso:', profile.weight);
      console.log('  Días de entrenamiento:', profile.trainingDaysPerWeek);
      console.log('  Objetivo:', profile.initialObjective);
    } else {
      console.error('❌ Error obteniendo perfil:', response.status);
    }
  } catch (error) {
    console.error('❌ Error verificando perfil:', error);
  }
}

// Función para obtener el progreso actual
async function getCurrentProgress() {
  console.log('\n📊 === OBTENIENDO PROGRESO ACTUAL ===');
  
  const token = getAuthToken();
  const userId = getCurrentUserId();
  
  if (!token || !userId) return;
  
  try {
    const response = await fetch(`http://localhost:5002/api/clients/${userId}/progress`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const progressData = await response.json();
      console.log('📈 Progreso actual:', progressData);
    } else {
      console.error('❌ Error obteniendo progreso:', response.status);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Función para comparar antes y después
async function testFullFlow() {
  console.log('\n🔄 === PRUEBA COMPLETA ===');
  
  console.log('1️⃣ Estado inicial:');
  await getCurrentProgress();
  
  console.log('\n2️⃣ Actualizando perfil:');
  await testProfileUpdate();
  
  console.log('\n3️⃣ Estado después de actualización:');
  await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
  await getCurrentProgress();
}

// Exponer funciones globalmente
window.testAPI = {
  testUpdate: testProfileUpdate,
  getProgress: getCurrentProgress,
  testFull: testFullFlow,
  getUserId: getCurrentUserId,
  getToken: getAuthToken
};

console.log('🚀 Script de prueba API cargado');
console.log('📋 Funciones disponibles:');
console.log('  - window.testAPI.testUpdate() - Probar actualización');
console.log('  - window.testAPI.getProgress() - Ver progreso actual');
console.log('  - window.testAPI.testFull() - Prueba completa');
console.log('  - window.testAPI.getUserId() - Ver ID de usuario');
console.log('  - window.testAPI.getToken() - Ver token');

// Auto-ejecutar la prueba completa
setTimeout(() => {
  console.log('\n🎬 Ejecutando prueba automática en 2 segundos...');
  testFullFlow();
}, 2000);