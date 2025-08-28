// Script para verificar los datos del perfil después de la actualización

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

// Función para obtener el ID del cliente
function getClientId() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const clientId = user.id;
  if (!clientId) {
    console.error('❌ No se encontró ID de cliente');
    return null;
  }
  console.log('✅ Client ID encontrado:', clientId);
  return clientId;
}

// Función para verificar los datos del perfil
async function checkProfileData() {
  const token = getAuthToken();
  const clientId = getClientId();
  
  if (!token || !clientId) {
    return;
  }
  
  try {
    console.log('🔍 Verificando datos del perfil...');
    
    const response = await fetch(`http://localhost:5002/api/clients/${clientId}/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const profileData = await response.json();
    console.log('📋 Datos completos del perfil:', JSON.stringify(profileData, null, 2));
    
    // Verificar específicamente el campo weight
    if (profileData.weight) {
      console.log('⚖️ Peso en el perfil:', profileData.weight, typeof profileData.weight);
    } else {
      console.log('⚠️ No se encontró campo weight en el perfil');
    }
    
    // Verificar otros campos relevantes
    console.log('📊 Campos relevantes:');
    console.log('  - weight:', profileData.weight);
    console.log('  - trainingDaysPerWeek:', profileData.trainingDaysPerWeek);
    console.log('  - initialObjective:', profileData.initialObjective);
    console.log('  - goals:', profileData.goals);
    
  } catch (error) {
    console.error('❌ Error al verificar datos del perfil:', error);
  }
}

// Función para verificar los datos de progreso
async function checkProgressData() {
  const token = getAuthToken();
  const clientId = getClientId();
  
  if (!token || !clientId) {
    return;
  }
  
  try {
    console.log('📈 Verificando datos de progreso...');
    
    const response = await fetch(`http://localhost:5002/api/clients/${clientId}/progress`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const progressData = await response.json();
    console.log('📊 Datos de progreso:', JSON.stringify(progressData, null, 2));
    
    // Verificar el peso más reciente
    if (progressData && progressData.length > 0) {
      const latestProgress = progressData[progressData.length - 1];
      console.log('⚖️ Peso más reciente en progreso:', latestProgress.weight, typeof latestProgress.weight);
    } else {
      console.log('⚠️ No se encontraron datos de progreso');
    }
    
  } catch (error) {
    console.error('❌ Error al verificar datos de progreso:', error);
  }
}

// Ejecutar verificaciones
console.log('🔍 Iniciando verificación de datos...');
checkProfileData();
setTimeout(() => {
  checkProgressData();
}, 1000);

// Exportar funciones para uso manual
window.checkProfileData = checkProfileData;
window.checkProgressData = checkProgressData;

console.log('✅ Script cargado. Puedes usar checkProfileData() y checkProgressData() manualmente.');